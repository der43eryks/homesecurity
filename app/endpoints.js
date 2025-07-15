// All backend API endpoints for HomeSecurity
// Exported as constants for easy import/use

module.exports = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REGISTER : 'api/auth/register',

  USERS_ME: '/api/users/me',
  USERS_EMAIL: '/api/users/email',
  USERS_PHONE: '/api/users/phone',
  USERS_PASSWORD: '/api/users/password',

  DEVICES_ME: '/api/devices/me',
  DEVICES_STATUS: '/api/devices/status',

  ALERTS: '/api/alerts',
  SSE_ALERTS: '/api/sse/alerts',

  PASSWORD_RESETS_REQUEST: '/api/password-resets/request',
  PASSWORD_RESETS_RESET: '/api/password-resets/reset',
} 