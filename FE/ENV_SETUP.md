# Environment Variable Configuration

## Overview
All API endpoints now use environment variables instead of hardcoded URLs. This allows for easy configuration across different environments (development, staging, production).

## Setup Instructions

### 1. Create Environment File

Create a `.env` file in the root of your project:

```bash
# .env
VITE_API_BASE_URL=http://localhost:3000
```

**Note:** Vite requires environment variables to be prefixed with `VITE_` to be exposed to the client-side code.

### 2. Environment Files for Different Environments

You can create multiple environment files:

```bash
# .env.local (for local development - not committed)
VITE_API_BASE_URL=http://localhost:3000

# .env.development (for development)
VITE_API_BASE_URL=http://localhost:3000

# .env.staging (for staging)
VITE_API_BASE_URL=https://staging-api.yourdomain.com

# .env.production (for production)
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 3. Example File

Copy the `.env.example` file and rename it to `.env`:

```bash
cp .env.example .env
```

Then update the values as needed.

### 4. .gitignore

Make sure your `.env` file is in `.gitignore` to avoid committing sensitive information:

```
# .gitignore
.env
.env.local
```

Keep `.env.example` committed as a template for other developers.

## Configuration File

A centralized configuration file has been created at `src/config/api.ts`:

```typescript
// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Helper function to build API URLs
export const apiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}
```

## Usage in Code

### Before (Hardcoded URL)
```typescript
const response = await fetch('http://localhost:3000/api/vendors')
```

### After (Using Environment Variable)
```typescript
import { apiUrl } from '../config/api'

const response = await fetch(apiUrl('/api/vendors'))
```

## Files Updated

All API calls have been updated to use the `apiUrl` helper function:

### Pages
- ✅ `src/pages/ActiveRFPs.tsx`
- ✅ `src/pages/RFPCreator.tsx`
- ✅ `src/pages/Drafts.tsx`
- ✅ `src/pages/VendorDirectory.tsx`

### Components
- ✅ `src/components/proposals/ProposalsModal.tsx`
- ✅ `src/components/vendors/AddVendorForm.tsx`
- ✅ `src/components/vendors/SendRFPModal.tsx`

### Hooks
- ✅ `src/hooks/useProposalSocket.ts`
- ✅ `src/hooks/useRFPUpdates.ts`

## WebSocket Configuration

WebSocket connections also use the environment variable:

```typescript
import { API_BASE_URL } from '../config/api'

const SOCKET_URL = API_BASE_URL
```

## Running the Application

### Development
```bash
npm run dev
```

Vite will automatically load variables from `.env` and `.env.local`.

### Build for Production
```bash
npm run build
```

Make sure you have `.env.production` configured with production API URL.

### Testing Different Environments
```bash
# Use staging environment
npm run build --mode staging

# Use production environment
npm run build --mode production
```

## Environment Variable Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Base URL for API endpoints | `http://localhost:3000` | Yes |

## Troubleshooting

### Environment Variable Not Working

1. **Restart Dev Server**: After changing `.env` files, restart your dev server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Check Prefix**: Make sure the variable name starts with `VITE_`:
   ```bash
   # ✅ Correct
   VITE_API_BASE_URL=...
   
   # ❌ Wrong (won't be exposed to client)
   API_BASE_URL=...
   ```

3. **Check Syntax**: Ensure no spaces around `=`:
   ```bash
   # ✅ Correct
   VITE_API_BASE_URL=http://localhost:3000
   
   # ❌ Wrong
   VITE_API_BASE_URL = http://localhost:3000
   ```

### API Calls Failing

1. **Check API Server**: Ensure your backend is running on the configured URL
2. **Check CORS**: Make sure CORS is configured on the backend to allow requests from your frontend
3. **Check Console**: Open browser console to see the actual URL being called

### Debugging

To verify the environment variable is loaded correctly, add this temporarily:

```typescript
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
```

## Best Practices

1. **Never commit `.env` files** (except `.env.example`)
2. **Document all environment variables** in `.env.example`
3. **Use different values** for different environments
4. **Validate environment variables** at app startup
5. **Use the `apiUrl` helper** for all API calls to maintain consistency

## Example `.env` File

Create this file in your project root:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Add other environment variables as needed
# VITE_ENABLE_ANALYTICS=false
# VITE_LOG_LEVEL=debug
```

## Example `.env.example` File

This file should be committed to git as a template:

```bash
# API Configuration
# The base URL for all API requests
VITE_API_BASE_URL=http://localhost:3000

# Add other environment variables as needed with example values
```

## Production Deployment

When deploying to production platforms (Vercel, Netlify, etc.):

1. **Set environment variables** in the platform's dashboard
2. **Use the platform's UI** to add `VITE_API_BASE_URL`
3. **Rebuild** the application after changing environment variables

### Vercel
```bash
Project Settings → Environment Variables → Add
Name: VITE_API_BASE_URL
Value: https://api.yourdomain.com
```

### Netlify
```bash
Site Settings → Environment Variables → Add
Key: VITE_API_BASE_URL
Value: https://api.yourdomain.com
```

## Summary

✅ All hardcoded `localhost:3000` URLs have been replaced with environment variables  
✅ Centralized configuration in `src/config/api.ts`  
✅ Easy to switch between development, staging, and production environments  
✅ WebSocket connections also use the environment variable  
✅ Consistent API URL management across the entire application
