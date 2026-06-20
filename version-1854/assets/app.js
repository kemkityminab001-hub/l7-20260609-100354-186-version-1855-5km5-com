(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot') || '0');
        show(nextIndex);
        restart();
      });
    });

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter(input, list, note, empty) {
    var query = normalize(input.value);
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var matched = !query || haystack.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (note) {
      note.textContent = query ? '当前关键词：' + input.value : '输入关键词后将自动筛选结果';
    }
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  function setupFilterPages() {
    var filterLists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
    filterLists.forEach(function (list) {
      var scope = list.closest('main') || document;
      var form = scope.querySelector('[data-search-form]') || scope.querySelector('[data-page-filter]');
      if (!form) {
        return;
      }
      var input = form.querySelector('input[type="search"]');
      var note = scope.querySelector('[data-search-note]');
      var empty = scope.querySelector('[data-empty-state]');
      if (!input) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
      applyFilter(input, list, note, empty);
      input.addEventListener('input', function () {
        applyFilter(input, list, note, empty);
      });
      form.addEventListener('submit', function (event) {
        if (form.hasAttribute('data-page-filter')) {
          event.preventDefault();
          applyFilter(input, list, note, empty);
        }
      });
    });
  }

  function attachPlayer(video) {
    var src = video.getAttribute('data-hls-src');
    if (!src || video.dataset.playerReady === '1') {
      return;
    }
    video.dataset.playerReady = '1';
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        hls.destroy();
      });
      video._hlsInstance = hls;
    } else {
      video.src = src;
    }
  }

  function setupPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));
    videos.forEach(function (video) {
      attachPlayer(video);
      var frame = video.closest('.video-frame');
      var trigger = frame ? frame.querySelector('[data-play-trigger]') : null;
      if (trigger) {
        trigger.addEventListener('click', function () {
          attachPlayer(video);
          trigger.classList.add('hidden');
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              trigger.classList.remove('hidden');
            });
          }
        });
      }
      video.addEventListener('play', function () {
        if (trigger) {
          trigger.classList.add('hidden');
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilterPages();
    setupPlayers();
  });
}());
