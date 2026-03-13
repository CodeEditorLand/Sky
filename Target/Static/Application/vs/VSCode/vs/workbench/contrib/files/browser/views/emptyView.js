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
var EmptyView_1;
import * as nls from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { isTemporaryWorkspace, IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
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
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
let EmptyView = class EmptyView2 extends ViewPane {
  static {
    __name(this, "EmptyView");
  }
  static {
    EmptyView_1 = this;
  }
  static {
    this.ID = "workbench.explorer.emptyView";
  }
  static {
    this.NAME = nls.localize2("noWorkspace", "No Folder Opened");
  }
  constructor(options, themeService, viewDescriptorService, instantiationService, keybindingService, contextMenuService, contextService, configurationService, labelService, contextKeyService, openerService, hoverService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.contextService = contextService;
    this.labelService = labelService;
    this._disposed = false;
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.refreshTitle()));
    this._register(this.labelService.onDidChangeFormatters(() => this.refreshTitle()));
  }
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
    if (this.contextService.getWorkbenchState() === 3) {
      this.updateTitle(EmptyView_1.NAME.value);
    } else {
      this.updateTitle(this.title);
    }
  }
  dispose() {
    this._disposed = true;
    super.dispose();
  }
};
EmptyView = EmptyView_1 = __decorate([
  __param(1, IThemeService),
  __param(2, IViewDescriptorService),
  __param(3, IInstantiationService),
  __param(4, IKeybindingService),
  __param(5, IContextMenuService),
  __param(6, IWorkspaceContextService),
  __param(7, IConfigurationService),
  __param(8, ILabelService),
  __param(9, IContextKeyService),
  __param(10, IOpenerService),
  __param(11, IHoverService)
], EmptyView);
export {
  EmptyView
};
//# sourceMappingURL=emptyView.js.map
