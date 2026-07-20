# Wedding Website — Project Rules

## Change and Push Workflow

1. Make code changes step by step so each change can be reviewed independently.
2. Show the user what changed and wait for explicit confirmation before continuing to the next meaningful change.
3. Never push commits or changes to a remote repository without the user's explicit confirmation immediately before the push.
4. Treat the user's standalone command `cp` as explicit confirmation to commit all currently reviewed changes and push the resulting commit to the configured remote branch.

## Git and PR Rules

Do not include Codex branding or attribution in commits or pull requests.

## Google Apps Script Safety

The Apps Script (`docs/google-apps-script.js`) must only interact with the RSVP spreadsheet it is attached to:

1. Only use `SpreadsheetApp.getActiveSpreadsheet()`; never open another spreadsheet by ID or URL.
2. Only use `appendRow()`; never delete, clear, or overwrite existing rows.
3. Never access other Google services such as Drive, Gmail, or Calendar.
4. Never install automatic triggers.
5. Make no external HTTP calls except to Google's reCAPTCHA verification endpoint.

## Canonical Typography System

Typography is determined by semantic role, not by HTML heading level. Emotional statements may use a different role from informational headings. Do not introduce another font role without updating this specification.

### Design Principle

The names `Minchi`, `David`, and `Minchi & David`, wherever they appear visibly in the interface, and the Hero announcement `We're getting married` are intentionally handwritten. Together they create a romantic invitation feeling.

This is a deliberate design decision. Do not replace visible English couple or personal names, or the Hero announcement, with Display Serif or Sans-serif during future typography reviews. Chinese names remain Chinese Sans-serif.

The Hero announcement and its Chinese line use the shared bilingual section-title tokens so they remain visually consistent with the other emotional titles.

### 1. Display Serif

Display Serif is not currently assigned to visible couple or personal names. Do not use it for `Minchi`, `David`, or `Minchi & David` without first changing this specification.

Do not use the Display Serif for section titles, dates, times, venues, body text, buttons, forms, or navigation.

### 2. Section Script — Emotional Statements and Titles

Use the Section Script for:

- Couple name on the invitation Cover
- Couple name in the desktop sidebar and Hero
- Personal names in Meet the Couple
- Couple signatures in RSVP modals
- Personal names within footer credits; surrounding role descriptions remain Sans-serif
- Hero announcement: `We're getting married`
- `Wedding Day`
- `RSVP`
- `Our Story`
- `Meet the Couple`
- `A Few Things to Know`
- `Behind the Scenes`

Within `A Few Things to Know`, only the English section title uses the Section Script. FAQ questions, answers, links, and map text remain Sans-serif.

Do not use the Section Script for information blocks, descriptions, modal copy other than couple signatures, buttons, or navigation.

### 3. Sans-serif — Information and UI

Use the primary Sans-serif for:

- Informational headings
- Body text
- Dates, times, countdowns, schedules, and venues
- FAQ content
- Maps links, buttons, and navigation
- RSVP fields, options, descriptions, and helper text
- Modal titles and copy

Sans-serif should account for more than 90% of the website typography.

### 4. Chinese Sans-serif

All Chinese text must use this dedicated Chinese sans-serif stack:

```css
--font-sans-zh: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'Heiti TC', sans-serif;
```

Load `Noto Sans TC` explicitly and use `var(--font-sans-zh)` for Chinese text. Never place Chinese inside a Section Script or Brand Font element.

Do not apply a global `60%` size ratio or universal `0.1rem` letter-spacing to Chinese. Text with the same semantic role must consume the same shared Chinese typography token, such as:

- Section subtitle
- Field label
- Option text
- Venue information
- Body text
- Helper text
- Button text

Section-heading Chinese must remain on its own line below the English heading. Compact UI components are the exception: field labels, options, helper text, and placeholders may keep English and Chinese together when the component specification calls for a compact bilingual label. Do not use slash separators between languages.

All bilingual section headings share the same English title and Chinese subtitle size tokens. On mobile, the Section Script title uses `clamp(38px, 10vw, 40px)` and the Chinese subtitle uses `16px`. `Wedding Day / 婚禮資訊` is the visual reference; do not create section-specific title sizes unless the specification explicitly requires one.

### Required Hierarchy

- Cover: Section Script couple name → Chinese Sans-serif names → date in Sans-serif → button in Sans-serif
- Hero: Section Script announcement → Chinese Sans-serif announcement → Section Script couple name → Chinese Sans-serif names → Sans-serif date and venue
- Wedding Day: Section Script → Chinese subtitle → date → weekday → schedule → venue → actions; only the section title uses script
- RSVP: Section Script → invitation sentence → form → buttons → helper text; only the section title uses script
- A Few Things to Know: Section Script → Chinese subtitle → compact FAQ questions and answers; only the section title uses script

### Consistency Rule

Before styling any text, classify it:

- Visible English couple name, personal name, or couple signature → Section Script
- Emotional statement or approved emotional title → Section Script
- Informational heading, body copy, date, venue, FAQ, button, or navigation → Sans-serif
- Chinese → `var(--font-sans-zh)` plus the shared Chinese semantic token for its role
