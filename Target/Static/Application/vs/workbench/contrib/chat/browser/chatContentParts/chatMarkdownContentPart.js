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
var ChatMarkdownContentPart_1;
import * as dom from "../../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../../base/browser/mouseEvent.js";
import { findLast } from "../../../../../base/common/arraysFind.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../base/common/observable.js";
import { equalsIgnoreCase } from "../../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { getIconClasses } from "../../../../../editor/common/services/getIconClasses.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../../nls.js";
import { getFlatContextMenuActions } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId } from "../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { FileKind } from "../../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IChatService } from "../../common/chatService.js";
import { isRequestVM, isResponseVM } from "../../common/chatViewModel.js";
import { ChatMarkdownDecorationsRenderer } from "../chatMarkdownDecorationsRenderer.js";
import { CodeBlockPart, localFileLanguageId, parseLocalFileData } from "../codeBlockPart.js";
import "../media/chatCodeBlockPill.css";
import { ResourcePool } from "./chatCollections.js";
import { ChatExtensionsContentPart } from "./chatExtensionsContentPart.js";
const $ = dom.$;
let ChatMarkdownContentPart = class ChatMarkdownContentPart2 extends Disposable {
  static {
    __name(this, "ChatMarkdownContentPart");
  }
  static {
    ChatMarkdownContentPart_1 = this;
  }
  static {
    this.idPool = 0;
  }
  constructor(markdown, context, editorPool, fillInIncompleteTokens = false, codeBlockStartIndex = 0, renderer, currentWidth, codeBlockModelCollection, rendererOptions, contextKeyService, textModelService, instantiationService) {
    super();
    this.markdown = markdown;
    this.editorPool = editorPool;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.rendererOptions = rendererOptions;
    this.textModelService = textModelService;
    this.instantiationService = instantiationService;
    this.codeblocksPartId = String(++ChatMarkdownContentPart_1.idPool);
    this.allRefs = [];
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this.codeblocks = [];
    const element = context.element;
    const inUndoStop = findLast(context.content, (e) => e.kind === "undoStop", context.contentIndex)?.id;
    const orderedDisposablesList = [];
    let globalCodeBlockIndexStart = codeBlockStartIndex;
    let thisPartCodeBlockIndexStart = 0;
    const markedOpts = isRequestVM(element) ? {
      gfm: true,
      breaks: true
    } : void 0;
    const result = this._register(renderer.render(markdown.content, {
      fillInIncompleteTokens,
      codeBlockRendererSync: /* @__PURE__ */ __name((languageId, text, raw) => {
        const isCodeBlockComplete = !isResponseVM(context.element) || context.element.isComplete || !raw || codeblockHasClosingBackticks(raw);
        if ((!text || text.startsWith("<vscode_codeblock_uri") && !text.includes("\n")) && !isCodeBlockComplete) {
          const hideEmptyCodeblock = $("div");
          hideEmptyCodeblock.style.display = "none";
          return hideEmptyCodeblock;
        }
        if (languageId === "vscode-extensions") {
          const chatExtensions = this._register(instantiationService.createInstance(ChatExtensionsContentPart, { kind: "extensions", extensions: text.split(",") }));
          this._register(chatExtensions.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
          return chatExtensions.domNode;
        }
        const globalIndex = globalCodeBlockIndexStart++;
        const thisPartIndex = thisPartCodeBlockIndexStart++;
        let textModel;
        let range;
        let vulns;
        let codeblockEntry;
        if (equalsIgnoreCase(languageId, localFileLanguageId)) {
          try {
            const parsedBody = parseLocalFileData(text);
            range = parsedBody.range && Range.lift(parsedBody.range);
            textModel = this.textModelService.createModelReference(parsedBody.uri).then((ref) => ref.object.textEditorModel);
          } catch (e) {
            return $("div");
          }
        } else {
          const sessionId = isResponseVM(element) || isRequestVM(element) ? element.sessionId : "";
          const modelEntry = this.codeBlockModelCollection.getOrCreate(sessionId, element, globalIndex);
          const fastUpdateModelEntry = this.codeBlockModelCollection.updateSync(sessionId, element, globalIndex, { text, languageId, isComplete: isCodeBlockComplete });
          vulns = modelEntry.vulns;
          codeblockEntry = fastUpdateModelEntry;
          textModel = modelEntry.model;
        }
        const hideToolbar = isResponseVM(element) && element.errorDetails?.responseIsFiltered;
        const renderOptions = {
          ...this.rendererOptions.codeBlockRenderOptions
        };
        if (hideToolbar !== void 0) {
          renderOptions.hideToolbar = hideToolbar;
        }
        const codeBlockInfo = { languageId, textModel, codeBlockIndex: globalIndex, codeBlockPartIndex: thisPartIndex, element, range, parentContextKeyService: contextKeyService, vulns, codemapperUri: codeblockEntry?.codemapperUri, renderOptions, chatSessionId: element.sessionId };
        if (element.isCompleteAddedRequest || !codeblockEntry?.codemapperUri || !codeblockEntry.isEdit) {
          const ref = this.renderCodeBlock(codeBlockInfo, text, isCodeBlockComplete, currentWidth);
          this.allRefs.push(ref);
          this._register(ref.object.onDidChangeContentHeight(() => this._onDidChangeHeight.fire()));
          const ownerMarkdownPartId = this.codeblocksPartId;
          const info = new class {
            constructor() {
              this.ownerMarkdownPartId = ownerMarkdownPartId;
              this.codeBlockIndex = globalIndex;
              this.elementId = element.id;
              this.isStreaming = false;
              this.chatSessionId = element.sessionId;
              this.codemapperUri = void 0;
              this.uriPromise = textModel.then((model) => model.uri);
            }
            get uri() {
              return ref.object.uri;
            }
            focus() {
              ref.object.focus();
            }
          }();
          this.codeblocks.push(info);
          orderedDisposablesList.push(ref);
          return ref.object.element;
        } else {
          const requestId = isRequestVM(element) ? element.id : element.requestId;
          const ref = this.renderCodeBlockPill(element.sessionId, requestId, inUndoStop, codeBlockInfo.codemapperUri, !isCodeBlockComplete);
          if (isResponseVM(codeBlockInfo.element)) {
            this.codeBlockModelCollection.update(codeBlockInfo.element.sessionId, codeBlockInfo.element, codeBlockInfo.codeBlockIndex, { text, languageId: codeBlockInfo.languageId, isComplete: isCodeBlockComplete }).then((e) => {
              this.codeblocks[codeBlockInfo.codeBlockPartIndex].codemapperUri = e.codemapperUri;
              this._onDidChangeHeight.fire();
            });
          }
          this.allRefs.push(ref);
          const ownerMarkdownPartId = this.codeblocksPartId;
          const info = new class {
            constructor() {
              this.ownerMarkdownPartId = ownerMarkdownPartId;
              this.codeBlockIndex = globalIndex;
              this.elementId = element.id;
              this.isStreaming = !isCodeBlockComplete;
              this.codemapperUri = codeblockEntry?.codemapperUri;
              this.chatSessionId = element.sessionId;
              this.uriPromise = Promise.resolve(void 0);
            }
            get uri() {
              return void 0;
            }
            focus() {
              return ref.object.element.focus();
            }
          }();
          this.codeblocks.push(info);
          orderedDisposablesList.push(ref);
          return ref.object.element;
        }
      }, "codeBlockRendererSync"),
      asyncRenderCallback: /* @__PURE__ */ __name(() => this._onDidChangeHeight.fire(), "asyncRenderCallback")
    }, markedOpts));
    const markdownDecorationsRenderer = instantiationService.createInstance(ChatMarkdownDecorationsRenderer);
    this._register(markdownDecorationsRenderer.walkTreeAndAnnotateReferenceLinks(markdown, result.element));
    orderedDisposablesList.reverse().forEach((d) => this._register(d));
    this.domNode = result.element;
  }
  renderCodeBlockPill(sessionId, requestId, inUndoStop, codemapperUri, isStreaming) {
    const codeBlock = this.instantiationService.createInstance(CollapsedCodeBlock, sessionId, requestId, inUndoStop);
    if (codemapperUri) {
      codeBlock.render(codemapperUri, isStreaming);
    }
    return {
      object: codeBlock,
      isStale: /* @__PURE__ */ __name(() => false, "isStale"),
      dispose: /* @__PURE__ */ __name(() => codeBlock.dispose(), "dispose")
    };
  }
  renderCodeBlock(data, text, isComplete, currentWidth) {
    const ref = this.editorPool.get();
    const editorInfo = ref.object;
    if (isResponseVM(data.element)) {
      this.codeBlockModelCollection.update(data.element.sessionId, data.element, data.codeBlockIndex, { text, languageId: data.languageId, isComplete }).then((e) => {
        this.codeblocks[data.codeBlockPartIndex].codemapperUri = e.codemapperUri;
        this._onDidChangeHeight.fire();
      });
    }
    editorInfo.render(data, currentWidth);
    return ref;
  }
  hasSameContent(other) {
    return other.kind === "markdownContent" && !!(other.content.value === this.markdown.content.value || this.codeblocks.at(-1)?.isStreaming && this.codeblocks.at(-1)?.codemapperUri !== void 0 && other.content.value.lastIndexOf("```") === this.markdown.content.value.lastIndexOf("```"));
  }
  layout(width) {
    this.allRefs.forEach((ref, index) => {
      if (ref.object instanceof CodeBlockPart) {
        ref.object.layout(width);
      } else if (ref.object instanceof CollapsedCodeBlock) {
        const codeblockModel = this.codeblocks[index];
        if (codeblockModel.codemapperUri && ref.object.uri?.toString() !== codeblockModel.codemapperUri.toString()) {
          ref.object.render(codeblockModel.codemapperUri, codeblockModel.isStreaming);
        }
      }
    });
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatMarkdownContentPart = ChatMarkdownContentPart_1 = __decorate([
  __param(9, IContextKeyService),
  __param(10, ITextModelService),
  __param(11, IInstantiationService)
], ChatMarkdownContentPart);
let EditorPool = class EditorPool2 extends Disposable {
  static {
    __name(this, "EditorPool");
  }
  inUse() {
    return this._pool.inUse;
  }
  constructor(options, delegate, overflowWidgetsDomNode, instantiationService) {
    super();
    this._pool = this._register(new ResourcePool(() => {
      return instantiationService.createInstance(CodeBlockPart, options, MenuId.ChatCodeBlock, delegate, overflowWidgetsDomNode);
    }));
  }
  get() {
    const codeBlock = this._pool.get();
    let stale = false;
    return {
      object: codeBlock,
      isStale: /* @__PURE__ */ __name(() => stale, "isStale"),
      dispose: /* @__PURE__ */ __name(() => {
        codeBlock.reset();
        stale = true;
        this._pool.release(codeBlock);
      }, "dispose")
    };
  }
};
EditorPool = __decorate([
  __param(3, IInstantiationService)
], EditorPool);
function codeblockHasClosingBackticks(str) {
  str = str.trim();
  return !!str.match(/\n```+$/);
}
__name(codeblockHasClosingBackticks, "codeblockHasClosingBackticks");
let CollapsedCodeBlock = class CollapsedCodeBlock2 extends Disposable {
  static {
    __name(this, "CollapsedCodeBlock");
  }
  get uri() {
    return this._uri;
  }
  constructor(sessionId, requestId, inUndoStop, labelService, editorService, modelService, languageService, contextMenuService, contextKeyService, menuService, hoverService, chatService) {
    super();
    this.sessionId = sessionId;
    this.requestId = requestId;
    this.inUndoStop = inUndoStop;
    this.labelService = labelService;
    this.editorService = editorService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this.hoverService = hoverService;
    this.chatService = chatService;
    this.hover = this._register(new MutableDisposable());
    this._progressStore = this._store.add(new DisposableStore());
    this.element = $(".chat-codeblock-pill-widget");
    this.element.classList.add("show-file-icons");
    this._register(dom.addDisposableListener(this.element, "click", async () => {
      if (this._currentDiff) {
        this.editorService.openEditor({
          original: { resource: this._currentDiff.originalURI },
          modified: { resource: this._currentDiff.modifiedURI },
          options: { transient: true }
        });
      } else if (this.uri) {
        this.editorService.openEditor({ resource: this.uri });
      }
    }));
    this._register(dom.addDisposableListener(this.element, dom.EventType.CONTEXT_MENU, (domEvent) => {
      const event = new StandardMouseEvent(dom.getWindow(domEvent), domEvent);
      dom.EventHelper.stop(domEvent, true);
      this.contextMenuService.showContextMenu({
        contextKeyService: this.contextKeyService,
        getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => {
          const menu = this.menuService.getMenuActions(MenuId.ChatEditingCodeBlockContext, this.contextKeyService, { arg: { sessionId, requestId, uri: this.uri, stopId: inUndoStop } });
          return getFlatContextMenuActions(menu);
        }, "getActions")
      });
    }));
  }
  render(uri, isStreaming) {
    this._progressStore.clear();
    this._uri = uri;
    const session = this.chatService.getSession(this.sessionId);
    const iconText = this.labelService.getUriBasenameLabel(uri);
    let editSession = session?.editingSessionObs?.promiseResult.get()?.data;
    let modifiedEntry = editSession?.getEntry(uri);
    let modifiedByResponse = modifiedEntry?.isCurrentlyBeingModifiedBy.get();
    const isComplete = !modifiedByResponse || modifiedByResponse.requestId !== this.requestId;
    let iconClasses = [];
    if (isStreaming || !isComplete) {
      const codicon = ThemeIcon.modify(Codicon.loading, "spin");
      iconClasses = ThemeIcon.asClassNameArray(codicon);
    } else {
      const fileKind = uri.path.endsWith("/") ? FileKind.FOLDER : FileKind.FILE;
      iconClasses = getIconClasses(this.modelService, this.languageService, uri, fileKind);
    }
    const iconEl = dom.$("span.icon");
    iconEl.classList.add(...iconClasses);
    const children = [dom.$("span.icon-label", {}, iconText)];
    const labelDetail = dom.$("span.label-detail", {}, "");
    children.push(labelDetail);
    if (isStreaming) {
      labelDetail.textContent = localize("chat.codeblock.generating", "Generating edits...");
    }
    this.element.replaceChildren(iconEl, ...children);
    this.updateTooltip(this.labelService.getUriLabel(uri, { relative: false }));
    const renderDiff = /* @__PURE__ */ __name((changes) => {
      const labelAdded = this.element.querySelector(".label-added") ?? this.element.appendChild(dom.$("span.label-added"));
      const labelRemoved = this.element.querySelector(".label-removed") ?? this.element.appendChild(dom.$("span.label-removed"));
      if (changes && !changes?.identical && !changes?.quitEarly) {
        this._currentDiff = changes;
        labelAdded.textContent = `+${changes.added}`;
        labelRemoved.textContent = `-${changes.removed}`;
        const insertionsFragment = changes.added === 1 ? localize("chat.codeblock.insertions.one", "1 insertion") : localize("chat.codeblock.insertions", "{0} insertions", changes.added);
        const deletionsFragment = changes.removed === 1 ? localize("chat.codeblock.deletions.one", "1 deletion") : localize("chat.codeblock.deletions", "{0} deletions", changes.removed);
        const summary = localize("summary", "Edited {0}, {1}, {2}", iconText, insertionsFragment, deletionsFragment);
        this.element.ariaLabel = summary;
        this.updateTooltip(summary);
      }
    }, "renderDiff");
    let diffBetweenStops;
    this._progressStore.add(autorun((r) => {
      if (!editSession) {
        editSession = session?.editingSessionObs?.promiseResult.read(r)?.data;
        modifiedEntry = editSession?.getEntry(uri);
      }
      modifiedByResponse = modifiedEntry?.isCurrentlyBeingModifiedBy.read(r);
      let diffValue = diffBetweenStops?.read(r);
      const isComplete2 = !!diffValue || !modifiedByResponse || modifiedByResponse.requestId !== this.requestId;
      const rewriteRatio = modifiedEntry?.rewriteRatio.read(r);
      if (!isStreaming && !isComplete2) {
        const value = rewriteRatio;
        labelDetail.textContent = value === 0 || !value ? localize("chat.codeblock.generating", "Generating edits...") : localize("chat.codeblock.applyingPercentage", "Applying edits ({0}%)...", Math.round(value * 100));
      } else if (!isStreaming && isComplete2) {
        iconEl.classList.remove(...iconClasses);
        const fileKind = uri.path.endsWith("/") ? FileKind.FOLDER : FileKind.FILE;
        iconEl.classList.add(...getIconClasses(this.modelService, this.languageService, uri, fileKind));
        labelDetail.textContent = "";
      }
      if (!diffBetweenStops) {
        diffBetweenStops = modifiedEntry && editSession ? editSession.getEntryDiffBetweenStops(modifiedEntry.modifiedURI, this.requestId, this.inUndoStop) : void 0;
        diffValue = diffBetweenStops?.read(r);
      }
      if (!isStreaming && isComplete2) {
        renderDiff(diffValue);
      }
    }));
  }
  updateTooltip(tooltip) {
    this.tooltip = tooltip;
    if (!this.hover.value) {
      this.hover.value = this.hoverService.setupDelayedHover(this.element, () => ({
        content: this.tooltip,
        appearance: { compact: true, showPointer: true },
        position: {
          hoverPosition: 2
          /* HoverPosition.BELOW */
        },
        persistence: { hideOnKeyDown: true }
      }));
    }
  }
};
CollapsedCodeBlock = __decorate([
  __param(3, ILabelService),
  __param(4, IEditorService),
  __param(5, IModelService),
  __param(6, ILanguageService),
  __param(7, IContextMenuService),
  __param(8, IContextKeyService),
  __param(9, IMenuService),
  __param(10, IHoverService),
  __param(11, IChatService)
], CollapsedCodeBlock);
export {
  ChatMarkdownContentPart,
  EditorPool
};
//# sourceMappingURL=chatMarkdownContentPart.js.map
