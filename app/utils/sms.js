const axios = require('axios')
require('dotenv').config()

async function getAccessToken() {
  const auth = Buffer.from(`${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`).toString('base64')
  const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  })
  return res.data.access_token
}

async function sendSMS(to, message) {
  const token = await getAccessToken()
  // Replace with actual SMS API endpoint and payload
  await axios.post('https://sandbox.safaricom.co.ke/mpesa/sms/v1/send', {
    to,
    message
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
}

module.exports = { sendSMS } 