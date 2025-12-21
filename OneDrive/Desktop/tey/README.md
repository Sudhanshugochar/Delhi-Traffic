# Identity Asset Dashboard

A modern, frontend-only dashboard application for managing security credentials and identity assets. Built with Next.js, TypeScript, and Tailwind CSS, this application demonstrates professional-grade frontend engineering practices.

## 🚀 Features

### Core Modules

1. **Certificates Management**
   - List view with filtering by domain
   - Sort by expiry date
   - Pagination (5-10 items per page)
   - Dynamic status badges (active/expired/expiring soon)
   - Modal view for detailed certificate information
   - Drawer-based editing with local persistence

2. **SSH Keys Management**
   - Debounced search across owner and fingerprint
   - Sort by trust level (High/Medium/Low)
   - Color-coded trust level indicators
   - Expandable rows with smooth animations
   - Associated servers display

3. **Code Signing Keys**
   - Toggle between grid and table views
   - Grid view with icon-based protection level indicators (HSM vs Software)
   - Sort by creation date, last used, or key alias
   - HSM module information display
   - Color-coded protection level badges

4. **Audit Logs**
   - Filter by action type
   - Date range filtering (start and end dates)
   - Infinite scrolling with load-more indicators
   - Row expansion to display formatted JSON metadata
   - Status indicators (success/failed/warning)

### Cross-Cutting Features

- **Smart Caching**: LocalStorage-based caching with 5-minute TTL
- **Skeleton Loaders**: Beautiful placeholder UI during data loading
- **Dark Mode**: Toggle with persistence
- **Responsive Design**: Mobile to desktop
- **Error Handling**: User-friendly error states with retry
- **Global Notifications**: Toast-style system
- **Smooth Animations**: Professional transitions

## 📋 Tech Stack

- **Framework**: Next.js 16.1.0 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm 9+

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Navigate to `http://localhost:3000`

## 🚀 Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Vercel will auto-detect and deploy

## 📁 Project Structure

```
src/
├── app/                        # Pages and routing
├── components/
│   ├── common/                # Reusable UI components
│   ├── layout/                # Navigation components
│   └── modules/               # Feature-specific components
├── context/                   # Zustand stores
├── data/                      # JSON data files
├── hooks/                     # Custom React hooks
└── utils/                     # Helpers and utilities
```

## 📊 Data

All data is loaded from JSON files in `src/data/`:
- `certificates.json` - SSL/TLS certificates
- `ssh-keys.json` - SSH key information
- `code-signing-keys.json` - Code signing keys
- `audit-logs.json` - System audit logs

### Caching

- 5-minute LocalStorage cache
- Automatic refresh on page load
- Fallback to cache if network fails

## 🎨 Dark Mode

- Toggle in sidebar footer
- Preference persisted to LocalStorage
- Tailwind CSS dark mode

## 📱 Responsive Design

- Mobile-first approach
- Hamburger menu on tablets/mobile
- Desktop sidebar navigation
- Optimized for all breakpoints

## 🔍 Features Breakdown

### Certificates
- Domain filtering (case-insensitive)
- Sort by expiry date or name
- 5-10 items per page
- Modal view, drawer edit

### SSH Keys
- Debounced search (300ms)
- Sort by trust level
- Expandable server list
- Smooth animations

### Code Signing Keys
- Grid/table view toggle
- Sort by date, usage, or name
- HSM/Software badges
- Icon-based UI

### Audit Logs
- Action type filtering
- Date range picker
- Infinite scroll
- JSON metadata display

## ⚡ Performance

- Skeleton loading
- LocalStorage caching
- Debounced search
- Code splitting (Next.js)
- SVG icons

## 🔐 Security

- Client-side only operations
- No external API calls
- LocalStorage for UI preferences
- Demo data only

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## 🎓 Demonstrates

- Next.js 13+ App Router
- TypeScript best practices
- Component composition
- Zustand state management
- Tailwind CSS responsive design
- Form handling
- Error boundaries
- Performance optimization

---

**Built with ❤️ for frontend excellence**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
