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
import { registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { ReferencesController } from "../../../../editor/contrib/gotoSymbol/browser/peek/referencesController.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
let WorkbenchReferencesController = class WorkbenchReferencesController2 extends ReferencesController {
  static {
    __name(this, "WorkbenchReferencesController");
  }
  constructor(editor, contextKeyService, editorService, notificationService, instantiationService, storageService, configurationService) {
    super(false, editor, contextKeyService, editorService, notificationService, instantiationService, storageService, configurationService);
  }
};
WorkbenchReferencesController = __decorate([
  __param(1, IContextKeyService),
  __param(2, ICodeEditorService),
  __param(3, INotificationService),
  __param(4, IInstantiationService),
  __param(5, IStorageService),
  __param(6, IConfigurationService)
], WorkbenchReferencesController);
registerEditorContribution(
  ReferencesController.ID,
  WorkbenchReferencesController,
  4
  /* EditorContributionInstantiation.Lazy */
);
export {
  WorkbenchReferencesController
};
//# sourceMappingURL=workbenchReferenceSearch.js.map
