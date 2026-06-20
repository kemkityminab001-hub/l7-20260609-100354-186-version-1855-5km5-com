(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupNavigation() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
        });
    }

    function setupSearchForms() {
        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = "./search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var grids = document.querySelectorAll(".searchable-grid");
        grids.forEach(function (grid) {
            var section = grid.closest("section") || document;
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".searchable-item"));
            var input = section.querySelector(".filter-input");
            var selects = Array.prototype.slice.call(section.querySelectorAll(".filter-select"));
            var empty = section.querySelector(".empty-state");
            if (!cards.length) {
                return;
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var match = true;
                    if (query && normalize(card.getAttribute("data-search")).indexOf(query) === -1) {
                        match = false;
                    }
                    selects.forEach(function (select) {
                        var key = select.getAttribute("data-filter");
                        var value = normalize(select.value);
                        if (value && normalize(card.getAttribute("data-" + key)) !== value) {
                            match = false;
                        }
                    });
                    card.classList.toggle("is-filtered", !match);
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q && input.classList.contains("search-query")) {
                    input.value = q;
                }
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            apply();
        });
    }

    ready(function () {
        setupNavigation();
        setupSearchForms();
        setupHeroSlider();
        setupFilters();
    });
})();

function initMoviePlayer(source) {
    var wrapper = document.querySelector("[data-player-wrapper]");
    if (!wrapper) {
        return;
    }
    var video = wrapper.querySelector("video");
    var overlay = wrapper.querySelector(".player-overlay");
    var hls = null;
    var prepared = false;
    var preparing = null;

    function prepare() {
        if (prepared) {
            return Promise.resolve();
        }
        if (preparing) {
            return preparing;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            prepared = true;
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            preparing = new Promise(function (resolve) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    prepared = true;
                    resolve();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        video.src = source;
                        prepared = true;
                        resolve();
                    }
                });
                window.setTimeout(function () {
                    if (!prepared) {
                        prepared = true;
                        resolve();
                    }
                }, 3600);
            });
            return preparing;
        }
        video.src = source;
        prepared = true;
        return Promise.resolve();
    }

    function start() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        prepare().then(function () {
            var playAttempt = video.play();
            if (playAttempt && typeof playAttempt.catch === "function") {
                playAttempt.catch(function () {});
            }
        });
    }

    function toggle() {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }
    video.addEventListener("click", toggle);
    video.addEventListener("play", function () {
        wrapper.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
        wrapper.classList.remove("is-playing");
    });
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
