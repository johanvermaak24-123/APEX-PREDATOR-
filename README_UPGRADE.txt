APEX SCALP GOD 7.2.0 — CONSUMER TEST HUD
=============================================

PURPOSE
-------
This build is cleaned up for real-user beta testing. The normal user does not need
to understand the internal research engine. The front screen gives one instruction:

  • ENTER BUY NOW
  • ENTER SELL NOW
  • WAIT — DO NOT ENTER
  • HOLD
  • EXIT NOW
  • TAKE PROFIT NOW

CONSUMER MODE
-------------
Consumer/Simple Mode now starts ON on every page load. It does not inherit an old
SHOW DETAILS preference from previous versions. Advanced details are session-only:
if a tester opens them, refreshing the app returns to the clean consumer view.

On WHAT DO I DO? the user sees only:
  • market + timeframe
  • SCAN button
  • one large action
  • current price
  • entry / stop loss / take profit only when an ENTER is truly authorized
  • open-trade HOLD / EXIT guidance after tapping I ENTERED THIS TRADE

If the result is WAIT, APEX deliberately does not show a tempting BUY/SELL candidate
on the consumer card. Entry, stop loss and take profit remain blank.

On FIND A TRADE, APEX either returns one ready trade with exact levels or says:
  WAIT — NO TRADE READY
The consumer summary does not show the closest unapproved candidate. Full basket
rankings remain available only under SHOW ADVANCED DETAILS.

WHAT STAYS IN THE BACKGROUND
----------------------------
The existing thesis engine, counter-path engine, news analysis, proof ledger, cost
checks, robustness courts, learning, memory, signal locks and historical journal are
not removed. This is a presentation cleanup, not a weakening of the entry rules.

MEMORY / UPGRADE SAFETY
-----------------------
Existing local browser learning keys are preserved. Do not clear browser/site data
when deploying over 7.1. The service-worker cache name changed so the new interface
replaces the old cached shell.

BETA / COMMERCIAL TESTING
-------------------------
This package is suitable for user-experience and paper/demo testing before any
commercial release. It should not be advertised as guaranteed profit or near-100%
accurate. Validate real broker costs, live execution behavior, data licensing, legal
terms, privacy and support expectations before selling it to customers.

AUDIT
-----
AUDIT_1M.js runs the exact source execution-decision functions through 1,000,000
seeded randomized scenarios. It tests ENTER authority, WAIT level suppression,
BEST NOW behavior and open-trade HOLD/EXIT handling. Static checks also verify that
Consumer Mode starts on, advanced panels are hidden on the front, and WAIT summaries
do not expose internal jargon.

This is a software/invariant stress test. It is not 1,000,000 historical/live trades
and does not prove profitability.

DEPLOY
------
Upload the contents of this ZIP over the current GitHub Pages repository files.
Do not clear browser/site data.
