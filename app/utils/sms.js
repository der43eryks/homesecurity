const africastalking = require('africastalking')({
  apiKey: process.env.AT_API_KEY, // Africa's Talking API key
  username: process.env.AT_USERNAME // Africa's Talking username
});

const sms = africastalking.SMS;

/**
 * Send an SMS using Africa's Talking
 * @param {string|string[]} to - Recipient phone number(s)
 * @param {string} message - Message to send
 * @param {string} [from] - Optional sender ID
 * @returns {Promise}
 */
async function sendSMS(to, message, from) {
  return sms.send({
    to: Array.isArray(to) ? to : [to],
    message,
    from
  });
}

module.exports = { sendSMS }; 