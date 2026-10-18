/* Time Diary prototype — diaries, timeline, Add / Edit activity, submit, past diaries and pages.
   Saved on the phone with IndexedDB. Rule: store first, confirm second. */
(function () {
  'use strict';

  var Q = 96;                 // quarter hours in a day
  var LIMIT = 3;              // most activities allowed at the same moment
  var NOW_Q = 58;             // prototype clock time: 14:30
  var DIARY_DAYS = 14;
  var CATALOGUE_VERSION = '2026-10-17';
  var FIRST_TODAY = '2026-10-20';   // prototype "today" until skipped ahead

  var $ = function (id) { return document.getElementById(id); };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var hm = function (q) { var m = (((q % Q) + Q) % Q) * 15; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  var uid = function () { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 9); };
  var nowIso = function () { return new Date().toISOString(); };

  /* ---------- Dates as ISO strings (YYYY-MM-DD), worked in UTC so they never shift ---------- */
  var addDays = function (iso, n) { return new Date(Date.parse(iso + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10); };
  var daysBetween = function (a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 864e5); };
  /* Fixed English short names, so every browser writes the same thing ("Sep", never "Sept") */
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var parts = function (iso) { var d = new Date(iso + 'T12:00:00Z'); return { wd: WD[d.getUTCDay()], d: d.getUTCDate(), mo: MO[d.getUTCMonth()] }; };
  var dayName = function (iso) { var p = parts(iso); return p.wd + ' ' + p.d + ' ' + p.mo; };     // Tue 20 Oct
  var shortDate = function (iso) { var p = parts(iso); return p.d + ' ' + p.mo; };                 // 20 Oct
  var rangeOf = function (d) { return shortDate(d.start) + ' – ' + shortDate(addDays(d.start, d.days - 1)); };

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function svg(path) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'td-icon'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = path; return s;
  }

  /* ======================================================================
     Storage: a thin wrapper around IndexedDB. Falls back to memory, and says so.
     ====================================================================== */
  var store = (function () {
    var dbp = null, memory = null;
    function open() {
      if (dbp) return dbp;
      dbp = new Promise(function (resolve, reject) {
        try {
          var req = indexedDB.open('time-diary', 2);
          req.onupgradeneeded = function () {
            var db = req.result;
            ['activities', 'drafts', 'meta', 'diaries'].forEach(function (n) { if (!db.objectStoreNames.contains(n)) db.createObjectStore(n, { keyPath: 'id' }); });
          };
          req.onsuccess = function () { resolve(req.result); };
          req.onerror = function () { reject(req.error); };
        } catch (err) { reject(err); }
      });
      return dbp;
    }
    function memoryStore(name) {
      var m = memory[name] || (memory[name] = {});
      return {
        getAll: function () { return { result: Object.keys(m).map(function (k) { return m[k]; }) }; },
        get: function (id) { return { result: m[id] }; },
        put: function (r) { m[r.id] = r; },
        delete: function (id) { delete m[id]; },
        clear: function () { memory[name] = {}; }
      };
    }
    function tx(name, mode, fn) {
      if (memory) { var r = fn(memoryStore(name)); return Promise.resolve(r && 'result' in r ? r.result : undefined); }
      return open().then(function (db) {
        return new Promise(function (resolve, reject) {
          var t = db.transaction(name, mode), req = fn(t.objectStore(name));
          t.oncomplete = function () { resolve(req && 'result' in req ? req.result : undefined); };
          t.onerror = t.onabort = function () { reject(t.error); };
        });
      });
    }
    return {
      useMemory: function () { memory = {}; },
      all: function (n) { return tx(n, 'readonly', function (s) { return s.getAll(); }); },
      get: function (n, id) { return tx(n, 'readonly', function (s) { return s.get(id); }); },
      put: function (n, recs) { return tx(n, 'readwrite', function (s) { recs.forEach(function (r) { s.put(r); }); }); },
      del: function (n, id) { return tx(n, 'readwrite', function (s) { s.delete(id); }); },
      clear: function (n) { return tx(n, 'readwrite', function (s) { s.clear(); }); }
    };
  })();

  /* ======================================================================
     State
     ====================================================================== */
  var diaries = [];        // { id, number, start, days, status: 'open' | 'submitted', submittedOn, receivedAt, ref }
  var entries = [];        // every activity record, removed ones included (so Undo always works)
  var today = FIRST_TODAY; // prototype clock
  var viewing = null;      // the diary shown on the timeline
  var view = 'timeline';   // timeline | past | help | study | privacy | contact

  var live = function (d) { return entries.filter(function (e) { return !e.removedAt && (!d || e.diaryId === d.id); }); };
  var byId = function (id) { return entries.find(function (e) { return e.id === id; }); };
  var sorted = function () { return diaries.slice().sort(function (a, b) { return a.number - b.number; }); };
  var currentDiary = function () { var c = null; sorted().forEach(function (d) { if (d.start <= today) c = d; }); return c || sorted()[0]; };
  var nextStart = function () { var c = currentDiary(); return addDays(c.start, c.days); };
  var pastDiaries = function () { return sorted().filter(function (d) { return d.status === 'submitted'; }).reverse(); };
  /* sent and received, and the next diary hasn't started yet */
  var isWaiting = function () { var c = currentDiary(); return c.status === 'submitted' && nextStart() > today; };
  var readOnly = function () { return !!viewing && (viewing.status === 'submitted' || viewing.status === 'pending'); };  /* pending = locked, waiting to send */
  var todayIndex = function (d) { var i = daysBetween(d.start, today); return i >= 0 && i < d.days ? i : -1; };

  function record(r) {
    var t = nowIso();
    r.v = 1; r.catalogueVersion = CATALOGUE_VERSION; r.createdAt = r.createdAt || t; r.updatedAt = t; r.removedAt = r.removedAt || null;
    return r;
  }
  function save(recs) {
    return store.put('activities', recs).then(function () {
      recs.forEach(function (r) { var i = entries.findIndex(function (e) { return e.id === r.id; }); if (i < 0) entries.push(r); else entries[i] = r; });
      askToKeepStorage();
    });
  }
  function saveDiary(d) { return store.put('diaries', [d]); }
  var askedPersist = false;
  function askToKeepStorage() {
    if (askedPersist) return; askedPersist = true;
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {}); } catch (err) {}
  }

  /* ---------- Sample data for the prototype ---------- */
  var SIMPLE_DAY = [[0, 28, 'general.sleeping', 'Sleeping', 'general', null], [28, 32, 'general.adl', 'Activities of Daily Living', 'general', null], [32, 34, 'travel.travelling.walking', 'Travelling: walking', 'travel', 'travel.travelling']];
  function activity(diaryId, day, a) { var id = uid(); return record({ id: id, group: id, diaryId: diaryId, day: day, start: a[0], end: a[1], activityId: a[2], label: a[3], pattern: a[4], parent: a[5] || null, note: '', sample: true }); }
  function seed() {
    var d1 = { id: 'd1', number: 1, start: '2026-09-21', days: DIARY_DAYS, status: 'submitted', submittedOn: '2026-10-04', ref: 'K7PD-2M' };
    var d2 = { id: 'd2', number: 2, start: '2026-10-05', days: DIARY_DAYS, status: 'submitted', submittedOn: '2026-10-18', ref: 'W3RT-9X' };
    var d3 = { id: 'd3', number: 3, start: '2026-10-19', days: DIARY_DAYS, status: 'open' };
    var recs = [];
    [d1, d2].forEach(function (d) { for (var i = 0; i < d.days; i++) SIMPLE_DAY.forEach(function (a) { recs.push(activity(d.id, i, a)); }); });
    [
      [0, [0, 28, 'general.sleeping', 'Sleeping', 'general']], [0, [28, 31, 'general.adl', 'Activities of Daily Living', 'general']],
      [0, [31, 33, 'travel.travelling.cycle', 'Travelling: cycle', 'travel', 'travel.travelling']],
      [0, [80, 83, 'general.adl', 'Activities of Daily Living', 'general']], [0, [82, 86, 'general.resting', 'Resting', 'general']],
      [0, [90, 124, 'general.sleeping', 'Sleeping', 'general']], [1, [28, 30, 'general.adl', 'Activities of Daily Living', 'general']],
      [1, [30, 32, 'travel.travelling.public-transport', 'Travelling: public transport', 'travel', 'travel.travelling']],
      [1, [48, 52, 'other.forgot', 'Forgot / Unspecified', 'other']]
    ].forEach(function (x) { recs.push(activity('d3', x[0], x[1])); });
    return { diaries: [d1, d2, d3], entries: recs };
  }

  /* ======================================================================
     Timeline: day sections are built for the diary on screen
     ====================================================================== */
  var daysBox = $('days'), dayEls = [];
  var HOURS = ''; for (var h = 0; h < 24; h++) HOURS += '<li><time>' + pad(h) + ':00</time></li>';
  var dayLabel = function (i) { return dayName(addDays(viewing.start, i)); };

  function buildDays(d) {
    dayEls = [];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < d.days; i++) {
      var iso = addDays(d.start, i), sec = el('section', 'td-tl-day');
      sec.id = 'day-' + iso; sec.setAttribute('aria-labelledby', 'h-' + iso);
      var head = el('h2', 'td-tl-day__head', dayName(iso)); head.id = 'h-' + iso;
      var grid = el('div', 'td-tl-grid'), hours = el('ol', 'td-tl-hours'), track = el('ol', 'td-tl-track');
      hours.setAttribute('aria-hidden', 'true'); hours.innerHTML = HOURS; track.setAttribute('aria-label', 'Activities on ' + dayName(iso));
      grid.append(hours, track); sec.append(head, grid); frag.append(sec); dayEls.push(sec);
    }
    daysBox.replaceChildren(frag);
    current = -1;
  }

  function segmentsFor(d, i) {
    var segs = [];
    live(d).forEach(function (e) {
      if (e.day === i) segs.push({ e: e, s: e.start, en: Math.min(e.end, Q), after: e.end > Q });
      if (e.day === i - 1 && e.end > Q) segs.push({ e: e, s: 0, en: e.end - Q, before: true });
    });
    segs.sort(function (a, b) { return a.s - b.s || b.en - a.en; });
    var cluster = [], clusterEnd = -1;
    function close() {
      var lanes = [];
      cluster.forEach(function (sg) { var k = lanes.findIndex(function (end) { return end <= sg.s; }); if (k < 0) { k = lanes.length; lanes.push(0); } lanes[k] = sg.en; sg.lane = k; });
      cluster.forEach(function (sg) { sg.lanes = lanes.length; }); cluster = [];
    }
    segs.forEach(function (sg) { if (sg.s >= clusterEnd && cluster.length) close(); cluster.push(sg); clusterEnd = Math.max(clusterEnd, sg.en); });
    if (cluster.length) close();
    return segs;
  }

  function eventItem(sg, i) {
    var e = sg.e, dur = sg.en - sg.s, li = el('li', 'td-event'), short = dur <= 3;
    if (short) li.classList.add('td-event--short');
    if (short && sg.lanes > 1) li.classList.add('td-event--narrow');
    if (sg.after) li.classList.add('td-event--cont-after');
    if (sg.before) li.classList.add('td-event--cont-before');
    li.style.cssText = '--start:' + sg.s + ';--dur:' + dur + (sg.lanes > 1 ? ';--lane:' + sg.lane + ';--lanes:' + sg.lanes : '');
    var btn = el('button', 'td-event__btn'); btn.type = 'button'; btn.dataset.id = e.id;
    var top = el('span', 'td-event__top'), pat = el('span', 'td-pat td-pat--sm td-pat--' + e.pattern); pat.setAttribute('aria-hidden', 'true');
    top.append(pat, el('span', 'td-event__title', e.label));
    var time = el('span', 'td-event__time'), range = hm(e.start) + ' – ' + hm(e.end);
    if (sg.after) { time.append(range + ' '); var a = el('span', null, '↓'); a.setAttribute('aria-hidden', 'true'); time.append(a, el('span', 'td-vh', ', ends ' + (i + 1 < viewing.days ? dayLabel(i + 1) : 'the next day'))); }
    else if (sg.before) { var b = el('span', null, '↑'); b.setAttribute('aria-hidden', 'true'); time.append(b, el('span', 'td-vh', 'Started ' + dayLabel(i - 1) + ', '), ' ' + range); }
    else time.textContent = range;
    btn.append(top, time); li.append(btn); return li;
  }

  function gapItem(i, s, en) {
    var li = el('li', 'td-gap'); li.style.cssText = '--start:' + s + ';--dur:' + (en - s);
    var btn = el('button', 'td-gap__btn'); btn.type = 'button'; btn.dataset.day = i; btn.dataset.start = s; btn.dataset.end = en;
    btn.append(svg('<path d="M12 5v14M5 12h14"/>'), ' Nothing added · ' + hm(s) + ' – ' + hm(en));
    li.append(btn); return li;
  }

  function render() {
    var d = viewing, empty = [], ti = todayIndex(d);
    dayEls.forEach(function (sec, i) {
      var track = sec.querySelector('.td-tl-track'), segs = segmentsFor(d, i), items = [];
      segs.forEach(function (sg) { items.push([sg.s, eventItem(sg, i)]); });
      var reach = segs.length ? segs[0].s : 0;
      if (!readOnly()) segs.forEach(function (sg) { if (sg.s > reach) items.push([reach, gapItem(i, reach, sg.s)]); reach = Math.max(reach, sg.en); });
      items.sort(function (a, b) { return a[0] - b[0]; });
      track.replaceChildren.apply(track, items.map(function (x) { return x[1]; }));
      if (i === ti) { var now = el('li', 'td-now'); now.style.setProperty('--at', NOW_Q); now.setAttribute('aria-hidden', 'true'); track.append(now); }
      if (!segs.length) empty.push(i);
    });
    updateSubmit(empty);
    updateReadOnlyNote();
    /* A brand-new diary with nothing in it gets one line telling you how to start */
    var fresh = !readOnly() && d === currentDiary() && !live(d).length;
    $('empty-note').hidden = !fresh;
    if (fresh) $('empty-text').replaceChildren(el('strong', null, 'Diary ' + d.number + ' has started.'), ' Tap Add activity to fill in your day.');
    $('fab').hidden = readOnly() || view !== 'timeline';
    updateMenu();
  }

  function updateReadOnlyNote() {
    var note = $('readonly-note'), d = viewing, txt = $('readonly-text');
    note.hidden = !readOnly();
    if (!readOnly()) return;
    txt.replaceChildren();
    if (d.status === 'pending') {
      if (online()) txt.append(el('strong', null, 'Ready to send.'), ' You\u2019re back online. Tap Submit to check and send your diary.');
      else txt.append(el('strong', null, 'Waiting to send.'), ' Your diary is locked and safe on this phone. When you\u2019re back online, tap Submit to send it.');
      $('readonly-back').hidden = true;
    } else {
      txt.append(el('strong', null, 'Diary ' + d.number + ' \u00b7 Submitted on ' + dayName(d.submittedOn) + '.'), ' You can look, but not change it.');
      $('readonly-back').hidden = false;
    }
  }

  var ready = false, lastEmpty = [];
  function updateSubmit(empty) {
    var btn = $('submit-btn'), d = viewing; lastEmpty = empty;
    ready = d.status === 'pending' ? online() : !readOnly() && !empty.length;   /* a locked diary sends only through Review */
    if (ready) { btn.removeAttribute('aria-disabled'); btn.removeAttribute('popovertarget'); btn.className = 'td-btn td-btn--primary td-btn--sm'; return; }
    btn.setAttribute('aria-disabled', 'true'); btn.setAttribute('popovertarget', 'submit-why'); btn.className = 'td-btn td-btn--secondary td-btn--sm';
    if (readOnly()) {
      $('sw-title').textContent = d.status === 'pending' ? 'Waiting to send' : 'Already submitted';
      $('sw-text').textContent = d.status === 'pending'
        ? 'You\u2019re offline. Submit works again as soon as you\u2019re back online.'
        : 'Diary ' + d.number + ' was submitted on ' + dayName(d.submittedOn) + '.';
      $('sw-go').hidden = true;
    } else {
      $('sw-title').textContent = 'Not ready to submit yet';
      $('sw-text').textContent = "You haven't added activities for " + empty.length + (empty.length === 1 ? ' day' : ' days') +
        ' yet. Submit opens when every day from ' + dayLabel(0) + ' to ' + dayLabel(d.days - 1) + ' has activities.';
      $('sw-go').textContent = 'Go to ' + dayLabel(empty[0]); $('sw-go').href = '#' + dayEls[empty[0]].id; $('sw-go').hidden = false;
    }
  }

  /* ---------- Top bar follows the scroll ---------- */
  var bar = $('topbar'), current = -1;
  function setBar() { document.documentElement.style.setProperty('--topbar-h', bar.offsetHeight + 'px'); }
  function dayInView() { var h = bar.getBoundingClientRect().bottom, i = 0; dayEls.forEach(function (d, k) { if (d.getBoundingClientRect().top <= h + 1) i = k; }); return i; }
  function updateDayNav() {
    if (view !== 'timeline' || !dayEls.length) return;
    var i = dayInView(); if (i === current) return; current = i;
    var n = viewing.days;
    $('day-label').textContent = dayLabel(i); $('day-meta').textContent = 'Day ' + (i + 1) + ' of ' + n;
    var prev = $('day-prev'), next = $('day-next');
    prev.inert = i === 0; next.inert = i === n - 1;
    if (i > 0) { prev.href = '#' + dayEls[i - 1].id; prev.setAttribute('aria-label', 'Previous day, ' + dayLabel(i - 1)); }
    if (i < n - 1) { next.href = '#' + dayEls[i + 1].id; next.setAttribute('aria-label', 'Next day, ' + dayLabel(i + 1)); }
  }
  /* Previous / next day: one instant scroll, no hash jump. A hash jump scrolled twice (browser, then route) and
     repainted the sticky bar on phones; replaceState also keeps Back from stepping through every day. */
  function goToDay(i) {
    var sec = dayEls[i]; if (!sec) return;
    window.scrollTo(0, Math.round(sec.getBoundingClientRect().top + window.scrollY - bar.offsetHeight));
    try { history.replaceState(null, '', '#' + sec.id); } catch (err) {}
    updateDayNav();
  }
  ['day-prev', 'day-next'].forEach(function (id, k) {
    $(id).addEventListener('click', function (ev) {
      if (view !== 'timeline' || !dayEls.length) return;
      ev.preventDefault(); goToDay(dayInView() + (k ? 1 : -1));
    });
  });
  function hourPx() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-row')) || 64; }
  function timeInView() {
    var y = bar.getBoundingClientRect().bottom, qpx = hourPx() / 4;
    for (var i = 0; i < dayEls.length; i++) {
      var t = dayEls[i].querySelector('.td-tl-track').getBoundingClientRect();
      if (y < t.top) return { day: i, start: 0 };
      if (y < t.bottom) return { day: i, start: Math.max(0, Math.min(Q - 1, Math.floor((y - t.top) / qpx))) };
    }
    return { day: dayEls.length - 1, start: Q - 4 };
  }
  function scrollToToday() {
    var ti = todayIndex(viewing);
    if (ti < 0) { window.scrollTo(0, 0); return; }
    var sec = dayEls[ti], head = sec.querySelector('.td-tl-day__head');
    window.scrollTo(0, Math.round(sec.getBoundingClientRect().top + window.scrollY + head.offsetHeight + 7 * hourPx() + 8 - 2 * bar.offsetHeight));
  }

  /* ======================================================================
     Views: timeline (current or a past diary) and the menu's pages
     ====================================================================== */
  var PAGES = ['waiting', 'past', 'help', 'study', 'privacy', 'contact'];
  /* Home is the current diary, or the waiting screen between diaries */
  function home() { return isWaiting() ? show('waiting') : show('timeline', currentDiary()); }
  function show(name, diary) {
    var wasTimeline = view === 'timeline', prevDiary = viewing;
    view = name;
    var onTimeline = name === 'timeline';
    document.querySelector('.td-app').hidden = !onTimeline;
    $('pages').hidden = onTimeline;
    PAGES.forEach(function (p) { $('page-' + p).hidden = p !== name; });
    if (onTimeline) {
      viewing = diary || currentDiary();
      if (viewing !== prevDiary || !dayEls.length) buildDays(viewing);
      render();
      if (!wasTimeline || viewing !== prevDiary || readOnly()) { setBar(); if (!location.hash.startsWith('#day-')) { if (readOnly() || !live(viewing).length) window.scrollTo(0, 0); else scrollToToday(); } }
      updateDayNav();
    } else {
      if (name === 'past') renderPast();
      if (name === 'waiting') renderWaiting();
      window.scrollTo(0, 0);
      $('pt-' + name).focus({ preventScroll: true });
      $('fab').hidden = true;
      updateMenu();
    }
  }

  function route() {
    var h = location.hash.slice(1);
    if (h === 'waiting') return home();
    if (PAGES.indexOf(h) >= 0) return show(h);
    var m = /^past-(d\d+)$/.exec(h);
    if (m) { var d = diaries.find(function (x) { return x.id === m[1]; }); if (d) return show('timeline', d); }
    if (h.indexOf('day-') === 0) {
      if (!dayEls.length && isWaiting()) return home();
      if (view !== 'timeline' || !dayEls.length) show('timeline', viewing || currentDiary());   /* first load or a refresh on a day */
      var k = dayEls.findIndex(function (sec) { return sec.id === h; });
      if (k >= 0) goToDay(k); else home();
      return;
    }
    home();
  }

  function renderWaiting() {
    var c = currentDiary(), n = daysBetween(today, nextStart());
    $('wait-date').textContent = dayName(nextStart());
    $('wait-days').textContent = n === 1 ? 'Tomorrow' : 'In ' + n + ' days';
    $('wait-sent').href = '#past-' + c.id;
  }
  window.addEventListener('hashchange', route);

  function renderPast() {
    var list = $('past-list'), items = pastDiaries().map(function (d) {
      var a = el('a', 'td-rowlink'); a.href = '#past-' + d.id;
      var body = el('span', 'td-rowlink__body');
      body.append(el('span', 'td-rowlink__title', 'Diary ' + d.number + ' · ' + rangeOf(d)),
        el('span', 'td-rowlink__meta', 'Submitted ' + dayName(d.submittedOn) + ' · ' + live(d).length + ' activities'));
      a.append(svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'), body, svg('<path d="M9 6l6 6-6 6"/>'));
      var li = el('li'); li.append(a); return li;
    });
    list.replaceChildren.apply(list, items);
    list.hidden = !items.length; $('past-empty').hidden = !!items.length; $('past-intro').hidden = !items.length;
  }

  function updateMenu() {
    var c = currentDiary();
    $('menu-current').textContent = isWaiting() ? 'starts ' + shortDate(nextStart()) : rangeOf(c);
    $('menu-past').textContent = pastDiaries().length;
    document.querySelectorAll('#menu [data-view]').forEach(function (a) {
      var on = (a.dataset.view === view && (view !== 'timeline' || viewing === c)) || (a.dataset.view === 'timeline' && view === 'waiting');
      if (a.dataset.view === 'past' && view === 'timeline' && viewing !== c) on = true;
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ======================================================================
     Add / Edit activity (always on the current diary)
     ====================================================================== */
  var dlg = $('add'), form = $('add-form'), chosen = null, step = 1, addedInRun = 0;
  var mode = 'add', editing = null, prefill = { day: 0, start: 36 };
  var fDay = $('f-day'), fStart = $('f-start'), fEnd = $('f-end');

  function fillDayControls() {
    var d = viewing;
    fDay.replaceChildren(); $('f-chips').replaceChildren();
    for (var i = 0; i < d.days; i++) {
      var iso = addDays(d.start, i);
      fDay.append(new Option(dayName(iso), i));
      var lab = el('label', 'td-day-chip'), c = el('input'); c.type = 'checkbox'; c.name = 'days'; c.value = i;
      var wd = el('span', 'td-day-chip__wd', parts(iso).wd), dn = el('span', 'td-day-chip__d', String(parts(iso).d));
      wd.setAttribute('aria-hidden', 'true'); dn.setAttribute('aria-hidden', 'true');
      lab.append(c, wd, dn); $('f-chips').append(lab);
    }
  }

  function showStep(n) {
    step = n;
    $('step-1').hidden = n !== 1; $('step-2').hidden = n !== 2; $('add-foot').hidden = n !== 2; $('add-back').hidden = n !== 2;
    var edit = mode === 'edit';
    $('add-step').textContent = edit ? (n === 1 ? 'Change the activity' : '') : 'Step ' + n + ' of 2';
    $('add-step').hidden = !$('add-step').textContent;
    $('add-heading').textContent = edit ? 'Edit activity' : 'Add activity';
    $('add-btn').hidden = edit; $('next-btn').hidden = edit; $('save-btn').hidden = !edit; $('delete-btn').hidden = !edit;
    $('f-days-set').hidden = edit;
    (n === 1 ? $('step-1') : $('step-2')).scrollTop = 0;
  }

  function renderRecents() {
    var seen = {}, list = $('recent-list'), items = [];
    live().filter(function (e) { return !e.sample; }).concat(live(viewing)).sort(function (a, b) { return a.updatedAt < b.updatedAt ? 1 : -1; }).forEach(function (e) {
      if (seen[e.activityId] || items.length >= 5 || e.note) return; seen[e.activityId] = 1;
      var btn = el('button', 'td-activity'); btn.type = 'button'; btn.dataset.recent = e.activityId; btn.dataset.parent = e.parent || e.activityId;
      var pat = el('span', 'td-pat td-pat--' + e.pattern); pat.setAttribute('aria-hidden', 'true');
      var body = el('span', 'td-activity__body'); body.append(el('span', 'td-activity__title', e.label));
      btn.append(pat, body); var li = el('li'); li.append(btn); items.push(li);
    });
    list.replaceChildren.apply(list, items);
    $('recent-group').hidden = !items.length;
  }

  function catalogueButton(id) { return document.querySelector('#step-1 .td-activity[data-activity-id="' + id + '"]'); }

  function openAdd(p) {
    mode = 'add'; editing = null; prefill = p; addedInRun = 0; $('add-count').hidden = true;
    form.reset(); fillDayControls(); renderRecents(); showStep(1);
    if (!dlg.open) dlg.showModal();
    $('add-title').focus();
  }
  function openEdit(id) {
    var r = byId(id); if (!r) return;
    mode = 'edit'; editing = r; addedInRun = 0; $('add-count').hidden = true;
    prefill = { day: r.day, start: r.start, end: r.end };
    form.reset(); fillDayControls(); renderRecents();
    if (!dlg.open) dlg.showModal();
    choose(catalogueButton(r.parent || r.activityId), { option: r.parent ? r.activityId : null, note: r.note });
  }

  function fillEnd(keep) {
    var s = +fStart.value, day = +fDay.value;
    fEnd.replaceChildren();
    var g1 = document.createElement('optgroup'); g1.label = dayLabel(day);
    var g2 = document.createElement('optgroup'); g2.label = dayName(addDays(viewing.start, day + 1)) + ' (next day)';
    for (var q = s + 1; q <= s + Q; q++) (q <= Q ? g1 : g2).append(new Option(hm(q) + (q > Q ? ' (+1 day)' : q === Q ? ' (midnight)' : ''), q));
    if (g1.children.length) fEnd.append(g1);
    fEnd.append(g2);
    fEnd.value = keep && keep > s && keep <= s + Q ? keep : s + 4;
    showDuration();
  }
  function showDuration() { var m = (+fEnd.value - +fStart.value) * 15, h = Math.floor(m / 60), r = m % 60; $('f-dur').textContent = (h ? h + ' h' : '') + (h && r ? ' ' : '') + (r ? r + ' min' : ''); }
  function syncChips() {
    var d = +fDay.value;
    form.querySelectorAll('input[name="days"]').forEach(function (c) {
      var cur = +c.value === d;
      c.closest('.td-day-chip').classList.toggle('td-day-chip--current', cur);
      if (cur) c.checked = true;
      c.setAttribute('aria-label', dayLabel(+c.value) + (cur ? ', this activity' : ''));
    });
  }

  function choose(btn, preset) {
    preset = preset || {};
    var a = btn.dataset.recent ? catalogueButton(btn.dataset.parent) : btn;
    chosen = { id: a.dataset.activityId, title: a.dataset.title, pattern: a.dataset.pattern, kind: a.dataset.kind };
    $('chosen-text').textContent = chosen.title;
    document.querySelector('.td-chosen').hidden = chosen.kind === 'options';
    $('chosen-pat').className = 'td-pat td-pat--' + chosen.pattern;
    form.querySelectorAll('.td-options').forEach(function (f) { f.hidden = f.dataset.for !== chosen.id; });
    var opt = preset.option || btn.dataset.recent || null;
    form.querySelectorAll('input[name="option"]').forEach(function (r) { r.checked = opt === r.value; });
    $('note-field').hidden = chosen.kind !== 'text'; $('note').value = preset.note || '';
    $('add-error').hidden = true;
    form.querySelectorAll('input[name="days"]').forEach(function (c) { c.checked = (preset.days || []).indexOf(+c.value) >= 0; });
    fDay.value = prefill.day; fStart.value = prefill.start; fillEnd(prefill.end); syncChips();
    showStep(2); $('add-title').focus(); saveDraft();
  }

  function showError(title, text) { $('add-error-title').textContent = title; $('add-error-text').textContent = text; $('add-error').hidden = false; $('add-error').focus(); }

  function fullAt(day, s, en, ignoreId) {
    var others = live(viewing).filter(function (e) { return e.id !== ignoreId; });
    for (var q = day * Q + s; q < day * Q + en; q++) {
      var n = 0;
      for (var k = 0; k < others.length; k++) { var e = others[k], b0 = e.day * Q + e.start, b1 = e.day * Q + e.end; if (b0 <= q && q < b1) n++; }
      if (n >= LIMIT) return q;
    }
    return -1;
  }

  function readForm() {
    var out = { activityId: chosen.id, parent: null, label: chosen.title, note: '' };
    if (chosen.kind === 'options') {
      var r = form.querySelector('.td-options:not([hidden]) input:checked');
      if (!r) { showError('Choose an option', 'Pick the option that describes “' + chosen.title + '”.'); return null; }
      out.label = r.dataset.label; out.activityId = r.value; out.parent = chosen.id;
    }
    if (chosen.kind === 'text') {
      out.note = $('note').value.trim();
      if (!out.note) { showError('Say what you did', 'Write a few words in “What did you do?”.'); return null; }
      out.label = chosen.title + ': ' + out.note;
    }
    out.day = +fDay.value; out.start = +fStart.value; out.end = +fEnd.value;
    var hit = fullAt(out.day, out.start, out.end, editing && editing.id);
    if (hit >= 0) { showError('This time is full', (hit === out.day * Q + out.start ? hm(out.start) + ' – ' + hm(out.end) : hm(hit)) + ' already has ' + LIMIT + ' activities. Change the time or remove one first.'); return null; }
    return out;
  }
  function notSaved() { showError('Not saved', "This activity couldn't be saved on this phone. Free up some space and try again."); }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var then = ev.submitter ? ev.submitter.value : (mode === 'edit' ? 'save' : 'close');
    var f = readForm(); if (!f) return;
    if (mode === 'edit') {
      var updated = Object.assign({}, editing, f, { pattern: chosen.pattern, sample: false });
      return save([record(updated)]).then(function () {
        clearDraft(); render(); dlg.close(); toast('Changes saved: ' + updated.label + ', ' + hm(updated.start) + ' – ' + hm(updated.end));
      }, notSaved);
    }
    var group = uid(), recs = [], skipped = [];
    var targets = Array.prototype.map.call(form.querySelectorAll('input[name="days"]:checked'), function (c) { return +c.value; });
    if (targets.indexOf(f.day) < 0) targets.push(f.day);
    targets.sort(function (a, b) { return a - b; }).forEach(function (d) {
      if (d !== f.day && fullAt(d, f.start, f.end) >= 0) { skipped.push(dayLabel(d)); return; }
      recs.push(record({ id: uid(), group: group, diaryId: viewing.id, day: d, start: f.start, end: f.end, activityId: f.activityId, parent: f.parent, label: f.label, pattern: chosen.pattern, note: f.note }));
    });
    save(recs).then(function () {
      clearDraft(); render();
      var msg = 'Added: ' + f.label + ', ' + hm(f.start) + ' – ' + hm(f.end) + (recs.length > 1 ? ', on ' + recs.length + ' days' : '');
      if (skipped.length) msg += '. Not added on ' + skipped.join(', ') + ': that time already has ' + LIMIT + ' activities.';
      var undo = function () { removeRecords(recs, 'Removed: ' + f.label); };
      if (then === 'next') {
        addedInRun++; $('add-count').textContent = addedInRun + ' added'; $('add-count').hidden = false;
        var nd = f.day + Math.floor(f.end / Q), ns = f.end % Q;
        prefill = nd < viewing.days ? { day: nd, start: ns } : { day: f.day, start: f.start };
        form.reset(); fillDayControls(); renderRecents(); showStep(1); $('add-title').focus();
      } else dlg.close();
      toast(msg, undo);
    }, notSaved);
  });

  function removeRecords(recs, message) {
    var t = nowIso();
    var marked = recs.map(function (r) { return Object.assign({}, byId(r.id) || r, { removedAt: t, updatedAt: t }); });
    return save(marked).then(function () {
      render();
      toast(message, function () {
        var back = marked.map(function (r) { return Object.assign({}, r, { removedAt: null, updatedAt: nowIso() }); });
        save(back).then(function () { render(); toast('Restored: ' + back[0].label); });
      });
    });
  }
  $('delete-btn').addEventListener('click', function () {
    var r = editing;
    removeRecords([r], 'Deleted: ' + r.label + ', ' + hm(r.start) + ' – ' + hm(r.end)).then(function () { clearDraft(); dlg.close(); }, notSaved);
  });

  /* ---------- Unfinished entries are saved as you go ---------- */
  function saveDraft() {
    if (step !== 2 || !chosen) return;
    var opt = form.querySelector('.td-options:not([hidden]) input:checked');
    store.put('drafts', [{ id: 'current', diaryId: viewing.id, mode: mode, editId: editing ? editing.id : null, activityId: chosen.id, option: opt ? opt.value : null,
      note: $('note').value, day: +fDay.value, start: +fStart.value, end: +fEnd.value,
      days: Array.prototype.map.call(form.querySelectorAll('input[name="days"]:checked'), function (c) { return +c.value; }), savedAt: nowIso() }]).catch(function () {});
  }
  function clearDraft() { store.del('drafts', 'current').catch(function () {}); }
  form.addEventListener('input', saveDraft);
  form.addEventListener('change', saveDraft);
  function restoreDraft(d) {
    if (d.mode === 'edit') { var r = byId(d.editId); if (!r || r.removedAt) { clearDraft(); return; } mode = 'edit'; editing = r; }
    else { mode = 'add'; editing = null; }
    prefill = { day: d.day, start: d.start, end: d.end };
    form.reset(); fillDayControls(); renderRecents(); dlg.showModal();
    choose(catalogueButton(d.activityId), { option: d.option, note: d.note, days: d.days });
    toast('Your unfinished activity is back where you left it.');
  }

  /* ---------- Leaving with unsaved choices asks first ---------- */
  function tryClose() { if (step === 2) $('discard').showPopover(); else dlg.close(); }
  $('add-close').addEventListener('click', tryClose);
  dlg.addEventListener('cancel', function (ev) { if (step === 2) { ev.preventDefault(); $('discard').showPopover(); } });
  $('keep-editing').addEventListener('click', function () { $('discard').hidePopover(); });
  $('discard-go').addEventListener('click', function () { $('discard').hidePopover(); clearDraft(); dlg.close(); });
  dlg.addEventListener('close', function () { step = 1; $('fab').focus({ preventScroll: true }); });
  $('add-back').addEventListener('click', function () { showStep(1); $('add-title').focus(); });
  $('step-1').addEventListener('click', function (ev) {
    var b = ev.target.closest('.td-activity'); if (!b) return;
    if (mode === 'edit') prefill = { day: +fDay.value, start: +fStart.value, end: +fEnd.value };
    choose(b);
  });
  fStart.addEventListener('change', function () { fillEnd(+fEnd.value); });
  fDay.addEventListener('change', function () { fillEnd(+fEnd.value); syncChips(); });
  fEnd.addEventListener('change', showDuration);

  $('fab').addEventListener('click', function () { openAdd(timeInView()); });
  $('timeline').addEventListener('click', function (ev) {
    var g = ev.target.closest('.td-gap__btn');
    if (g) return openAdd({ day: +g.dataset.day, start: +g.dataset.start, end: +g.dataset.end });
    var b = ev.target.closest('.td-event__btn');
    if (b && readOnly()) return toast(viewing.status === 'pending' ? 'Your diary is locked while it waits to send.' : 'This diary is submitted, so it can\u2019t be changed.');
    if (b) openEdit(b.dataset.id);
  });

  /* ======================================================================
     Submit: review, confirm, send, thank you
     ====================================================================== */
  var review = $('review'), thanks = $('thanks'), sending = false;
  $('submit-btn').addEventListener('click', function () { if (ready) openReview(); });

  function openReview() {
    clearTimeout(toastTimer); if (t.matches(':popover-open')) t.hidePopover();
    var d = viewing, list = $('review-list'), sections = [];
    for (var i = 0; i < d.days; i++) {
      var dayEntries = live(d).filter(function (e) { return e.day === i; }).sort(function (a, b) { return a.start - b.start || a.end - b.end; });
      var sec = el('section', 'td-review__day'); sec.setAttribute('aria-labelledby', 'r-' + i);
      var head = el('div', 'td-review__head'), hh = el('h2', null, dayLabel(i)); hh.id = 'r-' + i;
      head.append(hh);
      if (d.status !== 'pending') { var edit = el('a', 'td-review__edit', 'Edit'); edit.href = '#' + dayEls[i].id; edit.append(el('span', 'td-vh', ' ' + dayLabel(i))); head.append(edit); }
      var ol = el('ol');
      dayEntries.forEach(function (e) {
        var li = el('li'), pat = el('span', 'td-pat td-pat--sm td-pat--' + e.pattern); pat.setAttribute('aria-hidden', 'true');
        var time = el('span', 'td-review__time', hm(e.start) + ' – ' + hm(e.end));
        if (e.end > Q) time.append(' ', el('small', null, '+1'), el('span', 'td-vh', ' next day'));
        var what = el('span', 'td-review__what', e.note ? e.label.slice(0, e.label.indexOf(':')) : e.label);
        if (e.note) what.append(el('small', null, e.note));
        li.append(pat, time, what); ol.append(li);
      });
      if (!dayEntries.length) ol.append(el('li', 'td-review__empty', 'Covered by the activity from the day before'));
      sec.append(head, ol); sections.push(sec);
    }
    list.replaceChildren.apply(list, sections);
    $('review-period').textContent = rangeOf(d) + ' · ' + d.days + ' days';
    $('cs-text').textContent = 'This sends ' + d.days + ' days, ' + rangeOf(d) + ', to the research team. After that you can look at it, but not change it.';
    review.showModal(); review.querySelector('.td-modal__body').scrollTop = 0; $('review-title').focus();
  }
  $('review-back').addEventListener('click', function () { review.close(); });
  $('review-list').addEventListener('click', function (ev) {
    var a = ev.target.closest('.td-review__edit'); if (!a) return;
    ev.preventDefault(); review.close(); var k = dayEls.findIndex(function (sec) { return '#' + sec.id === a.getAttribute('href'); }); if (k >= 0) goToDay(k);
  });
  $('review-form').addEventListener('submit', function (ev) { ev.preventDefault(); if (!sending) send(); });

  /* Stand-in for the research server: replace with the real submission. Resolves only with a receipt. */
  /* Prototype: "Pretend to be offline" in the menu, because airplane mode can't be trusted inside a preview */
  var pretendOffline = false;
  function online() { return navigator.onLine && !pretendOffline; }
  function sendToResearchServer(payload) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (!online()) return reject(new Error('offline'));
        var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = '';
        for (var k = 0; k < 6; k++) r += c[Math.floor(Math.random() * c.length)];
        resolve({ ref: r.slice(0, 4) + '-' + r.slice(4), receivedAt: new Date().toISOString(), count: payload.activities.length });
      }, 900);
    });
  }
  /* Yes, submit: the diary locks at once (pending), then it is sent. Offline, it waits on the phone. */
  function send() {
    sending = true;
    var d = viewing, yes = $('cs-yes'); yes.setAttribute('aria-busy', 'true'); yes.textContent = 'Sending\u2026';
    Object.assign(d, { status: 'pending', submittedOn: today });
    saveDiary(d).then(function () {
      if (online()) return deliver(d);
      closeSubmit(); render(); window.scrollTo(0, 0);
    });
  }
  function closeSubmit() {
    sending = false; var yes = $('cs-yes'); yes.removeAttribute('aria-busy'); yes.textContent = 'Yes, submit';
    if ($('confirm-submit').matches(':popover-open')) $('confirm-submit').hidePopover();
    if (review.open) review.close();
  }
  /* Waiting to send: nothing goes without the participant. Back online, the notice and Submit say so; Submit opens Review again. */
  function connectionChanged() { if (view === 'timeline' && viewing) { updateSubmit(lastEmpty); updateReadOnlyNote(); } }
  window.addEventListener('online', connectionChanged);
  window.addEventListener('offline', connectionChanged);
  function deliver(d) {
    var payload = { diary: d.id, period: rangeOf(d), catalogueVersion: CATALOGUE_VERSION, activities: live(d) };   /* JSON is used only here */
    return sendToResearchServer(JSON.parse(JSON.stringify(payload))).then(function (receipt) {
      Object.assign(d, { status: 'submitted', receivedAt: receipt.receivedAt, ref: receipt.ref });
      return saveDiary(d).then(function () { return receipt; });
    }).then(function (receipt) {
      closeSubmit();
      if (dlg.open) dlg.close();
      var t = new Date(receipt.receivedAt);
      $('thanks-sent').textContent = 'Your diary for ' + rangeOf(d) + ' was sent to the research team.';
      $('thanks-next-date').replaceChildren('Your next diary starts on ', el('strong', null, dayName(nextStart())), '.');
      $('thanks-receipt').replaceChildren(el('span', null, 'Received ' + dayName(d.submittedOn) + ', ' + pad(t.getHours()) + ':' + pad(t.getMinutes())), ' \u00b7 ', el('span', null, 'Ref ' + receipt.ref));
      render(); thanks.showModal(); $('thanks-title').focus();
    }, function () { closeSubmit(); render(); });
  }

  /* Start next diary: open it if it has started, otherwise the waiting state says when */
  $('thanks-next').addEventListener('click', function () { thanks.close(); ensureCurrentDiary().then(function () { location.hash = '#timeline'; home(); }); });

  /* A new diary begins on the day after the last one ends */
  function ensureCurrentDiary() {
    var c = currentDiary();
    if (c.status !== 'submitted' || nextStart() > today) return Promise.resolve();
    var n = { id: 'd' + (c.number + 1), number: c.number + 1, start: nextStart(), days: DIARY_DAYS, status: 'open' };
    diaries.push(n);
    return saveDiary(n);
  }

  /* ---------- Toast ---------- */
  var toastTimer = null, undoFn = null, t = $('toast');
  function toast(text, undo) {
    $('toast-text').textContent = text; undoFn = undo || null; $('toast-undo').hidden = !undo;
    if (t.matches(':popover-open')) t.hidePopover();
    t.showPopover();   /* where it sits is CSS: above the floating button, the add screen's buttons, or the bottom edge */
    /* Screen readers: a region that was hidden a moment ago may not be read, so announce through a live region that is always there */
    var live = $('live'); live.textContent = ''; setTimeout(function () { live.textContent = text; }, 60);
    clearTimeout(toastTimer); toastTimer = setTimeout(hideToast, undo ? 8000 : 5000);
  }
  function hideToast() { if (t.contains(document.activeElement)) { toastTimer = setTimeout(hideToast, 2000); return; } if (t.matches(':popover-open')) t.hidePopover(); }
  $('toast-undo').addEventListener('click', function () { var f = undoFn; undoFn = null; hideToast(); if (f) f(); });

  /* ---------- Menu: links close it; "Go to today" ---------- */
  document.querySelectorAll('[popover] a[href^="#"]').forEach(function (a) { a.addEventListener('click', function () { a.closest('[popover]').hidePopover(); }); });
  $('go-today').addEventListener('click', function (ev) {
    ev.preventDefault();
    try { if (location.hash !== '#timeline') history.pushState(null, '', '#timeline'); } catch (err) {}
    home(); if (view === 'timeline') scrollToToday();
  });

  /* ---------- Prototype only ---------- */
  $('fill-days').addEventListener('click', function () {
    $('menu').hidePopover();
    if (isWaiting()) return toast('Your next diary hasn\u2019t started yet.');
    if (view !== 'timeline' || viewing !== currentDiary()) show('timeline', currentDiary());
    if (readOnly()) return toast('This diary is locked, so it can\u2019t be changed.');
    var recs = [];
    for (var i = 0; i < viewing.days; i++) { if (segmentsFor(viewing, i).length) continue; SIMPLE_DAY.forEach(function (a) { recs.push(activity(viewing.id, i, a)); }); }
    if (!recs.length) return toast('Every day already has activities.');
    save(recs).then(function () { render(); toast('Filled ' + recs.length / 3 + ' empty days with sample activities.'); });
  });
  $('skip-next').addEventListener('click', function () {
    $('menu').hidePopover();
    var c = currentDiary();
    if (c.status === 'pending') return toast('Your diary is still waiting to send.');
    if (c.status !== 'submitted') return toast('Submit this diary first. In the study, the next one starts on ' + dayName(nextStart()) + '.');
    today = nextStart();
    store.put('meta', [{ id: 'clock', today: today }]).then(ensureCurrentDiary).then(function () {
      location.hash = '#timeline'; home();
      toast('Skipped ahead to ' + dayName(today) + '.');
    });
  });
  $('pretend-offline').addEventListener('click', function () {
    $('menu').hidePopover();
    pretendOffline = !pretendOffline;
    $('pretend-offline-label').textContent = pretendOffline ? 'Go back online' : 'Pretend to be offline';
    connectionChanged();
    if (viewing && viewing.status === 'pending' && view === 'timeline') return;   /* the notice already says it */
    toast(pretendOffline ? 'Offline (pretend). Submit now to see \u201cWaiting to send\u201d.' : 'Back online.');
  });
  $('reset-data').addEventListener('click', function () {
    $('menu').hidePopover();
    var s = seed();
    Promise.all(['activities', 'drafts', 'meta', 'diaries'].map(function (n) { return store.clear(n); }))
      .then(function () { return Promise.all([store.put('activities', s.entries), store.put('diaries', s.diaries), store.put('meta', [{ id: 'seeded-v2', at: nowIso() }])]); })
      .then(function () {
        diaries = s.diaries; entries = s.entries; today = FIRST_TODAY; viewing = null; dayEls = [];
        location.hash = '#timeline'; home(); toast('Back to the sample data.');
      });
  });

  /* ======================================================================
     Start: load from the phone, seed sample data once, restore any draft
     ====================================================================== */
  setBar(); window.addEventListener('resize', setBar);
  /* Text size can change while the app is open (Dynamic Type): follow the bar's real height, not only window resizes */
  if ('ResizeObserver' in window) new ResizeObserver(setBar).observe(bar);
  window.addEventListener('scroll', updateDayNav, { passive: true });

  function load() {
    return store.get('meta', 'seeded-v2').then(function (m) {
      if (m) return Promise.all([store.all('diaries'), store.all('activities'), store.get('meta', 'clock')]).then(function (r) { return { diaries: r[0], entries: r[1], clock: r[2] }; });
      var s = seed();
      return Promise.all(['activities', 'drafts', 'diaries'].map(function (n) { return store.clear(n); }))
        .then(function () { return Promise.all([store.put('activities', s.entries), store.put('diaries', s.diaries), store.put('meta', [{ id: 'seeded-v2', at: nowIso() }])]); })
        .then(function () { return s; });
    });
  }

  load().catch(function () {
    store.useMemory(); $('storage-warning').hidden = false;
    var s = seed(); return Promise.all([store.put('activities', s.entries), store.put('diaries', s.diaries)]).then(function () { return s; });
  }).then(function (s) {
    diaries = s.diaries || []; entries = s.entries || []; if (s.clock && s.clock.today) today = s.clock.today;
    return ensureCurrentDiary();
  }).then(function () {
    route();
    var c = currentDiary();
    return store.get('drafts', 'current');
  }).then(function (d) {
    if (d && d.activityId && catalogueButton(d.activityId) && view === 'timeline' && !readOnly() && d.diaryId === viewing.id) restoreDraft(d);
  }).catch(function (err) { console.error(err); });
})();
