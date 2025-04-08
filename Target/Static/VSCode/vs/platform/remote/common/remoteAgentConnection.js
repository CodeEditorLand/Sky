var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancelablePromise, createCancelablePromise, promiseWithResolvers } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken, CancellationTokenSource } from "../../../base/common/cancellation.js";
import { isCancellationError, onUnexpectedError } from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { RemoteAuthorities } from "../../../base/common/network.js";
import * as performance from "../../../base/common/performance.js";
import { StopWatch } from "../../../base/common/stopwatch.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { IIPCLogger } from "../../../base/parts/ipc/common/ipc.js";
import { Client, ISocket, PersistentProtocol, SocketCloseEventType } from "../../../base/parts/ipc/common/ipc.net.js";
import { ILogService } from "../../log/common/log.js";
import { RemoteAgentConnectionContext } from "./remoteAgentEnvironment.js";
import { RemoteAuthorityResolverError, RemoteConnection } from "./remoteAuthorityResolver.js";
import { IRemoteSocketFactoryService } from "./remoteSocketFactoryService.js";
import { ISignService } from "../../sign/common/sign.js";
const RECONNECT_TIMEOUT = 30 * 1e3;
var ConnectionType = /* @__PURE__ */ ((ConnectionType2) => {
  ConnectionType2[ConnectionType2["Management"] = 1] = "Management";
  ConnectionType2[ConnectionType2["ExtensionHost"] = 2] = "ExtensionHost";
  ConnectionType2[ConnectionType2["Tunnel"] = 3] = "Tunnel";
  return ConnectionType2;
})(ConnectionType || {});
function connectionTypeToString(connectionType) {
  switch (connectionType) {
    case 1 /* Management */:
      return "Management";
    case 2 /* ExtensionHost */:
      return "ExtensionHost";
    case 3 /* Tunnel */:
      return "Tunnel";
  }
}
__name(connectionTypeToString, "connectionTypeToString");
function createTimeoutCancellation(millis) {
  const source = new CancellationTokenSource();
  setTimeout(() => source.cancel(), millis);
  return source.token;
}
__name(createTimeoutCancellation, "createTimeoutCancellation");
function combineTimeoutCancellation(a, b) {
  if (a.isCancellationRequested || b.isCancellationRequested) {
    return CancellationToken.Cancelled;
  }
  const source = new CancellationTokenSource();
  a.onCancellationRequested(() => source.cancel());
  b.onCancellationRequested(() => source.cancel());
  return source.token;
}
__name(combineTimeoutCancellation, "combineTimeoutCancellation");
class PromiseWithTimeout {
  static {
    __name(this, "PromiseWithTimeout");
  }
  _state;
  _disposables;
  promise;
  _resolvePromise;
  _rejectPromise;
  get didTimeout() {
    return this._state === "timedout";
  }
  constructor(timeoutCancellationToken) {
    this._state = "pending";
    this._disposables = new DisposableStore();
    ({ promise: this.promise, resolve: this._resolvePromise, reject: this._rejectPromise } = promiseWithResolvers());
    if (timeoutCancellationToken.isCancellationRequested) {
      this._timeout();
    } else {
      this._disposables.add(timeoutCancellationToken.onCancellationRequested(() => this._timeout()));
    }
  }
  registerDisposable(disposable) {
    if (this._state === "pending") {
      this._disposables.add(disposable);
    } else {
      disposable.dispose();
    }
  }
  _timeout() {
    if (this._state !== "pending") {
      return;
    }
    this._disposables.dispose();
    this._state = "timedout";
    this._rejectPromise(this._createTimeoutError());
  }
  _createTimeoutError() {
    const err = new Error("Time limit reached");
    err.code = "ETIMEDOUT";
    err.syscall = "connect";
    return err;
  }
  resolve(value) {
    if (this._state !== "pending") {
      return;
    }
    this._disposables.dispose();
    this._state = "resolved";
    this._resolvePromise(value);
  }
  reject(err) {
    if (this._state !== "pending") {
      return;
    }
    this._disposables.dispose();
    this._state = "rejected";
    this._rejectPromise(err);
  }
}
function readOneControlMessage(protocol, timeoutCancellationToken) {
  const result = new PromiseWithTimeout(timeoutCancellationToken);
  result.registerDisposable(protocol.onControlMessage((raw) => {
    const msg = JSON.parse(raw.toString());
    const error = getErrorFromMessage(msg);
    if (error) {
      result.reject(error);
    } else {
      result.resolve(msg);
    }
  }));
  return result.promise;
}
__name(readOneControlMessage, "readOneControlMessage");
function createSocket(logService, remoteSocketFactoryService, connectTo, path, query, debugConnectionType, debugLabel, timeoutCancellationToken) {
  const result = new PromiseWithTimeout(timeoutCancellationToken);
  const sw = StopWatch.create(false);
  logService.info(`Creating a socket (${debugLabel})...`);
  performance.mark(`code/willCreateSocket/${debugConnectionType}`);
  remoteSocketFactoryService.connect(connectTo, path, query, debugLabel).then((socket) => {
    if (result.didTimeout) {
      performance.mark(`code/didCreateSocketError/${debugConnectionType}`);
      logService.info(`Creating a socket (${debugLabel}) finished after ${sw.elapsed()} ms, but this is too late and has timed out already.`);
      socket?.dispose();
    } else {
      performance.mark(`code/didCreateSocketOK/${debugConnectionType}`);
      logService.info(`Creating a socket (${debugLabel}) was successful after ${sw.elapsed()} ms.`);
      result.resolve(socket);
    }
  }, (err) => {
    performance.mark(`code/didCreateSocketError/${debugConnectionType}`);
    logService.info(`Creating a socket (${debugLabel}) returned an error after ${sw.elapsed()} ms.`);
    logService.error(err);
    result.reject(err);
  });
  return result.promise;
}
__name(createSocket, "createSocket");
function raceWithTimeoutCancellation(promise, timeoutCancellationToken) {
  const result = new PromiseWithTimeout(timeoutCancellationToken);
  promise.then(
    (res) => {
      if (!result.didTimeout) {
        result.resolve(res);
      }
    },
    (err) => {
      if (!result.didTimeout) {
        result.reject(err);
      }
    }
  );
  return result.promise;
}
__name(raceWithTimeoutCancellation, "raceWithTimeoutCancellation");
async function connectToRemoteExtensionHostAgent(options, connectionType, args, timeoutCancellationToken) {
  const logPrefix = connectLogPrefix(options, connectionType);
  options.logService.trace(`${logPrefix} 1/6. invoking socketFactory.connect().`);
  let socket;
  try {
    socket = await createSocket(options.logService, options.remoteSocketFactoryService, options.connectTo, RemoteAuthorities.getServerRootPath(), `reconnectionToken=${options.reconnectionToken}&reconnection=${options.reconnectionProtocol ? "true" : "false"}`, connectionTypeToString(connectionType), `renderer-${connectionTypeToString(connectionType)}-${options.reconnectionToken}`, timeoutCancellationToken);
  } catch (error) {
    options.logService.error(`${logPrefix} socketFactory.connect() failed or timed out. Error:`);
    options.logService.error(error);
    throw error;
  }
  options.logService.trace(`${logPrefix} 2/6. socketFactory.connect() was successful.`);
  let protocol;
  let ownsProtocol;
  if (options.reconnectionProtocol) {
    options.reconnectionProtocol.beginAcceptReconnection(socket, null);
    protocol = options.reconnectionProtocol;
    ownsProtocol = false;
  } else {
    protocol = new PersistentProtocol({ socket });
    ownsProtocol = true;
  }
  options.logService.trace(`${logPrefix} 3/6. sending AuthRequest control message.`);
  const message = await raceWithTimeoutCancellation(options.signService.createNewMessage(generateUuid()), timeoutCancellationToken);
  const authRequest = {
    type: "auth",
    auth: options.connectionToken || "00000000000000000000",
    data: message.data
  };
  protocol.sendControl(VSBuffer.fromString(JSON.stringify(authRequest)));
  try {
    const msg = await readOneControlMessage(protocol, combineTimeoutCancellation(timeoutCancellationToken, createTimeoutCancellation(1e4)));
    if (msg.type !== "sign" || typeof msg.data !== "string") {
      const error = new Error("Unexpected handshake message");
      error.code = "VSCODE_CONNECTION_ERROR";
      throw error;
    }
    options.logService.trace(`${logPrefix} 4/6. received SignRequest control message.`);
    const isValid = await raceWithTimeoutCancellation(options.signService.validate(message, msg.signedData), timeoutCancellationToken);
    if (!isValid) {
      const error = new Error("Refused to connect to unsupported server");
      error.code = "VSCODE_CONNECTION_ERROR";
      throw error;
    }
    const signed = await raceWithTimeoutCancellation(options.signService.sign(msg.data), timeoutCancellationToken);
    const connTypeRequest = {
      type: "connectionType",
      commit: options.commit,
      signedData: signed,
      desiredConnectionType: connectionType
    };
    if (args) {
      connTypeRequest.args = args;
    }
    options.logService.trace(`${logPrefix} 5/6. sending ConnectionTypeRequest control message.`);
    protocol.sendControl(VSBuffer.fromString(JSON.stringify(connTypeRequest)));
    return { protocol, ownsProtocol };
  } catch (error) {
    if (error && error.code === "ETIMEDOUT") {
      options.logService.error(`${logPrefix} the handshake timed out. Error:`);
      options.logService.error(error);
    }
    if (error && error.code === "VSCODE_CONNECTION_ERROR") {
      options.logService.error(`${logPrefix} received error control message when negotiating connection. Error:`);
      options.logService.error(error);
    }
    if (ownsProtocol) {
      safeDisposeProtocolAndSocket(protocol);
    }
    throw error;
  }
}
__name(connectToRemoteExtensionHostAgent, "connectToRemoteExtensionHostAgent");
async function connectToRemoteExtensionHostAgentAndReadOneMessage(options, connectionType, args, timeoutCancellationToken) {
  const startTime = Date.now();
  const logPrefix = connectLogPrefix(options, connectionType);
  const { protocol, ownsProtocol } = await connectToRemoteExtensionHostAgent(options, connectionType, args, timeoutCancellationToken);
  const result = new PromiseWithTimeout(timeoutCancellationToken);
  result.registerDisposable(protocol.onControlMessage((raw) => {
    const msg = JSON.parse(raw.toString());
    const error = getErrorFromMessage(msg);
    if (error) {
      options.logService.error(`${logPrefix} received error control message when negotiating connection. Error:`);
      options.logService.error(error);
      if (ownsProtocol) {
        safeDisposeProtocolAndSocket(protocol);
      }
      result.reject(error);
    } else {
      options.reconnectionProtocol?.endAcceptReconnection();
      options.logService.trace(`${logPrefix} 6/6. handshake finished, connection is up and running after ${logElapsed(startTime)}!`);
      result.resolve({ protocol, firstMessage: msg });
    }
  }));
  return result.promise;
}
__name(connectToRemoteExtensionHostAgentAndReadOneMessage, "connectToRemoteExtensionHostAgentAndReadOneMessage");
async function doConnectRemoteAgentManagement(options, timeoutCancellationToken) {
  const { protocol } = await connectToRemoteExtensionHostAgentAndReadOneMessage(options, 1 /* Management */, void 0, timeoutCancellationToken);
  return { protocol };
}
__name(doConnectRemoteAgentManagement, "doConnectRemoteAgentManagement");
async function doConnectRemoteAgentExtensionHost(options, startArguments, timeoutCancellationToken) {
  const { protocol, firstMessage } = await connectToRemoteExtensionHostAgentAndReadOneMessage(options, 2 /* ExtensionHost */, startArguments, timeoutCancellationToken);
  const debugPort = firstMessage && firstMessage.debugPort;
  return { protocol, debugPort };
}
__name(doConnectRemoteAgentExtensionHost, "doConnectRemoteAgentExtensionHost");
async function doConnectRemoteAgentTunnel(options, startParams, timeoutCancellationToken) {
  const startTime = Date.now();
  const logPrefix = connectLogPrefix(options, 3 /* Tunnel */);
  const { protocol } = await connectToRemoteExtensionHostAgent(options, 3 /* Tunnel */, startParams, timeoutCancellationToken);
  options.logService.trace(`${logPrefix} 6/6. handshake finished, connection is up and running after ${logElapsed(startTime)}!`);
  return protocol;
}
__name(doConnectRemoteAgentTunnel, "doConnectRemoteAgentTunnel");
async function resolveConnectionOptions(options, reconnectionToken, reconnectionProtocol) {
  const { connectTo, connectionToken } = await options.addressProvider.getAddress();
  return {
    commit: options.commit,
    quality: options.quality,
    connectTo,
    connectionToken,
    reconnectionToken,
    reconnectionProtocol,
    remoteSocketFactoryService: options.remoteSocketFactoryService,
    signService: options.signService,
    logService: options.logService
  };
}
__name(resolveConnectionOptions, "resolveConnectionOptions");
async function connectRemoteAgentManagement(options, remoteAuthority, clientId) {
  return createInitialConnection(
    options,
    async (simpleOptions) => {
      const { protocol } = await doConnectRemoteAgentManagement(simpleOptions, CancellationToken.None);
      return new ManagementPersistentConnection(options, remoteAuthority, clientId, simpleOptions.reconnectionToken, protocol);
    }
  );
}
__name(connectRemoteAgentManagement, "connectRemoteAgentManagement");
async function connectRemoteAgentExtensionHost(options, startArguments) {
  return createInitialConnection(
    options,
    async (simpleOptions) => {
      const { protocol, debugPort } = await doConnectRemoteAgentExtensionHost(simpleOptions, startArguments, CancellationToken.None);
      return new ExtensionHostPersistentConnection(options, startArguments, simpleOptions.reconnectionToken, protocol, debugPort);
    }
  );
}
__name(connectRemoteAgentExtensionHost, "connectRemoteAgentExtensionHost");
async function createInitialConnection(options, connectionFactory) {
  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; ; attempt++) {
    try {
      const reconnectionToken = generateUuid();
      const simpleOptions = await resolveConnectionOptions(options, reconnectionToken, null);
      const result = await connectionFactory(simpleOptions);
      return result;
    } catch (err) {
      if (attempt < MAX_ATTEMPTS) {
        options.logService.error(`[remote-connection][attempt ${attempt}] An error occurred in initial connection! Will retry... Error:`);
        options.logService.error(err);
      } else {
        options.logService.error(`[remote-connection][attempt ${attempt}]  An error occurred in initial connection! It will be treated as a permanent error. Error:`);
        options.logService.error(err);
        PersistentConnection.triggerPermanentFailure(0, 0, RemoteAuthorityResolverError.isHandled(err));
        throw err;
      }
    }
  }
}
__name(createInitialConnection, "createInitialConnection");
async function connectRemoteAgentTunnel(options, tunnelRemoteHost, tunnelRemotePort) {
  const simpleOptions = await resolveConnectionOptions(options, generateUuid(), null);
  const protocol = await doConnectRemoteAgentTunnel(simpleOptions, { host: tunnelRemoteHost, port: tunnelRemotePort }, CancellationToken.None);
  return protocol;
}
__name(connectRemoteAgentTunnel, "connectRemoteAgentTunnel");
function sleep(seconds) {
  return createCancelablePromise((token) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, seconds * 1e3);
      token.onCancellationRequested(() => {
        clearTimeout(timeout);
        resolve();
      });
    });
  });
}
__name(sleep, "sleep");
var PersistentConnectionEventType = /* @__PURE__ */ ((PersistentConnectionEventType2) => {
  PersistentConnectionEventType2[PersistentConnectionEventType2["ConnectionLost"] = 0] = "ConnectionLost";
  PersistentConnectionEventType2[PersistentConnectionEventType2["ReconnectionWait"] = 1] = "ReconnectionWait";
  PersistentConnectionEventType2[PersistentConnectionEventType2["ReconnectionRunning"] = 2] = "ReconnectionRunning";
  PersistentConnectionEventType2[PersistentConnectionEventType2["ReconnectionPermanentFailure"] = 3] = "ReconnectionPermanentFailure";
  PersistentConnectionEventType2[PersistentConnectionEventType2["ConnectionGain"] = 4] = "ConnectionGain";
  return PersistentConnectionEventType2;
})(PersistentConnectionEventType || {});
class ConnectionLostEvent {
  constructor(reconnectionToken, millisSinceLastIncomingData) {
    this.reconnectionToken = reconnectionToken;
    this.millisSinceLastIncomingData = millisSinceLastIncomingData;
  }
  static {
    __name(this, "ConnectionLostEvent");
  }
  type = 0 /* ConnectionLost */;
}
class ReconnectionWaitEvent {
  constructor(reconnectionToken, millisSinceLastIncomingData, durationSeconds, cancellableTimer) {
    this.reconnectionToken = reconnectionToken;
    this.millisSinceLastIncomingData = millisSinceLastIncomingData;
    this.durationSeconds = durationSeconds;
    this.cancellableTimer = cancellableTimer;
  }
  static {
    __name(this, "ReconnectionWaitEvent");
  }
  type = 1 /* ReconnectionWait */;
  skipWait() {
    this.cancellableTimer.cancel();
  }
}
class ReconnectionRunningEvent {
  constructor(reconnectionToken, millisSinceLastIncomingData, attempt) {
    this.reconnectionToken = reconnectionToken;
    this.millisSinceLastIncomingData = millisSinceLastIncomingData;
    this.attempt = attempt;
  }
  static {
    __name(this, "ReconnectionRunningEvent");
  }
  type = 2 /* ReconnectionRunning */;
}
class ConnectionGainEvent {
  constructor(reconnectionToken, millisSinceLastIncomingData, attempt) {
    this.reconnectionToken = reconnectionToken;
    this.millisSinceLastIncomingData = millisSinceLastIncomingData;
    this.attempt = attempt;
  }
  static {
    __name(this, "ConnectionGainEvent");
  }
  type = 4 /* ConnectionGain */;
}
class ReconnectionPermanentFailureEvent {
  constructor(reconnectionToken, millisSinceLastIncomingData, attempt, handled) {
    this.reconnectionToken = reconnectionToken;
    this.millisSinceLastIncomingData = millisSinceLastIncomingData;
    this.attempt = attempt;
    this.handled = handled;
  }
  static {
    __name(this, "ReconnectionPermanentFailureEvent");
  }
  type = 3 /* ReconnectionPermanentFailure */;
}
class PersistentConnection extends Disposable {
  constructor(_connectionType, _options, reconnectionToken, protocol, _reconnectionFailureIsFatal) {
    super();
    this._connectionType = _connectionType;
    this._options = _options;
    this.reconnectionToken = reconnectionToken;
    this.protocol = protocol;
    this._reconnectionFailureIsFatal = _reconnectionFailureIsFatal;
    this._onDidStateChange.fire(new ConnectionGainEvent(this.reconnectionToken, 0, 0));
    this._register(protocol.onSocketClose((e) => {
      const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
      if (!e) {
        this._options.logService.info(`${logPrefix} received socket close event.`);
      } else if (e.type === SocketCloseEventType.NodeSocketCloseEvent) {
        this._options.logService.info(`${logPrefix} received socket close event (hadError: ${e.hadError}).`);
        if (e.error) {
          this._options.logService.error(e.error);
        }
      } else {
        this._options.logService.info(`${logPrefix} received socket close event (wasClean: ${e.wasClean}, code: ${e.code}, reason: ${e.reason}).`);
        if (e.event) {
          this._options.logService.error(e.event);
        }
      }
      this._beginReconnecting();
    }));
    this._register(protocol.onSocketTimeout((e) => {
      const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
      this._options.logService.info(`${logPrefix} received socket timeout event (unacknowledgedMsgCount: ${e.unacknowledgedMsgCount}, timeSinceOldestUnacknowledgedMsg: ${e.timeSinceOldestUnacknowledgedMsg}, timeSinceLastReceivedSomeData: ${e.timeSinceLastReceivedSomeData}).`);
      this._beginReconnecting();
    }));
    PersistentConnection._instances.push(this);
    this._register(toDisposable(() => {
      const myIndex = PersistentConnection._instances.indexOf(this);
      if (myIndex >= 0) {
        PersistentConnection._instances.splice(myIndex, 1);
      }
    }));
    if (this._isPermanentFailure) {
      this._gotoPermanentFailure(PersistentConnection._permanentFailureMillisSinceLastIncomingData, PersistentConnection._permanentFailureAttempt, PersistentConnection._permanentFailureHandled);
    }
  }
  static {
    __name(this, "PersistentConnection");
  }
  static triggerPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
    this._permanentFailure = true;
    this._permanentFailureMillisSinceLastIncomingData = millisSinceLastIncomingData;
    this._permanentFailureAttempt = attempt;
    this._permanentFailureHandled = handled;
    this._instances.forEach((instance) => instance._gotoPermanentFailure(this._permanentFailureMillisSinceLastIncomingData, this._permanentFailureAttempt, this._permanentFailureHandled));
  }
  static debugTriggerReconnection() {
    this._instances.forEach((instance) => instance._beginReconnecting());
  }
  static debugPauseSocketWriting() {
    this._instances.forEach((instance) => instance._pauseSocketWriting());
  }
  static _permanentFailure = false;
  static _permanentFailureMillisSinceLastIncomingData = 0;
  static _permanentFailureAttempt = 0;
  static _permanentFailureHandled = false;
  static _instances = [];
  _onDidStateChange = this._register(new Emitter());
  onDidStateChange = this._onDidStateChange.event;
  _permanentFailure = false;
  get _isPermanentFailure() {
    return this._permanentFailure || PersistentConnection._permanentFailure;
  }
  _isReconnecting = false;
  _isDisposed = false;
  dispose() {
    super.dispose();
    this._isDisposed = true;
  }
  async _beginReconnecting() {
    if (this._isReconnecting) {
      return;
    }
    try {
      this._isReconnecting = true;
      await this._runReconnectingLoop();
    } finally {
      this._isReconnecting = false;
    }
  }
  async _runReconnectingLoop() {
    if (this._isPermanentFailure || this._isDisposed) {
      return;
    }
    const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
    this._options.logService.info(`${logPrefix} starting reconnecting loop. You can get more information with the trace log level.`);
    this._onDidStateChange.fire(new ConnectionLostEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData()));
    const TIMES = [0, 5, 5, 10, 10, 10, 10, 10, 30];
    let attempt = -1;
    do {
      attempt++;
      const waitTime = attempt < TIMES.length ? TIMES[attempt] : TIMES[TIMES.length - 1];
      try {
        if (waitTime > 0) {
          const sleepPromise = sleep(waitTime);
          this._onDidStateChange.fire(new ReconnectionWaitEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), waitTime, sleepPromise));
          this._options.logService.info(`${logPrefix} waiting for ${waitTime} seconds before reconnecting...`);
          try {
            await sleepPromise;
          } catch {
          }
        }
        if (this._isPermanentFailure) {
          this._options.logService.error(`${logPrefix} permanent failure occurred while running the reconnecting loop.`);
          break;
        }
        this._onDidStateChange.fire(new ReconnectionRunningEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), attempt + 1));
        this._options.logService.info(`${logPrefix} resolving connection...`);
        const simpleOptions = await resolveConnectionOptions(this._options, this.reconnectionToken, this.protocol);
        this._options.logService.info(`${logPrefix} connecting to ${simpleOptions.connectTo}...`);
        await this._reconnect(simpleOptions, createTimeoutCancellation(RECONNECT_TIMEOUT));
        this._options.logService.info(`${logPrefix} reconnected!`);
        this._onDidStateChange.fire(new ConnectionGainEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), attempt + 1));
        break;
      } catch (err) {
        if (err.code === "VSCODE_CONNECTION_ERROR") {
          this._options.logService.error(`${logPrefix} A permanent error occurred in the reconnecting loop! Will give up now! Error:`);
          this._options.logService.error(err);
          this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
          break;
        }
        if (attempt > 360) {
          this._options.logService.error(`${logPrefix} An error occurred while reconnecting, but it will be treated as a permanent error because the reconnection grace time has expired! Will give up now! Error:`);
          this._options.logService.error(err);
          this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
          break;
        }
        if (RemoteAuthorityResolverError.isTemporarilyNotAvailable(err)) {
          this._options.logService.info(`${logPrefix} A temporarily not available error occurred while trying to reconnect, will try again...`);
          this._options.logService.trace(err);
          continue;
        }
        if ((err.code === "ETIMEDOUT" || err.code === "ENETUNREACH" || err.code === "ECONNREFUSED" || err.code === "ECONNRESET") && err.syscall === "connect") {
          this._options.logService.info(`${logPrefix} A network error occurred while trying to reconnect, will try again...`);
          this._options.logService.trace(err);
          continue;
        }
        if (isCancellationError(err)) {
          this._options.logService.info(`${logPrefix} A promise cancelation error occurred while trying to reconnect, will try again...`);
          this._options.logService.trace(err);
          continue;
        }
        if (err instanceof RemoteAuthorityResolverError) {
          this._options.logService.error(`${logPrefix} A RemoteAuthorityResolverError occurred while trying to reconnect. Will give up now! Error:`);
          this._options.logService.error(err);
          this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, RemoteAuthorityResolverError.isHandled(err));
          break;
        }
        this._options.logService.error(`${logPrefix} An unknown error occurred while trying to reconnect, since this is an unknown case, it will be treated as a permanent error! Will give up now! Error:`);
        this._options.logService.error(err);
        this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
        break;
      }
    } while (!this._isPermanentFailure && !this._isDisposed);
  }
  _onReconnectionPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
    if (this._reconnectionFailureIsFatal) {
      PersistentConnection.triggerPermanentFailure(millisSinceLastIncomingData, attempt, handled);
    } else {
      this._gotoPermanentFailure(millisSinceLastIncomingData, attempt, handled);
    }
  }
  _gotoPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
    this._onDidStateChange.fire(new ReconnectionPermanentFailureEvent(this.reconnectionToken, millisSinceLastIncomingData, attempt, handled));
    safeDisposeProtocolAndSocket(this.protocol);
  }
  _pauseSocketWriting() {
    this.protocol.pauseSocketWriting();
  }
}
class ManagementPersistentConnection extends PersistentConnection {
  static {
    __name(this, "ManagementPersistentConnection");
  }
  client;
  constructor(options, remoteAuthority, clientId, reconnectionToken, protocol) {
    super(
      1 /* Management */,
      options,
      reconnectionToken,
      protocol,
      /*reconnectionFailureIsFatal*/
      true
    );
    this.client = this._register(new Client(protocol, {
      remoteAuthority,
      clientId
    }, options.ipcLogger));
  }
  async _reconnect(options, timeoutCancellationToken) {
    await doConnectRemoteAgentManagement(options, timeoutCancellationToken);
  }
}
class ExtensionHostPersistentConnection extends PersistentConnection {
  static {
    __name(this, "ExtensionHostPersistentConnection");
  }
  _startArguments;
  debugPort;
  constructor(options, startArguments, reconnectionToken, protocol, debugPort) {
    super(
      2 /* ExtensionHost */,
      options,
      reconnectionToken,
      protocol,
      /*reconnectionFailureIsFatal*/
      false
    );
    this._startArguments = startArguments;
    this.debugPort = debugPort;
  }
  async _reconnect(options, timeoutCancellationToken) {
    await doConnectRemoteAgentExtensionHost(options, this._startArguments, timeoutCancellationToken);
  }
}
function safeDisposeProtocolAndSocket(protocol) {
  try {
    protocol.acceptDisconnect();
    const socket = protocol.getSocket();
    protocol.dispose();
    socket.dispose();
  } catch (err) {
    onUnexpectedError(err);
  }
}
__name(safeDisposeProtocolAndSocket, "safeDisposeProtocolAndSocket");
function getErrorFromMessage(msg) {
  if (msg && msg.type === "error") {
    const error = new Error(`Connection error: ${msg.reason}`);
    error.code = "VSCODE_CONNECTION_ERROR";
    return error;
  }
  return null;
}
__name(getErrorFromMessage, "getErrorFromMessage");
function stringRightPad(str, len) {
  while (str.length < len) {
    str += " ";
  }
  return str;
}
__name(stringRightPad, "stringRightPad");
function _commonLogPrefix(connectionType, reconnectionToken) {
  return `[remote-connection][${stringRightPad(connectionTypeToString(connectionType), 13)}][${reconnectionToken.substr(0, 5)}\u2026]`;
}
__name(_commonLogPrefix, "_commonLogPrefix");
function commonLogPrefix(connectionType, reconnectionToken, isReconnect) {
  return `${_commonLogPrefix(connectionType, reconnectionToken)}[${isReconnect ? "reconnect" : "initial"}]`;
}
__name(commonLogPrefix, "commonLogPrefix");
function connectLogPrefix(options, connectionType) {
  return `${commonLogPrefix(connectionType, options.reconnectionToken, !!options.reconnectionProtocol)}[${options.connectTo}]`;
}
__name(connectLogPrefix, "connectLogPrefix");
function logElapsed(startTime) {
  return `${Date.now() - startTime} ms`;
}
__name(logElapsed, "logElapsed");
export {
  ConnectionGainEvent,
  ConnectionLostEvent,
  ConnectionType,
  ExtensionHostPersistentConnection,
  ManagementPersistentConnection,
  PersistentConnection,
  PersistentConnectionEventType,
  ReconnectionPermanentFailureEvent,
  ReconnectionRunningEvent,
  ReconnectionWaitEvent,
  connectRemoteAgentExtensionHost,
  connectRemoteAgentManagement,
  connectRemoteAgentTunnel
};
//# sourceMappingURL=remoteAgentConnection.js.map
