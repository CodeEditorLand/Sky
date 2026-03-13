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
import * as nls from "../../../../nls.js";
import * as json from "../../../../base/common/json.js";
import { setProperty } from "../../../../base/common/jsonEdit.js";
import { Queue } from "../../../../base/common/async.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ITextFileService } from "../../textfile/common/textfiles.js";
import { FOLDER_SETTINGS_PATH, WORKSPACE_STANDALONE_CONFIGURATIONS, TASKS_CONFIGURATION_KEY, LAUNCH_CONFIGURATION_KEY, USER_STANDALONE_CONFIGURATIONS, TASKS_DEFAULT, FOLDER_SCOPES, IWorkbenchConfigurationService, APPLICATION_SCOPES, MCP_CONFIGURATION_KEY } from "./configuration.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { Extensions as ConfigurationExtensions, keyFromOverrideIdentifiers, OVERRIDE_PROPERTY_REGEX } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IPreferencesService } from "../../preferences/common/preferences.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { Range } from "../../../../editor/common/core/range.js";
import { EditOperation } from "../../../../editor/common/core/editOperation.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { ErrorNoTelemetry } from "../../../../base/common/errors.js";
import { IFilesConfigurationService } from "../../filesConfiguration/common/filesConfigurationService.js";
var ConfigurationEditingErrorCode;
(function(ConfigurationEditingErrorCode2) {
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_UNKNOWN_KEY"] = 0] = "ERROR_UNKNOWN_KEY";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION"] = 1] = "ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE"] = 2] = "ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_INVALID_FOLDER_CONFIGURATION"] = 3] = "ERROR_INVALID_FOLDER_CONFIGURATION";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_INVALID_USER_TARGET"] = 4] = "ERROR_INVALID_USER_TARGET";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_INVALID_WORKSPACE_TARGET"] = 5] = "ERROR_INVALID_WORKSPACE_TARGET";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_INVALID_FOLDER_TARGET"] = 6] = "ERROR_INVALID_FOLDER_TARGET";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION"] = 7] = "ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_NO_WORKSPACE_OPENED"] = 8] = "ERROR_NO_WORKSPACE_OPENED";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_CONFIGURATION_FILE_DIRTY"] = 9] = "ERROR_CONFIGURATION_FILE_DIRTY";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_CONFIGURATION_FILE_MODIFIED_SINCE"] = 10] = "ERROR_CONFIGURATION_FILE_MODIFIED_SINCE";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_INVALID_CONFIGURATION"] = 11] = "ERROR_INVALID_CONFIGURATION";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_POLICY_CONFIGURATION"] = 12] = "ERROR_POLICY_CONFIGURATION";
  ConfigurationEditingErrorCode2[ConfigurationEditingErrorCode2["ERROR_INTERNAL"] = 13] = "ERROR_INTERNAL";
})(ConfigurationEditingErrorCode || (ConfigurationEditingErrorCode = {}));
class ConfigurationEditingError extends ErrorNoTelemetry {
  static {
    __name(this, "ConfigurationEditingError");
  }
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}
var EditableConfigurationTarget;
(function(EditableConfigurationTarget2) {
  EditableConfigurationTarget2[EditableConfigurationTarget2["USER_LOCAL"] = 1] = "USER_LOCAL";
  EditableConfigurationTarget2[EditableConfigurationTarget2["USER_REMOTE"] = 2] = "USER_REMOTE";
  EditableConfigurationTarget2[EditableConfigurationTarget2["WORKSPACE"] = 3] = "WORKSPACE";
  EditableConfigurationTarget2[EditableConfigurationTarget2["WORKSPACE_FOLDER"] = 4] = "WORKSPACE_FOLDER";
})(EditableConfigurationTarget || (EditableConfigurationTarget = {}));
let ConfigurationEditing = class ConfigurationEditing2 {
  static {
    __name(this, "ConfigurationEditing");
  }
  constructor(remoteSettingsResource, configurationService, contextService, userDataProfileService, userDataProfilesService, fileService, textModelResolverService, textFileService, notificationService, preferencesService, editorService, uriIdentityService, filesConfigurationService) {
    this.remoteSettingsResource = remoteSettingsResource;
    this.configurationService = configurationService;
    this.contextService = contextService;
    this.userDataProfileService = userDataProfileService;
    this.userDataProfilesService = userDataProfilesService;
    this.fileService = fileService;
    this.textModelResolverService = textModelResolverService;
    this.textFileService = textFileService;
    this.notificationService = notificationService;
    this.preferencesService = preferencesService;
    this.editorService = editorService;
    this.uriIdentityService = uriIdentityService;
    this.filesConfigurationService = filesConfigurationService;
    this.queue = new Queue();
  }
  async writeConfiguration(target, value, options = {}) {
    const operation = this.getConfigurationEditOperation(target, value, options.scopes || {});
    return this.queue.queue(async () => {
      try {
        await this.doWriteConfiguration(operation, options);
      } catch (error) {
        if (options.donotNotifyError) {
          throw error;
        }
        await this.onError(error, operation, options.scopes);
      }
    });
  }
  async doWriteConfiguration(operation, options) {
    await this.validate(operation.target, operation, !options.handleDirtyFile, options.scopes || {});
    const resource = operation.resource;
    const reference = await this.resolveModelReference(resource);
    try {
      const formattingOptions = this.getFormattingOptions(reference.object.textEditorModel);
      await this.updateConfiguration(operation, reference.object.textEditorModel, formattingOptions, options);
    } finally {
      reference.dispose();
    }
  }
  async updateConfiguration(operation, model, formattingOptions, options) {
    if (this.hasParseErrors(model.getValue(), operation)) {
      throw this.toConfigurationEditingError(11, operation.target, operation);
    }
    if (this.textFileService.isDirty(model.uri) && options.handleDirtyFile) {
      switch (options.handleDirtyFile) {
        case "save":
          await this.save(model, operation);
          break;
        case "revert":
          await this.textFileService.revert(model.uri);
          break;
      }
    }
    const edit = this.getEdits(operation, model.getValue(), formattingOptions)[0];
    if (edit) {
      let disposable;
      try {
        disposable = this.filesConfigurationService.enableAutoSaveAfterShortDelay(model.uri);
        if (this.applyEditsToBuffer(edit, model)) {
          await this.save(model, operation);
        }
      } finally {
        disposable?.dispose();
      }
    }
  }
  async save(model, operation) {
    try {
      await this.textFileService.save(model.uri, { ignoreErrorHandler: true });
    } catch (error) {
      if (error.fileOperationResult === 3) {
        throw this.toConfigurationEditingError(10, operation.target, operation);
      }
      throw new ConfigurationEditingError(
        nls.localize("fsError", "Error while writing to {0}. {1}", this.stringifyTarget(operation.target), error.message),
        13
        /* ConfigurationEditingErrorCode.ERROR_INTERNAL */
      );
    }
  }
  applyEditsToBuffer(edit, model) {
    const startPosition = model.getPositionAt(edit.offset);
    const endPosition = model.getPositionAt(edit.offset + edit.length);
    const range = new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
    const currentText = model.getValueInRange(range);
    if (edit.content !== currentText) {
      const editOperation = currentText ? EditOperation.replace(range, edit.content) : EditOperation.insert(startPosition, edit.content);
      model.pushEditOperations([new Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
      return true;
    }
    return false;
  }
  getEdits({ value, jsonPath }, modelContent, formattingOptions) {
    if (jsonPath.length) {
      return setProperty(modelContent, jsonPath, value, formattingOptions);
    }
    const content = JSON.stringify(value, null, formattingOptions.insertSpaces && formattingOptions.tabSize ? " ".repeat(formattingOptions.tabSize) : "	");
    return [{
      content,
      length: modelContent.length,
      offset: 0
    }];
  }
  getFormattingOptions(model) {
    const { insertSpaces, tabSize } = model.getOptions();
    const eol = model.getEOL();
    return { insertSpaces, tabSize, eol };
  }
  async onError(error, operation, scopes) {
    switch (error.code) {
      case 11:
        this.onInvalidConfigurationError(error, operation);
        break;
      case 9:
        this.onConfigurationFileDirtyError(error, operation, scopes);
        break;
      case 10:
        return this.doWriteConfiguration(operation, { scopes, handleDirtyFile: "revert" });
      default:
        this.notificationService.error(error.message);
    }
  }
  onInvalidConfigurationError(error, operation) {
    const openStandAloneConfigurationActionLabel = operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY ? nls.localize("openTasksConfiguration", "Open Tasks Configuration") : operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY ? nls.localize("openLaunchConfiguration", "Open Launch Configuration") : operation.workspaceStandAloneConfigurationKey === MCP_CONFIGURATION_KEY ? nls.localize("openMcpConfiguration", "Open MCP Configuration") : null;
    if (openStandAloneConfigurationActionLabel) {
      this.notificationService.prompt(Severity.Error, error.message, [{
        label: openStandAloneConfigurationActionLabel,
        run: /* @__PURE__ */ __name(() => this.openFile(operation.resource), "run")
      }]);
    } else {
      this.notificationService.prompt(Severity.Error, error.message, [{
        label: nls.localize("open", "Open Settings"),
        run: /* @__PURE__ */ __name(() => this.openSettings(operation), "run")
      }]);
    }
  }
  onConfigurationFileDirtyError(error, operation, scopes) {
    const openStandAloneConfigurationActionLabel = operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY ? nls.localize("openTasksConfiguration", "Open Tasks Configuration") : operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY ? nls.localize("openLaunchConfiguration", "Open Launch Configuration") : null;
    if (openStandAloneConfigurationActionLabel) {
      this.notificationService.prompt(Severity.Error, error.message, [
        {
          label: nls.localize("saveAndRetry", "Save and Retry"),
          run: /* @__PURE__ */ __name(() => {
            const key = operation.key ? `${operation.workspaceStandAloneConfigurationKey}.${operation.key}` : operation.workspaceStandAloneConfigurationKey;
            this.writeConfiguration(operation.target, { key, value: operation.value }, { handleDirtyFile: "save", scopes });
          }, "run")
        },
        {
          label: openStandAloneConfigurationActionLabel,
          run: /* @__PURE__ */ __name(() => this.openFile(operation.resource), "run")
        }
      ]);
    } else {
      this.notificationService.prompt(Severity.Error, error.message, [
        {
          label: nls.localize("saveAndRetry", "Save and Retry"),
          run: /* @__PURE__ */ __name(() => this.writeConfiguration(operation.target, { key: operation.key, value: operation.value }, { handleDirtyFile: "save", scopes }), "run")
        },
        {
          label: nls.localize("open", "Open Settings"),
          run: /* @__PURE__ */ __name(() => this.openSettings(operation), "run")
        }
      ]);
    }
  }
  openSettings(operation) {
    const options = { jsonEditor: true };
    switch (operation.target) {
      case 1:
        this.preferencesService.openUserSettings(options);
        break;
      case 2:
        this.preferencesService.openRemoteSettings(options);
        break;
      case 3:
        this.preferencesService.openWorkspaceSettings(options);
        break;
      case 4:
        if (operation.resource) {
          const workspaceFolder = this.contextService.getWorkspaceFolder(operation.resource);
          if (workspaceFolder) {
            this.preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, jsonEditor: true });
          }
        }
        break;
    }
  }
  openFile(resource) {
    this.editorService.openEditor({ resource, options: { pinned: true } });
  }
  toConfigurationEditingError(code, target, operation) {
    const message = this.toErrorMessage(code, target, operation);
    return new ConfigurationEditingError(message, code);
  }
  toErrorMessage(error, target, operation) {
    switch (error) {
      // API constraints
      case 12:
        return nls.localize("errorPolicyConfiguration", "Unable to write {0} because it is configured in system policy.", operation.key);
      case 0:
        return nls.localize("errorUnknownKey", "Unable to write to {0} because {1} is not a registered configuration.", this.stringifyTarget(target), operation.key);
      case 1:
        return nls.localize("errorInvalidWorkspaceConfigurationApplication", "Unable to write {0} to Workspace Settings. This setting can be written only into User settings.", operation.key);
      case 2:
        return nls.localize("errorInvalidWorkspaceConfigurationMachine", "Unable to write {0} to Workspace Settings. This setting can be written only into User settings.", operation.key);
      case 3:
        return nls.localize("errorInvalidFolderConfiguration", "Unable to write to Folder Settings because {0} does not support the folder resource scope.", operation.key);
      case 4:
        return nls.localize("errorInvalidUserTarget", "Unable to write to User Settings because {0} does not support for global scope.", operation.key);
      case 5:
        return nls.localize("errorInvalidWorkspaceTarget", "Unable to write to Workspace Settings because {0} does not support for workspace scope in a multi folder workspace.", operation.key);
      case 6:
        return nls.localize("errorInvalidFolderTarget", "Unable to write to Folder Settings because no resource is provided.");
      case 7:
        return nls.localize("errorInvalidResourceLanguageConfiguration", "Unable to write to Language Settings because {0} is not a resource language setting.", operation.key);
      case 8:
        return nls.localize("errorNoWorkspaceOpened", "Unable to write to {0} because no workspace is opened. Please open a workspace first and try again.", this.stringifyTarget(target));
      // User issues
      case 11: {
        if (operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY) {
          return nls.localize("errorInvalidTaskConfiguration", "Unable to write into the tasks configuration file. Please open it to correct errors/warnings in it and try again.");
        }
        if (operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY) {
          return nls.localize("errorInvalidLaunchConfiguration", "Unable to write into the launch configuration file. Please open it to correct errors/warnings in it and try again.");
        }
        if (operation.workspaceStandAloneConfigurationKey === MCP_CONFIGURATION_KEY) {
          return nls.localize("errorInvalidMCPConfiguration", "Unable to write into the MCP configuration file. Please open it to correct errors/warnings in it and try again.");
        }
        switch (target) {
          case 1:
            return nls.localize("errorInvalidConfiguration", "Unable to write into user settings. Please open the user settings to correct errors/warnings in it and try again.");
          case 2:
            return nls.localize("errorInvalidRemoteConfiguration", "Unable to write into remote user settings. Please open the remote user settings to correct errors/warnings in it and try again.");
          case 3:
            return nls.localize("errorInvalidConfigurationWorkspace", "Unable to write into workspace settings. Please open the workspace settings to correct errors/warnings in the file and try again.");
          case 4: {
            let workspaceFolderName = "<<unknown>>";
            if (operation.resource) {
              const folder = this.contextService.getWorkspaceFolder(operation.resource);
              if (folder) {
                workspaceFolderName = folder.name;
              }
            }
            return nls.localize("errorInvalidConfigurationFolder", "Unable to write into folder settings. Please open the '{0}' folder settings to correct errors/warnings in it and try again.", workspaceFolderName);
          }
          default:
            return "";
        }
      }
      case 9: {
        if (operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY) {
          return nls.localize("errorTasksConfigurationFileDirty", "Unable to write into tasks configuration file because the file has unsaved changes. Please save it first and then try again.");
        }
        if (operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY) {
          return nls.localize("errorLaunchConfigurationFileDirty", "Unable to write into launch configuration file because the file has unsaved changes. Please save it first and then try again.");
        }
        if (operation.workspaceStandAloneConfigurationKey === MCP_CONFIGURATION_KEY) {
          return nls.localize("errorMCPConfigurationFileDirty", "Unable to write into MCP configuration file because the file has unsaved changes. Please save it first and then try again.");
        }
        switch (target) {
          case 1:
            return nls.localize("errorConfigurationFileDirty", "Unable to write into user settings because the file has unsaved changes. Please save the user settings file first and then try again.");
          case 2:
            return nls.localize("errorRemoteConfigurationFileDirty", "Unable to write into remote user settings because the file has unsaved changes. Please save the remote user settings file first and then try again.");
          case 3:
            return nls.localize("errorConfigurationFileDirtyWorkspace", "Unable to write into workspace settings because the file has unsaved changes. Please save the workspace settings file first and then try again.");
          case 4: {
            let workspaceFolderName = "<<unknown>>";
            if (operation.resource) {
              const folder = this.contextService.getWorkspaceFolder(operation.resource);
              if (folder) {
                workspaceFolderName = folder.name;
              }
            }
            return nls.localize("errorConfigurationFileDirtyFolder", "Unable to write into folder settings because the file has unsaved changes. Please save the '{0}' folder settings file first and then try again.", workspaceFolderName);
          }
          default:
            return "";
        }
      }
      case 10:
        if (operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY) {
          return nls.localize("errorTasksConfigurationFileModifiedSince", "Unable to write into tasks configuration file because the content of the file is newer.");
        }
        if (operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY) {
          return nls.localize("errorLaunchConfigurationFileModifiedSince", "Unable to write into launch configuration file because the content of the file is newer.");
        }
        if (operation.workspaceStandAloneConfigurationKey === MCP_CONFIGURATION_KEY) {
          return nls.localize("errorMCPConfigurationFileModifiedSince", "Unable to write into MCP configuration file because the content of the file is newer.");
        }
        switch (target) {
          case 1:
            return nls.localize("errorConfigurationFileModifiedSince", "Unable to write into user settings because the content of the file is newer.");
          case 2:
            return nls.localize("errorRemoteConfigurationFileModifiedSince", "Unable to write into remote user settings because the content of the file is newer.");
          case 3:
            return nls.localize("errorConfigurationFileModifiedSinceWorkspace", "Unable to write into workspace settings because the content of the file is newer.");
          case 4:
            return nls.localize("errorConfigurationFileModifiedSinceFolder", "Unable to write into folder settings because the content of the file is newer.");
        }
      case 13:
        return nls.localize("errorUnknown", "Unable to write to {0} because of an internal error.", this.stringifyTarget(target));
    }
  }
  stringifyTarget(target) {
    switch (target) {
      case 1:
        return nls.localize("userTarget", "User Settings");
      case 2:
        return nls.localize("remoteUserTarget", "Remote User Settings");
      case 3:
        return nls.localize("workspaceTarget", "Workspace Settings");
      case 4:
        return nls.localize("folderTarget", "Folder Settings");
      default:
        return "";
    }
  }
  defaultResourceValue(resource) {
    const basename = this.uriIdentityService.extUri.basename(resource);
    const configurationValue = basename.substr(0, basename.length - this.uriIdentityService.extUri.extname(resource).length);
    switch (configurationValue) {
      case TASKS_CONFIGURATION_KEY:
        return TASKS_DEFAULT;
      default:
        return "{}";
    }
  }
  async resolveModelReference(resource) {
    const exists = await this.fileService.exists(resource);
    if (!exists) {
      await this.textFileService.write(resource, this.defaultResourceValue(resource), { encoding: "utf8" });
    }
    return this.textModelResolverService.createModelReference(resource);
  }
  hasParseErrors(content, operation) {
    if (operation.workspaceStandAloneConfigurationKey && !operation.key) {
      return false;
    }
    const parseErrors = [];
    json.parse(content, parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
    return parseErrors.length > 0;
  }
  async validate(target, operation, checkDirty, overrides) {
    if (this.configurationService.inspect(operation.key).policyValue !== void 0) {
      throw this.toConfigurationEditingError(12, target, operation);
    }
    const configurationProperties = Registry.as(ConfigurationExtensions.Configuration).getConfigurationProperties();
    const configurationScope = configurationProperties[operation.key]?.scope;
    if (!operation.workspaceStandAloneConfigurationKey) {
      const validKeys = this.configurationService.keys().default;
      if (validKeys.indexOf(operation.key) < 0 && !OVERRIDE_PROPERTY_REGEX.test(operation.key) && operation.value !== void 0) {
        throw this.toConfigurationEditingError(0, target, operation);
      }
    }
    if (operation.workspaceStandAloneConfigurationKey) {
      if (operation.workspaceStandAloneConfigurationKey !== TASKS_CONFIGURATION_KEY && operation.workspaceStandAloneConfigurationKey !== MCP_CONFIGURATION_KEY && (target === 1 || target === 2)) {
        throw this.toConfigurationEditingError(4, target, operation);
      }
    }
    if ((target === 3 || target === 4) && this.contextService.getWorkbenchState() === 1) {
      throw this.toConfigurationEditingError(8, target, operation);
    }
    if (target === 3) {
      if (!operation.workspaceStandAloneConfigurationKey && !OVERRIDE_PROPERTY_REGEX.test(operation.key)) {
        if (configurationScope && APPLICATION_SCOPES.includes(configurationScope)) {
          throw this.toConfigurationEditingError(1, target, operation);
        }
        if (configurationScope === 2) {
          throw this.toConfigurationEditingError(2, target, operation);
        }
      }
    }
    if (target === 4) {
      if (!operation.resource) {
        throw this.toConfigurationEditingError(6, target, operation);
      }
      if (!operation.workspaceStandAloneConfigurationKey && !OVERRIDE_PROPERTY_REGEX.test(operation.key)) {
        if (configurationScope !== void 0 && !FOLDER_SCOPES.includes(configurationScope)) {
          throw this.toConfigurationEditingError(3, target, operation);
        }
      }
    }
    if (overrides.overrideIdentifiers?.length) {
      if (configurationScope !== 6) {
        throw this.toConfigurationEditingError(7, target, operation);
      }
    }
    if (!operation.resource) {
      throw this.toConfigurationEditingError(6, target, operation);
    }
    if (checkDirty && this.textFileService.isDirty(operation.resource)) {
      throw this.toConfigurationEditingError(9, target, operation);
    }
  }
  getConfigurationEditOperation(target, config, overrides) {
    if (config.key) {
      const standaloneConfigurationMap = target === 1 ? USER_STANDALONE_CONFIGURATIONS : WORKSPACE_STANDALONE_CONFIGURATIONS;
      const standaloneConfigurationKeys = Object.keys(standaloneConfigurationMap);
      for (const key2 of standaloneConfigurationKeys) {
        const resource2 = this.getConfigurationFileResource(target, key2, standaloneConfigurationMap[key2], overrides.resource, void 0);
        if (config.key === key2) {
          const jsonPath2 = this.isWorkspaceConfigurationResource(resource2) ? [key2] : [];
          return { key: jsonPath2[jsonPath2.length - 1], jsonPath: jsonPath2, value: config.value, resource: resource2 ?? void 0, workspaceStandAloneConfigurationKey: key2, target };
        }
        const keyPrefix = `${key2}.`;
        if (config.key.indexOf(keyPrefix) === 0) {
          const jsonPath2 = this.isWorkspaceConfigurationResource(resource2) ? [key2, config.key.substring(keyPrefix.length)] : [config.key.substring(keyPrefix.length)];
          return { key: jsonPath2[jsonPath2.length - 1], jsonPath: jsonPath2, value: config.value, resource: resource2 ?? void 0, workspaceStandAloneConfigurationKey: key2, target };
        }
      }
    }
    const key = config.key;
    const configurationProperties = Registry.as(ConfigurationExtensions.Configuration).getConfigurationProperties();
    const configurationScope = configurationProperties[key]?.scope;
    let jsonPath = overrides.overrideIdentifiers?.length ? [keyFromOverrideIdentifiers(overrides.overrideIdentifiers), key] : [key];
    if (target === 1 || target === 2) {
      return { key, jsonPath, value: config.value, resource: this.getConfigurationFileResource(target, key, "", null, configurationScope) ?? void 0, target };
    }
    const resource = this.getConfigurationFileResource(target, key, FOLDER_SETTINGS_PATH, overrides.resource, configurationScope);
    if (this.isWorkspaceConfigurationResource(resource)) {
      jsonPath = ["settings", ...jsonPath];
    }
    return { key, jsonPath, value: config.value, resource: resource ?? void 0, target };
  }
  isWorkspaceConfigurationResource(resource) {
    const workspace = this.contextService.getWorkspace();
    return !!(workspace.configuration && resource && workspace.configuration.fsPath === resource.fsPath);
  }
  getConfigurationFileResource(target, key, relativePath, resource, scope) {
    if (target === 1) {
      if (key === TASKS_CONFIGURATION_KEY) {
        return this.userDataProfileService.currentProfile.tasksResource;
      }
      if (key === MCP_CONFIGURATION_KEY) {
        return this.userDataProfileService.currentProfile.mcpResource;
      } else {
        if (!this.userDataProfileService.currentProfile.isDefault && this.configurationService.isSettingAppliedForAllProfiles(key)) {
          return this.userDataProfilesService.defaultProfile.settingsResource;
        }
        return this.userDataProfileService.currentProfile.settingsResource;
      }
    }
    if (target === 2) {
      return this.remoteSettingsResource;
    }
    const workbenchState = this.contextService.getWorkbenchState();
    if (workbenchState !== 1) {
      const workspace = this.contextService.getWorkspace();
      if (target === 3) {
        if (workbenchState === 3) {
          return workspace.configuration ?? null;
        }
        if (workbenchState === 2) {
          return workspace.folders[0].toResource(relativePath);
        }
      }
      if (target === 4) {
        if (resource) {
          const folder = this.contextService.getWorkspaceFolder(resource);
          if (folder) {
            return folder.toResource(relativePath);
          }
        }
      }
    }
    return null;
  }
};
ConfigurationEditing = __decorate([
  __param(1, IWorkbenchConfigurationService),
  __param(2, IWorkspaceContextService),
  __param(3, IUserDataProfileService),
  __param(4, IUserDataProfilesService),
  __param(5, IFileService),
  __param(6, ITextModelService),
  __param(7, ITextFileService),
  __param(8, INotificationService),
  __param(9, IPreferencesService),
  __param(10, IEditorService),
  __param(11, IUriIdentityService),
  __param(12, IFilesConfigurationService)
], ConfigurationEditing);
export {
  ConfigurationEditing,
  ConfigurationEditingError,
  ConfigurationEditingErrorCode,
  EditableConfigurationTarget
};
//# sourceMappingURL=configurationEditing.js.map
