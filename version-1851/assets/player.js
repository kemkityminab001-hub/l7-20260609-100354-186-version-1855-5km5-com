(function () {
    function attachSource(video, source, onReady) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", onReady, { once: true });
            return null;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
            hls.on(window.Hls.Events.ERROR, function (_event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
            return hls;
        }

        video.src = source;
        video.addEventListener("loadedmetadata", onReady, { once: true });
        return null;
    }

    window.setupMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var overlay = document.getElementById(config.overlayId);
        var button = document.getElementById(config.buttonId);
        var started = false;
        var hlsInstance = null;

        if (!video || !overlay || !button || !config.source) {
            return;
        }

        function playVideo() {
            var result = video.play();

            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        function start() {
            overlay.classList.add("is-hidden");

            if (!started) {
                hlsInstance = attachSource(video, config.source, playVideo);
                started = true;
            } else if (video.paused) {
                playVideo();
            }
        }

        button.addEventListener("click", start);
        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!started) {
                start();
                return;
            }

            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
