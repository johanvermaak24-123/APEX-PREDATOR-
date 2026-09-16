APEX SCALP GOD 7.3.2 — CURRENT UPGRADE NOTE

7.3.2 keeps the full 7.3 Fresh Entry / anti-chase engine and the 7.3.1 News Risk Radar, but hardens the calendar feed for mobile browsers.

Calendar path: ForexFactory CDN -> ForexFactory legacy host -> TradingEconomics -> public CORS relays. Every accepted payload is schema/freshness checked. If every route fails, entry remains fail-closed.

Learning compatibility: existing titan_journal_v2, titan_state_v2, titan_active_signals_v2 and apex_path_ledger_v4 keys are preserved. A PRE-7.3.2 safety snapshot is added; older 7.3.1 snapshots remain recoverable.
