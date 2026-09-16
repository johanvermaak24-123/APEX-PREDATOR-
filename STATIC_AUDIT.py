from pathlib import Path
from bs4 import BeautifulSoup
import re, json, hashlib, sys
wd=Path('.')
idx=(wd/'index.html').read_text()
app=(wd/'app.js').read_text()
man=(wd/'manifest.webmanifest').read_text()
sw=(wd/'sw.js').read_text()
checks=[]
def chk(name,cond,detail=''):
    checks.append((name,bool(cond),detail))
    if not cond: print('FAIL',name,detail)

soup=BeautifulSoup(idx,'html.parser')
ids=[x.get('id') for x in soup.find_all(attrs={'id':True})]
chk('HTML parsed', soup.html is not None)
chk('unique IDs', len(ids)==len(set(ids)), f'{len(ids)} total / {len(set(ids))} unique')
# Literal DOM references from exact inline code / app
refs=set(re.findall(r'(?:\$|must)\(["\']([A-Za-z0-9_:-]+)["\']\)',app))
refs.update(re.findall(r'document\.getElementById\(["\']([A-Za-z0-9_:-]+)["\']\)',app))
missing=sorted(r for r in refs if r not in set(ids))
chk('literal DOM refs resolved', not missing, f'{len(refs)} refs; missing={missing[:12]}')
# inline equals app
m=re.search(r'<script>\n(.*?)\n</script>\n</body>',idx,re.S)
chk('inline app.js byte-equivalent', bool(m and m.group(1)==app.rstrip('\n')))
chk('version title', '<title>APEX SCALP GOD 7.3.3' in idx)
chk('app version constant', 'APEX_APP_VERSION="APEX-SCALP-GOD-7.3.3"' in app)
chk('manifest version', 'APEX SCALP GOD 7.3.3' in man and 'APEX 7.3' in man)
chk('service worker cache bumped', 'apex-scalp-god-7-3-3-calendar-rollback-v1' in sw)
chk('simple mode forced on load', 'setSimpleMode(true);' in app)
chk('freshness constants present', 'APEX_TRIGGER_FRESH_MAX_MS=90000' in app and 'APEX_COMMAND_MAX_AGE_MS=60000' in app)
chk('original trigger identity present', 'setupId=`${r?.sym' in app and 'originalEntry=Number(cur?.close)' in app and 'triggerTs=Number.isFinite(openTs)?openTs+5*60000' in app)
chk('favorable anti-chase gate', "status='MISSED'" in app and 'targetUsed>.35' in app and 'favorableATR>maxFavorableATR' in app)
chk('adverse invalidation gate', "status='INVALIDATED'" in app and 'adverseATR>maxAdverseATR' in app)
chk('stale trigger gate', "status='STALE'" in app and 'ageMs>APEX_TRIGGER_FRESH_MAX_MS' in app)
chk('future timestamp fail-closed', 'triggerTs>now+5000' in app)
chk('final ENTER requires freshness', '&&freshnessPass&&(dir===1||dir===-1)' in app)
chk('missing freshness fails closed', 'freshnessPass=freshness?.pass===true' in app)
chk('MISSED user action present', "'MISSED — DO NOT CHASE'" in app)
chk('non-live hides levels', 'entry:liveReady?+sg.entry:null' in app and 'target:liveReady?+sg.target:null' in app and 'invalid:liveReady?+sg.invalid:null' in app)
chk('command expiry uses trigger expiry', 'Math.min(hardExpiry,+expiresAt)' in app)
chk('old 121s expiry removed', '121000' not in app)
chk('7.3 proof epoch isolated', 'apex_7_3_fresh_forward_proof_epoch' in app and '7.3_FRESH_FORWARD' in app)
chk('legacy proof era not live-counted', '6.8_FORWARD' not in app and '6.8_SHADOW' not in app)
chk('proof recorder requires fresh entry', "t.freshnessPass===true" in app and "proofEligible=t.costVerified===true&&t.freshnessPass===true" in app)
chk('proof rows store freshness metadata', 'originalTriggerPrice:t.originalTriggerPrice' in app and 'freshnessStatus:t.freshness?.status' in app and 'targetUsed:t.freshness?.targetUsed' in app)
chk('self-test includes missed fail-closed', 'missed setup can never masquerade as ENTER' in app)
chk('no 7.2 version remnants in runtime files', '7.2.0' not in app and '7.2.0' not in idx and '7.2.0' not in man and '7-2-0' not in sw)
# audit report validation
rep=json.loads((wd/'AUDIT_1M_REPORT.json').read_text())
sha=hashlib.sha256(app.encode()).hexdigest()
chk('1M report passed', rep.get('passed') is True and rep.get('scenarios')==1_000_000)
chk('1M report matches source SHA', rep.get('sourceSha256')==sha, f"report={rep.get('sourceSha256')} source={sha}")

passed=sum(1 for _,ok,_ in checks if ok)
report={
 'version':'APEX-SCALP-GOD-7.3.3',
 'passed':passed==len(checks),
 'checksPassed':passed,
 'checksTotal':len(checks),
 'htmlIds':len(ids),
 'literalDomRefs':len(refs),
 'missingDomRefs':missing,
 'appSha256':sha,
 'checks':[{'name':n,'passed':ok,'detail':d} for n,ok,d in checks]
}
(wd/'STATIC_AUDIT_REPORT.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
sys.exit(0 if report['passed'] else 1)
