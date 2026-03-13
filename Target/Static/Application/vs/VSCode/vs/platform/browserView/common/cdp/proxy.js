var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, DisposableMap } from "../../../../base/common/lifecycle.js";
import { Emitter } from "../../../../base/common/event.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { CDPError, CDPErrorCode, CDPServerError, CDPMethodNotFoundError, CDPInvalidParamsError } from "./types.js";
class CDPBrowserProxy extends Disposable {
  static {
    __name(this, "CDPBrowserProxy");
  }
  constructor(browserTarget) {
    super();
    this.browserTarget = browserTarget;
    this.sessionId = `browser-session-${generateUuid()}`;
    this._isAttachedToBrowserTarget = false;
    this._autoAttach = false;
    this._discover = false;
    this._targets = this._register(new TargetManager());
    this._sessions = this._register(new DisposableMap());
    this._sessionTargetIds = /* @__PURE__ */ new WeakMap();
    this._autoAttachments = /* @__PURE__ */ new WeakMap();
    this._handlers = /* @__PURE__ */ new Map([
      // Browser.* methods (https://chromedevtools.github.io/devtools-protocol/tot/Browser/)
      ["Browser.addPrivacySandboxCoordinatorKeyConfig", () => ({})],
      ["Browser.addPrivacySandboxEnrollmentOverride", () => ({})],
      ["Browser.close", () => ({})],
      ["Browser.getVersion", () => this.browserTarget.getVersion()],
      ["Browser.resetPermissions", () => ({})],
      ["Browser.getWindowForTarget", (p, s) => this.handleBrowserGetWindowForTarget(p, s)],
      ["Browser.setDownloadBehavior", () => ({})],
      ["Browser.setWindowBounds", () => ({})],
      // Target.* methods (https://chromedevtools.github.io/devtools-protocol/tot/Target/)
      ["Target.activateTarget", (p) => this.handleTargetActivateTarget(p)],
      ["Target.attachToTarget", (p) => this.handleTargetAttachToTarget(p)],
      ["Target.closeTarget", (p) => this.handleTargetCloseTarget(p)],
      ["Target.createBrowserContext", () => this.handleTargetCreateBrowserContext()],
      ["Target.createTarget", (p) => this.handleTargetCreateTarget(p)],
      ["Target.detachFromTarget", (p) => this.handleTargetDetachFromTarget(p)],
      ["Target.disposeBrowserContext", (p) => this.handleTargetDisposeBrowserContext(p)],
      ["Target.getBrowserContexts", () => this.handleTargetGetBrowserContexts()],
      ["Target.getTargets", () => this.handleTargetGetTargets()],
      ["Target.setAutoAttach", (p) => this.handleTargetSetAutoAttach(p)],
      ["Target.setDiscoverTargets", (p) => this.handleTargetSetDiscoverTargets(p)],
      ["Target.attachToBrowserTarget", () => this.handleTargetAttachToBrowserTarget()],
      ["Target.getTargetInfo", (p) => this.handleTargetGetTargetInfo(p)]
    ]);
    this._onEvent = this._register(new Emitter());
    this.onEvent = this._onEvent.event;
    this._onClose = this._register(new Emitter());
    this.onClose = this._onClose.event;
    this._onMessage = this._register(new Emitter());
    this.onMessage = this._onMessage.event;
    this._targets.onDidRegisterTarget(async ({ targetInfo }) => {
      if (this._discover) {
        this.sendBrowserEvent("Target.targetCreated", { targetInfo });
      }
      if (this._autoAttach) {
        await this.attachToTarget(targetInfo.targetId, true);
      }
    });
    this._targets.onDidUnregisterTarget(({ targetInfo }) => {
      const toDispose = [];
      for (const [, connection] of this._sessions) {
        if (this._sessionTargetIds.get(connection) === targetInfo.targetId) {
          toDispose.push(connection);
        }
      }
      for (const connection of toDispose) {
        connection.dispose();
      }
      if (this._discover) {
        this.sendBrowserEvent("Target.targetDestroyed", { targetId: targetInfo.targetId });
      }
    });
    this._register(this.browserTarget.onTargetCreated((target) => this._targets.register(target)));
    this._register(this.browserTarget.onTargetDestroyed((target) => this._targets.unregister(target)));
    for (const target of this.browserTarget.getTargets()) {
      void this._targets.register(target);
    }
    this._register(this._onEvent.event((event) => {
      this._onMessage.fire(event);
    }));
  }
  /**
   * Send a CDP command and await the result.
   * Browser-level handlers (Browser.*, Target.*) are checked first.
   * Other commands are routed to the page session identified by sessionId.
   */
  async sendCommand(method, params = {}, sessionId) {
    try {
      if (!sessionId || sessionId === this.sessionId || method.startsWith("Browser.") || method.startsWith("Target.")) {
        const handler = this._handlers.get(method);
        if (!handler) {
          throw new CDPMethodNotFoundError(method);
        }
        return await handler(params, sessionId);
      }
      const connection = this._sessions.get(sessionId);
      if (!connection) {
        throw new CDPServerError(`Session not found: ${sessionId}`);
      }
      const result = await connection.sendCommand(method, params);
      return result ?? {};
    } catch (error) {
      if (error instanceof CDPError) {
        throw error;
      }
      throw new CDPServerError(error instanceof Error ? error.message : "Unknown error");
    }
  }
  /**
   * Accept a CDP request from a message-based transport (WebSocket, IPC, etc.), route it,
   * and deliver the response or error via {@link onMessage}.
   */
  async sendMessage({ id, method, params, sessionId }) {
    return this.sendCommand(method, params, sessionId).then((result) => {
      this._onMessage.fire({ id, result, sessionId });
    }).catch((error) => {
      this._onMessage.fire({
        id,
        error: {
          code: error instanceof CDPError ? error.code : CDPErrorCode.ServerError,
          message: error.message || "Unknown error"
        },
        sessionId
      });
    });
  }
  // #endregion
  // #region CDP Commands
  handleBrowserGetWindowForTarget({ targetId }, sessionId) {
    const resolvedTargetId = (sessionId && this.findTargetIdForSession(sessionId)) ?? targetId;
    if (!resolvedTargetId) {
      throw new CDPServerError("Unable to resolve target");
    }
    const target = this._targets.getById(resolvedTargetId);
    return this.browserTarget.getWindowForTarget(target);
  }
  handleTargetGetBrowserContexts() {
    return { browserContextIds: this.browserTarget.getBrowserContexts() };
  }
  async handleTargetCreateBrowserContext() {
    const browserContextId = await this.browserTarget.createBrowserContext();
    return { browserContextId };
  }
  async handleTargetDisposeBrowserContext({ browserContextId }) {
    await this.browserTarget.disposeBrowserContext(browserContextId);
    return {};
  }
  handleTargetAttachToBrowserTarget() {
    this._isAttachedToBrowserTarget = true;
    return { sessionId: this.sessionId };
  }
  handleTargetActivateTarget({ targetId }) {
    const target = this._targets.getById(targetId);
    return this.browserTarget.activateTarget(target);
  }
  async handleTargetSetAutoAttach({ autoAttach = false, flatten }) {
    if (!flatten) {
      throw new CDPInvalidParamsError("This implementation only supports auto-attach with flatten=true");
    }
    this._autoAttach = autoAttach;
    return {};
  }
  async handleTargetSetDiscoverTargets({ discover = false }) {
    if (discover !== this._discover) {
      this._discover = discover;
      if (this._discover) {
        for (const targetInfo of this._targets.getAllInfos()) {
          this.sendBrowserEvent("Target.targetCreated", { targetInfo });
        }
      }
    }
    return {};
  }
  async handleTargetGetTargets() {
    return { targetInfos: Array.from(this._targets.getAllInfos()) };
  }
  async handleTargetGetTargetInfo({ targetId } = {}) {
    if (!targetId) {
      return { targetInfo: await this.browserTarget.getTargetInfo() };
    }
    const target = this._targets.getById(targetId);
    return { targetInfo: await target.getTargetInfo() };
  }
  async handleTargetAttachToTarget({ targetId, flatten }) {
    if (!flatten) {
      throw new CDPInvalidParamsError("This implementation only supports attachToTarget with flatten=true");
    }
    const connection = await this.attachToTarget(targetId, false);
    return { sessionId: connection.sessionId };
  }
  async handleTargetDetachFromTarget({ sessionId }) {
    const connection = this._sessions.get(sessionId);
    if (!connection) {
      throw new CDPServerError(`Session not found: ${sessionId}`);
    }
    connection.dispose();
    return {};
  }
  async handleTargetCreateTarget({ url, browserContextId }) {
    const target = await this.browserTarget.createTarget(url || "about:blank", browserContextId);
    const targetInfo = await this._targets.register(target);
    if (this._autoAttach) {
      await this.attachToTarget(targetInfo.targetId, true);
    }
    return { targetId: targetInfo.targetId };
  }
  async handleTargetCloseTarget({ targetId }) {
    try {
      await this.browserTarget.closeTarget(this._targets.getById(targetId));
      return { success: true };
    } catch {
      return { success: false };
    }
  }
  // #endregion
  // #region Internal Helpers
  /** Find the targetId for a given sessionId */
  findTargetIdForSession(sessionId) {
    const connection = this._sessions.get(sessionId);
    if (!connection) {
      return void 0;
    }
    return this._sessionTargetIds.get(connection);
  }
  /** Send a browser-level event to the client */
  sendBrowserEvent(method, params) {
    const sessionId = this._isAttachedToBrowserTarget ? this.sessionId : void 0;
    this._onEvent.fire({ method, params, sessionId });
  }
  /** Attach to a target, creating a named session */
  async attachToTarget(targetId, isAutoAttach) {
    const target = this._targets.getById(targetId);
    if (isAutoAttach) {
      if (this._autoAttachments.has(target)) {
        return this._autoAttachments.get(target);
      }
    }
    const attachmentPromise = (async () => {
      const connection = await target.attach();
      const sessionId = connection.sessionId;
      this._sessions.set(sessionId, connection);
      this._sessionTargetIds.set(connection, targetId);
      const targetInfo = await target.getTargetInfo();
      connection.onEvent((event) => {
        if (!event.method.startsWith("Target.")) {
          this._onEvent.fire({
            method: event.method,
            params: event.params,
            sessionId
          });
        }
      });
      connection.onClose(() => {
        this.sendBrowserEvent("Target.detachedFromTarget", { sessionId, targetId });
        this._sessions.deleteAndDispose(sessionId);
        this._sessionTargetIds.delete(connection);
        if (this._autoAttachments.get(target) === attachmentPromise) {
          this._autoAttachments.delete(target);
        }
      });
      this.sendBrowserEvent("Target.attachedToTarget", {
        sessionId,
        targetInfo: { ...targetInfo, attached: true },
        // Normally this would be configured by the client in `Target.setAutoAttach`,
        // but Electron doesn't allow us to control this, so we hardcode it to false.
        waitingForDebugger: false
      });
      return connection;
    })();
    if (isAutoAttach) {
      this._autoAttachments.set(target, attachmentPromise);
    }
    return attachmentPromise;
  }
}
class TargetManager extends Disposable {
  static {
    __name(this, "TargetManager");
  }
  constructor() {
    super(...arguments);
    this._knownTargets = /* @__PURE__ */ new WeakSet();
    this._targetInfos = /* @__PURE__ */ new WeakMap();
    this._targetsByID = /* @__PURE__ */ new Map();
    this._onDidRegisterTarget = this._register(new Emitter());
    this.onDidRegisterTarget = this._onDidRegisterTarget.event;
    this._onDidUnregisterTarget = this._register(new Emitter());
    this.onDidUnregisterTarget = this._onDidUnregisterTarget.event;
  }
  getById(targetId) {
    const target = this._targetsByID.get(targetId);
    if (!target) {
      throw new CDPServerError(`Unknown targetId: ${targetId}`);
    }
    return target;
  }
  *getAllInfos() {
    for (const target of this._targetsByID.values()) {
      yield this._targetInfos.get(target);
    }
  }
  async register(target) {
    if (this._knownTargets.has(target)) {
      return target.getTargetInfo();
    }
    this._knownTargets.add(target);
    const targetInfo = await target.getTargetInfo();
    if (!this._knownTargets.has(target)) {
      return targetInfo;
    }
    this._targetInfos.set(target, targetInfo);
    this._targetsByID.set(targetInfo.targetId, target);
    this._onDidRegisterTarget.fire({ target, targetInfo });
    return targetInfo;
  }
  async unregister(target) {
    if (!this._knownTargets.has(target)) {
      return;
    }
    this._knownTargets.delete(target);
    const targetInfo = this._targetInfos.get(target);
    if (targetInfo) {
      this._targetInfos.delete(target);
      this._targetsByID.delete(targetInfo.targetId);
      this._onDidUnregisterTarget.fire({ target, targetInfo });
    }
  }
}
export {
  CDPBrowserProxy
};
//# sourceMappingURL=proxy.js.map
