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