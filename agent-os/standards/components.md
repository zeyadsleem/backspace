# Component Standards — معايير المكونات

## هيكل الملفات

```
src/components/
├── ui/              # مكونات Shadcn الأساسية
├── shared/          # مكونات مشتركة
├── [section]/       # مكونات كل قسم
│   ├── index.ts
│   ├── ComponentName.tsx
│   └── ...
```

## تسمية المكونات

- **PascalCase** لأسماء الملفات والـ Components
- ملف `index.ts` لكل مجلد للـ exports

```tsx
// components/customers/index.ts
export { CustomerForm } from './CustomerForm'
export { CustomersList } from './CustomersList'
```

## هيكل المكون

```tsx
import { type FC } from 'react'

interface ComponentNameProps {
  // props
}

export const ComponentName: FC<ComponentNameProps> = ({ ...props }) => {
  // hooks
  
  // handlers
  
  return (
    // JSX
  )
}
```

## Shared Components المتاحة

| المكون | الاستخدام |
|--------|-----------|
| `PageHeader` | عنوان الصفحة مع أزرار الإجراءات |
| `SearchInput` | حقل البحث |
| `EmptyState` | حالة عدم وجود بيانات |
| `LoadingState` | حالة التحميل |
| `DeleteConfirmDialog` | تأكيد الحذف |
| `SuccessDialog` | رسالة النجاح |
| `Modal` | النافذة المنبثقة |
| `FormField` | حقل النموذج |
