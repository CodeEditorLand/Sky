var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Iterable } from "../../../base/common/iterator.js";
import { toDisposable } from "../../../base/common/lifecycle.js";
import { LinkedList } from "../../../base/common/linkedList.js";
const USUAL_WORD_SEPARATORS = "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?";
function createWordRegExp(allowInWords = "") {
  let source = "(-?\\d*\\.\\d\\w*)|([^";
  for (const sep of USUAL_WORD_SEPARATORS) {
    if (allowInWords.indexOf(sep) >= 0) {
      continue;
    }
    source += "\\" + sep;
  }
  source += "\\s]+)";
  return new RegExp(source, "g");
}
__name(createWordRegExp, "createWordRegExp");
const DEFAULT_WORD_REGEXP = createWordRegExp();
function ensureValidWordDefinition(wordDefinition) {
  let result = DEFAULT_WORD_REGEXP;
  if (wordDefinition && wordDefinition instanceof RegExp) {
    if (!wordDefinition.global) {
      let flags = "g";
      if (wordDefinition.ignoreCase) {
        flags += "i";
      }
      if (wordDefinition.multiline) {
        flags += "m";
      }
      if (wordDefinition.unicode) {
        flags += "u";
      }
      result = new RegExp(wordDefinition.source, flags);
    } else {
      result = wordDefinition;
    }
  }
  result.lastIndex = 0;
  return result;
}
__name(ensureValidWordDefinition, "ensureValidWordDefinition");
const _defaultConfig = new LinkedList();
_defaultConfig.unshift({
  maxLen: 1e3,
  windowSize: 15,
  timeBudget: 150
});
function setDefaultGetWordAtTextConfig(value) {
  const rm = _defaultConfig.unshift(value);
  return toDisposable(rm);
}
__name(setDefaultGetWordAtTextConfig, "setDefaultGetWordAtTextConfig");
function getWordAtText(column, wordDefinition, text, textOffset, config) {
  wordDefinition = ensureValidWordDefinition(wordDefinition);
  if (!config) {
    config = Iterable.first(_defaultConfig);
  }
  if (text.length > config.maxLen) {
    let start = column - config.maxLen / 2;
    if (start < 0) {
      start = 0;
    } else {
      textOffset += start;
    }
    text = text.substring(start, column + config.maxLen / 2);
    return getWordAtText(column, wordDefinition, text, textOffset, config);
  }
  const t1 = Date.now();
  const pos = column - 1 - textOffset;
  let prevRegexIndex = -1;
  let match = null;
  for (let i = 1; ; i++) {
    if (Date.now() - t1 >= config.timeBudget) {
      break;
    }
    const regexIndex = pos - config.windowSize * i;
    wordDefinition.lastIndex = Math.max(0, regexIndex);
    const thisMatch = _findRegexMatchEnclosingPosition(wordDefinition, text, pos, prevRegexIndex);
    if (!thisMatch && match) {
      break;
    }
    match = thisMatch;
    if (regexIndex <= 0) {
      break;
    }
    prevRegexIndex = regexIndex;
  }
  if (match) {
    const result = {
      word: match[0],
      startColumn: textOffset + 1 + match.index,
      endColumn: textOffset + 1 + match.index + match[0].length
    };
    wordDefinition.lastIndex = 0;
    return result;
  }
  return null;
}
__name(getWordAtText, "getWordAtText");
function _findRegexMatchEnclosingPosition(wordDefinition, text, pos, stopPos) {
  let match;
  while (match = wordDefinition.exec(text)) {
    const matchIndex = match.index || 0;
    if (matchIndex <= pos && wordDefinition.lastIndex >= pos) {
      return match;
    } else if (stopPos > 0 && matchIndex > stopPos) {
      return null;
    }
  }
  return null;
}
__name(_findRegexMatchEnclosingPosition, "_findRegexMatchEnclosingPosition");
export {
  DEFAULT_WORD_REGEXP,
  USUAL_WORD_SEPARATORS,
  ensureValidWordDefinition,
  getWordAtText,
  setDefaultGetWordAtTextConfig
};
//# sourceMappingURL=wordHelper.js.map
