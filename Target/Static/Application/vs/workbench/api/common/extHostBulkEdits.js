var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MainContext } from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { WorkspaceEdit } from "./extHostTypeConverters.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
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
let ExtHostBulkEdits = class ExtHostBulkEdits2 {
  static {
    __name(this, "ExtHostBulkEdits");
  }
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
ExtHostBulkEdits = __decorate([
  __param(0, IExtHostRpcService)
], ExtHostBulkEdits);
export {
  ExtHostBulkEdits
};
//# sourceMappingURL=extHostBulkEdits.js.map
