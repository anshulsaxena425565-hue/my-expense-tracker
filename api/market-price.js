export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const type = String(req.query.type || '');
  try {
    if (type === 'stock') {
      const symbol = String(req.query.symbol || '').trim().toUpperCase();
      if (!/^[A-Z0-9.^_-]{1,30}$/.test(symbol)) {
        return res.status(400).json({ error: 'Enter a valid stock ticker, e.g. RELIANCE.NS' });
      }
      const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' +
        encodeURIComponent(symbol) + '?range=1d&interval=1m';
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!response.ok) throw new Error('Stock quote provider returned ' + response.status);
      const json = await response.json();
      const result = json?.chart?.result?.[0];
      const price = result?.meta?.regularMarketPrice ??
        result?.indicators?.quote?.[0]?.close?.filter(Number.isFinite).slice(-1)[0];
      if (!(Number(price) > 0)) throw new Error('No current quote found for ' + symbol);
      return res.status(200).json({
        type: 'stock', symbol, price: Number(price),
        currency: result.meta.currency || 'INR',
        date: new Date((result.meta.regularMarketTime || Math.floor(Date.now()/1000))*1000).toISOString(),
        source: 'Yahoo Finance'
      });
    }

    if (type === 'mutual-fund') {
      const schemeCode = String(req.query.schemeCode || '').trim();
      if (!/^\\d{4,10}$/.test(schemeCode)) {
        return res.status(400).json({ error: 'Enter a valid AMFI mutual fund scheme code.' });
      }
      const response = await fetch('https://api.mfapi.in/mf/' + encodeURIComponent(schemeCode));
      if (!response.ok) throw new Error('Mutual fund NAV provider returned ' + response.status);
      const json = await response.json();
      const latest = json?.data?.[0];
      const price = Number(latest?.nav);
      if (!(price > 0)) throw new Error('No NAV found for scheme code ' + schemeCode);
      const parts = String(latest.date || '').split('-');
      const date = parts.length === 3 ? new Date(parts[2] + '-' + parts[1] + '-' + parts[0]).toISOString() : new Date().toISOString();
      return res.status(200).json({
        type: 'mutual-fund', schemeCode, schemeName: json.meta?.scheme_name || '',
        price, date, source: 'AMFI NAV via MFapi.in'
      });
    }

    return res.status(400).json({ error: 'Unsupported asset type.' });
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Unable to fetch market data right now.' });
  }
}