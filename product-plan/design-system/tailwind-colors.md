# Tailwind Color Configuration

## Color Choices

- **Primary:** `amber` — Used for buttons, links, key accents, active states
- **Secondary:** `emerald` — Used for success states, tags, highlights, subscriptions
- **Neutral:** `stone` — Used for backgrounds, text, borders, cards

## Usage Examples

### Primary (Amber)
```css
/* Primary button */
bg-amber-500 hover:bg-amber-600 text-white

/* Primary text/link */
text-amber-600 hover:text-amber-700 dark:text-amber-400

/* Primary badge */
bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400

/* Primary border */
border-amber-500 focus:ring-amber-500
```

### Secondary (Emerald)
```css
/* Success badge */
bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400

/* Success button */
bg-emerald-600 hover:bg-emerald-700 text-white

/* Active/subscribed indicator */
text-emerald-600 dark:text-emerald-400
```

### Neutral (Stone)
```css
/* Background */
bg-stone-50 dark:bg-stone-900

/* Card */
bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700

/* Text */
text-stone-900 dark:text-stone-100  /* Primary text */
text-stone-600 dark:text-stone-400  /* Secondary text */
text-stone-500 dark:text-stone-500  /* Muted text */

/* Border */
border-stone-200 dark:border-stone-700

/* Input */
border-stone-300 dark:border-stone-600 focus:border-amber-500
```

### Status Colors
```css
/* Paid/Success */
bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400

/* Unpaid/Error */
bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400

/* Pending/Warning */
bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400

/* Low Stock */
bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400

/* Out of Stock */
bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400
```

## Dark Mode

All components use `dark:` variants for dark mode support. The neutral scale is inverted in dark mode for proper contrast.
