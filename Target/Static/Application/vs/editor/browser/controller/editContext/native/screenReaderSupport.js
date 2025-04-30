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
import { getActiveWindow } from "../../../../../base/browser/dom.js";
import { localize } from "../../../../../nls.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { Selection } from "../../../../common/core/selection.js";
import { applyFontInfo } from "../../../config/domFontInfo.js";
import { ariaLabelForScreenReaderContent, PagedScreenReaderStrategy } from "../screenReaderUtils.js";
let ScreenReaderSupport = class ScreenReaderSupport2 {
  static {
    __name(this, "ScreenReaderSupport");
  }
  constructor(_domNode, _context, _keybindingService, _accessibilityService) {
    this._domNode = _domNode;
    this._context = _context;
    this._keybindingService = _keybindingService;
    this._accessibilityService = _accessibilityService;
    this._contentLeft = 1;
    this._contentWidth = 1;
    this._contentHeight = 1;
    this._divWidth = 1;
    this._accessibilityPageSize = 1;
    this._ignoreSelectionChangeTime = 0;
    this._primarySelection = new Selection(1, 1, 1, 1);
    this._primaryCursorVisibleRange = null;
    this._updateConfigurationSettings();
    this._updateDomAttributes();
  }
  setIgnoreSelectionChangeTime(reason) {
    this._ignoreSelectionChangeTime = Date.now();
  }
  getIgnoreSelectionChangeTime() {
    return this._ignoreSelectionChangeTime;
  }
  resetSelectionChangeTime() {
    this._ignoreSelectionChangeTime = 0;
  }
  onConfigurationChanged(e) {
    this._updateConfigurationSettings();
    this._updateDomAttributes();
    if (e.hasChanged(
      2
      /* EditorOption.accessibilitySupport */
    )) {
      this.writeScreenReaderContent();
    }
  }
  _updateConfigurationSettings() {
    const options = this._context.configuration.options;
    const layoutInfo = options.get(
      151
      /* EditorOption.layoutInfo */
    );
    const wrappingColumn = layoutInfo.wrappingColumn;
    this._contentLeft = layoutInfo.contentLeft;
    this._contentWidth = layoutInfo.contentWidth;
    this._contentHeight = layoutInfo.height;
    this._fontInfo = options.get(
      52
      /* EditorOption.fontInfo */
    );
    this._accessibilityPageSize = options.get(
      3
      /* EditorOption.accessibilityPageSize */
    );
    this._divWidth = Math.round(wrappingColumn * this._fontInfo.typicalHalfwidthCharacterWidth);
  }
  _updateDomAttributes() {
    const options = this._context.configuration.options;
    this._domNode.domNode.setAttribute("role", "textbox");
    this._domNode.domNode.setAttribute("aria-required", options.get(
      5
      /* EditorOption.ariaRequired */
    ) ? "true" : "false");
    this._domNode.domNode.setAttribute("aria-multiline", "true");
    this._domNode.domNode.setAttribute("aria-autocomplete", options.get(
      96
      /* EditorOption.readOnly */
    ) ? "none" : "both");
    this._domNode.domNode.setAttribute("aria-roledescription", localize("editor", "editor"));
    this._domNode.domNode.setAttribute("aria-label", ariaLabelForScreenReaderContent(options, this._keybindingService));
    const tabSize = this._context.viewModel.model.getOptions().tabSize;
    const spaceWidth = options.get(
      52
      /* EditorOption.fontInfo */
    ).spaceWidth;
    this._domNode.domNode.style.tabSize = `${tabSize * spaceWidth}px`;
    const wordWrapOverride2 = options.get(
      142
      /* EditorOption.wordWrapOverride2 */
    );
    const wordWrapValue = wordWrapOverride2 !== "inherit" ? wordWrapOverride2 : options.get(
      137
      /* EditorOption.wordWrap */
    );
    this._domNode.domNode.style.textWrap = wordWrapValue === "off" ? "nowrap" : "wrap";
  }
  onCursorStateChanged(e) {
    this._primarySelection = e.selections[0] ?? new Selection(1, 1, 1, 1);
  }
  prepareRender(ctx) {
    this.writeScreenReaderContent();
    this._primaryCursorVisibleRange = ctx.visibleRangeForPosition(this._primarySelection.getPosition());
  }
  render(ctx) {
    if (!this._screenReaderContentState) {
      return;
    }
    if (!this._primaryCursorVisibleRange) {
      this._renderAtTopLeft();
      return;
    }
    const editorScrollLeft = this._context.viewLayout.getCurrentScrollLeft();
    const left = this._contentLeft + this._primaryCursorVisibleRange.left - editorScrollLeft;
    if (left < this._contentLeft || left > this._contentLeft + this._contentWidth) {
      this._renderAtTopLeft();
      return;
    }
    const editorScrollTop = this._context.viewLayout.getCurrentScrollTop();
    const positionLineNumber = this._primarySelection.positionLineNumber;
    const top = this._context.viewLayout.getVerticalOffsetForLineNumber(positionLineNumber) - editorScrollTop;
    if (top < 0 || top > this._contentHeight) {
      this._renderAtTopLeft();
      return;
    }
    const lineHeight = this._context.viewLayout.getLineHeightForLineNumber(positionLineNumber);
    const lineNumberWithinStateAboveCursor = positionLineNumber - this._screenReaderContentState.startPositionWithinEditor.lineNumber;
    const scrollTop = lineNumberWithinStateAboveCursor * lineHeight;
    this._doRender(scrollTop, top, this._contentLeft, this._divWidth, lineHeight);
  }
  _renderAtTopLeft() {
    this._doRender(0, 0, 0, this._contentWidth, 1);
  }
  _doRender(scrollTop, top, left, width, height) {
    applyFontInfo(this._domNode, this._fontInfo);
    this._domNode.setTop(top);
    this._domNode.setLeft(left);
    this._domNode.setWidth(width);
    this._domNode.setHeight(height);
    this._domNode.setLineHeight(height);
    this._domNode.domNode.scrollTop = scrollTop;
  }
  setAriaOptions(options) {
    if (options.activeDescendant) {
      this._domNode.setAttribute("aria-haspopup", "true");
      this._domNode.setAttribute("aria-autocomplete", "list");
      this._domNode.setAttribute("aria-activedescendant", options.activeDescendant);
    } else {
      this._domNode.setAttribute("aria-haspopup", "false");
      this._domNode.setAttribute("aria-autocomplete", "both");
      this._domNode.removeAttribute("aria-activedescendant");
    }
    if (options.role) {
      this._domNode.setAttribute("role", options.role);
    }
  }
  writeScreenReaderContent() {
    const focusedElement = getActiveWindow().document.activeElement;
    if (!focusedElement || focusedElement !== this._domNode.domNode) {
      return;
    }
    const isScreenReaderOptimized = this._accessibilityService.isScreenReaderOptimized();
    if (isScreenReaderOptimized) {
      this._screenReaderContentState = this._getScreenReaderContentState();
      const endPosition = this._context.viewModel.model.getPositionAt(Infinity);
      let value = this._screenReaderContentState.value;
      if (endPosition.column === 1 && this._primarySelection.getEndPosition().equals(endPosition)) {
        value += "\n";
      }
      if (this._domNode.domNode.textContent !== value) {
        this.setIgnoreSelectionChangeTime("setValue");
        this._domNode.domNode.textContent = value;
      }
      this._setSelectionOfScreenReaderContent(this._screenReaderContentState.selectionStart, this._screenReaderContentState.selectionEnd);
    } else {
      this._screenReaderContentState = void 0;
      this.setIgnoreSelectionChangeTime("setValue");
      this._domNode.domNode.textContent = "";
    }
  }
  get screenReaderContentState() {
    return this._screenReaderContentState;
  }
  _getScreenReaderContentState() {
    const simpleModel = {
      getLineCount: /* @__PURE__ */ __name(() => {
        return this._context.viewModel.getLineCount();
      }, "getLineCount"),
      getLineMaxColumn: /* @__PURE__ */ __name((lineNumber) => {
        return this._context.viewModel.getLineMaxColumn(lineNumber);
      }, "getLineMaxColumn"),
      getValueInRange: /* @__PURE__ */ __name((range, eol) => {
        return this._context.viewModel.getValueInRange(range, eol);
      }, "getValueInRange"),
      getValueLengthInRange: /* @__PURE__ */ __name((range, eol) => {
        return this._context.viewModel.getValueLengthInRange(range, eol);
      }, "getValueLengthInRange"),
      modifyPosition: /* @__PURE__ */ __name((position, offset) => {
        return this._context.viewModel.modifyPosition(position, offset);
      }, "modifyPosition")
    };
    return PagedScreenReaderStrategy.fromEditorSelection(
      simpleModel,
      this._primarySelection,
      this._accessibilityPageSize,
      this._accessibilityService.getAccessibilitySupport() === 0
      /* AccessibilitySupport.Unknown */
    );
  }
  _setSelectionOfScreenReaderContent(selectionOffsetStart, selectionOffsetEnd) {
    const activeDocument = getActiveWindow().document;
    const activeDocumentSelection = activeDocument.getSelection();
    if (!activeDocumentSelection) {
      return;
    }
    const textContent = this._domNode.domNode.firstChild;
    if (!textContent) {
      return;
    }
    const range = new globalThis.Range();
    range.setStart(textContent, selectionOffsetStart);
    range.setEnd(textContent, selectionOffsetEnd);
    this.setIgnoreSelectionChangeTime("setRange");
    activeDocumentSelection.removeAllRanges();
    activeDocumentSelection.addRange(range);
  }
};
ScreenReaderSupport = __decorate([
  __param(2, IKeybindingService),
  __param(3, IAccessibilityService)
], ScreenReaderSupport);
export {
  ScreenReaderSupport
};
//# sourceMappingURL=screenReaderSupport.js.map
