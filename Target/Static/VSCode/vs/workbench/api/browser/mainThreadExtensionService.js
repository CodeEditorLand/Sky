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
import { Action } from "../../../base/common/actions.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { SerializedError, transformErrorFromSerialization } from "../../../base/common/errors.js";
import { FileAccess } from "../../../base/common/network.js";
import Severity from "../../../base/common/severity.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { ICommandService } from "../../../platform/commands/common/commands.js";
import { ILocalExtension } from "../../../platform/extensionManagement/common/extensionManagement.js";
import { areSameExtensions } from "../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { INotificationService } from "../../../platform/notification/common/notification.js";
import { IRemoteConnectionData, ManagedRemoteConnection, RemoteConnection, RemoteConnectionType, ResolvedAuthority, WebSocketRemoteConnection } from "../../../platform/remote/common/remoteAuthorityResolver.js";
import { ExtHostContext, ExtHostExtensionServiceShape, MainContext, MainThreadExtensionServiceShape } from "../common/extHost.protocol.js";
import { IExtension, IExtensionsWorkbenchService } from "../../contrib/extensions/common/extensions.js";
import { IWorkbenchEnvironmentService } from "../../services/environment/common/environmentService.js";
import { EnablementState, IWorkbenchExtensionEnablementService } from "../../services/extensionManagement/common/extensionManagement.js";
import { ExtensionHostKind } from "../../services/extensions/common/extensionHostKind.js";
import { IExtensionDescriptionDelta } from "../../services/extensions/common/extensionHostProtocol.js";
import { IExtensionHostProxy, IResolveAuthorityResult } from "../../services/extensions/common/extensionHostProxy.js";
import { ActivationKind, ExtensionActivationReason, IExtensionService, IInternalExtensionService, MissingExtensionDependency } from "../../services/extensions/common/extensions.js";
import { extHostNamedCustomer, IExtHostContext, IInternalExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { Dto } from "../../services/extensions/common/proxyIdentifier.js";
import { IHostService } from "../../services/host/browser/host.js";
import { ITimerService } from "../../services/timer/browser/timerService.js";
let MainThreadExtensionService = class {
  constructor(extHostContext, _extensionService, _notificationService, _extensionsWorkbenchService, _hostService, _extensionEnablementService, _timerService, _commandService, _environmentService) {
    this._extensionService = _extensionService;
    this._notificationService = _notificationService;
    this._extensionsWorkbenchService = _extensionsWorkbenchService;
    this._hostService = _hostService;
    this._extensionEnablementService = _extensionEnablementService;
    this._timerService = _timerService;
    this._commandService = _commandService;
    this._environmentService = _environmentService;
    this._extensionHostKind = extHostContext.extensionHostKind;
    const internalExtHostContext = extHostContext;
    this._internalExtensionService = internalExtHostContext.internalExtensionService;
    internalExtHostContext._setExtensionHostProxy(
      new ExtensionHostProxy(extHostContext.getProxy(ExtHostContext.ExtHostExtensionService))
    );
    internalExtHostContext._setAllMainProxyIdentifiers(Object.keys(MainContext).map((key) => MainContext[key]));
  }
  _extensionHostKind;
  _internalExtensionService;
  dispose() {
  }
  $getExtension(extensionId) {
    return this._extensionService.getExtension(extensionId);
  }
  $activateExtension(extensionId, reason) {
    return this._internalExtensionService._activateById(extensionId, reason);
  }
  async $onWillActivateExtension(extensionId) {
    this._internalExtensionService._onWillActivateExtension(extensionId);
  }
  $onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
    this._internalExtensionService._onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason);
  }
  $onExtensionRuntimeError(extensionId, data) {
    const error = transformErrorFromSerialization(data);
    this._internalExtensionService._onExtensionRuntimeError(extensionId, error);
    console.error(`[${extensionId.value}]${error.message}`);
    console.error(error.stack);
  }
  async $onExtensionActivationError(extensionId, data, missingExtensionDependency) {
    const error = transformErrorFromSerialization(data);
    this._internalExtensionService._onDidActivateExtensionError(extensionId, error);
    if (missingExtensionDependency) {
      const extension = await this._extensionService.getExtension(extensionId.value);
      if (extension) {
        const local = await this._extensionsWorkbenchService.queryLocal();
        const installedDependency = local.find((i) => areSameExtensions(i.identifier, { id: missingExtensionDependency.dependency }));
        if (installedDependency?.local) {
          await this._handleMissingInstalledDependency(extension, installedDependency.local);
          return;
        } else {
          await this._handleMissingNotInstalledDependency(extension, missingExtensionDependency.dependency);
          return;
        }
      }
    }
    const isDev = !this._environmentService.isBuilt || this._environmentService.isExtensionDevelopment;
    if (isDev) {
      this._notificationService.error(error);
      return;
    }
    console.error(error.message);
  }
  async _handleMissingInstalledDependency(extension, missingInstalledDependency) {
    const extName = extension.displayName || extension.name;
    if (this._extensionEnablementService.isEnabled(missingInstalledDependency)) {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("reload window", "Cannot activate the '{0}' extension because it depends on the '{1}' extension, which is not loaded. Would you like to reload the window to load the extension?", extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
        actions: {
          primary: [new Action("reload", localize("reload", "Reload Window"), "", true, () => this._hostService.reload())]
        }
      });
    } else {
      const enablementState = this._extensionEnablementService.getEnablementState(missingInstalledDependency);
      if (enablementState === EnablementState.DisabledByVirtualWorkspace) {
        this._notificationService.notify({
          severity: Severity.Error,
          message: localize("notSupportedInWorkspace", "Cannot activate the '{0}' extension because it depends on the '{1}' extension which is not supported in the current workspace", extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name)
        });
      } else if (enablementState === EnablementState.DisabledByTrustRequirement) {
        this._notificationService.notify({
          severity: Severity.Error,
          message: localize("restrictedMode", "Cannot activate the '{0}' extension because it depends on the '{1}' extension which is not supported in Restricted Mode", extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
          actions: {
            primary: [new Action(
              "manageWorkspaceTrust",
              localize("manageWorkspaceTrust", "Manage Workspace Trust"),
              "",
              true,
              () => this._commandService.executeCommand("workbench.trust.manage")
            )]
          }
        });
      } else if (this._extensionEnablementService.canChangeEnablement(missingInstalledDependency)) {
        this._notificationService.notify({
          severity: Severity.Error,
          message: localize("disabledDep", "Cannot activate the '{0}' extension because it depends on the '{1}' extension which is disabled. Would you like to enable the extension and reload the window?", extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
          actions: {
            primary: [new Action(
              "enable",
              localize("enable dep", "Enable and Reload"),
              "",
              true,
              () => this._extensionEnablementService.setEnablement([missingInstalledDependency], enablementState === EnablementState.DisabledGlobally ? EnablementState.EnabledGlobally : EnablementState.EnabledWorkspace).then(() => this._hostService.reload(), (e) => this._notificationService.error(e))
            )]
          }
        });
      } else {
        this._notificationService.notify({
          severity: Severity.Error,
          message: localize("disabledDepNoAction", "Cannot activate the '{0}' extension because it depends on the '{1}' extension which is disabled.", extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name)
        });
      }
    }
  }
  async _handleMissingNotInstalledDependency(extension, missingDependency) {
    const extName = extension.displayName || extension.name;
    let dependencyExtension = null;
    try {
      dependencyExtension = (await this._extensionsWorkbenchService.getExtensions([{ id: missingDependency }], CancellationToken.None))[0];
    } catch (err) {
    }
    if (dependencyExtension) {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("uninstalledDep", "Cannot activate the '{0}' extension because it depends on the '{1}' extension from '{2}', which is not installed. Would you like to install the extension and reload the window?", extName, dependencyExtension.displayName, dependencyExtension.publisherDisplayName),
        actions: {
          primary: [new Action(
            "install",
            localize("install missing dep", "Install and Reload"),
            "",
            true,
            () => this._extensionsWorkbenchService.install(dependencyExtension).then(() => this._hostService.reload(), (e) => this._notificationService.error(e))
          )]
        }
      });
    } else {
      this._notificationService.error(localize("unknownDep", "Cannot activate the '{0}' extension because it depends on an unknown '{1}' extension.", extName, missingDependency));
    }
  }
  async $setPerformanceMarks(marks) {
    if (this._extensionHostKind === ExtensionHostKind.LocalProcess) {
      this._timerService.setPerformanceMarks("localExtHost", marks);
    } else if (this._extensionHostKind === ExtensionHostKind.LocalWebWorker) {
      this._timerService.setPerformanceMarks("workerExtHost", marks);
    } else {
      this._timerService.setPerformanceMarks("remoteExtHost", marks);
    }
  }
  async $asBrowserUri(uri) {
    return FileAccess.uriToBrowserUri(URI.revive(uri));
  }
};
__name(MainThreadExtensionService, "MainThreadExtensionService");
MainThreadExtensionService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadExtensionService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IExtensionsWorkbenchService),
  __decorateParam(4, IHostService),
  __decorateParam(5, IWorkbenchExtensionEnablementService),
  __decorateParam(6, ITimerService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IWorkbenchEnvironmentService)
], MainThreadExtensionService);
class ExtensionHostProxy {
  constructor(_actual) {
    this._actual = _actual;
  }
  static {
    __name(this, "ExtensionHostProxy");
  }
  async resolveAuthority(remoteAuthority, resolveAttempt) {
    const resolved = reviveResolveAuthorityResult(await this._actual.$resolveAuthority(remoteAuthority, resolveAttempt));
    return resolved;
  }
  async getCanonicalURI(remoteAuthority, uri) {
    const uriComponents = await this._actual.$getCanonicalURI(remoteAuthority, uri);
    return uriComponents ? URI.revive(uriComponents) : uriComponents;
  }
  startExtensionHost(extensionsDelta) {
    return this._actual.$startExtensionHost(extensionsDelta);
  }
  extensionTestsExecute() {
    return this._actual.$extensionTestsExecute();
  }
  activateByEvent(activationEvent, activationKind) {
    return this._actual.$activateByEvent(activationEvent, activationKind);
  }
  activate(extensionId, reason) {
    return this._actual.$activate(extensionId, reason);
  }
  setRemoteEnvironment(env) {
    return this._actual.$setRemoteEnvironment(env);
  }
  updateRemoteConnectionData(connectionData) {
    return this._actual.$updateRemoteConnectionData(connectionData);
  }
  deltaExtensions(extensionsDelta) {
    return this._actual.$deltaExtensions(extensionsDelta);
  }
  test_latency(n) {
    return this._actual.$test_latency(n);
  }
  test_up(b) {
    return this._actual.$test_up(b);
  }
  test_down(size) {
    return this._actual.$test_down(size);
  }
}
function reviveResolveAuthorityResult(result) {
  if (result.type === "ok") {
    return {
      type: "ok",
      value: {
        ...result.value,
        authority: reviveResolvedAuthority(result.value.authority)
      }
    };
  } else {
    return result;
  }
}
__name(reviveResolveAuthorityResult, "reviveResolveAuthorityResult");
function reviveResolvedAuthority(resolvedAuthority) {
  return {
    ...resolvedAuthority,
    connectTo: reviveConnection(resolvedAuthority.connectTo)
  };
}
__name(reviveResolvedAuthority, "reviveResolvedAuthority");
function reviveConnection(connection) {
  if (connection.type === RemoteConnectionType.WebSocket) {
    return new WebSocketRemoteConnection(connection.host, connection.port);
  }
  return new ManagedRemoteConnection(connection.id);
}
__name(reviveConnection, "reviveConnection");
export {
  MainThreadExtensionService
};
//# sourceMappingURL=mainThreadExtensionService.js.map
