# Deployment Guide - Identity Asset Dashboard

## Quick Start Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Git installed locally
- Repository ready to push

### Step 1: Prepare Your Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Identity Asset Dashboard"

# Rename branch to main (if needed)
git branch -M main
```

### Step 2: Push to GitHub

1. **Create a new repository on GitHub**
   - Go to github.com/new
   - Name: `identity-asset-dashboard`
   - Description: `Frontend-only security credentials dashboard`
   - Choose Public (for demo) or Private
   - Click "Create repository"

2. **Connect local repo to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/identity-asset-dashboard.git
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

1. **Visit Vercel Dashboard**
   - Go to vercel.com
   - Sign in with GitHub
   - Click "Add New Project"

2. **Select GitHub Repository**
   - Click "Import Project"
   - Search for "identity-asset-dashboard"
   - Click "Import"

3. **Configure Project Settings**
   - **Framework**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Root Directory**: `./` (keep as is)
   - **Environment Variables**: None needed

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - You'll get a live URL: `https://your-project-name.vercel.app`

### Step 4: Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to "Settings" tab
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Point Domain to Vercel**
   - Update CNAME records at your domain provider
   - Vercel will verify automatically

## Continuous Deployment

Once connected, Vercel will automatically:

- **Build and deploy** on every push to `main` branch
- **Create preview URLs** for pull requests
- **Show deployment logs** for debugging
- **Rollback** to previous versions if needed

### Making Updates

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically builds and deploys
# Check deployment status in Vercel dashboard
```

## Environment Variables (If Needed Later)

To add environment variables:

1. **In Vercel Dashboard**
   - Go to "Settings" → "Environment Variables"
   - Add key-value pairs
   - Choose which environments (Production, Preview, Development)
   - Redeploy for changes to take effect

For this project, no environment variables are required.

## Building Locally

### Development Build

```bash
npm run dev
# Runs on http://localhost:3000
# Hot reloads on file changes
```

### Production Build

```bash
npm run build
npm start
# Simulates production environment
# Check .next directory for optimizations
```

### Analysis

```bash
npm run build -- --analyze
# Shows bundle size breakdown
# Helps identify optimization opportunities
```

## Troubleshooting Deployment

### Build Fails

**Check build logs in Vercel Dashboard:**
1. Click the failed deployment
2. View "Build Logs" tab
3. Look for error messages

**Common Issues:**
- Missing dependencies: Run `npm install` locally, commit package-lock.json
- TypeScript errors: Run `npm run build` locally to catch errors
- Missing files: Ensure all imports reference existing files

### Pages Not Loading Data

**Check browser console:**
1. Open DevTools (F12)
2. Check "Console" for errors
3. Check "Network" to verify JSON loads from `/data/`

**Verify data files:**
- JSON files must be in `src/data/` AND copied to `public/data/`
- Next.js build should handle this automatically

### Dark Mode Not Working

**Clear browser cache:**
1. Open DevTools (F12)
2. Right-click refresh button
3. Choose "Empty cache and hard refresh"

**Check localStorage:**
- Open DevTools → Application
- Verify `theme-storage` key exists
- Try toggling dark mode again

## Performance Monitoring

### Enable Vercel Analytics

1. **In Vercel Dashboard**
   - Go to "Analytics"
   - Enable "Web Analytics"
   - Add the snippet to your site (auto-added for Next.js)

2. **Track Metrics**
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)
   - Time to First Byte (TTFB)

### Optimize Performance

**Vercel provides:**
- Automatic image optimization
- Code splitting
- Minification
- Compression (Brotli, gzip)
- CDN edge caching

**Best Practices Applied:**
- ✅ SVG icons (no images)
- ✅ Lazy loading of components
- ✅ Efficient data fetching
- ✅ Memoized calculations
- ✅ Optimized re-renders

## Rollback to Previous Version

**If something breaks:**

1. **In Vercel Dashboard**
   - Go to "Deployments"
   - Find the working deployment
   - Click the three dots
   - Select "Promote to Production"

**Or use Git:**
```bash
git log                  # View commit history
git revert <commit-id>   # Revert specific commit
git push origin main     # Vercel rebuilds automatically
```

## Monitoring and Logs

### View Logs

1. **Build Logs**
   - Vercel Dashboard → Deployment → Build Logs
   - Shows what happened during build
   - Useful for debugging

2. **Runtime Logs**
   - Vercel Dashboard → Monitoring
   - View errors and performance data
   - Set up alerts for errors

### Set Up Alerts

1. **In Vercel Dashboard**
   - Settings → Alerts
   - Add email for notifications
   - Choose alert conditions:
     - Build failures
     - Deployment errors
     - High error rates

## Scaling Considerations

**Current Limits (Vercel Free Tier):**
- Concurrent requests: Unlimited
- Bandwidth: 100GB/month
- Edge locations: Global
- Build minutes: 6000/month (monthly)

**For higher traffic:**
- Pro plan: $20/month
- Business plan: Custom pricing
- Automatic scaling with no code changes

## Backup and Recovery

### Backup Repository

```bash
# Clone repository as backup
git clone https://github.com/YOUR_USERNAME/identity-asset-dashboard.git backup-folder

# Or push to another remote
git remote add backup https://github.com/YOUR_USERNAME/identity-asset-dashboard-backup.git
git push backup main
```

### Data Backup

Since data is in JSON files:
```bash
# Backup data directory
cp -r src/data src/data.backup

# Or use git (recommended)
git log src/data/  # View history
git show <commit>:src/data/file.json  # Recover specific version
```

## Switching Between Dev and Prod

### Development
```bash
npm run dev
# Local server on http://localhost:3000
# Source maps enabled
# Hot module reloading
```

### Production
```bash
npm run build
npm start
# Optimized bundle
# No source maps (unless enabled)
# Static asset caching
```

## Security Best Practices

✅ **Already Implemented:**
- No sensitive credentials stored
- No external API calls
- All data processed client-side
- Static hosting (no server vulnerabilities)
- HTTPS enabled by default on Vercel

⚠️ **Keep in Mind:**
- This is demo data only
- Don't add real credentials
- For production use, implement backend authentication
- Add rate limiting if adding backend later
- Use environment variables for secrets

## Updating Dependencies

### Check for Updates

```bash
npm outdated
# Shows available updates

npm update
# Updates packages to latest compatible versions

npm audit
# Checks for security vulnerabilities

npm audit fix
# Fixes vulnerabilities automatically
```

### Update Next.js

```bash
npm install next@latest
npm run build
# Test locally before committing
git add .
git commit -m "Update Next.js to latest"
git push origin main
# Vercel auto-deploys
```

## Custom Build Configuration

Edit `next.config.ts` for:
- Image optimization
- Webpack overrides
- Environment-specific settings
- Build output configuration

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your custom config here
};

export default nextConfig;
```

## Debugging Production Issues

### Enable Source Maps

1. **In Production:**
   - Vercel preserves source maps by default
   - View errors in browser DevTools
   - Check Network tab for requests

2. **View Server Errors:**
   - Vercel → Monitoring tab
   - Check error logs
   - Filter by severity/type

### Test Production Build Locally

```bash
npm run build
npm start

# Should behave exactly like live version
# Check console and Network tab for issues
```

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support
- **GitHub Help**: https://docs.github.com

## Rollout Checklist

- [ ] Code tested locally
- [ ] All dependencies updated
- [ ] No console errors
- [ ] Build completes successfully
- [ ] Preview deployment works
- [ ] Production URL configured
- [ ] Custom domain set up (if needed)
- [ ] Analytics enabled
- [ ] Alerts configured
- [ ] Team access granted
- [ ] Documentation updated

---

**Your Identity Asset Dashboard is now live on the internet! 🚀**

Share your Vercel URL with anyone to show your work.
