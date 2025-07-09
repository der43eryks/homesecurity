# HomeSecurity Backend – Vercel Deployment

## Deploying to Vercel

1. **Push your code to GitHub, GitLab, or Bitbucket.**
2. **Sign up at [vercel.com](https://vercel.com) and import your repository.**
3. **Set Environment Variables in Vercel Dashboard:**
   - DB_HOST
   - DB_USER
   - DB_PASSWORD
   - DB_NAME
   - DB_PORT
   - JWT_SECRET
   - SMTP_SERVICE
   - SMTP_USER
   - SMTP_PASS
   - DARAJA_CONSUMER_KEY
   - DARAJA_CONSUMER_SECRET
   - FRONTEND_URL
   - (any other required by your .env)
4. **Vercel will auto-detect the Node.js app and use `vercel.json` for routing.**
5. **All API endpoints will be available at:**
   - `https://your-vercel-domain/api/...`

## Database Configuration

By default, the backend connects to MySQL on port **3307**. If your MySQL server runs on a different port, update the `DB_PORT` value in your `.env` file accordingly.

Example `.env`:

```
DB_HOST=localhost
DB_PORT=3307
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
```

## Notes
- Ensure your database is accessible from Vercel (use a cloud DB or allow Vercel IPs).
- For production, use secure values for all secrets.
- For real-time (SSE), Vercel serverless may have connection timeouts; consider Vercel's Edge Functions or a persistent backend for heavy real-time needs. 