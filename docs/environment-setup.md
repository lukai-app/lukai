# Environment Setup Guide

LukAI uses **app-level environment variables** for maximum flexibility and security. Each app manages its own environment configuration independently.

## 📁 Environment File Structure

```
lukai/
├── apps/
│   ├── web/
│   │   ├── env.example          # Template for web app
│   │   └── .env.local          # Your web app variables (gitignored)
│   ├── mobile/
│   │   ├── env.example          # Template for mobile app
│   │   └── .env.local          # Your mobile app variables (gitignored)
│   └── backend/
│       ├── env.example          # Template for backend
│       └── .env.local          # Your backend variables (gitignored)
```

## 🚀 Quick Setup

### 1. Web App Setup
```bash
cd apps/web
cp env.example .env.local
# Edit .env.local with your values
```

### 2. Mobile App Setup
```bash
cd apps/mobile
cp env.example .env.local
# Edit .env.local with your values
```

### 3. Backend Setup
```bash
cd apps/backend
cp env.example .env.local
# Edit .env.local with your values
```

## 🔧 Environment Variable Types

### Client-Side Variables (Public)
These are exposed to the client and should be safe to share:

**Web App (`NEXT_PUBLIC_*`):**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_MIXPANEL_TOKEN` - Analytics token
- `NEXT_PUBLIC_GOOGLE_API_KEY` - Google services

**Mobile App (`EXPO_PUBLIC_*`):**
- `EXPO_PUBLIC_API_URL` - Backend API URL
- `EXPO_PUBLIC_API_KEY` - API authentication key
- `EXPO_PUBLIC_MIXPANEL_TOKEN` - Analytics token

### Server-Side Variables (Private)
These are only accessible on the server:

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `WHATSAPP_ACCESS_TOKEN` - WhatsApp API token

## 🔒 Security Best Practices

### ✅ Do's
- Use strong, unique secrets for production
- Rotate API keys regularly
- Use different keys for development and production
- Validate environment variables on startup

### ❌ Don'ts
- Never commit `.env.local` files to git
- Don't use production keys in development
- Avoid hardcoding secrets in code
- Don't expose server-side variables to the client

## 🛠️ Development Workflow

### Local Development
```bash
# Start all apps with their respective env files
npm run dev

# Or start individual apps
npm run dev --filter=@lukai/web
npm run dev --filter=@lukai/backend
npm run dev --filter=@lukai/mobile
```

### Environment Validation
Each app validates its environment variables on startup:

- **Web**: Uses `@t3-oss/env-nextjs` with Zod validation
- **Mobile**: Uses Zod validation with fallback defaults
- **Backend**: Uses Zod validation with strict requirements

### Error Handling
If required environment variables are missing:
- **Web**: Build will fail with clear error messages
- **Mobile**: Will use development defaults
- **Backend**: Process will exit with validation errors

## 🌍 Environment-Specific Configurations

### Development
```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MIXPANEL_TOKEN=dev-token

# apps/backend/.env.local
DATABASE_URL=postgresql://user:pass@localhost:5432/lukai_dev
JWT_SECRET=dev-secret-key-32-chars-minimum
OPENAI_API_KEY=your-openai-key
```

### Production
```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=https://api.lukai.com
NEXT_PUBLIC_MIXPANEL_TOKEN=prod-token

# apps/backend/.env.local
DATABASE_URL=postgresql://user:pass@prod-host:5432/lukai_prod
JWT_SECRET=super-secure-production-secret-64-chars
OPENAI_API_KEY=your-production-openai-key
```

## 🔄 Environment Variable Updates

### Adding New Variables
1. Update the `env.example` file in the relevant app
2. Add validation in the app's `env.ts` file
3. Update this documentation
4. Test the changes locally

### Sharing Variables Between Apps
If you need to share variables between apps:
1. Add them to each app's environment file
2. Use the shared config package for common values
3. Consider using a shared secret management system

## 🚨 Troubleshooting

### Common Issues

**"Missing required environment variable"**
- Check that `.env.local` exists in the app directory
- Verify the variable name matches exactly
- Ensure the variable has a value (not empty)

**"Invalid environment variable"**
- Check the validation schema in the app's `env.ts`
- Verify URL formats for API endpoints
- Ensure secrets meet minimum length requirements

**"Environment variable not found"**
- Restart the development server after adding new variables
- Check that the variable is prefixed correctly (`NEXT_PUBLIC_`, `EXPO_PUBLIC_`)
- Verify the variable is being imported correctly

### Debug Mode
To see all environment variables (be careful with secrets):
```bash
# Web app
NODE_ENV=development npm run dev

# Backend
NODE_ENV=development npm run dev

# Mobile (check console logs)
npm run dev --filter=@lukai/mobile
```

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Zod Validation](https://zod.dev/)
- [T3 Env](https://env.t3.gg/) 