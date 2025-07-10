const express = require('express')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const db = require('../db')
const { sendResetEmail } = require('../utils/email')

const router = express.Router()

// POST /api/password-resets/request
router.post('/request', [
  body('email').isEmail(),
  body('device_id').isString()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const { email, device_id } = req.body
  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email])
    const users = userResult.rows
    if (!users.length) return res.status(404).json({ error: 'User not found' })
    const deviceResult = await db.query('SELECT * FROM devices WHERE device_id = $1', [device_id])
    const devices = deviceResult.rows
    if (!devices.length) return res.status(404).json({ error: 'Device not found' })
    const userDeviceResult = await db.query('SELECT * FROM user_devices WHERE user_id = $1 AND device_id = $2', [users[0].id, devices[0].id])
    const userDevices = userDeviceResult.rows
    if (!userDevices.length) return res.status(401).json({ error: 'User not authorized for this device' })
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await db.query('INSERT INTO password_resets (id, user_id, reset_token, expires_at, used) VALUES (gen_random_uuid(), $1, $2, $3, FALSE)', [users[0].id, token, expires])
    await sendResetEmail(email, token)
    res.json({ message: 'Reset instructions sent' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/password-resets/reset
router.post('/reset', [
  body('token').isString(),
  body('new_password').isLength({ min: 8 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const { token, new_password } = req.body
  try {
    const resetResult = await db.query('SELECT * FROM password_resets WHERE reset_token = $1 AND used = FALSE AND expires_at > NOW()', [token])
    const resets = resetResult.rows
    if (!resets.length) return res.status(400).json({ error: 'Invalid or expired token' })
    const user_id = resets[0].user_id
    const hash = await bcrypt.hash(new_password, 10)
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, user_id])
    await db.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [resets[0].id])
    res.json({ message: 'Password reset successful' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router 