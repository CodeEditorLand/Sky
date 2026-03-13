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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { mcpConfigurationSection } from "../../../contrib/mcp/common/mcpConfiguration.js";
import { IWorkbenchMcpManagementService } from "../../../services/mcp/common/mcpWorkbenchManagementService.js";
import { IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
import { IFileService, toFileOperationResult } from "../../../../platform/files/common/files.js";
import { parse } from "../../../../base/common/jsonc.js";
import { isObject } from "../../../../base/common/types.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { IJSONEditingService } from "../../../services/configuration/common/jsonEditing.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { localize } from "../../../../nls.js";
let McpConfigMigrationContribution = class McpConfigMigrationContribution2 extends Disposable {
  static {
    __name(this, "McpConfigMigrationContribution");
  }
  static {
    this.ID = "workbench.mcp.config.migration";
  }
  constructor(mcpManagementService, userDataProfileService, fileService, remoteAgentService, jsonEditingService, logService, notificationService, commandService) {
    super();
    this.mcpManagementService = mcpManagementService;
    this.userDataProfileService = userDataProfileService;
    this.fileService = fileService;
    this.remoteAgentService = remoteAgentService;
    this.jsonEditingService = jsonEditingService;
    this.logService = logService;
    this.notificationService = notificationService;
    this.commandService = commandService;
    this.migrateMcpConfig();
  }
  async migrateMcpConfig() {
    try {
      const userMcpConfig = await this.parseMcpConfig(this.userDataProfileService.currentProfile.settingsResource);
      if (userMcpConfig && userMcpConfig.servers && Object.keys(userMcpConfig.servers).length > 0) {
        await Promise.all(Object.entries(userMcpConfig.servers).map(([name, config], index) => this.mcpManagementService.install({ name, config, inputs: index === 0 ? userMcpConfig.inputs : void 0 })));
        await this.removeMcpConfig(this.userDataProfileService.currentProfile.settingsResource);
      }
    } catch (error) {
      this.logService.error(`MCP migration: Failed to migrate user MCP config`, error);
    }
    this.watchForMcpConfiguration(this.userDataProfileService.currentProfile.settingsResource, false);
    const remoteEnvironment = await this.remoteAgentService.getEnvironment();
    if (remoteEnvironment) {
      try {
        const userRemoteMcpConfig = await this.parseMcpConfig(remoteEnvironment.settingsPath);
        if (userRemoteMcpConfig && userRemoteMcpConfig.servers && Object.keys(userRemoteMcpConfig.servers).length > 0) {
          await Promise.all(Object.entries(userRemoteMcpConfig.servers).map(([name, config], index) => this.mcpManagementService.install({ name, config, inputs: index === 0 ? userRemoteMcpConfig.inputs : void 0 }, {
            target: 4
            /* ConfigurationTarget.USER_REMOTE */
          })));
          await this.removeMcpConfig(remoteEnvironment.settingsPath);
        }
      } catch (error) {
        this.logService.error(`MCP migration: Failed to migrate remote MCP config`, error);
      }
      this.watchForMcpConfiguration(remoteEnvironment.settingsPath, true);
    }
  }
  watchForMcpConfiguration(file, isRemote) {
    this._register(this.fileService.watch(file));
    this._register(this.fileService.onDidFilesChange((e) => {
      if (e.contains(file)) {
        this.checkForMcpConfigInFile(file, isRemote);
      }
    }));
  }
  async checkForMcpConfigInFile(settingsFile, isRemote) {
    try {
      const mcpConfig = await this.parseMcpConfig(settingsFile);
      if (mcpConfig && mcpConfig.servers && Object.keys(mcpConfig.servers).length > 0) {
        this.showMcpConfigErrorNotification(isRemote);
      }
    } catch (error) {
    }
  }
  showMcpConfigErrorNotification(isRemote) {
    const message = isRemote ? localize("mcp.migration.remoteConfigFound", "MCP servers should no longer be configured in remote user settings. Use the dedicated MCP configuration instead.") : localize("mcp.migration.userConfigFound", "MCP servers should no longer be configured in user settings. Use the dedicated MCP configuration instead.");
    const openConfigLabel = isRemote ? localize("mcp.migration.openRemoteConfig", "Open Remote User MCP Configuration") : localize("mcp.migration.openUserConfig", "Open User MCP Configuration");
    const commandId = isRemote ? "workbench.mcp.openRemoteUserMcpJson" : "workbench.mcp.openUserMcpJson";
    this.notificationService.prompt(Severity.Error, message, [{
      label: localize("mcp.migration.update", "Update Now"),
      run: /* @__PURE__ */ __name(async () => {
        await this.migrateMcpConfig();
        await this.commandService.executeCommand(commandId);
      }, "run")
    }, {
      label: openConfigLabel,
      keepOpen: true,
      run: /* @__PURE__ */ __name(() => this.commandService.executeCommand(commandId), "run")
    }]);
  }
  async parseMcpConfig(settingsFile) {
    try {
      const content = await this.fileService.readFile(settingsFile);
      const settingsObject = parse(content.value.toString());
      if (!isObject(settingsObject)) {
        return void 0;
      }
      const mcpConfiguration = settingsObject[mcpConfigurationSection];
      if (mcpConfiguration && mcpConfiguration.servers) {
        for (const [, config] of Object.entries(mcpConfiguration.servers)) {
          if (config.type === void 0) {
            config.type = config.command ? "stdio" : "http";
          }
        }
      }
      return mcpConfiguration;
    } catch (error) {
      if (toFileOperationResult(error) !== 1) {
        this.logService.warn(`MCP migration: Failed to parse MCP config from ${settingsFile}:`, error);
      }
      return;
    }
  }
  async removeMcpConfig(settingsFile) {
    try {
      await this.jsonEditingService.write(settingsFile, [
        {
          path: [mcpConfigurationSection],
          value: void 0
        }
      ], true);
    } catch (error) {
      this.logService.warn(`MCP migration: Failed to remove MCP config from ${settingsFile}:`, error);
    }
  }
};
McpConfigMigrationContribution = __decorate([
  __param(0, IWorkbenchMcpManagementService),
  __param(1, IUserDataProfileService),
  __param(2, IFileService),
  __param(3, IRemoteAgentService),
  __param(4, IJSONEditingService),
  __param(5, ILogService),
  __param(6, INotificationService),
  __param(7, ICommandService)
], McpConfigMigrationContribution);
export {
  McpConfigMigrationContribution
};
//# sourceMappingURL=mcpMigration.js.map
