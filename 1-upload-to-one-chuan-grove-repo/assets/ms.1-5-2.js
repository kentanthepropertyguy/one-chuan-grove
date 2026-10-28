/* Ken Tan · The Property Guy — microsite behaviour (shared, framework file).
   Progressive enhancement only: every link and section works without this script.
   Privacy: analytics events carry the project id, enquiry type and placement only —
   never WhatsApp message text, prices a visitor looked at, or anything they typed. */
(function () {
  'use strict';
  var cfgEl = document.getElementById('ms-config');
  var CFG = {};
  try { CFG = JSON.parse(cfgEl ? cfgEl.textContent : '{}'); } catch (e) { CFG = {}; }
  var PID = CFG.project_id || '';

  function track(name, params) {
    var p = Object.assign({ project_id: PID }, params || {});
    try { if (window.gtag) window.gtag('event', name, p); } catch (e) { /* analytics unavailable */ }
  }
  function pixel(evt) {
    try { if (window.fbq) window.fbq('track', evt, { content_name: PID }); } catch (e) { /* pixel unavailable */ }
  }

  /* ---- campaign attribution: kept for this visit only, used in the enquiry reference ---- */
  var ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var attr = {};
  try {
    var q = new URLSearchParams(location.search), found = {};
    ATTR_KEYS.forEach(function (k) { var v = q.get(k); if (v) found[k] = v.slice(0, 60); });
    if (Object.keys(found).length) sessionStorage.setItem('ms_attr', JSON.stringify(found));
    attr = JSON.parse(sessionStorage.getItem('ms_attr') || '{}') || {};
  } catch (e) { attr = {}; }
  function campaignCode() {
    var c = attr.utm_campaign || '';
    return c.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24);
  }

  /* ---- WhatsApp: the visitor reviews and sends the message themselves ---- */
  function withCampaign(href) {
    var code = campaignCode();
    if (!code) return href;
    try {
      var u = new URL(href), t = u.searchParams.get('text') || '';
      if (t.indexOf('(Ref ') >= 0 && t.indexOf('/' + code + ')') < 0) {
        t = t.replace(/\(Ref ([^)]*)\)/, function (m, ref) { return '(Ref ' + ref + '/' + code + ')'; });
        u.searchParams.set('text', t);
        return u.toString();
      }
    } catch (e) { /* keep the original link */ }
    return href;
  }

  /* ---- Groundwork: pass the referring project, never personal details ---- */
  function groundworkHref(href, tool) {
    try {
      var u = new URL(href);
      /* Always name this project as the source, so an enquiry started on Groundwork still says which
         microsite it came from. Only the visitor's ad campaign name is carried over; never anything typed. */
      u.searchParams.set('utm_source', PID || 'microsite');
      u.searchParams.set('utm_medium', 'microsite');
      u.searchParams.set('utm_campaign', attr.utm_campaign || 'microsite-groundwork');
      u.searchParams.set('utm_content', tool || '');
      u.searchParams.set('kpt_from', 'microsite-' + PID);
      return u.toString();
    } catch (e) { return href; }
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    if (a.hasAttribute('data-wa')) {
      a.href = withCampaign(a.getAttribute('href'));
      track('whatsapp_click', { enquiry: a.getAttribute('data-wa'), placement: a.getAttribute('data-placement') || '' });
      pixel('Contact');
    } else if (a.hasAttribute('data-gw')) {
      a.href = groundworkHref(a.getAttribute('href'), a.getAttribute('data-gw'));
      track('groundwork_click', { tool: a.getAttribute('data-gw') });
    } else if (a.getAttribute('data-out') === 'tiktok') {
      track('tiktok_click', { placement: a.getAttribute('data-placement') || 'footer' });
    } else if (a.hasAttribute('data-out')) {
      track('outbound_click', { destination: a.getAttribute('data-out') });
    }
  });

  /* ---- data freshness: re-checked in the visitor's browser, so an old build still warns ---- */
  function daysSince(iso) {
    var d = new Date(iso + 'T00:00:00+08:00');
    if (isNaN(d)) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-checked][data-stale-days]'), function (el) {
    var n = daysSince(el.getAttribute('data-checked')), lim = parseInt(el.getAttribute('data-stale-days'), 10);
    var warn = el.querySelector('[data-stale-warn]');
    if (!warn || n === null || isNaN(lim)) return;
    var out = warn.querySelector('[data-stale-n]');
    if (out) out.textContent = String(n);
    warn.hidden = !(n > lim);
  });

  /* ---- floor-plan tabs ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), function (box) {
    var tabs = box.querySelectorAll('[role="tab"]');
    function show(t, focus) {
      Array.prototype.forEach.call(tabs, function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', on ? 'true' : 'false');
        x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      if (focus) t.focus();
    }
    Array.prototype.forEach.call(tabs, function (t, i) {
      t.addEventListener('click', function () { show(t, false); track('plan_view', { plan: t.getAttribute('data-plan') || '' }); });
      t.addEventListener('keydown', function (ev) {
        var j = ev.key === 'ArrowRight' ? i + 1 : ev.key === 'ArrowLeft' ? i - 1 : null;
        if (j === null) return;
        ev.preventDefault();
        show(tabs[(j + tabs.length) % tabs.length], true);
      });
    });
  });

  /* ---- footer: other developments, refreshed from the central registry (built-in list is the fallback) ---- */
  var regBox = document.querySelector('[data-reg-devs]');
  if (regBox && window.KTPGRegistry) {
    window.KTPGRegistry.load({ url: CFG.registry }).then(function (r) {
      if (r.source !== 'registry') return;
      var others = r.directory.filter(function (p) { return p.id !== PID; });
      var esc = window.KTPGRegistry.esc;
      regBox.querySelector('[data-reg-list]').innerHTML = others.map(function (p) {
        return '<a href="' + esc(p.url) + '" data-out="dev-' + esc(p.id) + '">' + esc(p.name) + '</a>';
      }).join('');
      regBox.hidden = !others.length;
    });
  }

  /* ---- section highlighting in the header and the mobile chips ---- */
  var navLinks = document.querySelectorAll('.links a[href^="#"], .chips a[href^="#"]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    Array.prototype.forEach.call(navLinks, function (a) { var id = a.getAttribute('href').slice(1); (byId[id] = byId[id] || []).push(a); });
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || current === en.target.id) return;
        current = en.target.id;
        Array.prototype.forEach.call(navLinks, function (a) { a.removeAttribute('aria-current'); });
        (byId[current] || []).forEach(function (a) {
          a.setAttribute('aria-current', 'true');
          if (a.parentNode.classList.contains('chips')) {
            var bar = a.parentNode, l = a.offsetLeft - 16;
            if (l < bar.scrollLeft || a.offsetLeft + a.offsetWidth > bar.scrollLeft + bar.clientWidth) bar.scrollTo({ left: l, behavior: 'smooth' });
          }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }
})();

/* 1.5.1 · overflow cue on wide tables: shown only while columns are hidden to the right. No data or tracking. */
(function () {
  try {
    document.querySelectorAll('.tbl').forEach(function (el) {
      var w = document.createElement('div'); w.className = 'xscroll'; el.parentNode.insertBefore(w, el); w.appendChild(el);
      var m = document.createElement('span'); m.className = 'more-cue'; m.setAttribute('aria-hidden', 'true'); m.textContent = '\u203a'; w.appendChild(m);
      function upd() { w.classList.toggle('has-more', el.scrollWidth > el.clientWidth + 1 && el.scrollLeft + el.clientWidth < el.scrollWidth - 2); }
      el.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    });
  } catch (e) {}
})();
