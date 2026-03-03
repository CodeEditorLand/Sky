var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { ILogService } from "../../log/common/log.js";
import { upgradeToISocket } from "../../../base/parts/ipc/node/ipc.net.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { CDPBrowserProxy } from "../common/cdp/proxy.js";
import { CDPError, CDPErrorCode } from "../common/cdp/types.js";
import { disposableTimeout } from "../../../base/common/async.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IBrowserViewCDPProxyServer = createDecorator("browserViewCDPProxyServer");
let BrowserViewCDPProxyServer = class BrowserViewCDPProxyServer2 extends Disposable {
  static {
    __name(this, "BrowserViewCDPProxyServer");
  }
  constructor(logService) {
    super();
    this.logService = logService;
    this.tokens = this._register(new TokenManager());
    this.targets = /* @__PURE__ */ new Map();
  }
  /**
   * Register a browser target and return a WebSocket endpoint URL for it.
   * The target is reachable at `/devtools/browser/{targetId}`.
   */
  async getWebSocketEndpointForTarget(target) {
    await this.ensureServerStarted();
    const targetInfo = await target.getTargetInfo();
    const targetId = targetInfo.targetId;
    this.targets.set(targetId, target);
    const token = await this.tokens.issueToken(targetId);
    return `ws://localhost:${this.port}/devtools/browser/${targetId}?token=${token}`;
  }
  /**
   * Unregister a previously registered browser target.
   */
  async removeTarget(target) {
    const targetInfo = await target.getTargetInfo();
    this.targets.delete(targetInfo.targetId);
  }
  async ensureServerStarted() {
    if (this.server) {
      return;
    }
    const http = await import("http");
    this.server = http.createServer();
    await new Promise((resolve, reject) => {
      this.server.listen(0, "127.0.0.1", () => resolve());
      this.server.once("error", reject);
    });
    const address = this.server.address();
    this.port = address.port;
    this.server.on("request", (req, res) => this.handleHttpRequest(req, res));
    this.server.on("upgrade", (req, socket) => this.handleWebSocketUpgrade(req, socket));
  }
  async handleHttpRequest(_req, res) {
    this.logService.debug(`[BrowserViewDebugProxy] HTTP request at ${_req.url}`);
    res.writeHead(404);
    res.end();
  }
  handleWebSocketUpgrade(req, socket) {
    const [pathname, params] = (req.url || "").split("?");
    const browserMatch = pathname.match(/^\/devtools\/browser\/([^/?]+)$/);
    this.logService.debug(`[BrowserViewDebugProxy] WebSocket upgrade requested: ${pathname}`);
    if (!browserMatch) {
      this.logService.warn(`[BrowserViewDebugProxy] Rejecting WebSocket on unknown path: ${pathname}`);
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.end();
      return;
    }
    const targetId = browserMatch[1];
    const token = new URLSearchParams(params).get("token");
    const tokenTargetId = token && this.tokens.consumeToken(token);
    if (!tokenTargetId || tokenTargetId !== targetId) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.end();
      return;
    }
    const target = this.targets.get(targetId);
    if (!target) {
      this.logService.warn(`[BrowserViewDebugProxy] Browser target not found: ${targetId}`);
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.end();
      return;
    }
    this.logService.debug(`[BrowserViewDebugProxy] WebSocket connected: ${pathname}`);
    const upgraded = upgradeToISocket(req, socket, {
      debugLabel: "browser-view-cdp-" + generateUuid(),
      enableMessageSplitting: false
    });
    if (!upgraded) {
      return;
    }
    const proxy = new CDPBrowserProxy(target);
    const disposables = this.wireWebSocket(upgraded, proxy);
    this._register(disposables);
    this._register(upgraded);
  }
  /**
   * Wire a WebSocket (ISocket) to an ICDPConnection bidirectionally.
   * Returns a DisposableStore that cleans up all subscriptions.
   */
  wireWebSocket(upgraded, connection) {
    const disposables = new DisposableStore();
    disposables.add(upgraded.onData((rawData) => {
      try {
        const message = rawData.toString();
        const { id, method, params, sessionId } = JSON.parse(message);
        this.logService.debug(`[BrowserViewDebugProxy] <- ${message}`);
        connection.sendMessage(method, params, sessionId).then((result) => {
          const response = { id, result, sessionId };
          const responseStr = JSON.stringify(response);
          this.logService.debug(`[BrowserViewDebugProxy] -> ${responseStr}`);
          upgraded.write(VSBuffer.fromString(responseStr));
        }).catch((error) => {
          const response = {
            id,
            error: {
              code: error instanceof CDPError ? error.code : CDPErrorCode.ServerError,
              message: error.message || "Unknown error"
            },
            sessionId
          };
          const responseStr = JSON.stringify(response);
          this.logService.debug(`[BrowserViewDebugProxy] -> ${responseStr}`);
          upgraded.write(VSBuffer.fromString(responseStr));
        });
      } catch (error) {
        this.logService.error("[BrowserViewDebugProxy] Error parsing message:", error);
        upgraded.end();
      }
    }));
    disposables.add(connection.onEvent((event) => {
      const eventStr = JSON.stringify(event);
      this.logService.debug(`[BrowserViewDebugProxy] -> ${eventStr}`);
      upgraded.write(VSBuffer.fromString(eventStr));
    }));
    disposables.add(connection.onClose(() => {
      this.logService.debug(`[BrowserViewDebugProxy] WebSocket closing`);
      upgraded.end();
    }));
    disposables.add(upgraded.onClose(() => {
      this.logService.debug(`[BrowserViewDebugProxy] WebSocket closed`);
      connection.dispose();
      disposables.dispose();
    }));
    return disposables;
  }
  dispose() {
    if (this.server) {
      this.server.close();
      this.server = void 0;
    }
    super.dispose();
  }
};
BrowserViewCDPProxyServer = __decorate([
  __param(0, ILogService)
], BrowserViewCDPProxyServer);
class TokenManager extends Disposable {
  static {
    __name(this, "TokenManager");
  }
  constructor() {
    super(...arguments);
    this.tokens = /* @__PURE__ */ new Map();
  }
  /**
   * Creates a short-lived, single-use token bound to a specific target.
   * The token is revoked once consumed or after 30 seconds.
   */
  async issueToken(details) {
    const token = this.makeToken();
    this.tokens.set(token, { details: Object.freeze(details), expiresAt: Date.now() + 3e4 });
    this._register(disposableTimeout(() => this.tokens.delete(token), 3e4));
    return token;
  }
  /**
   * Consume a token. Returns the details it was issued with, or
   * `undefined` if the token is invalid or expired.
   */
  consumeToken(token) {
    if (!token) {
      return void 0;
    }
    const info = this.tokens.get(token);
    if (!info) {
      return void 0;
    }
    this.tokens.delete(token);
    return Date.now() <= info.expiresAt ? info.details : void 0;
  }
  makeToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const binary = Array.from(bytes).map((b) => String.fromCharCode(b)).join("");
    const base64 = btoa(binary);
    const urlSafeToken = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    return urlSafeToken;
  }
}
export {
  BrowserViewCDPProxyServer,
  IBrowserViewCDPProxyServer
};
//# sourceMappingURL=browserViewCDPProxyServer.js.map
