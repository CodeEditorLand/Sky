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
import "./media/simpleBrowserOverlay.css";
import { combinedDisposable, DisposableMap, DisposableStore, toDisposable } from "../../../../../base/common/lifecycle.js";
import { autorun, derivedOpts, observableFromEvent, observableSignalFromEvent } from "../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize } from "../../../../../nls.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { EditorGroupView } from "../../../../browser/parts/editor/editorGroupView.js";
import { Event } from "../../../../../base/common/event.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { IHostService } from "../../../../services/host/browser/host.js";
import { IChatWidgetService } from "../chat.js";
import { Button, ButtonWithDropdown } from "../../../../../base/browser/ui/button/button.js";
import { defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { addDisposableListener } from "../../../../../base/browser/dom.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { cleanupOldImages, createFileForMedia } from "../chatImageUtils.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IPreferencesService } from "../../../../services/preferences/common/preferences.js";
import { IBrowserElementsService } from "../../../../services/browserElements/browser/browserElementsService.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { toAction } from "../../../../../base/common/actions.js";
import { getDisplayNameFromOuterHTML } from "../../../../../platform/browserElements/common/browserElements.js";
let SimpleBrowserOverlayWidget = class SimpleBrowserOverlayWidget2 {
  static {
    __name(this, "SimpleBrowserOverlayWidget");
  }
  constructor(_editor, _container, _hostService, _chatWidgetService, fileService, environmentService, logService, configurationService, _preferencesService, _browserElementsService, contextMenuService) {
    this._editor = _editor;
    this._container = _container;
    this._hostService = _hostService;
    this._chatWidgetService = _chatWidgetService;
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.logService = logService;
    this.configurationService = configurationService;
    this._preferencesService = _preferencesService;
    this._browserElementsService = _browserElementsService;
    this.contextMenuService = contextMenuService;
    this._showStore = new DisposableStore();
    this._timeout = void 0;
    this._activeLocator = void 0;
    this._showStore.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.sendElementsToChat.enabled")) {
        if (this.configurationService.getValue("chat.sendElementsToChat.enabled")) {
          this.showElement(this._domNode);
        } else {
          this.hideElement(this._domNode);
        }
      }
    }));
    this.imagesFolder = joinPath(this.environmentService.workspaceStorageHome, "vscode-chat-images");
    cleanupOldImages(this.fileService, this.logService, this.imagesFolder);
    this._domNode = document.createElement("div");
    this._domNode.className = "element-selection-message";
    const mainContent = document.createElement("div");
    mainContent.className = "element-selection-main-content";
    const message = document.createElement("span");
    const startSelectionMessage = localize("elementSelectionMessage", "Add element to chat");
    message.textContent = startSelectionMessage;
    mainContent.appendChild(message);
    let cts;
    const actions = [];
    actions.push(toAction({
      id: "singleSelection",
      label: localize("selectElementDropdown", "Select an Element"),
      enabled: true,
      run: /* @__PURE__ */ __name(async () => {
        await startElementSelection();
      }, "run")
    }), toAction({
      id: "continuousSelection",
      label: localize("continuousSelectionDropdown", "Continuous Selection"),
      enabled: true,
      run: /* @__PURE__ */ __name(async () => {
        this._editor.focus();
        cts = new CancellationTokenSource();
        message.textContent = localize("elementSelectionInProgress", "Selecting element...");
        this.hideElement(startButton.element);
        this.showElement(cancelButton.element);
        cancelButton.label = localize("finishSelectionLabel", "Done");
        while (!cts.token.isCancellationRequested) {
          try {
            await this.addElementToChat(cts);
          } catch (err) {
            this.logService.error("Failed to select this element.", err);
            cts.cancel();
            break;
          }
        }
        message.textContent = localize("elementSelectionComplete", "Element added to chat");
        finishedSelecting();
      }, "run")
    }));
    const startButton = this._showStore.add(new ButtonWithDropdown(mainContent, {
      actions,
      addPrimaryActionToDropdown: false,
      contextMenuProvider: this.contextMenuService,
      supportShortLabel: true,
      title: localize("selectAnElement", "Click to select an element."),
      supportIcons: true,
      ...defaultButtonStyles
    }));
    startButton.primaryButton.label = localize("startSelection", "Start");
    startButton.element.classList.add("element-selection-start");
    const cancelButton = this._showStore.add(new Button(mainContent, { ...defaultButtonStyles, supportIcons: true, title: localize("cancelSelection", "Click to cancel selection.") }));
    cancelButton.element.className = "element-selection-cancel hidden";
    const cancelButtonLabel = localize("cancelSelectionLabel", "Cancel");
    cancelButton.label = cancelButtonLabel;
    const configure = this._showStore.add(new Button(mainContent, { supportIcons: true, title: localize("chat.configureElements", "Configure Attachments Sent") }));
    configure.icon = Codicon.gear;
    const collapseOverlay = this._showStore.add(new Button(mainContent, { supportIcons: true, title: localize("chat.hideOverlay", "Collapse Overlay") }));
    collapseOverlay.icon = Codicon.chevronRight;
    const nextSelection = this._showStore.add(new Button(mainContent, { supportIcons: true, title: localize("chat.nextSelection", "Select Again") }));
    nextSelection.icon = Codicon.close;
    nextSelection.element.classList.add("hidden");
    const expandContainer = document.createElement("div");
    expandContainer.className = "element-expand-container hidden";
    const expandOverlay = this._showStore.add(new Button(expandContainer, { supportIcons: true, title: localize("chat.expandOverlay", "Expand Overlay") }));
    expandOverlay.icon = Codicon.layout;
    this._domNode.appendChild(mainContent);
    this._domNode.appendChild(expandContainer);
    const resetButtons = /* @__PURE__ */ __name(() => {
      this.hideElement(nextSelection.element);
      this.showElement(startButton.element);
      this.showElement(collapseOverlay.element);
    }, "resetButtons");
    const finishedSelecting = /* @__PURE__ */ __name(() => {
      this.hideElement(cancelButton.element);
      cancelButton.label = cancelButtonLabel;
      this.hideElement(collapseOverlay.element);
      this.showElement(nextSelection.element);
      this._timeout = setTimeout(() => {
        message.textContent = startSelectionMessage;
        resetButtons();
      }, 3e3);
    }, "finishedSelecting");
    const startElementSelection = /* @__PURE__ */ __name(async () => {
      cts = new CancellationTokenSource();
      this._editor.focus();
      message.textContent = localize("elementSelectionInProgress", "Selecting element...");
      this.hideElement(startButton.element);
      this.showElement(cancelButton.element);
      await this.addElementToChat(cts);
      message.textContent = localize("elementSelectionComplete", "Element added to chat");
      finishedSelecting();
    }, "startElementSelection");
    this._showStore.add(addDisposableListener(startButton.primaryButton.element, "click", async () => {
      await startElementSelection();
    }));
    this._showStore.add(addDisposableListener(cancelButton.element, "click", () => {
      cts.cancel();
      message.textContent = localize("elementCancelMessage", "Selection canceled");
      finishedSelecting();
    }));
    this._showStore.add(addDisposableListener(collapseOverlay.element, "click", () => {
      this.hideElement(mainContent);
      this.showElement(expandContainer);
    }));
    this._showStore.add(addDisposableListener(expandOverlay.element, "click", () => {
      this.showElement(mainContent);
      this.hideElement(expandContainer);
    }));
    this._showStore.add(addDisposableListener(nextSelection.element, "click", () => {
      clearTimeout(this._timeout);
      message.textContent = startSelectionMessage;
      resetButtons();
    }));
    this._showStore.add(addDisposableListener(configure.element, "click", () => {
      this._preferencesService.openSettings({ jsonEditor: false, query: "@id:chat.sendElementsToChat.enabled,chat.sendElementsToChat.attachCSS,chat.sendElementsToChat.attachImages" });
    }));
  }
  setActiveLocator(locator) {
    this._activeLocator = locator;
  }
  hideElement(element) {
    if (element.classList.contains("hidden")) {
      return;
    }
    element.classList.add("hidden");
  }
  showElement(element) {
    if (!element.classList.contains("hidden")) {
      return;
    }
    element.classList.remove("hidden");
  }
  async addElementToChat(cts) {
    const editorContainer = this._container.querySelector(".editor-container");
    const editorContainerPosition = editorContainer ? editorContainer.getBoundingClientRect() : this._container.getBoundingClientRect();
    const elementData = await this._browserElementsService.getElementData({
      x: editorContainerPosition.x,
      y: editorContainerPosition.y + 32.4,
      // Height of the title bar
      width: editorContainerPosition.width,
      height: editorContainerPosition.height - 32.4
    }, cts.token, this._activeLocator);
    if (!elementData) {
      throw new Error("Element data not found");
    }
    const bounds = elementData.bounds;
    const toAttach = [];
    const widget = await this._chatWidgetService.revealWidget() ?? this._chatWidgetService.lastFocusedWidget;
    const attachCss = this.configurationService.getValue("chat.sendElementsToChat.attachCSS");
    let value = (attachCss ? "Attached HTML and CSS Context" : "Attached HTML Context") + "\n\n" + elementData.outerHTML;
    if (attachCss) {
      value += "\n\n" + elementData.computedStyle;
    }
    const displayName = getDisplayNameFromOuterHTML(elementData.outerHTML);
    toAttach.push({
      id: "element-" + Date.now(),
      name: displayName,
      fullName: displayName,
      value,
      kind: "element",
      icon: ThemeIcon.fromId(Codicon.layout.id)
    });
    if (this.configurationService.getValue("chat.sendElementsToChat.attachImages")) {
      this._domNode.style.display = "none";
      await new Promise((resolve) => setTimeout(resolve, 100));
      const screenshot = await this._hostService.getScreenshot(bounds);
      if (!screenshot) {
        throw new Error("Screenshot failed");
      }
      const fileReference = await createFileForMedia(this.fileService, this.imagesFolder, screenshot.buffer, "image/png");
      toAttach.push({
        id: "element-screenshot-" + Date.now(),
        name: "Element Screenshot",
        fullName: "Element Screenshot",
        kind: "image",
        value: screenshot.buffer,
        references: fileReference ? [{ reference: fileReference, kind: "reference" }] : []
      });
      this._domNode.style.display = "";
    }
    widget?.attachmentModel?.addContext(...toAttach);
  }
  dispose() {
    this._showStore.dispose();
  }
  getDomNode() {
    return this._domNode;
  }
};
SimpleBrowserOverlayWidget = __decorate([
  __param(2, IHostService),
  __param(3, IChatWidgetService),
  __param(4, IFileService),
  __param(5, IEnvironmentService),
  __param(6, ILogService),
  __param(7, IConfigurationService),
  __param(8, IPreferencesService),
  __param(9, IBrowserElementsService),
  __param(10, IContextMenuService)
], SimpleBrowserOverlayWidget);
let SimpleBrowserOverlayController = class SimpleBrowserOverlayController2 {
  static {
    __name(this, "SimpleBrowserOverlayController");
  }
  constructor(container, group, instaService, configurationService, _browserElementsService) {
    this.configurationService = configurationService;
    this._browserElementsService = _browserElementsService;
    this._store = new DisposableStore();
    this._domNode = document.createElement("div");
    if (!this.configurationService.getValue("chat.sendElementsToChat.enabled")) {
      return;
    }
    this._domNode.classList.add("chat-simple-browser-overlay");
    this._domNode.style.position = "absolute";
    this._domNode.style.bottom = `5px`;
    this._domNode.style.right = `5px`;
    this._domNode.style.zIndex = `100`;
    const widget = instaService.createInstance(SimpleBrowserOverlayWidget, group, container);
    this._domNode.appendChild(widget.getDomNode());
    this._store.add(toDisposable(() => this._domNode.remove()));
    this._store.add(widget);
    const connectingWebviewElement = document.createElement("div");
    connectingWebviewElement.className = "connecting-webview-element";
    let cts = new CancellationTokenSource();
    const show = /* @__PURE__ */ __name(async (locator) => {
      widget.setActiveLocator(locator);
      connectingWebviewElement.textContent = localize("connectingWebviewElement", "Connecting to webview...");
      if (!container.contains(connectingWebviewElement)) {
        container.appendChild(connectingWebviewElement);
      }
      cts = new CancellationTokenSource();
      try {
        await this._browserElementsService.startDebugSession(cts.token, locator);
      } catch (error) {
        connectingWebviewElement.textContent = localize("reopenErrorWebviewElement", "Please reopen the preview.");
        return;
      }
      if (!container.contains(this._domNode)) {
        container.appendChild(this._domNode);
      }
      connectingWebviewElement.remove();
    }, "show");
    const hide = /* @__PURE__ */ __name(() => {
      widget.setActiveLocator(void 0);
      if (container.contains(this._domNode)) {
        cts.cancel();
        this._domNode.remove();
      }
      connectingWebviewElement.remove();
    }, "hide");
    const activeEditorSignal = observableSignalFromEvent(this, Event.any(group.onDidActiveEditorChange, group.onDidModelChange));
    const activeIdObs = derivedOpts({}, (r) => {
      activeEditorSignal.read(r);
      const editor = group.activeEditorPane;
      const isSimpleBrowser = editor?.input.editorId === "mainThreadWebview-simpleBrowser.view";
      const isLiveServer = editor?.input.editorId === "mainThreadWebview-browserPreview";
      if (isSimpleBrowser || isLiveServer) {
        const webviewInput = editor.input;
        return webviewInput.webview.container.id;
      }
      return void 0;
    });
    this._store.add(autorun((r) => {
      const webviewId = activeIdObs.read(r);
      if (!webviewId) {
        hide();
        return;
      }
      show({ webviewId });
    }));
  }
  dispose() {
    this._store.dispose();
  }
};
SimpleBrowserOverlayController = __decorate([
  __param(2, IInstantiationService),
  __param(3, IConfigurationService),
  __param(4, IBrowserElementsService)
], SimpleBrowserOverlayController);
let SimpleBrowserOverlay = class SimpleBrowserOverlay2 {
  static {
    __name(this, "SimpleBrowserOverlay");
  }
  static {
    this.ID = "chat.simpleBrowser.overlay";
  }
  constructor(editorGroupsService, instantiationService) {
    this._store = new DisposableStore();
    const editorGroups = observableFromEvent(this, Event.any(editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup), () => editorGroupsService.groups);
    const overlayWidgets = new DisposableMap();
    this._store.add(autorun((r) => {
      const toDelete = new Set(overlayWidgets.keys());
      const groups = editorGroups.read(r);
      for (const group of groups) {
        if (!(group instanceof EditorGroupView)) {
          continue;
        }
        toDelete.delete(group);
        if (!overlayWidgets.has(group)) {
          const scopedInstaService = instantiationService.createChild(new ServiceCollection([IContextKeyService, group.scopedContextKeyService]));
          const container = group.element;
          const ctrl = scopedInstaService.createInstance(SimpleBrowserOverlayController, container, group);
          overlayWidgets.set(group, combinedDisposable(ctrl, scopedInstaService));
        }
      }
      for (const group of toDelete) {
        overlayWidgets.deleteAndDispose(group);
      }
    }));
  }
  dispose() {
    this._store.dispose();
  }
};
SimpleBrowserOverlay = __decorate([
  __param(0, IEditorGroupsService),
  __param(1, IInstantiationService)
], SimpleBrowserOverlay);
export {
  SimpleBrowserOverlay
};
//# sourceMappingURL=simpleBrowserEditorOverlay.js.map
