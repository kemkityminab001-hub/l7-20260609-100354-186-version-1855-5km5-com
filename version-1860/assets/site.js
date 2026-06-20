(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initNavigation() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 5800);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) prev.addEventListener('click', function () { move(-1); start(); });
    if (next) next.addEventListener('click', function () { move(1); start(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); start(); });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-box]'));
    forms.forEach(function (box) {
      var input = box.querySelector('[data-filter-keyword]');
      var year = box.querySelector('[data-filter-year]');
      var type = box.querySelector('[data-filter-type]');
      var sort = box.querySelector('[data-filter-sort]');
      var scope = document.querySelector(box.getAttribute('data-filter-box')) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var empty = document.querySelector('[data-empty-state]');

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matched = (!keyword || text.indexOf(keyword) !== -1) && (!yearValue || cardYear === yearValue) && (!typeValue || cardType.indexOf(typeValue) !== -1);
          card.style.display = matched ? '' : 'none';
          if (matched) visible += 1;
        });
        if (empty) empty.style.display = visible ? 'none' : 'block';
      }

      function sortCards() {
        if (!sort || !scope) return;
        var value = sort.value;
        var sorted = cards.slice().sort(function (a, b) {
          var ay = parseInt(a.getAttribute('data-year') || '0', 10);
          var by = parseInt(b.getAttribute('data-year') || '0', 10);
          var av = parseInt(a.getAttribute('data-views') || '0', 10);
          var bv = parseInt(b.getAttribute('data-views') || '0', 10);
          if (value === 'year-asc') return ay - by;
          if (value === 'views-desc') return bv - av;
          return by - ay;
        });
        sorted.forEach(function (card) { scope.appendChild(card); });
        cards = sorted;
        apply();
      }

      [input, year, type].forEach(function (el) {
        if (el) el.addEventListener('input', apply);
        if (el) el.addEventListener('change', apply);
      });
      if (sort) sort.addEventListener('change', sortCards);
      apply();
    });
  }

  window.initDetailPlayer = function (streamUrl) {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('[data-player-cover]');
    if (!video || !cover || !streamUrl) return;
    var started = false;
    var hlsInstance = null;

    function attach() {
      if (started) return;
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function begin() {
      attach();
      cover.style.display = 'none';
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    cover.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (!started || video.paused) begin();
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });
}());
