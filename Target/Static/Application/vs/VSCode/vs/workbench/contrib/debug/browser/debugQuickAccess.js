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
import { PickerQuickAccessProvider, TriggerAction } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { localize } from "../../../../nls.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IDebugService } from "../common/debug.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { matchesFuzzy } from "../../../../base/common/filters.js";
import { ADD_CONFIGURATION_ID, DEBUG_QUICK_ACCESS_PREFIX } from "./debugCommands.js";
import { debugConfigure, debugRemoveConfig } from "./debugIcons.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
let StartDebugQuickAccessProvider = class StartDebugQuickAccessProvider2 extends PickerQuickAccessProvider {
  static {
    __name(this, "StartDebugQuickAccessProvider");
  }
  constructor(debugService, contextService, commandService, notificationService) {
    super(DEBUG_QUICK_ACCESS_PREFIX, {
      noResultsPick: {
        label: localize("noDebugResults", "No matching launch configurations")
      }
    });
    this.debugService = debugService;
    this.contextService = contextService;
    this.commandService = commandService;
    this.notificationService = notificationService;
  }
  async _getPicks(filter) {
    const picks = [];
    if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
      return [];
    }
    picks.push({ type: "separator", label: "launch.json" });
    const configManager = this.debugService.getConfigurationManager();
    const selectedConfiguration = configManager.selectedConfiguration;
    let lastGroup;
    for (const config of configManager.getAllConfigurations()) {
      const highlights = matchesFuzzy(filter, config.name, true);
      if (highlights) {
        const pick = {
          label: config.name,
          description: this.contextService.getWorkbenchState() === 3 ? config.launch.name : "",
          highlights: { label: highlights },
          buttons: [{
            iconClass: ThemeIcon.asClassName(debugConfigure),
            tooltip: localize("customizeLaunchConfig", "Configure Launch Configuration")
          }],
          trigger: /* @__PURE__ */ __name(() => {
            config.launch.openConfigFile({ preserveFocus: false });
            return TriggerAction.CLOSE_PICKER;
          }, "trigger"),
          accept: /* @__PURE__ */ __name(async () => {
            await configManager.selectConfiguration(config.launch, config.name);
            try {
              await this.debugService.startDebugging(config.launch, void 0, { startedByUser: true });
            } catch (error) {
              this.notificationService.error(error);
            }
          }, "accept")
        };
        if (selectedConfiguration.name === config.name && selectedConfiguration.launch === config.launch) {
          const separator = { type: "separator", label: localize("mostRecent", "Most Recent") };
          picks.unshift(separator, pick);
          continue;
        }
        if (lastGroup !== config.presentation?.group) {
          picks.push({ type: "separator" });
          lastGroup = config.presentation?.group;
        }
        picks.push(pick);
      }
    }
    const dynamicProviders = await configManager.getDynamicProviders();
    if (dynamicProviders.length > 0) {
      picks.push({
        type: "separator",
        label: localize({
          key: "contributed",
          comment: ["contributed is lower case because it looks better like that in UI. Nothing preceeds it. It is a name of the grouping of debug configurations."]
        }, "contributed")
      });
    }
    configManager.getRecentDynamicConfigurations().forEach(({ name, type }) => {
      const highlights = matchesFuzzy(filter, name, true);
      if (highlights) {
        picks.push({
          label: name,
          highlights: { label: highlights },
          buttons: [{
            iconClass: ThemeIcon.asClassName(debugRemoveConfig),
            tooltip: localize("removeLaunchConfig", "Remove Launch Configuration")
          }],
          trigger: /* @__PURE__ */ __name(() => {
            configManager.removeRecentDynamicConfigurations(name, type);
            return TriggerAction.CLOSE_PICKER;
          }, "trigger"),
          accept: /* @__PURE__ */ __name(async () => {
            await configManager.selectConfiguration(void 0, name, void 0, { type });
            try {
              const { launch, getConfig } = configManager.selectedConfiguration;
              const config = await getConfig();
              await this.debugService.startDebugging(launch, config, { startedByUser: true });
            } catch (error) {
              this.notificationService.error(error);
            }
          }, "accept")
        });
      }
    });
    dynamicProviders.forEach((provider) => {
      picks.push({
        label: `$(folder) ${provider.label}...`,
        ariaLabel: localize({ key: "providerAriaLabel", comment: ['Placeholder stands for the provider label. For example "NodeJS".'] }, "{0} contributed configurations", provider.label),
        accept: /* @__PURE__ */ __name(async () => {
          const pick = await provider.pick();
          if (pick) {
            await configManager.selectConfiguration(pick.launch, pick.config.name, pick.config, { type: provider.type });
            this.debugService.startDebugging(pick.launch, pick.config, { startedByUser: true });
          }
        }, "accept")
      });
    });
    const visibleLaunches = configManager.getLaunches().filter((launch) => !launch.hidden);
    if (visibleLaunches.length > 0) {
      picks.push({ type: "separator", label: localize("configure", "configure") });
    }
    for (const launch of visibleLaunches) {
      const label = this.contextService.getWorkbenchState() === 3 ? localize("addConfigTo", "Add Config ({0})...", launch.name) : localize("addConfiguration", "Add Configuration...");
      picks.push({
        label,
        description: this.contextService.getWorkbenchState() === 3 ? launch.name : "",
        highlights: { label: matchesFuzzy(filter, label, true) ?? void 0 },
        accept: /* @__PURE__ */ __name(() => this.commandService.executeCommand(ADD_CONFIGURATION_ID, launch.uri.toString()), "accept")
      });
    }
    return picks;
  }
};
StartDebugQuickAccessProvider = __decorate([
  __param(0, IDebugService),
  __param(1, IWorkspaceContextService),
  __param(2, ICommandService),
  __param(3, INotificationService)
], StartDebugQuickAccessProvider);
export {
  StartDebugQuickAccessProvider
};
//# sourceMappingURL=debugQuickAccess.js.map
