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
import * as dom from "../../../../base/browser/dom.js";
import { Gesture } from "../../../../base/browser/touch.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import "./lightBulbWidget.css";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition, IEditorMouseEvent } from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { IPosition } from "../../../common/core/position.js";
import { GlyphMarginLane, IModelDecorationsChangeAccessor, TrackedRangeStickiness } from "../../../common/model.js";
import { ModelDecorationOptions } from "../../../common/model/textModel.js";
import { computeIndentLevel } from "../../../common/model/utils.js";
import { autoFixCommandId, quickFixCommandId } from "./codeAction.js";
import { CodeActionSet, CodeActionTrigger } from "../common/types.js";
import * as nls from "../../../../nls.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { Range } from "../../../common/core/range.js";
const GUTTER_LIGHTBULB_ICON = registerIcon("gutter-lightbulb", Codicon.lightBulb, nls.localize("gutterLightbulbWidget", "Icon which spawns code actions menu from the gutter when there is no space in the editor."));
const GUTTER_LIGHTBULB_AUTO_FIX_ICON = registerIcon("gutter-lightbulb-auto-fix", Codicon.lightbulbAutofix, nls.localize("gutterLightbulbAutoFixWidget", "Icon which spawns code actions menu from the gutter when there is no space in the editor and a quick fix is available."));
const GUTTER_LIGHTBULB_AIFIX_ICON = registerIcon("gutter-lightbulb-sparkle", Codicon.lightbulbSparkle, nls.localize("gutterLightbulbAIFixWidget", "Icon which spawns code actions menu from the gutter when there is no space in the editor and an AI fix is available."));
const GUTTER_LIGHTBULB_AIFIX_AUTO_FIX_ICON = registerIcon("gutter-lightbulb-aifix-auto-fix", Codicon.lightbulbSparkleAutofix, nls.localize("gutterLightbulbAIFixAutoFixWidget", "Icon which spawns code actions menu from the gutter when there is no space in the editor and an AI fix and a quick fix is available."));
const GUTTER_SPARKLE_FILLED_ICON = registerIcon("gutter-lightbulb-sparkle-filled", Codicon.sparkleFilled, nls.localize("gutterLightbulbSparkleFilledWidget", "Icon which spawns code actions menu from the gutter when there is no space in the editor and an AI fix and a quick fix is available."));
var LightBulbState;
((LightBulbState2) => {
  let Type;
  ((Type2) => {
    Type2[Type2["Hidden"] = 0] = "Hidden";
    Type2[Type2["Showing"] = 1] = "Showing";
  })(Type = LightBulbState2.Type || (LightBulbState2.Type = {}));
  LightBulbState2.Hidden = { type: 0 /* Hidden */ };
  class Showing {
    constructor(actions, trigger, editorPosition, widgetPosition) {
      this.actions = actions;
      this.trigger = trigger;
      this.editorPosition = editorPosition;
      this.widgetPosition = widgetPosition;
    }
    static {
      __name(this, "Showing");
    }
    type = 1 /* Showing */;
  }
  LightBulbState2.Showing = Showing;
})(LightBulbState || (LightBulbState = {}));
let LightBulbWidget = class extends Disposable {
  constructor(_editor, _keybindingService) {
    super();
    this._editor = _editor;
    this._keybindingService = _keybindingService;
    this._domNode = dom.$("div.lightBulbWidget");
    this._domNode.role = "listbox";
    this._register(Gesture.ignoreTarget(this._domNode));
    this._editor.addContentWidget(this);
    this._register(this._editor.onDidChangeModelContent((_) => {
      const editorModel = this._editor.getModel();
      if (this.state.type !== 1 /* Showing */ || !editorModel || this.state.editorPosition.lineNumber >= editorModel.getLineCount()) {
        this.hide();
      }
      if (this.gutterState.type !== 1 /* Showing */ || !editorModel || this.gutterState.editorPosition.lineNumber >= editorModel.getLineCount()) {
        this.gutterHide();
      }
    }));
    this._register(dom.addStandardDisposableGenericMouseDownListener(this._domNode, (e) => {
      if (this.state.type !== 1 /* Showing */) {
        return;
      }
      this._editor.focus();
      e.preventDefault();
      const { top, height } = dom.getDomNodePagePosition(this._domNode);
      const lineHeight = this._editor.getOption(EditorOption.lineHeight);
      let pad = Math.floor(lineHeight / 3);
      if (this.state.widgetPosition.position !== null && this.state.widgetPosition.position.lineNumber < this.state.editorPosition.lineNumber) {
        pad += lineHeight;
      }
      this._onClick.fire({
        x: e.posx,
        y: top + height + pad,
        actions: this.state.actions,
        trigger: this.state.trigger
      });
    }));
    this._register(dom.addDisposableListener(this._domNode, "mouseenter", (e) => {
      if ((e.buttons & 1) !== 1) {
        return;
      }
      this.hide();
    }));
    this._register(Event.runAndSubscribe(this._keybindingService.onDidUpdateKeybindings, () => {
      this._preferredKbLabel = this._keybindingService.lookupKeybinding(autoFixCommandId)?.getLabel() ?? void 0;
      this._quickFixKbLabel = this._keybindingService.lookupKeybinding(quickFixCommandId)?.getLabel() ?? void 0;
      this._updateLightBulbTitleAndIcon();
    }));
    this._register(this._editor.onMouseDown(async (e) => {
      if (!e.target.element || !this.lightbulbClasses.some((cls) => e.target.element && e.target.element.classList.contains(cls))) {
        return;
      }
      if (this.gutterState.type !== 1 /* Showing */) {
        return;
      }
      this._editor.focus();
      const { top, height } = dom.getDomNodePagePosition(e.target.element);
      const lineHeight = this._editor.getOption(EditorOption.lineHeight);
      let pad = Math.floor(lineHeight / 3);
      if (this.gutterState.widgetPosition.position !== null && this.gutterState.widgetPosition.position.lineNumber < this.gutterState.editorPosition.lineNumber) {
        pad += lineHeight;
      }
      this._onClick.fire({
        x: e.event.posx,
        y: top + height + pad,
        actions: this.gutterState.actions,
        trigger: this.gutterState.trigger
      });
    }));
  }
  static {
    __name(this, "LightBulbWidget");
  }
  _gutterDecorationID;
  static GUTTER_DECORATION = ModelDecorationOptions.register({
    description: "codicon-gutter-lightbulb-decoration",
    glyphMarginClassName: ThemeIcon.asClassName(Codicon.lightBulb),
    glyphMargin: { position: GlyphMarginLane.Left },
    stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
  });
  static ID = "editor.contrib.lightbulbWidget";
  static _posPref = [ContentWidgetPositionPreference.EXACT];
  _domNode;
  _onClick = this._register(new Emitter());
  onClick = this._onClick.event;
  _state = LightBulbState.Hidden;
  _gutterState = LightBulbState.Hidden;
  _iconClasses = [];
  lightbulbClasses = [
    "codicon-" + GUTTER_LIGHTBULB_ICON.id,
    "codicon-" + GUTTER_LIGHTBULB_AIFIX_AUTO_FIX_ICON.id,
    "codicon-" + GUTTER_LIGHTBULB_AUTO_FIX_ICON.id,
    "codicon-" + GUTTER_LIGHTBULB_AIFIX_ICON.id,
    "codicon-" + GUTTER_SPARKLE_FILLED_ICON.id
  ];
  _preferredKbLabel;
  _quickFixKbLabel;
  gutterDecoration = LightBulbWidget.GUTTER_DECORATION;
  dispose() {
    super.dispose();
    this._editor.removeContentWidget(this);
    if (this._gutterDecorationID) {
      this._removeGutterDecoration(this._gutterDecorationID);
    }
  }
  getId() {
    return "LightBulbWidget";
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return this._state.type === 1 /* Showing */ ? this._state.widgetPosition : null;
  }
  update(actions, trigger, atPosition) {
    if (actions.validActions.length <= 0) {
      this.gutterHide();
      return this.hide();
    }
    const hasTextFocus = this._editor.hasTextFocus();
    if (!hasTextFocus) {
      this.gutterHide();
      return this.hide();
    }
    const options = this._editor.getOptions();
    if (!options.get(EditorOption.lightbulb).enabled) {
      this.gutterHide();
      return this.hide();
    }
    const model = this._editor.getModel();
    if (!model) {
      this.gutterHide();
      return this.hide();
    }
    const { lineNumber, column } = model.validatePosition(atPosition);
    const tabSize = model.getOptions().tabSize;
    const fontInfo = this._editor.getOptions().get(EditorOption.fontInfo);
    const lineContent = model.getLineContent(lineNumber);
    const indent = computeIndentLevel(lineContent, tabSize);
    const lineHasSpace = fontInfo.spaceWidth * indent > 22;
    const isFolded = /* @__PURE__ */ __name((lineNumber2) => {
      return lineNumber2 > 2 && this._editor.getTopForLineNumber(lineNumber2) === this._editor.getTopForLineNumber(lineNumber2 - 1);
    }, "isFolded");
    const currLineDecorations = this._editor.getLineDecorations(lineNumber);
    let hasDecoration = false;
    if (currLineDecorations) {
      for (const decoration of currLineDecorations) {
        const glyphClass = decoration.options.glyphMarginClassName;
        if (glyphClass && !this.lightbulbClasses.some((className) => glyphClass.includes(className))) {
          hasDecoration = true;
          break;
        }
      }
    }
    let effectiveLineNumber = lineNumber;
    let effectiveColumnNumber = 1;
    if (!lineHasSpace) {
      const isLineEmptyOrIndented = /* @__PURE__ */ __name((lineNumber2) => {
        const lineContent2 = model.getLineContent(lineNumber2);
        return /^\s*$|^\s+/.test(lineContent2) || lineContent2.length <= effectiveColumnNumber;
      }, "isLineEmptyOrIndented");
      if (lineNumber > 1 && !isFolded(lineNumber - 1)) {
        const lineCount = model.getLineCount();
        const endLine = lineNumber === lineCount;
        const prevLineEmptyOrIndented = lineNumber > 1 && isLineEmptyOrIndented(lineNumber - 1);
        const nextLineEmptyOrIndented = !endLine && isLineEmptyOrIndented(lineNumber + 1);
        const currLineEmptyOrIndented = isLineEmptyOrIndented(lineNumber);
        const notEmpty = !nextLineEmptyOrIndented && !prevLineEmptyOrIndented;
        if (!nextLineEmptyOrIndented && !prevLineEmptyOrIndented && !hasDecoration) {
          this.gutterState = new LightBulbState.Showing(actions, trigger, atPosition, {
            position: { lineNumber: effectiveLineNumber, column: effectiveColumnNumber },
            preference: LightBulbWidget._posPref
          });
          this.renderGutterLightbub();
          return this.hide();
        } else if (prevLineEmptyOrIndented || endLine || prevLineEmptyOrIndented && !currLineEmptyOrIndented) {
          effectiveLineNumber -= 1;
        } else if (nextLineEmptyOrIndented || notEmpty && currLineEmptyOrIndented) {
          effectiveLineNumber += 1;
        }
      } else if (lineNumber === 1 && (lineNumber === model.getLineCount() || !isLineEmptyOrIndented(lineNumber + 1) && !isLineEmptyOrIndented(lineNumber))) {
        this.gutterState = new LightBulbState.Showing(actions, trigger, atPosition, {
          position: { lineNumber: effectiveLineNumber, column: effectiveColumnNumber },
          preference: LightBulbWidget._posPref
        });
        if (hasDecoration) {
          this.gutterHide();
        } else {
          this.renderGutterLightbub();
          return this.hide();
        }
      } else if (lineNumber < model.getLineCount() && !isFolded(lineNumber + 1)) {
        effectiveLineNumber += 1;
      } else if (column * fontInfo.spaceWidth < 22) {
        return this.hide();
      }
      effectiveColumnNumber = /^\S\s*$/.test(model.getLineContent(effectiveLineNumber)) ? 2 : 1;
    }
    this.state = new LightBulbState.Showing(actions, trigger, atPosition, {
      position: { lineNumber: effectiveLineNumber, column: effectiveColumnNumber },
      preference: LightBulbWidget._posPref
    });
    if (this._gutterDecorationID) {
      this._removeGutterDecoration(this._gutterDecorationID);
      this.gutterHide();
    }
    const validActions = actions.validActions;
    const actionKind = actions.validActions[0].action.kind;
    if (validActions.length !== 1 || !actionKind) {
      this._editor.layoutContentWidget(this);
      return;
    }
    this._editor.layoutContentWidget(this);
  }
  hide() {
    if (this.state === LightBulbState.Hidden) {
      return;
    }
    this.state = LightBulbState.Hidden;
    this._editor.layoutContentWidget(this);
  }
  gutterHide() {
    if (this.gutterState === LightBulbState.Hidden) {
      return;
    }
    if (this._gutterDecorationID) {
      this._removeGutterDecoration(this._gutterDecorationID);
    }
    this.gutterState = LightBulbState.Hidden;
  }
  get state() {
    return this._state;
  }
  set state(value) {
    this._state = value;
    this._updateLightBulbTitleAndIcon();
  }
  get gutterState() {
    return this._gutterState;
  }
  set gutterState(value) {
    this._gutterState = value;
    this._updateGutterLightBulbTitleAndIcon();
  }
  _updateLightBulbTitleAndIcon() {
    this._domNode.classList.remove(...this._iconClasses);
    this._iconClasses = [];
    if (this.state.type !== 1 /* Showing */) {
      return;
    }
    let icon;
    let autoRun = false;
    if (this.state.actions.allAIFixes) {
      icon = Codicon.sparkleFilled;
      if (this.state.actions.validActions.length === 1) {
        autoRun = true;
      }
    } else if (this.state.actions.hasAutoFix) {
      if (this.state.actions.hasAIFix) {
        icon = Codicon.lightbulbSparkleAutofix;
      } else {
        icon = Codicon.lightbulbAutofix;
      }
    } else if (this.state.actions.hasAIFix) {
      icon = Codicon.lightbulbSparkle;
    } else {
      icon = Codicon.lightBulb;
    }
    this._updateLightbulbTitle(this.state.actions.hasAutoFix, autoRun);
    this._iconClasses = ThemeIcon.asClassNameArray(icon);
    this._domNode.classList.add(...this._iconClasses);
  }
  _updateGutterLightBulbTitleAndIcon() {
    if (this.gutterState.type !== 1 /* Showing */) {
      return;
    }
    let icon;
    let autoRun = false;
    if (this.gutterState.actions.allAIFixes) {
      icon = GUTTER_SPARKLE_FILLED_ICON;
      if (this.gutterState.actions.validActions.length === 1) {
        autoRun = true;
      }
    } else if (this.gutterState.actions.hasAutoFix) {
      if (this.gutterState.actions.hasAIFix) {
        icon = GUTTER_LIGHTBULB_AIFIX_AUTO_FIX_ICON;
      } else {
        icon = GUTTER_LIGHTBULB_AUTO_FIX_ICON;
      }
    } else if (this.gutterState.actions.hasAIFix) {
      icon = GUTTER_LIGHTBULB_AIFIX_ICON;
    } else {
      icon = GUTTER_LIGHTBULB_ICON;
    }
    this._updateLightbulbTitle(this.gutterState.actions.hasAutoFix, autoRun);
    const GUTTER_DECORATION = ModelDecorationOptions.register({
      description: "codicon-gutter-lightbulb-decoration",
      glyphMarginClassName: ThemeIcon.asClassName(icon),
      glyphMargin: { position: GlyphMarginLane.Left },
      stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
    });
    this.gutterDecoration = GUTTER_DECORATION;
  }
  /* Gutter Helper Functions */
  renderGutterLightbub() {
    const selection = this._editor.getSelection();
    if (!selection) {
      return;
    }
    if (this._gutterDecorationID === void 0) {
      this._addGutterDecoration(selection.startLineNumber);
    } else {
      this._updateGutterDecoration(this._gutterDecorationID, selection.startLineNumber);
    }
  }
  _addGutterDecoration(lineNumber) {
    this._editor.changeDecorations((accessor) => {
      this._gutterDecorationID = accessor.addDecoration(new Range(lineNumber, 0, lineNumber, 0), this.gutterDecoration);
    });
  }
  _removeGutterDecoration(decorationId) {
    this._editor.changeDecorations((accessor) => {
      accessor.removeDecoration(decorationId);
      this._gutterDecorationID = void 0;
    });
  }
  _updateGutterDecoration(decorationId, lineNumber) {
    this._editor.changeDecorations((accessor) => {
      accessor.changeDecoration(decorationId, new Range(lineNumber, 0, lineNumber, 0));
      accessor.changeDecorationOptions(decorationId, this.gutterDecoration);
    });
  }
  _updateLightbulbTitle(autoFix, autoRun) {
    if (this.state.type !== 1 /* Showing */) {
      return;
    }
    if (autoRun) {
      this.title = nls.localize("codeActionAutoRun", "Run: {0}", this.state.actions.validActions[0].action.title);
    } else if (autoFix && this._preferredKbLabel) {
      this.title = nls.localize("preferredcodeActionWithKb", "Show Code Actions. Preferred Quick Fix Available ({0})", this._preferredKbLabel);
    } else if (!autoFix && this._quickFixKbLabel) {
      this.title = nls.localize("codeActionWithKb", "Show Code Actions ({0})", this._quickFixKbLabel);
    } else if (!autoFix) {
      this.title = nls.localize("codeAction", "Show Code Actions");
    }
  }
  set title(value) {
    this._domNode.title = value;
  }
};
LightBulbWidget = __decorateClass([
  __decorateParam(1, IKeybindingService)
], LightBulbWidget);
export {
  LightBulbWidget
};
//# sourceMappingURL=lightBulbWidget.js.map
