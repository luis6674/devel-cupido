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
      $('#play-btn').html(SVG_PLAY);
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
    const localVid = $ytEmbed.find('video')[0];
    if (localVid) localVid.pause();
    $ytEmbed.empty();
    $ytViewer.removeClass('open');
  }

  $(document).on('click', '.video-thumb', function () {
    const localSrc = $(this).data('local-src');
    const cap      = $(this).data('caption');
    if (localSrc) {
      $ytEmbed.html('<video src="' + localSrc + '" controls autoplay playsinline style="width:100%;height:100%;display:block;background:#000;"></video>');
    } else {
      const vid = $(this).data('vid');
      $ytEmbed.html('<iframe src="https://www.youtube.com/embed/' + vid + '?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>');
    }
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
  const SVG_PLAY  = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><polygon points="6,3 20,12 6,21"/></svg>';
  const SVG_PAUSE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><rect x="5" y="4" width="4" height="16"/><rect x="15" y="4" width="4" height="16"/></svg>';
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
    $('#play-btn').html(SVG_PAUSE);
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
      $(this).html(SVG_PAUSE);
    } else {
      audio.pause();
      $(this).html(SVG_PLAY);
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
    $('#play-btn').html(SVG_PLAY);
    // auto-advance to next track
    if (trackIndex < trackList.length - 1) playTrack(trackIndex + 1);
  });

  $('#progress-bar').on('click', function (e) {
    if (!audio.duration) return;
    const r = this.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  // ── Notes ──
  const notes = [
    {
      id: 1,
      title: 'Amor ciego',
      date: '6 de abril de 2026',
      preview: 'Desde que te fuiste...',
      body: 'Desde que te fuiste no se donde meter los dedos 🔌\n\nYa no compro gomina soy un trol un troleo\nUn guapo feo'
    },
    {
      id: 2,
      title: 'Vacilaciones',
      date: '13 de abril de 2026',
      preview: 'Me vacilas...',
      body: 'Me vacilas? 🤔\nSolo tengo que preocuparme ya de comprar pilas\nBb me cansas pila, gasté todas las tilas\n\nLos mismos labios que besaba contaban mentiras'
    },
    {
      id: 3,
      title: 'Aaahhh!!!',
      date: '20 de abril de 2026',
      preview: 'Parayaaa...',
      body: 'Parayaaa\nNo quiero acabar mal\nLa jodí sin querer   😭\nYo quiero ser tu amor y volverte a tener'
    }
  ];

  (function () {
    const $list = $('#notes-list');
    notes.forEach(function (note) {
      $list.append(
        '<div class="note-item" data-note-id="' + note.id + '">' +
          '<div class="note-item-title">' + note.title + '</div>' +
          '<div class="note-item-preview">' + note.preview + '</div>' +
          '<div class="note-item-date">' + note.date + '</div>' +
        '</div>'
      );
    });
    // Open first note by default
    openNote(notes[0].id);
  })();

  function openNote(id) {
    const note = notes.find(function (n) { return n.id === id; });
    if (!note) return;
    $('.note-item').removeClass('active');
    $('.note-item[data-note-id="' + id + '"]').addClass('active');
    $('#note-view-title').text(note.title);
    $('#note-view-date').text(note.date);
    $('#note-view-body').text(note.body);
  }

  $(document).on('click', '.note-item', function () {
    openNote(parseInt($(this).data('note-id'), 10));
  });

  // ── Newsletter window ──
  $('#newsletter-open-btn').on('click', function (e) {
    e.preventDefault();
    openWindow('newsletter');
  });

  // ── Legal footer toggle ──
  $('#footer-toggle').on('click', function (e) {
    e.stopPropagation();
    $('#footer').toggleClass('open');
  });
  $(document).on('click', function (e) {
    if ($('#footer').hasClass('open') && !$(e.target).closest('#footer, #footer-toggle').length) {
      $('#footer').removeClass('open');
    }
  });

  // ── Gallery tabs ──
  $(document).on('click', '.gallery-tab', function () {
    const tab = $(this).data('tab');
    $('.gallery-tab').removeClass('active');
    $(this).addClass('active');
    $('.gallery-panel').removeClass('active');
    $('#gallery-' + tab).addClass('active');
  });

  // Seek local video thumbnails to 0.5 s so they show a real frame
  document.querySelectorAll('.vid-preview').forEach(function (v) {
    v.addEventListener('loadedmetadata', function () { v.currentTime = 0.5; });
  });

  // ── Calendar ──
  const calEvents = {
    '2026-04-09': {
      title: 'Lanzamiento de la web!',
      desc:  'Lanzamos la nueva web de Cupido en la que habrá varias novedades en los próximos días!'
    }
  };

  const CAL_MONTHS = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  const CAL_DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  let calYear, calMonth;

  function renderCalendar() {
    $('#cal-month-label').text(CAL_MONTHS[calMonth] + ' ' + calYear);

    const $grid = $('#cal-grid').empty();

    CAL_DAYS.forEach(function (d) {
      $grid.append('<div class="cal-day-header">' + d + '</div>');
    });

    const firstDay    = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const now         = new Date();
    const todayStr    = now.getFullYear() + '-' +
                        String(now.getMonth() + 1).padStart(2, '0') + '-' +
                        String(now.getDate()).padStart(2, '0');

    for (let i = 0; i < firstDay; i++) {
      $grid.append('<div class="cal-day cal-day-empty"></div>');
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr  = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      const isToday  = dateStr === todayStr;
      const hasEvent = !!calEvents[dateStr];

      let cls = 'cal-day';
      if (isToday)  cls += ' cal-today';
      if (hasEvent) cls += ' cal-has-event';

      let html = '<div class="' + cls + '" data-date="' + dateStr + '">';
      html += '<span class="cal-day-num">' + d + '</span>';
      if (hasEvent) html += '<span class="cal-event-dot"></span>';
      html += '</div>';

      $grid.append(html);
    }
  }

  // Initialise to current month
  (function () {
    const now = new Date();
    calYear  = now.getFullYear();
    calMonth = now.getMonth();
    renderCalendar();
  })();

  $('#cal-prev').on('click', function () {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });

  $('#cal-next').on('click', function () {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  $(document).on('click', '.cal-has-event', function () {
    const dateStr = $(this).data('date');
    const ev = calEvents[dateStr];
    if (!ev) return;
    const d = new Date(dateStr + 'T12:00:00');
    const dateLabel = d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    $('#cal-event-date').text(dateLabel);
    $('#cal-event-title').text(ev.title);
    $('#cal-event-desc').text(ev.desc);
    $('#cal-event-modal').addClass('open');
  });

  $('#cal-event-close, #cal-event-modal').on('click', function (e) {
    if (e.target === this) $('#cal-event-modal').removeClass('open');
  });

  $(document).on('keydown', function (e) {
    if ($('#cal-event-modal').hasClass('open') && e.key === 'Escape') {
      $('#cal-event-modal').removeClass('open');
    }
  });

});
