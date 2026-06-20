(function () {
  window.initMoviePlayer = function (url) {
    var video = document.querySelector('[data-video-player]');
    var shell = document.querySelector('[data-player-shell]');
    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-play-trigger]'));
    var hls = null;
    var started = false;

    if (!video || !shell || !url) {
      return;
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function attachSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }
      video.src = url;
    }

    function start() {
      if (!started) {
        started = true;
        attachSource();
        shell.classList.add('is-playing');
        video.controls = true;
      }
      playVideo();
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', start);
    });
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
