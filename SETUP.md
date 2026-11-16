# Pocket — Appwrite setup

Pocket now uses Appwrite for authentication and cloud storage. The Google Sheets/Apps Script integration is no longer used.

## Already configured
- Appwrite project: `Expense Tracker`
- Project ID: `6afb36e60028d5bbc86e`
- Region endpoint: `https://sgp.cloud.appwrite.io/v1`
- Database: `pocket` (Pocket Expense Data)
- Table: `expenses`
- Row security: enabled
- Table permissions: authenticated users can read/list and create rows
- Row permissions: each row is readable, editable and deletable only by its owner
- Columns: `userId`, `title`, `amount`, `category`, `method`, `spentAt`, `notes`

## One manual Appwrite step required

The connected Appwrite account currently does not have the `platforms.write` permission, so I could not register the Vercel hostname through the Appwrite connection.

1. Open the Appwrite Console and select the **Expense Tracker** project.
2. Open **Settings → Platforms** (sometimes shown under Integrations).
3. Choose **Add platform → Web**.
4. Name: `Pocket Web`
5. Hostname: `my-expense-tracker-amber.vercel.app`
6. Save.

If you use a custom domain later, add that hostname as another Web platform too.

## Test
1. Open the Pocket production website.
2. Create a test account with an email and a password of at least 8 characters.
3. Add a small test expense.
4. Refresh the page and confirm it remains.
5. Open Pocket in another browser/device, sign in with the same account, and confirm the expense appears.
6. Create a second test account and confirm it cannot see the first account's expense.

The app uses the Appwrite Web SDK directly. No API key or server secret is placed in the browser. Appwrite stores the authentication credentials and enforces row permissions.

## Existing local data
If the browser has expenses from the older Pocket prototype under the same email address, the first sign-in offers a one-time import. Keep a JSON export as a backup before migrating.

## Privacy note
Pocket is a personal expense tracker, not a bank-grade financial product. Avoid storing card numbers, bank credentials, OTPs, account numbers or other highly sensitive financial data.
