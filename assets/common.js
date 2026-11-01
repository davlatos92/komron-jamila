// Данные свадьбы — всё, что меняется под конкретную пару, лежит здесь.
const WEDDING = {
  groom: 'Комрон',
  bride: 'Джамиля',
  groomGen: 'Комрона',   // родительный падеж — для фраз «звезда Комрона»
  brideGen: 'Джамили',
  hisYear: 1997,
  herYear: 2006,
  date: '2026-11-09T18:00:00+05:00',   // день недели и время берутся отсюда
  dateText: '9 ноября 2026',
  venue: '«Дидор»',
  address: 'г. Душанбе',
  mapUrl: 'https://yandex.tj/maps/-/CXfL6EI0',
  program: [
    ['17:50', 'Сбор гостей'],
    ['18:30', 'Торжественная часть'],
    ['19:30', 'Праздничный ужин'],
    ['22:00', 'Свадебный торт'],
  ],
  // Ссылка веб-приложения Google Apps Script (см. apps-script/Code.gs) — сюда приходят ответы гостей
  api: '',
  // Небо для карты звёзд (концепция B) — в момент начала праздника
  sky: { lat: 38.56, lon: 68.78, city: 'Душанбе', time: '2026-11-09T18:00:00+05:00', timeText: '18:00' },
};

const TZ = 'Asia/Dushanbe';
const weddingWeekday = () => new Date(WEDDING.date).toLocaleDateString('ru-RU', { weekday: 'long', timeZone: TZ });
const weddingTime = () => new Date(WEDDING.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: TZ });

// Локально (dev/mock_server.py) API живёт на /api
const API_URL = WEDDING.api || (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? '/api' : '');

async function api(params) {
  const u = new URL(API_URL, location.href);
  for (const k in params) u.searchParams.set(k, params[k]);
  const r = await fetch(u, { redirect: 'follow' });
  return r.json();
}

// Гость из личной ссылки ?g=… — имя подгружается из таблицы
const GUEST_ID = new URLSearchParams(location.search).get('g') || '';
const guestReady = !GUEST_ID || !API_URL ? Promise.resolve(null)
  : api({ action: 'guest', id: GUEST_ID }).then(r => (r.ok ? r : null)).catch(() => null);

function initials() {
  return WEDDING.groom[0] + ' & ' + WEDDING.bride[0];
}

function vibrate(p) {
  try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* не везде есть */ }
}

function showToast(text) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.classList.remove('is-on');
  void t.offsetWidth;
  t.classList.add('is-on');
}

// Салют из сердечек и блёсток поверх страницы
const Confetti = (() => {
  let cv, cx, parts = [], raf = 0, last = 0;
  const colors = ['#d6b780', '#f3c4c9', '#ffffff', '#e8a0a8', '#f6d36e'];

  function heart(c, s) {
    c.beginPath();
    c.moveTo(0, s * .3);
    c.bezierCurveTo(-s, -s * .4, -s * .4, -s * 1.1, 0, -s * .45);
    c.bezierCurveTo(s * .4, -s * 1.1, s, -s * .4, 0, s * .3);
    c.fill();
  }

  function step(now) {
    const dt = Math.min(.05, (now - last) / 1000 || .016);
    last = now;
    const dpr = Math.min(2, devicePixelRatio || 1);
    if (cv.width !== innerWidth * dpr) { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => (p.life += dt) < p.max);
    for (const p of parts) {
      p.vy += 520 * dt;
      p.vx *= Math.pow(.4, dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      cx.save();
      cx.globalAlpha = Math.min(1, (p.max - p.life) * 2);
      cx.translate(p.x, p.y);
      cx.rotate(p.rot);
      cx.fillStyle = p.color;
      if (p.heart) heart(cx, p.size);
      else cx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      cx.restore();
    }
    raf = parts.length ? requestAnimationFrame(step) : 0;
    if (!raf) cx.clearRect(0, 0, innerWidth, innerHeight);
  }

  function burst(x, y, n = 90) {
    if (!cv) {
      cv = document.createElement('canvas');
      cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50';
      document.body.appendChild(cv);
      cx = cv.getContext('2d');
    }
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, v = 380 + Math.random() * 520;
      parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: Math.random() * 6, vr: (Math.random() - .5) * 10,
        size: 7 + Math.random() * 8, heart: Math.random() < .45, color: colors[i % colors.length],
        life: 0, max: 1.6 + Math.random() * 1.2,
      });
    }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
  }
  return { burst };
})();

// Календарь: на iPhone — файл .ics (откроется «Календарь»), на остальных — Google Календарь
function addToCalendar() {
  const w = WEDDING;
  const start = new Date(w.date), end = new Date(start.getTime() + 5 * 3600e3);
  const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const title = `Свадьба: ${w.groom} и ${w.bride}`;
  const place = `${w.venue}, ${w.address}`;
  const about = `Ждём вас! Карта: ${w.mapUrl}`;
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//invite//RU', 'BEGIN:VEVENT',
      `UID:${fmt(start)}-wedding@invite`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:${title}`, `LOCATION:${place}`, `DESCRIPTION:${about}`,
      'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', 'DESCRIPTION:Сегодня свадьба!', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
    return;
  }
  const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${fmt(start)}/${fmt(end)}`, location: place, details: about });
  window.open('https://calendar.google.com/calendar/render?' + q, '_blank', 'noopener');
}

// Блок с деталями под сценой: дата, отсчёт, место, программа, ответ гостя.
function renderDetails(root) {
  const w = WEDDING;
  root.innerHTML = `
    <div class="details__inner">
      <p class="details__kicker" data-reveal>Дорогие родные и друзья</p>
      <h2 class="details__names" data-reveal>${w.groom} <span>&</span> ${w.bride}</h2>
      <p class="details__lead" data-reveal>Приглашаем вас разделить с нами самый счастливый день нашей жизни</p>

      <div class="details__date" data-reveal>
        <span>${weddingWeekday()}</span>
        <strong>${w.dateText}</strong>
        <span>${weddingTime()}</span>
      </div>

      <div class="countdown" data-countdown data-reveal>
        <div><b data-d>0</b><small>дней</small></div>
        <div><b data-h>0</b><small>часов</small></div>
        <div><b data-m>0</b><small>минут</small></div>
        <div><b data-s>0</b><small>секунд</small></div>
      </div>

      <div class="details__card" data-reveal>
        <p class="details__label">Где</p>
        <p class="details__venue">${w.venue}</p>
        <p class="details__address">${w.address}</p>
        <div class="details__actions">
          <a class="btn btn--solid" href="${w.mapUrl}" target="_blank" rel="noopener">Как добраться</a>
          <button class="btn" data-calendar>В календарь</button>
        </div>
      </div>

      <div class="details__card" data-reveal>
        <p class="details__label">Программа</p>
        <ul class="program">
          ${w.program.map(([t, s]) => `<li><time>${t}</time><span>${s}</span></li>`).join('')}
        </ul>
      </div>

      <div class="details__card rsvp" data-rsvp data-reveal ${API_URL ? '' : 'hidden'}>
        <p class="details__label">Вы с нами?</p>
        <input class="rsvp__name" data-name placeholder="Ваше имя и фамилия" maxlength="80" autocomplete="name" ${GUEST_ID ? 'hidden' : ''}>
        <div class="rsvp__count">
          <span>Сколько вас будет</span>
          <div class="stepper">
            <button type="button" data-step="-1" aria-label="Меньше">−</button>
            <b data-count>1</b>
            <button type="button" data-step="1" aria-label="Больше">+</button>
          </div>
        </div>
        <div class="rsvp__buttons">
          <button class="btn btn--solid" data-answer="yes">С радостью приду</button>
          <button class="btn" data-answer="no">К сожалению, не смогу</button>
        </div>
        <p class="rsvp__thanks" hidden></p>
      </div>

      <p class="details__sign" data-reveal>С любовью, ${initials()}</p>
    </div>`;

  // Отсчёт: цифра «перелистывается», когда меняется
  const target = new Date(w.date).getTime();
  const cd = root.querySelector('[data-countdown]');
  const set = (sel, v) => {
    const el = cd.querySelector(sel);
    if (el.textContent === String(v)) return;
    el.textContent = v;
    el.classList.remove('flip');
    void el.offsetWidth;
    el.classList.add('flip');
  };
  const tick = () => {
    const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    set('[data-d]', Math.floor(s / 86400));
    set('[data-h]', Math.floor(s / 3600) % 24);
    set('[data-m]', Math.floor(s / 60) % 60);
    set('[data-s]', s % 60);
  };
  tick();
  setInterval(tick, 1000);

  // Ответ гостя уходит в таблицу; по личной ссылке имя уже известно
  const rsvp = root.querySelector('[data-rsvp]');
  const nameInput = rsvp.querySelector('[data-name]');
  const thanks = rsvp.querySelector('.rsvp__thanks');
  const countEl = rsvp.querySelector('[data-count]');
  let count = 1, sending = false;
  const say = (text, bad) => { thanks.textContent = text; thanks.hidden = false; thanks.classList.toggle('is-bad', !!bad); };
  const mark = answer => rsvp.querySelectorAll('[data-answer]').forEach(x => x.classList.toggle('is-active', x.dataset.answer === answer));

  rsvp.addEventListener('click', async e => {
    const step = e.target.closest('[data-step]');
    if (step) {
      count = Math.max(1, Math.min(10, count + Number(step.dataset.step)));
      countEl.textContent = count;
      return;
    }
    const b = e.target.closest('[data-answer]');
    if (!b || sending) return;
    const yes = b.dataset.answer === 'yes';
    const params = { action: 'answer', answer: b.dataset.answer, people: yes ? count : 0 };
    if (GUEST_ID) params.id = GUEST_ID;
    else {
      params.name = nameInput.value.trim();
      if (!params.name) { say('Напишите, пожалуйста, ваше имя', true); nameInput.focus(); return; }
    }
    sending = true;
    say('Отправляем…');
    try {
      const r = await api(params);
      if (!r.ok) throw new Error(r.error);
      mark(b.dataset.answer);
      say(yes ? 'Спасибо! Ждём вас 💛' : 'Жаль! Будем думать о вас в этот день.');
      if (yes) {
        const rc = b.getBoundingClientRect();
        Confetti.burst(rc.left + rc.width / 2, rc.top);
        vibrate([20, 40, 20]);
      }
    } catch (err) {
      say('Не получилось отправить. Проверьте интернет и нажмите ещё раз.', true);
    }
    sending = false;
  });
  nameInput.addEventListener('input', () => thanks.classList.contains('is-bad') && (thanks.hidden = true));

  // Личная ссылка: обращаемся по имени и показываем прошлый ответ
  guestReady.then(g => {
    if (!g) return;
    root.querySelector('.details__kicker').textContent = g.name;
    if (g.answer) {
      mark(g.answer);
      if (g.people) { count = g.people; countEl.textContent = count; }
      say(g.answer === 'yes' ? 'Вы уже ответили: придёте. Можно изменить ответ.' : 'Вы ответили, что не сможете прийти. Можно изменить ответ.');
    }
  });
  root.querySelector('[data-calendar]').addEventListener('click', addToCalendar);

  // Блоки выплывают по мере прокрутки
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { threshold: .15 });
  root.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  const d = document.querySelector('[data-details]');
  if (d) renderDetails(d);
});
