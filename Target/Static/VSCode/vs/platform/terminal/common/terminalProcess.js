var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { UriComponents } from "../../../base/common/uri.js";
import { ISerializableEnvironmentVariableCollection, ISerializableEnvironmentVariableCollections } from "./environmentVariable.js";
import { IFixedTerminalDimensions, IRawTerminalTabLayoutInfo, IReconnectionProperties, ITerminalEnvironment, ITerminalTabAction, ITerminalTabLayoutInfoById, TerminalIcon, TerminalType, TitleEventSource, WaitOnExitValue } from "./terminal.js";
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["WriteMaxChunkSize"] = 50] = "WriteMaxChunkSize";
  return Constants2;
})(Constants || {});
function chunkInput(data) {
  const chunks = [];
  let nextChunkStartIndex = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (
      // If the max chunk size is reached
      i - nextChunkStartIndex + 1 >= 50 /* WriteMaxChunkSize */ || // If the next character is ESC, send the pending data to avoid splitting the escape
      // sequence.
      data[i + 1] === "\x1B"
    ) {
      chunks.push(data.substring(nextChunkStartIndex, i + 1));
      nextChunkStartIndex = i + 1;
      i++;
    }
  }
  if (nextChunkStartIndex !== data.length) {
    chunks.push(data.substring(nextChunkStartIndex));
  }
  return chunks;
}
__name(chunkInput, "chunkInput");
export {
  chunkInput
};
//# sourceMappingURL=terminalProcess.js.map
