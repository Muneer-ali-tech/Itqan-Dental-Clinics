'use strict';
// Re-create a Python signature and verify it independently in Node. No network.
const {execFileSync}=require('node:child_process');
const path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const file=path.resolve(__dirname,'../tools/send_event.py');
const script=`import importlib.util,json\ns=importlib.util.spec_from_file_location('client',${JSON.stringify(file)})\nm=importlib.util.module_from_spec(s);s.loader.exec_module(m)\nprint(json.dumps(m.envelope('{"name":"تجربة"}','event-0001','ingest','i'*64,1788715800),ensure_ascii=False))`;
const e=JSON.parse(execFileSync(process.env.PYTHON||'python',['-c',script],{encoding:'utf8'}));
const expected=crypto.createHmac('sha256','i'.repeat(64))
  .update([e.v,e.key_id,e.ts,e.event_id,e.body].join('\n'),'utf8').digest('hex');
assert.equal(e.signature,expected);
console.log('PASS: Python/Node Arabic UTF-8 HMAC interoperability. No network.');
