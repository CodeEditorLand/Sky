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
import { structuralEquals } from "../../../../../../../../base/common/equals.js";
import { Disposable } from "../../../../../../../../base/common/lifecycle.js";
import { escapeRegExpCharacters, regExpLeadsToEndlessLoop } from "../../../../../../../../base/common/strings.js";
import { isObject } from "../../../../../../../../base/common/types.js";
import { IConfigurationService } from "../../../../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../../../../platform/instantiation/common/instantiation.js";
import { ITerminalChatService } from "../../../../../../terminal/browser/terminal.js";
import { isPowerShell } from "../../../runInTerminalHelpers.js";
import { NpmScriptAutoApprover } from "./npmScriptAutoApprover.js";
const neverMatchRegex = /(?!.*)/;
const transientEnvVarRegex = /^[A-Z_][A-Z0-9_]*=/i;
let CommandLineAutoApprover = class CommandLineAutoApprover2 extends Disposable {
  static {
    __name(this, "CommandLineAutoApprover");
  }
  constructor(_configurationService, instantiationService, _terminalChatService) {
    super();
    this._configurationService = _configurationService;
    this._terminalChatService = _terminalChatService;
    this._denyListRules = [];
    this._allowListRules = [];
    this._allowListCommandLineRules = [];
    this._denyListCommandLineRules = [];
    this._npmScriptAutoApprover = this._register(instantiationService.createInstance(NpmScriptAutoApprover));
    this.updateConfiguration();
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(
        "chat.tools.terminal.autoApprove"
        /* TerminalChatAgentToolsSettingId.AutoApprove */
      ) || e.affectsConfiguration(
        "chat.tools.terminal.ignoreDefaultAutoApproveRules"
        /* TerminalChatAgentToolsSettingId.IgnoreDefaultAutoApproveRules */
      ) || e.affectsConfiguration(
        "chat.agent.terminal.autoApprove"
        /* TerminalChatAgentToolsSettingId.DeprecatedAutoApproveCompatible */
      )) {
        this.updateConfiguration();
      }
    }));
  }
  updateConfiguration() {
    let configValue = this._configurationService.getValue(
      "chat.tools.terminal.autoApprove"
      /* TerminalChatAgentToolsSettingId.AutoApprove */
    );
    const configInspectValue = this._configurationService.inspect(
      "chat.tools.terminal.autoApprove"
      /* TerminalChatAgentToolsSettingId.AutoApprove */
    );
    const deprecatedValue = this._configurationService.getValue(
      "chat.agent.terminal.autoApprove"
      /* TerminalChatAgentToolsSettingId.DeprecatedAutoApproveCompatible */
    );
    if (deprecatedValue && typeof deprecatedValue === "object" && configValue && typeof configValue === "object") {
      configValue = {
        ...configValue,
        ...deprecatedValue
      };
    }
    const { denyListRules, allowListRules, allowListCommandLineRules, denyListCommandLineRules } = this._mapAutoApproveConfigToRules(configValue, configInspectValue);
    this._allowListRules = allowListRules;
    this._denyListRules = denyListRules;
    this._allowListCommandLineRules = allowListCommandLineRules;
    this._denyListCommandLineRules = denyListCommandLineRules;
  }
  async isCommandAutoApproved(command, shell, os, cwd, chatSessionResource) {
    if (transientEnvVarRegex.test(command)) {
      return {
        result: "denied",
        reason: `Command '${command}' is denied because it contains transient environment variables`
      };
    }
    for (const rule of this._denyListRules) {
      if (this._commandMatchesRule(rule, command, shell, os)) {
        return {
          result: "denied",
          rule,
          reason: `Command '${command}' is denied by deny list rule: ${rule.sourceText}`
        };
      }
    }
    for (const rule of this._getSessionRules(chatSessionResource).allowListRules) {
      if (this._commandMatchesRule(rule, command, shell, os)) {
        return {
          result: "approved",
          rule,
          reason: `Command '${command}' is approved by session allow list rule: ${rule.sourceText}`
        };
      }
    }
    for (const rule of this._allowListRules) {
      if (this._commandMatchesRule(rule, command, shell, os)) {
        return {
          result: "approved",
          rule,
          reason: `Command '${command}' is approved by allow list rule: ${rule.sourceText}`
        };
      }
    }
    const npmScriptResult = await this._npmScriptAutoApprover.isCommandAutoApproved(command, cwd);
    if (npmScriptResult.isAutoApproved) {
      return {
        result: "approved",
        rule: { type: "npmScript", npmScriptResult },
        reason: `Command '${command}' is approved as npm script '${npmScriptResult.scriptName}' is defined in package.json`
      };
    }
    return {
      result: "noMatch",
      reason: `Command '${command}' has no matching auto approve entries`
    };
  }
  isCommandLineAutoApproved(commandLine, chatSessionResource) {
    for (const rule of this._denyListCommandLineRules) {
      if (rule.regex.test(commandLine)) {
        return {
          result: "denied",
          rule,
          reason: `Command line '${commandLine}' is denied by deny list rule: ${rule.sourceText}`
        };
      }
    }
    for (const rule of this._getSessionRules(chatSessionResource).allowListCommandLineRules) {
      if (rule.regex.test(commandLine)) {
        return {
          result: "approved",
          rule,
          reason: `Command line '${commandLine}' is approved by session allow list rule: ${rule.sourceText}`
        };
      }
    }
    for (const rule of this._allowListCommandLineRules) {
      if (rule.regex.test(commandLine)) {
        return {
          result: "approved",
          rule,
          reason: `Command line '${commandLine}' is approved by allow list rule: ${rule.sourceText}`
        };
      }
    }
    return {
      result: "noMatch",
      reason: `Command line '${commandLine}' has no matching auto approve entries`
    };
  }
  _getSessionRules(chatSessionResource) {
    const denyListRules = [];
    const allowListRules = [];
    const allowListCommandLineRules = [];
    const denyListCommandLineRules = [];
    if (!chatSessionResource) {
      return { denyListRules, allowListRules, allowListCommandLineRules, denyListCommandLineRules };
    }
    const sessionRulesConfig = this._terminalChatService.getSessionAutoApproveRules(chatSessionResource);
    for (const [key, value] of Object.entries(sessionRulesConfig)) {
      if (typeof value === "boolean") {
        const { regex, regexCaseInsensitive } = this._convertAutoApproveEntryToRegex(key);
        if (value === true) {
          allowListRules.push({ regex, regexCaseInsensitive, sourceText: key, sourceTarget: "session", isDefaultRule: false });
        } else if (value === false) {
          denyListRules.push({ regex, regexCaseInsensitive, sourceText: key, sourceTarget: "session", isDefaultRule: false });
        }
      } else if (typeof value === "object" && value !== null) {
        const objectValue = value;
        if (typeof objectValue.approve === "boolean") {
          const { regex, regexCaseInsensitive } = this._convertAutoApproveEntryToRegex(key);
          if (objectValue.approve === true) {
            if (objectValue.matchCommandLine === true) {
              allowListCommandLineRules.push({ regex, regexCaseInsensitive, sourceText: key, sourceTarget: "session", isDefaultRule: false });
            } else {
              allowListRules.push({ regex, regexCaseInsensitive, sourceText: key, sourceTarget: "session", isDefaultRule: false });
            }
          } else if (objectValue.approve === false) {
            if (objectValue.matchCommandLine === true) {
              denyListCommandLineRules.push({ regex, regexCaseInsensitive, sourceText: key, sourceTarget: "session", isDefaultRule: false });
            } else {
              denyListRules.push({ regex, regexCaseInsensitive, sourceText: key, sourceTarget: "session", isDefaultRule: false });
            }
          }
        }
      }
    }
    return { denyListRules, allowListRules, allowListCommandLineRules, denyListCommandLineRules };
  }
  _commandMatchesRule(rule, command, shell, os) {
    const isPwsh = isPowerShell(shell, os);
    if ((isPwsh ? rule.regexCaseInsensitive : rule.regex).test(command)) {
      return true;
    } else if (isPwsh && command.startsWith("(")) {
      if (rule.regexCaseInsensitive.test(command.slice(1))) {
        return true;
      }
    }
    return false;
  }
  _mapAutoApproveConfigToRules(config, configInspectValue) {
    if (!config || typeof config !== "object") {
      return {
        denyListRules: [],
        allowListRules: [],
        allowListCommandLineRules: [],
        denyListCommandLineRules: []
      };
    }
    const denyListRules = [];
    const allowListRules = [];
    const allowListCommandLineRules = [];
    const denyListCommandLineRules = [];
    const ignoreDefaults = this._configurationService.getValue(
      "chat.tools.terminal.ignoreDefaultAutoApproveRules"
      /* TerminalChatAgentToolsSettingId.IgnoreDefaultAutoApproveRules */
    ) === true;
    for (const [key, value] of Object.entries(config)) {
      let checkTarget2 = function(inspectValue) {
        return isObject(inspectValue) && Object.prototype.hasOwnProperty.call(inspectValue, key) && structuralEquals(inspectValue[key], value);
      };
      var checkTarget = checkTarget2;
      __name(checkTarget2, "checkTarget");
      const defaultValue = configInspectValue?.default?.value;
      const isDefaultRule = !!(isObject(defaultValue) && Object.prototype.hasOwnProperty.call(defaultValue, key) && structuralEquals(defaultValue[key], value));
      const sourceTarget = checkTarget2(configInspectValue.workspaceFolder) ? 6 : checkTarget2(configInspectValue.workspaceValue) ? 5 : checkTarget2(configInspectValue.userRemoteValue) ? 4 : checkTarget2(configInspectValue.userLocalValue) ? 3 : checkTarget2(configInspectValue.userValue) ? 2 : checkTarget2(configInspectValue.applicationValue) ? 1 : 7;
      if (ignoreDefaults && isDefaultRule && sourceTarget === 7) {
        continue;
      }
      if (typeof value === "boolean") {
        const { regex, regexCaseInsensitive } = this._convertAutoApproveEntryToRegex(key);
        if (value === true) {
          allowListRules.push({ regex, regexCaseInsensitive, sourceText: key, sourceTarget, isDefaultRule });
        } else if (value === false) {
          denyListRules.push({ regex, regexCaseInsensitive, sourceText: key, sourceTarget, isDefaultRule });
        }
      } else if (typeof value === "object" && value !== null) {
        const objectValue = value;
        if (typeof objectValue.approve === "boolean") {
          const { regex, regexCaseInsensitive } = this._convertAutoApproveEntryToRegex(key);
          if (objectValue.approve === true) {
            if (objectValue.matchCommandLine === true) {
              allowListCommandLineRules.push({ regex, regexCaseInsensitive, sourceText: key, sourceTarget, isDefaultRule });
            } else {
              allowListRules.push({ regex, regexCaseInsensitive, sourceText: key, sourceTarget, isDefaultRule });
            }
          } else if (objectValue.approve === false) {
            if (objectValue.matchCommandLine === true) {
              denyListCommandLineRules.push({ regex, regexCaseInsensitive, sourceText: key, sourceTarget, isDefaultRule });
            } else {
              denyListRules.push({ regex, regexCaseInsensitive, sourceText: key, sourceTarget, isDefaultRule });
            }
          }
        }
      }
    }
    return {
      denyListRules,
      allowListRules,
      allowListCommandLineRules,
      denyListCommandLineRules
    };
  }
  _convertAutoApproveEntryToRegex(value) {
    const regex = this._doConvertAutoApproveEntryToRegex(value);
    if (regex.flags.includes("i")) {
      return { regex, regexCaseInsensitive: regex };
    }
    return { regex, regexCaseInsensitive: new RegExp(regex.source, regex.flags + "i") };
  }
  _doConvertAutoApproveEntryToRegex(value) {
    const regexMatch = value.match(/^\/(?<pattern>.+)\/(?<flags>[dgimsuvy]*)$/);
    const regexPattern = regexMatch?.groups?.pattern;
    if (regexPattern) {
      let flags = regexMatch.groups?.flags;
      if (flags) {
        flags = flags.replaceAll("g", "");
      }
      if (regexPattern === ".*") {
        return new RegExp(regexPattern);
      }
      try {
        const regex = new RegExp(regexPattern, flags || void 0);
        if (regExpLeadsToEndlessLoop(regex)) {
          return neverMatchRegex;
        }
        return regex;
      } catch (error) {
        return neverMatchRegex;
      }
    }
    if (value === "") {
      return neverMatchRegex;
    }
    let sanitizedValue;
    if (value.includes("/") || value.includes("\\")) {
      let pattern = value.replace(/[/\\]/g, "%%PATH_SEP%%");
      pattern = escapeRegExpCharacters(pattern);
      pattern = pattern.replace(/%%PATH_SEP%%*/g, "[/\\\\]");
      sanitizedValue = `^(?:\\.[/\\\\])?${pattern}`;
    } else {
      sanitizedValue = escapeRegExpCharacters(value);
    }
    return new RegExp(`^${sanitizedValue}\\b`);
  }
};
CommandLineAutoApprover = __decorate([
  __param(0, IConfigurationService),
  __param(1, IInstantiationService),
  __param(2, ITerminalChatService)
], CommandLineAutoApprover);
export {
  CommandLineAutoApprover
};
//# sourceMappingURL=commandLineAutoApprover.js.map
