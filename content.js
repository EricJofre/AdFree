(() => {
  const STYLE_ID = 'adfree-injected-css';
  const HOST = location.hostname;

  const BASE_SELECTORS = [
    '[id*="-ad-"]',
    '[class*="-ad-"]',
    '[class*="ad-banner"]',
    '[id*="adBanner"]',
    '[class*="adsbygoogle"]',
    'ins.adsbygoogle',
    '[class*="advertisement"]',
    '[id*="advertisement"]'
  ];

  const YT_SELECTORS = [
    '.ytp-ad-module',
    '.ytp-ad-overlay-container',
    '.ytp-ad-text-overlay',
    '.ytp-ad-skip-button',
    '.ytp-skip-ad-button',
    '.ytp-ad-skip-button-modern',
    '.ytp-ad-preview-container',
    'ytd-ad-slot-renderer',
    'ytd-in-feed-ad-layout-renderer',
    'ytd-promoted-sparkles-web-renderer',
    'ytd-display-ad-renderer',
    'ytd-engagement-panel-section-list-renderer:has(.ytd-ads-engagement-panel-content-renderer)',
    'ytd-consent-bump-v2-lightbox',
    'tp-yt-paper-dialog[aria-labelledby="consent-title"]',
    '#consent-bump'
  ];

  const COOKIE_SELECTORS = [
    '#onetrust-consent-sdk',
    '#onetrust-banner-sdk',
    '.cookie-notice',
    '.cookie-banner',
    '.cookie-consent',
    '.cc-window',
    '.cc-banner',
    '#CybotCookiebotDialog',
    '#CybotCookiebotDialogBody',
    '.gdpr-banner',
    '.gdpr-consent',
    '.consent-banner',
    '#cookie-law-info-bar',
    '.cookie-law-info-bar',
    '.dp--cookie-box',
    '#CookieConsent',
    '#cookieconsent',
    '.CookieConsent',
    '.orejime',
    '.orejime--Notice',
    '#klaro',
    '.klaro',
    '.gDprCookieBanner',
    '#adroll-cookie-consent'
  ];

  const POPUP_SELECTORS = [
    '.modal-backdrop',
    '.modal-backdrop.show',
    '.site-notice',
    '.newsletter-signup',
    '.newsletter-popup',
    '.signup-form',
    '.register-form',
    '.login-prompt',
    '[class*="newsletter"]',
    '[class*="subscribe"]',
    '[id*="newsletter"]',
    '[id*="subscribe"]',
    '.float-video',
    '.floating-player',
    '.mini-player',
    '.floating-video',
    '[class*="sticky-player"]',
    '[class*="floating-player"]',
    '[class*="miniplayer"]',
    '.overlay',
    '.modal-popup',
    '.exit-intent',
    '[class*="exit-intent"]',
    '[class*="gdpr-popup"]',
    '[class*="cookie-popup"]'
  ];

  const SIGNUP_SELECTORS = [
    '.paywall',
    '.registration-wall',
    '.login-wall',
    '.subscribe-wall',
    '[class*="paywall"]',
    '[class*="register-wall"]'
  ];

  let observer;
  let urlObserver;
  let lastUrl = location.href;

  let adActive = false;
  let previousPlaybackRate = 1;
  let previousMuted = false;

  function injectCSS(css) {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = css;
  }

  function buildCSS(settings, customCosmetic) {
    const parts = [];
    if (settings.enabled === false) return '';

    parts.push(`${BASE_SELECTORS.join(',')} { display: none !important; visibility: hidden !important; }`);

    if (settings.features?.youtube && isYouTube()) {
      parts.push(`${YT_SELECTORS.join(',')} { display: none !important; }`);
    }
    if (settings.features?.cookies) {
      parts.push(`${COOKIE_SELECTORS.join(',')} { display: none !important; }`);
    }
    if (settings.features?.popups) {
      parts.push(`${POPUP_SELECTORS.join(',')} { display: none !important; }`);
    }
    if (settings.features?.signup) {
      parts.push(`${SIGNUP_SELECTORS.join(',')} { display: none !important; }`);
    }

    for (const line of customCosmetic || []) {
      if (line.includes('##')) {
        const selector = line.split('##')[1];
        if (selector) {
          parts.push(`${selector} { display: none !important; }`);
        }
      }
    }

    return parts.join('\n');
  }

  function isYouTube() {
    return HOST === 'www.youtube.com' ||
           HOST === 'youtube.com' ||
           HOST === 'm.youtube.com' ||
           HOST === 'music.youtube.com' ||
           HOST === 'www.youtube-nocookie.com' ||
           HOST === 'youtube-nocookie.com';
  }

  function handleYouTubeAds() {
    const skipBtn = document.querySelector('.ytp-skip-ad-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
    if (skipBtn) {
      skipBtn.click();
    }

    const player = document.querySelector('.html5-video-player');
    const playerAd = player?.classList.contains('ad-showing') || player?.classList.contains('ad-interrupting');
    const adModule = document.querySelector('.ytp-ad-module');
    const hasAdOverlay = adModule && adModule.childElementCount > 0;
    const adSignal = document.querySelector('.ytp-ad-text, .ytp-ad-duration-remaining, .ytp-ad-preview-container, .ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-ad-overlay-container, .ytp-ad-text-overlay');
    const video = document.querySelector('video');
    const isAd = Boolean(video && (playerAd || hasAdOverlay || adSignal));

    if (isAd && !adActive) {
      adActive = true;
      if (video) {
        previousPlaybackRate = video.playbackRate;
        previousMuted = video.muted;
        video.muted = true;
        try { video.playbackRate = 16; } catch (e) {}
      }
    } else if (!isAd && adActive) {
      adActive = false;
      if (video) {
        try { video.playbackRate = previousPlaybackRate; } catch (e) {}
        video.muted = previousMuted;
      }
    }

    document.querySelectorAll('.ytp-ad-module, .ytp-ad-overlay-container, .ytp-ad-text-overlay').forEach(o => {
      o.style.display = 'none';
    });
  }

  function startYouTubeObserver() {
    if (observer) observer.disconnect();
    const target = document.body || document.documentElement;
    observer = new MutationObserver(() => handleYouTubeAds());
    observer.observe(target, { childList: true, subtree: true });
    handleYouTubeAds();
  }

  function stopYouTubeObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    const video = document.querySelector('video');
    if (adActive && video) {
      adActive = false;
      try { video.playbackRate = previousPlaybackRate; } catch (e) {}
      video.muted = previousMuted;
    }
  }

  async function apply() {
    const { enabled = true, features = {}, customFilters = {} } = await chrome.storage.local.get(['enabled', 'features', 'customFilters']);
    const settings = { enabled, features };
    const css = buildCSS(settings, customFilters.cosmetic || []);
    injectCSS(css);

    if (enabled && features.youtube && isYouTube()) {
      startYouTubeObserver();
    } else {
      stopYouTubeObserver();
    }
  }

  function watchUrlChanges() {
    if (urlObserver) return;
    urlObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        apply();
      }
    });
    urlObserver.observe(document, { subtree: true, childList: true });
  }

  apply();
  watchUrlChanges();

  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'refresh') {
      apply();
    }
  });
})();
