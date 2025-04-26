let isRunning = false;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "start") {
    if (!isRunning) {
      isRunning = true;

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            if (window.autoLikeInterval) {
              clearInterval(window.autoLikeInterval);
            }

            function tryAddToLikedSongs() {
              const addButton = document.querySelector('button[aria-label="Zu Lieblingssongs hinzufügen"]');
              
              if (addButton) {
                console.log('Song wird zu Lieblingssongs hinzugefügt...');
                addButton.click();
                chrome.runtime.sendMessage({ action: "incrementCounter" }).catch(() => {});
              } else {
                console.log('Song ist bereits in Lieblingssongs.');
              }
            }

            window.autoLikeInterval = setInterval(tryAddToLikedSongs, 3000);
          }
        });
      }
      sendResponse({ status: "started" });
    }
  } else if (message.action === "stop") {
    if (isRunning) {
      isRunning = false;

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            if (window.autoLikeInterval) {
              clearInterval(window.autoLikeInterval);
              window.autoLikeInterval = null;
              console.log('Auto-Hinzufügen gestoppt.');
            }
          }
        });
      }
      sendResponse({ status: "stopped" });
    }
  } else if (message.action === "incrementCounter") {
    chrome.storage.local.get("likeCounter", (data) => {
      const newCounter = (data.likeCounter || 0) + 1;
      chrome.storage.local.set({ likeCounter: newCounter });
    });
  }
});
