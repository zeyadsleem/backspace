import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import { DashboardPage } from '../pages/DashboardPage'
import { CustomersPage } from '../pages/CustomersPage'
import { CustomerProfilePage } from '../pages/CustomerProfilePage'
import { ResourcesPage } from '../pages/ResourcesPage'
import { SessionsPage } from '../pages/SessionsPage'
import { SubscriptionsPage } from '../pages/SubscriptionsPage'
import { InventoryPage } from '../pages/InventoryPage'
import { InvoicesPage } from '../pages/InvoicesPage'
import { ReportsPageWrapper } from '../pages/ReportsPageWrapper'
import { SettingsPageWrapper } from '../pages/SettingsPageWrapper'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/:id', element: <CustomerProfilePage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'reports', element: <ReportsPageWrapper /> },
      { path: 'settings', element: <SettingsPageWrapper /> },
    ],
  },
])
