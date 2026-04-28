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

  // Bin photos open in the lightbox individually (no gallery navigation)
  $(document).on('click', '.bin-photo', function () {
    lbItems = [{ src: $(this).data('src'), caption: $(this).data('caption') }];
    lbIndex = 0;
    lbShow(0);
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
    },
    {
      id: 4,
      title: 'falafel sin picante',
      date: '22 de abril de 2026',
      preview: 'Pizza margherita...',
      body: 'Pizza margherita x2\ndoner falafel sin cebolla.\nPatatas x3\nsin  bebida'
    },
    {
      id: 5,
      title: 'feedback rápido sesión 20/2',
      date: '23 de abril de 2026',
      preview: 'subir 0.5db...',
      body: 'subir 0.5db voz en estribillo?? ahora se hunde\nquitar hi-hat en 0:42, sobra groove\nel bajo entra tarde en 1:08 (o soy yo?)\nprobar voz doblada solo en última frase\nno abusar del reverb otra vez pls'
    },
    {
      id: 6,
      title: 'objetivos',
      date: '25 de abril de 2026',
      preview: 'Flechas???...',
      body: 'Flechas???\nbuscar objetivos.\nhay que tirar bien la flecha para que se les clave.'
    },
    {
      id: 7,
      title: 'TO DO',
      date: '26 de abril de 2026',
      preview: '-Lista de...',
      body: '-Lista de adelantos.\n-Decidir portada.\n-Poner lavadora d color.\npillar flechasss\n\núltima versión la tiene Dannel??\nPreguntar equipo fechas finales.'
    },
    {
      id: 8,
      title: '????',
      date: '28 de abril de 2026',
      preview: 'Ojalá ser...',
      body: 'Ojalá ser un pájaro para star siempre en lo alto\nsubirme a tu balcon slo de un saltooooo\ny comerme las migas de tu bocaaaaa(?)'
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
  let iti = null;
  let itiLoaded = false;

  // National-format phone examples by ISO2 country code (no country prefix)
  var PHONE_EX = {
    AD:'312 345',        AE:'050 123 4567',   AF:'070 123 4567',
    AL:'066 212 3456',   AM:'077 123456',     AO:'923 123 456',
    AR:'011 1234-5678',  AT:'0664 123456',    AU:'0412 345 678',
    AZ:'040 123 45 67',  BA:'061 123 456',    BD:'01812-345678',
    BE:'0470 12 34 56',  BG:'087 123 4567',   BH:'3600 1234',
    BO:'71234567',       BR:'(11) 91234-5678',BS:'(242) 359-1234',
    BY:'029 491-19-11',  BZ:'622-1234',       CA:'(506) 234-5678',
    CH:'076 123 45 67',  CL:'09 1234 5678',   CM:'6 71 23 45 67',
    CN:'131 2345 6789',  CO:'300 123 4567',   CR:'8312 3456',
    CU:'05 1234567',     CY:'96 123456',      CZ:'601 123 456',
    DE:'01512 3456789',  DK:'20 12 34 56',    DO:'809 234 5678',
    DZ:'055 12 34 56',   EC:'099 123 4567',   EE:'5123 4567',
    EG:'010 1234 5678',  ES:'612 345 678',    ET:'091 123 4567',
    FI:'041 2345678',    FR:'06 12 34 56 78', GA:'06 03 12 34',
    GB:'07400 123456',   GE:'555 01 23 45',   GH:'023 123 4567',
    GR:'691 234 5678',   GT:'5120 1234',      HN:'9123-4567',
    HR:'091 234 5678',   HT:'34 10 1234',     HU:'06 20 123 4567',
    ID:'0812-3456-789',  IE:'085 012 3456',   IL:'050-234-5678',
    IN:'081234 56789',   IQ:'0791 234 5678',  IR:'0912 345 6789',
    IS:'611 1234',       IT:'312 345 6789',   JM:'(876) 210-1234',
    JO:'079 0123456',    JP:'090-1234-5678',  KE:'0712 123456',
    KR:'010-2000-0000',  KW:'500 12345',      KZ:'8 701 234 56 78',
    LB:'71 123 456',     LK:'071 234 5678',   LT:'611 12345',
    LU:'621 123 456',    LV:'211 23456',      LY:'091 2345678',
    MA:'0650-123456',    MD:'062 612 345',    ME:'067 622 901',
    MK:'072 345 678',    MM:'09 212 3456',    MT:'9696 1234',
    MU:'5251 2345',      MW:'0991 23 45 67',  MX:'55 1234 5678',
    MY:'012-345 6789',   MZ:'82 123 4567',    NA:'081 246 8347',
    NG:'0802 123 4567',  NI:'8123 4567',      NL:'06 12345678',
    NO:'40 61 23 45',    NP:'984-1234567',    NZ:'021 123 4567',
    OM:'9212 3456',      PA:'6123-4567',      PE:'912 345 678',
    PH:'0905 123 4567',  PK:'0301 2345678',   PL:'512 345 678',
    PT:'912 345 678',    PY:'0961 456789',    QA:'3312 3456',
    RO:'0712 034 567',   RS:'060 1234567',    RU:'8 912 345-67-89',
    RW:'0720 123 456',   SA:'051 234 5678',   SE:'070-123 45 67',
    SG:'8123 4567',      SI:'031 234 567',    SK:'0912 123 456',
    SN:'70 123 45 67',   SV:'7012 3456',      SZ:'7612 3456',
    TH:'081 234 5678',   TN:'20 123 456',     TR:'0501 234 56 78',
    TW:'0912 345 678',   TZ:'0621 234 567',   UA:'050 123 4567',
    UG:'0712 345678',    US:'(201) 555-0123', UY:'094 231 234',
    UZ:'8 90 123 45 67', VE:'0412-1234567',   VN:'091 234 56 78',
    YE:'0712 3456789',   ZA:'071 123 4567',   ZM:'095 5123456',
    ZW:'071 234 5678'
  };

  function initIti() {
    if (iti) return;
    const phoneEl = document.querySelector('#phone');
    if (!phoneEl) return;
    iti = window.intlTelInput(phoneEl, {
      initialCountry: 'auto',
      geoIpLookup: function (success) {
        $.getJSON('https://ipapi.co/json/')
          .done(function (data) { success(data && data.country_code ? data.country_code : 'es'); })
          .fail(function () { success('es'); });
      },
      hiddenInput: function () { return { phone: 'field_mobile_phone' }; },
      dropdownContainer: document.body,
      loadUtilsOnInit: 'https://cdn.jsdelivr.net/npm/intl-tel-input@26.0.6/build/js/utils.js'
    });

    // flag → country select + placeholder
    phoneEl.addEventListener('countrychange', function () {
      const cd = iti.getSelectedCountryData();
      if (cd && cd.iso2) {
        const code = cd.iso2.toUpperCase();
        $('#field_country_region').val(code);
        phoneEl.setAttribute('placeholder', PHONE_EX[code] || '');
      }
    });

    // country select → flag
    $('#field_country_region').on('change.iti', function () {
      const code = $(this).val();
      if (code) iti.setCountry(code.toLowerCase());
    });
  }

  // Browser tabs
  $(document).on('click', '.browser-tab', function () {
    const tab = $(this).data('tab');
    const $win = $('#win-browser');
    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
      $win.find('.browser-tab-panel').removeClass('active').hide();
      $win.find('.browser-content').show();
    } else {
      $win.find('.browser-tab').removeClass('active');
      $(this).addClass('active');
      $win.find('.browser-content').hide();
      $win.find('.browser-tab-panel').removeClass('active').hide();
      $win.find('#browser-tab-' + tab).addClass('active').show();
    }
  });

  $('#newsletter-open-btn').on('click', function (e) {
    e.preventDefault();
    openWindow('newsletter');
    if (!itiLoaded) {
      itiLoaded = true;
      $('<link>', {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/intl-tel-input@26.0.6/build/css/intlTelInput.min.css'
      }).appendTo('head');
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/intl-tel-input@26.0.6/build/js/intlTelInput.min.js';
      s.onload = initIti;
      document.head.appendChild(s);
    }
  });

  $('#dob_picker').datepicker({
    changeMonth: true,
    changeYear: true,
    yearRange: 'c-100:c+0',
    dateFormat: 'yy-mm-dd'
  });

  $('body').on('change', '.mailing-list-id', function () {
    var ml_id = $(this).attr('id').substring(16, 17);
    $('#ts-for-ml-' + ml_id).prop('checked', $(this).is(':checked'));
  });

  $('#newsletter-form').on('submit', function (e) {
    e.preventDefault();
    const form = this;
    let valid = true;

    // Sanitise text inputs
    $(form).find('input[type="text"], input[type="email"], input[type="tel"]').val(function (_, v) {
      return $.trim(v.replace(/(<([^>]+)>)/gi, ''));
    });

    // Clear previous error state
    $(form).find('.is-invalid').removeClass('is-invalid');

    function fail($el) { $el.addClass('is-invalid'); valid = false; }

    // Email — valid format
    const $email = $('#field_email_address');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($email.val())) fail($email);

    // First name — letters, spaces, accents, hyphens only; within maxlength
    const $first = $('#field_first_name');
    const firstName = $first.val().trim();
    if (!firstName || !/^[a-zA-ZÀ-ÿ\s'-]+$/.test(firstName) || firstName.length > 30) fail($first);

    // Last name — same rules
    const $last = $('#field_last_name');
    const lastName = $last.val().trim();
    if (!lastName || !/^[a-zA-ZÀ-ÿ\s'-]+$/.test(lastName) || lastName.length > 60) fail($last);

    // Country — must be selected
    const $country = $('#field_country_region');
    if (!$country.val()) fail($country);

    // Date of birth — YYYY-MM-DD, real past date, not more than 120 years ago
    const $dob = $('#dob_picker');
    const dobParts = $dob.val().trim().split('-');
    if (dobParts.length === 3 && /^\d{4}$/.test(dobParts[0]) && /^\d{2}$/.test(dobParts[1]) && /^\d{2}$/.test(dobParts[2])) {
      const d = new Date(+dobParts[0], +dobParts[1] - 1, +dobParts[2]);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const isRealDate = d.getFullYear() === +dobParts[0] && d.getMonth() === +dobParts[1] - 1 && d.getDate() === +dobParts[2];
      if (!isRealDate || d >= today || +dobParts[0] < today.getFullYear() - 120) fail($dob);
    } else {
      fail($dob);
    }

    // Postal code — not empty, within maxlength
    const $postal = $('#field_postal_code');
    if (!$postal.val().trim() || $postal.val().trim().length > 20) fail($postal);

    // Phone — use isValidNumber() only when utils are loaded (returns a boolean);
    // otherwise fall back to a non-empty check so a loaded-but-unvalidated utils
    // doesn't silently block every submission
    const $phone = $('#phone');
    const phoneHasValue = !!$phone.val().trim();
    let phoneOk = phoneHasValue;
    if (phoneHasValue && iti) {
      try { const v = iti.isValidNumber(); if (typeof v === 'boolean') phoneOk = v; } catch (e) {}
    }
    if (!phoneOk) fail($phone);

    // Mandatory consent checkbox
    const $consent = $(form).find('input[type="checkbox"][required]');
    if (!$consent.is(':checked')) fail($consent);

    if (!valid) return;

    var data = $(form).serialize();
    $.ajax({
      type: 'POST',
      url: 'https://subs.sonymusicfans.com/submit',
      dataType: 'json',
      data: data,
      xhrFields: { withCredentials: false },
      success: function () {
        $('#newsletter_form_container').fadeOut(function () {
          $('#newsletter_form_response').fadeIn();
        });
      },
      error: function () {
        alert('Ha ocurrido un error. Por favor, inténtalo más tarde.');
      }
    });
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
