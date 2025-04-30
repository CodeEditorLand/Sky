var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptVariableWithData } from "./promptVariable.js";
import { assert } from "../../../../../../../base/common/assert.js";
const VARIABLE_NAME = "file";
class FileReference extends PromptVariableWithData {
  static {
    __name(this, "FileReference");
  }
  constructor(range, path) {
    super(range, VARIABLE_NAME, path);
    this.path = path;
  }
  /**
   * Create a {@link FileReference} from a {@link PromptVariableWithData} instance.
   * @throws if variable name is not equal to {@link VARIABLE_NAME}.
   */
  static from(variable) {
    assert(variable.name === VARIABLE_NAME, `Variable name must be '${VARIABLE_NAME}', got '${variable.name}'.`);
    return new FileReference(variable.range, variable.data);
  }
  /**
   * Check if this token is equal to another one.
   */
  equals(other) {
    if (other instanceof FileReference === false) {
      return false;
    }
    return super.equals(other);
  }
  /**
   * Get the range of the `link` part of the token (e.g.,
   * the `/path/to/file.md` part of `#file:/path/to/file.md`).
   */
  get linkRange() {
    return super.dataRange;
  }
}
export {
  FileReference
};
//# sourceMappingURL=fileReference.js.map
