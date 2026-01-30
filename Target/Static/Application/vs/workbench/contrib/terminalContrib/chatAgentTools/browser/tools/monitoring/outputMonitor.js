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
import { timeout } from "../../../../../../../base/common/async.js";
import { Emitter } from "../../../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../../../base/common/htmlContent.js";
import { Disposable, MutableDisposable } from "../../../../../../../base/common/lifecycle.js";
import { isObject, isString } from "../../../../../../../base/common/types.js";
import { localize } from "../../../../../../../nls.js";
import { ExtensionIdentifier } from "../../../../../../../platform/extensions/common/extensions.js";
import { IChatWidgetService } from "../../../../../chat/browser/chat.js";
import { ChatElicitationRequestPart } from "../../../../../chat/common/model/chatProgressTypes/chatElicitationRequestPart.js";
import { ChatModel } from "../../../../../chat/common/model/chatModel.js";
import { IChatService } from "../../../../../chat/common/chatService/chatService.js";
import { ChatAgentLocation } from "../../../../../chat/common/constants.js";
import { ILanguageModelsService } from "../../../../../chat/common/languageModels.js";
import { ITaskService } from "../../../../../tasks/common/taskService.js";
import { OutputMonitorState } from "./types.js";
import { getTextResponseFromStream } from "./utils.js";
import { IConfigurationService } from "../../../../../../../platform/configuration/common/configuration.js";
import { ITerminalService } from "../../../../../terminal/browser/terminal.js";
import { LocalChatSessionUri } from "../../../../../chat/common/model/chatUri.js";
import { ITerminalLogService } from "../../../../../../../platform/terminal/common/terminal.js";
let OutputMonitor = class OutputMonitor2 extends Disposable {
  static {
    __name(this, "OutputMonitor");
  }
  get state() {
    return this._state;
  }
  get pollingResult() {
    return this._pollingResult;
  }
  get outputMonitorTelemetryCounters() {
    return this._outputMonitorTelemetryCounters;
  }
  constructor(_execution, _pollFn, invocationContext, token, command, _languageModelsService, _taskService, _chatService, _chatWidgetService, _configurationService, _logService, _terminalService) {
    super();
    this._execution = _execution;
    this._pollFn = _pollFn;
    this._languageModelsService = _languageModelsService;
    this._taskService = _taskService;
    this._chatService = _chatService;
    this._chatWidgetService = _chatWidgetService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._terminalService = _terminalService;
    this._state = OutputMonitorState.PollingForIdle;
    this._userInputtedSinceIdleDetected = false;
    this._userInputListener = this._register(new MutableDisposable());
    this._outputMonitorTelemetryCounters = {
      inputToolManualAcceptCount: 0,
      inputToolManualRejectCount: 0,
      inputToolManualChars: 0,
      inputToolAutoAcceptCount: 0,
      inputToolAutoChars: 0,
      inputToolManualShownCount: 0,
      inputToolFreeFormInputShownCount: 0,
      inputToolFreeFormInputCount: 0
    };
    this._onDidFinishCommand = this._register(new Emitter());
    this.onDidFinishCommand = this._onDidFinishCommand.event;
    timeout(0).then(() => {
      this._startMonitoring(command, invocationContext, token);
    });
  }
  async _startMonitoring(command, invocationContext, token) {
    const pollStartTime = Date.now();
    let modelOutputEvalResponse;
    let resources;
    let output;
    let extended = false;
    try {
      while (!token.isCancellationRequested) {
        switch (this._state) {
          case OutputMonitorState.PollingForIdle: {
            this._state = await this._waitForIdle(this._execution, extended, token);
            continue;
          }
          case OutputMonitorState.Timeout: {
            const shouldContinuePolling = await this._handleTimeoutState(command, invocationContext, extended, token);
            if (shouldContinuePolling) {
              extended = true;
              this._state = OutputMonitorState.PollingForIdle;
              continue;
            } else {
              this._promptPart?.hide();
              this._promptPart = void 0;
              break;
            }
          }
          case OutputMonitorState.Cancelled:
            break;
          case OutputMonitorState.Idle: {
            const idleResult = await this._handleIdleState(token);
            if (idleResult.shouldContinuePollling) {
              this._state = OutputMonitorState.PollingForIdle;
              continue;
            } else {
              resources = idleResult.resources;
              modelOutputEvalResponse = idleResult.modelOutputEvalResponse;
              output = idleResult.output;
            }
            break;
          }
        }
        if (this._state === OutputMonitorState.Idle || this._state === OutputMonitorState.Cancelled || this._state === OutputMonitorState.Timeout) {
          break;
        }
      }
      if (token.isCancellationRequested) {
        this._state = OutputMonitorState.Cancelled;
      }
    } finally {
      this._pollingResult = {
        state: this._state,
        output: output ?? this._execution.getOutput(),
        modelOutputEvalResponse: token.isCancellationRequested ? "Cancelled" : modelOutputEvalResponse,
        pollDurationMs: Date.now() - pollStartTime,
        resources
      };
      this._userInputListener.clear();
      const promptPart = this._promptPart;
      this._promptPart = void 0;
      if (promptPart) {
        try {
          promptPart.hide();
        } catch (err) {
          this._logService.error("OutputMonitor: Failed to hide prompt", err);
        }
      }
      this._onDidFinishCommand.fire();
    }
  }
  async _handleIdleState(token) {
    const output = this._execution.getOutput(this._lastPromptMarker);
    if (detectsNonInteractiveHelpPattern(output)) {
      return { shouldContinuePollling: false, output };
    }
    if (this._userInputtedSinceIdleDetected) {
      this._cleanupIdleInputListener();
      return { shouldContinuePollling: true };
    }
    const confirmationPrompt = await this._determineUserInputOptions(this._execution, token);
    if (this._userInputtedSinceIdleDetected) {
      this._cleanupIdleInputListener();
      return { shouldContinuePollling: true };
    }
    if (confirmationPrompt?.detectedRequestForFreeFormInput) {
      if (this._userInputtedSinceIdleDetected) {
        this._cleanupIdleInputListener();
        return { shouldContinuePollling: true };
      }
      this._cleanupIdleInputListener();
      this._outputMonitorTelemetryCounters.inputToolFreeFormInputShownCount++;
      const receivedTerminalInput = await this._requestFreeFormTerminalInput(token, this._execution, confirmationPrompt);
      if (receivedTerminalInput) {
        await timeout(200);
        return { shouldContinuePollling: true };
      } else {
        return { shouldContinuePollling: false };
      }
    }
    if (confirmationPrompt?.options.length) {
      const suggestedOptionResult = await this._selectAndHandleOption(confirmationPrompt, token);
      if (suggestedOptionResult?.sentToTerminal) {
        this._cleanupIdleInputListener();
        return { shouldContinuePollling: true };
      }
      if (this._userInputtedSinceIdleDetected) {
        this._cleanupIdleInputListener();
        return { shouldContinuePollling: true };
      }
      this._cleanupIdleInputListener();
      const confirmed = await this._confirmRunInTerminal(token, suggestedOptionResult?.suggestedOption ?? confirmationPrompt.options[0], this._execution, confirmationPrompt);
      if (confirmed) {
        return { shouldContinuePollling: true };
      } else {
        this._execution.instance.focus(true);
        return { shouldContinuePollling: false };
      }
    }
    this._cleanupIdleInputListener();
    const custom = await this._pollFn?.(this._execution, token, this._taskService);
    const resources = custom?.resources;
    const modelOutputEvalResponse = await this._assessOutputForErrors(this._execution.getOutput(), token);
    return { resources, modelOutputEvalResponse, shouldContinuePollling: false, output: custom?.output ?? output };
  }
  async _handleTimeoutState(_command, _invocationContext, _extended, _token) {
    if (_extended) {
      this._logService.info("OutputMonitor: Extended polling timeout reached after 2 minutes");
      this._state = OutputMonitorState.Cancelled;
      return false;
    }
    return true;
  }
  /**
   * Single bounded polling pass that returns when:
   *  - terminal becomes inactive/idle, or
   *  - timeout window elapses.
   */
  async _waitForIdle(execution, extendedPolling, token) {
    const maxWaitMs = extendedPolling ? 12e4 : 2e4;
    const maxInterval = 1e4;
    let currentInterval = 500;
    let waited = 0;
    let consecutiveIdleEvents = 0;
    let hasReceivedData = false;
    const onDataDisposable = execution.instance.onData((_data) => {
      hasReceivedData = true;
    });
    try {
      while (!token.isCancellationRequested && waited < maxWaitMs) {
        const waitTime = Math.min(currentInterval, maxWaitMs - waited);
        await timeout(waitTime, token);
        waited += waitTime;
        currentInterval = Math.min(currentInterval * 2, maxInterval);
        const currentOutput = execution.getOutput();
        if (detectsNonInteractiveHelpPattern(currentOutput)) {
          this._state = OutputMonitorState.Idle;
          this._setupIdleInputListener();
          return this._state;
        }
        const promptResult = detectsInputRequiredPattern(currentOutput);
        if (promptResult) {
          this._state = OutputMonitorState.Idle;
          this._setupIdleInputListener();
          return this._state;
        }
        if (hasReceivedData) {
          consecutiveIdleEvents = 0;
          hasReceivedData = false;
        } else {
          consecutiveIdleEvents++;
        }
        const recentlyIdle = consecutiveIdleEvents >= 2;
        const isActive = execution.isActive ? await execution.isActive() : void 0;
        this._logService.trace(`OutputMonitor: waitForIdle check: waited=${waited}ms, recentlyIdle=${recentlyIdle}, isActive=${isActive}`);
        if (recentlyIdle && isActive !== true) {
          this._state = OutputMonitorState.Idle;
          this._setupIdleInputListener();
          return this._state;
        }
      }
    } finally {
      onDataDisposable.dispose();
    }
    if (token.isCancellationRequested) {
      return OutputMonitorState.Cancelled;
    }
    return OutputMonitorState.Timeout;
  }
  /**
   * Sets up a listener for user input that triggers immediately when idle is detected.
   * This ensures we catch any input that happens between idle detection and prompt creation.
   */
  _setupIdleInputListener() {
    this._userInputtedSinceIdleDetected = false;
    this._userInputListener.value = this._execution.instance.onDidInputData(() => {
      this._userInputtedSinceIdleDetected = true;
    });
  }
  /**
   * Cleans up the idle input listener and resets the flag.
   */
  _cleanupIdleInputListener() {
    this._userInputtedSinceIdleDetected = false;
    this._userInputListener.clear();
  }
  async _assessOutputForErrors(buffer, token) {
    const model = await this._getLanguageModel();
    if (!model) {
      return "No models available";
    }
    const response = await this._languageModelsService.sendChatRequest(model, new ExtensionIdentifier("core"), [{ role: 1, content: [{ type: "text", value: `Evaluate this terminal output to determine if there were errors. If there are errors, return them. Otherwise, return undefined: ${buffer}.` }] }], {}, token);
    try {
      const responseFromStream = getTextResponseFromStream(response);
      await Promise.all([response.result, responseFromStream]);
      return await responseFromStream;
    } catch (err) {
      return "Error occurred " + err;
    }
  }
  async _determineUserInputOptions(execution, token) {
    if (token.isCancellationRequested) {
      return;
    }
    const model = await this._getLanguageModel();
    if (!model) {
      return void 0;
    }
    const lastLines = execution.getOutput(this._lastPromptMarker).trimEnd().split("\n").slice(-15).join("\n");
    if (detectsNonInteractiveHelpPattern(lastLines)) {
      return void 0;
    }
    const promptText = `Analyze the following terminal output. If it contains a prompt requesting user input (such as a confirmation, selection, or yes/no question) that appears at the VERY END of the output and has NOT already been answered (i.e., there is no user response or subsequent output after the prompt), extract the prompt text. IMPORTANT: Only detect prompts that are at the end of the output with no content following them - if there is any output after the prompt, the prompt has already been answered and you should return null. The prompt may ask to choose from a set. If so, extract the possible options as a JSON object with keys 'prompt', 'options' (an array of strings or an object with option to description mappings), and 'freeFormInput': false. If no options are provided, and free form input is requested, for example: Password:, return the word freeFormInput. For example, if the options are "[Y] Yes  [A] Yes to All  [N] No  [L] No to All  [C] Cancel", the option to description mappings would be {"Y": "Yes", "A": "Yes to All", "N": "No", "L": "No to All", "C": "Cancel"}. If there is no such prompt, return null. If the option is ambiguous, return null.
			Examples:
			1. Output: "Do you want to overwrite? (y/n)"
				Response: {"prompt": "Do you want to overwrite?", "options": ["y", "n"], "freeFormInput": false}

			2. Output: "Confirm: [Y] Yes  [A] Yes to All  [N] No  [L] No to All  [C] Cancel"
				Response: {"prompt": "Confirm", "options": ["Y", "A", "N", "L", "C"], "freeFormInput": false}

			3. Output: "Accept license terms? (yes/no)"
				Response: {"prompt": "Accept license terms?", "options": ["yes", "no"], "freeFormInput": false}

			4. Output: "Press Enter to continue"
				Response: {"prompt": "Press Enter to continue", "options": ["Enter"], "freeFormInput": false}

			5. Output: "Type Yes to proceed"
				Response: {"prompt": "Type Yes to proceed", "options": ["Yes"], "freeFormInput": false}

			6. Output: "Continue [y/N]"
				Response: {"prompt": "Continue", "options": ["y", "N"], "freeFormInput": false}

			7. Output: "Press any key to close the terminal."
				Response: null

			8. Output: "Terminal will be reused by tasks, press any key to close it."
				Response: null

			9. Output: "Password:"
				Response: {"prompt": "Password:", "freeFormInput": true, "options": []}
			10. Output: "press ctrl-c to detach, ctrl-d to kill"
				Response: null
			11. Output: "Continue (y/n)? y"
				Response: null (the prompt was already answered with 'y')
			12. Output: "Do you want to proceed? (yes/no)
yes
Proceeding with operation..."
				Response: null (the prompt was already answered and there is subsequent output)

			Alternatively, the prompt may request free form input, for example:
			1. Output: "Enter your username:"
				Response: {"prompt": "Enter your username:", "freeFormInput": true, "options": []}
			2. Output: "Password:"
				Response: {"prompt": "Password:", "freeFormInput": true, "options": []}
			Now, analyze this output:
			${lastLines}
			`;
    const response = await this._languageModelsService.sendChatRequest(model, new ExtensionIdentifier("core"), [{ role: 1, content: [{ type: "text", value: promptText }] }], {}, token);
    const responseText = await getTextResponseFromStream(response);
    try {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        const obj = JSON.parse(match[0]);
        if (isObject(obj) && "prompt" in obj && isString(obj.prompt) && "options" in obj && "options" in obj && "freeFormInput" in obj && typeof obj.freeFormInput === "boolean") {
          if (this._lastPrompt === obj.prompt) {
            return;
          }
          if (obj.freeFormInput === true) {
            return { prompt: obj.prompt, options: [], detectedRequestForFreeFormInput: true };
          }
          if (Array.isArray(obj.options) && obj.options.every(isString)) {
            return { prompt: obj.prompt, options: obj.options, detectedRequestForFreeFormInput: obj.freeFormInput };
          } else if (isObject(obj.options) && Object.values(obj.options).every(isString)) {
            const keys = Object.keys(obj.options);
            if (keys.length === 0) {
              return void 0;
            }
            const descriptions = keys.map((key) => obj.options[key]);
            return { prompt: obj.prompt, options: keys, descriptions, detectedRequestForFreeFormInput: obj.freeFormInput };
          }
        }
      }
    } catch (err) {
      console.error("Failed to parse confirmation prompt from language model response:", err);
    }
    return void 0;
  }
  async _selectAndHandleOption(confirmationPrompt, token) {
    if (!confirmationPrompt?.options.length) {
      return void 0;
    }
    const model = this._chatWidgetService.getWidgetsByLocations(ChatAgentLocation.Chat)[0]?.input.currentLanguageModel;
    if (!model) {
      return void 0;
    }
    const models = await this._languageModelsService.selectLanguageModels({ vendor: "copilot", family: model.replaceAll("copilot/", "") });
    if (!models.length) {
      return void 0;
    }
    const prompt = confirmationPrompt.prompt;
    const options = confirmationPrompt.options;
    const currentMarker = this._execution.instance.registerMarker();
    if (!currentMarker) {
      return void 0;
    }
    this._lastPromptMarker = currentMarker;
    this._lastPrompt = prompt;
    const promptText = `Given the following confirmation prompt and options from a terminal output, which option is the default?
Prompt: "${prompt}"
Options: ${JSON.stringify(options)}
Respond with only the option string.`;
    const response = await this._languageModelsService.sendChatRequest(models[0], new ExtensionIdentifier("core"), [
      { role: 1, content: [{ type: "text", value: promptText }] }
    ], {}, token);
    const suggestedOption = (await getTextResponseFromStream(response)).trim();
    if (!suggestedOption) {
      return;
    }
    const parsed = suggestedOption.replace(/['"`]/g, "").trim();
    const index = confirmationPrompt.options.indexOf(parsed);
    const validOption = confirmationPrompt.options.find((opt) => parsed === opt.replace(/['"`]/g, "").trim());
    if (!validOption || index === -1) {
      return;
    }
    let sentToTerminal = false;
    if (this._configurationService.getValue(
      "chat.tools.terminal.autoReplyToPrompts"
      /* TerminalChatAgentToolsSettingId.AutoReplyToPrompts */
    )) {
      await this._execution.instance.sendText(validOption, true);
      this._outputMonitorTelemetryCounters.inputToolAutoAcceptCount++;
      this._outputMonitorTelemetryCounters.inputToolAutoChars += validOption?.length || 0;
      sentToTerminal = true;
    }
    const description = confirmationPrompt.descriptions?.[index];
    return description ? { suggestedOption: { description, option: validOption }, sentToTerminal } : { suggestedOption: validOption, sentToTerminal };
  }
  async _requestFreeFormTerminalInput(token, execution, confirmationPrompt) {
    const focusTerminalSelection = /* @__PURE__ */ Symbol("focusTerminalSelection");
    const { promise: userPrompt, part } = this._createElicitationPart(token, execution.sessionId, new MarkdownString(localize("poll.terminal.inputRequest", "The terminal is awaiting input.")), new MarkdownString(localize("poll.terminal.requireInput", "{0}\nPlease provide the required input to the terminal.\n\n", confirmationPrompt.prompt)), "", localize("poll.terminal.enterInput", "Focus terminal"), void 0, () => {
      this._showInstance(execution.instance.instanceId);
      return focusTerminalSelection;
    });
    let inputDataDisposable = Disposable.None;
    let instanceDisposedDisposable = Disposable.None;
    const inputPromise = new Promise((resolve) => {
      let settled = false;
      const settle = /* @__PURE__ */ __name((value, state) => {
        if (settled) {
          return;
        }
        settled = true;
        part.hide();
        inputDataDisposable.dispose();
        instanceDisposedDisposable.dispose();
        this._state = state;
        resolve(value);
      }, "settle");
      inputDataDisposable = this._register(execution.instance.onDidInputData((data) => {
        if (!data || data === "\r" || data === "\n" || data === "\r\n") {
          this._outputMonitorTelemetryCounters.inputToolFreeFormInputCount++;
          settle(true, OutputMonitorState.PollingForIdle);
        }
      }));
      instanceDisposedDisposable = this._register(execution.instance.onDisposed(() => {
        settle(false, OutputMonitorState.Cancelled);
      }));
    });
    const disposeListeners = /* @__PURE__ */ __name(() => {
      inputDataDisposable.dispose();
      instanceDisposedDisposable.dispose();
    }, "disposeListeners");
    const result = await Promise.race([userPrompt, inputPromise]);
    if (result === focusTerminalSelection) {
      execution.instance.focus(true);
      return await inputPromise;
    }
    if (result === void 0) {
      disposeListeners();
      return false;
    }
    disposeListeners();
    return !!result;
  }
  async _confirmRunInTerminal(token, suggestedOption, execution, confirmationPrompt) {
    const suggestedOptionValue = isString(suggestedOption) ? suggestedOption : suggestedOption.option;
    if (suggestedOptionValue === "any key") {
      return;
    }
    const focusTerminalSelection = /* @__PURE__ */ Symbol("focusTerminalSelection");
    let inputDataDisposable = Disposable.None;
    let instanceDisposedDisposable = Disposable.None;
    const { promise: userPrompt, part } = this._createElicitationPart(token, execution.sessionId, new MarkdownString(localize("poll.terminal.confirmRequired", "The terminal is awaiting input.")), new MarkdownString(localize("poll.terminal.confirmRunDetail", "{0}\n Do you want to send `{1}`{2} followed by `Enter` to the terminal?", confirmationPrompt.prompt, suggestedOptionValue, isString(suggestedOption) ? "" : suggestedOption.description ? " (" + suggestedOption.description + ")" : "")), "", localize("poll.terminal.acceptRun", "Allow"), localize("poll.terminal.rejectRun", "Focus Terminal"), async (value) => {
      let option = void 0;
      if (value === true) {
        option = suggestedOptionValue;
      } else if (typeof value === "object" && "label" in value) {
        option = value.label.split(" (")[0];
      }
      this._outputMonitorTelemetryCounters.inputToolManualAcceptCount++;
      this._outputMonitorTelemetryCounters.inputToolManualChars += option?.length || 0;
      return option;
    }, () => {
      this._showInstance(execution.instance.instanceId);
      this._outputMonitorTelemetryCounters.inputToolManualRejectCount++;
      return focusTerminalSelection;
    }, getMoreActions(suggestedOption, confirmationPrompt));
    const inputPromise = new Promise((resolve) => {
      let settled = false;
      const settle = /* @__PURE__ */ __name((value, state) => {
        if (settled) {
          return;
        }
        settled = true;
        part.hide();
        inputDataDisposable.dispose();
        instanceDisposedDisposable.dispose();
        this._state = state;
        resolve(value);
      }, "settle");
      inputDataDisposable = this._register(execution.instance.onDidInputData(() => {
        settle(true, OutputMonitorState.PollingForIdle);
      }));
      instanceDisposedDisposable = this._register(execution.instance.onDisposed(() => {
        settle(false, OutputMonitorState.Cancelled);
      }));
    });
    const disposeListeners = /* @__PURE__ */ __name(() => {
      inputDataDisposable.dispose();
      instanceDisposedDisposable.dispose();
    }, "disposeListeners");
    const optionToRun = await Promise.race([userPrompt, inputPromise]);
    if (optionToRun === focusTerminalSelection) {
      execution.instance.focus(true);
      return await inputPromise;
    }
    if (optionToRun === true) {
      disposeListeners();
      return true;
    }
    if (typeof optionToRun === "string" && optionToRun.length) {
      execution.instance.focus(true);
      disposeListeners();
      await execution.instance.sendText(optionToRun, true);
      return optionToRun;
    }
    disposeListeners();
    return optionToRun;
  }
  _showInstance(instanceId) {
    if (!instanceId) {
      return;
    }
    const instance = this._terminalService.getInstanceFromId(instanceId);
    if (!instance) {
      return;
    }
    this._terminalService.setActiveInstance(instance);
    this._terminalService.revealActiveTerminal(true);
  }
  // Helper to create, register, and wire a ChatElicitationRequestPart. Returns the promise that
  // resolves when the part is accepted/rejected and the registered part itself so callers can
  // attach additional listeners (e.g., onDidRequestHide) or compose with other promises.
  _createElicitationPart(token, sessionId, title, detail, subtitle, acceptLabel, rejectLabel, onAccept, onReject, moreActions) {
    const chatModel = sessionId && this._chatService.getSession(LocalChatSessionUri.forSession(sessionId));
    if (!(chatModel instanceof ChatModel)) {
      throw new Error("No model");
    }
    const request = chatModel.getRequests().at(-1);
    if (!request) {
      throw new Error("No request");
    }
    let part;
    const promise = new Promise((resolve) => {
      const thePart = part = new ChatElicitationRequestPart(
        title,
        detail,
        subtitle,
        acceptLabel,
        rejectLabel,
        async (value) => {
          thePart.hide();
          this._promptPart = void 0;
          try {
            const r = await (onAccept ? onAccept(value) : void 0);
            resolve(r);
          } catch {
            resolve(void 0);
          }
          return "accepted";
        },
        async () => {
          thePart.hide();
          this._promptPart = void 0;
          try {
            const r = await (onReject ? onReject() : void 0);
            resolve(r);
          } catch {
            resolve(void 0);
          }
          return "rejected";
        },
        void 0,
        // source
        moreActions,
        () => this._outputMonitorTelemetryCounters.inputToolManualShownCount++
      );
      chatModel.acceptResponseProgress(request, thePart);
      this._promptPart = thePart;
    });
    this._register(token.onCancellationRequested(() => part.hide()));
    return { promise, part };
  }
  async _getLanguageModel() {
    let models = await this._languageModelsService.selectLanguageModels({ vendor: "copilot", id: "copilot-fast" });
    if (!models.length) {
      models = await this._languageModelsService.selectLanguageModels({ vendor: "copilot", family: "gpt-4o-mini" });
    }
    return models.length ? models[0] : void 0;
  }
};
OutputMonitor = __decorate([
  __param(5, ILanguageModelsService),
  __param(6, ITaskService),
  __param(7, IChatService),
  __param(8, IChatWidgetService),
  __param(9, IConfigurationService),
  __param(10, ITerminalLogService),
  __param(11, ITerminalService)
], OutputMonitor);
function getMoreActions(suggestedOption, confirmationPrompt) {
  const moreActions = [];
  const moreOptions = confirmationPrompt.options.filter((a) => a !== (isString(suggestedOption) ? suggestedOption : suggestedOption.option));
  let i = 0;
  for (const option of moreOptions) {
    const label = option + (confirmationPrompt.descriptions ? " (" + confirmationPrompt.descriptions[i] + ")" : "");
    const action = {
      label,
      tooltip: label,
      id: `terminal.poll.send.${option}`,
      class: void 0,
      enabled: true,
      run: /* @__PURE__ */ __name(async () => {
      }, "run")
    };
    i++;
    moreActions.push(action);
  }
  return moreActions.length ? moreActions : void 0;
}
__name(getMoreActions, "getMoreActions");
function detectsInputRequiredPattern(cursorLine) {
  return [
    // PowerShell-style multi-option line (supports [?] Help and optional default suffix) ending
    // in whitespace
    /\s*(?:\[[^\]]\]\s+[^\[\s][^\[]*\s*)+(?:\(default is\s+"[^"]+"\):)?\s+$/,
    // Bracketed/parenthesized yes/no pairs at end of line: (y/n), [Y/n], (yes/no), [no/yes]
    /(?:\(|\[)\s*(?:y(?:es)?\s*\/\s*n(?:o)?|n(?:o)?\s*\/\s*y(?:es)?)\s*(?:\]|\))\s+$/i,
    // Same as above but allows a preceding '?' or ':' and optional wrappers e.g.
    // "Continue? (y/n)" or "Overwrite: [yes/no]"
    /[?:]\s*(?:\(|\[)?\s*y(?:es)?\s*\/\s*n(?:o)?\s*(?:\]|\))?\s+$/i,
    // Confirmation prompts ending with (y) e.g. "Ok to proceed? (y)"
    /\(y\)\s*$/i,
    // Line ends with ':'
    /:\s*$/,
    // Line contains (END) which is common in pagers
    /\(END\)$/,
    // Password prompt
    /password[:]?$/i,
    // Line ends with '?'
    /\?\s*(?:\([a-z\s]+\))?$/i,
    // "Press a key" or "Press any key"
    /press a(?:ny)? key/i
  ].some((e) => e.test(cursorLine));
}
__name(detectsInputRequiredPattern, "detectsInputRequiredPattern");
function detectsNonInteractiveHelpPattern(cursorLine) {
  return [
    /press [h?]\s*(?:\+\s*enter)?\s*to (?:show|open|display|get|see)\s*(?:available )?(?:help|commands|options)/i,
    /press h\s*(?:or\s*\?)?\s*(?:\+\s*enter)?\s*for (?:help|commands|options)/i,
    /press \?\s*(?:\+\s*enter)?\s*(?:to|for)?\s*(?:help|commands|options|list)/i,
    /type\s*[h?]\s*(?:\+\s*enter)?\s*(?:for|to see|to show)\s*(?:help|commands|options)/i,
    /hit\s*[h?]\s*(?:\+\s*enter)?\s*(?:for|to see|to show)\s*(?:help|commands|options)/i,
    /press o\s*(?:\+\s*enter)?\s*(?:to|for)?\s*(?:open|launch)(?:\s*(?:the )?(?:app|application|browser)|\s+in\s+(?:the\s+)?browser)?/i,
    /press r\s*(?:\+\s*enter)?\s*(?:to|for)?\s*(?:restart|reload|refresh)(?:\s*(?:the )?(?:server|dev server|service))?/i,
    /press q\s*(?:\+\s*enter)?\s*(?:to|for)?\s*(?:quit|exit|stop)(?:\s*(?:the )?(?:server|app|process))?/i,
    /press u\s*(?:\+\s*enter)?\s*(?:to|for)?\s*(?:show|print|display)\s*(?:the )?(?:server )?urls?/i
  ].some((e) => e.test(cursorLine));
}
__name(detectsNonInteractiveHelpPattern, "detectsNonInteractiveHelpPattern");
export {
  OutputMonitor,
  detectsInputRequiredPattern,
  detectsNonInteractiveHelpPattern
};
//# sourceMappingURL=outputMonitor.js.map
