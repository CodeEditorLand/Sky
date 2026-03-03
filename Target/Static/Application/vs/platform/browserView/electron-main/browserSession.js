var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { session } from "electron";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
import { joinPath } from "../../../base/common/resources.js";
import { BrowserViewStorageScope } from "../common/browserView.js";
const allowedPermissions = /* @__PURE__ */ new Set([
  "pointerLock",
  "notifications",
  "clipboard-read",
  "clipboard-sanitized-write"
]);
class BrowserSession extends Disposable {
  static {
    __name(this, "BrowserSession");
  }
  static {
    this._sessions = /* @__PURE__ */ new Map();
  }
  static {
    this.knownSessions = /* @__PURE__ */ new WeakSet();
  }
  /**
   * Check if a {@link Electron.WebContents} belongs to an integrated browser
   * view backed by a BrowserSession.
   */
  static isBrowserViewWebContents(contents) {
    return BrowserSession.knownSessions.has(contents.session);
  }
  /**
   * Return an existing session for the given id, or `undefined`.
   */
  static get(id) {
    return BrowserSession._sessions.get(id);
  }
  /**
   * Return all live browser context IDs (i.e. all session {@link id}s).
   */
  static getBrowserContextIds() {
    return [...BrowserSession._sessions.keys()];
  }
  /**
   * Get or create the singleton global-scope session.
   */
  static getOrCreateGlobal() {
    const existing = BrowserSession._sessions.get("global");
    if (existing) {
      return existing;
    }
    return new BrowserSession("global", session.fromPartition("persist:vscode-browser"), BrowserViewStorageScope.Global);
  }
  /**
   * Get or create a workspace-scope session for the given workspace.
   */
  static getOrCreateWorkspace(workspaceId, workspaceStorageHome) {
    const sessionId = `workspace:${workspaceId}`;
    const existing = BrowserSession._sessions.get(sessionId);
    if (existing) {
      return existing;
    }
    const storage = joinPath(workspaceStorageHome, workspaceId, "browserStorage");
    return new BrowserSession(sessionId, session.fromPath(storage.fsPath), BrowserViewStorageScope.Workspace);
  }
  /**
   * Get or create an ephemeral session for the given view / target id.
   */
  static getOrCreateEphemeral(viewId, type) {
    if (type === "workspace" || type === "ephemeral") {
      throw new Error(`Cannot create session with reserved type '${type}'`);
    }
    const sessionId = `${type ?? "ephemeral"}:${viewId}`;
    const existing = BrowserSession._sessions.get(sessionId);
    if (existing) {
      return existing;
    }
    return new BrowserSession(sessionId, session.fromPartition(`vscode-browser-${type}${viewId}`), BrowserViewStorageScope.Ephemeral);
  }
  /**
   * Get or create a session for a workbench-originated browser view.
   * The session id is derived from the *scope* -- not the view id -- so
   * multiple views that share a scope (e.g. two Global views) get the
   * same `BrowserSession`.
   *
   * @param viewId   Used only for ephemeral sessions where every view
   *                 needs its own Electron session.
   * @param scope    Desired storage scope.
   * @param workspaceStorageHome  Root folder under which per-workspace
   *                              browser storage is created
   *                              (`IEnvironmentMainService.workspaceStorageHome`).
   * @param workspaceId  Only required when `scope` is `workspace`.
   */
  static getOrCreate(viewId, scope, workspaceStorageHome, workspaceId) {
    switch (scope) {
      case BrowserViewStorageScope.Global:
        return BrowserSession.getOrCreateGlobal();
      case BrowserViewStorageScope.Workspace:
        if (workspaceId) {
          return BrowserSession.getOrCreateWorkspace(workspaceId, workspaceStorageHome);
        }
      // fallthrough -- no workspace context -> ephemeral
      case BrowserViewStorageScope.Ephemeral:
      default:
        return BrowserSession.getOrCreateEphemeral(viewId);
    }
  }
  constructor(id, electronSession, storageScope) {
    super();
    this.id = id;
    this.electronSession = electronSession;
    this.storageScope = storageScope;
    this.refs = 0;
    if (BrowserSession._sessions.has(id)) {
      throw new Error(`BrowserSession with id '${id}' already exists`);
    }
    this.configureSession();
    BrowserSession.knownSessions.add(electronSession);
    BrowserSession._sessions.set(id, this);
  }
  /**
   * Apply the standard permission policy to the session.
   */
  configureSession() {
    this.electronSession.setPermissionRequestHandler((_webContents, permission, callback) => {
      return callback(allowedPermissions.has(permission));
    });
    this.electronSession.setPermissionCheckHandler((_webContents, permission, _origin) => {
      return allowedPermissions.has(permission);
    });
  }
  acquire() {
    this.refs++;
    return toDisposable(() => {
      this.refs--;
      if (this.refs === 0) {
        this.dispose();
      }
    });
  }
  dispose() {
    if (this.refs > 0) {
      throw new Error(`Cannot dispose BrowserSession because it is still in use`);
    }
    BrowserSession._sessions.delete(this.id);
    super.dispose();
  }
}
export {
  BrowserSession
};
//# sourceMappingURL=browserSession.js.map
