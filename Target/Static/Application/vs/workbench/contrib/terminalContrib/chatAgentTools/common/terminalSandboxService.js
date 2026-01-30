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
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { FileAccess } from "../../../../../base/common/network.js";
import { dirname, join } from "../../../../../base/common/path.js";
import { isNative, OS } from "../../../../../base/common/platform.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IRemoteAgentService } from "../../../../services/remote/common/remoteAgentService.js";
const ITerminalSandboxService = createDecorator("terminalSandboxService");
let TerminalSandboxService = class TerminalSandboxService2 {
  static {
    __name(this, "TerminalSandboxService");
  }
  constructor(_configurationService, _fileService, _environmentService, _logService, _remoteAgentService) {
    this._configurationService = _configurationService;
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this._logService = _logService;
    this._remoteAgentService = _remoteAgentService;
    this._needsForceUpdateConfigFile = true;
    this._os = OS;
    const appRoot = dirname(FileAccess.asFileUri("").fsPath);
    this._srtPath = join(appRoot, "node_modules", ".bin", "srt");
    this._sandboxSettingsId = generateUuid();
    this._initTempDir();
    this._remoteAgentService.getEnvironment().then((remoteEnv) => this._os = remoteEnv?.os ?? OS);
  }
  isEnabled() {
    if (this._os === 1) {
      return false;
    }
    return this._configurationService.getValue(
      "chat.tools.terminal.sandbox.enabled"
      /* TerminalChatAgentToolsSettingId.TerminalSandboxEnabled */
    );
  }
  wrapCommand(command) {
    if (!this._sandboxConfigPath || !this._tempDir) {
      throw new Error("Sandbox config path or temp dir not initialized");
    }
    return `"${this._srtPath}" TMPDIR=${this._tempDir.fsPath} --settings "${this._sandboxConfigPath}" "${command}"`;
  }
  getTempDir() {
    return this._tempDir;
  }
  setNeedsForceUpdateConfigFile() {
    this._needsForceUpdateConfigFile = true;
  }
  async getSandboxConfigPath(forceRefresh = false) {
    if (!this._sandboxConfigPath || forceRefresh || this._needsForceUpdateConfigFile) {
      this._sandboxConfigPath = await this._createSandboxConfig();
      this._needsForceUpdateConfigFile = false;
    }
    return this._sandboxConfigPath;
  }
  async _createSandboxConfig() {
    if (this.isEnabled() && !this._tempDir) {
      this._initTempDir();
    }
    if (this._tempDir) {
      const networkSetting = this._configurationService.getValue(
        "chat.tools.terminal.sandbox.network"
        /* TerminalChatAgentToolsSettingId.TerminalSandboxNetwork */
      ) ?? {};
      const linuxFileSystemSetting = this._os === 3 ? this._configurationService.getValue(
        "chat.tools.terminal.sandbox.linuxFileSystem"
        /* TerminalChatAgentToolsSettingId.TerminalSandboxLinuxFileSystem */
      ) ?? {} : {};
      const macFileSystemSetting = this._os === 2 ? this._configurationService.getValue(
        "chat.tools.terminal.sandbox.macFileSystem"
        /* TerminalChatAgentToolsSettingId.TerminalSandboxMacFileSystem */
      ) ?? {} : {};
      const configFileUri = joinPath(this._tempDir, `vscode-sandbox-settings-${this._sandboxSettingsId}.json`);
      const sandboxSettings = {
        network: {
          allowedDomains: networkSetting.allowedDomains ?? [],
          deniedDomains: networkSetting.deniedDomains ?? []
        },
        filesystem: {
          denyRead: this._os === 2 ? macFileSystemSetting.denyRead : linuxFileSystemSetting.denyRead,
          allowWrite: this._os === 2 ? macFileSystemSetting.allowWrite : linuxFileSystemSetting.allowWrite,
          denyWrite: this._os === 2 ? macFileSystemSetting.denyWrite : linuxFileSystemSetting.denyWrite
        }
      };
      this._sandboxConfigPath = configFileUri.fsPath;
      await this._fileService.createFile(configFileUri, VSBuffer.fromString(JSON.stringify(sandboxSettings, null, "	")), { overwrite: true });
      return this._sandboxConfigPath;
    }
    return void 0;
  }
  _initTempDir() {
    if (this.isEnabled() && isNative) {
      this._needsForceUpdateConfigFile = true;
      const environmentService = this._environmentService;
      this._tempDir = environmentService.tmpDir;
      if (!this._tempDir) {
        this._logService.warn("TerminalSandboxService: Cannot create sandbox settings file because no tmpDir is available in this environment");
        return;
      }
    }
  }
};
TerminalSandboxService = __decorate([
  __param(0, IConfigurationService),
  __param(1, IFileService),
  __param(2, IEnvironmentService),
  __param(3, ILogService),
  __param(4, IRemoteAgentService)
], TerminalSandboxService);
export {
  ITerminalSandboxService,
  TerminalSandboxService
};
//# sourceMappingURL=terminalSandboxService.js.map
