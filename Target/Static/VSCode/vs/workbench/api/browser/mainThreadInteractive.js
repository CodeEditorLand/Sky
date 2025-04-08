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
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../editor/common/languages/modesRegistry.js";
import { ExtHostContext, ExtHostInteractiveShape, MainContext, MainThreadInteractiveShape } from "../common/extHost.protocol.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IInteractiveDocumentService } from "../../contrib/interactive/browser/interactiveDocumentService.js";
let MainThreadInteractive = class {
  _proxy;
  _disposables = new DisposableStore();
  constructor(extHostContext, interactiveDocumentService) {
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
__name(MainThreadInteractive, "MainThreadInteractive");
MainThreadInteractive = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadInteractive),
  __decorateParam(1, IInteractiveDocumentService)
], MainThreadInteractive);
export {
  MainThreadInteractive
};
//# sourceMappingURL=mainThreadInteractive.js.map
