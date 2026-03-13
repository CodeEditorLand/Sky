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
import "./media/scm.css";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { VIEWLET_ID } from "../common/scm.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { ViewPaneContainer } from "../../../browser/parts/views/viewPaneContainer.js";
import { ILogService } from "../../../../platform/log/common/log.js";
let SCMViewPaneContainer = class SCMViewPaneContainer2 extends ViewPaneContainer {
  static {
    __name(this, "SCMViewPaneContainer");
  }
  constructor(layoutService, telemetryService, instantiationService, contextMenuService, themeService, storageService, configurationService, extensionService, contextService, viewDescriptorService, logService) {
    super(VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
  }
  create(parent) {
    super.create(parent);
    parent.classList.add("scm-viewlet");
  }
  getOptimalWidth() {
    return 400;
  }
};
SCMViewPaneContainer = __decorate([
  __param(0, IWorkbenchLayoutService),
  __param(1, ITelemetryService),
  __param(2, IInstantiationService),
  __param(3, IContextMenuService),
  __param(4, IThemeService),
  __param(5, IStorageService),
  __param(6, IConfigurationService),
  __param(7, IExtensionService),
  __param(8, IWorkspaceContextService),
  __param(9, IViewDescriptorService),
  __param(10, ILogService)
], SCMViewPaneContainer);
export {
  SCMViewPaneContainer
};
//# sourceMappingURL=scmViewPaneContainer.js.map
