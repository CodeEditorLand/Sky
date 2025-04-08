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
import { CancellationToken } from "../../../base/common/cancellation.js";
import { shouldSynchronizeModel } from "../../../editor/common/model.js";
import { localize } from "../../../nls.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { IProgressStep, IProgress } from "../../../platform/progress/common/progress.js";
import { extHostCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ITextFileSaveParticipant, ITextFileService, ITextFileEditorModel, ITextFileSaveParticipantContext } from "../../services/textfile/common/textfiles.js";
import { ExtHostContext, ExtHostDocumentSaveParticipantShape } from "../common/extHost.protocol.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { raceCancellationError } from "../../../base/common/async.js";
class ExtHostSaveParticipant {
  static {
    __name(this, "ExtHostSaveParticipant");
  }
  _proxy;
  constructor(extHostContext) {
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDocumentSaveParticipant);
  }
  async participate(editorModel, context, _progress, token) {
    if (!editorModel.textEditorModel || !shouldSynchronizeModel(editorModel.textEditorModel)) {
      return void 0;
    }
    const p = new Promise((resolve, reject) => {
      setTimeout(
        () => reject(new Error(localize("timeout.onWillSave", "Aborted onWillSaveTextDocument-event after 1750ms"))),
        1750
      );
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
let SaveParticipant = class {
  constructor(extHostContext, instantiationService, _textFileService) {
    this._textFileService = _textFileService;
    this._saveParticipantDisposable = this._textFileService.files.addSaveParticipant(instantiationService.createInstance(ExtHostSaveParticipant, extHostContext));
  }
  _saveParticipantDisposable;
  dispose() {
    this._saveParticipantDisposable.dispose();
  }
};
__name(SaveParticipant, "SaveParticipant");
SaveParticipant = __decorateClass([
  extHostCustomer,
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITextFileService)
], SaveParticipant);
export {
  SaveParticipant
};
//# sourceMappingURL=mainThreadSaveParticipant.js.map
