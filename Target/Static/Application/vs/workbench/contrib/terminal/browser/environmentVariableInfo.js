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
import { ITerminalService } from "./terminal.js";
import { localize } from "../../../../nls.js";
import { Codicon } from "../../../../base/common/codicons.js";
import Severity from "../../../../base/common/severity.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
let EnvironmentVariableInfoStale = class EnvironmentVariableInfoStale2 {
  static {
    __name(this, "EnvironmentVariableInfoStale");
  }
  constructor(_diff, _terminalId, _collection, _terminalService, _extensionService) {
    this._diff = _diff;
    this._terminalId = _terminalId;
    this._collection = _collection;
    this._terminalService = _terminalService;
    this._extensionService = _extensionService;
    this.requiresAction = true;
  }
  _getInfo(scope) {
    const extSet = /* @__PURE__ */ new Set();
    addExtensionIdentifiers(extSet, this._diff.added.values());
    addExtensionIdentifiers(extSet, this._diff.removed.values());
    addExtensionIdentifiers(extSet, this._diff.changed.values());
    let message = localize("extensionEnvironmentContributionInfoStale", "The following extensions want to relaunch the terminal to contribute to its environment:");
    message += getMergedDescription(this._collection, scope, this._extensionService, extSet);
    return message;
  }
  _getActions() {
    return [{
      label: localize("relaunchTerminalLabel", "Relaunch Terminal"),
      run: /* @__PURE__ */ __name(() => this._terminalService.getInstanceFromId(this._terminalId)?.relaunch(), "run"),
      commandId: "workbench.action.terminal.relaunch"
      /* TerminalCommandId.Relaunch */
    }];
  }
  getStatus(scope) {
    return {
      id: "relaunch-needed",
      severity: Severity.Warning,
      icon: Codicon.warning,
      tooltip: this._getInfo(scope),
      hoverActions: this._getActions()
    };
  }
};
EnvironmentVariableInfoStale = __decorate([
  __param(3, ITerminalService),
  __param(4, IExtensionService)
], EnvironmentVariableInfoStale);
let EnvironmentVariableInfoChangesActive = class EnvironmentVariableInfoChangesActive2 {
  static {
    __name(this, "EnvironmentVariableInfoChangesActive");
  }
  constructor(_collection, _commandService, _extensionService) {
    this._collection = _collection;
    this._commandService = _commandService;
    this._extensionService = _extensionService;
    this.requiresAction = false;
  }
  _getInfo(scope) {
    const extSet = /* @__PURE__ */ new Set();
    addExtensionIdentifiers(extSet, this._collection.getVariableMap(scope).values());
    let message = localize("extensionEnvironmentContributionInfoActive", "The following extensions have contributed to this terminal's environment:");
    message += getMergedDescription(this._collection, scope, this._extensionService, extSet);
    return message;
  }
  _getActions(scope) {
    return [{
      label: localize("showEnvironmentContributions", "Show Environment Contributions"),
      run: /* @__PURE__ */ __name(() => this._commandService.executeCommand("workbench.action.terminal.showEnvironmentContributions", scope), "run"),
      commandId: "workbench.action.terminal.showEnvironmentContributions"
      /* TerminalCommandId.ShowEnvironmentContributions */
    }];
  }
  getStatus(scope) {
    return {
      id: "env-var-info-changes-active",
      severity: Severity.Info,
      tooltip: void 0,
      // The action is present when details aren't shown
      detailedTooltip: this._getInfo(scope),
      hoverActions: this._getActions(scope)
    };
  }
};
EnvironmentVariableInfoChangesActive = __decorate([
  __param(1, ICommandService),
  __param(2, IExtensionService)
], EnvironmentVariableInfoChangesActive);
function getMergedDescription(collection, scope, extensionService, extSet) {
  const message = ["\n"];
  const globalDescriptions = collection.getDescriptionMap(void 0);
  const workspaceDescriptions = collection.getDescriptionMap(scope);
  for (const ext of extSet) {
    const globalDescription = globalDescriptions.get(ext);
    if (globalDescription) {
      message.push(`
- \`${getExtensionName(ext, extensionService)}\``);
      message.push(`: ${globalDescription}`);
    }
    const workspaceDescription = workspaceDescriptions.get(ext);
    if (workspaceDescription) {
      const workspaceSuffix = globalDescription ? ` (${localize("ScopedEnvironmentContributionInfo", "workspace")})` : "";
      message.push(`
- \`${getExtensionName(ext, extensionService)}${workspaceSuffix}\``);
      message.push(`: ${workspaceDescription}`);
    }
    if (!globalDescription && !workspaceDescription) {
      message.push(`
- \`${getExtensionName(ext, extensionService)}\``);
    }
  }
  return message.join("");
}
__name(getMergedDescription, "getMergedDescription");
function addExtensionIdentifiers(extSet, diff) {
  for (const mutators of diff) {
    for (const mutator of mutators) {
      extSet.add(mutator.extensionIdentifier);
    }
  }
}
__name(addExtensionIdentifiers, "addExtensionIdentifiers");
function getExtensionName(id, extensionService) {
  return extensionService.extensions.find((e) => e.id === id)?.displayName || id;
}
__name(getExtensionName, "getExtensionName");
export {
  EnvironmentVariableInfoChangesActive,
  EnvironmentVariableInfoStale
};
//# sourceMappingURL=environmentVariableInfo.js.map
