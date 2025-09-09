# Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCarSanoja%2Fysi-catalyst-mvp)

## Manual Configuration Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import from GitHub: `CarSanoja/ysi-catalyst-mvp`

### 2. Configure Build Settings

Vercel should auto-detect the configuration from `vercel.json`, but verify these settings:

- **Framework Preset**: Vite
- **Root Directory**: `ysi-admin-frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

### 3. Environment Variables

In your Vercel project settings, add these environment variables:

```
VITE_API_BASE_URL=https://your-backend-api-url.com
```

**Note**: Since the backend is currently mock data, you can temporarily use:
```
VITE_API_BASE_URL=http://localhost:8002
```

But for full production, you'll need to deploy the backend separately.

### 4. Domain Configuration

- Vercel will provide a default domain like: `ysi-catalyst-mvp-xxx.vercel.app`
- You can configure a custom domain in the project settings

## Backend Deployment Options

The current setup uses mock data. For full functionality, consider these backend deployment options:

### Option 1: Vercel Functions (Recommended for MVP)
- Deploy the FastAPI backend as Vercel serverless functions
- Requires some restructuring of the backend code

### Option 2: Railway/Render
- Deploy the FastAPI backend to Railway or Render
- Update `VITE_API_BASE_URL` to point to the deployed backend

### Option 3: Docker Container (Fly.io, Railway)
- Use the existing `ysi-backend/Dockerfile`
- Deploy as a container to Fly.io or similar services

## Current Limitations

- **Mock Data**: The frontend will work but uses mock API responses
- **No Database**: PostgreSQL and vector search features are not active
- **Local Images**: Team photos are included in the build

## Production Checklist

- [ ] Deploy backend API to a hosting service
- [ ] Update `VITE_API_BASE_URL` environment variable
- [ ] Test API connectivity from the deployed frontend
- [ ] Set up database (PostgreSQL with pgvector)
- [ ] Configure real authentication
- [ ] Set up monitoring and analytics

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify the build works locally: `npm run build`
- Check Vercel build logs for specific errors

### API Connection Issues
- Verify `VITE_API_BASE_URL` is set correctly
- Check CORS configuration in backend
- Ensure backend is deployed and accessible

### Images Not Loading
- Team photos are included in the build (`public/images/team/`)
- Verify file paths are correct (case-sensitive)
- Check browser network tab for 404 errors