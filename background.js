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

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_TRIVIA") {
    const url = `https://opentdb.com/api.php?amount=3&category=${message.categoryId}&&type=multiple`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        sendResponse({ success: true, data });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });

    return true; // Required to use async sendResponse
  }
});
