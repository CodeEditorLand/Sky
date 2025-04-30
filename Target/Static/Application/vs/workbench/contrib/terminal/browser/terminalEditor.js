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
import * as dom from "../../../../base/browser/dom.js";
import { DropdownWithPrimaryActionViewItem } from "../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js";
import { IMenuService, MenuId, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { ITerminalConfigurationService, ITerminalEditorService, ITerminalService, terminalEditorId } from "./terminal.js";
import { getTerminalActionBarArgs } from "./terminalMenus.js";
import { ITerminalProfileResolverService, ITerminalProfileService } from "../common/terminal.js";
import { openContextMenu } from "./terminalContextMenu.js";
import { ACTIVE_GROUP } from "../../../services/editor/common/editorService.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { TerminalLocation } from "../../../../platform/terminal/common/terminal.js";
let TerminalEditor = class TerminalEditor2 extends EditorPane {
  static {
    __name(this, "TerminalEditor");
  }
  constructor(group, telemetryService, themeService, storageService, _terminalEditorService, _terminalProfileResolverService, _terminalService, _terminalConfigurationService, contextKeyService, menuService, _instantiationService, _contextMenuService, _terminalProfileService, _workbenchLayoutService) {
    super(terminalEditorId, group, telemetryService, themeService, storageService);
    this._terminalEditorService = _terminalEditorService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._terminalService = _terminalService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._instantiationService = _instantiationService;
    this._contextMenuService = _contextMenuService;
    this._terminalProfileService = _terminalProfileService;
    this._workbenchLayoutService = _workbenchLayoutService;
    this._editorInput = void 0;
    this._cancelContextMenu = false;
    this._newDropdown = this._register(new MutableDisposable());
    this._disposableStore = this._register(new DisposableStore());
    this._dropdownMenu = this._register(menuService.createMenu(MenuId.TerminalNewDropdownContext, contextKeyService));
    this._instanceMenu = this._register(menuService.createMenu(MenuId.TerminalInstanceContext, contextKeyService));
    this._register(this._terminalProfileService.onDidChangeAvailableProfiles((profiles) => this._updateTabActionBar(profiles)));
  }
  async setInput(newInput, options, context, token) {
    this._editorInput?.terminalInstance?.detachFromElement();
    this._editorInput = newInput;
    await super.setInput(newInput, options, context, token);
    this._editorInput.terminalInstance?.attachToElement(this._overflowGuardElement);
    if (this._lastDimension) {
      this.layout(this._lastDimension);
    }
    this._editorInput.terminalInstance?.setVisible(this.isVisible() && this._workbenchLayoutService.isVisible("workbench.parts.editor", this.window));
    if (this._editorInput.terminalInstance) {
      this._register(this._editorInput.terminalInstance.onDidFocus(() => this._setActiveInstance()));
      this._editorInput.setCopyLaunchConfig(this._editorInput.terminalInstance.shellLaunchConfig);
    }
  }
  clearInput() {
    super.clearInput();
    if (this._overflowGuardElement && this._editorInput?.terminalInstance?.domElement.parentElement === this._overflowGuardElement) {
      this._editorInput.terminalInstance?.detachFromElement();
    }
    this._editorInput = void 0;
  }
  _setActiveInstance() {
    if (!this._editorInput?.terminalInstance) {
      return;
    }
    this._terminalEditorService.setActiveInstance(this._editorInput.terminalInstance);
  }
  focus() {
    super.focus();
    this._editorInput?.terminalInstance?.focus(true);
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  createEditor(parent) {
    this._editorInstanceElement = parent;
    this._overflowGuardElement = dom.$(".terminal-overflow-guard.terminal-editor");
    this._editorInstanceElement.appendChild(this._overflowGuardElement);
    this._registerListeners();
  }
  _registerListeners() {
    if (!this._editorInstanceElement) {
      return;
    }
    this._register(dom.addDisposableListener(this._editorInstanceElement, "mousedown", async (event) => {
      const terminal = this._terminalEditorService.activeInstance;
      if (this._terminalEditorService.instances.length > 0 && terminal) {
        const result = await terminal.handleMouseEvent(event, this._instanceMenu);
        if (typeof result === "object" && result.cancelContextMenu) {
          this._cancelContextMenu = true;
        }
      }
    }));
    this._register(dom.addDisposableListener(this._editorInstanceElement, "contextmenu", (event) => {
      const rightClickBehavior = this._terminalConfigurationService.config.rightClickBehavior;
      if (rightClickBehavior === "nothing" && !event.shiftKey) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this._cancelContextMenu = false;
        return;
      } else if (!this._cancelContextMenu && rightClickBehavior !== "copyPaste" && rightClickBehavior !== "paste") {
        if (!this._cancelContextMenu) {
          openContextMenu(this.window, event, this._editorInput?.terminalInstance, this._instanceMenu, this._contextMenuService);
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        this._cancelContextMenu = false;
      }
    }));
  }
  _updateTabActionBar(profiles) {
    const actions = getTerminalActionBarArgs(TerminalLocation.Editor, profiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu, this._disposableStore);
    this._newDropdown.value?.update(actions.dropdownAction, actions.dropdownMenuActions);
  }
  layout(dimension) {
    const instance = this._editorInput?.terminalInstance;
    if (instance) {
      instance.attachToElement(this._overflowGuardElement);
      instance.layout(dimension);
    }
    this._lastDimension = dimension;
  }
  setVisible(visible) {
    super.setVisible(visible);
    this._editorInput?.terminalInstance?.setVisible(visible && this._workbenchLayoutService.isVisible("workbench.parts.editor", this.window));
  }
  getActionViewItem(action, options) {
    switch (action.id) {
      case "workbench.action.createTerminalEditorSameGroup": {
        if (action instanceof MenuItemAction) {
          const location = { viewColumn: ACTIVE_GROUP };
          this._disposableStore.clear();
          const actions = getTerminalActionBarArgs(location, this._terminalProfileService.availableProfiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu, this._disposableStore);
          this._newDropdown.value = this._instantiationService.createInstance(DropdownWithPrimaryActionViewItem, action, actions.dropdownAction, actions.dropdownMenuActions, actions.className, { hoverDelegate: options.hoverDelegate });
          this._newDropdown.value?.update(actions.dropdownAction, actions.dropdownMenuActions);
          return this._newDropdown.value;
        }
      }
    }
    return super.getActionViewItem(action, options);
  }
  _getDefaultProfileName() {
    let defaultProfileName;
    try {
      defaultProfileName = this._terminalProfileService.getDefaultProfileName();
    } catch (e) {
      defaultProfileName = this._terminalProfileResolverService.defaultProfileName;
    }
    return defaultProfileName;
  }
};
TerminalEditor = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService),
  __param(4, ITerminalEditorService),
  __param(5, ITerminalProfileResolverService),
  __param(6, ITerminalService),
  __param(7, ITerminalConfigurationService),
  __param(8, IContextKeyService),
  __param(9, IMenuService),
  __param(10, IInstantiationService),
  __param(11, IContextMenuService),
  __param(12, ITerminalProfileService),
  __param(13, IWorkbenchLayoutService)
], TerminalEditor);
export {
  TerminalEditor
};
//# sourceMappingURL=terminalEditor.js.map
