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
import { ContextKeyExpr, ContextKeyExpression, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IBreakpointContribution } from "./debug.js";
let Breakpoints = class {
  constructor(breakpointContribution, contextKeyService) {
    this.breakpointContribution = breakpointContribution;
    this.contextKeyService = contextKeyService;
    this.breakpointsWhen = typeof breakpointContribution.when === "string" ? ContextKeyExpr.deserialize(breakpointContribution.when) : void 0;
  }
  static {
    __name(this, "Breakpoints");
  }
  breakpointsWhen;
  get language() {
    return this.breakpointContribution.language;
  }
  get enabled() {
    return !this.breakpointsWhen || this.contextKeyService.contextMatchesRules(this.breakpointsWhen);
  }
};
Breakpoints = __decorateClass([
  __decorateParam(1, IContextKeyService)
], Breakpoints);
export {
  Breakpoints
};
//# sourceMappingURL=breakpoints.js.map
