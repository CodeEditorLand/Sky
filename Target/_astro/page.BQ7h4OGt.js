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
function prefetch$1({
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

const debug = console.debug ;
const prefetchedUrls = /* @__PURE__ */ new Set();
const listenedAnchors = /* @__PURE__ */ new WeakSet();
let prefetchAll = true;
let defaultStrategy = "hover";
let inited = false;
function init(defaultOpts) {
  if (inited) return;
  inited = true;
  debug?.(`[astro] Initializing prefetch script`);
  prefetchAll ??= false;
  defaultStrategy ??= "hover";
  initTapStrategy();
  initHoverStrategy();
  initViewportStrategy();
  initLoadStrategy();
}
function initTapStrategy() {
  for (const event of ["touchstart", "mousedown"]) {
    document.body.addEventListener(
      event,
      (e) => {
        if (elMatchesStrategy(e.target, "tap")) {
          prefetch(e.target.href, { ignoreSlowConnection: true });
        }
      },
      { passive: true }
    );
  }
}
function initHoverStrategy() {
  let timeout;
  document.body.addEventListener(
    "focusin",
    (e) => {
      if (elMatchesStrategy(e.target, "hover")) {
        handleHoverIn(e);
      }
    },
    { passive: true }
  );
  document.body.addEventListener("focusout", handleHoverOut, { passive: true });
  onPageLoad(() => {
    for (const anchor of document.getElementsByTagName("a")) {
      if (listenedAnchors.has(anchor)) continue;
      if (elMatchesStrategy(anchor, "hover")) {
        listenedAnchors.add(anchor);
        anchor.addEventListener("mouseenter", handleHoverIn, { passive: true });
        anchor.addEventListener("mouseleave", handleHoverOut, { passive: true });
      }
    }
  });
  function handleHoverIn(e) {
    const href = e.target.href;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      prefetch(href);
    }, 80);
  }
  function handleHoverOut() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = 0;
    }
  }
}
function initViewportStrategy() {
  let observer;
  onPageLoad(() => {
    for (const anchor of document.getElementsByTagName("a")) {
      if (listenedAnchors.has(anchor)) continue;
      if (elMatchesStrategy(anchor, "viewport")) {
        listenedAnchors.add(anchor);
        observer ??= createViewportIntersectionObserver();
        observer.observe(anchor);
      }
    }
  });
}
function createViewportIntersectionObserver() {
  const timeouts = /* @__PURE__ */ new WeakMap();
  return new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      const anchor = entry.target;
      const timeout = timeouts.get(anchor);
      if (entry.isIntersecting) {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeouts.set(
          anchor,
          setTimeout(() => {
            observer.unobserve(anchor);
            timeouts.delete(anchor);
            prefetch(anchor.href);
          }, 300)
        );
      } else {
        if (timeout) {
          clearTimeout(timeout);
          timeouts.delete(anchor);
        }
      }
    }
  });
}
function initLoadStrategy() {
  onPageLoad(() => {
    for (const anchor of document.getElementsByTagName("a")) {
      if (elMatchesStrategy(anchor, "load")) {
        prefetch(anchor.href);
      }
    }
  });
}
function prefetch(url, opts) {
  url = url.replace(/#.*/, "");
  const ignoreSlowConnection = opts?.ignoreSlowConnection ?? false;
  if (!canPrefetchUrl(url, ignoreSlowConnection)) return;
  prefetchedUrls.add(url);
  if (HTMLScriptElement.supports?.("speculationrules")) {
    debug?.(`[astro] Prefetching ${url} with <script type="speculationrules">`);
    appendSpeculationRules(url);
  } else if (document.createElement("link").relList?.supports?.("prefetch") && opts?.with !== "fetch") {
    debug?.(`[astro] Prefetching ${url} with <link rel="prefetch">`);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.setAttribute("href", url);
    document.head.append(link);
  } else {
    debug?.(`[astro] Prefetching ${url} with fetch`);
    fetch(url, { priority: "low" });
  }
}
function canPrefetchUrl(url, ignoreSlowConnection) {
  if (!navigator.onLine) return false;
  if (!ignoreSlowConnection && isSlowConnection()) return false;
  try {
    const urlObj = new URL(url, location.href);
    return location.origin === urlObj.origin && (location.pathname !== urlObj.pathname || location.search !== urlObj.search) && !prefetchedUrls.has(url);
  } catch {
  }
  return false;
}
function elMatchesStrategy(el, strategy) {
  if (el?.tagName !== "A") return false;
  const attrValue = el.dataset.astroPrefetch;
  if (attrValue === "false") {
    return false;
  }
  if (strategy === "tap" && (attrValue != null || prefetchAll) && isSlowConnection()) {
    return true;
  }
  if (attrValue == null && prefetchAll || attrValue === "") {
    return strategy === defaultStrategy;
  }
  if (attrValue === strategy) {
    return true;
  }
  return false;
}
function isSlowConnection() {
  if ("connection" in navigator) {
    const conn = navigator.connection;
    return conn.saveData || /2g/.test(conn.effectiveType);
  }
  return false;
}
function onPageLoad(cb) {
  cb();
  let firstLoad = false;
  document.addEventListener("astro:page-load", () => {
    if (!firstLoad) {
      firstLoad = true;
      return;
    }
    cb();
  });
}
function appendSpeculationRules(url) {
  const script = document.createElement("script");
  script.type = "speculationrules";
  script.textContent = JSON.stringify({
    prerender: [
      {
        source: "list",
        urls: [url]
      }
    ],
    // Currently, adding `prefetch` is required to fallback if `prerender` fails.
    // Possibly will be automatic in the future, in which case it can be removed.
    // https://github.com/WICG/nav-speculation/issues/162#issuecomment-1977818473
    prefetch: [
      {
        source: "list",
        urls: [url]
      }
    ]
  });
  document.head.append(script);
}

prefetch$1({});
init();
//# sourceMappingURL=page.BQ7h4OGt.js.map
