# Wedding Website — Project Rules

## Change and Push Workflow

1. Make code changes step by step so each change can be reviewed independently.
2. Show the user what changed and wait for explicit confirmation before continuing to the next meaningful change.
3. Never push commits or changes to a remote repository without the user's explicit confirmation immediately before the push.
4. Treat the user's standalone command `cp` as explicit confirmation to commit all currently reviewed changes and push the resulting commit to the configured remote branch.

## Visual Regression Review

1. After every meaningful visual, typography, layout, interaction, or content change, review the affected area in the local browser at the 390 × 844 mobile viewport before reporting completion.
2. Review both the changed component and its transitions to the sections immediately before and after it. Interactive components must be checked in every state affected by the change, including collapsed, expanded, validation, hover/focus, and post-animation states where applicable.
3. Preserve the `Good to Know → Thank-you note → Behind the Scenes` background transition as a design invariant:
   - The Good to Know background image must follow the full rendered section height, including expanded FAQ content.
   - The image must fade out gradually behind the Thank-you note.
   - The Behind the Scenes image must fade in gradually, with no hard horizontal seam or plain-background gap between the two sections.
   - Never constrain `.wedding-guide-background` to a viewport-only height while the section content can expand.
4. Any change near Good to Know, the Thank-you note, Footer, accordion spacing, section height, background images, or mobile navigation requires an explicit re-check of this three-part transition before completion.

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

This is a deliberate design decision. Do not replace visible English couple or personal names, or the Hero announcement, with Display Serif or Sans-serif during future typography reviews. Chinese personal names and short emotional display lines use Zen Maru Gothic for a softer rounded tone.

The Hero announcement and its Chinese line use the shared bilingual section-title tokens so they remain visually consistent with the other emotional titles.

### 1. Display Serif

Display Serif is not currently assigned to visible couple or personal names. Do not use it for `Minchi`, `David`, or `Minchi & David` without first changing this specification.

Use Cormorant Garamond as the Display Serif only for the expanded `How We Met` and `How We Fell in Love` chapter titles within Our Journey. Their collapsed accordion titles remain Sans-serif.

Do not use the Display Serif for other section titles, dates, times, venues, body text, buttons, forms, or navigation.

### 2. Section Script — Emotional Statements and Titles

Use the Section Script for:

- Couple name on the invitation Cover
- Couple name in the desktop sidebar
- Personal names in Meet the Couple
- Couple signatures in RSVP modals
- Personal names within footer credits
- Hero announcement: `We're getting married`
- `Wedding Day`
- `RSVP`
- `Our Story`
- `Our Journey`
- `Meet the Couple`
- `Good to Know`
- `Behind the Scenes`

Within `Good to Know`, only the English section title uses the Section Script. FAQ questions, answers, links, and map text remain Sans-serif.

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

### 4. Chinese Typography

Chinese informational and interface text must use this dedicated Chinese sans-serif stack:

```css
--font-sans-zh: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'Heiti TC', sans-serif;
```

Chinese personal names (`蔡旻淇`, `郭大為`, `旻淇`, and `大為`) and short emotional display lines are the exceptions. Emotional display lines include the Hero Chinese announcement, Chinese section subtitles, Cover invitation copy, and footer closing message. Load `Zen Maru Gothic` explicitly and use this dedicated rounded stack:

```css
--font-soft-zh: 'Zen Maru Gothic Local', 'Zen Maru Gothic', 'Noto Sans TC', 'PingFang TC', sans-serif;
```

Load `Noto Sans TC` explicitly. Load the local subset `assets/fonts/ZenMaruGothic-SoftChinese.woff2` as `Zen Maru Gothic Local`, with the Google-hosted `Zen Maru Gothic` as a fallback for missing emotional display glyphs. Use `var(--font-soft-zh)` only for those roles and `var(--font-sans-zh)` for informational Chinese, body copy, forms, FAQ content, dates, times, and venues. Within Our Journey, the Chinese chapter titles and expanded narrative body both use `var(--font-sans-zh)`; only the expanded English chapter title uses Display Serif. Never place Chinese inside a Section Script or Brand Font element.

Chinese is the primary language in bilingual informational and UI pairs. Place or style Chinese as the dominant line; English is secondary, smaller, lighter, and must not compete. Approved English Section Script titles and visible personal names remain romantic display exceptions rather than informational hierarchy.

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

- Cover: Section Script couple name → smaller muted rounded Chinese names → portrait → subtle divider → invitation copy in Sans-serif → button in Sans-serif
- Hero: Section Script announcement → Chinese Sans-serif announcement → Section Script couple name → rounded Chinese names → Sans-serif date and venue
- Wedding Day: Section Script → Chinese subtitle → date → weekday → schedule → venue → actions; only the section title uses script
- RSVP: Section Script → invitation sentence → form → buttons → helper text; only the section title uses script
- Good to Know: Section Script → Chinese subtitle → compact FAQ questions and answers; only the section title uses script

### Consistency Rule

Before styling any text, classify it:

- Visible English couple name, personal name, or couple signature → Section Script
- Emotional statement or approved emotional title → Section Script
- Informational heading, body copy, date, venue, FAQ, button, or navigation → Sans-serif
- Chinese personal name or short emotional display line → `var(--font-soft-zh)` plus its shared semantic size token
- Other Chinese → `var(--font-sans-zh)` plus the shared Chinese semantic token for its role
