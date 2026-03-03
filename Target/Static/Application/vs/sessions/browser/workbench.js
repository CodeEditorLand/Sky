var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "../../workbench/browser/style.js";
import "./media/style.css";
import { Disposable, toDisposable } from "../../base/common/lifecycle.js";
import { Emitter, Event, setGlobalLeakWarningThreshold } from "../../base/common/event.js";
import { getActiveDocument, getActiveElement, getClientArea, getWindowId, getWindows, isAncestorUsingFlowTo, size, Dimension, runWhenWindowIdle } from "../../base/browser/dom.js";
import { DeferredPromise, RunOnceScheduler } from "../../base/common/async.js";
import { isFullscreen, onDidChangeFullscreen, isChrome, isFirefox, isSafari } from "../../base/browser/browser.js";
import { mark } from "../../base/common/performance.js";
import { onUnexpectedError, setUnexpectedErrorHandler } from "../../base/common/errors.js";
import { isWindows, isLinux, isWeb, isNative, isMacintosh } from "../../base/common/platform.js";
import { IWorkbenchLayoutService, positionToString } from "../../workbench/services/layout/browser/layoutService.js";
import { Part } from "../../workbench/browser/part.js";
import { SerializableGrid } from "../../base/browser/ui/grid/grid.js";
import { IEditorGroupsService } from "../../workbench/services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../workbench/services/editor/common/editorService.js";
import { IPaneCompositePartService } from "../../workbench/services/panecomposite/browser/panecomposite.js";
import { IViewDescriptorService } from "../../workbench/common/views.js";
import { ITitleService } from "../../workbench/services/title/browser/titleService.js";
import { mainWindow } from "../../base/browser/window.js";
import { coalesce } from "../../base/common/arrays.js";
import { InstantiationService } from "../../platform/instantiation/common/instantiationService.js";
import { getSingletonServiceDescriptors } from "../../platform/instantiation/common/extensions.js";
import { ILifecycleService } from "../../workbench/services/lifecycle/common/lifecycle.js";
import { IStorageService, WillSaveStateReason } from "../../platform/storage/common/storage.js";
import { IConfigurationService } from "../../platform/configuration/common/configuration.js";
import { IHostService } from "../../workbench/services/host/browser/host.js";
import { IDialogService } from "../../platform/dialogs/common/dialogs.js";
import { INotificationService } from "../../platform/notification/common/notification.js";
import { IHoverService, WorkbenchHoverDelegate } from "../../platform/hover/browser/hover.js";
import { setHoverDelegateFactory } from "../../base/browser/ui/hover/hoverDelegateFactory.js";
import { setBaseLayerHoverDelegate } from "../../base/browser/ui/hover/hoverDelegate2.js";
import { Registry } from "../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions } from "../../workbench/common/contributions.js";
import { EditorExtensions } from "../../workbench/common/editor.js";
import { setARIAContainer } from "../../base/browser/ui/aria/aria.js";
import { FontMeasurements } from "../../editor/browser/config/fontMeasurements.js";
import { createBareFontInfoFromRawSettings } from "../../editor/common/config/fontInfoFromSettings.js";
import { toErrorMessage } from "../../base/common/errorMessage.js";
import { WorkbenchContextKeysHandler } from "../../workbench/browser/contextkeys.js";
import { PixelRatio } from "../../base/browser/pixelRatio.js";
import { AccessibilityProgressSignalScheduler } from "../../platform/accessibilitySignal/browser/progressAccessibilitySignalScheduler.js";
import { setProgressAccessibilitySignalScheduler } from "../../base/browser/ui/progressbar/progressAccessibilitySignal.js";
import { AccessibleViewRegistry } from "../../platform/accessibility/browser/accessibleViewRegistry.js";
import { NotificationAccessibleView } from "../../workbench/browser/parts/notifications/notificationAccessibleView.js";
import { NotificationsCenter } from "../../workbench/browser/parts/notifications/notificationsCenter.js";
import { NotificationsAlerts } from "../../workbench/browser/parts/notifications/notificationsAlerts.js";
import { NotificationsStatus } from "../../workbench/browser/parts/notifications/notificationsStatus.js";
import { registerNotificationCommands } from "../../workbench/browser/parts/notifications/notificationsCommands.js";
import { NotificationsToasts } from "../../workbench/browser/parts/notifications/notificationsToasts.js";
import { IMarkdownRendererService } from "../../platform/markdown/browser/markdownRenderer.js";
import { EditorMarkdownCodeBlockRenderer } from "../../editor/browser/widget/markdownRenderer/browser/editorMarkdownCodeBlockRenderer.js";
import { SyncDescriptor } from "../../platform/instantiation/common/descriptors.js";
import { TitleService } from "./parts/titlebarPart.js";
var LayoutClasses;
(function(LayoutClasses2) {
  LayoutClasses2["SIDEBAR_HIDDEN"] = "nosidebar";
  LayoutClasses2["MAIN_EDITOR_AREA_HIDDEN"] = "nomaineditorarea";
  LayoutClasses2["PANEL_HIDDEN"] = "nopanel";
  LayoutClasses2["AUXILIARYBAR_HIDDEN"] = "noauxiliarybar";
  LayoutClasses2["CHATBAR_HIDDEN"] = "nochatbar";
  LayoutClasses2["FULLSCREEN"] = "fullscreen";
  LayoutClasses2["MAXIMIZED"] = "maximized";
})(LayoutClasses || (LayoutClasses = {}));
class Workbench extends Disposable {
  static {
    __name(this, "Workbench");
  }
  get activeContainer() {
    return this.getContainerFromDocument(getActiveDocument());
  }
  get containers() {
    const containers = [];
    for (const { window } of getWindows()) {
      containers.push(this.getContainerFromDocument(window.document));
    }
    return containers;
  }
  getContainerFromDocument(targetDocument) {
    if (targetDocument === this.mainContainer.ownerDocument) {
      return this.mainContainer;
    } else {
      return targetDocument.body.getElementsByClassName("monaco-workbench")[0];
    }
  }
  get mainContainerDimension() {
    return this._mainContainerDimension;
  }
  get activeContainerDimension() {
    return this.getContainerDimension(this.activeContainer);
  }
  getContainerDimension(container) {
    if (container === this.mainContainer) {
      return this.mainContainerDimension;
    } else {
      return getClientArea(container);
    }
  }
  get mainContainerOffset() {
    return this.computeContainerOffset();
  }
  get activeContainerOffset() {
    return this.computeContainerOffset();
  }
  computeContainerOffset() {
    let top = 0;
    let quickPickTop = 0;
    if (this.isVisible("workbench.parts.titlebar", mainWindow)) {
      top = this.getPart(
        "workbench.parts.titlebar"
        /* Parts.TITLEBAR_PART */
      ).maximumHeight;
      quickPickTop = top;
    }
    return { top, quickPickTop };
  }
  //#endregion
  constructor(parent, options, serviceCollection, logService) {
    super();
    this.parent = parent;
    this.options = options;
    this.serviceCollection = serviceCollection;
    this.logService = logService;
    this._onWillShutdown = this._register(new Emitter());
    this.onWillShutdown = this._onWillShutdown.event;
    this._onDidShutdown = this._register(new Emitter());
    this.onDidShutdown = this._onDidShutdown.event;
    this._onDidChangeZenMode = this._register(new Emitter());
    this.onDidChangeZenMode = this._onDidChangeZenMode.event;
    this._onDidChangeMainEditorCenteredLayout = this._register(new Emitter());
    this.onDidChangeMainEditorCenteredLayout = this._onDidChangeMainEditorCenteredLayout.event;
    this._onDidChangePanelAlignment = this._register(new Emitter());
    this.onDidChangePanelAlignment = this._onDidChangePanelAlignment.event;
    this._onDidChangeWindowMaximized = this._register(new Emitter());
    this.onDidChangeWindowMaximized = this._onDidChangeWindowMaximized.event;
    this._onDidChangePanelPosition = this._register(new Emitter());
    this.onDidChangePanelPosition = this._onDidChangePanelPosition.event;
    this._onDidChangePartVisibility = this._register(new Emitter());
    this.onDidChangePartVisibility = this._onDidChangePartVisibility.event;
    this._onDidChangeNotificationsVisibility = this._register(new Emitter());
    this.onDidChangeNotificationsVisibility = this._onDidChangeNotificationsVisibility.event;
    this._onDidChangeAuxiliaryBarMaximized = this._register(new Emitter());
    this.onDidChangeAuxiliaryBarMaximized = this._onDidChangeAuxiliaryBarMaximized.event;
    this._onDidLayoutMainContainer = this._register(new Emitter());
    this.onDidLayoutMainContainer = this._onDidLayoutMainContainer.event;
    this._onDidLayoutActiveContainer = this._register(new Emitter());
    this.onDidLayoutActiveContainer = this._onDidLayoutActiveContainer.event;
    this._onDidLayoutContainer = this._register(new Emitter());
    this.onDidLayoutContainer = this._onDidLayoutContainer.event;
    this._onDidAddContainer = this._register(new Emitter());
    this.onDidAddContainer = this._onDidAddContainer.event;
    this._onDidChangeActiveContainer = this._register(new Emitter());
    this.onDidChangeActiveContainer = this._onDidChangeActiveContainer.event;
    this.mainContainer = document.createElement("div");
    this.parts = /* @__PURE__ */ new Map();
    this.partVisibility = {
      sidebar: true,
      auxiliaryBar: false,
      editor: false,
      panel: false,
      chatBar: true
    };
    this.mainWindowFullscreen = false;
    this.maximized = /* @__PURE__ */ new Set();
    this.restoredPromise = new DeferredPromise();
    this.whenRestored = this.restoredPromise.p;
    this.restored = false;
    this.openedDefaultEditors = false;
    this.previousUnexpectedError = { message: void 0, time: 0 };
    mark("code/willStartWorkbench");
    this.registerErrorHandler(logService);
  }
  //#region Error Handling
  registerErrorHandler(logService) {
    if (!isFirefox) {
      Error.stackTraceLimit = 100;
    }
    mainWindow.addEventListener("unhandledrejection", (event) => {
      onUnexpectedError(event.reason);
      event.preventDefault();
    });
    setUnexpectedErrorHandler((error) => this.handleUnexpectedError(error, logService));
  }
  handleUnexpectedError(error, logService) {
    const message = toErrorMessage(error, true);
    if (!message) {
      return;
    }
    const now = Date.now();
    if (message === this.previousUnexpectedError.message && now - this.previousUnexpectedError.time <= 1e3) {
      return;
    }
    this.previousUnexpectedError.time = now;
    this.previousUnexpectedError.message = message;
    logService.error(message);
  }
  //#endregion
  //#region Startup
  startup() {
    try {
      this._register(setGlobalLeakWarningThreshold(175));
      const instantiationService = this.initServices(this.serviceCollection);
      instantiationService.invokeFunction((accessor) => {
        const lifecycleService = accessor.get(ILifecycleService);
        const storageService = accessor.get(IStorageService);
        const configurationService = accessor.get(IConfigurationService);
        const hostService = accessor.get(IHostService);
        const hoverService = accessor.get(IHoverService);
        const dialogService = accessor.get(IDialogService);
        const notificationService = accessor.get(INotificationService);
        const markdownRendererService = accessor.get(IMarkdownRendererService);
        markdownRendererService.setDefaultCodeBlockRenderer(instantiationService.createInstance(EditorMarkdownCodeBlockRenderer));
        setHoverDelegateFactory((placement, enableInstantHover) => instantiationService.createInstance(WorkbenchHoverDelegate, placement, { instantHover: enableInstantHover }, {}));
        setBaseLayerHoverDelegate(hoverService);
        this.initLayout(accessor);
        Registry.as(WorkbenchExtensions.Workbench).start(accessor);
        Registry.as(EditorExtensions.EditorFactory).start(accessor);
        this._register(instantiationService.createInstance(WorkbenchContextKeysHandler));
        this.registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService);
        this.renderWorkbench(instantiationService, notificationService, storageService, configurationService);
        this.createWorkbenchLayout();
        this.createWorkbenchManagement(instantiationService);
        this.layout();
        this.restore(lifecycleService);
      });
      return instantiationService;
    } catch (error) {
      onUnexpectedError(error);
      throw error;
    }
  }
  initServices(serviceCollection) {
    serviceCollection.set(IWorkbenchLayoutService, this);
    serviceCollection.set(ITitleService, new SyncDescriptor(TitleService, []));
    const contributedServices = getSingletonServiceDescriptors();
    for (const [id, descriptor] of contributedServices) {
      serviceCollection.set(id, descriptor);
    }
    const instantiationService = new InstantiationService(serviceCollection, true);
    instantiationService.invokeFunction((accessor) => {
      const lifecycleService = accessor.get(ILifecycleService);
      lifecycleService.phase = 2;
    });
    return instantiationService;
  }
  registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService) {
    this._register(configurationService.onDidChangeConfiguration((e) => this.updateFontAliasing(e, configurationService)));
    if (isNative) {
      this._register(storageService.onWillSaveState((e) => {
        if (e.reason === WillSaveStateReason.SHUTDOWN) {
          this.storeFontInfo(storageService);
        }
      }));
    } else {
      this._register(lifecycleService.onWillShutdown(() => this.storeFontInfo(storageService)));
    }
    this._register(lifecycleService.onWillShutdown((event) => this._onWillShutdown.fire(event)));
    this._register(lifecycleService.onDidShutdown(() => {
      this._onDidShutdown.fire();
      this.dispose();
    }));
    this._register(hostService.onDidChangeFocus((focus) => {
      if (!focus) {
        storageService.flush();
      }
    }));
    this._register(dialogService.onWillShowDialog(() => this.mainContainer.classList.add("modal-dialog-visible")));
    this._register(dialogService.onDidShowDialog(() => this.mainContainer.classList.remove("modal-dialog-visible")));
  }
  updateFontAliasing(e, configurationService) {
    if (!isMacintosh) {
      return;
    }
    if (e && !e.affectsConfiguration("workbench.fontAliasing")) {
      return;
    }
    const aliasing = configurationService.getValue("workbench.fontAliasing");
    if (this.fontAliasing === aliasing) {
      return;
    }
    this.fontAliasing = aliasing;
    const fontAliasingValues = ["antialiased", "none", "auto"];
    this.mainContainer.classList.remove(...fontAliasingValues.map((value) => `monaco-font-aliasing-${value}`));
    if (fontAliasingValues.some((option) => option === aliasing)) {
      this.mainContainer.classList.add(`monaco-font-aliasing-${aliasing}`);
    }
  }
  restoreFontInfo(storageService, configurationService) {
    const storedFontInfoRaw = storageService.get(
      "editorFontInfo",
      -1
      /* StorageScope.APPLICATION */
    );
    if (storedFontInfoRaw) {
      try {
        const storedFontInfo = JSON.parse(storedFontInfoRaw);
        if (Array.isArray(storedFontInfo)) {
          FontMeasurements.restoreFontInfo(mainWindow, storedFontInfo);
        }
      } catch (err) {
      }
    }
    FontMeasurements.readFontInfo(mainWindow, createBareFontInfoFromRawSettings(configurationService.getValue("editor"), PixelRatio.getInstance(mainWindow).value));
  }
  storeFontInfo(storageService) {
    const serializedFontInfo = FontMeasurements.serializeFontInfo(mainWindow);
    if (serializedFontInfo) {
      storageService.store(
        "editorFontInfo",
        JSON.stringify(serializedFontInfo),
        -1,
        1
        /* StorageTarget.MACHINE */
      );
    }
  }
  //#endregion
  renderWorkbench(instantiationService, notificationService, storageService, configurationService) {
    setARIAContainer(this.mainContainer);
    setProgressAccessibilitySignalScheduler((msDelayTime, msLoopTime) => instantiationService.createInstance(AccessibilityProgressSignalScheduler, msDelayTime, msLoopTime));
    const platformClass = isWindows ? "windows" : isLinux ? "linux" : "mac";
    const workbenchClasses = coalesce([
      "monaco-workbench",
      "agent-sessions-workbench",
      platformClass,
      isWeb ? "web" : void 0,
      isChrome ? "chromium" : isFirefox ? "firefox" : isSafari ? "safari" : void 0,
      ...this.getLayoutClasses(),
      ...this.options?.extraClasses ? this.options.extraClasses : []
    ]);
    this.mainContainer.classList.add(...workbenchClasses);
    this.updateFontAliasing(void 0, configurationService);
    this.restoreFontInfo(storageService, configurationService);
    for (const { id, role, classes } of [
      { id: "workbench.parts.titlebar", role: "none", classes: ["titlebar"] },
      { id: "workbench.parts.sidebar", role: "none", classes: ["sidebar", "left"] },
      { id: "workbench.parts.auxiliarybar", role: "none", classes: ["auxiliarybar", "basepanel", "right"] },
      { id: "workbench.parts.chatbar", role: "main", classes: ["chatbar", "basepanel", "right"] },
      { id: "workbench.parts.panel", role: "none", classes: ["panel", "basepanel", positionToString(this.getPanelPosition())] }
    ]) {
      const partContainer = this.createPartContainer(id, role, classes);
      mark(`code/willCreatePart/${id}`);
      this.getPart(id).create(partContainer);
      mark(`code/didCreatePart/${id}`);
    }
    this.createHiddenEditorPart();
    this.createNotificationsHandlers(instantiationService, notificationService);
    this.parent.appendChild(this.mainContainer);
  }
  createNotificationsHandlers(instantiationService, notificationService) {
    const notificationsCenter = this._register(instantiationService.createInstance(NotificationsCenter, this.mainContainer, notificationService.model));
    const notificationsToasts = this._register(instantiationService.createInstance(NotificationsToasts, this.mainContainer, notificationService.model));
    this._register(instantiationService.createInstance(NotificationsAlerts, notificationService.model));
    const notificationsStatus = this._register(instantiationService.createInstance(NotificationsStatus, notificationService.model));
    this._register(notificationsCenter.onDidChangeVisibility(() => {
      notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
      notificationsToasts.update(notificationsCenter.isVisible);
    }));
    this._register(notificationsToasts.onDidChangeVisibility(() => {
      notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
    }));
    registerNotificationCommands(notificationsCenter, notificationsToasts, notificationService.model);
    AccessibleViewRegistry.register(new NotificationAccessibleView());
    this.registerNotifications({
      onDidChangeNotificationsVisibility: Event.map(Event.any(notificationsToasts.onDidChangeVisibility, notificationsCenter.onDidChangeVisibility), () => notificationsToasts.isVisible || notificationsCenter.isVisible)
    });
  }
  createPartContainer(id, role, classes) {
    const part = document.createElement("div");
    part.classList.add("part", ...classes);
    part.id = id;
    part.setAttribute("role", role);
    return part;
  }
  createHiddenEditorPart() {
    const editorPartContainer = document.createElement("div");
    editorPartContainer.classList.add("part", "editor");
    editorPartContainer.id = "workbench.parts.editor";
    editorPartContainer.setAttribute("role", "main");
    editorPartContainer.style.display = "none";
    mark("code/willCreatePart/workbench.parts.editor");
    this.getPart(
      "workbench.parts.editor"
      /* Parts.EDITOR_PART */
    ).create(editorPartContainer, { restorePreviousState: false });
    mark("code/didCreatePart/workbench.parts.editor");
    this.mainContainer.appendChild(editorPartContainer);
  }
  restore(lifecycleService) {
    mark("code/didStartWorkbench");
    performance.measure("perf: workbench create & restore", "code/didLoadWorkbenchMain", "code/didStartWorkbench");
    this.restoreParts();
    lifecycleService.phase = 3;
    this.setRestored();
    const eventuallyPhaseScheduler = this._register(new RunOnceScheduler(() => {
      this._register(runWhenWindowIdle(mainWindow, () => lifecycleService.phase = 4, 2500));
    }, 2500));
    eventuallyPhaseScheduler.schedule();
  }
  restoreParts() {
    const partsToRestore = [
      { location: 0, visible: this.partVisibility.sidebar },
      { location: 1, visible: this.partVisibility.panel },
      { location: 2, visible: this.partVisibility.auxiliaryBar },
      { location: 3, visible: this.partVisibility.chatBar }
    ];
    for (const { location, visible } of partsToRestore) {
      if (visible) {
        const defaultViewContainer = this.viewDescriptorService.getDefaultViewContainer(location);
        if (defaultViewContainer) {
          this.paneCompositeService.openPaneComposite(defaultViewContainer.id, location);
        }
      }
    }
  }
  //#endregion
  //#region Initialization
  initLayout(accessor) {
    this.editorGroupService = accessor.get(IEditorGroupsService);
    this.editorService = accessor.get(IEditorService);
    this.paneCompositeService = accessor.get(IPaneCompositePartService);
    this.viewDescriptorService = accessor.get(IViewDescriptorService);
    accessor.get(ITitleService);
    this.registerLayoutListeners();
    this._register(this.editorService.onWillOpenEditor(() => {
      if (!this.partVisibility.editor) {
        this.setEditorHidden(false);
      }
    }));
    this._register(this.editorService.onDidCloseEditor(() => {
      if (this.partVisibility.editor && this.areAllGroupsEmpty()) {
        this.setEditorHidden(true);
      }
    }));
    this._mainContainerDimension = getClientArea(this.parent, new Dimension(800, 600));
  }
  areAllGroupsEmpty() {
    for (const group of this.editorGroupService.groups) {
      if (!group.isEmpty) {
        return false;
      }
    }
    return true;
  }
  registerLayoutListeners() {
    this._register(onDidChangeFullscreen((windowId) => {
      if (windowId === getWindowId(mainWindow)) {
        this.mainWindowFullscreen = isFullscreen(mainWindow);
        this.updateFullscreenClass();
        this.layout();
      }
    }));
  }
  updateFullscreenClass() {
    if (this.mainWindowFullscreen) {
      this.mainContainer.classList.add(LayoutClasses.FULLSCREEN);
    } else {
      this.mainContainer.classList.remove(LayoutClasses.FULLSCREEN);
    }
  }
  //#endregion
  //#region Workbench Layout Creation
  createWorkbenchLayout() {
    const titleBar = this.getPart(
      "workbench.parts.titlebar"
      /* Parts.TITLEBAR_PART */
    );
    const editorPart = this.getPart(
      "workbench.parts.editor"
      /* Parts.EDITOR_PART */
    );
    const panelPart = this.getPart(
      "workbench.parts.panel"
      /* Parts.PANEL_PART */
    );
    const auxiliaryBarPart = this.getPart(
      "workbench.parts.auxiliarybar"
      /* Parts.AUXILIARYBAR_PART */
    );
    const sideBar = this.getPart(
      "workbench.parts.sidebar"
      /* Parts.SIDEBAR_PART */
    );
    const chatBarPart = this.getPart(
      "workbench.parts.chatbar"
      /* Parts.CHATBAR_PART */
    );
    this.titleBarPartView = titleBar;
    this.sideBarPartView = sideBar;
    this.panelPartView = panelPart;
    this.auxiliaryBarPartView = auxiliaryBarPart;
    this.chatBarPartView = chatBarPart;
    const viewMap = {
      [
        "workbench.parts.titlebar"
        /* Parts.TITLEBAR_PART */
      ]: this.titleBarPartView,
      [
        "workbench.parts.panel"
        /* Parts.PANEL_PART */
      ]: this.panelPartView,
      [
        "workbench.parts.sidebar"
        /* Parts.SIDEBAR_PART */
      ]: this.sideBarPartView,
      [
        "workbench.parts.auxiliarybar"
        /* Parts.AUXILIARYBAR_PART */
      ]: this.auxiliaryBarPartView,
      [
        "workbench.parts.chatbar"
        /* Parts.CHATBAR_PART */
      ]: this.chatBarPartView
    };
    const fromJSON = /* @__PURE__ */ __name(({ type }) => viewMap[type], "fromJSON");
    const workbenchGrid = SerializableGrid.deserialize(this.createGridDescriptor(), { fromJSON }, { proportionalLayout: false });
    this.mainContainer.prepend(workbenchGrid.element);
    this.mainContainer.setAttribute("role", "application");
    this.workbenchGrid = workbenchGrid;
    this.workbenchGrid.edgeSnapping = this.mainWindowFullscreen;
    for (const part of [titleBar, panelPart, sideBar, auxiliaryBarPart, chatBarPart]) {
      this._register(part.onDidVisibilityChange((visible) => {
        if (part === sideBar) {
          this.setSideBarHidden(!visible);
        } else if (part === panelPart) {
          this.setPanelHidden(!visible);
        } else if (part === auxiliaryBarPart) {
          this.setAuxiliaryBarHidden(!visible);
        } else if (part === chatBarPart) {
          this.setChatBarHidden(!visible);
        }
        this._onDidChangePartVisibility.fire({ partId: part.getId(), visible });
        this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
      }));
    }
    this._register(editorPart.onDidVisibilityChange((visible) => {
      this.setEditorHidden(!visible);
      this._onDidChangePartVisibility.fire({ partId: editorPart.getId(), visible });
      this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
    }));
  }
  createWorkbenchManagement(_instantiationService) {
  }
  /**
   * Creates the grid descriptor for the Agent Sessions layout.
   * Editor is NOT included - it's rendered as a modal overlay.
   *
   * Structure (horizontal orientation):
   * - Sidebar (left, spans full height from top to bottom)
   * - Right section (vertical):
   *   - Titlebar (top of right section)
   *   - Top right (horizontal): Chat Bar | Auxiliary Bar
   *   - Panel (below chat and auxiliary bar only)
   */
  createGridDescriptor() {
    const { width, height } = this._mainContainerDimension;
    const sideBarSize = 300;
    const auxiliaryBarSize = 300;
    const panelSize = 300;
    const titleBarHeight = this.titleBarPartView?.minimumHeight ?? 30;
    const rightSectionWidth = Math.max(0, width - sideBarSize);
    const chatBarWidth = Math.max(0, rightSectionWidth - auxiliaryBarSize);
    const contentHeight = height - titleBarHeight;
    const topRightHeight = contentHeight - panelSize;
    const titleBarNode = {
      type: "leaf",
      data: {
        type: "workbench.parts.titlebar"
        /* Parts.TITLEBAR_PART */
      },
      size: titleBarHeight,
      visible: true
    };
    const sideBarNode = {
      type: "leaf",
      data: {
        type: "workbench.parts.sidebar"
        /* Parts.SIDEBAR_PART */
      },
      size: sideBarSize,
      visible: this.partVisibility.sidebar
    };
    const auxiliaryBarNode = {
      type: "leaf",
      data: {
        type: "workbench.parts.auxiliarybar"
        /* Parts.AUXILIARYBAR_PART */
      },
      size: auxiliaryBarSize,
      visible: this.partVisibility.auxiliaryBar
    };
    const chatBarNode = {
      type: "leaf",
      data: {
        type: "workbench.parts.chatbar"
        /* Parts.CHATBAR_PART */
      },
      size: chatBarWidth,
      visible: this.partVisibility.chatBar
    };
    const panelNode = {
      type: "leaf",
      data: {
        type: "workbench.parts.panel"
        /* Parts.PANEL_PART */
      },
      size: panelSize,
      visible: this.partVisibility.panel
    };
    const topRightSection = {
      type: "branch",
      data: [chatBarNode, auxiliaryBarNode],
      size: topRightHeight
    };
    const rightSection = {
      type: "branch",
      data: [titleBarNode, topRightSection, panelNode],
      size: rightSectionWidth
    };
    const result = {
      root: {
        type: "branch",
        size: height,
        data: [
          sideBarNode,
          rightSection
        ]
      },
      orientation: 1,
      width,
      height
    };
    return result;
  }
  //#endregion
  //#region Layout Methods
  layout() {
    this._mainContainerDimension = getClientArea(this.mainWindowFullscreen ? mainWindow.document.body : this.parent);
    this.logService.trace(`Workbench#layout, height: ${this._mainContainerDimension.height}, width: ${this._mainContainerDimension.width}`);
    size(this.mainContainer, this._mainContainerDimension.width, this._mainContainerDimension.height);
    this.workbenchGrid.layout(this._mainContainerDimension.width, this._mainContainerDimension.height);
    this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
  }
  handleContainerDidLayout(container, dimension) {
    this._onDidLayoutContainer.fire({ container, dimension });
    if (container === this.mainContainer) {
      this._onDidLayoutMainContainer.fire(dimension);
    }
    if (container === this.activeContainer) {
      this._onDidLayoutActiveContainer.fire(dimension);
    }
  }
  getLayoutClasses() {
    return coalesce([
      !this.partVisibility.sidebar ? LayoutClasses.SIDEBAR_HIDDEN : void 0,
      !this.partVisibility.editor ? LayoutClasses.MAIN_EDITOR_AREA_HIDDEN : void 0,
      !this.partVisibility.panel ? LayoutClasses.PANEL_HIDDEN : void 0,
      !this.partVisibility.auxiliaryBar ? LayoutClasses.AUXILIARYBAR_HIDDEN : void 0,
      !this.partVisibility.chatBar ? LayoutClasses.CHATBAR_HIDDEN : void 0,
      this.mainWindowFullscreen ? LayoutClasses.FULLSCREEN : void 0
    ]);
  }
  //#endregion
  //#region Part Management
  registerPart(part) {
    const id = part.getId();
    this.parts.set(id, part);
    return toDisposable(() => this.parts.delete(id));
  }
  getPart(key) {
    const part = this.parts.get(key);
    if (!part) {
      throw new Error(`Unknown part ${key}`);
    }
    return part;
  }
  hasFocus(part) {
    const container = this.getContainer(mainWindow, part);
    if (!container) {
      return false;
    }
    const activeElement = getActiveElement();
    if (!activeElement) {
      return false;
    }
    return isAncestorUsingFlowTo(activeElement, container);
  }
  focusPart(part, targetWindow = mainWindow) {
    switch (part) {
      case "workbench.parts.editor":
        this.editorGroupService.activeGroup.focus();
        break;
      case "workbench.parts.panel":
        this.paneCompositeService.getActivePaneComposite(
          1
          /* ViewContainerLocation.Panel */
        )?.focus();
        break;
      case "workbench.parts.sidebar":
        this.paneCompositeService.getActivePaneComposite(
          0
          /* ViewContainerLocation.Sidebar */
        )?.focus();
        break;
      case "workbench.parts.auxiliarybar":
        this.paneCompositeService.getActivePaneComposite(
          2
          /* ViewContainerLocation.AuxiliaryBar */
        )?.focus();
        break;
      case "workbench.parts.chatbar":
        this.paneCompositeService.getActivePaneComposite(
          3
          /* ViewContainerLocation.ChatBar */
        )?.focus();
        break;
      default: {
        const container = this.getContainer(targetWindow, part);
        container?.focus();
      }
    }
  }
  focus() {
    this.focusPart(
      "workbench.parts.chatbar"
      /* Parts.CHATBAR_PART */
    );
  }
  getContainer(targetWindow, part) {
    if (typeof part === "undefined") {
      return this.getContainerFromDocument(targetWindow.document);
    }
    if (targetWindow === mainWindow) {
      return this.parts.get(part)?.getContainer();
    }
    if (part === "workbench.parts.editor") {
      const container = this.getContainerFromDocument(targetWindow.document);
      const partCandidate = this.editorGroupService.getPart(container);
      if (partCandidate instanceof Part) {
        return partCandidate.getContainer();
      }
    }
    return void 0;
  }
  whenContainerStylesLoaded(_window) {
    return void 0;
  }
  //#endregion
  //#region Part Visibility
  isActivityBarHidden() {
    return true;
  }
  isVisible(part, targetWindow) {
    switch (part) {
      case "workbench.parts.titlebar":
        return true;
      // Always visible
      case "workbench.parts.sidebar":
        return this.partVisibility.sidebar;
      case "workbench.parts.auxiliarybar":
        return this.partVisibility.auxiliaryBar;
      case "workbench.parts.editor":
        return this.partVisibility.editor;
      case "workbench.parts.panel":
        return this.partVisibility.panel;
      case "workbench.parts.chatbar":
        return this.partVisibility.chatBar;
      case "workbench.parts.activitybar":
      case "workbench.parts.statusbar":
      case "workbench.parts.banner":
      default:
        return false;
    }
  }
  setPartHidden(hidden, part) {
    switch (part) {
      case "workbench.parts.sidebar":
        this.setSideBarHidden(hidden);
        break;
      case "workbench.parts.auxiliarybar":
        this.setAuxiliaryBarHidden(hidden);
        break;
      case "workbench.parts.editor":
        this.setEditorHidden(hidden);
        break;
      case "workbench.parts.panel":
        this.setPanelHidden(hidden);
        break;
      case "workbench.parts.chatbar":
        this.setChatBarHidden(hidden);
        break;
    }
  }
  setSideBarHidden(hidden) {
    if (this.partVisibility.sidebar === !hidden) {
      return;
    }
    this.partVisibility.sidebar = !hidden;
    this.mainContainer.classList.toggle(LayoutClasses.SIDEBAR_HIDDEN, hidden);
    this.workbenchGrid.setViewVisible(this.sideBarPartView, !hidden);
    if (hidden && this.paneCompositeService.getActivePaneComposite(
      0
      /* ViewContainerLocation.Sidebar */
    )) {
      this.paneCompositeService.hideActivePaneComposite(
        0
        /* ViewContainerLocation.Sidebar */
      );
    }
    if (!hidden && !this.paneCompositeService.getActivePaneComposite(
      0
      /* ViewContainerLocation.Sidebar */
    )) {
      const viewletToOpen = this.paneCompositeService.getLastActivePaneCompositeId(
        0
        /* ViewContainerLocation.Sidebar */
      ) ?? this.viewDescriptorService.getDefaultViewContainer(
        0
        /* ViewContainerLocation.Sidebar */
      )?.id;
      if (viewletToOpen) {
        this.paneCompositeService.openPaneComposite(
          viewletToOpen,
          0
          /* ViewContainerLocation.Sidebar */
        );
      }
    }
  }
  setAuxiliaryBarHidden(hidden) {
    if (this.partVisibility.auxiliaryBar === !hidden) {
      return;
    }
    this.partVisibility.auxiliaryBar = !hidden;
    this.mainContainer.classList.toggle(LayoutClasses.AUXILIARYBAR_HIDDEN, hidden);
    this.workbenchGrid.setViewVisible(this.auxiliaryBarPartView, !hidden);
    if (hidden && this.paneCompositeService.getActivePaneComposite(
      2
      /* ViewContainerLocation.AuxiliaryBar */
    )) {
      this.paneCompositeService.hideActivePaneComposite(
        2
        /* ViewContainerLocation.AuxiliaryBar */
      );
    }
    if (!hidden && !this.paneCompositeService.getActivePaneComposite(
      2
      /* ViewContainerLocation.AuxiliaryBar */
    )) {
      const paneCompositeToOpen = this.paneCompositeService.getLastActivePaneCompositeId(
        2
        /* ViewContainerLocation.AuxiliaryBar */
      ) ?? this.viewDescriptorService.getDefaultViewContainer(
        2
        /* ViewContainerLocation.AuxiliaryBar */
      )?.id;
      if (paneCompositeToOpen) {
        this.paneCompositeService.openPaneComposite(
          paneCompositeToOpen,
          2
          /* ViewContainerLocation.AuxiliaryBar */
        );
      }
    }
  }
  setEditorHidden(hidden) {
    if (this.partVisibility.editor === !hidden) {
      return;
    }
    this.partVisibility.editor = !hidden;
    this.mainContainer.classList.toggle(LayoutClasses.MAIN_EDITOR_AREA_HIDDEN, hidden);
  }
  setPanelHidden(hidden) {
    if (this.partVisibility.panel === !hidden) {
      return;
    }
    if (hidden && this.workbenchGrid.hasMaximizedView()) {
      this.workbenchGrid.exitMaximizedView();
    }
    this.partVisibility.panel = !hidden;
    this.mainContainer.classList.toggle(LayoutClasses.PANEL_HIDDEN, hidden);
    this.workbenchGrid.setViewVisible(this.panelPartView, !hidden);
    if (hidden && this.paneCompositeService.getActivePaneComposite(
      1
      /* ViewContainerLocation.Panel */
    )) {
      this.paneCompositeService.hideActivePaneComposite(
        1
        /* ViewContainerLocation.Panel */
      );
    }
    if (!hidden && !this.paneCompositeService.getActivePaneComposite(
      1
      /* ViewContainerLocation.Panel */
    )) {
      const panelToOpen = this.paneCompositeService.getLastActivePaneCompositeId(
        1
        /* ViewContainerLocation.Panel */
      ) ?? this.viewDescriptorService.getDefaultViewContainer(
        1
        /* ViewContainerLocation.Panel */
      )?.id;
      if (panelToOpen) {
        this.paneCompositeService.openPaneComposite(
          panelToOpen,
          1
          /* ViewContainerLocation.Panel */
        );
      }
    }
  }
  setChatBarHidden(hidden) {
    if (this.partVisibility.chatBar === !hidden) {
      return;
    }
    this.partVisibility.chatBar = !hidden;
    this.mainContainer.classList.toggle(LayoutClasses.CHATBAR_HIDDEN, hidden);
    this.workbenchGrid.setViewVisible(this.chatBarPartView, !hidden);
    if (hidden && this.paneCompositeService.getActivePaneComposite(
      3
      /* ViewContainerLocation.ChatBar */
    )) {
      this.paneCompositeService.hideActivePaneComposite(
        3
        /* ViewContainerLocation.ChatBar */
      );
    }
    if (!hidden && !this.paneCompositeService.getActivePaneComposite(
      3
      /* ViewContainerLocation.ChatBar */
    )) {
      const paneCompositeToOpen = this.paneCompositeService.getLastActivePaneCompositeId(
        3
        /* ViewContainerLocation.ChatBar */
      ) ?? this.viewDescriptorService.getDefaultViewContainer(
        3
        /* ViewContainerLocation.ChatBar */
      )?.id;
      if (paneCompositeToOpen) {
        this.paneCompositeService.openPaneComposite(
          paneCompositeToOpen,
          3
          /* ViewContainerLocation.ChatBar */
        );
      }
    }
  }
  //#endregion
  //#region Position Methods (Fixed - Not Configurable)
  getSideBarPosition() {
    return 0;
  }
  getPanelPosition() {
    return 2;
  }
  setPanelPosition(_position) {
  }
  getPanelAlignment() {
    return "justify";
  }
  setPanelAlignment(_alignment) {
  }
  //#endregion
  //#region Size Methods
  getSize(part) {
    const view = this.getPartView(part);
    if (!view) {
      return { width: 0, height: 0 };
    }
    return this.workbenchGrid.getViewSize(view);
  }
  setSize(part, size2) {
    const view = this.getPartView(part);
    if (view) {
      this.workbenchGrid.resizeView(view, size2);
    }
  }
  resizePart(part, sizeChangeWidth, sizeChangeHeight) {
    const view = this.getPartView(part);
    if (!view) {
      return;
    }
    const currentSize = this.workbenchGrid.getViewSize(view);
    this.workbenchGrid.resizeView(view, {
      width: currentSize.width + sizeChangeWidth,
      height: currentSize.height + sizeChangeHeight
    });
  }
  getPartView(part) {
    switch (part) {
      case "workbench.parts.titlebar":
        return this.titleBarPartView;
      case "workbench.parts.sidebar":
        return this.sideBarPartView;
      case "workbench.parts.auxiliarybar":
        return this.auxiliaryBarPartView;
      case "workbench.parts.editor":
        return void 0;
      // Editor is not in the grid, it's a modal
      case "workbench.parts.panel":
        return this.panelPartView;
      case "workbench.parts.chatbar":
        return this.chatBarPartView;
      default:
        return void 0;
    }
  }
  getMaximumEditorDimensions(_container) {
    const sidebarWidth = this.partVisibility.sidebar ? this.workbenchGrid.getViewSize(this.sideBarPartView).width : 0;
    const auxiliaryBarWidth = this.partVisibility.auxiliaryBar ? this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).width : 0;
    const panelHeight = this.partVisibility.panel ? this.workbenchGrid.getViewSize(this.panelPartView).height : 0;
    const titleBarHeight = this.workbenchGrid.getViewSize(this.titleBarPartView).height;
    return new Dimension(this._mainContainerDimension.width - sidebarWidth - auxiliaryBarWidth, this._mainContainerDimension.height - titleBarHeight - panelHeight);
  }
  //#endregion
  //#region Unsupported Features (No-ops)
  toggleMaximizedPanel() {
    if (!this.workbenchGrid) {
      return;
    }
    if (this.isPanelMaximized()) {
      this.workbenchGrid.exitMaximizedView();
    } else {
      this.workbenchGrid.maximizeView(this.panelPartView, [this.titleBarPartView, this.sideBarPartView]);
    }
  }
  isPanelMaximized() {
    if (!this.workbenchGrid) {
      return false;
    }
    return this.workbenchGrid.isViewMaximized(this.panelPartView);
  }
  toggleMaximizedAuxiliaryBar() {
  }
  setAuxiliaryBarMaximized(_maximized) {
    return false;
  }
  isAuxiliaryBarMaximized() {
    return false;
  }
  toggleZenMode() {
  }
  toggleMenuBar() {
  }
  isMainEditorLayoutCentered() {
    return false;
  }
  centerMainEditorLayout(_active) {
  }
  hasMainWindowBorder() {
    return false;
  }
  getMainWindowBorderRadius() {
    return void 0;
  }
  //#endregion
  //#region Window Maximized State
  isWindowMaximized(targetWindow) {
    return this.maximized.has(getWindowId(targetWindow));
  }
  updateWindowMaximizedState(targetWindow, maximized) {
    const windowId = getWindowId(targetWindow);
    if (maximized) {
      this.maximized.add(windowId);
      if (targetWindow === mainWindow) {
        this.mainContainer.classList.add(LayoutClasses.MAXIMIZED);
      }
    } else {
      this.maximized.delete(windowId);
      if (targetWindow === mainWindow) {
        this.mainContainer.classList.remove(LayoutClasses.MAXIMIZED);
      }
    }
    this._onDidChangeWindowMaximized.fire({ windowId, maximized });
  }
  //#endregion
  //#region Neighbor Parts
  getVisibleNeighborPart(part, direction) {
    if (!this.workbenchGrid) {
      return void 0;
    }
    const view = this.getPartView(part);
    if (!view) {
      return void 0;
    }
    const neighbor = this.workbenchGrid.getNeighborViews(view, direction, false);
    if (neighbor.length === 0) {
      return void 0;
    }
    const neighborView = neighbor[0];
    if (neighborView === this.titleBarPartView) {
      return "workbench.parts.titlebar";
    }
    if (neighborView === this.sideBarPartView) {
      return "workbench.parts.sidebar";
    }
    if (neighborView === this.auxiliaryBarPartView) {
      return "workbench.parts.auxiliarybar";
    }
    if (neighborView === this.panelPartView) {
      return "workbench.parts.panel";
    }
    if (neighborView === this.chatBarPartView) {
      return "workbench.parts.chatbar";
    }
    return void 0;
  }
  //#endregion
  //#region Restore
  isRestored() {
    return this.restored;
  }
  setRestored() {
    this.restored = true;
    this.restoredPromise.complete();
  }
  //#endregion
  //#region Notifications Registration
  registerNotifications(delegate) {
    this._register(delegate.onDidChangeNotificationsVisibility((visible) => this._onDidChangeNotificationsVisibility.fire(visible)));
  }
}
export {
  Workbench
};
//# sourceMappingURL=workbench.js.map
