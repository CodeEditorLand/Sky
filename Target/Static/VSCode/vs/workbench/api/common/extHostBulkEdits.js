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
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { MainContext, MainThreadBulkEditsShape } from "./extHost.protocol.js";
import { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { WorkspaceEdit } from "./extHostTypeConverters.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
let ExtHostBulkEdits = class {
  static {
    __name(this, "ExtHostBulkEdits");
  }
  _proxy;
  _versionInformationProvider;
  constructor(extHostRpc, extHostDocumentsAndEditors) {
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadBulkEdits);
    this._versionInformationProvider = {
      getTextDocumentVersion: /* @__PURE__ */ __name((uri) => extHostDocumentsAndEditors.getDocument(uri)?.version, "getTextDocumentVersion"),
      getNotebookDocumentVersion: /* @__PURE__ */ __name(() => void 0, "getNotebookDocumentVersion")
    };
  }
  applyWorkspaceEdit(edit, extension, metadata) {
    const dto = new SerializableObjectWithBuffers(WorkspaceEdit.from(edit, this._versionInformationProvider));
    return this._proxy.$tryApplyWorkspaceEdit(dto, void 0, metadata?.isRefactoring ?? false);
  }
};
ExtHostBulkEdits = __decorateClass([
  __decorateParam(0, IExtHostRpcService)
], ExtHostBulkEdits);
export {
  ExtHostBulkEdits
};
//# sourceMappingURL=extHostBulkEdits.js.map
