APEX SCALP GOD 7.3.2 — CALENDAR RELAY HARDENING

This patch fixes the mobile/browser case where the News Risk Radar shows CALENDAR OFFLINE even though the public calendar is online.

What changed
- Keeps every existing 7.3/7.3.1 learning/storage key.
- Adds a PRE-7.3.2 safety snapshot before doing anything else.
- Tries ForexFactory CDN, ForexFactory legacy host, and TradingEconomics directly.
- If browser CORS/network policy blocks those, tries three public CORS relays for the same public ForexFactory weekly JSON.
- Relay requests contain only the public calendar URL; no APEX memory, account data, journal, symbol history, or API keys are sent.
- Validates minimum event count, active-week timestamps, and USD event presence before trusting a feed.
- Keeps fail-closed behavior if every route fails.
- 45 minute local cache remains in place to reduce requests.

Important
Deploy over the SAME GitHub Pages site/origin and DO NOT clear browser/site data if you want existing learning to remain available.
