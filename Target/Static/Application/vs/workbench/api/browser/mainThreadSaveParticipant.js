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
import { shouldSynchronizeModel } from "../../../editor/common/model.js";
import { localize } from "../../../nls.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { extHostCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ITextFileService } from "../../services/textfile/common/textfiles.js";
import { ExtHostContext } from "../common/extHost.protocol.js";
import { raceCancellationError } from "../../../base/common/async.js";
class ExtHostSaveParticipant {
  static {
    __name(this, "ExtHostSaveParticipant");
  }
  constructor(extHostContext) {
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDocumentSaveParticipant);
  }
  async participate(editorModel, context, _progress, token) {
    if (!editorModel.textEditorModel || !shouldSynchronizeModel(editorModel.textEditorModel)) {
      return void 0;
    }
    const p = new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error(localize("timeout.onWillSave", "Aborted onWillSaveTextDocument-event after 1750ms"))), 1750);
      this._proxy.$participateInSave(editorModel.resource, context.reason).then((values) => {
        if (!values.every((success) => success)) {
          return Promise.reject(new Error("listener failed"));
        }
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
  constructor(extHostContext, instantiationService, _textFileService) {
    this._textFileService = _textFileService;
    this._saveParticipantDisposable = this._textFileService.files.addSaveParticipant(instantiationService.createInstance(ExtHostSaveParticipant, extHostContext));
  }
  dispose() {
    this._saveParticipantDisposable.dispose();
  }
};
SaveParticipant = __decorate([
  extHostCustomer,
  __param(1, IInstantiationService),
  __param(2, ITextFileService)
], SaveParticipant);
export {
  SaveParticipant
};
//# sourceMappingURL=mainThreadSaveParticipant.js.map
