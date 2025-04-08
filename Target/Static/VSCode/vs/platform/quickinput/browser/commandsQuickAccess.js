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
import { WorkbenchActionExecutedClassification, WorkbenchActionExecutedEvent } from "../../../base/common/actions.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../base/common/errorMessage.js";
import { isCancellationError } from "../../../base/common/errors.js";
import { matchesContiguousSubString, matchesPrefix, matchesWords, or } from "../../../base/common/filters.js";
import { createSingleCallFunction } from "../../../base/common/functional.js";
import { Disposable, DisposableStore, IDisposable } from "../../../base/common/lifecycle.js";
import { LRUCache } from "../../../base/common/map.js";
import { TfIdfCalculator, normalizeTfIdfScores } from "../../../base/common/tfIdf.js";
import { localize } from "../../../nls.js";
import { ILocalizedString } from "../../action/common/action.js";
import { ICommandService } from "../../commands/common/commands.js";
import { IConfigurationChangeEvent, IConfigurationService } from "../../configuration/common/configuration.js";
import { IDialogService } from "../../dialogs/common/dialogs.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { ILogService } from "../../log/common/log.js";
import { FastAndSlowPicks, IPickerQuickAccessItem, IPickerQuickAccessProviderOptions, PickerQuickAccessProvider, Picks } from "./pickerQuickAccess.js";
import { IQuickAccessProviderRunOptions } from "../common/quickAccess.js";
import { IQuickPickSeparator } from "../common/quickInput.js";
import { IStorageService, StorageScope, StorageTarget, WillSaveStateReason } from "../../storage/common/storage.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
let AbstractCommandsQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(options, instantiationService, keybindingService, commandService, telemetryService, dialogService) {
    super(AbstractCommandsQuickAccessProvider.PREFIX, options);
    this.keybindingService = keybindingService;
    this.commandService = commandService;
    this.telemetryService = telemetryService;
    this.dialogService = dialogService;
    this.commandsHistory = this._register(instantiationService.createInstance(CommandsHistory));
    this.options = options;
  }
  static {
    __name(this, "AbstractCommandsQuickAccessProvider");
  }
  static PREFIX = ">";
  static TFIDF_THRESHOLD = 0.5;
  static TFIDF_MAX_RESULTS = 5;
  static WORD_FILTER = or(matchesPrefix, matchesWords, matchesContiguousSubString);
  commandsHistory;
  options;
  async _getPicks(filter, _disposables, token, runOptions) {
    const allCommandPicks = await this.getCommandPicks(token);
    if (token.isCancellationRequested) {
      return [];
    }
    const runTfidf = createSingleCallFunction(() => {
      const tfidf = new TfIdfCalculator();
      tfidf.updateDocuments(allCommandPicks.map((commandPick) => ({
        key: commandPick.commandId,
        textChunks: [this.getTfIdfChunk(commandPick)]
      })));
      const result = tfidf.calculateScores(filter, token);
      return normalizeTfIdfScores(result).filter((score) => score.score > AbstractCommandsQuickAccessProvider.TFIDF_THRESHOLD).slice(0, AbstractCommandsQuickAccessProvider.TFIDF_MAX_RESULTS);
    });
    const filteredCommandPicks = [];
    for (const commandPick of allCommandPicks) {
      const labelHighlights = AbstractCommandsQuickAccessProvider.WORD_FILTER(filter, commandPick.label) ?? void 0;
      const aliasHighlights = commandPick.commandAlias ? AbstractCommandsQuickAccessProvider.WORD_FILTER(filter, commandPick.commandAlias) ?? void 0 : void 0;
      if (labelHighlights || aliasHighlights) {
        commandPick.highlights = {
          label: labelHighlights,
          detail: this.options.showAlias ? aliasHighlights : void 0
        };
        filteredCommandPicks.push(commandPick);
      } else if (filter === commandPick.commandId) {
        filteredCommandPicks.push(commandPick);
      } else if (filter.length >= 3) {
        const tfidf = runTfidf();
        if (token.isCancellationRequested) {
          return [];
        }
        const tfidfScore = tfidf.find((score) => score.key === commandPick.commandId);
        if (tfidfScore) {
          commandPick.tfIdfScore = tfidfScore.score;
          filteredCommandPicks.push(commandPick);
        }
      }
    }
    const mapLabelToCommand = /* @__PURE__ */ new Map();
    for (const commandPick of filteredCommandPicks) {
      const existingCommandForLabel = mapLabelToCommand.get(commandPick.label);
      if (existingCommandForLabel) {
        commandPick.description = commandPick.commandId;
        existingCommandForLabel.description = existingCommandForLabel.commandId;
      } else {
        mapLabelToCommand.set(commandPick.label, commandPick);
      }
    }
    filteredCommandPicks.sort((commandPickA, commandPickB) => {
      if (commandPickA.tfIdfScore && commandPickB.tfIdfScore) {
        if (commandPickA.tfIdfScore === commandPickB.tfIdfScore) {
          return commandPickA.label.localeCompare(commandPickB.label);
        }
        return commandPickB.tfIdfScore - commandPickA.tfIdfScore;
      } else if (commandPickA.tfIdfScore) {
        return 1;
      } else if (commandPickB.tfIdfScore) {
        return -1;
      }
      const commandACounter = this.commandsHistory.peek(commandPickA.commandId);
      const commandBCounter = this.commandsHistory.peek(commandPickB.commandId);
      if (commandACounter && commandBCounter) {
        return commandACounter > commandBCounter ? -1 : 1;
      }
      if (commandACounter) {
        return -1;
      }
      if (commandBCounter) {
        return 1;
      }
      if (this.options.suggestedCommandIds) {
        const commandASuggestion = this.options.suggestedCommandIds.has(commandPickA.commandId);
        const commandBSuggestion = this.options.suggestedCommandIds.has(commandPickB.commandId);
        if (commandASuggestion && commandBSuggestion) {
          return 0;
        }
        if (commandASuggestion) {
          return -1;
        }
        if (commandBSuggestion) {
          return 1;
        }
      }
      return commandPickA.label.localeCompare(commandPickB.label);
    });
    const commandPicks = [];
    let addOtherSeparator = false;
    let addSuggestedSeparator = true;
    let addCommonlyUsedSeparator = !!this.options.suggestedCommandIds;
    for (let i = 0; i < filteredCommandPicks.length; i++) {
      const commandPick = filteredCommandPicks[i];
      if (i === 0 && this.commandsHistory.peek(commandPick.commandId)) {
        commandPicks.push({ type: "separator", label: localize("recentlyUsed", "recently used") });
        addOtherSeparator = true;
      }
      if (addSuggestedSeparator && commandPick.tfIdfScore !== void 0) {
        commandPicks.push({ type: "separator", label: localize("suggested", "similar commands") });
        addSuggestedSeparator = false;
      }
      if (addCommonlyUsedSeparator && commandPick.tfIdfScore === void 0 && !this.commandsHistory.peek(commandPick.commandId) && this.options.suggestedCommandIds?.has(commandPick.commandId)) {
        commandPicks.push({ type: "separator", label: localize("commonlyUsed", "commonly used") });
        addOtherSeparator = true;
        addCommonlyUsedSeparator = false;
      }
      if (addOtherSeparator && commandPick.tfIdfScore === void 0 && !this.commandsHistory.peek(commandPick.commandId) && !this.options.suggestedCommandIds?.has(commandPick.commandId)) {
        commandPicks.push({ type: "separator", label: localize("morecCommands", "other commands") });
        addOtherSeparator = false;
      }
      commandPicks.push(this.toCommandPick(commandPick, runOptions));
    }
    if (!this.hasAdditionalCommandPicks(filter, token)) {
      return commandPicks;
    }
    return {
      picks: commandPicks,
      additionalPicks: (async () => {
        const additionalCommandPicks = await this.getAdditionalCommandPicks(allCommandPicks, filteredCommandPicks, filter, token);
        if (token.isCancellationRequested) {
          return [];
        }
        const commandPicks2 = additionalCommandPicks.map((commandPick) => this.toCommandPick(commandPick, runOptions));
        if (addSuggestedSeparator && commandPicks2[0]?.type !== "separator") {
          commandPicks2.unshift({ type: "separator", label: localize("suggested", "similar commands") });
        }
        return commandPicks2;
      })()
    };
  }
  toCommandPick(commandPick, runOptions) {
    if (commandPick.type === "separator") {
      return commandPick;
    }
    const keybinding = this.keybindingService.lookupKeybinding(commandPick.commandId);
    const ariaLabel = keybinding ? localize("commandPickAriaLabelWithKeybinding", "{0}, {1}", commandPick.label, keybinding.getAriaLabel()) : commandPick.label;
    return {
      ...commandPick,
      ariaLabel,
      detail: this.options.showAlias && commandPick.commandAlias !== commandPick.label ? commandPick.commandAlias : void 0,
      keybinding,
      accept: /* @__PURE__ */ __name(async () => {
        this.commandsHistory.push(commandPick.commandId);
        this.telemetryService.publicLog2("workbenchActionExecuted", {
          id: commandPick.commandId,
          from: runOptions?.from ?? "quick open"
        });
        try {
          commandPick.args?.length ? await this.commandService.executeCommand(commandPick.commandId, ...commandPick.args) : await this.commandService.executeCommand(commandPick.commandId);
        } catch (error) {
          if (!isCancellationError(error)) {
            this.dialogService.error(localize("canNotRun", "Command '{0}' resulted in an error", commandPick.label), toErrorMessage(error));
          }
        }
      }, "accept")
    };
  }
  // TF-IDF string to be indexed
  getTfIdfChunk({ label, commandAlias, commandDescription }) {
    let chunk = label;
    if (commandAlias && commandAlias !== label) {
      chunk += ` - ${commandAlias}`;
    }
    if (commandDescription && commandDescription.value !== label) {
      chunk += ` - ${commandDescription.value === commandDescription.original ? commandDescription.value : `${commandDescription.value} (${commandDescription.original})`}`;
    }
    return chunk;
  }
};
AbstractCommandsQuickAccessProvider = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IDialogService)
], AbstractCommandsQuickAccessProvider);
let CommandsHistory = class extends Disposable {
  constructor(storageService, configurationService, logService) {
    super();
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.logService = logService;
    this.updateConfiguration();
    this.load();
    this.registerListeners();
  }
  static {
    __name(this, "CommandsHistory");
  }
  static DEFAULT_COMMANDS_HISTORY_LENGTH = 50;
  static PREF_KEY_CACHE = "commandPalette.mru.cache";
  static PREF_KEY_COUNTER = "commandPalette.mru.counter";
  static cache;
  static counter = 1;
  static hasChanges = false;
  configuredCommandsHistoryLength = 0;
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e) => this.updateConfiguration(e)));
    this._register(this.storageService.onWillSaveState((e) => {
      if (e.reason === WillSaveStateReason.SHUTDOWN) {
        this.saveState();
      }
    }));
  }
  updateConfiguration(e) {
    if (e && !e.affectsConfiguration("workbench.commandPalette.history")) {
      return;
    }
    this.configuredCommandsHistoryLength = CommandsHistory.getConfiguredCommandHistoryLength(this.configurationService);
    if (CommandsHistory.cache && CommandsHistory.cache.limit !== this.configuredCommandsHistoryLength) {
      CommandsHistory.cache.limit = this.configuredCommandsHistoryLength;
      CommandsHistory.hasChanges = true;
    }
  }
  load() {
    const raw = this.storageService.get(CommandsHistory.PREF_KEY_CACHE, StorageScope.PROFILE);
    let serializedCache;
    if (raw) {
      try {
        serializedCache = JSON.parse(raw);
      } catch (error) {
        this.logService.error(`[CommandsHistory] invalid data: ${error}`);
      }
    }
    const cache = CommandsHistory.cache = new LRUCache(this.configuredCommandsHistoryLength, 1);
    if (serializedCache) {
      let entries;
      if (serializedCache.usesLRU) {
        entries = serializedCache.entries;
      } else {
        entries = serializedCache.entries.sort((a, b) => a.value - b.value);
      }
      entries.forEach((entry) => cache.set(entry.key, entry.value));
    }
    CommandsHistory.counter = this.storageService.getNumber(CommandsHistory.PREF_KEY_COUNTER, StorageScope.PROFILE, CommandsHistory.counter);
  }
  push(commandId) {
    if (!CommandsHistory.cache) {
      return;
    }
    CommandsHistory.cache.set(commandId, CommandsHistory.counter++);
    CommandsHistory.hasChanges = true;
  }
  peek(commandId) {
    return CommandsHistory.cache?.peek(commandId);
  }
  saveState() {
    if (!CommandsHistory.cache) {
      return;
    }
    if (!CommandsHistory.hasChanges) {
      return;
    }
    const serializedCache = { usesLRU: true, entries: [] };
    CommandsHistory.cache.forEach((value, key) => serializedCache.entries.push({ key, value }));
    this.storageService.store(CommandsHistory.PREF_KEY_CACHE, JSON.stringify(serializedCache), StorageScope.PROFILE, StorageTarget.USER);
    this.storageService.store(CommandsHistory.PREF_KEY_COUNTER, CommandsHistory.counter, StorageScope.PROFILE, StorageTarget.USER);
    CommandsHistory.hasChanges = false;
  }
  static getConfiguredCommandHistoryLength(configurationService) {
    const config = configurationService.getValue();
    const configuredCommandHistoryLength = config.workbench?.commandPalette?.history;
    if (typeof configuredCommandHistoryLength === "number") {
      return configuredCommandHistoryLength;
    }
    return CommandsHistory.DEFAULT_COMMANDS_HISTORY_LENGTH;
  }
  static clearHistory(configurationService, storageService) {
    const commandHistoryLength = CommandsHistory.getConfiguredCommandHistoryLength(configurationService);
    CommandsHistory.cache = new LRUCache(commandHistoryLength);
    CommandsHistory.counter = 1;
    CommandsHistory.hasChanges = true;
  }
};
CommandsHistory = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ILogService)
], CommandsHistory);
export {
  AbstractCommandsQuickAccessProvider,
  CommandsHistory
};
//# sourceMappingURL=commandsQuickAccess.js.map
