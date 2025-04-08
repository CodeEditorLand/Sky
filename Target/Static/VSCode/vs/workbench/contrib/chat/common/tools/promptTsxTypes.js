var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function stringifyPromptElementJSON(element) {
  const strs = [];
  stringifyPromptNodeJSON(element.node, strs);
  return strs.join("");
}
__name(stringifyPromptElementJSON, "stringifyPromptElementJSON");
function stringifyPromptNodeJSON(node, strs) {
  if (node.type === PromptNodeType.Text) {
    if (node.lineBreakBefore) {
      strs.push("\n");
    }
    if (typeof node.text === "string") {
      strs.push(node.text);
    }
  } else if (node.ctor === PieceCtorKind.ImageChatMessage) {
    strs.push("<image>");
  } else if (node.ctor === PieceCtorKind.BaseChatMessage || node.ctor === PieceCtorKind.Other) {
    for (const child of node.children) {
      stringifyPromptNodeJSON(child, strs);
    }
  }
}
__name(stringifyPromptNodeJSON, "stringifyPromptNodeJSON");
export {
  stringifyPromptElementJSON
};
//# sourceMappingURL=promptTsxTypes.js.map
