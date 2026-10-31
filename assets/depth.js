// Движок «полёт вглубь» (zoom-параллакс): слои стоят на разной глубине z,
// скролл двигает камеру вперёд. Это тот же принцип, что в zoom.js у greenwoodhouse,
// только на DOM-трансформациях вместо canvas.
//
// Координаты слоя (x, y, w, h) задаются в единицах U (1/100 короткой стороны экрана)
// так, как слой выглядит из точки `view` (по умолчанию из стартовой камеры 0,0,0).
// Окна-группы (`groups`) обрезают свои слои по рамке, пока камера не пролетела сквозь неё.
const Depth = (() => {
  const F = 1000;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ramp = (v, a, b) => clamp((v - a) / (b - a));

  function interp(keys, p) {
    if (p <= keys[0].p) return keys[0];
    for (let i = 1; i < keys.length; i++) {
      const a = keys[i - 1], b = keys[i];
      if (p <= b.p) {
        let t = (p - a.p) / (b.p - a.p);
        if (b.ease) t = t * t * (3 - 2 * t);
        const r = {};
        for (const k in b) if (typeof b[k] === 'number' && k in a) r[k] = a[k] + (b[k] - a[k]) * t;
        return r;
      }
    }
    return keys[keys.length - 1];
  }

  function hex(c) {
    const n = parseInt(c.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    const A = hex(a), B = hex(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
  }
  function interpColors(keys, p) {
    if (p <= keys[0].p) return [keys[0].top, keys[0].bottom];
    for (let i = 1; i < keys.length; i++) {
      const a = keys[i - 1], b = keys[i];
      if (p <= b.p) {
        const t = (p - a.p) / (b.p - a.p);
        return [mix(a.top, b.top, t), mix(a.bottom, b.bottom, t)];
      }
    }
    const l = keys[keys.length - 1];
    return [l.top, l.bottom];
  }

  // Окно по времени: [появляется с, видно с, видно до, исчезло к]
  function showWindow(s, p) {
    if (!s) return 1;
    return Math.min(ramp(p, s[0], s[1] || s[0] + 1e-6), 1 - ramp(p, s[2] ?? 2, s[3] ?? 3));
  }

  function create({ stage, track, camera, sky, groups = [], layers, length = 12, onFrame }) {
    const W = { w: 0, h: 0, U: 1 };
    const groupEls = {};

    for (const g of groups) groupEls[g.id] = { ...g, ...toWorld(g), rect: null };

    const items = layers.map(spec => {
      const el = document.createElement('div');
      el.className = 'dz-layer ' + (spec.cls || '');
      el.style.cssText = 'position:absolute;left:50%;top:50%;will-change:transform,opacity;transform-origin:50% 50%';
      if (spec.html) el.innerHTML = spec.html;
      stage.appendChild(el);
      return { spec, el, ...toWorld(spec) };
    });

    // Перевод «как видно из view» в мировые координаты
    function toWorld(s) {
      const v = s.view || { x: 0, y: 0, z: 0 };
      const d0 = s.z - v.z;
      const k = d0 / F;
      return { wx: v.x + (s.x || 0) * k, wy: v.y + (s.y || 0) * k, d0 };
    }

    function resize() {
      W.w = innerWidth;
      W.h = innerHeight;
      W.U = Math.min(W.w, W.h * 0.7) / 100;
      track.style.height = length * 100 + 'vh';
      for (const it of items) {
        it.el.style.width = it.spec.w * W.U + 'px';
        it.el.style.height = it.spec.h * W.U + 'px';
        it.el.style.marginLeft = -it.spec.w * W.U / 2 + 'px';
        it.el.style.marginTop = -it.spec.h * W.U / 2 + 'px';
        if (it.spec.font) it.el.style.fontSize = it.spec.font * W.U + 'px';
      }
    }

    function project(wx, wy, z, cam) {
      const d = z - cam.z;
      const s = F / d;
      return { d, x: (wx - cam.x) * s * W.U, y: (wy - cam.y) * s * W.U };
    }

    function render(p) {
      const cam = interp(camera, p);
      const [top, bottom] = interpColors(sky, p);
      stage.style.background = `linear-gradient(${top}, ${bottom})`;

      // Экранный прямоугольник каждого окна; null — камера уже пролетела сквозь него
      for (const id in groupEls) {
        const g = groupEls[id];
        const pr = project(g.wx, g.wy, g.z, cam);
        if (pr.d < 2) { g.rect = null; continue; }
        const sc = g.d0 / pr.d;
        const hw = g.w * W.U * sc / 2, hh = g.h * W.U * sc / 2;
        g.rect = { l: pr.x - hw, r: pr.x + hw, t: pr.y - hh, b: pr.y + hh };
      }

      for (const it of items) {
        const s = it.spec;
        const pr = project(it.wx, it.wy, s.z, cam);
        const near = s.near || [20, 110];
        const far = s.far || [1700, 2400];
        let o = pr.d <= 1 ? 0 : ramp(pr.d, near[0], near[1]) * (1 - ramp(pr.d, far[0], far[1]));
        o *= showWindow(s.show, p) * (s.opacity ?? 1);
        if (o <= 0.002) { it.el.style.visibility = 'hidden'; continue; }
        const sc = it.d0 / pr.d;
        it.el.style.visibility = 'visible';
        it.el.style.opacity = o.toFixed(3);
        it.el.style.zIndex = Math.round(100000 - s.z * 10);
        it.el.style.transform = `translate3d(${pr.x.toFixed(1)}px,${pr.y.toFixed(1)}px,0) scale(${sc.toFixed(4)})` +
          (s.rot ? ` rotate(${s.rot}deg)` : '');
        // Слой внутри фото обрезается рамкой (в локальных координатах слоя)
        if (s.group) {
          const r = groupEls[s.group].rect;
          if (!r) { it.el.style.clipPath = 'none'; continue; }
          const hw = s.w * W.U / 2, hh = s.h * W.U / 2;
          const t = (r.t - pr.y) / sc + hh, b = hh - (r.b - pr.y) / sc;
          const l = (r.l - pr.x) / sc + hw, rr = hw - (r.r - pr.x) / sc;
          it.el.style.clipPath = `inset(${t.toFixed(1)}px ${rr.toFixed(1)}px ${b.toFixed(1)}px ${l.toFixed(1)}px)`;
        }
      }
      onFrame && onFrame(p, cam);
    }

    let target = 0, cur = 0, last = performance.now();
    const readScroll = () => {
      const max = track.offsetHeight - innerHeight;
      target = clamp(scrollY / max);
    };
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      cur += (target - cur) * (1 - Math.pow(0.0015, dt));
      if (Math.abs(target - cur) < 0.00005) cur = target;
      render(cur);
      requestAnimationFrame(loop);
    }

    addEventListener('resize', () => { resize(); readScroll(); });
    addEventListener('scroll', readScroll, { passive: true });
    resize();
    readScroll();
    cur = target;
    requestAnimationFrame(loop);
    return { render };
  }

  return { create, ramp, clamp, showWindow };
})();
