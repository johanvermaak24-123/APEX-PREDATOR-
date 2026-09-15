APEX SCALP GOD 6.7.1 — MEASUREMENT TRUTH HOTFIX

Purpose
- Repairs the measurement/evidence defects identified in the independent 6.7 teardown.
- This is not a profitability certificate and it does not guarantee future market direction.

Key changes
1. M5 setup logic uses closed bars; live tick is separate.
2. Outcome resolution uses M1 bars beginning only after the live entry timestamp.
3. A bar that touches both TP and SL is marked AMBIGUOUS and excluded from evidence.
4. Evidence is recorded only for the same pre-authorized class that FIRE would later use.
5. FIRE cannot use zero-history bypasses: minimum 20 exact resolved episodes.
6. FIRE evidence uses a bootstrap lower bound on net R expectancy, chronological holdout expectancy and an FDR gate across mature buckets.
7. Market state must explicitly be OPEN; missing/unknown state or quote-age metadata blocks the feed.
8. Zero/invalid spread is rejected.
9. FIRE requires user-supplied broker spread verification; feed spread alone is PROOF ONLY.
10. Commission/slippage buffers are included in execution cost geometry.
11. Truth ledger uses IndexedDB with per-bucket retention plus JSON export.
12. Daily modeled loss stop, consecutive-loss stop and max FIRE-authorities/day circuit breakers added.
13. Lot authority remains capped at normal risk. APEX never recommends GO BIG or all-in sizing.
14. Service worker and manifest versioned to 6.7.1 to force cache replacement.

Important setup
- Enter your broker's current spread in PRICE UNITS for the selected symbol.
- Enter commission per 1.00 lot if applicable, plus tick size/tick value for exact lot-risk math.
- Broker cost values are treated as stale after 24 hours and FIRE is withheld until refreshed.

Testing terminology
- REGRESSION_1M_6_7_1.json is a SOFTWARE INVARIANT REGRESSION TEST only.
- It does not test whether the strategy is profitable.
- Strategy validation still requires reproducible historical replay / forward paper results using the exact entry, TP, SL and costs.
