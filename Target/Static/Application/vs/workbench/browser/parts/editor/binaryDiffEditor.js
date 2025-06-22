var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
import { BINARY_DIFF_EDITOR_ID } from "../../../common/editor.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { SideBySideEditor } from "./sideBySideEditor.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { BaseBinaryResourceEditor } from "./binaryEditor.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
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
let BinaryResourceDiffEditor = class BinaryResourceDiffEditor2 extends SideBySideEditor {
  static {
    __name(this, "BinaryResourceDiffEditor");
  }
  static {
    this.ID = BINARY_DIFF_EDITOR_ID;
  }
  constructor(group, telemetryService, instantiationService, themeService, storageService, configurationService, textResourceConfigurationService, editorService, editorGroupService) {
    super(group, telemetryService, instantiationService, themeService, storageService, configurationService, textResourceConfigurationService, editorService, editorGroupService);
  }
  getMetadata() {
    const primary = this.getPrimaryEditorPane();
    const secondary = this.getSecondaryEditorPane();
    if (primary instanceof BaseBinaryResourceEditor && secondary instanceof BaseBinaryResourceEditor) {
      return localize("metadataDiff", "{0} \u2194 {1}", secondary.getMetadata(), primary.getMetadata());
    }
    return void 0;
  }
};
BinaryResourceDiffEditor = __decorate([
  __param(1, ITelemetryService),
  __param(2, IInstantiationService),
  __param(3, IThemeService),
  __param(4, IStorageService),
  __param(5, IConfigurationService),
  __param(6, ITextResourceConfigurationService),
  __param(7, IEditorService),
  __param(8, IEditorGroupsService)
], BinaryResourceDiffEditor);
export {
  BinaryResourceDiffEditor
};
//# sourceMappingURL=binaryDiffEditor.js.map
