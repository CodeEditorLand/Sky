var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, DisposableMap } from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { Queue } from "../../../../base/common/async.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { parse } from "../../../../base/common/json.js";
import { applyEdits, setProperty } from "../../../../base/common/jsonEdit.js";
import { equals } from "../../../../base/common/objects.js";
import { distinct, equals as arrayEquals } from "../../../../base/common/arrays.js";
import { OS } from "../../../../base/common/platform.js";
import { isConfigurationOverrides, isConfigurationUpdateOverrides } from "../../../../platform/configuration/common/configuration.js";
import { ConfigurationChangeEvent, ConfigurationModel } from "../../../../platform/configuration/common/configurationModels.js";
import { DefaultConfiguration, NullPolicyConfiguration, PolicyConfiguration } from "../../../../platform/configuration/common/configurations.js";
import { Extensions, keyFromOverrideIdentifiers } from "../../../../platform/configuration/common/configurationRegistry.js";
import { NullPolicyService } from "../../../../platform/policy/common/policy.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { FolderConfiguration, UserConfiguration } from "../../../../workbench/services/configuration/browser/configuration.js";
import { APPLICATION_SCOPES, APPLY_ALL_PROFILES_SETTING, FOLDER_CONFIG_FOLDER_NAME, FOLDER_SETTINGS_PATH } from "../../../../workbench/services/configuration/common/configuration.js";
import { Configuration } from "../../../../workbench/services/configuration/common/configurationModels.js";
import "../../../../workbench/services/configuration/browser/configurationService.js";
class ConfigurationService extends Disposable {
  static {
    __name(this, "ConfigurationService");
  }
  constructor(userDataProfileService, workspaceService, uriIdentityService, fileService, policyService, logService) {
    super();
    this.workspaceService = workspaceService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this.logService = logService;
    this.cachedFolderConfigs = this._register(new DisposableMap(new ResourceMap()));
    this._onDidChangeConfiguration = this._register(new Emitter());
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    this.onDidChangeRestrictedSettings = Event.None;
    this.restrictedSettings = { default: [] };
    this.configurationRegistry = Registry.as(Extensions.Configuration);
    this.settingsResource = userDataProfileService.currentProfile.settingsResource;
    this.defaultConfiguration = this._register(new DefaultConfiguration(logService));
    this.policyConfiguration = policyService instanceof NullPolicyService ? new NullPolicyConfiguration() : this._register(new PolicyConfiguration(this.defaultConfiguration, policyService, logService));
    this.userConfiguration = this._register(new UserConfiguration(userDataProfileService.currentProfile.settingsResource, userDataProfileService.currentProfile.tasksResource, userDataProfileService.currentProfile.mcpResource, {}, fileService, uriIdentityService, logService));
    this.configurationEditing = new ConfigurationEditing(fileService, this);
    this._configuration = new Configuration(ConfigurationModel.createEmptyModel(logService), ConfigurationModel.createEmptyModel(logService), ConfigurationModel.createEmptyModel(logService), ConfigurationModel.createEmptyModel(logService), ConfigurationModel.createEmptyModel(logService), ConfigurationModel.createEmptyModel(logService), new ResourceMap(), ConfigurationModel.createEmptyModel(logService), new ResourceMap(), this.workspaceService.getWorkspace(), this.logService);
    this._register(this.defaultConfiguration.onDidChangeConfiguration(({ defaults, properties }) => this.onDefaultConfigurationChanged(defaults, properties)));
    this._register(this.policyConfiguration.onDidChangeConfiguration((configurationModel) => this.onPolicyConfigurationChanged(configurationModel)));
    this._register(this.userConfiguration.onDidChangeConfiguration((userConfiguration) => this.onUserConfigurationChanged(userConfiguration)));
    this._register(this.workspaceService.onWillChangeWorkspaceFolders((e) => e.join(this.loadFolderConfigurations(e.changes.added))));
    this._register(this.workspaceService.onDidChangeWorkspaceFolders((e) => this.onWorkspaceFoldersChanged(e)));
  }
  async initialize() {
    const [defaultModel, policyModel, userModel] = await Promise.all([
      this.defaultConfiguration.initialize(),
      this.policyConfiguration.initialize(),
      this.userConfiguration.initialize()
    ]);
    const workspace = this.workspaceService.getWorkspace();
    this._configuration = new Configuration(defaultModel, policyModel, ConfigurationModel.createEmptyModel(this.logService), userModel, ConfigurationModel.createEmptyModel(this.logService), ConfigurationModel.createEmptyModel(this.logService), new ResourceMap(), ConfigurationModel.createEmptyModel(this.logService), new ResourceMap(), workspace, this.logService);
    await this.loadFolderConfigurations(workspace.folders);
  }
  // #region IWorkbenchConfigurationService
  getConfigurationData() {
    return this._configuration.toData();
  }
  getValue(arg1, arg2) {
    const section = typeof arg1 === "string" ? arg1 : void 0;
    const overrides = isConfigurationOverrides(arg1) ? arg1 : isConfigurationOverrides(arg2) ? arg2 : void 0;
    return this._configuration.getValue(section, overrides);
  }
  async updateValue(key, value, arg3, arg4, _options) {
    const overrides = isConfigurationUpdateOverrides(arg3) ? arg3 : isConfigurationOverrides(arg3) ? { resource: arg3.resource, overrideIdentifiers: arg3.overrideIdentifier ? [arg3.overrideIdentifier] : void 0 } : void 0;
    const target = overrides ? arg4 : arg3;
    if (overrides?.overrideIdentifiers) {
      overrides.overrideIdentifiers = distinct(overrides.overrideIdentifiers);
      overrides.overrideIdentifiers = overrides.overrideIdentifiers.length ? overrides.overrideIdentifiers : void 0;
    }
    const inspect = this.inspect(key, { resource: overrides?.resource, overrideIdentifier: overrides?.overrideIdentifiers ? overrides.overrideIdentifiers[0] : void 0 });
    if (inspect.policyValue !== void 0) {
      throw new Error(`Unable to write ${key} because it is configured in system policy.`);
    }
    if (equals(value, inspect.defaultValue)) {
      value = void 0;
    }
    if (overrides?.overrideIdentifiers?.length && overrides.overrideIdentifiers.length > 1) {
      const overrideIdentifiers = overrides.overrideIdentifiers.sort();
      const existingOverrides = this._configuration.localUserConfiguration.overrides.find((override) => arrayEquals([...override.identifiers].sort(), overrideIdentifiers));
      if (existingOverrides) {
        overrides.overrideIdentifiers = existingOverrides.identifiers;
      }
    }
    const path = overrides?.overrideIdentifiers?.length ? [keyFromOverrideIdentifiers(overrides.overrideIdentifiers), key] : [key];
    const settingsResource = this.getSettingsResource(target, overrides?.resource ?? void 0);
    await this.configurationEditing.write(settingsResource, path, value);
    await this.reloadConfiguration();
  }
  getSettingsResource(target, resource) {
    if (target === 6 || target === 5) {
      if (resource) {
        const folder = this.workspaceService.getWorkspaceFolder(resource);
        if (folder) {
          return this.uriIdentityService.extUri.joinPath(folder.uri, FOLDER_SETTINGS_PATH);
        }
      }
    }
    return this.settingsResource;
  }
  inspect(key, overrides) {
    return this._configuration.inspect(key, overrides);
  }
  keys() {
    return this._configuration.keys();
  }
  async reloadConfiguration(_target) {
    const userModel = await this.userConfiguration.initialize();
    const previousData = this._configuration.toData();
    const change = this._configuration.compareAndUpdateLocalUserConfiguration(userModel);
    for (const folder of this.workspaceService.getWorkspace().folders) {
      const folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
      if (folderConfiguration) {
        const folderModel = await folderConfiguration.loadConfiguration();
        const folderChange = this._configuration.compareAndUpdateFolderConfiguration(folder.uri, folderModel);
        change.keys.push(...folderChange.keys);
        change.overrides.push(...folderChange.overrides);
      }
    }
    this.triggerConfigurationChange(
      change,
      previousData,
      2
      /* ConfigurationTarget.USER */
    );
  }
  hasCachedConfigurationDefaultsOverrides() {
    return false;
  }
  async whenRemoteConfigurationLoaded() {
  }
  isSettingAppliedForAllProfiles(key) {
    const scope = this.configurationRegistry.getConfigurationProperties()[key]?.scope;
    if (scope && APPLICATION_SCOPES.includes(scope)) {
      return true;
    }
    const allProfilesSettings = this.getValue(APPLY_ALL_PROFILES_SETTING) ?? [];
    return Array.isArray(allProfilesSettings) && allProfilesSettings.includes(key);
  }
  // #endregion
  // #region Configuration change handlers
  onDefaultConfigurationChanged(defaults, properties) {
    const previousData = this._configuration.toData();
    const change = this._configuration.compareAndUpdateDefaultConfiguration(defaults, properties);
    this._configuration.updateLocalUserConfiguration(this.userConfiguration.reparse());
    for (const folder of this.workspaceService.getWorkspace().folders) {
      const folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
      if (folderConfiguration) {
        this._configuration.updateFolderConfiguration(folder.uri, folderConfiguration.reparse());
      }
    }
    this.triggerConfigurationChange(
      change,
      previousData,
      7
      /* ConfigurationTarget.DEFAULT */
    );
  }
  onPolicyConfigurationChanged(policyConfiguration) {
    const previousData = this._configuration.toData();
    const change = this._configuration.compareAndUpdatePolicyConfiguration(policyConfiguration);
    this.triggerConfigurationChange(
      change,
      previousData,
      7
      /* ConfigurationTarget.DEFAULT */
    );
  }
  onUserConfigurationChanged(userConfiguration) {
    const previousData = this._configuration.toData();
    const change = this._configuration.compareAndUpdateLocalUserConfiguration(userConfiguration);
    this.triggerConfigurationChange(
      change,
      previousData,
      2
      /* ConfigurationTarget.USER */
    );
  }
  onWorkspaceFoldersChanged(e) {
    const previousData = this._configuration.toData();
    const keys = [];
    const overrides = [];
    for (const folder of e.removed) {
      const change = this._configuration.compareAndDeleteFolderConfiguration(folder.uri);
      keys.push(...change.keys);
      overrides.push(...change.overrides);
      this.cachedFolderConfigs.deleteAndDispose(folder.uri);
    }
    if (keys.length || overrides.length) {
      this.triggerConfigurationChange(
        { keys, overrides },
        previousData,
        6
        /* ConfigurationTarget.WORKSPACE_FOLDER */
      );
    }
  }
  onWorkspaceFolderConfigurationChanged(folder) {
    const folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
    if (folderConfiguration) {
      folderConfiguration.loadConfiguration().then((configurationModel) => {
        const previousData = this._configuration.toData();
        const change = this._configuration.compareAndUpdateFolderConfiguration(folder.uri, configurationModel);
        this.triggerConfigurationChange(
          change,
          previousData,
          6
          /* ConfigurationTarget.WORKSPACE_FOLDER */
        );
      }, onUnexpectedError);
    }
  }
  async loadFolderConfigurations(folders) {
    for (const folder of folders) {
      let folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
      if (!folderConfiguration) {
        folderConfiguration = new FolderConfiguration(false, folder, FOLDER_CONFIG_FOLDER_NAME, 3, true, this.fileService, this.uriIdentityService, this.logService, { needsCaching: /* @__PURE__ */ __name(() => false, "needsCaching"), read: /* @__PURE__ */ __name(async () => "", "read"), write: /* @__PURE__ */ __name(async () => {
        }, "write"), remove: /* @__PURE__ */ __name(async () => {
        }, "remove") });
        folderConfiguration.addRelated(folderConfiguration.onDidChange(() => this.onWorkspaceFolderConfigurationChanged(folder)));
        this.cachedFolderConfigs.set(folder.uri, folderConfiguration);
      }
      const configurationModel = await folderConfiguration.loadConfiguration();
      this._configuration.updateFolderConfiguration(folder.uri, configurationModel);
    }
  }
  triggerConfigurationChange(change, previousData, target) {
    if (change.keys.length) {
      const workspace = this.workspaceService.getWorkspace();
      const event = new ConfigurationChangeEvent(change, { data: previousData, workspace }, this._configuration, workspace, this.logService);
      event.source = target;
      this._onDidChangeConfiguration.fire(event);
    }
  }
}
class ConfigurationEditing {
  static {
    __name(this, "ConfigurationEditing");
  }
  constructor(fileService, configurationService) {
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.queue = new Queue();
  }
  write(settingsResource, path, value) {
    return this.queue.queue(() => this.doWriteConfiguration(settingsResource, path, value));
  }
  async doWriteConfiguration(settingsResource, path, value) {
    let content;
    try {
      const fileContent = await this.fileService.readFile(settingsResource);
      content = fileContent.value.toString();
    } catch (error) {
      if (error.fileOperationResult === 1) {
        content = "{}";
      } else {
        throw error;
      }
    }
    const parseErrors = [];
    parse(content, parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
    if (parseErrors.length > 0) {
      throw new Error("Unable to write into the settings file. Please open the file to correct errors/warnings in the file and try again.");
    }
    const edits = this.getEdits(content, path, value);
    content = applyEdits(content, edits);
    await this.fileService.writeFile(settingsResource, VSBuffer.fromString(content));
  }
  getEdits(content, path, value) {
    const { tabSize, insertSpaces, eol } = this.formattingOptions;
    if (!path.length) {
      const newContent = JSON.stringify(value, null, insertSpaces ? " ".repeat(tabSize) : "	");
      return [{
        content: newContent,
        length: content.length,
        offset: 0
      }];
    }
    return setProperty(content, path, value, { tabSize, insertSpaces, eol });
  }
  get formattingOptions() {
    if (!this._formattingOptions) {
      let eol = OS === 3 || OS === 2 ? "\n" : "\r\n";
      const configuredEol = this.configurationService.getValue("files.eol", { overrideIdentifier: "jsonc" });
      if (configuredEol && typeof configuredEol === "string" && configuredEol !== "auto") {
        eol = configuredEol;
      }
      this._formattingOptions = {
        eol,
        insertSpaces: !!this.configurationService.getValue("editor.insertSpaces", { overrideIdentifier: "jsonc" }),
        tabSize: this.configurationService.getValue("editor.tabSize", { overrideIdentifier: "jsonc" })
      };
    }
    return this._formattingOptions;
  }
}
export {
  ConfigurationService
};
//# sourceMappingURL=configurationService.js.map
