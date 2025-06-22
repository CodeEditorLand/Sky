var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { Event, Emitter } from "../../../../../base/common/event.js";
import * as dom from "../../../../../base/browser/dom.js";
import { sep } from "../../../../../base/common/path.js";
import { SuggestAddon } from "./terminalSuggestAddon.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { terminalSuggestConfigSection } from "../common/terminalSuggestConfiguration.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { DeferredPromise } from "../../../../../base/common/async.js";
import { TerminalCompletionItemKind } from "./terminalCompletionItem.js";
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
var PwshCompletionProviderAddon_1;
var VSCodeSuggestOscPt;
(function(VSCodeSuggestOscPt2) {
  VSCodeSuggestOscPt2["Completions"] = "Completions";
})(VSCodeSuggestOscPt || (VSCodeSuggestOscPt = {}));
var RequestCompletionsSequence;
(function(RequestCompletionsSequence2) {
  RequestCompletionsSequence2["Contextual"] = "\x1B[24~e";
})(RequestCompletionsSequence || (RequestCompletionsSequence = {}));
let PwshCompletionProviderAddon = class PwshCompletionProviderAddon2 extends Disposable {
  static {
    __name(this, "PwshCompletionProviderAddon");
  }
  static {
    PwshCompletionProviderAddon_1 = this;
  }
  static {
    this.ID = "pwsh-shell-integration";
  }
  constructor(capabilities, _configurationService) {
    super();
    this._configurationService = _configurationService;
    this.id = PwshCompletionProviderAddon_1.ID;
    this.isBuiltin = true;
    this.shellTypes = [
      "pwsh"
      /* GeneralShellType.PowerShell */
    ];
    this._lastUserDataTimestamp = 0;
    this._enableWidget = true;
    this.isPasting = false;
    this._completionsDeferred = null;
    this._onDidReceiveCompletions = this._register(new Emitter());
    this.onDidReceiveCompletions = this._onDidReceiveCompletions.event;
    this._onDidRequestSendText = this._register(new Emitter());
    this.onDidRequestSendText = this._onDidRequestSendText.event;
    this._register(Event.runAndSubscribe(Event.any(capabilities.onDidAddCapabilityType, capabilities.onDidRemoveCapabilityType), () => {
      const commandDetection = capabilities.get(
        2
        /* TerminalCapability.CommandDetection */
      );
      if (commandDetection) {
        if (this._promptInputModel !== commandDetection.promptInputModel) {
          this._promptInputModel = commandDetection.promptInputModel;
        }
      } else {
        this._promptInputModel = void 0;
      }
    }));
  }
  activate(xterm) {
    this._terminal = xterm;
    this._register(xterm.onData(() => {
      this._lastUserDataTimestamp = Date.now();
    }));
    const config = this._configurationService.getValue(terminalSuggestConfigSection);
    const enabled = config.enabled;
    if (!enabled) {
      return;
    }
    this._register(xterm.parser.registerOscHandler(633, (data) => {
      return this._handleVSCodeSequence(data);
    }));
  }
  _handleVSCodeSequence(data) {
    if (!this._terminal) {
      return false;
    }
    const [command, ...args] = data.split(";");
    switch (command) {
      case "Completions":
        this._handleCompletionsSequence(this._terminal, data, command, args);
        return true;
    }
    return false;
  }
  _handleCompletionsSequence(terminal, data, command, args) {
    this._onDidReceiveCompletions.fire();
    if (!terminal.element || !this._enableWidget || !this._promptInputModel) {
      this._resolveCompletions(void 0);
      return;
    }
    if (!dom.isAncestorOfActiveElement(terminal.element)) {
      this._resolveCompletions(void 0);
      return;
    }
    if (args.length === 0) {
      this._resolveCompletions(void 0);
      return;
    }
    let replacementIndex = 0;
    let replacementLength = this._promptInputModel.cursorIndex;
    replacementIndex = parseInt(args[0]);
    replacementLength = parseInt(args[1]);
    const payload = data.slice(
      command.length + args[0].length + args[1].length + args[2].length + 4
      /*semi-colons*/
    );
    const rawCompletions = args.length === 0 || payload.length === 0 ? void 0 : JSON.parse(payload);
    const completions = parseCompletionsFromShell(rawCompletions, replacementIndex, replacementLength);
    if (this._mostRecentCompletion?.kind === TerminalCompletionItemKind.Folder && completions.every((c) => c.kind === TerminalCompletionItemKind.Folder)) {
      completions.push(this._mostRecentCompletion);
    }
    this._mostRecentCompletion = void 0;
    this._resolveCompletions(completions);
  }
  _resolveCompletions(result) {
    if (!this._completionsDeferred) {
      return;
    }
    this._completionsDeferred.complete(result);
    this._completionsDeferred = null;
  }
  _getCompletionsPromise() {
    this._completionsDeferred = new DeferredPromise();
    return this._completionsDeferred.p;
  }
  provideCompletions(value, cursorPosition, allowFallbackCompletions, token) {
    if (value.substring(0, cursorPosition).trim().indexOf(" ") === -1) {
      return Promise.resolve(void 0);
    }
    if (this._lastUserDataTimestamp > SuggestAddon.lastAcceptedCompletionTimestamp) {
      this._onDidRequestSendText.fire(
        "\x1B[24~e"
        /* RequestCompletionsSequence.Contextual */
      );
    }
    if (token.isCancellationRequested) {
      return Promise.resolve(void 0);
    }
    return new Promise((resolve) => {
      const completionPromise = this._getCompletionsPromise();
      this._register(token.onCancellationRequested(() => {
        this._resolveCompletions(void 0);
      }));
      completionPromise.then((result) => {
        if (token.isCancellationRequested) {
          resolve(void 0);
        } else {
          resolve(result);
        }
      });
    });
  }
};
PwshCompletionProviderAddon = PwshCompletionProviderAddon_1 = __decorate([
  __param(1, IConfigurationService)
], PwshCompletionProviderAddon);
function parseCompletionsFromShell(rawCompletions, replacementIndex, replacementLength) {
  if (!rawCompletions) {
    return [];
  }
  let typedRawCompletions;
  if (!Array.isArray(rawCompletions)) {
    typedRawCompletions = [rawCompletions];
  } else {
    if (rawCompletions.length === 0) {
      return [];
    }
    if (typeof rawCompletions[0] === "string") {
      typedRawCompletions = [rawCompletions].map((e) => ({
        CompletionText: e[0],
        ResultType: e[1],
        ToolTip: e[2],
        CustomIcon: e[3]
      }));
    } else if (Array.isArray(rawCompletions[0])) {
      typedRawCompletions = rawCompletions.map((e) => ({
        CompletionText: e[0],
        ResultType: e[1],
        ToolTip: e[2],
        CustomIcon: e[3]
      }));
    } else {
      typedRawCompletions = rawCompletions;
    }
  }
  return typedRawCompletions.map((e) => rawCompletionToITerminalCompletion(e, replacementIndex, replacementLength));
}
__name(parseCompletionsFromShell, "parseCompletionsFromShell");
function rawCompletionToITerminalCompletion(rawCompletion, replacementIndex, replacementLength) {
  let label = rawCompletion.CompletionText;
  if (rawCompletion.ResultType === 4 && !label.match(/^[\-+]$/) && // Don't add a `/` to `-` or `+` (navigate location history)
  !label.match(/^\.\.?$/) && !label.match(/[\\\/]$/)) {
    const separator = label.match(/(?<sep>[\\\/])/)?.groups?.sep ?? sep;
    label = label + separator;
  }
  const detail = rawCompletion.ToolTip ?? label;
  const icon = getIcon(rawCompletion.ResultType, rawCompletion.CustomIcon);
  const isExecutable = rawCompletion.ResultType === 2 && rawCompletion.CompletionText.match(/\.[a-z0-9]{2,4}$/i);
  if (isExecutable) {
    rawCompletion.ResultType = 3;
  }
  return {
    label,
    provider: PwshCompletionProviderAddon.ID,
    icon,
    detail,
    kind: pwshTypeToKindMap[rawCompletion.ResultType],
    isKeyword: rawCompletion.ResultType === 12,
    replacementIndex,
    replacementLength
  };
}
__name(rawCompletionToITerminalCompletion, "rawCompletionToITerminalCompletion");
function getIcon(resultType, customIconId) {
  if (customIconId) {
    const icon = customIconId in Codicon ? Codicon[customIconId] : Codicon.symbolText;
    if (icon) {
      return icon;
    }
  }
  return pwshTypeToIconMap[resultType] ?? Codicon.symbolText;
}
__name(getIcon, "getIcon");
const pwshTypeToIconMap = {
  0: Codicon.symbolText,
  1: Codicon.history,
  2: Codicon.symbolMethod,
  3: Codicon.symbolFile,
  4: Codicon.folder,
  5: Codicon.symbolProperty,
  6: Codicon.symbolMethod,
  7: Codicon.symbolVariable,
  8: Codicon.symbolValue,
  9: Codicon.symbolVariable,
  10: Codicon.symbolNamespace,
  11: Codicon.symbolInterface,
  12: Codicon.symbolKeyword,
  13: Codicon.symbolKeyword
};
const pwshTypeToKindMap = {
  0: void 0,
  1: void 0,
  2: TerminalCompletionItemKind.Method,
  3: TerminalCompletionItemKind.File,
  4: TerminalCompletionItemKind.Folder,
  5: TerminalCompletionItemKind.Argument,
  6: TerminalCompletionItemKind.Method,
  7: TerminalCompletionItemKind.Argument,
  8: void 0,
  9: void 0,
  10: void 0,
  11: void 0,
  12: void 0,
  13: void 0
};
export {
  PwshCompletionProviderAddon,
  VSCodeSuggestOscPt,
  parseCompletionsFromShell
};
//# sourceMappingURL=pwshCompletionProviderAddon.js.map
