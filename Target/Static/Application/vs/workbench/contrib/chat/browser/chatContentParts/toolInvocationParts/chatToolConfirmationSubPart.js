var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../../base/browser/dom.js";
import { RunOnceScheduler } from "../../../../../../base/common/async.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { toDisposable } from "../../../../../../base/common/lifecycle.js";
import { count } from "../../../../../../base/common/strings.js";
import { isEmptyObject } from "../../../../../../base/common/types.js";
import { generateUuid } from "../../../../../../base/common/uuid.js";
import { ElementSizeObserver } from "../../../../../../editor/browser/config/elementSizeObserver.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { localize } from "../../../../../../nls.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { IMarkerService, MarkerSeverity } from "../../../../../../platform/markers/common/markers.js";
import { ChatContextKeys } from "../../../common/chatContextKeys.js";
import { createToolInputUri, createToolSchemaUri, ILanguageModelToolsService } from "../../../common/languageModelToolsService.js";
import { CancelChatActionId } from "../../actions/chatExecuteActions.js";
import { AcceptToolConfirmationActionId } from "../../actions/chatToolActions.js";
import { IChatWidgetService } from "../../chat.js";
import { renderFileWidgets } from "../../chatInlineAnchorWidget.js";
import { ChatConfirmationWidget, ChatCustomConfirmationWidget } from "../chatConfirmationWidget.js";
import { IChatMarkdownAnchorService } from "../chatMarkdownAnchorService.js";
import { ChatMarkdownContentPart } from "../chatMarkdownContentPart.js";
import { BaseChatToolInvocationSubPart } from "./chatToolInvocationSubPart.js";
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
const SHOW_MORE_MESSAGE_HEIGHT_TRIGGER = 30;
let ToolConfirmationSubPart = class ToolConfirmationSubPart2 extends BaseChatToolInvocationSubPart {
  static {
    __name(this, "ToolConfirmationSubPart");
  }
  get codeblocks() {
    return this.markdownParts.flatMap((part) => part.codeblocks);
  }
  constructor(toolInvocation, context, renderer, editorPool, currentWidthDelegate, codeBlockModelCollection, codeBlockStartIndex, instantiationService, keybindingService, modelService, languageService, contextKeyService, chatWidgetService, commandService, markerService, languageModelToolsService, chatMarkdownAnchorService) {
    super(toolInvocation);
    this.context = context;
    this.renderer = renderer;
    this.editorPool = editorPool;
    this.currentWidthDelegate = currentWidthDelegate;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.codeBlockStartIndex = codeBlockStartIndex;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.contextKeyService = contextKeyService;
    this.chatWidgetService = chatWidgetService;
    this.commandService = commandService;
    this.markerService = markerService;
    this.languageModelToolsService = languageModelToolsService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this.markdownParts = [];
    if (!toolInvocation.confirmationMessages) {
      throw new Error("Confirmation messages are missing");
    }
    const { title, message, allowAutoConfirm, disclaimer } = toolInvocation.confirmationMessages;
    const continueLabel = localize("continue", "Continue");
    const continueKeybinding = keybindingService.lookupKeybinding(AcceptToolConfirmationActionId)?.getLabel();
    const continueTooltip = continueKeybinding ? `${continueLabel} (${continueKeybinding})` : continueLabel;
    const cancelLabel = localize("cancel", "Cancel");
    const cancelKeybinding = keybindingService.lookupKeybinding(CancelChatActionId)?.getLabel();
    const cancelTooltip = cancelKeybinding ? `${cancelLabel} (${cancelKeybinding})` : cancelLabel;
    var ConfirmationOutcome;
    (function(ConfirmationOutcome2) {
      ConfirmationOutcome2[ConfirmationOutcome2["Allow"] = 0] = "Allow";
      ConfirmationOutcome2[ConfirmationOutcome2["Disallow"] = 1] = "Disallow";
      ConfirmationOutcome2[ConfirmationOutcome2["AllowWorkspace"] = 2] = "AllowWorkspace";
      ConfirmationOutcome2[ConfirmationOutcome2["AllowGlobally"] = 3] = "AllowGlobally";
      ConfirmationOutcome2[ConfirmationOutcome2["AllowSession"] = 4] = "AllowSession";
    })(ConfirmationOutcome || (ConfirmationOutcome = {}));
    const buttons = [
      {
        label: continueLabel,
        data: 0,
        tooltip: continueTooltip,
        moreActions: !allowAutoConfirm ? void 0 : [
          { label: localize("allowSession", "Allow in this Session"), data: 4, tooltip: localize("allowSesssionTooltip", "Allow this tool to run in this session without confirmation.") },
          { label: localize("allowWorkspace", "Allow in this Workspace"), data: 2, tooltip: localize("allowWorkspaceTooltip", "Allow this tool to run in this workspace without confirmation.") },
          { label: localize("allowGlobally", "Always Allow"), data: 3, tooltip: localize("allowGloballTooltip", "Always allow this tool to run without confirmation.") }
        ]
      },
      {
        label: localize("cancel", "Cancel"),
        data: 1,
        isSecondary: true,
        tooltip: cancelTooltip
      }
    ];
    let confirmWidget;
    if (typeof message === "string") {
      confirmWidget = this._register(this.instantiationService.createInstance(ChatConfirmationWidget, title, toolInvocation.originMessage, message, buttons, this.context.container));
    } else {
      const codeBlockRenderOptions = {
        hideToolbar: true,
        reserveWidth: 19,
        verticalPadding: 5,
        editorOptions: {
          tabFocusMode: true,
          ariaLabel: typeof title === "string" ? title : title.value
        }
      };
      const elements = dom.h("div", [
        dom.h(".message@messageContainer", [
          dom.h(".message-wrapper@message"),
          dom.h("a.see-more@showMore")
        ]),
        dom.h(".editor@editor"),
        dom.h(".disclaimer@disclaimer")
      ]);
      if (toolInvocation.toolSpecificData?.kind === "input" && toolInvocation.toolSpecificData.rawInput && !isEmptyObject(toolInvocation.toolSpecificData.rawInput)) {
        const title2 = document.createElement("h3");
        title2.textContent = localize("chat.input", "Input");
        elements.editor.appendChild(title2);
        const inputData = toolInvocation.toolSpecificData;
        const codeBlockRenderOptions2 = {
          hideToolbar: true,
          reserveWidth: 19,
          maxHeightInLines: 13,
          verticalPadding: 5,
          editorOptions: {
            wordWrap: "off",
            readOnly: false,
            ariaLabel: typeof toolInvocation.confirmationMessages.title === "string" ? toolInvocation.confirmationMessages.title : toolInvocation.confirmationMessages.title.value
          }
        };
        const langId = this.languageService.getLanguageIdByLanguageName("json");
        const rawJsonInput = JSON.stringify(inputData.rawInput ?? {}, null, 1);
        const canSeeMore = count(rawJsonInput, "\n") > 2;
        const model = this._register(this.modelService.createModel(
          // View a single JSON line by default until they 'see more'
          rawJsonInput.replace(/\n */g, " "),
          this.languageService.createById(langId),
          createToolInputUri(toolInvocation.toolId),
          true
        ));
        const markerOwner = generateUuid();
        const schemaUri = createToolSchemaUri(toolInvocation.toolId);
        const validator = new RunOnceScheduler(async () => {
          const newMarker = [];
          const result = await this.commandService.executeCommand("json.validate", schemaUri, model.getValue());
          for (const item of result) {
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
          chatSessionId: this.context.element.sessionId
        }, this.currentWidthDelegate());
        this.codeblocks.push({
          codeBlockIndex: this.codeBlockStartIndex,
          codemapperUri: void 0,
          elementId: this.context.element.id,
          focus: /* @__PURE__ */ __name(() => editor.object.focus(), "focus"),
          isStreaming: false,
          ownerMarkdownPartId: this.codeblocksPartId,
          uri: model.uri,
          uriPromise: Promise.resolve(model.uri),
          chatSessionId: this.context.element.sessionId
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
      this._makeMarkdownPart(elements.message, message, codeBlockRenderOptions);
      elements.showMore.textContent = localize("seeMore", "See more");
      const messageSeeMoreObserver = this._register(new ElementSizeObserver(elements.message, void 0));
      const updateSeeMoreDisplayed = /* @__PURE__ */ __name(() => {
        const show = messageSeeMoreObserver.getHeight() > SHOW_MORE_MESSAGE_HEIGHT_TRIGGER;
        elements.messageContainer.classList.toggle("can-see-more", show);
      }, "updateSeeMoreDisplayed");
      this._register(dom.addDisposableListener(elements.showMore, "click", () => {
        elements.messageContainer.classList.toggle("can-see-more", false);
        messageSeeMoreObserver.dispose();
      }));
      this._register(messageSeeMoreObserver.onDidChange(updateSeeMoreDisplayed));
      messageSeeMoreObserver.startObserving();
      if (disclaimer) {
        this._makeMarkdownPart(elements.disclaimer, disclaimer, codeBlockRenderOptions);
      } else {
        elements.disclaimer.remove();
      }
      confirmWidget = this._register(this.instantiationService.createInstance(ChatCustomConfirmationWidget, title, toolInvocation.originMessage, elements.root, buttons, this.context.container));
    }
    const hasToolConfirmation = ChatContextKeys.Editing.hasToolConfirmation.bindTo(this.contextKeyService);
    hasToolConfirmation.set(true);
    this._register(confirmWidget.onDidClick((button) => {
      switch (button.data) {
        case 3:
          this.languageModelToolsService.setToolAutoConfirmation(toolInvocation.toolId, "profile", true);
          toolInvocation.confirmed.complete(true);
          break;
        case 2:
          this.languageModelToolsService.setToolAutoConfirmation(toolInvocation.toolId, "workspace", true);
          toolInvocation.confirmed.complete(true);
          break;
        case 4:
          this.languageModelToolsService.setToolAutoConfirmation(toolInvocation.toolId, "memory", true);
          toolInvocation.confirmed.complete(true);
          break;
        case 0:
          toolInvocation.confirmed.complete(true);
          break;
        case 1:
          toolInvocation.confirmed.complete(false);
          break;
      }
      this.chatWidgetService.getWidgetBySessionId(this.context.element.sessionId)?.focusInput();
    }));
    this._register(confirmWidget.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    this._register(toDisposable(() => hasToolConfirmation.reset()));
    toolInvocation.confirmed.p.then(() => {
      hasToolConfirmation.reset();
      this._onNeedsRerender.fire();
    });
    this.domNode = confirmWidget.domNode;
  }
  _makeMarkdownPart(container, message, codeBlockRenderOptions) {
    const part = this._register(this.instantiationService.createInstance(ChatMarkdownContentPart, { kind: "markdownContent", content: typeof message === "string" ? new MarkdownString().appendText(message) : message }, this.context, this.editorPool, false, this.codeBlockStartIndex, this.renderer, this.currentWidthDelegate(), this.codeBlockModelCollection, { codeBlockRenderOptions }));
    renderFileWidgets(part.domNode, this.instantiationService, this.chatMarkdownAnchorService, this._store);
    container.append(part.domNode);
    this._register(part.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
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
  __param(16, IChatMarkdownAnchorService)
], ToolConfirmationSubPart);
export {
  ToolConfirmationSubPart
};
//# sourceMappingURL=chatToolConfirmationSubPart.js.map
