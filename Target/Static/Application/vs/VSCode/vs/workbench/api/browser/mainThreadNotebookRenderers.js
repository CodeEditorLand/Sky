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
import { Disposable } from "../../../base/common/lifecycle.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { INotebookRendererMessagingService } from "../../contrib/notebook/common/notebookRendererMessagingService.js";
let MainThreadNotebookRenderers = class MainThreadNotebookRenderers2 extends Disposable {
  static {
    __name(this, "MainThreadNotebookRenderers");
  }
  constructor(extHostContext, messaging) {
    super();
    this.messaging = messaging;
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebookRenderers);
    this._register(messaging.onShouldPostMessage((e) => {
      this.proxy.$postRendererMessage(e.editorId, e.rendererId, e.message);
    }));
  }
  $postMessage(editorId, rendererId, message) {
    return this.messaging.receiveMessage(editorId, rendererId, message);
  }
};
MainThreadNotebookRenderers = __decorate([
  extHostNamedCustomer(MainContext.MainThreadNotebookRenderers),
  __param(1, INotebookRendererMessagingService)
], MainThreadNotebookRenderers);
export {
  MainThreadNotebookRenderers
};
//# sourceMappingURL=mainThreadNotebookRenderers.js.map
