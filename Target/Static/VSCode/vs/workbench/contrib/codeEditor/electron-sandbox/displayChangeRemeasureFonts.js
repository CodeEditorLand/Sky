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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { FontMeasurements } from "../../../../editor/browser/config/fontMeasurements.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions, IWorkbenchContribution, IWorkbenchContributionsRegistry } from "../../../common/contributions.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
let DisplayChangeRemeasureFonts = class extends Disposable {
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
DisplayChangeRemeasureFonts = __decorateClass([
  __decorateParam(0, INativeHostService)
], DisplayChangeRemeasureFonts);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(DisplayChangeRemeasureFonts, LifecyclePhase.Eventually);
//# sourceMappingURL=displayChangeRemeasureFonts.js.map
