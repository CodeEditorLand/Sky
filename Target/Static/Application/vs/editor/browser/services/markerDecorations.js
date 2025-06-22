var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IMarkerDecorationsService } from "../../common/services/markerDecorations.js";
import { registerEditorContribution } from "../editorExtensions.js";
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
let MarkerDecorationsContribution = class MarkerDecorationsContribution2 {
  static {
    __name(this, "MarkerDecorationsContribution");
  }
  static {
    this.ID = "editor.contrib.markerDecorations";
  }
  constructor(_editor, _markerDecorationsService) {
  }
  dispose() {
  }
};
MarkerDecorationsContribution = __decorate([
  __param(1, IMarkerDecorationsService)
], MarkerDecorationsContribution);
registerEditorContribution(
  MarkerDecorationsContribution.ID,
  MarkerDecorationsContribution,
  0
  /* EditorContributionInstantiation.Eager */
);
export {
  MarkerDecorationsContribution
};
//# sourceMappingURL=markerDecorations.js.map
