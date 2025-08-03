# Security Configuration

## Environment Variables

Before deploying to production, make sure to:

1. **Change JWT_SECRET**: 
   - Generate a strong random string (at least 32 characters)
   - Example command: `openssl rand -base64 32`
   - Never use the default value in production

2. **Database Configuration**:
   - Use a proper database URL for production
   - Consider using PostgreSQL or MySQL instead of SQLite

3. **API URL**:
   - Update NEXT_PUBLIC_API_URL to your production domain
   - Use HTTPS in production

## Example .env for production:
```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-generated-strong-secret-key-here"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
```

## Security Features Implemented:
- Rate limiting on authentication endpoints
- Input validation and sanitization
- Password complexity requirements
- Security headers (CSP, X-Frame-Options, etc.)
- XSS protection
- SQL injection prevention (via Prisma ORM)