var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { DeferredPromise } from "../../../base/common/async.js";
import { Emitter } from "../../../base/common/event.js";
import { PlaywrightTab } from "./playwrightTab.js";
class PlaywrightService extends Disposable {
  static {
    __name(this, "PlaywrightService");
  }
  constructor(windowId, browserViewGroupRemoteService, logService) {
    super();
    this.windowId = windowId;
    this.browserViewGroupRemoteService = browserViewGroupRemoteService;
    this.logService = logService;
    this._pages = this._register(new PlaywrightPageManager(logService));
    this.onDidChangeTrackedPages = this._pages.onDidChangeTrackedPages;
  }
  // --- Page tracking (delegated to manager) ---
  async startTrackingPage(viewId) {
    return this._pages.startTrackingPage(viewId);
  }
  async stopTrackingPage(viewId) {
    return this._pages.stopTrackingPage(viewId);
  }
  async isPageTracked(viewId) {
    return this._pages.isPageTracked(viewId);
  }
  async getTrackedPages() {
    return this._pages.getTrackedPages();
  }
  // --- Playwright operations (lazy init) ---
  /**
   * Ensure the Playwright browser connection is initialized and the page
   * manager is wired up to the browser view group.
   */
  async initialize() {
    if (this._browser) {
      return;
    }
    if (this._initPromise) {
      return this._initPromise;
    }
    this._initPromise = (async () => {
      try {
        this.logService.debug("[PlaywrightService] Creating browser view group");
        const group = await this.browserViewGroupRemoteService.createGroup(this.windowId);
        this.logService.debug("[PlaywrightService] Connecting to browser via CDP");
        const playwright = await import("playwright-core");
        const sub = group.onCDPMessage((msg) => transport.onmessage?.(msg));
        const transport = {
          close() {
            sub.dispose();
            this.onclose?.();
          },
          send(message) {
            void group.sendCDPMessage(message);
          }
        };
        const browser = await playwright.chromium._connectOverCDPTransport(transport);
        this.logService.debug("[PlaywrightService] Connected to browser");
        if (this._initPromise === void 0) {
          browser.close().catch(() => {
          });
          group.dispose();
          throw new Error("PlaywrightService was disposed during initialization");
        }
        browser.on("disconnected", () => {
          this.logService.debug("[PlaywrightService] Browser disconnected");
          if (this._browser === browser) {
            this._pages.reset();
            this._browser = void 0;
            this._initPromise = void 0;
          }
        });
        await this._pages.initialize(browser, group);
        this._browser = browser;
      } catch (e) {
        this._initPromise = void 0;
        throw e;
      }
    })();
    return this._initPromise;
  }
  async openPage(url) {
    await this.initialize();
    const pageId = await this._pages.newPage(url);
    const summary = await this._pages.getSummary(pageId);
    return { pageId, summary };
  }
  async getSummary(pageId) {
    await this.initialize();
    return this._pages.getSummary(pageId, true);
  }
  async invokeFunctionRaw(pageId, fnDef, ...args) {
    await this.initialize();
    const vm = await import("vm");
    const fn = vm.compileFunction(`return (${fnDef})(page, ...args)`, ["page", "args"], { parsingContext: vm.createContext() });
    return this._pages.runAgainstPage(pageId, (page) => fn(page, args));
  }
  async invokeFunction(pageId, fnDef, ...args) {
    this.logService.info(`[PlaywrightService] Invoking function on view ${pageId}`);
    try {
      let result;
      try {
        result = await this.invokeFunctionRaw(pageId, fnDef, ...args);
      } catch (err) {
        result = err instanceof Error ? err.message : String(err);
      }
      let summary;
      try {
        summary = await this._pages.getSummary(pageId);
      } catch (err) {
        summary = err instanceof Error ? err.message : String(err);
      }
      return { result, summary };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logService.error("[PlaywrightService] Script execution failed:", errorMessage);
      throw err;
    }
  }
  async replyToFileChooser(pageId, files) {
    await this.initialize();
    const summary = await this._pages.replyToFileChooser(pageId, files);
    return { summary };
  }
  async replyToDialog(pageId, accept, promptText) {
    await this.initialize();
    const summary = await this._pages.replyToDialog(pageId, accept, promptText);
    return { summary };
  }
  dispose() {
    if (this._browser) {
      this._browser.close().catch(() => {
      });
      this._browser = void 0;
    }
    this._initPromise = void 0;
    super.dispose();
  }
}
class PlaywrightPageManager extends Disposable {
  static {
    __name(this, "PlaywrightPageManager");
  }
  constructor(logService) {
    super();
    this.logService = logService;
    this._trackedPages = /* @__PURE__ */ new Set();
    this._onDidChangeTrackedPages = this._register(new Emitter());
    this.onDidChangeTrackedPages = this._onDidChangeTrackedPages.event;
    this._viewIdToPage = /* @__PURE__ */ new Map();
    this._pageToViewId = /* @__PURE__ */ new WeakMap();
    this._tabs = /* @__PURE__ */ new WeakMap();
    this._viewIdQueue = [];
    this._pageQueue = [];
    this._watchedContexts = /* @__PURE__ */ new WeakSet();
    this._initStore = this._register(new DisposableStore());
    this._openContext = void 0;
  }
  // --- Public: page tracking ---
  isPageTracked(viewId) {
    return this._trackedPages.has(viewId);
  }
  getTrackedPages() {
    return [...this._trackedPages];
  }
  async startTrackingPage(viewId) {
    if (this._trackedPages.has(viewId)) {
      return;
    }
    this._trackedPages.add(viewId);
    this._fireTrackedPagesChanged();
    if (this._group) {
      await this._addPageToGroup(viewId);
    }
  }
  async stopTrackingPage(viewId) {
    if (!this._trackedPages.has(viewId)) {
      return;
    }
    this._trackedPages.delete(viewId);
    this._fireTrackedPagesChanged();
    if (this._group) {
      await this._removePageFromGroup(viewId);
    }
  }
  // --- Public: Playwright operations (require initialization) ---
  /**
   * Create a new page in the browser and return its associated page ID.
   * The page is automatically added to the tracked set.
   */
  async newPage(url) {
    if (!this._browser) {
      throw new Error("PlaywrightPageManager has not been initialized");
    }
    if (!this._openContext) {
      this._openContext = await this._browser.newContext();
      this.onContextAdded(this._openContext);
    }
    const page = await this._openContext.newPage();
    const viewId = await this.onPageAdded(page);
    this._trackedPages.add(viewId);
    this._fireTrackedPagesChanged();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 3e4 });
    return viewId;
  }
  async runAgainstPage(pageId, callback) {
    const page = await this.getPage(pageId);
    const tab = this._tabs.get(page);
    if (!tab) {
      throw new Error("Failed to execute function against page");
    }
    return tab.safeRunAgainstPage(async () => callback(page));
  }
  async getSummary(pageId, full = false) {
    const page = await this.getPage(pageId);
    const tab = this._tabs.get(page);
    if (!tab) {
      throw new Error("Failed to get page summary");
    }
    return tab.getSummary(full);
  }
  async replyToDialog(pageId, accept, promptText) {
    const page = await this.getPage(pageId);
    const tab = this._tabs.get(page);
    if (!tab) {
      throw new Error("Failed to reply to dialog");
    }
    await tab.replyToDialog(accept, promptText);
    return tab.getSummary();
  }
  async replyToFileChooser(pageId, files) {
    const page = await this.getPage(pageId);
    const tab = this._tabs.get(page);
    if (!tab) {
      throw new Error("Failed to reply to file chooser");
    }
    await tab.replyToFileChooser(files);
    return tab.getSummary();
  }
  // --- Initialization ---
  /**
   * Wire up the manager to a browser and group. Replays any pages that
   * were tracked before initialization.
   */
  async initialize(browser, group) {
    this._initStore.clear();
    this._browser = browser;
    this._group = group;
    this._initStore.add(group);
    this._initStore.add(group.onDidAddView((e) => this.onViewAdded(e.viewId)));
    this._initStore.add(group.onDidRemoveView((e) => this.onViewRemoved(e.viewId)));
    this.scanForNewContexts();
    await Promise.all([...this._trackedPages].map((viewId) => this._addPageToGroup(viewId)));
  }
  /**
   * Clear initialized state but preserve tracked pages so the manager
   * can be re-initialized with a new browser and group.
   */
  reset() {
    this._initStore.clear();
    this._browser = void 0;
    this._group = void 0;
    this.stopScanning();
    this._viewIdToPage.clear();
    for (const { page } of this._viewIdQueue) {
      page.error(new Error("PlaywrightPageManager reset"));
    }
    for (const { viewId } of this._pageQueue) {
      viewId.error(new Error("PlaywrightPageManager reset"));
    }
    this._viewIdQueue = [];
    this._pageQueue = [];
  }
  // --- Private: group proxy ---
  async _addPageToGroup(viewId) {
    if (this._viewIdToPage.has(viewId)) {
      return;
    }
    if (this._viewIdQueue.some((item) => item.viewId === viewId)) {
      return;
    }
    this.onViewAdded(viewId);
    try {
      await this._group.addView(viewId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logService.error("[PlaywrightPageManager] Failed to add view:", errorMessage);
      this.onViewRemoved(viewId);
    }
  }
  async _removePageFromGroup(viewId) {
    this.onViewRemoved(viewId);
    try {
      await this._group.removeView(viewId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logService.error("[PlaywrightPageManager] Failed to remove view:", errorMessage);
    }
  }
  _fireTrackedPagesChanged() {
    this._onDidChangeTrackedPages.fire([...this._trackedPages]);
  }
  // --- Page matching (view ↔ page pairing) ---
  /**
   * Get the Playwright {@link Page} for a browser view.
   * If the view is tracked but not yet connected, it is added to the group
   * automatically. Throws if the view has not been added.
   */
  async getPage(viewId) {
    const resolved = this._viewIdToPage.get(viewId);
    if (resolved) {
      return resolved;
    }
    const queued = this._viewIdQueue.find((item) => item.viewId === viewId);
    if (queued) {
      return queued.page.p;
    }
    throw new Error(`Page "${viewId}" not found`);
  }
  /**
   * Called when the group fires onDidAddView. Creates a deferred entry in
   * the view ID queue and attempts to match it with a page.
   */
  onViewAdded(viewId, timeoutMs = 1e4) {
    const resolved = this._viewIdToPage.get(viewId);
    if (resolved) {
      return Promise.resolve(resolved);
    }
    const queued = this._viewIdQueue.find((item) => item.viewId === viewId);
    if (queued) {
      return queued.page.p;
    }
    const deferred = new DeferredPromise();
    const timeout = setTimeout(() => deferred.error(new Error(`Timed out waiting for page`)), timeoutMs);
    deferred.p.finally(() => {
      clearTimeout(timeout);
      this._viewIdQueue = this._viewIdQueue.filter((item) => item.viewId !== viewId);
      if (this._viewIdQueue.length === 0) {
        this.stopScanning();
      }
    });
    this._viewIdQueue.push({ viewId, page: deferred });
    this.tryMatch();
    this.ensureScanning();
    return deferred.p;
  }
  onViewRemoved(viewId) {
    this._viewIdQueue = this._viewIdQueue.filter((item) => item.viewId !== viewId);
    const page = this._viewIdToPage.get(viewId);
    if (page) {
      this._pageToViewId.delete(page);
    }
    this._viewIdToPage.delete(viewId);
    this._trackedPages.delete(viewId);
    this._fireTrackedPagesChanged();
  }
  onPageAdded(page, timeoutMs = 1e4) {
    const resolved = this._pageToViewId.get(page);
    if (resolved) {
      return Promise.resolve(resolved);
    }
    const queued = this._pageQueue.find((item) => item.page === page);
    if (queued) {
      return queued.viewId.p;
    }
    this.onContextAdded(page.context());
    page.once("close", () => this.onPageRemoved(page));
    page.setDefaultTimeout(1e4);
    this._tabs.set(page, new PlaywrightTab(page));
    const deferred = new DeferredPromise();
    const timeout = setTimeout(() => deferred.error(new Error(`Timed out waiting for browser view`)), timeoutMs);
    deferred.p.finally(() => {
      clearTimeout(timeout);
      this._pageQueue = this._pageQueue.filter((item) => item.page !== page);
    });
    this._pageQueue.push({ page, viewId: deferred });
    this.tryMatch();
    return deferred.p;
  }
  onPageRemoved(page) {
    this._pageQueue = this._pageQueue.filter((item) => item.page !== page);
    const viewId = this._pageToViewId.get(page);
    if (viewId) {
      this._viewIdToPage.delete(viewId);
      this._trackedPages.delete(viewId);
      this._fireTrackedPagesChanged();
    }
    this._pageToViewId.delete(page);
  }
  onContextAdded(context) {
    if (this._watchedContexts.has(context)) {
      return;
    }
    this._watchedContexts.add(context);
    context.on("page", (page) => this.onPageAdded(page));
    context.on("close", () => this.onContextRemoved(context));
    for (const page of context.pages()) {
      this.onPageAdded(page);
    }
  }
  onContextRemoved(context) {
    this._watchedContexts.delete(context);
  }
  // --- Matching ---
  /**
   * Pair up queued view IDs with queued pages in FIFO order and resolve
   * any callers waiting for the matched view IDs.
   */
  tryMatch() {
    while (this._viewIdQueue.length > 0 && this._pageQueue.length > 0) {
      const viewIdItem = this._viewIdQueue.shift();
      const pageItem = this._pageQueue.shift();
      this._viewIdToPage.set(viewIdItem.viewId, pageItem.page);
      this._pageToViewId.set(pageItem.page, viewIdItem.viewId);
      viewIdItem.page.complete(pageItem.page);
      pageItem.viewId.complete(viewIdItem.viewId);
      this.logService.debug(`[PlaywrightPageManager] Matched view ${viewIdItem.viewId} \u2192 page`);
    }
    if (this._viewIdQueue.length === 0) {
      this.stopScanning();
    }
  }
  // --- Context scanning ---
  /**
   * Watch all current {@link BrowserContext BrowserContexts} for new pages.
   * Also processes any existing pages in newly discovered contexts.
   */
  scanForNewContexts() {
    if (!this._browser) {
      return;
    }
    for (const context of this._browser.contexts()) {
      this.onContextAdded(context);
    }
  }
  ensureScanning() {
    if (this._scanTimer === void 0) {
      this._scanTimer = setInterval(() => this.scanForNewContexts(), 100);
    }
  }
  stopScanning() {
    if (this._scanTimer !== void 0) {
      clearInterval(this._scanTimer);
      this._scanTimer = void 0;
    }
  }
  dispose() {
    this.stopScanning();
    for (const { page } of this._viewIdQueue) {
      page.error(new Error("PlaywrightPageManager disposed"));
    }
    for (const { viewId } of this._pageQueue) {
      viewId.error(new Error("PlaywrightPageManager disposed"));
    }
    this._viewIdQueue = [];
    this._pageQueue = [];
    super.dispose();
  }
}
export {
  PlaywrightService
};
//# sourceMappingURL=playwrightService.js.map
