var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { createCancelablePromise, raceCancellablePromises } from "../../../base/common/async.js";
class PlaywrightTab {
  static {
    __name(this, "PlaywrightTab");
  }
  constructor(page) {
    this.page = page;
    this._onDialogStateChanged = new Emitter();
    this._logs = [];
    this._needsFullSnapshot = false;
    page.on("console", (event) => this._handleConsoleMessage(event)).on("pageerror", (error) => this._handlePageError(error)).on("requestfailed", (request) => this._handleRequestFailed(request)).on("dialog", (dialog) => this._handleDialog(dialog)).on("download", (download) => this._handleDownload(download));
    this._initialized = this._initialize();
  }
  async _initialize() {
    const messages = await this.page.consoleMessages().catch(() => []);
    for (const message of messages) {
      this._handleConsoleMessage(message);
    }
    const errors = await this.page.pageErrors().catch(() => []);
    for (const error of errors) {
      this._handlePageError(error);
    }
  }
  _handleDialog(dialog) {
    this._dialog = dialog;
    this.page.waitForFunction(() => true, void 0, { timeout: 0 }).then(() => {
      if (this._dialog === dialog) {
        this._dialog = void 0;
        this._onDialogStateChanged.fire();
      }
    });
    this._onDialogStateChanged.fire();
  }
  async replyToDialog(accept, promptText) {
    if (!this._dialog) {
      throw new Error("No active modal dialog to respond to");
    }
    const dialog = this._dialog;
    this._dialog = void 0;
    this._onDialogStateChanged.fire();
    await this.safeRunAgainstPage(async () => {
      if (accept) {
        await dialog.accept(promptText);
      } else {
        await dialog.dismiss();
      }
    });
  }
  _handleFileChooser(chooser) {
    this._fileChooser = chooser;
  }
  async replyToFileChooser(files) {
    if (!this._fileChooser) {
      throw new Error("No active file chooser dialog to respond to");
    }
    const chooser = this._fileChooser;
    this._fileChooser = void 0;
    await this.safeRunAgainstPage(() => chooser.setFiles(files));
  }
  async _handleDownload(download) {
    this._logs.push({ type: "download", time: Date.now(), description: `${download.suggestedFilename()}` });
  }
  _handleRequestFailed(request) {
    const timing = request.timing();
    this._logs.push({ type: "requestFailed", time: timing.responseEnd + timing.startTime, description: `${request.method()} request to ${request.url()} failed: "${request.failure()?.errorText}"` });
  }
  _handleConsoleMessage(message) {
    if (message.type() === "error" || message.type() === "warning") {
      this._logs.push({ type: "console", time: message.timestamp(), description: `[${message.type()}] ${message.text()}` });
    }
  }
  _handlePageError(error) {
    this._logs.push({ type: "pageError", time: Date.now(), description: error.stack ?? error.message });
  }
  /**
   * Run a callback against the page and wait for it to complete.
   *
   * Because dialogs pause the page, execution races against any dialog that opens -- if a dialog
   * appears before the callback finishes, the method throws so the caller can surface it to the agent.
   *
   * Also allows for interactions to be handled differently when triggered by agents.
   * E.g. file dialogs should appear when the user triggers one, but not when the agent does.
   */
  async safeRunAgainstPage(action) {
    if (this._dialog) {
      throw new Error(`Cannot perform action while a dialog is open`);
    }
    let actionDidComplete = false;
    let result;
    const dialogOpened = Event.toPromise(this._onDialogStateChanged.event);
    const actionCompleted = createCancelablePromise(async (token) => {
      const handleFileChooser = /* @__PURE__ */ __name((chooser) => this._handleFileChooser(chooser), "handleFileChooser");
      this.page.on("filechooser", handleFileChooser);
      try {
        result = await this.runAndWaitForCompletion((token2) => action(this.page, token2), token);
        actionDidComplete = true;
      } finally {
        this.page.off("filechooser", handleFileChooser);
      }
    });
    return raceCancellablePromises([dialogOpened, actionCompleted]).then(() => {
      if (!actionDidComplete) {
        throw new Error("Action was interrupted by a dialog");
      }
      return result;
    });
  }
  async getSummary(full = this._needsFullSnapshot) {
    await this._initialized;
    if (full && this._needsFullSnapshot) {
      this._needsFullSnapshot = false;
    }
    const snapshotFromPage = await this.safeRunAgainstPage((page) => page._snapshotForAI({ track: "response" })).catch(() => {
      this._needsFullSnapshot = true;
      return void 0;
    });
    const title = await this.safeRunAgainstPage((page) => page.title()).catch(() => "");
    const logs = this._logs;
    this._logs = [];
    const snapshot = (full ? snapshotFromPage?.full : snapshotFromPage?.incremental ?? snapshotFromPage?.full)?.trim() ?? "";
    return [
      ...title ? [`Page Title: ${title}`] : [],
      `URL: ${this.page.url()}`,
      ...this._dialog ? [`Active ${this._dialog.type()} dialog: "${this._dialog.message()}"`] : [],
      ...this._fileChooser ? [`Active file chooser dialog`] : [],
      ...logs.length > 0 ? [
        `Recent events:`,
        ...logs.map((log) => `- [${new Date(log.time).toISOString()}] (${log.type}) ${log.description}`)
      ] : [],
      ...snapshot ? ["Snapshot:", snapshot] : []
    ].join("\n");
  }
  async runAndWaitForCompletion(callback, token = CancellationToken.None) {
    const requests = [];
    const requestListener = /* @__PURE__ */ __name((request) => requests.push(request), "requestListener");
    const disposeListeners = /* @__PURE__ */ __name(() => {
      this.page.off("request", requestListener);
    }, "disposeListeners");
    this.page.on("request", requestListener);
    let result;
    try {
      result = await callback(token);
    } finally {
      disposeListeners();
    }
    const requestedNavigation = requests.some((request) => request.isNavigationRequest());
    if (requestedNavigation) {
      await this.page.mainFrame().waitForLoadState("load", { timeout: 1e4 }).catch(() => {
      });
      return result;
    }
    const promises = [];
    for (const request of requests) {
      if (["document", "stylesheet", "script", "xhr", "fetch"].includes(request.resourceType())) {
        promises.push(request.response().then((r) => r?.finished()).catch(() => {
        }));
      } else {
        promises.push(request.response().catch(() => {
        }));
      }
    }
    const timeout = new Promise((resolve) => setTimeout(resolve, 5e3));
    await Promise.race([Promise.all(promises), timeout]);
    return result;
  }
}
export {
  PlaywrightTab
};
//# sourceMappingURL=playwrightTab.js.map
