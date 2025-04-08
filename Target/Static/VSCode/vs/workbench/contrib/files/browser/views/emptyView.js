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
import * as nls from "../../../../../nls.js";
import { IViewletViewOptions } from "../../../../browser/parts/views/viewsViewlet.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { isTemporaryWorkspace, IWorkspaceContextService, WorkbenchState } from "../../../../../platform/workspace/common/workspace.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ViewPane } from "../../../../browser/parts/views/viewPane.js";
import { ResourcesDropHandler } from "../../../../browser/dnd.js";
import { listDropOverBackground } from "../../../../../platform/theme/common/colorRegistry.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IViewDescriptorService } from "../../../../common/views.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { isWeb } from "../../../../../base/common/platform.js";
import { DragAndDropObserver, getWindow } from "../../../../../base/browser/dom.js";
import { ILocalizedString } from "../../../../../platform/action/common/action.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
let EmptyView = class extends ViewPane {
  constructor(options, themeService, viewDescriptorService, instantiationService, keybindingService, contextMenuService, contextService, configurationService, labelService, contextKeyService, openerService, hoverService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.contextService = contextService;
    this.labelService = labelService;
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.refreshTitle()));
    this._register(this.labelService.onDidChangeFormatters(() => this.refreshTitle()));
  }
  static {
    __name(this, "EmptyView");
  }
  static ID = "workbench.explorer.emptyView";
  static NAME = nls.localize2("noWorkspace", "No Folder Opened");
  _disposed = false;
  shouldShowWelcome() {
    return true;
  }
  renderBody(container) {
    super.renderBody(container);
    this._register(new DragAndDropObserver(container, {
      onDrop: /* @__PURE__ */ __name((e) => {
        container.style.backgroundColor = "";
        const dropHandler = this.instantiationService.createInstance(ResourcesDropHandler, { allowWorkspaceOpen: !isWeb || isTemporaryWorkspace(this.contextService.getWorkspace()) });
        dropHandler.handleDrop(e, getWindow(container));
      }, "onDrop"),
      onDragEnter: /* @__PURE__ */ __name(() => {
        const color = this.themeService.getColorTheme().getColor(listDropOverBackground);
        container.style.backgroundColor = color ? color.toString() : "";
      }, "onDragEnter"),
      onDragEnd: /* @__PURE__ */ __name(() => {
        container.style.backgroundColor = "";
      }, "onDragEnd"),
      onDragLeave: /* @__PURE__ */ __name(() => {
        container.style.backgroundColor = "";
      }, "onDragLeave"),
      onDragOver: /* @__PURE__ */ __name((e) => {
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "copy";
        }
      }, "onDragOver")
    }));
    this.refreshTitle();
  }
  refreshTitle() {
    if (this._disposed) {
      return;
    }
    if (this.contextService.getWorkbenchState() === WorkbenchState.WORKSPACE) {
      this.updateTitle(EmptyView.NAME.value);
    } else {
      this.updateTitle(this.title);
    }
  }
  dispose() {
    this._disposed = true;
    super.dispose();
  }
};
EmptyView = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IViewDescriptorService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, IHoverService)
], EmptyView);
export {
  EmptyView
};
//# sourceMappingURL=emptyView.js.map
