from pathlib import Path
from bs4 import BeautifulSoup
import re,json,hashlib,sys
wd=Path('.')
idx=(wd/'index.html').read_text(); app=(wd/'app.js').read_text(); man=(wd/'manifest.webmanifest').read_text(); sw=(wd/'sw.js').read_text()
checks=[]
def chk(name,cond,detail=''): checks.append((name,bool(cond),detail))
soup=BeautifulSoup(idx,'html.parser'); ids=[x.get('id') for x in soup.find_all(attrs={'id':True})]
chk('HTML parsed',soup.html is not None); chk('unique IDs',len(ids)==len(set(ids)),f'{len(ids)} / {len(set(ids))}')
refs=set(re.findall(r'(?:\$|must)\(["\']([A-Za-z0-9_:-]+)["\']\)',app)); refs.update(re.findall(r'document\.getElementById\(["\']([A-Za-z0-9_:-]+)["\']\)',app)); missing=sorted(r for r in refs if r not in set(ids)); chk('literal DOM refs resolved',not missing,str(missing[:10]))
m=re.search(r'<script>\n(.*?)\n</script>\n</body>',idx,re.S); chk('inline app.js byte-equivalent',bool(m and m.group(1).strip('\n')==app.strip('\n')))
chk('version title','APEX SCALP GOD 7.3.2' in idx); chk('app version','APEX_APP_VERSION="APEX-SCALP-GOD-7.3.2"' in app); chk('manifest version','APEX SCALP GOD 7.3.2' in man and 'APEX 7.3.2' in man); chk('service worker cache','apex-scalp-god-7-3-2-calendar-relay-v1' in sw)
chk('calendar direct CDN','cdn-nfs.faireconomy.media/ff_calendar_thisweek.json' in app); chk('calendar direct legacy','nfs.faireconomy.media/ff_calendar_thisweek.json' in app); chk('TradingEconomics fallback','TradingEconomics' in app and 'calendar/country/united%20states' in app); chk('relay fallbacks',all(x in app for x in ['api.allorigins.win','api.codetabs.com','corsproxy.io']))
chk('calendar timeout','APEX_CALENDAR_FETCH_TIMEOUT_MS=9000' in app and 'AbortController' in app); chk('calendar schema validation','validateCalendarPayload' in app and 'calendar dates look stale/out-of-window' in app and 'has no USD events' in app)
chk('calendar fail closed',"state:\"UNKNOWN\",level:4,blockEntries:true" in app); chk('calendar execution veto','calendarPass' in app and "stage=cal.unknown?'NEWS UNKNOWN':'NEWS BLOCK'" in app)
chk('legacy memory keys preserved',all(x in app for x in ['titan_journal_v2','titan_state_v2','titan_active_signals_v2','apex_path_ledger_v4'])); chk('7.3.2 prepatch snapshot','apex_upgrade_7_3_2_snapshot' in app and 'PRE-7.3.2-CALENDAR-RELAY' in app); chk('7.3.1 snapshot retained for recovery','apex_upgrade_7_3_1_snapshot' in app)
chk('simple mode forced','setSimpleMode(true);' in app); chk('freshness gate','&&freshnessPass&&calendarPass&&(dir===1||dir===-1)' in app); chk('MISSED anti-chase',"status='MISSED'" in app and "'MISSED — DO NOT CHASE'" in app); chk('no live levels when non-live','entry:liveReady?+sg.entry:null' in app)
rep=json.loads((wd/'AUDIT_1M_REPORT.json').read_text()); sha=hashlib.sha256(app.encode()).hexdigest(); chk('1M report passed',rep.get('passed') is True and rep.get('scenarios')==1_000_000); chk('1M report source match',rep.get('sourceSha256')==sha)
nr=json.loads((wd/'AUDIT_NEWS_MEMORY_REPORT.json').read_text()); chk('relay audit passed',nr.get('passed') is True and nr.get('relayFallbackPass') is True); chk('120 memory audit passed',nr.get('memoryMigration',{}).get('preservedJournal')==120)
passed=sum(ok for _,ok,_ in checks); report={'version':'APEX-SCALP-GOD-7.3.2','passed':passed==len(checks),'checksPassed':passed,'checksTotal':len(checks),'htmlIds':len(ids),'literalDomRefs':len(refs),'missingDomRefs':missing,'appSha256':sha,'checks':[{'name':n,'passed':ok,'detail':d} for n,ok,d in checks]}; (wd/'STATIC_AUDIT_REPORT.json').write_text(json.dumps(report,indent=2)); print(json.dumps(report,indent=2)); sys.exit(0 if report['passed'] else 1)
