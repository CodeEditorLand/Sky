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
import { AsyncIterableObject } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IMarkdownString, isEmptyMarkdownString, MarkdownString } from "../../../../base/common/htmlContent.js";
import { ICodeEditor, IEditorMouseEvent, MouseTargetType } from "../../../browser/editorBrowser.js";
import { Position } from "../../../common/core/position.js";
import { IModelDecoration } from "../../../common/model.js";
import { ModelDecorationInjectedTextOptions } from "../../../common/model/textModel.js";
import { HoverAnchor, HoverForeignElementAnchor, IEditorHoverParticipant } from "../../hover/browser/hoverTypes.js";
import { ILanguageService } from "../../../common/languages/language.js";
import { ITextModelService } from "../../../common/services/resolverService.js";
import { getHoverProviderResultsAsAsyncIterable } from "../../hover/browser/getHover.js";
import { MarkdownHover, MarkdownHoverParticipant } from "../../hover/browser/markdownHoverParticipant.js";
import { RenderedInlayHintLabelPart, InlayHintsController } from "./inlayHintsController.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { localize } from "../../../../nls.js";
import * as platform from "../../../../base/common/platform.js";
import { asCommandLink } from "./inlayHints.js";
import { isNonEmptyArray } from "../../../../base/common/arrays.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { HoverStartSource } from "../../hover/browser/hoverOperation.js";
class InlayHintsHoverAnchor extends HoverForeignElementAnchor {
  constructor(part, owner, initialMousePosX, initialMousePosY) {
    super(10, owner, part.item.anchor.range, initialMousePosX, initialMousePosY, true);
    this.part = part;
  }
  static {
    __name(this, "InlayHintsHoverAnchor");
  }
}
let InlayHintsHover = class extends MarkdownHoverParticipant {
  constructor(editor, languageService, openerService, keybindingService, hoverService, configurationService, _resolverService, languageFeaturesService, commandService) {
    super(editor, languageService, openerService, configurationService, languageFeaturesService, keybindingService, hoverService, commandService);
    this._resolverService = _resolverService;
  }
  static {
    __name(this, "InlayHintsHover");
  }
  hoverOrdinal = 6;
  suggestHoverAnchor(mouseEvent) {
    const controller = InlayHintsController.get(this._editor);
    if (!controller) {
      return null;
    }
    if (mouseEvent.target.type !== MouseTargetType.CONTENT_TEXT) {
      return null;
    }
    const options = mouseEvent.target.detail.injectedText?.options;
    if (!(options instanceof ModelDecorationInjectedTextOptions && options.attachedData instanceof RenderedInlayHintLabelPart)) {
      return null;
    }
    return new InlayHintsHoverAnchor(options.attachedData, this, mouseEvent.event.posx, mouseEvent.event.posy);
  }
  computeSync() {
    return [];
  }
  computeAsync(anchor, _lineDecorations, source, token) {
    if (!(anchor instanceof InlayHintsHoverAnchor)) {
      return AsyncIterableObject.EMPTY;
    }
    return new AsyncIterableObject(async (executor) => {
      const { part } = anchor;
      await part.item.resolve(token);
      if (token.isCancellationRequested) {
        return;
      }
      let itemTooltip;
      if (typeof part.item.hint.tooltip === "string") {
        itemTooltip = new MarkdownString().appendText(part.item.hint.tooltip);
      } else if (part.item.hint.tooltip) {
        itemTooltip = part.item.hint.tooltip;
      }
      if (itemTooltip) {
        executor.emitOne(new MarkdownHover(this, anchor.range, [itemTooltip], false, 0));
      }
      if (isNonEmptyArray(part.item.hint.textEdits)) {
        executor.emitOne(new MarkdownHover(this, anchor.range, [new MarkdownString().appendText(localize("hint.dbl", "Double-click to insert"))], false, 10001));
      }
      let partTooltip;
      if (typeof part.part.tooltip === "string") {
        partTooltip = new MarkdownString().appendText(part.part.tooltip);
      } else if (part.part.tooltip) {
        partTooltip = part.part.tooltip;
      }
      if (partTooltip) {
        executor.emitOne(new MarkdownHover(this, anchor.range, [partTooltip], false, 1));
      }
      if (part.part.location || part.part.command) {
        let linkHint;
        const useMetaKey = this._editor.getOption(EditorOption.multiCursorModifier) === "altKey";
        const kb = useMetaKey ? platform.isMacintosh ? localize("links.navigate.kb.meta.mac", "cmd + click") : localize("links.navigate.kb.meta", "ctrl + click") : platform.isMacintosh ? localize("links.navigate.kb.alt.mac", "option + click") : localize("links.navigate.kb.alt", "alt + click");
        if (part.part.location && part.part.command) {
          linkHint = new MarkdownString().appendText(localize("hint.defAndCommand", "Go to Definition ({0}), right click for more", kb));
        } else if (part.part.location) {
          linkHint = new MarkdownString().appendText(localize("hint.def", "Go to Definition ({0})", kb));
        } else if (part.part.command) {
          linkHint = new MarkdownString(`[${localize("hint.cmd", "Execute Command")}](${asCommandLink(part.part.command)} "${part.part.command.title}") (${kb})`, { isTrusted: true });
        }
        if (linkHint) {
          executor.emitOne(new MarkdownHover(this, anchor.range, [linkHint], false, 1e4));
        }
      }
      const iterable = await this._resolveInlayHintLabelPartHover(part, token);
      for await (const item of iterable) {
        executor.emitOne(item);
      }
    });
  }
  async _resolveInlayHintLabelPartHover(part, token) {
    if (!part.part.location) {
      return AsyncIterableObject.EMPTY;
    }
    const { uri, range } = part.part.location;
    const ref = await this._resolverService.createModelReference(uri);
    try {
      const model = ref.object.textEditorModel;
      if (!this._languageFeaturesService.hoverProvider.has(model)) {
        return AsyncIterableObject.EMPTY;
      }
      return getHoverProviderResultsAsAsyncIterable(this._languageFeaturesService.hoverProvider, model, new Position(range.startLineNumber, range.startColumn), token).filter((item) => !isEmptyMarkdownString(item.hover.contents)).map((item) => new MarkdownHover(this, part.item.anchor.range, item.hover.contents, false, 2 + item.ordinal));
    } finally {
      ref.dispose();
    }
  }
};
InlayHintsHover = __decorateClass([
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IOpenerService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITextModelService),
  __decorateParam(7, ILanguageFeaturesService),
  __decorateParam(8, ICommandService)
], InlayHintsHover);
export {
  InlayHintsHover
};
//# sourceMappingURL=inlayHintsHover.js.map
