require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const path = require('path')
const sql=require("./db")
const { router: sseRouter } = require('./api/sse')

const app = express()


//cookie handler
// (Removed incorrect app.cookie usage)


// Security and performance middleware
app.use(helmet())
app.use(compression())

// CORS and parsing
const allowedOrigin = process.env.CORS_ALLOWED_ORIGINS?.split(',');

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json())
app.use(cookieParser())
app.use(morgan('combined', {
  skip: function (req, res) {
    return req.path === '/api/health';
  }
}))

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const dbResult = await sql`SELECT NOW() as timestamp, 'OK' as status`
    
    res.json({
      status: 'OK',
      timestamp: dbResult[0].timestamp,
      database: 'connected',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(503).json({
      status: 'ERROR',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    })
  }
})

// API routes (modular)
app.use('/api/auth', require('./api/auth'))
app.use('/api/users', require('./api/users'))
app.use('/api/devices', require('./api/devices'))
app.use('/api/alerts', require('./api/alerts'))
app.use('/api/password-resets', require('./api/passwordResets'))
app.use('/api/sse', sseRouter)

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' })
})

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 4000

app.listen(PORT, async () => {
  try {
    // Test the PostgreSQL connection using Neon
    const res = await sql`SELECT NOW()`
    console.log('Database connected at:', res[0].now)
    console.log(`Server running on port ${PORT}`)
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    process.exit(1)
  }
})

 