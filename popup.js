// Popup script: always relays through background, so content.js is injected if needed

document.getElementById("submitBtn").addEventListener("click", submitMinutes);
document.getElementById("closeBtn").addEventListener("click", Close);

function changeMinutes(delta) {
  const input = document.getElementById('minuteInput');
  let value = parseInt(input.value) || 0;
  value += delta;
  if (value < 0) value = 0;
  if (value > 60) value = 60;
  input.value = value;
}

function submitMinutes() {
  const value = document.getElementById('minuteInput').value;
  // Query active tab and relay message through background script
  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    if (tabs.length > 0) {
      browser.runtime.sendMessage({
        from: "popup",
        tabId: tabs[0].id,
        payload: { type: "START_TIMER", minutes: value }
      });
    }
    window.close();
  });
}

function Close() {
  window.close();
}