APEX SCALP GOD 6.8.1 — CONSISTENCY HOTFIX

HOTFIX SCOPE
- No memory reset. Existing 6.8 forward-proof epoch, truth ledger, signal locks and stored research are preserved.
- SCALP EDGE ENGINE legacy path-cost display can no longer show a bare PASS when broker costs are unverified. It now distinguishes RESEARCH PROXY from LIVE VERIFIED authority and explicitly shows LIVE VETO when appropriate.
- LIVE NEWS RADAR now uses one canonical relevant-headline total for the badge, count, high-impact tally and score. The list may show the top six while clearly stating the full relevant total.
- BEST NOW ranking is explicitly readiness-first: FIRE > PROOF > ARMED > WATCH > setup score. Each row shows its rank priority so a lower setup score cannot look like a sorting bug.
- Added regression self-tests for cost-authority semantics, canonical news counts and BEST NOW ranking semantics.

DEPLOY OVER YOUR CURRENT GITHUB PAGES BUILD
1. Keep the same repository/site. Do NOT delete browser storage.
2. Replace index.html, manifest.webmanifest, sw.js and apple-touch-icon.png with the files in this ZIP.
3. Commit the changes and wait for GitHub Pages to redeploy.
4. Re-open the same site URL. The new service worker is network-first for navigation and clears old APEX caches.

MEMORY PRESERVATION
- Existing titan_journal_v2, titan_state_v2, signal locks, path memory, Memory Vault and the 6.7.1 truth-ledger database are preserved.
- 6.7.1 evidence remains available for research/context.
- FIRE authority in 6.8 starts a new FORWARD PROOF era on first 6.8 load. Old evidence cannot silently qualify a 6.8 FIRE.

MAJOR 6.8 CHANGES
- Fail-closed broker-cost authority: FIRE requires fresh broker spread plus non-zero tick size and tick value. Feed spread is RESEARCH ONLY.
- Canonical merged news state: Global Coverage Radar and Live News Radar read from one coherent news state.
- Forward-only proof gate: exact post-entry M1 outcomes created after the 6.8 upgrade are the only outcomes eligible for 6.8 live proof.
- Effective sample penalty: nominal episode count is reduced for serial dependence and same-day clustering.
- Block bootstrap + purged chronological holdout + FDR remain required before live promotion.
- Counter trades are explicitly labelled COUNTER BUY / COUNTER SELL when they run against the parent thesis.
- Market Microstructure language was corrected to MARKET FLOW PROXY / OHLC-tick-volume proxy language. No L2/L3 claims.
- Memory learning now decays stale outcomes rather than weighting all old outcomes equally.
- Alpha retirement/reactivation lifecycle added for deteriorating mode-specific expectancy.
- Heuristic state evidence half-life can veto stale closed-bar evidence.
- New Proof Status card separates CODE SELF-TEST from EDGE PROVEN.

IMPORTANT
A software self-test or fuzz test does not prove profitability. 6.8 deliberately keeps live authority fail-closed until forward evidence and broker-cost inputs justify it.