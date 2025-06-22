var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptApplyToMetadata } from "./metadata/applyTo.js";
import { HeaderBase } from "./headerBase.js";
class InstructionsHeader extends HeaderBase {
  static {
    __name(this, "InstructionsHeader");
  }
  handleToken(token) {
    if (PromptApplyToMetadata.isApplyToRecord(token)) {
      const metadata = new PromptApplyToMetadata(token, this.languageId);
      this.issues.push(...metadata.validate());
      this.meta.applyTo = metadata;
      return true;
    }
    return false;
  }
}
export {
  InstructionsHeader
};
//# sourceMappingURL=instructionsHeader.js.map
