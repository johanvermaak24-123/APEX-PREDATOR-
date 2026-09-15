APEX SCALP GOD 6.8.2 — ENTRY CLARITY

UPGRADE SCOPE
- No memory reset. Existing 6.8 forward-proof epoch, truth ledger, signal locks, journal, Memory Vault and stored research remain on the same browser/site.
- The internal proof engine still uses its existing FIRE-state flag for backward compatibility, but the user-facing live action is now explicit: ENTER BUY NOW or ENTER SELL NOW.
- ARMED is now displayed as RESEARCH ARMED so it cannot be mistaken for permission to trade.
- Trigger Readiness now says ACTIVE THESIS / THESIS READY instead of ACTIVE EDGE, because the forward Proof Status remains the authority on whether an edge is empirically proven.
- BEST NOW ranking now shows ENTER > PROOF > RESEARCH ARMED > WATCH > setup score.
- Execution Authority now displays ENTER NOW only when the live-entry gates have actually cleared; otherwise it remains NO LIVE ENTRY / PROOF ONLY / RESEARCH ARMED / WATCH.
- Harvest truth status uses ENTRY READY for a fully authorized live setup.
- User-facing FIRE wording was removed from risk/circuit-breaker labels and replaced with LIVE ENTRY terminology.

WHEN APEX WILL SHOW ENTER
APEX displays ENTER BUY NOW or ENTER SELL NOW only when the selected opportunity has all required live authority:
1. Fresh trigger / entry geometry.
2. Verified broker-cost inputs.
3. Required forward proof / effective evidence gates.
4. Positive bootstrap and purged holdout evidence plus FDR pass.
5. Fortress data/execution checks pass.
6. Hydra/state-freshness checks pass.
7. Circuit breaker is clear.

Until those conditions clear, APEX can still show WATCH, RESEARCH ARMED or PROOF ONLY, but those are not live-entry instructions.

DEPLOY OVER YOUR CURRENT GITHUB PAGES BUILD
1. Keep the same repository/site. Do NOT delete browser storage.
2. Replace index.html, manifest.webmanifest, sw.js and apple-touch-icon.png with the files in this ZIP.
3. Commit the changes and wait for GitHub Pages to redeploy.
4. Re-open the same site URL. The 6.8.2 service worker clears the old APEX cache and uses network-first navigation.

MEMORY / PROOF PRESERVATION
- Storage keys and APEX_PROOF_EPOCH are unchanged from 6.8/6.8.1.
- Existing 6.8 forward episodes continue to count under the same proof epoch.
- Legacy 6.7.1 evidence remains research/context only and cannot silently qualify a live entry.

IMPORTANT
ENTER is an execution-authority label from the model, not a guarantee of profit or future price direction. Setup score is not a probability. Code self-tests verify implementation behavior, not profitability.
