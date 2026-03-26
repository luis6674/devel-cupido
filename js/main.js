$(function () {

  let zTop = 1001;
  const MOBILE_BP = 768;

  function isMobile() { return window.innerWidth < MOBILE_BP; }

  // ── Make all windows draggable + resizable ──
  $('.mac-window').each(function () {
    $(this).draggable({
      handle: '.window-titlebar',
      containment: 'body',
      start: function () { bringToFront($(this)); }
    }).resizable({
      handles: 'se, s, e',
      minWidth: 280,
      minHeight: 160
    });
  });

  function applyMobileState() {
    if (isMobile()) {
      $('.mac-window').draggable('disable').resizable('disable');
    } else {
      $('.mac-window').draggable('enable').resizable('enable');
    }
  }
  applyMobileState();
  $(window).on('resize', applyMobileState);

  function bringToFront($win) {
    zTop++;
    $win.css('z-index', zTop);
  }

  // ── Docs lock state ──
  let docsUnlocked = false;
  const DOCS_PASS = 'cupido';

  function showDocsLock() {
    $('#docs-password').val('');
    $('#docs-error').text('');
    $('#docs-lock').addClass('open');
    setTimeout(function () { $('#docs-password').focus(); }, 120);
  }

  // ── Open windows ──
  function openWindow(id) {
    if (id === 'documents' && !docsUnlocked) {
      showDocsLock();
      return;
    }
    const $win = $('#win-' + id);
    if ($win.length === 0) return;

    if ($win.is(':visible')) {
      bringToFront($win);
      $win.effect('bounce', { times: 2, distance: 6 }, 300);
    } else {
      bringToFront($win);
      $win.fadeIn(180);
    }
  }

  // Desktop icons — double-click
  $('.desktop-icon').on('dblclick', function () {
    openWindow($(this).data('window'));
  });
  // Desktop icons — single tap on touch
  $('.desktop-icon').on('click', function () {
    openWindow($(this).data('window'));
  });

  // Dock items — single click
  $('.dock-item').on('click', function () {
    openWindow($(this).data('window'));
  });

  // ── Close button ──
  $(document).on('click', '.tl-close', function () {
    const id = $(this).data('close');
    if (id === 'win-audioplayer') {
      audio.pause();
      $('#play-btn').text('▶');
    }
    $('#' + id).fadeOut(160);
  });

  // ── Bring to front on click ──
  $(document).on('mousedown', '.mac-window', function () {
    bringToFront($(this));
  });

  // ── Clock ──
  function updateClock() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    $('#clock').text(h + ':' + m);
  }
  updateClock();
  setInterval(updateClock, 10000);

  // ── Lightbox ──
  const $lightbox = $('#lightbox');
  const $lbImg    = $('#lightbox-img');
  const $lbCap    = $('#lightbox-caption');
  let lbItems = [];
  let lbIndex = 0;

  function lbShow(idx) {
    lbIndex = (idx + lbItems.length) % lbItems.length;
    const item = lbItems[lbIndex];
    $lbImg.attr('src', item.src).attr('alt', item.caption);
    $lbCap.text(item.caption);
  }

  $(document).on('click', '.picture-thumb', function () {
    lbItems = [];
    $('.picture-thumb').each(function () {
      lbItems.push({ src: $(this).data('src'), caption: $(this).data('caption') });
    });
    const clicked = $(this).data('src');
    lbIndex = lbItems.findIndex(i => i.src === clicked);
    lbShow(lbIndex);
    $lightbox.addClass('open');
  });

  $('#lightbox-close, #lightbox').on('click', function (e) {
    if (e.target === this) $lightbox.removeClass('open');
  });
  $('#lightbox-prev').on('click', function (e) { e.stopPropagation(); lbShow(lbIndex - 1); });
  $('#lightbox-next').on('click', function (e) { e.stopPropagation(); lbShow(lbIndex + 1); });
  $(document).on('keydown', function (e) {
    if (!$lightbox.hasClass('open')) return;
    if (e.key === 'ArrowLeft')  lbShow(lbIndex - 1);
    if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
    if (e.key === 'Escape')     $lightbox.removeClass('open');
  });

  // ── YouTube Viewer ──
  const $ytViewer = $('#yt-viewer');
  const $ytEmbed  = $('#yt-embed');
  const $ytCap    = $('#yt-caption');

  function ytClose() {
    $ytEmbed.empty();
    $ytViewer.removeClass('open');
  }

  $(document).on('click', '.video-thumb', function () {
    const vid = $(this).data('vid');
    const cap = $(this).data('caption');
    $ytEmbed.html('<iframe src="https://www.youtube.com/embed/' + vid + '?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>');
    $ytCap.text(cap);
    $ytViewer.addClass('open');
  });

  $('#yt-close').on('click', function () { ytClose(); });
  $('#yt-viewer').on('click', function (e) { if (e.target === this) ytClose(); });
  $(document).on('keydown', function (e) {
    if ($ytViewer.hasClass('open') && e.key === 'Escape') ytClose();
  });

  // ── Docs lock ──
  $('#docs-submit').on('click', function () {
    if ($('#docs-password').val() === DOCS_PASS) {
      docsUnlocked = true;
      $('#docs-lock').removeClass('open');
      openWindow('documents');
    } else {
      $('#docs-error').text('Incorrect password. Try again.');
      $('#docs-password').val('').focus();
    }
  });
  $('#docs-cancel').on('click', function () {
    $('#docs-lock').removeClass('open');
  });
  $('#docs-password').on('keydown', function (e) {
    if (e.key === 'Enter')  $('#docs-submit').trigger('click');
    if (e.key === 'Escape') $('#docs-cancel').trigger('click');
  });
  $('#docs-lock').on('click', function (e) {
    if (e.target === this) $('#docs-lock').removeClass('open');
  });

  // ── Audio Player ──
  const audio = new Audio();
  const trackList = [];
  let trackIndex = -1;

  // Build track list from DOM
  $('#music-list .music-file').each(function () {
    trackList.push({
      src:    $(this).data('src'),
      title:  $(this).data('title'),
      artist: $(this).data('artist'),
      $el:    $(this)
    });
  });

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  }

  function loadTrack(idx) {
    if (idx < 0 || idx >= trackList.length) return;
    trackIndex = idx;
    const t = trackList[idx];
    audio.src = t.src;
    $('#track-title').text(t.title);
    $('#track-artist').text(t.artist);
    $('#time-cur').text('0:00');
    $('#time-dur').text('0:00');
    $('#progress-fill').css('width', '0%');
    $('.music-file').removeClass('active');
    t.$el.addClass('active');
  }

  function playTrack(idx) {
    loadTrack(idx);
    audio.play().catch(function () {});
    $('#play-btn').text('⏸');
  }

  $(document).on('click', '.music-file', function () {
    const idx = trackList.findIndex(t => t.$el.is(this));
    playTrack(idx);
    openWindow('audioplayer');
  });

  $('#play-btn').on('click', function () {
    if (trackIndex < 0) return;
    if (audio.paused) {
      audio.play().catch(function () {});
      $(this).text('⏸');
    } else {
      audio.pause();
      $(this).text('▶');
    }
  });

  $('#prev-btn').on('click', function () {
    if (trackList.length === 0) return;
    playTrack((trackIndex - 1 + trackList.length) % trackList.length);
  });

  $('#next-btn').on('click', function () {
    if (trackList.length === 0) return;
    playTrack((trackIndex + 1) % trackList.length);
  });

  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    $('#progress-fill').css('width', (audio.currentTime / audio.duration * 100) + '%');
    $('#time-cur').text(fmtTime(audio.currentTime));
    $('#time-dur').text(fmtTime(audio.duration));
  });

  audio.addEventListener('ended', function () {
    $('#play-btn').text('▶');
    // auto-advance to next track
    if (trackIndex < trackList.length - 1) playTrack(trackIndex + 1);
  });

  $('#progress-bar').on('click', function (e) {
    if (!audio.duration) return;
    const r = this.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

});
