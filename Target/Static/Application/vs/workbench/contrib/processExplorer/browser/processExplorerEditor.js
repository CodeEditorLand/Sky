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
var ProcessExplorerEditor_1;
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { BrowserProcessExplorerControl } from "./processExplorerControl.js";
let ProcessExplorerEditor = class ProcessExplorerEditor2 extends EditorPane {
  static {
    __name(this, "ProcessExplorerEditor");
  }
  static {
    ProcessExplorerEditor_1 = this;
  }
  static {
    this.ID = "workbench.editor.processExplorer";
  }
  constructor(group, telemetryService, themeService, storageService, instantiationService) {
    super(ProcessExplorerEditor_1.ID, group, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.processExplorerControl = void 0;
  }
  createEditor(parent) {
    this.processExplorerControl = this._register(this.instantiationService.createInstance(BrowserProcessExplorerControl, parent));
  }
  focus() {
    this.processExplorerControl?.focus();
  }
  layout(dimension) {
    this.processExplorerControl?.layout(dimension);
  }
};
ProcessExplorerEditor = ProcessExplorerEditor_1 = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService),
  __param(4, IInstantiationService)
], ProcessExplorerEditor);
export {
  ProcessExplorerEditor
};
//# sourceMappingURL=processExplorerEditor.js.map
