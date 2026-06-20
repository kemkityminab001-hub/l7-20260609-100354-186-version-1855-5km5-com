(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var controls = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-control]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('active', position === current);
            });
            controls.forEach(function (control, position) {
                control.classList.toggle('active', position === current);
            });
        }

        controls.forEach(function (control) {
            control.addEventListener('click', function () {
                showSlide(Number(control.getAttribute('data-hero-control')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var searchInput = document.querySelector('[data-search-input]');
    var typeFilter = document.querySelector('[data-filter-type]');
    var yearFilter = document.querySelector('[data-filter-year]');
    var categoryFilter = document.querySelector('[data-filter-category]');
    var resultWrap = document.querySelector('[data-search-results]');

    if (searchInput && resultWrap) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var cards = Array.prototype.slice.call(resultWrap.querySelectorAll('[data-card]'));

        searchInput.value = query;

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput.value);
            var type = normalize(typeFilter && typeFilter.value);
            var year = normalize(yearFilter && yearFilter.value);
            var category = normalize(categoryFilter && categoryFilter.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type')
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchType = !type || normalize(card.getAttribute('data-type')) === type;
                var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
                var matchCategory = !category || normalize(card.getAttribute('data-category')) === category;

                card.classList.toggle('is-hidden', !(matchKeyword && matchType && matchYear && matchCategory));
            });
        }

        [searchInput, typeFilter, yearFilter, categoryFilter].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilters);
                element.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    function setupVideo(video) {
        var source = video.getAttribute('data-video');
        var shell = video.closest('.video-shell');
        var playButton = shell ? shell.querySelector('[data-play-button]') : null;
        var hlsInstance = null;

        if (!source) {
            return;
        }

        function bindSource() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hlsInstance) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            hlsInstance.destroy();
                        }
                    }
                });
                return;
            }

            video.src = source;
        }

        function playOrPause() {
            if (video.paused) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            } else {
                video.pause();
            }
        }

        bindSource();

        if (playButton) {
            playButton.addEventListener('click', playOrPause);
        }

        video.addEventListener('click', playOrPause);
        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('playing');
            }
        });
        video.addEventListener('pause', function () {
            if (shell) {
                shell.classList.remove('playing');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-video]')).forEach(setupVideo);
})();
