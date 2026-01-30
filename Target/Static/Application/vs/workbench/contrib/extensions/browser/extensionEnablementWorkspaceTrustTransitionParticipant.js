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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../services/host/browser/host.js";
let ExtensionEnablementWorkspaceTrustTransitionParticipant = class ExtensionEnablementWorkspaceTrustTransitionParticipant2 extends Disposable {
  static {
    __name(this, "ExtensionEnablementWorkspaceTrustTransitionParticipant");
  }
  constructor(extensionService, hostService, environmentService, extensionEnablementService, workspaceTrustEnablementService, workspaceTrustManagementService) {
    super();
    if (workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
      workspaceTrustManagementService.workspaceTrustInitialized.then(() => {
        const workspaceTrustTransitionParticipant = new class {
          async participate(trusted) {
            if (trusted) {
              await extensionEnablementService.updateExtensionsEnablementsWhenWorkspaceTrustChanges();
            } else {
              if (environmentService.remoteAuthority) {
                hostService.reload();
              } else {
                const stopped = await extensionService.stopExtensionHosts(localize("restartExtensionHost.reason", "Changing workspace trust"));
                await extensionEnablementService.updateExtensionsEnablementsWhenWorkspaceTrustChanges();
                if (stopped) {
                  extensionService.startExtensionHosts();
                }
              }
            }
          }
        }();
        this._register(workspaceTrustManagementService.addWorkspaceTrustTransitionParticipant(workspaceTrustTransitionParticipant));
      });
    }
  }
};
ExtensionEnablementWorkspaceTrustTransitionParticipant = __decorate([
  __param(0, IExtensionService),
  __param(1, IHostService),
  __param(2, IWorkbenchEnvironmentService),
  __param(3, IWorkbenchExtensionEnablementService),
  __param(4, IWorkspaceTrustEnablementService),
  __param(5, IWorkspaceTrustManagementService)
], ExtensionEnablementWorkspaceTrustTransitionParticipant);
export {
  ExtensionEnablementWorkspaceTrustTransitionParticipant
};
//# sourceMappingURL=extensionEnablementWorkspaceTrustTransitionParticipant.js.map
