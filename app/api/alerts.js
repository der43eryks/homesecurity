const express = require('express')
const db = require('../db')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// GET /api/alerts
router.get('/', authenticate, async (req, res) => {
  try {
    const alertsResult = await db.query('SELECT * FROM alerts WHERE user_id = $1 AND device_id = $2 ORDER BY sent_at DESC LIMIT 50', [req.user.user_id, req.user.device_id])
    const alerts = alertsResult.rows
    res.json(alerts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router 