var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as strings from "../../../../base/common/strings.js";
import * as stringBuilder from "../../core/stringBuilder.js";
import { Range } from "../../core/range.js";
import { CharacterPair } from "../languageConfiguration.js";
class RichEditBracket {
  static {
    __name(this, "RichEditBracket");
  }
  _richEditBracketBrand = void 0;
  languageId;
  /**
   * A 0-based consecutive unique identifier for this bracket pair.
   * If a language has 5 bracket pairs, out of which 2 are grouped together,
   * it is expected that the `index` goes from 0 to 4.
   */
  index;
  /**
   * The open sequence for each bracket pair contained in this group.
   *
   * The open sequence at a specific index corresponds to the
   * closing sequence at the same index.
   *
   * [ open[i], closed[i] ] represent a bracket pair.
   */
  open;
  /**
   * The close sequence for each bracket pair contained in this group.
   *
   * The close sequence at a specific index corresponds to the
   * opening sequence at the same index.
   *
   * [ open[i], closed[i] ] represent a bracket pair.
   */
  close;
  /**
   * A regular expression that is useful to search for this bracket pair group in a string.
   *
   * This regular expression is built in a way that it is aware of the other bracket
   * pairs defined for the language, so it might match brackets from other groups.
   *
   * See the fine details in `getRegexForBracketPair`.
   */
  forwardRegex;
  /**
   * A regular expression that is useful to search for this bracket pair group in a string backwards.
   *
   * This regular expression is built in a way that it is aware of the other bracket
   * pairs defined for the language, so it might match brackets from other groups.
   *
   * See the fine defails in `getReversedRegexForBracketPair`.
   */
  reversedRegex;
  _openSet;
  _closeSet;
  constructor(languageId, index, open, close, forwardRegex, reversedRegex) {
    this.languageId = languageId;
    this.index = index;
    this.open = open;
    this.close = close;
    this.forwardRegex = forwardRegex;
    this.reversedRegex = reversedRegex;
    this._openSet = RichEditBracket._toSet(this.open);
    this._closeSet = RichEditBracket._toSet(this.close);
  }
  /**
   * Check if the provided `text` is an open bracket in this group.
   */
  isOpen(text) {
    return this._openSet.has(text);
  }
  /**
   * Check if the provided `text` is a close bracket in this group.
   */
  isClose(text) {
    return this._closeSet.has(text);
  }
  static _toSet(arr) {
    const result = /* @__PURE__ */ new Set();
    for (const element of arr) {
      result.add(element);
    }
    return result;
  }
}
function groupFuzzyBrackets(brackets) {
  const N = brackets.length;
  brackets = brackets.map((b) => [b[0].toLowerCase(), b[1].toLowerCase()]);
  const group = [];
  for (let i = 0; i < N; i++) {
    group[i] = i;
  }
  const areOverlapping = /* @__PURE__ */ __name((a, b) => {
    const [aOpen, aClose] = a;
    const [bOpen, bClose] = b;
    return aOpen === bOpen || aOpen === bClose || aClose === bOpen || aClose === bClose;
  }, "areOverlapping");
  const mergeGroups = /* @__PURE__ */ __name((g1, g2) => {
    const newG = Math.min(g1, g2);
    const oldG = Math.max(g1, g2);
    for (let i = 0; i < N; i++) {
      if (group[i] === oldG) {
        group[i] = newG;
      }
    }
  }, "mergeGroups");
  for (let i = 0; i < N; i++) {
    const a = brackets[i];
    for (let j = i + 1; j < N; j++) {
      const b = brackets[j];
      if (areOverlapping(a, b)) {
        mergeGroups(group[i], group[j]);
      }
    }
  }
  const result = [];
  for (let g = 0; g < N; g++) {
    const currentOpen = [];
    const currentClose = [];
    for (let i = 0; i < N; i++) {
      if (group[i] === g) {
        const [open, close] = brackets[i];
        currentOpen.push(open);
        currentClose.push(close);
      }
    }
    if (currentOpen.length > 0) {
      result.push({
        open: currentOpen,
        close: currentClose
      });
    }
  }
  return result;
}
__name(groupFuzzyBrackets, "groupFuzzyBrackets");
class RichEditBrackets {
  static {
    __name(this, "RichEditBrackets");
  }
  _richEditBracketsBrand = void 0;
  /**
   * All groups of brackets defined for this language.
   */
  brackets;
  /**
   * A regular expression that is useful to search for all bracket pairs in a string.
   *
   * See the fine details in `getRegexForBrackets`.
   */
  forwardRegex;
  /**
   * A regular expression that is useful to search for all bracket pairs in a string backwards.
   *
   * See the fine details in `getReversedRegexForBrackets`.
   */
  reversedRegex;
  /**
   * The length (i.e. str.length) for the longest bracket pair.
   */
  maxBracketLength;
  /**
   * A map useful for decoding a regex match and finding which bracket group was matched.
   */
  textIsBracket;
  /**
   * A set useful for decoding if a regex match is the open bracket of a bracket pair.
   */
  textIsOpenBracket;
  constructor(languageId, _brackets) {
    const brackets = groupFuzzyBrackets(_brackets);
    this.brackets = brackets.map((b, index) => {
      return new RichEditBracket(
        languageId,
        index,
        b.open,
        b.close,
        getRegexForBracketPair(b.open, b.close, brackets, index),
        getReversedRegexForBracketPair(b.open, b.close, brackets, index)
      );
    });
    this.forwardRegex = getRegexForBrackets(this.brackets);
    this.reversedRegex = getReversedRegexForBrackets(this.brackets);
    this.textIsBracket = {};
    this.textIsOpenBracket = {};
    this.maxBracketLength = 0;
    for (const bracket of this.brackets) {
      for (const open of bracket.open) {
        this.textIsBracket[open] = bracket;
        this.textIsOpenBracket[open] = true;
        this.maxBracketLength = Math.max(this.maxBracketLength, open.length);
      }
      for (const close of bracket.close) {
        this.textIsBracket[close] = bracket;
        this.textIsOpenBracket[close] = false;
        this.maxBracketLength = Math.max(this.maxBracketLength, close.length);
      }
    }
  }
}
function collectSuperstrings(str, brackets, currentIndex, dest) {
  for (let i = 0, len = brackets.length; i < len; i++) {
    if (i === currentIndex) {
      continue;
    }
    const bracket = brackets[i];
    for (const open of bracket.open) {
      if (open.indexOf(str) >= 0) {
        dest.push(open);
      }
    }
    for (const close of bracket.close) {
      if (close.indexOf(str) >= 0) {
        dest.push(close);
      }
    }
  }
}
__name(collectSuperstrings, "collectSuperstrings");
function lengthcmp(a, b) {
  return a.length - b.length;
}
__name(lengthcmp, "lengthcmp");
function unique(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  for (const element of arr) {
    if (seen.has(element)) {
      continue;
    }
    result.push(element);
    seen.add(element);
  }
  return result;
}
__name(unique, "unique");
function getRegexForBracketPair(open, close, brackets, currentIndex) {
  let pieces = [];
  pieces = pieces.concat(open);
  pieces = pieces.concat(close);
  for (let i = 0, len = pieces.length; i < len; i++) {
    collectSuperstrings(pieces[i], brackets, currentIndex, pieces);
  }
  pieces = unique(pieces);
  pieces.sort(lengthcmp);
  pieces.reverse();
  return createBracketOrRegExp(pieces);
}
__name(getRegexForBracketPair, "getRegexForBracketPair");
function getReversedRegexForBracketPair(open, close, brackets, currentIndex) {
  let pieces = [];
  pieces = pieces.concat(open);
  pieces = pieces.concat(close);
  for (let i = 0, len = pieces.length; i < len; i++) {
    collectSuperstrings(pieces[i], brackets, currentIndex, pieces);
  }
  pieces = unique(pieces);
  pieces.sort(lengthcmp);
  pieces.reverse();
  return createBracketOrRegExp(pieces.map(toReversedString));
}
__name(getReversedRegexForBracketPair, "getReversedRegexForBracketPair");
function getRegexForBrackets(brackets) {
  let pieces = [];
  for (const bracket of brackets) {
    for (const open of bracket.open) {
      pieces.push(open);
    }
    for (const close of bracket.close) {
      pieces.push(close);
    }
  }
  pieces = unique(pieces);
  return createBracketOrRegExp(pieces);
}
__name(getRegexForBrackets, "getRegexForBrackets");
function getReversedRegexForBrackets(brackets) {
  let pieces = [];
  for (const bracket of brackets) {
    for (const open of bracket.open) {
      pieces.push(open);
    }
    for (const close of bracket.close) {
      pieces.push(close);
    }
  }
  pieces = unique(pieces);
  return createBracketOrRegExp(pieces.map(toReversedString));
}
__name(getReversedRegexForBrackets, "getReversedRegexForBrackets");
function prepareBracketForRegExp(str) {
  const insertWordBoundaries = /^[\w ]+$/.test(str);
  str = strings.escapeRegExpCharacters(str);
  return insertWordBoundaries ? `\\b${str}\\b` : str;
}
__name(prepareBracketForRegExp, "prepareBracketForRegExp");
function createBracketOrRegExp(pieces, options) {
  const regexStr = `(${pieces.map(prepareBracketForRegExp).join(")|(")})`;
  return strings.createRegExp(regexStr, true, options);
}
__name(createBracketOrRegExp, "createBracketOrRegExp");
const toReversedString = /* @__PURE__ */ function() {
  function reverse(str) {
    const arr = new Uint16Array(str.length);
    let offset = 0;
    for (let i = str.length - 1; i >= 0; i--) {
      arr[offset++] = str.charCodeAt(i);
    }
    return stringBuilder.getPlatformTextDecoder().decode(arr);
  }
  __name(reverse, "reverse");
  let lastInput = null;
  let lastOutput = null;
  return /* @__PURE__ */ __name(function toReversedString2(str) {
    if (lastInput !== str) {
      lastInput = str;
      lastOutput = reverse(lastInput);
    }
    return lastOutput;
  }, "toReversedString");
}();
class BracketsUtils {
  static {
    __name(this, "BracketsUtils");
  }
  static _findPrevBracketInText(reversedBracketRegex, lineNumber, reversedText, offset) {
    const m = reversedText.match(reversedBracketRegex);
    if (!m) {
      return null;
    }
    const matchOffset = reversedText.length - (m.index || 0);
    const matchLength = m[0].length;
    const absoluteMatchOffset = offset + matchOffset;
    return new Range(lineNumber, absoluteMatchOffset - matchLength + 1, lineNumber, absoluteMatchOffset + 1);
  }
  static findPrevBracketInRange(reversedBracketRegex, lineNumber, lineText, startOffset, endOffset) {
    const reversedLineText = toReversedString(lineText);
    const reversedSubstr = reversedLineText.substring(lineText.length - endOffset, lineText.length - startOffset);
    return this._findPrevBracketInText(reversedBracketRegex, lineNumber, reversedSubstr, startOffset);
  }
  static findNextBracketInText(bracketRegex, lineNumber, text, offset) {
    const m = text.match(bracketRegex);
    if (!m) {
      return null;
    }
    const matchOffset = m.index || 0;
    const matchLength = m[0].length;
    if (matchLength === 0) {
      return null;
    }
    const absoluteMatchOffset = offset + matchOffset;
    return new Range(lineNumber, absoluteMatchOffset + 1, lineNumber, absoluteMatchOffset + 1 + matchLength);
  }
  static findNextBracketInRange(bracketRegex, lineNumber, lineText, startOffset, endOffset) {
    const substr = lineText.substring(startOffset, endOffset);
    return this.findNextBracketInText(bracketRegex, lineNumber, substr, startOffset);
  }
}
export {
  BracketsUtils,
  RichEditBracket,
  RichEditBrackets,
  createBracketOrRegExp
};
//# sourceMappingURL=richEditBrackets.js.map
