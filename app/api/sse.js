const express = require('express')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// Store clients
const clients = []

// Helper to send event to a client
function sendEvent(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

// SSE endpoint for real-time alerts
router.get('/alerts', authenticate, (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })
  res.flushHeaders()

  // Add client to list
  const client = { user_id: req.user.user_id, device_id: req.user.device_id, res }
  clients.push(client)

  // Remove client on close
  req.on('close', () => {
    const idx = clients.indexOf(client)
    if (idx !== -1) clients.splice(idx, 1)
  })
})

// Function to broadcast alert to relevant clients
function broadcastAlert(alert) {
  clients.forEach(client => {
    if (client.user_id === alert.user_id && client.device_id === alert.device_id) {
      sendEvent(client.res, alert)
    }
  })
}

// Export router and broadcast function
module.exports = { router, broadcastAlert } 