# HomeSecurity Backend – Render Deployment

A comprehensive backend API for a smart home security system that manages user authentication, device monitoring, alerts, and real-time notifications.

## 🚀 Live Demo

- **Backend API**: [https://homesecurity-backend.onrender.com](https://homesecurity-backend.onrender.com)
- **GitHub Repository**: [https://github.com/der43eryks/homesecurity](https://github.com/der43eryks/homesecurity)

## Features

- **User Authentication**: Secure login with email, password, and device ID
- **Device Management**: Real-time device status monitoring
- **Alert System**: Email, SMS (via Africa's Talking), and sound notifications
- **Password Reset**: Secure password reset via email/SMS
- **Real-time Updates**: Server-Sent Events (SSE) for live notifications
- **Profile Management**: User profile and device information management

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT with HTTP-only cookies
- **Real-time**: Server-Sent Events (SSE)
- **Email**: Nodemailer
- **SMS**: Africa's Talking SMS API
- **Deployment**: Render

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users/me` - Get user profile
- `PUT /api/users/email` - Update email
- `PUT /api/users/password` - Change password

### Device Management
- `GET /api/devices/me` - Get device info
- `GET /api/devices/status` - Get device status

### Alerts & Notifications
- `GET /api/alerts` - Get recent alerts
- `GET /api/sse/alerts` - Real-time alerts (SSE)

### Password Reset
- `POST /api/password-resets/request` - Request password reset
- `POST /api/password-resets/reset` - Reset password

## 🚀 Deployment

### Render Deployment

1. **Fork/Clone the Repository**
   ```bash
   git clone https://github.com/der43eryks/homesecurity.git
   cd homesecurity
   ```

2. **Connect to Render**
   - Sign up at [render.com](https://render.com)
   - Connect your GitHub repository
   - Create a new Web Service

3. **Configure Environment Variables**
   Set these in your Render dashboard:
   ```
   DB_HOST=your-mysql-host
   DB_USER=your-mysql-user
   DB_PASSWORD=your-mysql-password
   DB_NAME=homesecurity
   DB_PORT=3306
   JWT_SECRET=your-jwt-secret
   FRONTEND_URL=https://your-frontend-url.onrender.com
   BACKEND_HOST=0.0.0.0
   PORT=10000
   AT_API_KEY=your_africas_talking_api_key
   AT_USERNAME=your_africas_talking_username
   AT_SENDER_ID=your_sender_id # optional
   ```

4. **Build & Deploy Settings**
   - **Build Command**: `cd app && npm install`
   - **Start Command**: `cd app && node server.js`
   - **Environment**: Node

5. **Database Setup**
   - Use a cloud MySQL database (e.g., PlanetScale, Railway, or Render's MySQL)
   - Run the SQL schema from `schema.sql` to create tables

## 🏃‍♂️ Local Development

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/der43eryks/homesecurity.git
   cd homesecurity
   ```

2. **Install dependencies**
   ```bash
   cd app
   npm install
   ```

3. **Configure environment variables**
   Create `.env` file in the `app` directory:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=homesecurity
   JWT_SECRET=your-secret-key
   FRONTEND_URL=http://localhost:3000
   BACKEND_HOST=0.0.0.0
   PORT=4000
   AT_API_KEY=your_africas_talking_api_key
   AT_USERNAME=your_africas_talking_username
   AT_SENDER_ID=your_sender_id # optional
   ```

4. **Set up the database**
   ```bash
   mysql -u root -p
   CREATE DATABASE homesecurity;
   USE homesecurity;
   # Run the SQL commands from schema.sql
   ```

5. **Start the server**
   ```bash
   cd app
   node server.js
   ```

   The server will run on `http://localhost:4000`

## 📊 Database Schema

The application uses the following MySQL tables:
- `users` - User accounts and authentication
- `devices` - Device information and status
- `user_devices` - User-device relationships
- `alerts` - Alert history and notifications
- `password_resets` - Password reset tokens

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | MySQL database host | Yes |
| `DB_USER` | MySQL database user | Yes |
| `DB_PASSWORD` | MySQL database password | Yes |
| `DB_NAME` | MySQL database name | Yes |
| `DB_PORT` | MySQL database port | No (default: 3306) |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `BACKEND_HOST` | Backend host binding | No (default: 0.0.0.0) |
| `PORT` | Backend server port | No (default: 4000) |
| `AT_API_KEY` | Africa's Talking API key | Yes |
| `AT_USERNAME` | Africa's Talking username | Yes |
| `AT_SENDER_ID` | Africa's Talking sender ID (optional) | No |

## 🔒 Security Features

- **HTTP-only cookies** for secure authentication
- **JWT tokens** for session management
- **Password hashing** with bcrypt
- **CORS protection** for cross-origin requests
- **Input validation** and sanitization
- **Rate limiting** (can be added)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email dericks43e@gmail.com or create an issue in the GitHub repository.

## Updates

- **v1.0.0**: Initial release with authentication, device management, and alerts
- **v1.1.0**: Added real-time notifications via SSE
- **v1.2.0**: Added password reset functionality
- **v1.3.0**: Deployed to Render with cloud database support
- **v1.4.0**: Switched SMS integration to Africa's Talking
