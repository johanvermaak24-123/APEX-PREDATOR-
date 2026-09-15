APEX SCALP GOD 6.7 — TRUTH ENGINE

Major changes:
- Closed M5 bars drive execution indicators; live tick is separate.
- Freshness and market-state gates use actual feed metadata.
- New clean 6.7 truth ledger; legacy 6.5/6.6 duel evidence is preserved in localStorage but is NOT trusted for 6.7 FIRE authority.
- Exact candidate entry/SL/TP geometry is stored and resolved first-hit on continuous M5 data with a 30-minute time exit.
- 30-minute close-only pseudo-win-rate removed from FIRE authority.
- FIRE requires >=20 non-overlapping resolved mode episodes, Wilson LCB >=52%, avg > +0.05R, fresh trigger, net R:R >=1.20 and cost pass.
- Triggered setups without mature evidence show PROOF ONLY, not FIRE.
- R:R displayed/gated net of spread; gross R:R retained internally.
- CONTINUATION / REVERSAL / PARENT COUNTER evidence is mode-specific.
- Storage write failures set a fail-closed degraded flag. Vault copies are reduced to 2 and path copy is compacted.
- Lot Authority added: NO LIVE LOT / MINIMUM-BASE RISK / HIGH CONVICTION — NORMAL RISK ONLY / SKIP. Exact lot requires broker tick size and tick value. Risk cap UI is hard-bounded to 1% per trade. The app never recommends GO BIG.

Important: software tests validate logic, not profitability. 6.7 must build a fresh clean empirical ledger before FIRE can appear.
