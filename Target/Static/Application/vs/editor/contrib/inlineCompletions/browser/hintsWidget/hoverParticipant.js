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
import * as dom from "../../../../../base/browser/dom.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { autorun, autorunWithStore, constObservable } from "../../../../../base/common/observable.js";
import { Range } from "../../../../common/core/range.js";
import { HoverForeignElementAnchor, RenderedHoverParts } from "../../../hover/browser/hoverTypes.js";
import { InlineCompletionsController } from "../controller/inlineCompletionsController.js";
import { InlineSuggestionHintsContentWidget } from "./inlineCompletionsHintsWidget.js";
import { IMarkdownRendererService } from "../../../../../platform/markdown/browser/markdownRenderer.js";
import * as nls from "../../../../../nls.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { GhostTextView } from "../view/ghostText/ghostTextView.js";
class InlineCompletionsHover {
  static {
    __name(this, "InlineCompletionsHover");
  }
  constructor(owner, range, controller) {
    this.owner = owner;
    this.range = range;
    this.controller = controller;
  }
  isValidForHoverAnchor(anchor) {
    return anchor.type === 1 && this.range.startColumn <= anchor.range.startColumn && this.range.endColumn >= anchor.range.endColumn;
  }
}
let InlineCompletionsHoverParticipant = class InlineCompletionsHoverParticipant2 {
  static {
    __name(this, "InlineCompletionsHoverParticipant");
  }
  constructor(_editor, accessibilityService, _instantiationService, _telemetryService, _markdownRendererService) {
    this._editor = _editor;
    this.accessibilityService = accessibilityService;
    this._instantiationService = _instantiationService;
    this._telemetryService = _telemetryService;
    this._markdownRendererService = _markdownRendererService;
    this.hoverOrdinal = 4;
  }
  suggestHoverAnchor(mouseEvent) {
    const controller = InlineCompletionsController.get(this._editor);
    if (!controller) {
      return null;
    }
    const target = mouseEvent.target;
    if (target.type === 8) {
      const viewZoneData = target.detail;
      if (controller.shouldShowHoverAtViewZone(viewZoneData.viewZoneId)) {
        return new HoverForeignElementAnchor(1e3, this, Range.fromPositions(this._editor.getModel().validatePosition(viewZoneData.positionBefore || viewZoneData.position)), mouseEvent.event.posx, mouseEvent.event.posy, false);
      }
    }
    if (target.type === 7) {
      if (controller.shouldShowHoverAt(target.range)) {
        return new HoverForeignElementAnchor(1e3, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
      }
    }
    if (target.type === 6) {
      const mightBeForeignElement = target.detail.mightBeForeignElement;
      if (mightBeForeignElement && controller.shouldShowHoverAt(target.range)) {
        return new HoverForeignElementAnchor(1e3, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
      }
    }
    if (target.type === 9 && target.element) {
      const ctx = GhostTextView.getWarningWidgetContext(target.element);
      if (ctx && controller.shouldShowHoverAt(ctx.range)) {
        return new HoverForeignElementAnchor(1e3, this, ctx.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
      }
    }
    return null;
  }
  computeSync(anchor, lineDecorations) {
    if (this._editor.getOption(
      71
      /* EditorOption.inlineSuggest */
    ).showToolbar !== "onHover") {
      return [];
    }
    const controller = InlineCompletionsController.get(this._editor);
    if (controller && controller.shouldShowHoverAt(anchor.range)) {
      return [new InlineCompletionsHover(this, anchor.range, controller)];
    }
    return [];
  }
  renderHoverParts(context, hoverParts) {
    const disposables = new DisposableStore();
    const part = hoverParts[0];
    this._telemetryService.publicLog2("inlineCompletionHover.shown");
    if (this.accessibilityService.isScreenReaderOptimized() && !this._editor.getOption(
      12
      /* EditorOption.screenReaderAnnounceInlineSuggestion */
    )) {
      disposables.add(this.renderScreenReaderText(context, part));
    }
    const model = part.controller.model.get();
    const widgetNode = document.createElement("div");
    context.fragment.appendChild(widgetNode);
    disposables.add(autorunWithStore((reader, store) => {
      const w = store.add(this._instantiationService.createInstance(InlineSuggestionHintsContentWidget.hot.read(reader), this._editor, false, constObservable(null), model.selectedInlineCompletionIndex, model.inlineCompletionsCount, model.activeCommands, model.warning, () => {
        context.onContentsChanged();
      }));
      widgetNode.replaceChildren(w.getDomNode());
    }));
    model.triggerExplicitly();
    const renderedHoverPart = {
      hoverPart: part,
      hoverElement: widgetNode,
      dispose() {
        disposables.dispose();
      }
    };
    return new RenderedHoverParts([renderedHoverPart]);
  }
  getAccessibleContent(hoverPart) {
    return nls.localize("hoverAccessibilityStatusBar", "There are inline completions here");
  }
  renderScreenReaderText(context, part) {
    const disposables = new DisposableStore();
    const $ = dom.$;
    const markdownHoverElement = $("div.hover-row.markdown-hover");
    const hoverContentsElement = dom.append(markdownHoverElement, $("div.hover-contents", { ["aria-live"]: "assertive" }));
    const render = /* @__PURE__ */ __name((code) => {
      const inlineSuggestionAvailable = nls.localize("inlineSuggestionFollows", "Suggestion:");
      const renderedContents = disposables.add(this._markdownRendererService.render(new MarkdownString().appendText(inlineSuggestionAvailable).appendCodeblock("text", code), {
        context: this._editor,
        asyncRenderCallback: /* @__PURE__ */ __name(() => {
          hoverContentsElement.className = "hover-contents code-hover-contents";
          context.onContentsChanged();
        }, "asyncRenderCallback")
      }));
      hoverContentsElement.replaceChildren(renderedContents.element);
    }, "render");
    disposables.add(autorun((reader) => {
      const ghostText = part.controller.model.read(reader)?.primaryGhostText.read(reader);
      if (ghostText) {
        const lineText = this._editor.getModel().getLineContent(ghostText.lineNumber);
        render(ghostText.renderForScreenReader(lineText));
      } else {
        dom.reset(hoverContentsElement);
      }
    }));
    context.fragment.appendChild(markdownHoverElement);
    return disposables;
  }
};
InlineCompletionsHoverParticipant = __decorate([
  __param(1, IAccessibilityService),
  __param(2, IInstantiationService),
  __param(3, ITelemetryService),
  __param(4, IMarkdownRendererService)
], InlineCompletionsHoverParticipant);
export {
  InlineCompletionsHover,
  InlineCompletionsHoverParticipant
};
//# sourceMappingURL=hoverParticipant.js.map
