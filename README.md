# Pocket — Expense Tracker

A responsive, mobile-friendly expense tracker with Google Sign-In and Google Sheets-backed cloud sync.

## Features
- Google Sign-In; no Pocket passwords are collected or stored.
- Per-Google-account expense records, synchronized across devices through a server-verified Apps Script API.
- Dashboard with period filters, total spend, transaction count, daily average, top category and recent activity.
- Add, edit and delete expenses with name, amount, category, payment method, date/time and optional notes.
- Monthly trend, category breakdown, yearly monthly comparison and payment-method charts.
- Search and filter transactions by month, category and payment method.
- Export and import a JSON backup.
- Responsive layout for mobile, tablet and desktop.
- One-time import prompt for older browser-local Pocket records when signing in with the matching Google email.

## Setup

Follow [SETUP.md](SETUP.md) to configure the Google OAuth Web Client ID, deploy the Apps Script web app, and add `POCKET_APPS_SCRIPT_URL` to Vercel.

The cloud backend is not ready until those three configuration steps are complete. The website's `/api/pocket` route returns a setup error until the Vercel environment variable is configured.

## Files
- `index.html` — application UI, charts and Google Sign-In client.
- `api/pocket.js` — same-origin Vercel serverless proxy to Apps Script.
- `apps-script/Code.gs` — Google ID-token verification and per-account Google Sheets storage.
- `SETUP.md` — setup and deployment instructions.

## Data and privacy
Google ID tokens are verified by Apps Script against the configured OAuth client ID. The server uses the verified Google account's immutable `sub` identifier to scope each account's records. The browser never chooses the owner ID. The spreadsheet is created in the Apps Script owner's Google Drive and should remain private.

This is a lightweight personal/small-use setup, not a bank-grade financial system. Apps Script and Sheets have quotas and usage limits. Do not store card numbers, bank credentials, OTPs, or other highly sensitive information.
