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
import { IWorkbenchConfigurationService } from "../../../../services/configuration/common/configuration.js";
import { IRemoteAuthorityResolverService } from "../../../../../platform/remote/common/remoteAuthorityResolver.js";
import { IWorkbenchEnvironmentService } from "../../../../services/environment/common/environmentService.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { serializeEnvironmentDescriptionMap, serializeEnvironmentVariableCollection } from "../../../../../platform/terminal/common/environmentVariableShared.js";
import { IConfigurationResolverService } from "../../../../services/configurationResolver/common/configurationResolver.js";
import { SideBySideEditor, EditorResourceAccessor } from "../../../../common/editor.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { Schemas } from "../../../../../base/common/network.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IEnvironmentVariableService } from "../environmentVariable.js";
import { ITerminalLogService } from "../../../../../platform/terminal/common/terminal.js";
import { ConfigurationResolverExpression } from "../../../../services/configurationResolver/common/configurationResolverExpression.js";
const REMOTE_TERMINAL_CHANNEL_NAME = "remoteterminal";
let RemoteTerminalChannelClient = class RemoteTerminalChannelClient2 {
  static {
    __name(this, "RemoteTerminalChannelClient");
  }
  get onPtyHostExit() {
    return this._channel.listen(
      "$onPtyHostExitEvent"
      /* RemoteTerminalChannelEvent.OnPtyHostExitEvent */
    );
  }
  get onPtyHostStart() {
    return this._channel.listen(
      "$onPtyHostStartEvent"
      /* RemoteTerminalChannelEvent.OnPtyHostStartEvent */
    );
  }
  get onPtyHostUnresponsive() {
    return this._channel.listen(
      "$onPtyHostUnresponsiveEvent"
      /* RemoteTerminalChannelEvent.OnPtyHostUnresponsiveEvent */
    );
  }
  get onPtyHostResponsive() {
    return this._channel.listen(
      "$onPtyHostResponsiveEvent"
      /* RemoteTerminalChannelEvent.OnPtyHostResponsiveEvent */
    );
  }
  get onPtyHostRequestResolveVariables() {
    return this._channel.listen(
      "$onPtyHostRequestResolveVariablesEvent"
      /* RemoteTerminalChannelEvent.OnPtyHostRequestResolveVariablesEvent */
    );
  }
  get onProcessData() {
    return this._channel.listen(
      "$onProcessDataEvent"
      /* RemoteTerminalChannelEvent.OnProcessDataEvent */
    );
  }
  get onProcessExit() {
    return this._channel.listen(
      "$onProcessExitEvent"
      /* RemoteTerminalChannelEvent.OnProcessExitEvent */
    );
  }
  get onProcessReady() {
    return this._channel.listen(
      "$onProcessReadyEvent"
      /* RemoteTerminalChannelEvent.OnProcessReadyEvent */
    );
  }
  get onProcessReplay() {
    return this._channel.listen(
      "$onProcessReplayEvent"
      /* RemoteTerminalChannelEvent.OnProcessReplayEvent */
    );
  }
  get onProcessOrphanQuestion() {
    return this._channel.listen(
      "$onProcessOrphanQuestion"
      /* RemoteTerminalChannelEvent.OnProcessOrphanQuestion */
    );
  }
  get onExecuteCommand() {
    return this._channel.listen(
      "$onExecuteCommand"
      /* RemoteTerminalChannelEvent.OnExecuteCommand */
    );
  }
  get onDidRequestDetach() {
    return this._channel.listen(
      "$onDidRequestDetach"
      /* RemoteTerminalChannelEvent.OnDidRequestDetach */
    );
  }
  get onDidChangeProperty() {
    return this._channel.listen(
      "$onDidChangeProperty"
      /* RemoteTerminalChannelEvent.OnDidChangeProperty */
    );
  }
  constructor(_remoteAuthority, _channel, _configurationService, _workspaceContextService, _resolverService, _environmentVariableService, _remoteAuthorityResolverService, _logService, _editorService, _labelService, _environmentService) {
    this._remoteAuthority = _remoteAuthority;
    this._channel = _channel;
    this._configurationService = _configurationService;
    this._workspaceContextService = _workspaceContextService;
    this._resolverService = _resolverService;
    this._environmentVariableService = _environmentVariableService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this._logService = _logService;
    this._editorService = _editorService;
    this._labelService = _labelService;
    this._environmentService = _environmentService;
  }
  restartPtyHost() {
    return this._channel.call("$restartPtyHost", []);
  }
  async createProcess(shellLaunchConfig, configuration, activeWorkspaceRootUri, options, shouldPersistTerminal, cols, rows, unicodeVersion) {
    await this._configurationService.whenRemoteConfigurationLoaded();
    const resolvedVariables = /* @__PURE__ */ Object.create(null);
    const lastActiveWorkspace = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
    const expr = ConfigurationResolverExpression.parse({ shellLaunchConfig, configuration });
    try {
      await this._resolverService.resolveAsync(lastActiveWorkspace, expr);
    } catch (err) {
      this._logService.error(err);
    }
    for (const [{ inner }, resolved] of expr.resolved()) {
      if (/^config:/.test(inner) || inner === "selectedText" || inner === "lineNumber") {
        resolvedVariables[inner] = resolved.value;
      }
    }
    const envVariableCollections = [];
    for (const [k, v] of this._environmentVariableService.collections.entries()) {
      envVariableCollections.push([k, serializeEnvironmentVariableCollection(v.map), serializeEnvironmentDescriptionMap(v.descriptionMap)]);
    }
    const resolverResult = await this._remoteAuthorityResolverService.resolveAuthority(this._remoteAuthority);
    const resolverEnv = {
      /**
       * If the extension host was spawned via a launch configuration,
       * include the environment provided by that launch configuration.
       */
      ...this._environmentService.debugExtensionHost.env ?? {},
      ...resolverResult.options?.extensionHostEnv
    };
    const workspace = this._workspaceContextService.getWorkspace();
    const workspaceFolders = workspace.folders;
    const activeWorkspaceFolder = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) : null;
    const activeFileResource = EditorResourceAccessor.getOriginalUri(this._editorService.activeEditor, {
      supportSideBySide: SideBySideEditor.PRIMARY,
      filterByScheme: [Schemas.file, Schemas.vscodeUserData, Schemas.vscodeRemote]
    });
    const args = {
      configuration,
      resolvedVariables,
      envVariableCollections,
      shellLaunchConfig,
      workspaceId: workspace.id,
      workspaceName: this._labelService.getWorkspaceLabel(workspace),
      workspaceFolders,
      activeWorkspaceFolder,
      activeFileResource,
      shouldPersistTerminal,
      options,
      cols,
      rows,
      unicodeVersion,
      resolverEnv
    };
    return await this._channel.call("$createProcess", args);
  }
  requestDetachInstance(workspaceId, instanceId) {
    return this._channel.call("$requestDetachInstance", [workspaceId, instanceId]);
  }
  acceptDetachInstanceReply(requestId, persistentProcessId) {
    return this._channel.call("$acceptDetachInstanceReply", [requestId, persistentProcessId]);
  }
  attachToProcess(id) {
    return this._channel.call("$attachToProcess", [id]);
  }
  detachFromProcess(id, forcePersist) {
    return this._channel.call("$detachFromProcess", [id, forcePersist]);
  }
  listProcesses() {
    return this._channel.call(
      "$listProcesses"
      /* RemoteTerminalChannelRequest.ListProcesses */
    );
  }
  getLatency() {
    return this._channel.call(
      "$getLatency"
      /* RemoteTerminalChannelRequest.GetLatency */
    );
  }
  getPerformanceMarks() {
    return this._channel.call(
      "$getPerformanceMarks"
      /* RemoteTerminalChannelRequest.GetPerformanceMarks */
    );
  }
  reduceConnectionGraceTime() {
    return this._channel.call(
      "$reduceConnectionGraceTime"
      /* RemoteTerminalChannelRequest.ReduceConnectionGraceTime */
    );
  }
  processBinary(id, data) {
    return this._channel.call("$processBinary", [id, data]);
  }
  start(id) {
    return this._channel.call("$start", [id]);
  }
  input(id, data) {
    return this._channel.call("$input", [id, data]);
  }
  sendSignal(id, signal) {
    return this._channel.call("$sendSignal", [id, signal]);
  }
  acknowledgeDataEvent(id, charCount) {
    return this._channel.call("$acknowledgeDataEvent", [id, charCount]);
  }
  setUnicodeVersion(id, version) {
    return this._channel.call("$setUnicodeVersion", [id, version]);
  }
  setNextCommandId(id, commandLine, commandId) {
    return this._channel.call("$setNextCommandId", [id, commandLine, commandId]);
  }
  shutdown(id, immediate) {
    return this._channel.call("$shutdown", [id, immediate]);
  }
  resize(id, cols, rows, pixelWidth, pixelHeight) {
    return this._channel.call("$resize", [id, cols, rows, pixelWidth, pixelHeight]);
  }
  clearBuffer(id) {
    return this._channel.call("$clearBuffer", [id]);
  }
  getInitialCwd(id) {
    return this._channel.call("$getInitialCwd", [id]);
  }
  getCwd(id) {
    return this._channel.call("$getCwd", [id]);
  }
  orphanQuestionReply(id) {
    return this._channel.call("$orphanQuestionReply", [id]);
  }
  sendCommandResult(reqId, isError, payload) {
    return this._channel.call("$sendCommandResult", [reqId, isError, payload]);
  }
  freePortKillProcess(port) {
    return this._channel.call("$freePortKillProcess", [port]);
  }
  getDefaultSystemShell(osOverride) {
    return this._channel.call("$getDefaultSystemShell", [osOverride]);
  }
  getProfiles(profiles, defaultProfile, includeDetectedProfiles) {
    return this._channel.call("$getProfiles", [this._workspaceContextService.getWorkspace().id, profiles, defaultProfile, includeDetectedProfiles]);
  }
  acceptPtyHostResolvedVariables(requestId, resolved) {
    return this._channel.call("$acceptPtyHostResolvedVariables", [requestId, resolved]);
  }
  getEnvironment() {
    return this._channel.call(
      "$getEnvironment"
      /* RemoteTerminalChannelRequest.GetEnvironment */
    );
  }
  getWslPath(original, direction) {
    return this._channel.call("$getWslPath", [original, direction]);
  }
  setTerminalLayoutInfo(layout) {
    const workspace = this._workspaceContextService.getWorkspace();
    const args = {
      workspaceId: workspace.id,
      tabs: layout ? layout.tabs : [],
      background: layout ? layout.background : null
    };
    return this._channel.call("$setTerminalLayoutInfo", args);
  }
  updateTitle(id, title, titleSource) {
    return this._channel.call("$updateTitle", [id, title, titleSource]);
  }
  updateIcon(id, userInitiated, icon, color) {
    return this._channel.call("$updateIcon", [id, userInitiated, icon, color]);
  }
  refreshProperty(id, property) {
    return this._channel.call("$refreshProperty", [id, property]);
  }
  updateProperty(id, property, value) {
    return this._channel.call("$updateProperty", [id, property, value]);
  }
  getTerminalLayoutInfo() {
    const workspace = this._workspaceContextService.getWorkspace();
    const args = {
      workspaceId: workspace.id
    };
    return this._channel.call("$getTerminalLayoutInfo", args);
  }
  reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate) {
    return this._channel.call("$reviveTerminalProcesses", [workspaceId, state, dateTimeFormatLocate]);
  }
  getRevivedPtyNewId(id) {
    return this._channel.call("$getRevivedPtyNewId", [id]);
  }
  serializeTerminalState(ids) {
    return this._channel.call("$serializeTerminalState", [ids]);
  }
  // #region Pty service contribution RPC calls
  installAutoReply(match, reply) {
    return this._channel.call("$installAutoReply", [match, reply]);
  }
  uninstallAllAutoReplies() {
    return this._channel.call("$uninstallAllAutoReplies", []);
  }
};
RemoteTerminalChannelClient = __decorate([
  __param(2, IWorkbenchConfigurationService),
  __param(3, IWorkspaceContextService),
  __param(4, IConfigurationResolverService),
  __param(5, IEnvironmentVariableService),
  __param(6, IRemoteAuthorityResolverService),
  __param(7, ITerminalLogService),
  __param(8, IEditorService),
  __param(9, ILabelService),
  __param(10, IWorkbenchEnvironmentService)
], RemoteTerminalChannelClient);
export {
  REMOTE_TERMINAL_CHANNEL_NAME,
  RemoteTerminalChannelClient
};
//# sourceMappingURL=remoteTerminalChannel.js.map
