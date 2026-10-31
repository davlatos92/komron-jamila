// Временная графика-заглушка. Когда будут настоящие фото, слои детских снимков
// заменятся на вырезанные PNG (ребёнок / средний план / фон).
const Art = (() => {
  const svg = (vb, body, keep) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="100%" height="100%"` +
    (keep ? '' : ' preserveAspectRatio="none"') + `>${body}</svg>`;

  function boy(c = '#5a4330', d = '#3e2d20') {
    return svg('0 0 100 200', `
      <ellipse cx="50" cy="194" rx="34" ry="5" fill="#000" opacity=".15"/>
      <rect x="33" y="122" width="13" height="64" rx="6" fill="${c}"/>
      <rect x="54" y="122" width="13" height="64" rx="6" fill="${c}"/>
      <ellipse cx="38" cy="188" rx="11" ry="6" fill="${d}"/>
      <ellipse cx="62" cy="188" rx="11" ry="6" fill="${d}"/>
      <rect x="28" y="112" width="44" height="30" rx="6" fill="${d}"/>
      <rect x="26" y="58" width="48" height="64" rx="16" fill="${c}"/>
      <rect x="14" y="62" width="13" height="50" rx="6" fill="${c}" transform="rotate(12 20 62)"/>
      <rect x="73" y="62" width="13" height="46" rx="6" fill="${c}" transform="rotate(-28 80 62)"/>
      <circle cx="93" cy="44" r="15" fill="${d}"/>
      <path d="M85 36 Q93 44 101 36 M93 29 V59" stroke="${c}" stroke-width="2" fill="none"/>
      <circle cx="50" cy="36" r="23" fill="${c}"/>
      <path d="M27 32 Q30 10 52 12 Q72 12 74 32 Q62 22 50 24 Q38 22 27 32Z" fill="${d}"/>`, true);
  }

  function girl(c = '#7a4a3a', d = '#55302a') {
    return svg('0 0 100 200', `
      <ellipse cx="50" cy="194" rx="34" ry="5" fill="#000" opacity=".15"/>
      <rect x="36" y="130" width="11" height="56" rx="5" fill="${c}"/>
      <rect x="53" y="130" width="11" height="56" rx="5" fill="${c}"/>
      <ellipse cx="40" cy="188" rx="10" ry="5" fill="${d}"/>
      <ellipse cx="60" cy="188" rx="10" ry="5" fill="${d}"/>
      <path d="M34 60 Q50 54 66 60 L84 140 Q50 150 16 140 Z" fill="${c}"/>
      <path d="M22 132 Q50 142 78 132" stroke="${d}" stroke-width="4" fill="none"/>
      <rect x="15" y="64" width="12" height="46" rx="6" fill="${c}" transform="rotate(18 21 64)"/>
      <rect x="73" y="64" width="12" height="46" rx="6" fill="${c}" transform="rotate(-18 79 64)"/>
      <circle cx="10" cy="110" r="7" fill="#e8a0a8"/><circle cx="4" cy="103" r="5" fill="#f3c4c9"/><circle cx="14" cy="101" r="5" fill="#f6d36e"/>
      <circle cx="50" cy="35" r="22" fill="${c}"/>
      <path d="M28 34 Q28 10 50 11 Q72 10 72 34 Q62 20 50 22 Q38 20 28 34Z" fill="${d}"/>
      <path d="M28 30 Q14 40 18 62 Q26 50 30 40Z M72 30 Q86 40 82 62 Q74 50 70 40Z" fill="${d}"/>
      <circle cx="22" cy="30" r="5" fill="#e07a8a"/><circle cx="78" cy="30" r="5" fill="#e07a8a"/>`, true);
  }

  const mountains = (f, f2) => svg('0 0 400 120', `
    <path d="M0 120 L0 70 L40 40 L70 62 L120 12 L160 55 L190 38 L240 80 L280 30 L330 70 L360 50 L400 75 L400 120Z" fill="${f}"/>
    <path d="M120 12 L105 28 L118 25 L128 32 L136 22Z M280 30 L268 44 L282 40 L292 48Z" fill="${f2}" opacity=".9"/>`);

  const hills = f => svg('0 0 400 100', `
    <path d="M0 100 L0 50 Q60 10 130 40 Q200 70 270 30 Q340 0 400 40 L400 100Z" fill="${f}"/>`);

  const tree = (trunk, leaf, leaf2) => svg('0 0 100 160', `
    <rect x="44" y="80" width="12" height="78" rx="4" fill="${trunk}"/>
    <circle cx="50" cy="52" r="34" fill="${leaf}"/><circle cx="26" cy="72" r="22" fill="${leaf2}"/>
    <circle cx="74" cy="70" r="24" fill="${leaf2}"/><circle cx="50" cy="30" r="22" fill="${leaf2}"/>`, true);

  const grass = (f, f2) => svg('0 0 400 60', `
    <path d="M0 60 L0 24 Q100 6 200 18 Q300 30 400 12 L400 60Z" fill="${f}"/>
    ${Array.from({ length: 46 }, (_, i) => {
      const x = i * 8.8 + (i % 3) * 2, h = 10 + (i * 37 % 14);
      return `<path d="M${x} 30 q2 -${h} 5 -${h + 4} q-1 ${h} 1 ${h + 6}" fill="${f2}"/>`;
    }).join('')}`);

  const cloud = (c = '#fff') => svg('0 0 200 90', `
    <defs><radialGradient id="cg"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="70" cy="55" rx="62" ry="30" fill="url(#cg)"/><ellipse cx="120" cy="42" rx="70" ry="38" fill="url(#cg)"/>
    <ellipse cx="150" cy="60" rx="48" ry="24" fill="url(#cg)"/>`);

  const sun = c => svg('0 0 100 100', `
    <defs><radialGradient id="sg"><stop offset=".35" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs>
    <circle cx="50" cy="50" r="50" fill="url(#sg)"/>`, true);

  const flowers = (g, petals) => svg('0 0 400 80', `
    <path d="M0 80 L0 30 Q100 12 200 26 Q300 38 400 20 L400 80Z" fill="${g}"/>
    ${Array.from({ length: 60 }, (_, i) => {
      const x = (i * 53) % 400, y = 34 + (i * 29) % 40, r = 2.5 + (i % 3);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${petals[i % petals.length]}"/>`;
    }).join('')}`);

  const house = (wall, roof) => svg('0 0 120 100', `
    <rect x="15" y="40" width="90" height="58" fill="${wall}"/>
    <path d="M5 44 L60 6 L115 44Z" fill="${roof}"/>
    <rect x="30" y="56" width="20" height="18" fill="#fff6e8" opacity=".85"/><rect x="70" y="56" width="20" height="18" fill="#fff6e8" opacity=".85"/>
    <rect x="52" y="70" width="16" height="28" fill="${roof}"/>`, true);

  const heart = c => svg('0 0 100 90', `
    <path d="M50 86 C10 58 0 36 12 18 C24 2 44 6 50 22 C56 6 76 2 88 18 C100 36 90 58 50 86Z" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 7"/>`, true);

  // Плоские версии детских снимков для альбома
  function photo(kind) {
    if (kind === 'his') return svg('0 0 100 120', `
      <rect width="100" height="120" fill="#e3d2b3"/>
      <circle cx="74" cy="26" r="12" fill="#f3e6c8"/>
      <path d="M0 80 L12 64 L22 72 L36 52 L50 70 L60 62 L76 80 L100 66 L100 120 L0 120Z" fill="#b59a76"/>
      <path d="M0 96 Q30 80 60 90 Q80 96 100 86 L100 120 L0 120Z" fill="#9c7f5c"/>
      <g transform="translate(30 58) scale(.28)">${boy().replace(/<\/?svg[^>]*>/g, '')}</g>`, true);
    return svg('0 0 100 120', `
      <rect width="100" height="120" fill="#f1d9c4"/>
      <circle cx="24" cy="24" r="12" fill="#fff1d6"/>
      <g transform="translate(58 62) scale(.28)">${house('#d9a58b', '#a86a58').replace(/<\/?svg[^>]*>/g, '')}</g>
      <path d="M0 92 Q40 80 100 90 L100 120 L0 120Z" fill="#b6b46e"/>
      ${Array.from({ length: 22 }, (_, i) => `<circle cx="${(i * 37) % 100}" cy="${96 + (i * 13) % 22}" r="1.6" fill="${['#f3c4c9', '#fff', '#f6d36e'][i % 3]}"/>`).join('')}
      <g transform="translate(26 62) scale(.27)">${girl().replace(/<\/?svg[^>]*>/g, '')}</g>`, true);
  }

  // ---- Настоящие детские фото ----
  const PHOTOS = { his: 'assets/photos/him.jpg', her: 'assets/photos/her.jpg' };
  // Фокус кадра (object-position): куда смотреть, чтобы в кадр попало лицо
  const FOCUS = {
    hisFace: '21% 44%', herFace: '54% 15%',   // крупно — лицо (круглая «звезда»)
    hisFig:  '19% 40%', herFig:  '53% 30%',    // голова + корпус (фигура в сцене)
  };

  // Круглое фото-«звезда» для варианта B (вписывается в круглый контейнер)
  function star(kind) {
    const pos = kind === 'his' ? FOCUS.hisFace : FOCUS.herFace;
    return `<img src="${PHOTOS[kind]}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:${pos};display:block;">`;
  }

  // Фигура ребёнка в сцене: фото с мягко растворённым краем (вместо рисунка-наклейки).
  // tone: 'sepia' — под сепию его мира, 'soft' — чуть тёплый, 'full' — живой цвет (финал).
  function figure(kind, tone = 'full') {
    const pos = kind === 'his' ? FOCUS.hisFig : FOCUS.herFig;
    const mask = 'radial-gradient(ellipse 60% 68% at 50% 42%, #000 56%, rgba(0,0,0,.35) 82%, transparent 100%)';
    const filter = tone === 'sepia' ? 'sepia(.55) contrast(1.03) brightness(1.02)'
                 : tone === 'soft'  ? 'saturate(.9) contrast(1.02)'
                 : 'contrast(1.02)';
    return `<div style="width:100%;height:100%;background:url('${PHOTOS[kind]}') ${pos}/cover no-repeat;` +
      `filter:${filter};-webkit-mask:${mask};mask:${mask};"></div>`;
  }

  // Прямоугольное фото в окно полароида (SVG <image> на место inner в polaroid()).
  // align — выравнивание кадра, напр. 'xMidYMid' | 'xMidYMin'.
  function photoImg(kind, align = 'xMidYMid') {
    return `<image href="${PHOTOS[kind]}" x="0" y="0" width="100" height="120" preserveAspectRatio="${align} slice"/>`;
  }

  return { boy, girl, mountains, hills, tree, grass, cloud, sun, flowers, house, heart, photo, star, figure, photoImg, PHOTOS, FOCUS };
})();
