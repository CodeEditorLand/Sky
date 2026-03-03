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
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { ChatConfiguration } from "../common/constants.js";
import { IAgentPluginRepositoryService } from "../common/plugins/agentPluginRepositoryService.js";
let PluginInstallService = class PluginInstallService2 {
  static {
    __name(this, "PluginInstallService");
  }
  constructor(_pluginRepositoryService, _configurationService, _fileService, _notificationService) {
    this._pluginRepositoryService = _pluginRepositoryService;
    this._configurationService = _configurationService;
    this._fileService = _fileService;
    this._notificationService = _notificationService;
  }
  async installPlugin(plugin) {
    try {
      await this._pluginRepositoryService.ensureRepository(plugin.marketplaceReference, {
        progressTitle: localize("installingPlugin", "Installing plugin '{0}'...", plugin.name),
        failureLabel: plugin.name,
        marketplaceType: plugin.marketplaceType
      });
    } catch {
      return;
    }
    let pluginDir;
    try {
      pluginDir = this._pluginRepositoryService.getPluginInstallUri(plugin);
    } catch {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("pluginDirInvalid", "Plugin source directory '{0}' is invalid for repository '{1}'.", plugin.source, plugin.marketplace)
      });
      return;
    }
    const pluginExists = await this._fileService.exists(pluginDir);
    if (!pluginExists) {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("pluginDirNotFound", "Plugin source directory '{0}' not found in repository '{1}'.", plugin.source, plugin.marketplace)
      });
      return;
    }
    this._addPluginPath(pluginDir.fsPath);
  }
  async updatePlugin(plugin) {
    return this._pluginRepositoryService.pullRepository(plugin.marketplaceReference, {
      pluginName: plugin.name,
      failureLabel: plugin.name,
      marketplaceType: plugin.marketplaceType
    });
  }
  async uninstallPlugin(pluginUri) {
    await this._removePluginPath(pluginUri.fsPath);
  }
  getPluginInstallUri(plugin) {
    return this._pluginRepositoryService.getPluginInstallUri(plugin);
  }
  /**
   * Adds the given file-system path to `chat.plugins.paths` in user-local config.
   */
  _addPluginPath(fsPath) {
    const current = this._configurationService.getValue(ChatConfiguration.PluginPaths) ?? {};
    if (Object.prototype.hasOwnProperty.call(current, fsPath)) {
      return;
    }
    this._configurationService.updateValue(
      ChatConfiguration.PluginPaths,
      { ...current, [fsPath]: true },
      3
      /* ConfigurationTarget.USER_LOCAL */
    );
  }
  /**
   * Removes the given file-system path from `chat.plugins.paths` in user-local config.
   */
  _removePluginPath(fsPath) {
    const current = this._configurationService.getValue(ChatConfiguration.PluginPaths) ?? {};
    if (!Object.prototype.hasOwnProperty.call(current, fsPath)) {
      return;
    }
    const updated = { ...current };
    delete updated[fsPath];
    return this._configurationService.updateValue(
      ChatConfiguration.PluginPaths,
      updated,
      3
      /* ConfigurationTarget.USER_LOCAL */
    );
  }
};
PluginInstallService = __decorate([
  __param(0, IAgentPluginRepositoryService),
  __param(1, IConfigurationService),
  __param(2, IFileService),
  __param(3, INotificationService)
], PluginInstallService);
export {
  PluginInstallService
};
//# sourceMappingURL=pluginInstallService.js.map
