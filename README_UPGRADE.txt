APEX SCALP GOD 7.3.0 — FRESH ENTRY / ANTI-CHASE UPGRADE
=========================================================

PURPOSE
-------
7.3.0 fixes a specific execution-timing weakness in 7.2.0: a valid market setup could
still be scanned after price had already moved materially away from the original M5
trigger and could then be presented as a new ENTER at the later live price.

7.3.0 separates two questions:
  1. Is the setup good enough?
  2. Is the entry STILL fresh enough at the live price?

A live ENTER now requires BOTH.

CONSUMER ACTIONS
----------------
The normal user sees one clear instruction:

  • ENTER BUY NOW
  • ENTER SELL NOW
  • WAIT — DO NOT ENTER
  • MISSED — DO NOT CHASE
  • WAIT — SETUP EXPIRED
  • HOLD / TAKE PROFIT NOW / EXIT NOW after an open trade is recorded

Entry / Stop Loss / Take Profit remain hidden whenever a new trade is not live-ready.

FRESH-ENTRY ENGINE
------------------
For every M5 setup, APEX creates a deterministic setup identity from:
  • symbol
  • setup mode
  • direction
  • the closed M5 candle timestamp

The original trigger reference is fixed to that CLOSED M5 candle's close price and
close time. A rescan does NOT create a new original trigger just because live price
moved.

A live entry is blocked if any of the following is true:
  • the closed-M5 trigger is older than 90 seconds;
  • price has already consumed more than 35% of the modeled target distance;
  • favorable movement from the original trigger exceeds the dynamic anti-chase
    allowance (0.08–0.18 ATR, also limited by target geometry);
  • adverse movement from the original trigger exceeds the dynamic invalidation
    allowance (0.12–0.22 ATR);
  • original trigger time/price cannot be verified;
  • the trigger timestamp is implausibly in the future.

If the setup itself was strong but price already ran too far in the intended direction,
APEX shows:

  MISSED — DO NOT CHASE

The user must wait for a pullback or a new setup and scan again. A pullback can return
the SAME setup to the fresh zone while its 90-second trigger window is still valid.

LIVE COMMAND EXPIRY
-------------------
A displayed ENTER has a hard maximum screen life of 60 seconds, but it expires sooner
if the underlying 90-second trigger window expires first. Returning to the app after
expiry forces WAIT / SCAN AGAIN and clears the displayed entry levels.

PROOF / LEARNING SAFETY
-----------------------
Old learning, journals and memory are NOT deleted.

However, pre-7.3 forward proof is no longer allowed to approve a 7.3 live ENTER. The
new live proof era is isolated under a 7.3 freshness epoch. New proof rows only count
when the entry itself passed the fresh-entry gate and broker costs were verified.

Legacy proof remains available as research/history only. This avoids old late-entry
samples silently validating the new timing model.

The existing live promotion requirement remains conservative: APEX must build enough
new 7.3 effective forward evidence before a setup class can receive live authority.

AUDIT RESULTS
-------------
Exact-source audit: PASS
Randomized scenarios: 1,000,000
Seed: 0x7300cafe
Failures: 0

The million-scenario audit specifically fuzzed:
  • FRESH / MISSED / STALE / INVALIDATED / UNVERIFIED trigger states;
  • incorrect upstream FIRE claims trying to bypass freshness;
  • invalid entry / stop / target geometry;
  • Fortress and Hydra pass/fail combinations;
  • BEST NOW display behavior;
  • open-trade HOLD / EXIT / SWITCH behavior;
  • missing freshness metadata;
  • deterministic trigger identity across rescans.

Static package audit: 29 / 29 PASS
  • 336 HTML IDs / 336 unique
  • 300 literal DOM references resolved
  • inline code matches app.js
  • version / manifest / service-worker cache consistent
  • final ENTER gate explicitly requires freshness
  • old 121-second command expiry removed
  • new 7.3 proof era isolated from legacy proof
  • audit report SHA matches the exact app.js source

IMPORTANT LIMITATION
--------------------
The 1,000,000 run is a SOFTWARE / LOGIC invariant stress test. It is NOT one million
historical trades, not one million live trades, and does not prove profitability,
forecast accuracy or a near-100% win rate. Real broker spread, slippage, execution,
news gaps and future market behavior still need forward validation.

DEPLOY
------
Upload the CONTENTS of this ZIP over the existing GitHub Pages repository files.
Do not clear browser/site data if you want to preserve the user's existing memory,
journal and research history.

The service-worker cache name was bumped to 7.3.0 so the upgraded shell replaces the
old cached version.
