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
import { $, addDisposableListener, disposableWindowInterval, EventType, scheduleAtNextAnimationFrame } from "../../../../base/browser/dom.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { RawContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { BrowserViewUri } from "../../../../platform/browserView/common/browserViewUri.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { BrowserOverlayManager } from "./overlayManager.js";
import { getZoomFactor, onDidChangeZoomLevel } from "../../../../base/browser/browser.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { WorkbenchHoverDelegate } from "../../../../platform/hover/browser/hover.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { IBrowserElementsService } from "../../../services/browserElements/browser/browserElementsService.js";
import { IChatWidgetService } from "../../chat/browser/chat.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { encodeBase64 } from "../../../../base/common/buffer.js";
import { getDisplayNameFromOuterHTML } from "../../../../platform/browserElements/common/browserElements.js";
const CONTEXT_BROWSER_CAN_GO_BACK = new RawContextKey("browserCanGoBack", false, localize("browser.canGoBack", "Whether the browser can go back"));
const CONTEXT_BROWSER_CAN_GO_FORWARD = new RawContextKey("browserCanGoForward", false, localize("browser.canGoForward", "Whether the browser can go forward"));
const CONTEXT_BROWSER_FOCUSED = new RawContextKey("browserFocused", true, localize("browser.editorFocused", "Whether the browser editor is focused"));
const CONTEXT_BROWSER_STORAGE_SCOPE = new RawContextKey("browserStorageScope", "", localize("browser.storageScope", "The storage scope of the current browser view"));
const CONTEXT_BROWSER_DEVTOOLS_OPEN = new RawContextKey("browserDevToolsOpen", false, localize("browser.devToolsOpen", "Whether developer tools are open for the current browser view"));
const CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE = new RawContextKey("browserElementSelectionActive", false, localize("browser.elementSelectionActive", "Whether element selection is currently active"));
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
    this._browserContainer = $(".browser-container");
    this._browserContainer.tabIndex = 0;
    root.appendChild(this._browserContainer);
    this._placeholderScreenshot = $(".browser-placeholder-screenshot");
    this._browserContainer.appendChild(this._placeholderScreenshot);
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
    this._register(addDisposableListener(this._browserContainer, EventType.BLUR, () => {
      const focused = this.window.document.activeElement;
      if (focused && focused !== this._browserContainer) {
        this.window.focus();
      }
    }));
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
      this._navigationBar.focusUrlInput();
    }
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
        this._browserContainer.focus();
      }
    }));
    this._inputDisposables.add(this._model.onDidChangeDevToolsState((e) => {
      this._devToolsOpenContext.set(e.isDevToolsOpen);
    }));
    this._inputDisposables.add(this._model.onDidRequestNewPage(({ url, name, background }) => {
      this.telemetryService.publicLog2("integratedBrowser.newPageRequest", {
        background
      });
      const browserUri = BrowserViewUri.forUrl(url, name ? `${input.id}-${name}` : void 0);
      this.editorService.openEditor({
        resource: browserUri,
        options: {
          pinned: true,
          inactive: background
        }
      }, this.group);
    }));
    this._inputDisposables.add(this.overlayManager.onDidChangeOverlayState(() => {
      this.checkOverlays();
    }));
    this._inputDisposables.add(onDidChangeZoomLevel((targetWindowId) => {
      if (targetWindowId === this.window.vscodeWindowId) {
        this.layout();
      }
    }));
    this._inputDisposables.add(disposableWindowInterval(this.window, () => this.capturePlaceholderSnapshot(), 1e3));
    this.updateErrorDisplay();
    this.layout();
    await this._model.setVisible(this.shouldShowView);
    scheduleAtNextAnimationFrame(this.window, () => this.layout());
  }
  setEditorVisible(visible) {
    this._editorVisible = visible;
    this.updateVisibility();
  }
  updateVisibility() {
    const hasUrl = !!this._model?.url;
    const hasError = !!this._model?.error;
    this._welcomeContainer.style.display = hasUrl ? "none" : "flex";
    this._errorContainer.style.display = hasError ? "flex" : "none";
    if (this._model) {
      this._placeholderScreenshot.classList.toggle("blur", this._editorVisible && this._overlayVisible && !hasError);
      void this._model.setVisible(this.shouldShowView);
    }
  }
  get shouldShowView() {
    return this._editorVisible && !this._overlayVisible && !this._model?.error && !!this._model?.url;
  }
  checkOverlays() {
    if (!this.overlayManager) {
      return;
    }
    const hasOverlappingOverlay = this.overlayManager.isOverlappingWithOverlays(this._browserContainer);
    if (hasOverlappingOverlay !== this._overlayVisible) {
      this._overlayVisible = hasOverlappingOverlay;
      this.updateVisibility();
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
      const scheme = URL.parse(url)?.protocol;
      if (!scheme) {
        url = "http://" + url;
      }
      await this._model.loadURL(url);
    }
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
    try {
      const resourceUri = this.input?.resource;
      if (!resourceUri) {
        throw new Error("No resource URI found");
      }
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
      if (this.configurationService.getValue("chat.sendElementsToChat.attachImages") && this._model) {
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
    const tip = $(".browser-welcome-tip");
    tip.textContent = localize("browser.welcomeTip", "Tip: Use the Add Element to Chat feature to reference UI elements when asking Copilot for changes.");
    content.appendChild(tip);
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
  /**
   * Capture a screenshot of the current browser view to use as placeholder background
   */
  async capturePlaceholderSnapshot() {
    if (this._model && !this._overlayVisible) {
      try {
        const buffer = await this._model.captureScreenshot({ quality: 80 });
        this.setBackgroundImage(buffer);
      } catch (error) {
        this.logService.error("BrowserEditor.capturePlaceholderSnapshot: Failed to capture screenshot", error);
      }
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
  layout() {
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
  CONTEXT_BROWSER_FOCUSED,
  CONTEXT_BROWSER_STORAGE_SCOPE
};
//# sourceMappingURL=browserEditor.js.map
