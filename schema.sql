-- -- Create HomeSecurity database
-- CREATE DATABASE IF NOT EXISTS HomeSecurity;
-- USE HomeSecurity;

-- -- Users table
-- CREATE TABLE IF NOT EXISTS users (
--     id CHAR(36) PRIMARY KEY,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     is_active BOOLEAN DEFAULT TRUE
-- );

-- -- Devices table
-- CREATE TABLE IF NOT EXISTS devices (
--     id CHAR(36) PRIMARY KEY,
--     device_id VARCHAR(100) UNIQUE NOT NULL,
--     name VARCHAR(100),
--     model VARCHAR(100),
--     location VARCHAR(100),
--     status ENUM('online', 'offline'),
--     last_seen TIMESTAMP NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- User-Devices mapping table
-- CREATE TABLE IF NOT EXISTS user_devices (
--     id CHAR(36) PRIMARY KEY,
--     user_id CHAR(36),
--     device_id CHAR(36),
--     UNIQUE KEY unique_user_device (user_id, device_id),
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
-- );

-- -- Alerts table
-- CREATE TABLE IF NOT EXISTS alerts (
--     id CHAR(36) PRIMARY KEY,
--     user_id CHAR(36),
--     device_id CHAR(36),
--     type ENUM('email', 'sms', 'sound'),
--     event ENUM('online', 'offline'),
--     sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     status ENUM('sent', 'failed'),
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
-- );

-- -- Password resets table
-- CREATE TABLE IF NOT EXISTS password_resets (
--     id CHAR(36) PRIMARY KEY,
--     user_id CHAR(36),
--     reset_token VARCHAR(255) UNIQUE NOT NULL,
--     expires_at TIMESTAMP NOT NULL,
--     used BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- ); 




SELECT user, host FROM mysql.user;
  SHOW GRANTS FOR 'root'@'localhost';

    SELECT user, host, account_locked, password_expired FROM mysql.user;

    