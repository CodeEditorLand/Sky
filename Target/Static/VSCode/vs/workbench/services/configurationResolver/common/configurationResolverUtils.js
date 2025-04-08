var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { IJSONSchema } from "../../../../base/common/jsonSchema.js";
function applyDeprecatedVariableMessage(schema) {
  schema.pattern = schema.pattern || "^(?!.*\\$\\{(env|config|command)\\.)";
  schema.patternErrorMessage = schema.patternErrorMessage || nls.localize("deprecatedVariables", "'env.', 'config.' and 'command.' are deprecated, use 'env:', 'config:' and 'command:' instead.");
}
__name(applyDeprecatedVariableMessage, "applyDeprecatedVariableMessage");
export {
  applyDeprecatedVariableMessage
};
//# sourceMappingURL=configurationResolverUtils.js.map
