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
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { RawContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
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
import { logBrowserOpen } from "./browserViewTelemetry.js";
import { URI } from "../../../../base/common/uri.js";
const CONTEXT_BROWSER_CAN_GO_BACK = new RawContextKey("browserCanGoBack", false, localize("browser.canGoBack", "Whether the browser can go back"));
const CONTEXT_BROWSER_CAN_GO_FORWARD = new RawContextKey("browserCanGoForward", false, localize("browser.canGoForward", "Whether the browser can go forward"));
const CONTEXT_BROWSER_FOCUSED = new RawContextKey("browserFocused", true, localize("browser.editorFocused", "Whether the browser editor is focused"));
const CONTEXT_BROWSER_STORAGE_SCOPE = new RawContextKey("browserStorageScope", "", localize("browser.storageScope", "The storage scope of the current browser view"));
const CONTEXT_BROWSER_DEVTOOLS_OPEN = new RawContextKey("browserDevToolsOpen", false, localize("browser.devToolsOpen", "Whether developer tools are open for the current browser view"));
const CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE = new RawContextKey("browserElementSelectionActive", false, localize("browser.elementSelectionActive", "Whether element selection is currently active"));
const originalHtmlElementFocus = HTMLElement.prototype.focus;
class BrowserNavigationBar extends Disposable {
  static {
    __name(this, "BrowserNavigationBar");
  }
  constructor(editor, container, instantiationService, scopedContextKeyService) {
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
    this._urlInput = $("input.browser-url-input");
    this._urlInput.type = "text";
    this._urlInput.placeholder = localize("browser.urlPlaceholder", "Enter URL...");
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
    container.appendChild(this._urlInput);
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
  constructor(group, telemetryService, themeService, storageService, keybindingService, logService, instantiationService, contextKeyService, editorService, browserElementsService, chatWidgetService, configurationService) {
    super(BrowserEditor_1.ID, group, telemetryService, themeService, storageService);
    this.keybindingService = keybindingService;
    this.logService = logService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.editorService = editorService;
    this.browserElementsService = browserElementsService;
    this.chatWidgetService = chatWidgetService;
    this.configurationService = configurationService;
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
    this._devToolsOpenContext = CONTEXT_BROWSER_DEVTOOLS_OPEN.bindTo(contextKeyService);
    this._elementSelectionActiveContext = CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE.bindTo(contextKeyService);
    CONTEXT_BROWSER_FOCUSED.bindTo(contextKeyService);
    const root = $(".browser-root");
    parent.appendChild(root);
    const toolbar = $(".browser-toolbar");
    this._navigationBar = this._register(new BrowserNavigationBar(this, toolbar, this.instantiationService, contextKeyService));
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
    this._browserContainer = $(".browser-container");
    this._browserContainer.tabIndex = 0;
    root.appendChild(this._browserContainer);
    this._placeholderScreenshot = $(".browser-placeholder-screenshot");
    this._browserContainer.appendChild(this._placeholderScreenshot);
    this._overlayPauseContainer = $(".browser-overlay-paused");
    const overlayPauseMessage = $(".browser-overlay-paused-message");
    this._overlayPauseHeading = $(".browser-overlay-paused-heading");
    this._overlayPauseDetail = $(".browser-overlay-paused-detail");
    overlayPauseMessage.appendChild(this._overlayPauseHeading);
    overlayPauseMessage.appendChild(this._overlayPauseDetail);
    this._overlayPauseContainer.appendChild(overlayPauseMessage);
    this._browserContainer.appendChild(this._overlayPauseContainer);
    this._errorContainer = $(".browser-error-container");
    this._errorContainer.style.display = "none";
    this._browserContainer.appendChild(this._errorContainer);
    this._welcomeContainer = this.createWelcomeContainer();
    this._browserContainer.appendChild(this._welcomeContainer);
    this._register(addDisposableListener(this._browserContainer, EventType.FOCUS, (event) => {
      if (event.relatedTarget && this._model && this.shouldShowView) {
        void this._model.focus();
      }
    }));
    this._register(registerExternalFocusChecker(() => ({
      hasFocus: this._model?.focused ?? false,
      window: this._model?.focused ? this.window : void 0
    })));
    const resizeObserver = new this.window.ResizeObserver(() => this.layoutBrowserContainer());
    resizeObserver.observe(this._browserContainer);
    this._register(toDisposable(() => resizeObserver.disconnect()));
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    if (token.isCancellationRequested) {
      return;
    }
    this._inputDisposables.clear();
    this._model = await input.resolve();
    if (token.isCancellationRequested || this.input !== input) {
      return;
    }
    this._storageScopeContext.set(this._model.storageScope);
    this._devToolsOpenContext.set(this._model.isDevToolsOpen);
    this._findWidget.rawValue?.setModel(this._model);
    this._inputDisposables.add(input.onWillDispose(() => {
      this._model = void 0;
    }));
    this.updateNavigationState({
      url: this._model.url,
      canGoBack: this._model.canGoBack,
      canGoForward: this._model.canGoForward
    });
    this.setBackgroundImage(this._model.screenshot);
    if (context.newInGroup) {
      if (this._model.url) {
        this._browserContainer.focus();
      } else {
        this.focusUrlInput();
      }
    }
    this._inputDisposables.add(this._model.onDidChangeVisibility(() => this.doScreenshot()));
    this._inputDisposables.add(this._model.onDidKeyCommand((keyEvent) => {
      this.handleKeyEventFromBrowserView(keyEvent);
    }));
    this._inputDisposables.add(this._model.onDidNavigate((navEvent) => {
      this.group.pinEditor(this.input);
      this.updateNavigationState(navEvent);
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
        this.layoutBrowserContainer();
      }
    }));
    this.updateErrorDisplay();
    this.layoutBrowserContainer();
    this.updateVisibility();
    this.doScreenshot();
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
  async reload() {
    return this._model?.reload();
  }
  async toggleDevTools() {
    return this._model?.toggleDevTools();
  }
  async clearStorage() {
    return this._model?.clearStorage();
  }
  /**
   * Show the find widget, optionally pre-populated with selected text from the browser view
   */
  async showFind() {
    const selectedText = await this._model?.getSelectedText();
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
      const bounds = elementData.bounds;
      const toAttach = [];
      const displayName = getDisplayNameFromOuterHTML(elementData.outerHTML);
      const attachCss = this.configurationService.getValue("chat.sendElementsToChat.attachCSS");
      let value = (attachCss ? "Attached HTML and CSS Context" : "Attached HTML Context") + "\n\n" + elementData.outerHTML;
      if (attachCss) {
        value += "\n\n" + elementData.computedStyle;
      }
      toAttach.push({
        id: "element-" + Date.now(),
        name: displayName,
        fullName: displayName,
        value,
        kind: "element",
        icon: ThemeIcon.fromId(Codicon.layout.id)
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
   * Update navigation state and context keys
   */
  updateNavigationState(event) {
    this._navigationBar.updateFromNavigationEvent(event);
    this._canGoBackContext.set(event.canGoBack);
    this._canGoForwardContext.set(event.canGoForward);
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
    subtitle.textContent = localize("browser.welcomeSubtitle", "Enter a URL above to get started.");
    content.appendChild(subtitle);
    const chatEnabled = this.contextKeyService.getContextKeyValue(ChatContextKeys.enabled.key);
    if (chatEnabled) {
      const tip = $(".browser-welcome-tip");
      tip.textContent = localize("browser.welcomeTip", "Tip: Use Add Element to Chat to reference UI elements in chat prompts.");
      content.appendChild(tip);
    }
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
    this._findWidget.rawValue?.layout(dimension.width);
  }
  /**
   * This should be called whenever .browser-container changes in size, or when
   * there could be any elements, such as the command palette, overlapping with it.
   *
   * Note that we don't call layoutBrowserContainer() from layout() but instead rely on using a ResizeObserver and on
   * making direct calls to it. This is because we have seen cases where the getBoundingClientRect() values of
   * the .browser-container element are not correct during layout() calls, especially during "Move into New Window"
   * and "Copy into New Window" operations into a different monitor.
   */
  layoutBrowserContainer() {
    if (this._model) {
      this.checkOverlays();
      const containerRect = this._browserContainer.getBoundingClientRect();
      void this._model.layout({
        windowId: this.group.windowId,
        x: containerRect.left,
        y: containerRect.top,
        width: containerRect.width,
        height: containerRect.height,
        zoomFactor: getZoomFactor(this.window)
      });
    }
  }
  clearInput() {
    this._inputDisposables.clear();
    if (this._elementSelectionCts) {
      this._elementSelectionCts.dispose(true);
      this._elementSelectionCts = void 0;
    }
    this.cancelScheduledScreenshot();
    this._findWidget.rawValue?.setModel(void 0);
    this._findWidget.rawValue?.hide();
    void this._model?.setVisible(false);
    this._model = void 0;
    this._canGoBackContext.reset();
    this._canGoForwardContext.reset();
    this._storageScopeContext.reset();
    this._devToolsOpenContext.reset();
    this._elementSelectionActiveContext.reset();
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
  __param(11, IConfigurationService)
], BrowserEditor);
export {
  BrowserEditor,
  CONTEXT_BROWSER_CAN_GO_BACK,
  CONTEXT_BROWSER_CAN_GO_FORWARD,
  CONTEXT_BROWSER_DEVTOOLS_OPEN,
  CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE,
  CONTEXT_BROWSER_FIND_WIDGET_FOCUSED,
  CONTEXT_BROWSER_FIND_WIDGET_VISIBLE,
  CONTEXT_BROWSER_FOCUSED,
  CONTEXT_BROWSER_STORAGE_SCOPE
};
//# sourceMappingURL=browserEditor.js.map
