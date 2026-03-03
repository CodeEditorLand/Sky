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
import { asArray } from "../../../../../../../base/common/arrays.js";
import { createCommandUri, MarkdownString } from "../../../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../../../nls.js";
import { IConfigurationService } from "../../../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { ITerminalChatService } from "../../../../../terminal/browser/terminal.js";
import { IStorageService } from "../../../../../../../platform/storage/common/storage.js";
import { ChatConfiguration } from "../../../../../chat/common/constants.js";
import { dedupeRules, generateAutoApproveActions, isPowerShell } from "../../runInTerminalHelpers.js";
import { isAutoApproveRule, isNpmScriptAutoApproveRule } from "./commandLineAnalyzer.js";
import { CommandLineAutoApprover } from "./autoApprove/commandLineAutoApprover.js";
const promptInjectionWarningCommandsLower = [
  "curl",
  "wget"
];
const promptInjectionWarningCommandsLowerPwshOnly = [
  "invoke-restmethod",
  "invoke-webrequest",
  "irm",
  "iwr"
];
let CommandLineAutoApproveAnalyzer = class CommandLineAutoApproveAnalyzer2 extends Disposable {
  static {
    __name(this, "CommandLineAutoApproveAnalyzer");
  }
  constructor(_treeSitterCommandParser, _telemetry, _log, _configurationService, instantiationService, _storageService, _terminalChatService) {
    super();
    this._treeSitterCommandParser = _treeSitterCommandParser;
    this._telemetry = _telemetry;
    this._log = _log;
    this._configurationService = _configurationService;
    this._storageService = _storageService;
    this._terminalChatService = _terminalChatService;
    this._commandLineAutoApprover = this._register(instantiationService.createInstance(CommandLineAutoApprover));
  }
  async analyze(options) {
    if (options.chatSessionResource && this._terminalChatService.hasChatSessionAutoApproval(options.chatSessionResource)) {
      this._log("Session has auto approval enabled, auto approving command");
      const disableUri = createCommandUri("workbench.action.terminal.chat.disableSessionAutoApproval", options.chatSessionResource);
      const mdTrustSettings = {
        isTrusted: {
          enabledCommands: [
            "workbench.action.terminal.chat.disableSessionAutoApproval"
            /* TerminalChatCommandId.DisableSessionAutoApproval */
          ]
        }
      };
      return {
        isAutoApproved: true,
        isAutoApproveAllowed: true,
        disclaimers: [],
        autoApproveInfo: new MarkdownString(`${localize("autoApprove.session", "Auto approved for this session")} ([${localize("autoApprove.session.disable", "Disable")}](${disableUri.toString()}))`, mdTrustSettings)
      };
    }
    const trimmedCommandLine = options.commandLine.trimStart();
    let subCommands;
    try {
      subCommands = await this._treeSitterCommandParser.extractSubCommands(options.treeSitterLanguage, trimmedCommandLine);
      this._log(`Parsed sub-commands via ${options.treeSitterLanguage} grammar`, subCommands);
    } catch (e) {
      console.error(e);
      this._log(`Failed to parse sub-commands via ${options.treeSitterLanguage} grammar`);
    }
    let isAutoApproved = false;
    let autoApproveInfo;
    let customActions;
    if (!subCommands) {
      return {
        isAutoApproveAllowed: false,
        disclaimers: []
      };
    }
    const subCommandResults = await Promise.all(subCommands.map((e) => this._commandLineAutoApprover.isCommandAutoApproved(e, options.shell, options.os, options.cwd, options.chatSessionResource)));
    const commandLineResult = this._commandLineAutoApprover.isCommandLineAutoApproved(trimmedCommandLine, options.chatSessionResource);
    const autoApproveReasons = [
      ...subCommandResults.map((e) => e.reason),
      commandLineResult.reason
    ];
    let isDenied = false;
    let autoApproveReason;
    let autoApproveDefault;
    const deniedSubCommandResult = subCommandResults.find((e) => e.result === "denied");
    if (deniedSubCommandResult) {
      this._log("Sub-command DENIED auto approval");
      isDenied = true;
      autoApproveDefault = isAutoApproveRule(deniedSubCommandResult.rule) ? deniedSubCommandResult.rule.isDefaultRule : void 0;
      autoApproveReason = "subCommand";
    } else if (commandLineResult.result === "denied") {
      this._log("Command line DENIED auto approval");
      isDenied = true;
      autoApproveDefault = isAutoApproveRule(commandLineResult.rule) ? commandLineResult.rule.isDefaultRule : void 0;
      autoApproveReason = "commandLine";
    } else {
      if (subCommandResults.every((e) => e.result === "approved")) {
        this._log("All sub-commands auto-approved");
        isAutoApproved = true;
        autoApproveReason = "subCommand";
        autoApproveDefault = subCommandResults.every((e) => isAutoApproveRule(e.rule) && e.rule.isDefaultRule);
      } else {
        this._log("All sub-commands NOT auto-approved");
        if (commandLineResult.result === "approved") {
          this._log("Command line auto-approved");
          autoApproveReason = "commandLine";
          isAutoApproved = true;
          autoApproveDefault = isAutoApproveRule(commandLineResult.rule) ? commandLineResult.rule.isDefaultRule : void 0;
        } else {
          this._log("Command line NOT auto-approved");
        }
      }
    }
    for (const reason of autoApproveReasons) {
      this._log(`- ${reason}`);
    }
    const isAutoApproveEnabled = this._configurationService.getValue(
      "chat.tools.terminal.enableAutoApprove"
      /* TerminalChatAgentToolsSettingId.EnableAutoApprove */
    ) === true;
    const isAutoApproveWarningAccepted = this._storageService.getBoolean("chat.tools.terminal.autoApprove.warningAccepted", -1, false);
    if (isAutoApproveEnabled && isAutoApproved) {
      autoApproveInfo = this._createAutoApproveInfo(isAutoApproved, isDenied, autoApproveReason, subCommandResults, commandLineResult);
    } else {
      isAutoApproved = false;
    }
    this._telemetry.logPrepare({
      terminalToolSessionId: options.terminalToolSessionId,
      subCommands,
      autoApproveAllowed: !isAutoApproveEnabled ? "off" : isAutoApproveWarningAccepted ? "allowed" : "needsOptIn",
      autoApproveResult: isAutoApproved ? "approved" : isDenied ? "denied" : "manual",
      autoApproveReason,
      autoApproveDefault
    });
    const disclaimers = [];
    const subCommandsLowerFirstWordOnly = subCommands.map((command) => command.split(" ")[0].toLowerCase());
    if (!isAutoApproved && (subCommandsLowerFirstWordOnly.some((command) => promptInjectionWarningCommandsLower.includes(command)) || isPowerShell(options.shell, options.os) && subCommandsLowerFirstWordOnly.some((command) => promptInjectionWarningCommandsLowerPwshOnly.includes(command)))) {
      disclaimers.push(localize("runInTerminal.promptInjectionDisclaimer", "Web content may contain malicious code or attempt prompt injection attacks."));
    }
    if (isAutoApproveEnabled && isDenied) {
      const denialInfo = this._createAutoApproveInfo(isAutoApproved, isDenied, autoApproveReason, subCommandResults, commandLineResult);
      if (denialInfo) {
        disclaimers.push(denialInfo);
      }
    }
    if (!isAutoApproved && isAutoApproveEnabled) {
      customActions = generateAutoApproveActions(trimmedCommandLine, subCommands, { subCommandResults, commandLineResult });
    }
    return {
      isAutoApproved,
      // This is not based on isDenied because we want the user to be able to configure it
      isAutoApproveAllowed: true,
      disclaimers,
      autoApproveInfo,
      customActions
    };
  }
  _createAutoApproveInfo(isAutoApproved, isDenied, autoApproveReason, subCommandResults, commandLineResult) {
    const formatRuleLinks = /* @__PURE__ */ __name((result) => {
      return asArray(result).filter((e) => isAutoApproveRule(e.rule)).map((e) => {
        const escapedSourceText = e.rule.sourceText.replaceAll("$", "\\$");
        if (e.rule.sourceTarget === "session") {
          return localize("autoApproveRule.sessionIndicator", "{0} (session)", `\`${escapedSourceText}\``);
        }
        const settingsUri = createCommandUri("workbench.action.terminal.chat.openTerminalSettingsLink", e.rule.sourceTarget);
        const tooltip = localize("ruleTooltip", "View rule in settings");
        let label = escapedSourceText;
        switch (e.rule?.sourceTarget) {
          case 7:
            label = `${label} (default)`;
            break;
          case 2:
          case 3:
            label = `${label} (user)`;
            break;
          case 4:
            label = `${label} (remote)`;
            break;
          case 5:
          case 6:
            label = `${label} (workspace)`;
            break;
        }
        return `[\`${label}\`](${settingsUri.toString()} "${tooltip}")`;
      }).join(", ");
    }, "formatRuleLinks");
    const mdTrustSettings = {
      isTrusted: {
        enabledCommands: [
          "workbench.action.terminal.chat.openTerminalSettingsLink"
          /* TerminalChatCommandId.OpenTerminalSettingsLink */
        ]
      }
    };
    const config = this._configurationService.inspect(ChatConfiguration.GlobalAutoApprove);
    const isGlobalAutoApproved = config?.value ?? config.defaultValue;
    if (isGlobalAutoApproved) {
      const settingsUri = createCommandUri("workbench.action.terminal.chat.openTerminalSettingsLink", "global");
      return new MarkdownString(`${localize("autoApprove.global", "Auto approved by setting {0}", `[\`${ChatConfiguration.GlobalAutoApprove}\`](${settingsUri.toString()} "${localize("ruleTooltip.global", "View settings")}")`)}`, mdTrustSettings);
    }
    if (isAutoApproved) {
      switch (autoApproveReason) {
        case "commandLine": {
          if (isAutoApproveRule(commandLineResult.rule)) {
            return new MarkdownString(localize("autoApprove.rule", "Auto approved by rule {0}", formatRuleLinks(commandLineResult)), mdTrustSettings);
          }
          break;
        }
        case "subCommand": {
          const npmScriptApproval = subCommandResults.find((e) => isNpmScriptAutoApproveRule(e.rule));
          if (npmScriptApproval && isNpmScriptAutoApproveRule(npmScriptApproval.rule) && npmScriptApproval.rule.npmScriptResult.autoApproveInfo) {
            return npmScriptApproval.rule.npmScriptResult.autoApproveInfo;
          }
          const uniqueRules = dedupeRules(subCommandResults);
          if (uniqueRules.length === 1) {
            return new MarkdownString(localize("autoApprove.rule", "Auto approved by rule {0}", formatRuleLinks(uniqueRules)), mdTrustSettings);
          } else if (uniqueRules.length > 1) {
            return new MarkdownString(localize("autoApprove.rules", "Auto approved by rules {0}", formatRuleLinks(uniqueRules)), mdTrustSettings);
          }
          break;
        }
      }
    } else if (isDenied) {
      switch (autoApproveReason) {
        case "commandLine": {
          if (commandLineResult.rule) {
            return new MarkdownString(localize("autoApproveDenied.rule", "Auto approval denied by rule {0}", formatRuleLinks(commandLineResult)), mdTrustSettings);
          }
          break;
        }
        case "subCommand": {
          const uniqueRules = dedupeRules(subCommandResults.filter((e) => e.result === "denied"));
          if (uniqueRules.length === 1) {
            return new MarkdownString(localize("autoApproveDenied.rule", "Auto approval denied by rule {0}", formatRuleLinks(uniqueRules)), mdTrustSettings);
          } else if (uniqueRules.length > 1) {
            return new MarkdownString(localize("autoApproveDenied.rules", "Auto approval denied by rules {0}", formatRuleLinks(uniqueRules)), mdTrustSettings);
          }
          break;
        }
      }
    }
    return void 0;
  }
};
CommandLineAutoApproveAnalyzer = __decorate([
  __param(3, IConfigurationService),
  __param(4, IInstantiationService),
  __param(5, IStorageService),
  __param(6, ITerminalChatService)
], CommandLineAutoApproveAnalyzer);
export {
  CommandLineAutoApproveAnalyzer
};
//# sourceMappingURL=commandLineAutoApproveAnalyzer.js.map
