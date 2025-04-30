var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onUnexpectedError } from "../common/errors.js";
function createTrustedTypesPolicy(policyName, policyOptions) {
  const monacoEnvironment = globalThis.MonacoEnvironment;
  if (monacoEnvironment?.createTrustedTypesPolicy) {
    try {
      return monacoEnvironment.createTrustedTypesPolicy(policyName, policyOptions);
    } catch (err) {
      onUnexpectedError(err);
      return void 0;
    }
  }
  try {
    return globalThis.trustedTypes?.createPolicy(policyName, policyOptions);
  } catch (err) {
    onUnexpectedError(err);
    return void 0;
  }
}
__name(createTrustedTypesPolicy, "createTrustedTypesPolicy");
export {
  createTrustedTypesPolicy
};
//# sourceMappingURL=trustedTypes.js.map
