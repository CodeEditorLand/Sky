var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../nls.js";
import { Extensions as ConfigurationExtensions } from "../../platform/configuration/common/configurationRegistry.js";
import { Registry } from "../../platform/registry/common/platform.js";
import { IWorkspaceContextService } from "../../platform/workspace/common/workspace.js";
import { IConfigurationService } from "../../platform/configuration/common/configuration.js";
import { Disposable } from "../../base/common/lifecycle.js";
import { Emitter } from "../../base/common/event.js";
import { IRemoteAgentService } from "../services/remote/common/remoteAgentService.js";
import { isWindows } from "../../base/common/platform.js";
import { equals } from "../../base/common/objects.js";
import { DeferredPromise } from "../../base/common/async.js";
import { IUserDataProfilesService } from "../../platform/userDataProfile/common/userDataProfile.js";
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
const applicationConfigurationNodeBase = Object.freeze({
  "id": "application",
  "order": 100,
  "title": localize("applicationConfigurationTitle", "Application"),
  "type": "object"
});
const workbenchConfigurationNodeBase = Object.freeze({
  "id": "workbench",
  "order": 7,
  "title": localize("workbenchConfigurationTitle", "Workbench"),
  "type": "object"
});
const securityConfigurationNodeBase = Object.freeze({
  "id": "security",
  "scope": 1,
  "title": localize("securityConfigurationTitle", "Security"),
  "type": "object",
  "order": 7
});
const problemsConfigurationNodeBase = Object.freeze({
  "id": "problems",
  "title": localize("problemsConfigurationTitle", "Problems"),
  "type": "object",
  "order": 101
});
const windowConfigurationNodeBase = Object.freeze({
  "id": "window",
  "order": 8,
  "title": localize("windowConfigurationTitle", "Window"),
  "type": "object"
});
const Extensions = {
  ConfigurationMigration: "base.contributions.configuration.migration"
};
class ConfigurationMigrationRegistry {
  static {
    __name(this, "ConfigurationMigrationRegistry");
  }
  constructor() {
    this.migrations = [];
    this._onDidRegisterConfigurationMigrations = new Emitter();
    this.onDidRegisterConfigurationMigration = this._onDidRegisterConfigurationMigrations.event;
  }
  registerConfigurationMigrations(configurationMigrations) {
    this.migrations.push(...configurationMigrations);
  }
}
const configurationMigrationRegistry = new ConfigurationMigrationRegistry();
Registry.add(Extensions.ConfigurationMigration, configurationMigrationRegistry);
let ConfigurationMigrationWorkbenchContribution = class ConfigurationMigrationWorkbenchContribution2 extends Disposable {
  static {
    __name(this, "ConfigurationMigrationWorkbenchContribution");
  }
  static {
    this.ID = "workbench.contrib.configurationMigration";
  }
  constructor(configurationService, workspaceService) {
    super();
    this.configurationService = configurationService;
    this.workspaceService = workspaceService;
    this._register(this.workspaceService.onDidChangeWorkspaceFolders(async (e) => {
      for (const folder of e.added) {
        await this.migrateConfigurationsForFolder(folder, configurationMigrationRegistry.migrations);
      }
    }));
    this.migrateConfigurations(configurationMigrationRegistry.migrations);
    this._register(configurationMigrationRegistry.onDidRegisterConfigurationMigration((migration) => this.migrateConfigurations(migration)));
  }
  async migrateConfigurations(migrations) {
    await this.migrateConfigurationsForFolder(void 0, migrations);
    for (const folder of this.workspaceService.getWorkspace().folders) {
      await this.migrateConfigurationsForFolder(folder, migrations);
    }
  }
  async migrateConfigurationsForFolder(folder, migrations) {
    await Promise.all([migrations.map((migration) => this.migrateConfigurationsForFolderAndOverride(migration, folder?.uri))]);
  }
  async migrateConfigurationsForFolderAndOverride(migration, resource) {
    const inspectData = this.configurationService.inspect(migration.key, { resource });
    const targetPairs = this.workspaceService.getWorkbenchState() === 3 ? [
      [
        "user",
        2
        /* ConfigurationTarget.USER */
      ],
      [
        "userLocal",
        3
        /* ConfigurationTarget.USER_LOCAL */
      ],
      [
        "userRemote",
        4
        /* ConfigurationTarget.USER_REMOTE */
      ],
      [
        "workspace",
        5
        /* ConfigurationTarget.WORKSPACE */
      ],
      [
        "workspaceFolder",
        6
        /* ConfigurationTarget.WORKSPACE_FOLDER */
      ]
    ] : [
      [
        "user",
        2
        /* ConfigurationTarget.USER */
      ],
      [
        "userLocal",
        3
        /* ConfigurationTarget.USER_LOCAL */
      ],
      [
        "userRemote",
        4
        /* ConfigurationTarget.USER_REMOTE */
      ],
      [
        "workspace",
        5
        /* ConfigurationTarget.WORKSPACE */
      ]
    ];
    for (const [dataKey, target] of targetPairs) {
      const inspectValue = inspectData[dataKey];
      if (!inspectValue) {
        continue;
      }
      const migrationValues = [];
      if (inspectValue.value !== void 0) {
        const keyValuePairs = await this.runMigration(migration, dataKey, inspectValue.value, resource, void 0);
        for (const keyValuePair of keyValuePairs ?? []) {
          migrationValues.push([keyValuePair, []]);
        }
      }
      for (const { identifiers, value } of inspectValue.overrides ?? []) {
        if (value !== void 0) {
          const keyValuePairs = await this.runMigration(migration, dataKey, value, resource, identifiers);
          for (const keyValuePair of keyValuePairs ?? []) {
            migrationValues.push([keyValuePair, identifiers]);
          }
        }
      }
      if (migrationValues.length) {
        await Promise.allSettled(migrationValues.map(async ([[key, value], overrideIdentifiers]) => this.configurationService.updateValue(key, value.value, { resource, overrideIdentifiers }, target)));
      }
    }
  }
  async runMigration(migration, dataKey, value, resource, overrideIdentifiers) {
    const valueAccessor = /* @__PURE__ */ __name((key) => {
      const inspectData = this.configurationService.inspect(key, { resource });
      const inspectValue = inspectData[dataKey];
      if (!inspectValue) {
        return void 0;
      }
      if (!overrideIdentifiers) {
        return inspectValue.value;
      }
      return inspectValue.overrides?.find(({ identifiers }) => equals(identifiers, overrideIdentifiers))?.value;
    }, "valueAccessor");
    const result = await migration.migrateFn(value, valueAccessor);
    return Array.isArray(result) ? result : [[migration.key, result]];
  }
};
ConfigurationMigrationWorkbenchContribution = __decorate([
  __param(0, IConfigurationService),
  __param(1, IWorkspaceContextService)
], ConfigurationMigrationWorkbenchContribution);
let DynamicWorkbenchSecurityConfiguration = class DynamicWorkbenchSecurityConfiguration2 extends Disposable {
  static {
    __name(this, "DynamicWorkbenchSecurityConfiguration");
  }
  static {
    this.ID = "workbench.contrib.dynamicWorkbenchSecurityConfiguration";
  }
  constructor(remoteAgentService) {
    super();
    this.remoteAgentService = remoteAgentService;
    this._ready = new DeferredPromise();
    this.ready = this._ready.p;
    this.create();
  }
  async create() {
    try {
      await this.doCreate();
    } finally {
      this._ready.complete();
    }
  }
  async doCreate() {
    if (!isWindows) {
      const remoteEnvironment = await this.remoteAgentService.getEnvironment();
      if (remoteEnvironment?.os !== 1) {
        return;
      }
    }
    const registry = Registry.as(ConfigurationExtensions.Configuration);
    registry.registerConfiguration({
      ...securityConfigurationNodeBase,
      "properties": {
        "security.allowedUNCHosts": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[^\\\\]+$",
            "patternErrorMessage": localize("security.allowedUNCHosts.patternErrorMessage", "UNC host names must not contain backslashes.")
          },
          "default": [],
          "markdownDescription": localize("security.allowedUNCHosts", "A set of UNC host names (without leading or trailing backslash, for example `192.168.0.1` or `my-server`) to allow without user confirmation. If a UNC host is being accessed that is not allowed via this setting or has not been acknowledged via user confirmation, an error will occur and the operation stopped. A restart is required when changing this setting. Find out more about this setting at https://aka.ms/vscode-windows-unc."),
          "scope": 3
          /* ConfigurationScope.APPLICATION_MACHINE */
        },
        "security.restrictUNCAccess": {
          "type": "boolean",
          "default": true,
          "markdownDescription": localize("security.restrictUNCAccess", "If enabled, only allows access to UNC host names that are allowed by the `#security.allowedUNCHosts#` setting or after user confirmation. Find out more about this setting at https://aka.ms/vscode-windows-unc."),
          "scope": 3
          /* ConfigurationScope.APPLICATION_MACHINE */
        }
      }
    });
  }
};
DynamicWorkbenchSecurityConfiguration = __decorate([
  __param(0, IRemoteAgentService)
], DynamicWorkbenchSecurityConfiguration);
const CONFIG_NEW_WINDOW_PROFILE = "window.newWindowProfile";
let DynamicWindowConfiguration = class DynamicWindowConfiguration2 extends Disposable {
  static {
    __name(this, "DynamicWindowConfiguration");
  }
  static {
    this.ID = "workbench.contrib.dynamicWindowConfiguration";
  }
  constructor(userDataProfilesService, configurationService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.configurationService = configurationService;
    this.registerNewWindowProfileConfiguration();
    this._register(this.userDataProfilesService.onDidChangeProfiles((e) => this.registerNewWindowProfileConfiguration()));
    this.setNewWindowProfile();
    this.checkAndResetNewWindowProfileConfig();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.source !== 7 && e.affectsConfiguration(CONFIG_NEW_WINDOW_PROFILE)) {
        this.setNewWindowProfile();
      }
    }));
    this._register(this.userDataProfilesService.onDidChangeProfiles(() => this.checkAndResetNewWindowProfileConfig()));
  }
  registerNewWindowProfileConfiguration() {
    const registry = Registry.as(ConfigurationExtensions.Configuration);
    const configurationNode = {
      ...windowConfigurationNodeBase,
      "properties": {
        [CONFIG_NEW_WINDOW_PROFILE]: {
          "type": ["string", "null"],
          "default": null,
          "enum": [...this.userDataProfilesService.profiles.map((profile) => profile.name), null],
          "enumItemLabels": [...this.userDataProfilesService.profiles.map((p) => ""), localize("active window", "Active Window")],
          "description": localize("newWindowProfile", "Specifies the profile to use when opening a new window. If a profile name is provided, the new window will use that profile. If no profile name is provided, the new window will use the profile of the active window or the Default profile if no active window exists."),
          "scope": 1
        }
      }
    };
    if (this.configurationNode) {
      registry.updateConfigurations({ add: [configurationNode], remove: [this.configurationNode] });
    } else {
      registry.registerConfiguration(configurationNode);
    }
    this.configurationNode = configurationNode;
  }
  setNewWindowProfile() {
    const newWindowProfileName = this.configurationService.getValue(CONFIG_NEW_WINDOW_PROFILE);
    this.newWindowProfile = newWindowProfileName ? this.userDataProfilesService.profiles.find((profile) => profile.name === newWindowProfileName) : void 0;
  }
  checkAndResetNewWindowProfileConfig() {
    const newWindowProfileName = this.configurationService.getValue(CONFIG_NEW_WINDOW_PROFILE);
    if (!newWindowProfileName) {
      return;
    }
    const profile = this.newWindowProfile ? this.userDataProfilesService.profiles.find((profile2) => profile2.id === this.newWindowProfile.id) : void 0;
    if (newWindowProfileName === profile?.name) {
      return;
    }
    this.configurationService.updateValue(CONFIG_NEW_WINDOW_PROFILE, profile?.name);
  }
};
DynamicWindowConfiguration = __decorate([
  __param(0, IUserDataProfilesService),
  __param(1, IConfigurationService)
], DynamicWindowConfiguration);
export {
  CONFIG_NEW_WINDOW_PROFILE,
  ConfigurationMigrationWorkbenchContribution,
  DynamicWindowConfiguration,
  DynamicWorkbenchSecurityConfiguration,
  Extensions,
  applicationConfigurationNodeBase,
  problemsConfigurationNodeBase,
  securityConfigurationNodeBase,
  windowConfigurationNodeBase,
  workbenchConfigurationNodeBase
};
//# sourceMappingURL=configuration.js.map
