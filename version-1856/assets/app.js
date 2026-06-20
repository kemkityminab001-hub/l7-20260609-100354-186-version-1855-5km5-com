(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs("[data-menu-button]");
    var nav = qs("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
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
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = parseInt(dot.getAttribute("data-hero-dot"), 10) || 0;
        show(next);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function includesText(haystack, needle) {
    return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
  }

  function setupFilters() {
    var scope = qs("[data-filter-scope]");
    if (!scope) {
      return;
    }
    var cards = qsa("[data-movie-card]", scope);
    var input = qs("[data-filter-input]");
    var typeSelect = qs("[data-filter-type]");
    var yearSelect = qs("[data-filter-year]");
    var categorySelect = qs("[data-filter-category]");
    var reset = qs("[data-filter-reset]");
    var count = qs("[data-filter-count]");
    var empty = qs("[data-filter-empty]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (input && initialQuery) {
      input.value = initialQuery;
    }
    function read(card, name) {
      return card.getAttribute("data-" + name) || "";
    }
    function matchYear(cardYear, selected) {
      if (!selected) {
        return true;
      }
      var year = parseInt(cardYear, 10);
      var value = parseInt(selected, 10);
      if (!year || !value) {
        return false;
      }
      if (value === 2010) {
        return year >= 2010 && year < 2020;
      }
      if (value === 2000) {
        return year >= 2000 && year < 2010;
      }
      if (value === 1990) {
        return year >= 1990 && year < 2000;
      }
      if (value === 1980) {
        return year < 1990;
      }
      return year === value;
    }
    function apply() {
      var query = input ? input.value.trim() : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var category = categorySelect ? categorySelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var content = [
          read(card, "title"),
          read(card, "region"),
          read(card, "type"),
          read(card, "year"),
          read(card, "genre"),
          read(card, "tags"),
          read(card, "category")
        ].join(" ");
        var ok = true;
        if (query) {
          ok = includesText(content, query);
        }
        if (ok && type) {
          ok = includesText(read(card, "type"), type);
        }
        if (ok && year) {
          ok = matchYear(read(card, "year"), year);
        }
        if (ok && category) {
          ok = read(card, "category") === category;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = "当前显示 " + visible + " 部";
      }
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    [input, typeSelect, yearSelect, categorySelect].forEach(function (item) {
      if (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      }
    });
    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (typeSelect) {
          typeSelect.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        if (categorySelect) {
          categorySelect.value = "";
        }
        apply();
      });
    }
    apply();
  }

  function initPlayer(streamUrl, videoId, coverId) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var attached = false;
    var hlsInstance = null;
    if (!video) {
      return;
    }
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = streamUrl;
    }
    function start() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }
    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    video.addEventListener("error", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      attached = false;
    });
  }

  window.initPlayer = initPlayer;

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
