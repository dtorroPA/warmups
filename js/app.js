/* Warm-Up Builder — UI, slideshow and printing. */
(function (WU) {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // ---------------------------------------------------------------------------
  // Storage (all wrapped: the app works even if storage is blocked)
  // ---------------------------------------------------------------------------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };
  const K_SETTINGS = 'wu.settings', K_USED = 'wu.used', K_SETS = 'wu.sets';
  const today = () => Math.floor(Date.now() / 86400000);
  const REPEAT_WINDOW_DAYS = 365;

  function usedMap() {
    const m = store.get(K_USED, {});
    const cutoff = today() - REPEAT_WINDOW_DAYS;
    for (const k in m) if (m[k] < cutoff) delete m[k];
    return m;
  }
  function markUsed(problems) {
    const m = usedMap();
    const d = today();
    problems.forEach((p) => { m[p.key] = d; });
    store.set(K_USED, m);
    updateHistoryCount();
  }
  function updateHistoryCount() { $('#history-count').textContent = Object.keys(usedMap()).length; }

  // ---------------------------------------------------------------------------
  // Settings UI
  // ---------------------------------------------------------------------------
  // Every topic is one entry here; the setup card for it lives in index.html (#card-<id>).
  const TOPICS = [
    { id: 'expr', name: 'Writing Expressions', items: () => WU.Expressions.LEVELS, def: [1, 2], what: 'difficulty level',
      gen: (v, o) => WU.Expressions.generate(v, o.exprMode) },
    { id: 'pyth', name: 'Pythagorean Theorem', items: () => WU.Pythagorean.TYPES, def: ['whole'], what: 'problem type',
      gen: (v) => WU.Pythagorean.generate(v) },
    { id: 'fact', name: 'Factoring', items: () => WU.Factoring.TYPES, def: ['gcf', 'tri1'], what: 'problem type',
      gen: (v, o) => WU.Factoring.generate(v, { gcf: o.factGcf }) },
    { id: 'rad', name: 'Radicals', items: () => WU.Radicals.TYPES, def: ['numeric', 'coef'], what: 'problem type',
      gen: (v) => WU.Radicals.generate(v) },
  ];
  const topicById = (id) => TOPICS.find((t) => t.id === id);
  const itemValue = (t, str) => (t.items().find((it) => String(it.id) === str) || {}).id;

  function buildChecks() {
    TOPICS.forEach((t) => {
      $(`#${t.id}-types`).innerHTML = t.items().map((it) =>
        `<label class="check"><input type="checkbox" name="${t.id}-type" value="${it.id}"${t.def.includes(it.id) ? ' checked' : ''}>
          <span><b>${it.name}</b><small>${it.desc}</small></span></label>`).join('');
    });
  }

  // Topic cards can be moved up/down; grouped warm-ups follow this order.
  function topicOrder() {
    return $$('.topic').map((c) => c.id.replace('card-', ''));
  }
  function setTopicOrder(order) {
    const cards = order.map((id) => $('#card-' + id)).filter(Boolean);
    if (cards.length !== TOPICS.length) return;
    const anchor = $('#card-order');
    cards.forEach((c) => anchor.parentNode.insertBefore(c, anchor));
    updateTopicCards();
  }
  function moveTopic(id, dir) {
    const order = topicOrder();
    const i = order.indexOf(id), j = i + dir;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    setTopicOrder(order);
    saveSettings();
    $(`#card-${id} [data-move="${dir}"]`).focus();
  }
  // Collapse a topic's options while its count is 0
  function updateTopicCards() {
    const order = topicOrder();
    TOPICS.forEach((t) => {
      const card = $('#card-' + t.id);
      card.classList.toggle('off', clampInt($(`#${t.id}-count`).value, 0, 20) === 0);
      $('[data-move="-1"]', card).disabled = order[0] === t.id;
      $('[data-move="1"]', card).disabled = order[order.length - 1] === t.id;
    });
  }

  function readSettings() {
    const counts = {}, picks = {};
    TOPICS.forEach((t) => {
      counts[t.id] = clampInt($(`#${t.id}-count`).value, 0, 20);
      picks[t.id] = $$(`input[name="${t.id}-type"]:checked`).map((i) => itemValue(t, i.value));
    });
    return {
      titleSel: $('#title-select').value,
      customTitle: $('#custom-title').value,
      counts, picks,
      topicOrder: topicOrder(),
      exprMode: ($('input[name="expr-mode"]:checked') || {}).value || 'mix',
      dgMode: ($('input[name="pyth-dg"]:checked') || {}).value || 'all',
      factGcf: $('#fact-gcf').checked,
      order: ($('input[name="order"]:checked') || {}).value || 'grouped',
      layout: $('#present-layout').value,
      timer: clampInt($('#timer-min').value, 0, 60),
      space: $('#print-space').value,
      copies: $('#print-copies').value,
      key: $('#print-key').checked,
      previewAnswers: $('#preview-answers').checked,
    };
  }
  function applySettings(s) {
    if (!s) { updateTopicCards(); return; }
    // settings saved by the first version of the site
    const counts = s.counts || { expr: s.exprCount, pyth: s.pythCount };
    const picks = s.picks || { expr: s.exprLevels, pyth: s.pythTypes };
    let order = s.order;
    if (order === 'expr-first' || order === 'pyth-first') {
      if (order === 'pyth-first' && !s.topicOrder) s.topicOrder = ['pyth', 'expr', 'fact', 'rad'];
      order = 'grouped';
    }
    if (s.titleSel) $('#title-select').value = s.titleSel;
    if (s.customTitle) $('#custom-title').value = s.customTitle;
    $('#custom-title-wrap').hidden = $('#title-select').value !== '__custom';
    TOPICS.forEach((t) => {
      if (counts[t.id] != null) $(`#${t.id}-count`).value = counts[t.id];
      if (picks[t.id]) $$(`input[name="${t.id}-type"]`).forEach((i) => { i.checked = picks[t.id].map(String).includes(i.value); });
    });
    if (s.exprMode) { const r = $(`input[name="expr-mode"][value="${s.exprMode}"]`); if (r) r.checked = true; }
    if (order) { const r = $(`input[name="order"][value="${order}"]`); if (r) r.checked = true; }
    const dgMode = s.dgMode || (s.diagrams === false ? 'none' : null);
    if (dgMode) { const r = $(`input[name="pyth-dg"][value="${dgMode}"]`); if (r) r.checked = true; }
    if (s.factGcf != null) $('#fact-gcf').checked = s.factGcf;
    if (s.layout) $('#present-layout').value = s.layout;
    if (s.timer != null) $('#timer-min').value = s.timer;
    if (s.space) $('#print-space').value = s.space;
    if (s.copies) $('#print-copies').value = s.copies;
    if (s.key != null) $('#print-key').checked = s.key;
    if (s.previewAnswers != null) $('#preview-answers').checked = s.previewAnswers;
    if (s.topicOrder) {
      const known = s.topicOrder.filter((id) => topicById(id));
      TOPICS.forEach((t) => { if (!known.includes(t.id)) known.push(t.id); });
      setTopicOrder(known);
    }
    updateTopicCards();
  }
  const saveSettings = () => store.set(K_SETTINGS, readSettings());
  function clampInt(v, a, b) { const n = parseInt(v, 10); return isNaN(n) ? a : Math.max(a, Math.min(b, n)); }

  function titleText() {
    const s = $('#title-select').value;
    return s === '__custom' ? ($('#custom-title').value.trim() || 'Warm Up') : s;
  }
  function dateText(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  }
  function localISO(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ---------------------------------------------------------------------------
  // Generation
  // ---------------------------------------------------------------------------
  let current = null; // { title, date, problems: [] }

  function genFromSpec(spec, opts) {
    const v = spec.v != null ? spec.v : spec.level != null ? spec.level : spec.type; // older saved sets
    return topicById(spec.topic).gen(v, opts);
  }

  // Generate one problem avoiding repeats (history + this set) and, when possible, repeated templates.
  function genUnique(spec, opts, used, setKeys, setT) {
    let pickP = null;     // best fresh candidate so far
    let oldest = null;    // least-recently-used candidate, if the bank runs dry
    for (let i = 0; i < 80; i++) {
      const p = genFromSpec(spec, opts);
      if (setKeys.has(p.key)) continue;
      if (used[p.key] != null) {
        if (!oldest || used[p.key] < used[oldest.key]) oldest = p;
        continue;
      }
      pickP = p;
      if (i < 50 && setT.has(p.tkey)) continue; // try for a different template first
      break;
    }
    const p = pickP || oldest || genFromSpec(spec, opts);
    p.spec = spec;
    p.opts = { ...opts };
    setKeys.add(p.key); setT.add(p.tkey);
    return p;
  }

  function spread(n, items) {
    // every checked type equally often; leftovers go to randomly chosen types
    const out = [];
    for (let i = 0; i < Math.floor(n / items.length); i++) out.push(...items);
    out.push(...WU.shuffle(items).slice(0, n % items.length));
    return out; // sorted into difficulty order by the caller
  }

  function buildSet(s) {
    const used = usedMap();
    const keys = new Set(), ts = new Set();
    const opts = { exprMode: s.exprMode, factGcf: s.factGcf };
    // within a topic, problems go from the first checked type/level to the last
    const groups = s.topicOrder.map((id) => {
      const t = topicById(id);
      const order = t.items().map((it) => it.id);
      return spread(s.counts[id], s.picks[id])
        .sort((a, b) => order.indexOf(a) - order.indexOf(b))
        .map((v) => genUnique({ topic: id, v }, opts, used, keys, ts));
    });
    const problems = s.order === 'shuffle' ? WU.shuffle(groups.flat()) : groups.flat();
    applyDiagramMode(problems, s.dgMode);
    return problems;
  }

  // Diagrams on/off for Pythagorean problems. 'some' alternates on, off, on, ...
  // Changing this never changes the numbers in a problem — only how it is shown.
  function applyDiagramMode(problems, mode) {
    let n = 0;
    problems.forEach((p) => {
      if (p.topic !== 'pyth' || !p.diagram) return;
      p.showDg = mode === 'all' ? true : mode === 'none' ? false : n % 2 === 0;
      n++;
    });
  }
  // Which version of a problem to show (older saved sets have only one version)
  function variant(p) {
    if (p.topic !== 'pyth' || p.dgText == null) return { text: p.text, prompt: p.prompt, diagram: p.diagram };
    return p.showDg ? { text: p.dgText, prompt: p.dgPrompt, diagram: p.diagram } : { text: p.text, prompt: p.prompt, diagram: null };
  }
  const canToggleDg = (p) => p.topic === 'pyth' && p.diagram && p.dgText != null;

  function onGenerate(e) {
    if (e) e.preventDefault();
    const s = readSettings();
    const msg = $('#gen-msg');
    msg.textContent = '';
    for (const t of TOPICS) {
      if (s.counts[t.id] > 0 && !s.picks[t.id].length) { msg.textContent = `Pick at least one ${t.name} ${t.what} (or set its count to 0).`; return; }
    }
    if (TOPICS.every((t) => s.counts[t.id] === 0)) { msg.textContent = 'Set at least one problem count above 0.'; return; }
    saveSettings();
    current = { title: titleText(), date: $('#date').value, problems: buildSet(s), saved: false };
    hideUndo();
    renderPreview();
    if (window.matchMedia('(max-width: 980px)').matches) $('#preview').scrollIntoView({ behavior: 'smooth' });
  }

  // ---------------------------------------------------------------------------
  // Problem HTML (shared by preview, slides, print)
  // ---------------------------------------------------------------------------
  function answerHTML(p) {
    const alts = (p.alts || []).filter(Boolean);
    let h = `<div class="p-ans"><span class="ans-label">Answer:</span> <span class="ans-main">${p.answer}</span>`;
    if (alts.length) h += ` <span class="ans-alts">${p.topic === 'expr' ? 'also accept ' : ''}${alts.join(' &nbsp;or&nbsp; ')}</span>`;
    if (p.work) h += `<div class="ans-work">${p.work}</div>`;
    return h + '</div>';
  }
  function problemInner(p, withAnswer, forceDg) {
    const v = forceDg ? { text: p.dgText, prompt: p.dgPrompt, diagram: p.diagram } : variant(p);
    return `<div class="p-text">${v.text}</div>` +
      (v.prompt ? `<div class="p-prompt">${v.prompt}</div>` : '') +
      (v.diagram ? WU.renderDiagram(v.diagram) : '') +
      (withAnswer ? answerHTML(p) : '');
  }

  // ---------------------------------------------------------------------------
  // Preview
  // ---------------------------------------------------------------------------
  function renderPreview() {
    if (!current) return;
    $('#preview-empty').hidden = true;
    $('#preview-body').hidden = false;
    $('#preview-title').textContent = current.title;
    $('#preview-date').textContent = dateText(current.date);
    const list = $('#problem-list');
    list.classList.toggle('hide-answers', !$('#preview-answers').checked);
    list.innerHTML = current.problems.map((p, i) => `
      <li class="pv-item">
        <div class="pv-head">
          <span class="pv-num">${i + 1}</span>
          <span class="pv-tag ${p.topic}">${p.label}</span>
          ${canToggleDg(p) ? `<button type="button" class="btn tiny dg-btn${p.showDg ? ' on' : ''}" data-dg="${i}" aria-pressed="${!!p.showDg}" title="Show or hide the triangle diagram for this problem">△ Diagram ${p.showDg ? 'on' : 'off'}</button>` : ''}
          <button type="button" class="btn tiny" data-swap="${i}" title="Replace this problem with a new one">↻ Swap</button>
          <button type="button" class="btn tiny rm-btn" data-remove="${i}" title="Remove this problem" aria-label="Remove problem ${i + 1}">✕ Remove</button>
        </div>
        <div class="pv-body">${problemInner(p, true)}</div>
      </li>`).join('');
    const none = current.problems.length === 0;
    $('#preview-none').hidden = !none;
    $('#present').disabled = $('#print').disabled = none;
  }

  function swap(i) {
    const p = current.problems[i];
    const used = usedMap();
    const keys = new Set(current.problems.map((q) => q.key));
    const ts = new Set(current.problems.map((q, j) => (j === i ? null : q.tkey)));
    const np = genUnique(p.spec, p.opts, used, keys, ts);
    if (np.topic === 'pyth') np.showDg = p.diagram ? !!p.showDg : variantModeDefault();
    current.problems[i] = np;
    current.saved = false;
    renderPreview();
  }
  const variantModeDefault = () => readSettings().dgMode !== 'none';

  // Remove one problem; the others keep their content and simply renumber.
  let lastRemoved = null; // { p, i } for Undo
  function removeProblem(i) {
    lastRemoved = { p: current.problems[i], i };
    current.problems.splice(i, 1);
    persistSetChange();
    showUndo(`Removed problem ${i + 1}.`);
  }
  function undoRemove() {
    if (!lastRemoved) return;
    current.problems.splice(Math.min(lastRemoved.i, current.problems.length), 0, lastRemoved.p);
    lastRemoved = null;
    persistSetChange();
    $('#undo-bar').hidden = true;
  }
  function showUndo(msg) {
    $('#undo-msg').textContent = msg;
    $('#undo-bar').hidden = false;
  }
  function hideUndo() { lastRemoved = null; const b = $('#undo-bar'); if (b) b.hidden = true; }

  // Diagram changes and removals don't add new problems, so a saved copy is updated in place.
  const persistSetChange = () => persistDiagramChange();
  function persistDiagramChange() {
    renderPreview();
    if (!current.saved || !current.id) return;
    const sets = store.get(K_SETS, []);
    const e = sets.find((x) => x.id === current.id);
    if (e) { e.problems = current.problems; store.set(K_SETS, sets); }
  }
  function toggleDg(i) {
    const p = current.problems[i];
    p.showDg = !p.showDg;
    persistDiagramChange();
  }

  // ---------------------------------------------------------------------------
  // Saved sets
  // ---------------------------------------------------------------------------
  function saveCurrent() {
    if (!current || current.saved) return;
    markUsed(current.problems);
    const sets = store.get(K_SETS, []);
    const entry = { id: Date.now(), title: current.title, date: current.date, problems: current.problems };
    sets.unshift(entry);
    store.set(K_SETS, sets.slice(0, 20));
    current.saved = true;
    current.id = entry.id;
    renderRecent();
  }
  function renderRecent() {
    const sets = store.get(K_SETS, []);
    $('#recent').innerHTML = '<option value="">— Load a saved warm-up —</option>' + sets.map((s) =>
      `<option value="${s.id}">${escapeHTML(s.title)} · ${s.date ? dateText(s.date) : new Date(s.id).toLocaleDateString()} (${s.problems.length} problems)</option>`).join('');
  }
  function loadRecent() {
    const id = +$('#recent').value;
    if (!id) return;
    const s = store.get(K_SETS, []).find((x) => x.id === id);
    if (!s) return;
    current = { title: s.title, date: s.date, problems: s.problems, saved: true, id: s.id };
    hideUndo();
    renderPreview();
  }
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------------------------------------------------------------------------
  // Presenter
  // ---------------------------------------------------------------------------
  const pr = { slides: [], idx: 0, answers: false, timerTotal: 0, timerLeft: 0, timerId: null, running: false };

  function present() {
    if (!current || !current.problems.length) return;
    saveCurrent();
    const layout = $('#present-layout').value;
    const probs = current.problems;
    pr.slides = layout === 'each' ? probs.map((p, i) => [i]) : [probs.map((p, i) => i)];
    pr.idx = 0;
    pr.answers = false;
    $('#pr-title').textContent = current.title;
    $('#pr-date').textContent = current.date ? dateText(current.date) : '';
    const stage = $('#pr-stage');
    stage.innerHTML = pr.slides.map((ids) => {
      const n = ids.length;
      const cols = n <= 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4;
      const rows = Math.ceil(n / cols);
      return `<div class="slide" style="--cols:${cols};--rows:${rows}">` + ids.map((i) =>
        `<div class="cell"><div class="cell-num">${i + 1}</div><div class="cell-body">` +
        (canToggleDg(probs[i]) && !probs[i].showDg
          ? `<div class="v-main">${problemInner(probs[i], true)}</div><div class="v-hint">${problemInner(probs[i], true, true)}</div>`
          : problemInner(probs[i], true)) +
        '</div></div>').join('') + '</div>';
    }).join('');
    const minutes = clampInt($('#timer-min').value, 0, 60);
    stopTimer();
    pr.timerTotal = pr.timerLeft = minutes * 60;
    renderTimer();
    const el = $('#presenter');
    el.hidden = false;
    el.classList.remove('show-answers', 'show-dgs');
    $('#pr-ans').classList.remove('on');
    $('#pr-dg').classList.remove('on');
    $('#pr-dg').hidden = !probs.some((p) => canToggleDg(p) && !p.showDg);
    document.body.classList.add('presenting');
    showSlide(0);
    requestFull();
  }
  function showSlide(i) {
    pr.idx = Math.max(0, Math.min(pr.slides.length - 1, i));
    $$('#pr-stage .slide').forEach((s, j) => s.classList.toggle('active', j === pr.idx));
    $('#pr-count').textContent = pr.slides.length > 1 ? `${pr.idx + 1} / ${pr.slides.length}` : '';
    $('#pr-prev').hidden = $('#pr-next').hidden = pr.slides.length <= 1;
    fitActive();
  }
  // Shrink-to-fit: largest font size where no problem overflows its cell
  function fitActive() {
    const slide = $('#pr-stage .slide.active');
    if (!slide) return;
    const cells = $$('.cell', slide);
    const fits = () => cells.every((c) => c.scrollHeight <= c.clientHeight + 1 && c.scrollWidth <= c.clientWidth + 1);
    let lo = 10, hi = Math.max(24, Math.min(96, window.innerHeight / 9));
    slide.style.fontSize = hi + 'px';
    if (fits()) return;
    for (let k = 0; k < 14; k++) {
      const mid = (lo + hi) / 2;
      slide.style.fontSize = mid + 'px';
      if (fits()) lo = mid; else hi = mid;
    }
    slide.style.fontSize = lo + 'px';
  }
  function toggleAnswers() {
    pr.answers = !pr.answers;
    $('#presenter').classList.toggle('show-answers', pr.answers);
    $('#pr-ans').classList.toggle('on', pr.answers);
    fitActive();
  }
  function toggleDgHint() {
    if ($('#pr-dg').hidden) return;
    const on = $('#presenter').classList.toggle('show-dgs');
    $('#pr-dg').classList.toggle('on', on);
    fitActive();
  }
  function exitPresent() {
    $('#presenter').hidden = true;
    document.body.classList.remove('presenting');
    stopTimer();
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }
  function requestFull() {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(() => {});
  }
  function toggleFull() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else requestFull();
  }
  // Timer
  function renderTimer() {
    const b = $('#pr-timer');
    if (!pr.timerTotal) { b.hidden = true; return; }
    b.hidden = false;
    const t = Math.max(0, pr.timerLeft);
    b.textContent = t === 0 ? '⏰ Time!' : `${pr.running ? '⏱' : '▶'} ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    b.classList.toggle('done', t === 0);
    b.classList.toggle('low', t > 0 && t <= 30);
  }
  function toggleTimer() {
    if (!pr.timerTotal) return;
    if (pr.timerLeft <= 0) { pr.timerLeft = pr.timerTotal; stopTimer(); renderTimer(); return; }
    if (pr.running) { stopTimer(); renderTimer(); return; }
    pr.running = true;
    const end = Date.now() + pr.timerLeft * 1000;
    pr.timerId = setInterval(() => {
      pr.timerLeft = Math.max(0, Math.round((end - Date.now()) / 1000));
      if (pr.timerLeft <= 0) stopTimer();
      renderTimer();
    }, 250);
    renderTimer();
  }
  function stopTimer() { clearInterval(pr.timerId); pr.timerId = null; pr.running = false; }

  // ---------------------------------------------------------------------------
  // Printing
  // ---------------------------------------------------------------------------
  const SPACE_EM = { 0: 0, 1: 5, 2: 9, 3: 14 }; // work space below each problem
  function sheetHTML(problems, space, compact) {
    const header = `<div class="ph">
        <div class="ph-title">${escapeHTML(current.title)}${current.date ? `<span class="ph-date">${dateText(current.date)}</span>` : ''}</div>
        <div class="ph-name">Name <span class="blank"></span> Period <span class="blank short"></span></div>
      </div>`;
    const items = problems.map((p, i) => `<li class="pp${variant(p).diagram ? ' has-dg' : ''}">
        <span class="pp-num">${i + 1}.</span>
        <div class="pp-body">${problemInner(p, false)}<div class="pp-space" style="height:${compact ? SPACE_EM[space] * 0.6 : SPACE_EM[space]}em"></div></div>
      </li>`).join('');
    return header + `<ol class="pp-list">${items}</ol>`;
  }
  function doPrint() {
    if (!current || !current.problems.length) return;
    saveCurrent();
    const space = $('#print-space').value;
    const copies = $('#print-copies').value === '2';
    const area = $('#print-area');
    let html = '';
    if (copies) {
      const one = `<div class="half"><div class="half-inner">${sheetHTML(current.problems, space, true)}</div></div>`;
      html += `<div class="sheet halves">${one}<div class="cut">✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>${one}</div>`;
    } else {
      html += `<div class="sheet">${sheetHTML(current.problems, space, false)}</div>`;
    }
    if ($('#print-key').checked) {
      html += `<div class="sheet key"><div class="ph"><div class="ph-title">${escapeHTML(current.title)} — Answer Key${current.date ? `<span class="ph-date">${dateText(current.date)}</span>` : ''}</div></div>
        <ol class="key-list">${current.problems.map((p) => `<li><div class="key-q">${variant(p).text}${variant(p).prompt ? ' <i>' + variant(p).prompt + '</i>' : ''}</div>${answerHTML(p)}</li>`).join('')}</ol></div>`;
    }
    area.innerHTML = html;
    // Half sheets: shrink text, then work space, until each copy fits on half a page
    $('#print-msg').textContent = '';
    if (copies) {
      area.classList.add('measuring');
      let overflow = false;
      $$('.half', area).forEach((h) => {
        const inner = $('.half-inner', h);
        const spaces = $$('.pp-space', inner);
        const base = spaces.map((sp) => parseFloat(sp.style.height) || 0);
        const fits = () => inner.scrollHeight <= h.clientHeight;
        let pt = 11, f = 1;
        const setPt = () => { inner.style.fontSize = pt + 'pt'; };
        setPt();
        while (!fits() && pt > 8.5) { pt -= 0.5; setPt(); }
        while (!fits() && f > 0) { f = Math.max(0, f - 0.15); spaces.forEach((sp, i) => { sp.style.height = base[i] * f + 'em'; }); }
        while (!fits() && pt > 6.5) { pt -= 0.5; setPt(); }
        if (!fits()) overflow = true;
      });
      area.classList.remove('measuring');
      if (overflow) {
        $('#print-msg').textContent = 'This warm-up is too long for half sheets — some problems may be cut off. Try “1 (full page)” or fewer problems.';
      }
    }
    setTimeout(() => window.print(), 50);
  }

  // ---------------------------------------------------------------------------
  // Wire up
  // ---------------------------------------------------------------------------
  function init() {
    buildChecks();
    $('#date').value = localISO();
    applySettings(store.get(K_SETTINGS, null));
    renderRecent();
    updateHistoryCount();

    $('#settings').addEventListener('submit', onGenerate);
    $('#settings').addEventListener('change', saveSettings);
    $('#title-select').addEventListener('change', () => {
      $('#custom-title-wrap').hidden = $('#title-select').value !== '__custom';
      if (current) { current.title = titleText(); renderPreview(); }
    });
    $('#custom-title').addEventListener('input', () => { if (current) { current.title = titleText(); $('#preview-title').textContent = current.title; } });
    $('#date').addEventListener('change', () => { if (current) { current.date = $('#date').value; renderPreview(); } });
    $$('.stepper').forEach((st) => {
      const input = $('#' + st.dataset.for);
      $$('.step', st).forEach((b) => b.addEventListener('click', () => {
        input.value = clampInt(+input.value + +b.dataset.delta, 0, 20);
        updateTopicCards();
        saveSettings();
      }));
      input.addEventListener('input', updateTopicCards);
    });
    $$('.topic [data-move]').forEach((b) => b.addEventListener('click', () => {
      moveTopic(b.closest('.topic').id.replace('card-', ''), +b.dataset.move);
    }));
    $('#problem-list').addEventListener('click', (e) => {
      const b = e.target.closest('[data-swap]');
      if (b) { hideUndo(); swap(+b.dataset.swap); }
      const r = e.target.closest('[data-remove]');
      if (r) removeProblem(+r.dataset.remove);
      const d = e.target.closest('[data-dg]');
      if (d) toggleDg(+d.dataset.dg);
    });
    $('#preview-answers').addEventListener('change', () => {
      $('#problem-list').classList.toggle('hide-answers', !$('#preview-answers').checked);
      saveSettings();
    });
    ['#present-layout', '#timer-min', '#print-space', '#print-copies', '#print-key'].forEach((s) => $(s).addEventListener('change', saveSettings));
    $('#regen-all').addEventListener('click', () => onGenerate());
    $('#undo-btn').addEventListener('click', undoRemove);
    $$('input[name="pyth-dg"]').forEach((r) => r.addEventListener('change', () => {
      if (!current) return;
      applyDiagramMode(current.problems, r.value);
      persistDiagramChange();
    }));
    $('#present').addEventListener('click', present);
    $('#print').addEventListener('click', doPrint);
    $('#load-recent').addEventListener('click', loadRecent);
    $('#clear-history').addEventListener('click', () => {
      if (confirm('Clear the no-repeat history? Previously used problems may appear again. (Saved warm-ups are kept.)')) {
        store.del(K_USED); updateHistoryCount();
      }
    });

    // presenter controls
    $('#pr-prev').addEventListener('click', () => showSlide(pr.idx - 1));
    $('#pr-next').addEventListener('click', () => showSlide(pr.idx + 1));
    $('#pr-ans').addEventListener('click', toggleAnswers);
    $('#pr-dg').addEventListener('click', toggleDgHint);
    $('#pr-full').addEventListener('click', toggleFull);
    $('#pr-exit').addEventListener('click', exitPresent);
    $('#pr-timer').addEventListener('click', toggleTimer);
    document.addEventListener('keydown', (e) => {
      if ($('#presenter').hidden) return;
      if (e.target.matches('input, select, textarea')) return;
      const k = e.key;
      if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); showSlide(pr.idx + 1); }
      else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); showSlide(pr.idx - 1); }
      else if (k === 'a' || k === 'A') toggleAnswers();
      else if (k === 't' || k === 'T') toggleTimer();
      else if (k === 'd' || k === 'D') toggleDgHint();
      else if (k === 'f' || k === 'F') toggleFull();
      else if (k === 'Escape') exitPresent();
    });
    document.addEventListener('fullscreenchange', () => setTimeout(fitActive, 60));
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fitActive, 80); });
  }

  document.addEventListener('DOMContentLoaded', init);
})(window.WU);
