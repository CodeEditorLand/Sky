var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
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
let TerminalSuggestTelemetry = class TerminalSuggestTelemetry2 extends Disposable {
  static {
    __name(this, "TerminalSuggestTelemetry");
  }
  constructor(commandDetection, _promptInputModel, _telemetryService) {
    super();
    this._promptInputModel = _promptInputModel;
    this._telemetryService = _telemetryService;
    this._kindMap = /* @__PURE__ */ new Map([
      [TerminalCompletionItemKind.File, "File"],
      [TerminalCompletionItemKind.Folder, "Folder"],
      [TerminalCompletionItemKind.Method, "Method"],
      [TerminalCompletionItemKind.Alias, "Alias"],
      [TerminalCompletionItemKind.Argument, "Argument"],
      [TerminalCompletionItemKind.Option, "Option"],
      [TerminalCompletionItemKind.OptionValue, "Option Value"],
      [TerminalCompletionItemKind.Flag, "Flag"],
      [TerminalCompletionItemKind.InlineSuggestion, "Inline Suggestion"],
      [TerminalCompletionItemKind.InlineSuggestionAlwaysOnTop, "Inline Suggestion"]
    ]);
    this._register(commandDetection.onCommandFinished((e) => {
      this._sendTelemetryInfo(false, e.exitCode);
      this._acceptedCompletions = void 0;
    }));
    this._register(this._promptInputModel.onDidInterrupt(() => {
      this._sendTelemetryInfo(true);
      this._acceptedCompletions = void 0;
    }));
  }
  acceptCompletion(completion, commandLine) {
    if (!completion || !commandLine) {
      this._acceptedCompletions = void 0;
      return;
    }
    this._acceptedCompletions = this._acceptedCompletions || [];
    this._acceptedCompletions.push({ label: typeof completion.label === "string" ? completion.label : completion.label.label, kind: this._kindMap.get(completion.kind) });
  }
  _sendTelemetryInfo(fromInterrupt, exitCode) {
    const commandLine = this._promptInputModel?.value;
    for (const completion of this._acceptedCompletions || []) {
      const label = completion?.label;
      const kind = completion?.kind;
      if (label === void 0 || commandLine === void 0 || kind === void 0) {
        return;
      }
      let outcome;
      if (fromInterrupt) {
        outcome = "Interrupted";
      } else if (commandLine.trim() && commandLine.includes(label)) {
        outcome = "Accepted";
      } else if (inputContainsFirstHalfOfLabel(commandLine, label)) {
        outcome = "AcceptedWithEdit";
      } else {
        outcome = "Deleted";
      }
      this._telemetryService.publicLog2("terminal.suggest.acceptedCompletion", {
        kind,
        outcome,
        exitCode
      });
    }
  }
};
TerminalSuggestTelemetry = __decorate([
  __param(2, ITelemetryService)
], TerminalSuggestTelemetry);
var CompletionOutcome;
(function(CompletionOutcome2) {
  CompletionOutcome2["Accepted"] = "Accepted";
  CompletionOutcome2["Deleted"] = "Deleted";
  CompletionOutcome2["AcceptedWithEdit"] = "AcceptedWithEdit";
  CompletionOutcome2["Interrupted"] = "Interrupted";
})(CompletionOutcome || (CompletionOutcome = {}));
function inputContainsFirstHalfOfLabel(commandLine, label) {
  return commandLine.includes(label.substring(0, Math.ceil(label.length / 2)));
}
__name(inputContainsFirstHalfOfLabel, "inputContainsFirstHalfOfLabel");
export {
  TerminalSuggestTelemetry
};
//# sourceMappingURL=terminalSuggestTelemetry.js.map
