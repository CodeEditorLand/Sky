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
import { Barrier } from "../../../../base/common/async.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { RemoteAuthorityResolverErrorCode } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { ExtensionHostKind } from "./extensionHostKind.js";
import { ExtensionHostManager, friendlyExtHostName } from "./extensionHostManager.js";
import { IExtensionHostManager } from "./extensionHostManagers.js";
import { IExtensionDescriptionDelta } from "./extensionHostProtocol.js";
import { IResolveAuthorityResult } from "./extensionHostProxy.js";
import { ExtensionRunningLocation } from "./extensionRunningLocation.js";
import { ActivationKind, ExtensionActivationReason, ExtensionHostExtensions, ExtensionHostStartup, IExtensionHost, IInternalExtensionService } from "./extensions.js";
import { ResponsiveState } from "./rpcProtocol.js";
let LazyCreateExtensionHostManager = class extends Disposable {
  constructor(extensionHost, _internalExtensionService, _instantiationService, _logService) {
    super();
    this._internalExtensionService = _internalExtensionService;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._extensionHost = extensionHost;
    this.onDidExit = extensionHost.onExit;
    this._startCalled = new Barrier();
    this._actual = null;
    this._lazyStartExtensions = null;
  }
  static {
    __name(this, "LazyCreateExtensionHostManager");
  }
  onDidExit;
  _onDidChangeResponsiveState = this._register(new Emitter());
  onDidChangeResponsiveState = this._onDidChangeResponsiveState.event;
  _extensionHost;
  _startCalled;
  _actual;
  _lazyStartExtensions;
  get pid() {
    if (this._actual) {
      return this._actual.pid;
    }
    return null;
  }
  get kind() {
    return this._extensionHost.runningLocation.kind;
  }
  get startup() {
    return this._extensionHost.startup;
  }
  get friendyName() {
    return friendlyExtHostName(this.kind, this.pid);
  }
  _createActual(reason) {
    this._logService.info(`Creating lazy extension host (${this.friendyName}). Reason: ${reason}`);
    this._actual = this._register(this._instantiationService.createInstance(ExtensionHostManager, this._extensionHost, [], this._internalExtensionService));
    this._register(this._actual.onDidChangeResponsiveState((e) => this._onDidChangeResponsiveState.fire(e)));
    return this._actual;
  }
  async _getOrCreateActualAndStart(reason) {
    if (this._actual) {
      return this._actual;
    }
    const actual = this._createActual(reason);
    await actual.start(this._lazyStartExtensions.versionId, this._lazyStartExtensions.allExtensions, this._lazyStartExtensions.myExtensions);
    return actual;
  }
  async ready() {
    await this._startCalled.wait();
    if (this._actual) {
      await this._actual.ready();
    }
  }
  async disconnect() {
    await this._actual?.disconnect();
  }
  representsRunningLocation(runningLocation) {
    return this._extensionHost.runningLocation.equals(runningLocation);
  }
  async deltaExtensions(extensionsDelta) {
    await this._startCalled.wait();
    if (this._actual) {
      return this._actual.deltaExtensions(extensionsDelta);
    }
    this._lazyStartExtensions.delta(extensionsDelta);
    if (extensionsDelta.myToAdd.length > 0) {
      const actual = this._createActual(`contains ${extensionsDelta.myToAdd.length} new extension(s) (installed or enabled): ${extensionsDelta.myToAdd.map((extId) => extId.value)}`);
      await actual.start(this._lazyStartExtensions.versionId, this._lazyStartExtensions.allExtensions, this._lazyStartExtensions.myExtensions);
      return;
    }
  }
  containsExtension(extensionId) {
    return this._extensionHost.extensions?.containsExtension(extensionId) ?? false;
  }
  async activate(extension, reason) {
    await this._startCalled.wait();
    if (this._actual) {
      return this._actual.activate(extension, reason);
    }
    return false;
  }
  async activateByEvent(activationEvent, activationKind) {
    if (activationKind === ActivationKind.Immediate) {
      if (this._actual) {
        return this._actual.activateByEvent(activationEvent, activationKind);
      }
      return;
    }
    await this._startCalled.wait();
    if (this._actual) {
      return this._actual.activateByEvent(activationEvent, activationKind);
    }
  }
  activationEventIsDone(activationEvent) {
    if (!this._startCalled.isOpen()) {
      return false;
    }
    if (this._actual) {
      return this._actual.activationEventIsDone(activationEvent);
    }
    return true;
  }
  async getInspectPort(tryEnableInspector) {
    await this._startCalled.wait();
    return this._actual?.getInspectPort(tryEnableInspector);
  }
  async resolveAuthority(remoteAuthority, resolveAttempt) {
    await this._startCalled.wait();
    if (this._actual) {
      return this._actual.resolveAuthority(remoteAuthority, resolveAttempt);
    }
    return {
      type: "error",
      error: {
        message: `Cannot resolve authority`,
        code: RemoteAuthorityResolverErrorCode.Unknown,
        detail: void 0
      }
    };
  }
  async getCanonicalURI(remoteAuthority, uri) {
    await this._startCalled.wait();
    if (this._actual) {
      return this._actual.getCanonicalURI(remoteAuthority, uri);
    }
    throw new Error(`Cannot resolve canonical URI`);
  }
  async start(extensionRegistryVersionId, allExtensions, myExtensions) {
    if (myExtensions.length > 0) {
      const actual = this._createActual(`contains ${myExtensions.length} extension(s): ${myExtensions.map((extId) => extId.value)}.`);
      const result = actual.start(extensionRegistryVersionId, allExtensions, myExtensions);
      this._startCalled.open();
      return result;
    }
    this._lazyStartExtensions = new ExtensionHostExtensions(extensionRegistryVersionId, allExtensions, myExtensions);
    this._startCalled.open();
  }
  async extensionTestsExecute() {
    await this._startCalled.wait();
    const actual = await this._getOrCreateActualAndStart(`execute tests.`);
    return actual.extensionTestsExecute();
  }
  async setRemoteEnvironment(env) {
    await this._startCalled.wait();
    if (this._actual) {
      return this._actual.setRemoteEnvironment(env);
    }
  }
};
LazyCreateExtensionHostManager = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ILogService)
], LazyCreateExtensionHostManager);
export {
  LazyCreateExtensionHostManager
};
//# sourceMappingURL=lazyCreateExtensionHostManager.js.map
