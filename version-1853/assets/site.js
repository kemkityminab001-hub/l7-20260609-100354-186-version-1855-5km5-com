(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    initHero();
    initFilters();
    initPlayers();
  });

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var root = panel.parentElement || document;
      var search = panel.querySelector('[data-filter-search]');
      var year = panel.querySelector('[data-filter-year]');
      var type = panel.querySelector('[data-filter-type]');
      var count = panel.querySelector('[data-filter-count]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));

      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      }

      function cardText(card) {
        return [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();
      }

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = cardText(card);
          var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
          var cardType = card.getAttribute('data-type') || '';
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = true;
          var matchType = !typeValue || cardType.indexOf(typeValue) !== -1;

          if (yearValue) {
            var targetYear = parseInt(yearValue, 10);

            if (targetYear >= 2023) {
              matchYear = cardYear === targetYear;
            } else {
              matchYear = cardYear >= targetYear;
            }
          }

          var show = matchKeyword && matchYear && matchType;
          card.classList.toggle('is-hidden-by-filter', !show);

          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' 条';
        }
      }

      [search, year, type].forEach(function (input) {
        if (input) {
          input.addEventListener('input', apply);
          input.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var start = player.querySelector('[data-player-start]');
      var source = player.getAttribute('data-src') || (video ? video.getAttribute('data-video-src') : '');
      var hlsInstance = null;
      var hasLoaded = false;

      function loadAndPlay() {
        if (!video || !source) {
          return;
        }

        player.classList.add('is-playing');

        if (!hasLoaded) {
          if (source.indexOf('.m3u8') !== -1 && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else if (source.indexOf('.m3u8') !== -1 && window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          } else {
            video.src = source;
          }

          hasLoaded = true;
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (start) {
        start.addEventListener('click', loadAndPlay);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (!hasLoaded) {
            loadAndPlay();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
})();
