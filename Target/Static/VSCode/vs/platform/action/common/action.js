var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI, UriDto } from "../../../base/common/uri.js";
import { ContextKeyExpression } from "../../contextkey/common/contextkey.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { Categories } from "./actionCommonCategories.js";
import { ICommandMetadata } from "../../commands/common/commands.js";
function isLocalizedString(thing) {
  return thing && typeof thing === "object" && typeof thing.original === "string" && typeof thing.value === "string";
}
__name(isLocalizedString, "isLocalizedString");
function isICommandActionToggleInfo(thing) {
  return thing ? thing.condition !== void 0 : false;
}
__name(isICommandActionToggleInfo, "isICommandActionToggleInfo");
export {
  isICommandActionToggleInfo,
  isLocalizedString
};
//# sourceMappingURL=action.js.map
