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
import "./emptyTextEditorHint.css";
import * as dom from "../../../../../base/browser/dom.js";
import { DisposableStore, dispose, IDisposable } from "../../../../../base/common/lifecycle.js";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from "../../../../../editor/browser/editorBrowser.js";
import { localize } from "../../../../../nls.js";
import { ChangeLanguageAction } from "../../../../browser/parts/editor/editorStatus.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../../editor/common/languages/modesRegistry.js";
import { IEditorContribution } from "../../../../../editor/common/editorCommon.js";
import { Schemas } from "../../../../../base/common/network.js";
import { Event } from "../../../../../base/common/event.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ConfigurationChangedEvent, EditorOption } from "../../../../../editor/common/config/editorOptions.js";
import { EditorContributionInstantiation, registerEditorContribution } from "../../../../../editor/browser/editorExtensions.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IContentActionHandler, renderFormattedText } from "../../../../../base/browser/formattedTextRenderer.js";
import { ApplyFileSnippetAction } from "../../../snippets/browser/commands/fileTemplateSnippets.js";
import { IInlineChatSessionService } from "../../../inlineChat/browser/inlineChatSessionService.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { WorkbenchActionExecutedClassification, WorkbenchActionExecutedEvent } from "../../../../../base/common/actions.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { KeybindingLabel } from "../../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { OS } from "../../../../../base/common/platform.js";
import { status } from "../../../../../base/browser/ui/aria/aria.js";
import { AccessibilityVerbositySettingId } from "../../../accessibility/browser/accessibilityConfiguration.js";
import { LOG_MODE_ID, OUTPUT_MODE_ID } from "../../../../services/output/common/output.js";
import { SEARCH_RESULT_LANGUAGE_ID } from "../../../../services/search/common/search.js";
import { getDefaultHoverDelegate } from "../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IChatAgent, IChatAgentService } from "../../../chat/common/chatAgents.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { StandardMouseEvent } from "../../../../../base/browser/mouseEvent.js";
import { ChatAgentLocation } from "../../../chat/common/constants.js";
const $ = dom.$;
const emptyTextEditorHintSetting = "workbench.editor.empty.hint";
let EmptyTextEditorHintContribution = class {
  constructor(editor, editorGroupsService, commandService, configurationService, hoverService, keybindingService, inlineChatSessionService, chatAgentService, telemetryService, productService, contextMenuService) {
    this.editor = editor;
    this.editorGroupsService = editorGroupsService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.keybindingService = keybindingService;
    this.inlineChatSessionService = inlineChatSessionService;
    this.chatAgentService = chatAgentService;
    this.telemetryService = telemetryService;
    this.productService = productService;
    this.contextMenuService = contextMenuService;
    this.toDispose = [];
    this.toDispose.push(this.editor.onDidChangeModel(() => this.update()));
    this.toDispose.push(this.editor.onDidChangeModelLanguage(() => this.update()));
    this.toDispose.push(this.editor.onDidChangeModelContent(() => this.update()));
    this.toDispose.push(this.chatAgentService.onDidChangeAgents(() => this.update()));
    this.toDispose.push(this.editor.onDidChangeModelDecorations(() => this.update()));
    this.toDispose.push(this.editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.readOnly)) {
        this.update();
      }
    }));
    this.toDispose.push(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(emptyTextEditorHintSetting)) {
        this.update();
      }
    }));
    this.toDispose.push(inlineChatSessionService.onWillStartSession((editor2) => {
      if (this.editor === editor2) {
        this.textHintContentWidget?.dispose();
      }
    }));
    this.toDispose.push(inlineChatSessionService.onDidEndSession((e) => {
      if (this.editor === e.editor) {
        this.update();
      }
    }));
  }
  static {
    __name(this, "EmptyTextEditorHintContribution");
  }
  static ID = "editor.contrib.emptyTextEditorHint";
  toDispose;
  textHintContentWidget;
  _getOptions() {
    return { clickable: true };
  }
  _shouldRenderHint() {
    const configValue = this.configurationService.getValue(emptyTextEditorHintSetting);
    if (configValue === "hidden") {
      return false;
    }
    if (this.editor.getOption(EditorOption.readOnly)) {
      return false;
    }
    const model = this.editor.getModel();
    const languageId = model?.getLanguageId();
    if (!model || languageId === OUTPUT_MODE_ID || languageId === LOG_MODE_ID || languageId === SEARCH_RESULT_LANGUAGE_ID) {
      return false;
    }
    if (this.inlineChatSessionService.getSession(this.editor, model.uri)) {
      return false;
    }
    if (this.editor.getModel()?.getValueLength()) {
      return false;
    }
    const hasConflictingDecorations = Boolean(this.editor.getLineDecorations(1)?.find(
      (d) => d.options.beforeContentClassName || d.options.afterContentClassName || d.options.before?.content || d.options.after?.content
    ));
    if (hasConflictingDecorations) {
      return false;
    }
    const hasEditorAgents = Boolean(this.chatAgentService.getDefaultAgent(ChatAgentLocation.Editor));
    const shouldRenderDefaultHint = model?.uri.scheme === Schemas.untitled && languageId === PLAINTEXT_LANGUAGE_ID;
    return hasEditorAgents || shouldRenderDefaultHint;
  }
  update() {
    const shouldRenderHint = this._shouldRenderHint();
    if (shouldRenderHint && !this.textHintContentWidget) {
      this.textHintContentWidget = new EmptyTextEditorHintContentWidget(
        this.editor,
        this._getOptions(),
        this.editorGroupsService,
        this.commandService,
        this.configurationService,
        this.hoverService,
        this.keybindingService,
        this.chatAgentService,
        this.telemetryService,
        this.productService,
        this.contextMenuService
      );
    } else if (!shouldRenderHint && this.textHintContentWidget) {
      this.textHintContentWidget.dispose();
      this.textHintContentWidget = void 0;
    }
  }
  dispose() {
    dispose(this.toDispose);
    this.textHintContentWidget?.dispose();
  }
};
EmptyTextEditorHintContribution = __decorateClass([
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IInlineChatSessionService),
  __decorateParam(7, IChatAgentService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IProductService),
  __decorateParam(10, IContextMenuService)
], EmptyTextEditorHintContribution);
class EmptyTextEditorHintContentWidget {
  constructor(editor, options, editorGroupsService, commandService, configurationService, hoverService, keybindingService, chatAgentService, telemetryService, productService, contextMenuService) {
    this.editor = editor;
    this.options = options;
    this.editorGroupsService = editorGroupsService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.keybindingService = keybindingService;
    this.chatAgentService = chatAgentService;
    this.telemetryService = telemetryService;
    this.productService = productService;
    this.contextMenuService = contextMenuService;
    this.toDispose = new DisposableStore();
    this.toDispose.add(this.editor.onDidChangeConfiguration((e) => {
      if (this.domNode && e.hasChanged(EditorOption.fontInfo)) {
        this.editor.applyFontInfo(this.domNode);
      }
    }));
    const onDidFocusEditorText = Event.debounce(this.editor.onDidFocusEditorText, () => void 0, 500);
    this.toDispose.add(onDidFocusEditorText(() => {
      if (this.editor.hasTextFocus() && this.isVisible && this.ariaLabel && this.configurationService.getValue(AccessibilityVerbositySettingId.EmptyEditorHint)) {
        status(this.ariaLabel);
      }
    }));
    this.editor.addContentWidget(this);
  }
  static {
    __name(this, "EmptyTextEditorHintContentWidget");
  }
  static ID = "editor.widget.emptyHint";
  domNode;
  toDispose;
  isVisible = false;
  ariaLabel = "";
  getId() {
    return EmptyTextEditorHintContentWidget.ID;
  }
  _disableHint(e) {
    const disableHint = /* @__PURE__ */ __name(() => {
      this.configurationService.updateValue(emptyTextEditorHintSetting, "hidden");
      this.dispose();
      this.editor.focus();
    }, "disableHint");
    if (!e) {
      disableHint();
      return;
    }
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => {
        return new StandardMouseEvent(dom.getActiveWindow(), e);
      }, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => {
        return [
          {
            id: "workench.action.disableEmptyEditorHint",
            label: localize("disableEditorEmptyHint", "Disable Empty Editor Hint"),
            tooltip: localize("disableEditorEmptyHint", "Disable Empty Editor Hint"),
            enabled: true,
            class: void 0,
            run: /* @__PURE__ */ __name(() => {
              disableHint();
            }, "run")
          }
        ];
      }, "getActions")
    });
  }
  _getHintInlineChat(providers) {
    const providerName = (providers.length === 1 ? providers[0].fullName : void 0) ?? this.productService.nameShort;
    const inlineChatId = "inlineChat.start";
    let ariaLabel = `Ask ${providerName} something or start typing to dismiss.`;
    const handleClick = /* @__PURE__ */ __name(() => {
      this.telemetryService.publicLog2("workbenchActionExecuted", {
        id: "inlineChat.hintAction",
        from: "hint"
      });
      this.commandService.executeCommand(inlineChatId, { from: "hint" });
    }, "handleClick");
    const hintHandler = {
      disposables: this.toDispose,
      callback: /* @__PURE__ */ __name((index, _event) => {
        switch (index) {
          case "0":
            handleClick();
            break;
        }
      }, "callback")
    };
    const hintElement = $("empty-hint-text");
    hintElement.style.display = "block";
    const keybindingHint = this.keybindingService.lookupKeybinding(inlineChatId);
    const keybindingHintLabel = keybindingHint?.getLabel();
    if (keybindingHint && keybindingHintLabel) {
      const actionPart = localize("emptyHintText", "Press {0} to ask {1} to do something. ", keybindingHintLabel, providerName);
      const [before, after] = actionPart.split(keybindingHintLabel).map((fragment) => {
        if (this.options.clickable) {
          const hintPart = $("a", void 0, fragment);
          hintPart.style.fontStyle = "italic";
          hintPart.style.cursor = "pointer";
          this.toDispose.add(dom.addDisposableListener(hintPart, dom.EventType.CONTEXT_MENU, (e) => this._disableHint(e)));
          this.toDispose.add(dom.addDisposableListener(hintPart, dom.EventType.CLICK, handleClick));
          return hintPart;
        } else {
          const hintPart = $("span", void 0, fragment);
          hintPart.style.fontStyle = "italic";
          return hintPart;
        }
      });
      hintElement.appendChild(before);
      const label = hintHandler.disposables.add(new KeybindingLabel(hintElement, OS));
      label.set(keybindingHint);
      label.element.style.width = "min-content";
      label.element.style.display = "inline";
      if (this.options.clickable) {
        label.element.style.cursor = "pointer";
        this.toDispose.add(dom.addDisposableListener(label.element, dom.EventType.CONTEXT_MENU, (e) => this._disableHint(e)));
        this.toDispose.add(dom.addDisposableListener(label.element, dom.EventType.CLICK, handleClick));
      }
      hintElement.appendChild(after);
      const typeToDismiss = localize("emptyHintTextDismiss", "Start typing to dismiss.");
      const textHint2 = $("span", void 0, typeToDismiss);
      textHint2.style.fontStyle = "italic";
      hintElement.appendChild(textHint2);
      ariaLabel = actionPart.concat(typeToDismiss);
    } else {
      const hintMsg = localize({
        key: "inlineChatHint",
        comment: [
          "Preserve double-square brackets and their order"
        ]
      }, "[[Ask {0} to do something]] or start typing to dismiss.", providerName);
      const rendered = renderFormattedText(hintMsg, { actionHandler: hintHandler });
      hintElement.appendChild(rendered);
    }
    return { ariaLabel, hintElement };
  }
  _getHintDefault() {
    const hintHandler = {
      disposables: this.toDispose,
      callback: /* @__PURE__ */ __name((index, event) => {
        switch (index) {
          case "0":
            languageOnClickOrTap(event.browserEvent);
            break;
          case "1":
            snippetOnClickOrTap(event.browserEvent);
            break;
          case "2":
            chooseEditorOnClickOrTap(event.browserEvent);
            break;
          case "3":
            this._disableHint();
            break;
        }
      }, "callback")
    };
    const languageOnClickOrTap = /* @__PURE__ */ __name(async (e) => {
      e.stopPropagation();
      this.editor.focus();
      this.telemetryService.publicLog2("workbenchActionExecuted", {
        id: ChangeLanguageAction.ID,
        from: "hint"
      });
      await this.commandService.executeCommand(ChangeLanguageAction.ID);
      this.editor.focus();
    }, "languageOnClickOrTap");
    const snippetOnClickOrTap = /* @__PURE__ */ __name(async (e) => {
      e.stopPropagation();
      this.telemetryService.publicLog2("workbenchActionExecuted", {
        id: ApplyFileSnippetAction.Id,
        from: "hint"
      });
      await this.commandService.executeCommand(ApplyFileSnippetAction.Id);
    }, "snippetOnClickOrTap");
    const chooseEditorOnClickOrTap = /* @__PURE__ */ __name(async (e) => {
      e.stopPropagation();
      const activeEditorInput = this.editorGroupsService.activeGroup.activeEditor;
      this.telemetryService.publicLog2("workbenchActionExecuted", {
        id: "welcome.showNewFileEntries",
        from: "hint"
      });
      const newEditorSelected = await this.commandService.executeCommand("welcome.showNewFileEntries", { from: "hint" });
      if (newEditorSelected && activeEditorInput !== null && activeEditorInput.resource?.scheme === Schemas.untitled) {
        this.editorGroupsService.activeGroup.closeEditor(activeEditorInput, { preserveFocus: true });
      }
    }, "chooseEditorOnClickOrTap");
    const hintMsg = localize({
      key: "message",
      comment: [
        "Preserve double-square brackets and their order",
        "language refers to a programming language"
      ]
    }, "[[Select a language]], or [[fill with template]], or [[open a different editor]] to get started.\nStart typing to dismiss or [[don't show]] this again.");
    const hintElement = renderFormattedText(hintMsg, {
      actionHandler: hintHandler,
      renderCodeSegments: false
    });
    hintElement.style.fontStyle = "italic";
    const keybindingsLookup = [ChangeLanguageAction.ID, ApplyFileSnippetAction.Id, "welcome.showNewFileEntries"];
    const keybindingLabels = keybindingsLookup.map((id) => this.keybindingService.lookupKeybinding(id)?.getLabel() ?? id);
    const ariaLabel = localize("defaultHintAriaLabel", "Execute {0} to select a language, execute {1} to fill with template, or execute {2} to open a different editor and get started. Start typing to dismiss.", ...keybindingLabels);
    for (const anchor of hintElement.querySelectorAll("a")) {
      anchor.style.cursor = "pointer";
      const id = keybindingsLookup.shift();
      const title = id && this.keybindingService.lookupKeybinding(id)?.getLabel();
      hintHandler.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), anchor, title ?? ""));
    }
    return { hintElement, ariaLabel };
  }
  getDomNode() {
    if (!this.domNode) {
      this.domNode = $(".empty-editor-hint");
      this.domNode.style.width = "max-content";
      this.domNode.style.paddingLeft = "4px";
      const inlineChatProviders = this.chatAgentService.getActivatedAgents().filter((candidate) => candidate.locations.includes(ChatAgentLocation.Editor));
      const { hintElement, ariaLabel } = !inlineChatProviders.length ? this._getHintDefault() : this._getHintInlineChat(inlineChatProviders);
      this.domNode.append(hintElement);
      this.ariaLabel = ariaLabel.concat(localize("disableHint", " Toggle {0} in settings to disable this hint.", AccessibilityVerbositySettingId.EmptyEditorHint));
      this.toDispose.add(dom.addDisposableListener(this.domNode, "click", () => {
        this.editor.focus();
      }));
      this.editor.applyFontInfo(this.domNode);
    }
    return this.domNode;
  }
  getPosition() {
    return {
      position: { lineNumber: 1, column: 1 },
      preference: [ContentWidgetPositionPreference.EXACT]
    };
  }
  dispose() {
    this.editor.removeContentWidget(this);
    dispose(this.toDispose);
  }
}
registerEditorContribution(EmptyTextEditorHintContribution.ID, EmptyTextEditorHintContribution, EditorContributionInstantiation.Eager);
export {
  EmptyTextEditorHintContribution,
  emptyTextEditorHintSetting
};
//# sourceMappingURL=emptyTextEditorHint.js.map
