document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const countEl = document.getElementById('blocked-count');
  const toggle = document.getElementById('master-toggle');

  try {
    const text = await chrome.action.getBadgeText({ tabId: tab.id });
    countEl.textContent = text || '0';
  } catch {
    countEl.textContent = '?';
  }

  try {
    const { enabled } = await chrome.runtime.sendMessage({ action: 'getEnabled' });
    toggle.checked = enabled !== false;
  } catch {
    toggle.checked = true;
  }

  toggle.addEventListener('change', async () => {
    try {
      await chrome.runtime.sendMessage({ action: 'setEnabled', enabled: toggle.checked });
      if (!toggle.checked) {
        await chrome.action.setBadgeText({ tabId: tab.id, text: '' });
      }
    } catch (e) {
      console.error(e);
    }
  });

  document.getElementById('options-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
