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
import { $, addDisposableListener, append, EventHelper, EventType, hide, isHTMLElement, show } from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { DisposableStore, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
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
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { localize } from "../../../../nls.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { CLOSE_MODAL_EDITOR_COMMAND_ID, MOVE_MODAL_EDITOR_TO_MAIN_COMMAND_ID, MOVE_MODAL_EDITOR_TO_WINDOW_COMMAND_ID, NAVIGATE_MODAL_EDITOR_NEXT_COMMAND_ID, NAVIGATE_MODAL_EDITOR_PREVIOUS_COMMAND_ID, TOGGLE_MODAL_EDITOR_MAXIMIZED_COMMAND_ID } from "./editorCommands.js";
const defaultModalEditorAllowableCommands = /* @__PURE__ */ new Set([
  "workbench.action.quit",
  "workbench.action.reloadWindow",
  "workbench.action.closeActiveEditor",
  "workbench.action.closeAllEditors",
  "workbench.action.files.save",
  "workbench.action.files.saveAll",
  CLOSE_MODAL_EDITOR_COMMAND_ID,
  MOVE_MODAL_EDITOR_TO_MAIN_COMMAND_ID,
  MOVE_MODAL_EDITOR_TO_WINDOW_COMMAND_ID,
  TOGGLE_MODAL_EDITOR_MAXIMIZED_COMMAND_ID,
  NAVIGATE_MODAL_EDITOR_PREVIOUS_COMMAND_ID,
  NAVIGATE_MODAL_EDITOR_NEXT_COMMAND_ID
]);
let ModalEditorPart = class ModalEditorPart2 {
  static {
    __name(this, "ModalEditorPart");
  }
  constructor(editorPartsView, instantiationService, editorService, layoutService, keybindingService, hostService, environmentService) {
    this.editorPartsView = editorPartsView;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.layoutService = layoutService;
    this.keybindingService = keybindingService;
    this.hostService = hostService;
    this.environmentService = environmentService;
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
    disposables.add(addDisposableListener(modalElement, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(
        9
        /* KeyCode.Escape */
      )) {
        EventHelper.stop(event, true);
        editorPart.close();
      } else if (!this.environmentService.isSessionsWindow) {
        const resolved = this.keybindingService.softDispatch(event, this.layoutService.mainContainer);
        if (resolved.kind === 2 && resolved.commandId) {
          if (resolved.commandId.startsWith("workbench.") && !defaultModalEditorAllowableCommands.has(resolved.commandId)) {
            EventHelper.stop(event, true);
          }
        }
      }
    }));
    const shadowElement = modalElement.appendChild($(".modal-editor-shadow"));
    const titleId = "modal-editor-title";
    const editorPartContainer = $(".part.editor.modal-editor-part", {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId,
      tabIndex: -1
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
      editorPart.notifyActiveEditorChanged();
    }));
    disposables.add(addDisposableListener(headerElement, EventType.DBLCLICK, (e) => {
      EventHelper.stop(e);
      editorPart.toggleMaximized();
    }));
    const layoutModal = /* @__PURE__ */ __name(() => {
      const containerDimension = this.layoutService.mainContainerDimension;
      const titleBarOffset = this.layoutService.mainContainerOffset.top;
      const availableHeight = Math.max(containerDimension.height - titleBarOffset, 0);
      let width;
      let height;
      if (editorPart.maximized) {
        const horizontalPadding = 16;
        const verticalPadding = Math.max(titleBarOffset, 16);
        width = Math.max(containerDimension.width - horizontalPadding, 0);
        height = Math.max(availableHeight - verticalPadding, 0);
      } else {
        const maxWidth = 1400;
        const maxHeight = 900;
        const targetWidth = containerDimension.width * 0.8;
        const targetHeight = availableHeight * 0.8;
        width = Math.min(targetWidth, maxWidth, containerDimension.width);
        height = Math.min(targetHeight, maxHeight, availableHeight);
      }
      height = Math.min(height, availableHeight);
      editorPartContainer.style.width = `${width}px`;
      editorPartContainer.style.height = `${height}px`;
      const borderSize = 2;
      const headerHeight = 32 + 1;
      editorPart.layout(width - borderSize, height - borderSize - headerHeight, 0, 0);
    }, "layoutModal");
    disposables.add(Event.runAndSubscribe(this.layoutService.onDidLayoutMainContainer, layoutModal));
    disposables.add(editorPart.onDidChangeMaximized(() => layoutModal()));
    this.hostService.setWindowDimmed(mainWindow, true);
    disposables.add(toDisposable(() => this.hostService.setWindowDimmed(mainWindow, false)));
    editorPartContainer.focus();
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
  __param(6, IWorkbenchEnvironmentService)
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
    this._onDidChangeNavigation = this._register(new Emitter());
    this.onDidChangeNavigation = this._onDidChangeNavigation.event;
    this.optionsDisposable = this._register(new MutableDisposable());
    this.previousMainWindowActiveElement = null;
    this._maximized = options?.maximized ?? false;
    this._navigation = options?.navigation;
    this.enforceModalPartOptions();
  }
  create(parent, options) {
    this.previousMainWindowActiveElement = mainWindow.document.activeElement;
    super.create(parent, options);
  }
  enforceModalPartOptions() {
    const editorCount = this.groups.reduce((count, group) => count + group.count, 0);
    this.optionsDisposable.value = this.enforcePartOptions({
      showTabs: editorCount > 1 ? "multiple" : "none",
      enablePreview: true,
      closeEmptyGroups: true,
      tabActionCloseVisibility: editorCount > 1,
      editorActionsLocation: "default",
      tabHeight: "default",
      wrapTabs: false,
      allowDropIntoGroup: false
    });
  }
  notifyActiveEditorChanged() {
    this.enforceModalPartOptions();
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
    this._onDidChangeMaximized.fire(this._maximized);
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
