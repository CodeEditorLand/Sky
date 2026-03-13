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
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, DisposableMap, DisposableStore } from "../../../base/common/lifecycle.js";
import { ManagedSocket, connectManagedSocket } from "../../../platform/remote/common/managedSocket.js";
import { IRemoteSocketFactoryService } from "../../../platform/remote/common/remoteSocketFactoryService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
let MainThreadManagedSockets = class MainThreadManagedSockets2 extends Disposable {
  static {
    __name(this, "MainThreadManagedSockets");
  }
  constructor(extHostContext, _remoteSocketFactoryService) {
    super();
    this._remoteSocketFactoryService = _remoteSocketFactoryService;
    this._registrations = this._register(new DisposableMap());
    this._remoteSockets = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostManagedSockets);
  }
  async $registerSocketFactory(socketFactoryId) {
    const that = this;
    const store = new DisposableStore();
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
            MainThreadManagedSocket.connect(socketId, that._proxy, path, query, debugLabel, half).then((socket) => {
              store.add(Event.once(socket.onDidDispose)(() => that._remoteSockets.delete(socketId)));
              resolve(socket);
            }, (err) => {
              that._remoteSockets.delete(socketId);
              reject(err);
            });
          }).catch(reject);
        });
      }
    }();
    store.add(this._remoteSocketFactoryService.register(1, socketFactory));
    this._registrations.set(socketFactoryId, store);
  }
  async $unregisterSocketFactory(socketFactoryId) {
    this._registrations.deleteAndDispose(socketFactoryId);
  }
  $onDidManagedSocketHaveData(socketId, data) {
    this._remoteSockets.get(socketId)?.onData.fire(data);
  }
  $onDidManagedSocketClose(socketId, error) {
    this._remoteSockets.get(socketId)?.onClose.fire({
      type: 0,
      error: error ? new Error(error) : void 0,
      hadError: !!error
    });
    this._remoteSockets.delete(socketId);
  }
  $onDidManagedSocketEnd(socketId) {
    this._remoteSockets.get(socketId)?.onEnd.fire();
  }
};
MainThreadManagedSockets = __decorate([
  extHostNamedCustomer(MainContext.MainThreadManagedSockets),
  __param(1, IRemoteSocketFactoryService)
], MainThreadManagedSockets);
class MainThreadManagedSocket extends ManagedSocket {
  static {
    __name(this, "MainThreadManagedSocket");
  }
  static connect(socketId, proxy, path, query, debugLabel, half) {
    const socket = new MainThreadManagedSocket(socketId, proxy, debugLabel, half);
    return connectManagedSocket(socket, path, query, debugLabel, half);
  }
  constructor(socketId, proxy, debugLabel, half) {
    super(debugLabel, half);
    this.socketId = socketId;
    this.proxy = proxy;
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
