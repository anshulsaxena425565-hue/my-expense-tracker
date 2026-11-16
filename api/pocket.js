// Same-origin proxy for the Google Apps Script web app.
// The Apps Script verifies the Google ID token and enforces per-account ownership.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const scriptUrl = process.env.POCKET_APPS_SCRIPT_URL;
  if (!scriptUrl || !/^https:\/\/script\.google\.com\/macros\/s\//.test(scriptUrl)) {
    return res.status(503).json({ ok: false, error: 'Pocket cloud storage is not configured yet.' });
  }

  try {
    let body;
    if (req.body && typeof req.body === 'object') {
      body = JSON.stringify(req.body);
    } else {
      const chunks = [];
      let total = 0;
      for await (const chunk of req) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        total += buffer.length;
        if (total > 2 * 1024 * 1024) {
          return res.status(413).json({ ok: false, error: 'Request is too large.' });
        }
        chunks.push(buffer);
      }
      body = Buffer.concat(chunks).toString('utf8');
    }
    const parsed = JSON.parse(body || '{}');
    if (!parsed.credential || !['load', 'save'].includes(parsed.action)) {
      return res.status(400).json({ ok: false, error: 'Invalid request.' });
    }

    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    const text = await upstream.text();
    let result;
    try { result = JSON.parse(text); }
    catch { throw new Error('The Google Sheets service returned an unexpected response.'); }

    return res.status(upstream.ok && result.ok ? 200 : 401).json(result);
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: error && error.message ? error.message : 'Could not reach cloud storage.'
    });
  }
};
