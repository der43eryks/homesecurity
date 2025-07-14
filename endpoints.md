# API Endpoints

> **Note:** The backend expects MySQL to be running on port **3307** by default. Set `DB_PORT=3307` in your `.env` file if your MySQL server uses this port.
> **Backend Base URL:** http://192.168.137.231:4000

## Authentication
| Endpoint                | Method | Description                        | Request Body Fields                | Auth Required |
|-------------------------|--------|------------------------------------|------------------------------------|--------------|
| `/api/auth/login`       | POST   | Login with email, password, device | `email`, `password`, `device_id`   | No           |
| `/api/auth/logout`      | POST   | Logout (clears auth cookie)        | None                               | No           |
| `/api/auth/register`    | POST   | Register new user and device       | `email` (max 255), `password` (max 16), `model` (max 16), `device_id` (max 10), `name` (max 100), `phone` (max 10, optional) | No |

### Example Registration Request
```json
{
  "email": "user@example.com",
  "password": "mypassword",
  "model": "ESP32-SECURE",
  "device_id": "1234567890",
  "name": "Living Room Sensor",
  "phone": "0712345678"
}
```

### Example Registration Response
```json
{
  "message": "Registration successful",
  "user_id": "<uuid>",
  "device_id": "1234567890",
  "device_name": "Living Room Sensor"
}
```

## User Profile
| Endpoint                | Method | Description                        | Request Body Fields                | Auth Required |
|-------------------------|--------|------------------------------------|------------------------------------|--------------|
| `/api/users/me`         | GET    | Get user profile and device info   | None                               | Yes          |
| `/api/users/email`      | PUT    | Update user email                  | `email`                            | Yes          |
| `/api/users/phone`      | PUT    | Update user phone number           | `phone`                            | Yes          |
| `/api/users/password`   | PUT    | Change password                    | `old_password`, `new_password`, `confirm_password` | Yes |

## Device
| Endpoint                | Method | Description                        | Request Body Fields                | Auth Required |
|-------------------------|--------|------------------------------------|------------------------------------|--------------|
| `/api/devices/me`       | GET    | Get current device info            | None                               | Yes          |
| `/api/devices/status`   | GET    | Get current device status          | None                               | Yes          |

## Alerts & Notifications
| Endpoint                | Method | Description                        | Request Body Fields                | Auth Required |
|-------------------------|--------|------------------------------------|------------------------------------|--------------|
| `/api/alerts`           | GET    | Get recent alerts for user/device  | None                               | Yes          |
| `/api/sse/alerts`       | GET    | Real-time alerts via SSE           | None (SSE stream)                  | Yes          |

## Password Reset
| Endpoint                        | Method | Description                        | Request Body Fields                | Auth Required |
|----------------------------------|--------|------------------------------------|------------------------------------|--------------|
| `/api/password-resets/request`   | POST   | Request password reset             | `email`, `device_id`               | No           |
| `/api/password-resets/reset`     | POST   | Reset password with token          | `token`, `new_password`            | No           |

---

**Notes:**
- All endpoints (except login, logout, and password reset) require authentication via secure HTTP-only cookie.
- All device info responses include `location` for frontend display.
- SSE endpoint provides real-time push notifications for alerts.
- Use the correct HTTP method and required fields for each endpoint. 