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
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ProcessExplorerEditor } from "../browser/processExplorerEditor.js";
import { NativeProcessExplorerControl } from "./processExplorerControl.js";
let NativeProcessExplorerEditor = class NativeProcessExplorerEditor2 extends ProcessExplorerEditor {
  static {
    __name(this, "NativeProcessExplorerEditor");
  }
  constructor(group, telemetryService, themeService, storageService, instantiationService) {
    super(group, telemetryService, themeService, storageService, instantiationService);
  }
  createEditor(parent) {
    this.processExplorerControl = this._register(this.instantiationService.createInstance(NativeProcessExplorerControl, parent));
  }
};
NativeProcessExplorerEditor = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService),
  __param(4, IInstantiationService)
], NativeProcessExplorerEditor);
export {
  NativeProcessExplorerEditor
};
//# sourceMappingURL=processExplorerEditor.js.map
