TITAN GOD 8.5 — DIRECT MT5 FEED

- No Netlify Functions: static deploy only, so deploy is fast.
- No API key required for core market scans.
- Direct CORS market feed from biquote MT5-backed REST data.
- XAU/USD uses live MT5 bid/ask midpoint and attempts a second independent spot cross-check.
- Full V8 five-timeframe scan: M5, M15, M30, H1, H4.
- Fail closed: stale/invalid/mismatched data => NO TRADE.
- Clears old service-worker caches so previous broken builds do not remain on iPhone.
