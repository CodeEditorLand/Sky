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
import { Codicon } from "../../../../../base/common/codicons.js";
import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import Severity from "../../../../../base/common/severity.js";
import { hasKey } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ChatConfiguration } from "../../common/constants.js";
import { getTextResponseFromStream, ILanguageModelsService } from "../../common/languageModels.js";
import { Event } from "../../../../../base/common/event.js";
var AutoReplyStorageKeys;
(function(AutoReplyStorageKeys2) {
  AutoReplyStorageKeys2["AutoReplyOptIn"] = "chat.autoReply.optIn";
})(AutoReplyStorageKeys || (AutoReplyStorageKeys = {}));
let ChatQuestionCarouselAutoReply = class ChatQuestionCarouselAutoReply2 extends Disposable {
  static {
    __name(this, "ChatQuestionCarouselAutoReply");
  }
  constructor(configService, dialogService, logService, storageService, languageModelsService) {
    super();
    this.configService = configService;
    this.dialogService = dialogService;
    this.logService = logService;
    this.storageService = storageService;
    this.languageModelsService = languageModelsService;
    this._register(Event.runAndSubscribe(this.configService.onDidChangeConfiguration, (e) => {
      if (!e || e.affectsConfiguration(ChatConfiguration.AutoReply)) {
        if (this.configService.getValue(ChatConfiguration.AutoReply) !== true) {
          this.storageService.remove(
            "chat.autoReply.optIn",
            -1
            /* StorageScope.APPLICATION */
          );
        }
      }
    }));
  }
  async shouldAutoReply() {
    if (!this.configService.getValue(ChatConfiguration.AutoReply)) {
      return false;
    }
    return this.checkOptIn();
  }
  async autoReply(carousel, submit, modelName, requestMessageText, token) {
    if (token.isCancellationRequested || carousel.isUsed || carousel.questions.length === 0) {
      return;
    }
    const fallbackAnswers = this.buildFallbackCarouselAnswers(carousel, requestMessageText);
    let resolvedAnswers = fallbackAnswers;
    const modelId = await this.getModelId(modelName);
    if (modelId && !token.isCancellationRequested) {
      try {
        const parsedAnswers = await this.requestAnswers(modelId, carousel, requestMessageText, token);
        if (parsedAnswers.size > 0) {
          resolvedAnswers = this.mergeAnswers(carousel, parsedAnswers, fallbackAnswers);
        }
      } catch (err) {
        this.logService.debug("#ChatQuestionCarousel: Failed to resolve auto reply", toErrorMessage(err));
      }
    }
    if (token.isCancellationRequested || carousel.isUsed) {
      return;
    }
    await submit(resolvedAnswers);
  }
  // #region Opt-in
  async checkOptIn() {
    const optedIn = this.storageService.getBoolean("chat.autoReply.optIn", -1, false);
    if (optedIn) {
      return true;
    }
    const promptResult = await this.dialogService.prompt({
      type: Severity.Warning,
      message: localize("chat.autoReply.enable.title", "Enable chat auto reply?"),
      buttons: [
        {
          label: localize("chat.autoReply.enable", "Enable"),
          run: /* @__PURE__ */ __name(() => true, "run")
        },
        {
          label: localize("chat.autoReply.disable", "Disable"),
          run: /* @__PURE__ */ __name(() => false, "run")
        }
      ],
      custom: {
        icon: Codicon.warning,
        disableCloseAction: true,
        markdownDetails: [{
          markdown: new MarkdownString(localize("chat.autoReply.enable.details", "Chat auto reply answers question carousels using the current model and may make unintended choices. Review your settings and outputs carefully."))
        }]
      }
    });
    if (promptResult.result !== true) {
      await this.configService.updateValue(ChatConfiguration.AutoReply, false);
      return false;
    }
    this.storageService.store(
      "chat.autoReply.optIn",
      true,
      -1,
      0
      /* StorageTarget.USER */
    );
    return true;
  }
  // #endregion
  // #region LLM interaction
  async getModelId(modelName) {
    if (!modelName) {
      return void 0;
    }
    let models = await this.languageModelsService.selectLanguageModels({ id: modelName });
    if (models.length > 0) {
      return models[0];
    }
    if (modelName.startsWith("copilot/")) {
      models = await this.languageModelsService.selectLanguageModels({ vendor: "copilot", family: modelName.replace(/^copilot\//, "") });
      return models[0];
    }
    return void 0;
  }
  buildPrompt(carousel, requestMessageText, strict) {
    const questions = carousel.questions.map((question) => ({
      id: question.id,
      type: question.type,
      title: question.title,
      message: typeof question.message === "string" ? question.message : question.message?.value,
      options: question.options?.map((option) => ({ id: option.id, label: option.label })) ?? [],
      allowFreeformInput: question.allowFreeformInput ?? false
    }));
    const contextLines = [];
    if (requestMessageText) {
      contextLines.push(`Original user request: ${JSON.stringify(requestMessageText)}`);
    }
    return [
      "Choose default answers for the following questions.",
      "Return a JSON object keyed by question id.",
      "For text questions, the value should be a string.",
      'For singleSelect questions, the value should be { "selectedId": string } or { "freeform": string }.',
      'For multiSelect questions, the value should be { "selectedIds": string[] } and may include { "freeform": string }.',
      "If a question allows freeform input and has no options, return a freeform answer based on the user request when possible.",
      "Use option ids from the provided options.",
      ...contextLines,
      "Questions:",
      JSON.stringify(questions),
      strict ? "Return ONLY valid JSON. Do not include markdown or explanations." : void 0
    ].filter(Boolean).join("\n");
  }
  async requestAnswers(modelId, carousel, requestMessageText, token) {
    const prompt = this.buildPrompt(carousel, requestMessageText, false);
    const response = await this.languageModelsService.sendChatRequest(modelId, new ExtensionIdentifier("core"), [{ role: 1, content: [{ type: "text", value: prompt }] }], {}, token);
    const responseText = await getTextResponseFromStream(response);
    const parsedAnswers = this.parseAnswers(responseText, carousel);
    if (parsedAnswers.size > 0 || token.isCancellationRequested) {
      return parsedAnswers;
    }
    const retryPrompt = this.buildPrompt(carousel, requestMessageText, true);
    const retryResponse = await this.languageModelsService.sendChatRequest(modelId, new ExtensionIdentifier("core"), [{ role: 1, content: [{ type: "text", value: retryPrompt }] }], {}, token);
    const retryText = await getTextResponseFromStream(retryResponse);
    return this.parseAnswers(retryText, carousel);
  }
  // #endregion
  // #region Answer parsing and resolution
  parseAnswers(responseText, carousel) {
    const parsed = this.tryParseJsonObject(responseText);
    if (!parsed) {
      return /* @__PURE__ */ new Map();
    }
    const answers = /* @__PURE__ */ new Map();
    for (const question of carousel.questions) {
      const rawAnswer = parsed[question.id];
      const resolved = this.resolveAnswerFromRaw(question, rawAnswer);
      if (resolved !== void 0) {
        answers.set(question.id, resolved);
      }
    }
    return answers;
  }
  mergeAnswers(carousel, resolvedAnswers, fallbackAnswers) {
    const merged = /* @__PURE__ */ new Map();
    for (const question of carousel.questions) {
      const fallback = fallbackAnswers.get(question.id);
      if (this.hasDefaultValue(question) && fallback !== void 0) {
        merged.set(question.id, fallback);
        continue;
      }
      if (resolvedAnswers.has(question.id)) {
        merged.set(question.id, resolvedAnswers.get(question.id));
        continue;
      }
      if (fallback !== void 0) {
        merged.set(question.id, fallback);
      }
    }
    return merged;
  }
  hasDefaultValue(question) {
    switch (question.type) {
      case "text":
        return question.defaultValue !== void 0;
      case "singleSelect":
        return typeof question.defaultValue === "string";
      case "multiSelect":
        return Array.isArray(question.defaultValue) ? question.defaultValue.length > 0 : typeof question.defaultValue === "string";
    }
  }
  resolveAnswerFromRaw(question, raw) {
    switch (question.type) {
      case "text": {
        if (typeof raw === "string") {
          const value = raw.trim();
          return value.length > 0 ? value : void 0;
        }
        if (raw && typeof raw === "object" && hasKey(raw, { value: true }) && typeof raw.value === "string") {
          const value = raw.value.trim();
          return value.length > 0 ? value : void 0;
        }
        return void 0;
      }
      case "singleSelect": {
        let selectedInput;
        let freeformInput;
        if (typeof raw === "string") {
          selectedInput = raw;
        } else if (raw && typeof raw === "object") {
          if (hasKey(raw, { selectedId: true }) && typeof raw.selectedId === "string") {
            selectedInput = raw.selectedId;
          } else if (hasKey(raw, { selectedLabel: true }) && typeof raw.selectedLabel === "string") {
            selectedInput = raw.selectedLabel;
          }
          if (hasKey(raw, { freeform: true }) && typeof raw.freeform === "string") {
            freeformInput = raw.freeform;
          }
        }
        if (freeformInput && freeformInput.trim().length > 0) {
          return { selectedValue: void 0, freeformValue: freeformInput.trim() };
        }
        const match = selectedInput ? this.matchQuestionOption(question, selectedInput) : void 0;
        if (match) {
          return { selectedValue: match.value, freeformValue: void 0 };
        }
        return void 0;
      }
      case "multiSelect": {
        let selectedInputs = [];
        let freeformInput;
        if (Array.isArray(raw)) {
          selectedInputs = raw.filter((item) => typeof item === "string");
        } else if (typeof raw === "string") {
          selectedInputs = raw.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
        } else if (raw && typeof raw === "object") {
          if (hasKey(raw, { selectedIds: true })) {
            const selectedIdsValue = raw.selectedIds;
            if (Array.isArray(selectedIdsValue)) {
              selectedInputs = selectedIdsValue.filter((item) => typeof item === "string");
            }
          }
          if (hasKey(raw, { freeform: true }) && typeof raw.freeform === "string") {
            freeformInput = raw.freeform;
          }
        }
        const selectedValues = selectedInputs.map((input) => this.matchQuestionOption(question, input)?.value).filter((value) => value !== void 0);
        const freeformValue = freeformInput?.trim();
        if (selectedValues.length > 0 || freeformValue && freeformValue.length > 0) {
          return { selectedValues, freeformValue };
        }
        return void 0;
      }
    }
  }
  matchQuestionOption(question, rawInput) {
    const options = question.options ?? [];
    if (!options.length) {
      return void 0;
    }
    const normalized = rawInput.trim().toLowerCase();
    const numeric = Number.parseInt(normalized, 10);
    if (!Number.isNaN(numeric) && numeric > 0 && numeric <= options.length) {
      const option = options[numeric - 1];
      return { id: option.id, value: option.value };
    }
    const exactId = options.find((option) => option.id.toLowerCase() === normalized);
    if (exactId) {
      return { id: exactId.id, value: exactId.value };
    }
    const exactLabel = options.find((option) => option.label.toLowerCase() === normalized);
    if (exactLabel) {
      return { id: exactLabel.id, value: exactLabel.value };
    }
    const partialLabel = options.find((option) => option.label.toLowerCase().includes(normalized));
    if (partialLabel) {
      return { id: partialLabel.id, value: partialLabel.value };
    }
    return void 0;
  }
  // #endregion
  // #region Fallback answers
  buildFallbackCarouselAnswers(carousel, requestMessageText) {
    const answers = /* @__PURE__ */ new Map();
    for (const question of carousel.questions) {
      const answer = this.getFallbackAnswerForQuestion(question, requestMessageText);
      if (answer !== void 0) {
        answers.set(question.id, answer);
      }
    }
    return answers;
  }
  getFallbackAnswerForQuestion(question, requestMessageText) {
    const fallbackFreeform = requestMessageText?.trim() || localize("chat.questionCarousel.autoReplyFallback", "OK");
    switch (question.type) {
      case "text":
        return question.defaultValue ?? fallbackFreeform;
      case "singleSelect": {
        const defaultOptionId = typeof question.defaultValue === "string" ? question.defaultValue : void 0;
        const defaultOption = defaultOptionId ? question.options?.find((opt) => opt.id === defaultOptionId) : void 0;
        if (defaultOption) {
          return { selectedValue: defaultOption.value, freeformValue: void 0 };
        }
        if (question.options && question.options.length > 0) {
          return { selectedValue: question.options[0].value, freeformValue: void 0 };
        }
        if (question.allowFreeformInput) {
          return { selectedValue: void 0, freeformValue: fallbackFreeform };
        }
        return void 0;
      }
      case "multiSelect": {
        const defaultIds = Array.isArray(question.defaultValue) ? question.defaultValue : typeof question.defaultValue === "string" ? [question.defaultValue] : [];
        const selectedValues = question.options?.filter((opt) => defaultIds.includes(opt.id)).map((opt) => opt.value).filter((value) => value !== void 0) ?? [];
        if (selectedValues.length > 0) {
          return { selectedValues, freeformValue: void 0 };
        }
        if (question.options && question.options.length > 0) {
          return { selectedValues: [question.options[0].value], freeformValue: void 0 };
        }
        if (question.allowFreeformInput) {
          return { selectedValues: [], freeformValue: fallbackFreeform };
        }
        return void 0;
      }
    }
  }
  // #endregion
  // #region Utilities
  tryParseJsonObject(text) {
    const trimmed = text.trim();
    if (!trimmed) {
      return void 0;
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    const candidate = start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return void 0;
    }
    return void 0;
  }
};
ChatQuestionCarouselAutoReply = __decorate([
  __param(0, IConfigurationService),
  __param(1, IDialogService),
  __param(2, ILogService),
  __param(3, IStorageService),
  __param(4, ILanguageModelsService)
], ChatQuestionCarouselAutoReply);
export {
  ChatQuestionCarouselAutoReply
};
//# sourceMappingURL=chatQuestionCarouselAutoReply.js.map
