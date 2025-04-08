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
import { getZoomLevel } from "../../../../base/browser/browser.js";
import { platform } from "../../../../base/common/process.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IProcessMainService, ProcessExplorerData } from "../../../../platform/process/common/process.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { activeContrastBorder, editorBackground, editorForeground, listActiveSelectionBackground, listActiveSelectionForeground, listFocusBackground, listFocusForeground, listFocusOutline, listHoverBackground, listHoverForeground, scrollbarShadow, scrollbarSliderActiveBackground, scrollbarSliderBackground, scrollbarSliderHoverBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { IColorTheme, IThemeService } from "../../../../platform/theme/common/themeService.js";
import { INativeWorkbenchEnvironmentService } from "../../../services/environment/electron-sandbox/environmentService.js";
import { IWorkbenchProcessService } from "../common/issue.js";
import { mainWindow } from "../../../../base/browser/window.js";
let ProcessService = class {
  constructor(processMainService, themeService, environmentService, productService) {
    this.processMainService = processMainService;
    this.themeService = themeService;
    this.environmentService = environmentService;
    this.productService = productService;
  }
  static {
    __name(this, "ProcessService");
  }
  openProcessExplorer() {
    const theme = this.themeService.getColorTheme();
    const data = {
      pid: this.environmentService.mainPid,
      zoomLevel: getZoomLevel(mainWindow),
      styles: {
        backgroundColor: getColor(theme, editorBackground),
        color: getColor(theme, editorForeground),
        listHoverBackground: getColor(theme, listHoverBackground),
        listHoverForeground: getColor(theme, listHoverForeground),
        listFocusBackground: getColor(theme, listFocusBackground),
        listFocusForeground: getColor(theme, listFocusForeground),
        listFocusOutline: getColor(theme, listFocusOutline),
        listActiveSelectionBackground: getColor(theme, listActiveSelectionBackground),
        listActiveSelectionForeground: getColor(theme, listActiveSelectionForeground),
        listHoverOutline: getColor(theme, activeContrastBorder),
        scrollbarShadowColor: getColor(theme, scrollbarShadow),
        scrollbarSliderActiveBackgroundColor: getColor(theme, scrollbarSliderActiveBackground),
        scrollbarSliderBackgroundColor: getColor(theme, scrollbarSliderBackground),
        scrollbarSliderHoverBackgroundColor: getColor(theme, scrollbarSliderHoverBackground)
      },
      platform,
      applicationName: this.productService.applicationName
    };
    return this.processMainService.openProcessExplorer(data);
  }
};
ProcessService = __decorateClass([
  __decorateParam(0, IProcessMainService),
  __decorateParam(1, IThemeService),
  __decorateParam(2, INativeWorkbenchEnvironmentService),
  __decorateParam(3, IProductService)
], ProcessService);
function getColor(theme, key) {
  const color = theme.getColor(key);
  return color ? color.toString() : void 0;
}
__name(getColor, "getColor");
registerSingleton(IWorkbenchProcessService, ProcessService, InstantiationType.Delayed);
export {
  ProcessService
};
//# sourceMappingURL=processService.js.map
