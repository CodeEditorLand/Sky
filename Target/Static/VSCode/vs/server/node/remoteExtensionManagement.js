var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PersistentProtocol, ProtocolConstants, ISocket } from "../../base/parts/ipc/common/ipc.net.js";
import { ILogService } from "../../platform/log/common/log.js";
import { Emitter, Event } from "../../base/common/event.js";
import { VSBuffer } from "../../base/common/buffer.js";
import { ProcessTimeRunOnceScheduler } from "../../base/common/async.js";
function printTime(ms) {
  let h = 0;
  let m = 0;
  let s = 0;
  if (ms >= 1e3) {
    s = Math.floor(ms / 1e3);
    ms -= s * 1e3;
  }
  if (s >= 60) {
    m = Math.floor(s / 60);
    s -= m * 60;
  }
  if (m >= 60) {
    h = Math.floor(m / 60);
    m -= h * 60;
  }
  const _h = h ? `${h}h` : ``;
  const _m = m ? `${m}m` : ``;
  const _s = s ? `${s}s` : ``;
  const _ms = ms ? `${ms}ms` : ``;
  return `${_h}${_m}${_s}${_ms}`;
}
__name(printTime, "printTime");
class ManagementConnection {
  constructor(_logService, _reconnectionToken, remoteAddress, protocol) {
    this._logService = _logService;
    this._reconnectionToken = _reconnectionToken;
    this._reconnectionGraceTime = ProtocolConstants.ReconnectionGraceTime;
    this._reconnectionShortGraceTime = ProtocolConstants.ReconnectionShortGraceTime;
    this._remoteAddress = remoteAddress;
    this.protocol = protocol;
    this._disposed = false;
    this._disconnectRunner1 = new ProcessTimeRunOnceScheduler(() => {
      this._log(`The reconnection grace time of ${printTime(this._reconnectionGraceTime)} has expired, so the connection will be disposed.`);
      this._cleanResources();
    }, this._reconnectionGraceTime);
    this._disconnectRunner2 = new ProcessTimeRunOnceScheduler(() => {
      this._log(`The reconnection short grace time of ${printTime(this._reconnectionShortGraceTime)} has expired, so the connection will be disposed.`);
      this._cleanResources();
    }, this._reconnectionShortGraceTime);
    this.protocol.onDidDispose(() => {
      this._log(`The client has disconnected gracefully, so the connection will be disposed.`);
      this._cleanResources();
    });
    this.protocol.onSocketClose(() => {
      this._log(`The client has disconnected, will wait for reconnection ${printTime(this._reconnectionGraceTime)} before disposing...`);
      this._disconnectRunner1.schedule();
    });
    this._log(`New connection established.`);
  }
  static {
    __name(this, "ManagementConnection");
  }
  _onClose = new Emitter();
  onClose = this._onClose.event;
  _reconnectionGraceTime;
  _reconnectionShortGraceTime;
  _remoteAddress;
  protocol;
  _disposed;
  _disconnectRunner1;
  _disconnectRunner2;
  _log(_str) {
    this._logService.info(`[${this._remoteAddress}][${this._reconnectionToken.substr(0, 8)}][ManagementConnection] ${_str}`);
  }
  shortenReconnectionGraceTimeIfNecessary() {
    if (this._disconnectRunner2.isScheduled()) {
      return;
    }
    if (this._disconnectRunner1.isScheduled()) {
      this._log(`Another client has connected, will shorten the wait for reconnection ${printTime(this._reconnectionShortGraceTime)} before disposing...`);
      this._disconnectRunner2.schedule();
    }
  }
  _cleanResources() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._disconnectRunner1.dispose();
    this._disconnectRunner2.dispose();
    const socket = this.protocol.getSocket();
    this.protocol.sendDisconnect();
    this.protocol.dispose();
    socket.end();
    this._onClose.fire(void 0);
  }
  acceptReconnection(remoteAddress, socket, initialDataChunk) {
    this._remoteAddress = remoteAddress;
    this._log(`The client has reconnected.`);
    this._disconnectRunner1.cancel();
    this._disconnectRunner2.cancel();
    this.protocol.beginAcceptReconnection(socket, initialDataChunk);
    this.protocol.endAcceptReconnection();
  }
}
export {
  ManagementConnection
};
//# sourceMappingURL=remoteExtensionManagement.js.map
