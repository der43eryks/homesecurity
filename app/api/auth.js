const express = require('express')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

const router = express.Router()

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail(),
  body('password').isString(),
  body('device_id').isString()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { email, password, device_id } = req.body
  try {
    // Get user (Neon returns array directly)
    const users = await db`SELECT * FROM users WHERE email = ${email}`
    if (!users.length) return res.status(401).json({ error: 'Invalid credentials' })
    const user = users[0]
    if (!user.is_active) return res.status(403).json({ error: 'Account disabled' })

    // Check device
    const devices = await db`SELECT * FROM devices WHERE device_id = ${device_id}`
    if (!devices.length) return res.status(401).json({ error: 'Invalid device' })

    // Check user-device mapping
    const userDevices = await db`SELECT * FROM user_devices WHERE user_id = ${user.id} AND device_id = ${devices[0].id}`
    if (!userDevices.length) return res.status(401).json({ error: 'User not authorized for this device' })

    // Check password
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    // JWT
    const token = jwt.sign({ user_id: user.id, device_id: devices[0].id }, process.env.JWT_SECRET, { expiresIn: '12h' })
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000 // 12 hours
    })
    res.json({ message: 'Login successful' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/auth/logout (clear cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })
  res.json({ message: 'Logged out' })
})

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail(),
  body('password').isString().isLength({ max: 16 }),
  body('model').isString().isLength({ max: 16 }),
  body('device_id').isString().isLength({ max: 10 }),
  body('phone').optional().isString().isLength({ max: 10 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { email, password, model, device_id, phone } = req.body
  try {
    // Defensive: enforce max lengths
    if (password.length > 16 || model.length > 16 || device_id.length > 10 || (phone && phone.length > 10)) {
      return res.status(400).json({ error: 'Field length exceeded' })
    }

    // Check for existing user
    const users = await db`SELECT * FROM users WHERE email = ${email}`
    let user_id
    if (users.length) {
      user_id = users[0].id
    } else {
      // Hash password
      const password_hash = await bcrypt.hash(password, 12)
      const newUser = await db`
        INSERT INTO users (email, password_hash, phone)
        VALUES (${email}, ${password_hash}, ${phone || null})
        RETURNING id
      `
      user_id = newUser[0].id
    }

    // Check for existing device
    const devices = await db`SELECT * FROM devices WHERE device_id = ${device_id}`
    let device_db_id
    if (devices.length) {
      device_db_id = devices[0].id
    } else {
      const newDevice = await db`
        INSERT INTO devices (device_id, model)
        VALUES (${device_id}, ${model})
        RETURNING id
      `
      device_db_id = newDevice[0].id
    }

    // Link user to device if not already linked
    const userDevice = await db`SELECT * FROM user_devices WHERE user_id = ${user_id} AND device_id = ${device_db_id}`
    if (!userDevice.length) {
      await db`
        INSERT INTO user_devices (user_id, device_id)
        VALUES (${user_id}, ${device_db_id})
      `
    }

    res.status(201).json({ message: 'Registration successful', user_id, device_id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router 