# Alacard Brand — Cards System

This guide defines the three card types, their colors, tokens, and usage rules so UI, docs, and marketing stay consistent with the PRD (Arena, Cards, Recipe, Share/Remix, Notebook).

## Typography

- Primary font: Inter (variable) — modern, readable, widely supported; fits YC‑ready tech aesthetic with subtle playfulness.
- System: Inter everywhere (headings, body, UI). No secondary display font. Code/ids use system mono.
- Weights: Headings 600; body 400; UI labels 500.
- Numerals: Use tabular numerals for metrics (latency, tokens).

Implementation

- Next.js (recommended)

```ts
// app/layout.tsx (Next.js app router)
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

- CSS only

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
:root { --font-inter: "Inter", ui-sans-serif, system-ui, sans-serif; }
html, body { font-family: var(--font-inter); }
.metrics { font-variant-numeric: tabular-nums; }
```

## Card Types

- AI Model Card
  - Purpose: choose a model provider/id (e.g., `openai:gpt-4o-mini`).
  - Color family: Blue.
  - Key fields: Friendly name, full id (mono), capability tag.

- Components Card
  - Purpose: choose supporting pieces (e.g., Prompt Pack, Evaluator, Dataset snippet; scoped to sprint as Prompt Cards).
  - Color family: Orange.
  - Key fields: Title, short description, type icon.

- Complexity Card
  - Purpose: select difficulty level for recipes or notebooks.
  - Variants: Easy, Medium, Hard.
  - Color family: Traffic-light scale (Green → Amber → Red).

## Color System (Light/Dark)

Accessible, high-contrast colors for each card header/badge. Use subdued backgrounds with strong accents for text/icons.

Light theme (default)

- Model (Blue)
  - Background: `#EDF3FF`
  - Border: `#C7D6FF`
  - Accent/Text: `#2E6BFF`

 - Components (Orange)
  - Background: `#FFF3E7`
  - Border: `#FFD8B0`
  - Accent/Text: `#FF7A1A`

- Complexity
  - Easy (Green)
    - Background: `#E8F8F0`
    - Border: `#BFEAD8`
    - Accent/Text: `#2ECF8D`
  - Medium (Amber)
    - Background: `#FFF6E5`
    - Border: `#FFE2A8`
    - Accent/Text: `#FF9D00`
  - Hard (Red)
    - Background: `#FDEBEC`
    - Border: `#F6C2C6`
    - Accent/Text: `#E5484D`

Dark theme

- Model (Blue)
  - Background: `#0B1224`
  - Border: `#1E2B55`
  - Accent/Text: `#6D9BFF`

- Components (Orange)
  - Background: `#22150A`
  - Border: `#3C2613`
  - Accent/Text: `#FF9A4D`

- Complexity
  - Easy (Green)
    - Background: `#0E1A16`
    - Border: `#19392D`
    - Accent/Text: `#66E3B1`
  - Medium (Amber)
    - Background: `#1D1608`
    - Border: `#3C2C10`
    - Accent/Text: `#FFB454`
  - Hard (Red)
    - Background: `#261113`
    - Border: `#4C2125`
    - Accent/Text: `#FF7077`

Notes

- Text on colored backgrounds must meet AA contrast; prefer dark text on light badges and light text on dark backgrounds. Use accent color for icons/titles; body text should be near-neutral (`#0F172A` light, `#E2E8F0` dark).
- Keep color usage consistent: card header strip and type badges use Accent; container uses Background; outline uses Border.

## Tokens (CSS Variables)

Define design tokens for theming. These map to both CSS and any utility framework.

```css
:root {
  /* Model */
  --card-model-bg: #EDF3FF;
  --card-model-border: #C7D6FF;
  --card-model-accent: #2E6BFF;

  /* Components */
  --card-components-bg: #FFF3E7;
  --card-components-border: #FFD8B0;
  --card-components-accent: #FF7A1A;

  /* Complexity */
  --card-complexity-easy-bg: #E8F8F0;
  --card-complexity-easy-border: #BFEAD8;
  --card-complexity-easy-accent: #2ECF8D;

  --card-complexity-medium-bg: #FFF6E5;
  --card-complexity-medium-border: #FFE2A8;
  --card-complexity-medium-accent: #FF9D00;

  --card-complexity-hard-bg: #FDEBEC;
  --card-complexity-hard-border: #F6C2C6;
  --card-complexity-hard-accent: #E5484D;

  /* Neutrals */
  --ink: #0F172A;
  --ink-subtle: #334155;
  --surface: #FFFFFF;

  /* Font */
  --font-inter: "Inter", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    --card-model-bg: #0B1224;
    --card-model-border: #1E2B55;
    --card-model-accent: #6D9BFF;

    --card-components-bg: #22150A;
    --card-components-border: #3C2613;
    --card-components-accent: #FF9A4D;

    --card-complexity-easy-bg: #0E1A16;
    --card-complexity-easy-border: #19392D;
    --card-complexity-easy-accent: #66E3B1;

    --card-complexity-medium-bg: #1D1608;
    --card-complexity-medium-border: #3C2C10;
    --card-complexity-medium-accent: #FFB454;

    --card-complexity-hard-bg: #261113;
    --card-complexity-hard-border: #4C2125;
    --card-complexity-hard-accent: #FF7077;

    --ink: #E2E8F0;
    --ink-subtle: #94A3B8;
    --surface: #0B0F14;
  }
}

.card {
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--card-model-border);
  border-radius: 8px;
}

.card--model { border-color: var(--card-model-border); }
.card--model .card__header {
  background: var(--card-model-bg);
  color: var(--card-model-accent);
}

.card--components { border-color: var(--card-components-border); }
.card--components .card__header {
  background: var(--card-components-bg);
  color: var(--card-components-accent);
}

.card--complexity.easy { border-color: var(--card-complexity-easy-border); }
.card--complexity.easy .card__header {
  background: var(--card-complexity-easy-bg);
  color: var(--card-complexity-easy-accent);
}

.card--complexity.medium { border-color: var(--card-complexity-medium-border); }
.card--complexity.medium .card__header {
  background: var(--card-complexity-medium-bg);
  color: var(--card-complexity-medium-accent);
}

.card--complexity.hard { border-color: var(--card-complexity-hard-border); }
.card--complexity.hard .card__header {
  background: var(--card-complexity-hard-bg);
  color: var(--card-complexity-hard-accent);
}
```

## Tailwind Mapping (Optional)

Tailwind can read the CSS variables for colors and fonts.

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'card-model-accent': 'var(--card-model-accent)',
        'card-components-accent': 'var(--card-components-accent)',
        'card-complexity-easy-accent': 'var(--card-complexity-easy-accent)',
        'card-complexity-medium-accent': 'var(--card-complexity-medium-accent)',
        'card-complexity-hard-accent': 'var(--card-complexity-hard-accent)',
      },
    },
  },
};
```

Usage examples

- Set base font: `class="font-sans"`
- Metrics: `class="metrics tabular-nums"` or `class="[font-variant-numeric:tabular-nums]"`
- Arbitrary color from vars: `bg-[var(--surface)] text-[var(--ink)]`

## UI Copy (Consistent Labels)

- AI Model Card: “Model”, sublabel shows vendor:id and capability (e.g., “Chat”).
- Components Card: “Components” (sprint scope: “Prompt Pack”).
- Complexity Card: “Complexity” with chips: Easy, Medium, Hard.
- Actions: “Run Match”, “Pick Winner”, “Copy Share Link”, “Remix in Arena”, “Run as Notebook”.

## Accessibility & Motion

- Contrast: Ensure text on header backgrounds meets AA; use the Accent color only for titles/icons; keep body text on neutral surfaces.
- Focus: 2px visible ring; keyboard selectable chips for complexity.
- Motion: 120–160 ms lift on selection; header/badge color remains consistent across light/dark.

## YC‑Ready Look & Feel

- Layout: generous white space, 8–12px corner radius, 1–1.5px neutral borders.
- Typography: Inter/Geist, headings 600, body 400; tabular numerals for metrics.
- Elevation: subtle shadow at rest, stronger hover; keep borders visible (avoid shadow-only).
- Focus/Active: blue focus ring (`#2563EB`) with 1–2px offset; accessible on both themes.
- Playfulness: restrained color pops on card headers and micro-animations (150ms ease-out); avoid rainbow gradients.
- Compatibility: tokens map cleanly to Tailwind via CSS variables; keep system fonts for performance.

## Mapping to PRD

- AI Model ↔ Model Cards (Arena left column).
- Components ↔ Prompt Cards (right column in sprint; expandable to Evaluators/Datasets).
- Complexity ↔ Recipe complexity; also informs Notebook generation depth.
- Colors ↔ Badges for latency/tokens should remain neutral; do not reuse type colors for metric severity.

## Example Markup

```html
<article class="card card--model">
  <header class="card__header">AI Model</header>
  <div class="card__body">
    <h3>GPT-4o mini</h3>
    <code>openai:gpt-4o-mini</code>
  </div>
  <footer class="card__footer">
    <span class="badge">Chat</span>
  </footer>
</article>

<article class="card card--components">
  <header class="card__header">Components</header>
  <div class="card__body">
    <h3>Prompt Pack: Product Q&A</h3>
    <p>Three prompts for coverage.</p>
  </div>
</article>

<article class="card card--complexity medium">
  <header class="card__header">Complexity: Medium</header>
  <div class="card__body">
    <p>Includes basic setup + evaluation.</p>
  </div>
</article>
```

---
