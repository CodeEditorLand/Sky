var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function formatMessageForTerminal(message, options = {}) {
  let result = "";
  if (!options.excludeLeadingNewLine) {
    result += "\r\n";
  }
  result += "\x1B[0m\x1B[7m * ";
  if (options.loudFormatting) {
    result += "\x1B[0;104m";
  } else {
    result += "\x1B[0m";
  }
  result += ` ${message} \x1B[0m
\r`;
  return result;
}
__name(formatMessageForTerminal, "formatMessageForTerminal");
export {
  formatMessageForTerminal
};
//# sourceMappingURL=terminalStrings.js.map
