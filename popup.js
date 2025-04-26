const button = document.getElementById('toggle');
const counterElement = document.getElementById('counter');

function updateButton(isRunning) {
  if (isRunning) {
    button.textContent = "Deaktivieren";
    button.style.backgroundColor = "#b91d1d"; // Rot
  } else {
    button.textContent = "Aktivieren";
    button.style.backgroundColor = "#1DB954"; // Grün
  }
}

function updateCounter() {
  chrome.storage.local.get("likeCounter", (data) => {
    counterElement.textContent = "Gelikte Songs: " + (data.likeCounter || 0);
  });
}

button.addEventListener('click', () => {
    chrome.storage.local.get("isRunning", (data) => {
      const running = data.isRunning || false;
      const newRunningState = !running;
  
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.runtime.sendMessage({action: newRunningState ? "start" : "stop", tabId: tabs[0].id})
            .catch(error => console.log('Fehler beim Senden der Nachricht:', error));
        }
      });
  
      chrome.storage.local.set({ isRunning: newRunningState }, () => {
        updateButton(newRunningState);
      });
    });
  });
  

// Beim Laden direkt Status + Counter abrufen
chrome.storage.local.get(["isRunning", "likeCounter"], (data) => {
  updateButton(data.isRunning || false);
  updateCounter();
});

// Counter regelmäßig aktualisieren
setInterval(updateCounter, 2000);
