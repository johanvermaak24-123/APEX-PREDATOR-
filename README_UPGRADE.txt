APEX SCALP GOD 7.0.0 — PRECISION TRADER HUD
================================================

PURPOSE
-------
7.0.0 simplifies the front of APEX without deleting the underlying engines.
The default view now answers the practical questions first:

1. ENTER BUY NOW / ENTER SELL NOW / WAIT — DO NOT ENTER
2. Current price
3. Exact entry when live authority exists
4. Hard exit / invalidation
5. Take-profit / exit level
6. HOLD / EXIT management after the user confirms "I ENTERED THIS TRADE"

DEEP EVIDENCE IS STILL THERE
----------------------------
Fortress, Hydra, proof statistics, news, timing traps, market-flow proxies,
learning, journals, causal maps and the rest of the evidence stack remain in
the DOM and continue running. They are hidden by default in Precision View.
Tap SHOW DEEP EVIDENCE to expose them.

TRADE MANAGEMENT
----------------
A live ENTER command does not automatically assume the user actually placed a
trade. If filled, tap I ENTERED THIS TRADE. APEX stores the entry plan locally.
On future fresh scans the top panel can show:
- HOLD
- EXIT / TAKE PROFIT NOW — TARGET HIT
- EXIT NOW — HARD INVALIDATION HIT
- EXIT NOW — OPPOSITE LIVE AUTHORITY
- SWITCH TO <symbol> AND SCAN TO MANAGE

Tap TRADE CLOSED after closing the position.

IMPORTANT ACCURACY NOTE
-----------------------
No market system can honestly guarantee or engineer a near-100% future win
rate. 7.0.0 therefore optimizes the user experience for selectivity: WAIT is
the default and ENTER is allowed only when the existing proof, data, broker-
cost, Fortress, Hydra and geometry gates all clear. The million-case audit is
a software invariant stress test, not one million historical or live trades.

MEMORY / UPGRADE SAFETY
-----------------------
Existing evidence, journal, signal-lock, path-ledger and Memory Vault storage
keys are preserved. Deploying over the same origin should retain LocalStorage.
Do not clear browser/site data during the upgrade.

AUDIT
-----
- JavaScript syntax: PASS
- 332 unique HTML IDs: PASS
- 288 literal JS DOM references, 0 missing IDs: PASS
- Inline JavaScript matches app.js: PASS
- 1,000,000 deterministic randomized execution + management scenarios: PASS
- ENTER can only occur with complete final execution authority: PASS
- Non-live candidate cannot leak entry/SL/TP as live instruction: PASS
- Open-trade manager never emits a new ENTER: PASS
- Target, invalidation and opposite live authority force EXIT: PASS

FILES
-----
index.html              Main single-page app
app.js                  Exact extracted inline JavaScript for audit/review
AUDIT_1M.js              Reproducible deterministic stress test
AUDIT_1M_REPORT.json     Audit result
TEST_REPORT.txt          Package checks
manifest.webmanifest     PWA manifest
sw.js                    Service worker with new 7.0 cache namespace
