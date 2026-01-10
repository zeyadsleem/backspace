# Application Shell

## Overview

Backspace uses a sidebar navigation pattern optimized for desktop-first usage. The shell provides persistent navigation to all major sections, a user menu for settings access, and supports both Arabic (RTL) and English (LTR) layouts with light/dark theme switching.

## Components

| Component | Description |
|-----------|-------------|
| `AppShell` | Main layout wrapper with sidebar and content area |
| `MainNav` | Navigation list with icons and labels |
| `UserMenu` | User info display with logout button |

## Navigation Structure

| Label | Route | Icon |
|-------|-------|------|
| Dashboard | /dashboard | Home |
| Customers | /customers | Users |
| Resources | /resources | Building |
| Sessions | /sessions | Clock |
| Subscriptions | /subscriptions | CreditCard |
| Inventory | /inventory | Package |
| Invoices | /invoices | FileText |
| Reports | /reports | BarChart |
| Settings | /settings | Settings |

## Props

### AppShell

```typescript
interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  user?: { name: string; role?: string; avatarUrl?: string }
  onNavigate?: (href: string) => void
  onLogout?: () => void
  isRTL?: boolean
}
```

### MainNav

```typescript
interface MainNavProps {
  items: NavigationItem[]
  collapsed?: boolean
  onNavigate?: (href: string) => void
  isRTL?: boolean
}
```

### UserMenu

```typescript
interface UserMenuProps {
  user?: { name: string; role?: string; avatarUrl?: string }
  collapsed?: boolean
  onLogout?: () => void
  isRTL?: boolean
}
```

## Layout Pattern

- **Expanded sidebar:** 240px width with icons and labels
- **Collapsed sidebar:** 64px width with icons only
- **Main content:** Fills remaining space

## Responsive Behavior

- **Desktop (1024px+):** Full sidebar, collapsible via toggle
- **Tablet (768px-1023px):** Collapsed by default
- **Mobile (<768px):** Hidden sidebar, hamburger menu reveals overlay

## RTL Support

When `isRTL={true}`:
- Sidebar moves to right side
- Navigation items reverse direction
- All text aligns appropriately

## Usage Example

```tsx
import { AppShell } from './components'
import { Home, Users, Building } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: <Home />, isActive: true },
  { label: 'Customers', href: '/customers', icon: <Users /> },
  { label: 'Resources', href: '/resources', icon: <Building /> },
]

function App() {
  return (
    <AppShell
      navigationItems={navItems}
      user={{ name: 'Ahmed Hassan', role: 'Admin' }}
      onNavigate={(href) => router.push(href)}
      onLogout={() => auth.logout()}
      isRTL={false}
    >
      <YourPageContent />
    </AppShell>
  )
}
```
