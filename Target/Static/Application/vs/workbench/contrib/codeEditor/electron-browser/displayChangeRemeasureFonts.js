var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { FontMeasurements } from "../../../../editor/browser/config/fontMeasurements.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
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
let DisplayChangeRemeasureFonts = class DisplayChangeRemeasureFonts2 extends Disposable {
  static {
    __name(this, "DisplayChangeRemeasureFonts");
  }
  constructor(nativeHostService) {
    super();
    this._register(nativeHostService.onDidChangeDisplay(() => {
      FontMeasurements.clearAllFontInfos();
    }));
  }
};
DisplayChangeRemeasureFonts = __decorate([
  __param(0, INativeHostService)
], DisplayChangeRemeasureFonts);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
  DisplayChangeRemeasureFonts,
  4
  /* LifecyclePhase.Eventually */
);
//# sourceMappingURL=displayChangeRemeasureFonts.js.map
