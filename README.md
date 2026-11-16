# Pocket — Expense Tracker

A standalone, responsive expense tracker built for this repository.

## Features
- Multiple local profiles with separate expense lists and sign-in flows.
- Dashboard with period filters, total spend, transaction count, daily average, top category and recent activity.
- Add, edit and delete expenses with name, amount, category, payment method, date/time and optional notes.
- Date and time default to the current local date/time; entries can be backdated or corrected.
- Monthly trend, category breakdown, yearly monthly comparison and payment-method charts.
- Search and filter transactions by month, category and payment method.
- Export and import a JSON backup for a user's records.
- Responsive layout for mobile, tablet and desktop.

## Run
Open `index.html` in a modern browser, or enable GitHub Pages for this repository (Settings → Pages → Deploy from a branch → `main` → `/ (root)`).

Chart.js and Google Fonts are loaded from CDNs, so charts and custom typography require an internet connection. The core expense-entry and storage flows work in the browser.

## Important: current storage and multi-user model
This starter version uses browser `localStorage` for account profiles and per-account expense records, with the active session in `sessionStorage`. It supports multiple separate profiles **on the same browser/device**. It is not yet a shared, cross-device multi-user service, and the demo password handling is not suitable for production.

Before making this public for real users, replace the local account layer with a backend (for example, a database plus managed authentication), enforce per-user ownership/authorization server-side, store password credentials only through secure authentication, and use HTTPS. Do not use this browser-only demo for sensitive financial information.

## Files
- `index.html` — self-contained application UI, styles, charts and client-side logic.
