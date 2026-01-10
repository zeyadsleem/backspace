# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Or in CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans:wght@400;500;600;700;800&display=swap');
```

## Font Usage

- **Headings:** Noto Sans (weights: 600, 700, 800)
- **Body text:** Noto Sans (weights: 400, 500, 600)
- **Code/technical:** IBM Plex Mono (weights: 400, 500, 600)

## Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
}
```

## Typography Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Table headers, badges, small labels |
| `text-sm` | 14px | Card titles, button text, table cells |
| `text-base` | 16px | Body text, subheaders |
| `text-lg` | 18px | Section headings |
| `text-xl` | 20px | Page headings |
| `text-2xl` | 24px | Page titles |
| `text-3xl` | 30px | Hero titles |

## Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Regular text |
| `font-medium` | 500 | Body text, descriptions |
| `font-semibold` | 600 | Labels, values |
| `font-bold` | 700 | Emphasized text, navigation |
| `font-extrabold` | 800 | Card titles, section headers |

## RTL Support

Noto Sans has excellent Arabic character support. When Arabic is selected:
- Text direction changes to RTL
- Layout mirrors horizontally
- Font remains Noto Sans for both languages
