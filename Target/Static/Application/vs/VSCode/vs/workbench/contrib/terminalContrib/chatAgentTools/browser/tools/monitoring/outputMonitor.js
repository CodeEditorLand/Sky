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
import { IChatWidgetService } from "../../../../../chat/browser/chat.js";
import { ChatElicitationRequestPart } from "../../../../../chat/common/model/chatProgressTypes/chatElicitationRequestPart.js";
import { ChatModel } from "../../../../../chat/common/model/chatModel.js";
import { IChatService } from "../../../../../chat/common/chatService/chatService.js";
import { ChatAgentLocation, ChatPermissionLevel } from "../../../../../chat/common/constants.js";
import { getTextResponseFromStream, ILanguageModelsService } from "../../../../../chat/common/languageModels.js";
import { ITaskService } from "../../../../../tasks/common/taskService.js";
import { OutputMonitorState } from "./types.js";
import { IConfigurationService } from "../../../../../../../platform/configuration/common/configuration.js";
import { ITerminalService } from "../../../../../terminal/browser/terminal.js";
import { ITerminalLogService } from "../../../../../../../platform/terminal/common/terminal.js";
let OutputMonitor = class OutputMonitor2 extends Disposable {
  static {
    __name(this, "OutputMonitor");
  }
  get state() {
    return this._state;
  }
  _formatLastLineForLog(output) {
    if (!output) {
      return "<empty>";
    }
    const lastLine = output.trimEnd().split(/\r?\n/).pop() ?? "";
    if (!lastLine) {
      return "<empty>";
    }
    if (this._isSensitivePrompt(lastLine)) {
      return "<redacted>";
    }
    return lastLine.length > 200 ? lastLine.slice(0, 200) + "\u2026" : lastLine;
  }
  _formatOptionsForLog(options) {
    if (!options.length) {
      return "[]";
    }
    const maxOptions = 12;
    const shown = options.slice(0, maxOptions).map((o) => o.replace(/\r?\n/g, "return"));
    const suffix = options.length > maxOptions ? `, \u2026(+${options.length - maxOptions})` : "";
    return `[${shown.join(", ")}${suffix}]`;
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
    this._sessionResource = invocationContext?.sessionResource;
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
            this._logService.trace(`OutputMonitor: Entering PollingForIdle (extended=${extended})`);
            this._state = await this._waitForIdle(this._execution, extended, token);
            this._logService.trace(`OutputMonitor: PollingForIdle completed -> state=${OutputMonitorState[this._state]}`);
            continue;
          }
          case OutputMonitorState.Timeout: {
            this._logService.trace(`OutputMonitor: Entering Timeout state (extended=${extended})`);
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
            this._logService.trace("OutputMonitor: Entering Idle handler");
            const idleResult = await this._handleIdleState(token);
            if (idleResult.shouldContinuePollling) {
              this._logService.trace("OutputMonitor: Idle handler -> continue polling");
              this._state = OutputMonitorState.PollingForIdle;
              continue;
            } else {
              this._logService.trace(`OutputMonitor: Idle handler -> stop polling (hasResources=${!!idleResult.resources}, hasModelEval=${!!idleResult.modelOutputEvalResponse}, outputLen=${idleResult.output?.length ?? 0})`);
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
      this._logService.trace(`OutputMonitor: Monitoring finished (state=${OutputMonitorState[this._state]}, duration=${Date.now() - pollStartTime}ms)`);
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
    this._logService.trace(`OutputMonitor: Idle output summary: len=${output.length}, lastLine=${this._formatLastLineForLog(output)}`);
    if (detectsNonInteractiveHelpPattern(output)) {
      this._logService.trace("OutputMonitor: Idle -> non-interactive help pattern detected, stopping");
      return { shouldContinuePollling: false, output };
    }
    const isTask = this._execution.task !== void 0;
    const isTaskInactive = this._execution.isActive ? !await this._execution.isActive() : true;
    if (isTask && isTaskInactive && detectsVSCodeTaskFinishMessage(output)) {
      this._logService.trace("OutputMonitor: Idle -> VS Code task finish message detected for inactive task, stopping");
      return { shouldContinuePollling: false, output };
    }
    if ((!isTask || !isTaskInactive) && detectsGenericPressAnyKeyPattern(output)) {
      this._logService.trace('OutputMonitor: Idle -> generic "press any key" detected');
      const autoReply = this._configurationService.getValue(
        "chat.tools.terminal.autoReplyToPrompts"
        /* TerminalChatAgentToolsSettingId.AutoReplyToPrompts */
      ) || this._isAutopilotMode();
      if (autoReply) {
        this._logService.trace('OutputMonitor: Auto-reply enabled -> not showing free-form prompt for "press any key", stopping');
        this._cleanupIdleInputListener();
        return { shouldContinuePollling: false, output };
      }
      this._logService.trace('OutputMonitor: Requesting free-form input for "press any key"');
      const currentMarker = this._execution.instance.registerMarker();
      if (currentMarker) {
        this._lastPromptMarker = currentMarker;
      }
      this._cleanupIdleInputListener();
      this._outputMonitorTelemetryCounters.inputToolFreeFormInputShownCount++;
      const lastLine = output.trimEnd().split(/\r?\n/).pop() || "";
      const receivedTerminalInput = await this._requestFreeFormTerminalInput(
        token,
        this._execution,
        {
          prompt: lastLine,
          options: [],
          detectedRequestForFreeFormInput: true
        },
        true
        /* acceptAnyKey */
      );
      if (receivedTerminalInput) {
        this._logService.trace('OutputMonitor: Free-form input received for "press any key", continue polling');
        await timeout(200);
        return { shouldContinuePollling: true };
      } else {
        this._logService.trace('OutputMonitor: Free-form input declined for "press any key", stopping');
        return { shouldContinuePollling: false };
      }
    }
    if (this._userInputtedSinceIdleDetected) {
      this._logService.trace("OutputMonitor: User input detected since idle; skipping prompt and continuing polling");
      this._cleanupIdleInputListener();
      return { shouldContinuePollling: true };
    }
    this._logService.trace("OutputMonitor: Determining user input options via language model");
    const confirmationPrompt = await this._determineUserInputOptions(this._execution, token);
    this._logService.trace(`OutputMonitor: Input options result: ${confirmationPrompt ? `prompt=${this._formatLastLineForLog(confirmationPrompt.prompt)}, options=${confirmationPrompt.options.length} ${this._formatOptionsForLog(confirmationPrompt.options)}, freeForm=${!!confirmationPrompt.detectedRequestForFreeFormInput}` : "none"}`);
    if (this._userInputtedSinceIdleDetected) {
      this._logService.trace("OutputMonitor: User input arrived during input-option analysis; continuing polling");
      this._cleanupIdleInputListener();
      return { shouldContinuePollling: true };
    }
    if (confirmationPrompt?.detectedRequestForFreeFormInput) {
      if (this._userInputtedSinceIdleDetected) {
        this._logService.trace("OutputMonitor: User input arrived before showing free-form prompt; continuing polling");
        this._cleanupIdleInputListener();
        return { shouldContinuePollling: true };
      }
      const autoReply = this._configurationService.getValue(
        "chat.tools.terminal.autoReplyToPrompts"
        /* TerminalChatAgentToolsSettingId.AutoReplyToPrompts */
      ) || this._isAutopilotMode();
      if (autoReply) {
        this._logService.trace("OutputMonitor: Auto-reply enabled -> not propagating free-form prompt, stopping");
        this._cleanupIdleInputListener();
        return { shouldContinuePollling: false, output };
      }
      this._cleanupIdleInputListener();
      this._outputMonitorTelemetryCounters.inputToolFreeFormInputShownCount++;
      this._logService.trace("OutputMonitor: Showing free-form input elicitation");
      const receivedTerminalInput = await this._requestFreeFormTerminalInput(token, this._execution, confirmationPrompt);
      if (receivedTerminalInput) {
        this._logService.trace("OutputMonitor: Free-form input received; continuing polling");
        await timeout(200);
        return { shouldContinuePollling: true };
      } else {
        this._logService.trace("OutputMonitor: Free-form input declined; stopping");
        return { shouldContinuePollling: false };
      }
    }
    if (confirmationPrompt?.options.length) {
      this._logService.trace(`OutputMonitor: Showing option-based input flow (options=${confirmationPrompt.options.length})`);
      const suggestedOptionResult = await this._selectAndHandleOption(confirmationPrompt, token);
      this._logService.trace(`OutputMonitor: Suggested option result: ${suggestedOptionResult?.suggestedOption ? "hasSuggestion" : "none"} (autoSent=${!!suggestedOptionResult?.sentToTerminal})`);
      if (suggestedOptionResult?.sentToTerminal) {
        this._cleanupIdleInputListener();
        return { shouldContinuePollling: true };
      }
      if (this._userInputtedSinceIdleDetected) {
        this._logService.trace("OutputMonitor: User input arrived during option selection; continuing polling");
        this._cleanupIdleInputListener();
        return { shouldContinuePollling: true };
      }
      this._cleanupIdleInputListener();
      this._logService.trace("OutputMonitor: Showing confirmation elicitation for suggested option");
      const confirmed = await this._confirmRunInTerminal(token, suggestedOptionResult?.suggestedOption ?? confirmationPrompt.options[0], this._execution, confirmationPrompt);
      if (confirmed) {
        this._logService.trace("OutputMonitor: Option confirmed/sent; continuing polling");
        return { shouldContinuePollling: true };
      } else {
        this._logService.trace("OutputMonitor: Option declined; stopping");
        this._execution.instance.focus(true);
        return { shouldContinuePollling: false };
      }
    }
    this._cleanupIdleInputListener();
    const custom = await this._pollFn?.(this._execution, token, this._taskService);
    this._logService.trace(`OutputMonitor: Custom poller result: ${custom ? "provided" : "none"}`);
    const resources = custom?.resources;
    const modelOutputEvalResponse = this._pollFn ? void 0 : await this._assessOutputForErrors(this._execution.getOutput(), token);
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
          this._logService.trace(`OutputMonitor: waitForIdle -> non-interactive help detected (waited=${waited}ms)`);
          this._state = OutputMonitorState.Idle;
          this._setupIdleInputListener();
          return this._state;
        }
        const promptResult = detectsInputRequiredPattern(currentOutput);
        if (promptResult) {
          this._logService.trace(`OutputMonitor: waitForIdle -> input-required pattern detected (waited=${waited}ms, lastLine=${this._formatLastLineForLog(currentOutput)})`);
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
          this._logService.trace(`OutputMonitor: waitForIdle -> recentlyIdle && !active (waited=${waited}ms, lastLine=${this._formatLastLineForLog(currentOutput)})`);
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
    this._logService.trace("OutputMonitor: Setting up idle input listener");
    this._userInputListener.value = this._execution.instance.onDidInputData(() => {
      this._userInputtedSinceIdleDetected = true;
      this._logService.trace("OutputMonitor: Detected user terminal input while idle");
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
    const response = await this._languageModelsService.sendChatRequest(model, void 0, [{ role: 1, content: [{ type: "text", value: `Evaluate this terminal output to determine if there were errors. If there are errors, return them. Otherwise, return undefined: ${buffer}.` }] }], {}, token);
    try {
      return await getTextResponseFromStream(response);
    } catch (err) {
      return "Error occurred " + err;
    }
  }
  async _determineUserInputOptions(execution, token) {
    if (token.isCancellationRequested) {
      this._logService.trace("OutputMonitor: determineUserInputOptions cancelled before start");
      return;
    }
    const model = await this._getLanguageModel();
    if (!model) {
      this._logService.trace("OutputMonitor: determineUserInputOptions no language model available");
      return void 0;
    }
    const lastLines = execution.getOutput(this._lastPromptMarker).trimEnd().split("\n").slice(-15).join("\n");
    this._logService.trace(`OutputMonitor: determineUserInputOptions analyzing lastLines (len=${lastLines.length})`);
    if (detectsNonInteractiveHelpPattern(lastLines)) {
      return void 0;
    }
    const promptText = `Analyze the following terminal output. If it contains a prompt requesting user input (such as a confirmation, selection, or yes/no question) that appears at the VERY END of the output and has NOT already been answered (i.e., there is no user response or subsequent output after the prompt), extract the prompt text. IMPORTANT: Only detect prompts that are at the end of the output with no content following them - if there is any output after the prompt, the prompt has already been answered and you should return null. The prompt may ask to choose from a set. If so, extract the possible options as a JSON object with keys 'prompt', 'options' (an array of strings or an object with option to description mappings), and 'freeFormInput': false. If no options are provided, and free form input is requested, return a JSON object with keys 'prompt', 'options', 'freeFormInput': true, and 'input'. The 'input' field should be the exact text to type only when the output explicitly states what to type (for example, Type "exit" to quit). If there is no explicit input, set 'input' to null. For Enter, set 'input' to "\\r". If the option is ambiguous, return null.
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

			7. Output: "Password:"
				Response: {"prompt": "Password:", "freeFormInput": true, "options": [], "input": null}
			8. Output: "press ctrl-c to detach, ctrl-d to kill"
				Response: null
			9. Output: "Continue (y/n)? y"
				Response: null (the prompt was already answered with 'y')
			10. Output: "Do you want to proceed? (yes/no)
yes
Proceeding with operation..."
				Response: null (the prompt was already answered and there is subsequent output)

			Alternatively, the prompt may request free form input, for example:
			1. Output: "Enter your username:"
				Response: {"prompt": "Enter your username:", "freeFormInput": true, "options": [], "input": null}
			2. Output: "Password:"
				Response: {"prompt": "Password:", "freeFormInput": true, "options": [], "input": null}
			3. Output: "Press any key to continue..."
				Response: {"prompt": "Press any key to continue...", "freeFormInput": true, "options": [], "input": "\\r"}
			4. Output: "Type 'exit' to quit the game."
				Response: {"prompt": "Type 'exit' to quit the game.", "freeFormInput": true, "options": [], "input": "exit"}
			Now, analyze this output:
			${lastLines}
			`;
    const response = await this._languageModelsService.sendChatRequest(model, void 0, [{ role: 1, content: [{ type: "text", value: promptText }] }], {}, token);
    const responseText = await getTextResponseFromStream(response);
    try {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (isObject(parsed) && Object.hasOwn(parsed, "prompt") && isString(parsed.prompt) && Object.hasOwn(parsed, "options") && Object.hasOwn(parsed, "freeFormInput") && typeof parsed.freeFormInput === "boolean") {
          const obj = parsed;
          if (this._lastPrompt === obj.prompt) {
            this._logService.trace("OutputMonitor: determineUserInputOptions ignoring duplicate prompt");
            return;
          }
          if (obj.freeFormInput === true) {
            const suggestedInput = isString(obj.input) && obj.input.trim().length ? obj.input.trim() : void 0;
            return { prompt: obj.prompt, options: [], detectedRequestForFreeFormInput: true, suggestedInput };
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
      this._logService.trace("OutputMonitor: Failed to parse confirmation prompt from language model response", err);
    }
    return void 0;
  }
  _isSensitivePrompt(prompt) {
    return /(password|passphrase|token|api\s*key|secret)/i.test(prompt);
  }
  /**
   * Returns true if the current session is in Autopilot mode (not Bypass Approvals).
   * In Autopilot, terminal prompts should be auto-replied to so the agent can
   * work autonomously from start to finish.
   */
  _isAutopilotMode() {
    if (!this._sessionResource) {
      return false;
    }
    const widget = this._chatWidgetService.getWidgetBySessionResource(this._sessionResource) ?? this._chatWidgetService.lastFocusedWidget;
    if (widget?.input.currentModeInfo.permissionLevel === ChatPermissionLevel.Autopilot) {
      return true;
    }
    const model = this._chatService.getSession(this._sessionResource);
    const request = model?.getRequests().at(-1);
    return request?.modeInfo?.permissionLevel === ChatPermissionLevel.Autopilot;
  }
  async _selectAndHandleOption(confirmationPrompt, token) {
    if (!confirmationPrompt?.options.length) {
      return void 0;
    }
    const autoReply = this._configurationService.getValue(
      "chat.tools.terminal.autoReplyToPrompts"
      /* TerminalChatAgentToolsSettingId.AutoReplyToPrompts */
    ) || this._isAutopilotMode();
    let model = this._chatWidgetService.getWidgetsByLocations(ChatAgentLocation.Chat)[0]?.input.currentLanguageModel;
    if (model) {
      const models = await this._safeSelectLanguageModels({ vendor: "copilot", family: model.replaceAll("copilot/", "") });
      model = models[0];
    }
    if (!model) {
      model = await this._getLanguageModel();
    }
    const prompt = confirmationPrompt.prompt;
    const options = confirmationPrompt.options;
    const currentMarker = this._execution.instance.registerMarker();
    if (!currentMarker) {
      return void 0;
    }
    this._lastPromptMarker = currentMarker;
    this._lastPrompt = prompt;
    let suggestedOption = "";
    if (model) {
      try {
        const promptText = `Given the following confirmation prompt and options from a terminal output, which option is the default?
Prompt: "${prompt}"
Options: ${JSON.stringify(options)}
Respond with only the option string.`;
        const response = await this._languageModelsService.sendChatRequest(model, void 0, [
          { role: 1, content: [{ type: "text", value: promptText }] }
        ], {}, token);
        suggestedOption = (await getTextResponseFromStream(response)).trim();
      } catch (err) {
        this._logService.trace("OutputMonitor: Failed to get suggested option from model", err);
      }
    } else if (!autoReply) {
      return void 0;
    }
    let validOption;
    let index;
    if (!suggestedOption) {
      if (autoReply) {
        validOption = options[0];
        index = 0;
        this._logService.trace(`OutputMonitor: No LLM suggestion, falling back to first option: ${validOption}`);
      } else {
        return;
      }
    } else {
      const match = matchTerminalPromptOption(confirmationPrompt.options, suggestedOption);
      if (!match.option || match.index === -1) {
        if (autoReply) {
          validOption = options[0];
          index = 0;
          this._logService.trace(`OutputMonitor: LLM suggestion '${suggestedOption}' didn't match options, falling back to first option: ${validOption}`);
        } else {
          return;
        }
      } else {
        validOption = match.option;
        index = match.index;
      }
    }
    let sentToTerminal = false;
    if (autoReply) {
      await this._execution.instance.sendText(validOption, true);
      this._outputMonitorTelemetryCounters.inputToolAutoAcceptCount++;
      this._outputMonitorTelemetryCounters.inputToolAutoChars += validOption?.length || 0;
      sentToTerminal = true;
    }
    const description = confirmationPrompt.descriptions?.[index];
    return description ? { suggestedOption: { description, option: validOption }, sentToTerminal } : { suggestedOption: validOption, sentToTerminal };
  }
  async _requestFreeFormTerminalInput(token, execution, confirmationPrompt, acceptAnyKey = false) {
    const focusTerminalSelection = /* @__PURE__ */ Symbol("focusTerminalSelection");
    const { promise: userPrompt, part } = this._createElicitationPart(token, execution.sessionResource, new MarkdownString(localize("poll.terminal.inputRequest", "The terminal is awaiting input.")), new MarkdownString(localize("poll.terminal.requireInput", "{0}\nPlease provide the required input to the terminal.\n\n", confirmationPrompt.prompt)), "", localize("poll.terminal.enterInput", "Focus terminal"), void 0, () => {
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
        if (acceptAnyKey && data.length > 0 || !acceptAnyKey && (data === "\r" || data === "\n" || data === "\r\n")) {
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
    const focusTerminalSelection = /* @__PURE__ */ Symbol("focusTerminalSelection");
    let inputDataDisposable = Disposable.None;
    let instanceDisposedDisposable = Disposable.None;
    const { promise: userPrompt, part } = this._createElicitationPart(token, execution.sessionResource, new MarkdownString(localize("poll.terminal.confirmRequired", "The terminal is awaiting input.")), new MarkdownString(localize("poll.terminal.confirmRunDetail", "{0}\n Do you want to send `{1}`{2} followed by `Enter` to the terminal?", confirmationPrompt.prompt, suggestedOptionValue, isString(suggestedOption) ? "" : suggestedOption.description ? " (" + suggestedOption.description + ")" : "")), "", localize("poll.terminal.acceptRun", "Allow"), localize("poll.terminal.rejectRun", "Focus Terminal"), async (value) => {
      let option = void 0;
      if (value === true) {
        option = suggestedOptionValue;
      } else if (typeof value === "object" && Object.hasOwn(value, "label")) {
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
  _createElicitationPart(token, sessionResource, title, detail, subtitle, acceptLabel, rejectLabel, onAccept, onReject, moreActions) {
    const chatModel = sessionResource && this._chatService.getSession(sessionResource);
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
          try {
            const r = await (onAccept ? onAccept(value) : void 0);
            resolve(r);
            if (typeof r === "symbol") {
              return "pending";
            }
          } catch {
            resolve(void 0);
          }
          thePart.hide();
          this._promptPart = void 0;
          return "accepted";
        },
        async () => {
          try {
            const r = await (onReject ? onReject() : void 0);
            resolve(r);
            if (typeof r === "symbol") {
              return "pending";
            }
          } catch {
            resolve(void 0);
          }
          thePart.hide();
          this._promptPart = void 0;
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
    const fastModels = await this._safeSelectLanguageModels({ vendor: "copilot", id: "copilot-fast" });
    if (fastModels.length) {
      return fastModels[0];
    }
    const widget = this._chatWidgetService.lastFocusedWidget ?? this._chatWidgetService.getWidgetsByLocations(ChatAgentLocation.Chat)[0];
    const currentModel = widget?.input.currentLanguageModel;
    if (currentModel) {
      const currentFamilyModels = await this._safeSelectLanguageModels({ vendor: "copilot", family: currentModel.replaceAll("copilot/", "") });
      if (currentFamilyModels.length) {
        return currentFamilyModels[0];
      }
    }
    const copilotModels = await this._safeSelectLanguageModels({ vendor: "copilot" });
    if (copilotModels.length) {
      return copilotModels[0];
    }
    return void 0;
  }
  async _safeSelectLanguageModels(selector) {
    try {
      return await this._languageModelsService.selectLanguageModels(selector);
    } catch (error) {
      this._logService.trace("OutputMonitor: selectLanguageModels failed", { selector, error });
      return [];
    }
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
function matchTerminalPromptOption(options, suggestedOption) {
  const normalize = /* @__PURE__ */ __name((value) => value.replace(/['"`]/g, "").trim().replace(/[.,:;]+$/, ""), "normalize");
  const normalizedSuggestion = normalize(suggestedOption);
  if (!normalizedSuggestion) {
    return { option: void 0, index: -1 };
  }
  const candidates = [normalizedSuggestion];
  const firstWhitespaceToken = normalizedSuggestion.split(/\s+/)[0];
  if (firstWhitespaceToken && firstWhitespaceToken !== normalizedSuggestion) {
    candidates.push(firstWhitespaceToken);
  }
  const firstAlphaNum = normalizedSuggestion.match(/[A-Za-z0-9]+/);
  if (firstAlphaNum?.[0] && firstAlphaNum[0] !== normalizedSuggestion && firstAlphaNum[0] !== firstWhitespaceToken) {
    candidates.push(firstAlphaNum[0]);
  }
  for (const candidate of candidates) {
    const exactIndex = options.findIndex((opt) => normalize(opt) === candidate);
    if (exactIndex !== -1) {
      return { option: options[exactIndex], index: exactIndex };
    }
    const lowerCandidate = candidate.toLowerCase();
    const ciIndex = options.findIndex((opt) => normalize(opt).toLowerCase() === lowerCandidate);
    if (ciIndex !== -1) {
      return { option: options[ciIndex], index: ciIndex };
    }
  }
  return { option: void 0, index: -1 };
}
__name(matchTerminalPromptOption, "matchTerminalPromptOption");
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
const taskFinishMessages = [
  // "Terminal will be reused by tasks, press any key to close it."
  localize("closeTerminal", "Terminal will be reused by tasks, press any key to close it."),
  localize("reuseTerminal", "Terminal will be reused by tasks, press any key to close it."),
  // "Press any key to close the terminal." (with exit code placeholder removed for matching)
  localize("exitCode.closeTerminal", "Press any key to close the terminal."),
  localize("exitCode.reuseTerminal", "Press any key to close the terminal.")
];
function detectsVSCodeTaskFinishMessage(cursorLine) {
  const normalized = cursorLine.replace(/\s/g, "").toLowerCase();
  return taskFinishMessages.some((msg) => normalized.includes(msg.replace(/\s/g, "").toLowerCase()));
}
__name(detectsVSCodeTaskFinishMessage, "detectsVSCodeTaskFinishMessage");
function detectsGenericPressAnyKeyPattern(cursorLine) {
  if (detectsVSCodeTaskFinishMessage(cursorLine)) {
    return false;
  }
  return /press a(?:ny)? key/i.test(cursorLine);
}
__name(detectsGenericPressAnyKeyPattern, "detectsGenericPressAnyKeyPattern");
export {
  OutputMonitor,
  detectsGenericPressAnyKeyPattern,
  detectsInputRequiredPattern,
  detectsNonInteractiveHelpPattern,
  detectsVSCodeTaskFinishMessage,
  matchTerminalPromptOption
};
//# sourceMappingURL=outputMonitor.js.map
