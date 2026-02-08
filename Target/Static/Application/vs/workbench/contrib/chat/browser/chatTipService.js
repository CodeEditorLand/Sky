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
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { localize } from "../../../../nls.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { ChatContextKeys } from "../common/actions/chatContextKeys.js";
import { ChatModeKind } from "../common/constants.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
const IChatTipService = createDecorator("chatTipService");
const TIP_CATALOG = [
  {
    id: "tip.agentMode",
    message: localize("tip.agentMode", "Tip: Try [Agent mode](command:workbench.action.chat.openEditSession) for multi-file edits and running commands."),
    when: ChatContextKeys.chatModeKind.notEqualsTo(ChatModeKind.Agent),
    enabledCommands: ["workbench.action.chat.openEditSession"]
  },
  {
    id: "tip.planMode",
    message: localize("tip.planMode", "Tip: Try [Plan mode](command:workbench.action.chat.openPlan) to let the agent perform deep analysis and planning before implementing changes."),
    when: ChatContextKeys.chatModeName.notEqualsTo("Plan"),
    enabledCommands: ["workbench.action.chat.openPlan"]
  },
  {
    id: "tip.attachFiles",
    message: localize("tip.attachFiles", "Tip: Attach files or folders with # to give Copilot more context.")
  },
  {
    id: "tip.codeActions",
    message: localize("tip.codeActions", "Tip: Select code and right-click for Copilot actions in the context menu.")
  },
  {
    id: "tip.undoChanges",
    message: localize("tip.undoChanges", "Tip: You can undo Copilot's changes to any point by clicking Restore Checkpoint."),
    when: ContextKeyExpr.or(ChatContextKeys.chatModeKind.isEqualTo(ChatModeKind.Agent), ChatContextKeys.chatModeKind.isEqualTo(ChatModeKind.Edit))
  },
  {
    id: "tip.customInstructions",
    message: localize("tip.customInstructions", "Tip: [Generate workspace instructions](command:workbench.action.chat.generateInstructions) so Copilot always has the context it needs when starting a task."),
    enabledCommands: ["workbench.action.chat.generateInstructions"]
  }
];
let ChatTipService = class ChatTipService2 {
  static {
    __name(this, "ChatTipService");
  }
  constructor(_productService, _configurationService) {
    this._productService = _productService;
    this._configurationService = _configurationService;
    this._createdAt = Date.now();
    this._hasShownTip = false;
  }
  getNextTip(requestId, requestTimestamp, contextKeyService) {
    if (!this._configurationService.getValue("chat.tips.enabled")) {
      return void 0;
    }
    if (!this._isCopilotEnabled()) {
      return void 0;
    }
    if (this._tipRequestId === requestId && this._shownTip) {
      return this._createTip(this._shownTip);
    }
    if (this._hasShownTip) {
      return void 0;
    }
    if (requestTimestamp < this._createdAt) {
      return void 0;
    }
    const eligibleTips = TIP_CATALOG.filter((tip) => this._isEligible(tip, contextKeyService));
    if (eligibleTips.length === 0) {
      return void 0;
    }
    const randomIndex = Math.floor(Math.random() * eligibleTips.length);
    const selectedTip = eligibleTips[randomIndex];
    this._hasShownTip = true;
    this._tipRequestId = requestId;
    this._shownTip = selectedTip;
    return this._createTip(selectedTip);
  }
  _isEligible(tip, contextKeyService) {
    if (!tip.when) {
      return true;
    }
    return contextKeyService.contextMatchesRules(tip.when);
  }
  _isCopilotEnabled() {
    const defaultChatAgent = this._productService.defaultChatAgent;
    return !!defaultChatAgent?.chatExtensionId;
  }
  _createTip(tipDef) {
    const markdown = new MarkdownString(tipDef.message, {
      isTrusted: tipDef.enabledCommands ? { enabledCommands: tipDef.enabledCommands } : false
    });
    return {
      id: tipDef.id,
      content: markdown
    };
  }
};
ChatTipService = __decorate([
  __param(0, IProductService),
  __param(1, IConfigurationService)
], ChatTipService);
export {
  ChatTipService,
  IChatTipService
};
//# sourceMappingURL=chatTipService.js.map
