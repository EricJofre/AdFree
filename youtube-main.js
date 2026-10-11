(() => {
  'use strict';

  const cleanPlayerResponse = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const adKeys = [
      'adPlacements', 'playerAds', 'adBreaks', 'adSlots', 'adCuePoints',
      'adSignalsInfo', 'adServingData', 'adsContext', 'adState', 'adTagUri', 'adSafetyFlags'
    ];
    for (const key of adKeys) {
      if (key in obj) {
        if (Array.isArray(obj[key])) obj[key] = [];
        else if (typeof obj[key] === 'object' && obj[key] !== null) obj[key] = {};
        else obj[key] = null;
      }
    }

    if (obj.playerConfig && obj.playerConfig.audioAdsConfig) {
      obj.playerConfig.audioAdsConfig = {};
    }

    return obj;
  };

  // Intercepta la respuesta inicial del reproductor
  let ytInitialPlayerResponse = undefined;
  Object.defineProperty(window, 'ytInitialPlayerResponse', {
    get: () => ytInitialPlayerResponse,
    set: (v) => { ytInitialPlayerResponse = cleanPlayerResponse(v); },
    configurable: true
  });

  // Intercepta JSON.parse para limpiar respuestas de la API de YouTube
  const originalJSONParse = JSON.parse;
  JSON.parse = function(...args) {
    const result = originalJSONParse.apply(this, args);
    if (result && typeof result === 'object' && (result.playerAds !== undefined || result.adPlacements !== undefined)) {
      cleanPlayerResponse(result);
    }
    return result;
  };

  // Intercepta fetch para limpiar la respuesta de /youtubei/v1/player
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    const url = args[0];
    if (typeof url !== 'string' ||
        (!url.includes('/youtubei/v1/player') &&
         !url.includes('/youtubei/v1/next') &&
         !url.includes('/get_video_info'))) {
      return response;
    }

    try {
      const text = await response.text();
      const data = originalJSONParse(text);
      if (data && typeof data === 'object') {
        cleanPlayerResponse(data);
      }
      return new Response(JSON.stringify(data), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    } catch (e) {
      return response;
    }
  };

  // Fallback en vivo: silenciar y acelerar cualquier anuncio que logre iniciar
  let adActive = false;
  let prevMuted = false;
  let prevRate = 1;

  const skipLiveAd = () => {
    const player = document.querySelector('.html5-video-player');
    const video = document.querySelector('video');
    if (!player || !video) return;

    const isAd = player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting');
    if (isAd) {
      if (!adActive) {
        adActive = true;
        prevMuted = video.muted;
        prevRate = video.playbackRate;
      }
      video.muted = true;
      try { video.playbackRate = 16; } catch (e) {}
      const skipBtn = document.querySelector('.ytp-skip-ad-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
      if (skipBtn) skipBtn.click();
    } else if (adActive) {
      adActive = false;
      video.muted = prevMuted;
      try { video.playbackRate = prevRate; } catch (e) {}
    }
  };

  const mo = new MutationObserver(skipLiveAd);
  mo.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  setInterval(skipLiveAd, 100);
})();
