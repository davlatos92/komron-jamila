"""Локальная заглушка бэкенда (apps-script/Code.gs) для проверки сайта без Google.

Запуск из корня репозитория:  python dev/mock_server.py 8772
Сайт: http://localhost:8772, API: /api (вход в админку: admin / 1234). Данные живут в памяти.
"""
import json
import random
import sys
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
ADMIN_LOGIN, ADMIN_KEY = 'admin', '1234'
guests = []


def now():
    return datetime.now(timezone.utc).isoformat()


def new_id():
    abc = 'abcdefghjkmnpqrstuvwxyz23456789'
    taken = {g['id'] for g in guests}
    while True:
        i = ''.join(random.choice(abc) for _ in range(7))
        if i not in taken:
            return i


def handle(p):
    action = p.get('action', '')
    if action in ('list', 'add', 'remove') and (p.get('login') != ADMIN_LOGIN or p.get('key') != ADMIN_KEY):
        return {'ok': False, 'error': 'key'}
    find = lambda: next((g for g in guests if g['id'] == p.get('id')), None)
    if action == 'guest':
        g = find()
        return {'ok': True, 'name': g['name'], 'answer': g['answer'], 'people': g['people']} if g and not g['shared'] else {'ok': False}
    if action == 'answer':
        yes = p.get('answer') == 'yes'
        people = max(1, min(20, int(p.get('people') or 1))) if yes else 0
        g = find()
        if g and not g['shared']:
            g.update(answer='yes' if yes else 'no', people=people, answeredAt=now())
        else:
            name = (p.get('name') or '').strip()[:80]
            if not name:
                return {'ok': False, 'error': 'name'}
            guests.append(dict(id=new_id(), name=name, answer='yes' if yes else 'no', people=people,
                               answeredAt=now(), createdAt=now(), shared=True))
        return {'ok': True}
    if action == 'list':
        return {'ok': True, 'guests': guests}
    if action == 'add':
        name = (p.get('name') or '').strip()[:80]
        if not name:
            return {'ok': False, 'error': 'name'}
        g = dict(id=new_id(), name=name, answer='', people=0, answeredAt='', createdAt=now(), shared=False)
        guests.append(g)
        return {'ok': True, 'guest': g}
    if action == 'remove':
        g = find()
        if g:
            guests.remove(g)
        return {'ok': bool(g)}
    return {'ok': False, 'error': 'action'}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def do_GET(self):
        url = urlparse(self.path)
        if url.path != '/api':
            return super().do_GET()
        params = {k: v[0] for k, v in parse_qs(url.query).items()}
        body = json.dumps(handle(params), ensure_ascii=False).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8772
    ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
