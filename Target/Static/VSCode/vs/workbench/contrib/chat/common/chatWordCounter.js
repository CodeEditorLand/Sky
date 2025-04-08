var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const r = String.raw;
const linkPattern = r`(?<!\\)` + // Must not start with escape
// text
r`(!?\[` + // open prefix match -->
/**/
r`(?:` + /*****/
r`[^\[\]\\]|` + // Non-bracket chars, or...
/*****/
r`\\.|` + // Escaped char, or...
/*****/
r`\[[^\[\]]*\]` + // Matched bracket pair
/**/
r`)*` + r`\])` + // <-- close prefix match
// Destination
r`(\(\s*)` + // Pre href
/**/
r`(` + /*****/
r`[^\s\(\)<](?:[^\s\(\)]|\([^\s\(\)]*?\))*|` + // Link without whitespace, or...
/*****/
r`<(?:\\[<>]|[^<>])+>` + // In angle brackets
/**/
r`)` + // Title
/**/
r`\s*(?:"[^"]*"|'[^']*'|\([^\(\)]*\))?\s*` + r`\)`;
function getNWords(str, numWordsToCount) {
  const allWordMatches = Array.from(str.matchAll(new RegExp(linkPattern + r`|\p{sc=Han}|=+|\++|-+|[^\s\|\p{sc=Han}|=|\+|\-]+`, "gu")));
  const targetWords = allWordMatches.slice(0, numWordsToCount);
  const endIndex = numWordsToCount >= allWordMatches.length ? str.length : targetWords.length ? targetWords.at(-1).index + targetWords.at(-1)[0].length : 0;
  const value = str.substring(0, endIndex);
  return {
    value,
    returnedWordCount: targetWords.length === 0 ? value.length ? 1 : 0 : targetWords.length,
    isFullString: endIndex >= str.length,
    totalWordCount: allWordMatches.length
  };
}
__name(getNWords, "getNWords");
function countWords(str) {
  const result = getNWords(str, Number.MAX_SAFE_INTEGER);
  return result.returnedWordCount;
}
__name(countWords, "countWords");
export {
  countWords,
  getNWords
};
//# sourceMappingURL=chatWordCounter.js.map
