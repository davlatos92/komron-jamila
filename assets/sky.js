// Карта звёздного неба на заданные место и время: яркие звёзды (RA в часах, Dec в градусах,
// звёздная величина) и линии созвездий. Проекция стереографическая, зенит в центре,
// север сверху, восток слева — как если смотреть на небо снизу.
const Sky = (() => {
  const S = {
    Polaris: [2.53, 89.26, 2.0], Kochab: [14.85, 74.16, 2.1], Pherkad: [15.35, 71.83, 3.0], Yildun: [17.54, 86.59, 4.4],
    EpsUMi: [16.77, 82.04, 4.2], ZetaUMi: [15.73, 77.79, 4.3], EtaUMi: [16.29, 75.76, 5.0],
    Dubhe: [11.06, 61.75, 1.8], Merak: [11.03, 56.38, 2.4], Phecda: [11.9, 53.69, 2.4], Megrez: [12.26, 57.03, 3.3],
    Alioth: [12.9, 55.96, 1.8], Mizar: [13.4, 54.93, 2.2], Alkaid: [13.79, 49.31, 1.9],
    Caph: [0.15, 59.15, 2.3], Schedar: [0.68, 56.54, 2.2], Navi: [0.95, 60.72, 2.5], Ruchbah: [1.43, 60.24, 2.7], Segin: [1.91, 63.67, 3.4],
    Deneb: [20.69, 45.28, 1.3], Sadr: [20.37, 40.26, 2.2], Albireo: [19.51, 27.96, 3.1], GienahCyg: [20.77, 33.97, 2.5], Fawaris: [19.75, 45.13, 2.9],
    Vega: [18.62, 38.78, 0.0], Sheliak: [18.83, 33.36, 3.5], Sulafat: [18.98, 32.69, 3.3],
    Altair: [19.85, 8.87, 0.8], Tarazed: [19.77, 10.61, 2.7], Alshain: [19.92, 6.41, 3.7],
    Arcturus: [14.26, 19.18, -0.05], Izar: [14.75, 27.07, 2.4], Muphrid: [13.91, 18.4, 2.7], Seginus: [14.53, 38.31, 3.0], Nekkar: [15.03, 40.39, 3.5],
    Alphecca: [15.58, 26.71, 2.2], Nusakan: [15.46, 29.11, 3.7], ThetaCrB: [15.55, 31.36, 4.1], GammaCrB: [15.71, 26.3, 3.8], DeltaCrB: [15.83, 26.07, 4.6], EpsCrB: [15.96, 26.88, 4.1],
    Kornephoros: [16.5, 21.49, 2.8], ZetaHer: [16.69, 31.6, 2.8], EtaHer: [16.71, 38.92, 3.5], PiHer: [17.25, 36.81, 3.2], EpsHer: [17.0, 30.93, 3.9],
    Antares: [16.49, -26.43, 1.0], Dschubba: [16.01, -22.62, 2.3], Acrab: [16.09, -19.81, 2.6], PiSco: [15.98, -26.11, 2.9], TauSco: [16.6, -28.22, 2.8],
    EpsSco: [16.84, -34.29, 2.3], MuSco: [16.86, -38.05, 3.0], EtaSco: [17.2, -43.24, 3.3], Sargas: [17.62, -43.0, 1.9], KappaSco: [17.71, -39.03, 2.4],
    Shaula: [17.56, -37.1, 1.6], Lesath: [17.51, -37.3, 2.7],
    KausAustralis: [18.4, -34.38, 1.8], KausMedia: [18.35, -29.83, 2.7], KausBorealis: [18.47, -25.42, 2.8], Nunki: [18.92, -26.3, 2.0],
    Ascella: [19.04, -29.88, 2.6], PhiSgr: [18.76, -26.99, 3.2], Alnasl: [18.1, -30.42, 3.0],
    Regulus: [10.14, 11.97, 1.4], EtaLeo: [10.12, 16.76, 3.5], Algieba: [10.33, 19.84, 2.0], Adhafera: [10.28, 23.42, 3.4], Rasalas: [9.88, 26.01, 3.9],
    Zosma: [11.24, 20.52, 2.6], Chertan: [11.24, 15.43, 3.3], Denebola: [11.82, 14.57, 2.1],
    Spica: [13.42, -11.16, 1.0], Porrima: [12.69, -1.45, 2.7], Vindemiatrix: [13.04, 10.96, 2.8], Zavijava: [11.84, 1.76, 3.6], Minelauva: [12.93, 3.4, 3.4],
    Rasalhague: [17.58, 12.56, 2.1], Cebalrai: [17.72, 4.57, 2.8], Sabik: [17.17, -15.72, 2.4], ZetaOph: [16.62, -10.57, 2.6], YedPrior: [16.24, -3.69, 2.7], KappaOph: [16.96, 9.38, 3.2],
    Eltanin: [17.94, 51.49, 2.2], Rastaban: [17.51, 52.3, 2.8], Grumium: [17.89, 56.87, 3.8], NuDra: [17.54, 55.18, 4.9], Altais: [19.21, 67.66, 3.1],
    Thuban: [14.07, 64.38, 3.7], Edasich: [15.42, 58.97, 3.3],
    GienahCrv: [12.26, -17.54, 2.6], Kraz: [12.57, -23.4, 2.6], Algorab: [12.5, -16.52, 2.9], Minkar: [12.17, -22.62, 3.0],
    Zubenelgenubi: [14.85, -16.04, 2.8], Zubeneschamali: [15.28, -9.38, 2.6], Brachium: [15.07, -25.28, 3.3],
    Capella: [5.28, 46.0, 0.1], Mirfak: [3.41, 49.86, 1.8], Algol: [3.14, 40.96, 2.1], Alpheratz: [0.14, 29.09, 2.1],
    Scheat: [23.06, 28.08, 2.4], Markab: [23.08, 15.2, 2.5], Algenib: [0.22, 15.18, 2.8], Enif: [21.74, 9.88, 2.4], Fomalhaut: [22.96, -29.62, 1.2],
    Pollux: [7.76, 28.03, 1.1], Castor: [7.58, 31.89, 1.6], Procyon: [7.66, 5.22, 0.4], Sirius: [6.75, -16.72, -1.5],
    Betelgeuse: [5.92, 7.41, 0.5], Rigel: [5.24, -8.2, 0.1], Aldebaran: [4.6, 16.51, 0.9], Hamal: [2.12, 23.46, 2.0],
  };

  const LINES = [
    'Dubhe-Merak Merak-Phecda Phecda-Megrez Megrez-Dubhe Megrez-Alioth Alioth-Mizar Mizar-Alkaid',
    'Polaris-Yildun Yildun-EpsUMi EpsUMi-ZetaUMi ZetaUMi-Kochab Kochab-Pherkad Pherkad-EtaUMi EtaUMi-ZetaUMi',
    'Caph-Schedar Schedar-Navi Navi-Ruchbah Ruchbah-Segin',
    'Deneb-Sadr Sadr-Albireo GienahCyg-Sadr Sadr-Fawaris',
    'Vega-Sheliak Sheliak-Sulafat Sulafat-Vega',
    'Altair-Tarazed Altair-Alshain',
    'Arcturus-Izar Izar-Nekkar Nekkar-Seginus Seginus-Arcturus Arcturus-Muphrid',
    'Nusakan-ThetaCrB Nusakan-Alphecca Alphecca-GammaCrB GammaCrB-DeltaCrB DeltaCrB-EpsCrB',
    'EpsHer-ZetaHer ZetaHer-EtaHer EtaHer-PiHer PiHer-EpsHer ZetaHer-Kornephoros',
    'Acrab-Dschubba PiSco-Dschubba Dschubba-Antares Antares-TauSco TauSco-EpsSco EpsSco-MuSco MuSco-EtaSco EtaSco-Sargas Sargas-KappaSco KappaSco-Shaula Shaula-Lesath',
    'Alnasl-KausMedia KausMedia-KausAustralis KausAustralis-Alnasl KausMedia-KausBorealis KausBorealis-PhiSgr PhiSgr-KausMedia PhiSgr-Nunki Nunki-Ascella Ascella-KausAustralis Ascella-PhiSgr',
    'Regulus-EtaLeo EtaLeo-Algieba Algieba-Adhafera Adhafera-Rasalas Algieba-Zosma Zosma-Denebola Denebola-Chertan Chertan-Regulus',
    'Spica-Porrima Porrima-Zavijava Porrima-Minelauva Minelauva-Vindemiatrix',
    'Rasalhague-Cebalrai Cebalrai-Sabik Sabik-ZetaOph ZetaOph-YedPrior YedPrior-KappaOph KappaOph-Rasalhague',
    'Eltanin-Rastaban Rastaban-NuDra NuDra-Grumium Grumium-Eltanin Grumium-Altais Edasich-Thuban',
    'GienahCrv-Algorab Algorab-Kraz Kraz-Minkar Minkar-GienahCrv',
    'Zubeneschamali-Zubenelgenubi Zubenelgenubi-Brachium',
    'Alpheratz-Scheat Scheat-Markab Markab-Algenib Algenib-Alpheratz',
    'Castor-Pollux Betelgeuse-Rigel',
  ].join(' ').split(' ').map(s => s.split('-'));

  const LABELS = { Vega: 'Вега', Deneb: 'Денеб', Altair: 'Альтаир', Arcturus: 'Арктур', Antares: 'Антарес', Spica: 'Спика', Polaris: 'Полярная', Regulus: 'Регул' };

  const rad = Math.PI / 180;

  function altAz(raH, decD, lat, lon, date) {
    const jd = date.getTime() / 86400000 + 2440587.5;
    const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545)) % 360;
    const H = (gmst + lon - raH * 15) * rad;
    const d = decD * rad, f = lat * rad;
    const alt = Math.asin(Math.sin(f) * Math.sin(d) + Math.cos(f) * Math.cos(d) * Math.cos(H));
    const az = Math.atan2(-Math.sin(H) * Math.cos(d), Math.cos(f) * Math.sin(d) - Math.sin(f) * Math.cos(d) * Math.cos(H));
    return { alt, az };
  }

  function draw(canvas, { lat, lon, time }) {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const size = canvas.clientWidth;
    canvas.width = canvas.height = size * dpr;
    const c = canvas.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = size / 2, cy = size / 2, R = size / 2 - size * 0.075;
    const date = new Date(time);

    const proj = (alt, az) => {
      const r = R * Math.tan((Math.PI / 2 - alt) / 2);
      return [cx - r * Math.sin(az), cy - r * Math.cos(az)];
    };

    // Фон и рамка
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, '#1d2a5a');
    g.addColorStop(1, '#0a0f27');
    c.fillStyle = g;
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();

    c.strokeStyle = 'rgba(214,183,128,.9)';
    c.lineWidth = 1.5;
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    c.lineWidth = .7;
    c.beginPath(); c.arc(cx, cy, R + size * 0.02, 0, Math.PI * 2); c.stroke();

    c.setLineDash([2, 4]);
    c.strokeStyle = 'rgba(255,255,255,.12)';
    for (const a of [30, 60]) {
      const r = R * Math.tan((90 - a) * rad / 2);
      c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
    }
    c.setLineDash([]);

    c.save();
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.clip();

    const pos = {};
    for (const k in S) {
      const [ra, dec, mag] = S[k];
      const { alt, az } = altAz(ra, dec, lat, lon, date);
      if (alt > -0.05) pos[k] = { p: proj(alt, az), mag };
    }

    c.strokeStyle = 'rgba(214,183,128,.45)';
    c.lineWidth = 1;
    for (const [a, b] of LINES) {
      if (!pos[a] || !pos[b]) continue;
      c.beginPath(); c.moveTo(...pos[a].p); c.lineTo(...pos[b].p); c.stroke();
    }

    for (const k in pos) {
      const { p: [x, y], mag } = pos[k];
      const r = Math.max(0.8, (4.2 - mag) * size / 420);
      const glow = c.createRadialGradient(x, y, 0, x, y, r * 3.5);
      glow.addColorStop(0, 'rgba(255,255,255,.55)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = glow;
      c.beginPath(); c.arc(x, y, r * 3.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff';
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      if (LABELS[k]) {
        c.fillStyle = 'rgba(255,240,215,.75)';
        c.font = `italic ${Math.round(size / 34)}px "Cormorant Garamond", serif`;
        c.fillText(LABELS[k], x + r + 4, y - r - 2);
      }
    }
    c.restore();

    // Стороны света: смотрим снизу, поэтому восток слева
    c.fillStyle = 'rgba(214,183,128,.95)';
    c.font = `500 ${Math.round(size / 28)}px "Cormorant Garamond", serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const o = R + size * 0.045;
    c.fillText('С', cx, cy - o);
    c.fillText('Ю', cx, cy + o);
    c.fillText('В', cx - o, cy);
    c.fillText('З', cx + o, cy);
  }

  return { draw };
})();
