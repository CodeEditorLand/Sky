var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isPowerShell } from "../../runInTerminalHelpers.js";
class RubyCommandLinePresenter {
  static {
    __name(this, "RubyCommandLinePresenter");
  }
  present(options) {
    const extractedRuby = extractRubyCommand(options.commandLine, options.shell, options.os);
    if (extractedRuby) {
      return {
        commandLine: extractedRuby,
        language: "ruby",
        languageDisplayName: "Ruby"
      };
    }
    return void 0;
  }
}
function extractRubyCommand(commandLine, shell, os) {
  const doubleQuoteMatch = commandLine.match(/^ruby\s+-e\s+"(?<code>.+)"$/s);
  if (doubleQuoteMatch?.groups?.code) {
    let rubyCode = doubleQuoteMatch.groups.code.trim();
    if (!rubyCode) {
      return void 0;
    }
    if (isPowerShell(shell, os)) {
      rubyCode = rubyCode.replace(/`"/g, '"');
    } else {
      rubyCode = rubyCode.replace(/\\"/g, '"');
    }
    return rubyCode;
  }
  const singleQuoteMatch = commandLine.match(/^ruby\s+-e\s+'(?<code>.+)'$/s);
  if (singleQuoteMatch?.groups?.code) {
    const rubyCode = singleQuoteMatch.groups.code.trim();
    if (!rubyCode) {
      return void 0;
    }
    return rubyCode;
  }
  return void 0;
}
__name(extractRubyCommand, "extractRubyCommand");
export {
  RubyCommandLinePresenter,
  extractRubyCommand
};
//# sourceMappingURL=rubyCommandLinePresenter.js.map
