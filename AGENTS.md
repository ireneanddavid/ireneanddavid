# Wedding Website — Project Rules

## Change and Push Workflow

1. Make code changes step by step so each change can be reviewed independently.
2. Show the user what changed and wait for explicit confirmation before continuing to the next meaningful change.
3. Never push commits or changes to a remote repository without the user's explicit confirmation immediately before the push.

## Git and PR Rules

Do not include Codex branding or attribution in commits or pull requests.

## Google Apps Script Safety

The Apps Script (`docs/google-apps-script.js`) must only interact with the RSVP spreadsheet it is attached to:

1. Only use `SpreadsheetApp.getActiveSpreadsheet()`; never open another spreadsheet by ID or URL.
2. Only use `appendRow()`; never delete, clear, or overwrite existing rows.
3. Never access other Google services such as Drive, Gmail, or Calendar.
4. Never install automatic triggers.
5. Make no external HTTP calls except to Google's reCAPTCHA verification endpoint.

## Chinese and English Typography

1. Never put Chinese text inside `font-esthetic` elements.
2. Use regular Josefin Sans for Chinese with `letter-spacing: 0.1rem`.
3. Put Chinese on a separate line below an English Sacramento heading using `<p>`, not `<span>`.
4. Use a Chinese font size approximately 60% of the English heading size.
5. Do not use a slash separator between English and Chinese.
6. Apply these rules to headings, labels, dropdown options, and placeholders throughout the site.
