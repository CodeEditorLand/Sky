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
var BrowserEditor_1;
import "./media/browser.css";
import { localize } from "../../../../nls.js";
import { $, addDisposableListener, EventType, registerExternalFocusChecker } from "../../../../base/browser/dom.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { RawContextKey, IContextKeyService, ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { AUX_WINDOW_GROUP, IEditorService } from "../../../services/editor/common/editorService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { BrowserViewUri } from "../../../../platform/browserView/common/browserViewUri.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { BrowserNewPageLocation } from "../../../../platform/browserView/common/browserView.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { BrowserOverlayManager, BrowserOverlayType } from "./overlayManager.js";
import { getZoomFactor, onDidChangeZoomLevel } from "../../../../base/browser/browser.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { WorkbenchHoverDelegate } from "../../../../platform/hover/browser/hover.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { IBrowserElementsService } from "../../../services/browserElements/browser/browserElementsService.js";
import { IChatWidgetService } from "../../chat/browser/chat.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { BrowserFindWidget, CONTEXT_BROWSER_FIND_WIDGET_FOCUSED, CONTEXT_BROWSER_FIND_WIDGET_VISIBLE } from "./browserFindWidget.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { encodeBase64 } from "../../../../base/common/buffer.js";
import { getDisplayNameFromOuterHTML } from "../../../../platform/browserElements/common/browserElements.js";
import { logBrowserOpen } from "../../../../platform/browserView/common/browserViewTelemetry.js";
import { URI } from "../../../../base/common/uri.js";
import { ChatConfiguration } from "../../chat/common/constants.js";
import { Event } from "../../../../base/common/event.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
const CONTEXT_BROWSER_CAN_GO_BACK = new RawContextKey("browserCanGoBack", false, localize("browser.canGoBack", "Whether the browser can go back"));
const CONTEXT_BROWSER_CAN_GO_FORWARD = new RawContextKey("browserCanGoForward", false, localize("browser.canGoForward", "Whether the browser can go forward"));
const CONTEXT_BROWSER_FOCUSED = new RawContextKey("browserFocused", true, localize("browser.editorFocused", "Whether the browser editor is focused"));
const CONTEXT_BROWSER_STORAGE_SCOPE = new RawContextKey("browserStorageScope", "", localize("browser.storageScope", "The storage scope of the current browser view"));
const CONTEXT_BROWSER_HAS_URL = new RawContextKey("browserHasUrl", false, localize("browser.hasUrl", "Whether the browser has a URL loaded"));
const CONTEXT_BROWSER_HAS_ERROR = new RawContextKey("browserHasError", false, localize("browser.hasError", "Whether the browser has a load error"));
const CONTEXT_BROWSER_DEVTOOLS_OPEN = new RawContextKey("browserDevToolsOpen", false, localize("browser.devToolsOpen", "Whether developer tools are open for the current browser view"));
const CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE = new RawContextKey("browserElementSelectionActive", false, localize("browser.elementSelectionActive", "Whether element selection is currently active"));
const CONTEXT_BROWSER_CAN_ZOOM_IN = new RawContextKey("browserCanZoomIn", true, localize("browser.canZoomIn", "Whether the browser can zoom in further"));
const CONTEXT_BROWSER_CAN_ZOOM_OUT = new RawContextKey("browserCanZoomOut", true, localize("browser.canZoomOut", "Whether the browser can zoom out further"));
const canShareBrowserWithAgentContext = ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.has(`config.${ChatConfiguration.AgentEnabled}`), ContextKeyExpr.has(`config.workbench.browser.enableChatTools`));
function watchForAgentSharingContextChanges(contextKeyService) {
  const agentSharingKeys = new Set(canShareBrowserWithAgentContext.keys());
  return Event.filter(contextKeyService.onDidChangeContext, (e) => e.affectsSome(agentSharingKeys));
}
__name(watchForAgentSharingContextChanges, "watchForAgentSharingContextChanges");
const originalHtmlElementFocus = HTMLElement.prototype.focus;
class BrowserNavigationBar extends Disposable {
  static {
    __name(this, "BrowserNavigationBar");
  }
  constructor(editor, container, instantiationService, scopedContextKeyService, configurationService) {
    super();
    const hoverDelegate = this._register(instantiationService.createInstance(WorkbenchHoverDelegate, "element", void 0, { position: {
      hoverPosition: 3
      /* HoverPosition.ABOVE */
    } }));
    const navContainer = $(".browser-nav-toolbar");
    const scopedInstantiationService = instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService]));
    const navToolbar = this._register(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, navContainer, MenuId.BrowserNavigationToolbar, {
      hoverDelegate,
      highlightToggledItems: true,
      // Render all actions inline regardless of group
      toolbarOptions: { primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup"), useSeparatorsInPrimaryActions: true },
      menuOptions: { shouldForwardArgs: true }
    }));
    const urlContainer = $(".browser-url-container");
    this._urlInput = $("input.browser-url-input");
    this._urlInput.type = "text";
    this._urlInput.placeholder = localize("browser.urlPlaceholder", "Enter a URL");
    this._shareButtonContainer = $(".browser-share-toggle-container");
    this._shareButton = this._register(new Button(this._shareButtonContainer, {
      supportIcons: true,
      title: localize("browser.shareWithAgent", "Share with Agent"),
      small: true,
      hoverDelegate
    }));
    this._shareButton.element.classList.add("browser-share-toggle");
    this._shareButton.label = "$(agent)";
    urlContainer.appendChild(this._urlInput);
    urlContainer.appendChild(this._shareButtonContainer);
    const actionsContainer = $(".browser-actions-toolbar");
    const actionsToolbar = this._register(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, actionsContainer, MenuId.BrowserActionsToolbar, {
      hoverDelegate,
      highlightToggledItems: true,
      toolbarOptions: { primaryGroup: /* @__PURE__ */ __name((group) => group.startsWith("actions"), "primaryGroup"), useSeparatorsInPrimaryActions: true },
      menuOptions: { shouldForwardArgs: true }
    }));
    navToolbar.context = editor;
    actionsToolbar.context = editor;
    container.appendChild(navContainer);
    container.appendChild(urlContainer);
    container.appendChild(actionsContainer);
    this._register(addDisposableListener(this._urlInput, EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter") {
        const url = this._urlInput.value.trim();
        if (url) {
          editor.navigateToUrl(url);
        }
      }
    }));
    this._register(addDisposableListener(this._urlInput, EventType.FOCUS, () => {
      this._urlInput.select();
    }));
    this._register(this._shareButton.onDidClick(() => {
      editor.toggleShareWithAgent();
    }));
    const updateShareButtonVisibility = /* @__PURE__ */ __name(() => {
      this._shareButtonContainer.style.display = scopedContextKeyService.contextMatchesRules(canShareBrowserWithAgentContext) ? "" : "none";
    }, "updateShareButtonVisibility");
    updateShareButtonVisibility();
    this._register(watchForAgentSharingContextChanges(scopedContextKeyService)(() => {
      updateShareButtonVisibility();
    }));
  }
  /**
   * Update the share toggle visual state
   */
  setShared(isShared) {
    this._shareButton.checked = isShared;
    this._shareButton.label = isShared ? localize("browser.sharingWithAgent", "Sharing with Agent") + " $(agent)" : "$(agent)";
    this._shareButton.setTitle(isShared ? localize("browser.unshareWithAgent", "Stop Sharing with Agent") : localize("browser.shareWithAgent", "Share with Agent"));
  }
  /**
   * Update the navigation bar state from a navigation event
   */
  updateFromNavigationEvent(event) {
    this._urlInput.value = event.url;
  }
  /**
   * Focus the URL input and select all text
   */
  focusUrlInput() {
    this._urlInput.select();
    this._urlInput.focus();
  }
  clear() {
    this._urlInput.value = "";
  }
}
let BrowserEditor = class BrowserEditor2 extends EditorPane {
  static {
    __name(this, "BrowserEditor");
  }
  static {
    BrowserEditor_1 = this;
  }
  static {
    this.ID = "workbench.editor.browser";
  }
  constructor(group, telemetryService, themeService, storageService, keybindingService, logService, instantiationService, contextKeyService, editorService, browserElementsService, chatWidgetService, configurationService, layoutService) {
    super(BrowserEditor_1.ID, group, telemetryService, themeService, storageService);
    this.keybindingService = keybindingService;
    this.logService = logService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.editorService = editorService;
    this.browserElementsService = browserElementsService;
    this.chatWidgetService = chatWidgetService;
    this.configurationService = configurationService;
    this.layoutService = layoutService;
    this._overlayVisible = false;
    this._editorVisible = false;
    this._inputDisposables = this._register(new DisposableStore());
  }
  createEditor(parent) {
    const contextKeyService = this._register(this.contextKeyService.createScoped(parent));
    this.overlayManager = this._register(new BrowserOverlayManager(this.window));
    this._canGoBackContext = CONTEXT_BROWSER_CAN_GO_BACK.bindTo(contextKeyService);
    this._canGoForwardContext = CONTEXT_BROWSER_CAN_GO_FORWARD.bindTo(contextKeyService);
    this._storageScopeContext = CONTEXT_BROWSER_STORAGE_SCOPE.bindTo(contextKeyService);
    this._hasUrlContext = CONTEXT_BROWSER_HAS_URL.bindTo(contextKeyService);
    this._hasErrorContext = CONTEXT_BROWSER_HAS_ERROR.bindTo(contextKeyService);
    this._devToolsOpenContext = CONTEXT_BROWSER_DEVTOOLS_OPEN.bindTo(contextKeyService);
    this._elementSelectionActiveContext = CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE.bindTo(contextKeyService);
    this._canZoomInContext = CONTEXT_BROWSER_CAN_ZOOM_IN.bindTo(contextKeyService);
    this._canZoomOutContext = CONTEXT_BROWSER_CAN_ZOOM_OUT.bindTo(contextKeyService);
    CONTEXT_BROWSER_FOCUSED.bindTo(contextKeyService);
    const root = $(".browser-root");
    parent.appendChild(root);
    const toolbar = $(".browser-toolbar");
    this._navigationBar = this._register(new BrowserNavigationBar(this, toolbar, this.instantiationService, contextKeyService, this.configurationService));
    root.appendChild(toolbar);
    this._findWidgetContainer = $(".browser-find-widget-wrapper");
    root.appendChild(this._findWidgetContainer);
    this._findWidget = new Lazy(() => {
      const findWidget = this.instantiationService.createInstance(BrowserFindWidget, this._findWidgetContainer);
      if (this._model) {
        findWidget.setModel(this._model);
      }
      return findWidget;
    });
    this._register(toDisposable(() => this._findWidget.rawValue?.dispose()));
    this._browserContainerWrapper = $(".browser-container-wrapper");
    this._browserContainerWrapper.style.setProperty("--zoom-factor", String(getZoomFactor(this.window)));
    root.appendChild(this._browserContainerWrapper);
    this._browserContainer = $(".browser-container");
    this._browserContainer.tabIndex = 0;
    this._browserContainerWrapper.appendChild(this._browserContainer);
    const placeholderContents = $(".browser-placeholder-contents");
    this._browserContainer.appendChild(placeholderContents);
    this._placeholderScreenshot = $(".browser-placeholder-screenshot");
    placeholderContents.appendChild(this._placeholderScreenshot);
    this._overlayPauseContainer = $(".browser-overlay-paused");
    const overlayPauseMessage = $(".browser-overlay-paused-message");
    this._overlayPauseHeading = $(".browser-overlay-paused-heading");
    this._overlayPauseDetail = $(".browser-overlay-paused-detail");
    overlayPauseMessage.appendChild(this._overlayPauseHeading);
    overlayPauseMessage.appendChild(this._overlayPauseDetail);
    this._overlayPauseContainer.appendChild(overlayPauseMessage);
    placeholderContents.appendChild(this._overlayPauseContainer);
    this._errorContainer = $(".browser-error-container");
    this._errorContainer.style.display = "none";
    placeholderContents.appendChild(this._errorContainer);
    this._welcomeContainer = this.createWelcomeContainer();
    placeholderContents.appendChild(this._welcomeContainer);
    this._register(addDisposableListener(this._browserContainer, EventType.FOCUS, (event) => {
      if (event.relatedTarget && this._model && this.shouldShowView) {
        void this._model.focus();
      }
    }));
    this._register(registerExternalFocusChecker(() => ({
      hasFocus: this._model?.focused ?? false,
      window: this._model?.focused ? this.window : void 0
    })));
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    if (token.isCancellationRequested) {
      return;
    }
    this._inputDisposables.clear();
    const model = await input.resolve();
    this._model = model;
    if (token.isCancellationRequested || this.input !== input) {
      return;
    }
    this._storageScopeContext.set(this._model.storageScope);
    this._devToolsOpenContext.set(this._model.isDevToolsOpen);
    this.updateZoomContext();
    this._updateSharingState(true);
    this._findWidget.rawValue?.setModel(this._model);
    this._inputDisposables.add(input.onWillDispose(() => {
      this._model = void 0;
    }));
    this._inputDisposables.add(this._model.onDidChangeSharedWithAgent(() => {
      this._updateSharingState(false);
    }));
    this._inputDisposables.add(watchForAgentSharingContextChanges(this.contextKeyService)(() => {
      this._updateSharingState(false);
    }));
    this._inputDisposables.add(this._model.onDidChangeZoom(() => {
      this.updateZoomContext();
    }));
    this.updateNavigationState({
      url: this._model.url,
      title: this._model.title,
      canGoBack: this._model.canGoBack,
      canGoForward: this._model.canGoForward
    });
    this.setBackgroundImage(this._model.screenshot);
    if (!options?.preserveFocus) {
      setTimeout(() => {
        if (this._model === model) {
          if (this._model.url) {
            this._browserContainer.focus();
          } else {
            this.focusUrlInput();
          }
        }
      }, 0);
    }
    this._inputDisposables.add(this._model.onDidChangeVisibility(() => this.doScreenshot()));
    this._inputDisposables.add(this._model.onDidKeyCommand((keyEvent) => {
      this.handleKeyEventFromBrowserView(keyEvent);
    }));
    this._inputDisposables.add(this._model.onDidNavigate((navEvent) => {
      this.group.pinEditor(this.input);
      this.updateNavigationState(navEvent);
      if (navEvent.url) {
        this.startConsoleSession();
      } else {
        this.stopConsoleSession();
      }
    }));
    this._inputDisposables.add(this._model.onDidChangeLoadingState(() => {
      this.updateErrorDisplay();
    }));
    this._inputDisposables.add(this._model.onDidChangeFocus(({ focused }) => {
      if (focused) {
        this._onDidFocus?.fire();
        this.ensureBrowserFocus();
      }
    }));
    this._inputDisposables.add(this._model.onDidChangeDevToolsState((e) => {
      this._devToolsOpenContext.set(e.isDevToolsOpen);
    }));
    this._inputDisposables.add(this._model.onDidRequestNewPage(({ resource, location, position }) => {
      logBrowserOpen(this.telemetryService, (() => {
        switch (location) {
          case BrowserNewPageLocation.Background:
            return "browserLinkBackground";
          case BrowserNewPageLocation.Foreground:
            return "browserLinkForeground";
          case BrowserNewPageLocation.NewWindow:
            return "browserLinkNewWindow";
        }
      })());
      const targetGroup = location === BrowserNewPageLocation.NewWindow ? AUX_WINDOW_GROUP : this.group;
      this.editorService.openEditor({
        resource: URI.from(resource),
        options: {
          pinned: true,
          inactive: location === BrowserNewPageLocation.Background,
          auxiliary: {
            bounds: position,
            compact: true
          }
        }
      }, targetGroup);
    }));
    this._inputDisposables.add(this.overlayManager.onDidChangeOverlayState(() => {
      this.checkOverlays();
    }));
    this._inputDisposables.add(onDidChangeZoomLevel((targetWindowId) => {
      if (targetWindowId === this.window.vscodeWindowId) {
        this._browserContainerWrapper.style.setProperty("--zoom-factor", String(getZoomFactor(this.window)));
      }
    }));
    this.updateErrorDisplay();
    this.layout();
    this.updateVisibility();
    this.doScreenshot();
    if (this._model.url) {
      this.startConsoleSession();
    }
  }
  setEditorVisible(visible) {
    this._editorVisible = visible;
    this.updateVisibility();
  }
  /**
   * Make the browser container the active element without moving focus from the browser view.
   */
  ensureBrowserFocus() {
    originalHtmlElementFocus.call(this._browserContainer);
  }
  updateVisibility() {
    const hasUrl = !!this._model?.url;
    const hasError = !!this._model?.error;
    const isViewingPage = !hasError && hasUrl;
    const isPaused = isViewingPage && this._editorVisible && this._overlayVisible;
    this._welcomeContainer.style.display = hasUrl ? "none" : "";
    this._errorContainer.style.display = hasError ? "" : "none";
    this._placeholderScreenshot.style.display = isViewingPage ? "" : "none";
    this._overlayPauseContainer.classList.toggle("visible", isPaused);
    if (this._model) {
      const show = this.shouldShowView;
      if (show === this._model.visible) {
        return;
      }
      if (show) {
        this._model.setVisible(true);
        if (this._browserContainer.ownerDocument.hasFocus() && this._browserContainer.ownerDocument.activeElement === this._browserContainer) {
          void this._model.focus();
        }
      } else {
        this.doScreenshot();
        this.window.requestAnimationFrame(() => this._model?.setVisible(false));
      }
    }
  }
  get shouldShowView() {
    return this._editorVisible && !this._overlayVisible && !this._model?.error && !!this._model?.url;
  }
  checkOverlays() {
    if (!this.overlayManager) {
      return;
    }
    const overlappingOverlays = this.overlayManager.getOverlappingOverlays(this._browserContainer);
    const hasOverlappingOverlay = overlappingOverlays.length > 0;
    this.updateOverlayPauseMessage(overlappingOverlays);
    if (hasOverlappingOverlay !== this._overlayVisible) {
      this._overlayVisible = hasOverlappingOverlay;
      this.updateVisibility();
    }
  }
  updateOverlayPauseMessage(overlappingOverlays) {
    const hasNotificationOverlay = overlappingOverlays.some((overlay) => overlay.type === BrowserOverlayType.Notification);
    this._overlayPauseContainer.classList.toggle("show-message", hasNotificationOverlay);
    if (hasNotificationOverlay) {
      this._overlayPauseHeading.textContent = localize("browser.overlayPauseHeading.notification", "Paused due to Notification");
      this._overlayPauseDetail.textContent = localize("browser.overlayPauseDetail.notification", "Dismiss the notification to continue using the browser.");
    } else {
      this._overlayPauseHeading.textContent = "";
      this._overlayPauseDetail.textContent = "";
    }
  }
  updateErrorDisplay() {
    if (!this._model) {
      return;
    }
    const error = this._model.error;
    this._hasErrorContext.set(!!error);
    if (error) {
      while (this._errorContainer.firstChild) {
        this._errorContainer.removeChild(this._errorContainer.firstChild);
      }
      const errorContent = $(".browser-error-content");
      const errorTitle = $(".browser-error-title");
      errorTitle.textContent = localize("browser.loadErrorLabel", "Failed to Load Page");
      const errorMessage = $(".browser-error-detail");
      const errorText = $("span");
      errorText.textContent = `${error.errorDescription} (${error.errorCode})`;
      errorMessage.appendChild(errorText);
      const errorUrl = $(".browser-error-detail");
      const urlLabel = $("strong");
      urlLabel.textContent = localize("browser.errorUrlLabel", "URL:");
      const urlValue = $("code");
      urlValue.textContent = error.url;
      errorUrl.appendChild(urlLabel);
      errorUrl.appendChild(document.createTextNode(" "));
      errorUrl.appendChild(urlValue);
      errorContent.appendChild(errorTitle);
      errorContent.appendChild(errorMessage);
      errorContent.appendChild(errorUrl);
      this._errorContainer.appendChild(errorContent);
      this.setBackgroundImage(void 0);
    } else {
      this.setBackgroundImage(this._model.screenshot);
    }
    this.updateVisibility();
  }
  getUrl() {
    return this._model?.url;
  }
  _updateSharingState(isInitialState) {
    const sharingEnabled = this.contextKeyService.contextMatchesRules(canShareBrowserWithAgentContext);
    const isShared = sharingEnabled && !!this._model && this._model.sharedWithAgent;
    this._browserContainer.classList.toggle("animate", !isInitialState);
    this._browserContainer.classList.toggle("shared", isShared);
    this._navigationBar.setShared(isShared);
  }
  toggleShareWithAgent() {
    if (!this._model) {
      return;
    }
    this._model.setSharedWithAgent(!this._model.sharedWithAgent);
  }
  async navigateToUrl(url) {
    if (this._model) {
      this.group.pinEditor(this.input);
      if (/^localhost(:|\/|$)/i.test(url)) {
        url = "http://" + url;
      } else if (!URL.parse(url)?.protocol) {
        url = "http://" + url;
      }
      this.ensureBrowserFocus();
      await this._model.loadURL(url);
    }
  }
  focusUrlInput() {
    this._navigationBar.focusUrlInput();
  }
  async goBack() {
    return this._model?.goBack();
  }
  async goForward() {
    return this._model?.goForward();
  }
  async reload(hard) {
    return this._model?.reload(hard);
  }
  async toggleDevTools() {
    return this._model?.toggleDevTools();
  }
  async clearStorage() {
    return this._model?.clearStorage();
  }
  async zoomIn() {
    await this._model?.zoomIn();
  }
  async zoomOut() {
    await this._model?.zoomOut();
  }
  async resetZoom() {
    await this._model?.resetZoom();
  }
  updateZoomContext() {
    if (this._model) {
      this._canZoomInContext.set(this._model.canZoomIn);
      this._canZoomOutContext.set(this._model.canZoomOut);
    }
  }
  /**
   * Show the find widget, optionally pre-populated with selected text from the browser view
   */
  async showFind() {
    const selectedText = (await this._model?.getSelectedText())?.trim();
    const textToReveal = selectedText && !/[\r\n]/.test(selectedText) ? selectedText : void 0;
    this._findWidget.value.reveal(textToReveal);
    this._findWidget.value.layout(this._findWidgetContainer.clientWidth);
  }
  /**
   * Hide the find widget
   */
  hideFind() {
    this._findWidget.rawValue?.hide();
  }
  /**
   * Find the next match
   */
  findNext() {
    this._findWidget.rawValue?.find(false);
  }
  /**
   * Find the previous match
   */
  findPrevious() {
    this._findWidget.rawValue?.find(true);
  }
  /**
   * Start element selection in the browser view, wait for a user selection, and add it to chat.
   */
  async addElementToChat() {
    if (this._elementSelectionCts) {
      this._elementSelectionCts.dispose(true);
      this._elementSelectionCts = void 0;
      this._elementSelectionActiveContext.set(false);
      return;
    }
    const cts = new CancellationTokenSource();
    this._elementSelectionCts = cts;
    this._elementSelectionActiveContext.set(true);
    this.telemetryService.publicLog2("integratedBrowser.addElementToChat.start", {});
    try {
      const resourceUri = this.input?.resource;
      if (!resourceUri) {
        throw new Error("No resource URI found");
      }
      this.ensureBrowserFocus();
      const locator = { browserViewId: BrowserViewUri.getId(this.input.resource) };
      await this.browserElementsService.startDebugSession(cts.token, locator);
      const { width, height } = this._browserContainer.getBoundingClientRect();
      const elementData = await this.browserElementsService.getElementData({ x: 0, y: 0, width, height }, cts.token, locator);
      if (!elementData) {
        throw new Error("Element data not found");
      }
      const { attachCss, attachImages } = await this.attachElementDataToChat(elementData);
      this.telemetryService.publicLog2("integratedBrowser.addElementToChat.added", {
        attachCss,
        attachImages
      });
    } catch (error) {
      if (!cts.token.isCancellationRequested) {
        this.logService.error("BrowserEditor.addElementToChat: Failed to select element", error);
      }
    } finally {
      cts.dispose();
      if (this._elementSelectionCts === cts) {
        this._elementSelectionCts = void 0;
        this._elementSelectionActiveContext.set(false);
      }
    }
  }
  /**
   * Grab the current console logs from the active console session and attach them to chat.
   */
  async addConsoleLogsToChat() {
    const resourceUri = this.input?.resource;
    if (!resourceUri) {
      return;
    }
    const locator = { browserViewId: BrowserViewUri.getId(resourceUri) };
    try {
      const logs = await this.browserElementsService.getConsoleLogs(locator);
      if (!logs) {
        return;
      }
      const toAttach = [];
      toAttach.push({
        id: "console-logs-" + Date.now(),
        name: localize("consoleLogs", "Console Logs"),
        fullName: localize("consoleLogs", "Console Logs"),
        value: logs,
        modelDescription: "Console logs captured from Integrated Browser.",
        kind: "element",
        icon: ThemeIcon.fromId(Codicon.terminal.id)
      });
      const widget = await this.chatWidgetService.revealWidget() ?? this.chatWidgetService.lastFocusedWidget;
      widget?.attachmentModel?.addContext(...toAttach);
    } catch (error) {
      this.logService.error("BrowserEditor.addConsoleLogsToChat: Failed to get console logs", error);
    }
  }
  /**
   * Start a console session to capture logs from the browser view.
   */
  startConsoleSession() {
    if (this._consoleSessionCts) {
      return;
    }
    const resourceUri = this.input?.resource;
    if (!resourceUri || !this._model?.url) {
      return;
    }
    const cts = new CancellationTokenSource();
    this._consoleSessionCts = cts;
    const locator = { browserViewId: BrowserViewUri.getId(resourceUri) };
    this.browserElementsService.startConsoleSession(cts.token, locator).catch((error) => {
      if (!cts.token.isCancellationRequested) {
        this.logService.error("BrowserEditor: Failed to start console session", error);
      }
    });
  }
  /**
   * Stop the active console session.
   */
  stopConsoleSession() {
    if (this._consoleSessionCts) {
      this._consoleSessionCts.dispose(true);
      this._consoleSessionCts = void 0;
    }
  }
  createElementContextValue(elementData, displayName, attachCss) {
    const sections = [];
    sections.push("Attached Element Context from Integrated Browser");
    sections.push(`Element: ${displayName}`);
    const htmlPath = this.formatElementPath(elementData.ancestors);
    if (htmlPath) {
      sections.push(`HTML Path:
${htmlPath}`);
    }
    const attributeTable = this.formatElementMap(elementData.attributes);
    if (attributeTable) {
      sections.push(`Attributes:
${attributeTable}`);
    }
    if (attachCss) {
      const computedStyleTable = this.formatElementMap(elementData.computedStyles);
      if (computedStyleTable) {
        sections.push(`Computed Styles:
${computedStyleTable}`);
      }
    }
    if (elementData.dimensions) {
      const { top, left, width, height } = elementData.dimensions;
      sections.push(`Dimensions:
- top: ${Math.round(top)}px
- left: ${Math.round(left)}px
- width: ${Math.round(width)}px
- height: ${Math.round(height)}px`);
    }
    const innerText = elementData.innerText?.trim();
    if (innerText) {
      sections.push(`Inner Text:
\`\`\`text
${innerText}
\`\`\``);
    }
    sections.push(`Outer HTML:
\`\`\`html
${elementData.outerHTML}
\`\`\``);
    if (attachCss) {
      sections.push(`Full Computed CSS:
\`\`\`css
${elementData.computedStyle}
\`\`\``);
    }
    return sections.join("\n\n");
  }
  async attachElementDataToChat(elementData) {
    const bounds = elementData.bounds;
    const toAttach = [];
    const displayName = getDisplayNameFromOuterHTML(elementData.outerHTML);
    const attachCss = this.configurationService.getValue("chat.sendElementsToChat.attachCSS");
    const value = this.createElementContextValue(elementData, displayName, attachCss);
    toAttach.push({
      id: "element-" + Date.now(),
      name: displayName,
      fullName: displayName,
      value,
      modelDescription: attachCss ? "Structured browser element context with HTML path, attributes, and computed styles." : "Structured browser element context with HTML path and attributes.",
      kind: "element",
      icon: ThemeIcon.fromId(Codicon.layout.id),
      ancestors: elementData.ancestors,
      attributes: elementData.attributes,
      computedStyles: attachCss ? elementData.computedStyles : void 0,
      dimensions: elementData.dimensions,
      innerText: elementData.innerText
    });
    const attachImages = this.configurationService.getValue("chat.sendElementsToChat.attachImages");
    if (attachImages && this._model) {
      const screenshotBuffer = await this._model.captureScreenshot({
        quality: 90,
        rect: bounds
      });
      toAttach.push({
        id: "element-screenshot-" + Date.now(),
        name: "Element Screenshot",
        fullName: "Element Screenshot",
        kind: "image",
        value: screenshotBuffer.buffer
      });
    }
    const widget = await this.chatWidgetService.revealWidget() ?? this.chatWidgetService.lastFocusedWidget;
    widget?.attachmentModel?.addContext(...toAttach);
    return { attachCss, attachImages };
  }
  formatElementPath(ancestors) {
    if (!ancestors || ancestors.length === 0) {
      return void 0;
    }
    return ancestors.map((ancestor) => {
      const classes = ancestor.classNames?.length ? `.${ancestor.classNames.join(".")}` : "";
      const id = ancestor.id ? `#${ancestor.id}` : "";
      return `${ancestor.tagName}${id}${classes}`;
    }).join(" > ");
  }
  formatElementMap(entries) {
    if (!entries || Object.keys(entries).length === 0) {
      return void 0;
    }
    const normalizedEntries = new Map(Object.entries(entries));
    const lines = [];
    const marginShorthand = this.createBoxShorthand(normalizedEntries, "margin");
    if (marginShorthand) {
      lines.push(`- margin: ${marginShorthand}`);
    }
    const paddingShorthand = this.createBoxShorthand(normalizedEntries, "padding");
    if (paddingShorthand) {
      lines.push(`- padding: ${paddingShorthand}`);
    }
    for (const [name, value] of Array.from(normalizedEntries.entries()).sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(`- ${name}: ${value}`);
    }
    return lines.join("\n");
  }
  createBoxShorthand(entries, propertyName) {
    const topKey = `${propertyName}-top`;
    const rightKey = `${propertyName}-right`;
    const bottomKey = `${propertyName}-bottom`;
    const leftKey = `${propertyName}-left`;
    const top = entries.get(topKey);
    const right = entries.get(rightKey);
    const bottom = entries.get(bottomKey);
    const left = entries.get(leftKey);
    if (top === void 0 || right === void 0 || bottom === void 0 || left === void 0) {
      return void 0;
    }
    entries.delete(topKey);
    entries.delete(rightKey);
    entries.delete(bottomKey);
    entries.delete(leftKey);
    return `${top} ${right} ${bottom} ${left}`;
  }
  /**
   * Update navigation state and context keys
   */
  updateNavigationState(event) {
    this._navigationBar.updateFromNavigationEvent(event);
    this._canGoBackContext.set(event.canGoBack);
    this._canGoForwardContext.set(event.canGoForward);
    this._hasUrlContext.set(!!event.url);
    this.updateVisibility();
  }
  /**
   * Create the welcome container shown when no URL is loaded
   */
  createWelcomeContainer() {
    const container = $(".browser-welcome-container");
    const content = $(".browser-welcome-content");
    const iconContainer = $(".browser-welcome-icon");
    iconContainer.appendChild(renderIcon(Codicon.globe));
    content.appendChild(iconContainer);
    const title = $(".browser-welcome-title");
    title.textContent = localize("browser.welcomeTitle", "Browser");
    content.appendChild(title);
    const subtitle = $(".browser-welcome-subtitle");
    const chatEnabled = this.contextKeyService.getContextKeyValue(ChatContextKeys.enabled.key);
    subtitle.textContent = chatEnabled ? localize("browser.welcomeSubtitleChat", "Use Add Element to Chat to reference UI elements in chat prompts.") : localize("browser.welcomeSubtitle", "Enter a URL above to get started.");
    content.appendChild(subtitle);
    container.appendChild(content);
    return container;
  }
  setBackgroundImage(buffer) {
    if (buffer) {
      const dataUrl = `data:image/jpeg;base64,${encodeBase64(buffer)}`;
      this._placeholderScreenshot.style.backgroundImage = `url('${dataUrl}')`;
    } else {
      this._placeholderScreenshot.style.backgroundImage = "";
    }
  }
  async doScreenshot() {
    if (!this._model) {
      return;
    }
    this.cancelScheduledScreenshot();
    if (!this._model.visible) {
      return;
    }
    try {
      const screenshot = await this._model.captureScreenshot({ quality: 80 });
      this.setBackgroundImage(screenshot);
    } catch (error) {
      this.logService.error("Failed to capture browser view screenshot", error);
    }
    this._screenshotTimeout = setTimeout(() => this.doScreenshot(), 1e3);
  }
  cancelScheduledScreenshot() {
    if (this._screenshotTimeout) {
      clearTimeout(this._screenshotTimeout);
      this._screenshotTimeout = void 0;
    }
  }
  forwardCurrentEvent() {
    if (this._currentKeyDownEvent && this._model) {
      void this._model.dispatchKeyEvent(this._currentKeyDownEvent);
      return true;
    }
    return false;
  }
  async handleKeyEventFromBrowserView(keyEvent) {
    this._currentKeyDownEvent = keyEvent;
    try {
      const isEnterKey = keyEvent.code === "Enter" || keyEvent.code === "NumpadEnter" || keyEvent.key === "Enter" || keyEvent.key === "Return";
      if (this._elementSelectionCts && isEnterKey) {
        const cts = this._elementSelectionCts;
        const resourceUri = this.input?.resource;
        if (!resourceUri) {
          return;
        }
        const locator = { browserViewId: BrowserViewUri.getId(resourceUri) };
        const { width, height } = this._browserContainer.getBoundingClientRect();
        const elementData = await this.browserElementsService.getFocusedElementData({ x: 0, y: 0, width, height }, cts.token, locator);
        if (!elementData) {
          return;
        }
        await this.attachElementDataToChat(elementData);
        cts.dispose();
        if (this._elementSelectionCts === cts) {
          this._elementSelectionCts = void 0;
          this._elementSelectionActiveContext.set(false);
        }
        return;
      }
      const syntheticEvent = new KeyboardEvent("keydown", keyEvent);
      const standardEvent = new StandardKeyboardEvent(syntheticEvent);
      const handled = this.keybindingService.dispatchEvent(standardEvent, this._browserContainer);
      if (!handled) {
        this.forwardCurrentEvent();
      }
    } catch (error) {
      this.logService.error("BrowserEditor.handleKeyEventFromBrowserView: Error dispatching key event", error);
    } finally {
      this._currentKeyDownEvent = void 0;
    }
  }
  layout(dimension, _position) {
    if (dimension && this._findWidget.rawValue) {
      this._findWidget.rawValue.layout(dimension.width);
    }
    const whenContainerStylesLoaded = this.layoutService.whenContainerStylesLoaded(this.window);
    if (whenContainerStylesLoaded) {
      whenContainerStylesLoaded.then(() => this.layoutBrowserContainer());
    } else {
      this.layoutBrowserContainer();
    }
  }
  /**
   * Recompute the layout of the browser container and update the model with the new bounds.
   * This should generally only be called via layout() to ensure that the container is ready and all necessary styles are loaded.
   */
  layoutBrowserContainer() {
    if (this._model) {
      this.checkOverlays();
      const containerRect = this._browserContainer.getBoundingClientRect();
      const cornerRadius = this.window.getComputedStyle(this._browserContainer).borderTopLeftRadius ?? "0";
      void this._model.layout({
        windowId: this.group.windowId,
        x: containerRect.left,
        y: containerRect.top,
        width: containerRect.width,
        height: containerRect.height,
        zoomFactor: getZoomFactor(this.window),
        cornerRadius: parseFloat(cornerRadius)
      });
    }
  }
  clearInput() {
    this._inputDisposables.clear();
    if (this._elementSelectionCts) {
      this._elementSelectionCts.dispose(true);
      this._elementSelectionCts = void 0;
    }
    this.stopConsoleSession();
    this.cancelScheduledScreenshot();
    this._findWidget.rawValue?.setModel(void 0);
    this._findWidget.rawValue?.hide();
    void this._model?.setVisible(false);
    this._model = void 0;
    this._canGoBackContext.reset();
    this._canGoForwardContext.reset();
    this._hasUrlContext.reset();
    this._hasErrorContext.reset();
    this._storageScopeContext.reset();
    this._devToolsOpenContext.reset();
    this._elementSelectionActiveContext.reset();
    this._canZoomInContext.reset();
    this._canZoomOutContext.reset();
    this._navigationBar.clear();
    this.setBackgroundImage(void 0);
    super.clearInput();
  }
};
BrowserEditor = BrowserEditor_1 = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService),
  __param(4, IKeybindingService),
  __param(5, ILogService),
  __param(6, IInstantiationService),
  __param(7, IContextKeyService),
  __param(8, IEditorService),
  __param(9, IBrowserElementsService),
  __param(10, IChatWidgetService),
  __param(11, IConfigurationService),
  __param(12, ILayoutService)
], BrowserEditor);
export {
  BrowserEditor,
  CONTEXT_BROWSER_CAN_GO_BACK,
  CONTEXT_BROWSER_CAN_GO_FORWARD,
  CONTEXT_BROWSER_CAN_ZOOM_IN,
  CONTEXT_BROWSER_CAN_ZOOM_OUT,
  CONTEXT_BROWSER_DEVTOOLS_OPEN,
  CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE,
  CONTEXT_BROWSER_FIND_WIDGET_FOCUSED,
  CONTEXT_BROWSER_FIND_WIDGET_VISIBLE,
  CONTEXT_BROWSER_FOCUSED,
  CONTEXT_BROWSER_HAS_ERROR,
  CONTEXT_BROWSER_HAS_URL,
  CONTEXT_BROWSER_STORAGE_SCOPE
};
//# sourceMappingURL=browserEditor.js.map
