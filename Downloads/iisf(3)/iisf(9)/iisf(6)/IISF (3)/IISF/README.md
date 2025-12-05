# IISF Project - Secure Authentication System

A modern web application with secure authentication, role-based access, and real-time notifications.

## Features

- Secure user authentication
- Role-based access (Student, Job Provider)
- Real-time notifications via Server-Sent Events (SSE)
- Email notifications
- Responsive UI with Tailwind CSS

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd iisf
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file with your configuration
```bash
cp .env.example .env
```

4. Update `.env` with your values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - Email credentials if using email notifications

5. Start the development server
```bash
npm start
```

The application will be available at `http://localhost:8080`

## Deployment to Vercel

### Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub repository
- MongoDB Atlas account

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin add-coral-abyss-theme
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Select "Import Git Repository"
   - Choose your repository
   - Select the branch

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add the following variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret
     - `EMAIL_USER`: Your email
     - `EMAIL_PASS`: Your email password or app-specific password

4. **Deploy**
   - Click "Deploy"
   - Wait for the deployment to complete

### Post-Deployment

- Your app will be available at `https://<your-vercel-url>.vercel.app`
- Update any hardcoded URLs in the frontend to use the new Vercel domain
- Test all features in production

## API Endpoints

- `GET /api/subscribe` - Subscribe to real-time notifications
- `POST /api/debug-send-notif` - Send test notifications
- `GET /api/debug-sse-clients` - Debug SSE connections
- `GET /api/health` - Health check

## Project Structure

```
├── form.html              # Main authentication form
├── student.html           # Student dashboard
├── jobprovider.html       # Job provider dashboard
├── server.js              # Express server (local)
├── api/
│   └── index.js          # Vercel serverless function
├── package.json           # Dependencies
├── vercel.json           # Vercel configuration
└── .env.example          # Environment variables template
```

## Troubleshooting

### SSE Connection Issues
- Check browser console for errors
- Verify `userId` is being sent correctly
- Check `/api/debug-sse-clients` to see connected clients

### Database Connection
- Verify MongoDB URI is correct
- Check MongoDB Atlas network access settings
- Ensure IP whitelist includes Vercel IPs

### Email Notifications
- Use app-specific passwords for Gmail
- Enable "Less secure app access" for other email providers

## Support

For issues or questions, please open an issue on GitHub.
