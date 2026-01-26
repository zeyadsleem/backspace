# مكونات واجهة المستخدم الموحدة

هذا المجلد يحتوي على جميع مكونات واجهة المستخدم الأساسية الموحدة في المشروع.

## المكونات المتاحة

### 1. Button & IconButton
مكونات الأزرار مع دعم variants متعددة وحالات loading.

```tsx
import { Button, IconButton } from "@/components/ui/button";

// استخدام Button
<Button variant="primary" size="md" isLoading={false}>
  حفظ
</Button>

// استخدام IconButton
<IconButton
  icon={<Pencil className="h-4 w-4" />}
  label="تعديل"
  variant="ghost"
  onClick={handleEdit}
/>
```

**Variants:**
- `primary` - اللون الرئيسي (كهرماني)
- `success` - أخضر للنجاح
- `danger` - أحمر للخطر
- `ghost` - شفاف مع خلفية عند hover
- `outline` - حدود فقط
- `link` - نص مع underline

**Sizes:**
- `sm` - صغير
- `md` - متوسط (افتراضي)
- `lg` - كبير
- `icon` - للأيقونات فقط (IconButton)

---

### 2. Card
مكونات البطاقات مع أجزاء فرعية.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>العنوان</CardTitle>
    <CardDescription>الوصف</CardDescription>
  </CardHeader>
  <CardContent>
    المحتوى هنا
  </CardContent>
  <CardFooter>
    أزرار أو معلومات إضافية
  </CardFooter>
</Card>
```

---

### 3. Badge
مكون الشارات للحالات والتصنيفات.

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success" size="md">
  نشط
</Badge>
```

**Variants:**
- `default` - رمادي
- `primary` - كهرماني
- `success` - أخضر
- `warning` - أصفر
- `danger` - أحمر
- `info` - أزرق
- `outline` - بحدود شفافة

---

### 4. Alert
مكون التنبيهات والرسائل.

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

<Alert variant="warning" dismissible onDismiss={handleDismiss}>
  <AlertTitle>تحذير</AlertTitle>
  <AlertDescription>
    هذا تحذير مهم يجب الانتباه له
  </AlertDescription>
</Alert>
```

**Variants:**
- `info` - معلومات (أزرق)
- `success` - نجاح (أخضر)
- `warning` - تحذير (أصفر/كهرماني)
- `danger` - خطر (أحمر)
- `default` - افتراضي (رمادي)

**Props:**
- `showIcon` - إظهار/إخفاء الأيقونة (افتراضي: true)
- `dismissible` - قابل للإغلاق
- `onDismiss` - دالة الإغلاق

---

### 5. Dialog
مكون الـ Modal مع تصميم موحد.

```tsx
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogHeader>
    <DialogTitle>عنوان النافذة</DialogTitle>
  </DialogHeader>
  <DialogContent>
    محتوى النافذة
  </DialogContent>
  <DialogFooter>
    <Button onClick={handleCancel} variant="ghost">إلغاء</Button>
    <Button onClick={handleSave} variant="primary">حفظ</Button>
  </DialogFooter>
</Dialog>
```

---

### 6. Form Components
مكونات النماذج مع دعم التحقق والأخطاء.

```tsx
import {
  FormInput,
  FormLabel,
  FormError,
  FormHelper,
  FormField,
  TextField,
  TextareaField,
  SelectField,
  FormActions
} from "@/components/ui/form";

// استخدام مباشر
<FormField>
  <FormLabel required>الاسم</FormLabel>
  <FormInput value={name} onChange={handleChange} />
  <FormError>{errors.name}</FormError>
</FormField>

// استخدام Composite
<TextField
  label="البريد الإلكتروني"
  type="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
  required
  forceLTR
/>

// Select مع options
<SelectField
  label="الفئة"
  options={[
    { value: "beverage", label: "مشروبات" },
    { value: "snack", label: "وجبات خفيفة" }
  ]}
  value={category}
  onChange={handleChange}
/>

// أزرار النموذج
<FormActions>
  <Button variant="ghost" onClick={handleCancel}>إلغاء</Button>
  <Button variant="primary" type="submit">حفظ</Button>
</FormActions>
```

**Props مهمة:**
- `forceLTR` - يجبر الاتجاه لليسار (مفيد للإيميل، رقم الهاتف، إلخ)
- `error` - رسالة الخطأ (يغير اللون تلقائياً)
- `required` / `optional` - يضيف علامة * أو (اختياري)

---

### 7. Tabs
مكون التبويبات.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const [activeTab, setActiveTab] = useState("general");

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList variant="default">
    <TabsTrigger value="general" isActive={activeTab === "general"}>
      عام
    </TabsTrigger>
    <TabsTrigger value="advanced" isActive={activeTab === "advanced"}>
      متقدم
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="general" isActive={activeTab === "general"}>
    محتوى التبويب الأول
  </TabsContent>
  
  <TabsContent value="advanced" isActive={activeTab === "advanced"}>
    محتوى التبويب الثاني
  </TabsContent>
</Tabs>
```

**Variants:**
- `default` - تصميم عادي مع خلفية
- `pills` - تصميم حبوب (pills)

---

### 8. Skeleton
مكون التحميل الهيكلي.

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-12 w-full" />
```

---

## المميزات العامة

### 1. دعم RTL
جميع المكونات تدعم الاتجاه من اليمين لليسار (RTL) تلقائياً بناءً على حالة التطبيق.

### 2. Dark Mode
جميع المكونات تدعم الوضع الداكن مع ألوان مناسبة.

### 3. Accessibility
المكونات تتبع أفضل ممارسات الوصولية (a11y):
- استخدام ARIA labels
- دعم لوحة المفاتيح
- Focus states واضحة

### 4. Consistent Design System
جميع المكونات تستخدم:
- نظام ألوان موحد (stone + amber + emerald + red)
- تدرجات ثابتة (rounded-xl, shadow-sm, إلخ)
- تباعد متسق (spacing scale)
- انتقالات سلسة (transitions)

### 5. TypeScript Support
جميع المكونات مكتوبة بـ TypeScript بالكامل مع types كاملة.

---

## إرشادات الاستخدام

### لا تستخدم:
❌ `<button className="rounded-lg bg-amber-500 ...">`
❌ أزرار HTML مباشرة مع className مخصص
❌ تصاميم مكررة في كل ملف

### استخدم بدلاً من ذلك:
✅ `<Button variant="primary">حفظ</Button>`
✅ المكونات الموحدة من `@/components/ui`
✅ استيراد المكونات وإعادة استخدامها

### مثال للتحويل:

**قبل:**
```tsx
<button
  className="rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
  onClick={handleSave}
>
  حفظ
</button>
```

**بعد:**
```tsx
<Button variant="primary" onClick={handleSave}>
  حفظ
</Button>
```

---

## التطوير المستقبلي

المكونات المخطط إضافتها:
- [ ] Tooltip
- [ ] Popover
- [ ] Dropdown Menu
- [ ] Toast/Notification
- [ ] Progress Bar
- [ ] Switch/Toggle
- [ ] Checkbox & Radio
- [ ] Date Picker
- [ ] Combobox/Autocomplete

---

## الصيانة

عند إضافة مكون جديد:
1. استخدم `class-variance-authority` (CVA) للـ variants
2. استخدم `forwardRef` لدعم refs
3. أضف دعم RTL و Dark Mode
4. أضف types كاملة
5. اختبر على شاشات مختلفة (mobile, desktop, 4K)
6. حدّث `src/components/ui/index.ts`
7. حدّث هذا الدليل
