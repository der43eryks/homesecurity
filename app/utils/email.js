const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text
  }
  return transporter.sendMail(mailOptions)
}

module.exports = { sendEmail } 