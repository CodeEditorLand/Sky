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
import { IIssueFormService, IssueReporterData } from "../common/issue.js";
import { IssueReporter } from "./issueReporterService.js";
import "./media/issueReporter.css";
let NativeIssueFormService = class extends IssueFormService {
  constructor(instantiationService, auxiliaryWindowService, logService, dialogService, menuService, contextKeyService, hostService, nativeHostService, environmentService) {
    super(instantiationService, auxiliaryWindowService, menuService, contextKeyService, logService, dialogService, hostService);
    this.nativeHostService = nativeHostService;
    this.environmentService = environmentService;
  }
  static {
    __name(this, "NativeIssueFormService");
  }
  store = new DisposableStore();
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
NativeIssueFormService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IAuxiliaryWindowService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IHostService),
  __decorateParam(7, INativeHostService),
  __decorateParam(8, INativeEnvironmentService)
], NativeIssueFormService);
export {
  NativeIssueFormService
};
//# sourceMappingURL=nativeIssueFormService.js.map
