APEX SCALP GOD 7.1.0 — SIMPLE ACTION HUD
==========================================

WHAT CHANGED
------------
The front screen is deliberately simple. A normal user should not need to understand
Fortress, Hydra, proof gates, execution vetoes, FDR, bootstrap statistics or other
research terminology to use the scanner.

TRADE NOW now speaks only in actions:
  • ENTER BUY NOW
  • ENTER SELL NOW
  • WAIT — DO NOT ENTER
  • HOLD
  • EXIT NOW
  • TAKE PROFIT NOW

When APEX says ENTER it shows:
  • current price
  • entry price
  • stop loss / exit-if-wrong
  • take profit / exit

When APEX says WAIT, entry/SL/TP remain blank so a research candidate cannot look
like an authorized trade.

FIND A TRADE now scans the basket and returns one simple command. If no market has
full live authority it says DO NOTHING — NO TRADE READY. The candidate ranking is
hidden in Simple Mode and is available only under SHOW DETAILS.

The SHOW DETAILS button exposes the research panels for advanced review. Version
7.1 uses a new display-preference key so Simple Mode starts ON after upgrading even
if an older version had deep evidence open.

WHAT DID NOT CHANGE
-------------------
Existing learning and memory storage is preserved. The journal, state, signal locks,
path ledger, micro tape, proof epoch, historical outcomes and browser Memory Vault
use the same keys as 7.0 / 6.8. Do not clear browser/site data when deploying.

The underlying fail-closed decision logic remains strict. This upgrade does NOT
weaken proof, cost, data-integrity, market-state or geometry checks merely to produce
more ENTER signals.

AUDIT
-----
AUDIT_1M.js executes the exact source decision functions across 1,000,000 seeded
randomized scenarios. It checks that ENTER can appear only with complete authority,
WAIT never leaks entry/SL/TP levels, BEST NOW cannot invent an ENTER, and open-trade
management emits HOLD/EXIT/SWITCH only. It also verifies that front-facing WAIT
reasons do not leak internal jargon such as VETO, HYDRA, FORTRESS, PROOF or FDR.

This is a software/invariant stress test, not 1,000,000 historical or live trades and
not a guarantee of profitability or near-100% win rate.

DEPLOY
------
Upload the contents of this ZIP over the current GitHub Pages repository files.
Do not delete browser/site data. The new service-worker cache name forces the new
7.1 interface to replace the 7.0 cached shell.
