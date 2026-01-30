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
import * as dom from "../../../../../../../base/browser/dom.js";
import { Separator } from "../../../../../../../base/common/actions.js";
import { RunOnceScheduler } from "../../../../../../../base/common/async.js";
import { MarkdownString } from "../../../../../../../base/common/htmlContent.js";
import { toDisposable } from "../../../../../../../base/common/lifecycle.js";
import { count } from "../../../../../../../base/common/strings.js";
import { isEmptyObject } from "../../../../../../../base/common/types.js";
import { generateUuid } from "../../../../../../../base/common/uuid.js";
import { ElementSizeObserver } from "../../../../../../../editor/browser/config/elementSizeObserver.js";
import { ILanguageService } from "../../../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../../../editor/common/services/model.js";
import { localize } from "../../../../../../../nls.js";
import { ICommandService } from "../../../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../../../platform/keybinding/common/keybinding.js";
import { IMarkerService, MarkerSeverity } from "../../../../../../../platform/markers/common/markers.js";
import { createToolInputUri, createToolSchemaUri, ILanguageModelToolsService } from "../../../../common/tools/languageModelToolsService.js";
import { ILanguageModelToolsConfirmationService } from "../../../../common/tools/languageModelToolsConfirmationService.js";
import { AcceptToolConfirmationActionId, SkipToolConfirmationActionId } from "../../../actions/chatToolActions.js";
import { IChatWidgetService } from "../../../chat.js";
import { renderFileWidgets } from "../chatInlineAnchorWidget.js";
import { IChatMarkdownAnchorService } from "../chatMarkdownAnchorService.js";
import { ChatMarkdownContentPart } from "../chatMarkdownContentPart.js";
import { AbstractToolConfirmationSubPart } from "./abstractToolConfirmationSubPart.js";
const SHOW_MORE_MESSAGE_HEIGHT_TRIGGER = 45;
let ToolConfirmationSubPart = class ToolConfirmationSubPart2 extends AbstractToolConfirmationSubPart {
  static {
    __name(this, "ToolConfirmationSubPart");
  }
  get codeblocks() {
    return this.markdownParts.flatMap((part) => part.codeblocks);
  }
  constructor(toolInvocation, context, renderer, editorPool, currentWidthDelegate, codeBlockModelCollection, codeBlockStartIndex, instantiationService, keybindingService, modelService, languageService, contextKeyService, chatWidgetService, commandService, markerService, languageModelToolsService, chatMarkdownAnchorService, confirmationService) {
    const state = toolInvocation.state.get();
    if (state.type !== 1 || !state.confirmationMessages?.title) {
      throw new Error("Confirmation messages are missing");
    }
    super(toolInvocation, context, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService);
    this.renderer = renderer;
    this.editorPool = editorPool;
    this.currentWidthDelegate = currentWidthDelegate;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.codeBlockStartIndex = codeBlockStartIndex;
    this.modelService = modelService;
    this.languageService = languageService;
    this.commandService = commandService;
    this.markerService = markerService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this.confirmationService = confirmationService;
    this.markdownParts = [];
    this.render({
      allowActionId: AcceptToolConfirmationActionId,
      skipActionId: SkipToolConfirmationActionId,
      allowLabel: state.confirmationMessages.confirmResults ? localize("allowReview", "Allow and Review") : localize("allow", "Allow"),
      skipLabel: localize("skip.detail", "Proceed without running this tool"),
      partType: "chatToolConfirmation",
      subtitle: typeof toolInvocation.originMessage === "string" ? toolInvocation.originMessage : toolInvocation.originMessage?.value
    });
  }
  additionalPrimaryActions() {
    const actions = super.additionalPrimaryActions();
    const state = this.toolInvocation.state.get();
    if (state.type !== 1) {
      return actions;
    }
    if (state.confirmationMessages?.allowAutoConfirm !== false) {
      const confirmActions = this.confirmationService.getPreConfirmActions({
        toolId: this.toolInvocation.toolId,
        source: this.toolInvocation.source,
        parameters: state.parameters
      });
      for (const action of confirmActions) {
        if (action.divider) {
          actions.push(new Separator());
        }
        actions.push({
          label: action.label,
          tooltip: action.detail,
          data: /* @__PURE__ */ __name(async () => {
            const shouldConfirm = await action.select();
            if (shouldConfirm) {
              this.confirmWith(this.toolInvocation, {
                type: 4
                /* ToolConfirmKind.UserAction */
              });
            }
          }, "data")
        });
      }
    }
    if (state.confirmationMessages?.confirmResults) {
      actions.unshift({
        label: localize("allowSkip", "Allow and Skip Reviewing Result"),
        data: /* @__PURE__ */ __name(() => {
          state.confirmationMessages.confirmResults = void 0;
          this.confirmWith(this.toolInvocation, {
            type: 4
            /* ToolConfirmKind.UserAction */
          });
        }, "data")
      }, new Separator());
    }
    return actions;
  }
  createContentElement() {
    const state = this.toolInvocation.state.get();
    if (state.type !== 1) {
      return "";
    }
    const { message, disclaimer } = state.confirmationMessages;
    const toolInvocation = this.toolInvocation;
    if (typeof message === "string" && !disclaimer) {
      return message;
    } else {
      const codeBlockRenderOptions = {
        hideToolbar: true,
        reserveWidth: 19,
        verticalPadding: 5,
        editorOptions: {
          tabFocusMode: true,
          ariaLabel: this.getTitle()
        }
      };
      const elements = dom.h("div", [
        dom.h(".message@messageContainer", [
          dom.h(".message-wrapper@message"),
          dom.h(".see-more@showMore", [
            dom.h("a", [localize("showMore", "Show More")])
          ])
        ]),
        dom.h(".editor@editor"),
        dom.h(".disclaimer@disclaimer")
      ]);
      if (toolInvocation.toolSpecificData?.kind === "input" && toolInvocation.toolSpecificData.rawInput && !isEmptyObject(toolInvocation.toolSpecificData.rawInput)) {
        const titleEl = document.createElement("h3");
        titleEl.textContent = localize("chat.input", "Input");
        elements.editor.appendChild(titleEl);
        const inputData = toolInvocation.toolSpecificData;
        const codeBlockRenderOptions2 = {
          hideToolbar: true,
          reserveWidth: 19,
          maxHeightInLines: 13,
          verticalPadding: 5,
          editorOptions: {
            wordWrap: "off",
            readOnly: false,
            ariaLabel: this.getTitle()
          }
        };
        const langId = this.languageService.getLanguageIdByLanguageName("json");
        const rawJsonInput = JSON.stringify(inputData.rawInput ?? {}, null, 1);
        const canSeeMore = count(rawJsonInput, "\n") > 2;
        const model = this._register(this.modelService.createModel(
          // View a single JSON line by default until they 'see more'
          rawJsonInput.replace(/\n */g, " "),
          this.languageService.createById(langId),
          createToolInputUri(toolInvocation.toolCallId),
          true
        ));
        const markerOwner = generateUuid();
        const schemaUri = createToolSchemaUri(toolInvocation.toolId);
        const validator = new RunOnceScheduler(async () => {
          const newMarker = [];
          const result = await this.commandService.executeCommand("json.validate", schemaUri, model.getValue());
          for (const item of result ?? []) {
            if (item.range && item.message) {
              newMarker.push({
                severity: item.severity === "Error" ? MarkerSeverity.Error : MarkerSeverity.Warning,
                message: item.message,
                startLineNumber: item.range[0].line + 1,
                startColumn: item.range[0].character + 1,
                endLineNumber: item.range[1].line + 1,
                endColumn: item.range[1].character + 1,
                code: item.code ? String(item.code) : void 0
              });
            }
          }
          this.markerService.changeOne(markerOwner, model.uri, newMarker);
        }, 500);
        validator.schedule();
        this._register(model.onDidChangeContent(() => validator.schedule()));
        this._register(toDisposable(() => this.markerService.remove(markerOwner, [model.uri])));
        this._register(validator);
        const editor = this._register(this.editorPool.get());
        editor.object.render({
          codeBlockIndex: this.codeBlockStartIndex,
          codeBlockPartIndex: 0,
          element: this.context.element,
          languageId: langId ?? "json",
          renderOptions: codeBlockRenderOptions2,
          textModel: Promise.resolve(model),
          chatSessionResource: this.context.element.sessionResource
        }, this.currentWidthDelegate());
        this.codeblocks.push({
          codeBlockIndex: this.codeBlockStartIndex,
          codemapperUri: void 0,
          elementId: this.context.element.id,
          focus: /* @__PURE__ */ __name(() => editor.object.focus(), "focus"),
          ownerMarkdownPartId: this.codeblocksPartId,
          uri: model.uri,
          uriPromise: Promise.resolve(model.uri),
          chatSessionResource: this.context.element.sessionResource
        });
        this._register(editor.object.onDidChangeContentHeight(() => {
          editor.object.layout(this.currentWidthDelegate());
          this._onDidChangeHeight.fire();
        }));
        this._register(model.onDidChangeContent((e) => {
          try {
            inputData.rawInput = JSON.parse(model.getValue());
          } catch {
          }
        }));
        elements.editor.append(editor.object.element);
        if (canSeeMore) {
          const seeMore = dom.h("div.see-more", [dom.h("a@link")]);
          seeMore.link.textContent = localize("seeMore", "See more");
          this._register(dom.addDisposableGenericMouseDownListener(seeMore.link, () => {
            try {
              const parsed = JSON.parse(model.getValue());
              model.setValue(JSON.stringify(parsed, null, 2));
              editor.object.editor.updateOptions({ tabFocusMode: false });
              editor.object.editor.updateOptions({ wordWrap: "on" });
            } catch {
            }
            seeMore.root.remove();
          }));
          elements.editor.append(seeMore.root);
        }
      }
      const mdPart = this._makeMarkdownPart(elements.message, message, codeBlockRenderOptions);
      const messageSeeMoreObserver = this._register(new ElementSizeObserver(mdPart.domNode, void 0));
      const updateSeeMoreDisplayed = /* @__PURE__ */ __name(() => {
        const show = messageSeeMoreObserver.getHeight() > SHOW_MORE_MESSAGE_HEIGHT_TRIGGER;
        if (elements.messageContainer.classList.contains("can-see-more") !== show) {
          elements.messageContainer.classList.toggle("can-see-more", show);
          this._onDidChangeHeight.fire();
        }
      }, "updateSeeMoreDisplayed");
      this._register(dom.addDisposableListener(elements.showMore, "click", () => {
        elements.messageContainer.classList.toggle("can-see-more", false);
        this._onDidChangeHeight.fire();
        messageSeeMoreObserver.dispose();
      }));
      this._register(messageSeeMoreObserver.onDidChange(updateSeeMoreDisplayed));
      messageSeeMoreObserver.startObserving();
      if (disclaimer) {
        this._makeMarkdownPart(elements.disclaimer, disclaimer, codeBlockRenderOptions);
      } else {
        elements.disclaimer.remove();
      }
      return elements.root;
    }
  }
  getTitle() {
    const state = this.toolInvocation.state.get();
    if (state.type !== 1) {
      return "";
    }
    const title = state.confirmationMessages?.title;
    if (!title) {
      return "";
    }
    return typeof title === "string" ? title : title.value;
  }
  _makeMarkdownPart(container, message, codeBlockRenderOptions) {
    const part = this._register(this.instantiationService.createInstance(ChatMarkdownContentPart, {
      kind: "markdownContent",
      content: typeof message === "string" ? new MarkdownString().appendMarkdown(message) : message
    }, this.context, this.editorPool, false, this.codeBlockStartIndex, this.renderer, void 0, this.currentWidthDelegate(), this.codeBlockModelCollection, { codeBlockRenderOptions }));
    renderFileWidgets(part.domNode, this.instantiationService, this.chatMarkdownAnchorService, this._store);
    container.append(part.domNode);
    this._register(part.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    return part;
  }
};
ToolConfirmationSubPart = __decorate([
  __param(7, IInstantiationService),
  __param(8, IKeybindingService),
  __param(9, IModelService),
  __param(10, ILanguageService),
  __param(11, IContextKeyService),
  __param(12, IChatWidgetService),
  __param(13, ICommandService),
  __param(14, IMarkerService),
  __param(15, ILanguageModelToolsService),
  __param(16, IChatMarkdownAnchorService),
  __param(17, ILanguageModelToolsConfirmationService)
], ToolConfirmationSubPart);
export {
  ToolConfirmationSubPart
};
//# sourceMappingURL=chatToolConfirmationSubPart.js.map
