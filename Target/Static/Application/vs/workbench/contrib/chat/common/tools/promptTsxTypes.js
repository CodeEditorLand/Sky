var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var PromptNodeType;
(function(PromptNodeType2) {
  PromptNodeType2[PromptNodeType2["Piece"] = 1] = "Piece";
  PromptNodeType2[PromptNodeType2["Text"] = 2] = "Text";
})(PromptNodeType || (PromptNodeType = {}));
var PieceCtorKind;
(function(PieceCtorKind2) {
  PieceCtorKind2[PieceCtorKind2["BaseChatMessage"] = 1] = "BaseChatMessage";
  PieceCtorKind2[PieceCtorKind2["Other"] = 2] = "Other";
  PieceCtorKind2[PieceCtorKind2["ImageChatMessage"] = 3] = "ImageChatMessage";
})(PieceCtorKind || (PieceCtorKind = {}));
function stringifyPromptElementJSON(element) {
  const strs = [];
  stringifyPromptNodeJSON(element.node, strs);
  return strs.join("");
}
__name(stringifyPromptElementJSON, "stringifyPromptElementJSON");
function stringifyPromptNodeJSON(node, strs) {
  if (node.type === 2) {
    if (node.lineBreakBefore) {
      strs.push("\n");
    }
    if (typeof node.text === "string") {
      strs.push(node.text);
    }
  } else if (node.ctor === 3) {
    strs.push("<image>");
  } else if (node.ctor === 1 || node.ctor === 2) {
    for (const child of node.children) {
      stringifyPromptNodeJSON(child, strs);
    }
  }
}
__name(stringifyPromptNodeJSON, "stringifyPromptNodeJSON");
export {
  PieceCtorKind,
  PromptNodeType,
  stringifyPromptElementJSON
};
//# sourceMappingURL=promptTsxTypes.js.map
