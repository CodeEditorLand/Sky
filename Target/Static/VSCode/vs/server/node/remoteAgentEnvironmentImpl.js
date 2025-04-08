var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../base/common/event.js";
import * as platform from "../../base/common/platform.js";
import * as performance from "../../base/common/performance.js";
import { URI } from "../../base/common/uri.js";
import { createURITransformer } from "../../workbench/api/node/uriTransformer.js";
import { IRemoteAgentEnvironmentDTO, IGetEnvironmentDataArguments, IGetExtensionHostExitInfoArguments } from "../../workbench/services/remote/common/remoteAgentEnvironmentChannel.js";
import { IServerEnvironmentService } from "./serverEnvironmentService.js";
import { IServerChannel } from "../../base/parts/ipc/common/ipc.js";
import { transformOutgoingURIs } from "../../base/common/uriIpc.js";
import { listProcesses } from "../../base/node/ps.js";
import { getMachineInfo, collectWorkspaceStats } from "../../platform/diagnostics/node/diagnosticsService.js";
import { IDiagnosticInfoOptions, IDiagnosticInfo } from "../../platform/diagnostics/common/diagnostics.js";
import { basename } from "../../base/common/path.js";
import { ProcessItem } from "../../base/common/processes.js";
import { ServerConnectionToken, ServerConnectionTokenType } from "./serverConnectionToken.js";
import { IExtensionHostStatusService } from "./extensionHostStatusService.js";
import { IUserDataProfilesService } from "../../platform/userDataProfile/common/userDataProfile.js";
import { joinPath } from "../../base/common/resources.js";
class RemoteAgentEnvironmentChannel {
  constructor(_connectionToken, _environmentService, _userDataProfilesService, _extensionHostStatusService) {
    this._connectionToken = _connectionToken;
    this._environmentService = _environmentService;
    this._userDataProfilesService = _userDataProfilesService;
    this._extensionHostStatusService = _extensionHostStatusService;
  }
  static {
    __name(this, "RemoteAgentEnvironmentChannel");
  }
  static _namePool = 1;
  async call(_, command, arg) {
    switch (command) {
      case "getEnvironmentData": {
        const args = arg;
        const uriTransformer = createURITransformer(args.remoteAuthority);
        let environmentData = await this._getEnvironmentData(args.profile);
        environmentData = transformOutgoingURIs(environmentData, uriTransformer);
        return environmentData;
      }
      case "getExtensionHostExitInfo": {
        const args = arg;
        return this._extensionHostStatusService.getExitInfo(args.reconnectionToken);
      }
      case "getDiagnosticInfo": {
        const options = arg;
        const diagnosticInfo = {
          machineInfo: getMachineInfo()
        };
        const processesPromise = options.includeProcesses ? listProcesses(process.pid) : Promise.resolve();
        let workspaceMetadataPromises = [];
        const workspaceMetadata = {};
        if (options.folders) {
          const uriTransformer = createURITransformer("");
          const folderPaths = options.folders.map((folder) => URI.revive(uriTransformer.transformIncoming(folder))).filter((uri) => uri.scheme === "file");
          workspaceMetadataPromises = folderPaths.map((folder) => {
            return collectWorkspaceStats(folder.fsPath, ["node_modules", ".git"]).then((stats) => {
              workspaceMetadata[basename(folder.fsPath)] = stats;
            });
          });
        }
        return Promise.all([processesPromise, ...workspaceMetadataPromises]).then(([processes, _2]) => {
          diagnosticInfo.processes = processes || void 0;
          diagnosticInfo.workspaceMetadata = options.folders ? workspaceMetadata : void 0;
          return diagnosticInfo;
        });
      }
    }
    throw new Error(`IPC Command ${command} not found`);
  }
  listen(_, event, arg) {
    throw new Error("Not supported");
  }
  async _getEnvironmentData(profile) {
    if (profile && !this._userDataProfilesService.profiles.some((p) => p.id === profile)) {
      await this._userDataProfilesService.createProfile(profile, profile);
    }
    let isUnsupportedGlibc = false;
    if (process.platform === "linux") {
      const glibcVersion = process.glibcVersion;
      const minorVersion = glibcVersion ? parseInt(glibcVersion.split(".")[1]) : 28;
      isUnsupportedGlibc = minorVersion <= 27 || !!process.env["VSCODE_SERVER_CUSTOM_GLIBC_LINKER"];
    }
    return {
      pid: process.pid,
      connectionToken: this._connectionToken.type !== ServerConnectionTokenType.None ? this._connectionToken.value : "",
      appRoot: URI.file(this._environmentService.appRoot),
      settingsPath: this._environmentService.machineSettingsResource,
      logsPath: this._environmentService.logsHome,
      extensionHostLogsPath: joinPath(this._environmentService.logsHome, `exthost${RemoteAgentEnvironmentChannel._namePool++}`),
      globalStorageHome: this._userDataProfilesService.defaultProfile.globalStorageHome,
      workspaceStorageHome: this._environmentService.workspaceStorageHome,
      localHistoryHome: this._environmentService.localHistoryHome,
      userHome: this._environmentService.userHome,
      os: platform.OS,
      arch: process.arch,
      marks: performance.getMarks(),
      useHostProxy: !!this._environmentService.args["use-host-proxy"],
      profiles: {
        home: this._userDataProfilesService.profilesHome,
        all: [...this._userDataProfilesService.profiles].map((profile2) => ({ ...profile2 }))
      },
      isUnsupportedGlibc
    };
  }
}
export {
  RemoteAgentEnvironmentChannel
};
//# sourceMappingURL=remoteAgentEnvironmentImpl.js.map
