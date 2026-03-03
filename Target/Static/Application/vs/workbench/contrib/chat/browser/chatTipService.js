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
import { Emitter } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ChatContextKeys } from "../common/actions/chatContextKeys.js";
import { ChatAgentLocation, ChatConfiguration } from "../common/constants.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { localize } from "../../../../nls.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IChatService } from "../common/chatService/chatService.js";
import { CreateSlashCommandsUsageTracker } from "./createSlashCommandsUsageTracker.js";
import { ChatEntitlement, IChatEntitlementService } from "../../../services/chat/common/chatEntitlementService.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { ChatRequestDynamicVariablePart, ChatRequestSlashCommandPart } from "../common/requestParser/chatParserTypes.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { TipEligibilityTracker } from "./chatTipEligibilityTracker.js";
import { extractCommandIds, TIP_CATALOG } from "./chatTipCatalog.js";
import { ChatTipStorageKeys, TipTrackingCommands } from "./chatTipStorageKeys.js";
const ATTACH_FILES_REFERENCE_TRACKING_COMMAND = TipTrackingCommands.AttachFilesReferenceUsed;
const CREATE_AGENT_INSTRUCTIONS_TRACKING_COMMAND = TipTrackingCommands.CreateAgentInstructionsUsed;
const CREATE_PROMPT_TRACKING_COMMAND = TipTrackingCommands.CreatePromptUsed;
const CREATE_AGENT_TRACKING_COMMAND = TipTrackingCommands.CreateAgentUsed;
const CREATE_SKILL_TRACKING_COMMAND = TipTrackingCommands.CreateSkillUsed;
const IChatTipService = createDecorator("chatTipService");
import { TipEligibilityTracker as TipEligibilityTracker2 } from "./chatTipEligibilityTracker.js";
let ChatTipService = class ChatTipService2 extends Disposable {
  static {
    __name(this, "ChatTipService");
  }
  constructor(_productService, _configurationService, _storageService, _chatService, instantiationService, _logService, _chatEntitlementService, _commandService, _telemetryService, _keybindingService) {
    super();
    this._productService = _productService;
    this._configurationService = _configurationService;
    this._storageService = _storageService;
    this._chatService = _chatService;
    this._logService = _logService;
    this._chatEntitlementService = _chatEntitlementService;
    this._commandService = _commandService;
    this._telemetryService = _telemetryService;
    this._keybindingService = _keybindingService;
    this._onDidDismissTip = this._register(new Emitter());
    this.onDidDismissTip = this._onDidDismissTip.event;
    this._onDidNavigateTip = this._register(new Emitter());
    this.onDidNavigateTip = this._onDidNavigateTip.event;
    this._onDidHideTip = this._register(new Emitter());
    this.onDidHideTip = this._onDidHideTip.event;
    this._onDidDisableTips = this._register(new Emitter());
    this.onDidDisableTips = this._onDidDisableTips.event;
    this._tipCommandListener = this._register(new MutableDisposable());
    this._tracker = this._register(instantiationService.createInstance(TipEligibilityTracker, TIP_CATALOG));
    this._createSlashCommandsUsageTracker = this._register(new CreateSlashCommandsUsageTracker(this._chatService, this._storageService, () => this._contextKeyService));
    this._register(this._chatEntitlementService.onDidChangeQuotaExceeded(() => {
      if (this._chatEntitlementService.quotas.chat?.percentRemaining === 0 && this._shownTip) {
        this.hideTip();
      }
    }));
    this._register(this._chatService.onDidSubmitRequest((e) => {
      const message = e.message ?? this._chatService.getSession(e.chatSessionResource)?.lastRequest?.message;
      if (!message) {
        return;
      }
      if (this._hasFileOrFolderReference(message)) {
        this._tracker.recordCommandExecuted(TipTrackingCommands.AttachFilesReferenceUsed);
      }
      const createCommandTrackingId = this._getCreateSlashCommandTrackingId(message);
      if (createCommandTrackingId) {
        this._tracker.recordCommandExecuted(createCommandTrackingId);
      }
    }));
    this._yoloModeEverEnabled = this._storageService.getBoolean(ChatTipStorageKeys.YoloModeEverEnabled, -1, false);
    if (!this._yoloModeEverEnabled && this._configurationService.getValue(ChatConfiguration.GlobalAutoApprove)) {
      this._yoloModeEverEnabled = true;
      this._storageService.store(
        ChatTipStorageKeys.YoloModeEverEnabled,
        true,
        -1,
        1
        /* StorageTarget.MACHINE */
      );
    }
    if (!this._yoloModeEverEnabled) {
      const configListener = this._register(new MutableDisposable());
      configListener.value = this._configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(ChatConfiguration.GlobalAutoApprove)) {
          if (this._configurationService.getValue(ChatConfiguration.GlobalAutoApprove)) {
            this._yoloModeEverEnabled = true;
            this._storageService.store(
              ChatTipStorageKeys.YoloModeEverEnabled,
              true,
              -1,
              1
              /* StorageTarget.MACHINE */
            );
            configListener.clear();
          }
        }
      });
    }
    this._thinkingPhrasesEverModified = this._storageService.getBoolean(ChatTipStorageKeys.ThinkingPhrasesEverModified, -1, false);
    if (!this._thinkingPhrasesEverModified && this._isSettingModified(ChatConfiguration.ThinkingPhrases)) {
      this._thinkingPhrasesEverModified = true;
      this._storageService.store(
        ChatTipStorageKeys.ThinkingPhrasesEverModified,
        true,
        -1,
        1
        /* StorageTarget.MACHINE */
      );
    }
    if (!this._thinkingPhrasesEverModified) {
      this._register(this._configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(ChatConfiguration.ThinkingPhrases)) {
          this._thinkingPhrasesEverModified = true;
          this._storageService.store(
            ChatTipStorageKeys.ThinkingPhrasesEverModified,
            true,
            -1,
            1
            /* StorageTarget.MACHINE */
          );
        }
      }));
    }
  }
  _hasFileOrFolderReference(message) {
    return message.parts.some((part) => {
      if (part.kind !== ChatRequestDynamicVariablePart.Kind) {
        return false;
      }
      const dynamicPart = part;
      return dynamicPart.isFile === true || dynamicPart.isDirectory === true;
    });
  }
  _getCreateSlashCommandTrackingId(message) {
    for (const part of message.parts) {
      if (part.kind === ChatRequestSlashCommandPart.Kind) {
        const slashCommand = part.slashCommand.command;
        return this._toCreateSlashCommandTrackingId(slashCommand);
      }
    }
    const trimmed = message.text.trimStart();
    const match = /^\/(create-(?:instructions|prompt|agent|skill))(?:\s|$)/.exec(trimmed);
    return match ? this._toCreateSlashCommandTrackingId(match[1]) : void 0;
  }
  _toCreateSlashCommandTrackingId(command) {
    switch (command) {
      case "create-instructions":
        return CREATE_AGENT_INSTRUCTIONS_TRACKING_COMMAND;
      case "create-prompt":
        return CREATE_PROMPT_TRACKING_COMMAND;
      case "create-agent":
        return CREATE_AGENT_TRACKING_COMMAND;
      case "create-skill":
        return CREATE_SKILL_TRACKING_COMMAND;
      default:
        return void 0;
    }
  }
  resetSession() {
    this._shownTip = void 0;
    this._tipRequestId = void 0;
    this._contextKeyService = void 0;
  }
  dismissTip() {
    if (this._shownTip) {
      this._logTipTelemetry(this._shownTip.id, "dismissed");
      const dismissed = new Set(this._getDismissedTipIds());
      dismissed.add(this._shownTip.id);
      this._storageService.store(
        ChatTipStorageKeys.DismissedTips,
        JSON.stringify([...dismissed]),
        -1,
        1
        /* StorageTarget.MACHINE */
      );
    }
    this._tipRequestId = void 0;
    this._onDidDismissTip.fire();
  }
  clearDismissedTips() {
    this._storageService.remove(
      ChatTipStorageKeys.DismissedTips,
      -1
      /* StorageScope.APPLICATION */
    );
    this._storageService.remove(
      ChatTipStorageKeys.DismissedTips,
      0
      /* StorageScope.PROFILE */
    );
    this._shownTip = void 0;
    this._tipRequestId = void 0;
    this._contextKeyService = void 0;
    this._onDidDismissTip.fire();
  }
  _getDismissedTipIds() {
    const raw = this._readApplicationWithProfileFallback(ChatTipStorageKeys.DismissedTips);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      this._logService.debug("#ChatTips dismissed:", parsed);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const knownTipIds = new Set(TIP_CATALOG.map((tip) => tip.id));
      const dismissed = /* @__PURE__ */ new Set();
      for (const value of parsed) {
        if (typeof value === "string" && knownTipIds.has(value)) {
          dismissed.add(value);
        }
      }
      return [...dismissed];
    } catch {
      return [];
    }
  }
  hideTip() {
    if (this._shownTip) {
      this._logTipTelemetry(this._shownTip.id, "hidden");
    }
    this._shownTip = void 0;
    this._tipRequestId = void 0;
    this._onDidHideTip.fire();
  }
  async disableTips() {
    if (this._shownTip) {
      this._logTipTelemetry(this._shownTip.id, "disabled");
    }
    this._shownTip = void 0;
    this._tipRequestId = void 0;
    await this._configurationService.updateValue(
      "chat.tips.enabled",
      false,
      1
      /* ConfigurationTarget.APPLICATION */
    );
    this._onDidDisableTips.fire();
  }
  getWelcomeTip(contextKeyService) {
    this._createSlashCommandsUsageTracker.syncContextKey(contextKeyService);
    this._tracker.recordCurrentMode(contextKeyService);
    this._tracker.refreshPromptFileExclusions();
    if (!this._configurationService.getValue("chat.tips.enabled")) {
      return void 0;
    }
    this._contextKeyService = contextKeyService;
    if (!this._isCopilotEnabled()) {
      return void 0;
    }
    if (this._chatEntitlementService.entitlement === ChatEntitlement.Unknown) {
      return void 0;
    }
    if (!this._isChatLocation(contextKeyService)) {
      return void 0;
    }
    if (this._isChatQuotaExceeded(contextKeyService)) {
      return void 0;
    }
    if (this._tipRequestId === "welcome" && this._shownTip) {
      if (!this._isEligible(this._shownTip, contextKeyService)) {
        const nextTip = this._findNextEligibleTip(this._shownTip.id, contextKeyService);
        if (nextTip) {
          this._shownTip = nextTip;
          this._storageService.store(
            ChatTipStorageKeys.LastTipId,
            nextTip.id,
            -1,
            0
            /* StorageTarget.USER */
          );
          const tip2 = this._createTip(nextTip);
          this._onDidNavigateTip.fire(tip2);
          return tip2;
        }
      }
      return this._createTip(this._shownTip);
    }
    const tip = this._pickTip("welcome", contextKeyService);
    return tip;
  }
  _findNextEligibleTip(currentTipId, contextKeyService) {
    this._createSlashCommandsUsageTracker.syncContextKey(contextKeyService);
    const currentIndex = TIP_CATALOG.findIndex((tip) => tip.id === currentTipId);
    if (currentIndex === -1) {
      return void 0;
    }
    const dismissedIds = new Set(this._getDismissedTipIds());
    for (let i = 1; i < TIP_CATALOG.length; i++) {
      const idx = (currentIndex + i) % TIP_CATALOG.length;
      const candidate = TIP_CATALOG[idx];
      if (!dismissedIds.has(candidate.id) && this._isEligible(candidate, contextKeyService)) {
        return candidate;
      }
    }
    return void 0;
  }
  _pickTip(sourceId, contextKeyService) {
    this._createSlashCommandsUsageTracker.syncContextKey(contextKeyService);
    this._tracker.recordCurrentMode(contextKeyService);
    const dismissedIds = new Set(this._getDismissedTipIds());
    let selectedTip;
    const lastTipId = this._readApplicationWithProfileFallback(ChatTipStorageKeys.LastTipId);
    const lastCatalogIndex = lastTipId ? TIP_CATALOG.findIndex((tip) => tip.id === lastTipId) : -1;
    const startIndex = lastCatalogIndex === -1 ? 0 : (lastCatalogIndex + 1) % TIP_CATALOG.length;
    for (let i = 0; i < TIP_CATALOG.length; i++) {
      const idx = (startIndex + i) % TIP_CATALOG.length;
      const candidate = TIP_CATALOG[idx];
      if (!dismissedIds.has(candidate.id) && this._isEligible(candidate, contextKeyService)) {
        selectedTip = candidate;
        break;
      }
    }
    if (!selectedTip) {
      return void 0;
    }
    this._storageService.store(
      ChatTipStorageKeys.LastTipId,
      selectedTip.id,
      -1,
      0
      /* StorageTarget.USER */
    );
    this._tipRequestId = sourceId;
    this._shownTip = selectedTip;
    this._logTipTelemetry(selectedTip.id, "shown");
    this._trackTipCommandClicks(selectedTip);
    return this._createTip(selectedTip);
  }
  navigateToNextTip() {
    if (!this._contextKeyService) {
      return void 0;
    }
    return this._navigateTip(1, this._contextKeyService);
  }
  navigateToPreviousTip() {
    if (!this._contextKeyService) {
      return void 0;
    }
    return this._navigateTip(-1, this._contextKeyService);
  }
  getNextEligibleTip() {
    if (!this._contextKeyService || !this._shownTip) {
      return void 0;
    }
    this._createSlashCommandsUsageTracker.syncContextKey(this._contextKeyService);
    const currentIndex = TIP_CATALOG.findIndex((t) => t.id === this._shownTip.id);
    if (currentIndex === -1) {
      return void 0;
    }
    const dismissedIds = new Set(this._getDismissedTipIds());
    for (let i = 1; i < TIP_CATALOG.length; i++) {
      const idx = (currentIndex + i) % TIP_CATALOG.length;
      const candidate = TIP_CATALOG[idx];
      if (!dismissedIds.has(candidate.id) && this._isEligible(candidate, this._contextKeyService)) {
        this._shownTip = candidate;
        this._tipRequestId = "welcome";
        this._storageService.store(
          ChatTipStorageKeys.LastTipId,
          candidate.id,
          -1,
          0
          /* StorageTarget.USER */
        );
        this._logTipTelemetry(candidate.id, "shown");
        this._trackTipCommandClicks(candidate);
        return this._createTip(candidate);
      }
    }
    return void 0;
  }
  hasMultipleTips() {
    if (!this._contextKeyService) {
      return false;
    }
    this._createSlashCommandsUsageTracker.syncContextKey(this._contextKeyService);
    return this._hasNavigableTip(this._contextKeyService);
  }
  _navigateTip(direction, contextKeyService) {
    this._createSlashCommandsUsageTracker.syncContextKey(contextKeyService);
    if (!this._shownTip) {
      return void 0;
    }
    const currentIndex = TIP_CATALOG.findIndex((t) => t.id === this._shownTip.id);
    if (currentIndex === -1) {
      return void 0;
    }
    const candidate = this._getNavigableTip(direction, currentIndex, contextKeyService);
    if (candidate) {
      this._logTipTelemetry(this._shownTip.id, direction === 1 ? "navigateNext" : "navigatePrevious");
      this._shownTip = candidate;
      this._tipRequestId = "welcome";
      this._storageService.store(
        ChatTipStorageKeys.LastTipId,
        candidate.id,
        -1,
        0
        /* StorageTarget.USER */
      );
      this._logTipTelemetry(candidate.id, "shown");
      this._trackTipCommandClicks(candidate);
      const tip = this._createTip(candidate);
      this._onDidNavigateTip.fire(tip);
      return tip;
    }
    return void 0;
  }
  _hasNavigableTip(contextKeyService) {
    if (!this._shownTip) {
      return false;
    }
    const currentIndex = TIP_CATALOG.findIndex((t) => t.id === this._shownTip.id);
    if (currentIndex === -1) {
      return false;
    }
    return !!this._getNavigableTip(1, currentIndex, contextKeyService);
  }
  _getNavigableTip(direction, currentIndex, contextKeyService) {
    const dismissedIds = new Set(this._getDismissedTipIds());
    let eligibleTipCount = 0;
    for (const tip of TIP_CATALOG) {
      if (!dismissedIds.has(tip.id) && this._isEligible(tip, contextKeyService)) {
        eligibleTipCount++;
        if (eligibleTipCount > 1) {
          break;
        }
      }
    }
    if (eligibleTipCount <= 1) {
      return void 0;
    }
    for (let i = 1; i < TIP_CATALOG.length; i++) {
      const idx = ((currentIndex + direction * i) % TIP_CATALOG.length + TIP_CATALOG.length) % TIP_CATALOG.length;
      const candidate = TIP_CATALOG[idx];
      if (!dismissedIds.has(candidate.id) && this._isEligible(candidate, contextKeyService)) {
        return candidate;
      }
    }
    return void 0;
  }
  _isEligible(tip, contextKeyService) {
    if (tip.onlyWhenModelIds?.length) {
      const currentModelId = this._getCurrentChatModelId(contextKeyService);
      const isModelMatch = tip.onlyWhenModelIds.some((modelId) => currentModelId === modelId || currentModelId.startsWith(`${modelId}-`));
      if (!isModelMatch) {
        return false;
      }
    }
    if (tip.excludeWhenSettingsChanged?.some((setting) => this._isSettingModified(setting))) {
      this._logService.debug("#ChatTips: tip excluded because setting was modified", tip.id, tip.excludeWhenSettingsChanged);
      return false;
    }
    if (tip.when && !contextKeyService.contextMatchesRules(tip.when)) {
      this._logService.debug("#ChatTips: tip is not eligible due to when clause", tip.id, tip.when.serialize());
      return false;
    }
    if (this._tracker.isExcluded(tip)) {
      return false;
    }
    if (tip.id === "tip.yoloMode") {
      if (this._yoloModeEverEnabled) {
        this._logService.debug("#ChatTips: tip excluded because yolo mode was previously enabled", tip.id);
        return false;
      }
      const inspected = this._configurationService.inspect(ChatConfiguration.GlobalAutoApprove);
      if (inspected.policyValue === false) {
        this._logService.debug("#ChatTips: tip excluded because policy restricts auto-approve", tip.id);
        return false;
      }
    }
    if (tip.id === "tip.thinkingPhrases" && this._thinkingPhrasesEverModified) {
      this._logService.debug("#ChatTips: tip excluded because thinking phrases setting was previously modified", tip.id);
      return false;
    }
    this._logService.debug("#ChatTips: tip is eligible", tip.id);
    return true;
  }
  _isSettingModified(key) {
    const inspected = this._configurationService.inspect(key);
    return inspected.userValue !== void 0 || inspected.userLocalValue !== void 0 || inspected.userRemoteValue !== void 0 || inspected.workspaceValue !== void 0 || inspected.workspaceFolderValue !== void 0;
  }
  _getCurrentChatModelId(contextKeyService) {
    const normalize = /* @__PURE__ */ __name((modelId) => {
      const normalizedModelId = modelId?.toLowerCase() ?? "";
      if (!normalizedModelId) {
        return "";
      }
      if (normalizedModelId.includes("/")) {
        return normalizedModelId.split("/").at(-1) ?? "";
      }
      return normalizedModelId;
    }, "normalize");
    const contextKeyModelId = normalize(contextKeyService.getContextKeyValue(ChatContextKeys.chatModelId.key));
    if (contextKeyModelId) {
      return contextKeyModelId;
    }
    const location = contextKeyService.getContextKeyValue(ChatContextKeys.location.key) ?? ChatAgentLocation.Chat;
    const sessionType = contextKeyService.getContextKeyValue(ChatContextKeys.chatSessionType.key) ?? "";
    const candidateStorageKeys = sessionType ? [`chat.currentLanguageModel.${location}.${sessionType}`, `chat.currentLanguageModel.${location}`] : [`chat.currentLanguageModel.${location}`];
    for (const storageKey of candidateStorageKeys) {
      const persistedModelIdentifier = this._storageService.get(
        storageKey,
        -1
        /* StorageScope.APPLICATION */
      );
      const persistedModelId = normalize(persistedModelIdentifier);
      if (persistedModelId) {
        return persistedModelId;
      }
    }
    return "";
  }
  _isChatLocation(contextKeyService) {
    const location = contextKeyService.getContextKeyValue(ChatContextKeys.location.key);
    return !location || location === ChatAgentLocation.Chat;
  }
  _isChatQuotaExceeded(contextKeyService) {
    return contextKeyService.getContextKeyValue(ChatContextKeys.chatQuotaExceeded.key) === true;
  }
  _isCopilotEnabled() {
    const defaultChatAgent = this._productService.defaultChatAgent;
    return !!defaultChatAgent?.chatExtensionId;
  }
  _createTip(tipDef) {
    const ctx = { keybindingService: this._keybindingService };
    const rawMessage = tipDef.buildMessage(ctx);
    const prefixedMessage = localize("tipPrefix", "**Tip:** {0}", rawMessage.value);
    const enabledCommands = extractCommandIds(prefixedMessage);
    const markdown = new MarkdownString(prefixedMessage, {
      isTrusted: enabledCommands.length > 0 ? { enabledCommands } : false
    });
    return {
      id: tipDef.id,
      content: markdown,
      enabledCommands
    };
  }
  _logTipTelemetry(tipId, action, commandId) {
    this._telemetryService.publicLog2("chatTip", {
      tipId,
      action,
      commandId
    });
  }
  _trackTipCommandClicks(tip) {
    this._tipCommandListener.clear();
    const ctx = { keybindingService: this._keybindingService };
    const rawMessage = tip.buildMessage(ctx);
    const enabledCommands = extractCommandIds(rawMessage.value);
    if (!enabledCommands.length) {
      return;
    }
    const enabledCommandSet = new Set(enabledCommands);
    const dismissCommandSet = new Set(tip.dismissWhenCommandsClicked);
    this._tipCommandListener.value = this._commandService.onDidExecuteCommand((e) => {
      if (enabledCommandSet.has(e.commandId) && this._shownTip?.id === tip.id) {
        this._logTipTelemetry(tip.id, "commandClicked", e.commandId);
        if (dismissCommandSet.has(e.commandId)) {
          this.dismissTip();
        }
      }
    });
  }
  _readApplicationWithProfileFallback(key) {
    const applicationValue = this._storageService.get(
      key,
      -1
      /* StorageScope.APPLICATION */
    );
    if (applicationValue) {
      return applicationValue;
    }
    const profileValue = this._storageService.get(
      key,
      0
      /* StorageScope.PROFILE */
    );
    if (profileValue) {
      this._storageService.store(
        key,
        profileValue,
        -1,
        1
        /* StorageTarget.MACHINE */
      );
    }
    return profileValue;
  }
};
ChatTipService = __decorate([
  __param(0, IProductService),
  __param(1, IConfigurationService),
  __param(2, IStorageService),
  __param(3, IChatService),
  __param(4, IInstantiationService),
  __param(5, ILogService),
  __param(6, IChatEntitlementService),
  __param(7, ICommandService),
  __param(8, ITelemetryService),
  __param(9, IKeybindingService)
], ChatTipService);
export {
  ATTACH_FILES_REFERENCE_TRACKING_COMMAND,
  CREATE_AGENT_INSTRUCTIONS_TRACKING_COMMAND,
  CREATE_AGENT_TRACKING_COMMAND,
  CREATE_PROMPT_TRACKING_COMMAND,
  CREATE_SKILL_TRACKING_COMMAND,
  ChatTipService,
  IChatTipService,
  TipEligibilityTracker2 as TipEligibilityTracker,
  TipTrackingCommands
};
//# sourceMappingURL=chatTipService.js.map
