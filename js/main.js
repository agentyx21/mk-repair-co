/* MK Repair Co. — main.js
   Small, dependency-free. Every feature checks for its markup first, and
   the page is fully usable without this file (no-JS fallbacks in HTML/CSS). */
(function () {
  'use strict';

  var EMAIL = 'info@mkrepairco.com';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var storage = {
    get: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
    remove: function (k) { try { window.sessionStorage.removeItem(k); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------------------------------------------------------------
     1. Sheet menu (mobile): open/close, focus trap, Escape, restore focus
     --------------------------------------------------------------- */
  var sheet = $('#menu');
  var menuBtn = $('.menu-btn--js');
  var actionbar = $('[data-actionbar]');
  var lastFocus = null;

  function focusables(root) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', root)
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function openSheet() {
    if (!sheet) return;
    lastFocus = document.activeElement;
    sheet.hidden = false;
    document.body.classList.add('is-locked');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    if (actionbar) actionbar.classList.add('is-hidden');
    // Next frame so the transition runs from the closed state.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { sheet.classList.add('is-open'); });
    });
    var first = $('.sheet__nav a', sheet);
    if (first) first.focus();
    document.addEventListener('keydown', onSheetKey);
  }

  function closeSheet(restore) {
    if (!sheet || sheet.hidden) return;
    sheet.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    if (actionbar) actionbar.classList.remove('is-hidden');
    document.removeEventListener('keydown', onSheetKey);
    var done = function () { sheet.hidden = true; };
    if (reduceMotion) done(); else setTimeout(done, 200);
    if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onSheetKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
    if (e.key !== 'Tab') return;
    var items = focusables($('.sheet__panel', sheet));
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  if (sheet && menuBtn) {
    menuBtn.addEventListener('click', function () {
      if (sheet.hidden) openSheet(); else closeSheet();
    });
    $$('[data-sheet-close]', sheet).forEach(function (el) {
      el.addEventListener('click', function () { closeSheet(); });
    });
    // Navigating within the page closes the sheet without stealing focus back.
    $$('.sheet__nav a', sheet).forEach(function (a) {
      a.addEventListener('click', function () { closeSheet(false); });
    });
    // Close if the viewport grows past the breakpoint where the full nav shows.
    window.addEventListener('resize', function () {
      if (!sheet.hidden && window.innerWidth >= 1100) closeSheet(false);
    });
  }

  /* ---------------------------------------------------------------
     2. Mobile action bar: step aside while typing (on-screen keyboard)
     --------------------------------------------------------------- */
  if (actionbar) {
    var isField = function (el) { return el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && el.type !== 'checkbox' && el.type !== 'radio'; };
    document.addEventListener('focusin', function (e) { if (isField(e.target)) actionbar.classList.add('is-hidden'); });
    document.addEventListener('focusout', function (e) {
      if (isField(e.target) && (!sheet || sheet.hidden)) actionbar.classList.remove('is-hidden');
    });
  }

  /* ---------------------------------------------------------------
     3. Accordions — panels are open in the HTML (no-JS) and collapsed here
     --------------------------------------------------------------- */
  $$('[data-accordion]').forEach(function (acc) {
    $$('.acc__trigger', acc).forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      var open = btn.getAttribute('data-open') === 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });
    });
  });

  // Open an accordion item when its id is linked to directly (e.g. #faq-pricing).
  function openFromHash() {
    if (!location.hash) return;
    var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    var trigger = target.matches && target.matches('.acc__item') ? $('.acc__trigger', target) : null;
    if (trigger && trigger.getAttribute('aria-expanded') !== 'true') trigger.click();
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* ---------------------------------------------------------------
     4. Repairs index: highlight the category in view
     --------------------------------------------------------------- */
  var indexLinks = $$('.index-nav a[href^="#"]');
  if (indexLinks.length) {
    var sections = indexLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var ticking = false;
    var markActive = function () {
      ticking = false;
      var line = window.innerHeight * 0.35;
      var active = -1;
      sections.forEach(function (sec, i) { if (sec && sec.getBoundingClientRect().top <= line) active = i; });
      // Stop highlighting once the last category has scrolled away.
      var lastSec = sections[sections.length - 1];
      if (lastSec && lastSec.getBoundingClientRect().bottom < line) active = -1;
      indexLinks.forEach(function (a, i) {
        a.classList.toggle('is-active', i === active);
        if (i === active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
      // In the horizontal (mobile) index, keep the active chip in view.
      var list = indexLinks[0].closest('ol');
      if (active > -1 && list && list.scrollWidth > list.clientWidth) {
        var chip = indexLinks[active].parentNode;
        var left = chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2;
        list.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(markActive); }
    }, { passive: true });
    markActive();
  }

  /* ---------------------------------------------------------------
     5. Maintenance checklist: count ticks, carry the list to the request form
     --------------------------------------------------------------- */
  var checklist = $('[data-checklist]');
  if (checklist) {
    var boxes = $$('input[type="checkbox"]', checklist);
    var countEl = $('[data-checklist-count]');
    var bookLink = $('[data-checklist-book]');
    var LIST_KEY = 'mk:maintenance-list';

    var saved = [];
    try { saved = JSON.parse(storage.get(LIST_KEY) || '[]'); } catch (e) { saved = []; }
    boxes.forEach(function (b) { if (saved.indexOf(b.value) !== -1) b.checked = true; });

    var update = function () {
      var picked = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
      if (countEl) {
        countEl.innerHTML = picked.length
          ? '<b>' + picked.length + '</b> item' + (picked.length === 1 ? '' : 's') + ' on your list'
          : 'Nothing ticked yet';
      }
      if (bookLink) bookLink.textContent = picked.length ? 'Book with this list' : 'Book a visit';
      if (picked.length) storage.set(LIST_KEY, JSON.stringify(picked)); else storage.remove(LIST_KEY);
    };
    boxes.forEach(function (b) { b.addEventListener('change', update); });
    update();
  }


  /* ---------------------------------------------------------------
     6. Request form: steps, validation, ?job= preselect, submit.
        Without JS the form shows every step and posts to mailto:.
        With an http(s) action (e.g. Formspree) it POSTs via fetch.
     --------------------------------------------------------------- */
  var form = $('#request-form');
  if (!form) return;

  var steps = $$('.fstep', form);
  var last = steps.length - 1;
  var bars = $$('.progress__steps li');
  var progress = $('.progress');
  var btnBack = $('[data-back]', form);
  var btnNext = $('[data-next]', form);
  var btnSend = $('[data-send]', form);
  var shell = $('.form-shell');
  var siteHeader = $('.site-header');
  var current = 0;

  steps.forEach(function (s, i) { s.hidden = i !== 0; });

  function labelFor(radio) {
    var choice = radio.closest('.choice');
    var l = choice && choice.querySelector('[data-label]');
    return l ? l.textContent : radio.value;
  }

  function checkedValues(name) {
    return $$('input[name="' + name + '"]:checked', form).map(function (i) { return i.value; });
  }

  // Preselect the job type from ?job=
  var job = new URLSearchParams(location.search).get('job');
  var jobRadio = job ? form.querySelector('input[name="job"][value="' + job.replace(/[^a-z]/g, '') + '"]') : null;
  if (jobRadio) {
    jobRadio.checked = true;
    var note = $('[data-preselected]', form);
    if (note) {
      note.hidden = false;
      $('[data-preselected-name]', note).textContent = labelFor(jobRadio);
    }
  }

  // Bring over a ticked maintenance checklist.
  var savedList = [];
  try { savedList = JSON.parse(storage.get('mk:maintenance-list') || '[]'); } catch (e) { savedList = []; }
  if (savedList.length && (!job || job === 'maintenance')) {
    var mRadio = form.querySelector('input[name="job"][value="maintenance"]');
    if (mRadio && !checkedValues('job').length) mRadio.checked = true;
    var desc = form.elements.description;
    if (desc && !desc.value) desc.value = 'Maintenance visit. Items I would like covered:\n- ' + savedList.join('\n- ') + '\n\n';
  }

  /* Validation */
  function messageFor(el) {
    var kind = el.getAttribute('data-validate');
    var required = el.getAttribute('data-msg-required') || 'This field is required.';
    if (kind === 'radio-required') return checkedValues(el.getAttribute('data-group')).length ? '' : required;
    var v = (el.value || '').trim();
    if (kind === 'required') return v ? '' : required;
    if (kind === 'description') {
      if (!v) return required;
      return v.length < 15 ? 'Add a little more detail, at least a short sentence, so we know what we’re looking at.' : '';
    }
    if (kind === 'zip') {
      if (!v) return required;
      return /^\d{5}(-\d{4})?$/.test(v) ? '' : 'Enter a 5-digit ZIP code, like 12345.';
    }
    if (kind === 'email') {
      if (!v) return required;
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter an email address like name@example.com.';
    }
    return '';
  }

  function show(el, msg) {
    var isGroup = el.matches('.group');
    var wrap = isGroup ? el : el.closest('.field');
    if (!wrap) return;
    wrap.classList.toggle('is-invalid', !!msg);
    (isGroup ? $$('input', el) : [el]).forEach(function (c) {
      if (msg) c.setAttribute('aria-invalid', 'true'); else c.removeAttribute('aria-invalid');
    });
    var out = $('.field__error [data-msg]', wrap);
    if (out) out.textContent = msg;
  }

  function validateStep(i) {
    var errors = [];
    $$('[data-validate]', steps[i]).forEach(function (el) {
      var msg = messageFor(el);
      show(el, msg);
      if (msg) errors.push({ target: el.matches('.group') ? $('input', el) : el, msg: msg });
    });
    return errors;
  }

  function renderSummary(i, errors) {
    var box = $('.error-summary', steps[i]);
    if (!box) return;
    box.hidden = !errors.length;
    if (!errors.length) return;
    var ul = $('ul', box);
    ul.innerHTML = '';
    errors.forEach(function (er) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + er.target.id;
      a.textContent = er.msg;
      a.addEventListener('click', function (e) { e.preventDefault(); er.target.focus(); });
      li.appendChild(a);
      ul.appendChild(li);
    });
    box.focus();
  }

  // Re-check a field as soon as the person fixes it.
  function revalidate(e) {
    var target = e.target.closest('[data-validate]');
    if (target && (target.matches('.is-invalid') || target.closest('.is-invalid'))) show(target, messageFor(target));
    var box = $('.error-summary', steps[current]);
    if (box && !box.hidden && !$('.is-invalid', steps[current])) box.hidden = true;
  }
  form.addEventListener('input', revalidate);
  form.addEventListener('change', revalidate);

  /* Steps */
  function scrollToForm() {
    var offset = (siteHeader ? siteHeader.offsetHeight : 0) + 16;
    var top = shell.getBoundingClientRect().top + window.pageYOffset - offset;
    if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function goTo(i, focus) {
    steps[current].hidden = true;
    current = Math.max(0, Math.min(last, i));
    steps[current].hidden = false;
    bars.forEach(function (b, n) {
      b.classList.toggle('is-done', n < current);
      b.classList.toggle('is-current', n === current);
    });
    btnBack.hidden = current === 0;
    btnNext.hidden = current === last;
    btnSend.hidden = current !== last;
    if (current === last) renderReview();
    if (focus !== false) {
      var legend = $('.fstep__legend', steps[current]);
      if (legend) { legend.setAttribute('tabindex', '-1'); legend.focus({ preventScroll: true }); }
      scrollToForm();
    }
  }

  btnNext.addEventListener('click', function () {
    var errors = validateStep(current);
    renderSummary(current, errors);
    if (!errors.length) goTo(current + 1);
  });
  btnBack.addEventListener('click', function () { goTo(current - 1); });

  // Enter in a single-line field moves to the next step instead of submitting early.
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && current < last) {
      e.preventDefault();
      btnNext.click();
    }
  });

  /* Review + message */
  function val(name) {
    var el = form.elements[name];
    if (!el) return '';
    if (!el.tagName) return checkedValues(name).join(', ');
    if (el.type === 'checkbox') return el.checked ? el.value : '';
    return (el.value || '').trim();
  }

  function jobLabel() {
    var r = form.querySelector('input[name="job"]:checked');
    return r ? labelFor(r) : '';
  }

  function renderReview() {
    var dl = $('[data-review]', form);
    if (!dl) return;
    var rows = [
      ['Job type', jobLabel(), 0],
      ['What’s going on', val('description'), 1],
      ['How soon', val('urgency'), 1],
      ['Other jobs too', val('more_jobs') ? 'Yes' : 'No', 1],
      ['Property', val('property_type'), 2],
      ['ZIP code', val('zip'), 2],
      ['Good times', val('times') || 'Not specified', 2],
      ['Access notes', val('access_notes') || 'None', 2]
    ];
    dl.innerHTML = '';
    rows.forEach(function (row) {
      var div = document.createElement('div');
      var dt = document.createElement('dt');
      dt.className = 'label';
      dt.textContent = row[0];
      var dd = document.createElement('dd');
      dd.textContent = row[1] || '—';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'review__edit';
      btn.textContent = 'Edit';
      btn.setAttribute('aria-label', 'Edit ' + row[0].toLowerCase());
      btn.addEventListener('click', function () { goTo(row[2]); });
      div.appendChild(dt);
      div.appendChild(dd);
      div.appendChild(btn);
      dl.appendChild(div);
    });
  }

  function composeText() {
    return [
      'REPAIR REQUEST (from the MK Repair Co. website)',
      '',
      'JOB TYPE: ' + jobLabel(),
      '',
      'WHAT’S GOING ON:',
      val('description'),
      '',
      'HOW SOON: ' + val('urgency'),
      'OTHER JOBS ON THE LIST: ' + (val('more_jobs') ? 'Yes' : 'No'),
      '',
      'PROPERTY: ' + val('property_type'),
      'ZIP CODE: ' + val('zip'),
      'GOOD TIMES: ' + (val('times') || 'Not specified'),
      'ACCESS NOTES: ' + (val('access_notes') || 'None'),
      '',
      'NAME: ' + val('name'),
      'EMAIL: ' + val('email')
    ].join('\n');
  }

  function mailtoHref(text) {
    var subject = 'Repair request: ' + jobLabel() + ' (' + val('zip') + ')';
    var body = text.length > 1800 ? text.slice(0, 1750) + '\n\n[Shortened to fit your email app. The full request is on the confirmation screen to copy.]' : text;
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  /* Status panels */
  function showStatus(id) {
    $$('.form-status').forEach(function (s) { s.hidden = s.id !== id; });
    form.hidden = true;
    if (progress) progress.hidden = true;
    var h = $('h2', document.getElementById(id));
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    scrollToForm();
  }

  function backToForm() {
    $$('.form-status').forEach(function (s) { s.hidden = true; });
    form.hidden = false;
    if (progress) progress.hidden = false;
    goTo(last);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    for (var i = 0; i <= last; i++) {
      var errs = validateStep(i);
      if (errs.length) {
        if (i !== current) goTo(i, false);
        renderSummary(i, errs);
        return;
      }
    }

    var text = composeText();
    $$('[data-copy-text]').forEach(function (t) { t.value = text; });
    $$('[data-mailto]').forEach(function (a) { a.href = mailtoHref(text); });

    var action = form.getAttribute('action') || '';
    if (!/^https?:\/\//i.test(action)) {
      // No form service configured: hand the request to the visitor's email app.
      showStatus('status-mailto');
      storage.remove('mk:maintenance-list');
      // Cancelable hook (lets tests or analytics intercept before the email app opens).
      var href = mailtoHref(text);
      var proceed = form.dispatchEvent(new CustomEvent('mk:mailto', { bubbles: true, cancelable: true, detail: { href: href } }));
      if (proceed) window.location.href = href;
      return;
    }

    var label = $('[data-send-label]', btnSend);
    btnSend.disabled = true;
    btnSend.setAttribute('aria-busy', 'true');
    if (label) label.textContent = 'Sending…';

    var data = new FormData(form);
    data.append('summary', text);
    fetch(action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        storage.remove('mk:maintenance-list');
        showStatus('status-sent');
      })
      .catch(function () { showStatus('status-error'); })
      .then(function () {
        btnSend.disabled = false;
        btnSend.removeAttribute('aria-busy');
        if (label) label.textContent = 'Send request';
      });
  });

  $$('[data-edit-request]').forEach(function (b) { b.addEventListener('click', backToForm); });

  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = $('[data-copy-text]', btn.closest('.form-status'));
      var lbl = $('[data-copy-label]', btn);
      if (!t) return;
      var done = function () {
        if (!lbl) return;
        lbl.textContent = 'Copied';
        setTimeout(function () { lbl.textContent = 'Copy request'; }, 2000);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(t.value).then(done, function () { t.select(); });
      } else {
        t.select();
        try { if (document.execCommand('copy')) done(); } catch (err) { /* text stays selected for manual copy */ }
      }
    });
  });

  goTo(0, false);
})();
