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
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorContributionInstantiation, registerEditorContribution } from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { ReferencesController } from "../../../contrib/gotoSymbol/browser/peek/referencesController.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
let StandaloneReferencesController = class extends ReferencesController {
  static {
    __name(this, "StandaloneReferencesController");
  }
  constructor(editor, contextKeyService, editorService, notificationService, instantiationService, storageService, configurationService) {
    super(
      true,
      editor,
      contextKeyService,
      editorService,
      notificationService,
      instantiationService,
      storageService,
      configurationService
    );
  }
};
StandaloneReferencesController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ICodeEditorService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IConfigurationService)
], StandaloneReferencesController);
registerEditorContribution(ReferencesController.ID, StandaloneReferencesController, EditorContributionInstantiation.Lazy);
export {
  StandaloneReferencesController
};
//# sourceMappingURL=standaloneReferenceSearch.js.map
