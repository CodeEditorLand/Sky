var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var ScrollType;
(function(ScrollType2) {
  ScrollType2[ScrollType2["Smooth"] = 0] = "Smooth";
  ScrollType2[ScrollType2["Immediate"] = 1] = "Immediate";
})(ScrollType || (ScrollType = {}));
function isThemeColor(o) {
  return !!o && typeof o.id === "string";
}
__name(isThemeColor, "isThemeColor");
const EditorType = {
  ICodeEditor: "vs.editor.ICodeEditor",
  IDiffEditor: "vs.editor.IDiffEditor"
};
var Handler;
(function(Handler2) {
  Handler2["CompositionStart"] = "compositionStart";
  Handler2["CompositionEnd"] = "compositionEnd";
  Handler2["Type"] = "type";
  Handler2["ReplacePreviousChar"] = "replacePreviousChar";
  Handler2["CompositionType"] = "compositionType";
  Handler2["Paste"] = "paste";
  Handler2["Cut"] = "cut";
})(Handler || (Handler = {}));
export {
  EditorType,
  Handler,
  ScrollType,
  isThemeColor
};
//# sourceMappingURL=editorCommon.js.map
