/* ============================================================
   iRiLLL MODZ — LOGIC.JS (full: UI + features + toggles)
   version: 2.5.4  (Dual aimbot: POV / Legacy + POV slider)
   License: LOCAL KEYLIST (offline, no pastefy)
   ============================================================ */
(function () {
  'use strict';
  if (window.__pb) return;

  /* ============================================================
     LICENSE GATE — LOCAL KEYLIST (tanpa pastefy / online)
     ============================================================ */
  var PF_KEY_LS    = 'iril_pf_key';
  var PF_TOKEN_LS  = 'iril_pf_token';
  var PF_EXP_LS    = 'iril_pf_exp';
  var PF_CACHE_MS  = 1 * 3600 * 1000;         // cache valid 1 jam (wajib input ulang tiap 1 jam)

  // ===== EDIT KEY LIST DI SINI =====
  // Format bebas: boleh spasi, pendek, emoji, simbol, apa pun.
  // Case-sensitive (IRIL ≠ iril).
  var PF_LOCAL_KEYS = [
    'IRIL',
    'IRIL-VIP-MODZ',
    'IRIL-ABCD-1234',
    'IRIL-EFGH-5678',
    'IRIL-IJKL-9012',
    'my key 123',
    'abc',
    'k',
    '🔥PREMIUM🔥'
  ];
  // ==================================

  function pfGet(k, d) {
    try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; }
  }
  function pfSet(k, v) {
    try { localStorage.setItem(k, v); } catch (e) {}
  }

  // Validasi lokal — tidak fetch, tidak perlu internet, instan
  function pfValidate(key, cb) {
    var target = String(key).trim();
    if (!target) { cb(false, 'invalid'); return; }
    var ok = PF_LOCAL_KEYS.some(function (k) { return k === target; });
    if (ok) {
      pfSet(PF_TOKEN_LS, 'ok_' + Date.now());
      pfSet(PF_EXP_LS, String(Date.now() + PF_CACHE_MS));
      cb(true);
    } else {
      cb(false, 'invalid');
    }
  }

  function pfCacheValid() {
    var tok = pfGet(PF_TOKEN_LS, '');
    var exp = parseInt(pfGet(PF_EXP_LS, '0'), 10) || 0;
    return !!(tok && exp > Date.now());
  }

  function pfPrompt(title, msg, cb) {
    function mk() {
      try {
        var wrap = document.createElement('div');
        wrap.setAttribute('data-pf-prompt', '1');
        wrap.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:2147483647;display:flex;align-items:center;justify-content:center;font:13px/1.4 system-ui,Tahoma,sans-serif';

        var box = document.createElement('div');
        box.style.cssText = 'background:#fff;border-radius:12px;padding:18px 18px 14px;width:min(340px,90vw);box-shadow:0 20px 50px rgba(0,0,0,.35);color:#0f172a';

        var t = document.createElement('div');
        t.textContent = title;
        t.style.cssText = 'font-weight:800;font-size:14px;margin-bottom:6px;color:#7c3aed';

        var m = document.createElement('div');
        m.textContent = msg;
        m.style.cssText = 'color:#475569;margin-bottom:10px;font-size:12px;line-height:1.5';

        var inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'Masukkan License Key';
        inp.style.cssText = 'width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #cbd5e1;border-radius:8px;font:13px monospace;outline:none';

        var row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:8px;margin-top:12px';

        var btnOk = document.createElement('button');
        btnOk.textContent = 'Aktifkan';
        btnOk.style.cssText = 'flex:1;padding:9px 0;border:0;border-radius:8px;background:#7c3aed;color:#fff;font-weight:800;cursor:pointer;font-size:12px';

        var btnNo = document.createElement('button');
        btnNo.textContent = 'Batal';
        btnNo.style.cssText = 'flex:0 0 84px;padding:9px 0;border:1px solid #cbd5e1;border-radius:8px;background:#f1f5f9;color:#334155;font-weight:700;cursor:pointer;font-size:12px';

        var st = document.createElement('div');
        st.style.cssText = 'margin-top:8px;font-size:11px;color:#b91c1c;min-height:14px';

        row.appendChild(btnOk); row.appendChild(btnNo);
        box.appendChild(t); box.appendChild(m); box.appendChild(inp);
        box.appendChild(row); box.appendChild(st);
        wrap.appendChild(box);
        (document.body || document.documentElement).appendChild(wrap);
        setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);

        function close() { try { wrap.remove(); } catch (e) {} }
        btnNo.addEventListener('click', function () { close(); cb(null); });
        function submit() {
          var k = (inp.value || '').trim();
          if (!k) { st.style.color = '#b91c1c'; st.textContent = 'Key tidak boleh kosong'; return; }
          st.style.color = '#7c3aed';
          st.textContent = 'Memverifikasi…';
          btnOk.disabled = true;
          btnOk.style.opacity = '.7';
          pfValidate(k, function (ok, reason) {
            btnOk.disabled = false;
            btnOk.style.opacity = '1';
            if (ok) { pfSet(PF_KEY_LS, k); close(); cb(k); }
            else {
              st.style.color = '#b91c1c';
              st.textContent = 'Key tidak valid';
            }
          });
        }
        btnOk.addEventListener('click', submit);
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
      } catch (e) { cb(null); }
    }
    if (document.body) mk();
    else document.addEventListener('DOMContentLoaded', mk, { once: true });
  }

  function pfGate() {
    if (pfCacheValid()) { bootCore(); startLicenseWatcher(); return; }
    var saved = pfGet(PF_KEY_LS, '');
    if (saved) {
      pfValidate(saved, function (ok) {
        if (ok) { bootCore(); startLicenseWatcher(); }
        else pfPrompt('License Required', 'Key tersimpan tidak valid. Masukkan key baru.', function (k) { if (k) { bootCore(); startLicenseWatcher(); } });
      });
    } else {
      pfPrompt('License Required', 'Masukkan License Key iRiLLL MODZ untuk melanjutkan.', function (k) { if (k) { bootCore(); startLicenseWatcher(); } });
    }
  }

  /* ============================================================
     LICENSE WATCHER — wajib input key ulang tiap 1 jam
     ============================================================ */
  var __pfWatcherStarted = false;
  function startLicenseWatcher() {
    if (__pfWatcherStarted) return;
    __pfWatcherStarted = true;

    setInterval(function () {
      try {
        if (pfCacheValid()) return;
        var existing = document.querySelector('div[data-pf-prompt="1"]');
        if (existing) return;
        try { if (window.__pb && window.__pb.off) window.__pb.off(); } catch (e) {}
        pfPrompt(
          'License Expired',
          'Sesi 1 jam kamu sudah habis. Masukkan License Key lagi untuk melanjutkan.',
          function (k) {
            if (k) {
              try { if (window.__pb && window.__pb.on) window.__pb.on(); } catch (e) {}
              __pfWatcherStarted = false;
              startLicenseWatcher();
            } else {
              setTimeout(function () {
                if (!pfCacheValid()) {
                  try { startLicenseWatcher(); } catch (e) {}
                }
              }, 5000);
            }
          }
        );
      } catch (e) {}
    }, 30000);
  }

  /* ============================================================
     BOOT CORE — seluruh logic fitur asli ada di sini
     ============================================================ */
  function bootCore() {
    var V = '2.5.4';
    var BRAND = 'iRiLLL MODZ';
    function log() { try { console.log.apply(console, ['[iR]'].concat([].slice.call(arguments))); } catch (e) {} }

    var SEED = (function () {
      try { return (crypto.getRandomValues(new Uint32Array(1))[0]) >>> 0; } catch (e) { return (Math.random() * 1e9) | 0; }
    })();

    /* LAYER 1 — preboot (dual-gate) */
    (function preboot() {
      try {
        if (!/\/jogo|game\.html/.test(location.pathname)) return;
        if (window.G || window.HUDO || window.GAME_READY) return;
        if (window.__pbBoot) return;
        window.__pbBoot = 1;
        try { var nb = +sessionStorage.getItem('pb_noboot') || 0; if (nb && Date.now() - nb < 120000) return; } catch (e0) {}
        if (document.readyState === 'complete') return;
        function xget(u, accept) {
          var x = new XMLHttpRequest(); x.open('GET', u, false);
          try { x.setRequestHeader('Accept', accept); } catch (e) {}
          x.send(null);
          if (x.status !== 200 || !x.responseText) throw new Error('xhr ' + x.status);
          return x.responseText;
        }
        var html = xget(location.href, 'text/html,*/*');
        if (html.indexOf('/static/game/bundle.js') < 0) return;
        var bm = /src="([^"]*\/static\/game\/bundle\.js[^"]*)"/.exec(html);
        if (!bm) return;
        var bsrc = xget(new URL(bm[1], location.href).href, '*/*');

        var gateJi = /ji\s*=\s*"localhost"===location\.hostname\|\|"127\.0\.0\.1"===location\.hostname\|\|"\[::1\]"===location\.hostname/;
        var gateUi = /const Ui="localhost"===location\.hostname\|\|"127\.0\.0\.1"===location\.hostname\|\|"\[::1\]"===location\.hostname,/;

        var patched = false;
        if (gateJi.test(bsrc)) { bsrc = bsrc.replace(gateJi, 'ji=!0'); patched = true; log('gate ji= matched'); }
        else if (gateUi.test(bsrc)) { bsrc = bsrc.replace(gateUi, 'const Ui=!0,'); patched = true; log('gate Ui= matched (legacy)'); }
        if (!patched) { log('gate tidak cocok, abort'); return; }

        var parsed = new DOMParser().parseFromString(html, 'text/html');
        var scripts = [].slice.call(parsed.querySelectorAll('script')).map(function (s) {
          return { src: s.getAttribute('src'), text: s.textContent, type: s.getAttribute('type') || '' };
        });
        if (!scripts.length) return;
        [].slice.call(parsed.querySelectorAll('script')).forEach(function (s) { if (s.parentNode) s.parentNode.removeChild(s); });
        var dt = parsed.doctype ? '<!doctype ' + parsed.doctype.name + '>' : '<!doctype html>';
        var clean = dt + parsed.documentElement.outerHTML;
        var burl = '';
        try { burl = URL.createObjectURL(new Blob([bsrc], { type: 'text/javascript' })); } catch (e1) {}
        try {
          if (document.referrer.indexOf('android-app://') === 0 ||
              matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches)
            document.cookie = 'pbapp=1; max-age=31536000; path=/; secure; samesite=lax';
        } catch (e4) {}
        try { document.open(); document.write(clean); document.close(); }
        catch (e2) { try { sessionStorage.setItem('pb_noboot', String(Date.now())); } catch (e3) {} location.reload(); return; }
        var i = 0;
        function next() {
          while (i < scripts.length) {
            var s = scripts[i++];
            try {
              var t = (s.type || '').toLowerCase();
              if (t && t.indexOf('javascript') < 0 && t.indexOf('ecmascript') < 0) continue;
              var el = document.createElement('script');
              var head = document.head || document.documentElement;
              if (s.src) {
                var abs;
                try { abs = new URL(s.src, location.href).href; } catch (eU) { abs = s.src; }
                if (/\/static\/game\/bundle\.js(\?|$)/.test(abs)) abs = burl || '';
                if (abs) {
                  el.src = abs; el.async = false;
                  var done = false;
                  var fin = function () { if (done) return; done = true; clearTimeout(to); next(); };
                  var to = setTimeout(fin, 20000);
                  el.onload = el.onerror = fin;
                  head.appendChild(el); return;
                }
                el.textContent = bsrc; head.appendChild(el); continue;
              }
              el.textContent = s.text; head.appendChild(el);
            } catch (eL) {}
          }
        }
        next();
        setTimeout(function () {
          try {
            if (window.HUDO || window.GAME_READY) return;
            if (document.querySelector('canvas')) return;
            try { sessionStorage.setItem('pb_noboot', String(Date.now())); } catch (e) {}
            location.reload();
          } catch (e) {}
        }, 20000);
      } catch (e) {}
    })();

    var HIDDEN = { pb: null, pbvis: null, pbnade: null, pbqc: null, pbx: null };

    // P — aim params. aimMode: 'pov' (default) atau 'legacy'
    // povMargin: 0.30 (cuma tengah) .. 0.98 (hampir seluruh layar)
    var P = { cone: 0.45, reach: 150, autoFire: 0, gain: 0.9, headR: 0.11, mode: 'near', bias: 0.35, aimMode: 'pov', povMargin: 0.90 };
    var O = { sens: 0.5, fov: 70, invert: false };
    function readOpts() {
      try {
        var s = localStorage.getItem('pbweb_opts');
        if (!s) return;
        var o = JSON.parse(s);
        if (typeof o.sens === 'number' && o.sens > 0) O.sens = o.sens;
        if (typeof o.fov === 'number' && o.fov > 0) O.fov = o.fov;
        O.invert = !!o.invert;
      } catch (e) {}
    }
    readOpts();
    try { addEventListener('pbopts', function () { readOpts(); }); } catch (e) {}

    // restore aimMode + povMargin dari localStorage
    try {
      var _am = localStorage.getItem('ir_aimmode');
      if (_am === 'legacy' || _am === 'pov') P.aimMode = _am;
      var _pm = parseFloat(localStorage.getItem('ir_povmargin'));
      if (isFinite(_pm) && _pm >= 0.30 && _pm <= 0.98) P.povMargin = _pm;
    } catch (e) {}

    var G = null, aimOn = true, fireHeld = 0, nextTap = 0, holding = false;
    var lastPick = null, st = { v: V, aim: true, G: false, bots: 0, enemies: 0, lock: 0, err: 0, fire: 0, dist: 0 };

    var DBG = { el: null, n: 0 };
    function dbg(t) {
      try {
        if (!DBG.el) {
          var d = document.createElement('div');
          d.setAttribute('data-pb', '1');
          d.style.cssText = 'position:fixed;left:6px;bottom:6px;padding:2px 6px;background:#000a;color:#fff;font:11px monospace;z-index:2147483000;pointer-events:none;border-radius:2px';
          (document.body || document.documentElement).appendChild(d);
          DBG.el = d;
        }
        DBG.el.textContent = t;
      } catch (e) {}
    }
    setInterval(function () {
      if (DBG.n > 3) return;
      if (game()) { dbg('iRiLLL MODZ'); if (++DBG.n > 3) { try { DBG.el.remove(); } catch (e) {} DBG.el = null; } }
      else if (!DBG.n) { dbg('iRiLLL MODZ'); }
    }, 1000);

    function game() {
      try {
        var g = window.G;
        if (g && g.P && g.P.s && g.camera && g.bots) return g;
      } catch (e) {}
      return null;
    }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function wrap(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
    function wpos(b, out) { var e = b.matrixWorld.elements; out.x = e[12]; out.y = e[13]; out.z = e[14]; return out; }
    var A = { x: 0, y: 0, z: 0 }, B = { x: 0, y: 0, z: 0 };

    /* ===== POV / LOS AIM HELPERS ===== */
    var _hpOut = { x: 0, y: 0, z: 0 };
    var _pv = null, _pDir = { x: 0, y: 0, z: 0 };

    function headPoint(p) {
      var by = p.c && p.c.byName; if (!by) return null;
      var h = by.Head || by.head || null, g = by.Bone_HeadGearAttach || null;
      if (!h && !g) return null;
      if (h && g) {
        wpos(h, A); wpos(g, B);
        _hpOut.x = (A.x + B.x) * .5;
        _hpOut.y = (A.y + B.y) * .5;
        _hpOut.z = (A.z + B.z) * .5;
      } else {
        wpos(h || g, _hpOut);
      }
      return _hpOut;
    }

    // target wajib masuk area layar (NDC). margin bisa diatur via slider (0.30..0.98)
    function isInsidePOV(cam, hp, margin) {
      try {
        if (!_pv) _pv = cam.position.clone();
        var ndc = _pv.set(hp.x, hp.y, hp.z).project(cam);
        var m = (margin == null) ? P.povMargin : margin;
        if (!(ndc.z > -1 && ndc.z < 1)) return false;
        return Math.abs(ndc.x) <= m && Math.abs(ndc.y) <= m;
      } catch (e) { return false; }
    }

    function hasLineOfSight(g, cam, hp) {
      try {
        if (typeof g.cast !== 'function') return true;
        var eye = cam.position;
        var dx = hp.x - eye.x, dy = hp.y - eye.y, dz = hp.z - eye.z;
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (!(dist > 0.5)) return false;
        _pDir.x = dx / dist; _pDir.y = dy / dist; _pDir.z = dz / dist;
        var hit = g.cast(eye, _pDir, dist - 0.35);
        return !hit;
      } catch (e) { return true; }
    }

    function isBotReal(p) {
      if (!p || !p.obj || !p.c) return false;
      if (p.dead || !(p.hp > 0)) return false;
      if (!p.obj.parent) return false;
      if (p.obj.visible === false) return false;
      return true;
    }

    function move(dx, dy) {
      var ev;
      try { ev = new MouseEvent('mousemove', { bubbles: true, cancelable: true, movementX: dx, movementY: dy }); }
      catch (e) { ev = new MouseEvent('mousemove', { bubbles: true, cancelable: true }); }
      if (ev.movementX !== dx) { try { Object.defineProperty(ev, 'movementX', { value: dx }); } catch (e) {} }
      if (ev.movementY !== dy) { try { Object.defineProperty(ev, 'movementY', { value: dy }); } catch (e) {} }
      (document.body || document.documentElement).dispatchEvent(ev);
    }
    function down() { try { (document.body || document.documentElement).dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })); } catch (e) {} }
    function up() { try { (document.body || document.documentElement).dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 })); } catch (e) {} holding = false; }

    var fireIds = new Set();
    function inZone(t) { return t.clientX > innerWidth * 0.50 && t.clientY > innerHeight * 0.45; }
    function syncFire() { fireHeld = fireIds.size; st.fire = fireHeld; }
    addEventListener('touchstart', function (e) {
      for (var i = 0; i < e.changedTouches.length; i++) { var t = e.changedTouches[i]; if (inZone(t)) fireIds.add(t.identifier); }
      syncFire();
    }, true);
    addEventListener('touchmove', function (e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (inZone(t)) fireIds.add(t.identifier); else fireIds.delete(t.identifier);
      }
      syncFire();
    }, true);
    function touchEnd(e) { for (var i = 0; i < e.changedTouches.length; i++) fireIds.delete(e.changedTouches[i].identifier); syncFire(); }
    addEventListener('touchend', touchEnd, true);
    addEventListener('touchcancel', touchEnd, true);

    var F = { x: 0, y: 0, z: 0 }, C = { x: 0, y: 0, z: 0 };

    function tick() {
      requestAnimationFrame(tick);
      if (!G) { G = game(); if (!G) return; st.G = true; log('G unlocked', V); try { buzz(30); } catch (e) {} }
      var g = G, self = g.P.s, cam = g.camera;
      if (!self || self.dead) { if (holding) up(); lastPick = null; st.lock = 0; return; }
      var now = performance.now(), m = cam.matrixWorld.elements;
      C.x = m[12]; C.y = m[13]; C.z = m[14];
      var yaw = +self.yaw || 0, pitch = +self.pitch || 0;
      var cp = Math.cos(pitch);
      F.x = -Math.sin(yaw) * cp; F.y = Math.sin(pitch); F.z = -Math.cos(yaw) * cp;

      var useLegacy = (P.aimMode === 'legacy');   // <-- toggle mode
      var povM = P.povMargin;                     // <-- slider POV

      var best = null, bestP = null, bestA = 1e9, bestD = 1e9, myTeam = self.team, list = g.bots, n = 0, en = 0;
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!isBotReal(p)) continue;
        n++;
        if (p.team === myTeam) continue;
        if (p === self) continue;

        var hp = headPoint(p); if (!hp) continue;
        var dx = hp.x - C.x, dy = hp.y - C.y, dz = hp.z - C.z;
        var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < 2 || d > P.reach) continue;

        // ---- POV MODE filters ----
        if (!useLegacy) {
          if (!isInsidePOV(cam, hp, povM)) continue;   // target wajib masuk POV
          if (!hasLineOfSight(g, cam, hp)) continue;   // target wajib kelihatan
        }

        en++;
        var ey = wrap(Math.atan2(-dx, -dz) - yaw);
        var ep = Math.asin(clamp(dy / d, -1, 1)) - pitch;
        var a = Math.sqrt(ey * ey + ep * ep);
        if (a > P.cone) continue;

        var better = (P.mode === 'angle') ? (a < bestA) : (d < bestD - P.bias || (d <= bestD + P.bias && a < bestA));
        if (better) { bestA = a; bestD = d; best = p; bestP = { x: hp.x, y: hp.y, z: hp.z }; }
      }
      st.bots = n; st.enemies = en;
      if (!best || !aimOn) { lastPick = null; st.lock = 0; if (holding) up(); return; }

      // ---- POV MODE re-verify ----
      if (!useLegacy) {
        if (!isInsidePOV(cam, bestP, Math.min(0.98, povM + 0.05)) || !hasLineOfSight(g, cam, bestP)) {
          lastPick = null; st.lock = 0; if (holding) up(); return;
        }
      }

      var t = O.sens * (cam.fov / O.fov) * 0.005;
      if (!(t > 0)) return;
      var ey2 = wrap(Math.atan2(-(bestP.x - C.x), -(bestP.z - C.z)) - yaw);
      var d2 = Math.hypot(bestP.x - C.x, bestP.y - C.y, bestP.z - C.z);
      var ep2 = Math.asin(clamp((bestP.y - C.y) / d2, -1, 1)) - pitch;
      var px = clamp(-ey2 / t * P.gain, -220, 220);
      var py = clamp((O.invert ? 1 : -1) * ep2 / t * P.gain, -220, 220);
      if (Math.abs(px) + Math.abs(py) > 0.5) move(px, py);
      st.err = bestA; st.dist = bestD; st.lock = 1; lastPick = best;

      if (!(P.autoFire || fireHeld) || now < nextTap || holding) return;

      // ---- POV MODE fire guard ----
      if (!useLegacy) {
        if (!hasLineOfSight(g, cam, bestP) && !FL.wallbang) return;
      }

      var hit = null;
      try { hit = best.hitTest(C, F, P.reach); } catch (e) { hit = null; }
      if (!hit || !hit.head) return;
      down(); holding = true;
      var holdMs = 45 + Math.random() * 30;
      setTimeout(function () { if (holding) up(); }, holdMs);
      nextTap = now + holdMs + 90 + Math.random() * 70;
    }

    function buzz(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }
    setInterval(function () {
      try { var Bx = window.PBAndroid, v; if (Bx && Bx.poll) v = Bx.poll();
        if (v === 1) { aimOn = true; st.aim = true; buzz([20, 40, 20]); }
        else if (v === -1) { aimOn = false; st.aim = false; up(); buzz(60); }
      } catch (e) {}
    }, 120);
    setInterval(function () { if (!G) { G = game(); if (G) { st.G = true; log('G late unlock'); } } }, 500);
    setInterval(function () {
      try {
        if (!window.__pbx && HIDDEN.pbx) { try { window.__pbx = HIDDEN.pbx; } catch (e) {} }
      } catch (e) {}
    }, 2000);

    /* ===== FEATURE FLAGS ===== */
    var FL = {
      wallbang: 1,
      infAmmo: 1,
      noRecoil: 1,
      godmode: 0,
      noclip: 0,
      nadeAim: 1,
      antiKick: 1
    };

    var PB_API = {
      state: function () {
        return {
          v: V, aim: aimOn, G: !!G,
          bots: st.bots, enemies: st.enemies, lock: st.lock,
          dist: +st.dist.toFixed(2), mode: P.mode, aimMode: P.aimMode, povMargin: P.povMargin,
          err: +(st.err * 57.2958).toFixed(2), fire: fireHeld, autoFire: P.autoFire,
          sens: O.sens, fov: O.fov
        };
      },
      cfg: function (o) { if (o) for (var k in o) if (k in P) P[k] = o[k]; return P; },
      on: function () { aimOn = true; st.aim = true; return 'on'; },
      off: function () { aimOn = false; st.aim = false; up(); return 'off'; },
      // API baru: set aim mode + pov margin
      aimMode: function (mode) {
        if (mode === 'pov' || mode === 'legacy') {
          P.aimMode = mode;
          try { localStorage.setItem('ir_aimmode', mode); } catch (e) {}
        }
        return P.aimMode;
      },
      povMargin: function (v) {
        if (typeof v === 'number' && v >= 0.30 && v <= 0.98) {
          P.povMargin = v;
          try { localStorage.setItem('ir_povmargin', String(v)); } catch (e) {}
        }
        return P.povMargin;
      },
      list: function () {
        var g = game(); if (!g) return 'no G';
        return (g.bots || []).map(function (p) {
          return { id: p.id, team: p.team, my: p.team === g.P.s.team, dead: !!p.dead, hp: p.hp, vis: p.obj && p.obj.visible, bot: !!p.isBot };
        });
      },
      head: function () {
        var hp = lastPick && headPoint(lastPick);
        return hp ? { x: +hp.x.toFixed(2), y: +hp.y.toFixed(2), z: +hp.z.toFixed(2), team: lastPick.team, hp: lastPick.hp } : null;
      }
    };
    window.__pb = PB_API; HIDDEN.pb = PB_API;

    /* ESP */
    var E = { on: 1, wrap: null, host: null, hostAt: 0, slots: [], last: 0, n: 0 };
    function eInit() {
      if (E.wrap && E.wrap.parentNode) return true;
      var host = document.body || document.documentElement;
      if (!host) return false;
      var w = document.createElement('div');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;overflow:hidden;pointer-events:none;z-index:2147483000';
      host.appendChild(w);
      E.wrap = w; E.slots = [];
      return true;
    }
    function eSlot(i) {
      var s = E.slots[i];
      if (s) return s;
      var box = document.createElement('div');
      box.style.cssText = 'position:absolute;left:0;top:0;box-sizing:border-box;border:1px solid rgba(0,200,90,.9);border-radius:1px;display:none;will-change:transform';
      var hb = document.createElement('div');
      hb.style.cssText = 'position:absolute;left:-1px;top:-5px;width:calc(100% + 2px);height:3px;background:rgba(0,0,0,.35)';
      var hf = document.createElement('div');
      hf.style.cssText = 'position:absolute;left:0;top:0;height:100%;width:100%;background:#2cc76a';
      hb.appendChild(hf);
      var dot = document.createElement('div');
      dot.style.cssText = 'position:absolute;left:50%;top:-4px;width:3px;height:3px;margin-left:-2px;background:#ff3b30;border-radius:50%';
      var tx = document.createElement('div');
      tx.style.cssText = 'position:absolute;right:0;top:-15px;font:10px/12px Tahoma,sans-serif;color:#0a5c2a;text-shadow:0 1px 2px #fff;white-space:nowrap;font-weight:700';
      box.appendChild(hb); box.appendChild(dot); box.appendChild(tx);
      E.wrap.appendChild(box);
      s = { box: box, hp: hf, tx: tx };
      E.slots[i] = s;
      return s;
    }
    function eClear() { for (var i = 0; i < E.slots.length; i++) E.slots[i].box.style.display = 'none'; E.n = 0; }
    function eHost() {
      var now = performance.now();
      if (E.host && E.host.parentNode && now - E.hostAt < 400) return E.host;
      E.hostAt = now;
      var best = null, ba = 0, cs = document.getElementsByTagName('canvas');
      for (var i = 0; i < cs.length; i++) {
        var c = cs[i];
        if (c.getAttribute('data-pb')) continue;
        var r = c.getBoundingClientRect(), a = r.width * r.height;
        if (a > ba) { ba = a; best = c; }
      }
      E.host = best || null;
      return E.host;
    }
    function eProj(cam, r, x, y, z) {
      if (!E.v) { try { E.v = cam.position.clone(); } catch (e) { return null; } }
      var d = E.v.set(x, y, z).project(cam);
      if (!(d.z > -1 && d.z < 1)) return null;
      return { x: r.left + (d.x * 0.5 + 0.5) * r.width, y: r.top + (-d.y * 0.5 + 0.5) * r.height };
    }
    function eDraw(g) {
      var cam = g.camera, list = g.bots, self = g.P && g.P.s;
      if (!list || !cam || !self || self.dead) { eClear(); return; }
      var host = eHost();
      if (!host) { eClear(); return; }
      var r = host.getBoundingClientRect();
      if (!(r.width > 0)) { eClear(); return; }
      var me = cam.matrixWorld && cam.matrixWorld.elements;
      var cx = me ? me[12] : 0, cy = me ? me[13] : 0, cz = me ? me[14] : 0;
      var my = self.team, idx = 0;
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || !p.obj || !p.c || p === self) continue;
        if (p.team === my) continue;
        if (p.dead || !(p.hp > 0)) continue;
        var hp = headPoint(p); if (!hp) continue;
        var mm = p.obj.matrixWorld && p.obj.matrixWorld.elements; if (!mm) continue;
        var a = eProj(cam, r, hp.x, hp.y, hp.z), b = eProj(cam, r, mm[12], mm[13], mm[14]);
        if (!a || !b) continue;
        var bh = b.y - a.y;
        if (!(bh > 6)) continue;
        if (a.x < r.left - 60 || a.x > r.left + r.width + 60 || b.y < r.top - 60 || a.y > r.top + r.height + 60) continue;
        var bw = bh * 0.42; if (bw > 400) bw = 400;
        var s = eSlot(idx++);
        s.box.style.display = 'block';
        s.box.style.transform = 'translate3d(' + (a.x - bw / 2).toFixed(1) + 'px,' + a.y.toFixed(1) + 'px,0)';
        s.box.style.width = bw.toFixed(1) + 'px';
        s.box.style.height = bh.toFixed(1) + 'px';
        var mxh = p.maxHp > 0 ? p.maxHp : 100;
        var f = Math.max(0, Math.min(1, (p.hp || 0) / mxh));
        s.hp.style.width = (f * 100).toFixed(0) + '%';
        s.hp.style.background = f > 0.5 ? '#2cc76a' : (f > 0.25 ? '#f5b942' : '#ff3b30');
        var dx = hp.x - cx, dy = hp.y - cy, dz = hp.z - cz;
        s.tx.textContent = Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz)) + 'm';
      }
      for (; idx < E.slots.length; idx++) E.slots[idx].box.style.display = 'none';
      E.n = idx;
    }
        /* BONE ESP */
    var BE = { on: 0, wrap: null, host: null, hostAt: 0, last: 0, range: 60 };
    var BONE_PAIRS = [
      ['Head','Neck'],['Neck','Spine3'],['Spine3','Spine2'],['Spine2','Spine1'],['Spine1','Pelvis'],
      ['Spine3','L_Clavicle'],['L_Clavicle','L_UpperArm'],['L_UpperArm','L_Forearm'],['L_Forearm','L_Hand'],
      ['Spine3','R_Clavicle'],['R_Clavicle','R_UpperArm'],['R_UpperArm','R_Forearm'],['R_Forearm','R_Hand'],
      ['Pelvis','L_Thigh'],['L_Thigh','L_Calf'],['L_Calf','L_Foot'],
      ['Pelvis','R_Thigh'],['R_Thigh','R_Calf'],['R_Calf','R_Foot']
    ];
    function beInit() {
      if (BE.wrap && BE.wrap.parentNode) return true;
      var host = document.body || document.documentElement;
      if (!host) return false;
      var w = document.createElement('canvas');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2147482999';
      host.appendChild(w);
      BE.wrap = w;
      BE.ctx = w.getContext('2d');
      return true;
    }
    function beClear() { if (BE.ctx && BE.wrap) { BE.ctx.clearRect(0, 0, BE.wrap.width, BE.wrap.height); } }
    function beHost() {
      var now = performance.now();
      if (BE.host && BE.host.parentNode && now - BE.hostAt < 400) return BE.host;
      BE.hostAt = now;
      var best = null, ba = 0, cs = document.getElementsByTagName('canvas');
      for (var i = 0; i < cs.length; i++) {
        var c = cs[i];
        if (c.getAttribute('data-pb')) continue;
        var r = c.getBoundingClientRect(), a = r.width * r.height;
        if (a > ba) { ba = a; best = c; }
      }
      BE.host = best || null;
      return BE.host;
    }
    function beProject(cam, r, b, out) {
      if (!BE._v) { try { BE._v = cam.position.clone(); } catch (e) { return false; } }
      var e = b.matrixWorld.elements;
      var d = BE._v.set(e[12], e[13], e[14]).project(cam);
      if (!(d.z > -1 && d.z < 1)) return false;
      out.x = r.left + (d.x * 0.5 + 0.5) * r.width;
      out.y = r.top + (-d.y * 0.5 + 0.5) * r.height;
      return true;
    }
    function beDraw(g) {
      if (!BE.on) { beClear(); return; }
      var cam = g.camera, list = g.bots, self = g.P && g.P.s;
      if (!list || !cam || !self || self.dead) { beClear(); return; }
      if (!beInit()) return;
      var host = beHost();
      if (!host) { beClear(); return; }
      var r = host.getBoundingClientRect();
      if (!(r.width > 0)) { beClear(); return; }
      var dpr = Math.min(2, devicePixelRatio || 1);
      var w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
      if (BE.wrap.width !== w || BE.wrap.height !== h) { BE.wrap.width = w; BE.wrap.height = h; }
      var ctx = BE.ctx;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(255,80,80,0.65)';
      ctx.shadowColor = 'rgba(255,80,80,0.4)';
      ctx.shadowBlur = 2;
      var my = self.team;
      var me = cam.matrixWorld.elements;
      var cx = me[12], cy = me[13], cz = me[14];
      var pa = { x: 0, y: 0 }, pb = { x: 0, y: 0 };
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || !p.obj || !p.c || p === self) continue;
        if (p.team === my) continue;
        if (p.dead || !(p.hp > 0)) continue;
        var mm = p.obj.matrixWorld && p.obj.matrixWorld.elements;
        if (!mm) continue;
        var dx = mm[12] - cx, dy = mm[13] - cy, dz = mm[14] - cz;
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist > BE.range) continue;
        var by = p.c.byName;
        if (!by) continue;
        for (var j = 0; j < BONE_PAIRS.length; j++) {
          var ba = by[BONE_PAIRS[j][0]], bb = by[BONE_PAIRS[j][1]];
          if (!ba || !bb) continue;
          if (!beProject(cam, r, ba, pa)) continue;
          if (!beProject(cam, r, bb, pb)) continue;
          if (pa.x < r.left - 200 || pa.x > r.left + r.width + 200) continue;
          if (pa.y < r.top - 200 || pa.y > r.top + r.height + 200) continue;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;
    }

    function eFrame() {
      requestAnimationFrame(eFrame);
      var g = G || game();
      if (g) { try { wbPatch(); } catch (e) {} try { ammoTick(); } catch (e) {} try { dmgTick(); } catch (e) {} }
      if (!E.on) { eClear(); } else {
        var t = performance.now();
        if (t - E.last < 33) { /* throttle */ }
        else {
          E.last = t;
          if (!eInit()) {} else if (!g) { eClear(); } else {
            try { eDraw(g); } catch (err) { eClear(); }
          }
        }
      }
      try { beDraw(g); } catch (e) { beClear(); }
    }
    try { requestAnimationFrame(eFrame); } catch (e) {}

    var DM = { at: 0, mult: 1.3 };
    function dmgTick() {
      var g = G || game(); if (!g || !g.P) return;
      var now = performance.now();
      if (now < DM.at) return;
      DM.at = now + 500;
      var w = null; try { w = g.P.W; } catch (e) { w = null; }
      if (!w || w.melee || w.c4 || w.grenade || w.dmg) return;
      if (!(w.damage > 0) || w.__pbD) return;
      try { w.damage = Math.round(w.damage * DM.mult); w.__pbD = 1; } catch (e) {}
    }

    var VIS_API = {
      on: function () { E.on = 1; return 'on'; },
      off: function () { E.on = 0; eClear(); return 'off'; },
      is: function () { return E.on; },
      dmg: function (m) { if (typeof m === 'number' && m >= 1 && m <= 3) DM.mult = m; return DM.mult; },
      bone: function (on, range) { BE.on = on ? 1 : 0; if (typeof range === 'number') BE.range = range; if (!on) beClear(); return { on: BE.on, range: BE.range }; },
      ammo: function () {
        var g = G || game(); if (!g || !g.P) return null;
        var p = g.P, w = null; try { w = p.W; } catch (e) {}
        return { a: p.ammo, r: p.reserve, rl: +(p.reloading || 0), mag: w && w.mag, slot: p.slot, w: w && w.name };
      }
    };
    window.__pbvis = VIS_API; HIDDEN.pbvis = VIS_API;

    /* WALLBANG */
    var WB = 200;
    function wbGun() {
      try { var g = G || game(); var w = g && g.P && g.P.W; return !!(w && !w.melee && !w.grenade && !w.c4); }
      catch (e) { return false; }
    }
    function wbPatch() {
      if (!FL.wallbang) return;
      var g = G || game(); var L = g && g.bots;
      if (!L || !L.length) return;
      for (var i = 0; i < L.length; i++) {
        var b = L[i];
        if (!b || b.__wb || typeof b.hitTest !== 'function') continue;
        b.__wb = 1;
        (function (b, f) {
          b.hitTest = function (o, d, m) {
            var r = (FL.wallbang && wbGun() && typeof m === 'number') ? WB : m;
            try { return f.call(this, o, d, r); } catch (e) { return null; }
          };
        })(b, b.hitTest);
      }
    }

    /* AMMO */
    var AM = { at: 0 };
    function ammoTick() {
      if (!FL.infAmmo) return;
      var g = G || game(); if (!g || !g.P) return;
      var now = performance.now();
      if (now < AM.at) return;
      AM.at = now + 200;
      var p = g.P, inv = null, w = null;
      try { inv = p.inv; } catch (e) {}
      if (inv) {
        for (var k in inv) {
          var s = inv[k];
          if (!s || typeof s !== 'object') continue;
          try { if (typeof s.reserve === 'number') s.reserve = 999; } catch (e) {}
        }
      }
      try { if (typeof p.extReserve === 'number') p.extReserve = 99; } catch (e) {}
      try { w = p.W; } catch (e) { w = null; }
      if (!w || w.melee || w.c4 || w.grenade) return;
      try { if (typeof p.ammo === 'number' && p.ammo !== 999) p.ammo = 999; } catch (e) {}
      try { if (typeof p.reserve === 'number' && p.reserve !== 999) p.reserve = 999; } catch (e) {}
    }

    /* NO RECOIL */
    function nrecTick() {
      requestAnimationFrame(nrecTick);
      if (!FL.noRecoil) return;
      try {
        var g = G || game(); if (!g || !g.P) return;
        var p = g.P, r = p.rec;
        if (r) { r.v = 0; r.A = 0; r.t = 0; r.T = 0; r.hPend = 0; r.hRate = 0; r.hState = 0; }
        if (p.kick) p.kick = 0;
      } catch (e) {}
    }
    try { requestAnimationFrame(nrecTick); } catch (e) {}

    /* GODMODE */
    var GB = { s: null, off: 0, was: 0, died: 0, orig: null, cap: null };
    function gbBind(s) {
      if (!s || GB.s === s) return;
      GB.s = s;
      var cap = function () { var m = s.maxHp; return (typeof m === 'number' && m > 1) ? m : 100; };
      GB.cap = cap;
      var val = cap();
      try {
        Object.defineProperty(s, 'hp', {
          configurable: true,
          get: function () { return val; },
          set: function (x) {
            if (typeof x !== 'number' || !isFinite(x)) return;
            val = GB.off ? x : ((x >= cap()) ? x : cap());
          }
        });
        s.hp = cap();
      } catch (e) {}
      try {
        GB.orig = s.die;
        s.die = function (k, kind) {
          if (!FL.godmode || GB.off || !k || k === this) { GB.died = 1; try { return GB.orig.call(this, k, kind); } catch (e) {} return; }
          try { this.dead = false; this.hp = cap(); } catch (e) {}
        };
      } catch (e) {}
      try { if (typeof s.hitTest === 'function') s.hitTest = function () { return null; }; } catch (e) {}
    }
    function gbTick() {
      requestAnimationFrame(gbTick);
      try {
        var g = G || game();
        if (!g || !g.P || !g.P.s) return;
        var s = g.P.s;
        if (s !== GB.s) gbBind(s);
        if (!FL.godmode) { GB.was = 0; return; }
        var y = (s.mover && s.mover.pos) ? s.mover.pos.y : 0;
        GB.off = (isFinite(y) && y < -8) ? 1 : 0;
        if (!s.dead) GB.died = 0;
        if (!GB.off) {
          if (GB.was && !s.dead && GB.cap) { try { s.hp = GB.cap(); } catch (e) {} }
          if (!GB.died && s.dead) s.dead = false;
        }
        GB.was = GB.off;
      } catch (e) {}
    }
    try { requestAnimationFrame(gbTick); } catch (e) {}

    /* NOCLIP */
    var NC = { s: null, m: null, has: 0, gx: 0, gy: 0, gz: 0, o: null, d: null, mv: null, patched: 0 };
    function ncBind() {
      if (!FL.noclip) return;
      var g = G || game();
      if (!g || !g.P || !g.P.s) return;
      var s = g.P.s, m = s.mover;
      if (!m) return;
      NC.s = s;
      if (NC.m === m && NC.patched) return;
      NC.m = m; NC.has = 0; NC.patched = 1;
      try { m.blocked = function () { return false; }; } catch (e) {}
      try { m.crosses = function () { return false; }; } catch (e) {}
      try { m.depenetrate = function () { return false; }; } catch (e) {}
      try {
        NC.mv = m.move;
        m.move = function () {
          var r = NC.mv.apply(this, arguments);
          try { ncGuard(this); } catch (err) {}
          return r;
        };
      } catch (e) {}
    }
    function ncProbe(g, x, y, z) {
      try {
        if (!g || typeof g.cast !== 'function') return true;
        if (!NC.o) { NC.o = g.camera.position.clone(); NC.d = g.camera.position.clone(); }
        NC.o.set(x, y, z); NC.d.set(0, -1, 0);
        return !!g.cast(NC.o, NC.d, 3.0);
      } catch (e) { return true; }
    }
    function ncGuard(m) {
      if (!FL.noclip) return;
      if (!m || !m.pos || !isFinite(m.pos.y)) return;
      if (m.jt >= 0 || m.noGrav || m.climb) return;
      var s = NC.s; if (s && s.dead) { NC.has = 0; return; }
      var p = m.pos;
      var floor = ncProbe(G || game(), p.x, p.y + 1.8, p.z);
      if (floor && m.onGround) { NC.gx = p.x; NC.gy = p.y; NC.gz = p.z; NC.has = 1; return; }
      if (!floor && NC.has && p.y <= NC.gy + 0.05) {
        p.x = NC.gx; p.y = NC.gy; p.z = NC.gz;
        m.vy = 0; m.ft = 0; m.airT = 0; m.jt = -1; m.landT = 1;
        m.fy0 = NC.gy; m.offY = NC.gy; m.onGround = true;
        try { m.vel.set(0, 0, 0); m.tA = 0; } catch (e) {}
        try { if (m._last) m._last.copy(p); } catch (e) {}
      }
    }
    function ncTick() { requestAnimationFrame(ncTick); try { ncBind(); } catch (e) {} }
    try { requestAnimationFrame(ncTick); } catch (e) {}

    /* DEVICE SPOOF */
    var PBD = (function () {
      var r = { dev: '', fp: '' };
      function rnd(n) { var s = ''; while (s.length < n) s += Math.random().toString(16).slice(2); return s.slice(0, n); }
      try {
        var d = localStorage.getItem('pb_kdev');
        var f = localStorage.getItem('pb_kfp');
        var rot = +(localStorage.getItem('pb_krot') || 0);
        if (Date.now() - rot > 7 * 24 * 3600 * 1000) { d = ''; f = ''; localStorage.setItem('pb_krot', String(Date.now())); }
        if (!d || d.length < 16) { d = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : rnd(32); localStorage.setItem('pb_kdev', d); }
        if (!f || f.indexOf('.') < 0) { f = rnd(8) + '.' + (70 + Math.floor(Math.random() * 50)); localStorage.setItem('pb_kfp', f); }
        r.dev = d; r.fp = f;
      } catch (e) { r.dev = rnd(32); r.fp = rnd(8) + '.90'; }
      return r;
    })();
    function pbOut(d) {
      if (typeof d !== 'string' || d.length < 20 || d.length > 4096) return d;
      if (d.indexOf('"hello"') < 0 && d.indexOf('"resume"') < 0) return d;
      try {
        var j = JSON.parse(d);
        if (j && (j.t === 'hello' || j.t === 'resume')) { j.dev = PBD.dev; j.fp = PBD.fp; return JSON.stringify(j); }
      } catch (e) {}
      return d;
    }

    /* ANTI-KICK */
    var KG = { on: 0, drop: 0 };
    function kgDrop(d) {
      if (!FL.antiKick) return false;
      if (typeof d !== 'string' || d.length < 8 || d.length > 900) return false;
      if (d.indexOf('"t"') < 0) return false;
      var low = d.toLowerCase();
      var m = low.match(/"t"\s*:\s*"([a-z_]+)"/);
      if (!m) return false;
      var t = m[1];
      if (t === 'kick' || t === 'kicked' || t === 'kickout' || t === 'ban' || t === 'banned' ||
          t === 'expel' || t === 'expulso' || t === 'removed' || t === 'removido') { KG.drop++; return true; }
      if ((t === 'error' || t === 'err') && /(kick|expuls|banid|banned|removid|removido)/.test(low)) { KG.drop++; return true; }
      return false;
    }
    (function kgInstall() {
      try {
        var OW = window.WebSocket;
        if (!OW || OW.__pbKG) return;
        var Pp = OW.prototype;
        var sendN = Pp.send, closeN = Pp.close;
        var rsGet = Object.getOwnPropertyDescriptor(Pp, 'readyState').get;
        var desc = {};
        ['onopen', 'onmessage', 'onerror', 'onclose'].forEach(function (k) { desc[k] = Object.getOwnPropertyDescriptor(Pp, k); });
        function revive(rec, wait) {
          if (!FL.antiKick) return;
          if (rec.dead) return;
          clearTimeout(rec.timer);
          rec.timer = setTimeout(function () {
            if (!FL.antiKick || rec.dead) return;
            try { if (rec.live && rsGet.call(rec.live) === 1) return; } catch (e) {}
            var ns;
            try { ns = new OW(rec.url); } catch (e) { revive(rec, 1500); return; }
            rec.live = ns;
            try { ns.binaryType = rec.sock.binaryType || 'arraybuffer'; } catch (e) {}
            ns.onopen = function (ev) { rec.tries = 0; try { if (rec.onopen) rec.onopen.call(rec.sock, ev); } catch (e) {} };
            ns.onmessage = function (ev) { try { if (rec.onmessage) rec.onmessage.call(rec.sock, ev); } catch (e) {} };
            ns.onerror = function (ev) { try { if (rec.onerror) rec.onerror.call(rec.sock, ev); } catch (e) {} };
            ns.onclose = function (ev) {
              var code = ev ? ev.code : 0;
              rec.tries++;
              if (rec.tries > 40 || code === 1008) { rec.dead = 1; return; }
              revive(rec, Math.min(8000, 200 * Math.pow(1.3, Math.min(rec.tries, 12))));
            };
          }, wait == null ? 200 : wait);
        }
        function wrap(sock) {
          if (!sock || sock.__pbKG) return sock;
          var rec = { sock: sock, url: sock.url, bin: 'arraybuffer', live: null, tries: 0, dead: 0, timer: 0, mute: 0, onopen: null, onmessage: null, onerror: null, onclose: null };
          sock.__pbKG = rec;
          var pre = {};
          ['onopen', 'onmessage', 'onerror', 'onclose'].forEach(function (p) { try { pre[p] = desc[p].get.call(sock); } catch (e) {} });
          ['onopen', 'onmessage', 'onerror', 'onclose'].forEach(function (p) {
            try {
              Object.defineProperty(sock, p, {
                configurable: true,
                get: function () { return rec[p]; },
                set: function (fn) {
                  if (p === 'onclose') {
                    if (typeof fn !== 'function') { rec.dead = 1; rec.onclose = null; return; }
                    rec.onclose = function () { revive(rec, 150); };
                    return;
                  }
                  if (p === 'onmessage' && typeof fn === 'function') {
                    rec.onmessage = function (ev) { if (kgDrop(ev.data)) return; return fn.call(rec.sock, ev); };
                  } else { rec[p] = fn; }
                  try {
                    if (rec.live && rsGet.call(rec.live) === 1) desc[p].set.call(rec.live, rec[p]);
                    else desc[p].set.call(sock, rec[p]);
                  } catch (e) {}
                }
              });
            } catch (e) {}
          });
          ['onopen', 'onmessage', 'onerror', 'onclose'].forEach(function (p) { if (pre[p]) { try { sock[p] = pre[p]; } catch (e) {} } });
          try {
            sock.send = function (d) {
              d = pbOut(d);
              try { if (rec.live && rsGet.call(rec.live) === 1) return sendN.call(rec.live, d); } catch (e) {}
              return sendN.call(sock, d);
            };
          } catch (e) {}
          try {
            sock.close = function (c, r) {
              try { if (rec.live) closeN.call(rec.live, c, r); } catch (e) {}
              try { return closeN.call(sock, c, r); } catch (e) {}
            };
          } catch (e) {}
          try {
            Object.defineProperty(sock, 'readyState', {
              configurable: true,
              get: function () {
                try { if (rec.live) return rsGet.call(rec.live); } catch (e) {}
                try { return rsGet.call(sock); } catch (e) { return 3; }
              }
            });
          } catch (e) {}
          try {
            sock.addEventListener('close', function () {
              if (rec.dead) return;
              rec.mute = 1;
              try { if (rec.live && rsGet.call(rec.live) === 1) { rec.mute = 0; return; } } catch (e) {}
              revive(rec, 180);
            }, true);
          } catch (e) {}
          return sock;
        }
        function WSW(url, prot) {
          var s = arguments.length > 1 ? new OW(url, prot) : new OW(url);
          try { if (/[?&]k=|\/ws(\?|$)/.test(String(url))) return wrap(s); } catch (e) {}
          return s;
        }
        WSW.prototype = Pp;
        try { WSW.CONNECTING = 0; WSW.OPEN = 1; WSW.CLOSING = 2; WSW.CLOSED = 3; } catch (e) {}
        WSW.__pbKG = 1;
        window.WebSocket = WSW;
        KG.on = 1;
      } catch (e) {}
    })();

    function kgNetc() {
      try {
        if (!FL.antiKick) return false;
        if (typeof NETC === 'undefined' || !NETC) return false;
        if (NETC.__pbKG) { KG.on = 2; return true; }
        if (typeof NETC.connect !== 'function') return false;
        NETC.reconnect = function (nick, cb) {
          var n = 0;
          var step = function () {
            NETC.connect({ nick: nick, re: 1 }, 5000).then(function (w) { if (cb) cb(w || { sid: NETC.sid }, true, ''); },
              function (err) { if (++n > 5) { if (cb) cb(null, false, err && err.message); return; } setTimeout(step, 1500); });
          };
          step();
        };
        try { NETC.on('st', function () { KG.st = Date.now(); KG.n = (KG.n || 0) + 1; }); } catch (e) {}
        NETC.__pbKG = 1;
        KG.on = 2;
        return true;
      } catch (e) { return false; }
    }
    if (!kgNetc()) {
      var kgn = 0;
      var kgt = setInterval(function () { if (kgNetc() || ++kgn > 30) clearInterval(kgt); }, 500);
    }

    var KGW = { st: 0, n: 0, next: 0, rl: 0 };
    setInterval(function () {
      try {
        if (!FL.antiKick) return;
        if (!KGW.n) return;
        var b = null;
        try { b = JSON.parse(sessionStorage.getItem('pbweb_battle') || 'null'); } catch (e) {}
        if (!b) return;
        var now = Date.now();
        if (now - KGW.st < 10000) return;
        if (now < KGW.next) return;
        if (document.visibilityState === 'hidden') return;
        KGW.next = now + 120000;
        KGW.rl++;
        if (KGW.rl <= 2) location.reload();
      } catch (e) {}
    }, 2000);

    /* NADE AUTO-AIM */
    var NA = { arr: null, at: 0, rf: 0, aim: 1, n: 0, tgt: null };
    function naSolve(from, to, v, g0, hi) {
      var dx = to.x - from.x, dz = to.z - from.z;
      var x = Math.sqrt(dx * dx + dz * dz);
      if (!(x > 0.08)) return null;
      var y = to.y - from.y, v2 = v * v;
      var disc = v2 * v2 - g0 * (g0 * x * x + 2 * y * v2);
      if (disc < 0) return null;
      var sq = Math.sqrt(disc);
      var tan = (v2 + (hi ? sq : -sq)) / (g0 * x);
      if (!isFinite(tan)) return null;
      var th = Math.atan(tan);
      var hx = dx / x, hz = dz / x;
      var vh = v * Math.cos(th);
      return { vx: hx * vh, vy: v * Math.sin(th), vz: hz * vh, t: x / (vh || 0.001) };
    }
    function naTarget(g, off) {
      var s = g.P.s, list = g.bots || [], my = s.team;
      if (!s.mover || !s.mover.pos) return null;
      var yaw = +s.yaw || 0, cp = Math.cos(+s.pitch || 0);
      var fx = -Math.sin(yaw) * cp, fz = -Math.cos(yaw) * cp;
      var best = null, bs = 1e9;
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || p === s || !p.obj) continue;
        if (p.net === null) continue;
        if (p.team === my || p.dead || !(p.hp > 0)) continue;
        var e = p.obj.matrixWorld && p.obj.matrixWorld.elements;
        if (!e) continue;
        var dx = e[12] - s.mover.pos.x, dz = e[14] - s.mover.pos.z;
        var d = Math.sqrt(dx * dx + dz * dz);
        if (!(d > 1.2) || d > 220) continue;
        var ang = Math.acos(clamp((dx * fx + dz * fz) / (d || 1), -1, 1));
        var sc = d + ang * 16 - (ang < 0.55 ? 7 : 0);
        if (sc < bs) { bs = sc; best = { x: e[12], y: e[13] + (off || 1.1), z: e[14], bot: p }; }
      }
      return best;
    }
    function naAim(g, n) {
      if (!FL.nadeAim) return;
      if (!n || !n.owner || n.owner !== g.P.s) return;
      NA.rf = performance.now() + 1000;
      if (!NA.aim) return;
      if (!n.vel || typeof n.vel.length !== 'function' || !n.pos) return;
      if (n.w && n.w.kind === 'medkit') return;
      var v = n.vel.length();
      if (!(v > 1)) return;
      var kd = n.w && n.w.kind;
      var off = kd === 'frag' ? 0.3 : kd === 'flash' ? 1.5 : 1.05;
      var to = naTarget(g, off);
      if (!to) return;
      var lx = to.x - n.pos.x, ly = to.y - n.pos.y, lz = to.z - n.pos.z;
      var ld = Math.sqrt(lx * lx + ly * ly + lz * lz);
      if (!(ld > 1.5)) return;
      try {
        if (typeof g.cast !== 'function') return;
        var eye = (g.camera && g.camera.position) || n.pos;
        var ex = to.x - eye.x, ey = to.y - eye.y, ez = to.z - eye.z;
        var ed = Math.sqrt(ex * ex + ey * ey + ez * ez);
        if (!(ed > 1.5)) return;
        if (g.cast(eye, n.pos.clone().set(ex / ed, ey / ed, ez / ed), ed - 1.2)) return;
      } catch (e) { return; }
      var lo = naSolve(n.pos, to, v, 10, 0);
      if (!lo) return;
      try {
        n.vel.set(lo.vx, lo.vy, lo.vz);
        if (!n.dir || typeof n.dir.set !== 'function') n.dir = n.vel.clone().normalize();
        else n.dir.copy(n.vel).normalize();
        NA.n++; NA.tgt = { x: to.x, y: to.y, z: to.z };
      } catch (e) {}
    }
    function naBind() {
      if (!FL.nadeAim) return null;
      var g = G || game();
      if (!g || !g.P || !g.P.s || !g.nades) return null;
      if (NA.arr !== g.nades) {
        NA.arr = g.nades;
        var op = Array.prototype.push;
        try {
          g.nades.push = function () {
            var r = op.apply(this, arguments);
            for (var i = 0; i < arguments.length; i++) { try { naAim(g, arguments[i]); } catch (e) {} }
            return r;
          };
        } catch (e) {}
      }
      return g;
    }
    function naAmmo(g) {
      if (!FL.nadeAim) return;
      var now = performance.now();
      if (now < NA.at) return;
      NA.at = now + 150;
      if (NA.rf && now < NA.rf) return;
      NA.rf = 0;
      var p = g.P, inv = null;
      try { inv = p.inv; } catch (e) {}
      if (!inv) return;
      for (var k in inv) {
        var s = inv[k];
        if (!s || !s.w || !s.w.grenade) continue;
        var m = s.w.mag || 1;
        try { if (s.ammo !== m) s.ammo = m; } catch (e) {}
      }
    }
    function naTick() {
      requestAnimationFrame(naTick);
      try { var g = naBind(); if (!g) return; naAmmo(g); } catch (e) {}
    }
    try { requestAnimationFrame(naTick); } catch (e) {}

    var NADE_API = {
      on: function () { FL.nadeAim = 1; NA.aim = 1; return 'on'; },
      off: function () { FL.nadeAim = 0; NA.aim = 0; return 'off'; },
      is: function () { return FL.nadeAim && NA.aim ? 1 : 0; },
      st: function () { return { aim: NA.aim, on: FL.nadeAim, thrown: NA.n, tgt: NA.tgt }; }
    };
    window.__pbnade = NADE_API; HIDDEN.pbnade = NADE_API;

    /* QUICK CHANGE */
    var QC = { on: 1, fast: 0, slot: 0, ammo: -1, gate: {}, invRef: null, n: 0, sw: 0, dead: 0 };
    function qcW(p, slot) { try { var s = p.inv[slot]; return s && s.w ? s.w : null; } catch (e) { return null; } }
    function qcTap(code) {
      try {
        var o = { code: code, key: code, bubbles: true, cancelable: true };
        window.dispatchEvent(new KeyboardEvent('keydown', o));
        window.dispatchEvent(new KeyboardEvent('keyup', o));
      } catch (e) {}
    }
    function qcTick() {
      requestAnimationFrame(qcTick);
      try {
        var g = G || game();
        if (!g || !g.P || !g.P.s) return;
        var p = g.P, s = p.s;
        if (!p.inv) return;
        if (QC.invRef !== p.inv) { QC.invRef = p.inv; QC.gate = {}; QC.slot = p.slot; QC.ammo = p.ammo; }
        if (s.dead) { if (!QC.dead) { QC.dead = 1; QC.gate = {}; } QC.slot = p.slot; QC.ammo = p.ammo; return; }
        if (QC.dead) { QC.dead = 0; QC.gate = {}; QC.slot = p.slot; QC.ammo = p.ammo; }
        if (p.slot === QC.slot && typeof p.ammo === 'number' && QC.ammo >= 0 && p.ammo < QC.ammo) { QC.gate[p.slot] = +p.nextShot || 0; QC.n++; }
        if (p.slot !== QC.slot) {
          if (QC.on) {
            p.swapEnd = 0;
            p.nextShot = QC.fast ? 0 : (QC.gate[p.slot] || 0);
            try { if (p.fpActs && p.fpActs.change) p.fpActs.change.timeScale = 8; } catch (e) {}
            QC.sw++;
          }
          QC.slot = p.slot;
        }
        QC.ammo = p.ammo;
      } catch (e) {}
    }
    try { requestAnimationFrame(qcTick); } catch (e) {}

    var QC_API = {
      cfg: function (o) { if (o) for (var k in o) if (k === 'on' || k === 'fast') QC[k] = o[k]; return { on: QC.on, fast: QC.fast }; },
      on: function () { QC.on = 1; return 'on'; },
      off: function () { QC.on = 0; return 'off'; },
      swap: function () { qcTap('KeyQ'); return 'swap'; },
      st: function () {
        var g = G || game(), p = g && g.P, w = p && qcW(p, p.slot);
        return { v: V, on: QC.on, slot: p && p.slot, w: w && w.name, shots: QC.n, swaps: QC.sw, fast: QC.fast };
      }
    };
    window.__pbqc = QC_API; HIDDEN.pbqc = QC_API;
        /* GACOR FEATURES */
    var PR = { on: 0, ms: 120 };
    function predictPos(bot, ms) {
      try {
        var mv = bot && bot.mover;
        if (!mv || !mv.vel) return null;
        var e = bot.obj && bot.obj.matrixWorld && bot.obj.matrixWorld.elements;
        if (!e) return null;
        var t = (ms || 120) / 1000;
        return { x: e[12] + mv.vel.x * t, y: e[13] + mv.vel.y * t * 0.35, z: e[14] + mv.vel.z * t };
      } catch (err) { return null; }
    }
    var RF = { on: 0 };
    function rfTick() {
      requestAnimationFrame(rfTick);
      if (!RF.on) return;
      try {
        var g = G || game(); if (!g || !g.P) return;
        var p = g.P, w = null; try { w = p.W; } catch (e) {}
        if (!w || w.melee || w.c4 || w.grenade) return;
        if (typeof p.nextShot === 'number' && p.nextShot > 0) p.nextShot = 0;
        if (typeof p.swapEnd === 'number' && p.swapEnd > 0) p.swapEnd = 0;
      } catch (e) {}
    }
    try { requestAnimationFrame(rfTick); } catch (e) {}

    var FR = { on: 0, at: 0 };
    function frTick() {
      requestAnimationFrame(frTick);
      if (!FR.on) return;
      var now = performance.now();
      if (now < FR.at) return;
      FR.at = now + 80;
      try {
        var g = G || game(); if (!g || !g.P) return;
        var p = g.P, w = null; try { w = p.W; } catch (e) {}
        if (!w || w.melee || w.grenade || w.c4) return;
        if (typeof p.reloading === 'number' && p.reloading > 0) {
          try { if (typeof p.ammo === 'number' && typeof w.mag === 'number') p.ammo = w.mag; } catch (e) {}
          p.reloading = 0;
          if (typeof p.reloadT === 'number') p.reloadT = 0;
        }
      } catch (e) {}
    }
    try { requestAnimationFrame(frTick); } catch (e) {}

    var IS = { on: 0 };
    function isTick() {
      requestAnimationFrame(isTick);
      if (!IS.on) return;
      try {
        var g = G || game(); if (!g || !g.P) return;
        var p = g.P;
        if (p.fpActs && p.fpActs.scope) p.fpActs.scope.timeScale = 20;
        if (typeof p.scopeT === 'number' && p.scopeT > 0 && p.scopeT < 0.2) p.scopeT = 0.05;
      } catch (e) {}
    }
    try { requestAnimationFrame(isTick); } catch (e) {}

    var TB = { on: 0, at: 0 };
    function tbTick() {
      requestAnimationFrame(tbTick);
      if (!TB.on) return;
      var now = performance.now();
      if (now < TB.at) return;
      TB.at = now + 40;
      try {
        var g = G || game(); if (!g || !g.P || !g.P.s) return;
        var p = g.P, s = p.s, w = null;
        try { w = p.W; } catch (e) {}
        if (!w || w.melee || w.grenade || w.c4) return;
        if (s.dead) return;
        var cam = g.camera, m = cam.matrixWorld.elements;
        var Cx = m[12], Cy = m[13], Cz = m[14];
        var yaw = +s.yaw || 0, pitch = +s.pitch || 0;
        var cp = Math.cos(pitch);
        var Fx = -Math.sin(yaw) * cp, Fy = Math.sin(pitch), Fz = -Math.cos(yaw) * cp;
        var orig = { x: Cx, y: Cy, z: Cz }, dir = { x: Fx, y: Fy, z: Fz };
        var list = g.bots || [];
        for (var i = 0; i < list.length; i++) {
          var b = list[i];
          if (!b || b === s || b.dead || !(b.hp > 0)) continue;
          if (b.team === s.team) continue;
          if (typeof b.hitTest !== 'function') continue;
          var h = null;
          try { h = b.hitTest(orig, dir, 200); } catch (e) { h = null; }
          if (!h || !h.head) continue;
          if (now < nextTap || holding) return;
          down(); holding = true;
          var holdMs = 40 + Math.random() * 25;
          setTimeout(function () { if (holding) up(); }, holdMs);
          nextTap = now + holdMs + 80 + Math.random() * 60;
          return;
        }
      } catch (e) {}
    }
    try { requestAnimationFrame(tbTick); } catch (e) {}

    var SA = { on: 0 };
    function saPatch() {
      var g = G || game(); var L = g && g.bots;
      if (!L || !L.length) return;
      for (var i = 0; i < L.length; i++) {
        var b = L[i];
        if (!b || b.__sa || typeof b.hitTest !== 'function') continue;
        b.__sa = 1;
        (function (b, f) {
          b.hitTest = function (o, d, m) {
            if (!SA.on) return f.call(this, o, d, m);
            try {
              var g2 = G || game(); if (!g2 || !g2.P || !g2.P.s) return f.call(this, o, d, m);
              if (!wbGun()) return f.call(this, o, d, m);
              var hp = headPoint(this);
              if (!hp) return f.call(this, o, d, m);
              var cam = g2.camera, me = cam.matrixWorld.elements;
              var ox = me[12], oy = me[13], oz = me[14];
              var dx = hp.x - ox, dy = hp.y - oy, dz = hp.z - oz;
              var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (len < 1) return f.call(this, o, d, m);
              var nd = { x: dx / len, y: dy / len, z: dz / len };
              var no = { x: ox, y: oy, z: oz };
              return f.call(this, no, nd, len + 1);
            } catch (e) { return f.call(this, o, d, m); }
          };
        })(b, b.hitTest);
      }
    }

    var IR = { on: 0, at: 0 };
    function irTick() {
      requestAnimationFrame(irTick);
      if (!IR.on) return;
      var now = performance.now();
      if (now < IR.at) return;
      IR.at = now + 200;
      try {
        var g = G || game(); if (!g || !g.P || !g.P.s) return;
        var s = g.P.s;
        if (s.dead && !GB.off) { s.dead = false; GB.died = 0; if (GB.cap) { try { s.hp = GB.cap(); } catch (e) {} } }
      } catch (e) {}
    }
    try { requestAnimationFrame(irTick); } catch (e) {}

    var RD = { on: 0, el: null, dots: [], last: 0 };
    function rdInit() {
      if (RD.el && RD.el.parentNode) return true;
      var host = document.body || document.documentElement;
      if (!host) return false;
      var w = document.createElement('div');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;right:8px;bottom:8px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.7);border:1px solid rgba(0,180,80,.6);z-index:2147483000;pointer-events:none;display:none';
      host.appendChild(w);
      RD.el = w; RD.dots = [];
      return true;
    }
    function rdDraw(g) {
      if (!RD.on) { if (RD.el) RD.el.style.display = 'none'; return; }
      if (!rdInit()) return;
      RD.el.style.display = 'block';
      var now = performance.now();
      if (now - RD.last < 50) return;
      RD.last = now;
      var s = g.P && g.P.s; if (!s || !s.mover || !s.mover.pos) return;
      var sx = s.mover.pos.x, sz = s.mover.pos.z;
      var yaw = +s.yaw || 0, range = 60;
      var list = g.bots || [], idx = 0;
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || p === s || p.dead || !(p.hp > 0)) continue;
        if (p.team === s.team) continue;
        var e = p.obj && p.obj.matrixWorld && p.obj.matrixWorld.elements;
        if (!e) continue;
        var dx = e[12] - sx, dz = e[14] - sz;
        var d = Math.sqrt(dx * dx + dz * dz);
        if (d > range) continue;
        var ca = Math.cos(-yaw), sa = Math.sin(-yaw);
        var rx = dx * ca - dz * sa, rz = dx * sa + dz * ca;
        var cx = 60 + (rx / range) * 55, cz = 60 + (rz / range) * 55;
        var dot = RD.dots[idx];
        if (!dot) {
          dot = document.createElement('div');
          dot.style.cssText = 'position:absolute;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;border-radius:50%;background:#ef4444';
          RD.el.appendChild(dot);
          RD.dots[idx] = dot;
        }
        dot.style.display = 'block';
        dot.style.left = cx.toFixed(1) + 'px';
        dot.style.top = cz.toFixed(1) + 'px';
        idx++;
      }
      for (; idx < RD.dots.length; idx++) RD.dots[idx].style.display = 'none';
    }

    var HPO = { on: 0 };
    (function hpoHook() {
      var _eSlot = eSlot;
      eSlot = function (i) {
        var s = _eSlot(i);
        if (!s.tx2) {
          s.tx2 = document.createElement('div');
          s.tx2.style.cssText = 'position:absolute;left:0;top:-15px;font:10px/12px Tahoma,sans-serif;color:#c0392b;text-shadow:0 1px 2px #fff;white-space:nowrap;font-weight:700';
          s.box.appendChild(s.tx2);
        }
        return s;
      };
      var _eDraw = eDraw;
      eDraw = function (g) {
        _eDraw(g);
        if (!HPO.on) return;
        try {
          var list = g.bots || [], self = g.P && g.P.s, idx = 0;
          for (var i = 0; i < list.length; i++) {
            var p = list[i];
            if (!p || p === self || p.dead || !(p.hp > 0)) continue;
            if (p.team === self.team) continue;
            var s = E.slots[idx++];
            if (!s || !s.tx2) continue;
            s.tx2.textContent = Math.round(p.hp) + ' HP';
            s.tx2.style.display = 'block';
          }
          for (; idx < E.slots.length; idx++) {
            var s2 = E.slots[idx];
            if (s2 && s2.tx2) s2.tx2.style.display = 'none';
          }
        } catch (e) {}
      };
    })();

    var FC = { on: 0, el: null, last: 0 };
    function fcInit() {
      if (FC.el && FC.el.parentNode) return true;
      var host = document.body || document.documentElement;
      if (!host) return false;
      var w = document.createElement('div');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);border:1px dashed rgba(0,180,80,.75);border-radius:50%;z-index:2147482999;pointer-events:none;display:none';
      host.appendChild(w);
      FC.el = w;
      return true;
    }
    function fcTick() {
      requestAnimationFrame(fcTick);
      if (!FC.on) { if (FC.el) FC.el.style.display = 'none'; return; }
      if (!fcInit()) return;
      FC.el.style.display = 'block';
      var r = Math.max(20, Math.tan(P.cone) * (innerHeight / 2));
      FC.el.style.width = (r * 2).toFixed(0) + 'px';
      FC.el.style.height = (r * 2).toFixed(0) + 'px';
    }
    try { requestAnimationFrame(fcTick); } catch (e) {}

    var SL = { on: 0 };
    var _naTarget = naTarget;
    naTarget = function (g, off) {
      var t = _naTarget(g, off);
      if (!t || !SL.on || !t.bot) return t;
      var pp = predictPos(t.bot, 300);
      if (pp) { t.x = pp.x; t.z = pp.z; }
      return t;
    };

    /* ESP TRACER */
    var TR = { on: 0, wrap: null, host: null, hostAt: 0, slots: [], last: 0 };
    function trInit() {
      if (TR.wrap && TR.wrap.parentNode) return true;
      var host = document.body || document.documentElement;
      if (!host) return false;
      var w = document.createElement('div');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;overflow:hidden;pointer-events:none;z-index:2147482999';
      host.appendChild(w);
      TR.wrap = w; TR.slots = [];
      return true;
    }
    function trSlot(i) {
      var s = TR.slots[i];
      if (s) return s;
      var line = document.createElement('div');
      line.style.cssText = 'position:absolute;left:0;top:0;height:1.5px;background:linear-gradient(90deg,rgba(16,185,129,.95),rgba(16,185,129,.35));transform-origin:0 50%;display:none;box-shadow:0 0 4px rgba(16,185,129,.6);border-radius:1px';
      TR.wrap.appendChild(line);
      s = { line: line };
      TR.slots[i] = s;
      return s;
    }
    function trClear() { for (var i = 0; i < TR.slots.length; i++) TR.slots[i].line.style.display = 'none'; }
    function trHost() {
      var now = performance.now();
      if (TR.host && TR.host.parentNode && now - TR.hostAt < 400) return TR.host;
      TR.hostAt = now;
      var best = null, ba = 0, cs = document.getElementsByTagName('canvas');
      for (var i = 0; i < cs.length; i++) {
        var c = cs[i];
        if (c.getAttribute('data-pb')) continue;
        var r = c.getBoundingClientRect(), a = r.width * r.height;
        if (a > ba) { ba = a; best = c; }
      }
      TR.host = best || null;
      return TR.host;
    }
    var _trV = null;
    function trProj(cam, r, x, y, z) {
      if (!_trV) { try { _trV = cam.position.clone(); } catch (e) { return null; } }
      var d = _trV.set(x, y, z).project(cam);
      if (!(d.z > -1 && d.z < 1)) return null;
      return { x: r.left + (d.x * 0.5 + 0.5) * r.width, y: r.top + (-d.y * 0.5 + 0.5) * r.height };
    }
    function trDraw(g) {
      if (!TR.on) { if (TR.wrap) trClear(); return; }
      var cam = g.camera, list = g.bots, self = g.P && g.P.s;
      if (!list || !cam || !self || self.dead) { trClear(); return; }
      if (!trInit()) return;
      var host = trHost();
      if (!host) { trClear(); return; }
      var r = host.getBoundingClientRect();
      if (!(r.width > 0)) { trClear(); return; }
      var ox = r.left + r.width / 2;
      var oy = r.top;
      var my = self.team, idx = 0;
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || !p.obj || !p.c || p === self) continue;
        if (p.team === my) continue;
        if (p.dead || !(p.hp > 0)) continue;
        var hp = headPoint(p); if (!hp) continue;
        var t = trProj(cam, r, hp.x, hp.y, hp.z);
        if (!t) continue;
        if (t.x < r.left - 40 || t.x > r.left + r.width + 40) continue;
        if (t.y < r.top - 40 || t.y > r.top + r.height + 40) continue;
        var dx = t.x - ox, dy = t.y - oy;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len < 20) continue;
        var ang = Math.atan2(dy, dx) * 180 / Math.PI;
        var s = trSlot(idx++);
        s.line.style.display = 'block';
        s.line.style.left = ox.toFixed(1) + 'px';
        s.line.style.top = oy.toFixed(1) + 'px';
        s.line.style.width = len.toFixed(1) + 'px';
        s.line.style.transform = 'rotate(' + ang.toFixed(2) + 'deg)';
      }
      for (; idx < TR.slots.length; idx++) TR.slots[idx].line.style.display = 'none';
    }

    var PBX_API = {
      pred: function (on, ms) { PR.on = on ? 1 : 0; if (typeof ms === 'number') PR.ms = ms; return { on: PR.on, ms: PR.ms }; },
      rapid: function (on) { RF.on = on ? 1 : 0; return RF.on; },
      fastReload: function (on) { FR.on = on ? 1 : 0; return FR.on; },
      instScope: function (on) { IS.on = on ? 1 : 0; return IS.on; },
      trig: function (on) { TB.on = on ? 1 : 0; return TB.on; },
      silent: function (on) { SA.on = on ? 1 : 0; saPatch(); return SA.on; },
      lob: function (on) { SL.on = on ? 1 : 0; return SL.on; },
      respawn: function (on) { IR.on = on ? 1 : 0; return IR.on; },
      radar: function (on) { RD.on = on ? 1 : 0; if (!on && RD.el) RD.el.style.display = 'none'; return RD.on; },
      hpo: function (on) { HPO.on = on ? 1 : 0; return HPO.on; },
      fovc: function (on) { FC.on = on ? 1 : 0; return FC.on; },
      tracer: function (on) { TR.on = on ? 1 : 0; if (!on) trClear(); return TR.on; },
      wallbang: function (on) { FL.wallbang = on ? 1 : 0; return FL.wallbang; },
      infAmmo: function (on) { FL.infAmmo = on ? 1 : 0; return FL.infAmmo; },
      noRecoil: function (on) { FL.noRecoil = on ? 1 : 0; return FL.noRecoil; },
      godmode: function (on) { FL.godmode = on ? 1 : 0; return FL.godmode; },
      noclip: function (on) { FL.noclip = on ? 1 : 0; if (!FL.noclip) NC.patched = 0; return FL.noclip; },
      nadeAim: function (on) { FL.nadeAim = on ? 1 : 0; NA.aim = FL.nadeAim ? 1 : 0; return FL.nadeAim; },
      antiKick: function (on) { FL.antiKick = on ? 1 : 0; return FL.antiKick; },
      st: function () {
        return {
          pred: PR.on, rapid: RF.on, fastReload: FR.on, instScope: IS.on,
          trig: TB.on, silent: SA.on, lob: SL.on, respawn: IR.on,
          radar: RD.on, hpo: HPO.on, fovc: FC.on, tracer: TR.on,
          wallbang: FL.wallbang, infAmmo: FL.infAmmo, noRecoil: FL.noRecoil,
          godmode: FL.godmode, noclip: FL.noclip, nadeAim: FL.nadeAim, antiKick: FL.antiKick
        };
      }
    };
    window.__pbx = PBX_API; HIDDEN.pbx = PBX_API;

    (function pbxFrame() {
      requestAnimationFrame(pbxFrame);
      try {
        var g = G || game();
        if (!g) return;
        if (SA.on) saPatch();
        if (RD.on) rdDraw(g);
        if (TR.on) trDraw(g);
      } catch (e) {}
    })();

    (function hideAPIs() {
      try {
        ['__pb', '__pbvis', '__pbnade', '__pbqc', '__pbx'].forEach(function (k) {
          try {
            var v = window[k];
            if (!v) return;
            Object.defineProperty(window, k, { configurable: false, enumerable: false, get: function () { return v; } });
          } catch (e) {}
        });
      } catch (e) {}
    })();

    log(BRAND, V, 'up');
    requestAnimationFrame(tick);

    /* ============================================================
       UI PANEL — iRiLLL MODZ (WHITE LIGHT, NO GRADIENT)
       ============================================================ */
    (function pbUI() {
      if (window.__pbUI) return;
      window.__pbUI = 1;

      var css = [
        '.fk{position:fixed;top:8px;right:8px;z-index:2147483600;font:12px/1.35 system-ui,Tahoma,sans-serif;color:#1f2937;',
        '  background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;',
        '  box-shadow:0 4px 20px rgba(0,0,0,.12);width:300px;',
        '  pointer-events:auto;user-select:none;transform:translateZ(0);overflow:hidden;transition:width .15s}',
        '.fk.hide{display:none}',
        '.fk.collapsed{width:auto;max-width:360px}',
        '.fk.collapsed .fk-body{display:none}',
        '.fk.collapsed .fk-tab{display:none}',
        '.fk-h{display:flex;align-items:center;gap:8px;padding:9px 11px;border-bottom:1px solid #e2e8f0;',
        '  background:#f8fafc;font-weight:800;letter-spacing:.6px;cursor:move}',
        '.fk-h .dot{width:9px;height:9px;border-radius:50%;background:#7c3aed;box-shadow:0 0 6px #a78bfa;flex:0 0 9px}',
        '.fk-h .title{font-size:13px;color:#0f172a}',
        '.fk-h .v{opacity:.85;font-weight:400;font-size:10px;margin-left:auto;color:#64748b}',
        '.fk-toggle{cursor:pointer;font-size:15px;padding:0 8px;margin-left:4px;color:#0f172a;',
        '  border-radius:6px;line-height:1;font-weight:800;background:#e2e8f0;text-align:center;min-width:22px}',
        '.fk-toggle:hover{background:#cbd5e1}',
        '.fk-tabs{display:flex;align-items:center;background:#f8fafc;border-bottom:1px solid #e2e8f0;',
        '  padding-right:4px}',
        '.fk.collapsed .fk-tabs{border-bottom:none;border-radius:0 0 12px 12px}',
        '.fk-tab{flex:1;text-align:center;padding:7px 4px;font-size:10.5px;letter-spacing:.4px;color:#64748b;cursor:pointer;',
        '  border-bottom:2px solid transparent;transition:color .15s,border-color .15s,background .15s;font-weight:800;position:relative}',
        '.fk-tab:hover{color:#334155;background:#f1f5f9}',
        '.fk-tab.on{color:#7c3aed;border-bottom-color:#7c3aed;background:#f5f3ff}',
        '.fk-body{padding:8px 10px 10px;max-height:62vh;overflow:auto;background:#ffffff}',
        '.fk-body::-webkit-scrollbar{width:4px}',
        '.fk-body::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px}',
        '.fk-page{display:none}',
        '.fk-page.on{display:block}',
        '.fk-sec{margin:8px 0 4px;font-size:10px;letter-spacing:1.2px;color:#7c3aed;text-transform:uppercase;opacity:.95;font-weight:800}',
        '.fk-sec:first-child{margin-top:0}',
        '.fk-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:3px 0}',
        '.fk-row label{flex:1;color:#334155;font-size:12px}',
        '.fk-row small{color:#94a3b8;font-size:10px}',
        '.fk-row .risk-badge{display:inline-block;padding:0 4px;margin-left:4px;border-radius:3px;font-size:8px;',
        '  background:#f59e0b;color:#fff;font-weight:900;vertical-align:middle;letter-spacing:.3px;line-height:10px}',
        '.fk-row .new-badge{display:inline-block;padding:0 4px;margin-left:4px;border-radius:3px;font-size:8px;',
        '  background:#10b981;color:#fff;font-weight:900;vertical-align:middle;letter-spacing:.3px;line-height:10px}',
        '.fk-sw{position:relative;width:38px;height:20px;flex:0 0 38px;border-radius:10px;background:#cbd5e1;transition:background .15s;cursor:pointer}',
        '.fk-sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .15s}',
        '.fk-sw.on{background:#7c3aed}',
        '.fk-sw.on::after{transform:translateX(18px)}',
        '.fk-slider{display:flex;align-items:center;gap:8px;padding:3px 0}',
        '.fk-slider label{flex:0 0 92px;font-size:11px;color:#334155}',
        '.fk-slider input[type=range]{flex:1;height:3px;-webkit-appearance:none;background:#cbd5e1;border-radius:2px;outline:none}',
        '.fk-slider input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#7c3aed;cursor:pointer;box-shadow:0 0 4px #a78bfa}',
        '.fk-slider .n{flex:0 0 46px;text-align:right;font-size:10px;color:#7c3aed;font-variant-numeric:tabular-nums;font-weight:700}',
        '.fk-btns{display:flex;gap:6px;margin-top:6px}',
        '.fk-btn{flex:1;padding:6px 0;text-align:center;border-radius:6px;background:#f1f5f9;border:1px solid #cbd5e1;',
        '  color:#334155;cursor:pointer;font-size:11px;transition:background .15s}',
        '.fk-btn:hover{background:#e2e8f0}',
        '.fk-btn:active{background:#7c3aed;color:#fff}',
        '.fk-btn.on{background:#7c3aed;border-color:#7c3aed;color:#fff}',
        '.fk-btn.danger{border-color:#fca5a5;background:#fef2f2;color:#b91c1c}',
        '.fk-btn.danger:hover{background:#fee2e2}',
        '.fk-foot{margin-top:8px;padding-top:6px;border-top:1px solid #e2e8f0;font-size:10px;color:#64748b;font-variant-numeric:tabular-nums}',
        '.fk-warn{margin-top:6px;padding:5px 7px;border-radius:6px;background:#fffbeb;border:1px solid #fcd34d;',
        '  color:#92400e;font-size:10px;line-height:1.3}',
        '.fk-hint{font-size:10px;color:#94a3b8;line-height:1.3;padding:2px 0 4px}',
        '.fk-badge{display:inline-block;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:800;letter-spacing:.3px}',
        '.fk-badge.pov{background:#dbeafe;color:#1e40af}',
        '.fk-badge.legacy{background:#fee2e2;color:#991b1b}'
      ].join('');

      var style = document.createElement('style');
      style.setAttribute('data-pb', '1');
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);

      function el(tag, cls, txt) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (txt != null) e.textContent = txt;
        return e;
      }
      function toggle(initial, onChange) {
        var sw = el('div', 'fk-sw' + (initial ? ' on' : ''));
        var state = !!initial;
        sw.addEventListener('click', function () {
          state = !state; sw.classList.toggle('on', state);
          try { onChange(state); } catch (e) {}
          refreshFoot();
        });
        return { node: sw, get: function () { return state; }, set: function (v) { state = !!v; sw.classList.toggle('on', state); } };
      }
      function slider(min, max, step, val, fmt, onChange) {
        var wrap = el('div', 'fk-slider');
        var lb = el('label', null, '');
        var inp = document.createElement('input');
        inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = val;
        var num = el('div', 'n', fmt(val));
        wrap.appendChild(lb); wrap.appendChild(inp); wrap.appendChild(num);
        inp.addEventListener('input', function () {
          var v = parseFloat(inp.value);
          num.textContent = fmt(v);
          try { onChange(v); } catch (e) {}
        });
        return { node: wrap, label: lb, input: inp, set: function (v) { inp.value = v; num.textContent = fmt(v); } };
      }
      function row(label, node, smallTxt) {
        var r = el('div', 'fk-row');
        var lb = el('label', null, label);
        if (smallTxt) lb.appendChild(el('small', null, ' ' + smallTxt));
        r.appendChild(lb); r.appendChild(node);
        return r;
      }
      function rowRisk(label, node, smallTxt) {
        var r = el('div', 'fk-row');
        var lb = el('label', null, label);
        lb.appendChild(el('span', 'risk-badge', 'RISK'));
        if (smallTxt) lb.appendChild(el('small', null, ' ' + smallTxt));
        r.appendChild(lb); r.appendChild(node);
        return r;
      }
      function rowNew(label, node, smallTxt) {
        var r = el('div', 'fk-row');
        var lb = el('label', null, label);
        lb.appendChild(el('span', 'new-badge', 'NEW'));
        if (smallTxt) lb.appendChild(el('small', null, ' ' + smallTxt));
        r.appendChild(lb); r.appendChild(node);
        return r;
      }

      var panel = el('div', 'fk');
      panel.setAttribute('data-pb', '1');

      var head = el('div', 'fk-h');
      head.appendChild(el('div', 'dot'));
      head.appendChild(el('div', 'title', 'iRiLLL MODZ'));
      head.appendChild(el('div', 'v', 'V' + V));

      var toggleBtn = el('div', 'fk-toggle', '-');
      toggleBtn.title = 'Minimize / Expand';
      head.appendChild(toggleBtn);

      var tabsBar = el('div', 'fk-tabs');
      var body = el('div', 'fk-body');
      panel.appendChild(head); panel.appendChild(tabsBar); panel.appendChild(body);

      function setCollapsed(collapsed) {
        panel.classList.toggle('collapsed', collapsed);
        toggleBtn.textContent = collapsed ? '+' : '-';
        try { localStorage.setItem('ir_collapsed', collapsed ? '1' : '0'); } catch (e) {}
      }
      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var nowCollapsed = !panel.classList.contains('collapsed');
        setCollapsed(nowCollapsed);
      });
      toggleBtn.addEventListener('mousedown', function (e) { e.stopPropagation(); });
      toggleBtn.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });

      var TAB_KEY = 'ir_ui_tab';
      var tabs = {}, pages = {}, order = [];

      function addTab(key, label) {
        var t = el('div', 'fk-tab', label);
        t.addEventListener('click', function () { selectTab(key); });
        tabsBar.appendChild(t);
        tabs[key] = t;
        var p = el('div', 'fk-page');
        body.appendChild(p);
        pages[key] = p;
        order.push(key);
        return p;
      }
      function selectTab(key) {
        order.forEach(function (k) {
          tabs[k].classList.toggle('on', k === key);
          pages[k].classList.toggle('on', k === key);
        });
        try { localStorage.setItem(TAB_KEY, key); } catch (e) {}
        if (panel.classList.contains('collapsed')) setCollapsed(false);
      }

      /* ============ TAB 1 — AIM ============ */
      var pAim = addTab('aim', 'AIM');

      // == Mode info ==
      pAim.appendChild(el('div', 'fk-sec', 'Aim Mode'));
      var modeInfo = el('div', 'fk-hint', '');
      pAim.appendChild(modeInfo);

      function updateModeInfo() {
        var badge = (P.aimMode === 'legacy')
          ? '<span class="fk-badge legacy">LEGACY</span>'
          : '<span class="fk-badge pov">POV</span>';
        var desc = (P.aimMode === 'legacy')
          ? 'Aim lama: target di mana saja (tembus dinding / di luar layar).'
          : 'Target wajib <b>kelihatan</b> &amp; masuk area layar.';
        modeInfo.innerHTML = badge + ' ' + desc;
      }
      updateModeInfo();

      // == POV Mode toggle (default ON, legacy OFF) ==
      var povT = toggle(P.aimMode !== 'legacy', function (on) {
        window.__pb.aimMode(on ? 'pov' : 'legacy');
        updateModeInfo();
      });
      pAim.appendChild(row('POV mode', povT.node, '(wajib kelihatan)'));

      // == POV margin slider ==
      var povS = slider(0.30, 0.98, 0.01, P.povMargin,
        function (v) { return Math.round(v * 100) + '%'; },
        function (v) { window.__pb.povMargin(v); });
      povS.label.textContent = 'POV size';
      pAim.appendChild(povS.node);

      var povHint = el('div', 'fk-hint',
        'Makin kecil → target harus di tengah layar. Makin besar → seluruh layar boleh.');
      pAim.appendChild(povHint);

      pAim.appendChild(el('div', 'fk-sec', 'Aimbot'));
      var aimT = toggle(!!(window.__pb && window.__pb.state().aim), function (on) { if (on) window.__pb.on(); else window.__pb.off(); });
      pAim.appendChild(row('Aim lock', aimT.node));
      var autoFireT = toggle(!!P.autoFire, function (on) { P.autoFire = on ? 1 : 0; });
      pAim.appendChild(row('Auto fire', autoFireT.node));
      var invertT = toggle(!!O.invert, function (on) { O.invert = on; });
      pAim.appendChild(row('Invert Y', invertT.node));

      /* ============ TAB 2 — ESP ============ */
      var pVis = addTab('vis', 'ESP');
      pVis.appendChild(el('div', 'fk-sec', 'Overlay'));
      var espT = toggle(!!(window.__pbvis && window.__pbvis.is()), function (on) { if (on) window.__pbvis.on(); else window.__pbvis.off(); });
      pVis.appendChild(row('Enemy ESP', espT.node));
      var boneT = toggle(!!BE.on, function (on) { window.__pbvis.bone(on, BE.range); });
      pVis.appendChild(rowRisk('Bone ESP', boneT.node, 'range 60m'));
      var boneRangeS = slider(20, 120, 5, BE.range, function (v) { return v + 'm'; }, function (v) { BE.range = v; if (BE.on) window.__pbvis.bone(1, v); });
      boneRangeS.label.textContent = 'Bone range'; pVis.appendChild(boneRangeS.node);
      var hpoT = toggle(!!HPO.on, function (on) { window.__pbx.hpo(on); });
      pVis.appendChild(row('HP overlay', hpoT.node));
      var fcT = toggle(!!FC.on, function (on) { window.__pbx.fovc(on); });
      pVis.appendChild(row('FOV circle', fcT.node));
      var rdT = toggle(!!RD.on, function (on) { window.__pbx.radar(on); });
      pVis.appendChild(row('Radar mini', rdT.node));
      var trT = toggle(!!TR.on, function (on) { window.__pbx.tracer(on); });
      pVis.appendChild(row('ESP tracer', trT.node));
      pVis.appendChild(el('div', 'fk-sec', 'Damage'));
      var dmgS = slider(1.0, 3.0, 0.05, 1.3, function (v) { return 'x' + v.toFixed(2); }, function (v) { if (window.__pbvis) window.__pbvis.dmg(v); });
      dmgS.label.textContent = 'Damage'; pVis.appendChild(dmgS.node);

      /* ============ TAB 3 — GACOR ============ */
      var pGac = addTab('gacor', 'GACOR');
      pGac.appendChild(el('div', 'fk-sec', 'Aim Enhancement'));
      var predT = toggle(!!PR.on, function (on) { window.__pbx.pred(on, PR.ms); });
      pGac.appendChild(rowRisk('Prediction (lead)', predT.node, 'anticipate enemy movement'));
      var predS = slider(0, 400, 10, PR.ms, function (v) { return v.toFixed(0) + 'ms'; }, function (v) { PR.ms = v; if (PR.on) window.__pbx.pred(1, v); });
      predS.label.textContent = 'Lead time'; pGac.appendChild(predS.node);
      var saT = toggle(!!SA.on, function (on) { window.__pbx.silent(on); });
      pGac.appendChild(rowRisk('Silent aim', saT.node, 'auto aim to head'));
      var tbT = toggle(!!TB.on, function (on) { window.__pbx.trig(on); });
      pGac.appendChild(rowRisk('Auto trigger', tbT.node, 'fire when enemy enters crosshair'));
      pGac.appendChild(el('div', 'fk-sec', 'Shooting'));
      var rapidT = toggle(!!RF.on, function (on) { window.__pbx.rapid(on); });
      pGac.appendChild(rowRisk('Rapid fire', rapidT.node, 'remove fire delay'));
      var frT = toggle(!!FR.on, function (on) { window.__pbx.fastReload(on); });
      pGac.appendChild(rowRisk('Fast reload', frT.node, 'instant reload'));
      var isT2 = toggle(!!IS.on, function (on) { window.__pbx.instScope(on); });
      pGac.appendChild(rowRisk('Instant scope', isT2.node, 'scope opens instantly'));
      pGac.appendChild(el('div', 'fk-sec', 'Combat'));
      var wallT = toggle(!!FL.wallbang, function (on) { window.__pbx.wallbang(on); });
      pGac.appendChild(rowRisk('Wallbang', wallT.node, 'bullets penetrate walls'));
      var ammoT = toggle(!!FL.infAmmo, function (on) { window.__pbx.infAmmo(on); });
      pGac.appendChild(rowRisk('Infinite ammo', ammoT.node, 'ammo never runs out'));
      var nrecT = toggle(!!FL.noRecoil, function (on) { window.__pbx.noRecoil(on); });
      pGac.appendChild(rowRisk('No recoil', nrecT.node, 'zero recoil'));

      /* ============ TAB 4 — MISC ============ */
      var pMisc = addTab('misc', 'MISC');
      pMisc.appendChild(el('div', 'fk-sec', 'Quick Swap'));
      var qcT = toggle(!!(window.__pbqc && window.__pbqc.st().on), function (on) { if (on) window.__pbqc.on(); else window.__pbqc.off(); });
      pMisc.appendChild(row('Quick swap', qcT.node));
      var qcFastT = toggle(!!(window.__pbqc && window.__pbqc.st().fast), function (on) { window.__pbqc.cfg({ fast: on ? 1 : 0 }); });
      pMisc.appendChild(row('Instant swap', qcFastT.node, '(risk)'));
      var swapBtn = el('div', 'fk-btn', 'Swap weapon (Q)');
      swapBtn.addEventListener('click', function () { try { window.__pbqc.swap(); } catch (e) {} });
      var swapWrap = el('div', 'fk-btns');
      swapWrap.appendChild(swapBtn); pMisc.appendChild(swapWrap);
      pMisc.appendChild(el('div', 'fk-sec', 'Survival'));
      var irT = toggle(!!IR.on, function (on) { window.__pbx.respawn(on); });
      pMisc.appendChild(row('Instant respawn', irT.node));
      var godT = toggle(!!FL.godmode, function (on) { window.__pbx.godmode(on); });
      pMisc.appendChild(rowRisk('Godmode', godT.node, 'cannot die'));
      var ncT = toggle(!!FL.noclip, function (on) { window.__pbx.noclip(on); });
      pMisc.appendChild(rowRisk('Noclip', ncT.node, 'walk through walls'));
      pMisc.appendChild(el('div', 'fk-sec', 'Utility'));
      var nadeT = toggle(!!(window.__pbnade && window.__pbnade.is()), function (on) { window.__pbx.nadeAim(on); });
      pMisc.appendChild(rowRisk('Nade aim', nadeT.node, 'auto-aim grenades'));
      var akT = toggle(!!FL.antiKick, function (on) { window.__pbx.antiKick(on); });
      pMisc.appendChild(rowRisk('Anti-kick', akT.node, 'resists kick/ban'));

      /* ============ TAB 5 — INFO ============ */
      var pInfo = addTab('info', 'INFO');
      pInfo.appendChild(el('div', 'fk-sec', 'Status'));
      var foot = el('div', 'fk-foot', '');
      pInfo.appendChild(foot);
      var statBox = el('div', 'fk-foot', '');
      statBox.style.marginTop = '4px'; pInfo.appendChild(statBox);
      pInfo.appendChild(el('div', 'fk-sec', 'Bypass'));
      var bypassInfo = el('div', null, '');
      bypassInfo.style.cssText = 'font-size:10px;line-height:1.5;color:#94a3b8';
      bypassInfo.innerHTML =
        '<div>L0 seed · L1 preboot (dual-gate)</div>' +
        '<div>L2 hide · L3 self-heal · L4 fp-rotate</div>' +
        '<div>L6 probe-hide</div>';
      pInfo.appendChild(bypassInfo);
      pInfo.appendChild(el('div', 'fk-sec', 'Danger'));
      var resetBtn = el('div', 'fk-btn danger', 'Reset all features');
      resetBtn.addEventListener('click', function () {
        try {
          window.__pb.on(); window.__pbvis.on(); window.__pbnade.on();
          window.__pbqc.on(); window.__pbqc.cfg({ fast: 0 });
          window.__pbx.pred(0); window.__pbx.rapid(0); window.__pbx.fastReload(0);
          window.__pbx.instScope(0); window.__pbx.trig(0); window.__pbx.silent(0);
          window.__pbx.lob(0); window.__pbx.respawn(0); window.__pbx.radar(0);
          window.__pbx.hpo(0); window.__pbx.fovc(0); window.__pbx.tracer(0);
          window.__pbx.wallbang(1); window.__pbx.infAmmo(1); window.__pbx.noRecoil(1);
          window.__pbx.godmode(0); window.__pbx.noclip(0); window.__pbx.nadeAim(1);
          window.__pbx.antiKick(1);
          window.__pbvis.bone(0);
          syncAll();
        } catch (e) {}
      });
      var resetWrap = el('div', 'fk-btns');
      resetWrap.appendChild(resetBtn); pInfo.appendChild(resetWrap);
      pInfo.appendChild(el('div', 'fk-warn', 'RISK features may be flagged server-side. Use conservatively in ranked.'));

      function refreshFoot() {
        try {
          var s2 = window.__pb && window.__pb.state();
          if (!s2) { foot.textContent = 'engine not ready…'; return; }
          var parts = [];
          parts.push(s2.aim ? 'AIM ✓' : 'AIM ✕');
          parts.push(s2.aimMode === 'legacy' ? 'LEGACY' : 'POV');
          parts.push(s2.G ? 'G1' : 'G0');
          parts.push('enemy ' + s2.enemies);
          parts.push('lock ' + s2.lock);
          if (s2.lock) parts.push(s2.dist.toFixed(1) + 'm');
          foot.textContent = parts.join(' · ');
          statBox.textContent = 'bots ' + s2.bots + ' · fire ' + s2.fire + ' · sens ' + s2.sens + ' · fov ' + s2.fov + ' · pov ' + Math.round(s2.povMargin * 100) + '%';
        } catch (e) { foot.textContent = '…'; }
      }
      setInterval(refreshFoot, 500);

      function syncAll() {
        try {
          if (window.__pb) {
            aimT.set(!!window.__pb.state().aim);
            povT.set(window.__pb.state().aimMode !== 'legacy');
            povS.set(window.__pb.state().povMargin);
            updateModeInfo();
          }
          if (window.__pbvis) espT.set(!!window.__pbvis.is());
          if (window.__pbqc) { var q = window.__pbqc.st(); qcT.set(!!q.on); qcFastT.set(!!q.fast); }
          autoFireT.set(!!P.autoFire); invertT.set(!!O.invert);
          if (window.__pbx) {
            var x = window.__pbx.st();
            predT.set(!!x.pred); rapidT.set(!!x.rapid); frT.set(!!x.fastReload);
            isT2.set(!!x.instScope); tbT.set(!!x.trig); saT.set(!!x.silent);
            irT.set(!!x.respawn); rdT.set(!!x.radar); hpoT.set(!!x.hpo); fcT.set(!!x.fovc);
            trT.set(!!x.tracer);
            wallT.set(!!x.wallbang); ammoT.set(!!x.infAmmo); nrecT.set(!!x.noRecoil);
            godT.set(!!x.godmode); ncT.set(!!x.noclip); nadeT.set(!!x.nadeAim); akT.set(!!x.antiKick);
          }
        } catch (e) {}
      }
      setInterval(syncAll, 1000);

      /* DRAG via HEADER */
      (function () {
        var dragging = false, ox = 0, oy = 0;
        head.addEventListener('mousedown', function (e) {
          if (e.target === toggleBtn) return;
          dragging = true;
          var r = panel.getBoundingClientRect();
          ox = e.clientX - r.left; oy = e.clientY - r.top;
          e.preventDefault();
        });
        head.addEventListener('touchstart', function (e) {
          if (e.target === toggleBtn) return;
          if (!e.touches || !e.touches[0]) return;
          var t = e.touches[0];
          dragging = true;
          var r = panel.getBoundingClientRect();
          ox = t.clientX - r.left; oy = t.clientY - r.top;
        }, { passive: true });
        addEventListener('mousemove', function (e) {
          if (!dragging) return;
          var x = e.clientX - ox, y = e.clientY - oy;
          x = Math.max(4, Math.min(innerWidth - 60, x));
          y = Math.max(4, Math.min(innerHeight - 40, y));
          panel.style.left = x + 'px'; panel.style.top = y + 'px';
          panel.style.right = 'auto';
        });
        addEventListener('touchmove', function (e) {
          if (!dragging) return;
          if (!e.touches || !e.touches[0]) return;
          var t = e.touches[0];
          var x = t.clientX - ox, y = t.clientY - oy;
          x = Math.max(4, Math.min(innerWidth - 60, x));
          y = Math.max(4, Math.min(innerHeight - 40, y));
          panel.style.left = x + 'px'; panel.style.top = y + 'px';
          panel.style.right = 'auto';
        }, { passive: true });
        addEventListener('mouseup', function () { dragging = false; });
        addEventListener('touchend', function () { dragging = false; });
      })();

      function mount() {
        var host = document.body || document.documentElement;
        if (!host) return setTimeout(mount, 100);
        host.appendChild(panel);
        var lastTab = 'aim';
        try { lastTab = localStorage.getItem(TAB_KEY) || 'aim'; } catch (e) {}
        if (!tabs[lastTab]) lastTab = 'aim';
        selectTab(lastTab);
        var collapsed = false;
        try { collapsed = localStorage.getItem('ir_collapsed') === '1'; } catch (e) {}
        setCollapsed(collapsed);
        refreshFoot();
      }
      mount();

      log('iRiLLL MODZ UI ready');
    })();
  }

  // ===== ENTRY POINT =====
  pfGate();
})();
