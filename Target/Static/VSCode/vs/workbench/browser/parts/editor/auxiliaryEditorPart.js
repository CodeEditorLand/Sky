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
import { onDidChangeFullscreen } from "../../../../base/browser/browser.js";
import { $, hide, show } from "../../../../base/browser/dom.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { isNative } from "../../../../base/common/platform.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { hasCustomTitlebar } from "../../../../platform/window/common/window.js";
import { IEditorGroupView, IEditorPartsView } from "./editor.js";
import { EditorPart, IEditorPartUIState } from "./editorPart.js";
import { IAuxiliaryTitlebarPart } from "../titlebar/titlebarPart.js";
import { WindowTitle } from "../titlebar/windowTitle.js";
import { IAuxiliaryWindowOpenOptions, IAuxiliaryWindowService } from "../../../services/auxiliaryWindow/browser/auxiliaryWindowService.js";
import { GroupDirection, GroupsOrder, IAuxiliaryEditorPart } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IWorkbenchLayoutService, shouldShowCustomTitleBar } from "../../../services/layout/browser/layoutService.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
import { ITitleService } from "../../../services/title/browser/titleService.js";
let AuxiliaryEditorPart = class {
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
  static {
    __name(this, "AuxiliaryEditorPart");
  }
  static STATUS_BAR_VISIBILITY = "workbench.statusBar.visible";
  async create(label, options) {
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
    const disposables = new DisposableStore();
    const auxiliaryWindow = disposables.add(await this.auxiliaryWindowService.open(options));
    const editorPartContainer = $(".part.editor", { role: "main" });
    editorPartContainer.style.position = "relative";
    auxiliaryWindow.container.appendChild(editorPartContainer);
    const editorPart = disposables.add(this.instantiationService.createInstance(AuxiliaryEditorPartImpl, auxiliaryWindow.window.vscodeWindowId, this.editorPartsView, options?.state, label));
    disposables.add(this.editorPartsView.registerPart(editorPart));
    editorPart.create(editorPartContainer);
    let titlebarPart = void 0;
    let titlebarVisible = false;
    const useCustomTitle = isNative && hasCustomTitlebar(this.configurationService);
    if (useCustomTitle) {
      titlebarPart = disposables.add(this.titleService.createAuxiliaryTitlebarPart(auxiliaryWindow.container, editorPart));
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
      disposables.add(this.instantiationService.createInstance(WindowTitle, auxiliaryWindow.window, editorPart));
    }
    const statusbarPart = disposables.add(this.statusbarService.createAuxiliaryStatusbarPart(auxiliaryWindow.container));
    let statusbarVisible = this.configurationService.getValue(AuxiliaryEditorPart.STATUS_BAR_VISIBILITY) !== false;
    disposables.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(AuxiliaryEditorPart.STATUS_BAR_VISIBILITY)) {
        statusbarVisible = this.configurationService.getValue(AuxiliaryEditorPart.STATUS_BAR_VISIBILITY) !== false;
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
    const instantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection(
      [IStatusbarService, this.statusbarService.createScoped(statusbarPart, disposables)],
      [IEditorService, this.editorService.createScoped(editorPart, disposables)]
    )));
    return {
      part: editorPart,
      instantiationService,
      disposables
    };
  }
};
AuxiliaryEditorPart = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IAuxiliaryWindowService),
  __decorateParam(3, ILifecycleService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IStatusbarService),
  __decorateParam(6, ITitleService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IWorkbenchLayoutService)
], AuxiliaryEditorPart);
let AuxiliaryEditorPartImpl = class extends EditorPart {
  constructor(windowId, editorPartsView, state, groupsLabel, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService) {
    const id = AuxiliaryEditorPartImpl.COUNTER++;
    super(editorPartsView, `workbench.parts.auxiliaryEditor.${id}`, groupsLabel, windowId, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService);
    this.state = state;
  }
  static {
    __name(this, "AuxiliaryEditorPartImpl");
  }
  static COUNTER = 1;
  _onWillClose = this._register(new Emitter());
  onWillClose = this._onWillClose.event;
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
    const mostRecentlyActiveGroups = this.editorPartsView.getGroups(GroupsOrder.MOST_RECENTLY_ACTIVE);
    const nextActiveGroup = mostRecentlyActiveGroups[1];
    if (nextActiveGroup) {
      nextActiveGroup.groupsView.activateGroup(nextActiveGroup);
      if (restoreFocus) {
        nextActiveGroup.focus();
      }
    }
    this.doClose(
      false
      /* do not merge any groups to main part */
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
      /* merge all groups to main part */
    );
  }
  doClose(mergeGroupsToMainPart) {
    let result = true;
    if (mergeGroupsToMainPart) {
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
    for (const group of this.editorPartsView.mainPart.getGroups(GroupsOrder.MOST_RECENTLY_ACTIVE)) {
      if (!group.isLocked) {
        targetGroup = group;
        break;
      }
    }
    if (!targetGroup) {
      targetGroup = this.editorPartsView.mainPart.addGroup(this.editorPartsView.mainPart.activeGroup, this.partOptions.openSideBySideDirection === "right" ? GroupDirection.RIGHT : GroupDirection.DOWN);
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
AuxiliaryEditorPartImpl = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, IWorkbenchLayoutService),
  __decorateParam(9, IHostService),
  __decorateParam(10, IContextKeyService)
], AuxiliaryEditorPartImpl);
export {
  AuxiliaryEditorPart
};
//# sourceMappingURL=auxiliaryEditorPart.js.map
