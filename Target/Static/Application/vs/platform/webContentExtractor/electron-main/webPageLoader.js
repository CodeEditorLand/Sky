var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Queue, raceTimeout, TimeoutTimer } from "../../../base/common/async.js";
import { CancellationTokenSource } from "../../../base/common/cancellation.js";
import { createSingleCallFunction } from "../../../base/common/functional.js";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { convertAXTreeToMarkdown } from "./cdpAccessibilityDomain.js";
class WebPageLoader extends Disposable {
  static {
    __name(this, "WebPageLoader");
  }
  static {
    this.TIMEOUT = 3e4;
  }
  static {
    this.POST_LOAD_TIMEOUT = 5e3;
  }
  static {
    this.FRAME_TIMEOUT = 500;
  }
  static {
    this.EXTRACT_CONTENT_TIMEOUT = 2e3;
  }
  static {
    this.IDLE_DEBOUNCE_TIME = 500;
  }
  static {
    this.MIN_CONTENT_LENGTH = 100;
  }
  // Minimum content length to consider extraction successful
  constructor(browserWindowFactory, _logger, _uri, _options, _isTrustedDomain) {
    super();
    this._logger = _logger;
    this._uri = _uri;
    this._options = _options;
    this._isTrustedDomain = _isTrustedDomain;
    this._requests = /* @__PURE__ */ new Set();
    this._queue = this._register(new Queue());
    this._timeout = this._register(new TimeoutTimer());
    this._idleDebounceTimer = this._register(new TimeoutTimer());
    this._onResult = (_result) => {
    };
    this._didFinishLoad = false;
    this._window = browserWindowFactory({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        partition: generateUuid(),
        // do not share any state with the default renderer session
        javascript: true,
        offscreen: true,
        sandbox: true,
        webgl: false
      }
    });
    this._register(toDisposable(() => this._window.destroy()));
    this._debugger = this._window.webContents.debugger;
    this._debugger.attach("1.1");
    this._debugger.on("message", this.onDebugMessage.bind(this));
    this._window.webContents.once("did-start-loading", this.onStartLoading.bind(this)).once("did-finish-load", this.onFinishLoad.bind(this)).once("did-fail-load", this.onFailLoad.bind(this)).once("will-navigate", this.onRedirect.bind(this)).once("will-redirect", this.onRedirect.bind(this)).on("select-client-certificate", (event) => event.preventDefault());
    this._window.webContents.session.webRequest.onBeforeSendHeaders(this.onBeforeSendHeaders.bind(this));
  }
  trace(message) {
    this._logger.trace(`[WebPageLoader] [${this._uri}] ${message}`);
  }
  /**
   * Loads the web page and extracts its content.
   */
  async load() {
    return await new Promise((resolve) => {
      this._onResult = createSingleCallFunction((result) => {
        switch (result.status) {
          case "ok":
            this.trace(`Loaded web page content, status: ${result.status}, title: '${result.title}', length: ${result.result.length}`);
            break;
          case "redirect":
            this.trace(`Loaded web page content, status: ${result.status}, toURI: ${result.toURI}`);
            break;
          case "error":
            this.trace(`Loaded web page content, status: ${result.status}, code: ${result.statusCode}, error: '${result.error}', title: '${result.title}', length: ${result.result?.length ?? 0}`);
            break;
        }
        const content = result.status !== "redirect" ? result.result : void 0;
        if (content !== void 0) {
          this.trace(content.length < 200 ? `Extracted content: '${content}'` : `Extracted content preview: '${content.substring(0, 200)}...'`);
        }
        resolve(result);
        this.dispose();
      });
      this.trace(`Loading web page content`);
      void this._window.loadURL(this._uri.toString(true));
      this.setTimeout(WebPageLoader.TIMEOUT);
    });
  }
  /**
   * Sets a timeout to trigger content extraction regardless of current loading state.
   */
  setTimeout(time) {
    if (this._store.isDisposed) {
      return;
    }
    this.trace(`Setting page load timeout to ${time} ms`);
    this._timeout.cancelAndSet(() => {
      this.trace(`Page load timeout reached`);
      void this._queue.queue(() => this.extractContent());
    }, time);
  }
  /**
   * Updates HTTP headers for each web request.
   */
  onBeforeSendHeaders(details, callback) {
    const headers = { ...details.requestHeaders };
    headers["DNT"] = "1";
    headers["Sec-GPC"] = "1";
    callback({ requestHeaders: headers });
  }
  /**
   * Handles the 'did-start-loading' event, enabling network tracking.
   */
  onStartLoading() {
    if (this._store.isDisposed) {
      return;
    }
    this.trace(`Received 'did-start-loading' event`);
    void this._debugger.sendCommand("Network.enable").catch(() => {
    });
  }
  /**
   * Handles the 'did-finish-load' event, checking for idle state
   * and updating timeout to allow for post-load activities.
   */
  onFinishLoad() {
    if (this._store.isDisposed) {
      return;
    }
    this.trace(`Received 'did-finish-load' event`);
    this._didFinishLoad = true;
    this.scheduleIdleCheck();
    this.setTimeout(WebPageLoader.POST_LOAD_TIMEOUT);
  }
  /**
   * Handles the 'did-fail-load' event, reporting load failures.
   */
  onFailLoad(_event, statusCode, error) {
    if (this._store.isDisposed) {
      return;
    }
    this.trace(`Received 'did-fail-load' event, code: ${statusCode}, error: '${error}'`);
    if (statusCode === -3) {
      this.trace(`Ignoring ERR_ABORTED (-3) as it may be caused by CSP or other measures`);
      void this._queue.queue(() => this.extractContent());
    } else {
      void this._queue.queue(() => this.extractContent({ status: "error", statusCode, error }));
    }
  }
  /**
   * Handles the 'will-navigate' and 'will-redirect' events, managing redirects.
   */
  onRedirect(event, url) {
    if (this._store.isDisposed) {
      return;
    }
    this.trace(`Received 'will-navigate' or 'will-redirect' event, url: ${url}`);
    if (!this._options?.followRedirects) {
      const toURI = URI.parse(url);
      if (this.normalizeAuthority(toURI.authority) === this.normalizeAuthority(this._uri.authority)) {
        return;
      }
      if (this._isTrustedDomain(toURI)) {
        return;
      }
      event.preventDefault();
      this._onResult({ status: "redirect", toURI });
    }
  }
  /**
   * Normalizes an authority by removing the 'www.' prefix if present.
   */
  normalizeAuthority(authority) {
    return authority.toLowerCase().replace(/^www\./, "");
  }
  /**
   * Handles debugger messages related to network requests, tracking their lifecycle.
   * @note DO NOT add logging to this function, microsoft.com will freeze when too many logs are generated
   */
  onDebugMessage(_event, method, params) {
    if (this._store.isDisposed) {
      return;
    }
    const { requestId, type, response } = params;
    switch (method) {
      case "Network.requestWillBeSent":
        if (requestId !== void 0) {
          this._requests.add(requestId);
          this._idleDebounceTimer.cancel();
        }
        break;
      case "Network.loadingFinished":
      case "Network.loadingFailed":
        if (requestId !== void 0) {
          this._requests.delete(requestId);
          if (this._requests.size === 0 && this._didFinishLoad) {
            this.scheduleIdleCheck();
          }
        }
        break;
      case "Network.responseReceived":
        if (type === "Document") {
          const statusCode = response?.status ?? 0;
          if (statusCode >= 400) {
            const error = response?.statusText || `HTTP error ${statusCode}`;
            void this._queue.queue(() => this.extractContent({ status: "error", statusCode, error }));
          }
        }
        break;
    }
  }
  /**
   * Schedules an idle check after a debounce period to allow for bursts of network activity.
   * If idle is detected, proceeds to extract content.
   */
  scheduleIdleCheck() {
    if (this._store.isDisposed) {
      return;
    }
    this._idleDebounceTimer.cancelAndSet(async () => {
      if (this._store.isDisposed) {
        return;
      }
      await this.nextFrame();
      if (this._requests.size === 0) {
        this._queue.queue(() => this.extractContent());
      } else {
        this.trace(`New network requests detected, deferring content extraction`);
      }
    }, WebPageLoader.IDLE_DEBOUNCE_TIME);
  }
  /**
   * Waits for a rendering frame to ensure the page had a chance to update.
   */
  async nextFrame() {
    if (this._store.isDisposed) {
      return;
    }
    await raceTimeout(new Promise((resolve) => {
      try {
        this.trace(`Waiting for a frame to be rendered`);
        this._window.webContents.beginFrameSubscription(false, () => {
          try {
            this.trace(`A frame has been rendered`);
            this._window.webContents.endFrameSubscription();
          } catch {
          }
          resolve();
        });
      } catch {
        resolve();
      }
    }), WebPageLoader.FRAME_TIMEOUT);
  }
  /**
   * Extracts the content of the loaded web page using the Accessibility domain and reports the result.
   */
  async extractContent(errorResult) {
    if (this._store.isDisposed) {
      return;
    }
    try {
      const title = this._window.webContents.getTitle();
      let result = "";
      const cts = new CancellationTokenSource();
      try {
        await raceTimeout((async () => {
          if (!cts.token.isCancellationRequested) {
            result = await this.extractAccessibilityTreeContent(cts.token) ?? "";
          }
          if (!cts.token.isCancellationRequested && result.length < WebPageLoader.MIN_CONTENT_LENGTH) {
            this.trace(`Accessibility tree extraction yielded insufficient content, trying main DOM element extraction`);
            const domContent = await this.extractMainDomElementContent() ?? "";
            result = domContent.length > result.length ? domContent : result;
          }
        })(), WebPageLoader.EXTRACT_CONTENT_TIMEOUT);
      } finally {
        cts.cancel();
        cts.dispose();
      }
      if (result.length === 0) {
        this._onResult({ status: "error", error: "Failed to extract meaningful content from the web page" });
      } else if (errorResult !== void 0) {
        this._onResult({ ...errorResult, result, title });
      } else {
        this._onResult({ status: "ok", result, title });
      }
    } catch (e) {
      if (errorResult !== void 0) {
        this._onResult(errorResult);
      } else {
        this._onResult({
          status: "error",
          error: e instanceof Error ? e.message : String(e)
        });
      }
    }
  }
  /**
   * Extracts content from the Accessibility tree of the loaded web page.
   * @param token Cancellation token to abort the operation.
   * @return The extracted content, or undefined if extraction fails or is cancelled.
   */
  async extractAccessibilityTreeContent(token) {
    this.trace(`Extracting content using Accessibility domain`);
    try {
      await this._debugger.sendCommand("Page.enable");
      if (token.isCancellationRequested) {
        return void 0;
      }
      const { frameTree } = await this._debugger.sendCommand("Page.getFrameTree");
      if (token.isCancellationRequested) {
        return void 0;
      }
      const frameNodes = [frameTree];
      for (let i = 0; i < frameNodes.length; i++) {
        frameNodes.push(...frameNodes[i].childFrames ?? []);
      }
      const allNodes = [];
      for (const { frame } of frameNodes) {
        try {
          const { nodes } = await this._debugger.sendCommand("Accessibility.getFullAXTree", { frameId: frame.id });
          allNodes.push(...nodes);
          if (token.isCancellationRequested) {
            return void 0;
          }
        } catch {
        }
      }
      return convertAXTreeToMarkdown(this._uri, allNodes);
    } catch (error) {
      this.trace(`Accessibility tree extraction failed: ${error instanceof Error ? error.message : String(error)}`);
      return void 0;
    }
  }
  /**
   * Fallback method for extracting web page content when Accessibility tree extraction yields insufficient content.
   * Attempts to extract meaningful text content from the main DOM elements of the loaded web page.
   * @returns The extracted text content, or undefined if extraction fails.
   */
  async extractMainDomElementContent() {
    try {
      this.trace(`Extracting content from main DOM element`);
      return await this._window.webContents.executeJavaScript(`
				(() => {
					const selectors = ['main','article','[role="main"]','.main-content','#main-content','.article-body','.post-content','.entry-content','.content','body'];
					for (const selector of selectors) {
						const content = document.querySelector(selector)?.textContent?.replace(/[ \\t]+/g, ' ').replace(/\\s{2,}/gm, '\\n').trim();
						if (content && content.length > ${WebPageLoader.MIN_CONTENT_LENGTH}) {
							return content;
						}
					}
					return undefined;
				})();
			`);
    } catch (error) {
      this.trace(`DOM extraction failed: ${error instanceof Error ? error.message : String(error)}`);
      return void 0;
    }
  }
}
export {
  WebPageLoader
};
//# sourceMappingURL=webPageLoader.js.map
