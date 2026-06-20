(function () {
  function toText(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
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

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupHomeSearch() {
    var form = document.querySelector('[data-home-search]');
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './movies.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    if (!panels.length) {
      return;
    }
    panels.forEach(function (panel) {
      var section = panel.parentElement;
      var list = section ? section.querySelector('[data-card-list]') : document.querySelector('[data-card-list]');
      var empty = section ? section.querySelector('[data-empty-state]') : document.querySelector('[data-empty-state]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('.filter-card'));
      var search = panel.querySelector('[data-search-input]');
      var filters = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-field]'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (search && query) {
        search.value = query;
      }

      function apply() {
        var term = toText(search ? search.value : '');
        var filterValues = {};
        filters.forEach(function (filter) {
          filterValues[filter.getAttribute('data-filter-field')] = toText(filter.value);
        });
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = toText([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matched = !term || haystack.indexOf(term) !== -1;
          Object.keys(filterValues).forEach(function (key) {
            var value = filterValues[key];
            if (value && toText(card.getAttribute('data-' + key)).indexOf(value) === -1) {
              matched = false;
            }
          });
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (search) {
        search.addEventListener('input', apply);
      }
      filters.forEach(function (filter) {
        filter.addEventListener('change', apply);
      });
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupHomeSearch();
    setupFilters();
  });
})();
