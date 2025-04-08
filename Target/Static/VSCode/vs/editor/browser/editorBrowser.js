var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IKeyboardEvent } from "../../base/browser/keyboardEvent.js";
import { IMouseEvent, IMouseWheelEvent } from "../../base/browser/mouseEvent.js";
import { IBoundarySashes } from "../../base/browser/ui/sash/sash.js";
import { Event } from "../../base/common/event.js";
import { IEditorConstructionOptions } from "./config/editorConfiguration.js";
import { ConfigurationChangedEvent, EditorLayoutInfo, EditorOption, FindComputedEditorOptionValueById, IComputedEditorOptions, IDiffEditorOptions, IEditorOptions, OverviewRulerPosition } from "../common/config/editorOptions.js";
import { IDimension } from "../common/core/dimension.js";
import { IPosition, Position } from "../common/core/position.js";
import { IRange, Range } from "../common/core/range.js";
import { Selection } from "../common/core/selection.js";
import { IWordAtPosition } from "../common/core/wordHelper.js";
import { ICursorPositionChangedEvent, ICursorSelectionChangedEvent } from "../common/cursorEvents.js";
import { IDiffComputationResult, ILineChange } from "../common/diff/legacyLinesDiffComputer.js";
import * as editorCommon from "../common/editorCommon.js";
import { GlyphMarginLane, ICursorStateComputer, IIdentifiedSingleEditOperation, IModelDecoration, IModelDeltaDecoration, ITextModel, PositionAffinity } from "../common/model.js";
import { InjectedText } from "../common/modelLineProjectionData.js";
import { IModelContentChangedEvent, IModelDecorationsChangedEvent, IModelLanguageChangedEvent, IModelLanguageConfigurationChangedEvent, IModelOptionsChangedEvent, IModelTokensChangedEvent } from "../common/textModelEvents.js";
import { IEditorWhitespace, IViewModel } from "../common/viewModel.js";
import { OverviewRulerZone } from "../common/viewModel/overviewZoneManager.js";
import { MenuId } from "../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../platform/contextkey/common/contextkey.js";
import { ServicesAccessor } from "../../platform/instantiation/common/instantiation.js";
var ContentWidgetPositionPreference = /* @__PURE__ */ ((ContentWidgetPositionPreference2) => {
  ContentWidgetPositionPreference2[ContentWidgetPositionPreference2["EXACT"] = 0] = "EXACT";
  ContentWidgetPositionPreference2[ContentWidgetPositionPreference2["ABOVE"] = 1] = "ABOVE";
  ContentWidgetPositionPreference2[ContentWidgetPositionPreference2["BELOW"] = 2] = "BELOW";
  return ContentWidgetPositionPreference2;
})(ContentWidgetPositionPreference || {});
var OverlayWidgetPositionPreference = /* @__PURE__ */ ((OverlayWidgetPositionPreference2) => {
  OverlayWidgetPositionPreference2[OverlayWidgetPositionPreference2["TOP_RIGHT_CORNER"] = 0] = "TOP_RIGHT_CORNER";
  OverlayWidgetPositionPreference2[OverlayWidgetPositionPreference2["BOTTOM_RIGHT_CORNER"] = 1] = "BOTTOM_RIGHT_CORNER";
  OverlayWidgetPositionPreference2[OverlayWidgetPositionPreference2["TOP_CENTER"] = 2] = "TOP_CENTER";
  return OverlayWidgetPositionPreference2;
})(OverlayWidgetPositionPreference || {});
var MouseTargetType = /* @__PURE__ */ ((MouseTargetType2) => {
  MouseTargetType2[MouseTargetType2["UNKNOWN"] = 0] = "UNKNOWN";
  MouseTargetType2[MouseTargetType2["TEXTAREA"] = 1] = "TEXTAREA";
  MouseTargetType2[MouseTargetType2["GUTTER_GLYPH_MARGIN"] = 2] = "GUTTER_GLYPH_MARGIN";
  MouseTargetType2[MouseTargetType2["GUTTER_LINE_NUMBERS"] = 3] = "GUTTER_LINE_NUMBERS";
  MouseTargetType2[MouseTargetType2["GUTTER_LINE_DECORATIONS"] = 4] = "GUTTER_LINE_DECORATIONS";
  MouseTargetType2[MouseTargetType2["GUTTER_VIEW_ZONE"] = 5] = "GUTTER_VIEW_ZONE";
  MouseTargetType2[MouseTargetType2["CONTENT_TEXT"] = 6] = "CONTENT_TEXT";
  MouseTargetType2[MouseTargetType2["CONTENT_EMPTY"] = 7] = "CONTENT_EMPTY";
  MouseTargetType2[MouseTargetType2["CONTENT_VIEW_ZONE"] = 8] = "CONTENT_VIEW_ZONE";
  MouseTargetType2[MouseTargetType2["CONTENT_WIDGET"] = 9] = "CONTENT_WIDGET";
  MouseTargetType2[MouseTargetType2["OVERVIEW_RULER"] = 10] = "OVERVIEW_RULER";
  MouseTargetType2[MouseTargetType2["SCROLLBAR"] = 11] = "SCROLLBAR";
  MouseTargetType2[MouseTargetType2["OVERLAY_WIDGET"] = 12] = "OVERLAY_WIDGET";
  MouseTargetType2[MouseTargetType2["OUTSIDE_EDITOR"] = 13] = "OUTSIDE_EDITOR";
  return MouseTargetType2;
})(MouseTargetType || {});
var DiffEditorState = /* @__PURE__ */ ((DiffEditorState2) => {
  DiffEditorState2[DiffEditorState2["Idle"] = 0] = "Idle";
  DiffEditorState2[DiffEditorState2["ComputingDiff"] = 1] = "ComputingDiff";
  DiffEditorState2[DiffEditorState2["DiffComputed"] = 2] = "DiffComputed";
  return DiffEditorState2;
})(DiffEditorState || {});
function isCodeEditor(thing) {
  if (thing && typeof thing.getEditorType === "function") {
    return thing.getEditorType() === editorCommon.EditorType.ICodeEditor;
  } else {
    return false;
  }
}
__name(isCodeEditor, "isCodeEditor");
function isDiffEditor(thing) {
  if (thing && typeof thing.getEditorType === "function") {
    return thing.getEditorType() === editorCommon.EditorType.IDiffEditor;
  } else {
    return false;
  }
}
__name(isDiffEditor, "isDiffEditor");
function isCompositeEditor(thing) {
  return !!thing && typeof thing === "object" && typeof thing.onDidChangeActiveEditor === "function";
}
__name(isCompositeEditor, "isCompositeEditor");
function getCodeEditor(thing) {
  if (isCodeEditor(thing)) {
    return thing;
  }
  if (isDiffEditor(thing)) {
    return thing.getModifiedEditor();
  }
  if (isCompositeEditor(thing) && isCodeEditor(thing.activeCodeEditor)) {
    return thing.activeCodeEditor;
  }
  return null;
}
__name(getCodeEditor, "getCodeEditor");
function getIEditor(thing) {
  if (isCodeEditor(thing) || isDiffEditor(thing)) {
    return thing;
  }
  return null;
}
__name(getIEditor, "getIEditor");
export {
  ContentWidgetPositionPreference,
  DiffEditorState,
  MouseTargetType,
  OverlayWidgetPositionPreference,
  getCodeEditor,
  getIEditor,
  isCodeEditor,
  isCompositeEditor,
  isDiffEditor
};
//# sourceMappingURL=editorBrowser.js.map
