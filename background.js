// This script acts as a relay between popup and content script, and ensures content.js is injected before messaging.

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Only handle messages relayed from the popup
  if (msg.from === "popup" && msg.tabId && msg.payload) {
    // Inject content.js if not already injected
    browser.tabs.executeScript(msg.tabId, { file: "content.js" }).then(() => {
      // Relay the payload to the content script
      browser.tabs.sendMessage(msg.tabId, msg.payload).then(sendResponse);
    });
    return true; // Indicates async response
  }
});