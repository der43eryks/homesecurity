const jwt = require('jsonwebtoken')

function authenticate(req, res, next) {
  const token = req.cookies && req.cookies.token
  if (!token) return res.status(401).json({ error: 'Missing authentication cookie' })
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

module.exports = { authenticate } 