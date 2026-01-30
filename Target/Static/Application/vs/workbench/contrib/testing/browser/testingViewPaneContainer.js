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
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ViewPaneContainer } from "../../../browser/parts/views/viewPaneContainer.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
let TestingViewPaneContainer = class TestingViewPaneContainer2 extends ViewPaneContainer {
  static {
    __name(this, "TestingViewPaneContainer");
  }
  constructor(layoutService, telemetryService, instantiationService, contextMenuService, themeService, storageService, configurationService, extensionService, contextService, viewDescriptorService, logService) {
    super("workbench.view.extension.test", { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
  }
  create(parent) {
    super.create(parent);
    parent.classList.add("testing-view-pane");
  }
  getOptimalWidth() {
    return 400;
  }
  getTitle() {
    return localize("testing", "Testing");
  }
};
TestingViewPaneContainer = __decorate([
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
], TestingViewPaneContainer);
export {
  TestingViewPaneContainer
};
//# sourceMappingURL=testingViewPaneContainer.js.map
