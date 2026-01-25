# RTL Standards — معايير التصميم العربي

## القاعدة الأساسية

> **التطبيق عربي بالكامل.** كل المكونات، الأنماط، والمنطق يجب أن تكون RTL-first.

## CSS Logical Properties

استخدم دائماً الخصائص المنطقية بدلاً من الاتجاهية:

```css
/* ❌ لا تستخدم */
margin-left: 1rem;
padding-right: 0.5rem;
text-align: left;

/* ✅ استخدم */
margin-inline-start: 1rem;
padding-inline-end: 0.5rem;
text-align: start;
```

## Tailwind Classes

| ❌ تجنب | ✅ استخدم |
|---------|----------|
| `ml-*`, `mr-*` | `ms-*`, `me-*` |
| `pl-*`, `pr-*` | `ps-*`, `pe-*` |
| `left-*`, `right-*` | `start-*`, `end-*` |
| `text-left`, `text-right` | `text-start`, `text-end` |

## الاستثناءات

الحقول التالية يجب أن تكون LTR:
- أرقام الهاتف (`input[type="tel"]`)
- البريد الإلكتروني (`input[type="email"]`)
- الروابط والـ URLs

```tsx
<input type="tel" dir="ltr" className="ltr-text-input" />
```

## الأيقونات

الأيقونات الاتجاهية (مثل الأسهم) يجب أن تُعكس:

```tsx
<ChevronLeft className="rtl-flip" />
```
