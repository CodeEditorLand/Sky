var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { marked } from "../../../../base/common/marked/marked.js";
import { localize } from "../../../../nls.js";
import { IAccessibleViewService } from "../../../../platform/accessibility/browser/accessibleView.js";
import { isRequestVM, isResponseVM } from "../common/chatViewModel.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { AcceptToolConfirmationActionId } from "./actions/chatToolActions.js";
import { CancelChatActionId } from "./actions/chatExecuteActions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
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
const getToolConfirmationAlert = /* @__PURE__ */ __name((accessor, toolInvocation) => {
  const keybindingService = accessor.get(IKeybindingService);
  const contextKeyService = accessor.get(IContextKeyService);
  const acceptKb = keybindingService.lookupKeybinding(AcceptToolConfirmationActionId, contextKeyService)?.getAriaLabel();
  const cancelKb = keybindingService.lookupKeybinding(CancelChatActionId, contextKeyService)?.getAriaLabel();
  const titles = toolInvocation.filter((t) => t.confirmationMessages?.title).map((v) => {
    let input = "";
    if (v.toolSpecificData) {
      if (v.toolSpecificData.kind === "terminal") {
        input = v.toolSpecificData.command;
      } else if (v.toolSpecificData.kind === "extensions") {
        input = JSON.stringify(v.toolSpecificData.extensions);
      } else if (v.toolSpecificData.kind === "input") {
        input = JSON.stringify(v.toolSpecificData.rawInput);
      }
    }
    const titleObj = v.confirmationMessages?.title;
    const title = typeof titleObj === "string" ? titleObj : titleObj?.value || "";
    return (title + (input ? ": " + input : "")).trim();
  }).filter((v) => !!v);
  return acceptKb && cancelKb ? localize("toolInvocationsHintKb", "Chat confirmation required: {0}. Press {1} to accept or {2} to cancel.", titles.join(", "), acceptKb, cancelKb) : localize("toolInvocationsHint", "Chat confirmation required: {0}", titles.join(", "));
}, "getToolConfirmationAlert");
let ChatAccessibilityProvider = class ChatAccessibilityProvider2 {
  static {
    __name(this, "ChatAccessibilityProvider");
  }
  constructor(_accessibleViewService, _instantiationService) {
    this._accessibleViewService = _accessibleViewService;
    this._instantiationService = _instantiationService;
  }
  getWidgetRole() {
    return "list";
  }
  getRole(element) {
    return "listitem";
  }
  getWidgetAriaLabel() {
    return localize("chat", "Chat");
  }
  getAriaLabel(element) {
    if (isRequestVM(element)) {
      return element.messageText;
    }
    if (isResponseVM(element)) {
      return this._getLabelWithInfo(element);
    }
    return "";
  }
  _getLabelWithInfo(element) {
    const accessibleViewHint = this._accessibleViewService.getOpenAriaHint(
      "accessibility.verbosity.panelChat"
      /* AccessibilityVerbositySettingId.Chat */
    );
    let label = "";
    const toolInvocation = element.response.value.filter((v) => v.kind === "toolInvocation");
    let toolInvocationHint = "";
    if (toolInvocation.length) {
      const waitingForConfirmation = toolInvocation.filter((v) => !v.isComplete);
      if (waitingForConfirmation.length) {
        toolInvocationHint = this._instantiationService.invokeFunction(getToolConfirmationAlert, toolInvocation);
      } else {
        for (const invocation of toolInvocation) {
          const titleObj = invocation.confirmationMessages?.title;
          let title = "";
          if (typeof titleObj === "string" && titleObj.trim()) {
            title = titleObj;
          } else if (titleObj && typeof titleObj === "object" && "value" in titleObj && titleObj.value && titleObj.value.trim()) {
            title = titleObj.value;
          } else {
            title = invocation.toolId;
          }
          toolInvocationHint += localize("toolCompletedHint", "Tool {0} completed.", title);
        }
      }
    }
    const tableCount = marked.lexer(element.response.toString()).filter((token) => token.type === "table")?.length ?? 0;
    let tableCountHint = "";
    switch (tableCount) {
      case 0:
        break;
      case 1:
        tableCountHint = localize("singleTableHint", "1 table ");
        break;
      default:
        tableCountHint = localize("multiTableHint", "{0} tables ", tableCount);
        break;
    }
    const fileTreeCount = element.response.value.filter((v) => v.kind === "treeData").length ?? 0;
    let fileTreeCountHint = "";
    switch (fileTreeCount) {
      case 0:
        break;
      case 1:
        fileTreeCountHint = localize("singleFileTreeHint", "1 file tree ");
        break;
      default:
        fileTreeCountHint = localize("multiFileTreeHint", "{0} file trees ", fileTreeCount);
        break;
    }
    const codeBlockCount = marked.lexer(element.response.toString()).filter((token) => token.type === "code")?.length ?? 0;
    switch (codeBlockCount) {
      case 0:
        label = accessibleViewHint ? localize("noCodeBlocksHint", "{0}{1}{2}{3} {4}", toolInvocationHint, fileTreeCountHint, tableCountHint, element.response.toString(), accessibleViewHint) : localize("noCodeBlocks", "{0} {1}", fileTreeCountHint, element.response.toString());
        break;
      case 1:
        label = accessibleViewHint ? localize("singleCodeBlockHint", "{0}{1}1 code block: {2} {3}{4}", toolInvocationHint, fileTreeCountHint, tableCountHint, element.response.toString(), accessibleViewHint) : localize("singleCodeBlock", "{0} 1 code block: {1}", fileTreeCountHint, element.response.toString());
        break;
      default:
        label = accessibleViewHint ? localize("multiCodeBlockHint", "{0}{1}{2} code blocks: {3}{4}", toolInvocationHint, fileTreeCountHint, tableCountHint, codeBlockCount, element.response.toString(), accessibleViewHint) : localize("multiCodeBlock", "{0} {1} code blocks", fileTreeCountHint, codeBlockCount, element.response.toString());
        break;
    }
    return label;
  }
};
ChatAccessibilityProvider = __decorate([
  __param(0, IAccessibleViewService),
  __param(1, IInstantiationService)
], ChatAccessibilityProvider);
export {
  ChatAccessibilityProvider,
  getToolConfirmationAlert
};
//# sourceMappingURL=chatAccessibilityProvider.js.map
