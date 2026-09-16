APEX SCALP GOD 7.3.3 — CALENDAR ROLLBACK

Purpose
-------
This build removes the 7.3.1/7.3.2 economic-calendar / News Risk Radar patch completely.
It is built from the original pre-calendar APEX 7.3.0 Fresh Entry source, with only the app/shell version bumped to 7.3.3 so browsers replace the 7.3.2 cached shell.

What is removed
---------------
- News Risk Radar panel
- Economic calendar fetches
- ForexFactory / TradingEconomics calendar fetches
- Relay fallbacks
- Calendar OFFLINE / UNKNOWN state
- Calendar-based ENTER vetoes

What is preserved
-----------------
- Fresh Entry / anti-chase trading logic from 7.3.0
- Existing general news/evidence engine that already existed before the calendar patch
- titan_journal_v2
- titan_state_v2
- titan_active_signals_v2
- apex_path_ledger_v4
- Existing proof/learning ledgers and IndexedDB stores

Important
---------
Deploy over the same site/origin and DO NOT clear browser/site data if you want the browser-stored learning history to remain available.
No thresholds were loosened merely to force more trades.
