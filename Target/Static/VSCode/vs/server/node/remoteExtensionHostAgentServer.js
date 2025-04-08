var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as crypto from "crypto";
import * as fs from "fs";
import * as http from "http";
import * as net from "net";
import { performance } from "perf_hooks";
import * as url from "url";
import { VSBuffer } from "../../base/common/buffer.js";
import { CharCode } from "../../base/common/charCode.js";
import { isSigPipeError, onUnexpectedError, setUnexpectedErrorHandler } from "../../base/common/errors.js";
import { isEqualOrParent } from "../../base/common/extpath.js";
import { Disposable, DisposableStore } from "../../base/common/lifecycle.js";
import { connectionTokenQueryName, FileAccess, getServerProductSegment, Schemas } from "../../base/common/network.js";
import { dirname, join } from "../../base/common/path.js";
import * as perf from "../../base/common/performance.js";
import * as platform from "../../base/common/platform.js";
import { createRegExp, escapeRegExpCharacters } from "../../base/common/strings.js";
import { URI } from "../../base/common/uri.js";
import { generateUuid } from "../../base/common/uuid.js";
import { getOSReleaseInfo } from "../../base/node/osReleaseInfo.js";
import { findFreePort } from "../../base/node/ports.js";
import { addUNCHostToAllowlist, disableUNCAccessRestrictions } from "../../base/node/unc.js";
import { PersistentProtocol } from "../../base/parts/ipc/common/ipc.net.js";
import { NodeSocket, WebSocketNodeSocket } from "../../base/parts/ipc/node/ipc.net.js";
import { IConfigurationService } from "../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../platform/log/common/log.js";
import { IProductService } from "../../platform/product/common/productService.js";
import { ConnectionType, ConnectionTypeRequest, ErrorMessage, HandshakeMessage, IRemoteExtensionHostStartParams, ITunnelConnectionStartParams, SignRequest } from "../../platform/remote/common/remoteAgentConnection.js";
import { RemoteAgentConnectionContext } from "../../platform/remote/common/remoteAgentEnvironment.js";
import { ITelemetryService } from "../../platform/telemetry/common/telemetry.js";
import { ExtensionHostConnection } from "./extensionHostConnection.js";
import { ManagementConnection } from "./remoteExtensionManagement.js";
import { determineServerConnectionToken, requestHasValidConnectionToken as httpRequestHasValidConnectionToken, ServerConnectionToken, ServerConnectionTokenParseError, ServerConnectionTokenType } from "./serverConnectionToken.js";
import { IServerEnvironmentService, ServerParsedArgs } from "./serverEnvironmentService.js";
import { setupServerServices, SocketServer } from "./serverServices.js";
import { CacheControl, serveError, serveFile, WebClientServer } from "./webClientServer.js";
import { createRequire } from "node:module";
const require2 = createRequire(import.meta.url);
const SHUTDOWN_TIMEOUT = 5 * 60 * 1e3;
let RemoteExtensionHostAgentServer = class extends Disposable {
  constructor(_socketServer, _connectionToken, _vsdaMod, hasWebClient, serverBasePath, _environmentService, _productService, _logService, _instantiationService) {
    super();
    this._socketServer = _socketServer;
    this._connectionToken = _connectionToken;
    this._vsdaMod = _vsdaMod;
    this._environmentService = _environmentService;
    this._productService = _productService;
    this._logService = _logService;
    this._instantiationService = _instantiationService;
    this._webEndpointOriginChecker = WebEndpointOriginChecker.create(this._productService);
    if (serverBasePath !== void 0 && serverBasePath.charCodeAt(serverBasePath.length - 1) === CharCode.Slash) {
      serverBasePath = serverBasePath.substring(0, serverBasePath.length - 1);
    }
    this._serverBasePath = serverBasePath;
    this._serverProductPath = `/${getServerProductSegment(_productService)}`;
    this._extHostConnections = /* @__PURE__ */ Object.create(null);
    this._managementConnections = /* @__PURE__ */ Object.create(null);
    this._allReconnectionTokens = /* @__PURE__ */ new Set();
    this._webClientServer = hasWebClient ? this._instantiationService.createInstance(WebClientServer, this._connectionToken, serverBasePath ?? "/", this._serverProductPath) : null;
    this._logService.info(`Extension host agent started.`);
    this._waitThenShutdown(true);
  }
  static {
    __name(this, "RemoteExtensionHostAgentServer");
  }
  _extHostConnections;
  _managementConnections;
  _allReconnectionTokens;
  _webClientServer;
  _webEndpointOriginChecker;
  _serverBasePath;
  _serverProductPath;
  shutdownTimer;
  async handleRequest(req, res) {
    if (req.method !== "GET") {
      return serveError(req, res, 405, `Unsupported method ${req.method}`);
    }
    if (!req.url) {
      return serveError(req, res, 400, `Bad request.`);
    }
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    if (!pathname) {
      return serveError(req, res, 400, `Bad request.`);
    }
    if (this._serverBasePath !== void 0 && pathname.startsWith(this._serverBasePath)) {
      pathname = pathname.substring(this._serverBasePath.length) || "/";
    }
    if (pathname.startsWith(this._serverProductPath) && pathname.charCodeAt(this._serverProductPath.length) === CharCode.Slash) {
      pathname = pathname.substring(this._serverProductPath.length);
    }
    if (pathname === "/version") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return void res.end(this._productService.commit || "");
    }
    if (pathname === "/delay-shutdown") {
      this._delayShutdown();
      res.writeHead(200);
      return void res.end("OK");
    }
    if (!httpRequestHasValidConnectionToken(this._connectionToken, req, parsedUrl)) {
      return serveError(req, res, 403, `Forbidden.`);
    }
    if (pathname === "/vscode-remote-resource") {
      const desiredPath = parsedUrl.query["path"];
      if (typeof desiredPath !== "string") {
        return serveError(req, res, 400, `Bad request.`);
      }
      let filePath;
      try {
        filePath = URI.from({ scheme: Schemas.file, path: desiredPath }).fsPath;
      } catch (err) {
        return serveError(req, res, 400, `Bad request.`);
      }
      const responseHeaders = /* @__PURE__ */ Object.create(null);
      if (this._environmentService.isBuilt) {
        if (isEqualOrParent(filePath, this._environmentService.builtinExtensionsPath, !platform.isLinux) || isEqualOrParent(filePath, this._environmentService.extensionsPath, !platform.isLinux)) {
          responseHeaders["Cache-Control"] = "public, max-age=31536000";
        }
      }
      responseHeaders["Vary"] = "Origin";
      const requestOrigin = req.headers["origin"];
      if (requestOrigin && this._webEndpointOriginChecker.matches(requestOrigin)) {
        responseHeaders["Access-Control-Allow-Origin"] = requestOrigin;
      }
      return serveFile(filePath, CacheControl.ETAG, this._logService, req, res, responseHeaders);
    }
    if (this._webClientServer) {
      this._webClientServer.handle(req, res, parsedUrl, pathname);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    return void res.end("Not found");
  }
  handleUpgrade(req, socket) {
    let reconnectionToken = generateUuid();
    let isReconnection = false;
    let skipWebSocketFrames = false;
    if (req.url) {
      const query = url.parse(req.url, true).query;
      if (typeof query.reconnectionToken === "string") {
        reconnectionToken = query.reconnectionToken;
      }
      if (query.reconnection === "true") {
        isReconnection = true;
      }
      if (query.skipWebSocketFrames === "true") {
        skipWebSocketFrames = true;
      }
    }
    if (req.headers["upgrade"] === void 0 || req.headers["upgrade"].toLowerCase() !== "websocket") {
      socket.end("HTTP/1.1 400 Bad Request");
      return;
    }
    const requestNonce = req.headers["sec-websocket-key"];
    const hash = crypto.createHash("sha1");
    hash.update(requestNonce + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
    const responseNonce = hash.digest("base64");
    const responseHeaders = [
      `HTTP/1.1 101 Switching Protocols`,
      `Upgrade: websocket`,
      `Connection: Upgrade`,
      `Sec-WebSocket-Accept: ${responseNonce}`
    ];
    let permessageDeflate = false;
    if (!skipWebSocketFrames && !this._environmentService.args["disable-websocket-compression"] && req.headers["sec-websocket-extensions"]) {
      const websocketExtensionOptions = Array.isArray(req.headers["sec-websocket-extensions"]) ? req.headers["sec-websocket-extensions"] : [req.headers["sec-websocket-extensions"]];
      for (const websocketExtensionOption of websocketExtensionOptions) {
        if (/\b((server_max_window_bits)|(server_no_context_takeover)|(client_no_context_takeover))\b/.test(websocketExtensionOption)) {
          continue;
        }
        if (/\b(permessage-deflate)\b/.test(websocketExtensionOption)) {
          permessageDeflate = true;
          responseHeaders.push(`Sec-WebSocket-Extensions: permessage-deflate`);
          break;
        }
        if (/\b(x-webkit-deflate-frame)\b/.test(websocketExtensionOption)) {
          permessageDeflate = true;
          responseHeaders.push(`Sec-WebSocket-Extensions: x-webkit-deflate-frame`);
          break;
        }
      }
    }
    socket.write(responseHeaders.join("\r\n") + "\r\n\r\n");
    socket.setTimeout(0);
    socket.setNoDelay(true);
    if (skipWebSocketFrames) {
      this._handleWebSocketConnection(new NodeSocket(socket, `server-connection-${reconnectionToken}`), isReconnection, reconnectionToken);
    } else {
      this._handleWebSocketConnection(new WebSocketNodeSocket(new NodeSocket(socket, `server-connection-${reconnectionToken}`), permessageDeflate, null, true), isReconnection, reconnectionToken);
    }
  }
  handleServerError(err) {
    this._logService.error(`Error occurred in server`);
    this._logService.error(err);
  }
  // Eventually cleanup
  _getRemoteAddress(socket) {
    let _socket;
    if (socket instanceof NodeSocket) {
      _socket = socket.socket;
    } else {
      _socket = socket.socket.socket;
    }
    return _socket.remoteAddress || `<unknown>`;
  }
  async _rejectWebSocketConnection(logPrefix, protocol, reason) {
    const socket = protocol.getSocket();
    this._logService.error(`${logPrefix} ${reason}.`);
    const errMessage = {
      type: "error",
      reason
    };
    protocol.sendControl(VSBuffer.fromString(JSON.stringify(errMessage)));
    protocol.dispose();
    await socket.drain();
    socket.dispose();
  }
  /**
   * NOTE: Avoid using await in this method!
   * The problem is that await introduces a process.nextTick due to the implicit Promise.then
   * This can lead to some bytes being received and interpreted and a control message being emitted before the next listener has a chance to be registered.
   */
  _handleWebSocketConnection(socket, isReconnection, reconnectionToken) {
    const remoteAddress = this._getRemoteAddress(socket);
    const logPrefix = `[${remoteAddress}][${reconnectionToken.substr(0, 8)}]`;
    const protocol = new PersistentProtocol({ socket });
    const validator = this._vsdaMod ? new this._vsdaMod.validator() : null;
    const signer = this._vsdaMod ? new this._vsdaMod.signer() : null;
    let State;
    ((State2) => {
      State2[State2["WaitingForAuth"] = 0] = "WaitingForAuth";
      State2[State2["WaitingForConnectionType"] = 1] = "WaitingForConnectionType";
      State2[State2["Done"] = 2] = "Done";
      State2[State2["Error"] = 3] = "Error";
    })(State || (State = {}));
    let state = 0 /* WaitingForAuth */;
    const rejectWebSocketConnection = /* @__PURE__ */ __name((msg) => {
      state = 3 /* Error */;
      listener.dispose();
      this._rejectWebSocketConnection(logPrefix, protocol, msg);
    }, "rejectWebSocketConnection");
    const listener = protocol.onControlMessage((raw) => {
      if (state === 0 /* WaitingForAuth */) {
        let msg1;
        try {
          msg1 = JSON.parse(raw.toString());
        } catch (err) {
          return rejectWebSocketConnection(`Malformed first message`);
        }
        if (msg1.type !== "auth") {
          return rejectWebSocketConnection(`Invalid first message`);
        }
        if (this._connectionToken.type === ServerConnectionTokenType.Mandatory && !this._connectionToken.validate(msg1.auth)) {
          return rejectWebSocketConnection(`Unauthorized client refused: auth mismatch`);
        }
        let signedData = generateUuid();
        if (signer) {
          try {
            signedData = signer.sign(msg1.data);
          } catch (e) {
          }
        }
        let someText = generateUuid();
        if (validator) {
          try {
            someText = validator.createNewMessage(someText);
          } catch (e) {
          }
        }
        const signRequest = {
          type: "sign",
          data: someText,
          signedData
        };
        protocol.sendControl(VSBuffer.fromString(JSON.stringify(signRequest)));
        state = 1 /* WaitingForConnectionType */;
      } else if (state === 1 /* WaitingForConnectionType */) {
        let msg2;
        try {
          msg2 = JSON.parse(raw.toString());
        } catch (err) {
          return rejectWebSocketConnection(`Malformed second message`);
        }
        if (msg2.type !== "connectionType") {
          return rejectWebSocketConnection(`Invalid second message`);
        }
        if (typeof msg2.signedData !== "string") {
          return rejectWebSocketConnection(`Invalid second message field type`);
        }
        const rendererCommit = msg2.commit;
        const myCommit = this._productService.commit;
        if (rendererCommit && myCommit) {
          if (rendererCommit !== myCommit) {
            return rejectWebSocketConnection(`Client refused: version mismatch`);
          }
        }
        let valid = false;
        if (!validator) {
          valid = true;
        } else if (this._connectionToken.validate(msg2.signedData)) {
          valid = true;
        } else {
          try {
            valid = validator.validate(msg2.signedData) === "ok";
          } catch (e) {
          }
        }
        if (!valid) {
          if (this._environmentService.isBuilt) {
            return rejectWebSocketConnection(`Unauthorized client refused`);
          } else {
            this._logService.error(`${logPrefix} Unauthorized client handshake failed but we proceed because of dev mode.`);
          }
        }
        for (const key in this._managementConnections) {
          const managementConnection = this._managementConnections[key];
          managementConnection.shortenReconnectionGraceTimeIfNecessary();
        }
        for (const key in this._extHostConnections) {
          const extHostConnection = this._extHostConnections[key];
          extHostConnection.shortenReconnectionGraceTimeIfNecessary();
        }
        state = 2 /* Done */;
        listener.dispose();
        this._handleConnectionType(remoteAddress, logPrefix, protocol, socket, isReconnection, reconnectionToken, msg2);
      }
    });
  }
  async _handleConnectionType(remoteAddress, _logPrefix, protocol, socket, isReconnection, reconnectionToken, msg) {
    const logPrefix = msg.desiredConnectionType === ConnectionType.Management ? `${_logPrefix}[ManagementConnection]` : msg.desiredConnectionType === ConnectionType.ExtensionHost ? `${_logPrefix}[ExtensionHostConnection]` : _logPrefix;
    if (msg.desiredConnectionType === ConnectionType.Management) {
      if (isReconnection) {
        if (!this._managementConnections[reconnectionToken]) {
          if (!this._allReconnectionTokens.has(reconnectionToken)) {
            return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown reconnection token (never seen)`);
          } else {
            return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown reconnection token (seen before)`);
          }
        }
        protocol.sendControl(VSBuffer.fromString(JSON.stringify({ type: "ok" })));
        const dataChunk = protocol.readEntireBuffer();
        protocol.dispose();
        this._managementConnections[reconnectionToken].acceptReconnection(remoteAddress, socket, dataChunk);
      } else {
        if (this._managementConnections[reconnectionToken]) {
          return this._rejectWebSocketConnection(logPrefix, protocol, `Duplicate reconnection token`);
        }
        protocol.sendControl(VSBuffer.fromString(JSON.stringify({ type: "ok" })));
        const con = new ManagementConnection(this._logService, reconnectionToken, remoteAddress, protocol);
        this._socketServer.acceptConnection(con.protocol, con.onClose);
        this._managementConnections[reconnectionToken] = con;
        this._allReconnectionTokens.add(reconnectionToken);
        con.onClose(() => {
          delete this._managementConnections[reconnectionToken];
        });
      }
    } else if (msg.desiredConnectionType === ConnectionType.ExtensionHost) {
      const startParams0 = msg.args || { language: "en" };
      const startParams = await this._updateWithFreeDebugPort(startParams0);
      if (startParams.port) {
        this._logService.trace(`${logPrefix} - startParams debug port ${startParams.port}`);
      }
      this._logService.trace(`${logPrefix} - startParams language: ${startParams.language}`);
      this._logService.trace(`${logPrefix} - startParams env: ${JSON.stringify(startParams.env)}`);
      if (isReconnection) {
        if (!this._extHostConnections[reconnectionToken]) {
          if (!this._allReconnectionTokens.has(reconnectionToken)) {
            return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown reconnection token (never seen)`);
          } else {
            return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown reconnection token (seen before)`);
          }
        }
        protocol.sendPause();
        protocol.sendControl(VSBuffer.fromString(JSON.stringify(startParams.port ? { debugPort: startParams.port } : {})));
        const dataChunk = protocol.readEntireBuffer();
        protocol.dispose();
        this._extHostConnections[reconnectionToken].acceptReconnection(remoteAddress, socket, dataChunk);
      } else {
        if (this._extHostConnections[reconnectionToken]) {
          return this._rejectWebSocketConnection(logPrefix, protocol, `Duplicate reconnection token`);
        }
        protocol.sendPause();
        protocol.sendControl(VSBuffer.fromString(JSON.stringify(startParams.port ? { debugPort: startParams.port } : {})));
        const dataChunk = protocol.readEntireBuffer();
        protocol.dispose();
        const con = this._instantiationService.createInstance(ExtensionHostConnection, reconnectionToken, remoteAddress, socket, dataChunk);
        this._extHostConnections[reconnectionToken] = con;
        this._allReconnectionTokens.add(reconnectionToken);
        con.onClose(() => {
          con.dispose();
          delete this._extHostConnections[reconnectionToken];
          this._onDidCloseExtHostConnection();
        });
        con.start(startParams);
      }
    } else if (msg.desiredConnectionType === ConnectionType.Tunnel) {
      const tunnelStartParams = msg.args;
      this._createTunnel(protocol, tunnelStartParams);
    } else {
      return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown initial data received`);
    }
  }
  async _createTunnel(protocol, tunnelStartParams) {
    const remoteSocket = protocol.getSocket().socket;
    const dataChunk = protocol.readEntireBuffer();
    protocol.dispose();
    remoteSocket.pause();
    const localSocket = await this._connectTunnelSocket(tunnelStartParams.host, tunnelStartParams.port);
    if (dataChunk.byteLength > 0) {
      localSocket.write(dataChunk.buffer);
    }
    localSocket.on("end", () => remoteSocket.end());
    localSocket.on("close", () => remoteSocket.end());
    localSocket.on("error", () => remoteSocket.destroy());
    remoteSocket.on("end", () => localSocket.end());
    remoteSocket.on("close", () => localSocket.end());
    remoteSocket.on("error", () => localSocket.destroy());
    localSocket.pipe(remoteSocket);
    remoteSocket.pipe(localSocket);
  }
  _connectTunnelSocket(host, port) {
    return new Promise((c, e) => {
      const socket = net.createConnection(
        {
          host,
          port,
          autoSelectFamily: true
        },
        () => {
          socket.removeListener("error", e);
          socket.pause();
          c(socket);
        }
      );
      socket.once("error", e);
    });
  }
  _updateWithFreeDebugPort(startParams) {
    if (typeof startParams.port === "number") {
      return findFreePort(
        startParams.port,
        10,
        5e3
        /* try up to 5 seconds */
      ).then((freePort) => {
        startParams.port = freePort;
        return startParams;
      });
    }
    startParams.debugId = void 0;
    startParams.port = void 0;
    startParams.break = void 0;
    return Promise.resolve(startParams);
  }
  async _onDidCloseExtHostConnection() {
    if (!this._environmentService.args["enable-remote-auto-shutdown"]) {
      return;
    }
    this._cancelShutdown();
    const hasActiveExtHosts = !!Object.keys(this._extHostConnections).length;
    if (!hasActiveExtHosts) {
      console.log("Last EH closed, waiting before shutting down");
      this._logService.info("Last EH closed, waiting before shutting down");
      this._waitThenShutdown();
    }
  }
  _waitThenShutdown(initial = false) {
    if (!this._environmentService.args["enable-remote-auto-shutdown"]) {
      return;
    }
    if (this._environmentService.args["remote-auto-shutdown-without-delay"] && !initial) {
      this._shutdown();
    } else {
      this.shutdownTimer = setTimeout(() => {
        this.shutdownTimer = void 0;
        this._shutdown();
      }, SHUTDOWN_TIMEOUT);
    }
  }
  _shutdown() {
    const hasActiveExtHosts = !!Object.keys(this._extHostConnections).length;
    if (hasActiveExtHosts) {
      console.log("New EH opened, aborting shutdown");
      this._logService.info("New EH opened, aborting shutdown");
      return;
    } else {
      console.log("Last EH closed, shutting down");
      this._logService.info("Last EH closed, shutting down");
      this.dispose();
      process.exit(0);
    }
  }
  /**
   * If the server is in a shutdown timeout, cancel it and start over
   */
  _delayShutdown() {
    if (this.shutdownTimer) {
      console.log("Got delay-shutdown request while in shutdown timeout, delaying");
      this._logService.info("Got delay-shutdown request while in shutdown timeout, delaying");
      this._cancelShutdown();
      this._waitThenShutdown();
    }
  }
  _cancelShutdown() {
    if (this.shutdownTimer) {
      console.log("Cancelling previous shutdown timeout");
      this._logService.info("Cancelling previous shutdown timeout");
      clearTimeout(this.shutdownTimer);
      this.shutdownTimer = void 0;
    }
  }
};
RemoteExtensionHostAgentServer = __decorateClass([
  __decorateParam(5, IServerEnvironmentService),
  __decorateParam(6, IProductService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IInstantiationService)
], RemoteExtensionHostAgentServer);
async function createServer(address, args, REMOTE_DATA_FOLDER) {
  const connectionToken = await determineServerConnectionToken(args);
  if (connectionToken instanceof ServerConnectionTokenParseError) {
    console.warn(connectionToken.message);
    process.exit(1);
  }
  function initUnexpectedErrorHandler(handler) {
    setUnexpectedErrorHandler((err) => {
      if (isSigPipeError(err) && err.stack && /unexpectedErrorHandler/.test(err.stack)) {
        return;
      }
      handler(err);
    });
  }
  __name(initUnexpectedErrorHandler, "initUnexpectedErrorHandler");
  const unloggedErrors = [];
  initUnexpectedErrorHandler((error) => {
    unloggedErrors.push(error);
    console.error(error);
  });
  let didLogAboutSIGPIPE = false;
  process.on("SIGPIPE", () => {
    if (!didLogAboutSIGPIPE) {
      didLogAboutSIGPIPE = true;
      onUnexpectedError(new Error(`Unexpected SIGPIPE`));
    }
  });
  const disposables = new DisposableStore();
  const { socketServer, instantiationService } = await setupServerServices(connectionToken, args, REMOTE_DATA_FOLDER, disposables);
  instantiationService.invokeFunction((accessor) => {
    const logService = accessor.get(ILogService);
    unloggedErrors.forEach((error) => logService.error(error));
    unloggedErrors.length = 0;
    initUnexpectedErrorHandler((error) => logService.error(error));
  });
  instantiationService.invokeFunction((accessor) => {
    const configurationService = accessor.get(IConfigurationService);
    if (platform.isWindows) {
      if (configurationService.getValue("security.restrictUNCAccess") === false) {
        disableUNCAccessRestrictions();
      } else {
        addUNCHostToAllowlist(configurationService.getValue("security.allowedUNCHosts"));
      }
    }
  });
  instantiationService.invokeFunction((accessor) => {
    const logService = accessor.get(ILogService);
    if (platform.isWindows && process.env.HOMEDRIVE && process.env.HOMEPATH) {
      const homeDirModulesPath = join(process.env.HOMEDRIVE, "node_modules");
      const userDir = dirname(join(process.env.HOMEDRIVE, process.env.HOMEPATH));
      const userDirModulesPath = join(userDir, "node_modules");
      if (fs.existsSync(homeDirModulesPath) || fs.existsSync(userDirModulesPath)) {
        const message = `

*
* !!!! Server terminated due to presence of CVE-2020-1416 !!!!
*
* Please remove the following directories and re-try
* ${homeDirModulesPath}
* ${userDirModulesPath}
*
* For more information on the vulnerability https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-1416
*

`;
        logService.warn(message);
        console.warn(message);
        process.exit(0);
      }
    }
  });
  const vsdaMod = instantiationService.invokeFunction((accessor) => {
    const logService = accessor.get(ILogService);
    const hasVSDA = fs.existsSync(join(FileAccess.asFileUri("").fsPath, "../node_modules/vsda"));
    if (hasVSDA) {
      try {
        return require2("vsda");
      } catch (err) {
        logService.error(err);
      }
    }
    return null;
  });
  let serverBasePath = args["server-base-path"];
  if (serverBasePath && !serverBasePath.startsWith("/")) {
    serverBasePath = `/${serverBasePath}`;
  }
  const hasWebClient = fs.existsSync(FileAccess.asFileUri(`vs/code/browser/workbench/workbench.html`).fsPath);
  if (hasWebClient && address && typeof address !== "string") {
    const queryPart = connectionToken.type !== ServerConnectionTokenType.None ? `?${connectionTokenQueryName}=${connectionToken.value}` : "";
    console.log(`Web UI available at http://localhost${address.port === 80 ? "" : `:${address.port}`}${serverBasePath ?? ""}${queryPart}`);
  }
  const remoteExtensionHostAgentServer = instantiationService.createInstance(RemoteExtensionHostAgentServer, socketServer, connectionToken, vsdaMod, hasWebClient, serverBasePath);
  perf.mark("code/server/ready");
  const currentTime = performance.now();
  const vscodeServerStartTime = global.vscodeServerStartTime;
  const vscodeServerListenTime = global.vscodeServerListenTime;
  const vscodeServerCodeLoadedTime = global.vscodeServerCodeLoadedTime;
  instantiationService.invokeFunction(async (accessor) => {
    const telemetryService = accessor.get(ITelemetryService);
    telemetryService.publicLog2("serverStart", {
      startTime: vscodeServerStartTime,
      startedTime: vscodeServerListenTime,
      codeLoadedTime: vscodeServerCodeLoadedTime,
      readyTime: currentTime
    });
    if (platform.isLinux) {
      const logService = accessor.get(ILogService);
      const releaseInfo = await getOSReleaseInfo(logService.error.bind(logService));
      if (releaseInfo) {
        telemetryService.publicLog2("serverPlatformInfo", {
          platformId: releaseInfo.id,
          platformVersionId: releaseInfo.version_id,
          platformIdLike: releaseInfo.id_like
        });
      }
    }
  });
  if (args["print-startup-performance"]) {
    let output = "";
    output += `Start-up time: ${vscodeServerListenTime - vscodeServerStartTime}
`;
    output += `Code loading time: ${vscodeServerCodeLoadedTime - vscodeServerStartTime}
`;
    output += `Initialized time: ${currentTime - vscodeServerStartTime}
`;
    output += `
`;
    console.log(output);
  }
  return remoteExtensionHostAgentServer;
}
__name(createServer, "createServer");
class WebEndpointOriginChecker {
  constructor(_originRegExp) {
    this._originRegExp = _originRegExp;
  }
  static {
    __name(this, "WebEndpointOriginChecker");
  }
  static create(productService) {
    const webEndpointUrlTemplate = productService.webEndpointUrlTemplate;
    const commit = productService.commit;
    const quality = productService.quality;
    if (!webEndpointUrlTemplate || !commit || !quality) {
      return new WebEndpointOriginChecker(null);
    }
    const uuid = generateUuid();
    const exampleUrl = new URL(
      webEndpointUrlTemplate.replace("{{uuid}}", uuid).replace("{{commit}}", commit).replace("{{quality}}", quality)
    );
    const exampleOrigin = exampleUrl.origin;
    const originRegExpSource = escapeRegExpCharacters(exampleOrigin).replace(uuid, "[a-zA-Z0-9\\-]+");
    try {
      const originRegExp = createRegExp(`^${originRegExpSource}$`, true, { matchCase: false });
      return new WebEndpointOriginChecker(originRegExp);
    } catch (err) {
      return new WebEndpointOriginChecker(null);
    }
  }
  matches(origin) {
    if (!this._originRegExp) {
      return false;
    }
    return this._originRegExp.test(origin);
  }
}
export {
  createServer
};
//# sourceMappingURL=remoteExtensionHostAgentServer.js.map
