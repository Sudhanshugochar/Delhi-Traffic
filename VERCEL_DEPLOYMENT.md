# Vercel Deployment Guide

## Pre-Deployment Checklist

✅ All files checked - No compilation errors  
✅ Build optimized with code splitting  
✅ Environment variables configured  
✅ vercel.json configuration created  

## Step-by-Step Deployment to Vercel

### 1. Prerequisites
- GitHub account with your repository pushed
- Vercel account (sign up at https://vercel.com)
- MongoDB Atlas account for database

### 2. Prepare Your Project

Make sure everything is committed to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### 3. Create MongoDB Atlas Connection

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user with a strong password
4. Whitelist your IP or allow all IPs (0.0.0.0/0)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

### 4. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Connect your GitHub repository
4. Choose "Other" as the framework (Vite is detected)
5. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

### 5. Configure Environment Variables

After deployment, go to your Vercel project:
1. Navigate to Settings → Environment Variables
2. Add the following variables:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET = generate_a_strong_random_string_here
CLIENT_ORIGIN = https://your-vercel-domain.vercel.app
START_GENERATOR = true
GENERATOR_INTERVAL = 5000
NODE_ENV = production
```

**Generate a strong JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Redeploy After Setting Environment Variables

After adding env vars:
1. Go to Deployments
2. Click the latest deployment
3. Click "Redeploy"

### 7. Verify Deployment

1. Visit your Vercel domain
2. Test login: `/api/auth/signup` and `/api/auth/login`
3. Check traffic data: `/api/traffic/live`
4. Check alerts: `/api/alerts`

### 8. Important Notes

**API Endpoints:**
- Frontend: `https://your-domain.vercel.app/`
- Backend APIs: `https://your-domain.vercel.app/api/*`
- Authentication endpoints: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`

**Troubleshooting:**

If you see CORS errors:
- Update `CLIENT_ORIGIN` env var to match your Vercel domain

If database connection fails:
- Check MONGODB_URI is correct
- Ensure IP is whitelisted in MongoDB Atlas
- Check MongoDB cluster status

If build fails:
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Run `npm run build` locally to test

**Security Best Practices:**
- Never commit `.env` files (they're in .gitignore)
- Use strong JWT_SECRET (minimum 32 characters)
- Rotate JWT_SECRET periodically
- Keep MongoDB credentials secure
- Monitor Vercel logs for suspicious activity

### 9. Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Rollback

If something goes wrong:
1. Go to Vercel Deployments
2. Select a previous deployment
3. Click "Promote to Production"

## Monitoring

- Check logs in Vercel dashboard under "Functions"
- Monitor MongoDB Atlas for connection patterns
- Set up Vercel alerts for deployment failures

## Support

For issues:
- Check Vercel deployment logs
- Review MongoDB Atlas logs
- Ensure all environment variables match your setup
