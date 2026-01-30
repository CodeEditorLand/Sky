var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ErrorNoTelemetry } from "../../../base/common/errors.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IRemoteAuthorityResolverService = createDecorator("remoteAuthorityResolverService");
var RemoteConnectionType;
(function(RemoteConnectionType2) {
  RemoteConnectionType2[RemoteConnectionType2["WebSocket"] = 0] = "WebSocket";
  RemoteConnectionType2[RemoteConnectionType2["Managed"] = 1] = "Managed";
})(RemoteConnectionType || (RemoteConnectionType = {}));
class ManagedRemoteConnection {
  static {
    __name(this, "ManagedRemoteConnection");
  }
  constructor(id) {
    this.id = id;
    this.type = 1;
  }
  toString() {
    return `Managed(${this.id})`;
  }
}
class WebSocketRemoteConnection {
  static {
    __name(this, "WebSocketRemoteConnection");
  }
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.type = 0;
  }
  toString() {
    return `WebSocket(${this.host}:${this.port})`;
  }
}
var RemoteAuthorityResolverErrorCode;
(function(RemoteAuthorityResolverErrorCode2) {
  RemoteAuthorityResolverErrorCode2["Unknown"] = "Unknown";
  RemoteAuthorityResolverErrorCode2["NotAvailable"] = "NotAvailable";
  RemoteAuthorityResolverErrorCode2["TemporarilyNotAvailable"] = "TemporarilyNotAvailable";
  RemoteAuthorityResolverErrorCode2["NoResolverFound"] = "NoResolverFound";
  RemoteAuthorityResolverErrorCode2["InvalidAuthority"] = "InvalidAuthority";
})(RemoteAuthorityResolverErrorCode || (RemoteAuthorityResolverErrorCode = {}));
class RemoteAuthorityResolverError extends ErrorNoTelemetry {
  static {
    __name(this, "RemoteAuthorityResolverError");
  }
  static isNotAvailable(err) {
    return err instanceof RemoteAuthorityResolverError && err._code === RemoteAuthorityResolverErrorCode.NotAvailable;
  }
  static isTemporarilyNotAvailable(err) {
    return err instanceof RemoteAuthorityResolverError && err._code === RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable;
  }
  static isNoResolverFound(err) {
    return err instanceof RemoteAuthorityResolverError && err._code === RemoteAuthorityResolverErrorCode.NoResolverFound;
  }
  static isInvalidAuthority(err) {
    return err instanceof RemoteAuthorityResolverError && err._code === RemoteAuthorityResolverErrorCode.InvalidAuthority;
  }
  static isHandled(err) {
    return err instanceof RemoteAuthorityResolverError && err.isHandled;
  }
  constructor(message, code = RemoteAuthorityResolverErrorCode.Unknown, detail) {
    super(message);
    this._message = message;
    this._code = code;
    this._detail = detail;
    this.isHandled = code === RemoteAuthorityResolverErrorCode.NotAvailable && detail === true;
    Object.setPrototypeOf(this, RemoteAuthorityResolverError.prototype);
  }
}
function getRemoteAuthorityPrefix(remoteAuthority) {
  const plusIndex = remoteAuthority.indexOf("+");
  if (plusIndex === -1) {
    return remoteAuthority;
  }
  return remoteAuthority.substring(0, plusIndex);
}
__name(getRemoteAuthorityPrefix, "getRemoteAuthorityPrefix");
export {
  IRemoteAuthorityResolverService,
  ManagedRemoteConnection,
  RemoteAuthorityResolverError,
  RemoteAuthorityResolverErrorCode,
  RemoteConnectionType,
  WebSocketRemoteConnection,
  getRemoteAuthorityPrefix
};
//# sourceMappingURL=remoteAuthorityResolver.js.map
