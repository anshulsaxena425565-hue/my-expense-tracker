# Pocket — Expense Tracker

A responsive expense tracker with Appwrite authentication and cloud-synced expense records.

## Features
- Appwrite email/password authentication (passwords are managed by Appwrite, never stored in Pocket's own data).
- Per-user expense records with row-level permissions in Appwrite TablesDB.
- Dashboard, monthly/yearly analytics, charts, category and payment-method breakdowns.
- Add, edit and delete expenses with name, amount, category, payment method, date/time and notes.
- Search and filter transactions.
- JSON export/import and one-time migration from the previous browser-local Pocket version.
- Responsive mobile layout.

## Appwrite setup

The Appwrite project, database and expenses table have been created. Follow [SETUP.md](SETUP.md) to register the production web hostname as an Appwrite platform, then test sign-up/sign-in.

## Project resources
- Appwrite project ID: `6afb36e60028d5bbc86e`
- Endpoint: `https://sgp.cloud.appwrite.io/v1`
- Database ID: `pocket`
- Table ID: `expenses`

## Security
The expenses table has row security enabled. Table access is limited to authenticated users, and each expense row grants read/update/delete permissions only to its owner. The application filters records by the authenticated Appwrite user ID. Do not store bank credentials, card numbers, OTPs or other highly sensitive information.
