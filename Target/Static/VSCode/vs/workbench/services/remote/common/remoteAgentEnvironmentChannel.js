var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as platform from "../../../../base/common/platform.js";
import * as performance from "../../../../base/common/performance.js";
import { URI, UriComponents, UriDto } from "../../../../base/common/uri.js";
import { IChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { IRemoteAgentEnvironment } from "../../../../platform/remote/common/remoteAgentEnvironment.js";
import { IDiagnosticInfoOptions, IDiagnosticInfo } from "../../../../platform/diagnostics/common/diagnostics.js";
import { ITelemetryData, TelemetryLevel } from "../../../../platform/telemetry/common/telemetry.js";
import { IExtensionHostExitInfo } from "./remoteAgentService.js";
import { revive } from "../../../../base/common/marshalling.js";
import { IUserDataProfile } from "../../../../platform/userDataProfile/common/userDataProfile.js";
class RemoteExtensionEnvironmentChannelClient {
  static {
    __name(this, "RemoteExtensionEnvironmentChannelClient");
  }
  static async getEnvironmentData(channel, remoteAuthority, profile) {
    const args = {
      remoteAuthority,
      profile
    };
    const data = await channel.call("getEnvironmentData", args);
    return {
      pid: data.pid,
      connectionToken: data.connectionToken,
      appRoot: URI.revive(data.appRoot),
      settingsPath: URI.revive(data.settingsPath),
      logsPath: URI.revive(data.logsPath),
      extensionHostLogsPath: URI.revive(data.extensionHostLogsPath),
      globalStorageHome: URI.revive(data.globalStorageHome),
      workspaceStorageHome: URI.revive(data.workspaceStorageHome),
      localHistoryHome: URI.revive(data.localHistoryHome),
      userHome: URI.revive(data.userHome),
      os: data.os,
      arch: data.arch,
      marks: data.marks,
      useHostProxy: data.useHostProxy,
      profiles: revive(data.profiles),
      isUnsupportedGlibc: data.isUnsupportedGlibc
    };
  }
  static async getExtensionHostExitInfo(channel, remoteAuthority, reconnectionToken) {
    const args = {
      remoteAuthority,
      reconnectionToken
    };
    return channel.call("getExtensionHostExitInfo", args);
  }
  static getDiagnosticInfo(channel, options) {
    return channel.call("getDiagnosticInfo", options);
  }
  static updateTelemetryLevel(channel, telemetryLevel) {
    return channel.call("updateTelemetryLevel", { telemetryLevel });
  }
  static logTelemetry(channel, eventName, data) {
    return channel.call("logTelemetry", { eventName, data });
  }
  static flushTelemetry(channel) {
    return channel.call("flushTelemetry");
  }
  static async ping(channel) {
    await channel.call("ping");
  }
}
export {
  RemoteExtensionEnvironmentChannelClient
};
//# sourceMappingURL=remoteAgentEnvironmentChannel.js.map
