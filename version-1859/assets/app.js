(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("active", current === activeSlide);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("active", current === activeSlide);
        });
    }

    if (slides.length) {
        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(activeSlide - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(activeSlide + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 6500);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var sortSelect = document.querySelector("[data-sort-select]");
    var grid = document.querySelector("[data-grid]");
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-card]")) : [];

    function applyFilters() {
        if (!grid || !cards.length) {
            return;
        }
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var category = categoryFilter ? categoryFilter.value : "all";
        cards.forEach(function (card) {
            var text = card.getAttribute("data-search") || "";
            var cardCategory = card.getAttribute("data-category") || category;
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedCategory = category === "all" || cardCategory === category;
            card.classList.toggle("hidden", !(matchedKeyword && matchedCategory));
        });
    }

    function sortCards() {
        if (!grid || !cards.length || !sortSelect) {
            return;
        }
        var mode = sortSelect.value;
        var sorted = cards.slice();
        sorted.sort(function (a, b) {
            if (mode === "newest") {
                return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
            }
            if (mode === "oldest") {
                return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
            }
            if (mode === "title") {
                return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
            }
            return Number(a.getAttribute("data-index")) - Number(b.getAttribute("data-index"));
        });
        sorted.forEach(function (card) {
            grid.appendChild(card);
        });
        cards = sorted;
        applyFilters();
    }

    if (filterInput) {
        var parameters = new URLSearchParams(window.location.search);
        var query = parameters.get("q");
        if (query) {
            filterInput.value = query;
        }
        filterInput.addEventListener("input", applyFilters);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener("change", applyFilters);
    }
    if (sortSelect) {
        sortSelect.addEventListener("change", sortCards);
    }
    applyFilters();
})();
