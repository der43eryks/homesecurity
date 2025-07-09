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
    const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email])
    if (!users.length) return res.status(404).json({ error: 'User not found' })
    const [devices] = await db.promise().query('SELECT * FROM devices WHERE device_id = ?', [device_id])
    if (!devices.length) return res.status(404).json({ error: 'Device not found' })
    const [userDevices] = await db.promise().query('SELECT * FROM user_devices WHERE user_id = ? AND device_id = ?', [users[0].id, devices[0].id])
    if (!userDevices.length) return res.status(401).json({ error: 'User not authorized for this device' })
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await db.promise().query('INSERT INTO password_resets (id, user_id, reset_token, expires_at, used) VALUES (UUID(), ?, ?, ?, FALSE)', [users[0].id, token, expires])
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
    const [resets] = await db.promise().query('SELECT * FROM password_resets WHERE reset_token = ? AND used = FALSE AND expires_at > NOW()', [token])
    if (!resets.length) return res.status(400).json({ error: 'Invalid or expired token' })
    const user_id = resets[0].user_id
    const hash = await bcrypt.hash(new_password, 10)
    await db.promise().query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user_id])
    await db.promise().query('UPDATE password_resets SET used = TRUE WHERE id = ?', [resets[0].id])
    res.json({ message: 'Password reset successful' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router 