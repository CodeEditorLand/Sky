var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function getSpaceCnt(str, tabSize) {
  let spacesCnt = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charAt(i) === "	") {
      spacesCnt += tabSize;
    } else {
      spacesCnt++;
    }
  }
  return spacesCnt;
}
__name(getSpaceCnt, "getSpaceCnt");
function generateIndent(spacesCnt, tabSize, insertSpaces) {
  spacesCnt = spacesCnt < 0 ? 0 : spacesCnt;
  let result = "";
  if (!insertSpaces) {
    const tabsCnt = Math.floor(spacesCnt / tabSize);
    spacesCnt = spacesCnt % tabSize;
    for (let i = 0; i < tabsCnt; i++) {
      result += "	";
    }
  }
  for (let i = 0; i < spacesCnt; i++) {
    result += " ";
  }
  return result;
}
__name(generateIndent, "generateIndent");
export {
  generateIndent,
  getSpaceCnt
};
//# sourceMappingURL=indentUtils.js.map
