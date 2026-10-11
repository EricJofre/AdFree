document.addEventListener('DOMContentLoaded', async () => {
  const { features = {}, customFilters = {} } = await chrome.storage.local.get(['features', 'customFilters']);

  document.getElementById('yt-toggle').checked = features.youtube !== false;
  document.getElementById('cookie-toggle').checked = features.cookies !== false;
  document.getElementById('popup-toggle').checked = features.popups !== false;

  document.getElementById('network-filters').value = (customFilters.network || []).join('\n');
  document.getElementById('cosmetic-filters').value = (customFilters.cosmetic || []).join('\n');

  document.getElementById('save-btn').addEventListener('click', async () => {
    const features = {
      youtube: document.getElementById('yt-toggle').checked,
      cookies: document.getElementById('cookie-toggle').checked,
      popups: document.getElementById('popup-toggle').checked,
      signup: document.getElementById('popup-toggle').checked
    };
    const network = document.getElementById('network-filters').value.split('\n').map(s => s.trim()).filter(Boolean);
    const cosmetic = document.getElementById('cosmetic-filters').value.split('\n').map(s => s.trim()).filter(Boolean);

    try {
      await chrome.runtime.sendMessage({
        action: 'saveCustomRules',
        network,
        cosmetic,
        features
      });
      showStatus('Guardado correctamente', true);
    } catch (e) {
      showStatus('Error: ' + e.message, false);
    }
  });
});

function showStatus(text, ok) {
  const el = document.getElementById('status');
  el.textContent = text;
  el.style.color = ok ? '#00c853' : '#e63022';
  setTimeout(() => { el.textContent = ''; }, 2500);
}
