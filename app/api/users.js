const express = require('express')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// GET /api/users/me
router.get('/me', authenticate, async (req, res) => {
  try {
    // Get user
    const userResult = await db.query('SELECT id, email, phone FROM users WHERE id = $1', [req.user.user_id])
    const users = userResult.rows
    if (!users.length) return res.status(404).json({ error: 'User not found' })
    // Get device
    const deviceResult = await db.query('SELECT device_id, name, model, location, status, last_seen FROM devices WHERE id = $1', [req.user.device_id])
    const devices = deviceResult.rows
    if (!devices.length) return res.status(404).json({ error: 'Device not found' })
    res.json({
      email: users[0].email,
      phone: users[0].phone,
      device_id: devices[0].device_id,
      device_info: {
        name: devices[0].name,
        model: devices[0].model,
        location: devices[0].location,
        status: devices[0].status,
        last_seen: devices[0].last_seen
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/users/email
router.put('/email', authenticate, [
  body('email').isEmail()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const { email } = req.body
  try {
    await db.query('UPDATE users SET email = $1 WHERE id = $2', [email, req.user.user_id])
    res.json({ message: 'Email updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/users/password
router.put('/password', authenticate, [
  body('old_password').isString(),
  body('new_password').isLength({ min: 8 }),
  body('confirm_password').custom((value, { req }) => value === req.body.new_password)
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const { old_password, new_password } = req.body
  try {
    const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.user_id])
    const users = userResult.rows
    if (!users.length) return res.status(404).json({ error: 'User not found' })
    const valid = await bcrypt.compare(old_password, users[0].password_hash)
    if (!valid) return res.status(401).json({ error: 'Old password incorrect' })
    const hash = await bcrypt.hash(new_password, 10)
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.user_id])
    res.json({ message: 'Password updated, please log in again' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/users/phone
router.put('/phone', authenticate, [
  body('phone').isMobilePhone('any')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const { phone } = req.body
  try {
    await db.query('UPDATE users SET phone = $1 WHERE id = $2', [phone, req.user.user_id])
    res.json({ message: 'Phone number updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router 