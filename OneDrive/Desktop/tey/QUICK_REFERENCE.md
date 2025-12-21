# Quick Reference - Identity Asset Dashboard

## 🚀 Getting Started (60 seconds)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
http://localhost:3000

# 4. Start building!
```

## 📁 Folder Quick Reference

| Folder | Purpose |
|--------|---------|
| `src/app` | Page routes and layout |
| `src/components` | React components |
| `src/context` | Zustand stores (state) |
| `src/data` | Source JSON files |
| `src/utils` | Helper functions |
| `public/data` | Public JSON (for fetching) |

## 🎨 Common Tasks

### Add a Button
```tsx
import { Button } from '@/components/common/Button';

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

### Show a Modal
```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Title"
>
  Content here
</Modal>
```

### Show a Notification
```tsx
import { useNotificationStore } from '@/context/store';

const { addNotification } = useNotificationStore();

addNotification({
  message: 'Success!',
  type: 'success',
  duration: 3000
});
```

### Load JSON Data
```tsx
import { loadJsonData } from '@/utils/cache';

const data = await loadJsonData('certificates.json');
```

### Format a Date
```tsx
import { formatDate, formatTimeAgo } from '@/utils/helpers';

formatDate('2024-12-21')        // "Dec 21, 2024"
formatTimeAgo('2024-12-21...')  // "2h ago"
```

## 📊 Data Structure

### Certificate
```typescript
{
  id: string;
  name: string;
  domain: string;
  issuer: string;
  status: 'active' | 'expired' | 'expiring soon';
  expiryDate: string;
  issuedDate: string;
  subject: string;
  fingerprint: string;
}
```

### SSH Key
```typescript
{
  id: string;
  keyOwner: string;
  fingerprint: string;
  lastUsed: string;
  trustLevel: 'High' | 'Medium' | 'Low';
  createdAt: string;
  algorithm: string;
  keyLength: number;
  servers: { name: string; ip: string }[];
}
```

### Code Signing Key
```typescript
{
  id: string;
  keyAlias: string;
  algorithm: string;
  protectionLevel: 'HSM' | 'Software';
  createdAt: string;
  lastUsed: string;
  hsmModule: string | null;
  certificateThumbprint: string;
}
```

### Audit Log
```typescript
{
  id: string;
  timestamp: string;
  actor: string;
  actionType: string;
  targetResource: string;
  resourceName: string;
  status: 'success' | 'failed' | 'warning';
  metadata: Record<string, any>;
}
```

## 🎯 Component Variants

### Button Variants
```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
```

### Button Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Badge Variants
```tsx
<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>
```

## 🧪 Testing Locally

### Test Filtering
- Certificates: Type in domain filter
- SSH Keys: Type in search box
- Audit Logs: Select action type, pick dates

### Test Sorting
- Certificates: Toggle sort dropdown
- SSH Keys: Click sort dropdown
- Code Signing: Click sort dropdown

### Test Pagination
- Certificates: Click Next/Previous buttons
- Audit Logs: Scroll down for infinite scroll

### Test Dark Mode
- Click toggle in sidebar footer
- Refresh page - preference persists

### Test Caching
1. Load page
2. Check DevTools → Application → LocalStorage
3. Refresh page - data loads instantly from cache

## 🔍 Debugging

### View Console Errors
```
F12 → Console → Check for red errors
```

### Check Network Requests
```
F12 → Network → Refresh → See /data/*.json requests
```

### Check LocalStorage
```
F12 → Application → LocalStorage → view cached data
```

### Debug React Components
```
F12 → Components (React DevTools) → Inspect state
```

## ⚡ Common Commands

```bash
# Development
npm run dev              # Start dev server on :3000

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint --fix       # Fix linting issues

# Debugging
npm run build --analyze  # Show bundle breakdown

# Cleanup
rm -rf .next             # Clean build cache
npm ci                   # Clean reinstall
```

## 📝 Adding a New Module

### 1. Create Component
```tsx
// src/components/modules/new-module/NewModuleComponent.tsx
export const NewModule: React.FC = () => {
  const [data, setData] = useState([]);
  // Component logic
};
```

### 2. Create Page
```tsx
// src/app/new-module/page.tsx
'use client';
import { NewModule } from '@/components/modules/new-module/NewModuleComponent';

export default function NewModulePage() {
  return <NewModule />;
}
```

### 3. Add Navigation Link
```tsx
// src/components/layout/Navigation.tsx
const navItems = [
  // ... existing items
  { href: '/new-module', label: 'New Module', icon: IconComponent },
];
```

### 4. Add Data File
```json
// src/data/new-module.json
// Also create in public/data/new-module.json
```

## 🎨 Tailwind Classes Quick Reference

```tsx
// Colors
<div className="text-blue-600 dark:text-blue-400">
<div className="bg-gray-100 dark:bg-gray-800">

// Spacing
<div className="p-4 m-2 gap-3">

// Sizing
<div className="w-full h-screen">

// Flexbox
<div className="flex items-center justify-between">

// Grid
<div className="grid grid-cols-3 gap-4">

// Display
<div className="hidden md:block">

// Animations
<div className="animate-fade-in hover:scale-105">
```

## 🚀 Environment Variables

No environment variables needed for this project! All data comes from static JSON files.

To add later:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ANALYTICS_ID=abc123
```

## 📚 File Organization

**Good Structure**:
```
src/
  components/
    modules/
      feature/
        FeatureComponent.tsx
        FeatureComponent.test.tsx
    common/
      Button.tsx
```

**When to create files**:
- Component > 200 lines? → Extract sub-component
- Repeated logic? → Create utility function
- Multiple related? → Group in folder

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "cannot find module" | Check import path, file exists |
| "404 data not loading" | Verify files in public/data/ |
| "dark mode not working" | Clear cache, refresh page |
| "skeleton shows forever" | Check console for fetch errors |
| "modal won't close" | Check onClose handler |

## 🔐 Security Reminders

- ✅ No real credentials in demo data
- ✅ All operations client-side
- ✅ No backend API calls
- ✅ LocalStorage safe for UI preferences
- ✅ Suitable for learning/demo only

## 📈 Performance Tips

1. **Use useMemo for** expensive calculations
2. **Use useCallback for** stable function refs
3. **Lazy load** heavy components
4. **Cache data** in LocalStorage
5. **Debounce search** input handlers

## 🎯 Before Deployment

- [ ] No console errors
- [ ] All data loads
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Filters work
- [ ] Sorting works
- [ ] Modals/drawers work
- [ ] TypeScript builds
- [ ] Test on different browser

---

**Happy coding! 🎉**

For detailed docs, see README.md, ARCHITECTURE.md, and COMPONENTS.md
