/* Ken Tan · The Property Guy — development registry reader, v2.0.0
   Reads ktpg.registry/2 (and the older ktpg.registry/1, for a smooth rollout). One dependency-free script
   shared by the homepage, Groundwork and every microsite. Copy it into each site unchanged.

   KTPGRegistry.load() always resolves, never throws:
     { source: "registry", projects, featured, directory, groundwork, updated_on }
     { source: "fallback" }   when the file is missing, slower than 4 s, invalid or blocked — keep what you show.

   projects    every valid published project
   featured    published projects with a featured rank, by rank (homepage shows the first 3)
   directory   all published projects: featured first by rank, then newest listings
   groundwork  published projects with research: true — for Groundwork's microsite links only.
               Whether a development exists in Groundwork Research never depends on this file.

   Anything not published, not https://<name>.kentanthepropertyguy.com/, or incomplete is skipped.
   The registry carries no pricing. */
(function (root) {
  'use strict';
  var URL_DEFAULT = 'https://kentanthepropertyguy.com/developments.json';
  var HOST_RE = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.kentanthepropertyguy\.com\/$/;
  var SALES = { upcoming: 'Upcoming', selling: 'Selling', 'fully-sold': 'Fully sold' };
  var V1_SALES = { 'pre-launch': 'upcoming', 'new-launch': 'selling', completed: 'fully-sold' };

  function str(v, max) { return typeof v === 'string' && v.trim() && v.length <= max; }

  /* Bring a v1 entry into the v2 shape: in v1 every published project was shown on the homepage. */
  function fromV1(p) {
    return { id: p.id, name: p.name, status: p.status, url: p.url, card: p.card, tagline: p.tagline, aliases: p.aliases,
      groundwork_id: p.groundwork_id, area: p.area, district: p.district, listed_on: p.listed_on,
      sales: V1_SALES[p.stage], research: true, featured: typeof p.order === 'number' ? { rank: p.order } : null };
  }

  function valid(p) {
    return !!(p && p.status === 'published' && typeof p.id === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id) &&
      typeof p.url === 'string' && HOST_RE.test(p.url) && str(p.name, 60) && SALES[p.sales] &&
      p.card && str(p.card.tag, 40) && str(p.card.text, 140) && typeof p.research === 'boolean' &&
      (p.featured === null || p.featured === undefined || (typeof p.featured === 'object' && p.featured.rank >= 1)));
  }

  function views(list, updated) {
    var featured = list.filter(function (p) { return p.featured; })
      .sort(function (a, b) { return a.featured.rank - b.featured.rank; }).slice(0, 6);
    var rest = list.filter(function (p) { return !p.featured; })
      .sort(function (a, b) { return (b.listed_on || '').localeCompare(a.listed_on || ''); });
    return { source: 'registry', projects: list, featured: featured, directory: featured.concat(rest),
      groundwork: list.filter(function (p) { return p.research; }), updated_on: updated || null };
  }

  function load(opts) {
    opts = opts || {};
    var url = opts.url || URL_DEFAULT, ms = opts.timeout || 4000, fallback = { source: 'fallback' };
    if (typeof fetch !== 'function') return Promise.resolve(fallback);
    var timer, timeout = new Promise(function (res) { timer = setTimeout(function () { res(null); }, ms); });
    var req = fetch(url, { cache: 'no-cache', credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
    return Promise.race([req, timeout]).then(function (doc) {
      clearTimeout(timer);
      if (!doc || !Array.isArray(doc.projects)) return fallback;
      var raw;
      if (doc.schema === 'ktpg.registry/2') raw = doc.projects;
      else if (doc.schema === 'ktpg.registry/1') raw = doc.projects.map(fromV1);
      else return fallback;
      var list = raw.filter(valid);
      return list.length ? views(list, doc.updated_on) : fallback;
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* The homepage's existing card markup: a.dev > span.tag, h3, p, span.go */
  function homeCardsHTML(entries) {
    return entries.map(function (p) {
      return '<a class="dev" href="' + esc(p.url) + '" data-track="development" data-project="' + esc(p.id) + '">' +
        '<span class="tag">' + esc(p.card.tag) + '</span><h3>' + esc(p.name) + '</h3><p>' + esc(p.card.text) + '</p>' +
        '<span class="go">' + esc(p.card.cta || ('View ' + p.name)) + ' ›</span></a>';
    }).join('');
  }

  /* /developments/ page: published projects grouped by sales status, in directory order. */
  function directoryGroups(result) {
    var d = result.directory || [];
    return [
      { key: 'current', title: 'Upcoming and selling', entries: d.filter(function (p) { return p.sales !== 'fully-sold'; }) },
      { key: 'sold', title: 'Fully sold', entries: d.filter(function (p) { return p.sales === 'fully-sold'; }) }
    ].filter(function (g) { return g.entries.length; });
  }

  /* Groundwork: entries in the shape of data/research/sites.json "sites", plus the sales label. */
  function toGroundworkSites(entries) {
    return entries.map(function (p) {
      return { id: p.groundwork_id || p.id, name: p.name, aliases: p.aliases || [], url: p.url, status: 'configured',
        host: p.url.replace(/^https:\/\//, '').replace(/\/$/, ''), sales: p.sales, sales_label: SALES[p.sales],
        tagline: p.tagline || p.card.text };
    });
  }

  root.KTPGRegistry = { URL: URL_DEFAULT, version: '2.0.0', SALES: SALES, load: load, valid: valid, esc: esc,
    homeCardsHTML: homeCardsHTML, directoryGroups: directoryGroups, toGroundworkSites: toGroundworkSites };
})(typeof window !== 'undefined' ? window : this);
