const express = require('express')
const db = require('../db')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// GET /api/devices/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const deviceResult = await db.query('SELECT device_id, name, model, location, status, last_seen FROM devices WHERE id = $1', [req.user.device_id])
    const devices = deviceResult.rows
    if (!devices.length) return res.status(404).json({ error: 'Device not found' })
    res.json(devices[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/devices/status
router.get('/status', authenticate, async (req, res) => {
  try {
    const deviceResult = await db.query('SELECT status FROM devices WHERE id = $1', [req.user.device_id])
    const devices = deviceResult.rows
    if (!devices.length) return res.status(404).json({ error: 'Device not found' })
    res.json({ status: devices[0].status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router 