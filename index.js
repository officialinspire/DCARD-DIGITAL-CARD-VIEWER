(() => {
  if (!window.THREE) {
    alert("Three.js failed to load. Check your internet connection and refresh.");
    return;
  }

  function stopCardAudio(fadeDuration = 0.5, { resetTitle = true, resumeMusic = true } = {}) {
    if (!cardAudio) return;

    const endPlayback = () => {
      cardAudio.pause();
      cardAudio.currentTime = 0;
      if (resetTitle) currentCardTrackTitle = null;
      if (cardAudioUrl) {
        URL.revokeObjectURL(cardAudioUrl);
        cardAudioUrl = null;
      }
      updateMusicStatus();

      if (resumeMusic) {
        resumeBackgroundMusic();
      }
    };

    if (cardAudio.volume > 0) {
      fadeAudioVolume(cardAudio, 0, fadeDuration, endPlayback);
    } else {
      endPlayback();
    }
  }

  function playCardAudio(card) {
    if (!cardAudio || !card) return;

    if (bgMusic && !bgMusic.paused) {
      bgMusic.pause();
      musicPlaying = false;
    }

    const audioAsset = card.assets?.audio?.theme;
    const audioSettings = card.assets?.audio?.settings || {};

    stopCardAudio(0.5, { resetTitle: false, resumeMusic: false });

    if (!audioAsset || !audioAsset.data || !dcard) return;

    const audioBlob = dcard.assetToBlob(audioAsset);
    if (!audioBlob) return;

    currentCardTrackTitle = getCardAudioTitle(card);
    lastTrackKind = 'card';
    audioPaused = false;
    updateMusicStatus();

    if (cardAudioUrl) {
      URL.revokeObjectURL(cardAudioUrl);
    }

    cardAudioUrl = URL.createObjectURL(audioBlob);
    cardAudio.src = cardAudioUrl;
    cardAudio.loop = !!audioSettings.loop;

    const startAt = clamp(audioSettings.startTime || 0, 0, Number.MAX_SAFE_INTEGER);
    const setStartTime = () => {
      try { cardAudio.currentTime = startAt; } catch {}
    };

    if (cardAudio.readyState >= 1) {
      setStartTime();
    } else {
      cardAudio.addEventListener('loadedmetadata', setStartTime, { once: true });
    }

    if (audioSettings.instructions) {
      cardAudio.setAttribute('data-instructions', audioSettings.instructions);
      console.info('Card audio instructions:', audioSettings.instructions);
    } else {
      cardAudio.removeAttribute('data-instructions');
    }

    const targetVolume = clamp((audioSettings.volume ?? 80) / 100, 0, 1);
    const fadeInDuration = audioSettings.fadeIn ?? 1.2;
    const shouldAutoplay = audioSettings.autoplay !== false;
    cardAudio.dataset.targetVolume = targetVolume;

    const startPlayback = () => {
      const playPromise = cardAudio.play();
      if (playPromise?.then) {
        playPromise
          .then(() => fadeAudioVolume(cardAudio, targetVolume, fadeInDuration))
          .catch((err) => console.warn('Card audio playback blocked:', err?.message || err));
      } else {
        fadeAudioVolume(cardAudio, targetVolume, fadeInDuration);
      }
    };

    cardAudio.volume = 0;

    if (shouldAutoplay) {
      if (cardAudio.readyState >= 2) {
        startPlayback();
      } else {
        cardAudio.addEventListener('canplay', startPlayback, { once: true });
      }
    } else {
      cardAudio.volume = targetVolume;
    }

    updateMusicStatus();
  }

  function handleCardAudio(card) {
    if (!card?.assets?.audio?.theme) {
      stopCardAudio();
      updateMusicStatus();
      return;
    }

    const audioSettings = card.assets.audio.settings || {};
    fadeOutMusic(audioSettings.fadeOut ?? 1.0);
    playCardAudio(card);
  }

  if (!window.DCard) {
    console.warn("DCard-v2 library missing - .dcard import/export disabled.");
  }

  // Default filenames (optional)
  const DEFAULT_FRONT = "./dante-front-card.png";
  const DEFAULT_BACK  = "./backside.png";

  // Thin like a playing card
  const CARD_THICKNESS = 0.008;

  const BG_MUSIC_TITLE = "Dante's World - Dark Void";
  const BASE_STATUS = ".dcard ready holographic foil";
  const isMobileScreen = window.matchMedia('(max-width: 640px)').matches;

  // DOM - Main App
  const appEl = document.getElementById("app");
  const canvas = document.getElementById("c");
  const loadingEl = document.getElementById("loading");
  const pickerEl = document.getElementById("picker");

  const fileFront = document.getElementById("fileFront");
  const fileBack = document.getElementById("fileBack");
  const btnLoadFiles = document.getElementById("btnLoadFiles");
  const btnTryDefaults = document.getElementById("btnTryDefaults");

  const btnOpenUploader = document.getElementById("btnOpenUploader");
  const btnOpenBinder = document.getElementById("btnOpenBinder");
  const btnReset = document.getElementById("btnReset");
  const btnAuto = document.getElementById("btnAuto");
  const btnMute = document.getElementById("btnMute");
  const btnOpenSettings = document.getElementById("btnOpenSettings");
  const fileDcard = document.getElementById("fileDcard");
  const btnImportDcard = document.getElementById("btnImportDcard");
  const btnExportDcard = document.getElementById("btnExportDcard");

  const btnHamburger = document.getElementById("btnHamburger");
  const mobilePanel = document.getElementById("mobilePanel");
  const mOpenUploader = document.getElementById("mOpenUploader");
  const mOpenBinder = document.getElementById("mOpenBinder");
  const mReset = document.getElementById("mReset");
  const mAuto = document.getElementById("mAuto");
  const mMute = document.getElementById("mMute");
  const mOpenSettings = document.getElementById("mOpenSettings");

  // DOM - Start Menu
  const startMenu = document.getElementById("startMenu");
  const btnStartViewer = document.getElementById("btnStartViewer");
  const btnStartBinder = document.getElementById("btnStartBinder");
  const btnImportCollection = document.getElementById("btnImportCollection");
  const btnSettingsStart = document.getElementById("btnSettingsStart");

  // DOM - Settings Modal
  const settingsModal = document.getElementById("settingsModal");
  const btnCloseSettings = document.getElementById("btnCloseSettings");
  const musicVolumeSlider = document.getElementById("musicVolume");
  const musicVolumeValue = document.getElementById("musicVolumeValue");
  const sfxVolumeSlider = document.getElementById("sfxVolume");
  const sfxVolumeValue = document.getElementById("sfxVolumeValue");
  const graphicsQualitySelect = document.getElementById("graphicsQuality");
  const foilIntensitySlider = document.getElementById("foilIntensity");
  const foilIntensityValue = document.getElementById("foilIntensityValue");
  const antialiasingCheckbox = document.getElementById("antialiasing");
  const shadowsCheckbox = document.getElementById("shadows");
  const themeSelect = document.getElementById("themeSelect");
  const btnApplySettings = document.getElementById("btnApplySettings");
  const btnResetSettings = document.getElementById("btnResetSettings");

  // DOM - Binder
  const binderModal = document.getElementById("binderModal");
  const binderList = document.getElementById("binderList");
  const binderEmpty = document.getElementById("binderEmpty");
  const binderStoredCount = document.getElementById("binderStoredCount");
  const binderExportedCount = document.getElementById("binderExportedCount");
  const binderUpdatedAt = document.getElementById("binderUpdatedAt");
  const btnCloseBinder = document.getElementById("btnCloseBinder");

  // Audio
  const cardAudio = document.getElementById("cardAudio");
  const bgMusic = document.getElementById("bgMusic");
  const footerStatus = document.getElementById("footerStatus");
  const footerMusic = document.getElementById("footerMusic");
  const playerToggle = document.getElementById("btnPlayerToggle");
  const playerMute = document.getElementById("btnPlayerMute");
  const playerTrackTitle = document.getElementById("playerTrackTitle");
  const playerTime = document.getElementById("playerTime");
  const playerDuration = document.getElementById("playerDuration");
  const playerProgressFill = document.getElementById("playerProgressFill");

  const cardInfoPanel = document.getElementById("cardInfoPanel");
  const btnCardInfo = document.getElementById("btnCardInfo");
  const cardInfoBody = document.getElementById("cardInfoBody");
  const cardInfoName = document.getElementById("cardInfoName");
  const cardInfoSet = document.getElementById("cardInfoSet");
  const cardInfoDescription = document.getElementById("cardInfoDescription");
  const cardInfoNumber = document.getElementById("cardInfoNumber");
  const cardInfoRarity = document.getElementById("cardInfoRarity");
  const cardInfoSeries = document.getElementById("cardInfoSeries");
  const cardInfoCreator = document.getElementById("cardInfoCreator");
  const cardInfoRelease = document.getElementById("cardInfoRelease");
  const btnPlayCardAudio = document.getElementById("btnPlayCardAudio");

  // Settings State
  let settings = {
    musicVolume: 35,
    sfxVolume: 80,
    graphicsQuality: 'high',
    foilIntensity: 85,
    antialiasing: true,
    shadows: true,
    theme: 'charcoal'
  };

  const THEMES = {
    charcoal: {
      label: "Charcoal / Shadow",
      badge: "Midnight neutral with cool glow"
    },
    wood: {
      label: "Warm Wood Studio",
      badge: "Earthy amber glow"
    },
    granite: {
      label: "Granite / Marble",
      badge: "Stone with ice accents"
    },
    scifi: {
      label: "Sci-Fi Hologrid",
      badge: "Luminous cyan circuitry"
    },
    glass: {
      label: "Glass Aurora",
      badge: "Translucent blues + lilac"
    },
    void: {
      label: "Midnight Void",
      badge: "Purple black-hole sheen"
    }
  };

  let musicPlaying = false;
  let musicMuted = false;
  let audioPaused = false;
  let userInteracted = false;
  let cardAudioUrl = null;
  let lastTrackKind = 'bg';
  let cardInfoDragPreventClick = false;
  const cardInfoPosition = { x: 0, y: 0 };
  let cardInfoDrag = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  };

  // State
  let autoRotate = false;
  const dcard = window.DCard ? new DCard() : null;
  let loadedCardData = null;
  let loadedMeta = null;
  let lastFrontAsset = null;
  let lastBackAsset = null;
  let currentCardTrackTitle = null;

  const BINDER_KEY = 'dcard-binder-v1';
  let binderState = loadBinderState();

  if (bgMusic) {
    bgMusic.addEventListener('play', () => {
      musicPlaying = true;
      audioPaused = false;
      lastTrackKind = 'bg';
      updateMusicStatus();
    });
    bgMusic.addEventListener('pause', updateMusicStatus);
    bgMusic.addEventListener('timeupdate', updatePlayerUI);
    bgMusic.addEventListener('loadedmetadata', updatePlayerUI);
  }

  if (cardAudio) {
    cardAudio.addEventListener('play', updateMusicStatus);
    cardAudio.addEventListener('pause', updateMusicStatus);
    cardAudio.addEventListener('ended', () => {
      currentCardTrackTitle = null;
      updateMusicStatus();
      resumeBackgroundMusic();
    });
    cardAudio.addEventListener('play', () => {
      audioPaused = false;
      lastTrackKind = 'card';
    });
    cardAudio.addEventListener('timeupdate', updatePlayerUI);
    cardAudio.addEventListener('loadedmetadata', updatePlayerUI);
  }

  function isCardAudioPlaying() {
    return cardAudio && !cardAudio.paused && cardAudio.currentTime > 0 && !cardAudio.ended;
  }

  function formatTime(sec = 0) {
    if (!isFinite(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function getTrackState() {
    const cardPlaying = isCardAudioPlaying();
    const preferCard = cardPlaying || lastTrackKind === 'card';
    const target = preferCard && cardAudio?.src ? cardAudio : bgMusic;
    const isPlaying = target && !target.paused && !audioPaused;
    const duration = target?.duration || 0;
    const currentTime = target?.currentTime || 0;
    const title = target === cardAudio && (cardPlaying || cardAudio?.src) ? (currentCardTrackTitle || "Card audio") : `Background: ${BG_MUSIC_TITLE}`;

    lastTrackKind = target === cardAudio && cardAudio?.src ? 'card' : 'bg';

    return { target, isPlaying, duration, currentTime, title };
  }

  function updateMusicButtons() {
    const { isPlaying } = getTrackState();
    const label = isPlaying ? "⏸ Music" : "▶️ Music";
    if (btnMute) btnMute.textContent = label;
    if (mMute) mMute.textContent = label;
  }

  function updatePlayerUI() {
    const { isPlaying, duration, currentTime, title } = getTrackState();
    if (playerTrackTitle) playerTrackTitle.textContent = title;
    if (playerTime) playerTime.textContent = formatTime(currentTime);
    if (playerDuration) playerDuration.textContent = formatTime(duration || 0);
    if (playerProgressFill) {
      const pct = duration ? Math.min((currentTime / duration) * 100, 100) : 0;
      playerProgressFill.style.width = `${pct}%`;
    }

    if (playerToggle) playerToggle.textContent = isPlaying ? "⏸" : "▶";
    if (playerMute) playerMute.textContent = musicMuted ? "🔇" : "🔊";
  }

  function updateCardInfo(meta = {}) {
    if (!cardInfoPanel) return;
    const name = meta.name || "Untitled Card";
    const set = meta.set || meta.series || "Custom";
    const description = meta.description || meta.caption || meta.flavor || "No description provided yet.";
    const number = meta.cardNumber && meta.totalInSet ? `${meta.cardNumber} / ${meta.totalInSet}` : (meta.cardNumber || "—");
    const rarity = meta.rarity || meta.tier || "—";
    const series = meta.series || meta.set || "—";
    const creator = meta.creator || meta.artist || meta.author || "Unknown";
    const release = meta.release || meta.releaseDate || meta.year || "—";

    if (cardInfoName) cardInfoName.textContent = name;
    if (cardInfoSet) cardInfoSet.textContent = set;
    if (cardInfoDescription) cardInfoDescription.textContent = description;
    if (cardInfoNumber) cardInfoNumber.textContent = number;
    if (cardInfoRarity) cardInfoRarity.textContent = rarity;
    if (cardInfoSeries) cardInfoSeries.textContent = series;
    if (cardInfoCreator) cardInfoCreator.textContent = creator;
    if (cardInfoRelease) cardInfoRelease.textContent = release;

    updateCardAudioButton();
  }

  function toggleCardInfoPanel() {
    if (!cardInfoPanel || !btnCardInfo) return;
    if (cardInfoDragPreventClick) {
      cardInfoDragPreventClick = false;
      return;
    }
    const expanded = cardInfoPanel.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    cardInfoPanel.setAttribute('aria-expanded', next ? 'true' : 'false');
    cardInfoPanel.classList.toggle('open', next);
    if (next && cardInfoBody) {
      cardInfoBody.scrollTop = 0;
    }
  }

  function hasCardAudio() {
    return !!(dcard && loadedCardData?.assets?.audio?.theme?.data);
  }

  function updateCardAudioButton() {
    if (!btnPlayCardAudio) return;
    const hasAudio = hasCardAudio();
    const playingCard = isCardAudioPlaying();
    btnPlayCardAudio.disabled = !hasAudio;
    const label = hasAudio ? (playingCard ? 'Stop card audio' : '▶ Play audio') : 'No card audio loaded';
    btnPlayCardAudio.textContent = label;
    btnPlayCardAudio.setAttribute('aria-label', hasAudio ? label : 'Card audio unavailable');
  }

  function updateViewportHeightVar() {
    const vh = (window.visualViewport?.height || window.innerHeight) * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  updateViewportHeightVar();
  window.addEventListener('resize', updateViewportHeightVar);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewportHeightVar);
  }

  updateCardInfo({});
  updatePlayerUI();
  updateMusicStatus();

  // --- Audio Context for SFX ---
  let audioCtx = null;
  function ensureAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  function clickSfx(type = "click") {
    try {
      ensureAudio();
      if (audioCtx.state === "suspended") audioCtx.resume();

      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(type === "menu" ? 220 : 320, t);
      osc.frequency.exponentialRampToValueAtTime(type === "menu" ? 140 : 200, t + 0.07);

      const volume = (settings.sfxVolume / 100) * (type === "menu" ? 0.12 : 0.08);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.10);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.11);
    } catch {
      // no-op
    }
  }

  // --- Background Music Functions ---
  function tryStartMusic() {
    if (musicPlaying || musicMuted || audioPaused || isCardAudioPlaying()) return;

    console.log("Attempting to start music...");
    bgMusic.volume = 0;
    
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log("✓ Music started successfully!");
        musicPlaying = true;
        fadeInMusic(2.5);
        updateMusicStatus();
      }).catch(err => {
        console.log("Music autoplay blocked:", err.message);
        console.log("Will start on first user interaction...");
      });
    }
  }

  function startMusicWithFade() {
    if (isCardAudioPlaying()) return;

    userInteracted = true;
    tryStartMusic();
    if (musicPlaying && !musicMuted) {
      fadeInMusic(1.5);
    }
  }

  function startMusicOnInteraction() {
    if (musicPlaying || userInteracted || isCardAudioPlaying() || audioPaused) return;
    
    userInteracted = true;
    console.log("User interacted - starting music");
    tryStartMusic();
    updateMusicStatus();
  }

  // Add listeners for first user interaction
  const interactionEvents = ['click', 'touchstart', 'keydown'];
  interactionEvents.forEach(event => {
    document.addEventListener(event, startMusicOnInteraction, { once: true });
  });

  function fadeInMusic(duration = 2.5) {
    const targetVolume = musicMuted ? 0 : (settings.musicVolume / 100);
    const startVolume = bgMusic.volume;
    const startTime = performance.now();

    function updateVolume(currentTime) {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth ease-in curve
      const easedProgress = progress * progress;
      bgMusic.volume = startVolume + (targetVolume - startVolume) * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(updateVolume);
      }
    }

    requestAnimationFrame(updateVolume);
  }

  function fadeOutMusic(duration = 1.2) {
    const startVolume = bgMusic.volume;
    const startTime = performance.now();

    function updateVolume(currentTime) {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      bgMusic.volume = startVolume * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(updateVolume);
      } else {
        bgMusic.pause();
        musicPlaying = false;
        updateMusicStatus();
      }
    }

    requestAnimationFrame(updateVolume);
  }

  function resumeBackgroundMusic() {
    if (isCardAudioPlaying() || musicMuted || audioPaused) return;

    tryStartMusic();

    if (musicPlaying && !musicMuted && bgMusic.paused) {
      const playPromise = bgMusic.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    }

    if (musicPlaying && !musicMuted) {
      fadeInMusic(1.0);
    }

    updateMusicStatus();
  }

  function fadeAudioVolume(el, targetVolume, duration = 1.0, onComplete) {
    if (!el) return;

    const startVolume = el.volume;
    const startTime = performance.now();

    function updateVolume(currentTime) {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      el.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress < 1) {
        requestAnimationFrame(updateVolume);
      } else if (typeof onComplete === 'function') {
        onComplete();
      }
    }

    requestAnimationFrame(updateVolume);
  }

  function getCardAudioTitle(card) {
    const meta = card?.metadata || {};
    const audio = card?.assets?.audio?.theme || {};
    return (
      meta.audioTitle ||
      meta.musicTitle ||
      meta.track ||
      audio.title ||
      audio.name ||
      audio.filename ||
      audio.fileName ||
      "Card audio"
    );
  }

  function updateMusicStatus() {
    if (footerStatus) footerStatus.textContent = BASE_STATUS;
    if (!footerMusic) return;

    const cardIsPlaying = isCardAudioPlaying();
    if (cardIsPlaying) {
      footerMusic.textContent = `Card track: ${currentCardTrackTitle || "Card audio"}`;
      updateMusicButtons();
      updatePlayerUI();
      return;
    }

    if (musicMuted) {
      footerMusic.textContent = "Music muted";
    } else if (audioPaused) {
      footerMusic.textContent = `Audio paused: ${BG_MUSIC_TITLE}`;
    } else if (musicPlaying && !bgMusic.paused) {
      footerMusic.textContent = `Background: ${BG_MUSIC_TITLE}`;
    } else {
      footerMusic.textContent = `Background paused: ${BG_MUSIC_TITLE}`;
    }

    updateMusicButtons();
    updateCardAudioButton();
    updatePlayerUI();
  }

  function toggleCardAudioPlayback() {
    if (!hasCardAudio()) {
      clickSfx("error");
      return;
    }

    if (isCardAudioPlaying()) {
      stopCardAudio(0.4, { resumeMusic: true });
    } else if (loadedCardData) {
      handleCardAudio(loadedCardData);
    }

    clickSfx("click");
    updateCardAudioButton();
  }

  function applyCardInfoPosition() {
    if (!cardInfoPanel) return;
    cardInfoPanel.style.setProperty('--card-info-x', `${cardInfoPosition.x}px`);
    cardInfoPanel.style.setProperty('--card-info-y', `${cardInfoPosition.y}px`);
  }

  function startCardInfoDrag(e) {
    if (!cardInfoPanel) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.target.closest('#btnPlayCardAudio')) return;
    if (cardInfoBody && cardInfoBody.contains(e.target)) return;

    cardInfoDrag.active = true;
    cardInfoDrag.pointerId = e.pointerId;
    cardInfoDrag.startX = e.clientX;
    cardInfoDrag.startY = e.clientY;
    cardInfoDrag.originX = cardInfoPosition.x;
    cardInfoDrag.originY = cardInfoPosition.y;
    cardInfoDrag.moved = false;

    cardInfoPanel.classList.add('dragging');
    cardInfoPanel.setPointerCapture(e.pointerId);
  }

  function moveCardInfoDrag(e) {
    if (!cardInfoDrag.active || e.pointerId !== cardInfoDrag.pointerId) return;
    const dx = e.clientX - cardInfoDrag.startX;
    const dy = e.clientY - cardInfoDrag.startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) cardInfoDrag.moved = true;

    cardInfoPosition.x = cardInfoDrag.originX + dx;
    cardInfoPosition.y = cardInfoDrag.originY + dy;
    applyCardInfoPosition();
  }

  function endCardInfoDrag(e) {
    if (!cardInfoDrag.active || e.pointerId !== cardInfoDrag.pointerId) return;
    cardInfoDrag.active = false;

    if (cardInfoPanel?.hasPointerCapture?.(e.pointerId)) {
      cardInfoPanel.releasePointerCapture(e.pointerId);
    }

    if (cardInfoDrag.moved) {
      cardInfoDragPreventClick = true;
      setTimeout(() => { cardInfoDragPreventClick = false; }, 0);
    }

    cardInfoPanel?.classList.remove('dragging');
  }

  function toggleMusic() {
    audioPaused = !audioPaused;

    const activeTrack = isCardAudioPlaying() ? cardAudio : bgMusic;

    if (audioPaused) {
      if (activeTrack && !activeTrack.paused) {
        activeTrack.pause();
      }
      if (activeTrack === bgMusic) musicPlaying = false;
    } else {
      if (activeTrack && activeTrack.paused && activeTrack.currentTime > 0 && !musicMuted) {
        activeTrack.play().catch(() => {});
      } else {
        resumeBackgroundMusic();
      }
    }

    clickSfx("click");
    updateMusicStatus();
  }

  function toggleMuteAll() {
    musicMuted = !musicMuted;
    if (cardAudio) cardAudio.muted = musicMuted;
    if (bgMusic) bgMusic.muted = musicMuted;

    if (musicMuted) {
      fadeOutMusic(0.4);
    } else if (!audioPaused) {
      if (isCardAudioPlaying()) {
        const target = Number(cardAudio?.dataset?.targetVolume || cardAudio.volume || 1);
        fadeAudioVolume(cardAudio, target, 0.4);
      } else {
        resumeBackgroundMusic();
        fadeInMusic(0.4);
      }
    }

    clickSfx("click");
    updateMusicStatus();
  }

  // --- Settings Functions ---
  function openSettingsModal() {
    settingsModal.classList.add("show");
    clickSfx("menu");
  }

  function closeSettingsModal() {
    settingsModal.classList.remove("show");
    clickSfx("menu");
  }

  function updateSettingsUI() {
    musicVolumeSlider.value = settings.musicVolume;
    musicVolumeValue.textContent = settings.musicVolume + "%";
    
    sfxVolumeSlider.value = settings.sfxVolume;
    sfxVolumeValue.textContent = settings.sfxVolume + "%";
    
    graphicsQualitySelect.value = settings.graphicsQuality;
    
    foilIntensitySlider.value = settings.foilIntensity;
    foilIntensityValue.textContent = settings.foilIntensity + "%";

    antialiasingCheckbox.checked = settings.antialiasing;
    shadowsCheckbox.checked = settings.shadows;
    themeSelect.value = settings.theme;
  }

  function applySettings() {
    // Update music volume
    const targetVolume = musicMuted ? 0 : (settings.musicVolume / 100);
    bgMusic.volume = targetVolume;
    bgMusic.muted = musicMuted;
    if (cardAudio) cardAudio.muted = musicMuted;

    // Apply graphics quality
    applyGraphicsQuality();

    // Apply theme
    applyTheme(settings.theme);

    // Apply foil intensity
    if (cardGroup && cardGroup.userData.foilMats) {
      const intensity = settings.foilIntensity / 100;
      cardGroup.userData.foilMats.forEach(mat => {
        mat.uniforms.uIntensity.value = intensity;
      });
    }
    
    clickSfx("click");
    closeSettingsModal();
  }

  function resetSettings() {
    settings = {
      musicVolume: 35,
      sfxVolume: 80,
      graphicsQuality: 'high',
      foilIntensity: 85,
      antialiasing: true,
      shadows: true,
      theme: 'charcoal'
    };
    
    updateSettingsUI();
    applySettings();
  }

  function applyGraphicsQuality() {
    let pixelRatio;
    switch(settings.graphicsQuality) {
      case 'low':
        pixelRatio = Math.min(window.devicePixelRatio * 0.5, 1);
        break;
      case 'medium':
        pixelRatio = Math.min(window.devicePixelRatio * 0.75, 1.5);
        break;
      case 'high':
        pixelRatio = Math.min(window.devicePixelRatio, 2);
        break;
      case 'ultra':
        pixelRatio = Math.min(window.devicePixelRatio * 1.5, 3);
        break;
    }
    renderer.setPixelRatio(pixelRatio);
  }

  function applyTheme(themeKey) {
    const rootEl = document.documentElement;
    rootEl.setAttribute('data-theme', themeKey);

    // Update document meta for immersive vibes
    const chosen = THEMES[themeKey];
    if (chosen?.badge) {
      rootEl.style.setProperty('--theme-note', `'${chosen.badge}'`);
    }
  }

  // Settings UI event listeners
  musicVolumeSlider.addEventListener('input', (e) => {
    settings.musicVolume = parseInt(e.target.value);
    musicVolumeValue.textContent = settings.musicVolume + "%";
    if (!musicMuted && musicPlaying) {
      bgMusic.volume = settings.musicVolume / 100;
    }
  });

  sfxVolumeSlider.addEventListener('input', (e) => {
    settings.sfxVolume = parseInt(e.target.value);
    sfxVolumeValue.textContent = settings.sfxVolume + "%";
  });

  graphicsQualitySelect.addEventListener('change', (e) => {
    settings.graphicsQuality = e.target.value;
  });

  foilIntensitySlider.addEventListener('input', (e) => {
    settings.foilIntensity = parseInt(e.target.value);
    foilIntensityValue.textContent = settings.foilIntensity + "%";
  });

  antialiasingCheckbox.addEventListener('change', (e) => {
    settings.antialiasing = e.target.checked;
  });

  shadowsCheckbox.addEventListener('change', (e) => {
    settings.shadows = e.target.checked;
  });

  themeSelect.addEventListener('change', (e) => {
    settings.theme = e.target.value;
    applyTheme(settings.theme);
  });

  btnCloseSettings.addEventListener('click', closeSettingsModal);
  btnApplySettings.addEventListener('click', applySettings);
  btnResetSettings.addEventListener('click', resetSettings);
  btnOpenSettings.addEventListener('click', openSettingsModal);
  mOpenSettings.addEventListener('click', () => {
    openSettingsModal();
    closeMobileMenu();
  });
  btnSettingsStart.addEventListener('click', () => {
    startMusicWithFade();
    openSettingsModal();
  });

  // Click outside to close settings
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeSettingsModal();
    }
  });

  // --- Start Menu Functions ---
  function hideStartMenu() {
    startMenu.classList.add("hidden");
    setTimeout(() => {
      startMenu.style.display = "none";
      appEl.classList.add("visible");
    }, 500);
  }

  btnStartViewer.addEventListener("click", () => {
    clickSfx("menu");
    startMusicWithFade();
    hideStartMenu();
  });

  btnStartBinder.addEventListener("click", () => {
    clickSfx("menu");
    startMusicWithFade();
    hideStartMenu();
    openBinder();
  });

  btnImportCollection.addEventListener("click", () => {
    clickSfx("menu");
    startMusicWithFade();
    requestDcardFile();
  });

  // Helpers
  function setLoading(on, msg = "Loading…") {
    loadingEl.textContent = msg;
    loadingEl.style.display = on ? "grid" : "none";
  }

  function showPicker(show) {
    pickerEl.classList.toggle("show", !!show);
    pickerEl.setAttribute("aria-hidden", show ? "false" : "true");
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // --- Binder helpers ---
  function loadBinderState() {
    try {
      const raw = localStorage.getItem(BINDER_KEY);
      const parsed = raw ? JSON.parse(raw) : { cards: [] };
      return parsed?.cards ? parsed : { cards: [] };
    } catch (err) {
      console.warn("Could not load binder; starting fresh", err);
      return { cards: [] };
    }
  }

  function persistBinderState() {
    try {
      localStorage.setItem(BINDER_KEY, JSON.stringify(binderState));
    } catch (err) {
      console.warn("Failed to persist binder", err);
    }
  }

  function normalizeFingerprintLog(log) {
    return Array.isArray(log) ? log : [];
  }

  function recordFingerprintEvent(action) {
    const now = new Date().toISOString();
    const targetMeta = loadedCardData?.metadata || loadedMeta || {};
    const log = normalizeFingerprintLog(targetMeta.fingerprintLog);
    log.push({ action, timestamp: now });

    if (loadedCardData) {
      loadedCardData.metadata = { ...(loadedCardData.metadata || {}), fingerprintLog: log };
    }
    loadedMeta = { ...(loadedMeta || {}), fingerprintLog: log };

    return { log, timestamp: now };
  }

  function getCurrentCardId() {
    return loadedMeta?.binderId || loadedCardData?.fingerprint || loadedMeta?.fingerprint || `card-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function snapshotCurrentCard(status = 'stored') {
    if (!lastFrontAsset || !lastBackAsset) return null;

    const metaCopy = JSON.parse(JSON.stringify(loadedMeta || {}));
    const cardId = getCurrentCardId();
    metaCopy.binderId = cardId;

    const entry = {
      id: cardId,
      name: metaCopy.name || 'Untitled Card',
      set: metaCopy.set || 'Custom',
      cardNumber: metaCopy.cardNumber || '1',
      fingerprint: loadedCardData?.fingerprint || metaCopy.fingerprint || null,
      fingerprintLog: normalizeFingerprintLog(metaCopy.fingerprintLog),
      status,
      savedAt: new Date().toISOString(),
      meta: metaCopy,
      frontAsset: lastFrontAsset,
      backAsset: lastBackAsset,
    };

    loadedMeta = metaCopy;
    return entry;
  }

  function upsertBinderEntry(entry) {
    if (!entry) return;
    const idx = binderState.cards.findIndex((c) => c.id === entry.id || (entry.fingerprint && c.fingerprint === entry.fingerprint));
    if (idx >= 0) {
      binderState.cards[idx] = { ...binderState.cards[idx], ...entry };
    } else {
      binderState.cards.push(entry);
    }
    persistBinderState();
    renderBinder();
  }

  function saveCurrentToBinder(status = 'stored') {
    const entry = snapshotCurrentCard(status);
    upsertBinderEntry(entry);
  }

  function moveBinderEntry(id, direction = -1) {
    const idx = binderState.cards.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const swapWith = idx + direction;
    if (swapWith < 0 || swapWith >= binderState.cards.length) return;
    const temp = binderState.cards[swapWith];
    binderState.cards[swapWith] = binderState.cards[idx];
    binderState.cards[idx] = temp;
    persistBinderState();
    renderBinder();
  }

  async function openBinderCard(id) {
    const card = binderState.cards.find((c) => c.id === id);
    if (!card) return;
    setLoading(true, "Loading from binder…");
    try {
      const frontTex = await textureFromAsset(card.frontAsset);
      const backTex = await textureFromAsset(card.backAsset);

      clearCard();
      cardGroup = createCard(frontTex, backTex);
      root.add(cardGroup);

      loadedMeta = { ...(card.meta || {}), binderId: card.id, fingerprintLog: card.fingerprintLog || [] };
      loadedCardData = null;
      lastFrontAsset = card.frontAsset;
      lastBackAsset = card.backAsset;

      updateCardInfo(loadedMeta || {});

      cardGroup.rotation.x = rot.x;
      cardGroup.rotation.y = rot.y;

      showPicker(false);
      hideStartMenu();
      closeBinder();
    } catch (err) {
      console.error(err);
      alert("Unable to load card from binder.");
    } finally {
      setLoading(false);
    }
  }

  function renderBinder() {
    if (!binderList) return;
    binderList.innerHTML = "";
    const cards = binderState.cards;

    if (!cards.length) {
      binderEmpty.style.display = 'block';
    } else {
      binderEmpty.style.display = 'none';
    }

    let latest = null;
    let exported = 0;
    cards.forEach((card) => {
      if (!latest || (card.savedAt && card.savedAt > latest)) latest = card.savedAt;
      if (card.status === 'exported') exported += 1;

      const el = document.createElement('div');
      el.className = 'binder-card';
      el.setAttribute('role', 'listitem');

      const title = document.createElement('h4');
      title.textContent = card.name;

      const metaRow = document.createElement('div');
      metaRow.className = 'binder-meta';
      metaRow.textContent = `${card.set} • Card ${card.cardNumber}`;

      const badges = document.createElement('div');
      badges.className = 'binder-badges';
      const statusBadge = document.createElement('span');
      statusBadge.className = 'binder-badge binder-status';
      statusBadge.textContent = card.status === 'exported' ? 'Exported' : 'Stored';
      badges.appendChild(statusBadge);

      if (card.fingerprint) {
        const fp = document.createElement('span');
        fp.className = 'binder-badge';
        fp.textContent = `Fingerprint: ${card.fingerprint.slice(0, 10)}…`;
        badges.appendChild(fp);
      }

      const actions = document.createElement('div');
      actions.className = 'binder-actions';

      const viewBtn = document.createElement('button');
      viewBtn.className = 'btn primary';
      viewBtn.textContent = 'Open in Viewer';
      viewBtn.addEventListener('click', () => openBinderCard(card.id));

      const moveUp = document.createElement('button');
      moveUp.className = 'btn';
      moveUp.textContent = '⬆️ Move Up';
      moveUp.addEventListener('click', () => moveBinderEntry(card.id, -1));

      const moveDown = document.createElement('button');
      moveDown.className = 'btn';
      moveDown.textContent = '⬇️ Move Down';
      moveDown.addEventListener('click', () => moveBinderEntry(card.id, 1));

      actions.append(viewBtn, moveUp, moveDown);

      const logBox = document.createElement('div');
      logBox.className = 'binder-log';
      const log = normalizeFingerprintLog(card.fingerprintLog);
      if (!log.length) {
        const empty = document.createElement('div');
        empty.textContent = 'No fingerprint events yet.';
        logBox.appendChild(empty);
      } else {
        log.forEach((entry) => {
          const row = document.createElement('div');
          row.className = 'binder-log-entry';
          const act = document.createElement('span');
          act.textContent = entry.action;
          const ts = document.createElement('span');
          ts.textContent = new Date(entry.timestamp).toLocaleString();
          row.append(act, ts);
          logBox.appendChild(row);
        });
      }

      el.append(title, metaRow, badges, actions, logBox);
      binderList.appendChild(el);
    });

    binderStoredCount.textContent = cards.length - exported;
    binderExportedCount.textContent = exported;
    binderUpdatedAt.textContent = latest ? new Date(latest).toLocaleString() : '—';
  }

  function openBinder() {
    if (!binderModal) return;
    binderModal.classList.add('show');
    binderModal.setAttribute('aria-hidden', 'false');
    renderBinder();
  }

  function closeBinder() {
    if (!binderModal) return;
    binderModal.classList.remove('show');
    binderModal.setAttribute('aria-hidden', 'true');
  }

  btnCloseBinder.addEventListener('click', closeBinder);
  if (binderModal) {
    binderModal.addEventListener('click', (e) => {
      if (e.target === binderModal) closeBinder();
    });
  }

  function requestDcardFile() {
    if (!fileDcard) return;
    fileDcard.value = "";
    fileDcard.click();
  }

  async function loadDcardFile(file) {
    if (!dcard) {
      alert("DCard library failed to load.");
      return;
    }

    setLoading(true, "Loading .dcard file…");
    try {
      const card = await dcard.load(file);
      const front = card.assets?.cardFront;
      const back = card.assets?.cardBack;
      if (!front || !back) throw new Error("Missing front/back assets in .dcard");
      if (!front.data || !back.data) {
        throw new Error("Card references external files. Please import the packaged .zip export.");
      }

      const frontTex = await textureFromAsset(front);
      const backTex = await textureFromAsset(back);

      clearCard();
      cardGroup = createCard(frontTex, backTex);
      root.add(cardGroup);

      loadedCardData = card;
      loadedMeta = card.metadata || null;
      lastFrontAsset = front;
      lastBackAsset = back;

      updateCardInfo(loadedMeta || {});

      recordFingerprintEvent('imported');
      saveCurrentToBinder('stored');

      cardGroup.rotation.x = rot.x;
      cardGroup.rotation.y = rot.y;

      showPicker(false);
      hideStartMenu();
      handleCardAudio(card);
    } catch (err) {
      console.error(err);
      alert(`Failed to load .dcard: ${err.message}`);
      showPicker(true);
    } finally {
      setLoading(false);
    }
  }

  async function exportCurrentDcard() {
    if (!dcard) {
      alert("DCard library failed to load.");
      return;
    }

    if (!lastFrontAsset || !lastBackAsset) {
      alert("Load a card first, then export.");
      return;
    }

    setLoading(true, "Packing .dcard…");
    try {
      let card;
      if (loadedCardData) {
        card = JSON.parse(JSON.stringify(loadedCardData));
        card.assets = { ...card.assets, cardFront: lastFrontAsset, cardBack: lastBackAsset };
        card.modified = new Date().toISOString();
        card.fingerprint = await dcard.generateFingerprint(card);
        card.signature = card.signature || {};
        card.signature.checksum = await dcard.generateChecksum(card);
      } else {
        const meta = loadedMeta || {};
        card = await dcard.create({
          name: meta.name || "Custom Card",
          caption: meta.caption || "Exported from .dcard viewer",
          set: meta.set || "Viewer",
          cardNumber: meta.cardNumber || "1",
          totalInSet: meta.totalInSet || "1",
          cardFront: lastFrontAsset,
          cardBack: lastBackAsset
        });
      }

      const { log: exportLog } = recordFingerprintEvent('exported');
      card.metadata = { ...(card.metadata || {}), fingerprintLog: exportLog };
      saveCurrentToBinder('exported');
      if (typeof JSZip !== 'undefined') {
        await dcard.exportWithAssets(card);
      } else {
        dcard.download(card);
      }
    } catch (err) {
      console.error(err);
      alert(`Unable to export .dcard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Camera + controls constants
  const ZOOM_DEFAULT = isMobileScreen ? 2.6 : 3.2;
  const ZOOM_MIN = isMobileScreen ? 1.8 : 2.0;
  const ZOOM_MAX = 8.0;

  const rot = { x: -0.25, y: 0.65 };
  const rotTarget = { x: rot.x, y: rot.y };

  let zoom = ZOOM_DEFAULT;
  let zoomTarget = zoom;
  // --- Three.js scene ---
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: settings.antialiasing,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060a, 0.04);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, ZOOM_DEFAULT);

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(2.5, 2.5, 3.5);
  if (settings.shadows) key.castShadow = true;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffffff, 0.6);
  rim.position.set(-3.0, -1.0, -2.5);
  scene.add(rim);

  const root = new THREE.Group();
  scene.add(root);

  let cardGroup = null;

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const need =
      canvas.width !== Math.floor(w * renderer.getPixelRatio()) ||
      canvas.height !== Math.floor(h * renderer.getPixelRatio());

    if (need) renderer.setSize(w, h, false);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  // --- Texture loading (reliable) ---
  function loadTextureFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error("No file selected"));

      const reader = new FileReader();
      reader.onerror = () => reject(new Error("File read failed"));
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const tex = new THREE.Texture(img);
          tex.needsUpdate = true;
          resolve(tex);
        };
        img.onerror = () => reject(new Error("Image decode failed"));
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function loadTextureFromURL(url) {
    return new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(
        url,
        (tex) => resolve(tex),
        undefined,
        () => reject(new Error(`Could not load: ${url}`))
      );
    });
  }

  function prepTexture(tex) {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  async function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read blob"));
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async function assetFromURL(url) {
    if (!dcard) throw new Error("DCard library not loaded");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not fetch ${url}`);
    const blob = await res.blob();
    const dataURL = await blobToDataURL(blob);

    const img = new Image();
    const loaded = new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image decode failed"));
    });
    img.src = dataURL;
    await loaded;

    return {
      type: blob.type || "image/png",
      data: dataURL.split(",")[1],
      width: img.width,
      height: img.height
    };
  }

  async function textureFromAsset(asset) {
    if (!dcard) throw new Error("DCard library not loaded");
    if (!asset) throw new Error("Missing asset data");
    const dataURL = dcard.assetToDataURL(asset);
    if (!dataURL) throw new Error("Asset is missing embedded data");
    const tex = await loadTextureFromURL(dataURL);
    return prepTexture(tex);
  }

  function clearCard() {
    if (!cardGroup) return;
    stopCardAudio();
    root.remove(cardGroup);
    cardGroup.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry?.dispose?.();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      }
    });
    cardGroup = null;
  }

  // --- Holographic foil shader overlay ---
  function makeFoilMaterial() {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: settings.foilIntensity / 100 },
        uBoost: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormalW;
        varying vec3 vPosW;
        void main(){
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vPosW = wp.xyz;
          vNormalW = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        varying vec3 vNormalW;
        varying vec3 vPosW;
        uniform float uTime;
        uniform float uIntensity;
        uniform float uBoost;

        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
        float noise(vec2 p){
          vec2 i=floor(p), f=fract(p);
          float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
          vec2 u=f*f*(3.0-2.0*f);
          return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
        }
        vec3 hsv2rgb(vec3 c){
          vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0);
          vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www);
          return c.z * mix(K.xxx, clamp(p-K.xxx,0.0,1.0), c.y);
        }

        void main(){
          vec3 V = normalize(cameraPosition - vPosW);
          float fres = pow(1.0 - max(dot(normalize(vNormalW), V), 0.0), 2.0);

          float n = noise(vUv*18.0 + vec2(uTime*0.35, -uTime*0.25));
          float scan = sin((vUv.y*16.0) + uTime*2.7)*0.5+0.5;

          float hue = fract(vUv.x*0.95 + vUv.y*0.35 + uTime*0.10 + n*0.22);
          vec3 rainbow = hsv2rgb(vec3(hue, 0.9, 1.0));

          float spark = step(0.987, noise(vUv*90.0 + uTime*1.25));

          float mask = (0.35 + 0.65*scan) * (0.55 + 0.45*n);
          float alpha = uIntensity * fres * mask * uBoost;

          vec3 col = rainbow * alpha * 1.35 + spark * vec3(1.2) * fres * 0.25;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
  }

  // --- Build the card with foil overlays on both sides ---
  function createCard(frontTex, backTex) {
    const imgW = frontTex.image?.width || 768;
    const imgH = frontTex.image?.height || 1024;
    const aspect = imgW / imgH;

    const cardHeight = 2.9;
    const cardWidth = cardHeight * aspect;
    const thickness = CARD_THICKNESS;

    const faceGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
    const edgeGeo = new THREE.BoxGeometry(cardWidth, cardHeight, thickness);

    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTex,
      metalness: 0.25,
      roughness: 0.35,
    });

    const backMat = new THREE.MeshStandardMaterial({
      map: backTex,
      metalness: 0.25,
      roughness: 0.35,
    });

    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x0b0b10,
      metalness: 0.6,
      roughness: 0.5,
    });

    const g = new THREE.Group();

    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    g.add(edge);

    const front = new THREE.Mesh(faceGeo, frontMat);
    front.position.z = thickness / 2 + 0.001;
    g.add(front);

    const back = new THREE.Mesh(faceGeo, backMat);
    back.position.z = -thickness / 2 - 0.001;
    back.rotation.y = Math.PI;
    g.add(back);

    // Foil overlays
    const foilFront = new THREE.Mesh(faceGeo, makeFoilMaterial());
    foilFront.position.z = thickness / 2 + 0.0025;
    g.add(foilFront);

    const foilBack = new THREE.Mesh(faceGeo, makeFoilMaterial());
    foilBack.position.z = -thickness / 2 - 0.0025;
    foilBack.rotation.y = Math.PI;
    g.add(foilBack);

    g.userData.foilMats = [foilFront.material, foilBack.material];
    return g;
  }

  // Controls (drag rotate)
  let isPointerDown = false;
  let lastX = 0, lastY = 0;
  let velocityX = 0, velocityY = 0;
  const activePointers = new Map();
  let pinchStartDist = null;
  let pinchStartZoom = null;
  let lastTapTime = 0;
  // Spin speed estimate (for foil boost)
  let spinSpeed = 0;

  function resetView() {
    rotTarget.x = -0.25;
    rotTarget.y = 0.65;
    zoomTarget = ZOOM_DEFAULT;
    velocityX = 0;
    velocityY = 0;
    clickSfx("click");
  }

  const storePointer = (e) => {
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  const getPointerDistance = () => {
    const pts = Array.from(activePointers.values());
    if (pts.length < 2) return 0;
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  function onPointerDown(e) {
    clickSfx("click");
    storePointer(e);
    isPointerDown = true;
    canvas.setPointerCapture(e.pointerId);

    const now = Date.now();
    if (e.pointerType === "touch" && now - lastTapTime < 350) {
      resetView();
    }
    lastTapTime = now;

    if (activePointers.size === 1) {
      lastX = e.clientX;
      lastY = e.clientY;
      velocityX = 0;
      velocityY = 0;
      pinchStartDist = null;
      pinchStartZoom = null;
    } else if (activePointers.size === 2) {
      pinchStartDist = getPointerDistance();
      pinchStartZoom = zoomTarget;
      velocityX = 0;
      velocityY = 0;
    }
  }

  function onPointerMove(e) {
    if (!isPointerDown) return;

    storePointer(e);
    const pointers = Array.from(activePointers.values());

    if (pointers.length >= 2) {
      const dist = getPointerDistance();
      if (!pinchStartDist) {
        pinchStartDist = dist;
        pinchStartZoom = zoomTarget;
      } else {
        const delta = (pinchStartDist - dist) * 0.01;
        zoomTarget = clamp(pinchStartZoom + delta, ZOOM_MIN, ZOOM_MAX);
      }
      velocityX = 0;
      velocityY = 0;
      return;
    }

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    const s = 0.0065;
    rotTarget.y += dx * s;
    rotTarget.x += dy * s;
    rotTarget.x = clamp(rotTarget.x, -1.4, 1.4);

    velocityX = dx;
    velocityY = dy;
  }

  function onPointerUp(e) {
    activePointers.delete(e.pointerId);
    pinchStartDist = null;
    pinchStartZoom = null;

    if (activePointers.size === 0) {
      isPointerDown = false;
    } else {
      const remaining = activePointers.values().next().value;
      lastX = remaining.x;
      lastY = remaining.y;
      isPointerDown = true;
    }

    try { canvas.releasePointerCapture(e.pointerId); } catch {}
  }

  function onWheel(e) {
    e.preventDefault();
    zoomTarget += e.deltaY * 0.0025;
    zoomTarget = clamp(zoomTarget, ZOOM_MIN, ZOOM_MAX);
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("dblclick", resetView);

  // UI syncing
  function syncAutoLabels() {
    const label = `Auto-Rotate: ${autoRotate ? "On" : "Off"}`;
    btnAuto.textContent = label;
    mAuto.textContent = label;
  }

  // Mobile menu
  function toggleMobileMenu(force) {
    const next = typeof force === "boolean" ? force : !mobilePanel.classList.contains("show");
    mobilePanel.classList.toggle("show", next);
    btnHamburger.setAttribute("aria-expanded", next ? "true" : "false");
    mobilePanel.setAttribute("aria-hidden", next ? "false" : "true");
    clickSfx("menu");
  }

  btnHamburger.addEventListener("click", () => toggleMobileMenu());
  function closeMobileMenu() { toggleMobileMenu(false); }

  // Open .dcard importer
  function openImporter() {
    requestDcardFile();
    clickSfx("menu");
  }

  btnOpenUploader.addEventListener("click", openImporter);
  mOpenUploader.addEventListener("click", () => { openImporter(); closeMobileMenu(); });

  function openBinderAndCloseMobile() {
    openBinder();
    closeMobileMenu();
  }

  btnOpenBinder.addEventListener("click", () => {
    clickSfx("menu");
    openBinder();
  });
  mOpenBinder.addEventListener("click", () => {
    clickSfx("menu");
    openBinderAndCloseMobile();
  });

  // Reset
  btnReset.addEventListener("click", resetView);
  mReset.addEventListener("click", () => { resetView(); closeMobileMenu(); });

  // Auto rotate
  btnAuto.addEventListener("click", () => {
    autoRotate = !autoRotate;
    syncAutoLabels();
    clickSfx("click");
  });
  mAuto.addEventListener("click", () => {
    autoRotate = !autoRotate;
    syncAutoLabels();
    clickSfx("click");
    closeMobileMenu();
  });

  // Music toggle
  btnMute.addEventListener("click", toggleMusic);
  mMute.addEventListener("click", () => {
    toggleMusic();
    closeMobileMenu();
  });

  if (playerToggle) playerToggle.addEventListener('click', toggleMusic);
  if (playerMute) playerMute.addEventListener('click', toggleMuteAll);

  if (btnCardInfo) {
    btnCardInfo.addEventListener('click', toggleCardInfoPanel);
  }

  if (btnPlayCardAudio) {
    btnPlayCardAudio.addEventListener('click', toggleCardAudioPlayback);
  }

  if (cardInfoPanel) {
    cardInfoPanel.addEventListener('pointerdown', startCardInfoDrag);
    cardInfoPanel.addEventListener('pointermove', moveCardInfoDrag);
    cardInfoPanel.addEventListener('pointerup', endCardInfoDrag);
    cardInfoPanel.addEventListener('pointercancel', endCardInfoDrag);
  }

  // Load from selected files (primary)
  btnLoadFiles.addEventListener("click", async () => {
    clickSfx("click");
    setLoading(true, "Loading selected images…");

    try {
      const f = fileFront.files?.[0];
      const b = fileBack.files?.[0];
      if (!f || !b) {
        setLoading(false);
        alert("Please select BOTH a front and back image.");
        return;
      }

      const frontTex = prepTexture(await loadTextureFromFile(f));
      const backTex = prepTexture(await loadTextureFromFile(b));

      if (dcard) {
        lastFrontAsset = await dcard.imageToAsset(f);
        lastBackAsset = await dcard.imageToAsset(b);
      }
      loadedCardData = null;
      loadedMeta = {
        name: f.name || "Custom Upload",
        set: "Manual Upload",
        cardNumber: "1",
        totalInSet: "1"
      };

      updateCardInfo(loadedMeta);

      clearCard();
      cardGroup = createCard(frontTex, backTex);
      root.add(cardGroup);

      cardGroup.rotation.x = rot.x;
      cardGroup.rotation.y = rot.y;

      saveCurrentToBinder('stored');
      showPicker(false);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Could not load images. Try PNG/JPG and try again.");
      showPicker(true);
    }
  });

  // Optional: try default filenames
  btnTryDefaults.addEventListener("click", async () => {
    clickSfx("click");
    setLoading(true, "Trying default filenames…");

    try {
      const frontTex = prepTexture(await loadTextureFromURL(DEFAULT_FRONT));
      const backTex = prepTexture(await loadTextureFromURL(DEFAULT_BACK));

      if (dcard) {
        lastFrontAsset = await assetFromURL(DEFAULT_FRONT);
        lastBackAsset = await assetFromURL(DEFAULT_BACK);
      }
      loadedCardData = null;
      loadedMeta = {
        name: "Dante Default",
        set: "Demo Pack",
        cardNumber: "1",
        totalInSet: "1"
      };

      updateCardInfo(loadedMeta);

      clearCard();
      cardGroup = createCard(frontTex, backTex);
      root.add(cardGroup);

      cardGroup.rotation.x = rot.x;
      cardGroup.rotation.y = rot.y;

      saveCurrentToBinder('stored');
      showPicker(false);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Default filenames not found. Use the uploader instead.");
      showPicker(true);
    }
  });

  btnImportDcard.addEventListener("click", () => {
    clickSfx("menu");
    requestDcardFile();
  });

  btnExportDcard.addEventListener("click", () => {
    clickSfx("menu");
    exportCurrentDcard();
  });

  fileDcard.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await loadDcardFile(file);
    e.target.value = "";
  });

  // Animation loop
  const clock = new THREE.Clock();

  function animate() {
    resize();
    const dt = clock.getDelta();

    if (!isPointerDown) {
      const inertia = 0.0009;
      rotTarget.y += velocityX * inertia;
      rotTarget.x += velocityY * inertia;
      rotTarget.x = clamp(rotTarget.x, -1.4, 1.4);

      const damp = Math.pow(0.02, dt);
      velocityX *= damp;
      velocityY *= damp;
    }

    if (autoRotate && !isPointerDown) {
      rotTarget.y += dt * 0.55;
    }

    const smooth = 1 - Math.pow(0.0008, dt);
    const prevY = rot.y;

    rot.x += (rotTarget.x - rot.x) * smooth;
    rot.y += (rotTarget.y - rot.y) * smooth;

    zoom += (zoomTarget - zoom) * smooth;
    camera.position.z = zoom;

    // spin speed for foil boost
    spinSpeed = (rot.y - prevY) / Math.max(dt, 0.0001);

    if (cardGroup) {
      cardGroup.rotation.x = rot.x;
      cardGroup.rotation.y = rot.y;

      // Update foil animation
      const foilMats = cardGroup.userData.foilMats;
      if (foilMats) {
        const boost = 1.0 + Math.min(1.0, Math.abs(spinSpeed) * 0.12);
        for (const m of foilMats) {
          m.uniforms.uTime.value += dt;
          m.uniforms.uBoost.value = boost;
        }
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  // Boot sequence
  (function start() {
    updateSettingsUI();
    syncAutoLabels();
    applyTheme(settings.theme);
    showPicker(true);
    setLoading(false);
    renderBinder();
    resize();
    updateMusicStatus();
    animate();

    // Try to start music immediately
    console.log("=== .DCARD FILE FORMAT VIEWER by #teamInspire ===");
    console.log("Audio file: Dante's World - Dark Void.mp3");
    console.log("Attempting autoplay...");
    
    // Try autoplay immediately
    setTimeout(() => {
      tryStartMusic();
    }, 100);
  })();
})();
