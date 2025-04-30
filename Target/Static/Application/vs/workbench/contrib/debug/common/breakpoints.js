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
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
let Breakpoints = class Breakpoints2 {
  static {
    __name(this, "Breakpoints");
  }
  constructor(breakpointContribution, contextKeyService) {
    this.breakpointContribution = breakpointContribution;
    this.contextKeyService = contextKeyService;
    this.breakpointsWhen = typeof breakpointContribution.when === "string" ? ContextKeyExpr.deserialize(breakpointContribution.when) : void 0;
  }
  get language() {
    return this.breakpointContribution.language;
  }
  get enabled() {
    return !this.breakpointsWhen || this.contextKeyService.contextMatchesRules(this.breakpointsWhen);
  }
};
Breakpoints = __decorate([
  __param(1, IContextKeyService)
], Breakpoints);
export {
  Breakpoints
};
//# sourceMappingURL=breakpoints.js.map
