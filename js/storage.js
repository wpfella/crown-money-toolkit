/**
 * Crown Money Storage Layer
 * Wraps chrome.storage.local with Promise API and fallback to localStorage
 */
const CrownStorage = (() => {
  const PREFIX = 'crown_';
  const useChrome = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

  async function get(key) {
    const fullKey = PREFIX + key;
    if (useChrome) {
      return new Promise(resolve => {
        chrome.storage.local.get(fullKey, result => {
          resolve(result[fullKey] !== undefined ? result[fullKey] : null);
        });
      });
    }
    const val = localStorage.getItem(fullKey);
    return val ? JSON.parse(val) : null;
  }

  async function set(key, value) {
    const fullKey = PREFIX + key;
    if (useChrome) {
      return new Promise(resolve => {
        chrome.storage.local.set({ [fullKey]: value }, resolve);
      });
    }
    localStorage.setItem(fullKey, JSON.stringify(value));
  }

  async function remove(key) {
    const fullKey = PREFIX + key;
    if (useChrome) {
      return new Promise(resolve => {
        chrome.storage.local.remove(fullKey, resolve);
      });
    }
    localStorage.removeItem(fullKey);
  }

  async function getAll() {
    if (useChrome) {
      return new Promise(resolve => {
        chrome.storage.local.get(null, result => {
          const filtered = {};
          for (const [k, v] of Object.entries(result)) {
            if (k.startsWith(PREFIX)) {
              filtered[k.slice(PREFIX.length)] = v;
            }
          }
          resolve(filtered);
        });
      });
    }
    const filtered = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(PREFIX)) {
        filtered[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k));
      }
    }
    return filtered;
  }

  async function clearAll() {
    if (useChrome) {
      const all = await getAll();
      const keys = Object.keys(all).map(k => PREFIX + k);
      return new Promise(resolve => {
        chrome.storage.local.remove(keys, resolve);
      });
    }
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(PREFIX)) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  }

  return { get, set, remove, getAll, clearAll };
})();
