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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
let ExternalUriResolverContribution = class ExternalUriResolverContribution2 extends Disposable {
  static {
    __name(this, "ExternalUriResolverContribution");
  }
  static {
    this.ID = "workbench.contrib.externalUriResolver";
  }
  constructor(_openerService, _workbenchEnvironmentService) {
    super();
    if (_workbenchEnvironmentService.options?.resolveExternalUri) {
      this._register(_openerService.registerExternalUriResolver({
        resolveExternalUri: /* @__PURE__ */ __name(async (resource) => {
          return {
            resolved: await _workbenchEnvironmentService.options.resolveExternalUri(resource),
            dispose: /* @__PURE__ */ __name(() => {
            }, "dispose")
          };
        }, "resolveExternalUri")
      }));
    }
  }
};
ExternalUriResolverContribution = __decorate([
  __param(0, IOpenerService),
  __param(1, IBrowserWorkbenchEnvironmentService)
], ExternalUriResolverContribution);
export {
  ExternalUriResolverContribution
};
//# sourceMappingURL=externalUriResolver.js.map
