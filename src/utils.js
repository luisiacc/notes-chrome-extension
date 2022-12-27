const KEY = 'notetaking.billing.key.code.localstorage';

export function syncWithStorage(items) {
  chrome.storage.local.set({ [KEY]: items });
}

export const debouncedSyncWithStorage = debounce(syncWithStorage, 5000);

export function getFromStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([KEY], function (result) {
      if (result[KEY] !== undefined) {
        resolve(result[KEY] ?? []);
      } else {
        resolve([]);
      }
    });
  });
}

function debounce(func, wait) {
  let timeout;

  return function () {
    const context = this;
    const args = arguments;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

function uuid() {
  return window.crypto.randomUUID();
}

export function emptyItem() {
  return {
    id: uuid(),
    title: 'New note',
    content: '',
  };
}
