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
var ModalEditorPartImpl_1;
import "./media/modalEditorPart.css";
import { $, addDisposableListener, append, Dimension, EventHelper, EventType, hide, isHTMLElement, setVisibility, show } from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { prepareActions } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { DisposableStore, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { ResizableHTMLElement } from "../../../../base/browser/ui/resizable/resizable.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { MenuWorkbenchToolBar, WorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPart } from "./editorPart.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { EditorPartModalContext, EditorPartModalMaximizedContext, EditorPartModalNavigationContext } from "../../../common/contextkeys.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../common/editor.js";
import { ResourceLabel } from "../../labels.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { localize } from "../../../../nls.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { CLOSE_MODAL_EDITOR_COMMAND_ID, MOVE_MODAL_EDITOR_TO_MAIN_COMMAND_ID, MOVE_MODAL_EDITOR_TO_WINDOW_COMMAND_ID, NAVIGATE_MODAL_EDITOR_NEXT_COMMAND_ID, NAVIGATE_MODAL_EDITOR_PREVIOUS_COMMAND_ID, TOGGLE_MODAL_EDITOR_MAXIMIZED_COMMAND_ID } from "./editorCommands.js";
const MODAL_MIN_WIDTH = 400;
const MODAL_MIN_HEIGHT = 300;
const MODAL_MAX_DEFAULT_WIDTH = 1400;
const MODAL_MAX_DEFAULT_HEIGHT = 900;
const MODAL_BORDER_SIZE = 2;
const MODAL_HEADER_HEIGHT = 33;
const MODAL_SNAP_THRESHOLD = 20;
const MODAL_MAXIMIZED_PADDING = 16;
const defaultModalEditorAllowableCommands = /* @__PURE__ */ new Set([
  // Application
  "workbench.action.quit",
  "workbench.action.reloadWindow",
  "workbench.action.toggleFullScreen",
  // Quick access
  "workbench.action.gotoSymbol",
  "workbench.action.gotoLine",
  // Zoom
  "workbench.action.zoomIn",
  "workbench.action.zoomOut",
  "workbench.action.zoomReset",
  // File operations
  "workbench.action.files.save",
  "workbench.action.files.saveAll",
  "workbench.action.files.revert",
  // Close editors
  "workbench.action.closeActiveEditor",
  "workbench.action.closeAllEditors",
  "workbench.action.closeEditorsInGroup",
  "workbench.action.closeUnmodifiedEditors",
  // Settings
  "workbench.action.openSettings",
  "workbench.action.openSettings2",
  "workbench.action.openSettingsJson",
  "workbench.action.openGlobalSettings",
  "workbench.action.openApplicationSettingsJson",
  "workbench.action.openRawDefaultSettings",
  "workbench.action.openWorkspaceSettings",
  "workbench.action.openWorkspaceSettingsFile",
  "workbench.action.openFolderSettings",
  "workbench.action.openFolderSettingsFile",
  "workbench.action.openRemoteSettings",
  "workbench.action.openRemoteSettingsFile",
  "workbench.action.openAccessibilitySettings",
  "workbench.action.configureLanguageBasedSettings",
  // Keybindings
  "workbench.action.openGlobalKeybindings",
  "workbench.action.openDefaultKeybindingsFile",
  "workbench.action.openGlobalKeybindingsFile",
  "workbench.action.openKeyboardLayoutPicker",
  // Modal editor
  CLOSE_MODAL_EDITOR_COMMAND_ID,
  MOVE_MODAL_EDITOR_TO_MAIN_COMMAND_ID,
  MOVE_MODAL_EDITOR_TO_WINDOW_COMMAND_ID,
  TOGGLE_MODAL_EDITOR_MAXIMIZED_COMMAND_ID,
  NAVIGATE_MODAL_EDITOR_PREVIOUS_COMMAND_ID,
  NAVIGATE_MODAL_EDITOR_NEXT_COMMAND_ID
]);
const USE_MODAL_EDITOR_SETTING = "workbench.editor.useModal";
let ModalEditorPart = class ModalEditorPart2 {
  static {
    __name(this, "ModalEditorPart");
  }
  constructor(editorPartsView, instantiationService, editorService, layoutService, keybindingService, hostService, configurationService) {
    this.editorPartsView = editorPartsView;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.layoutService = layoutService;
    this.keybindingService = keybindingService;
    this.hostService = hostService;
    this.configurationService = configurationService;
  }
  async create(options) {
    const disposables = new DisposableStore();
    const modalElement = $(".monaco-modal-editor-block");
    this.layoutService.mainContainer.appendChild(modalElement);
    disposables.add(toDisposable(() => modalElement.remove()));
    disposables.add(addDisposableListener(modalElement, EventType.MOUSE_DOWN, (e) => {
      if (e.target === modalElement) {
        EventHelper.stop(e, true);
        editorPart.close();
      }
    }));
    let useModalMode = this.configurationService.getValue(USE_MODAL_EDITOR_SETTING);
    disposables.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(USE_MODAL_EDITOR_SETTING)) {
        useModalMode = this.configurationService.getValue(USE_MODAL_EDITOR_SETTING);
      }
    }));
    disposables.add(addDisposableListener(modalElement, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (useModalMode !== "all") {
        const resolved = this.keybindingService.softDispatch(event, this.layoutService.mainContainer);
        if (resolved.kind === 2 && resolved.commandId) {
          if (resolved.commandId.startsWith("workbench.") && !defaultModalEditorAllowableCommands.has(resolved.commandId)) {
            EventHelper.stop(event, true);
          }
        }
      }
    }));
    const resizableElement = new ResizableHTMLElement();
    disposables.add(toDisposable(() => resizableElement.dispose()));
    resizableElement.domNode.classList.add("modal-editor-resizable");
    resizableElement.minSize = new Dimension(MODAL_MIN_WIDTH, MODAL_MIN_HEIGHT);
    modalElement.appendChild(resizableElement.domNode);
    const shadowElement = resizableElement.domNode.appendChild($(".modal-editor-shadow"));
    const titleId = "modal-editor-title";
    const editorPartContainer = $(".part.editor.modal-editor-part", {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId
    });
    shadowElement.appendChild(editorPartContainer);
    const headerElement = editorPartContainer.appendChild($(".modal-editor-header"));
    const titleElement = append(headerElement, $("div.modal-editor-title.show-file-icons"));
    titleElement.id = titleId;
    titleElement.textContent = "";
    const navigationContainer = append(headerElement, $("div.modal-editor-navigation"));
    hide(navigationContainer);
    disposables.add(addDisposableListener(navigationContainer, EventType.DBLCLICK, (e) => EventHelper.stop(e, true)));
    const previousButton = disposables.add(new Button(navigationContainer, { title: localize("previousItem", "Previous") }));
    previousButton.icon = Codicon.chevronLeft;
    previousButton.element.classList.add("modal-editor-nav-button");
    disposables.add(previousButton.onDidClick(() => {
      const navigation = editorPart.navigation;
      if (navigation && navigation.current > 0) {
        navigation.navigate(navigation.current - 1);
      }
    }));
    const navigationLabel = append(navigationContainer, $("span.modal-editor-nav-label"));
    navigationLabel.setAttribute("aria-live", "polite");
    const nextButton = disposables.add(new Button(navigationContainer, { title: localize("nextItem", "Next") }));
    nextButton.icon = Codicon.chevronRight;
    nextButton.element.classList.add("modal-editor-nav-button");
    disposables.add(nextButton.onDidClick(() => {
      const navigation = editorPart.navigation;
      if (navigation && navigation.current < navigation.total - 1) {
        navigation.navigate(navigation.current + 1);
      }
    }));
    const actionBarContainer = append(headerElement, $("div.modal-editor-action-container"));
    const editorPart = disposables.add(this.instantiationService.createInstance(ModalEditorPartImpl, mainWindow.vscodeWindowId, this.editorPartsView, modalElement, options));
    disposables.add(this.editorPartsView.registerPart(editorPart));
    editorPart.create(editorPartContainer);
    disposables.add(Event.once(editorPart.onWillClose)(() => disposables.dispose()));
    disposables.add(Event.runAndSubscribe(editorPart.onDidChangeNavigation, ((navigation) => {
      if (navigation && navigation.total > 1) {
        show(navigationContainer);
        navigationLabel.textContent = localize("navigationCounter", "{0} of {1}", navigation.current + 1, navigation.total);
        previousButton.enabled = navigation.current > 0;
        nextButton.enabled = navigation.current < navigation.total - 1;
      } else {
        hide(navigationContainer);
      }
    }), editorPart.navigation));
    const modalEditorService = this.editorService.createScoped(editorPart, disposables);
    const scopedInstantiationService = disposables.add(editorPart.scopedInstantiationService.createChild(new ServiceCollection([IEditorService, modalEditorService])));
    const editorActionsToolbarContainer = append(actionBarContainer, $("div.modal-editor-editor-actions"));
    const editorActionsToolbar = disposables.add(scopedInstantiationService.createInstance(WorkbenchToolBar, editorActionsToolbarContainer, {
      hiddenItemStrategy: -1,
      highlightToggledItems: true
    }));
    const editorActionsSeparator = append(actionBarContainer, $("div.modal-editor-action-separator"));
    const editorActionsDisposables = disposables.add(new DisposableStore());
    const updateEditorActions = /* @__PURE__ */ __name(() => {
      editorActionsDisposables.clear();
      const editorActions = editorPart.activeGroup.createEditorActions(editorActionsDisposables, MenuId.ModalEditorEditorTitle);
      editorActionsDisposables.add(editorActions.onDidChange(() => updateEditorActions()));
      const { primary, secondary } = editorActions.actions;
      editorActionsToolbar.setActions(prepareActions(primary), prepareActions(secondary));
      const hasActions = primary.length > 0 || secondary.length > 0;
      setVisibility(hasActions, editorActionsSeparator);
    }, "updateEditorActions");
    disposables.add(Event.runAndSubscribe(modalEditorService.onDidActiveEditorChange, () => updateEditorActions()));
    disposables.add(modalEditorService.onDidEditorsChange(() => editorPart.enforceModalPartOptions()));
    disposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.ModalEditorTitle, {
      hiddenItemStrategy: -1,
      highlightToggledItems: true,
      menuOptions: { shouldForwardArgs: true }
    }));
    const label = disposables.add(scopedInstantiationService.createInstance(ResourceLabel, titleElement, {}));
    disposables.add(Event.runAndSubscribe(modalEditorService.onDidActiveEditorChange, () => {
      const activeEditor = editorPart.activeGroup.activeEditor;
      if (activeEditor) {
        const { labelFormat } = editorPart.partOptions;
        label.element.setResource({
          resource: EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: SideBySideEditor.BOTH }),
          name: activeEditor.getName(),
          description: activeEditor.getDescription(
            labelFormat === "short" ? 0 : labelFormat === "long" ? 2 : 1
            /* Verbosity.MEDIUM */
          ) || ""
        }, {
          icon: activeEditor.getIcon(),
          extraClasses: activeEditor.getLabelExtraClasses()
        });
      } else {
        label.element.clear();
      }
    }));
    disposables.add(addDisposableListener(headerElement, EventType.DBLCLICK, (e) => {
      EventHelper.stop(e);
      editorPart.handleHeaderDoubleClick();
    }));
    const dragDisposables = disposables.add(new DisposableStore());
    let didDrag = false;
    disposables.add(addDisposableListener(headerElement, EventType.MOUSE_DOWN, (e) => {
      if (editorPart.maximized) {
        return;
      }
      if (e.button !== 0) {
        return;
      }
      const target = e.target;
      if (target.closest(".monaco-button") || target.closest(".action-item")) {
        return;
      }
      e.preventDefault();
      dragDisposables.clear();
      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = parseFloat(resizableElement.domNode.style.left) || 0;
      const startTop = parseFloat(resizableElement.domNode.style.top) || 0;
      didDrag = false;
      const onMouseMove = /* @__PURE__ */ __name((moveEvent) => {
        didDrag = true;
        EventHelper.stop(moveEvent, true);
        const containerDimension = this.layoutService.mainContainerDimension;
        const titleBarOffset = this.layoutService.mainContainerOffset.top;
        const dialogWidth = resizableElement.size.width;
        const dialogHeight = resizableElement.size.height;
        const minLeft = 0;
        const minTop = titleBarOffset;
        const maxLeft = Math.max(minLeft, containerDimension.width - dialogWidth);
        const maxTop = Math.max(minTop, containerDimension.height - dialogHeight);
        let newLeft = Math.max(minLeft, Math.min(maxLeft, startLeft + (moveEvent.clientX - startX)));
        let newTop = Math.max(minTop, Math.min(maxTop, startTop + (moveEvent.clientY - startY)));
        const centerLeft = (containerDimension.width - dialogWidth) / 2;
        const centerTop = Math.max(titleBarOffset, (containerDimension.height - dialogHeight) / 2);
        if (Math.abs(newLeft - centerLeft) < MODAL_SNAP_THRESHOLD && Math.abs(newTop - centerTop) < MODAL_SNAP_THRESHOLD) {
          newLeft = centerLeft;
          newTop = centerTop;
        }
        resizableElement.domNode.style.left = `${newLeft}px`;
        resizableElement.domNode.style.top = `${newTop}px`;
      }, "onMouseMove");
      const onMouseUp = /* @__PURE__ */ __name((upEvent) => {
        EventHelper.stop(upEvent, true);
        dragDisposables.clear();
        if (didDrag) {
          const currentLeft = parseFloat(resizableElement.domNode.style.left) || 0;
          const currentTop = parseFloat(resizableElement.domNode.style.top) || 0;
          const containerDimension = this.layoutService.mainContainerDimension;
          const titleBarOffset = this.layoutService.mainContainerOffset.top;
          const centerLeft = (containerDimension.width - resizableElement.size.width) / 2;
          const centerTop = Math.max(titleBarOffset, (containerDimension.height - resizableElement.size.height) / 2);
          if (Math.abs(currentLeft - centerLeft) < 1 && Math.abs(currentTop - centerTop) < 1) {
            editorPart.position = void 0;
          } else {
            editorPart.position = { left: currentLeft, top: currentTop };
          }
        }
      }, "onMouseUp");
      dragDisposables.add(addDisposableListener(mainWindow, EventType.MOUSE_MOVE, onMouseMove, true));
      dragDisposables.add(addDisposableListener(mainWindow, EventType.MOUSE_UP, onMouseUp, true));
    }));
    disposables.add(addDisposableListener(headerElement, EventType.CLICK, (e) => {
      const wasDrag = didDrag;
      didDrag = false;
      if (wasDrag) {
        return;
      }
      EventHelper.stop(e);
      editorPart.activeGroup.focus();
    }));
    let isResizing = false;
    let resizeStartLeft = 0;
    let resizeStartTop = 0;
    let resizeStartSize = Dimension.None;
    disposables.add(resizableElement.onDidWillResize(() => {
      isResizing = true;
      resizeStartLeft = parseFloat(resizableElement.domNode.style.left) || 0;
      resizeStartTop = parseFloat(resizableElement.domNode.style.top) || 0;
      resizeStartSize = new Dimension(resizableElement.size.width, resizableElement.size.height);
    }));
    disposables.add(resizableElement.onDidResize((e) => {
      const deltaWidth = e.dimension.width - resizeStartSize.width;
      const deltaHeight = e.dimension.height - resizeStartSize.height;
      if (e.west) {
        resizableElement.domNode.style.left = `${resizeStartLeft - deltaWidth}px`;
      }
      if (e.north) {
        resizableElement.domNode.style.top = `${resizeStartTop - deltaHeight}px`;
      }
      editorPart.layout(e.dimension.width - MODAL_BORDER_SIZE, e.dimension.height - MODAL_BORDER_SIZE - MODAL_HEADER_HEIGHT, 0, 0);
      if (e.done) {
        isResizing = false;
        const defaultSize = getDefaultSize();
        if (e.dimension.width === defaultSize.width && e.dimension.height === defaultSize.height) {
          editorPart.size = void 0;
          editorPart.position = void 0;
          layoutModal();
        } else {
          editorPart.size = new Dimension(e.dimension.width, e.dimension.height);
          editorPart.position = {
            left: parseFloat(resizableElement.domNode.style.left) || 0,
            top: parseFloat(resizableElement.domNode.style.top) || 0
          };
        }
      }
    }));
    const getDefaultSize = /* @__PURE__ */ __name(() => {
      const containerDimension = this.layoutService.mainContainerDimension;
      const titleBarOffset = this.layoutService.mainContainerOffset.top;
      const availableHeight = Math.max(containerDimension.height - titleBarOffset, 0);
      const targetWidth = containerDimension.width * 0.8;
      const targetHeight = availableHeight * 0.8;
      const width = Math.min(targetWidth, MODAL_MAX_DEFAULT_WIDTH, containerDimension.width);
      const height = Math.min(targetHeight, MODAL_MAX_DEFAULT_HEIGHT, availableHeight);
      return new Dimension(width, height);
    }, "getDefaultSize");
    const layoutModal = /* @__PURE__ */ __name(() => {
      if (isResizing) {
        return;
      }
      const containerDimension = this.layoutService.mainContainerDimension;
      const titleBarOffset = this.layoutService.mainContainerOffset.top;
      const availableHeight = Math.max(containerDimension.height - titleBarOffset, 0);
      const defaultSize = getDefaultSize();
      let width;
      let height;
      if (editorPart.maximized) {
        const verticalPadding = Math.max(titleBarOffset, MODAL_MAXIMIZED_PADDING);
        width = Math.max(containerDimension.width - MODAL_MAXIMIZED_PADDING, 0);
        height = Math.max(availableHeight - verticalPadding, 0);
      } else if (editorPart.size) {
        width = Math.min(editorPart.size.width, containerDimension.width);
        height = Math.min(editorPart.size.height, availableHeight);
      } else {
        width = defaultSize.width;
        height = defaultSize.height;
      }
      height = Math.min(height, availableHeight);
      resizableElement.maxSize = new Dimension(containerDimension.width, availableHeight);
      resizableElement.preferredSize = defaultSize;
      resizableElement.layout(height, width);
      const canResize = !editorPart.maximized;
      resizableElement.enableSashes(canResize, canResize, canResize, canResize);
      if (!editorPart.maximized && editorPart.position) {
        const clampedLeft = Math.max(0, Math.min(editorPart.position.left, containerDimension.width - width));
        const clampedTop = Math.max(titleBarOffset, Math.min(editorPart.position.top, titleBarOffset + availableHeight - height));
        resizableElement.domNode.style.left = `${clampedLeft}px`;
        resizableElement.domNode.style.top = `${clampedTop}px`;
      } else {
        const left = (containerDimension.width - width) / 2;
        const top = Math.max(titleBarOffset, (containerDimension.height - height) / 2);
        resizableElement.domNode.style.left = `${left}px`;
        resizableElement.domNode.style.top = `${top}px`;
      }
      editorPart.layout(width - MODAL_BORDER_SIZE, height - MODAL_BORDER_SIZE - MODAL_HEADER_HEIGHT, 0, 0);
    }, "layoutModal");
    disposables.add(Event.runAndSubscribe(this.layoutService.onDidLayoutMainContainer, layoutModal));
    disposables.add(editorPart.onDidChangeMaximized(() => layoutModal()));
    disposables.add(editorPart.onDidRequestLayout(() => layoutModal()));
    this.hostService.setWindowDimmed(mainWindow, true);
    disposables.add(toDisposable(() => this.hostService.setWindowDimmed(mainWindow, false)));
    editorPart.activeGroup.focus();
    return {
      part: editorPart,
      instantiationService: scopedInstantiationService,
      disposables
    };
  }
};
ModalEditorPart = __decorate([
  __param(1, IInstantiationService),
  __param(2, IEditorService),
  __param(3, IWorkbenchLayoutService),
  __param(4, IKeybindingService),
  __param(5, IHostService),
  __param(6, IConfigurationService)
], ModalEditorPart);
let ModalEditorPartImpl = class ModalEditorPartImpl2 extends EditorPart {
  static {
    __name(this, "ModalEditorPartImpl");
  }
  static {
    ModalEditorPartImpl_1 = this;
  }
  static {
    this.COUNTER = 1;
  }
  get maximized() {
    return this._maximized;
  }
  get size() {
    return this._size;
  }
  set size(value) {
    this._size = value;
  }
  get position() {
    return this._position;
  }
  set position(value) {
    this._position = value;
  }
  get navigation() {
    return this._navigation;
  }
  constructor(windowId, editorPartsView, modalElement, options, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService) {
    const id = ModalEditorPartImpl_1.COUNTER++;
    super(editorPartsView, `workbench.parts.modalEditor.${id}`, localize("modalEditorPart", "Modal Editor Area"), windowId, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService);
    this.modalElement = modalElement;
    this._onWillClose = this._register(new Emitter());
    this.onWillClose = this._onWillClose.event;
    this._onDidChangeMaximized = this._register(new Emitter());
    this.onDidChangeMaximized = this._onDidChangeMaximized.event;
    this._onDidRequestLayout = this._register(new Emitter());
    this.onDidRequestLayout = this._onDidRequestLayout.event;
    this._onDidChangeNavigation = this._register(new Emitter());
    this.onDidChangeNavigation = this._onDidChangeNavigation.event;
    this.optionsDisposable = this._register(new MutableDisposable());
    this.previousMainWindowActiveElement = null;
    this._maximized = options?.maximized ?? false;
    this._size = options?.size;
    this._position = options?.position;
    this._navigation = options?.navigation;
    if (this._maximized) {
      this.savedSize = this._size;
      this.savedPosition = this._position;
    }
    this.enforceModalPartOptions();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(USE_MODAL_EDITOR_SETTING)) {
        this.enforceModalPartOptions();
      }
    }));
  }
  create(parent, options) {
    this.previousMainWindowActiveElement = mainWindow.document.activeElement;
    super.create(parent, options);
  }
  enforceModalPartOptions() {
    const useModalForAll = this.configurationService.getValue(USE_MODAL_EDITOR_SETTING) === "all";
    const editorCount = this.groups.reduce((count, group) => count + group.count, 0);
    const showTabs = useModalForAll && editorCount > 1 ? "multiple" : "none";
    this.optionsDisposable.value = this.enforcePartOptions({
      showTabs,
      enablePreview: true,
      closeEmptyGroups: true,
      tabActionCloseVisibility: showTabs !== "none",
      editorActionsLocation: "hidden",
      tabHeight: "default",
      wrapTabs: false,
      allowDropIntoGroup: false
    });
  }
  updateOptions(options) {
    if (typeof options?.maximized === "boolean" && options.maximized !== this._maximized) {
      this.toggleMaximized();
    }
    this._navigation = options?.navigation;
    this._onDidChangeNavigation.fire(options?.navigation);
  }
  toggleMaximized() {
    this._maximized = !this._maximized;
    if (this._maximized) {
      this.savedSize = this._size;
      this.savedPosition = this._position;
    } else {
      this._size = this.savedSize;
      this._position = this.savedPosition;
      this.savedSize = void 0;
      this.savedPosition = void 0;
    }
    this._onDidChangeMaximized.fire(this._maximized);
  }
  handleHeaderDoubleClick() {
    if (this._maximized) {
      this.savedSize = void 0;
      this.savedPosition = void 0;
      this.toggleMaximized();
    } else if (this._size) {
      this._size = void 0;
      this._position = void 0;
      this._onDidRequestLayout.fire();
    } else {
      this.toggleMaximized();
    }
  }
  handleContextKeys() {
    const isModalEditorPartContext = EditorPartModalContext.bindTo(this.scopedContextKeyService);
    isModalEditorPartContext.set(true);
    const isMaximizedContext = EditorPartModalMaximizedContext.bindTo(this.scopedContextKeyService);
    isMaximizedContext.set(this._maximized);
    this._register(this.onDidChangeMaximized((maximized) => isMaximizedContext.set(maximized)));
    const hasNavigationContext = EditorPartModalNavigationContext.bindTo(this.scopedContextKeyService);
    hasNavigationContext.set(!!this._navigation && this._navigation.total > 1);
    this._register(this.onDidChangeNavigation((navigation) => hasNavigationContext.set(!!navigation && navigation.total > 1)));
    super.handleContextKeys();
  }
  removeGroup(group, preserveFocus) {
    const groupView = this.assertGroupView(group);
    if (this.count === 1 && this.activeGroup === groupView) {
      this.doRemoveLastGroup();
    } else {
      super.removeGroup(group, preserveFocus);
    }
  }
  doRemoveLastGroup() {
    const activeMainGroup = this.editorPartsView.mainPart.activeGroup;
    this.editorPartsView.mainPart.activateGroup(
      activeMainGroup,
      void 0,
      1
      /* GroupActivationReason.PART_CLOSE */
    );
    const mainEditorPartContainer = this.layoutService.getContainer(
      mainWindow,
      "workbench.parts.editor"
      /* Parts.EDITOR_PART */
    );
    if (!isHTMLElement(this.previousMainWindowActiveElement) || // invalid previous element
    !this.previousMainWindowActiveElement.isConnected || // previous element no longer in the DOM
    mainEditorPartContainer?.contains(this.previousMainWindowActiveElement)) {
      activeMainGroup.focus();
    } else {
      this.previousMainWindowActiveElement.focus();
    }
    this.doClose({ mergeConfirmingEditorsToMainPart: false });
  }
  saveState() {
    return;
  }
  close(options) {
    return this.doClose({ ...options, mergeConfirmingEditorsToMainPart: true });
  }
  doClose(options) {
    let result = true;
    if (options?.mergeConfirmingEditorsToMainPart) {
      if (!options.mergeAllEditorsToMainPart) {
        for (const group of this.groups) {
          group.closeAllEditors({ excludeConfirming: true });
        }
      }
      result = this.mergeGroupsToMainPart();
      if (!result) {
        return false;
      }
    }
    this._onWillClose.fire();
    return result;
  }
  mergeGroupsToMainPart() {
    if (!this.groups.some((group) => group.count > 0)) {
      return true;
    }
    let targetGroup = void 0;
    for (const group of this.editorPartsView.mainPart.getGroups(
      1
      /* GroupsOrder.MOST_RECENTLY_ACTIVE */
    )) {
      if (!group.isLocked) {
        targetGroup = group;
        break;
      }
    }
    if (!targetGroup) {
      targetGroup = this.editorPartsView.mainPart.addGroup(
        this.editorPartsView.mainPart.activeGroup,
        this.partOptions.openSideBySideDirection === "right" ? 3 : 1
        /* GroupDirection.DOWN */
      );
    }
    const result = this.mergeAllGroups(targetGroup, {
      // Try to reduce the impact of closing the modal
      // as much as possible by not changing existing editors
      // in the main window.
      preserveExistingIndex: true
    });
    targetGroup.focus();
    return result;
  }
  dispose() {
    this._navigation = void 0;
    super.dispose();
  }
};
ModalEditorPartImpl = ModalEditorPartImpl_1 = __decorate([
  __param(4, IInstantiationService),
  __param(5, IThemeService),
  __param(6, IConfigurationService),
  __param(7, IStorageService),
  __param(8, IWorkbenchLayoutService),
  __param(9, IHostService),
  __param(10, IContextKeyService)
], ModalEditorPartImpl);
export {
  ModalEditorPart
};
//# sourceMappingURL=modalEditorPart.js.map
