var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IMenuService } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { INativeEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import product from "../../../../platform/product/common/product.js";
import { IAuxiliaryWindowService } from "../../../services/auxiliaryWindow/browser/auxiliaryWindowService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IssueFormService } from "../browser/issueFormService.js";
import { IssueReporter } from "./issueReporterService.js";
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
let NativeIssueFormService = class NativeIssueFormService2 extends IssueFormService {
  static {
    __name(this, "NativeIssueFormService");
  }
  constructor(instantiationService, auxiliaryWindowService, logService, dialogService, menuService, contextKeyService, hostService, nativeHostService, environmentService) {
    super(instantiationService, auxiliaryWindowService, menuService, contextKeyService, logService, dialogService, hostService);
    this.nativeHostService = nativeHostService;
    this.environmentService = environmentService;
    this.store = new DisposableStore();
  }
  // override to grab platform info
  async openReporter(data) {
    if (this.hasToReload(data)) {
      return;
    }
    const bounds = await this.nativeHostService.getActiveWindowPosition();
    if (!bounds) {
      return;
    }
    await this.openAuxIssueReporter(data, bounds);
    const { arch, release, type } = await this.nativeHostService.getOSProperties();
    this.arch = arch;
    this.release = release;
    this.type = type;
    if (this.issueReporterWindow) {
      const issueReporter = this.store.add(this.instantiationService.createInstance(IssueReporter, !!this.environmentService.disableExtensions, data, { type: this.type, arch: this.arch, release: this.release }, product, this.issueReporterWindow));
      issueReporter.render();
    } else {
      this.store.dispose();
    }
  }
};
NativeIssueFormService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IAuxiliaryWindowService),
  __param(2, ILogService),
  __param(3, IDialogService),
  __param(4, IMenuService),
  __param(5, IContextKeyService),
  __param(6, IHostService),
  __param(7, INativeHostService),
  __param(8, INativeEnvironmentService)
], NativeIssueFormService);
export {
  NativeIssueFormService
};
//# sourceMappingURL=nativeIssueFormService.js.map
