var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Action } from "../../../../base/common/actions.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { joinPath } from "../../../../base/common/resources.js";
import { isNumber, isObject, isString } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { INativeEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { ILoggerService } from "../../../../platform/log/common/log.js";
import { INotificationService, NotificationPriority, Severity } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { CONFIGURATION_KEY_HOST_NAME, CONFIGURATION_KEY_PREFIX, CONFIGURATION_KEY_PREVENT_SLEEP, INACTIVE_TUNNEL_MODE, IRemoteTunnelService, LOGGER_NAME, LOG_ID } from "../../../../platform/remoteTunnel/common/remoteTunnel.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IWorkspaceContextService, isUntitledWorkspace } from "../../../../platform/workspace/common/workspace.js";
import { Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IOutputService } from "../../../services/output/common/output.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
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
const REMOTE_TUNNEL_CATEGORY = localize2("remoteTunnel.category", "Remote Tunnels");
const REMOTE_TUNNEL_CONNECTION_STATE_KEY = "remoteTunnelConnection";
const REMOTE_TUNNEL_CONNECTION_STATE = new RawContextKey(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "disconnected");
const REMOTE_TUNNEL_USED_STORAGE_KEY = "remoteTunnelServiceUsed";
const REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY = "remoteTunnelServicePromptedPreview";
const REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY = "remoteTunnelExtensionRecommended";
const REMOTE_TUNNEL_HAS_USED_BEFORE = "remoteTunnelHasUsed";
const REMOTE_TUNNEL_EXTENSION_TIMEOUT = 4 * 60 * 1e3;
const INVALID_TOKEN_RETRIES = 2;
var RemoteTunnelCommandIds;
(function(RemoteTunnelCommandIds2) {
  RemoteTunnelCommandIds2["turnOn"] = "workbench.remoteTunnel.actions.turnOn";
  RemoteTunnelCommandIds2["turnOff"] = "workbench.remoteTunnel.actions.turnOff";
  RemoteTunnelCommandIds2["connecting"] = "workbench.remoteTunnel.actions.connecting";
  RemoteTunnelCommandIds2["manage"] = "workbench.remoteTunnel.actions.manage";
  RemoteTunnelCommandIds2["showLog"] = "workbench.remoteTunnel.actions.showLog";
  RemoteTunnelCommandIds2["configure"] = "workbench.remoteTunnel.actions.configure";
  RemoteTunnelCommandIds2["copyToClipboard"] = "workbench.remoteTunnel.actions.copyToClipboard";
  RemoteTunnelCommandIds2["learnMore"] = "workbench.remoteTunnel.actions.learnMore";
})(RemoteTunnelCommandIds || (RemoteTunnelCommandIds = {}));
var RemoteTunnelCommandLabels;
(function(RemoteTunnelCommandLabels2) {
  RemoteTunnelCommandLabels2.turnOn = localize("remoteTunnel.actions.turnOn", "Turn on Remote Tunnel Access...");
  RemoteTunnelCommandLabels2.turnOff = localize("remoteTunnel.actions.turnOff", "Turn off Remote Tunnel Access...");
  RemoteTunnelCommandLabels2.showLog = localize("remoteTunnel.actions.showLog", "Show Remote Tunnel Service Log");
  RemoteTunnelCommandLabels2.configure = localize("remoteTunnel.actions.configure", "Configure Tunnel Name...");
  RemoteTunnelCommandLabels2.copyToClipboard = localize("remoteTunnel.actions.copyToClipboard", "Copy Browser URI to Clipboard");
  RemoteTunnelCommandLabels2.learnMore = localize("remoteTunnel.actions.learnMore", "Get Started with Tunnels");
})(RemoteTunnelCommandLabels || (RemoteTunnelCommandLabels = {}));
let RemoteTunnelWorkbenchContribution = class RemoteTunnelWorkbenchContribution2 extends Disposable {
  static {
    __name(this, "RemoteTunnelWorkbenchContribution");
  }
  constructor(authenticationService, dialogService, extensionService, contextKeyService, productService, storageService, loggerService, quickInputService, environmentService, remoteTunnelService, commandService, workspaceContextService, progressService, notificationService) {
    super();
    this.authenticationService = authenticationService;
    this.dialogService = dialogService;
    this.extensionService = extensionService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    this.quickInputService = quickInputService;
    this.environmentService = environmentService;
    this.remoteTunnelService = remoteTunnelService;
    this.commandService = commandService;
    this.workspaceContextService = workspaceContextService;
    this.progressService = progressService;
    this.notificationService = notificationService;
    this.expiredSessions = /* @__PURE__ */ new Set();
    this.logger = this._register(loggerService.createLogger(joinPath(environmentService.logsHome, `${LOG_ID}.log`), { id: LOG_ID, name: LOGGER_NAME }));
    this.connectionStateContext = REMOTE_TUNNEL_CONNECTION_STATE.bindTo(this.contextKeyService);
    const serverConfiguration = productService.tunnelApplicationConfig;
    if (!serverConfiguration || !productService.tunnelApplicationName) {
      this.logger.error("Missing 'tunnelApplicationConfig' or 'tunnelApplicationName' in product.json. Remote tunneling is not available.");
      this.serverConfiguration = { authenticationProviders: {}, editorWebUrl: "", extension: { extensionId: "", friendlyName: "" } };
      return;
    }
    this.serverConfiguration = serverConfiguration;
    this._register(this.remoteTunnelService.onDidChangeTunnelStatus((s) => this.handleTunnelStatusUpdate(s)));
    this.registerCommands();
    this.initialize();
    this.recommendRemoteExtensionIfNeeded();
  }
  handleTunnelStatusUpdate(status) {
    this.connectionInfo = void 0;
    if (status.type === "disconnected") {
      if (status.onTokenFailed) {
        this.expiredSessions.add(status.onTokenFailed.sessionId);
      }
      this.connectionStateContext.set("disconnected");
    } else if (status.type === "connecting") {
      this.connectionStateContext.set("connecting");
    } else if (status.type === "connected") {
      this.connectionInfo = status.info;
      this.connectionStateContext.set("connected");
    }
  }
  async recommendRemoteExtensionIfNeeded() {
    await this.extensionService.whenInstalledExtensionsRegistered();
    const remoteExtension = this.serverConfiguration.extension;
    const shouldRecommend = /* @__PURE__ */ __name(async () => {
      if (this.storageService.getBoolean(
        REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY,
        -1
        /* StorageScope.APPLICATION */
      )) {
        return false;
      }
      if (await this.extensionService.getExtension(remoteExtension.extensionId)) {
        return false;
      }
      const usedOnHostMessage = this.storageService.get(
        REMOTE_TUNNEL_USED_STORAGE_KEY,
        -1
        /* StorageScope.APPLICATION */
      );
      if (!usedOnHostMessage) {
        return false;
      }
      let usedTunnelName;
      try {
        const message = JSON.parse(usedOnHostMessage);
        if (!isObject(message)) {
          return false;
        }
        const { hostName, timeStamp } = message;
        if (!isString(hostName) || !isNumber(timeStamp) || (/* @__PURE__ */ new Date()).getTime() > timeStamp + REMOTE_TUNNEL_EXTENSION_TIMEOUT) {
          return false;
        }
        usedTunnelName = hostName;
      } catch (_) {
        return false;
      }
      const currentTunnelName = await this.remoteTunnelService.getTunnelName();
      if (!currentTunnelName || currentTunnelName === usedTunnelName) {
        return false;
      }
      return usedTunnelName;
    }, "shouldRecommend");
    const recommed = /* @__PURE__ */ __name(async () => {
      const usedOnHost = await shouldRecommend();
      if (!usedOnHost) {
        return false;
      }
      this.notificationService.notify({
        severity: Severity.Info,
        priority: NotificationPriority.OPTIONAL,
        message: localize({
          key: "recommend.remoteExtension",
          comment: ["{0} will be a tunnel name, {1} will the link address to the web UI, {6} an extension name. [label](command:commandId) is a markdown link. Only translate the label, do not modify the format"]
        }, "Tunnel '{0}' is avaiable for remote access. The {1} extension can be used to connect to it.", usedOnHost, remoteExtension.friendlyName),
        actions: {
          primary: [
            new Action("showExtension", localize("action.showExtension", "Show Extension"), void 0, true, () => {
              return this.commandService.executeCommand("workbench.extensions.action.showExtensionsWithIds", [remoteExtension.extensionId]);
            }),
            new Action("doNotShowAgain", localize("action.doNotShowAgain", "Do not show again"), void 0, true, () => {
              this.storageService.store(
                REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY,
                true,
                -1,
                0
                /* StorageTarget.USER */
              );
            })
          ]
        }
      });
      return true;
    }, "recommed");
    if (await shouldRecommend()) {
      const disposables = this._register(new DisposableStore());
      disposables.add(this.storageService.onDidChangeValue(-1, REMOTE_TUNNEL_USED_STORAGE_KEY, disposables)(async () => {
        const success = await recommed();
        if (success) {
          disposables.dispose();
        }
      }));
    }
  }
  async initialize() {
    const [mode, status] = await Promise.all([
      this.remoteTunnelService.getMode(),
      this.remoteTunnelService.getTunnelStatus()
    ]);
    this.handleTunnelStatusUpdate(status);
    if (mode.active && mode.session.token) {
      return;
    }
    const doInitialStateDiscovery = /* @__PURE__ */ __name(async (progress) => {
      const listener = progress && this.remoteTunnelService.onDidChangeTunnelStatus((status3) => {
        switch (status3.type) {
          case "connecting":
            if (status3.progress) {
              progress.report({ message: status3.progress });
            }
            break;
        }
      });
      let newSession;
      if (mode.active) {
        const token = await this.getSessionToken(mode.session);
        if (token) {
          newSession = { ...mode.session, token };
        }
      }
      const status2 = await this.remoteTunnelService.initialize(mode.active && newSession ? { ...mode, session: newSession } : INACTIVE_TUNNEL_MODE);
      listener?.dispose();
      if (status2.type === "connected") {
        this.connectionInfo = status2.info;
        this.connectionStateContext.set("connected");
        return;
      }
    }, "doInitialStateDiscovery");
    const hasUsed = this.storageService.getBoolean(REMOTE_TUNNEL_HAS_USED_BEFORE, -1, false);
    if (hasUsed) {
      await this.progressService.withProgress({
        location: 10,
        title: localize({ key: "initialize.progress.title", comment: ["Only translate 'Looking for remote tunnel', do not change the format of the rest (markdown link format)"] }, "[Looking for remote tunnel](command:{0})", RemoteTunnelCommandIds.showLog)
      }, doInitialStateDiscovery);
    } else {
      doInitialStateDiscovery(void 0);
    }
  }
  getPreferredTokenFromSession(session) {
    return session.session.accessToken || session.session.idToken;
  }
  async startTunnel(asService) {
    if (this.connectionInfo) {
      return this.connectionInfo;
    }
    this.storageService.store(
      REMOTE_TUNNEL_HAS_USED_BEFORE,
      true,
      -1,
      1
      /* StorageTarget.MACHINE */
    );
    let tokenProblems = false;
    for (let i = 0; i < INVALID_TOKEN_RETRIES; i++) {
      tokenProblems = false;
      const authenticationSession = await this.getAuthenticationSession();
      if (authenticationSession === void 0) {
        this.logger.info("No authentication session available, not starting tunnel");
        return void 0;
      }
      const result = await this.progressService.withProgress({
        location: 15,
        title: localize({ key: "startTunnel.progress.title", comment: ["Only translate 'Starting remote tunnel', do not change the format of the rest (markdown link format)"] }, "[Starting remote tunnel](command:{0})", RemoteTunnelCommandIds.showLog)
      }, (progress) => {
        return new Promise((s, e) => {
          let completed = false;
          const listener = this.remoteTunnelService.onDidChangeTunnelStatus((status) => {
            switch (status.type) {
              case "connecting":
                if (status.progress) {
                  progress.report({ message: status.progress });
                }
                break;
              case "connected":
                listener.dispose();
                completed = true;
                s(status.info);
                if (status.serviceInstallFailed) {
                  this.notificationService.notify({
                    severity: Severity.Warning,
                    message: localize({
                      key: "remoteTunnel.serviceInstallFailed",
                      comment: ['{Locked="](command:{0})"}']
                    }, "Installation as a service failed, and we fell back to running the tunnel for this session. See the [error log](command:{0}) for details.", RemoteTunnelCommandIds.showLog)
                  });
                }
                break;
              case "disconnected":
                listener.dispose();
                completed = true;
                tokenProblems = !!status.onTokenFailed;
                s(void 0);
                break;
            }
          });
          const token = this.getPreferredTokenFromSession(authenticationSession);
          const account = { sessionId: authenticationSession.session.id, token, providerId: authenticationSession.providerId, accountLabel: authenticationSession.session.account.label };
          this.remoteTunnelService.startTunnel({ active: true, asService, session: account }).then((status) => {
            if (!completed && (status.type === "connected" || status.type === "disconnected")) {
              listener.dispose();
              if (status.type === "connected") {
                s(status.info);
              } else {
                tokenProblems = !!status.onTokenFailed;
                s(void 0);
              }
            }
          });
        });
      });
      if (result || !tokenProblems) {
        return result;
      }
    }
    return void 0;
  }
  async getAuthenticationSession() {
    const sessions = await this.getAllSessions();
    const disposables = new DisposableStore();
    const quickpick = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
    quickpick.ok = false;
    quickpick.placeholder = localize("accountPreference.placeholder", "Sign in to an account to enable remote access");
    quickpick.ignoreFocusOut = true;
    quickpick.items = await this.createQuickpickItems(sessions);
    return new Promise((resolve, reject) => {
      disposables.add(quickpick.onDidHide((e) => {
        resolve(void 0);
        disposables.dispose();
      }));
      disposables.add(quickpick.onDidAccept(async (e) => {
        const selection = quickpick.selectedItems[0];
        if ("provider" in selection) {
          const session = await this.authenticationService.createSession(selection.provider.id, selection.provider.scopes);
          resolve(this.createExistingSessionItem(session, selection.provider.id));
        } else if ("session" in selection) {
          resolve(selection);
        } else {
          resolve(void 0);
        }
        quickpick.hide();
      }));
      quickpick.show();
    });
  }
  createExistingSessionItem(session, providerId) {
    return {
      label: session.account.label,
      description: this.authenticationService.getProvider(providerId).label,
      session,
      providerId
    };
  }
  async createQuickpickItems(sessions) {
    const options = [];
    if (sessions.length) {
      options.push({ type: "separator", label: localize("signed in", "Signed In") });
      options.push(...sessions);
      options.push({ type: "separator", label: localize("others", "Others") });
    }
    for (const authenticationProvider of await this.getAuthenticationProviders()) {
      const signedInForProvider = sessions.some((account) => account.providerId === authenticationProvider.id);
      const provider = this.authenticationService.getProvider(authenticationProvider.id);
      if (!signedInForProvider || provider.supportsMultipleAccounts) {
        options.push({ label: localize({ key: "sign in using account", comment: ["{0} will be a auth provider (e.g. Github)"] }, "Sign in with {0}", provider.label), provider: authenticationProvider });
      }
    }
    return options;
  }
  /**
   * Returns all authentication sessions available from {@link getAuthenticationProviders}.
   */
  async getAllSessions() {
    const authenticationProviders = await this.getAuthenticationProviders();
    const accounts = /* @__PURE__ */ new Map();
    const currentAccount = await this.remoteTunnelService.getMode();
    let currentSession;
    for (const provider of authenticationProviders) {
      const sessions = await this.authenticationService.getSessions(provider.id, provider.scopes);
      for (const session of sessions) {
        if (!this.expiredSessions.has(session.id)) {
          const item = this.createExistingSessionItem(session, provider.id);
          accounts.set(item.session.account.id, item);
          if (currentAccount.active && currentAccount.session.sessionId === session.id) {
            currentSession = item;
          }
        }
      }
    }
    if (currentSession !== void 0) {
      accounts.set(currentSession.session.account.id, currentSession);
    }
    return [...accounts.values()];
  }
  async getSessionToken(session) {
    if (session) {
      const sessionItem = (await this.getAllSessions()).find((s) => s.session.id === session.sessionId);
      if (sessionItem) {
        return this.getPreferredTokenFromSession(sessionItem);
      }
    }
    return void 0;
  }
  /**
   * Returns all authentication providers which can be used to authenticate
   * to the remote storage service, based on product.json configuration
   * and registered authentication providers.
   */
  async getAuthenticationProviders() {
    const authenticationProviders = this.serverConfiguration.authenticationProviders;
    const configuredAuthenticationProviders = Object.keys(authenticationProviders).reduce((result, id) => {
      result.push({ id, scopes: authenticationProviders[id].scopes });
      return result;
    }, []);
    const availableAuthenticationProviders = this.authenticationService.declaredProviders;
    return configuredAuthenticationProviders.filter(({ id }) => availableAuthenticationProviders.some((provider) => provider.id === id));
  }
  registerCommands() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: RemoteTunnelCommandIds.turnOn,
          title: RemoteTunnelCommandLabels.turnOn,
          category: REMOTE_TUNNEL_CATEGORY,
          precondition: ContextKeyExpr.equals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "disconnected"),
          menu: [
            {
              id: MenuId.CommandPalette
            },
            {
              id: MenuId.AccountsContext,
              group: "2_remoteTunnel",
              when: ContextKeyExpr.equals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "disconnected")
            }
          ]
        });
      }
      async run(accessor) {
        const notificationService = accessor.get(INotificationService);
        const clipboardService = accessor.get(IClipboardService);
        const commandService = accessor.get(ICommandService);
        const storageService = accessor.get(IStorageService);
        const dialogService = accessor.get(IDialogService);
        const quickInputService = accessor.get(IQuickInputService);
        const productService = accessor.get(IProductService);
        const didNotifyPreview = storageService.getBoolean(REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY, -1, false);
        if (!didNotifyPreview) {
          const { confirmed } = await dialogService.confirm({
            message: localize("tunnel.preview", 'Remote Tunnels is currently in preview. Please report any problems using the "Help: Report Issue" command.'),
            primaryButton: localize({ key: "enable", comment: ["&& denotes a mnemonic"] }, "&&Enable")
          });
          if (!confirmed) {
            return;
          }
          storageService.store(
            REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY,
            true,
            -1,
            0
            /* StorageTarget.USER */
          );
        }
        const disposables = new DisposableStore();
        const quickPick = quickInputService.createQuickPick();
        quickPick.placeholder = localize("tunnel.enable.placeholder", "Select how you want to enable access");
        quickPick.items = [
          { service: false, label: localize("tunnel.enable.session", "Turn on for this session"), description: localize("tunnel.enable.session.description", "Run whenever {0} is open", productService.nameShort) },
          { service: true, label: localize("tunnel.enable.service", "Install as a service"), description: localize("tunnel.enable.service.description", "Run whenever you're logged in") }
        ];
        const asService = await new Promise((resolve) => {
          disposables.add(quickPick.onDidAccept(() => resolve(quickPick.selectedItems[0]?.service)));
          disposables.add(quickPick.onDidHide(() => resolve(void 0)));
          quickPick.show();
        });
        quickPick.dispose();
        if (asService === void 0) {
          return;
        }
        const connectionInfo = await that.startTunnel(
          /* installAsService= */
          asService
        );
        if (connectionInfo) {
          const linkToOpen = that.getLinkToOpen(connectionInfo);
          const remoteExtension = that.serverConfiguration.extension;
          const linkToOpenForMarkdown = linkToOpen.toString(false).replace(/\)/g, "%29");
          notificationService.notify({
            severity: Severity.Info,
            message: localize({
              key: "progress.turnOn.final",
              comment: ["{0} will be the tunnel name, {1} will the link address to the web UI, {6} an extension name, {7} a link to the extension documentation. [label](command:commandId) is a markdown link. Only translate the label, do not modify the format"]
            }, "You can now access this machine anywhere via the secure tunnel [{0}](command:{4}). To connect via a different machine, use the generated [{1}]({2}) link or use the [{6}]({7}) extension in the desktop or web. You can [configure](command:{3}) or [turn off](command:{5}) this access via the VS Code Accounts menu.", connectionInfo.tunnelName, connectionInfo.domain, linkToOpenForMarkdown, RemoteTunnelCommandIds.manage, RemoteTunnelCommandIds.configure, RemoteTunnelCommandIds.turnOff, remoteExtension.friendlyName, "https://code.visualstudio.com/docs/remote/tunnels"),
            actions: {
              primary: [
                new Action("copyToClipboard", localize("action.copyToClipboard", "Copy Browser Link to Clipboard"), void 0, true, () => clipboardService.writeText(linkToOpen.toString(true))),
                new Action("showExtension", localize("action.showExtension", "Show Extension"), void 0, true, () => {
                  return commandService.executeCommand("workbench.extensions.action.showExtensionsWithIds", [remoteExtension.extensionId]);
                })
              ]
            }
          });
          const usedOnHostMessage = { hostName: connectionInfo.tunnelName, timeStamp: (/* @__PURE__ */ new Date()).getTime() };
          storageService.store(
            REMOTE_TUNNEL_USED_STORAGE_KEY,
            JSON.stringify(usedOnHostMessage),
            -1,
            0
            /* StorageTarget.USER */
          );
        } else {
          notificationService.notify({
            severity: Severity.Info,
            message: localize("progress.turnOn.failed", "Unable to turn on the remote tunnel access. Check the Remote Tunnel Service log for details.")
          });
          await commandService.executeCommand(RemoteTunnelCommandIds.showLog);
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: RemoteTunnelCommandIds.manage,
          title: localize("remoteTunnel.actions.manage.on.v2", "Remote Tunnel Access is On"),
          category: REMOTE_TUNNEL_CATEGORY,
          menu: [{
            id: MenuId.AccountsContext,
            group: "2_remoteTunnel",
            when: ContextKeyExpr.equals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "connected")
          }]
        });
      }
      async run() {
        that.showManageOptions();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: RemoteTunnelCommandIds.connecting,
          title: localize("remoteTunnel.actions.manage.connecting", "Remote Tunnel Access is Connecting"),
          category: REMOTE_TUNNEL_CATEGORY,
          menu: [{
            id: MenuId.AccountsContext,
            group: "2_remoteTunnel",
            when: ContextKeyExpr.equals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "connecting")
          }]
        });
      }
      async run() {
        that.showManageOptions();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: RemoteTunnelCommandIds.turnOff,
          title: RemoteTunnelCommandLabels.turnOff,
          category: REMOTE_TUNNEL_CATEGORY,
          precondition: ContextKeyExpr.notEquals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "disconnected"),
          menu: [{
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.notEquals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "")
          }]
        });
      }
      async run() {
        const message = that.connectionInfo?.isAttached ? localize("remoteTunnel.turnOffAttached.confirm", "Do you want to turn off Remote Tunnel Access? This will also stop the service that was started externally.") : localize("remoteTunnel.turnOff.confirm", "Do you want to turn off Remote Tunnel Access?");
        const { confirmed } = await that.dialogService.confirm({ message });
        if (confirmed) {
          that.remoteTunnelService.stopTunnel();
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: RemoteTunnelCommandIds.showLog,
          title: RemoteTunnelCommandLabels.showLog,
          category: REMOTE_TUNNEL_CATEGORY,
          menu: [{
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.notEquals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "")
          }]
        });
      }
      async run(accessor) {
        const outputService = accessor.get(IOutputService);
        outputService.showChannel(LOG_ID);
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: RemoteTunnelCommandIds.configure,
          title: RemoteTunnelCommandLabels.configure,
          category: REMOTE_TUNNEL_CATEGORY,
          menu: [{
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.notEquals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "")
          }]
        });
      }
      async run(accessor) {
        const preferencesService = accessor.get(IPreferencesService);
        preferencesService.openSettings({ query: CONFIGURATION_KEY_PREFIX });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: RemoteTunnelCommandIds.copyToClipboard,
          title: RemoteTunnelCommandLabels.copyToClipboard,
          category: REMOTE_TUNNEL_CATEGORY,
          precondition: ContextKeyExpr.equals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "connected"),
          menu: [{
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.equals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "connected")
          }]
        });
      }
      async run(accessor) {
        const clipboardService = accessor.get(IClipboardService);
        if (that.connectionInfo) {
          const linkToOpen = that.getLinkToOpen(that.connectionInfo);
          clipboardService.writeText(linkToOpen.toString(true));
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: RemoteTunnelCommandIds.learnMore,
          title: RemoteTunnelCommandLabels.learnMore,
          category: REMOTE_TUNNEL_CATEGORY,
          menu: []
        });
      }
      async run(accessor) {
        const openerService = accessor.get(IOpenerService);
        await openerService.open("https://aka.ms/vscode-server-doc");
      }
    }));
  }
  getLinkToOpen(connectionInfo) {
    const workspace = this.workspaceContextService.getWorkspace();
    const folders = workspace.folders;
    let resource;
    if (folders.length === 1) {
      resource = folders[0].uri;
    } else if (workspace.configuration && !isUntitledWorkspace(workspace.configuration, this.environmentService)) {
      resource = workspace.configuration;
    }
    const link = URI.parse(connectionInfo.link);
    if (resource?.scheme === Schemas.file) {
      return joinPath(link, resource.path);
    }
    return joinPath(link, this.environmentService.userHome.path);
  }
  async showManageOptions() {
    const account = await this.remoteTunnelService.getMode();
    return new Promise((c, e) => {
      const disposables = new DisposableStore();
      const quickPick = this.quickInputService.createQuickPick({ useSeparators: true });
      quickPick.placeholder = localize("manage.placeholder", "Select a command to invoke");
      disposables.add(quickPick);
      const items = [];
      items.push({ id: RemoteTunnelCommandIds.learnMore, label: RemoteTunnelCommandLabels.learnMore });
      if (this.connectionInfo) {
        quickPick.title = this.connectionInfo.isAttached ? localize({ key: "manage.title.attached", comment: ["{0} is the tunnel name"] }, "Remote Tunnel Access enabled for {0} (launched externally)", this.connectionInfo.tunnelName) : localize({ key: "manage.title.orunning", comment: ["{0} is the tunnel name"] }, "Remote Tunnel Access enabled for {0}", this.connectionInfo.tunnelName);
        items.push({ id: RemoteTunnelCommandIds.copyToClipboard, label: RemoteTunnelCommandLabels.copyToClipboard, description: this.connectionInfo.domain });
      } else {
        quickPick.title = localize("manage.title.off", "Remote Tunnel Access not enabled");
      }
      items.push({ id: RemoteTunnelCommandIds.showLog, label: localize("manage.showLog", "Show Log") });
      items.push({ type: "separator" });
      items.push({ id: RemoteTunnelCommandIds.configure, label: localize("manage.tunnelName", "Change Tunnel Name"), description: this.connectionInfo?.tunnelName });
      items.push({ id: RemoteTunnelCommandIds.turnOff, label: RemoteTunnelCommandLabels.turnOff, description: account.active ? `${account.session.accountLabel} (${account.session.providerId})` : void 0 });
      quickPick.items = items;
      disposables.add(quickPick.onDidAccept(() => {
        if (quickPick.selectedItems[0] && quickPick.selectedItems[0].id) {
          this.commandService.executeCommand(quickPick.selectedItems[0].id);
        }
        quickPick.hide();
      }));
      disposables.add(quickPick.onDidHide(() => {
        disposables.dispose();
        c();
      }));
      quickPick.show();
    });
  }
};
RemoteTunnelWorkbenchContribution = __decorate([
  __param(0, IAuthenticationService),
  __param(1, IDialogService),
  __param(2, IExtensionService),
  __param(3, IContextKeyService),
  __param(4, IProductService),
  __param(5, IStorageService),
  __param(6, ILoggerService),
  __param(7, IQuickInputService),
  __param(8, INativeEnvironmentService),
  __param(9, IRemoteTunnelService),
  __param(10, ICommandService),
  __param(11, IWorkspaceContextService),
  __param(12, IProgressService),
  __param(13, INotificationService)
], RemoteTunnelWorkbenchContribution);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(
  RemoteTunnelWorkbenchContribution,
  3
  /* LifecyclePhase.Restored */
);
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
  type: "object",
  properties: {
    [CONFIGURATION_KEY_HOST_NAME]: {
      description: localize("remoteTunnelAccess.machineName", "The name under which the remote tunnel access is registered. If not set, the host name is used."),
      type: "string",
      scope: 1,
      ignoreSync: true,
      pattern: "^(\\w[\\w-]*)?$",
      patternErrorMessage: localize("remoteTunnelAccess.machineNameRegex", "The name must only consist of letters, numbers, underscore and dash. It must not start with a dash."),
      maxLength: 20,
      default: ""
    },
    [CONFIGURATION_KEY_PREVENT_SLEEP]: {
      description: localize("remoteTunnelAccess.preventSleep", "Prevent this computer from sleeping when remote tunnel access is turned on."),
      type: "boolean",
      scope: 1,
      default: false
    }
  }
});
export {
  REMOTE_TUNNEL_CATEGORY,
  REMOTE_TUNNEL_CONNECTION_STATE,
  REMOTE_TUNNEL_CONNECTION_STATE_KEY,
  RemoteTunnelWorkbenchContribution
};
//# sourceMappingURL=remoteTunnel.contribution.js.map
