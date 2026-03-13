var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { findNodeAtLocation, parseTree as jsonParseTree } from "../../../../base/common/json.js";
const getMcpServerMapping = /* @__PURE__ */ __name((opts) => {
  const tree = jsonParseTree(opts.model.getValue());
  const servers = findNodeAtLocation(tree, opts.pathToServers);
  if (!servers || servers.type !== "object") {
    return /* @__PURE__ */ new Map();
  }
  const result = /* @__PURE__ */ new Map();
  for (const node of servers.children || []) {
    if (node.type !== "property" || node.children?.[0]?.type !== "string") {
      continue;
    }
    const start = opts.model.getPositionAt(node.offset);
    const end = opts.model.getPositionAt(node.offset + node.length);
    result.set(node.children[0].value, {
      uri: opts.model.uri,
      range: {
        startLineNumber: start.lineNumber,
        startColumn: start.column,
        endLineNumber: end.lineNumber,
        endColumn: end.column
      }
    });
  }
  return result;
}, "getMcpServerMapping");
export {
  getMcpServerMapping
};
//# sourceMappingURL=mcpConfigFileUtils.js.map
