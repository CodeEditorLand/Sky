var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../../base/common/uri.js";
import { PromptsStorage } from "../service/promptsService.js";
import { CHAT_INTERNAL_SCHEME } from "./internalPromptFileSystem.js";
class InternalSkill extends Disposable {
  static {
    __name(this, "InternalSkill");
  }
  constructor(name, description, content, options) {
    super();
    this.name = name;
    this.description = description;
    this.content = content;
    this.uri = URI.from({
      scheme: CHAT_INTERNAL_SCHEME,
      path: `/skills/${name}/SKILL.md`
    });
    this.skill = {
      uri: this.uri,
      storage: PromptsStorage.internal,
      name,
      description,
      disableModelInvocation: options?.disableModelInvocation ?? false,
      userInvocable: options?.userInvocable ?? true
    };
    this.when = options?.when;
  }
}
export {
  InternalSkill
};
//# sourceMappingURL=internalSkill.js.map
