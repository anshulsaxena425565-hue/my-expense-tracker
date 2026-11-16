/**
 * Pocket — Google Sheets storage API
 *
 * Deploy as a Web App: Execute as "Me", access "Anyone".
 * Set Script Properties:
 *   OAUTH_CLIENT_ID = your Google OAuth Web client ID
 *   (SHEET_ID is created automatically on first request)
 *
 * Every request must include a Google Identity Services ID token.
 * The token is verified server-side; the Google "sub" claim is the
 * ownership key. Never trust an email/user ID supplied by the browser.
 */

const HEADERS = ['ownerSub', 'expenseId', 'name', 'amount', 'category', 'method', 'date', 'notes', 'updatedAt'];

function doGet() {
  return json_({ ok: true, service: 'Pocket Sheets API', message: 'Use POST with a Google ID token.' });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const identity = verifyGoogleToken_(body.credential);
    const action = String(body.action || '');

    if (action === 'load') {
      return json_({ ok: true, expenses: loadExpenses_(identity.sub) });
    }
    if (action === 'save') {
      if (!Array.isArray(body.expenses) || body.expenses.length > 10000) {
        throw new Error('Invalid expense list.');
      }
      const clean = body.expenses.map(validateExpense_);
      saveExpenses_(identity.sub, clean);
      return json_({ ok: true, count: clean.length });
    }
    throw new Error('Unsupported action.');
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || 'Request failed') });
  }
}

function verifyGoogleToken_(token) {
  if (!token || typeof token !== 'string' || token.length > 10000) {
    throw new Error('Please sign in with Google again.');
  }
  const clientId = PropertiesService.getScriptProperties().getProperty('OAUTH_CLIENT_ID');
  if (!clientId) throw new Error('Server setup incomplete: OAUTH_CLIENT_ID is missing.');

  const response = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
    { muteHttpExceptions: true }
  );
  if (response.getResponseCode() !== 200) throw new Error('Google sign-in expired. Please sign in again.');

  const claims = JSON.parse(response.getContentText());
  const now = Math.floor(Date.now() / 1000);
  if (claims.aud !== clientId || !claims.sub || Number(claims.exp) <= now ||
      !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss) ||
      claims.email_verified !== 'true') {
    throw new Error('Google identity could not be verified. Please sign in again.');
  }
  return { sub: claims.sub };
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID');
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('Pocket Expense Records');
    props.setProperty('SHEET_ID', ss.getId());
  }
  let sheet = ss.getSheetByName('Expenses');
  if (!sheet) sheet = ss.insertSheet('Expenses');
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function loadExpenses_(ownerSub) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  return values.slice(1)
    .filter(row => String(row[0]) === ownerSub)
    .map(row => ({
      id: String(row[1]),
      name: String(row[2]),
      amount: Number(row[3]),
      category: String(row[4]),
      method: String(row[5]),
      date: new Date(row[6]).toISOString(),
      notes: String(row[7] || '')
    }));
}

function validateExpense_(x) {
  if (!x || typeof x !== 'object') throw new Error('Invalid expense record.');
  const id = String(x.id || '').slice(0, 100);
  const name = String(x.name || '').trim().slice(0, 80);
  const amount = Number(x.amount);
  const category = String(x.category || '').slice(0, 60);
  const method = String(x.method || '').slice(0, 40);
  const date = new Date(x.date);
  const notes = String(x.notes || '').slice(0, 250);
  if (!id || !name || !Number.isFinite(amount) || amount <= 0 ||
      !category || !method || isNaN(date.getTime())) {
    throw new Error('An expense contains invalid fields.');
  }
  return { id, name, amount, category, method, date: date.toISOString(), notes };
}

function saveExpenses_(ownerSub, expenses) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();
    const kept = values.length > 1
      ? values.slice(1).filter(row => String(row[0]) !== ownerSub)
      : [];
    const timestamp = new Date();
    const added = expenses.map(x => [
      ownerSub, x.id, x.name, x.amount, x.category, x.method, x.date, x.notes, timestamp
    ]);
    const all = [HEADERS].concat(kept, added);
    sheet.clearContents();
    sheet.getRange(1, 1, all.length, HEADERS.length).setValues(all);
    sheet.setFrozenRows(1);
  } finally {
    lock.releaseLock();
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
