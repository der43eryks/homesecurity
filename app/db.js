const mysql = require('mysql2')
require('dotenv').config()


let pool
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 1

function logDbError(err) {
  console.error('Database connection failed:')
  console.error('  Message:', err.message)
  if (err.code) console.error('  Code:', err.code)
  if (err.errno) console.error('  Errno:', err.errno)
  if (err.stack) console.error('  Stack:', err.stack)
}

function createPool() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3307,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })

  // Test connection and log success
  pool.getConnection((err, connection) => {
    if (err) {
      reconnectAttempts++
      logDbError(err)
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(createPool, 5000) // Retry after 5 seconds
      } else {
        console.error('Maximum database reconnection attempts reached. Stopping server.')
        process.exit(1)
      }
    } else {
      reconnectAttempts = 0
      console.log(`Database connected successfully on ${process.env.DB_HOST}:${process.env.DB_PORT || 3307}`)
      connection.release()
    }
  })

  // Handle connection errors after initial connection
  pool.on('error', (err) => {
    logDbError(err)
    if ((err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal) && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++
      setTimeout(createPool, 5000) // Recreate pool after 5 seconds
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Maximum database reconnection attempts reached. Stopping server.')
      process.exit(1)
    }
  })
}

createPool()

module.exports = () => pool 