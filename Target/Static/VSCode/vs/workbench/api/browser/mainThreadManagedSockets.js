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
import { VSBuffer } from "../../../base/common/buffer.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../base/common/lifecycle.js";
import { ISocket, SocketCloseEventType } from "../../../base/parts/ipc/common/ipc.net.js";
import { ManagedSocket, RemoteSocketHalf, connectManagedSocket } from "../../../platform/remote/common/managedSocket.js";
import { ManagedRemoteConnection, RemoteConnectionType } from "../../../platform/remote/common/remoteAuthorityResolver.js";
import { IRemoteSocketFactoryService, ISocketFactory } from "../../../platform/remote/common/remoteSocketFactoryService.js";
import { ExtHostContext, ExtHostManagedSocketsShape, MainContext, MainThreadManagedSocketsShape } from "../common/extHost.protocol.js";
import { IExtHostContext, extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
let MainThreadManagedSockets = class extends Disposable {
  constructor(extHostContext, _remoteSocketFactoryService) {
    super();
    this._remoteSocketFactoryService = _remoteSocketFactoryService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostManagedSockets);
  }
  _proxy;
  _registrations = /* @__PURE__ */ new Map();
  _remoteSockets = /* @__PURE__ */ new Map();
  async $registerSocketFactory(socketFactoryId) {
    const that = this;
    const socketFactory = new class {
      supports(connectTo) {
        return connectTo.id === socketFactoryId;
      }
      connect(connectTo, path, query, debugLabel) {
        return new Promise((resolve, reject) => {
          if (connectTo.id !== socketFactoryId) {
            return reject(new Error("Invalid connectTo"));
          }
          const factoryId = connectTo.id;
          that._proxy.$openRemoteSocket(factoryId).then((socketId) => {
            const half = {
              onClose: new Emitter(),
              onData: new Emitter(),
              onEnd: new Emitter()
            };
            that._remoteSockets.set(socketId, half);
            MainThreadManagedSocket.connect(socketId, that._proxy, path, query, debugLabel, half).then(
              (socket) => {
                socket.onDidDispose(() => that._remoteSockets.delete(socketId));
                resolve(socket);
              },
              (err) => {
                that._remoteSockets.delete(socketId);
                reject(err);
              }
            );
          }).catch(reject);
        });
      }
    }();
    this._registrations.set(socketFactoryId, this._remoteSocketFactoryService.register(RemoteConnectionType.Managed, socketFactory));
  }
  async $unregisterSocketFactory(socketFactoryId) {
    this._registrations.get(socketFactoryId)?.dispose();
  }
  $onDidManagedSocketHaveData(socketId, data) {
    this._remoteSockets.get(socketId)?.onData.fire(data);
  }
  $onDidManagedSocketClose(socketId, error) {
    this._remoteSockets.get(socketId)?.onClose.fire({
      type: SocketCloseEventType.NodeSocketCloseEvent,
      error: error ? new Error(error) : void 0,
      hadError: !!error
    });
    this._remoteSockets.delete(socketId);
  }
  $onDidManagedSocketEnd(socketId) {
    this._remoteSockets.get(socketId)?.onEnd.fire();
  }
};
__name(MainThreadManagedSockets, "MainThreadManagedSockets");
MainThreadManagedSockets = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadManagedSockets),
  __decorateParam(1, IRemoteSocketFactoryService)
], MainThreadManagedSockets);
class MainThreadManagedSocket extends ManagedSocket {
  constructor(socketId, proxy, debugLabel, half) {
    super(debugLabel, half);
    this.socketId = socketId;
    this.proxy = proxy;
  }
  static {
    __name(this, "MainThreadManagedSocket");
  }
  static connect(socketId, proxy, path, query, debugLabel, half) {
    const socket = new MainThreadManagedSocket(socketId, proxy, debugLabel, half);
    return connectManagedSocket(socket, path, query, debugLabel, half);
  }
  write(buffer) {
    this.proxy.$remoteSocketWrite(this.socketId, buffer);
  }
  closeRemote() {
    this.proxy.$remoteSocketEnd(this.socketId);
  }
  drain() {
    return this.proxy.$remoteSocketDrain(this.socketId);
  }
}
export {
  MainThreadManagedSocket,
  MainThreadManagedSockets
};
//# sourceMappingURL=mainThreadManagedSockets.js.map
