APEX SCALP GOD 7.3.1 — NEWS RISK RADAR PATCH

WHAT CHANGED
- Added scheduled economic-calendar radar to Simple Mode.
- Primary calendar: Forex Factory / FairEconomy weekly JSON.
- Fallback: Trading Economics guest calendar where available.
- High-impact event protection: blocks fresh ENTER from 15 minutes before through 15 minutes after a relevant event.
- 15–60 minutes before high-impact events shows WATCH/CAUTION but does not erase the setup.
- Calendar failure never displays NEWS CLEAR. With no usable current/stale calendar, fresh ENTER is paused and the UI shows NEWS RISK UNKNOWN.
- Existing open manual trades are not auto-closed solely because a calendar event appears.
- New journal rows archive calendar-at-decision metadata for later outcome learning.

MEMORY / UPGRADE SAFETY
- Existing keys are unchanged: titan_journal_v2, titan_state_v2, titan_active_signals_v2, apex_path_ledger_v4.
- New additive cache key: apex_calendar_cache_v1.
- A PRE-7.3.1-NEWS-RADAR snapshot is captured once in apex_upgrade_7_3_1_snapshot before normal startup recovery writes.
- Deploy over the same origin/site. Do not clear browser/site storage if you want the browser's accumulated learning to remain available.

IMPORTANT
Calendar and software-invariant tests do not prove profitability or forecast accuracy. Scheduled news can still surprise, event times can change, and market reactions can reverse.
