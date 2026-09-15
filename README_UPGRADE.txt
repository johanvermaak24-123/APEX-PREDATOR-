APEX SCALP GOD 6.9.0 — EXECUTION COMMAND
=========================================

PURPOSE
6.9.0 fixes the ambiguity visible in 6.8.2 where a research trigger such as
"TRIGGERED — PROOF ONLY — COUNTER BUY SCALP" could visually look like a trade
instruction even while Execution Authority said NO LIVE ENTRY.

THE RULE NOW
Only one layer is allowed to issue a live trade instruction:

  ENTER BUY NOW
  ENTER SELL NOW
  WAIT — NO LIVE TRADE

Everything else is research/context and cannot override the final command.

WHAT CHANGED
1. NEW APEX EXECUTION COMMAND CARD
   - Placed near the top of WORLD BRAIN.
   - ENTER is shown only after the complete final authority stack passes.
   - While WAIT, live entry / invalidation / target fields are hidden as "—".

2. BEST NOW IS FAIL-CLOSED
   - New FINAL BASKET COMMAND summary.
   - If no symbol has complete live authority it says:
       NO LIVE TRADE RIGHT NOW
   - Every non-live candidate begins with WAIT, including PROOF, RESEARCH ARMED
     and WATCH states.
   - A scalp FIRE/trigger state alone can no longer create an ENTER label.

3. SINGLE SOURCE OF TRUTH
   - executionCommandFromParts() is now the final arbiter used by the main
     execution card and BEST NOW ranking.
   - Required for ENTER: proof promotion, verified execution geometry/cost,
     Fortress pass, Hydra pass, valid direction and complete live price geometry.

4. SUBORDINATE PANELS CANNOT OVERRIDE FINAL AUTHORITY
   - SCALP COMMAND CENTER cannot display green ENTER unless the final arbiter
     also authorizes it.
   - Micro-Harvest / lot sizing cannot issue a live lot when Fortress/Hydra/final
     authority has not cleared.
   - Candidate promotion wording was changed from "LIVE ENTRY authorized" to
     "FINAL GATE CHECK" until the final execution stack passes.

5. STALE LIVE COMMANDS AUTO-EXPIRE
   - A live ENTER command expires after the 120-second freshness window in manual
     mode and becomes WAIT — RESCAN REQUIRED.
   - Entry/SL/TP fields are cleared on expiry.
   - Returning to the app after backgrounding also performs the freshness check.
   - Starting a new market scan immediately suspends the previous live command.

6. BEST NOW SCAN SAFETY
   - Starting a basket scan immediately suspends the previous basket authority.
   - Failed basket scans fail closed and cannot leave a stale ENTER on screen.
   - BEST NOW no longer mutates the normal live-scan duplicate/race guard while
     comparing different symbols.

MEMORY / PROOF PRESERVATION
No reset was introduced.
The existing storage/proof architecture remains on the same keys, including:
- apex_memory_vault_v4_0
- apex_path_ledger_v4
- apex_6_8_forward_proof_epoch
- titan_active_signals_v2
- titan_world_brain_memory

The 6.8 forward proof epoch and 6.8_FORWARD proof rows are deliberately retained.
Deploying 6.9.0 over the SAME GitHub Pages origin preserves browser LocalStorage /
IndexedDB data. Do not delete site data if you want to retain the learned memory.

DEPLOY OVER THE CURRENT GITHUB PAGES BUILD
1. Keep the same repository and the same GitHub Pages URL.
2. Replace index.html, manifest.webmanifest, sw.js and apple-touch-icon.png.
3. app.js is included as the exact readable copy of the JavaScript embedded in
   index.html; index.html is self-contained and does not depend on app.js.
4. Commit/push and allow GitHub Pages to redeploy.
5. Re-open the same site. The 6.9 service-worker cache name forces old app-cache
   cleanup without changing the browser storage keys that contain APEX memory.

AUDIT
See TEST_REPORT.txt and AUDIT_1M_REPORT.json.
AUDIT_1M.js extracts the exact final arbiter/ranking functions from app.js and
runs a deterministic one-million-scenario property test.

IMPORTANT
The audit verifies code/decision invariants. It is not one million live market
trades and it does not prove future profitability or market-direction accuracy.
