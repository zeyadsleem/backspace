# State Management — إدارة الحالة

## Zustand Store

نستخدم **Zustand** مع **Immer** لإدارة الحالة.

### الملفات

```
src/stores/
├── useAppStore.ts    # الـ Store الرئيسي
└── hooks.ts          # Custom hooks
```

### استخدام الـ Store

```tsx
import { useAppStore } from '@/stores/useAppStore'

// قراءة البيانات
const customers = useAppStore((state) => state.customers)

// استدعاء الـ actions
const { addCustomer, deleteCustomer } = useAppStore()
```

### الـ Actions المتاحة

#### Customers
- `fetchCustomers()`
- `addCustomer(data)`
- `updateCustomer(id, data)`
- `deleteCustomer(id)`

#### Resources
- `fetchResources()`
- `addResource(data)`
- `updateResource(id, data)`
- `deleteResource(id)`

#### Sessions
- `fetchActiveSessions()`
- `startSession(customerId, resourceId)`
- `endSession(sessionId)`
- `addInventoryToSession(sessionId, inventoryId, quantity)`

#### Inventory
- `fetchInventory()`
- `addInventoryItem(data)`
- `updateInventoryItem(id, data)`
- `deleteInventoryItem(id)`

#### Invoices
- `fetchInvoices()`
- `processPayment(data)`

### الترجمة

```tsx
const t = useAppStore((state) => state.t)
const message = t('customers.add')
```
