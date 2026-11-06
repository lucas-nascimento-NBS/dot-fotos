(() => {
  'use strict';

  const storageKey = 'techday-countdown-settings-v1';
  const defaults = {
    duration: 300,
    event: 'TechDay / TechWeek',
    message: 'A gente já vai começar.',
    detail: 'Enquanto isso, prepare seu café.',
    endMessage: 'É hora de conectar ideias.',
    animation: true,
    sound: false,
    youtubeUrl: '',
    musicVolume: 30,
    logoMain: '',
    logoFooter: '',
    theme: 'techday',
    template: '',
    templateCustom: '',
  };
  const templates = window.techSessions || [];
  const assetDir = 'assets/';
  const templateSize = { width: 720, height: 712 };
  const maxTemplateChars = 1600000;
  const themes = {
    techday: { logo: 'Logo.png', event: defaults.event, color: '#050817' },
    copilot: { logo: 'Logo%20Copilto%20Shot%20Sessions.png', event: 'Copilot Shot Sessions', color: '#ff8a00' },
  };
  const defaultLogos = { footer: 'NBS_LATAM_Logo_RGB_White%20(1)%20(1).png' };
  const themeLogo = theme => themes[theme].logo;
  const eventName = () => (settings.event === defaults.event ? themes[settings.theme].event : settings.event);
  const maxLogoChars = 1000000;
  const elements = {
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    clock: document.getElementById('clock'),
    progress: document.getElementById('progress'),
    fill: document.getElementById('progress-fill'),
    event: document.getElementById('event-name'),
    message: document.getElementById('display-message'),
    detail: document.getElementById('display-detail'),
    label: document.getElementById('countdown-label'),
    status: document.getElementById('status-text'),
    start: document.getElementById('start-button'),
    startLabel: document.getElementById('start-label'),
    reset: document.getElementById('reset-button'),
    settings: document.getElementById('settings-button'),
    fullscreen: document.getElementById('fullscreen-button'),
    dialog: document.getElementById('settings-dialog'),
    form: document.getElementById('settings-form'),
    durationMinutes: document.getElementById('duration-minutes'),
    durationSeconds: document.getElementById('duration-seconds'),
    eventInput: document.getElementById('event-input'),
    messageInput: document.getElementById('message-input'),
    detailInput: document.getElementById('detail-input'),
    endInput: document.getElementById('end-input'),
    animationInput: document.getElementById('animation-input'),
    soundInput: document.getElementById('sound-input'),
    youtubeInput: document.getElementById('youtube-input'),
    youtubeCheck: document.getElementById('youtube-check'),
    volumeInput: document.getElementById('volume-input'),
    volumeValue: document.getElementById('volume-value'),
    musicPanel: document.getElementById('music-panel'),
    musicHost: document.getElementById('music-player'),
    musicButton: document.getElementById('music-button'),
    musicPrev: document.getElementById('music-prev'),
    musicNext: document.getElementById('music-next'),
    musicMute: document.getElementById('music-mute'),
    musicTitle: document.getElementById('music-title'),
    musicVolume: document.getElementById('music-volume'),
    musicStatus: document.getElementById('music-status'),
    error: document.getElementById('form-error'),
    brandLogo: document.getElementById('brand-logo'),
    footerLogo: document.getElementById('footer-logo'),
    templateCard: document.getElementById('template-card'),
    templateGrid: document.getElementById('template-grid'),
    templateInput: document.getElementById('template-input'),
    templateCustomOption: document.getElementById('template-custom-option'),
    templateCustomPreview: document.getElementById('template-custom-preview'),
    techweek: document.getElementById('techweek'),
    logoMainInput: document.getElementById('logo-main-input'),
    logoFooterInput: document.getElementById('logo-footer-input'),
    logoMainPreview: document.getElementById('logo-main-preview'),
    logoFooterPreview: document.getElementById('logo-footer-preview'),
    logoMainReset: document.getElementById('logo-main-reset'),
    logoFooterReset: document.getElementById('logo-footer-reset'),
    announcement: document.getElementById('announcement'),
  };

  function parseYoutube(value) {
    try {
      const url = new URL(value.includes('://') ? value : `https://${value}`);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
      const host = url.hostname.toLowerCase();
      const parts = url.pathname.split('/').filter(Boolean);
      const isShortHost = host === 'youtu.be';
      if (!isShortHost && !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) return null;
      const list = url.searchParams.get('list');
      if (list && /^[A-Za-z0-9_-]{10,64}$/.test(list) && !list.startsWith('RD') && (isShortHost || url.pathname === '/watch' || url.pathname === '/playlist')) return { kind: 'playlist', id: list };
      let videoId = null;
      if (isShortHost && parts.length === 1) videoId = parts[0];
      else if (url.pathname === '/watch') videoId = url.searchParams.get('v');
      else if (!isShortHost && parts.length === 2 && ['embed', 'shorts', 'live'].includes(parts[0])) videoId = parts[1];
      return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId) ? { kind: 'video', id: videoId, mix: Boolean(list && list.startsWith('RD')) } : null;
    } catch {
      return null;
    }
  }

  function validLogo(value) {
    return typeof value === 'string' && value.length <= maxLogoChars && /^data:image\/(?:png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(value) ? value : '';
  }

  function validTemplate(value) {
    return typeof value === 'string' && value.length <= maxTemplateChars && /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) ? value : '';
  }

  function readSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || typeof saved !== 'object') return { ...defaults };
      return {
        duration: Number.isInteger(saved.duration) && saved.duration >= 1 && saved.duration <= 10859 ? saved.duration : defaults.duration,
        event: typeof saved.event === 'string' && saved.event.trim() ? saved.event.slice(0, 60) : defaults.event,
        message: typeof saved.message === 'string' && saved.message.trim() ? saved.message.slice(0, 120) : defaults.message,
        detail: typeof saved.detail === 'string' ? saved.detail.slice(0, 160) : defaults.detail,
        endMessage: typeof saved.endMessage === 'string' && saved.endMessage.trim() ? saved.endMessage.slice(0, 120) : defaults.endMessage,
        animation: typeof saved.animation === 'boolean' ? saved.animation : defaults.animation,
        sound: typeof saved.sound === 'boolean' ? saved.sound : defaults.sound,
        youtubeUrl: typeof saved.youtubeUrl === 'string' && saved.youtubeUrl.length <= 2048 && parseYoutube(saved.youtubeUrl.trim()) ? saved.youtubeUrl.trim() : defaults.youtubeUrl,
        musicVolume: Number.isInteger(saved.musicVolume) && saved.musicVolume >= 0 && saved.musicVolume <= 100 ? saved.musicVolume : defaults.musicVolume,
        logoMain: validLogo(saved.logoMain),
        logoFooter: validLogo(saved.logoFooter),
        theme: Object.hasOwn(themes, saved.theme) ? saved.theme : defaults.theme,
        template: templates.some(item => item.id === saved.template) || (saved.template === 'custom' && validTemplate(saved.templateCustom)) ? saved.template : defaults.template,
        templateCustom: validTemplate(saved.templateCustom),
      };
    } catch {
      return { ...defaults };
    }
  }

  let settings = readSettings();
  let state = 'ready';
  let remainingMs = settings.duration * 1000;
  let deadline = 0;
  let interval = null;
  let audioContext = null;
  let lastDisplayedSecond = -1;
  let youtubeApiPromise = null;
  let musicPlayer = null;
  let musicReady = false;
  let musicPlaying = false;
  let musicRequested = false;
  let musicRevision = 0;
  let musicSkips = 0;
  let musicMuted = false;
  let pendingLogos = { main: '', footer: '' };
  let pendingTemplateCustom = '';
  let checkTimer = null;
  let checkRevision = 0;

  let cancelProbe = () => {};

  function youtubeErrorMessage(code) {
    if (code === 153) return 'Abra esta tela via localhost ou https para usar o YouTube.';
    if ([101, 150].includes(code)) return 'Este vídeo não pode ser tocado aqui (reprodução restrita pelo dono, mesmo com incorporação liberada). Escolha outro link.';
    return 'Não foi possível tocar este vídeo. Confira o link.';
  }

  async function probeYoutube(videoId) {
    cancelProbe();
    try { await loadYoutubeApi(); } catch { return 'timeout'; }
    return new Promise(resolve => {
      const host = document.createElement('div');
      const mount = document.createElement('div');
      host.className = 'music-player';
      host.appendChild(mount);
      document.body.appendChild(host);
      let player = null;
      let timer = null;
      let done = false;
      const finish = result => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        cancelProbe = () => {};
        try { if (player) player.destroy(); } catch { /* Player may not be ready yet. */ }
        host.remove();
        resolve(result);
      };
      cancelProbe = () => finish('timeout');
      timer = setTimeout(() => finish('timeout'), 10000);
      const playerVars = { playsinline: 1 };
      if (location.protocol !== 'file:') playerVars.origin = location.origin;
      player = new window.YT.Player(mount, {
        width: 200,
        height: 200,
        videoId,
        playerVars,
        events: {
          onReady: () => { clearTimeout(timer); timer = setTimeout(() => finish(null), 1500); },
          onError: event => finish(event.data),
        },
      });
    });
  }

  function youtubeHint(message, status = '') {
    elements.youtubeCheck.textContent = message;
    elements.youtubeCheck.dataset.status = status;
  }

  async function checkYoutube() {
    clearTimeout(checkTimer);
    cancelProbe();
    const revision = ++checkRevision;
    const value = elements.youtubeInput.value.trim();
    if (!value) { youtubeHint(''); return; }
    const parsed = parseYoutube(value);
    if (!parsed) { youtubeHint('Link do YouTube inválido.', 'error'); return; }
    const isPlaylist = parsed.kind === 'playlist';
    youtubeHint(isPlaylist ? 'Verificando playlist...' : 'Verificando vídeo...');
    try {
      const target = isPlaylist ? `https://www.youtube.com/playlist?list=${parsed.id}` : `https://www.youtube.com/watch?v=${parsed.id}`;
      const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(target)}`;
      const response = await fetch(url, { referrerPolicy: 'no-referrer' });
      if (revision !== checkRevision) return;
      if (response.ok) {
        const data = await response.json();
        if (revision !== checkRevision) return;
        const title = String(data.title || '').slice(0, 80);
        if (isPlaylist) {
          youtubeHint(`${title}.`, 'ok');
          return;
        }
        youtubeHint('Testando reprodução...');
        const code = await probeYoutube(parsed.id);
        if (revision !== checkRevision) return;
        if (code === null) youtubeHint(`Pode tocar: ${title}`, 'ok');
        else if (code === 'timeout') youtubeHint(`Não foi possível testar a reprodução: ${title}`);
        else youtubeHint(`${youtubeErrorMessage(code)}${parsed.mix ? ' Mixes automáticos do YouTube não funcionam no player embutido; use uma playlist normal.' : ''}`, 'error');
      } else if (response.status === 401 || response.status === 403) {
        youtubeHint(isPlaylist ? 'Esta playlist não permite incorporação. Escolha outro link.' : 'Este vídeo não permite incorporação. Escolha outro link.', 'error');
      } else if (response.status === 404) {
        youtubeHint(isPlaylist ? 'Playlist não encontrada ou privada.' : 'Vídeo não encontrado ou privado.', 'error');
      } else {
        youtubeHint('Não foi possível verificar o link agora.');
      }
    } catch {
      if (revision === checkRevision) youtubeHint('Não foi possível verificar o link agora.');
    }
  }

  function renderLogos() {
    elements.brandLogo.src = settings.logoMain || themeLogo(settings.theme);
    elements.footerLogo.src = settings.logoFooter || defaultLogos.footer;
    elements.techweek.hidden = Boolean(settings.logoMain) || settings.theme !== 'techday';
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function wordmark(className) {
    const node = el('span', `session-wordmark ${className}`.trim(), 'tech');
    node.appendChild(el('span', 'week', 'week'));
    return node;
  }

  function flagBadge(code) {
    const badge = el('span', 'session-flag');
    badge.title = 'English';
    badge.innerHTML = '<svg viewBox="0 0 60 30" aria-hidden="true"><rect width="60" height="30" fill="#012169"/><path d="M0 0L60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" stroke-width="2"/><path d="M30 0V30M0 15H60" stroke="#fff" stroke-width="10"/><path d="M30 0V30M0 15H60" stroke="#C8102E" stroke-width="6"/></svg>';
    badge.append(code);
    return badge;
  }

  function buildSessionCard(session) {
    const root = el('section', 'session');
    const brand = el('div', 'session-brand');
    brand.appendChild(wordmark(''));
    if (session.banner) {
      const banner = el('img', 'session-banner');
      banner.src = assetDir + session.banner;
      banner.alt = session.partner;
      brand.append(el('span', 'session-divider'), banner);
    }
    root.appendChild(brand);
    session.titles.forEach((item, index) => {
      const title = el('p', index ? 'session-title-alt' : 'session-title', item.text);
      if (!index && session.spoken) title.appendChild(flagBadge(session.spoken));
      root.appendChild(title);
    });
    const texts = el('div', 'session-texts');
    session.descriptions.forEach(item => {
      const block = el('p', 'session-text');
      if (item.lang) block.appendChild(el('span', 'session-tag', item.lang));
      block.append(item.text);
      texts.appendChild(block);
    });
    root.appendChild(texts);
    const speakers = el('div', 'session-speakers');
    speakers.setAttribute('aria-label', `Speakers (${session.speakersLanguage})`);
    session.speakers.forEach(speaker => {
      const item = el('div', 'speaker');
      const photo = el('img', 'speaker-photo');
      photo.src = assetDir + speaker.photo;
      photo.alt = '';
      const info = el('div', 'speaker-info');
      info.append(el('p', 'speaker-name', speaker.name), el('p', 'speaker-role', speaker.role));
      item.append(photo, info);
      speakers.appendChild(item);
    });
    root.appendChild(speakers);
    return root;
  }

  function renderTemplate() {
    const session = templates.find(item => item.id === settings.template);
    const custom = settings.template === 'custom' && settings.templateCustom;
    elements.templateCard.replaceChildren();
    if (session) {
      elements.templateCard.appendChild(buildSessionCard(session));
    } else if (custom) {
      const img = el('img');
      img.src = settings.templateCustom;
      img.alt = 'Template personalizado';
      elements.templateCard.appendChild(img);
    }
    elements.templateCard.hidden = !session && !custom;
    document.body.classList.toggle('has-template', Boolean(session || custom));
  }

  function buildTemplateOptions() {
    templates.forEach(item => {
      const label = document.createElement('label');
      label.className = 'template-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'template';
      input.value = item.id;
      const thumb = document.createElement('span');
      thumb.className = 'thumb';
      if (item.banner) {
        const img = document.createElement('img');
        img.src = assetDir + item.banner;
        img.alt = '';
        img.loading = 'lazy';
        thumb.appendChild(img);
      } else thumb.appendChild(wordmark('thumb-wordmark'));
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = item.name;
      label.append(input, thumb, name);
      elements.templateGrid.insertBefore(label, elements.templateCustomOption);
    });
  }

  function renderTemplatePreview() {
    elements.templateCustomOption.hidden = !pendingTemplateCustom;
    if (pendingTemplateCustom) elements.templateCustomPreview.src = pendingTemplateCustom;
  }

  async function readTemplate(file) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Use uma imagem PNG, JPG ou WebP.');
    if (file.size > 10 * 1024 * 1024) throw new Error('Imagem muito grande. Use um arquivo de até 10 MB.');
    let bitmap;
    try { bitmap = await createImageBitmap(file); } catch { throw new Error('Não foi possível ler esta imagem.'); }
    const canvas = document.createElement('canvas');
    canvas.width = templateSize.width;
    canvas.height = templateSize.height;
    const scale = Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height);
    const width = bitmap.width * scale;
    const height = bitmap.height * scale;
    canvas.getContext('2d').drawImage(bitmap, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    bitmap.close();
    let url = canvas.toDataURL('image/png');
    if (url.length > maxTemplateChars) url = canvas.toDataURL('image/webp', 0.85);
    if (url.length > maxTemplateChars) url = canvas.toDataURL('image/jpeg', 0.8);
    if (!validTemplate(url)) throw new Error('Imagem muito pesada. Use uma imagem menor.');
    return url;
  }

  function renderLogoPreviews() {
    elements.logoMainPreview.src = pendingLogos.main || themeLogo(elements.form.elements.theme.value);
    elements.logoFooterPreview.src = pendingLogos.footer || defaultLogos.footer;
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Não foi possível ler esta imagem.'));
      reader.readAsDataURL(file);
    });
  }

  async function readLogo(file) {
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) throw new Error('Use uma imagem PNG, JPG, WebP ou SVG.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Imagem muito grande. Use um arquivo de até 5 MB.');
    if (file.type === 'image/svg+xml') {
      if (file.size > 300 * 1024) throw new Error('SVG muito grande. Use um arquivo de até 300 KB.');
      return validLogo(await fileToDataUrl(file)) || Promise.reject(new Error('Não foi possível ler esta imagem.'));
    }
    let bitmap;
    try { bitmap = await createImageBitmap(file); } catch { throw new Error('Não foi possível ler esta imagem.'); }
    const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    let url = canvas.toDataURL('image/png');
    if (url.length > maxLogoChars) url = canvas.toDataURL('image/webp', 0.85);
    if (!validLogo(url)) throw new Error('Imagem muito pesada. Use uma imagem menor.');
    return url;
  }

  function bindLogoPicker(key, input, resetButton) {
    input.addEventListener('change', async () => {
      const file = input.files[0];
      input.value = '';
      if (!file) return;
      try {
        pendingLogos[key] = await readLogo(file);
        renderLogoPreviews();
        elements.error.hidden = true;
      } catch (error) {
        elements.error.textContent = error.message;
        elements.error.hidden = false;
      }
    });
    resetButton.addEventListener('click', () => { pendingLogos[key] = ''; renderLogoPreviews(); });
  }

  function renderIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function setIcon(button, name) {
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', name);
    icon.setAttribute('aria-hidden', 'true');
    button.replaceChild(icon, button.firstElementChild);
    renderIcons();
  }

  function announce(message) {
    elements.announcement.textContent = message;
  }

  function musicStatus(message, playing = false) {
    musicPlaying = playing;
    elements.musicPanel.classList.toggle('is-playing', playing);
    elements.musicStatus.textContent = message;
    const label = playing ? 'Pausar música' : 'Tocar música';
    elements.musicButton.setAttribute('aria-label', label);
    elements.musicButton.dataset.tooltip = label;
    setIcon(elements.musicButton, playing ? 'pause' : 'play');
  }

  function loadYoutubeApi() {
    if (window.YT && typeof window.YT.Player === 'function') return Promise.resolve();
    if (youtubeApiPromise) return youtubeApiPromise;
    youtubeApiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const fail = () => {
        clearTimeout(timeout);
        script.remove();
        youtubeApiPromise = null;
        reject(new Error('YouTube indisponível'));
      };
      const timeout = setTimeout(fail, 15000);
      window.onYouTubeIframeAPIReady = () => { clearTimeout(timeout); resolve(); };
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = fail;
      document.head.appendChild(script);
    });
    return youtubeApiPromise;
  }

  function playMusic() {
    if (!settings.youtubeUrl) return;
    musicRequested = true;
    if (!musicReady) return;
    musicPlayer.setVolume(settings.musicVolume);
    if (settings.musicVolume > 0 && !musicMuted) musicPlayer.unMute();
    musicPlayer.playVideo();
  }

  function updateVolumeIcon() {
    const silent = musicMuted || settings.musicVolume === 0;
    const label = musicMuted ? 'Ativar som' : 'Silenciar';
    elements.musicMute.setAttribute('aria-label', label);
    elements.musicMute.dataset.tooltip = label;
    setIcon(elements.musicMute, silent ? 'volume-x' : settings.musicVolume < 50 ? 'volume-1' : 'volume-2');
  }

  function updateMusicTitle() {
    elements.musicTitle.replaceChildren();
    elements.musicTitle.title = '';
    if (!musicReady) return;
    let data = null;
    try { data = musicPlayer.getVideoData(); } catch { return; }
    const title = data && data.title ? String(data.title) : '';
    if (!title) return;
    const text = document.createElement('span');
    text.className = 'music-title-text';
    text.textContent = title;
    elements.musicTitle.append(text);
    elements.musicTitle.title = title;
    fitMusicTitle();
  }

  function fitMusicTitle() {
    const box = elements.musicTitle;
    const text = box.firstElementChild;
    const overflow = text ? text.scrollWidth - (box.clientWidth - 24) : 0;
    box.classList.toggle('is-scrolling', overflow > 1);
    if (overflow > 1) {
      box.style.setProperty('--shift', `-${overflow + 2}px`);
      box.style.setProperty('--marquee-time', `${Math.max(6, overflow / 25 + 4)}s`);
    }
  }

  function applyMusicVolume() {
    elements.musicVolume.value = settings.musicVolume;
    if (settings.musicVolume > 0) musicMuted = false;
    if (musicReady) {
      musicPlayer.setVolume(settings.musicVolume);
      if (!musicMuted && settings.musicVolume > 0) musicPlayer.unMute();
    }
    updateVolumeIcon();
  }

  function setMusicEnabled(enabled) {
    elements.musicButton.disabled = !enabled;
    elements.musicPrev.disabled = !enabled;
    elements.musicNext.disabled = !enabled;
  }

  function skipMusic(direction) {
    if (!musicReady) return;
    musicSkips = 0;
    musicRequested = true;
    if (direction === 'previous') musicPlayer.previousVideo();
    else musicPlayer.nextVideo();
  }

  function pauseMusic() {
    musicRequested = false;
    if (musicReady) musicPlayer.pauseVideo();
  }

  async function configureMusic(autoplay = false) {
    const revision = ++musicRevision;
    musicRequested = autoplay;
    musicReady = false;
    if (musicPlayer) musicPlayer.destroy();
    musicPlayer = null;
    elements.musicHost.replaceChildren();
    const parsed = parseYoutube(settings.youtubeUrl);
    musicSkips = 0;
    musicMuted = false;
    elements.musicTitle.replaceChildren();
    elements.musicTitle.title = '';
    elements.musicPanel.hidden = !parsed;
    setMusicEnabled(false);
    elements.musicPrev.hidden = elements.musicNext.hidden = !parsed || parsed.kind !== 'playlist';
    elements.musicVolume.value = settings.musicVolume;
    updateVolumeIcon();
    if (!parsed) return;
    musicStatus('');
    try {
      await loadYoutubeApi();
      if (revision !== musicRevision) return;
      const mount = document.createElement('div');
      elements.musicHost.appendChild(mount);
      const isPlaylist = parsed.kind === 'playlist';
      const playerVars = { controls: 1, playsinline: 1, rel: 0, loop: 1 };
      if (isPlaylist) { playerVars.listType = 'playlist'; playerVars.list = parsed.id; } else playerVars.playlist = parsed.id;
      if (location.protocol !== 'file:') playerVars.origin = location.origin;
      musicPlayer = new window.YT.Player(mount, {
        width: 280,
        height: 200,
        ...(isPlaylist ? {} : { videoId: parsed.id }),
        playerVars,
        events: {
          onReady: event => {
            if (revision !== musicRevision) return;
            musicPlayer = event.target;
            musicReady = true;
            setMusicEnabled(true);
            musicPlayer.setVolume(settings.musicVolume);
            const iframe = musicPlayer.getIframe();
            iframe.title = 'YouTube - Música da sala de espera';
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            musicStatus('');
            updateMusicTitle();
            if (musicRequested) playMusic();
          },
          onStateChange: event => {
            if (revision !== musicRevision) return;
            if (event.data === 1) { musicSkips = 0; musicStatus('', true); updateMusicTitle(); }
            else if (event.data === 5) { musicStatus(''); updateMusicTitle(); }
            else if (event.data === 2 || event.data === 0) musicStatus('');
            else if (event.data === 3) musicStatus('');
          },
          onAutoplayBlocked: () => {
            if (revision === musicRevision) musicStatus('Clique em tocar para iniciar a música.');
          },
          onError: event => {
            if (revision !== musicRevision) return;
            if (isPlaylist && [100, 101, 150].includes(event.data)) {
              musicSkips += 1;
              const total = (musicPlayer.getPlaylist() || []).length || 100;
              if (musicSkips <= total) { musicPlayer.nextVideo(); return; }
              musicRequested = false;
              setMusicEnabled(false);
              musicStatus('Nenhum vídeo desta playlist pode ser tocado aqui. Escolha outra.');
              return;
            }
            musicRequested = false;
            setMusicEnabled(false);
            musicStatus(youtubeErrorMessage(event.data));
          },
        },
      });
    } catch {
      if (revision !== musicRevision) return;
      setMusicEnabled(true);
      musicStatus('YouTube indisponível. Clique em tocar para tentar novamente.');
    }
  }

  function renderClock() {
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    if (remainingSeconds === lastDisplayedSecond) return;
    lastDisplayedSecond = remainingSeconds;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    elements.minutes.textContent = String(minutes).padStart(2, '0');
    elements.seconds.textContent = String(seconds).padStart(2, '0');
    elements.clock.classList.toggle('long-duration', minutes >= 100);
    elements.clock.setAttribute('aria-label', `${minutes} minutos e ${seconds} segundos`);
    elements.progress.setAttribute('aria-valuenow', String(remainingSeconds));
    elements.fill.style.transform = `scaleX(${remainingSeconds / settings.duration})`;
    if (state === 'running' && [60, 30, 10].includes(remainingSeconds)) {
      announce(`Faltam ${remainingSeconds} segundos.`);
    }
  }

  function renderState() {
    document.body.dataset.state = state;
    document.body.classList.toggle('no-animation', !settings.animation);
    document.body.dataset.theme = settings.theme;
    document.querySelector('meta[name="theme-color"]').content = themes[settings.theme].color;
    elements.event.textContent = eventName();
    elements.message.textContent = state === 'finished' ? settings.endMessage : settings.message;
    elements.detail.textContent = state === 'finished' ? '' : settings.detail;
    elements.detail.hidden = !elements.detail.textContent;
    const statuses = { ready: 'SALA DE ESPERA', running: 'COMEÇAMOS EM BREVE', paused: 'CONTAGEM PAUSADA', finished: 'VAMOS COMEÇAR' };
    const labels = { ready: 'Iniciar', running: 'Pausar', paused: 'Continuar', finished: 'Recomeçar' };
    elements.status.textContent = statuses[state];
    elements.startLabel.textContent = labels[state];
    elements.label.textContent = state === 'finished' ? 'TUDO PRONTO' : state === 'paused' ? 'UMA BREVE PAUSA' : 'COMEÇAMOS EM';
    setIcon(elements.start, state === 'running' ? 'pause' : state === 'finished' ? 'rotate-ccw' : 'play');
    elements.progress.setAttribute('aria-valuemax', String(settings.duration));
    document.title = `${eventName()} | Contagem regressiva`;
    renderClock();
  }

  function clearTimer() {
    if (interval !== null) clearInterval(interval);
    interval = null;
  }

  function prepareAudio() {
    if (!settings.sound) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioContext) audioContext = new AudioContextClass();
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    } catch {
      audioContext = null;
    }
  }

  function playFinishSound() {
    if (!settings.sound || !audioContext || audioContext.state !== 'running') return;
    try {
      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const startAt = audioContext.currentTime + index * 0.18;
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gain.gain.setValueAtTime(0, startAt);
        gain.gain.linearRampToValueAtTime(0.1, startAt + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.6);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + 0.65);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    } catch {
      announce(settings.endMessage);
    }
  }

  function tick() {
    if (state !== 'running') return;
    remainingMs = Math.max(0, deadline - Date.now());
    if (remainingMs === 0) {
      clearTimer();
      state = 'finished';
      pauseMusic();
      renderState();
      announce(settings.endMessage);
      playFinishSound();
      return;
    }
    renderClock();
  }

  function reset() {
    clearTimer();
    state = 'ready';
    remainingMs = settings.duration * 1000;
    lastDisplayedSecond = -1;
    renderState();
  }

  function toggleCountdown() {
    if (state === 'running') {
      tick();
      if (state === 'finished') return;
      clearTimer();
      state = 'paused';
      renderState();
      announce('Contagem pausada.');
      return;
    }
    if (state === 'finished') reset();
    prepareAudio();
    playMusic();
    deadline = Date.now() + remainingMs;
    state = 'running';
    interval = setInterval(tick, 100);
    renderState();
    announce('Contagem iniciada.');
  }

  function syncPresets() {
    const duration = Number(elements.durationMinutes.value) * 60 + Number(elements.durationSeconds.value);
    elements.form.querySelectorAll('input[name="preset"]').forEach(input => { input.checked = Number(input.value) === duration; });
    elements.error.hidden = true;
  }

  function openSettings() {
    elements.durationMinutes.value = Math.floor(settings.duration / 60);
    elements.durationSeconds.value = settings.duration % 60;
    elements.eventInput.value = settings.event;
    elements.messageInput.value = settings.message;
    elements.detailInput.value = settings.detail;
    elements.endInput.value = settings.endMessage;
    elements.animationInput.checked = settings.animation;
    elements.soundInput.checked = settings.sound;
    elements.youtubeInput.value = settings.youtubeUrl;
    elements.volumeInput.value = settings.musicVolume;
    elements.volumeValue.value = `${settings.musicVolume}%`;
    pendingLogos = { main: settings.logoMain, footer: settings.logoFooter };
    pendingTemplateCustom = settings.templateCustom;
    renderTemplatePreview();
    elements.form.elements.template.value = settings.template;
    elements.form.elements.theme.value = settings.theme;
    renderLogoPreviews();
    syncPresets();
    checkYoutube();
    elements.dialog.showModal();
  }

  elements.form.addEventListener('submit', event => {
    event.preventDefault();
    if (!elements.form.reportValidity()) return;
    const duration = Number(elements.durationMinutes.value) * 60 + Number(elements.durationSeconds.value);
    const eventName = elements.eventInput.value.trim();
    const message = elements.messageInput.value.trim();
    const endMessage = elements.endInput.value.trim();
    const youtubeUrl = elements.youtubeInput.value.trim();
    if (youtubeUrl && !parseYoutube(youtubeUrl)) {
      elements.error.textContent = 'Informe um link válido de vídeo ou playlist do YouTube, ou deixe o campo vazio para ficar sem música.';
      elements.error.hidden = false;
      elements.youtubeInput.focus();
      return;
    }
    if (!Number.isInteger(duration) || duration < 1 || duration > 10859 || !eventName || !message || !endMessage) {
      elements.error.textContent = 'Defina um tempo maior que zero e preencha as mensagens e o nome do encontro.';
      elements.error.hidden = false;
      return;
    }
    const previousMusic = parseYoutube(settings.youtubeUrl);
    settings = {
      duration,
      event: eventName,
      message,
      detail: elements.detailInput.value.trim(),
      endMessage,
      animation: elements.animationInput.checked,
      sound: elements.soundInput.checked,
      youtubeUrl,
      musicVolume: Number(elements.volumeInput.value),
      logoMain: pendingLogos.main,
      logoFooter: pendingLogos.footer,
      theme: elements.form.elements.theme.value,
      template: elements.form.elements.template.value,
      templateCustom: pendingTemplateCustom,
    };
    try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { announce('Não foi possível salvar as configurações neste navegador.'); }
    renderLogos();
    renderTemplate();
    reset();
    const nextMusic = parseYoutube(youtubeUrl);
    const sameMusic = Boolean(previousMusic && nextMusic && previousMusic.kind === nextMusic.kind && previousMusic.id === nextMusic.id);
    if (sameMusic && musicReady) applyMusicVolume();
    else configureMusic(Boolean(youtubeUrl));
    elements.dialog.close();
    announce('Configurações aplicadas.');
  });

  elements.form.querySelectorAll('input[name="preset"]').forEach(input => {
    input.addEventListener('change', () => {
      const duration = Number(input.value);
      elements.durationMinutes.value = Math.floor(duration / 60);
      elements.durationSeconds.value = duration % 60;
      elements.error.hidden = true;
    });
  });
  elements.form.querySelectorAll('input[name="theme"]').forEach(input => input.addEventListener('change', renderLogoPreviews));
  elements.durationMinutes.addEventListener('input', syncPresets);
  elements.durationSeconds.addEventListener('input', syncPresets);
  elements.youtubeInput.addEventListener('input', () => {
    elements.error.hidden = true;
    clearTimeout(checkTimer);
    checkTimer = setTimeout(checkYoutube, 500);
  });
  elements.volumeInput.addEventListener('input', () => { elements.volumeValue.value = `${elements.volumeInput.value}%`; });
  elements.musicButton.addEventListener('click', () => {
    if (musicPlaying) pauseMusic();
    else if (musicReady) playMusic();
    else configureMusic(true);
  });
  elements.musicPrev.addEventListener('click', () => skipMusic('previous'));
  elements.musicNext.addEventListener('click', () => skipMusic('next'));
  elements.musicMute.addEventListener('click', () => {
    musicMuted = !musicMuted;
    if (musicReady) {
      if (musicMuted) musicPlayer.mute();
      else if (settings.musicVolume > 0) musicPlayer.unMute();
    }
    updateVolumeIcon();
  });
  elements.musicVolume.addEventListener('input', () => {
    settings.musicVolume = Number(elements.musicVolume.value);
    if (settings.musicVolume > 0) musicMuted = false;
    if (musicReady) {
      musicPlayer.setVolume(settings.musicVolume);
      if (settings.musicVolume > 0) musicPlayer.unMute();
    }
    updateVolumeIcon();
    try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch {}
  });
  elements.start.addEventListener('click', toggleCountdown);
  elements.reset.addEventListener('click', () => { reset(); announce('Contagem reiniciada.'); });
  elements.settings.addEventListener('click', openSettings);
  document.getElementById('close-settings').addEventListener('click', () => elements.dialog.close());
  document.getElementById('cancel-settings').addEventListener('click', () => elements.dialog.close());
  elements.dialog.addEventListener('click', event => {
    if (event.target !== elements.dialog) return;
    const bounds = elements.dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) elements.dialog.close();
  });
  elements.fullscreen.hidden = !document.fullscreenEnabled;
  elements.fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      announce('O navegador não permitiu entrar em tela cheia.');
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const active = Boolean(document.fullscreenElement);
    elements.fullscreen.setAttribute('aria-label', active ? 'Sair da tela cheia' : 'Entrar em tela cheia');
    elements.fullscreen.dataset.tooltip = active ? 'Sair da tela cheia' : 'Tela cheia';
    setIcon(elements.fullscreen, active ? 'minimize' : 'maximize');
  });
  document.addEventListener('visibilitychange', tick);
  window.addEventListener('pageshow', tick);
  renderIcons();
  renderLogos();
  buildTemplateOptions();
  renderTemplate();
  elements.templateInput.addEventListener('change', async () => {
    const file = elements.templateInput.files[0];
    elements.templateInput.value = '';
    if (!file) return;
    try {
      pendingTemplateCustom = await readTemplate(file);
      renderTemplatePreview();
      elements.form.elements.template.value = 'custom';
      elements.error.hidden = true;
    } catch (error) {
      elements.error.textContent = error.message;
      elements.error.hidden = false;
    }
  });
  bindLogoPicker('main', elements.logoMainInput, elements.logoMainReset);
  bindLogoPicker('footer', elements.logoFooterInput, elements.logoFooterReset);
  renderState();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitMusicTitle).observe(elements.musicTitle);
  configureMusic();
})();