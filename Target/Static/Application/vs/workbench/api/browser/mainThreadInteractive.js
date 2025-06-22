var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../editor/common/languages/modesRegistry.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IInteractiveDocumentService } from "../../contrib/interactive/browser/interactiveDocumentService.js";
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
let MainThreadInteractive = class MainThreadInteractive2 {
  static {
    __name(this, "MainThreadInteractive");
  }
  constructor(extHostContext, interactiveDocumentService) {
    this._disposables = new DisposableStore();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostInteractive);
    this._disposables.add(interactiveDocumentService.onWillAddInteractiveDocument((e) => {
      this._proxy.$willAddInteractiveDocument(e.inputUri, "\n", PLAINTEXT_LANGUAGE_ID, e.notebookUri);
    }));
    this._disposables.add(interactiveDocumentService.onWillRemoveInteractiveDocument((e) => {
      this._proxy.$willRemoveInteractiveDocument(e.inputUri, e.notebookUri);
    }));
  }
  dispose() {
    this._disposables.dispose();
  }
};
MainThreadInteractive = __decorate([
  extHostNamedCustomer(MainContext.MainThreadInteractive),
  __param(1, IInteractiveDocumentService)
], MainThreadInteractive);
export {
  MainThreadInteractive
};
//# sourceMappingURL=mainThreadInteractive.js.map
