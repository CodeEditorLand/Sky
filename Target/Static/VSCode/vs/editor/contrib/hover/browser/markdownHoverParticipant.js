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
import { asArray, compareBy, numberComparator } from "../../../../base/common/arrays.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { IMarkdownString, isEmptyMarkdownString, MarkdownString } from "../../../../base/common/htmlContent.js";
import { DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { MarkdownRenderer } from "../../../browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { DECREASE_HOVER_VERBOSITY_ACTION_ID, INCREASE_HOVER_VERBOSITY_ACTION_ID } from "./hoverActionIds.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { IModelDecoration, ITextModel } from "../../../common/model.js";
import { ILanguageService } from "../../../common/languages/language.js";
import { HoverAnchor, HoverAnchorType, HoverRangeAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverPart, IRenderedHoverParts, RenderedHoverParts } from "./hoverTypes.js";
import * as nls from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { Hover, HoverContext, HoverProvider, HoverVerbosityAction } from "../../../common/languages.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ClickAction, HoverPosition, KeyDownAction } from "../../../../base/browser/ui/hover/hoverWidget.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { IHoverService, WorkbenchHoverDelegate } from "../../../../platform/hover/browser/hover.js";
import { AsyncIterableObject } from "../../../../base/common/async.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { getHoverProviderResultsAsAsyncIterable } from "./getHover.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { HoverStartSource } from "./hoverOperation.js";
import { ScrollEvent } from "../../../../base/common/scrollable.js";
const $ = dom.$;
const increaseHoverVerbosityIcon = registerIcon("hover-increase-verbosity", Codicon.add, nls.localize("increaseHoverVerbosity", "Icon for increaseing hover verbosity."));
const decreaseHoverVerbosityIcon = registerIcon("hover-decrease-verbosity", Codicon.remove, nls.localize("decreaseHoverVerbosity", "Icon for decreasing hover verbosity."));
class MarkdownHover {
  constructor(owner, range, contents, isBeforeContent, ordinal, source = void 0) {
    this.owner = owner;
    this.range = range;
    this.contents = contents;
    this.isBeforeContent = isBeforeContent;
    this.ordinal = ordinal;
    this.source = source;
  }
  static {
    __name(this, "MarkdownHover");
  }
  isValidForHoverAnchor(anchor) {
    return anchor.type === HoverAnchorType.Range && this.range.startColumn <= anchor.range.startColumn && this.range.endColumn >= anchor.range.endColumn;
  }
}
class HoverSource {
  constructor(hover, hoverProvider, hoverPosition) {
    this.hover = hover;
    this.hoverProvider = hoverProvider;
    this.hoverPosition = hoverPosition;
  }
  static {
    __name(this, "HoverSource");
  }
  supportsVerbosityAction(hoverVerbosityAction) {
    switch (hoverVerbosityAction) {
      case HoverVerbosityAction.Increase:
        return this.hover.canIncreaseVerbosity ?? false;
      case HoverVerbosityAction.Decrease:
        return this.hover.canDecreaseVerbosity ?? false;
    }
  }
}
let MarkdownHoverParticipant = class {
  constructor(_editor, _languageService, _openerService, _configurationService, _languageFeaturesService, _keybindingService, _hoverService, _commandService) {
    this._editor = _editor;
    this._languageService = _languageService;
    this._openerService = _openerService;
    this._configurationService = _configurationService;
    this._languageFeaturesService = _languageFeaturesService;
    this._keybindingService = _keybindingService;
    this._hoverService = _hoverService;
    this._commandService = _commandService;
  }
  static {
    __name(this, "MarkdownHoverParticipant");
  }
  hoverOrdinal = 3;
  _renderedHoverParts;
  createLoadingMessage(anchor) {
    return new MarkdownHover(this, anchor.range, [new MarkdownString().appendText(nls.localize("modesContentHover.loading", "Loading..."))], false, 2e3);
  }
  computeSync(anchor, lineDecorations) {
    if (!this._editor.hasModel() || anchor.type !== HoverAnchorType.Range) {
      return [];
    }
    const model = this._editor.getModel();
    const lineNumber = anchor.range.startLineNumber;
    const maxColumn = model.getLineMaxColumn(lineNumber);
    const result = [];
    let index = 1e3;
    const lineLength = model.getLineLength(lineNumber);
    const languageId = model.getLanguageIdAtPosition(anchor.range.startLineNumber, anchor.range.startColumn);
    const stopRenderingLineAfter = this._editor.getOption(EditorOption.stopRenderingLineAfter);
    const maxTokenizationLineLength = this._configurationService.getValue("editor.maxTokenizationLineLength", {
      overrideIdentifier: languageId
    });
    let stopRenderingMessage = false;
    if (stopRenderingLineAfter >= 0 && lineLength > stopRenderingLineAfter && anchor.range.startColumn >= stopRenderingLineAfter) {
      stopRenderingMessage = true;
      result.push(new MarkdownHover(this, anchor.range, [{
        value: nls.localize("stopped rendering", "Rendering paused for long line for performance reasons. This can be configured via `editor.stopRenderingLineAfter`.")
      }], false, index++));
    }
    if (!stopRenderingMessage && typeof maxTokenizationLineLength === "number" && lineLength >= maxTokenizationLineLength) {
      result.push(new MarkdownHover(this, anchor.range, [{
        value: nls.localize("too many characters", "Tokenization is skipped for long lines for performance reasons. This can be configured via `editor.maxTokenizationLineLength`.")
      }], false, index++));
    }
    let isBeforeContent = false;
    for (const d of lineDecorations) {
      const startColumn = d.range.startLineNumber === lineNumber ? d.range.startColumn : 1;
      const endColumn = d.range.endLineNumber === lineNumber ? d.range.endColumn : maxColumn;
      const hoverMessage = d.options.hoverMessage;
      if (!hoverMessage || isEmptyMarkdownString(hoverMessage)) {
        continue;
      }
      if (d.options.beforeContentClassName) {
        isBeforeContent = true;
      }
      const range = new Range(anchor.range.startLineNumber, startColumn, anchor.range.startLineNumber, endColumn);
      result.push(new MarkdownHover(this, range, asArray(hoverMessage), isBeforeContent, index++));
    }
    return result;
  }
  computeAsync(anchor, lineDecorations, source, token) {
    if (!this._editor.hasModel() || anchor.type !== HoverAnchorType.Range) {
      return AsyncIterableObject.EMPTY;
    }
    const model = this._editor.getModel();
    const hoverProviderRegistry = this._languageFeaturesService.hoverProvider;
    if (!hoverProviderRegistry.has(model)) {
      return AsyncIterableObject.EMPTY;
    }
    const markdownHovers = this._getMarkdownHovers(hoverProviderRegistry, model, anchor, token);
    return markdownHovers;
  }
  _getMarkdownHovers(hoverProviderRegistry, model, anchor, token) {
    const position = anchor.range.getStartPosition();
    const hoverProviderResults = getHoverProviderResultsAsAsyncIterable(hoverProviderRegistry, model, position, token);
    const markdownHovers = hoverProviderResults.filter((item) => !isEmptyMarkdownString(item.hover.contents)).map((item) => {
      const range = item.hover.range ? Range.lift(item.hover.range) : anchor.range;
      const hoverSource = new HoverSource(item.hover, item.provider, position);
      return new MarkdownHover(this, range, item.hover.contents, false, item.ordinal, hoverSource);
    });
    return markdownHovers;
  }
  renderHoverParts(context, hoverParts) {
    this._renderedHoverParts = new MarkdownRenderedHoverParts(
      hoverParts,
      context.fragment,
      this,
      this._editor,
      this._languageService,
      this._openerService,
      this._commandService,
      this._keybindingService,
      this._hoverService,
      this._configurationService,
      context.onContentsChanged
    );
    return this._renderedHoverParts;
  }
  handleScroll(e) {
    this._renderedHoverParts?.handleScroll(e);
  }
  getAccessibleContent(hoverPart) {
    return this._renderedHoverParts?.getAccessibleContent(hoverPart) ?? "";
  }
  doesMarkdownHoverAtIndexSupportVerbosityAction(index, action) {
    return this._renderedHoverParts?.doesMarkdownHoverAtIndexSupportVerbosityAction(index, action) ?? false;
  }
  updateMarkdownHoverVerbosityLevel(action, index) {
    return Promise.resolve(this._renderedHoverParts?.updateMarkdownHoverPartVerbosityLevel(action, index));
  }
};
MarkdownHoverParticipant = __decorateClass([
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IOpenerService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILanguageFeaturesService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, ICommandService)
], MarkdownHoverParticipant);
class RenderedMarkdownHoverPart {
  constructor(hoverPart, hoverElement, disposables, actionsContainer) {
    this.hoverPart = hoverPart;
    this.hoverElement = hoverElement;
    this.disposables = disposables;
    this.actionsContainer = actionsContainer;
  }
  static {
    __name(this, "RenderedMarkdownHoverPart");
  }
  get hoverAccessibleContent() {
    return this.hoverElement.innerText.trim();
  }
  dispose() {
    this.disposables.dispose();
  }
}
class MarkdownRenderedHoverParts {
  constructor(hoverParts, hoverPartsContainer, _hoverParticipant, _editor, _languageService, _openerService, _commandService, _keybindingService, _hoverService, _configurationService, _onFinishedRendering) {
    this._hoverParticipant = _hoverParticipant;
    this._editor = _editor;
    this._languageService = _languageService;
    this._openerService = _openerService;
    this._commandService = _commandService;
    this._keybindingService = _keybindingService;
    this._hoverService = _hoverService;
    this._configurationService = _configurationService;
    this._onFinishedRendering = _onFinishedRendering;
    this.renderedHoverParts = this._renderHoverParts(hoverParts, hoverPartsContainer, this._onFinishedRendering);
    this._disposables.add(toDisposable(() => {
      this.renderedHoverParts.forEach((renderedHoverPart) => {
        renderedHoverPart.dispose();
      });
      this._ongoingHoverOperations.forEach((operation) => {
        operation.tokenSource.dispose(true);
      });
    }));
  }
  static {
    __name(this, "MarkdownRenderedHoverParts");
  }
  renderedHoverParts;
  _ongoingHoverOperations = /* @__PURE__ */ new Map();
  _disposables = new DisposableStore();
  _renderHoverParts(hoverParts, hoverPartsContainer, onFinishedRendering) {
    hoverParts.sort(compareBy((hover) => hover.ordinal, numberComparator));
    return hoverParts.map((hoverPart) => {
      const renderedHoverPart = this._renderHoverPart(hoverPart, onFinishedRendering);
      hoverPartsContainer.appendChild(renderedHoverPart.hoverElement);
      return renderedHoverPart;
    });
  }
  _renderHoverPart(hoverPart, onFinishedRendering) {
    const renderedMarkdownPart = this._renderMarkdownHover(hoverPart, onFinishedRendering);
    const renderedMarkdownElement = renderedMarkdownPart.hoverElement;
    const hoverSource = hoverPart.source;
    const disposables = new DisposableStore();
    disposables.add(renderedMarkdownPart);
    if (!hoverSource) {
      return new RenderedMarkdownHoverPart(hoverPart, renderedMarkdownElement, disposables);
    }
    const canIncreaseVerbosity = hoverSource.supportsVerbosityAction(HoverVerbosityAction.Increase);
    const canDecreaseVerbosity = hoverSource.supportsVerbosityAction(HoverVerbosityAction.Decrease);
    if (!canIncreaseVerbosity && !canDecreaseVerbosity) {
      return new RenderedMarkdownHoverPart(hoverPart, renderedMarkdownElement, disposables);
    }
    const actionsContainer = $("div.verbosity-actions");
    renderedMarkdownElement.prepend(actionsContainer);
    const actionsContainerInner = $("div.verbosity-actions-inner");
    actionsContainer.append(actionsContainerInner);
    disposables.add(this._renderHoverExpansionAction(actionsContainerInner, HoverVerbosityAction.Increase, canIncreaseVerbosity));
    disposables.add(this._renderHoverExpansionAction(actionsContainerInner, HoverVerbosityAction.Decrease, canDecreaseVerbosity));
    return new RenderedMarkdownHoverPart(hoverPart, renderedMarkdownElement, disposables, actionsContainerInner);
  }
  _renderMarkdownHover(markdownHover, onFinishedRendering) {
    const renderedMarkdownHover = renderMarkdownInContainer(
      this._editor,
      markdownHover,
      this._languageService,
      this._openerService,
      onFinishedRendering
    );
    return renderedMarkdownHover;
  }
  _renderHoverExpansionAction(container, action, actionEnabled) {
    const store = new DisposableStore();
    const isActionIncrease = action === HoverVerbosityAction.Increase;
    const actionElement = dom.append(container, $(ThemeIcon.asCSSSelector(isActionIncrease ? increaseHoverVerbosityIcon : decreaseHoverVerbosityIcon)));
    actionElement.tabIndex = 0;
    const hoverDelegate = new WorkbenchHoverDelegate("mouse", void 0, { target: container, position: { hoverPosition: HoverPosition.LEFT } }, this._configurationService, this._hoverService);
    store.add(this._hoverService.setupManagedHover(hoverDelegate, actionElement, labelForHoverVerbosityAction(this._keybindingService, action)));
    if (!actionEnabled) {
      actionElement.classList.add("disabled");
      return store;
    }
    actionElement.classList.add("enabled");
    const actionFunction = /* @__PURE__ */ __name(() => this._commandService.executeCommand(action === HoverVerbosityAction.Increase ? INCREASE_HOVER_VERBOSITY_ACTION_ID : DECREASE_HOVER_VERBOSITY_ACTION_ID, { focus: true }), "actionFunction");
    store.add(new ClickAction(actionElement, actionFunction));
    store.add(new KeyDownAction(actionElement, actionFunction, [KeyCode.Enter, KeyCode.Space]));
    return store;
  }
  handleScroll(e) {
    this.renderedHoverParts.forEach((renderedHoverPart) => {
      const actionsContainerInner = renderedHoverPart.actionsContainer;
      if (!actionsContainerInner) {
        return;
      }
      const hoverElement = renderedHoverPart.hoverElement;
      const topOfHoverScrollPosition = e.scrollTop;
      const bottomOfHoverScrollPosition = topOfHoverScrollPosition + e.height;
      const topOfRenderedPart = hoverElement.offsetTop;
      const hoverElementHeight = hoverElement.clientHeight;
      const bottomOfRenderedPart = topOfRenderedPart + hoverElementHeight;
      const iconsHeight = 22;
      let top;
      if (bottomOfRenderedPart <= bottomOfHoverScrollPosition || topOfRenderedPart >= bottomOfHoverScrollPosition) {
        top = hoverElementHeight - iconsHeight;
      } else {
        top = bottomOfHoverScrollPosition - topOfRenderedPart - iconsHeight;
      }
      actionsContainerInner.style.top = `${top}px`;
    });
  }
  async updateMarkdownHoverPartVerbosityLevel(action, index) {
    const model = this._editor.getModel();
    if (!model) {
      return void 0;
    }
    const hoverRenderedPart = this._getRenderedHoverPartAtIndex(index);
    const hoverSource = hoverRenderedPart?.hoverPart.source;
    if (!hoverRenderedPart || !hoverSource?.supportsVerbosityAction(action)) {
      return void 0;
    }
    const newHover = await this._fetchHover(hoverSource, model, action);
    if (!newHover) {
      return void 0;
    }
    const newHoverSource = new HoverSource(newHover, hoverSource.hoverProvider, hoverSource.hoverPosition);
    const initialHoverPart = hoverRenderedPart.hoverPart;
    const newHoverPart = new MarkdownHover(
      this._hoverParticipant,
      initialHoverPart.range,
      newHover.contents,
      initialHoverPart.isBeforeContent,
      initialHoverPart.ordinal,
      newHoverSource
    );
    const newHoverRenderedPart = this._updateRenderedHoverPart(index, newHoverPart);
    if (!newHoverRenderedPart) {
      return void 0;
    }
    return {
      hoverPart: newHoverPart,
      hoverElement: newHoverRenderedPart.hoverElement
    };
  }
  getAccessibleContent(hoverPart) {
    const renderedHoverPartIndex = this.renderedHoverParts.findIndex((renderedHoverPart2) => renderedHoverPart2.hoverPart === hoverPart);
    if (renderedHoverPartIndex === -1) {
      return void 0;
    }
    const renderedHoverPart = this._getRenderedHoverPartAtIndex(renderedHoverPartIndex);
    if (!renderedHoverPart) {
      return void 0;
    }
    const hoverElementInnerText = renderedHoverPart.hoverElement.innerText;
    const accessibleContent = hoverElementInnerText.replace(/[^\S\n\r]+/gu, " ");
    return accessibleContent;
  }
  doesMarkdownHoverAtIndexSupportVerbosityAction(index, action) {
    const hoverRenderedPart = this._getRenderedHoverPartAtIndex(index);
    const hoverSource = hoverRenderedPart?.hoverPart.source;
    if (!hoverRenderedPart || !hoverSource?.supportsVerbosityAction(action)) {
      return false;
    }
    return true;
  }
  async _fetchHover(hoverSource, model, action) {
    let verbosityDelta = action === HoverVerbosityAction.Increase ? 1 : -1;
    const provider = hoverSource.hoverProvider;
    const ongoingHoverOperation = this._ongoingHoverOperations.get(provider);
    if (ongoingHoverOperation) {
      ongoingHoverOperation.tokenSource.cancel();
      verbosityDelta += ongoingHoverOperation.verbosityDelta;
    }
    const tokenSource = new CancellationTokenSource();
    this._ongoingHoverOperations.set(provider, { verbosityDelta, tokenSource });
    const context = { verbosityRequest: { verbosityDelta, previousHover: hoverSource.hover } };
    let hover;
    try {
      hover = await Promise.resolve(provider.provideHover(model, hoverSource.hoverPosition, tokenSource.token, context));
    } catch (e) {
      onUnexpectedExternalError(e);
    }
    tokenSource.dispose();
    this._ongoingHoverOperations.delete(provider);
    return hover;
  }
  _updateRenderedHoverPart(index, hoverPart) {
    if (index >= this.renderedHoverParts.length || index < 0) {
      return void 0;
    }
    const renderedHoverPart = this._renderHoverPart(hoverPart, this._onFinishedRendering);
    const currentRenderedHoverPart = this.renderedHoverParts[index];
    const currentRenderedMarkdown = currentRenderedHoverPart.hoverElement;
    const renderedMarkdown = renderedHoverPart.hoverElement;
    const renderedChildrenElements = Array.from(renderedMarkdown.children);
    currentRenderedMarkdown.replaceChildren(...renderedChildrenElements);
    const newRenderedHoverPart = new RenderedMarkdownHoverPart(
      hoverPart,
      currentRenderedMarkdown,
      renderedHoverPart.disposables,
      renderedHoverPart.actionsContainer
    );
    currentRenderedHoverPart.dispose();
    this.renderedHoverParts[index] = newRenderedHoverPart;
    return newRenderedHoverPart;
  }
  _getRenderedHoverPartAtIndex(index) {
    return this.renderedHoverParts[index];
  }
  dispose() {
    this._disposables.dispose();
  }
}
function renderMarkdownHovers(context, markdownHovers, editor, languageService, openerService) {
  markdownHovers.sort(compareBy((hover) => hover.ordinal, numberComparator));
  const renderedHoverParts = [];
  for (const markdownHover of markdownHovers) {
    renderedHoverParts.push(renderMarkdownInContainer(
      editor,
      markdownHover,
      languageService,
      openerService,
      context.onContentsChanged
    ));
  }
  return new RenderedHoverParts(renderedHoverParts);
}
__name(renderMarkdownHovers, "renderMarkdownHovers");
function renderMarkdownInContainer(editor, markdownHover, languageService, openerService, onFinishedRendering) {
  const disposables = new DisposableStore();
  const renderedMarkdown = $("div.hover-row");
  const renderedMarkdownContents = $("div.hover-row-contents");
  renderedMarkdown.appendChild(renderedMarkdownContents);
  const markdownStrings = markdownHover.contents;
  for (const markdownString of markdownStrings) {
    if (isEmptyMarkdownString(markdownString)) {
      continue;
    }
    const markdownHoverElement = $("div.markdown-hover");
    const hoverContentsElement = dom.append(markdownHoverElement, $("div.hover-contents"));
    const renderer = new MarkdownRenderer({ editor }, languageService, openerService);
    const renderedContents = disposables.add(renderer.render(markdownString, {
      asyncRenderCallback: /* @__PURE__ */ __name(() => {
        hoverContentsElement.className = "hover-contents code-hover-contents";
        onFinishedRendering();
      }, "asyncRenderCallback")
    }));
    hoverContentsElement.appendChild(renderedContents.element);
    renderedMarkdownContents.appendChild(markdownHoverElement);
  }
  const renderedHoverPart = {
    hoverPart: markdownHover,
    hoverElement: renderedMarkdown,
    dispose() {
      disposables.dispose();
    }
  };
  return renderedHoverPart;
}
__name(renderMarkdownInContainer, "renderMarkdownInContainer");
function labelForHoverVerbosityAction(keybindingService, action) {
  switch (action) {
    case HoverVerbosityAction.Increase: {
      const kb = keybindingService.lookupKeybinding(INCREASE_HOVER_VERBOSITY_ACTION_ID);
      return kb ? nls.localize("increaseVerbosityWithKb", "Increase Hover Verbosity ({0})", kb.getLabel()) : nls.localize("increaseVerbosity", "Increase Hover Verbosity");
    }
    case HoverVerbosityAction.Decrease: {
      const kb = keybindingService.lookupKeybinding(DECREASE_HOVER_VERBOSITY_ACTION_ID);
      return kb ? nls.localize("decreaseVerbosityWithKb", "Decrease Hover Verbosity ({0})", kb.getLabel()) : nls.localize("decreaseVerbosity", "Decrease Hover Verbosity");
    }
  }
}
__name(labelForHoverVerbosityAction, "labelForHoverVerbosityAction");
export {
  MarkdownHover,
  MarkdownHoverParticipant,
  labelForHoverVerbosityAction,
  renderMarkdownHovers
};
//# sourceMappingURL=markdownHoverParticipant.js.map
