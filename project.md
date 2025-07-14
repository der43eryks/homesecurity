## Database Configuration

By default, the backend connects to MySQL on port **3307**. If your MySQL server runs on a different port, update the `DB_PORT` value in your `.env` file accordingly.

Example `.env`:

```
DB_HOST=192.168.137.231
DB_PORT=3307
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
``` 

# Project Update: User Registration

- Added backend endpoint: POST /api/auth/register in app/api/auth.js
- Will create frontend template: templates/register.html
- Will update Flask app (app.py) to serve /register route and handle registration logic
- Registration form will collect email, password, and optional phone
- Backend will validate, hash password, and create user 