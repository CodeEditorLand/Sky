var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../../nls.js";
class BaseCreatePromptError extends Error {
  static {
    __name(this, "BaseCreatePromptError");
  }
}
class FolderExists extends BaseCreatePromptError {
  static {
    __name(this, "FolderExists");
  }
  constructor(path) {
    super(localize("workbench.command.prompts.create.error.folder-exists", "Folder already exists at '{0}'.", path));
  }
}
class InvalidPromptName extends BaseCreatePromptError {
  static {
    __name(this, "InvalidPromptName");
  }
  constructor(name) {
    super(localize("workbench.command.prompts.create.error.invalid-prompt-name", "Invalid prompt file name '{0}'.", name));
  }
}
export {
  FolderExists,
  InvalidPromptName
};
//# sourceMappingURL=errors.js.map
