/* Ken Tan · The Property Guy — new-launch quick calculator (framework 1.5.2, shared component).
   Lucerne Grand carries a byte-identical copy of this file; change both together, then re-run the parity test.
   Formulas and input rules match Groundwork (main 3e24a05; tests/calc_parity.js checks them against its engine):
   instalment = standard annuity on the full loan; BSD = IRAS bands from 15 Feb 2023, rounded down to the dollar,
   at least $1; 75% loan and 5% minimum cash = MAS limits for a borrower with no other home loan, tenure up to
   30 years and ending by 65. Money parsing and limits are Groundwork's own. Nothing typed is sent anywhere. */
(function () {
  'use strict';
  var R = {
    asOf: '2026-10-28',
    bsdBands: [[180000, 0.01], [180000, 0.02], [640000, 0.03], [500000, 0.04], [1500000, 0.05], [Infinity, 0.06]],
    bsdMinimum: 1, ltv: 0.75, minCash: 0.05, defaultRate: 4, maxYears: 30,
    rate: { min: 0, max: 20 }, money: { max: 1e8 }
  };
  var MONEY_HINT = 'Type the full amount, e.g. 1,200,000 or 1.2m.';

  function parseMoney(s) {
    var t = String(s == null ? '' : s).trim();
    if (!t) return { empty: true };
    if (/[-−–]/.test(t)) return { error: 'Amounts can’t be negative.' };
    t = t.replace(/^(s\$|\$)\s*/i, '').replace(/\s+/g, '');
    var mult = 1, suf = /^(.*?)(k|m|mil|million)$/i.exec(t);
    if (suf) { mult = /^k$/i.test(suf[2]) ? 1e3 : 1e6; t = suf[1]; }
    if (!/^(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$/.test(t) && !(mult > 1 && /^\.\d+$/.test(t))) {
      return { error: /^[\d.,]+$/.test(t) && /,/.test(t) ? 'Use commas only between thousands, e.g. 1,200,000.' : MONEY_HINT };
    }
    var v = Math.round(parseFloat(t.replace(/,/g, '')) * mult * 100) / 100;
    return isFinite(v) ? { value: v } : { error: MONEY_HINT };
  }
  function parseNum(s, eg) {
    var t = String(s == null ? '' : s).trim().replace(/\s*%$/, '');
    if (!t) return { empty: true };
    if (/[-−–]/.test(t)) return { error: 'This can’t be negative.' };
    if (/^\d+,\d+$/.test(t)) return { error: 'Use a dot for decimals, e.g. 4.5.' };
    if (!/^(\d+(\.\d+)?|\.\d+)$/.test(t)) return { error: 'Type a number, e.g. ' + (eg || '25') + '.' };
    return { value: parseFloat(t) };
  }
  function bsd(price) {
    var left = price, total = 0;
    for (var i = 0; i < R.bsdBands.length; i++) {
      var slice = Math.min(left, R.bsdBands[i][0]);
      total += slice * R.bsdBands[i][1];
      left -= slice;
      if (left <= 0) break;
    }
    return Math.max(R.bsdMinimum, Math.floor(total));
  }
  function instal(loan, ratePct, years) {
    var n = Math.round(years * 12), r = ratePct / 100;
    if (!(loan > 0) || n <= 0) return 0;
    return r > 0 ? loan / ((1 - Math.pow(1 + r / 12, -n)) / (r / 12)) : loan / n;
  }
  /* price in dollars, rate in % a year, years; rate/years may be null (then no instalment) */
  function compute(price, ratePct, years) {
    var loan = price * R.ltv, cash = price * R.minCash;
    return { loan: loan, cash: cash, rest: price - loan - cash, bsd: bsd(price),
      monthly: ratePct === null || years === null ? null : instal(loan, ratePct, years) };
  }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function format(v) { return (Math.round(v * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }); }

  var api = { rules: R, parseMoney: parseMoney, parseNum: parseNum, bsd: bsd, instal: instal, compute: compute,
    money: money, format: format, update: function () {} };
  if (typeof window !== 'undefined') window.KC = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  var root = document.querySelector('[data-kc]');
  if (!root) return;
  var $ = function (id) { return document.getElementById(id); };
  var price = $('price'), rate = $('rate'), ten = $('tenure');
  var out = { mth: $('o-mth'), loan: $('o-loan'), cash: $('o-cash'), rest: $('o-cpf'), bsd: $('o-bsd') };
  var notes = { price: $('price-note'), rate: $('rate-note'), ten: $('ten-note') };
  var base = { price: notes.price.textContent, rate: notes.rate.textContent, ten: notes.ten.textContent };
  var tenReset = false, used = false;

  function say(key, input, msg, warn) {
    notes[key].textContent = msg || base[key];
    notes[key].classList.toggle('kc-err', !!msg && !warn);
    notes[key].classList.toggle('kc-warn', !!warn);
    if (msg && !warn) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }
  function update() {
    var P = parseMoney(price.value), Rt = parseNum(rate.value, '4'), Y = parseNum(ten.value, '30');
    var p = null, r = null, y = null;
    if (P.empty) say('price', price, '');
    else if (P.error) say('price', price, P.error);
    else if (!(P.value > 0)) say('price', price, 'Enter a price above $0.');
    else if (P.value > R.money.max) say('price', price, 'That’s more than $100 million: check the amount.');
    else { p = P.value; say('price', price, ''); }
    if (Rt.empty) say('rate', rate, 'Enter an interest rate, e.g. 4.');
    else if (Rt.error) say('rate', rate, Rt.error);
    else if (Rt.value < R.rate.min || Rt.value > R.rate.max) say('rate', rate, 'Enter an interest rate between 0% and 20% a year.');
    else { r = Rt.value; say('rate', rate, ''); }
    if (tenReset) { y = R.maxYears; say('ten', ten, 'Set to 30 years, the limit of this quick estimate. For a longer tenure, use Groundwork’s detailed calculations below.', true); }
    else if (Y.empty) say('ten', ten, 'Enter a tenure of 1 to 30 years.');
    else if (Y.error) say('ten', ten, Y.error);
    else if (Y.value < 1) say('ten', ten, 'Enter a tenure of 1 to 30 years.');
    else { y = Y.value; say('ten', ten, ''); }
    var res = p === null ? null : compute(p, r, y);
    out.loan.textContent = res ? money(res.loan) : '—';
    out.cash.textContent = res ? money(res.cash) : '—';
    out.rest.textContent = res ? money(res.rest) : '—';
    out.bsd.textContent = res ? money(res.bsd) : '—';
    out.mth.textContent = res && res.monthly !== null ? money(res.monthly) : '—';
    if (res && res.monthly !== null && used && !api._tracked && root.hasAttribute('data-kc-track')) {
      api._tracked = true; // one event per visit, no amounts (privacy rule)
      try { if (window.gtag) window.gtag('event', 'calculator_use', { project_id: root.getAttribute('data-kc-track') }); } catch (e) { /* analytics unavailable */ }
    }
  }
  api.update = update;
  price.addEventListener('input', function () { used = true; update(); });
  price.addEventListener('change', function () { var P = parseMoney(price.value); if (P.value > 0 && P.value <= R.money.max) price.value = format(P.value); });
  rate.addEventListener('input', function () { used = true; update(); });
  ten.addEventListener('input', function () {
    used = true;
    var Y = parseNum(ten.value);
    tenReset = Y.value > R.maxYears;
    if (tenReset) ten.value = String(R.maxYears);
    update();
  });
  var P0 = parseMoney(price.value);
  if (P0.value > 0) price.value = format(P0.value);
  update();
})();
