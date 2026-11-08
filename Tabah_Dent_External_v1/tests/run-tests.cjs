'use strict';
// Uses the actual .gs files with fake Google services. No network and no emails.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const crypto=require('node:crypto'),a=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
let passed=0; const results=[];
function environment() {
  let now=Date.parse('2026-09-06T17:30:00Z'),locked=false,quota=100;
  let mailError=false,failWrite=null,failFlush=false;
  const mail=[],logs=[],properties={DEMO_MODE:'true',MAIL_MODE:'DRY_RUN',PAUSED:'false',
    DEMO_FAST:'true',SPREADSHEET_ID:'test-sheet',ALLOWED_EMAILS:'demo@example.com',
    REPLY_TO:'owner@example.com',INGEST_SECRET:'i'.repeat(64),ADMIN_SECRET:'a'.repeat(64)};
  const sheets={};
  function sheet(name) {
    return sheets[name] || (sheets[name]={data:[],
      getLastRow(){return this.data.length;},
      getRange(row,col,n=1,m=1){const self=this; return {
        getValues(){return Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>
          self.data[row-1+i]?.[col-1+j]??''));},
        setValues(v){a.equal(v.length,n);v.forEach(x=>a.equal(x.length,m));
          if(failWrite && failWrite(name,row,v)){failWrite=null;throw Error('write failure');}
          v.forEach((x,i)=>{self.data[row-1+i] ||= [];x.forEach((cell,j)=>
            self.data[row-1+i][col-1+j]=cell);});return this;}
      };},
      appendRow(v){this.data.push([...v]);},clearContents(){this.data=[];},setFrozenRows(){}
    });
  }
  const book={getId:()=> 'test-sheet',getSheetByName:n=>sheets[n]||null,
    insertSheet:sheet,setSpreadsheetTimeZone(){},getSpreadsheetTimeZone:()=> 'Asia/Riyadh'};
  const triggers=[];
  const context={
    Date:class extends Date{constructor(...args){super(...(args.length?args:[now]));}
      static now(){return now;}},
    console:{log:x=>logs.push(x),error:x=>logs.push(x)},
    PropertiesService:{getScriptProperties:()=>({getProperties:()=>({...properties}),
      getProperty:k=>properties[k]??null,setProperty:(k,v)=>{properties[k]=v;}})},
    SpreadsheetApp:{getActiveSpreadsheet:()=>book,openById:()=>book,
      flush(){if(failFlush){failFlush=false;throw Error('flush failure');}}},
    LockService:{getScriptLock:()=>({tryLock(){if(locked)return false;locked=true;return true;},
      releaseLock(){locked=false;}})},
    Session:{getScriptTimeZone:()=> 'Asia/Riyadh'},
    ScriptApp:{getProjectTriggers:()=>triggers,newTrigger:name=>({timeBased(){return this;},
      everyMinutes(n){a.equal(n,1);return this;},create(){triggers.push({getHandlerFunction:()=>name});}})},
    MailApp:{getRemainingDailyQuota:()=>quota,sendEmail:m=>{mail.push(m);quota--;
      if(mailError)throw Error('uncertain transport');}},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({text:s,setMimeType(){return this;}})},
    Utilities:{Charset:{UTF_8:'utf8'},DigestAlgorithm:{SHA_256:'sha256'},
      computeDigest:(_,s)=>Array.from(crypto.createHash('sha256').update(s,'utf8').digest()),
      computeHmacSha256Signature:(s,k)=>Array.from(crypto.createHmac('sha256',k).update(s,'utf8').digest()),
      getUuid:()=>crypto.randomUUID(),formatDate:(d,tz,format)=>{
        const p=new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'2-digit',
          day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d);
        const o=Object.fromEntries(p.map(x=>[x.type,x.value]));
        return format==='H'?o.hour:`${o.year}-${o.month}-${o.day} ${o.hour}:${o.minute}`;
      }}
  };
  vm.createContext(context);
  for(const f of ['Config.gs','Domain.gs','Storage.gs','Api.gs','Worker.gs','Admin.gs'])
    vm.runInContext(fs.readFileSync(path.join(root,'apps-script',f),'utf8'),context,{filename:f});
  context.setupDemo();
  function body(id='request-0001',phase='SUBMITTED') {
    let d={is_test:true,name:'زائر اختبار',email:'demo@example.com',phase,
      consent:{service:true,followup:true,review:true,at:new Date(now).toISOString(),
        version:'demo-email-v1',source:'demo-form'}};
    if(phase==='SUBMITTED')Object.assign(d,{branch_id:'DEMO_BRANCH',
      preferred_at:new Date(now+2*86400000).toISOString()});
    return {type:'request.create',request_id:id,data:d};
  }
  function sign(b,event='event-0001',key='ingest',ts=Math.floor(now/1000)) {
    const payload=typeof b==='string'?b:JSON.stringify(b);
    const env={v:1,key_id:key,ts,event_id:event,body:payload};
    env.signature=crypto.createHmac('sha256',properties[key==='admin'?'ADMIN_SECRET':'INGEST_SECRET'])
      .update([1,key,ts,event,payload].join('\n'),'utf8').digest('hex');return env;
  }
  function post(b,event='event-0001',key='ingest') {
    return raw(sign(b,event,key));
  }
  function raw(env){return JSON.parse(context.doPost({postData:{contents:
    typeof env==='string'?env:JSON.stringify(env)}}).text);}
  function record(id='request-0001') {
    return context.all_(context.cfg_()).find(x=>x.state.id===id)?.state;
  }
  let seq=100;
  function action(type,data={},id='request-0001') {
    const b={type,request_id:id,data:{expected_version:record(id).version,...data}};
    return post(b,'event-'+(++seq),'admin');
  }
  return {c:context,p:properties,mail,logs,sheets,body,sign,post,raw,record,action,
    now:()=>now,advance:ms=>{now+=ms;},quota:n=>{quota=n;},mailError:v=>{mailError=v;},
    failWrite:f=>{failWrite=f;},failFlush:()=>{failFlush=true;},lock:v=>{locked=v;}};
}
function test(name,f) {
  try{f(environment());passed++;results.push({name,status:'PASS'});console.log('PASS '+name);}
  catch(e){results.push({name,status:'FAIL',message:String(e)});console.error('FAIL '+name,e);}
}
function ok(x){a.equal(x.ok,true,JSON.stringify(x));}
function code(x,c){a.equal(x.ok,false);a.equal(x.error.code,c);}
function confirmed(e) {
  ok(e.post(e.body()));ok(e.action('request.confirm',{
    appointment_at:new Date(e.now()+2*86400000).toISOString()}));
}
test('valid signed Arabic request saved with pending receipt',e=>{
  const x=e.post(e.body());ok(x);a.equal(x.data.status,'SUBMITTED');
  a.equal(e.record().jobs.length,1);a.equal(e.mail.length,0);
});
test('same event retry does not duplicate request or job',e=>{
  const b=e.body();ok(e.post(b));let x=e.post(b);ok(x);a.equal(x.duplicate,true);
  a.equal(e.record().events.length,1);a.equal(e.record().jobs.length,1);
});
test('same event different payload rejected',e=>{
  let b=e.body();ok(e.post(b));b.data.name='Changed';code(e.post(b),'IDEMPOTENCY_CONFLICT');
});
test('same event reused for another request rejected',e=>{
  ok(e.post(e.body()));code(e.post(e.body('request-0002')),'IDEMPOTENCY_CONFLICT');
});
test('same request new create event rejected',e=>{
  ok(e.post(e.body()));code(e.post(e.body(),'event-0002'),'REQUEST_EXISTS');
});
test('bad signature rejected before save',e=>{
  let env=e.sign(e.body());env.signature='0'.repeat(64);code(e.raw(env),'BAD_SIGNATURE');
  a.equal(e.record(),undefined);
});
test('stale signature rejected',e=>code(e.raw(e.sign(e.body(),'event-0001','ingest',
  Math.floor(e.now()/1000)-301)),'STALE_SIGNATURE'));
test('future signature rejected',e=>code(e.raw(e.sign(e.body(),'event-0001','ingest',
  Math.floor(e.now()/1000)+301)),'STALE_SIGNATURE'));
test('malformed JSON rejected',e=>code(e.raw('{broken'),'INVALID_JSON'));
test('signed malformed inner JSON rejected',e=>code(e.raw(e.sign('{broken')),'INVALID_BODY_JSON'));
test('oversized input rejected',e=>code(e.raw('x'.repeat(16001)),'BODY_TOO_LARGE'));
test('unknown fields rejected',e=>{
  let b=e.body();b.data.diagnosis='not allowed';code(e.post(b),'UNEXPECTED_FIELD');
});
test('non-test request rejected',e=>{
  let b=e.body();b.data.is_test=false;code(e.post(b),'TEST_DATA_REQUIRED');
});
test('email outside allowlist rejected',e=>{
  let b=e.body();b.data.email='other@example.com';code(e.post(b),'RECIPIENT_NOT_ALLOWED');
});
test('multiple recipient email injection rejected',e=>{
  let b=e.body();b.data.email='a@example.com,b@example.com';code(e.post(b),'INVALID_EMAIL');
});
test('consent boolean string rejected',e=>{
  let b=e.body();b.data.consent.service='true';code(e.post(b),'INVALID_CONSENT');
});
test('service consent absent rejected',e=>{
  let b=e.body();b.data.consent.service=false;code(e.post(b),'SERVICE_CONSENT_REQUIRED');
});
test('old consent rejected',e=>{
  let b=e.body();b.data.consent.at=new Date(e.now()-2*86400000).toISOString();
  code(e.post(b),'INVALID_CONSENT_TIME');
});
test('incomplete without followup consent rejected',e=>{
  let b=e.body('request-0001','INCOMPLETE');b.data.consent.followup=false;
  code(e.post(b),'FOLLOWUP_CONSENT_REQUIRED');
});
test('date without offset rejected',e=>{
  let b=e.body();b.data.preferred_at='2026-09-08T12:00:00';code(e.post(b),'INVALID_DATE');
});
test('impossible calendar date rejected',e=>{
  let b=e.body();b.data.preferred_at='2026-09-31T12:00:00Z';code(e.post(b),'INVALID_DATE');
});
test('past preferred time rejected',e=>{
  let b=e.body();b.data.preferred_at=new Date(e.now()-60000).toISOString();
  code(e.post(b),'INVALID_PREFERRED_TIME');
});
test('ingest key cannot confirm',e=>{
  ok(e.post(e.body()));code(e.post({type:'request.confirm',request_id:'request-0001',
    data:{expected_version:1,appointment_at:new Date(e.now()+86400000).toISOString()}},
    'event-0002'),'FORBIDDEN_EVENT');
});
test('admin key cannot create intake',e=>code(e.post(e.body(),'event-0001','admin'),'FORBIDDEN_EVENT'));
test('version conflict prevents stale updates',e=>{
  ok(e.post(e.body()));ok(e.action('request.review'));
  code(e.post({type:'request.cancel',request_id:'request-0001',data:{expected_version:1}},
    'event-0002','admin'),'VERSION_CONFLICT');a.equal(e.record().status,'UNDER_REVIEW');
});
test('completion cancels incomplete followup',e=>{
  ok(e.post(e.body('request-0001','INCOMPLETE')));
  ok(e.post({type:'request.complete',request_id:'request-0001',data:{expected_version:1,
    branch_id:'DEMO_BRANCH',preferred_at:new Date(e.now()+86400000).toISOString()}},'event-0002'));
  a.equal(e.record().jobs.find(j=>j.kind==='FOLLOWUP').status,'CANCELLED');
});
test('recorded reply stops followup',e=>{
  ok(e.post(e.body('request-0001','INCOMPLETE')));ok(e.action('request.replied'));
  a.equal(e.record().jobs.find(j=>j.kind==='FOLLOWUP').status,'CANCELLED');
});
test('confirmation queues reminder from trusted operator',e=>{
  confirmed(e);a.equal(e.record().status,'CONFIRMED');
  a.equal(e.record().jobs.filter(j=>j.kind==='REMINDER' && j.status==='PENDING').length,1);
});
test('cancel before due prevents all emails',e=>{
  e.p.MAIL_MODE='EMAIL';confirmed(e);ok(e.action('request.cancel'));e.advance(300000);
  e.c.runWorker();a.equal(e.mail.length,0);a.equal(e.record().status,'CANCELLED');
});
test('reschedule invalidates old reminder revision',e=>{
  confirmed(e);ok(e.action('request.reschedule',{
    appointment_at:new Date(e.now()+3*86400000).toISOString()}));
  const jobs=e.record().jobs.filter(j=>j.kind==='REMINDER');
  a.equal(jobs[0].status,'CANCELLED');a.equal(jobs[1].status,'PENDING');
  a.equal(jobs[1].revision,2);
});
test('change request pauses reminder without confirming new time',e=>{
  confirmed(e);ok(e.action('request.change_requested'));
  a.equal(e.record().status,'CHANGE_REQUESTED');
  a.equal(e.record().jobs.filter(j=>j.status==='PENDING').length,0);
});
test('attendance cancels reminders and queues neutral review',e=>{
  confirmed(e);ok(e.action('request.attended'));
  a.equal(e.record().jobs.filter(j=>j.status==='PENDING')[0].kind,'REVIEW');
});
test('review consent false prevents review invitation',e=>{
  let b=e.body();b.data.consent.review=false;ok(e.post(b));
  ok(e.action('request.confirm',{appointment_at:new Date(e.now()+86400000).toISOString()}));
  ok(e.action('request.attended'));a.equal(e.record().jobs.some(j=>j.kind==='REVIEW'),false);
});
test('no-show cancels all pending jobs',e=>{
  confirmed(e);ok(e.action('request.no_show'));
  a.equal(e.record().jobs.some(j=>j.status==='PENDING'),false);
});
test('cannot confirm cancelled request',e=>{
  ok(e.post(e.body()));ok(e.action('request.cancel'));
  code(e.action('request.confirm',{appointment_at:new Date(e.now()+86400000).toISOString()}),
    'INVALID_TRANSITION');
});
test('global opt-out cancels other records with same email at worker check',e=>{
  ok(e.post(e.body()));ok(e.post(e.body('request-0002'),'event-0002'));
  ok(e.action('contact.stop'));e.p.MAIL_MODE='EMAIL';e.c.runWorker();
  a.equal(e.mail.length,0);a.equal(e.record('request-0002').jobs[0].status,'CANCELLED');
});
test('global opt-out blocks future intake for same address',e=>{
  ok(e.post(e.body()));ok(e.action('contact.stop'));
  code(e.post(e.body('request-0002'),'event-0002'),'CONTACT_SUPPRESSED');
});
test('pause prevents sending without deleting pending job',e=>{
  ok(e.post(e.body()));e.p.MAIL_MODE='EMAIL';e.c.pauseAll();e.c.runWorker();
  a.equal(e.mail.length,0);a.equal(e.record().jobs[0].status,'PENDING');
});
test('dry run is simulated not sent and is not replayed after mode switch',e=>{
  ok(e.post(e.body()));e.c.runWorker();a.equal(e.record().jobs[0].status,'SIMULATED');
  e.p.MAIL_MODE='EMAIL';e.c.runWorker();a.equal(e.mail.length,0);
});
test('successful MailApp call records SENT only once',e=>{
  e.p.MAIL_MODE='EMAIL';ok(e.post(e.body()));e.c.runWorker();e.c.runWorker();
  a.equal(e.mail.length,1);a.equal(e.record().jobs[0].status,'SENT');
  a.match(e.record().jobs[0].reason,/NOT_DELIVERY_PROOF/);
});
test('exhausted quota defers without claiming sent',e=>{
  e.p.MAIL_MODE='EMAIL';e.quota(0);ok(e.post(e.body()));e.c.runWorker();
  a.equal(e.mail.length,0);a.equal(e.record().jobs[0].status,'PENDING');
  a.equal(e.record().jobs[0].reason,'QUOTA_WAIT');
});
test('uncertain MailApp exception is UNKNOWN and never auto-retried',e=>{
  e.p.MAIL_MODE='EMAIL';e.mailError(true);ok(e.post(e.body()));e.c.runWorker();
  e.mailError(false);e.c.runWorker();a.equal(e.mail.length,1);
  a.equal(e.record().jobs[0].status,'UNKNOWN');
});
test('crash after send before save recovers UNKNOWN without resend',e=>{
  e.p.MAIL_MODE='EMAIL';ok(e.post(e.body()));
  e.failWrite((name,row,v)=>name==='State' && row===2 && v[0][1].includes('"status":"SENT"'));
  a.throws(()=>e.c.runWorker());a.equal(e.mail.length,1);
  a.equal(e.record().jobs[0].status,'SENDING');e.c.runWorker();
  a.equal(e.record().jobs[0].status,'UNKNOWN');a.equal(e.mail.length,1);
});
test('failure saving SENDING intent does not contact provider',e=>{
  e.p.MAIL_MODE='EMAIL';ok(e.post(e.body()));
  e.failWrite((name,row,v)=>name==='State' && row===2 && v[0][1].includes('"status":"SENDING"'));
  a.throws(()=>e.c.runWorker());a.equal(e.mail.length,0);
});
test('request committed but flush response fails: retry is duplicate',e=>{
  let b=e.body();e.failFlush();code(e.post(b),'INTERNAL_RETRY_SAME_EVENT');
  let x=e.post(b);ok(x);a.equal(x.duplicate,true);a.equal(e.record().events.length,1);
});
test('busy lock produces retryable response',e=>{
  e.lock(true);const x=e.post(e.body());code(x,'BUSY');a.equal(x.error.retryable,true);
});
test('late reminder expires instead of sending',e=>{
  confirmed(e);e.advance(3*86400000);e.p.MAIL_MODE='EMAIL';e.c.runWorker();
  a.equal(e.mail.length,0);a.equal(e.record().jobs.find(j=>j.kind==='REMINDER').status,'CANCELLED');
});
test('normal clock skips past 24-hour reminder for near appointment',e=>{
  e.p.DEMO_FAST='false';ok(e.post(e.body()));ok(e.action('request.confirm',{
    appointment_at:new Date(e.now()+2*3600000).toISOString()}));
  a.equal(e.record().jobs.some(j=>j.kind==='REMINDER'),false);
});
test('normal clock respects quiet hours',e=>{
  e.p.DEMO_FAST='false';e.p.MAIL_MODE='EMAIL';ok(e.post(e.body()));e.c.runWorker();
  a.equal(e.mail.length,0);a.equal(e.record().jobs[0].status,'PENDING');
});
test('sheet view escapes formula-like test name',e=>{
  let b=e.body();b.data.name='=1+1';ok(e.post(b));e.c.refreshViews_();
  a.equal(e.sheets.Requests.data[1][2],"'=1+1");
});
test('dashboard counts unique requests not replayed events',e=>{
  let b=e.body();ok(e.post(b));ok(e.post(b));e.c.refreshViews_();
  a.equal(e.sheets.Dashboard.data.find(r=>r[0]==='ALL_TEST_REQUESTS')[1],'1');
});
test('get returns no email or name',e=>{
  ok(e.post(e.body()));const x=e.post({type:'request.get',request_id:'request-0001',data:{}},'read-0001');
  ok(x);a.equal(x.data.email,undefined);a.equal(x.data.name,undefined);
});
test('health is liveness only and exposes no secrets',e=>{
  const x=JSON.parse(e.c.doGet().text);a.equal(x.message,'LIVENESS_ONLY');
  a.equal(JSON.stringify(x).includes(e.p.INGEST_SECRET),false);
});
test('preflight validates config and installer is idempotent',e=>{
  e.c.installWorker();e.c.installWorker();a.equal(e.c.preflight().worker_triggers_for_current_user,1);
});
test('non-demo setting fails closed',e=>{
  e.p.DEMO_MODE='false';code(e.post(e.body()),'DEMO_ONLY');
});
test('same ingest/admin key is rejected',e=>{
  e.p.ADMIN_SECRET=e.p.INGEST_SECRET;code(e.post(e.body()),'CONFIG_SEPARATE_KEYS');
});
test('corrupt canonical storage fails closed',e=>{
  ok(e.post(e.body()));e.sheets.State.data[1][1]='{invalid';
  code(e.post(e.body('request-0002'),'event-0002'),'CORRUPT_STATE');
});
test('terminal close cancels review and other queued tasks',e=>{
  confirmed(e);ok(e.action('request.attended'));ok(e.action('request.close',{reason:'TEST_ENDED'}));
  a.equal(e.record().jobs.some(j=>j.status==='PENDING'),false);
});
test('signature matches independent RFC 4231 vector',e=>{
  a.equal(e.c.mac_('what do ya want for nothing?','Jefe'),
    '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843');
});
const report={environment:'Node '+process.version,scope:'Actual .gs files, mocked Google services',
  live_google_tested:false,live_email_tested:false,total:results.length,passed,
  failed:results.length-passed,results};
fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(report,null,2));
console.log(`\n${passed}/${results.length} passed. Google integration NOT executed.`);
process.exitCode=report.failed?1:0;
