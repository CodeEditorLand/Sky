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
var ChatToolInvocationSubPart_1;
import * as dom from "../../../../../base/browser/dom.js";
import { assertNever } from "../../../../../base/common/assert.js";
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { decodeBase64 } from "../../../../../base/common/buffer.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, thenIfNotDisposed, toDisposable } from "../../../../../base/common/lifecycle.js";
import { autorunWithStore } from "../../../../../base/common/observable.js";
import { count } from "../../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { isEmptyObject } from "../../../../../base/common/types.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { IMarkerService, MarkerSeverity } from "../../../../../platform/markers/common/markers.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { createToolInputUri, createToolSchemaUri, ILanguageModelToolsService, isToolResultInputOutputDetails } from "../../common/languageModelToolsService.js";
import { CancelChatActionId } from "../actions/chatExecuteActions.js";
import { AcceptToolConfirmationActionId } from "../actions/chatToolActions.js";
import { getAttachableImageExtension } from "../chatAttachmentResolve.js";
import { ChatConfirmationWidget, ChatCustomConfirmationWidget } from "./chatConfirmationWidget.js";
import { ChatMarkdownContentPart } from "./chatMarkdownContentPart.js";
import { ChatCustomProgressPart, ChatProgressContentPart } from "./chatProgressContentPart.js";
import { ChatCollapsibleListContentPart } from "./chatReferencesContentPart.js";
import { ChatCollapsibleInputOutputContentPart } from "./chatToolInputOutputContentPart.js";
let ChatToolInvocationPart = class ChatToolInvocationPart2 extends Disposable {
  static {
    __name(this, "ChatToolInvocationPart");
  }
  get codeblocks() {
    return this.subPart?.codeblocks ?? [];
  }
  get codeblocksPartId() {
    return this.subPart?.codeblocksPartId;
  }
  constructor(toolInvocation, context, renderer, listPool, editorPool, currentWidthDelegate, codeBlockModelCollection, codeBlockStartIndex, instantiationService) {
    super();
    this.toolInvocation = toolInvocation;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
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
  hasSameContent(other, followingContent, element) {
    return (other.kind === "toolInvocation" || other.kind === "toolInvocationSerialized") && this.toolInvocation.toolCallId === other.toolCallId;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatToolInvocationPart = __decorate([
  __param(8, IInstantiationService)
], ChatToolInvocationPart);
let ChatToolInvocationSubPart = class ChatToolInvocationSubPart2 extends Disposable {
  static {
    __name(this, "ChatToolInvocationSubPart");
  }
  static {
    ChatToolInvocationSubPart_1 = this;
  }
  static {
    this.idPool = 0;
  }
  static {
    this._expandedByDefault = /* @__PURE__ */ new WeakMap();
  }
  get codeblocks() {
    return this.markdownPart?.codeblocks ?? this._codeblocks;
  }
  get codeblocksPartId() {
    return this.markdownPart?.codeblocksPartId ?? this._codeblocksPartId;
  }
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
    this._codeblocksPartId = "tool-" + ChatToolInvocationSubPart_1.idPool++;
    this._onNeedsRerender = this._register(new Emitter());
    this.onNeedsRerender = this._onNeedsRerender.event;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._codeblocks = [];
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
      this.domNode = this.createInputOutputMarkdownProgressPart(toolInvocation.pastTenseMessage ?? toolInvocation.invocationMessage, toolInvocation.originMessage, toolInvocation.resultDetails.input, toolInvocation.resultDetails.output, !!toolInvocation.resultDetails.isError);
    } else if (toolInvocation.kind === "toolInvocation" && toolInvocation.toolSpecificData?.kind === "input" && !toolInvocation.isComplete) {
      this.domNode = this.createInputOutputMarkdownProgressPart(this.toolInvocation.invocationMessage, toolInvocation.originMessage, typeof toolInvocation.toolSpecificData.rawInput === "string" ? toolInvocation.toolSpecificData.rawInput : JSON.stringify(toolInvocation.toolSpecificData.rawInput, null, 2), void 0, false);
    } else {
      this.domNode = this.createProgressPart();
    }
    if (toolInvocation.kind === "toolInvocation" && !toolInvocation.isComplete) {
      toolInvocation.isCompletePromise.then(() => this._onNeedsRerender.fire());
    }
  }
  createConfirmationWidget(toolInvocation) {
    if (!toolInvocation.confirmationMessages) {
      throw new Error("Confirmation messages are missing");
    }
    const { title, message, allowAutoConfirm } = toolInvocation.confirmationMessages;
    const continueLabel = localize("continue", "Continue");
    const continueKeybinding = this.keybindingService.lookupKeybinding(AcceptToolConfirmationActionId)?.getLabel();
    const continueTooltip = continueKeybinding ? `${continueLabel} (${continueKeybinding})` : continueLabel;
    const cancelLabel = localize("cancel", "Cancel");
    const cancelKeybinding = this.keybindingService.lookupKeybinding(CancelChatActionId)?.getLabel();
    const cancelTooltip = cancelKeybinding ? `${cancelLabel} (${cancelKeybinding})` : cancelLabel;
    let ConfirmationOutcome;
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
      confirmWidget = this._register(this.instantiationService.createInstance(ChatConfirmationWidget, title, toolInvocation.originMessage, message, buttons));
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
      if (toolInvocation.toolSpecificData?.kind === "input" && toolInvocation.toolSpecificData.rawInput && !isEmptyObject(toolInvocation.toolSpecificData.rawInput)) {
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
        const rawJsonInput = JSON.stringify(inputData.rawInput ?? {}, null, 1);
        const canSeeMore = count(rawJsonInput, "\n") > 2;
        const model = this._register(this.modelService.createModel(
          // View a single JSON line by default until they 'see more'
          rawJsonInput.replace(/\n */g, " "),
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
          textModel: Promise.resolve(model),
          chatSessionId: this.context.element.sessionId
        }, this.currentWidthDelegate());
        this._codeblocks.push({
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
            } catch {
            }
            seeMore.root.remove();
          }));
          elements.editor.append(seeMore.root);
        }
      }
      this.markdownPart = this._register(this.instantiationService.createInstance(ChatMarkdownContentPart, chatMarkdownContent, this.context, this.editorPool, false, this.codeBlockStartIndex, this.renderer, this.currentWidthDelegate(), this.codeBlockModelCollection, { codeBlockRenderOptions }));
      elements.message.append(this.markdownPart.domNode);
      this._register(this.markdownPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
      confirmWidget = this._register(this.instantiationService.createInstance(ChatCustomConfirmationWidget, title, toolInvocation.originMessage, elements.root, buttons));
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
    const renderedMessage = this._register(this.renderer.render(typeof message === "string" ? new MarkdownString(message) : message, { asyncRenderCallback: /* @__PURE__ */ __name(() => this._onDidChangeHeight.fire(), "asyncRenderCallback") }));
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
    const renderPromise = editor.object.render({
      codeBlockIndex: this.codeBlockStartIndex,
      codeBlockPartIndex: 0,
      element: this.context.element,
      languageId: langId,
      renderOptions: codeBlockRenderOptions,
      textModel: Promise.resolve(model),
      chatSessionId: this.context.element.sessionId
    }, this.currentWidthDelegate());
    this._register(thenIfNotDisposed(renderPromise, () => this._onDidChangeHeight.fire()));
    this._codeblocks.push({
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
      terminalData.command = model.getValue();
    }));
    const element = dom.$("");
    dom.append(element, editor.object.element);
    dom.append(element, renderedMessage.element);
    const confirmWidget = this._register(this.instantiationService.createInstance(ChatCustomConfirmationWidget, title, void 0, element, buttons));
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
    if (this.toolInvocation.isComplete && this.toolInvocation.isConfirmed !== false && this.toolInvocation.pastTenseMessage) {
      const part = this.renderProgressContent(this.toolInvocation.pastTenseMessage);
      this._register(part);
      return part.domNode;
    } else {
      const container = document.createElement("div");
      const progressObservable = this.toolInvocation.kind === "toolInvocation" ? this.toolInvocation.progress : void 0;
      this._register(autorunWithStore((reader, store) => {
        const progress = progressObservable?.read(reader);
        const part = store.add(this.renderProgressContent(progress?.message || this.toolInvocation.invocationMessage));
        dom.reset(container, part.domNode);
      }));
      return container;
    }
  }
  renderProgressContent(content) {
    if (typeof content === "string") {
      content = new MarkdownString().appendText(content);
    }
    const progressMessage = {
      kind: "progressMessage",
      content
    };
    const iconOverride = !this.toolInvocation.isConfirmed ? Codicon.error : this.toolInvocation.isComplete ? Codicon.check : void 0;
    return this.instantiationService.createInstance(ChatProgressContentPart, progressMessage, this.renderer, this.context, void 0, true, iconOverride);
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
  createInputOutputMarkdownProgressPart(message, subtitle, input, output, isError) {
    let codeBlockIndex = this.codeBlockStartIndex;
    const toCodePart = /* @__PURE__ */ __name((data) => {
      const model = this._register(this.modelService.createModel(data, this.languageService.createById("json")));
      return {
        kind: "code",
        textModel: model,
        languageId: model.getLanguageId(),
        options: {
          hideToolbar: true,
          reserveWidth: 19,
          maxHeightInLines: 13,
          verticalPadding: 5,
          editorOptions: {
            wordWrap: "on"
          }
        },
        codeBlockInfo: {
          codeBlockIndex: codeBlockIndex++,
          codemapperUri: void 0,
          elementId: this.context.element.id,
          focus: /* @__PURE__ */ __name(() => {
          }, "focus"),
          isStreaming: false,
          ownerMarkdownPartId: this.codeblocksPartId,
          uri: model.uri,
          chatSessionId: this.context.element.sessionId,
          uriPromise: Promise.resolve(model.uri)
        }
      };
    }, "toCodePart");
    if (typeof output === "string") {
      output = [{ type: "text", value: output }];
    }
    const collapsibleListPart = this._register(this.instantiationService.createInstance(ChatCollapsibleInputOutputContentPart, message, subtitle, this.context, this.editorPool, toCodePart(input), output && {
      parts: output.map((o) => {
        if (o.type === "data") {
          const decoded = decodeBase64(o.value64).buffer;
          if (getAttachableImageExtension(o.mimeType)) {
            return { kind: "data", value: decoded, mimeType: o.mimeType };
          } else {
            return toCodePart(localize("toolResultData", "Data of type {0} ({1} bytes)", o.mimeType, decoded.byteLength));
          }
        } else if (o.type === "text") {
          return toCodePart(o.value);
        } else {
          assertNever(o);
        }
      })
    }, isError, ChatToolInvocationSubPart_1._expandedByDefault.get(this.toolInvocation) ?? false));
    this._codeblocks.push(...collapsibleListPart.codeblocks);
    this._register(collapsibleListPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    this._register(toDisposable(() => ChatToolInvocationSubPart_1._expandedByDefault.set(this.toolInvocation, collapsibleListPart.expanded)));
    const progressObservable = this.toolInvocation.kind === "toolInvocation" ? this.toolInvocation.progress : void 0;
    if (progressObservable) {
      this._register(autorunWithStore((reader, store) => {
        const progress = progressObservable?.read(reader);
        if (progress.message) {
          collapsibleListPart.title = progress.message;
        }
      }));
    }
    return collapsibleListPart.domNode;
  }
  createResultList(message, toolDetails) {
    const collapsibleListPart = this._register(this.instantiationService.createInstance(ChatCollapsibleListContentPart, toolDetails.map((detail) => ({
      kind: "reference",
      reference: detail
    })), message, this.context, this.listPool));
    this._register(collapsibleListPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    return collapsibleListPart.domNode;
  }
};
ChatToolInvocationSubPart = ChatToolInvocationSubPart_1 = __decorate([
  __param(8, IInstantiationService),
  __param(9, IKeybindingService),
  __param(10, IModelService),
  __param(11, ILanguageService),
  __param(12, IContextKeyService),
  __param(13, ILanguageModelToolsService),
  __param(14, ICommandService),
  __param(15, IMarkerService)
], ChatToolInvocationSubPart);
export {
  ChatToolInvocationPart
};
//# sourceMappingURL=chatToolInvocationPart.js.map
