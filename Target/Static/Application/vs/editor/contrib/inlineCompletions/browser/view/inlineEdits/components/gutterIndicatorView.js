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
import { n, trackFocus } from "../../../../../../../base/browser/dom.js";
import { renderIcon } from "../../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Codicon } from "../../../../../../../base/common/codicons.js";
import { BugIndicatingError } from "../../../../../../../base/common/errors.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../../../../base/common/lifecycle.js";
import { autorun, constObservable, debouncedObservable, derived, observableFromEvent, observableValue, runOnChange } from "../../../../../../../base/common/observable.js";
import { IAccessibilityService } from "../../../../../../../platform/accessibility/common/accessibility.js";
import { IHoverService } from "../../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { asCssVariable } from "../../../../../../../platform/theme/common/colorUtils.js";
import { IThemeService } from "../../../../../../../platform/theme/common/themeService.js";
import { Point } from "../../../../../../browser/point.js";
import { Rect } from "../../../../../../browser/rect.js";
import { OffsetRange } from "../../../../../../common/core/offsetRange.js";
import { StickyScrollController } from "../../../../../stickyScroll/browser/stickyScrollController.js";
import { InlineEditTabAction } from "../inlineEditsViewInterface.js";
import { getEditorBlendedColor, inlineEditIndicatorBackground, inlineEditIndicatorPrimaryBackground, inlineEditIndicatorPrimaryBorder, inlineEditIndicatorPrimaryForeground, inlineEditIndicatorSecondaryBackground, inlineEditIndicatorSecondaryBorder, inlineEditIndicatorSecondaryForeground, inlineEditIndicatorsuccessfulBackground, inlineEditIndicatorsuccessfulBorder, inlineEditIndicatorsuccessfulForeground } from "../theme.js";
import { mapOutFalsy, rectToProps } from "../utils/utils.js";
import { GutterIndicatorMenuContent } from "./gutterIndicatorMenu.js";
let InlineEditsGutterIndicator = class InlineEditsGutterIndicator2 extends Disposable {
  static {
    __name(this, "InlineEditsGutterIndicator");
  }
  get model() {
    const model = this._model.get();
    if (!model) {
      throw new BugIndicatingError("Inline Edit Model not available");
    }
    return model;
  }
  constructor(_editorObs, _originalRange, _verticalOffset, _model, _isHoveringOverInlineEdit, _focusIsInMenu, _hoverService, _instantiationService, _accessibilityService, themeService) {
    super();
    this._editorObs = _editorObs;
    this._originalRange = _originalRange;
    this._verticalOffset = _verticalOffset;
    this._model = _model;
    this._isHoveringOverInlineEdit = _isHoveringOverInlineEdit;
    this._focusIsInMenu = _focusIsInMenu;
    this._hoverService = _hoverService;
    this._instantiationService = _instantiationService;
    this._accessibilityService = _accessibilityService;
    this._originalRangeObs = mapOutFalsy(this._originalRange);
    this._state = derived((reader) => {
      const range = this._originalRangeObs.read(reader);
      if (!range) {
        return void 0;
      }
      return {
        range,
        lineOffsetRange: this._editorObs.observeLineOffsetRange(range, this._store)
      };
    });
    this._stickyScrollController = StickyScrollController.get(this._editorObs.editor);
    this._stickyScrollHeight = this._stickyScrollController ? observableFromEvent(this._stickyScrollController.onDidChangeStickyScrollHeight, () => this._stickyScrollController.stickyScrollWidgetHeight) : constObservable(0);
    this._lineNumberToRender = derived(this, (reader) => {
      if (this._verticalOffset.read(reader) !== 0) {
        return "";
      }
      const lineNumber = this._originalRange.read(reader)?.startLineNumber;
      const lineNumberOptions = this._editorObs.getOption(
        69
        /* EditorOption.lineNumbers */
      ).read(reader);
      if (lineNumber === void 0 || lineNumberOptions.renderType === 0) {
        return "";
      }
      if (lineNumberOptions.renderType === 3) {
        const cursorPosition = this._editorObs.cursorPosition.read(reader);
        if (lineNumber % 10 === 0 || cursorPosition && cursorPosition.lineNumber === lineNumber) {
          return lineNumber.toString();
        }
        return "";
      }
      if (lineNumberOptions.renderType === 2) {
        const cursorPosition = this._editorObs.cursorPosition.read(reader);
        if (!cursorPosition) {
          return "";
        }
        const relativeLineNumber = Math.abs(lineNumber - cursorPosition.lineNumber);
        if (relativeLineNumber === 0) {
          return lineNumber.toString();
        }
        return relativeLineNumber.toString();
      }
      if (lineNumberOptions.renderType === 4) {
        if (lineNumberOptions.renderFn) {
          return lineNumberOptions.renderFn(lineNumber);
        }
        return "";
      }
      return lineNumber.toString();
    });
    this._availableWidthForIcon = derived(this, (reader) => {
      const textModel = this._editorObs.editor.getModel();
      const editor = this._editorObs.editor;
      const layout = this._editorObs.layoutInfo.read(reader);
      const gutterWidth = layout.decorationsLeft + layout.decorationsWidth - layout.glyphMarginLeft;
      if (!textModel || gutterWidth <= 0) {
        return () => 0;
      }
      if (layout.lineNumbersLeft === 0) {
        return () => gutterWidth;
      }
      const lineNumberOptions = this._editorObs.getOption(
        69
        /* EditorOption.lineNumbers */
      ).read(reader);
      if (lineNumberOptions.renderType === 2 || /* likely to flicker */
      lineNumberOptions.renderType === 0) {
        return () => gutterWidth;
      }
      const w = editor.getOption(
        52
        /* EditorOption.fontInfo */
      ).typicalHalfwidthCharacterWidth;
      const rightOfLineNumber = layout.lineNumbersLeft + layout.lineNumbersWidth;
      const totalLines = textModel.getLineCount();
      const totalLinesDigits = (totalLines + 1).toString().length;
      const offsetDigits = [];
      for (let digits = 1; digits <= totalLinesDigits; digits++) {
        const firstLineNumberWithDigitCount = 10 ** (digits - 1);
        const topOfLineNumber = editor.getTopForLineNumber(firstLineNumberWithDigitCount);
        const digitsWidth = digits * w;
        const usableWidthLeftOfLineNumber = Math.min(gutterWidth, Math.max(0, rightOfLineNumber - digitsWidth - layout.glyphMarginLeft));
        offsetDigits.push({ firstLineNumberWithDigitCount, topOfLineNumber, usableWidthLeftOfLineNumber });
      }
      return (topOffset) => {
        for (let i = offsetDigits.length - 1; i >= 0; i--) {
          if (topOffset >= offsetDigits[i].topOfLineNumber) {
            return offsetDigits[i].usableWidthLeftOfLineNumber;
          }
        }
        throw new BugIndicatingError("Could not find avilable width for icon");
      };
    });
    this._layout = derived(this, (reader) => {
      const s = this._state.read(reader);
      if (!s) {
        return void 0;
      }
      const layout = this._editorObs.layoutInfo.read(reader);
      const lineHeight = this._editorObs.getOption(
        68
        /* EditorOption.lineHeight */
      ).read(reader);
      const gutterViewPortPadding = 1;
      const gutterWidthWithoutPadding = layout.decorationsLeft + layout.decorationsWidth - layout.glyphMarginLeft - 2 * gutterViewPortPadding;
      const gutterHeightWithoutPadding = layout.height - 2 * gutterViewPortPadding;
      const gutterViewPortWithStickyScroll = Rect.fromLeftTopWidthHeight(gutterViewPortPadding, gutterViewPortPadding, gutterWidthWithoutPadding, gutterHeightWithoutPadding);
      const gutterViewPortWithoutStickyScroll = gutterViewPortWithStickyScroll.withTop(this._stickyScrollHeight.read(reader) + gutterViewPortPadding);
      const verticalEditRange = s.lineOffsetRange.read(reader);
      const gutterEditArea = Rect.fromRanges(OffsetRange.fromTo(gutterViewPortWithoutStickyScroll.left, gutterViewPortWithoutStickyScroll.right), verticalEditRange);
      const pillHeight = lineHeight;
      const pillOffset = this._verticalOffset.read(reader);
      const pillFullyDockedRect = gutterEditArea.withHeight(pillHeight).translateY(pillOffset);
      const pillIsFullyDocked = gutterViewPortWithoutStickyScroll.containsRect(pillFullyDockedRect);
      const iconNoneDocked = this._tabAction.map((action) => action === InlineEditTabAction.Accept ? Codicon.keyboardTab : Codicon.arrowRight);
      const iconDocked = derived((reader2) => {
        if (this._isHoveredOverIconDebounced.read(reader2) || this._isHoveredOverInlineEditDebounced.read(reader2)) {
          return Codicon.check;
        }
        if (this._tabAction.read(reader2) === InlineEditTabAction.Accept) {
          return Codicon.keyboardTab;
        }
        const cursorLineNumber = this._editorObs.cursorLineNumber.read(reader2) ?? 0;
        const editStartLineNumber = s.range.read(reader2).startLineNumber;
        return cursorLineNumber <= editStartLineNumber ? Codicon.keyboardTabAbove : Codicon.keyboardTabBelow;
      });
      const idealIconWidth = 22;
      const minimalIconWidth = 16;
      const iconWidth = /* @__PURE__ */ __name((pillRect2) => {
        const availableWidth = this._availableWidthForIcon.get()(pillRect2.bottom + this._editorObs.editor.getScrollTop()) - gutterViewPortPadding;
        return Math.max(Math.min(availableWidth, idealIconWidth), minimalIconWidth);
      }, "iconWidth");
      if (pillIsFullyDocked) {
        const pillRect2 = pillFullyDockedRect;
        const lineNumberWidth = Math.max(layout.lineNumbersLeft + layout.lineNumbersWidth - gutterViewPortWithStickyScroll.left, 0);
        const lineNumberRect = pillRect2.withWidth(lineNumberWidth);
        const iconWidth2 = Math.max(Math.min(layout.decorationsWidth, idealIconWidth), minimalIconWidth);
        const iconRect2 = pillRect2.withWidth(iconWidth2).translateX(lineNumberWidth);
        return {
          gutterEditArea,
          icon: iconDocked,
          iconDirection: "right",
          iconRect: iconRect2,
          pillRect: pillRect2,
          lineNumberRect
        };
      }
      const pillPartiallyDockedPossibleArea = gutterViewPortWithStickyScroll.intersect(gutterEditArea);
      const pillIsPartiallyDocked = pillPartiallyDockedPossibleArea && pillPartiallyDockedPossibleArea.height >= pillHeight;
      if (pillIsPartiallyDocked) {
        const pillRectMoved2 = pillFullyDockedRect.moveToBeContainedIn(gutterViewPortWithoutStickyScroll).moveToBeContainedIn(pillPartiallyDockedPossibleArea);
        const pillRect2 = pillRectMoved2.withWidth(iconWidth(pillRectMoved2));
        const iconRect2 = pillRect2;
        return {
          gutterEditArea,
          icon: iconDocked,
          iconDirection: "right",
          iconRect: iconRect2,
          pillRect: pillRect2
        };
      }
      const pillRectMoved = pillFullyDockedRect.moveToBeContainedIn(gutterViewPortWithStickyScroll);
      const pillRect = pillRectMoved.withWidth(iconWidth(pillRectMoved));
      const iconRect = pillRect;
      const iconDirection = pillRect.top < pillFullyDockedRect.top ? "top" : "bottom";
      return {
        gutterEditArea,
        icon: iconNoneDocked,
        iconDirection,
        iconRect,
        pillRect
      };
    });
    this._iconRef = n.ref();
    this.isVisible = this._layout.map((l) => !!l);
    this._hoverVisible = observableValue(this, false);
    this.isHoverVisible = this._hoverVisible;
    this._isHoveredOverIcon = observableValue(this, false);
    this._isHoveredOverIconDebounced = debouncedObservable(this._isHoveredOverIcon, 100);
    this.isHoveredOverIcon = this._isHoveredOverIconDebounced;
    this._tabAction = derived(this, (reader) => {
      const model = this._model.read(reader);
      if (!model) {
        return InlineEditTabAction.Inactive;
      }
      return model.tabAction.read(reader);
    });
    this._indicator = n.div({
      class: "inline-edits-view-gutter-indicator",
      onclick: /* @__PURE__ */ __name(() => {
        const layout = this._layout.get();
        const acceptOnClick = layout?.icon.get() === Codicon.check;
        this._editorObs.editor.focus();
        if (acceptOnClick) {
          this.model.accept();
        } else {
          this.model.jump();
        }
      }, "onclick"),
      tabIndex: 0,
      style: {
        position: "absolute",
        overflow: "visible"
      }
    }, mapOutFalsy(this._layout).map((layout) => !layout ? [] : [
      n.div({
        style: {
          position: "absolute",
          background: asCssVariable(inlineEditIndicatorBackground),
          borderRadius: "4px",
          ...rectToProps((reader) => layout.read(reader).gutterEditArea)
        }
      }),
      n.div({
        class: "icon",
        ref: this._iconRef,
        onmouseenter: /* @__PURE__ */ __name(() => {
          this._showHover();
        }, "onmouseenter"),
        style: {
          cursor: "pointer",
          zIndex: "20",
          position: "absolute",
          backgroundColor: this._gutterIndicatorStyles.map((v) => v.background),
          ["--vscodeIconForeground"]: this._gutterIndicatorStyles.map((v) => v.foreground),
          border: this._gutterIndicatorStyles.map((v) => `1px solid ${v.border}`),
          boxSizing: "border-box",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "flex-end",
          transition: "background-color 0.2s ease-in-out, width 0.2s ease-in-out",
          ...rectToProps((reader) => layout.read(reader).pillRect)
        }
      }, [
        n.div({
          className: "line-number",
          style: {
            lineHeight: layout.map((l) => l.lineNumberRect ? l.lineNumberRect.height : 0),
            display: layout.map((l) => l.lineNumberRect ? "flex" : "none"),
            alignItems: "center",
            justifyContent: "flex-end",
            width: layout.map((l) => l.lineNumberRect ? l.lineNumberRect.width : 0),
            height: "100%",
            color: this._gutterIndicatorStyles.map((v) => v.foreground)
          }
        }, this._lineNumberToRender),
        n.div({
          style: {
            rotate: layout.map((l) => `${getRotationFromDirection(l.iconDirection)}deg`),
            transition: "rotate 0.2s ease-in-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            marginRight: layout.map((l) => l.pillRect.width - l.iconRect.width - (l.lineNumberRect?.width ?? 0)),
            width: layout.map((l) => l.iconRect.width)
          }
        }, [
          layout.map((l, reader) => renderIcon(l.icon.read(reader)))
        ])
      ])
    ])).keepUpdated(this._store);
    this._gutterIndicatorStyles = this._tabAction.map((v, reader) => {
      switch (v) {
        case InlineEditTabAction.Inactive:
          return {
            background: getEditorBlendedColor(inlineEditIndicatorSecondaryBackground, themeService).read(reader).toString(),
            foreground: getEditorBlendedColor(inlineEditIndicatorSecondaryForeground, themeService).read(reader).toString(),
            border: getEditorBlendedColor(inlineEditIndicatorSecondaryBorder, themeService).read(reader).toString()
          };
        case InlineEditTabAction.Jump:
          return {
            background: getEditorBlendedColor(inlineEditIndicatorPrimaryBackground, themeService).read(reader).toString(),
            foreground: getEditorBlendedColor(inlineEditIndicatorPrimaryForeground, themeService).read(reader).toString(),
            border: getEditorBlendedColor(inlineEditIndicatorPrimaryBorder, themeService).read(reader).toString()
          };
        case InlineEditTabAction.Accept:
          return {
            background: getEditorBlendedColor(inlineEditIndicatorsuccessfulBackground, themeService).read(reader).toString(),
            foreground: getEditorBlendedColor(inlineEditIndicatorsuccessfulForeground, themeService).read(reader).toString(),
            border: getEditorBlendedColor(inlineEditIndicatorsuccessfulBorder, themeService).read(reader).toString()
          };
      }
    });
    this._register(this._editorObs.createOverlayWidget({
      domNode: this._indicator.element,
      position: constObservable(null),
      allowEditorOverflow: false,
      minContentWidthInPx: constObservable(0)
    }));
    this._register(this._editorObs.editor.onMouseMove((e) => {
      const state = this._state.get();
      if (state === void 0) {
        return;
      }
      const el = this._iconRef.element;
      const rect = el.getBoundingClientRect();
      const rectangularArea = Rect.fromLeftTopWidthHeight(rect.left, rect.top, rect.width, rect.height);
      const point = new Point(e.event.posx, e.event.posy);
      this._isHoveredOverIcon.set(rectangularArea.containsPoint(point), void 0);
    }));
    this._register(this._editorObs.editor.onDidScrollChange(() => {
      this._isHoveredOverIcon.set(false, void 0);
    }));
    this._isHoveredOverInlineEditDebounced = debouncedObservable(this._isHoveringOverInlineEdit, 100);
    this._register(runOnChange(this._isHoveredOverInlineEditDebounced, (isHovering) => {
      if (isHovering) {
        this.triggerAnimation();
      }
    }));
    this._register(autorun((reader) => {
      this._indicator.readEffect(reader);
      if (this._indicator.element) {
        this._editorObs.editor.applyFontInfo(this._indicator.element);
      }
    }));
  }
  triggerAnimation() {
    if (this._accessibilityService.isMotionReduced()) {
      return new Animation(null, null).finished;
    }
    const animation = this._iconRef.element.animate([
      {
        outline: `2px solid ${this._gutterIndicatorStyles.map((v) => v.border).get()}`,
        outlineOffset: "-1px",
        offset: 0
      },
      {
        outline: `2px solid transparent`,
        outlineOffset: "10px",
        offset: 1
      }
    ], { duration: 500 });
    return animation.finished;
  }
  _showHover() {
    if (this._hoverVisible.get()) {
      return;
    }
    const disposableStore = new DisposableStore();
    const content = disposableStore.add(this._instantiationService.createInstance(GutterIndicatorMenuContent, this.model, (focusEditor) => {
      if (focusEditor) {
        this._editorObs.editor.focus();
      }
      h?.dispose();
    }, this._editorObs).toDisposableLiveElement());
    const focusTracker = disposableStore.add(trackFocus(content.element));
    disposableStore.add(focusTracker.onDidBlur(() => this._focusIsInMenu.set(false, void 0)));
    disposableStore.add(focusTracker.onDidFocus(() => this._focusIsInMenu.set(true, void 0)));
    disposableStore.add(toDisposable(() => this._focusIsInMenu.set(false, void 0)));
    const h = this._hoverService.showInstantHover({
      target: this._iconRef.element,
      content: content.element
    });
    if (h) {
      this._hoverVisible.set(true, void 0);
      disposableStore.add(this._editorObs.editor.onDidScrollChange(() => h.dispose()));
      disposableStore.add(h.onDispose(() => {
        this._hoverVisible.set(false, void 0);
        disposableStore.dispose();
      }));
    } else {
      disposableStore.dispose();
    }
  }
};
InlineEditsGutterIndicator = __decorate([
  __param(6, IHoverService),
  __param(7, IInstantiationService),
  __param(8, IAccessibilityService),
  __param(9, IThemeService)
], InlineEditsGutterIndicator);
function getRotationFromDirection(direction) {
  switch (direction) {
    case "top":
      return 90;
    case "bottom":
      return -90;
    case "right":
      return 0;
  }
}
__name(getRotationFromDirection, "getRotationFromDirection");
export {
  InlineEditsGutterIndicator
};
//# sourceMappingURL=gutterIndicatorView.js.map
