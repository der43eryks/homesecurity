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
    if (!devices.length) return res.status(401).json({ error: 'Invalid devicem, device not registered' })

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
  body('name')
    .isString()
    .isLength({ max: 20 })
    .matches(/^[A-Za-z0-9 _-]+$/),
  body('phone').optional().isString().isLength({ max: 10 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { email, password, model, device_id, name, phone } = req.body
  try {
    // Defensive: enforce max lengths and pattern
    if (
      password.length > 16 ||
      model.length > 16 ||
      device_id.length > 10 ||
      name.length > 20 ||
      !/^[A-Za-z0-9 _-]+$/.test(name) ||
      (phone && phone.length > 10)
    ) {
      return res.status(400).json({ error: 'Invalid or too long field value' })
    }

    // Check if device_id is already registered
    const existingDevice = await db`SELECT id FROM devices WHERE device_id = ${device_id}`
    if (existingDevice.length) {
      // Check if this device_id is already linked to a user
      const device_db_id = existingDevice[0].id
      const alreadyLinked = await db`SELECT * FROM user_devices WHERE device_id = ${device_db_id}`
      if (alreadyLinked.length) {
        return res.status(409).json({ error: 'Device ID is already registered to another user' })
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Use a single SQL statement with CTEs to insert user, device, and mapping atomically
    const result = await db`
      WITH ins_user AS (
        INSERT INTO users (email, password_hash, phone)
        VALUES (${email}, ${password_hash}, ${phone || null})
        ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email
        RETURNING id
      ),
      ins_device AS (
        INSERT INTO devices (device_id, model, name)
        VALUES (${device_id}, ${model}, ${name})
        ON CONFLICT (device_id) DO UPDATE SET device_id=EXCLUDED.device_id
        RETURNING id, name
      ),
      ins_map AS (
        INSERT INTO user_devices (user_id, device_id)
        SELECT ins_user.id, ins_device.id FROM ins_user, ins_device
        ON CONFLICT (user_id, device_id) DO NOTHING
        RETURNING user_id, device_id
      )
      SELECT ins_user.id AS user_id, ins_device.id AS device_id, ins_device.name AS device_name FROM ins_user, ins_device
    `
    if (!result.length) {
      return res.status(500).json({ error: 'Registration failed' })
    }
    res.status(201).json({ message: 'Registration successful', user_id: result[0].user_id, device_id: device_id, device_name: result[0].device_name })
  } catch (err) {
    if (err.code === '23505') {
      // Unique violation (should not happen due to ON CONFLICT, but just in case)
      return res.status(409).json({ error: 'Email or device already registered' })
    }
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router 