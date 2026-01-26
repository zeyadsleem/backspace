# معايير نظام التصميم - Backspace

## 🎨 الألوان (Colors)

### الألوان الرئيسية
- **Primary (Amber)**: `amber-500`, `amber-600` - للأزرار الرئيسية والعناصر المهمة
- **Success (Emerald)**: `emerald-600`, `emerald-700` - للنجاح والحالات الإيجابية
- **Danger (Red)**: `red-600`, `red-700` - للأخطاء والحذف
- **Neutral (Stone)**: `stone-50` → `stone-900` - للخلفيات والنصوص

### Dark Mode
جميع الألوان يجب أن تحتوي على نسخة Dark Mode:
```css
/* Light */
bg-white text-stone-900

/* Dark */
dark:bg-stone-900 dark:text-stone-100
```

---

## 📝 الخطوط (Typography)

### أحجام الخطوط
- **text-xs**: `12px` - للنصوص الصغيرة جداً (badges, captions)
- **text-sm**: `14px` - للنصوص العادية (body text)
- **text-base**: `16px` - للنصوص المتوسطة
- **text-lg**: `18px` - للعناوين الصغيرة
- **text-xl**: `20px` - للعناوين المتوسطة
- **text-2xl**: `24px` - للعناوين الكبيرة

### أوزان الخطوط (Font Weights)
**⚠️ قواعد مهمة جداً - يجب اتباعها في كل المشروع:**

1. **font-bold** (`700`): للعناوين الرئيسية فقط (Page Headers, Card Titles)
2. **font-semibold** (`600`): للعناوين الفرعية (Dialog Headers, Section Headers)
3. **font-medium** (`500`): للنصوص المهمة والأسماء (Customer names, labels)
4. **font-normal** (`400`): للنصوص العادية

### أمثلة الاستخدام الصحيح

```tsx
// ✅ صحيح
<h1 className="font-bold text-2xl">لوحة التحكم</h1>
<h2 className="font-semibold text-lg">العملاء</h2>
<p className="font-medium text-sm">محمد أحمد</p>
<p className="font-normal text-sm">البريد الإلكتروني</p>

// ❌ خطأ - عدم الاتساق
<h1 className="font-semibold text-2xl">لوحة التحكم</h1>  // يجب أن يكون bold
<h2 className="font-bold text-lg">العملاء</h2>  // يجب أن يكون semibold
```

---

## 🔘 الأزرار (Buttons)

### الأحجام (Sizes)
**⚠️ يجب استخدام نفس الحجم للأزرار في نفس السياق:**

- **sm**: `h-10` - للأزرار الصغيرة (inline actions, compact spaces)
- **md**: `h-11` - للأزرار العادية (forms, dialogs, cards) **[الحجم الافتراضي]**
- **lg**: `h-14` - للأزرار الكبيرة (CTAs, landing pages)
- **icon**: `h-10 w-10` - للأزرار بالأيقونات فقط

### الأنواع (Variants)
- **primary**: الأزرار الرئيسية (حفظ، إنشاء، تأكيد)
- **success**: أزرار النجاح (إكمال، موافق)
- **danger**: أزرار الخطر (حذف، إلغاء)
- **ghost**: أزرار شفافة (إلغاء، رجوع)
- **outline**: أزرار بحدود (إجراءات ثانوية)

### قواعد الاستخدام

```tsx
// ✅ صحيح - Form Dialog
<FormActions>
  <Button variant="ghost" size="md">إلغاء</Button>
  <Button variant="primary" size="md">حفظ</Button>
</FormActions>

// ✅ صحيح - Delete Confirmation
<Button variant="ghost" size="md">رجوع</Button>
<Button variant="danger" size="md">حذف</Button>

// ❌ خطأ - أحجام مختلفة في نفس السياق
<Button variant="ghost" size="sm">إلغاء</Button>
<Button variant="primary" size="md">حفظ</Button>  // حجم مختلف!

// ❌ خطأ - لم يتم تحديد الحجم
<Button variant="primary">حفظ</Button>  // يجب تحديد size="md"
```

### حالات الزر (Button States)

**⚠️ مهم جداً:** يجب تعطيل الزر عندما:
- النموذج غير صالح
- البيانات المطلوبة مفقودة
- العملية قيد التنفيذ (isLoading)

```tsx
// ✅ صحيح
<Button
  variant="primary"
  size="md"
  disabled={isLoading || !formData.name || !formData.email}
  isLoading={isLoading}
>
  حفظ
</Button>

// ❌ خطأ - الزر مفعّل رغم عدم صلاحية النموذج
<Button variant="primary" size="md">حفظ</Button>
```

---

## 📦 البطاقات (Cards)

### التصميم الموحد
```tsx
<Card>
  <CardHeader>
    <CardTitle>العنوان</CardTitle>  {/* font-semibold text-lg */}
    <CardDescription>الوصف</CardDescription>  {/* text-sm text-stone-500 */}
  </CardHeader>
  <CardContent>
    {/* المحتوى */}
  </CardContent>
  <CardFooter>
    {/* أزرار أو معلومات إضافية */}
  </CardFooter>
</Card>
```

---

## 🗨️ النوافذ المنبثقة (Dialogs/Modals)

### التصميم الموحد للـ Header

**⚠️ جميع الـ Dialogs يجب أن تتبع نفس النمط:**

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  maxWidth="max-w-2xl"
  title={
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
        <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      </div>
      <span className="font-semibold text-lg">{title}</span>
    </div>
  }
>
  {/* المحتوى */}
</Modal>
```

### الألوان حسب النوع
- **Primary/Create**: `bg-amber-100` + `text-amber-600`
- **Info/View**: `bg-blue-100` + `text-blue-600`
- **Success**: `bg-emerald-100` + `text-emerald-600`
- **Warning**: `bg-yellow-100` + `text-yellow-600`
- **Danger/Delete**: `bg-red-100` + `text-red-600`

---

## 🔄 دعم RTL/LTR

### القواعد الأساسية

**⚠️ ممنوع استخدام `left` أو `right` في أي مكان!**

```tsx
// ❌ خطأ
className="absolute left-4 top-4"
className="text-left"
className="ml-4"

// ✅ صحيح - استخدم start/end
className="absolute start-4 top-4"
className="text-start"
className="ms-4"
```

### Spacing (المسافات)
- `ms-*` بدلاً من `ml-*` (margin-inline-start)
- `me-*` بدلاً من `mr-*` (margin-inline-end)
- `ps-*` بدلاً من `pl-*` (padding-inline-start)
- `pe-*` بدلاً من `pr-*` (padding-inline-end)

### Positioning (التموضع)
- `start-*` بدلاً من `left-*`
- `end-*` بدلاً من `right-*`

### Text Alignment
- `text-start` بدلاً من `text-left`
- `text-end` بدلاً من `text-right`

### Flexbox
- `justify-start` بدلاً من `justify-left`
- `justify-end` بدلاً من `justify-right`

### Border Radius
```tsx
// ❌ خطأ
className="rounded-tl-lg rounded-bl-lg"

// ✅ صحيح
className="rounded-s-lg"  // start side (left in LTR, right in RTL)
className="rounded-e-lg"  // end side (right in LTR, left in RTL)
```

---

## 📋 النماذج (Forms)

### التصميم الموحد

```tsx
<FormField>
  <FormLabel icon={<Icon />} required>
    اسم الحقل
  </FormLabel>
  <FormInput
    value={value}
    onChange={handleChange}
    error={!!errors.field}
    forceLTR={isEmailOrPhone}  // للإيميل والهاتف
  />
  <FormError>{errors.field}</FormError>
</FormField>
```

### حالات خاصة - forceLTR
استخدم `forceLTR={true}` للحقول التالية:
- Email
- Phone
- URL
- Number
- Code/Password

---

## 🎯 التباعد (Spacing)

### المسافات الموحدة
- **gap-2**: `8px` - بين العناصر الصغيرة
- **gap-3**: `12px` - بين العناصر المتوسطة
- **gap-4**: `16px` - بين العناصر الكبيرة
- **gap-6**: `24px` - بين الأقسام

### Padding
- **p-2**: للعناصر الصغيرة
- **p-4**: للبطاقات والمحتوى
- **p-6**: للـ Dialogs والصفحات

---

## 🔔 التنبيهات (Alerts)

```tsx
<Alert variant="warning" dismissible onDismiss={handleDismiss}>
  <AlertTitle>تحذير</AlertTitle>
  <AlertDescription>
    رسالة التحذير
  </AlertDescription>
</Alert>
```

---

## ✅ Checklist قبل الـ Commit

قبل عمل commit، تأكد من:

- [ ] جميع العناوين الرئيسية تستخدم `font-bold`
- [ ] جميع العناوين الفرعية تستخدم `font-semibold`
- [ ] جميع الأزرار لها `size` محدد (sm, md, lg)
- [ ] الأزرار في نفس السياق بنفس الحجم
- [ ] لا يوجد استخدام لـ `left` أو `right` - استخدم `start`/`end`
- [ ] لا يوجد استخدام لـ `ml` أو `mr` - استخدم `ms`/`me`
- [ ] جميع الـ Dialogs تستخدم `Modal` الموحد
- [ ] جميع الأزرار معطلة عندما يكون النموذج غير صالح
- [ ] جميع الحقول المهمة لها `required` prop
- [ ] الحقول الخاصة (email, phone) تستخدم `forceLTR`
- [ ] Dark Mode يعمل بشكل صحيح على جميع العناصر

---

## 📚 موارد إضافية

- [Tailwind CSS RTL Support](https://tailwindcss.com/docs/rtl-support)
- [CVA (Class Variance Authority)](https://cva.style/docs)
- [Lucide Icons](https://lucide.dev/)
