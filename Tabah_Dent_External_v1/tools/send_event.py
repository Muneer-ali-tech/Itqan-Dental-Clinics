#!/usr/bin/env python3
"""External API test client, not website code. Python 3.10+, standard library only.
No email is sent by this client itself. --send commits a demo event to your deployment.
When EMAIL + unpaused worker are configured, that event can later cause a test email.
"""
import argparse
import hashlib
import hmac
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


def envelope(body, event_id, key_id, secret, timestamp=None):
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{7,79}', event_id):
        raise ValueError('Invalid event ID')
    if not re.fullmatch(r'[A-Za-z0-9_-]{43,128}', secret):
        raise ValueError('Secret must be a random URL-safe string (43-128 chars)')
    ts = int(time.time()) if timestamp is None else timestamp
    message = '\n'.join(['1', key_id, str(ts), event_id, body])
    signature = hmac.new(secret.encode('utf-8'), message.encode('utf-8'),
                         hashlib.sha256).hexdigest()
    return dict(v=1, key_id=key_id, ts=ts, event_id=event_id, body=body, signature=signature)


class GoogleRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        p = urllib.parse.urlparse(newurl)
        if p.scheme != 'https' or p.hostname not in ('script.google.com', 'script.googleusercontent.com'):
            raise ValueError('Unexpected redirect (possibly Google login or deployment access issue)')
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def transmit(url, payload):
    p = urllib.parse.urlparse(url)
    if p.scheme != 'https' or p.hostname != 'script.google.com' or not p.path.endswith('/exec'):
        raise ValueError('Use your HTTPS script.google.com /exec deployment URL')
    data = json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    request = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.build_opener(GoogleRedirect()).open(request, timeout=30) as response:
        raw = response.read(131073)
        if len(raw) > 131072:
            raise ValueError('Unexpected response size')
        try:
            result = json.loads(raw)
        except (ValueError, UnicodeError):
            raise ValueError('Expected JSON; verify deployment/access, do not assume success') from None
        if not isinstance(result, dict) or not isinstance(result.get('ok'), bool):
            raise ValueError('Unexpected response contract')
        return result


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--file', required=True, help='UTF-8 event body JSON; unchanged on retry')
    p.add_argument('--event-id', required=True, help='Same ID for retries of the same event')
    p.add_argument('--key-id', choices=['ingest', 'admin'], default='ingest')
    p.add_argument('--send', action='store_true', help='Actually submit event to your demo deployment')
    p.add_argument('--attempts', type=int, choices=range(1, 4), default=1)
    args = p.parse_args()
    env_key = 'TABAH_ADMIN_SECRET' if args.key_id == 'admin' else 'TABAH_INGEST_SECRET'
    secret = os.environ.get(env_key, '')
    # Retain exact file contents, including final newline, for idempotency hash.
    body = Path(args.file).read_text(encoding='utf-8-sig')
    json.loads(body)
    if not args.send:
        envelope(body, args.event_id, args.key_id, secret)
        print('VALID LOCALLY. Nothing submitted. Add --send only for your demo deployment.')
        return 0
    url = os.environ.get('TABAH_EXEC_URL', '')
    for attempt in range(args.attempts):
        try:
            result = transmit(url, envelope(body, args.event_id, args.key_id, secret))
            print(json.dumps(result, ensure_ascii=False, indent=2))
            if result['ok']:
                return 0
            if not result.get('error', {}).get('retryable'):
                return 2
        except (urllib.error.URLError, TimeoutError):
            print('Transport outcome uncertain. Keep the same file, request ID, and event ID.', file=sys.stderr)
        if attempt + 1 < args.attempts:
            time.sleep(2 ** (attempt + 1))
    print('Not confirmed. Retry SAME event or read request.get; do not create a new request.', file=sys.stderr)
    return 3


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, OSError) as e:
        print(str(e), file=sys.stderr)
        sys.exit(2)
