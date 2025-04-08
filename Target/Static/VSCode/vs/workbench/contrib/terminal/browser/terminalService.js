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
import * as domStylesheets from "../../../../base/browser/domStylesheets.js";
import * as cssValue from "../../../../base/browser/cssValue.js";
import { DeferredPromise, timeout } from "../../../../base/common/async.js";
import { debounce, memoize } from "../../../../base/common/decorators.js";
import { DynamicListEventMultiplexer, Emitter, Event, IDynamicListEventMultiplexer } from "../../../../base/common/event.js";
import { Disposable, DisposableStore, dispose, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { isMacintosh, isWeb } from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { IKeyMods } from "../../../../platform/quickinput/common/quickInput.js";
import * as nls from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { ICreateContributedTerminalProfileOptions, IExtensionTerminalProfile, IPtyHostAttachTarget, IRawTerminalInstanceLayoutInfo, IRawTerminalTabLayoutInfo, IShellLaunchConfig, ITerminalBackend, ITerminalLaunchError, ITerminalLogService, ITerminalsLayoutInfo, ITerminalsLayoutInfoById, TerminalExitReason, TerminalLocation, TerminalLocationString, TitleEventSource } from "../../../../platform/terminal/common/terminal.js";
import { formatMessageForTerminal } from "../../../../platform/terminal/common/terminalStrings.js";
import { iconForeground } from "../../../../platform/theme/common/colorRegistry.js";
import { getIconRegistry } from "../../../../platform/theme/common/iconRegistry.js";
import { ColorScheme } from "../../../../platform/theme/common/theme.js";
import { IThemeService, Themable } from "../../../../platform/theme/common/themeService.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { VirtualWorkspaceContext } from "../../../common/contextkeys.js";
import { IEditableData } from "../../../common/views.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { ICreateTerminalOptions, IDetachedTerminalInstance, IDetachedXTermOptions, IRequestAddInstanceToGroupEvent, ITerminalConfigurationService, ITerminalEditorService, ITerminalGroup, ITerminalGroupService, ITerminalInstance, ITerminalInstanceHost, ITerminalInstanceService, ITerminalLocationOptions, ITerminalService, ITerminalServiceNativeDelegate, TerminalConnectionState, TerminalEditorLocation } from "./terminal.js";
import { getCwdForSplit } from "./terminalActions.js";
import { TerminalEditorInput } from "./terminalEditorInput.js";
import { getColorStyleContent, getUriClasses } from "./terminalIcon.js";
import { TerminalProfileQuickpick } from "./terminalProfileQuickpick.js";
import { getInstanceFromResource, getTerminalUri, parseTerminalUri } from "./terminalUri.js";
import { TerminalViewPane } from "./terminalView.js";
import { IRemoteTerminalAttachTarget, IStartExtensionTerminalRequest, ITerminalProcessExtHostProxy, ITerminalProfileService, TERMINAL_VIEW_ID } from "../common/terminal.js";
import { TerminalContextKeys } from "../common/terminalContextKey.js";
import { columnToEditorGroup } from "../../../services/editor/common/editorGroupColumn.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { ACTIVE_GROUP_TYPE, AUX_WINDOW_GROUP, AUX_WINDOW_GROUP_TYPE, IEditorService, SIDE_GROUP, SIDE_GROUP_TYPE } from "../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { ILifecycleService, ShutdownReason, StartupKind, WillShutdownEvent } from "../../../services/lifecycle/common/lifecycle.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { XtermTerminal } from "./xterm/xtermTerminal.js";
import { TerminalInstance } from "./terminalInstance.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { TerminalCapabilityStore } from "../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { ITimerService } from "../../../services/timer/browser/timerService.js";
import { mark } from "../../../../base/common/performance.js";
import { DetachedTerminal } from "./detachedTerminal.js";
import { ITerminalCapabilityImplMap, TerminalCapability } from "../../../../platform/terminal/common/capabilities/capabilities.js";
import { createInstanceCapabilityEventMultiplexer } from "./terminalEvents.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { GroupIdentifier } from "../../../common/editor.js";
let TerminalService = class extends Disposable {
  constructor(_contextKeyService, _lifecycleService, _logService, _dialogService, _instantiationService, _remoteAgentService, _viewsService, _configurationService, _terminalConfigService, _environmentService, _terminalConfigurationService, _terminalEditorService, _terminalGroupService, _terminalInstanceService, _editorGroupsService, _terminalProfileService, _extensionService, _notificationService, _workspaceContextService, _commandService, _keybindingService, _timerService) {
    super();
    this._contextKeyService = _contextKeyService;
    this._lifecycleService = _lifecycleService;
    this._logService = _logService;
    this._dialogService = _dialogService;
    this._instantiationService = _instantiationService;
    this._remoteAgentService = _remoteAgentService;
    this._viewsService = _viewsService;
    this._configurationService = _configurationService;
    this._terminalConfigService = _terminalConfigService;
    this._environmentService = _environmentService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._terminalEditorService = _terminalEditorService;
    this._terminalGroupService = _terminalGroupService;
    this._terminalInstanceService = _terminalInstanceService;
    this._editorGroupsService = _editorGroupsService;
    this._terminalProfileService = _terminalProfileService;
    this._extensionService = _extensionService;
    this._notificationService = _notificationService;
    this._workspaceContextService = _workspaceContextService;
    this._commandService = _commandService;
    this._keybindingService = _keybindingService;
    this._timerService = _timerService;
    this._register(this.onDidCreateInstance(() => this._terminalProfileService.refreshAvailableProfiles()));
    this._forwardInstanceHostEvents(this._terminalGroupService);
    this._forwardInstanceHostEvents(this._terminalEditorService);
    this._register(this._terminalGroupService.onDidChangeActiveGroup(this._onDidChangeActiveGroup.fire, this._onDidChangeActiveGroup));
    this._register(this._terminalInstanceService.onDidCreateInstance((instance) => {
      this._initInstanceListeners(instance);
      this._onDidCreateInstance.fire(instance);
    }));
    this._register(this._terminalGroupService.onDidChangeActiveInstance((instance) => {
      if (!instance && !this._isShuttingDown && this._terminalConfigService.config.hideOnLastClosed) {
        this._terminalGroupService.hidePanel();
      }
      if (instance?.shellType) {
        this._terminalShellTypeContextKey.set(instance.shellType.toString());
      } else if (!instance || !instance.shellType) {
        this._terminalShellTypeContextKey.reset();
      }
    }));
    this._handleInstanceContextKeys();
    this._terminalShellTypeContextKey = TerminalContextKeys.shellType.bindTo(this._contextKeyService);
    this._processSupportContextKey = TerminalContextKeys.processSupported.bindTo(this._contextKeyService);
    this._processSupportContextKey.set(!isWeb || this._remoteAgentService.getConnection() !== null);
    this._terminalHasBeenCreated = TerminalContextKeys.terminalHasBeenCreated.bindTo(this._contextKeyService);
    this._terminalCountContextKey = TerminalContextKeys.count.bindTo(this._contextKeyService);
    this._terminalEditorActive = TerminalContextKeys.terminalEditorActive.bindTo(this._contextKeyService);
    this._register(this.onDidChangeActiveInstance((instance) => {
      this._terminalEditorActive.set(!!instance?.target && instance.target === TerminalLocation.Editor);
    }));
    this._register(_lifecycleService.onBeforeShutdown(async (e) => e.veto(this._onBeforeShutdown(e.reason), "veto.terminal")));
    this._register(_lifecycleService.onWillShutdown((e) => this._onWillShutdown(e)));
    this._initializePrimaryBackend();
    timeout(0).then(() => this._register(this._instantiationService.createInstance(TerminalEditorStyle, mainWindow.document.head)));
  }
  static {
    __name(this, "TerminalService");
  }
  _hostActiveTerminals = /* @__PURE__ */ new Map();
  _detachedXterms = /* @__PURE__ */ new Set();
  _terminalEditorActive;
  _terminalShellTypeContextKey;
  _isShuttingDown = false;
  _backgroundedTerminalInstances = [];
  _backgroundedTerminalDisposables = /* @__PURE__ */ new Map();
  _processSupportContextKey;
  _primaryBackend;
  _terminalHasBeenCreated;
  _terminalCountContextKey;
  _nativeDelegate;
  _shutdownWindowCount;
  _editable;
  get isProcessSupportRegistered() {
    return !!this._processSupportContextKey.get();
  }
  _connectionState = TerminalConnectionState.Connecting;
  get connectionState() {
    return this._connectionState;
  }
  _whenConnected = new DeferredPromise();
  get whenConnected() {
    return this._whenConnected.p;
  }
  _restoredGroupCount = 0;
  get restoredGroupCount() {
    return this._restoredGroupCount;
  }
  get instances() {
    return this._terminalGroupService.instances.concat(this._terminalEditorService.instances).concat(this._backgroundedTerminalInstances);
  }
  /** Gets all non-background terminals. */
  get foregroundInstances() {
    return this._terminalGroupService.instances.concat(this._terminalEditorService.instances);
  }
  get detachedInstances() {
    return this._detachedXterms;
  }
  _reconnectedTerminalGroups;
  _reconnectedTerminals = /* @__PURE__ */ new Map();
  getReconnectedTerminals(reconnectionOwner) {
    return this._reconnectedTerminals.get(reconnectionOwner);
  }
  get defaultLocation() {
    return this._terminalConfigurationService.config.defaultLocation === TerminalLocationString.Editor ? TerminalLocation.Editor : TerminalLocation.Panel;
  }
  _activeInstance;
  get activeInstance() {
    for (const activeHostTerminal of this._hostActiveTerminals.values()) {
      if (activeHostTerminal?.hasFocus) {
        return activeHostTerminal;
      }
    }
    return this._activeInstance;
  }
  _editingTerminal;
  _onDidCreateInstance = this._register(new Emitter());
  get onDidCreateInstance() {
    return this._onDidCreateInstance.event;
  }
  _onDidChangeInstanceDimensions = this._register(new Emitter());
  get onDidChangeInstanceDimensions() {
    return this._onDidChangeInstanceDimensions.event;
  }
  _onDidRegisterProcessSupport = this._register(new Emitter());
  get onDidRegisterProcessSupport() {
    return this._onDidRegisterProcessSupport.event;
  }
  _onDidChangeConnectionState = this._register(new Emitter());
  get onDidChangeConnectionState() {
    return this._onDidChangeConnectionState.event;
  }
  _onDidRequestStartExtensionTerminal = this._register(new Emitter());
  get onDidRequestStartExtensionTerminal() {
    return this._onDidRequestStartExtensionTerminal.event;
  }
  // ITerminalInstanceHost events
  _onDidDisposeInstance = this._register(new Emitter());
  get onDidDisposeInstance() {
    return this._onDidDisposeInstance.event;
  }
  _onDidFocusInstance = this._register(new Emitter());
  get onDidFocusInstance() {
    return this._onDidFocusInstance.event;
  }
  _onDidChangeActiveInstance = this._register(new Emitter());
  get onDidChangeActiveInstance() {
    return this._onDidChangeActiveInstance.event;
  }
  _onDidChangeInstances = this._register(new Emitter());
  get onDidChangeInstances() {
    return this._onDidChangeInstances.event;
  }
  _onDidChangeInstanceCapability = this._register(new Emitter());
  get onDidChangeInstanceCapability() {
    return this._onDidChangeInstanceCapability.event;
  }
  // Terminal view events
  _onDidChangeActiveGroup = this._register(new Emitter());
  get onDidChangeActiveGroup() {
    return this._onDidChangeActiveGroup.event;
  }
  get onAnyInstanceData() {
    return this._register(this.createOnInstanceEvent((instance) => Event.map(instance.onData, (data) => ({ instance, data })))).event;
  }
  get onAnyInstanceDataInput() {
    return this._register(this.createOnInstanceEvent((e) => Event.map(e.onDidInputData, () => e, e.store))).event;
  }
  get onAnyInstanceIconChange() {
    return this._register(this.createOnInstanceEvent((e) => e.onIconChanged)).event;
  }
  get onAnyInstanceMaximumDimensionsChange() {
    return this._register(this.createOnInstanceEvent((e) => Event.map(e.onMaximumDimensionsChanged, () => e, e.store))).event;
  }
  get onAnyInstancePrimaryStatusChange() {
    return this._register(this.createOnInstanceEvent((e) => Event.map(e.statusList.onDidChangePrimaryStatus, () => e, e.store))).event;
  }
  get onAnyInstanceProcessIdReady() {
    return this._register(this.createOnInstanceEvent((e) => e.onProcessIdReady)).event;
  }
  get onAnyInstanceSelectionChange() {
    return this._register(this.createOnInstanceEvent((e) => e.onDidChangeSelection)).event;
  }
  get onAnyInstanceTitleChange() {
    return this._register(this.createOnInstanceEvent((e) => e.onTitleChanged)).event;
  }
  get onAnyInstanceShellTypeChanged() {
    return this._register(this.createOnInstanceEvent((e) => Event.map(e.onDidChangeShellType, () => e))).event;
  }
  get onAnyInstanceAddedCapabilityType() {
    return this._register(this.createOnInstanceEvent((e) => e.capabilities.onDidAddCapabilityType)).event;
  }
  async showProfileQuickPick(type, cwd) {
    const quickPick = this._instantiationService.createInstance(TerminalProfileQuickpick);
    const result = await quickPick.showAndGetResult(type);
    if (!result) {
      return;
    }
    if (typeof result === "string") {
      return;
    }
    const keyMods = result.keyMods;
    if (type === "createInstance") {
      const activeInstance = this.getDefaultInstanceHost().activeInstance;
      let instance;
      if (result.config && "id" in result?.config) {
        await this.createContributedTerminalProfile(result.config.extensionIdentifier, result.config.id, {
          icon: result.config.options?.icon,
          color: result.config.options?.color,
          location: !!(keyMods?.alt && activeInstance) ? { splitActiveTerminal: true } : this.defaultLocation
        });
        return;
      } else if (result.config && "profileName" in result.config) {
        if (keyMods?.alt && activeInstance) {
          instance = await this.createTerminal({ location: { parentTerminal: activeInstance }, config: result.config, cwd });
        } else {
          instance = await this.createTerminal({ location: this.defaultLocation, config: result.config, cwd });
        }
      }
      if (instance && this.defaultLocation !== TerminalLocation.Editor) {
        this._terminalGroupService.showPanel(true);
        this.setActiveInstance(instance);
        return instance;
      }
    }
    return void 0;
  }
  async _initializePrimaryBackend() {
    mark("code/terminal/willGetTerminalBackend");
    this._primaryBackend = await this._terminalInstanceService.getBackend(this._environmentService.remoteAuthority);
    mark("code/terminal/didGetTerminalBackend");
    const enableTerminalReconnection = this._terminalConfigurationService.config.enablePersistentSessions;
    this._connectionState = TerminalConnectionState.Connecting;
    const isPersistentRemote = !!this._environmentService.remoteAuthority && enableTerminalReconnection;
    if (this._primaryBackend) {
      this._register(this._primaryBackend.onDidRequestDetach(async (e) => {
        const instanceToDetach = this.getInstanceFromResource(getTerminalUri(e.workspaceId, e.instanceId));
        if (instanceToDetach) {
          const persistentProcessId = instanceToDetach?.persistentProcessId;
          if (persistentProcessId && !instanceToDetach.shellLaunchConfig.isFeatureTerminal && !instanceToDetach.shellLaunchConfig.customPtyImplementation) {
            if (instanceToDetach.target === TerminalLocation.Editor) {
              this._terminalEditorService.detachInstance(instanceToDetach);
            } else {
              this._terminalGroupService.getGroupForInstance(instanceToDetach)?.removeInstance(instanceToDetach);
            }
            await instanceToDetach.detachProcessAndDispose(TerminalExitReason.User);
            await this._primaryBackend?.acceptDetachInstanceReply(e.requestId, persistentProcessId);
          } else {
            await this._primaryBackend?.acceptDetachInstanceReply(e.requestId, void 0);
          }
        }
      }));
    }
    mark("code/terminal/willReconnect");
    let reconnectedPromise;
    if (isPersistentRemote) {
      reconnectedPromise = this._reconnectToRemoteTerminals();
    } else if (enableTerminalReconnection) {
      reconnectedPromise = this._reconnectToLocalTerminals();
    } else {
      reconnectedPromise = Promise.resolve();
    }
    reconnectedPromise.then(async () => {
      this._setConnected();
      mark("code/terminal/didReconnect");
      mark("code/terminal/willReplay");
      const instances = await this._reconnectedTerminalGroups?.then((groups) => groups.map((e) => e.terminalInstances).flat()) ?? [];
      await Promise.all(instances.map((e) => new Promise((r) => Event.once(e.onProcessReplayComplete)(r))));
      mark("code/terminal/didReplay");
      mark("code/terminal/willGetPerformanceMarks");
      await Promise.all(Array.from(this._terminalInstanceService.getRegisteredBackends()).map(async (backend) => {
        this._timerService.setPerformanceMarks(backend.remoteAuthority === void 0 ? "localPtyHost" : "remotePtyHost", await backend.getPerformanceMarks());
        backend.setReady();
      }));
      mark("code/terminal/didGetPerformanceMarks");
      this._whenConnected.complete();
    });
  }
  getPrimaryBackend() {
    return this._primaryBackend;
  }
  _forwardInstanceHostEvents(host) {
    this._register(host.onDidChangeInstances(this._onDidChangeInstances.fire, this._onDidChangeInstances));
    this._register(host.onDidDisposeInstance(this._onDidDisposeInstance.fire, this._onDidDisposeInstance));
    this._register(host.onDidChangeActiveInstance((instance) => this._evaluateActiveInstance(host, instance)));
    this._register(host.onDidFocusInstance((instance) => {
      this._onDidFocusInstance.fire(instance);
      this._evaluateActiveInstance(host, instance);
    }));
    this._register(host.onDidChangeInstanceCapability((instance) => {
      this._onDidChangeInstanceCapability.fire(instance);
    }));
    this._hostActiveTerminals.set(host, void 0);
  }
  _evaluateActiveInstance(host, instance) {
    this._hostActiveTerminals.set(host, instance);
    if (instance === void 0) {
      for (const active of this._hostActiveTerminals.values()) {
        if (active) {
          instance = active;
        }
      }
    }
    this._activeInstance = instance;
    this._onDidChangeActiveInstance.fire(instance);
  }
  setActiveInstance(value) {
    if (value.shellLaunchConfig.hideFromUser) {
      this._showBackgroundTerminal(value);
    }
    if (value.target === TerminalLocation.Editor) {
      this._terminalEditorService.setActiveInstance(value);
    } else {
      this._terminalGroupService.setActiveInstance(value);
    }
  }
  async focusInstance(instance) {
    if (instance.target === TerminalLocation.Editor) {
      return this._terminalEditorService.focusInstance(instance);
    }
    return this._terminalGroupService.focusInstance(instance);
  }
  async focusActiveInstance() {
    if (!this._activeInstance) {
      return;
    }
    return this.focusInstance(this._activeInstance);
  }
  async createContributedTerminalProfile(extensionIdentifier, id, options) {
    await this._extensionService.activateByEvent(`onTerminalProfile:${id}`);
    const profileProvider = this._terminalProfileService.getContributedProfileProvider(extensionIdentifier, id);
    if (!profileProvider) {
      this._notificationService.error(`No terminal profile provider registered for id "${id}"`);
      return;
    }
    try {
      await profileProvider.createContributedTerminalProfile(options);
      this._terminalGroupService.setActiveInstanceByIndex(this._terminalGroupService.instances.length - 1);
      await this._terminalGroupService.activeInstance?.focusWhenReady();
    } catch (e) {
      this._notificationService.error(e.message);
    }
  }
  async safeDisposeTerminal(instance) {
    if (instance.target !== TerminalLocation.Editor && instance.hasChildProcesses && (this._terminalConfigurationService.config.confirmOnKill === "panel" || this._terminalConfigurationService.config.confirmOnKill === "always")) {
      const veto = await this._showTerminalCloseConfirmation(true);
      if (veto) {
        return;
      }
    }
    return new Promise((r) => {
      Event.once(instance.onExit)(() => r());
      instance.dispose(TerminalExitReason.User);
    });
  }
  _setConnected() {
    this._connectionState = TerminalConnectionState.Connected;
    this._onDidChangeConnectionState.fire();
    this._logService.trace("Pty host ready");
  }
  async _reconnectToRemoteTerminals() {
    const remoteAuthority = this._environmentService.remoteAuthority;
    if (!remoteAuthority) {
      return;
    }
    const backend = await this._terminalInstanceService.getBackend(remoteAuthority);
    if (!backend) {
      return;
    }
    mark("code/terminal/willGetTerminalLayoutInfo");
    const layoutInfo = await backend.getTerminalLayoutInfo();
    mark("code/terminal/didGetTerminalLayoutInfo");
    backend.reduceConnectionGraceTime();
    mark("code/terminal/willRecreateTerminalGroups");
    await this._recreateTerminalGroups(layoutInfo);
    mark("code/terminal/didRecreateTerminalGroups");
    this._attachProcessLayoutListeners();
    this._logService.trace("Reconnected to remote terminals");
  }
  async _reconnectToLocalTerminals() {
    const localBackend = await this._terminalInstanceService.getBackend();
    if (!localBackend) {
      return;
    }
    mark("code/terminal/willGetTerminalLayoutInfo");
    const layoutInfo = await localBackend.getTerminalLayoutInfo();
    mark("code/terminal/didGetTerminalLayoutInfo");
    if (layoutInfo && layoutInfo.tabs.length > 0) {
      mark("code/terminal/willRecreateTerminalGroups");
      this._reconnectedTerminalGroups = this._recreateTerminalGroups(layoutInfo);
      mark("code/terminal/didRecreateTerminalGroups");
    }
    this._attachProcessLayoutListeners();
    this._logService.trace("Reconnected to local terminals");
  }
  _recreateTerminalGroups(layoutInfo) {
    const groupPromises = [];
    let activeGroup;
    if (layoutInfo) {
      for (const tabLayout of layoutInfo.tabs) {
        const terminalLayouts = tabLayout.terminals.filter((t) => t.terminal && t.terminal.isOrphan);
        if (terminalLayouts.length) {
          this._restoredGroupCount += terminalLayouts.length;
          const promise = this._recreateTerminalGroup(tabLayout, terminalLayouts);
          groupPromises.push(promise);
          if (tabLayout.isActive) {
            activeGroup = promise;
          }
          const activeInstance = this.instances.find((t) => t.shellLaunchConfig.attachPersistentProcess?.id === tabLayout.activePersistentProcessId);
          if (activeInstance) {
            this.setActiveInstance(activeInstance);
          }
        }
      }
      if (layoutInfo.tabs.length) {
        activeGroup?.then((group) => this._terminalGroupService.activeGroup = group);
      }
    }
    return Promise.all(groupPromises).then((result) => result.filter((e) => !!e));
  }
  async _recreateTerminalGroup(tabLayout, terminalLayouts) {
    let lastInstance;
    for (const terminalLayout of terminalLayouts) {
      const attachPersistentProcess = terminalLayout.terminal;
      if (this._lifecycleService.startupKind !== StartupKind.ReloadedWindow && attachPersistentProcess.type === "Task") {
        continue;
      }
      mark(`code/terminal/willRecreateTerminal/${attachPersistentProcess.id}-${attachPersistentProcess.pid}`);
      lastInstance = this.createTerminal({
        config: { attachPersistentProcess },
        location: lastInstance ? { parentTerminal: lastInstance } : TerminalLocation.Panel
      });
      lastInstance.then(() => mark(`code/terminal/didRecreateTerminal/${attachPersistentProcess.id}-${attachPersistentProcess.pid}`));
    }
    const group = lastInstance?.then((instance) => {
      const g = this._terminalGroupService.getGroupForInstance(instance);
      g?.resizePanes(tabLayout.terminals.map((terminal) => terminal.relativeSize));
      return g;
    });
    return group;
  }
  _attachProcessLayoutListeners() {
    this._register(this.onDidChangeActiveGroup(() => this._saveState()));
    this._register(this.onDidChangeActiveInstance(() => this._saveState()));
    this._register(this.onDidChangeInstances(() => this._saveState()));
    this._register(this.onAnyInstanceProcessIdReady(() => this._saveState()));
    this._register(this.onAnyInstanceTitleChange((instance) => this._updateTitle(instance)));
    this._register(this.onAnyInstanceIconChange((e) => this._updateIcon(e.instance, e.userInitiated)));
  }
  _handleInstanceContextKeys() {
    const terminalIsOpenContext = TerminalContextKeys.isOpen.bindTo(this._contextKeyService);
    const updateTerminalContextKeys = /* @__PURE__ */ __name(() => {
      terminalIsOpenContext.set(this.instances.length > 0);
      this._terminalCountContextKey.set(this.instances.length);
    }, "updateTerminalContextKeys");
    this._register(this.onDidChangeInstances(() => updateTerminalContextKeys()));
  }
  async getActiveOrCreateInstance(options) {
    const activeInstance = this.activeInstance;
    if (!activeInstance) {
      return this.createTerminal();
    }
    if (!options?.acceptsInput || activeInstance.xterm?.isStdinDisabled !== true) {
      return activeInstance;
    }
    const instance = await this.createTerminal();
    this.setActiveInstance(instance);
    await this.revealActiveTerminal();
    return instance;
  }
  async revealTerminal(source, preserveFocus) {
    if (source.target === TerminalLocation.Editor) {
      await this._terminalEditorService.revealActiveEditor(preserveFocus);
    } else {
      await this._terminalGroupService.showPanel();
    }
  }
  async revealActiveTerminal(preserveFocus) {
    const instance = this.activeInstance;
    if (!instance) {
      return;
    }
    await this.revealTerminal(instance, preserveFocus);
  }
  setEditable(instance, data) {
    if (!data) {
      this._editable = void 0;
    } else {
      this._editable = { instance, data };
    }
    const pane = this._viewsService.getActiveViewWithId(TERMINAL_VIEW_ID);
    const isEditing = this.isEditable(instance);
    pane?.terminalTabbedView?.setEditable(isEditing);
  }
  isEditable(instance) {
    return !!this._editable && (this._editable.instance === instance || !instance);
  }
  getEditableData(instance) {
    return this._editable && this._editable.instance === instance ? this._editable.data : void 0;
  }
  requestStartExtensionTerminal(proxy, cols, rows) {
    return new Promise((callback) => {
      this._onDidRequestStartExtensionTerminal.fire({ proxy, cols, rows, callback });
    });
  }
  _onBeforeShutdown(reason) {
    if (isWeb) {
      this._isShuttingDown = true;
      return false;
    }
    return this._onBeforeShutdownAsync(reason);
  }
  async _onBeforeShutdownAsync(reason) {
    if (this.instances.length === 0) {
      return false;
    }
    try {
      this._shutdownWindowCount = await this._nativeDelegate?.getWindowCount();
      const shouldReviveProcesses = this._shouldReviveProcesses(reason);
      if (shouldReviveProcesses) {
        await Promise.race([
          this._primaryBackend?.persistTerminalState(),
          timeout(2e3)
        ]);
      }
      const shouldPersistProcesses = this._terminalConfigurationService.config.enablePersistentSessions && reason === ShutdownReason.RELOAD;
      if (!shouldPersistProcesses) {
        const hasDirtyInstances = this._terminalConfigurationService.config.confirmOnExit === "always" && this.foregroundInstances.length > 0 || this._terminalConfigurationService.config.confirmOnExit === "hasChildProcesses" && this.foregroundInstances.some((e) => e.hasChildProcesses);
        if (hasDirtyInstances) {
          return this._onBeforeShutdownConfirmation(reason);
        }
      }
    } catch (err) {
      this._logService.warn("Exception occurred during terminal shutdown", err);
    }
    this._isShuttingDown = true;
    return false;
  }
  setNativeDelegate(nativeDelegate) {
    this._nativeDelegate = nativeDelegate;
  }
  _shouldReviveProcesses(reason) {
    if (!this._terminalConfigurationService.config.enablePersistentSessions) {
      return false;
    }
    switch (this._terminalConfigurationService.config.persistentSessionReviveProcess) {
      case "onExit": {
        if (reason === ShutdownReason.CLOSE && (this._shutdownWindowCount === 1 && !isMacintosh)) {
          return true;
        }
        return reason === ShutdownReason.LOAD || reason === ShutdownReason.QUIT;
      }
      case "onExitAndWindowClose":
        return reason !== ShutdownReason.RELOAD;
      default:
        return false;
    }
  }
  async _onBeforeShutdownConfirmation(reason) {
    const veto = await this._showTerminalCloseConfirmation();
    if (!veto) {
      this._isShuttingDown = true;
    }
    return veto;
  }
  _onWillShutdown(e) {
    const shouldPersistTerminals = this._terminalConfigurationService.config.enablePersistentSessions && e.reason === ShutdownReason.RELOAD;
    for (const instance of [...this._terminalGroupService.instances, ...this._backgroundedTerminalInstances]) {
      if (shouldPersistTerminals && instance.shouldPersist) {
        instance.detachProcessAndDispose(TerminalExitReason.Shutdown);
      } else {
        instance.dispose(TerminalExitReason.Shutdown);
      }
    }
    if (!shouldPersistTerminals && !this._shouldReviveProcesses(e.reason)) {
      this._primaryBackend?.setTerminalLayoutInfo(void 0);
    }
  }
  _saveState() {
    if (this._isShuttingDown) {
      return;
    }
    if (!this._terminalConfigurationService.config.enablePersistentSessions) {
      return;
    }
    const tabs = this._terminalGroupService.groups.map((g) => g.getLayoutInfo(g === this._terminalGroupService.activeGroup));
    const state = { tabs };
    this._primaryBackend?.setTerminalLayoutInfo(state);
  }
  _updateTitle(instance) {
    if (!this._terminalConfigurationService.config.enablePersistentSessions || !instance || !instance.persistentProcessId || !instance.title || instance.isDisposed) {
      return;
    }
    if (instance.staticTitle) {
      this._primaryBackend?.updateTitle(instance.persistentProcessId, instance.staticTitle, TitleEventSource.Api);
    } else {
      this._primaryBackend?.updateTitle(instance.persistentProcessId, instance.title, instance.titleSource);
    }
  }
  _updateIcon(instance, userInitiated) {
    if (!this._terminalConfigurationService.config.enablePersistentSessions || !instance || !instance.persistentProcessId || !instance.icon || instance.isDisposed) {
      return;
    }
    this._primaryBackend?.updateIcon(instance.persistentProcessId, userInitiated, instance.icon, instance.color);
  }
  refreshActiveGroup() {
    this._onDidChangeActiveGroup.fire(this._terminalGroupService.activeGroup);
  }
  getInstanceFromId(terminalId) {
    let bgIndex = -1;
    this._backgroundedTerminalInstances.forEach((terminalInstance, i) => {
      if (terminalInstance.instanceId === terminalId) {
        bgIndex = i;
      }
    });
    if (bgIndex !== -1) {
      return this._backgroundedTerminalInstances[bgIndex];
    }
    try {
      return this.instances[this._getIndexFromId(terminalId)];
    } catch {
      return void 0;
    }
  }
  getInstanceFromIndex(terminalIndex) {
    return this.instances[terminalIndex];
  }
  getInstanceFromResource(resource) {
    return getInstanceFromResource(this.instances, resource);
  }
  isAttachedToTerminal(remoteTerm) {
    return this.instances.some((term) => term.processId === remoteTerm.pid);
  }
  moveToEditor(source, group) {
    if (source.target === TerminalLocation.Editor) {
      return;
    }
    const sourceGroup = this._terminalGroupService.getGroupForInstance(source);
    if (!sourceGroup) {
      return;
    }
    sourceGroup.removeInstance(source);
    this._terminalEditorService.openEditor(source, group ? { viewColumn: group } : void 0);
  }
  moveIntoNewEditor(source) {
    this.moveToEditor(source, AUX_WINDOW_GROUP);
  }
  async moveToTerminalView(source, target, side) {
    if (URI.isUri(source)) {
      source = this.getInstanceFromResource(source);
    }
    if (!source) {
      return;
    }
    this._terminalEditorService.detachInstance(source);
    if (source.target !== TerminalLocation.Editor) {
      await this._terminalGroupService.showPanel(true);
      return;
    }
    source.target = TerminalLocation.Panel;
    let group;
    if (target) {
      group = this._terminalGroupService.getGroupForInstance(target);
    }
    if (!group) {
      group = this._terminalGroupService.createGroup();
    }
    group.addInstance(source);
    this.setActiveInstance(source);
    await this._terminalGroupService.showPanel(true);
    if (target && side) {
      const index = group.terminalInstances.indexOf(target) + (side === "after" ? 1 : 0);
      group.moveInstance(source, index, side);
    }
    this._onDidChangeInstances.fire();
    this._onDidChangeActiveGroup.fire(this._terminalGroupService.activeGroup);
  }
  _initInstanceListeners(instance) {
    const instanceDisposables = new DisposableStore();
    instanceDisposables.add(instance.onDimensionsChanged(() => {
      this._onDidChangeInstanceDimensions.fire(instance);
      if (this._terminalConfigurationService.config.enablePersistentSessions && this.isProcessSupportRegistered) {
        this._saveState();
      }
    }));
    instanceDisposables.add(instance.onDidFocus(this._onDidChangeActiveInstance.fire, this._onDidChangeActiveInstance));
    instanceDisposables.add(instance.onRequestAddInstanceToGroup(async (e) => await this._addInstanceToGroup(instance, e)));
    const disposeListener = this._register(instance.onDisposed(() => {
      instanceDisposables.dispose();
      this._store.delete(disposeListener);
    }));
  }
  async _addInstanceToGroup(instance, e) {
    const terminalIdentifier = parseTerminalUri(e.uri);
    if (terminalIdentifier.instanceId === void 0) {
      return;
    }
    let sourceInstance = this.getInstanceFromResource(e.uri);
    if (!sourceInstance) {
      const attachPersistentProcess = await this._primaryBackend?.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId);
      if (attachPersistentProcess) {
        sourceInstance = await this.createTerminal({ config: { attachPersistentProcess }, resource: e.uri });
        this._terminalGroupService.moveInstance(sourceInstance, instance, e.side);
        return;
      }
    }
    sourceInstance = this._terminalGroupService.getInstanceFromResource(e.uri);
    if (sourceInstance) {
      this._terminalGroupService.moveInstance(sourceInstance, instance, e.side);
      return;
    }
    sourceInstance = this._terminalEditorService.getInstanceFromResource(e.uri);
    if (sourceInstance) {
      this.moveToTerminalView(sourceInstance, instance, e.side);
      return;
    }
    return;
  }
  registerProcessSupport(isSupported) {
    if (!isSupported) {
      return;
    }
    this._processSupportContextKey.set(isSupported);
    this._onDidRegisterProcessSupport.fire();
  }
  // TODO: Remove this, it should live in group/editor servioce
  _getIndexFromId(terminalId) {
    let terminalIndex = -1;
    this.instances.forEach((terminalInstance, i) => {
      if (terminalInstance.instanceId === terminalId) {
        terminalIndex = i;
      }
    });
    if (terminalIndex === -1) {
      throw new Error(`Terminal with ID ${terminalId} does not exist (has it already been disposed?)`);
    }
    return terminalIndex;
  }
  async _showTerminalCloseConfirmation(singleTerminal) {
    let message;
    const foregroundInstances = this.foregroundInstances;
    if (foregroundInstances.length === 1 || singleTerminal) {
      message = nls.localize("terminalService.terminalCloseConfirmationSingular", "Do you want to terminate the active terminal session?");
    } else {
      message = nls.localize("terminalService.terminalCloseConfirmationPlural", "Do you want to terminate the {0} active terminal sessions?", foregroundInstances.length);
    }
    const { confirmed } = await this._dialogService.confirm({
      type: "warning",
      message,
      primaryButton: nls.localize({ key: "terminate", comment: ["&& denotes a mnemonic"] }, "&&Terminate")
    });
    return !confirmed;
  }
  getDefaultInstanceHost() {
    if (this.defaultLocation === TerminalLocation.Editor) {
      return this._terminalEditorService;
    }
    return this._terminalGroupService;
  }
  async getInstanceHost(location) {
    if (location) {
      if (location === TerminalLocation.Editor) {
        return this._terminalEditorService;
      } else if (typeof location === "object") {
        if ("viewColumn" in location) {
          return this._terminalEditorService;
        } else if ("parentTerminal" in location) {
          return (await location.parentTerminal).target === TerminalLocation.Editor ? this._terminalEditorService : this._terminalGroupService;
        }
      } else {
        return this._terminalGroupService;
      }
    }
    return this;
  }
  async createTerminal(options) {
    if (this._terminalProfileService.availableProfiles.length === 0) {
      const isPtyTerminal = options?.config && "customPtyImplementation" in options.config;
      const isLocalInRemoteTerminal = this._remoteAgentService.getConnection() && URI.isUri(options?.cwd) && options?.cwd.scheme === Schemas.vscodeFileResource;
      if (!isPtyTerminal && !isLocalInRemoteTerminal) {
        if (this._connectionState === TerminalConnectionState.Connecting) {
          mark(`code/terminal/willGetProfiles`);
        }
        await this._terminalProfileService.profilesReady;
        if (this._connectionState === TerminalConnectionState.Connecting) {
          mark(`code/terminal/didGetProfiles`);
        }
      }
    }
    const config = options?.config || this._terminalProfileService.getDefaultProfile();
    const shellLaunchConfig = config && "extensionIdentifier" in config ? {} : this._terminalInstanceService.convertProfileToShellLaunchConfig(config || {});
    const contributedProfile = options?.skipContributedProfileCheck ? void 0 : await this._getContributedProfile(shellLaunchConfig, options);
    const splitActiveTerminal = typeof options?.location === "object" && "splitActiveTerminal" in options.location ? options.location.splitActiveTerminal : typeof options?.location === "object" ? "parentTerminal" in options.location : false;
    await this._resolveCwd(shellLaunchConfig, splitActiveTerminal, options);
    if (!shellLaunchConfig.customPtyImplementation && contributedProfile) {
      const resolvedLocation = await this.resolveLocation(options?.location);
      let location2;
      if (splitActiveTerminal) {
        location2 = resolvedLocation === TerminalLocation.Editor ? { viewColumn: SIDE_GROUP } : { splitActiveTerminal: true };
      } else {
        location2 = typeof options?.location === "object" && "viewColumn" in options.location ? options.location : resolvedLocation;
      }
      await this.createContributedTerminalProfile(contributedProfile.extensionIdentifier, contributedProfile.id, {
        icon: contributedProfile.icon,
        color: contributedProfile.color,
        location: location2,
        cwd: shellLaunchConfig.cwd
      });
      const instanceHost = resolvedLocation === TerminalLocation.Editor ? this._terminalEditorService : this._terminalGroupService;
      const instance = instanceHost.instances[instanceHost.instances.length - 1];
      await instance?.focusWhenReady();
      this._terminalHasBeenCreated.set(true);
      return instance;
    }
    if (!shellLaunchConfig.customPtyImplementation && !this.isProcessSupportRegistered) {
      throw new Error("Could not create terminal when process support is not registered");
    }
    if (shellLaunchConfig.hideFromUser) {
      const instance = this._terminalInstanceService.createInstance(shellLaunchConfig, TerminalLocation.Panel);
      this._backgroundedTerminalInstances.push(instance);
      this._backgroundedTerminalDisposables.set(instance.instanceId, [
        instance.onDisposed(this._onDidDisposeInstance.fire, this._onDidDisposeInstance)
      ]);
      this._terminalHasBeenCreated.set(true);
      return instance;
    }
    this._evaluateLocalCwd(shellLaunchConfig);
    const location = await this.resolveLocation(options?.location) || this.defaultLocation;
    const parent = await this._getSplitParent(options?.location);
    this._terminalHasBeenCreated.set(true);
    if (parent) {
      return this._splitTerminal(shellLaunchConfig, location, parent);
    }
    return this._createTerminal(shellLaunchConfig, location, options);
  }
  async _getContributedProfile(shellLaunchConfig, options) {
    if (options?.config && "extensionIdentifier" in options.config) {
      return options.config;
    }
    return this._terminalProfileService.getContributedDefaultProfile(shellLaunchConfig);
  }
  async createDetachedTerminal(options) {
    const ctor = await TerminalInstance.getXtermConstructor(this._keybindingService, this._contextKeyService);
    const xterm = this._instantiationService.createInstance(XtermTerminal, ctor, {
      cols: options.cols,
      rows: options.rows,
      xtermColorProvider: options.colorProvider,
      capabilities: options.capabilities || new TerminalCapabilityStore()
    });
    if (options.readonly) {
      xterm.raw.attachCustomKeyEventHandler(() => false);
    }
    const instance = new DetachedTerminal(xterm, options, this._instantiationService);
    this._detachedXterms.add(instance);
    const l = xterm.onDidDispose(() => {
      this._detachedXterms.delete(instance);
      l.dispose();
    });
    return instance;
  }
  async _resolveCwd(shellLaunchConfig, splitActiveTerminal, options) {
    const cwd = shellLaunchConfig.cwd;
    if (!cwd) {
      if (options?.cwd) {
        shellLaunchConfig.cwd = options.cwd;
      } else if (splitActiveTerminal && options?.location) {
        let parent = this.activeInstance;
        if (typeof options.location === "object" && "parentTerminal" in options.location) {
          parent = await options.location.parentTerminal;
        }
        if (!parent) {
          throw new Error("Cannot split without an active instance");
        }
        shellLaunchConfig.cwd = await getCwdForSplit(parent, this._workspaceContextService.getWorkspace().folders, this._commandService, this._terminalConfigService);
      }
    }
  }
  _splitTerminal(shellLaunchConfig, location, parent) {
    let instance;
    if (typeof shellLaunchConfig.cwd !== "object" && typeof parent.shellLaunchConfig.cwd === "object") {
      shellLaunchConfig.cwd = URI.from({
        scheme: parent.shellLaunchConfig.cwd.scheme,
        authority: parent.shellLaunchConfig.cwd.authority,
        path: shellLaunchConfig.cwd || parent.shellLaunchConfig.cwd.path
      });
    }
    if (location === TerminalLocation.Editor || parent.target === TerminalLocation.Editor) {
      instance = this._terminalEditorService.splitInstance(parent, shellLaunchConfig);
    } else {
      const group = this._terminalGroupService.getGroupForInstance(parent);
      if (!group) {
        throw new Error(`Cannot split a terminal without a group (instanceId: ${parent.instanceId}, title: ${parent.title})`);
      }
      shellLaunchConfig.parentTerminalId = parent.instanceId;
      instance = group.split(shellLaunchConfig);
    }
    this._addToReconnected(instance);
    return instance;
  }
  _addToReconnected(instance) {
    if (!instance.reconnectionProperties?.ownerId) {
      return;
    }
    const reconnectedTerminals = this._reconnectedTerminals.get(instance.reconnectionProperties.ownerId);
    if (reconnectedTerminals) {
      reconnectedTerminals.push(instance);
    } else {
      this._reconnectedTerminals.set(instance.reconnectionProperties.ownerId, [instance]);
    }
  }
  _createTerminal(shellLaunchConfig, location, options) {
    let instance;
    const editorOptions = this._getEditorOptions(options?.location);
    if (location === TerminalLocation.Editor) {
      instance = this._terminalInstanceService.createInstance(shellLaunchConfig, TerminalLocation.Editor);
      this._terminalEditorService.openEditor(instance, editorOptions);
    } else {
      const group = this._terminalGroupService.createGroup(shellLaunchConfig);
      instance = group.terminalInstances[0];
    }
    this._addToReconnected(instance);
    return instance;
  }
  async resolveLocation(location) {
    if (location && typeof location === "object") {
      if ("parentTerminal" in location) {
        const parentTerminal = await location.parentTerminal;
        return !parentTerminal.target ? TerminalLocation.Panel : parentTerminal.target;
      } else if ("viewColumn" in location) {
        return TerminalLocation.Editor;
      } else if ("splitActiveTerminal" in location) {
        return !this._activeInstance?.target ? TerminalLocation.Panel : this._activeInstance?.target;
      }
    }
    return location;
  }
  async _getSplitParent(location) {
    if (location && typeof location === "object" && "parentTerminal" in location) {
      return location.parentTerminal;
    } else if (location && typeof location === "object" && "splitActiveTerminal" in location) {
      return this.activeInstance;
    }
    return void 0;
  }
  _getEditorOptions(location) {
    if (location && typeof location === "object" && "viewColumn" in location) {
      location.viewColumn = columnToEditorGroup(this._editorGroupsService, this._configurationService, location.viewColumn);
      return location;
    }
    return void 0;
  }
  _evaluateLocalCwd(shellLaunchConfig) {
    if (typeof shellLaunchConfig.cwd !== "string" && shellLaunchConfig.cwd?.scheme === Schemas.file) {
      if (VirtualWorkspaceContext.getValue(this._contextKeyService)) {
        shellLaunchConfig.initialText = formatMessageForTerminal(nls.localize("localTerminalVirtualWorkspace", "This shell is open to a {0}local{1} folder, NOT to the virtual folder", "\x1B[3m", "\x1B[23m"), { excludeLeadingNewLine: true, loudFormatting: true });
        shellLaunchConfig.type = "Local";
      } else if (this._remoteAgentService.getConnection()) {
        shellLaunchConfig.initialText = formatMessageForTerminal(nls.localize("localTerminalRemote", "This shell is running on your {0}local{1} machine, NOT on the connected remote machine", "\x1B[3m", "\x1B[23m"), { excludeLeadingNewLine: true, loudFormatting: true });
        shellLaunchConfig.type = "Local";
      }
    }
  }
  _showBackgroundTerminal(instance) {
    const index = this._backgroundedTerminalInstances.indexOf(instance);
    if (index === -1) {
      return;
    }
    this._backgroundedTerminalInstances.splice(this._backgroundedTerminalInstances.indexOf(instance), 1);
    const disposables = this._backgroundedTerminalDisposables.get(instance.instanceId);
    if (disposables) {
      dispose(disposables);
    }
    this._backgroundedTerminalDisposables.delete(instance.instanceId);
    this._terminalGroupService.createGroup(instance);
    if (this.instances.length === 1) {
      this._terminalGroupService.setActiveInstanceByIndex(0);
    }
    this._onDidChangeInstances.fire();
  }
  async setContainers(panelContainer, terminalContainer) {
    this._terminalConfigurationService.setPanelContainer(panelContainer);
    this._terminalGroupService.setContainer(terminalContainer);
  }
  getEditingTerminal() {
    return this._editingTerminal;
  }
  setEditingTerminal(instance) {
    this._editingTerminal = instance;
  }
  createOnInstanceEvent(getEvent) {
    return new DynamicListEventMultiplexer(this.instances, this.onDidCreateInstance, this.onDidDisposeInstance, getEvent);
  }
  createOnInstanceCapabilityEvent(capabilityId, getEvent) {
    return createInstanceCapabilityEventMultiplexer(this.instances, this.onDidCreateInstance, this.onDidDisposeInstance, capabilityId, getEvent);
  }
};
__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceData", 1);
__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceDataInput", 1);
__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceIconChange", 1);
__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceMaximumDimensionsChange", 1);
__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstancePrimaryStatusChange", 1);
__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceProcessIdReady", 1);
__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceSelectionChange", 1);
__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceTitleChange", 1);
__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceShellTypeChanged", 1);
__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceAddedCapabilityType", 1);
__decorateClass([
  debounce(500)
], TerminalService.prototype, "_saveState", 1);
__decorateClass([
  debounce(500)
], TerminalService.prototype, "_updateTitle", 1);
__decorateClass([
  debounce(500)
], TerminalService.prototype, "_updateIcon", 1);
TerminalService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ILifecycleService),
  __decorateParam(2, ITerminalLogService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IRemoteAgentService),
  __decorateParam(6, IViewsService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, ITerminalConfigurationService),
  __decorateParam(9, IWorkbenchEnvironmentService),
  __decorateParam(10, ITerminalConfigurationService),
  __decorateParam(11, ITerminalEditorService),
  __decorateParam(12, ITerminalGroupService),
  __decorateParam(13, ITerminalInstanceService),
  __decorateParam(14, IEditorGroupsService),
  __decorateParam(15, ITerminalProfileService),
  __decorateParam(16, IExtensionService),
  __decorateParam(17, INotificationService),
  __decorateParam(18, IWorkspaceContextService),
  __decorateParam(19, ICommandService),
  __decorateParam(20, IKeybindingService),
  __decorateParam(21, ITimerService)
], TerminalService);
let TerminalEditorStyle = class extends Themable {
  constructor(container, _terminalService, _themeService, _terminalProfileService, _editorService) {
    super(_themeService);
    this._terminalService = _terminalService;
    this._themeService = _themeService;
    this._terminalProfileService = _terminalProfileService;
    this._editorService = _editorService;
    this._registerListeners();
    this._styleElement = domStylesheets.createStyleSheet(container);
    this._register(toDisposable(() => this._styleElement.remove()));
    this.updateStyles();
  }
  static {
    __name(this, "TerminalEditorStyle");
  }
  _styleElement;
  _registerListeners() {
    this._register(this._terminalService.onAnyInstanceIconChange(() => this.updateStyles()));
    this._register(this._terminalService.onDidCreateInstance(() => this.updateStyles()));
    this._register(this._editorService.onDidActiveEditorChange(() => {
      if (this._editorService.activeEditor instanceof TerminalEditorInput) {
        this.updateStyles();
      }
    }));
    this._register(this._editorService.onDidCloseEditor(() => {
      if (this._editorService.activeEditor instanceof TerminalEditorInput) {
        this.updateStyles();
      }
    }));
    this._register(this._terminalProfileService.onDidChangeAvailableProfiles(() => this.updateStyles()));
  }
  updateStyles() {
    super.updateStyles();
    const colorTheme = this._themeService.getColorTheme();
    let css = "";
    const productIconTheme = this._themeService.getProductIconTheme();
    for (const instance of this._terminalService.instances) {
      const icon = instance.icon;
      if (!icon) {
        continue;
      }
      let uri = void 0;
      if (icon instanceof URI) {
        uri = icon;
      } else if (icon instanceof Object && "light" in icon && "dark" in icon) {
        uri = colorTheme.type === ColorScheme.LIGHT ? icon.light : icon.dark;
      }
      const iconClasses = getUriClasses(instance, colorTheme.type);
      if (uri instanceof URI && iconClasses && iconClasses.length > 1) {
        css += cssValue.inline`.monaco-workbench .terminal-tab.${cssValue.className(iconClasses[0])}::before
					{content: ''; background-image: ${cssValue.asCSSUrl(uri)};}`;
      }
      if (ThemeIcon.isThemeIcon(icon)) {
        const iconRegistry = getIconRegistry();
        const iconContribution = iconRegistry.getIcon(icon.id);
        if (iconContribution) {
          const def = productIconTheme.getIcon(iconContribution);
          if (def) {
            css += cssValue.inline`.monaco-workbench .terminal-tab.codicon-${cssValue.className(icon.id)}::before
							{content: ${cssValue.stringValue(def.fontCharacter)} !important; font-family: ${cssValue.stringValue(def.font?.id ?? "codicon")} !important;}`;
          }
        }
      }
    }
    const iconForegroundColor = colorTheme.getColor(iconForeground);
    if (iconForegroundColor) {
      css += cssValue.inline`.monaco-workbench .show-file-icons .file-icon.terminal-tab::before { color: ${iconForegroundColor}; }`;
    }
    css += getColorStyleContent(colorTheme, true);
    this._styleElement.textContent = css;
  }
};
TerminalEditorStyle = __decorateClass([
  __decorateParam(1, ITerminalService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, ITerminalProfileService),
  __decorateParam(4, IEditorService)
], TerminalEditorStyle);
export {
  TerminalService
};
//# sourceMappingURL=terminalService.js.map
