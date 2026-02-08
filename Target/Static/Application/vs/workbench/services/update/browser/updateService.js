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
import { Emitter } from "../../../../base/common/event.js";
import { IUpdateService, State } from "../../../../platform/update/common/update.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
import { IHostService } from "../../host/browser/host.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
let BrowserUpdateService = class BrowserUpdateService2 extends Disposable {
  static {
    __name(this, "BrowserUpdateService");
  }
  get state() {
    return this._state;
  }
  set state(state) {
    this._state = state;
    this._onStateChange.fire(state);
  }
  constructor(environmentService, hostService) {
    super();
    this.environmentService = environmentService;
    this.hostService = hostService;
    this._onStateChange = this._register(new Emitter());
    this.onStateChange = this._onStateChange.event;
    this._state = State.Uninitialized;
    this.checkForUpdates(false);
  }
  async isLatestVersion() {
    const update = await this.doCheckForUpdates(false);
    if (update === void 0) {
      return void 0;
    }
    return !!update;
  }
  async checkForUpdates(explicit) {
    await this.doCheckForUpdates(explicit);
  }
  async doCheckForUpdates(explicit) {
    if (this.environmentService.options && this.environmentService.options.updateProvider) {
      const updateProvider = this.environmentService.options.updateProvider;
      this.state = State.CheckingForUpdates(explicit);
      const update = await updateProvider.checkForUpdate();
      if (update) {
        this.state = State.Ready({ version: update.version, productVersion: update.version }, explicit, false);
      } else {
        this.state = State.Idle(
          1
          /* UpdateType.Archive */
        );
      }
      return update;
    }
    return void 0;
  }
  async downloadUpdate() {
  }
  async applyUpdate() {
    this.hostService.reload();
  }
  async quitAndInstall() {
    this.hostService.reload();
  }
  async _applySpecificUpdate(packagePath) {
  }
  async disableProgressiveReleases() {
  }
};
BrowserUpdateService = __decorate([
  __param(0, IBrowserWorkbenchEnvironmentService),
  __param(1, IHostService)
], BrowserUpdateService);
registerSingleton(
  IUpdateService,
  BrowserUpdateService,
  0
  /* InstantiationType.Eager */
);
export {
  BrowserUpdateService
};
//# sourceMappingURL=updateService.js.map
