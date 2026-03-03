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
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { isWindows, isLinux } from "../../../../base/common/platform.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-browser/environmentService.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { AccessibilityService } from "../../../../platform/accessibility/browser/accessibilityService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IJSONEditingService } from "../../configuration/common/jsonEditing.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
let NativeAccessibilityService = class NativeAccessibilityService2 extends AccessibilityService {
  static {
    __name(this, "NativeAccessibilityService");
  }
  constructor(environmentService, contextKeyService, configurationService, _layoutService, _telemetryService, nativeHostService) {
    super(contextKeyService, _layoutService, configurationService);
    this._telemetryService = _telemetryService;
    this.nativeHostService = nativeHostService;
    this.didSendTelemetry = false;
    this.shouldAlwaysUnderlineAccessKeys = void 0;
    this.setAccessibilitySupport(
      environmentService.window.accessibilitySupport ? 2 : 1
      /* AccessibilitySupport.Disabled */
    );
  }
  async alwaysUnderlineAccessKeys() {
    if (!isWindows) {
      return false;
    }
    if (typeof this.shouldAlwaysUnderlineAccessKeys !== "boolean") {
      const windowsKeyboardAccessibility = await this.nativeHostService.windowsGetStringRegKey("HKEY_CURRENT_USER", "Control Panel\\Accessibility\\Keyboard Preference", "On");
      this.shouldAlwaysUnderlineAccessKeys = windowsKeyboardAccessibility === "1";
    }
    return this.shouldAlwaysUnderlineAccessKeys;
  }
  setAccessibilitySupport(accessibilitySupport) {
    super.setAccessibilitySupport(accessibilitySupport);
    if (!this.didSendTelemetry && accessibilitySupport === 2) {
      this._telemetryService.publicLog2("accessibility", { enabled: true });
      this.didSendTelemetry = true;
    }
  }
};
NativeAccessibilityService = __decorate([
  __param(0, INativeWorkbenchEnvironmentService),
  __param(1, IContextKeyService),
  __param(2, IConfigurationService),
  __param(3, ILayoutService),
  __param(4, ITelemetryService),
  __param(5, INativeHostService)
], NativeAccessibilityService);
registerSingleton(
  IAccessibilityService,
  NativeAccessibilityService,
  1
  /* InstantiationType.Delayed */
);
let LinuxAccessibilityContribution = class LinuxAccessibilityContribution2 {
  static {
    __name(this, "LinuxAccessibilityContribution");
  }
  static {
    this.ID = "workbench.contrib.linuxAccessibility";
  }
  constructor(jsonEditingService, accessibilityService, environmentService) {
    const forceRendererAccessibility = /* @__PURE__ */ __name(() => {
      if (accessibilityService.isScreenReaderOptimized()) {
        jsonEditingService.write(environmentService.argvResource, [{ path: ["force-renderer-accessibility"], value: true }], true);
      }
    }, "forceRendererAccessibility");
    forceRendererAccessibility();
    accessibilityService.onDidChangeScreenReaderOptimized(forceRendererAccessibility);
  }
};
LinuxAccessibilityContribution = __decorate([
  __param(0, IJSONEditingService),
  __param(1, IAccessibilityService),
  __param(2, INativeWorkbenchEnvironmentService)
], LinuxAccessibilityContribution);
if (isLinux) {
  registerWorkbenchContribution2(
    LinuxAccessibilityContribution.ID,
    LinuxAccessibilityContribution,
    2
    /* WorkbenchPhase.BlockRestore */
  );
}
export {
  NativeAccessibilityService
};
//# sourceMappingURL=accessibilityService.js.map
