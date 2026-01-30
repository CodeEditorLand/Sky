var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { extractCdPrefix } from "../../runInTerminalHelpers.js";
class CommandLineCdPrefixRewriter extends Disposable {
  static {
    __name(this, "CommandLineCdPrefixRewriter");
  }
  rewrite(options) {
    if (!options.cwd) {
      return void 0;
    }
    const extracted = extractCdPrefix(options.commandLine, options.shell, options.os);
    if (extracted) {
      let cdDirPath = extracted.directory.replace(/(?:[\\\/])$/, "");
      let cwdFsPath = options.cwd.fsPath.replace(/(?:[\\\/])$/, "");
      if (options.os === 1) {
        cdDirPath = cdDirPath.toLowerCase();
        cwdFsPath = cwdFsPath.toLowerCase();
      }
      if (cdDirPath === cwdFsPath) {
        return { rewritten: extracted.command, reasoning: "Removed redundant cd command" };
      }
    }
    return void 0;
  }
}
export {
  CommandLineCdPrefixRewriter
};
//# sourceMappingURL=commandLineCdPrefixRewriter.js.map
