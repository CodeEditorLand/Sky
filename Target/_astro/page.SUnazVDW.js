function throttles (limit) {
	limit = limit || 1;
	var queue=[], wip=0;

	function toAdd(fn) {
		queue.push(fn) > 1 || run(); // initializes if 1st
	}

	function isDone() {
		wip--; // make room for next
		run();
	}

	function run() {
		if (wip < limit && queue.length > 0) {
			queue.shift()(); wip++; // is now WIP
		}
	}

	return [toAdd, isDone];
}

function shim(callback, options) {
  const timeout = options?.timeout ?? 50;
  const start = Date.now();
  return setTimeout(function() {
    callback({
      didTimeout: false,
      timeRemaining: function() {
        return Math.max(0, timeout - (Date.now() - start));
      }
    });
  }, 1);
}
const requestIdleCallback = window.requestIdleCallback || shim;
var requestIdleCallback_default = requestIdleCallback;

const events = ["mouseenter", "touchstart", "focus"];
const preloaded = /* @__PURE__ */ new Set();
const loadedStyles = /* @__PURE__ */ new Set();
function shouldPreload({ href }) {
  try {
    const url = new URL(href);
    return window.location.origin === url.origin && window.location.pathname !== url.pathname && !preloaded.has(href);
  } catch {
  }
  return false;
}
let parser;
let observer;
function observe(link) {
  preloaded.add(link.href);
  observer.observe(link);
  events.map((event) => link.addEventListener(event, onLinkEvent, { passive: true, once: true }));
}
function unobserve(link) {
  observer.unobserve(link);
  events.map((event) => link.removeEventListener(event, onLinkEvent));
}
function onLinkEvent({ target }) {
  if (!(target instanceof HTMLAnchorElement)) {
    return;
  }
  preloadHref(target);
}
async function preloadHref(link) {
  unobserve(link);
  const { href } = link;
  try {
    const contents = await fetch(href).then((res) => res.text());
    parser ||= new DOMParser();
    const html = parser.parseFromString(contents, "text/html");
    const styles = Array.from(html.querySelectorAll('link[rel="stylesheet"]'));
    await Promise.all(
      styles.filter((el) => !loadedStyles.has(el.href)).map((el) => {
        loadedStyles.add(el.href);
        return fetch(el.href);
      })
    );
  } catch {
  }
}
function prefetch({
  selector = 'a[href][rel~="prefetch"]',
  throttle = 1,
  intentSelector = 'a[href][rel~="prefetch-intent"]'
}) {
  if (!navigator.onLine) {
    return Promise.reject(new Error("Cannot prefetch, no network connection"));
  }
  if ("connection" in navigator) {
    const connection = navigator.connection;
    if (connection.saveData) {
      return Promise.reject(new Error("Cannot prefetch, Save-Data is enabled"));
    }
    if (/(2|3)g/.test(connection.effectiveType)) {
      return Promise.reject(new Error("Cannot prefetch, network conditions are poor"));
    }
  }
  const [toAdd, isDone] = throttles(throttle);
  observer = observer || new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target instanceof HTMLAnchorElement) {
        const relAttributeValue = entry.target.getAttribute("rel") || "";
        let matchesIntentSelector = false;
        if (Array.isArray(intentSelector)) {
          matchesIntentSelector = intentSelector.some(
            (intent) => relAttributeValue.includes(intent)
          );
        } else {
          matchesIntentSelector = relAttributeValue.includes(intentSelector);
        }
        if (!matchesIntentSelector) {
          toAdd(() => preloadHref(entry.target).finally(isDone));
        }
      }
    });
  });
  requestIdleCallback_default(() => {
    const links = [...document.querySelectorAll(selector)].filter(shouldPreload);
    links.forEach(observe);
    const intentSelectorFinal = Array.isArray(intentSelector) ? intentSelector.join(",") : intentSelector;
    const intentLinks = [
      ...document.querySelectorAll(intentSelectorFinal)
    ].filter(shouldPreload);
    intentLinks.forEach((link) => {
      events.map(
        (event) => link.addEventListener(event, onLinkEvent, { passive: true, once: true })
      );
    });
  });
}

prefetch({});
//# sourceMappingURL=page.SUnazVDW.js.map
