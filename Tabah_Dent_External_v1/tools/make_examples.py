#!/usr/bin/env python3
"""Generate fresh fake event bodies into a NEW folder. Does not send anything."""
import argparse
import json
from pathlib import Path
from datetime import datetime, timedelta, timezone
from uuid import uuid4

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--email', required=True, help='Your owned test email, already in ALLOWED_EMAILS')
p.add_argument('--out', required=True, help='NEW directory; existing directory is rejected')
a=p.parse_args()
out=Path(a.out)
out.mkdir(parents=True, exist_ok=False)
now=datetime.now(timezone.utc)
iso=lambda d:d.isoformat(timespec='seconds').replace('+00:00','Z')
rid='demo-'+str(uuid4())
create={'type':'request.create','request_id':rid,'data':{'is_test':True,
 'name':'زائر وهمي للاختبار','email':a.email.lower(),'phase':'SUBMITTED',
 'branch_id':'DEMO_BRANCH','preferred_at':iso(now+timedelta(days=2)),
 'consent':{'service':True,'followup':True,'review':True,'at':iso(now),
 'version':'demo-email-v1','source':'demo-form'}}}
events={'01-create.json':create,
 '02-get.json':{'type':'request.get','request_id':rid,'data':{}},
 '03-confirm.json':{'type':'request.confirm','request_id':rid,
  'data':{'expected_version':1,'appointment_at':iso(now+timedelta(days=2))}},
 '04-cancel.json':{'type':'request.cancel','request_id':rid,'data':{'expected_version':2}}}
manifest={'request_id':rid,'warning':'Sequential 01,03,04 only. Do not mix with operator changes.'}
for name,body in events.items():
 (out/name).write_text(json.dumps(body,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 manifest[name]={'event_id':'evt-'+str(uuid4()),'key_id':'admin' if name.startswith(('03','04')) else 'ingest'}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(manifest,ensure_ascii=False,indent=2))
