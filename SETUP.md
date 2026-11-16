# Pocket cloud setup (Google Sign-In + Google Sheets)

This version removes local password storage and syncs expense records through a Google Apps Script web app. Google verifies the account; the server uses the verified Google account ID (not a browser-supplied email) to keep each user's rows separate.

## 1. Create a Google OAuth Web Client ID

1. Open Google Cloud Console and create/select a project.
2. Configure the OAuth consent screen. While testing, add your Google account under Test users.
3. Create an OAuth Client ID with application type **Web application**.
4. Add this authorized JavaScript origin:
   - `https://my-expense-tracker-amber.vercel.app`
   - Add your own custom domain too, if you later connect one.
5. Copy the Client ID. No redirect URI is needed for the Google Identity Services button used here.

In `index.html`, replace:
`YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com`
with the Client ID you created.

## 2. Deploy the Google Sheets API

1. Open [Google Apps Script](https://script.google.com/) and create a new project.
2. Copy all contents of `apps-script/Code.gs` from this repository into the Apps Script editor, replacing the starter code.
3. In **Project Settings → Script Properties**, add:
   - Property: `OAUTH_CLIENT_ID`
   - Value: the same Google OAuth Web Client ID from step 1.
4. Save the project.
5. Select **Deploy → New deployment → Web app**.
6. Set **Execute as** to **Me**.
7. Set **Who has access** to **Anyone**, then deploy and authorize the requested Google permissions.
8. Copy the Web app URL. It should look like `https://script.google.com/macros/s/.../exec`.

The spreadsheet is created automatically in the Google account that owns the Apps Script project the first time someone signs in. Keep that spreadsheet private. Do not share it publicly.

## 3. Connect the Apps Script URL to Vercel

1. Open the Vercel project **my-expense-tracker**.
2. Go to **Settings → Environment Variables**.
3. Add:
   - Name: `POCKET_APPS_SCRIPT_URL`
   - Value: the Apps Script Web app URL ending in `/exec`
   - Environments: Production, Preview (and Development if you use it).
4. Save, then redeploy the latest production deployment so the function receives the variable.

## 4. Deploy the code

Commit/push the updated `index.html`, `api/pocket.js`, and `apps-script/Code.gs` to the production branch. Vercel will deploy the website and the same-origin `/api/pocket` proxy automatically.

## 5. First sign-in and data migration

1. Open the Pocket website and choose **Continue with Google**.
2. The first successful request creates the private Google Sheet.
3. If the same browser contains older Pocket records for the same Google email, Pocket offers a one-time import. Accept to copy those expenses to cloud storage.
4. Add a small test expense, then open Pocket on another device and sign in with the same Google account to confirm it appears.

## Important notes

- The Google OAuth Client ID is public by design; never put a Google client secret in the website.
- The Apps Script URL is not a password. Every API operation still requires a Google ID token whose audience is checked server-side.
- The Apps Script project runs as its owner and stores all users' expense rows in one private spreadsheet, separated by Google's immutable account ID.
- This is a lightweight personal/small-use setup, not a bank-grade financial system. Google Apps Script and Sheets have quotas and usage limits. Do not store card numbers, bank credentials, OTPs, or other highly sensitive information.
- Google OAuth consent-screen testing mode may restrict sign-in to the test users you add. Public use may require additional OAuth consent-screen configuration and verification.
