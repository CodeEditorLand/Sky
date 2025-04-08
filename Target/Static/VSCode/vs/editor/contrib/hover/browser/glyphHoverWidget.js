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
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { MarkdownRenderer } from "../../../browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { ICodeEditor, IEditorMouseEvent, IOverlayWidget, IOverlayWidgetPosition, MouseTargetType } from "../../../browser/editorBrowser.js";
import { ConfigurationChangedEvent, EditorOption } from "../../../common/config/editorOptions.js";
import { ILanguageService } from "../../../common/languages/language.js";
import { HoverOperation, HoverResult, HoverStartMode } from "./hoverOperation.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { HoverWidget } from "../../../../base/browser/ui/hover/hoverWidget.js";
import { IHoverWidget } from "./hoverTypes.js";
import { IHoverMessage, LaneOrLineNumber, GlyphHoverComputer, GlyphHoverComputerOptions } from "./glyphHoverComputer.js";
import { isMousePositionWithinElement } from "./hoverUtils.js";
const $ = dom.$;
let GlyphHoverWidget = class extends Disposable {
  static {
    __name(this, "GlyphHoverWidget");
  }
  static ID = "editor.contrib.modesGlyphHoverWidget";
  _editor;
  _hover;
  _isVisible;
  _messages;
  _markdownRenderer;
  _hoverOperation;
  _renderDisposeables = this._register(new DisposableStore());
  _hoverComputerOptions;
  constructor(editor, languageService, openerService) {
    super();
    this._editor = editor;
    this._isVisible = false;
    this._messages = [];
    this._hover = this._register(new HoverWidget(true));
    this._hover.containerDomNode.classList.toggle("hidden", !this._isVisible);
    this._markdownRenderer = new MarkdownRenderer({ editor: this._editor }, languageService, openerService);
    this._hoverOperation = this._register(new HoverOperation(this._editor, new GlyphHoverComputer(this._editor)));
    this._register(this._hoverOperation.onResult((result) => this._withResult(result)));
    this._register(this._editor.onDidChangeModelDecorations(() => this._onModelDecorationsChanged()));
    this._register(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.fontInfo)) {
        this._updateFont();
      }
    }));
    this._register(dom.addStandardDisposableListener(this._hover.containerDomNode, "mouseleave", (e) => {
      this._onMouseLeave(e);
    }));
    this._editor.addOverlayWidget(this);
  }
  dispose() {
    this._hoverComputerOptions = void 0;
    this._editor.removeOverlayWidget(this);
    super.dispose();
  }
  getId() {
    return GlyphHoverWidget.ID;
  }
  getDomNode() {
    return this._hover.containerDomNode;
  }
  getPosition() {
    return null;
  }
  _updateFont() {
    const codeClasses = Array.prototype.slice.call(this._hover.contentsDomNode.getElementsByClassName("code"));
    codeClasses.forEach((node) => this._editor.applyFontInfo(node));
  }
  _onModelDecorationsChanged() {
    if (this._isVisible && this._hoverComputerOptions) {
      this._hoverOperation.cancel();
      this._hoverOperation.start(HoverStartMode.Delayed, this._hoverComputerOptions);
    }
  }
  showsOrWillShow(mouseEvent) {
    const target = mouseEvent.target;
    if (target.type === MouseTargetType.GUTTER_GLYPH_MARGIN && target.detail.glyphMarginLane) {
      this._startShowingAt(target.position.lineNumber, target.detail.glyphMarginLane);
      return true;
    }
    if (target.type === MouseTargetType.GUTTER_LINE_NUMBERS) {
      this._startShowingAt(target.position.lineNumber, "lineNo");
      return true;
    }
    return false;
  }
  _startShowingAt(lineNumber, laneOrLine) {
    if (this._hoverComputerOptions && this._hoverComputerOptions.lineNumber === lineNumber && this._hoverComputerOptions.laneOrLine === laneOrLine) {
      return;
    }
    this._hoverOperation.cancel();
    this.hide();
    this._hoverComputerOptions = { lineNumber, laneOrLine };
    this._hoverOperation.start(HoverStartMode.Delayed, this._hoverComputerOptions);
  }
  hide() {
    this._hoverComputerOptions = void 0;
    this._hoverOperation.cancel();
    if (!this._isVisible) {
      return;
    }
    this._isVisible = false;
    this._hover.containerDomNode.classList.toggle("hidden", !this._isVisible);
  }
  _withResult(result) {
    this._messages = result.value;
    if (this._messages.length > 0) {
      this._renderMessages(result.options.lineNumber, result.options.laneOrLine, this._messages);
    } else {
      this.hide();
    }
  }
  _renderMessages(lineNumber, laneOrLine, messages) {
    this._renderDisposeables.clear();
    const fragment = document.createDocumentFragment();
    for (const msg of messages) {
      const markdownHoverElement = $("div.hover-row.markdown-hover");
      const hoverContentsElement = dom.append(markdownHoverElement, $("div.hover-contents"));
      const renderedContents = this._renderDisposeables.add(this._markdownRenderer.render(msg.value));
      hoverContentsElement.appendChild(renderedContents.element);
      fragment.appendChild(markdownHoverElement);
    }
    this._updateContents(fragment);
    this._showAt(lineNumber, laneOrLine);
  }
  _updateContents(node) {
    this._hover.contentsDomNode.textContent = "";
    this._hover.contentsDomNode.appendChild(node);
    this._updateFont();
  }
  _showAt(lineNumber, laneOrLine) {
    if (!this._isVisible) {
      this._isVisible = true;
      this._hover.containerDomNode.classList.toggle("hidden", !this._isVisible);
    }
    const editorLayout = this._editor.getLayoutInfo();
    const topForLineNumber = this._editor.getTopForLineNumber(lineNumber);
    const editorScrollTop = this._editor.getScrollTop();
    const lineHeight = this._editor.getOption(EditorOption.lineHeight);
    const nodeHeight = this._hover.containerDomNode.clientHeight;
    const top = topForLineNumber - editorScrollTop - (nodeHeight - lineHeight) / 2;
    const left = editorLayout.glyphMarginLeft + editorLayout.glyphMarginWidth + (laneOrLine === "lineNo" ? editorLayout.lineNumbersWidth : 0);
    this._hover.containerDomNode.style.left = `${left}px`;
    this._hover.containerDomNode.style.top = `${Math.max(Math.round(top), 0)}px`;
    this._hover.containerDomNode.style.zIndex = "11";
  }
  _onMouseLeave(e) {
    const editorDomNode = this._editor.getDomNode();
    const isMousePositionOutsideOfEditor = !editorDomNode || !isMousePositionWithinElement(editorDomNode, e.x, e.y);
    if (isMousePositionOutsideOfEditor) {
      this.hide();
    }
  }
};
GlyphHoverWidget = __decorateClass([
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IOpenerService)
], GlyphHoverWidget);
export {
  GlyphHoverWidget
};
//# sourceMappingURL=glyphHoverWidget.js.map
