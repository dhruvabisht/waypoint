// Small progressive enhancements. Every page works without this script.
(function () {
  'use strict';

  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var readJSON = function (id) {
    var el = document.getElementById(id);
    try { return el ? JSON.parse(el.textContent) : null; } catch (e) { return null; }
  };

  // Home page search
  var q = $('#q');
  var index = readJSON('search-index');
  var results = $('#search-results');
  if (q && index && results) {
    var stampQuery = /^(?:stamp\s*)?([0-6][a-z]?)$/i;
    var render = function () {
      var text = q.value.trim().toLowerCase();
      results.textContent = '';
      if (!text) { results.hidden = true; return; }
      var words = text.split(/\s+/);
      var exact = stampQuery.exec(text);
      var hits = index.filter(function (item) {
        var hay = (item.label + ' ' + item.sub + ' ' + item.keys).toLowerCase();
        return words.every(function (w) { return hay.indexOf(w) !== -1; });
      });
      if (exact) {
        var name = 'stamp ' + exact[1].toLowerCase();
        hits.sort(function (a, b) { return (b.label.toLowerCase() === name) - (a.label.toLowerCase() === name); });
      }
      hits.slice(0, 6).forEach(function (item) {
        var a = document.createElement('a');
        a.className = 'row';
        a.href = item.href;
        var span = document.createElement('span');
        var strong = document.createElement('strong');
        strong.textContent = item.label;
        var small = document.createElement('small');
        small.textContent = item.sub;
        span.appendChild(strong);
        span.appendChild(small);
        a.appendChild(span);
        results.appendChild(a);
      });
      if (!hits.length) {
        var none = document.createElement('p');
        none.className = 'noresult';
        none.textContent = 'No match. Try "stamp", "work", "visa" or "register".';
        results.appendChild(none);
      }
      results.hidden = false;
    };
    q.addEventListener('input', render);
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = $('a.row', results);
        if (first) window.location.href = first.href;
      }
    });
  }

  // Stamps list filters
  var filters = $$('[data-filter]');
  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-filter');
        filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        $$('#stamp-list [data-tags]').forEach(function (card) {
          card.hidden = key !== 'all' && card.getAttribute('data-tags').split(' ').indexOf(key) === -1;
        });
      });
    });
  }

  // "Can I work?" checker
  var checker = $('#checker');
  var answers = readJSON('work-data');
  if (checker && answers) {
    var title = $('#work-title');
    var body = $('#work-body');
    var link = $('#work-link');
    var holidayQ = $('#holiday-q');
    var preset = new URLSearchParams(window.location.search).get('stamp');
    if (preset && answers[preset.toLowerCase()]) {
      var input = $('input[name="stamp"][value="' + preset.toLowerCase() + '"]', checker);
      if (input) input.checked = true;
    }
    var update = function () {
      var stamp = ($('input[name="stamp"]:checked', checker) || {}).value || '2';
      var holiday = (($('input[name="period"]:checked', checker) || {}).value) === 'holiday';
      var a = answers[stamp];
      holidayQ.hidden = !a.titleHoliday;
      title.textContent = holiday && a.titleHoliday ? a.titleHoliday : a.title;
      body.textContent = a.body;
      link.href = a.href;
      link.textContent = stamp === 'none' ? 'Types of employment permit →' : 'More about ' + a.name + ' →';
    };
    checker.addEventListener('change', update);
    update();
  }

  // Emergency page: show the phone's location so it can be read out or texted
  var locBtn = $('#loc-btn');
  if (locBtn) {
    var out = $('#loc-out');
    var coords = $('#loc-coords');
    var acc = $('#loc-acc');
    var sms = $('#loc-sms');
    var copy = $('#loc-copy');
    var smsHref = function (body) {
      // "?&body=" works on both iPhone and Android.
      return 'sms:112?&body=' + encodeURIComponent(body);
    };
    if (!('geolocation' in navigator)) {
      locBtn.hidden = true;
    }
    locBtn.addEventListener('click', function () {
      locBtn.disabled = true;
      locBtn.lastChild.textContent = ' Finding your location…';
      out.hidden = false;
      coords.textContent = '…';
      acc.textContent = 'Allow location if your phone asks.';
      navigator.geolocation.getCurrentPosition(function (pos) {
        var lat = pos.coords.latitude.toFixed(5);
        var lng = pos.coords.longitude.toFixed(5);
        var meters = Math.round(pos.coords.accuracy);
        coords.textContent = lat + ', ' + lng;
        acc.textContent = 'Accurate to about ' + meters + ' metres. Read these numbers to the operator.';
        sms.href = smsHref('I need help. My location: ' + lat + ', ' + lng + ' (within ' + meters + 'm). I need: ');
        copy.hidden = !(navigator.clipboard && navigator.clipboard.writeText);
        locBtn.disabled = false;
        locBtn.lastChild.textContent = ' Update my location';
      }, function () {
        coords.textContent = 'Location not available';
        acc.textContent = 'Your location is off or blocked. Say your address, Eircode or a nearby landmark instead.';
        sms.href = 'sms:112';
        copy.hidden = true;
        locBtn.disabled = false;
        locBtn.lastChild.textContent = ' Try again';
      }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
    });
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(coords.textContent).then(function () {
        copy.textContent = 'Copied';
        setTimeout(function () { copy.textContent = 'Copy'; }, 2000);
      });
    });
  }
})();
