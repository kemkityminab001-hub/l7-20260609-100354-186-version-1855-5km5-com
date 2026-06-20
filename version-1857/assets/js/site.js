(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('.menu-toggle');
        var mobilePanel = document.querySelector('.mobile-panel');

        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                mobilePanel.classList.toggle('open');
            });
        }

        setupHero();
        setupPlayers();
        setupSearchPage();
    });

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var nextIndex = Number(dot.getAttribute('data-slide')) || 0;
                show(nextIndex);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var cover = shell.querySelector('.player-cover');

            if (!video) {
                return;
            }

            var source = video.getAttribute('data-src');
            var prepared = false;

            function prepare() {
                if (prepared || !source) {
                    return Promise.resolve();
                }

                prepared = true;

                if (/\.m3u8(\?|$)/i.test(source)) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                        return Promise.resolve();
                    }

                    return ensureHls().then(function () {
                        if (window.Hls && window.Hls.isSupported()) {
                            var hls = new window.Hls({
                                enableWorker: true,
                                lowLatencyMode: true
                            });
                            hls.loadSource(source);
                            hls.attachMedia(video);
                        } else {
                            video.src = source;
                        }
                    });
                }

                video.src = source;
                return Promise.resolve();
            }

            function play() {
                prepare().then(function () {
                    if (cover) {
                        cover.classList.add('hidden');
                    }
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function () {});
                    }
                });
            }

            if (cover) {
                cover.addEventListener('click', play);
            }

            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (cover && video.currentTime === 0) {
                    cover.classList.remove('hidden');
                }
            });
        });
    }

    function ensureHls() {
        if (window.Hls) {
            return Promise.resolve();
        }

        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        }).catch(function () {});
    }

    function setupSearchPage() {
        var area = document.querySelector('[data-search-results]');
        if (!area) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim().toLowerCase();
        var formInput = document.querySelector('.search-large input[name="q"]');
        var categorySelect = document.querySelector('[data-filter-category]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var items = Array.prototype.slice.call(area.querySelectorAll('.search-item'));
        var counter = area.querySelector('[data-result-count]');
        var empty = area.querySelector('[data-empty-state]');

        if (formInput) {
            formInput.value = params.get('q') || '';
        }

        function applyFilters() {
            var category = categorySelect ? categorySelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var visible = 0;

            items.forEach(function (item) {
                var text = item.getAttribute('data-text') || '';
                var itemCategory = item.getAttribute('data-category') || '';
                var itemRegion = item.getAttribute('data-region') || '';
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (category && itemCategory !== category) {
                    matched = false;
                }

                if (region && itemRegion !== region) {
                    matched = false;
                }

                item.classList.toggle('hidden', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (counter) {
                counter.textContent = query ? '搜索结果：' + visible : '为你推荐：' + visible;
            }

            if (empty) {
                empty.classList.toggle('active', visible === 0);
            }
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', applyFilters);
        }

        if (regionSelect) {
            regionSelect.addEventListener('change', applyFilters);
        }

        applyFilters();
    }
})();
