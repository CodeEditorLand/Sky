var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { localize } from "../../../../nls.js";
import { DeferredPromise, timeout } from "../../../../base/common/async.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
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
let ExtensionActivationProgress = class ExtensionActivationProgress2 {
  static {
    __name(this, "ExtensionActivationProgress");
  }
  constructor(extensionService, progressService, logService) {
    const options = {
      location: 10,
      title: localize("activation", "Activating Extensions...")
    };
    let deferred;
    let count = 0;
    this._listener = extensionService.onWillActivateByEvent((e) => {
      logService.trace("onWillActivateByEvent: ", e.event);
      if (!deferred) {
        deferred = new DeferredPromise();
        progressService.withProgress(options, (_) => deferred.p);
      }
      count++;
      Promise.race([e.activation, timeout(5e3, CancellationToken.None)]).finally(() => {
        if (--count === 0) {
          deferred.complete(void 0);
          deferred = void 0;
        }
      });
    });
  }
  dispose() {
    this._listener.dispose();
  }
};
ExtensionActivationProgress = __decorate([
  __param(0, IExtensionService),
  __param(1, IProgressService),
  __param(2, ILogService)
], ExtensionActivationProgress);
export {
  ExtensionActivationProgress
};
//# sourceMappingURL=extensionsActivationProgress.js.map
