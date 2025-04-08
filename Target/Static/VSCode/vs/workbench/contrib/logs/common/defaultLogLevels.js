var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { ILogService, ILoggerService, LogLevel, LogLevelToString, getLogLevel, parseLogLevel } from "../../../../platform/log/common/log.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { FileOperationResult, IFileService, toFileOperationResult } from "../../../../platform/files/common/files.js";
import { IJSONEditingService } from "../../../services/configuration/common/jsonEditing.js";
import { isString, isUndefined } from "../../../../base/common/types.js";
import { EXTENSION_IDENTIFIER_WITH_LOG_REGEX } from "../../../../platform/environment/common/environmentService.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { parse } from "../../../../base/common/json.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Emitter, Event } from "../../../../base/common/event.js";
const IDefaultLogLevelsService = createDecorator("IDefaultLogLevelsService");
let DefaultLogLevelsService = class extends Disposable {
  constructor(environmentService, fileService, jsonEditingService, logService, loggerService) {
    super();
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.jsonEditingService = jsonEditingService;
    this.logService = logService;
    this.loggerService = loggerService;
  }
  static {
    __name(this, "DefaultLogLevelsService");
  }
  _serviceBrand;
  _onDidChangeDefaultLogLevels = this._register(new Emitter());
  onDidChangeDefaultLogLevels = this._onDidChangeDefaultLogLevels.event;
  async getDefaultLogLevels() {
    const argvLogLevel = await this._parseLogLevelsFromArgv();
    return {
      default: argvLogLevel?.default ?? this._getDefaultLogLevelFromEnv(),
      extensions: argvLogLevel?.extensions ?? this._getExtensionsDefaultLogLevelsFromEnv()
    };
  }
  async getDefaultLogLevel(extensionId) {
    const argvLogLevel = await this._parseLogLevelsFromArgv() ?? {};
    if (extensionId) {
      extensionId = extensionId.toLowerCase();
      return this._getDefaultLogLevel(argvLogLevel, extensionId);
    } else {
      return this._getDefaultLogLevel(argvLogLevel);
    }
  }
  async setDefaultLogLevel(defaultLogLevel, extensionId) {
    const argvLogLevel = await this._parseLogLevelsFromArgv() ?? {};
    if (extensionId) {
      extensionId = extensionId.toLowerCase();
      const currentDefaultLogLevel = this._getDefaultLogLevel(argvLogLevel, extensionId);
      argvLogLevel.extensions = argvLogLevel.extensions ?? [];
      const extension = argvLogLevel.extensions.find(([extension2]) => extension2 === extensionId);
      if (extension) {
        extension[1] = defaultLogLevel;
      } else {
        argvLogLevel.extensions.push([extensionId, defaultLogLevel]);
      }
      await this._writeLogLevelsToArgv(argvLogLevel);
      const extensionLoggers = [...this.loggerService.getRegisteredLoggers()].filter((logger) => logger.extensionId && logger.extensionId.toLowerCase() === extensionId);
      for (const { resource } of extensionLoggers) {
        if (this.loggerService.getLogLevel(resource) === currentDefaultLogLevel) {
          this.loggerService.setLogLevel(resource, defaultLogLevel);
        }
      }
    } else {
      const currentLogLevel = this._getDefaultLogLevel(argvLogLevel);
      argvLogLevel.default = defaultLogLevel;
      await this._writeLogLevelsToArgv(argvLogLevel);
      if (this.loggerService.getLogLevel() === currentLogLevel) {
        this.loggerService.setLogLevel(defaultLogLevel);
      }
    }
    this._onDidChangeDefaultLogLevels.fire();
  }
  _getDefaultLogLevel(argvLogLevels, extension) {
    if (extension) {
      const extensionLogLevel = argvLogLevels.extensions?.find(([extensionId]) => extensionId === extension);
      if (extensionLogLevel) {
        return extensionLogLevel[1];
      }
    }
    return argvLogLevels.default ?? getLogLevel(this.environmentService);
  }
  async _writeLogLevelsToArgv(logLevels) {
    const logLevelsValue = [];
    if (!isUndefined(logLevels.default)) {
      logLevelsValue.push(LogLevelToString(logLevels.default));
    }
    for (const [extension, logLevel] of logLevels.extensions ?? []) {
      logLevelsValue.push(`${extension}=${LogLevelToString(logLevel)}`);
    }
    await this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ["log-level"], value: logLevelsValue.length ? logLevelsValue : void 0 }], true);
  }
  async _parseLogLevelsFromArgv() {
    const result = { extensions: [] };
    const logLevels = await this._readLogLevelsFromArgv();
    for (const extensionLogLevel of logLevels) {
      const matches = EXTENSION_IDENTIFIER_WITH_LOG_REGEX.exec(extensionLogLevel);
      if (matches && matches[1] && matches[2]) {
        const logLevel = parseLogLevel(matches[2]);
        if (!isUndefined(logLevel)) {
          result.extensions?.push([matches[1].toLowerCase(), logLevel]);
        }
      } else {
        const logLevel = parseLogLevel(extensionLogLevel);
        if (!isUndefined(logLevel)) {
          result.default = logLevel;
        }
      }
    }
    return !isUndefined(result.default) || result.extensions?.length ? result : void 0;
  }
  async _readLogLevelsFromArgv() {
    try {
      const content = await this.fileService.readFile(this.environmentService.argvResource);
      const argv = parse(content.value.toString());
      return isString(argv["log-level"]) ? [argv["log-level"]] : Array.isArray(argv["log-level"]) ? argv["log-level"] : [];
    } catch (error) {
      if (toFileOperationResult(error) !== FileOperationResult.FILE_NOT_FOUND) {
        this.logService.error(error);
      }
    }
    return [];
  }
  _getDefaultLogLevelFromEnv() {
    return getLogLevel(this.environmentService);
  }
  _getExtensionsDefaultLogLevelsFromEnv() {
    const result = [];
    for (const [extension, logLevelValue] of this.environmentService.extensionLogLevel ?? []) {
      const logLevel = parseLogLevel(logLevelValue);
      if (!isUndefined(logLevel)) {
        result.push([extension, logLevel]);
      }
    }
    return result;
  }
};
DefaultLogLevelsService = __decorateClass([
  __decorateParam(0, IWorkbenchEnvironmentService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IJSONEditingService),
  __decorateParam(3, ILogService),
  __decorateParam(4, ILoggerService)
], DefaultLogLevelsService);
registerSingleton(IDefaultLogLevelsService, DefaultLogLevelsService, InstantiationType.Delayed);
export {
  IDefaultLogLevelsService
};
//# sourceMappingURL=defaultLogLevels.js.map
