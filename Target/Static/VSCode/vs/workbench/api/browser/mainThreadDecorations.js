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
import { URI, UriComponents } from "../../../base/common/uri.js";
import { Emitter } from "../../../base/common/event.js";
import { IDisposable, dispose } from "../../../base/common/lifecycle.js";
import { ExtHostContext, MainContext, MainThreadDecorationsShape, ExtHostDecorationsShape, DecorationData, DecorationRequest } from "../common/extHost.protocol.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IDecorationsService, IDecorationData } from "../../services/decorations/common/decorations.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
class DecorationRequestsQueue {
  constructor(_proxy, _handle) {
    this._proxy = _proxy;
    this._handle = _handle;
  }
  static {
    __name(this, "DecorationRequestsQueue");
  }
  _idPool = 0;
  _requests = /* @__PURE__ */ new Map();
  _resolver = /* @__PURE__ */ new Map();
  _timer;
  enqueue(uri, token) {
    const id = ++this._idPool;
    const result = new Promise((resolve) => {
      this._requests.set(id, { id, uri });
      this._resolver.set(id, resolve);
      this._processQueue();
    });
    const sub = token.onCancellationRequested(() => {
      this._requests.delete(id);
      this._resolver.delete(id);
    });
    return result.finally(() => sub.dispose());
  }
  _processQueue() {
    if (typeof this._timer === "number") {
      return;
    }
    this._timer = setTimeout(() => {
      const requests = this._requests;
      const resolver = this._resolver;
      this._proxy.$provideDecorations(this._handle, [...requests.values()], CancellationToken.None).then((data) => {
        for (const [id, resolve] of resolver) {
          resolve(data[id]);
        }
      });
      this._requests = /* @__PURE__ */ new Map();
      this._resolver = /* @__PURE__ */ new Map();
      this._timer = void 0;
    }, 0);
  }
}
let MainThreadDecorations = class {
  constructor(context, _decorationsService) {
    this._decorationsService = _decorationsService;
    this._proxy = context.getProxy(ExtHostContext.ExtHostDecorations);
  }
  _provider = /* @__PURE__ */ new Map();
  _proxy;
  dispose() {
    this._provider.forEach((value) => dispose(value));
    this._provider.clear();
  }
  $registerDecorationProvider(handle, label) {
    const emitter = new Emitter();
    const queue = new DecorationRequestsQueue(this._proxy, handle);
    const registration = this._decorationsService.registerDecorationsProvider({
      label,
      onDidChange: emitter.event,
      provideDecorations: /* @__PURE__ */ __name(async (uri, token) => {
        const data = await queue.enqueue(uri, token);
        if (!data) {
          return void 0;
        }
        const [bubble, tooltip, letter, themeColor] = data;
        return {
          weight: 10,
          bubble: bubble ?? false,
          color: themeColor?.id,
          tooltip,
          letter
        };
      }, "provideDecorations")
    });
    this._provider.set(handle, [emitter, registration]);
  }
  $onDidChange(handle, resources) {
    const provider = this._provider.get(handle);
    if (provider) {
      const [emitter] = provider;
      emitter.fire(resources && resources.map((r) => URI.revive(r)));
    }
  }
  $unregisterDecorationProvider(handle) {
    const provider = this._provider.get(handle);
    if (provider) {
      dispose(provider);
      this._provider.delete(handle);
    }
  }
};
__name(MainThreadDecorations, "MainThreadDecorations");
MainThreadDecorations = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadDecorations),
  __decorateParam(1, IDecorationsService)
], MainThreadDecorations);
export {
  MainThreadDecorations
};
//# sourceMappingURL=mainThreadDecorations.js.map
