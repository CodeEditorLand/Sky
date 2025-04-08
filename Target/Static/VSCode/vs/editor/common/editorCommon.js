var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../base/common/event.js";
import { IMarkdownString } from "../../base/common/htmlContent.js";
import { IDisposable } from "../../base/common/lifecycle.js";
import { ThemeColor } from "../../base/common/themables.js";
import { URI, UriComponents } from "../../base/common/uri.js";
import { IEditorOptions } from "./config/editorOptions.js";
import { IDimension } from "./core/dimension.js";
import { IPosition, Position } from "./core/position.js";
import { IRange, Range } from "./core/range.js";
import { ISelection, Selection } from "./core/selection.js";
import { IModelDecoration, IModelDecorationsChangeAccessor, IModelDeltaDecoration, ITextModel, IValidEditOperation, OverviewRulerLane, TrackedRangeStickiness } from "./model.js";
import { IModelDecorationsChangedEvent } from "./textModelEvents.js";
import { ICommandMetadata } from "../../platform/commands/common/commands.js";
var ScrollType = /* @__PURE__ */ ((ScrollType2) => {
  ScrollType2[ScrollType2["Smooth"] = 0] = "Smooth";
  ScrollType2[ScrollType2["Immediate"] = 1] = "Immediate";
  return ScrollType2;
})(ScrollType || {});
function isThemeColor(o) {
  return o && typeof o.id === "string";
}
__name(isThemeColor, "isThemeColor");
const EditorType = {
  ICodeEditor: "vs.editor.ICodeEditor",
  IDiffEditor: "vs.editor.IDiffEditor"
};
var Handler = /* @__PURE__ */ ((Handler2) => {
  Handler2["CompositionStart"] = "compositionStart";
  Handler2["CompositionEnd"] = "compositionEnd";
  Handler2["Type"] = "type";
  Handler2["ReplacePreviousChar"] = "replacePreviousChar";
  Handler2["CompositionType"] = "compositionType";
  Handler2["Paste"] = "paste";
  Handler2["Cut"] = "cut";
  return Handler2;
})(Handler || {});
export {
  EditorType,
  Handler,
  ScrollType,
  isThemeColor
};
//# sourceMappingURL=editorCommon.js.map
