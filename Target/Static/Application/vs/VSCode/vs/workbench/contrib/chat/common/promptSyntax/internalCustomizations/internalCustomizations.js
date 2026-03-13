var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { PromptsStorage } from "../service/promptsService.js";
import { PromptsType } from "../promptTypes.js";
import { registerChatInternalFileSystem } from "./internalPromptFileSystem.js";
import { InternalSkill } from "./internalSkill.js";
class ChatInternalCustomizations extends Disposable {
  static {
    __name(this, "ChatInternalCustomizations");
  }
  constructor(fileService) {
    super();
    this.skillsByUri = /* @__PURE__ */ new Map();
    const { provider, disposable: fsDisposable } = registerChatInternalFileSystem(fileService);
    this._register(fsDisposable);
    this.skills = [];
    for (const skill of this.skills) {
      provider.registerFile(skill.uri, skill.content);
      this.skillsByUri.set(skill.uri.toString(), skill);
      this._register(skill);
    }
  }
  /**
   * Returns the {@link IAgentSkill} metadata for all internal skills,
   * for injection into the skills list.
   */
  getSkills() {
    return this.skills.map((s) => s.skill);
  }
  /**
   * Looks up the {@link InternalSkill} instance for a given URI,
   * e.g. to check its {@link InternalSkill.when} clause.
   */
  getInternalSkillByUri(uri) {
    return this.skillsByUri.get(uri.toString());
  }
  /**
   * Returns internal prompt file paths for a given customization type.
   */
  getPromptPaths(type) {
    if (type === PromptsType.skill) {
      return this.skills.map((s) => ({
        uri: s.uri,
        storage: PromptsStorage.internal,
        type,
        name: s.name,
        description: s.description
      }));
    }
    return [];
  }
}
export {
  ChatInternalCustomizations,
  InternalSkill
};
//# sourceMappingURL=internalCustomizations.js.map
