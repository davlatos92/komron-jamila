// Бэкенд приглашения: гости и их ответы хранятся в Google Таблице.
//
// Установка (один раз):
// 1. Создайте Google Таблицу → Расширения → Apps Script, вставьте этот файл целиком.
// 2. Начать развёртывание → Новое развёртывание → тип «Веб-приложение»,
//    «Запуск от имени»: Я, «У кого есть доступ»: Все → Развернуть, разрешить доступ.
// 3. Скопируйте ссылку вида https://script.google.com/macros/s/…/exec
//    и вставьте её в WEDDING.api в assets/common.js.
// 4. Откройте admin.html: при первом входе придумайте логин и пароль.
//    В свойствах скрипта хранится только хеш пароля. Сбросить: Настройки проекта →
//    Свойства скрипта → удалить ADMIN_LOGIN и ADMIN_HASH.
// После правки этого кода: Управление развёртываниями → карандаш → Версия «Новая».

const props = PropertiesService.getScriptProperties();
const SHEET = 'Гости';
const HEAD = ['id', 'Имя', 'Ответ', 'Человек', 'Ответил', 'Создан', 'Ссылка'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('@');
  }
  return sh;
}

function rows_() {
  const values = sheet_().getDataRange().getValues().slice(1);
  return values.map((r, i) => ({
    row: i + 2, id: String(r[0]), name: String(r[1]), answer: String(r[2]),
    people: Number(r[3]) || 0, answeredAt: r[4] || '', createdAt: r[5] || '',
    shared: r[6] === 'общая',
  }));
}

// Имя, начинающееся с =, + или -, таблица посчитала бы формулой
const safe_ = s => /^[=+\-@]/.test(s) ? "'" + s : s;
const clean_ = s => safe_(String(s || '').trim().slice(0, 80));

function newId_(taken) {
  const abc = 'abcdefghjkmnpqrstuvwxyz23456789';
  let id;
  do {
    id = '';
    for (let i = 0; i < 7; i++) id += abc[Math.floor(Math.random() * abc.length)];
  } while (taken.has(id));
  return id;
}

const hash_ = s => Utilities.base64Encode(
  Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'invite:' + s, Utilities.Charset.UTF_8));

function isAdmin_(p) {
  const h = props.getProperty('ADMIN_HASH');
  return !!h && p.login === props.getProperty('ADMIN_LOGIN') && hash_(p.key || '') === h;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const p = e.parameter || {};
  // Первый вход в админку: задаём логин и пароль (только пока они не заданы)
  if (p.action === 'status') return out_({ ok: true, configured: !!props.getProperty('ADMIN_HASH') });
  if (p.action === 'setup') {
    if (props.getProperty('ADMIN_HASH')) return out_({ ok: false, error: 'configured' });
    const login = String(p.login || '').trim(), key = String(p.key || '');
    if (login.length < 3 || key.length < 6) return out_({ ok: false, error: 'weak' });
    props.setProperties({ ADMIN_LOGIN: login, ADMIN_HASH: hash_(key) });
    return out_({ ok: true });
  }
  const admin = ['list', 'add', 'remove'].includes(p.action);
  if (admin && !isAdmin_(p)) return out_({ ok: false, error: 'key' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    const all = rows_();
    const find = id => all.find(r => r.id && r.id === String(id || ''));

    switch (p.action) {
      case 'guest': {
        const g = find(p.id);
        return out_(g && !g.shared ? { ok: true, name: g.name, answer: g.answer, people: g.people } : { ok: false });
      }
      case 'answer': {
        const yes = p.answer === 'yes';
        const people = yes ? Math.max(1, Math.min(20, parseInt(p.people, 10) || 1)) : 0;
        const answer = yes ? 'yes' : 'no';
        const g = find(p.id);
        if (g && !g.shared) {
          sh.getRange(g.row, 3, 1, 3).setValues([[answer, people, new Date()]]);
        } else {
          const name = clean_(p.name);
          if (!name) return out_({ ok: false, error: 'name' });
          // ответ по общей ссылке: гость сам вписал имя
          const id = newId_(new Set(all.map(r => r.id)));
          sh.appendRow([id, name, answer, people, new Date(), new Date(), 'общая']);
        }
        return out_({ ok: true });
      }
      case 'list':
        return out_({ ok: true, guests: all.map(({ row, ...r }) => r) });
      case 'add': {
        const name = clean_(p.name);
        if (!name) return out_({ ok: false, error: 'name' });
        const id = newId_(new Set(all.map(r => r.id)));
        sh.appendRow([id, name, '', '', '', new Date(), 'личная']);
        return out_({ ok: true, guest: { id, name, answer: '', people: 0, answeredAt: '', createdAt: new Date(), shared: false } });
      }
      case 'remove': {
        const g = find(p.id);
        if (g) sh.deleteRow(g.row);
        return out_({ ok: !!g });
      }
      default:
        return out_({ ok: false, error: 'action' });
    }
  } finally {
    lock.releaseLock();
  }
}
