var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "../../../base/common/arrays.js";
function isResolvedEditorModel(model) {
  const candidate = model;
  return typeof candidate?.resolve === "function" && typeof candidate?.isResolved === "function";
}
__name(isResolvedEditorModel, "isResolvedEditorModel");
var EditorActivation;
(function(EditorActivation2) {
  EditorActivation2[EditorActivation2["ACTIVATE"] = 1] = "ACTIVATE";
  EditorActivation2[EditorActivation2["RESTORE"] = 2] = "RESTORE";
  EditorActivation2[EditorActivation2["PRESERVE"] = 3] = "PRESERVE";
})(EditorActivation || (EditorActivation = {}));
var EditorResolution;
(function(EditorResolution2) {
  EditorResolution2[EditorResolution2["PICK"] = 0] = "PICK";
  EditorResolution2[EditorResolution2["EXCLUSIVE_ONLY"] = 1] = "EXCLUSIVE_ONLY";
})(EditorResolution || (EditorResolution = {}));
var EditorOpenSource;
(function(EditorOpenSource2) {
  EditorOpenSource2[EditorOpenSource2["API"] = 0] = "API";
  EditorOpenSource2[EditorOpenSource2["USER"] = 1] = "USER";
})(EditorOpenSource || (EditorOpenSource = {}));
var TextEditorSelectionRevealType;
(function(TextEditorSelectionRevealType2) {
  TextEditorSelectionRevealType2[TextEditorSelectionRevealType2["Center"] = 0] = "Center";
  TextEditorSelectionRevealType2[TextEditorSelectionRevealType2["CenterIfOutsideViewport"] = 1] = "CenterIfOutsideViewport";
  TextEditorSelectionRevealType2[TextEditorSelectionRevealType2["NearTop"] = 2] = "NearTop";
  TextEditorSelectionRevealType2[TextEditorSelectionRevealType2["NearTopIfOutsideViewport"] = 3] = "NearTopIfOutsideViewport";
})(TextEditorSelectionRevealType || (TextEditorSelectionRevealType = {}));
var TextEditorSelectionSource;
(function(TextEditorSelectionSource2) {
  TextEditorSelectionSource2["PROGRAMMATIC"] = "api";
  TextEditorSelectionSource2["NAVIGATION"] = "code.navigation";
  TextEditorSelectionSource2["JUMP"] = "code.jump";
})(TextEditorSelectionSource || (TextEditorSelectionSource = {}));
function isTextEditorDiffInformationEqual(uriIdentityService, diff1, diff2) {
  return diff1?.documentVersion === diff2?.documentVersion && uriIdentityService.extUri.isEqual(diff1?.original, diff2?.original) && uriIdentityService.extUri.isEqual(diff1?.modified, diff2?.modified) && equals(diff1?.changes, diff2?.changes, (a, b) => {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  });
}
__name(isTextEditorDiffInformationEqual, "isTextEditorDiffInformationEqual");
export {
  EditorActivation,
  EditorOpenSource,
  EditorResolution,
  TextEditorSelectionRevealType,
  TextEditorSelectionSource,
  isResolvedEditorModel,
  isTextEditorDiffInformationEqual
};
//# sourceMappingURL=editor.js.map
