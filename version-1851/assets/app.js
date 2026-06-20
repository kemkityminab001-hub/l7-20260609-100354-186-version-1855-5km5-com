document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileMenu = document.querySelector(".mobile-menu");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobileMenu.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    document.querySelectorAll("[data-scroll-target]").forEach(function (button) {
        button.addEventListener("click", function () {
            var selector = button.getAttribute("data-scroll-target");
            var direction = button.getAttribute("data-scroll-direction") === "left" ? -1 : 1;
            var target = document.querySelector(selector);

            if (target) {
                target.scrollBy({
                    left: direction * Math.max(320, target.clientWidth * 0.72),
                    behavior: "smooth"
                });
            }
        });
    });

    var hero = document.querySelector(".hero-section");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var index = slides.findIndex(function (slide) {
            return slide.classList.contains("is-active");
        });

        if (index < 0) {
            index = 0;
        }

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        hero.querySelectorAll("[data-hero-direction]").forEach(function (button) {
            button.addEventListener("click", function () {
                var direction = button.getAttribute("data-hero-direction") === "prev" ? -1 : 1;
                showSlide(index + direction);
            });
        });

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 6500);
        }
    }

    document.querySelectorAll("[data-movie-search]").forEach(function (input) {
        var scopeSelector = input.getAttribute("data-movie-search") || "body";
        var scope = document.querySelector(scopeSelector) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
                card.classList.toggle("hidden-by-search", keyword && text.indexOf(keyword) === -1);
            });
        });
    });
});
