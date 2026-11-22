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
  function buildChecks() {
    $('#expr-levels').innerHTML = WU.Expressions.LEVELS.map((l) =>
      `<label class="check"><input type="checkbox" name="expr-level" value="${l.id}"${l.id <= 2 ? ' checked' : ''}>
        <span><b>${l.name}</b><small>${l.desc}</small></span></label>`).join('');
    $('#pyth-types').innerHTML = WU.Pythagorean.TYPES.map((t, i) =>
      `<label class="check"><input type="checkbox" name="pyth-type" value="${t.id}"${i === 0 ? ' checked' : ''}>
        <span><b>${t.name}</b><small>${t.desc}</small></span></label>`).join('');
  }

  function readSettings() {
    const titleSel = $('#title-select').value;
    return {
      titleSel,
      customTitle: $('#custom-title').value,
      exprCount: clampInt($('#expr-count').value, 0, 20),
      exprLevels: $$('input[name="expr-level"]:checked').map((i) => +i.value),
      exprMode: ($('input[name="expr-mode"]:checked') || {}).value || 'mix',
      pythCount: clampInt($('#pyth-count').value, 0, 20),
      pythTypes: $$('input[name="pyth-type"]:checked').map((i) => i.value),
      diagrams: $('#pyth-diagrams').checked,
      order: ($('input[name="order"]:checked') || {}).value || 'expr-first',
      layout: $('#present-layout').value,
      timer: clampInt($('#timer-min').value, 0, 60),
      space: $('#print-space').value,
      copies: $('#print-copies').value,
      key: $('#print-key').checked,
      previewAnswers: $('#preview-answers').checked,
    };
  }
  function applySettings(s) {
    if (!s) return;
    if (s.titleSel) $('#title-select').value = s.titleSel;
    if (s.customTitle) $('#custom-title').value = s.customTitle;
    $('#custom-title-wrap').hidden = $('#title-select').value !== '__custom';
    if (s.exprCount != null) $('#expr-count').value = s.exprCount;
    if (s.pythCount != null) $('#pyth-count').value = s.pythCount;
    if (s.exprLevels) $$('input[name="expr-level"]').forEach((i) => { i.checked = s.exprLevels.includes(+i.value); });
    if (s.pythTypes) $$('input[name="pyth-type"]').forEach((i) => { i.checked = s.pythTypes.includes(i.value); });
    if (s.exprMode) { const r = $(`input[name="expr-mode"][value="${s.exprMode}"]`); if (r) r.checked = true; }
    if (s.order) { const r = $(`input[name="order"][value="${s.order}"]`); if (r) r.checked = true; }
    if (s.diagrams != null) $('#pyth-diagrams').checked = s.diagrams;
    if (s.layout) $('#present-layout').value = s.layout;
    if (s.timer != null) $('#timer-min').value = s.timer;
    if (s.space) $('#print-space').value = s.space;
    if (s.copies) $('#print-copies').value = s.copies;
    if (s.key != null) $('#print-key').checked = s.key;
    if (s.previewAnswers != null) $('#preview-answers').checked = s.previewAnswers;
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
    return spec.topic === 'expr'
      ? WU.Expressions.generate(spec.level, opts.exprMode)
      : WU.Pythagorean.generate(spec.type, { diagrams: opts.diagrams });
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
    p.opts = { exprMode: opts.exprMode, diagrams: opts.diagrams };
    setKeys.add(p.key); setT.add(p.tkey);
    return p;
  }

  function spread(n, items) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(items[i % items.length]);
    return out; // already in ascending difficulty order once sorted by index below
  }

  function buildSet(s) {
    const used = usedMap();
    const keys = new Set(), ts = new Set();
    const levelOrder = WU.Expressions.LEVELS.map((l) => l.id);
    const typeOrder = WU.Pythagorean.TYPES.map((t) => t.id);
    const exprSpecs = spread(s.exprCount, s.exprLevels).sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b))
      .map((level) => ({ topic: 'expr', level }));
    const pythSpecs = spread(s.pythCount, s.pythTypes).sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b))
      .map((type) => ({ topic: 'pyth', type }));
    const opts = { exprMode: s.exprMode, diagrams: s.diagrams };
    const ex = exprSpecs.map((sp) => genUnique(sp, opts, used, keys, ts));
    const py = pythSpecs.map((sp) => genUnique(sp, opts, used, keys, ts));
    let problems;
    if (s.order === 'pyth-first') problems = py.concat(ex);
    else if (s.order === 'shuffle') problems = WU.shuffle(ex.concat(py));
    else problems = ex.concat(py);
    return problems;
  }

  function onGenerate(e) {
    if (e) e.preventDefault();
    const s = readSettings();
    const msg = $('#gen-msg');
    msg.textContent = '';
    if (s.exprCount > 0 && !s.exprLevels.length) { msg.textContent = 'Pick at least one Expressions difficulty level (or set its count to 0).'; return; }
    if (s.pythCount > 0 && !s.pythTypes.length) { msg.textContent = 'Pick at least one Pythagorean problem type (or set its count to 0).'; return; }
    if (s.exprCount + s.pythCount === 0) { msg.textContent = 'Set at least one problem count above 0.'; return; }
    saveSettings();
    current = { title: titleText(), date: $('#date').value, problems: buildSet(s), saved: false };
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
  function problemInner(p, withAnswer) {
    return `<div class="p-text">${p.text}</div>` +
      (p.prompt ? `<div class="p-prompt">${p.prompt}</div>` : '') +
      (p.diagram ? WU.renderDiagram(p.diagram) : '') +
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
          <button type="button" class="btn tiny" data-swap="${i}" title="Replace this problem with a new one">↻ Swap</button>
        </div>
        <div class="pv-body">${problemInner(p, true)}</div>
      </li>`).join('');
  }

  function swap(i) {
    const p = current.problems[i];
    const used = usedMap();
    const keys = new Set(current.problems.map((q) => q.key));
    const ts = new Set(current.problems.map((q, j) => (j === i ? null : q.tkey)));
    const np = genUnique(p.spec, p.opts, used, keys, ts);
    current.problems[i] = np;
    current.saved = false;
    renderPreview();
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
    renderPreview();
  }
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------------------------------------------------------------------------
  // Presenter
  // ---------------------------------------------------------------------------
  const pr = { slides: [], idx: 0, answers: false, timerTotal: 0, timerLeft: 0, timerId: null, running: false };

  function present() {
    if (!current) return;
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
        `<div class="cell"><div class="cell-num">${i + 1}</div><div class="cell-body">${problemInner(probs[i], true)}</div></div>`).join('') + '</div>';
    }).join('');
    const minutes = clampInt($('#timer-min').value, 0, 60);
    stopTimer();
    pr.timerTotal = pr.timerLeft = minutes * 60;
    renderTimer();
    const el = $('#presenter');
    el.hidden = false;
    el.classList.remove('show-answers');
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
    const items = problems.map((p, i) => `<li class="pp${p.diagram ? ' has-dg' : ''}">
        <span class="pp-num">${i + 1}.</span>
        <div class="pp-body">${problemInner(p, false)}<div class="pp-space" style="height:${compact ? SPACE_EM[space] * 0.6 : SPACE_EM[space]}em"></div></div>
      </li>`).join('');
    return header + `<ol class="pp-list">${items}</ol>`;
  }
  function doPrint() {
    if (!current) return;
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
        <ol class="key-list">${current.problems.map((p) => `<li><div class="key-q">${p.text}${p.prompt ? ' <i>' + p.prompt + '</i>' : ''}</div>${answerHTML(p)}</li>`).join('')}</ol></div>`;
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
        saveSettings();
      }));
    });
    $('#problem-list').addEventListener('click', (e) => {
      const b = e.target.closest('[data-swap]');
      if (b) swap(+b.dataset.swap);
    });
    $('#preview-answers').addEventListener('change', () => {
      $('#problem-list').classList.toggle('hide-answers', !$('#preview-answers').checked);
      saveSettings();
    });
    ['#present-layout', '#timer-min', '#print-space', '#print-copies', '#print-key'].forEach((s) => $(s).addEventListener('change', saveSettings));
    $('#regen-all').addEventListener('click', () => onGenerate());
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
      else if (k === 'f' || k === 'F') toggleFull();
      else if (k === 'Escape') exitPresent();
    });
    document.addEventListener('fullscreenchange', () => setTimeout(fitActive, 60));
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fitActive, 80); });
  }

  document.addEventListener('DOMContentLoaded', init);
})(window.WU);
