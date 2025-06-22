var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onDidChangeFullscreen } from "../../../../base/browser/browser.js";
import { $, getActiveWindow, hide, show } from "../../../../base/browser/dom.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { DisposableStore, markAsSingleton, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { isNative } from "../../../../base/common/platform.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { hasCustomTitlebar } from "../../../../platform/window/common/window.js";
import { EditorPart } from "./editorPart.js";
import { WindowTitle } from "../titlebar/windowTitle.js";
import { IAuxiliaryWindowService } from "../../../services/auxiliaryWindow/browser/auxiliaryWindowService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IWorkbenchLayoutService, shouldShowCustomTitleBar } from "../../../services/layout/browser/layoutService.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
import { ITitleService } from "../../../services/title/browser/titleService.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { localize, localize2 } from "../../../../nls.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { IsAuxiliaryWindowContext, IsAuxiliaryWindowFocusedContext, IsCompactTitleBarContext } from "../../../common/contextkeys.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
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
var AuxiliaryEditorPart_1;
var AuxiliaryEditorPartImpl_1;
const compactWindowEmitter = markAsSingleton(new Emitter());
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleCompactAuxiliaryWindow",
      title: localize2("toggleCompactAuxiliaryWindow", "Toggle Window Compact Mode"),
      category: Categories.View,
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext
    });
  }
  async run() {
    compactWindowEmitter.fire({ windowId: getActiveWindow().vscodeWindowId, compact: "toggle" });
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.enableCompactAuxiliaryWindow",
      title: localize("enableCompactAuxiliaryWindow", "Turn On Compact Mode"),
      icon: Codicon.screenFull,
      menu: {
        id: MenuId.LayoutControlMenu,
        when: ContextKeyExpr.and(IsCompactTitleBarContext.toNegated(), IsAuxiliaryWindowContext),
        order: 0
      }
    });
  }
  async run() {
    compactWindowEmitter.fire({ windowId: getActiveWindow().vscodeWindowId, compact: true });
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.disableCompactAuxiliaryWindow",
      title: localize("disableCompactAuxiliaryWindow", "Turn Off Compact Mode"),
      icon: Codicon.screenNormal,
      menu: {
        id: MenuId.LayoutControlMenu,
        when: ContextKeyExpr.and(IsCompactTitleBarContext, IsAuxiliaryWindowContext),
        order: 0
      }
    });
  }
  async run() {
    compactWindowEmitter.fire({ windowId: getActiveWindow().vscodeWindowId, compact: false });
  }
});
let AuxiliaryEditorPart = class AuxiliaryEditorPart2 {
  static {
    __name(this, "AuxiliaryEditorPart");
  }
  static {
    AuxiliaryEditorPart_1 = this;
  }
  static {
    this.STATUS_BAR_VISIBILITY = "workbench.statusBar.visible";
  }
  constructor(editorPartsView, instantiationService, auxiliaryWindowService, lifecycleService, configurationService, statusbarService, titleService, editorService, layoutService) {
    this.editorPartsView = editorPartsView;
    this.instantiationService = instantiationService;
    this.auxiliaryWindowService = auxiliaryWindowService;
    this.lifecycleService = lifecycleService;
    this.configurationService = configurationService;
    this.statusbarService = statusbarService;
    this.titleService = titleService;
    this.editorService = editorService;
    this.layoutService = layoutService;
  }
  async create(label, options) {
    const that = this;
    const disposables = new DisposableStore();
    let compact = Boolean(options?.compact);
    function computeEditorPartHeightOffset() {
      let editorPartHeightOffset = 0;
      if (statusbarVisible) {
        editorPartHeightOffset += statusbarPart.height;
      }
      if (titlebarPart && titlebarVisible) {
        editorPartHeightOffset += titlebarPart.height;
      }
      return editorPartHeightOffset;
    }
    __name(computeEditorPartHeightOffset, "computeEditorPartHeightOffset");
    function updateStatusbarVisibility(fromEvent) {
      if (statusbarVisible) {
        show(statusbarPart.container);
      } else {
        hide(statusbarPart.container);
      }
      if (fromEvent) {
        auxiliaryWindow.layout();
      }
    }
    __name(updateStatusbarVisibility, "updateStatusbarVisibility");
    function updateTitlebarVisibility(fromEvent) {
      if (!titlebarPart) {
        return;
      }
      if (titlebarVisible) {
        show(titlebarPart.container);
      } else {
        hide(titlebarPart.container);
      }
      if (fromEvent) {
        auxiliaryWindow.layout();
      }
    }
    __name(updateTitlebarVisibility, "updateTitlebarVisibility");
    function updateCompact(newCompact) {
      if (newCompact === compact) {
        return;
      }
      compact = newCompact;
      auxiliaryWindow.updateOptions({ compact });
      titlebarPart?.updateOptions({ compact });
      editorPart.updateOptions({ compact });
      const oldStatusbarVisible = statusbarVisible;
      statusbarVisible = !compact && that.configurationService.getValue(AuxiliaryEditorPart_1.STATUS_BAR_VISIBILITY) !== false;
      if (oldStatusbarVisible !== statusbarVisible) {
        updateStatusbarVisibility(true);
      }
    }
    __name(updateCompact, "updateCompact");
    const auxiliaryWindow = disposables.add(await this.auxiliaryWindowService.open(options));
    const editorPartContainer = $(".part.editor", { role: "main" });
    editorPartContainer.style.position = "relative";
    auxiliaryWindow.container.appendChild(editorPartContainer);
    const editorPart = disposables.add(this.instantiationService.createInstance(AuxiliaryEditorPartImpl, auxiliaryWindow.window.vscodeWindowId, this.editorPartsView, options?.state, label));
    editorPart.updateOptions({ compact });
    disposables.add(this.editorPartsView.registerPart(editorPart));
    editorPart.create(editorPartContainer);
    const scopedEditorPartInstantiationService = disposables.add(editorPart.scopedInstantiationService.createChild(new ServiceCollection([IEditorService, this.editorService.createScoped(editorPart, disposables)])));
    let titlebarPart = void 0;
    let titlebarVisible = false;
    const useCustomTitle = isNative && hasCustomTitlebar(this.configurationService);
    if (useCustomTitle) {
      titlebarPart = disposables.add(this.titleService.createAuxiliaryTitlebarPart(auxiliaryWindow.container, editorPart, scopedEditorPartInstantiationService));
      titlebarPart.updateOptions({ compact });
      titlebarVisible = shouldShowCustomTitleBar(this.configurationService, auxiliaryWindow.window, void 0);
      const handleTitleBarVisibilityEvent = /* @__PURE__ */ __name(() => {
        const oldTitlebarPartVisible = titlebarVisible;
        titlebarVisible = shouldShowCustomTitleBar(this.configurationService, auxiliaryWindow.window, void 0);
        if (oldTitlebarPartVisible !== titlebarVisible) {
          updateTitlebarVisibility(true);
        }
      }, "handleTitleBarVisibilityEvent");
      disposables.add(titlebarPart.onDidChange(() => auxiliaryWindow.layout()));
      disposables.add(this.layoutService.onDidChangePartVisibility(() => handleTitleBarVisibilityEvent()));
      disposables.add(onDidChangeFullscreen((windowId) => {
        if (windowId !== auxiliaryWindow.window.vscodeWindowId) {
          return;
        }
        handleTitleBarVisibilityEvent();
      }));
      updateTitlebarVisibility(false);
    } else {
      disposables.add(scopedEditorPartInstantiationService.createInstance(WindowTitle, auxiliaryWindow.window));
    }
    const statusbarPart = disposables.add(this.statusbarService.createAuxiliaryStatusbarPart(auxiliaryWindow.container, scopedEditorPartInstantiationService));
    let statusbarVisible = !compact && this.configurationService.getValue(AuxiliaryEditorPart_1.STATUS_BAR_VISIBILITY) !== false;
    disposables.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(AuxiliaryEditorPart_1.STATUS_BAR_VISIBILITY)) {
        statusbarVisible = !compact && this.configurationService.getValue(AuxiliaryEditorPart_1.STATUS_BAR_VISIBILITY) !== false;
        updateStatusbarVisibility(true);
      }
    }));
    updateStatusbarVisibility(false);
    const editorCloseListener = disposables.add(Event.once(editorPart.onWillClose)(() => auxiliaryWindow.window.close()));
    disposables.add(Event.once(auxiliaryWindow.onUnload)(() => {
      if (disposables.isDisposed) {
        return;
      }
      editorCloseListener.dispose();
      editorPart.close();
      disposables.dispose();
    }));
    disposables.add(Event.once(this.lifecycleService.onDidShutdown)(() => disposables.dispose()));
    disposables.add(auxiliaryWindow.onBeforeUnload((event) => {
      for (const group of editorPart.groups) {
        for (const editor of group.editors) {
          const canMoveVeto = editor.canMove(group.id, this.editorPartsView.mainPart.activeGroup.id);
          if (typeof canMoveVeto === "string") {
            group.openEditor(editor);
            event.veto(canMoveVeto);
            break;
          }
        }
      }
    }));
    disposables.add(auxiliaryWindow.onWillLayout((dimension) => {
      const titlebarPartHeight = titlebarPart?.height ?? 0;
      titlebarPart?.layout(dimension.width, titlebarPartHeight, 0, 0);
      const editorPartHeight = dimension.height - computeEditorPartHeightOffset();
      editorPart.layout(dimension.width, editorPartHeight, titlebarPartHeight, 0);
      statusbarPart.layout(dimension.width, statusbarPart.height, dimension.height - statusbarPart.height, 0);
    }));
    auxiliaryWindow.layout();
    disposables.add(compactWindowEmitter.event((e) => {
      if (e.windowId === auxiliaryWindow.window.vscodeWindowId) {
        let newCompact;
        if (typeof e.compact === "boolean") {
          newCompact = e.compact;
        } else {
          newCompact = !compact;
        }
        updateCompact(newCompact);
      }
    }));
    const scopedInstantiationService = disposables.add(scopedEditorPartInstantiationService.createChild(new ServiceCollection([IStatusbarService, this.statusbarService.createScoped(statusbarPart, disposables)])));
    return {
      part: editorPart,
      instantiationService: scopedInstantiationService,
      disposables
    };
  }
};
AuxiliaryEditorPart = AuxiliaryEditorPart_1 = __decorate([
  __param(1, IInstantiationService),
  __param(2, IAuxiliaryWindowService),
  __param(3, ILifecycleService),
  __param(4, IConfigurationService),
  __param(5, IStatusbarService),
  __param(6, ITitleService),
  __param(7, IEditorService),
  __param(8, IWorkbenchLayoutService)
], AuxiliaryEditorPart);
let AuxiliaryEditorPartImpl = class AuxiliaryEditorPartImpl2 extends EditorPart {
  static {
    __name(this, "AuxiliaryEditorPartImpl");
  }
  static {
    AuxiliaryEditorPartImpl_1 = this;
  }
  static {
    this.COUNTER = 1;
  }
  constructor(windowId, editorPartsView, state, groupsLabel, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService) {
    const id = AuxiliaryEditorPartImpl_1.COUNTER++;
    super(editorPartsView, `workbench.parts.auxiliaryEditor.${id}`, groupsLabel, windowId, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService);
    this.state = state;
    this._onWillClose = this._register(new Emitter());
    this.onWillClose = this._onWillClose.event;
    this.optionsDisposable = this._register(new MutableDisposable());
    this.isCompact = false;
  }
  updateOptions(options) {
    this.isCompact = options.compact;
    if (options.compact) {
      if (!this.optionsDisposable.value) {
        this.optionsDisposable.value = this.enforcePartOptions({
          showTabs: "none",
          closeEmptyGroups: true
        });
      }
    } else {
      this.optionsDisposable.clear();
    }
  }
  addGroup(location, direction, groupToCopy) {
    if (this.isCompact) {
      location = this.editorPartsView.mainPart.activeGroup;
    }
    return super.addGroup(location, direction, groupToCopy);
  }
  removeGroup(group, preserveFocus) {
    const groupView = this.assertGroupView(group);
    if (this.count === 1 && this.activeGroup === groupView) {
      this.doRemoveLastGroup(preserveFocus);
    } else {
      super.removeGroup(group, preserveFocus);
    }
  }
  doRemoveLastGroup(preserveFocus) {
    const restoreFocus = !preserveFocus && this.shouldRestoreFocus(this.container);
    const mostRecentlyActiveGroups = this.editorPartsView.getGroups(
      1
      /* GroupsOrder.MOST_RECENTLY_ACTIVE */
    );
    const nextActiveGroup = mostRecentlyActiveGroups[1];
    if (nextActiveGroup) {
      nextActiveGroup.groupsView.activateGroup(nextActiveGroup);
      if (restoreFocus) {
        nextActiveGroup.focus();
      }
    }
    this.doClose(
      false
      /* do not merge any confirming editors to main part */
    );
  }
  loadState() {
    return this.state;
  }
  saveState() {
    return;
  }
  close() {
    return this.doClose(
      true
      /* merge all confirming editors to main part */
    );
  }
  doClose(mergeConfirmingEditorsToMainPart) {
    let result = true;
    if (mergeConfirmingEditorsToMainPart) {
      for (const group of this.groups) {
        group.closeAllEditors({ excludeConfirming: true });
      }
      result = this.mergeGroupsToMainPart();
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
      // Try to reduce the impact of closing the auxiliary window
      // as much as possible by not changing existing editors
      // in the main window.
      preserveExistingIndex: true
    });
    targetGroup.focus();
    return result;
  }
};
AuxiliaryEditorPartImpl = AuxiliaryEditorPartImpl_1 = __decorate([
  __param(4, IInstantiationService),
  __param(5, IThemeService),
  __param(6, IConfigurationService),
  __param(7, IStorageService),
  __param(8, IWorkbenchLayoutService),
  __param(9, IHostService),
  __param(10, IContextKeyService)
], AuxiliaryEditorPartImpl);
export {
  AuxiliaryEditorPart
};
//# sourceMappingURL=auxiliaryEditorPart.js.map
