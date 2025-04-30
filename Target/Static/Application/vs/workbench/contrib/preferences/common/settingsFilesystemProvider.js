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
var SettingsFileSystemProvider_1;
import { NotSupportedError } from "../../../../base/common/errors.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { FilePermission, FileSystemProviderErrorCode, FileType } from "../../../../platform/files/common/files.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { Event, Emitter } from "../../../../base/common/event.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import * as JSONContributionRegistry from "../../../../platform/jsonschemas/common/jsonContributionRegistry.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { ILogService, LogLevel } from "../../../../platform/log/common/log.js";
import { isEqual } from "../../../../base/common/resources.js";
const schemaRegistry = Registry.as(JSONContributionRegistry.Extensions.JSONContribution);
let SettingsFileSystemProvider = class SettingsFileSystemProvider2 extends Disposable {
  static {
    __name(this, "SettingsFileSystemProvider");
  }
  static {
    SettingsFileSystemProvider_1 = this;
  }
  static {
    this.SCHEMA = Schemas.vscode;
  }
  static {
    this.SCHEMA_ASSOCIATIONS = URI.parse(`${Schemas.vscode}://schemas-associations/schemas-associations.json`);
  }
  constructor(preferencesService, logService) {
    super();
    this.preferencesService = preferencesService;
    this.logService = logService;
    this._onDidChangeFile = this._register(new Emitter());
    this.onDidChangeFile = this._onDidChangeFile.event;
    this.capabilities = 2048 + 2;
    this.onDidChangeCapabilities = Event.None;
    this._register(schemaRegistry.onDidChangeSchema((schemaUri) => {
      this._onDidChangeFile.fire([{
        resource: URI.parse(schemaUri),
        type: 0
        /* FileChangeType.UPDATED */
      }]);
    }));
    this._register(schemaRegistry.onDidChangeSchemaAssociations(() => {
      this._onDidChangeFile.fire([{
        resource: SettingsFileSystemProvider_1.SCHEMA_ASSOCIATIONS,
        type: 0
        /* FileChangeType.UPDATED */
      }]);
    }));
    this._register(preferencesService.onDidDefaultSettingsContentChanged((uri) => {
      this._onDidChangeFile.fire([{
        resource: uri,
        type: 0
        /* FileChangeType.UPDATED */
      }]);
    }));
  }
  async readFile(uri) {
    if (uri.scheme !== SettingsFileSystemProvider_1.SCHEMA) {
      throw new NotSupportedError();
    }
    let content;
    if (uri.authority === "schemas") {
      content = this.getSchemaContent(uri);
    } else if (uri.authority === SettingsFileSystemProvider_1.SCHEMA_ASSOCIATIONS.authority) {
      content = JSON.stringify(schemaRegistry.getSchemaAssociations());
    } else if (uri.authority === "defaultsettings") {
      content = this.preferencesService.getDefaultSettingsContent(uri);
    }
    if (content) {
      return VSBuffer.fromString(content).buffer;
    }
    throw FileSystemProviderErrorCode.FileNotFound;
  }
  async stat(uri) {
    if (schemaRegistry.hasSchemaContent(uri.toString()) || this.preferencesService.hasDefaultSettingsContent(uri)) {
      const currentTime = Date.now();
      return {
        type: FileType.File,
        permissions: FilePermission.Readonly,
        mtime: currentTime,
        ctime: currentTime,
        size: 0
      };
    }
    if (isEqual(uri, SettingsFileSystemProvider_1.SCHEMA_ASSOCIATIONS)) {
      const currentTime = Date.now();
      return {
        type: FileType.File,
        permissions: FilePermission.Readonly,
        mtime: currentTime,
        ctime: currentTime,
        size: 0
      };
    }
    throw FileSystemProviderErrorCode.FileNotFound;
  }
  watch(resource, opts) {
    return Disposable.None;
  }
  async mkdir(resource) {
  }
  async readdir(resource) {
    return [];
  }
  async rename(from, to, opts) {
  }
  async delete(resource, opts) {
  }
  async writeFile() {
    throw new NotSupportedError();
  }
  getSchemaContent(uri) {
    const startTime = Date.now();
    const content = schemaRegistry.getSchemaContent(uri.toString()) ?? "{}";
    const logLevel = this.logService.getLevel();
    if (logLevel === LogLevel.Debug || logLevel === LogLevel.Trace) {
      const endTime = Date.now();
      const uncompressed = JSON.stringify(schemaRegistry.getSchemaContributions().schemas[uri.toString()]);
      this.logService.debug(`${uri.toString()}: ${uncompressed.length} -> ${content.length} (${Math.round((uncompressed.length - content.length) / uncompressed.length * 100)}%) Took ${endTime - startTime}ms`);
    }
    return content;
  }
};
SettingsFileSystemProvider = SettingsFileSystemProvider_1 = __decorate([
  __param(0, IPreferencesService),
  __param(1, ILogService)
], SettingsFileSystemProvider);
export {
  SettingsFileSystemProvider
};
//# sourceMappingURL=settingsFilesystemProvider.js.map
