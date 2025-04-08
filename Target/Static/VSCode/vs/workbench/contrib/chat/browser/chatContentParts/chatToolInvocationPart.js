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
import * as dom from "../../../../../base/browser/dom.js";
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { IMarkdownString, MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { Location } from "../../../../../editor/common/languages.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { IMarkerData, IMarkerService, MarkerSeverity } from "../../../../../platform/markers/common/markers.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { IChatMarkdownContent, IChatProgressMessage, IChatTerminalToolInvocationData, IChatToolInvocation, IChatToolInvocationSerialized } from "../../common/chatService.js";
import { IChatRendererContent } from "../../common/chatViewModel.js";
import { CodeBlockModelCollection } from "../../common/codeBlockModelCollection.js";
import { createToolInputUri, createToolSchemaUri, ILanguageModelToolsService, isToolResultInputOutputDetails, IToolResultInputOutputDetails } from "../../common/languageModelToolsService.js";
import { CancelChatActionId } from "../actions/chatExecuteActions.js";
import { AcceptToolConfirmationActionId } from "../actions/chatToolActions.js";
import { ChatTreeItem, IChatCodeBlockInfo } from "../chat.js";
import { ICodeBlockRenderOptions } from "../codeBlockPart.js";
import { ChatCollapsibleEditorContentPart } from "./chatCollapsibleContentPart.js";
import { ChatConfirmationWidget, ChatCustomConfirmationWidget, IChatConfirmationButton } from "./chatConfirmationWidget.js";
import { IChatContentPart, IChatContentPartRenderContext } from "./chatContentParts.js";
import { ChatMarkdownContentPart, EditorPool } from "./chatMarkdownContentPart.js";
import { ChatCustomProgressPart, ChatProgressContentPart } from "./chatProgressContentPart.js";
import { ChatCollapsibleListContentPart, CollapsibleListPool, IChatCollapsibleListItem } from "./chatReferencesContentPart.js";
let ChatToolInvocationPart = class extends Disposable {
  constructor(toolInvocation, context, renderer, listPool, editorPool, currentWidthDelegate, codeBlockModelCollection, codeBlockStartIndex, instantiationService) {
    super();
    this.toolInvocation = toolInvocation;
    this.domNode = dom.$(".chat-tool-invocation-part");
    if (toolInvocation.presentation === "hidden") {
      return;
    }
    const partStore = this._register(new DisposableStore());
    const render = /* @__PURE__ */ __name(() => {
      dom.clearNode(this.domNode);
      partStore.clear();
      this.subPart = partStore.add(instantiationService.createInstance(ChatToolInvocationSubPart, toolInvocation, context, renderer, listPool, editorPool, currentWidthDelegate, codeBlockModelCollection, codeBlockStartIndex));
      this.domNode.appendChild(this.subPart.domNode);
      partStore.add(this.subPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
      partStore.add(this.subPart.onNeedsRerender(() => {
        render();
        this._onDidChangeHeight.fire();
      }));
    }, "render");
    render();
  }
  static {
    __name(this, "ChatToolInvocationPart");
  }
  domNode;
  _onDidChangeHeight = this._register(new Emitter());
  onDidChangeHeight = this._onDidChangeHeight.event;
  get codeblocks() {
    return this.subPart?.codeblocks ?? [];
  }
  get codeblocksPartId() {
    return this.subPart?.codeblocksPartId;
  }
  subPart;
  hasSameContent(other, followingContent, element) {
    return (other.kind === "toolInvocation" || other.kind === "toolInvocationSerialized") && this.toolInvocation.toolCallId === other.toolCallId;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatToolInvocationPart = __decorateClass([
  __decorateParam(8, IInstantiationService)
], ChatToolInvocationPart);
let ChatToolInvocationSubPart = class extends Disposable {
  constructor(toolInvocation, context, renderer, listPool, editorPool, currentWidthDelegate, codeBlockModelCollection, codeBlockStartIndex, instantiationService, keybindingService, modelService, languageService, contextKeyService, languageModelToolsService, commandService, markerService) {
    super();
    this.toolInvocation = toolInvocation;
    this.context = context;
    this.renderer = renderer;
    this.listPool = listPool;
    this.editorPool = editorPool;
    this.currentWidthDelegate = currentWidthDelegate;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.codeBlockStartIndex = codeBlockStartIndex;
    this.instantiationService = instantiationService;
    this.keybindingService = keybindingService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.contextKeyService = contextKeyService;
    this.languageModelToolsService = languageModelToolsService;
    this.commandService = commandService;
    this.markerService = markerService;
    if (toolInvocation.kind === "toolInvocation" && toolInvocation.confirmationMessages) {
      if (toolInvocation.toolSpecificData?.kind === "terminal") {
        this.domNode = this.createTerminalConfirmationWidget(toolInvocation, toolInvocation.toolSpecificData);
      } else {
        this.domNode = this.createConfirmationWidget(toolInvocation);
      }
    } else if (toolInvocation.toolSpecificData?.kind === "terminal") {
      this.domNode = this.createTerminalMarkdownProgressPart(toolInvocation, toolInvocation.toolSpecificData);
    } else if (Array.isArray(toolInvocation.resultDetails) && toolInvocation.resultDetails?.length) {
      this.domNode = this.createResultList(toolInvocation.pastTenseMessage ?? toolInvocation.invocationMessage, toolInvocation.resultDetails);
    } else if (isToolResultInputOutputDetails(toolInvocation.resultDetails)) {
      this.domNode = this.createInputOutputMarkdownProgressPart(toolInvocation.pastTenseMessage ?? toolInvocation.invocationMessage, toolInvocation.resultDetails);
    } else {
      this.domNode = this.createProgressPart();
    }
    if (toolInvocation.kind === "toolInvocation" && !toolInvocation.isComplete) {
      toolInvocation.isCompletePromise.then(() => this._onNeedsRerender.fire());
    }
  }
  static {
    __name(this, "ChatToolInvocationSubPart");
  }
  static idPool = 0;
  _codeblocksPartId = "tool-" + ChatToolInvocationSubPart.idPool++;
  domNode;
  _onNeedsRerender = this._register(new Emitter());
  onNeedsRerender = this._onNeedsRerender.event;
  _onDidChangeHeight = this._register(new Emitter());
  onDidChangeHeight = this._onDidChangeHeight.event;
  markdownPart;
  _codeblocks = [];
  get codeblocks() {
    return this.markdownPart?.codeblocks ?? this._codeblocks;
  }
  get codeblocksPartId() {
    return this.markdownPart?.codeblocksPartId ?? this._codeblocksPartId;
  }
  createConfirmationWidget(toolInvocation) {
    if (!toolInvocation.confirmationMessages) {
      throw new Error("Confirmation messages are missing");
    }
    const title = toolInvocation.confirmationMessages.title;
    const message = toolInvocation.confirmationMessages.message;
    const allowAutoConfirm = toolInvocation.confirmationMessages.allowAutoConfirm;
    const continueLabel = localize("continue", "Continue");
    const continueKeybinding = this.keybindingService.lookupKeybinding(AcceptToolConfirmationActionId)?.getLabel();
    const continueTooltip = continueKeybinding ? `${continueLabel} (${continueKeybinding})` : continueLabel;
    const cancelLabel = localize("cancel", "Cancel");
    const cancelKeybinding = this.keybindingService.lookupKeybinding(CancelChatActionId)?.getLabel();
    const cancelTooltip = cancelKeybinding ? `${cancelLabel} (${cancelKeybinding})` : cancelLabel;
    let ConfirmationOutcome;
    ((ConfirmationOutcome2) => {
      ConfirmationOutcome2[ConfirmationOutcome2["Allow"] = 0] = "Allow";
      ConfirmationOutcome2[ConfirmationOutcome2["Disallow"] = 1] = "Disallow";
      ConfirmationOutcome2[ConfirmationOutcome2["AllowWorkspace"] = 2] = "AllowWorkspace";
      ConfirmationOutcome2[ConfirmationOutcome2["AllowGlobally"] = 3] = "AllowGlobally";
      ConfirmationOutcome2[ConfirmationOutcome2["AllowSession"] = 4] = "AllowSession";
    })(ConfirmationOutcome || (ConfirmationOutcome = {}));
    const buttons = [
      {
        label: continueLabel,
        data: 0 /* Allow */,
        tooltip: continueTooltip,
        moreActions: !allowAutoConfirm ? void 0 : [
          { label: localize("allowSession", "Allow in this Session"), data: 4 /* AllowSession */, tooltip: localize("allowSesssionTooltip", "Allow this tool to run in this session without confirmation.") },
          { label: localize("allowWorkspace", "Allow in this Workspace"), data: 2 /* AllowWorkspace */, tooltip: localize("allowWorkspaceTooltip", "Allow this tool to run in this workspace without confirmation.") },
          { label: localize("allowGlobally", "Always Allow"), data: 3 /* AllowGlobally */, tooltip: localize("allowGloballTooltip", "Always allow this tool to run without confirmation.") }
        ]
      },
      {
        label: localize("cancel", "Cancel"),
        data: 1 /* Disallow */,
        isSecondary: true,
        tooltip: cancelTooltip
      }
    ];
    let confirmWidget;
    if (typeof message === "string") {
      confirmWidget = this._register(this.instantiationService.createInstance(
        ChatConfirmationWidget,
        title,
        message,
        buttons
      ));
    } else {
      const chatMarkdownContent = {
        kind: "markdownContent",
        content: message
      };
      const codeBlockRenderOptions = {
        hideToolbar: true,
        reserveWidth: 19,
        verticalPadding: 5,
        editorOptions: {
          wordWrap: "on"
        }
      };
      const elements = dom.h("div", [
        dom.h(".message@message"),
        dom.h(".editor@editor")
      ]);
      if (toolInvocation.toolSpecificData?.kind === "input") {
        const inputData = toolInvocation.toolSpecificData;
        const codeBlockRenderOptions2 = {
          hideToolbar: true,
          reserveWidth: 19,
          maxHeightInLines: 13,
          verticalPadding: 5,
          editorOptions: {
            wordWrap: "on",
            readOnly: false
          }
        };
        const langId = this.languageService.getLanguageIdByLanguageName("json");
        const model = this._register(this.modelService.createModel(
          JSON.stringify(inputData.rawInput ?? {}, void 0, 2),
          this.languageService.createById(langId),
          createToolInputUri(toolInvocation.toolId)
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
          textModel: Promise.resolve(model)
        }, this.currentWidthDelegate());
        this._codeblocks.push({
          codeBlockIndex: this.codeBlockStartIndex,
          codemapperUri: void 0,
          elementId: this.context.element.id,
          focus: /* @__PURE__ */ __name(() => editor.object.focus(), "focus"),
          isStreaming: false,
          ownerMarkdownPartId: this.codeblocksPartId,
          uri: model.uri,
          uriPromise: Promise.resolve(model.uri)
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
      }
      this.markdownPart = this._register(this.instantiationService.createInstance(ChatMarkdownContentPart, chatMarkdownContent, this.context, this.editorPool, false, this.codeBlockStartIndex, this.renderer, this.currentWidthDelegate(), this.codeBlockModelCollection, { codeBlockRenderOptions }));
      elements.message.append(this.markdownPart.domNode);
      this._register(this.markdownPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
      confirmWidget = this._register(this.instantiationService.createInstance(
        ChatCustomConfirmationWidget,
        title,
        elements.root,
        toolInvocation.toolSpecificData?.kind === "input",
        buttons
      ));
    }
    const hasToolConfirmation = ChatContextKeys.Editing.hasToolConfirmation.bindTo(this.contextKeyService);
    hasToolConfirmation.set(true);
    this._register(confirmWidget.onDidClick((button) => {
      switch (button.data) {
        case 3 /* AllowGlobally */:
          this.languageModelToolsService.setToolAutoConfirmation(toolInvocation.toolId, "profile", true);
          toolInvocation.confirmed.complete(true);
          break;
        case 2 /* AllowWorkspace */:
          this.languageModelToolsService.setToolAutoConfirmation(toolInvocation.toolId, "workspace", true);
          toolInvocation.confirmed.complete(true);
          break;
        case 4 /* AllowSession */:
          this.languageModelToolsService.setToolAutoConfirmation(toolInvocation.toolId, "memory", true);
          toolInvocation.confirmed.complete(true);
          break;
        case 0 /* Allow */:
          toolInvocation.confirmed.complete(true);
          break;
        case 1 /* Disallow */:
          toolInvocation.confirmed.complete(false);
          break;
      }
    }));
    this._register(confirmWidget.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    this._register(toDisposable(() => hasToolConfirmation.reset()));
    toolInvocation.confirmed.p.then(() => {
      hasToolConfirmation.reset();
      this._onNeedsRerender.fire();
    });
    return confirmWidget.domNode;
  }
  createTerminalConfirmationWidget(toolInvocation, terminalData) {
    if (!toolInvocation.confirmationMessages) {
      throw new Error("Confirmation messages are missing");
    }
    const title = toolInvocation.confirmationMessages.title;
    const message = toolInvocation.confirmationMessages.message;
    const continueLabel = localize("continue", "Continue");
    const continueKeybinding = this.keybindingService.lookupKeybinding(AcceptToolConfirmationActionId)?.getLabel();
    const continueTooltip = continueKeybinding ? `${continueLabel} (${continueKeybinding})` : continueLabel;
    const cancelLabel = localize("cancel", "Cancel");
    const cancelKeybinding = this.keybindingService.lookupKeybinding(CancelChatActionId)?.getLabel();
    const cancelTooltip = cancelKeybinding ? `${cancelLabel} (${cancelKeybinding})` : cancelLabel;
    const buttons = [
      {
        label: continueLabel,
        data: true,
        tooltip: continueTooltip
      },
      {
        label: cancelLabel,
        data: false,
        isSecondary: true,
        tooltip: cancelTooltip
      }
    ];
    const renderedMessage = this._register(this.renderer.render(
      typeof message === "string" ? new MarkdownString(message) : message,
      { asyncRenderCallback: /* @__PURE__ */ __name(() => this._onDidChangeHeight.fire(), "asyncRenderCallback") }
    ));
    const codeBlockRenderOptions = {
      hideToolbar: true,
      reserveWidth: 19,
      verticalPadding: 5,
      editorOptions: {
        wordWrap: "on",
        readOnly: false
      }
    };
    const langId = this.languageService.getLanguageIdByLanguageName(terminalData.language ?? "sh") ?? "shellscript";
    const model = this.modelService.createModel(terminalData.command, this.languageService.createById(langId));
    const editor = this._register(this.editorPool.get());
    editor.object.render({
      codeBlockIndex: this.codeBlockStartIndex,
      codeBlockPartIndex: 0,
      element: this.context.element,
      languageId: langId,
      renderOptions: codeBlockRenderOptions,
      textModel: Promise.resolve(model)
    }, this.currentWidthDelegate());
    this._codeblocks.push({
      codeBlockIndex: this.codeBlockStartIndex,
      codemapperUri: void 0,
      elementId: this.context.element.id,
      focus: /* @__PURE__ */ __name(() => editor.object.focus(), "focus"),
      isStreaming: false,
      ownerMarkdownPartId: this.codeblocksPartId,
      uri: model.uri,
      uriPromise: Promise.resolve(model.uri)
    });
    this._register(editor.object.onDidChangeContentHeight(() => {
      editor.object.layout(this.currentWidthDelegate());
      this._onDidChangeHeight.fire();
    }));
    this._register(model.onDidChangeContent((e) => {
      terminalData.command = model.getValue();
    }));
    const element = dom.$("");
    dom.append(element, editor.object.element);
    dom.append(element, renderedMessage.element);
    const confirmWidget = this._register(this.instantiationService.createInstance(
      ChatCustomConfirmationWidget,
      title,
      element,
      false,
      buttons
    ));
    ChatContextKeys.Editing.hasToolConfirmation.bindTo(this.contextKeyService).set(true);
    this._register(confirmWidget.onDidClick((button) => {
      toolInvocation.confirmed.complete(button.data);
    }));
    this._register(confirmWidget.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    toolInvocation.confirmed.p.then(() => {
      ChatContextKeys.Editing.hasToolConfirmation.bindTo(this.contextKeyService).set(false);
      this._onNeedsRerender.fire();
    });
    return confirmWidget.domNode;
  }
  createProgressPart() {
    let content;
    if (this.toolInvocation.isComplete && this.toolInvocation.isConfirmed !== false && this.toolInvocation.pastTenseMessage) {
      content = typeof this.toolInvocation.pastTenseMessage === "string" ? new MarkdownString().appendText(this.toolInvocation.pastTenseMessage) : this.toolInvocation.pastTenseMessage;
    } else {
      content = typeof this.toolInvocation.invocationMessage === "string" ? new MarkdownString().appendText(this.toolInvocation.invocationMessage + "\u2026") : MarkdownString.lift(this.toolInvocation.invocationMessage).appendText("\u2026");
    }
    const progressMessage = {
      kind: "progressMessage",
      content
    };
    const iconOverride = !this.toolInvocation.isConfirmed ? Codicon.error : this.toolInvocation.isComplete ? Codicon.check : void 0;
    const progressPart = this._register(this.instantiationService.createInstance(ChatProgressContentPart, progressMessage, this.renderer, this.context, void 0, true, iconOverride));
    return progressPart.domNode;
  }
  createTerminalMarkdownProgressPart(toolInvocation, terminalData) {
    const content = new MarkdownString(`\`\`\`${terminalData.language}
${terminalData.command}
\`\`\``);
    const chatMarkdownContent = {
      kind: "markdownContent",
      content
    };
    const codeBlockRenderOptions = {
      hideToolbar: true,
      reserveWidth: 19,
      verticalPadding: 5,
      editorOptions: {
        wordWrap: "on"
      }
    };
    this.markdownPart = this._register(this.instantiationService.createInstance(ChatMarkdownContentPart, chatMarkdownContent, this.context, this.editorPool, false, this.codeBlockStartIndex, this.renderer, this.currentWidthDelegate(), this.codeBlockModelCollection, { codeBlockRenderOptions }));
    this._register(this.markdownPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    const icon = !this.toolInvocation.isConfirmed ? Codicon.error : this.toolInvocation.isComplete ? Codicon.check : ThemeIcon.modify(Codicon.loading, "spin");
    const progressPart = this.instantiationService.createInstance(ChatCustomProgressPart, this.markdownPart.domNode, icon);
    return progressPart.domNode;
  }
  createInputOutputMarkdownProgressPart(message, inputOutputData) {
    const model = this._register(this.modelService.createModel(
      `${inputOutputData.input}

${inputOutputData.output}`,
      this.languageService.createById("json")
    ));
    const collapsibleListPart = this._register(this.instantiationService.createInstance(
      ChatCollapsibleEditorContentPart,
      message,
      this.context,
      this.editorPool,
      Promise.resolve(model),
      model.getLanguageId(),
      {
        hideToolbar: true,
        reserveWidth: 19,
        maxHeightInLines: 13,
        verticalPadding: 5,
        editorOptions: {
          wordWrap: "on"
        }
      },
      {
        codeBlockIndex: this.codeBlockStartIndex,
        codemapperUri: void 0,
        elementId: this.context.element.id,
        focus: /* @__PURE__ */ __name(() => {
        }, "focus"),
        isStreaming: false,
        ownerMarkdownPartId: this.codeblocksPartId,
        uri: model.uri,
        uriPromise: Promise.resolve(model.uri)
      }
    ));
    this._register(collapsibleListPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    return collapsibleListPart.domNode;
  }
  createResultList(message, toolDetails) {
    const collapsibleListPart = this._register(this.instantiationService.createInstance(
      ChatCollapsibleListContentPart,
      toolDetails.map((detail) => ({
        kind: "reference",
        reference: detail
      })),
      message,
      this.context,
      this.listPool
    ));
    this._register(collapsibleListPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    return collapsibleListPart.domNode;
  }
};
ChatToolInvocationSubPart = __decorateClass([
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, IModelService),
  __decorateParam(11, ILanguageService),
  __decorateParam(12, IContextKeyService),
  __decorateParam(13, ILanguageModelToolsService),
  __decorateParam(14, ICommandService),
  __decorateParam(15, IMarkerService)
], ChatToolInvocationSubPart);
export {
  ChatToolInvocationPart
};
//# sourceMappingURL=chatToolInvocationPart.js.map
