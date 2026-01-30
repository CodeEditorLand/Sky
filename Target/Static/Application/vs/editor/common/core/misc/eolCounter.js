var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var StringEOL;
(function(StringEOL2) {
  StringEOL2[StringEOL2["Unknown"] = 0] = "Unknown";
  StringEOL2[StringEOL2["Invalid"] = 3] = "Invalid";
  StringEOL2[StringEOL2["LF"] = 1] = "LF";
  StringEOL2[StringEOL2["CRLF"] = 2] = "CRLF";
})(StringEOL || (StringEOL = {}));
function countEOL(text) {
  let eolCount = 0;
  let firstLineLength = 0;
  let lastLineStart = 0;
  let eol = 0;
  for (let i = 0, len = text.length; i < len; i++) {
    const chr = text.charCodeAt(i);
    if (chr === 13) {
      if (eolCount === 0) {
        firstLineLength = i;
      }
      eolCount++;
      if (i + 1 < len && text.charCodeAt(i + 1) === 10) {
        eol |= 2;
        i++;
      } else {
        eol |= 3;
      }
      lastLineStart = i + 1;
    } else if (chr === 10) {
      eol |= 1;
      if (eolCount === 0) {
        firstLineLength = i;
      }
      eolCount++;
      lastLineStart = i + 1;
    }
  }
  if (eolCount === 0) {
    firstLineLength = text.length;
  }
  return [eolCount, firstLineLength, text.length - lastLineStart, eol];
}
__name(countEOL, "countEOL");
export {
  StringEOL,
  countEOL
};
//# sourceMappingURL=eolCounter.js.map
