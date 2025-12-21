# Component Documentation - Identity Asset Dashboard

## Common Components

### Button Component
**File**: `src/components/common/Button.tsx`

**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
```

**Usage**:
```tsx
// Primary button
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

// Loading state
<Button isLoading={isLoading}>
  Save
</Button>

// Danger button
<Button variant="danger">
  Delete
</Button>

// Disabled
<Button disabled>
  Disabled
</Button>
```

**Variants**:
- `primary`: Blue background, white text (calls to action)
- `secondary`: Gray background (secondary actions)
- `danger`: Red background (destructive actions)
- `ghost`: Transparent (subtle actions)

**Sizes**:
- `sm`: Padding 2px, text-sm
- `md`: Padding 4px, text-base (default)
- `lg`: Padding 6px, text-lg

---

### Badge Component
**File**: `src/components/common/Button.tsx`

**Props**:
```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  children: React.ReactNode;
}
```

**Usage**:
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Expiring Soon</Badge>
<Badge variant="danger">Expired</Badge>
```

**Specialized Badges**:
```tsx
// Status badge for certificates
<StatusBadge status="active" />
<StatusBadge status="expiring soon" />
<StatusBadge status="expired" />

// Trust level badge for SSH keys
<TrustLevelBadge level="High" />
<TrustLevelBadge level="Medium" />
<TrustLevelBadge level="Low" />
```

---

### Modal Component
**File**: `src/components/common/Modal.tsx`

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeButton?: boolean;
}
```

**Usage**:
```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Certificate Details"
  size="md"
>
  <div>Modal content goes here</div>
</Modal>

<button onClick={() => setIsOpen(true)}>
  Open Modal
</button>
```

**Features**:
- Backdrop click to close
- Smooth animations
- Optional close button
- Configurable sizes
- Scrollable content area

---

### Drawer Component
**File**: `src/components/common/Modal.tsx`

**Props**:
```typescript
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}
```

**Usage**:
```tsx
const [isOpen, setIsOpen] = useState(false);

<Drawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Certificate"
  position="right"
>
  <form>
    {/* Form content */}
  </form>
</Drawer>

<button onClick={() => setIsOpen(true)}>
  Edit
</button>
```

**Features**:
- Side panel (left or right)
- Backdrop click to close
- Smooth slide animation
- Perfect for forms and editing

---

### Skeleton Loaders
**File**: `src/components/common/Skeletons.tsx`

**Components**:

```tsx
// Table skeleton
<TableSkeleton count={5} />

// Card grid skeleton
<CardSkeleton count={6} />

// List skeleton
<ListSkeleton count={5} />
```

**Usage in Components**:
```tsx
{loading && data.length === 0 ? (
  <TableSkeleton count={5} />
) : (
  // Actual content
)}
```

**Props**:
- `count`: Number of skeleton items to show
- `className`: Additional CSS classes

---

### Error Component
**File**: `src/components/common/ErrorComponent.tsx`

**Props**:
```typescript
interface ErrorComponentProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}
```

**Usage**:
```tsx
{error ? (
  <ErrorComponent
    title="Failed to load"
    message={error}
    onRetry={handleRetry}
  />
) : (
  // Normal content
)}
```

**Features**:
- Red icon indicator
- Error message display
- Optional retry button
- Customizable styling

---

### Empty State Component
**File**: `src/components/common/ErrorComponent.tsx`

**Props**:
```typescript
interface EmptyStateProps {
  title: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}
```

**Usage**:
```tsx
{items.length === 0 ? (
  <EmptyState
    title="No results"
    message="Try adjusting your filters"
    action={handleReset}
    actionLabel="Reset Filters"
  />
) : (
  // List of items
)}
```

---

### Notification System
**File**: `src/components/common/Notifications.tsx`

**Usage**:
```tsx
import { useNotificationStore } from '@/context/store';

export function MyComponent() {
  const { addNotification } = useNotificationStore();
  
  const handleSave = () => {
    try {
      // Save logic
      addNotification({
        message: 'Saved successfully!',
        type: 'success',
        duration: 3000
      });
    } catch (error) {
      addNotification({
        message: 'Failed to save',
        type: 'error'
      });
    }
  };
}
```

**Notification Types**:
- `success`: Green with checkmark
- `error`: Red with alert icon
- `info`: Blue with info icon
- `warning`: Yellow with alert icon

**Options**:
- `message`: Notification text
- `type`: Type of notification
- `duration`: Auto-dismiss time (ms), optional

---

## Layout Components

### Sidebar Navigation
**File**: `src/components/layout/Navigation.tsx`

**Features**:
- Logo with icon
- Navigation links to all modules
- Dark mode toggle
- Mobile hamburger menu
- Responsive auto-collapse

**Uses**:
- useUIStore for sidebar state
- useThemeStore for dark mode
- usePathname for active link detection

---

### Top Bar
**File**: `src/components/layout/Navigation.tsx`

**Features**:
- Dashboard title
- User avatar/menu
- Responsive layout

---

## Module Components

### Certificates Module
**File**: `src/components/modules/certificates/CertificatesModule.tsx`

**Features Implemented**:
- ✅ Domain filtering
- ✅ Sort by expiry date or name
- ✅ Pagination (5-10 per page)
- ✅ Status badges with colors
- ✅ Modal for detailed view
- ✅ Drawer for editing
- ✅ Caching with skeleton loaders
- ✅ Error handling with retry

**State Management**:
```typescript
- certificates: Certificate[]
- loading: boolean
- error: string | null
- domainFilter: string
- sortBy: 'expiry' | 'name'
- currentPage: number
- selectedCert: Certificate | null
- viewModalOpen: boolean
- editDrawerOpen: boolean
```

---

### SSH Keys Module
**File**: `src/components/modules/ssh-keys/SSHKeysModule.tsx`

**Features Implemented**:
- ✅ Debounced search (300ms)
- ✅ Sort by trust level, owner, or recency
- ✅ Expandable rows with smooth animation
- ✅ Associated servers display
- ✅ Color-coded trust levels
- ✅ Caching and skeleton loaders
- ✅ Error handling

**Search Fields**:
- Key owner name
- Fingerprint

**Expansion Shows**:
- Algorithm
- Key length
- Created date
- Last used date
- Associated servers with IPs

---

### Code Signing Keys Module
**File**: `src/components/modules/code-signing/CodeSigningKeysModule.tsx`

**Features Implemented**:
- ✅ Grid view with card UI
- ✅ Table view with sortable columns
- ✅ Toggle between views
- ✅ Protection level indicators (HSM/Software)
- ✅ Icon-based visual representation
- ✅ Sort by name, creation date, or last used
- ✅ Caching and skeleton loaders

**Grid View Card Shows**:
- Icon (Lock for HSM, Database for Software)
- Key alias
- Algorithm
- Protection level badge
- Creation date
- Last used time
- HSM module (if applicable)

**Table View Shows**:
- Key Alias
- Algorithm
- Protection Level
- Created Date
- Last Used

---

### Audit Logs Module
**File**: `src/components/modules/audit-logs/AuditLogsModule.tsx`

**Features Implemented**:
- ✅ Filter by action type (dropdown with all types)
- ✅ Date range filtering (start + end dates)
- ✅ Infinite scrolling (10 items at a time)
- ✅ Row expansion for metadata
- ✅ Status indicators (success/failed/warning)
- ✅ Formatted JSON metadata display
- ✅ Caching and skeleton loaders
- ✅ Load more indicator

**Expansion Shows**:
- Full timestamp
- Actor (who performed action)
- Target resource
- Status
- Metadata (formatted JSON)

**Action Types Shown**:
- certificate_viewed
- certificate_updated
- ssh_key_accessed
- audit_log_exported
- key_rotated
- permission_denied
- system_backup
- code_signing_performed
- expired_certificate_detected

---

## Utility Hooks

### useThemeStore
**File**: `src/context/store.ts`

```typescript
const { isDarkMode, toggleDarkMode } = useThemeStore();

// Automatically persisted to localStorage
```

### useUIStore
**File**: `src/context/store.ts`

```typescript
const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
```

### useNotificationStore
**File**: `src/context/store.ts`

```typescript
const { notifications, addNotification, removeNotification } = useNotificationStore();

addNotification({
  message: 'Success!',
  type: 'success',
  duration: 3000
});
```

---

## Utility Functions

### Cache Utilities
**File**: `src/utils/cache.ts`

```typescript
// Load JSON data
const data = await loadJsonData('certificates.json');

// Get cached data
const cached = getCachedData('certificates');

// Set cache
setCachedData('certificates', data);

// Clear cache
clearCache('certificates');
```

### Helper Functions
**File**: `src/utils/helpers.ts`

```typescript
// Date formatting
formatDate('2024-12-21')                    // "Dec 21, 2024"
formatDateTime('2024-12-21T14:30:00Z')      // "Dec 21, 2024 14:30:00"
formatTimeAgo('2024-12-21T14:30:00Z')       // "2h ago"

// Certificate status
getCertificateStatus('2024-12-31')          // "active" | "expiring soon" | "expired"
getDaysUntilExpiry('2024-12-31')            // 10

// Debouncing
const debouncedSearch = debounce(handleSearch, 300);
```

---

## Styling with Clsx

**Import**:
```typescript
import clsx from 'clsx';
```

**Usage**:
```tsx
<div
  className={clsx(
    'base-classes',
    condition && 'conditional-classes',
    isActive ? 'active-classes' : 'inactive-classes'
  )}
>
  Content
</div>
```

---

## Creating New Components

### Template

```tsx
'use client';

import React from 'react';
import clsx from 'clsx';

interface MyComponentProps {
  title: string;
  isLoading?: boolean;
  onAction?: () => void;
  className?: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  isLoading = false,
  onAction,
  className = ''
}) => {
  return (
    <div className={clsx('base-classes', className)}>
      <h2>{title}</h2>
      {isLoading && <div>Loading...</div>}
      {onAction && (
        <button onClick={onAction}>
          Action
        </button>
      )}
    </div>
  );
};
```

---

## Best Practices

1. **Always use `'use client'` for interactive components**
2. **Use TypeScript for all component props**
3. **Memoize expensive computations with `useMemo`**
4. **Use `useCallback` for stable function references**
5. **Handle loading and error states**
6. **Use skeleton loaders during data fetch**
7. **Provide meaningful error messages**
8. **Include retry mechanisms for errors**
9. **Test components with different states**
10. **Document prop types and usage**

---

## Accessibility Considerations

- Semantic HTML (button, nav, main)
- ARIA labels for icons
- Keyboard navigation support
- Color contrast for readability
- Focus indicators visible
- Form labels associated with inputs
- Error messages linked to inputs

---

**All components are production-ready and fully typed with TypeScript!**
