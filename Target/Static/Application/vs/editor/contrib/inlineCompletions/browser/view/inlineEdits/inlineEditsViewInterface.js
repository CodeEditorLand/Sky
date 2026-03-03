var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getWindow } from "../../../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../../../base/browser/mouseEvent.js";
var InlineEditTabAction;
(function(InlineEditTabAction2) {
  InlineEditTabAction2["Jump"] = "jump";
  InlineEditTabAction2["Accept"] = "accept";
  InlineEditTabAction2["Inactive"] = "inactive";
})(InlineEditTabAction || (InlineEditTabAction = {}));
class InlineEditClickEvent {
  static {
    __name(this, "InlineEditClickEvent");
  }
  static create(event, alternativeAction = false) {
    return new InlineEditClickEvent(new StandardMouseEvent(getWindow(event), event), alternativeAction);
  }
  constructor(event, alternativeAction = false) {
    this.event = event;
    this.alternativeAction = alternativeAction;
  }
}
var InlineCompletionViewKind;
(function(InlineCompletionViewKind2) {
  InlineCompletionViewKind2["GhostText"] = "ghostText";
  InlineCompletionViewKind2["Custom"] = "custom";
  InlineCompletionViewKind2["SideBySide"] = "sideBySide";
  InlineCompletionViewKind2["Deletion"] = "deletion";
  InlineCompletionViewKind2["InsertionInline"] = "insertionInline";
  InlineCompletionViewKind2["InsertionMultiLine"] = "insertionMultiLine";
  InlineCompletionViewKind2["WordReplacements"] = "wordReplacements";
  InlineCompletionViewKind2["LineReplacement"] = "lineReplacement";
  InlineCompletionViewKind2["Collapsed"] = "collapsed";
  InlineCompletionViewKind2["JumpTo"] = "jumpTo";
})(InlineCompletionViewKind || (InlineCompletionViewKind = {}));
class InlineCompletionViewData {
  static {
    __name(this, "InlineCompletionViewData");
  }
  constructor(cursorColumnDistance, cursorLineDistance, lineCountOriginal, lineCountModified, characterCountOriginal, characterCountModified, disjointReplacements, sameShapeReplacements) {
    this.cursorColumnDistance = cursorColumnDistance;
    this.cursorLineDistance = cursorLineDistance;
    this.lineCountOriginal = lineCountOriginal;
    this.lineCountModified = lineCountModified;
    this.characterCountOriginal = characterCountOriginal;
    this.characterCountModified = characterCountModified;
    this.disjointReplacements = disjointReplacements;
    this.sameShapeReplacements = sameShapeReplacements;
    this.longDistanceHintVisible = void 0;
    this.longDistanceHintDistance = void 0;
  }
  setLongDistanceViewData(lineNumber, inlineEditLineNumber) {
    this.longDistanceHintVisible = true;
    this.longDistanceHintDistance = Math.abs(inlineEditLineNumber - lineNumber);
  }
  getData() {
    return {
      cursorColumnDistance: this.cursorColumnDistance,
      cursorLineDistance: this.cursorLineDistance,
      lineCountOriginal: this.lineCountOriginal,
      lineCountModified: this.lineCountModified,
      characterCountOriginal: this.characterCountOriginal,
      characterCountModified: this.characterCountModified,
      disjointReplacements: this.disjointReplacements,
      sameShapeReplacements: this.sameShapeReplacements,
      longDistanceHintVisible: this.longDistanceHintVisible,
      longDistanceHintDistance: this.longDistanceHintDistance
    };
  }
}
export {
  InlineCompletionViewData,
  InlineCompletionViewKind,
  InlineEditClickEvent,
  InlineEditTabAction
};
//# sourceMappingURL=inlineEditsViewInterface.js.map
