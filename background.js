const DEFAULT_SETTINGS = {
  enabled: true,
  features: {
    youtube: true,
    cookies: true,
    popups: true,
    signup: true
  },
  customFilters: {
    network: [],
    cosmetic: []
  }
};

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set(DEFAULT_SETTINGS);
  }

  try {
    await chrome.declarativeNetRequest.setExtensionActionOptions({
      displayActionCountAsBadgeText: true
    });
  } catch (e) {
    console.warn('Badge count not supported', e);
  }
});

async function setMasterEnabled(enabled) {
  const update = enabled
    ? { enableRulesetIds: ['ruleset_1'] }
    : { disableRulesetIds: ['ruleset_1'] };
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets(update);
  } catch (e) {
    console.error(e);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      if (request.action === 'setEnabled') {
        await chrome.storage.local.set({ enabled: request.enabled });
        await setMasterEnabled(request.enabled);
        sendResponse({ ok: true });
        return;
      }
      if (request.action === 'getEnabled') {
        const { enabled } = await chrome.storage.local.get('enabled');
        sendResponse({ enabled });
        return;
      }
      if (request.action === 'saveCustomRules') {
        await saveCustomNetworkRules(request.network);
        await chrome.storage.local.set({
          customFilters: { network: request.network, cosmetic: request.cosmetic },
          features: request.features
        });
        await notifyAllTabs();
        sendResponse({ ok: true });
        return;
      }
      if (request.action === 'getStats') {
        const text = await chrome.action.getBadgeText({ tabId: request.tabId });
        sendResponse({ count: parseInt(text || '0', 10) || 0 });
        return;
      }
      sendResponse({ ok: false, error: 'Unknown action' });
    } catch (e) {
      sendResponse({ ok: false, error: e.message });
    }
  })();
  return true;
});

chrome.storage.local.get('enabled').then(({ enabled }) => {
  if (typeof enabled === 'boolean') {
    setMasterEnabled(enabled);
  }
});

async function saveCustomNetworkRules(filters) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = existing.map(r => r.id);

  const addRules = [];
  let nextId = 10000;

  for (const raw of filters) {
    const line = raw.trim();
    if (!line || line.startsWith('!')) continue;

    let urlFilter = line;
    if (!urlFilter.includes('|') && !urlFilter.includes('?')) {
      urlFilter = `||${urlFilter}^`;
    }
    addRules.push({
      id: nextId++,
      priority: 2,
      action: { type: 'block' },
      condition: {
        urlFilter,
        resourceTypes: ['script', 'image', 'xmlhttprequest', 'sub_frame', 'media', 'font', 'other']
      }
    });
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules
  });
}

async function notifyAllTabs() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'refresh' });
    } catch (e) {
      // tab without content script, ignore
    }
  }
}
