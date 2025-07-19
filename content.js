// Avoid redeclaration errors when injected multiple times.
if (typeof window.scrollTimer === "undefined") {
  window.scrollTimer = null;
}
if (typeof window.CONFIG_URL === "undefined") {
  window.CONFIG_URL = browser.runtime.getURL("platformScrollConfig.json");
}

browser.runtime.onMessage.addListener((msg) => {
  console.log("[onMessage] Received message:", msg);
  if (msg.type === "START_TIMER") {
    startScrollTimer(msg.minutes);
  }
  if (msg.type === "UNLOCK_SCROLL") {
    clearScrollTimer();
    unlockScroll();
  }
  if (msg.type === "LOCK_SCROLL_NOW") {
    clearScrollTimer();
    lockScroll();
  }
});

// --- Fire video logic ---

function ensureFire() {
  let fire = document.getElementById('scrollFire');
  if (fire) return fire;

  fire = document.createElement('video');
  fire.src = browser.runtime.getURL('assets/Fire.webm');
  fire.autoplay = true;
  fire.loop = true;
  fire.muted = true;
  fire.playsInline = true;
  fire.id = 'scrollFire';

  Object.assign(fire.style, {
    position: 'fixed',
    right: '5px',
    width: '32px',
    height: '32px',
    zIndex: '9999',
    pointerEvents: 'none',
    objectFit: 'contain'
  });

  document.body.appendChild(fire);
  return fire;
}

function removeFire() {
  const fire = document.getElementById('scrollFire');
  if (fire && fire.parentNode) {
    fire.parentNode.removeChild(fire);
  }
}

function updateFirePosition() {
  const fire = document.getElementById('scrollFire');
  if (!fire) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;
  const scrollable = docHeight - winHeight;
  const trackHeight = winHeight - fire.offsetHeight;
  const scrollRatio = scrollable > 0 ? scrollTop / scrollable : 0;
  const fireTop = scrollRatio * trackHeight;
  fire.style.top = `${fireTop}px`;
}

if (!window._fireScrollListenerAdded) {
  window.addEventListener('scroll', updateFirePosition);
  window._fireScrollListenerAdded = true;
}

// --- Core Scroll Control Logic ---

function getSiteKey(host) {
  const key = host
    .replace(/^www\./, "")
    .replace(/\.(com|net|org|co|io|in|gov|edu|uk|info)$/, "")
    .toLowerCase();
  console.log("[getSiteKey] Host:", host, "=> SiteKey:", key);
  return key;
}

function getScrollConfig(callback) {
  const host = window.location.hostname;
  const siteKey = getSiteKey(host);
  console.log("[getScrollConfig] Fetching config for SiteKey:", siteKey);
  fetch(window.CONFIG_URL)
    .then((res) => {
      console.log("[getScrollConfig] Config file fetched:", res);
      return res.json();
    })
    .then((config) => {
      console.log("[getScrollConfig] Parsed config:", config);
      callback(config[siteKey] || null);
    })
    .catch((err) => {
      console.error("[getScrollConfig] Error fetching config:", err);
      callback(null);
    });
}

// --- Unlock Card Overlay Logic (fetch HTML) ---
function injectUnlockCardOverlay() {
  if (document.getElementById('ext-unlock-overlay')) return;

  fetch(browser.runtime.getURL('unlock-card.html'))
    .then(res => res.text())
    .then(html => {
      const overlay = document.createElement('div');
      overlay.id = 'ext-unlock-overlay';
      Object.assign(overlay.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647,
        pointerEvents: 'auto'
      });
      overlay.innerHTML = html;
      document.body.appendChild(overlay);

      // Inject CSS if not already present
      if (!document.getElementById('ext-unlock-css')) {
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = browser.runtime.getURL('unlock-card.css');
        style.id = 'ext-unlock-css';
        document.head.appendChild(style);
      }

      // Inject JS if not already present
      if (!document.getElementById('ext-unlock-js')) {
        const script = document.createElement('script');
        script.src = browser.runtime.getURL('unlock-card.js');
        script.id = 'ext-unlock-js';
        document.body.appendChild(script);
      }

      // Fallback unlock button logic in case unlock-card.js is not loaded yet:
      const unlockBtn = overlay.querySelector('#unlockBtn');
      if (unlockBtn) {
        unlockBtn.addEventListener('click', function() {
          overlay.remove();
          unlockScroll(); // Optionally unlock scroll here
        });
      }
    });
}

// Modify lockScroll to show unlock card after fire
function lockScroll() {
  console.log("[lockScroll] Attempting to lock scroll...");
  getScrollConfig((config) => {
    if (config) {
      const els = document.getElementsByTagName(config.scrollContainer);
      console.log("[lockScroll] Elements found:", els);

      ensureFire();
      updateFirePosition();

      if (els && els.length > 0) {
        els[0].style.cssText = config.lockStyle;
        console.log(
          "[lockScroll] Scroll locked with style:",
          config.lockStyle,
          "on element:",
          els[0]
        );
        // Wait before removing fire and showing unlock card
        setTimeout(() => {
          removeFire();
          injectUnlockCardOverlay();
        }, 1000);
      } else {
        console.warn(
          "[lockScroll] No elements found for tag:",
          config.scrollContainer
        );
      }
    } else {
      console.warn("[lockScroll] No config found for this site.");
    }
  });
}

function unlockScroll() {
  console.log("[unlockScroll] Attempting to unlock scroll...");
  getScrollConfig((config) => {
    if (config) {
      const els = document.getElementsByTagName(config.scrollContainer);
      console.log("[unlockScroll] Elements found:", els);
      if (els && els.length > 0) {
        els[0].style.cssText = config.unlockStyle;
        console.log(
          "[unlockScroll] Scroll unlocked with style:",
          config.unlockStyle,
          "on element:",
          els[0]
        );
       
      } else {
        console.warn(
          "[unlockScroll] No elements found for tag:",
          config.scrollContainer
        );
      }
    } else {
      console.warn("[unlockScroll] No config found for this site.");
    }
  });
}

function startScrollTimer(minutes) {
  console.log("[startScrollTimer] Starting timer for", minutes, "minutes.");
  if (window.scrollTimer) {
    clearTimeout(window.scrollTimer);
    console.log("[startScrollTimer] Previous timer cleared.");
  }
  window.scrollTimer = setTimeout(() => {
    console.log("[startScrollTimer] Timer expired, locking scroll.");
    lockScroll();
    window.scrollTimer = null;
  }, minutes * 60000);
}

function clearScrollTimer() {
  if (window.scrollTimer) {
    clearTimeout(window.scrollTimer);
    console.log("[clearScrollTimer] Timer cleared.");
    window.scrollTimer = null;
  }
}