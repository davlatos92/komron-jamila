// Данные свадьбы — всё, что меняется под конкретную пару, лежит здесь.
const WEDDING = {
  groom: 'Комрон',
  bride: 'Джамиля',
  groomGen: 'Комрона',   // родительный падеж — для фраз «звезда Комрона»
  brideGen: 'Джамили',
  hisYear: 1997,
  herYear: 2006,
  date: '2026-11-05T18:00:00+05:00',
  dateText: '5 ноября 2026',
  weekday: 'четверг',
  venue: 'Ресторан «Название»',
  address: 'г. Душанбе, ул. Примерная, 1',
  mapUrl: 'https://maps.google.com/?q=Dushanbe',
  program: [
    ['18:00', 'Сбор гостей'],
    ['18:30', 'Торжественная часть'],
    ['19:30', 'Праздничный ужин'],
    ['22:30', 'Свадебный торт'],
  ],
  // Небо для карты звёзд (концепция B)
  sky: { lat: 38.56, lon: 68.78, city: 'Душанбе', time: '2026-11-05T21:30:00+05:00', timeText: '21:30' },
};

function initials() {
  return WEDDING.groom[0] + ' & ' + WEDDING.bride[0];
}

// Блок с деталями под сценой: дата, отсчёт, место, программа, ответ гостя.
function renderDetails(root) {
  const w = WEDDING;
  root.innerHTML = `
    <div class="details__inner">
      <p class="details__kicker">Дорогие родные и друзья</p>
      <h2 class="details__names">${w.groom} <span>&</span> ${w.bride}</h2>
      <p class="details__lead">Приглашаем вас разделить с нами самый счастливый день нашей жизни</p>

      <div class="details__date">
        <span>${w.weekday}</span>
        <strong>${w.dateText}</strong>
        <span>${w.program[0][0]}</span>
      </div>

      <div class="countdown" data-countdown>
        <div><b data-d>0</b><small>дней</small></div>
        <div><b data-h>0</b><small>часов</small></div>
        <div><b data-m>0</b><small>минут</small></div>
        <div><b data-s>0</b><small>секунд</small></div>
      </div>

      <div class="details__card">
        <p class="details__label">Где</p>
        <p class="details__venue">${w.venue}</p>
        <p class="details__address">${w.address}</p>
        <a class="btn" href="${w.mapUrl}" target="_blank" rel="noopener">Открыть карту</a>
      </div>

      <div class="details__card">
        <p class="details__label">Программа</p>
        <ul class="program">
          ${w.program.map(([t, s]) => `<li><time>${t}</time><span>${s}</span></li>`).join('')}
        </ul>
      </div>

      <div class="details__card rsvp" data-rsvp>
        <p class="details__label">Вы с нами?</p>
        <div class="rsvp__buttons">
          <button class="btn btn--solid" data-answer="yes">С радостью приду</button>
          <button class="btn" data-answer="no">К сожалению, не смогу</button>
        </div>
        <p class="rsvp__thanks" hidden></p>
      </div>

      <p class="details__sign">С любовью, ${initials()}</p>
    </div>`;

  const target = new Date(w.date).getTime();
  const cd = root.querySelector('[data-countdown]');
  const tick = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    cd.querySelector('[data-d]').textContent = Math.floor(s / 86400);
    cd.querySelector('[data-h]').textContent = Math.floor(s / 3600) % 24;
    cd.querySelector('[data-m]').textContent = Math.floor(s / 60) % 60;
    cd.querySelector('[data-s]').textContent = s % 60;
  };
  tick();
  setInterval(tick, 1000);

  const rsvp = root.querySelector('[data-rsvp]');
  rsvp.addEventListener('click', e => {
    const b = e.target.closest('[data-answer]');
    if (!b) return;
    const thanks = rsvp.querySelector('.rsvp__thanks');
    thanks.textContent = b.dataset.answer === 'yes'
      ? 'Спасибо! Ждём вас 💛'
      : 'Жаль! Будем думать о вас в этот день.';
    thanks.hidden = false;
    rsvp.querySelectorAll('[data-answer]').forEach(x => x.classList.toggle('is-active', x === b));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const d = document.querySelector('[data-details]');
  if (d) renderDetails(d);
});
