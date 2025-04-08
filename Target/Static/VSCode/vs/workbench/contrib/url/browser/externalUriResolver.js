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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
let ExternalUriResolverContribution = class extends Disposable {
  static {
    __name(this, "ExternalUriResolverContribution");
  }
  static ID = "workbench.contrib.externalUriResolver";
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
ExternalUriResolverContribution = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, IBrowserWorkbenchEnvironmentService)
], ExternalUriResolverContribution);
export {
  ExternalUriResolverContribution
};
//# sourceMappingURL=externalUriResolver.js.map
