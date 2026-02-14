var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class IPCInvokeError extends Error {
  static {
    __name(this, "IPCInvokeError");
  }
  _tag = "IPCInvokeError";
  _channel;
  _cause;
  constructor(channel, cause) {
    super(`IPC invoke failed on channel '${channel}': ${String(cause)}`);
    this._channel = channel;
    this._cause = cause;
    Object.setPrototypeOf(this, IPCInvokeError.prototype);
  }
  get name() {
    return "IPCInvokeError";
  }
  get channel() {
    return this._channel;
  }
  get cause() {
    return this._cause;
  }
}
class IPCSendError extends Error {
  static {
    __name(this, "IPCSendError");
  }
  _tag = "IPCSendError";
  _channel;
  _cause;
  constructor(channel, cause) {
    super(`IPC send failed on channel '${channel}': ${String(cause)}`);
    this._channel = channel;
    this._cause = cause;
    Object.setPrototypeOf(this, IPCSendError.prototype);
  }
  get name() {
    return "IPCSendError";
  }
  get channel() {
    return this._channel;
  }
  get cause() {
    return this._cause;
  }
}
class IPCSubscriptionError extends Error {
  static {
    __name(this, "IPCSubscriptionError");
  }
  _tag = "IPCSubscriptionError";
  _channel;
  _cause;
  constructor(channel, cause) {
    super(`IPC subscription failed on channel '${channel}': ${String(cause)}`);
    this._channel = channel;
    this._cause = cause;
    Object.setPrototypeOf(this, IPCSubscriptionError.prototype);
  }
  get name() {
    return "IPCSubscriptionError";
  }
  get channel() {
    return this._channel;
  }
  get cause() {
    return this._cause;
  }
}
import { IPCTag, IPC } from "./IPC/Tag/IPCTag.js";
import { TauriIPCLive } from "./IPC/Implementation/TauriIPC.js";
import { default as IPCTauriLiveLayer, MockIPCLive } from "./IPC/index.js";
export {
  IPC,
  IPCInvokeError,
  MockIPCLive as IPCMockLive,
  IPCSendError,
  IPCSubscriptionError,
  IPCTag,
  IPCTauriLiveLayer as IPCTauriLive,
  IPCTauriLiveLayer,
  MockIPCLive,
  TauriIPCLive
};
//# sourceMappingURL=IPC.js.map
