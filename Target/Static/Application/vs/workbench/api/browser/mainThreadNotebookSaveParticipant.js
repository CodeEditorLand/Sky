var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../nls.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { extHostCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext } from "../common/extHost.protocol.js";
import { raceCancellationError } from "../../../base/common/async.js";
import { IWorkingCopyFileService } from "../../services/workingCopy/common/workingCopyFileService.js";
import { NotebookFileWorkingCopyModel } from "../../contrib/notebook/common/notebookEditorModel.js";
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
class ExtHostNotebookDocumentSaveParticipant {
  static {
    __name(this, "ExtHostNotebookDocumentSaveParticipant");
  }
  constructor(extHostContext) {
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebookDocumentSaveParticipant);
  }
  async participate(workingCopy, context, _progress, token) {
    if (!workingCopy.model || !(workingCopy.model instanceof NotebookFileWorkingCopyModel)) {
      return void 0;
    }
    let _warningTimeout;
    const p = new Promise((resolve, reject) => {
      _warningTimeout = setTimeout(() => reject(new Error(localize("timeout.onWillSave", "Aborted onWillSaveNotebookDocument-event after 1750ms"))), 1750);
      this._proxy.$participateInSave(workingCopy.resource, context.reason, token).then((_) => {
        clearTimeout(_warningTimeout);
        return void 0;
      }).then(resolve, reject);
    });
    return raceCancellationError(p, token);
  }
}
let SaveParticipant = class SaveParticipant2 {
  static {
    __name(this, "SaveParticipant");
  }
  constructor(extHostContext, instantiationService, workingCopyFileService) {
    this.workingCopyFileService = workingCopyFileService;
    this._saveParticipantDisposable = this.workingCopyFileService.addSaveParticipant(instantiationService.createInstance(ExtHostNotebookDocumentSaveParticipant, extHostContext));
  }
  dispose() {
    this._saveParticipantDisposable.dispose();
  }
};
SaveParticipant = __decorate([
  extHostCustomer,
  __param(1, IInstantiationService),
  __param(2, IWorkingCopyFileService)
], SaveParticipant);
export {
  SaveParticipant
};
//# sourceMappingURL=mainThreadNotebookSaveParticipant.js.map
