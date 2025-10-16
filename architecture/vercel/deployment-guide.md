# YSI Catalyst Frontend - Vercel Deployment Guide

This guide will help you deploy the YSI Catalyst frontend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in the GitHub repository
3. **Backend Deployed**: The AWS backend should be deployed and running

## Quick Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `CarSanoja/ysi-catalyst-mvp`
4. Select the repository and click "Import"

### 2. Configure Build Settings

When importing, configure these settings:

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables

In your Vercel project settings, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `http://52.90.163.197:8080/api/v1` | AWS backend API URL |
| `VITE_APP_TITLE` | `YSI Catalyst Admin` | Application title |
| `VITE_ENVIRONMENT` | `production` | Environment name |
| `VITE_VERCEL_ENV` | `production` | Vercel environment flag |
| `NODE_ENV` | `production` | Node environment |

**Note**: The system now includes automatic environment detection, so it will work with these settings or auto-detect the correct backend URL.

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at `https://your-project-name.vercel.app`

## Advanced Configuration

### Custom Domain

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions

### Build Optimization

The included `vercel.json` configuration provides:

- **Static file caching**: 1 year cache for static assets
- **Security headers**: XSS protection, content type sniffing protection
- **Clean URLs**: Removes `.html` extensions
- **Redirects**: Root redirects to `/dashboard`

### Environment-Specific Deployments

For different environments (staging, production), create separate Vercel projects:

1. **Staging**: Use a different branch (e.g., `staging`)
2. **Production**: Use the `main` branch
3. Set different `VITE_API_URL` for each environment

## Environment Variables Setup

### Development
```bash
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=YSI Catalyst Admin (Dev)
VITE_ENVIRONMENT=development
```

### Staging
```bash
VITE_API_URL=http://your-staging-backend-url:8080
VITE_APP_TITLE=YSI Catalyst Admin (Staging)
VITE_ENVIRONMENT=staging
```

### Production
```bash
VITE_API_URL=http://your-production-backend-url:8080
VITE_APP_TITLE=YSI Catalyst Admin
VITE_ENVIRONMENT=production
```

## Backend Integration

### CORS Configuration

Ensure your backend (AWS EC2) allows requests from your Vercel domain:

```python
# In your backend CORS configuration
BACKEND_CORS_ORIGINS = [
    "https://your-vercel-domain.vercel.app",
    "https://your-custom-domain.com",  # if using custom domain
    "http://localhost:3000"  # for local development
]
```

### API Base URL

The frontend will automatically use the `VITE_API_URL` environment variable to make API calls to your backend.

## Troubleshooting

### Build Failures

1. **Node.js Version**: Ensure you're using Node.js 18+
2. **Dependencies**: Check if all dependencies are properly listed in `package.json`
3. **Build Scripts**: Verify your build script is correctly configured

### CORS Errors

1. **Check Backend**: Ensure CORS is properly configured on your AWS backend
2. **Environment Variables**: Verify `VITE_API_URL` is correctly set
3. **Network**: Ensure your EC2 instance is accessible from the internet

### 404 Errors

1. **Routing**: React Router requires proper configuration for SPA routing
2. **Vercel Configuration**: Ensure `vercel.json` is properly configured for SPA routing

## Monitoring and Analytics

### Vercel Analytics

Enable Vercel Analytics in your project settings to monitor:
- Page views
- Performance metrics
- Error tracking

### Performance Optimization

1. **Code Splitting**: Implement lazy loading for routes
2. **Bundle Analysis**: Use Vercel's bundle analyzer
3. **Image Optimization**: Use Vercel's image optimization features

## Security Considerations

### Environment Variables

- Never commit sensitive data to the repository
- Use Vercel's environment variable management
- Separate development and production variables

### Headers

The configuration includes security headers:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection

## Deployment Checklist

- [ ] Repository connected to Vercel
- [ ] Build settings configured correctly
- [ ] Environment variables set
- [ ] Backend CORS configured for Vercel domain
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate enabled
- [ ] Analytics enabled
- [ ] Error monitoring set up

## Support

For issues specific to:
- **Vercel Platform**: Check [Vercel Documentation](https://vercel.com/docs)
- **Build Issues**: Review build logs in Vercel dashboard
- **Frontend Code**: Check the repository issues and documentation

## Quick Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel (using Vercel CLI)
vercel --prod
```

## ✨ Automatic Environment Detection

The frontend now includes intelligent environment detection that automatically configures the correct backend URL without manual intervention.

### 🎯 Auto-Detection Features:
- **Vercel Detection**: Automatically detects when running on Vercel
- **Local Fallback**: Tries localhost backend, falls back to AWS if unavailable
- **Production Ready**: Uses AWS backend (52.90.163.197:8080) for production
- **Debug Logging**: Shows environment info in development mode

### 🔄 Environment Behavior:
- **Local Development**: `localhost:8080` → AWS fallback if needed
- **Vercel Production**: Always uses AWS backend
- **Manual Override**: Set `VITE_API_BASE_URL` to force specific URL

### 🛠 Implementation Details:
The system uses `src/utils/environment.ts` to:
- Detect hostname patterns (localhost, vercel.app)
- Check environment variables (VERCEL, VITE_VERCEL_ENV)
- Test backend availability with health checks
- Provide intelligent fallback mechanisms

### 📋 Quick Setup:
1. **Local**: Copy `.env.example` to `.env.local`
2. **Vercel**: Environment variables are pre-configured
3. **Override**: Set `VITE_API_BASE_URL` if needed

No more manual environment switching needed! 🚀