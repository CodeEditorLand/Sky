var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../core/range.js";
import { Searcher } from "../model/textModelSearch.js";
import * as strings from "../../../base/common/strings.js";
import { assertNever } from "../../../base/common/assert.js";
import { DEFAULT_WORD_REGEXP, getWordAtText } from "../core/wordHelper.js";
class UnicodeTextModelHighlighter {
  static {
    __name(this, "UnicodeTextModelHighlighter");
  }
  static computeUnicodeHighlights(model, options, range) {
    const startLine = range ? range.startLineNumber : 1;
    const endLine = range ? range.endLineNumber : model.getLineCount();
    const codePointHighlighter = new CodePointHighlighter(options);
    const candidates = codePointHighlighter.getCandidateCodePoints();
    let regex;
    if (candidates === "allNonBasicAscii") {
      regex = new RegExp("[^\\t\\n\\r\\x20-\\x7E]", "g");
    } else {
      regex = new RegExp(`${buildRegExpCharClassExpr(Array.from(candidates))}`, "g");
    }
    const searcher = new Searcher(null, regex);
    const ranges = [];
    let hasMore = false;
    let m;
    let ambiguousCharacterCount = 0;
    let invisibleCharacterCount = 0;
    let nonBasicAsciiCharacterCount = 0;
    forLoop: for (let lineNumber = startLine, lineCount = endLine; lineNumber <= lineCount; lineNumber++) {
      const lineContent = model.getLineContent(lineNumber);
      const lineLength = lineContent.length;
      searcher.reset(0);
      do {
        m = searcher.next(lineContent);
        if (m) {
          let startIndex = m.index;
          let endIndex = m.index + m[0].length;
          if (startIndex > 0) {
            const charCodeBefore = lineContent.charCodeAt(startIndex - 1);
            if (strings.isHighSurrogate(charCodeBefore)) {
              startIndex--;
            }
          }
          if (endIndex + 1 < lineLength) {
            const charCodeBefore = lineContent.charCodeAt(endIndex - 1);
            if (strings.isHighSurrogate(charCodeBefore)) {
              endIndex++;
            }
          }
          const str = lineContent.substring(startIndex, endIndex);
          let word = getWordAtText(startIndex + 1, DEFAULT_WORD_REGEXP, lineContent, 0);
          if (word && word.endColumn <= startIndex + 1) {
            word = null;
          }
          const highlightReason = codePointHighlighter.shouldHighlightNonBasicASCII(str, word ? word.word : null);
          if (highlightReason !== 0) {
            if (highlightReason === 3) {
              ambiguousCharacterCount++;
            } else if (highlightReason === 2) {
              invisibleCharacterCount++;
            } else if (highlightReason === 1) {
              nonBasicAsciiCharacterCount++;
            } else {
              assertNever(highlightReason);
            }
            const MAX_RESULT_LENGTH = 1e3;
            if (ranges.length >= MAX_RESULT_LENGTH) {
              hasMore = true;
              break forLoop;
            }
            ranges.push(new Range(lineNumber, startIndex + 1, lineNumber, endIndex + 1));
          }
        }
      } while (m);
    }
    return {
      ranges,
      hasMore,
      ambiguousCharacterCount,
      invisibleCharacterCount,
      nonBasicAsciiCharacterCount
    };
  }
  static computeUnicodeHighlightReason(char, options) {
    const codePointHighlighter = new CodePointHighlighter(options);
    const reason = codePointHighlighter.shouldHighlightNonBasicASCII(char, null);
    switch (reason) {
      case 0:
        return null;
      case 2:
        return {
          kind: 1
          /* UnicodeHighlighterReasonKind.Invisible */
        };
      case 3: {
        const codePoint = char.codePointAt(0);
        const primaryConfusable = codePointHighlighter.ambiguousCharacters.getPrimaryConfusable(codePoint);
        const notAmbiguousInLocales = strings.AmbiguousCharacters.getLocales().filter((l) => !strings.AmbiguousCharacters.getInstance(/* @__PURE__ */ new Set([...options.allowedLocales, l])).isAmbiguous(codePoint));
        return { kind: 0, confusableWith: String.fromCodePoint(primaryConfusable), notAmbiguousInLocales };
      }
      case 1:
        return {
          kind: 2
          /* UnicodeHighlighterReasonKind.NonBasicAscii */
        };
    }
  }
}
function buildRegExpCharClassExpr(codePoints, flags) {
  const src = `[${strings.escapeRegExpCharacters(codePoints.map((i) => String.fromCodePoint(i)).join(""))}]`;
  return src;
}
__name(buildRegExpCharClassExpr, "buildRegExpCharClassExpr");
var UnicodeHighlighterReasonKind;
(function(UnicodeHighlighterReasonKind2) {
  UnicodeHighlighterReasonKind2[UnicodeHighlighterReasonKind2["Ambiguous"] = 0] = "Ambiguous";
  UnicodeHighlighterReasonKind2[UnicodeHighlighterReasonKind2["Invisible"] = 1] = "Invisible";
  UnicodeHighlighterReasonKind2[UnicodeHighlighterReasonKind2["NonBasicAscii"] = 2] = "NonBasicAscii";
})(UnicodeHighlighterReasonKind || (UnicodeHighlighterReasonKind = {}));
class CodePointHighlighter {
  static {
    __name(this, "CodePointHighlighter");
  }
  constructor(options) {
    this.options = options;
    this.allowedCodePoints = new Set(options.allowedCodePoints);
    this.ambiguousCharacters = strings.AmbiguousCharacters.getInstance(new Set(options.allowedLocales));
  }
  getCandidateCodePoints() {
    if (this.options.nonBasicASCII) {
      return "allNonBasicAscii";
    }
    const set = /* @__PURE__ */ new Set();
    if (this.options.invisibleCharacters) {
      for (const cp of strings.InvisibleCharacters.codePoints) {
        if (!isAllowedInvisibleCharacter(String.fromCodePoint(cp))) {
          set.add(cp);
        }
      }
    }
    if (this.options.ambiguousCharacters) {
      for (const cp of this.ambiguousCharacters.getConfusableCodePoints()) {
        set.add(cp);
      }
    }
    for (const cp of this.allowedCodePoints) {
      set.delete(cp);
    }
    return set;
  }
  shouldHighlightNonBasicASCII(character, wordContext) {
    const codePoint = character.codePointAt(0);
    if (this.allowedCodePoints.has(codePoint)) {
      return 0;
    }
    if (this.options.nonBasicASCII) {
      return 1;
    }
    let hasBasicASCIICharacters = false;
    let hasNonConfusableNonBasicAsciiCharacter = false;
    if (wordContext) {
      for (const char of wordContext) {
        const codePoint2 = char.codePointAt(0);
        const isBasicASCII = strings.isBasicASCII(char);
        hasBasicASCIICharacters = hasBasicASCIICharacters || isBasicASCII;
        if (!isBasicASCII && !this.ambiguousCharacters.isAmbiguous(codePoint2) && !strings.InvisibleCharacters.isInvisibleCharacter(codePoint2)) {
          hasNonConfusableNonBasicAsciiCharacter = true;
        }
      }
    }
    if (
      /* Don't allow mixing weird looking characters with ASCII */
      !hasBasicASCIICharacters && /* Is there an obviously weird looking character? */
      hasNonConfusableNonBasicAsciiCharacter
    ) {
      return 0;
    }
    if (this.options.invisibleCharacters) {
      if (!isAllowedInvisibleCharacter(character) && strings.InvisibleCharacters.isInvisibleCharacter(codePoint)) {
        return 2;
      }
    }
    if (this.options.ambiguousCharacters) {
      if (this.ambiguousCharacters.isAmbiguous(codePoint)) {
        return 3;
      }
    }
    return 0;
  }
}
function isAllowedInvisibleCharacter(character) {
  return character === " " || character === "\n" || character === "	";
}
__name(isAllowedInvisibleCharacter, "isAllowedInvisibleCharacter");
var SimpleHighlightReason;
(function(SimpleHighlightReason2) {
  SimpleHighlightReason2[SimpleHighlightReason2["None"] = 0] = "None";
  SimpleHighlightReason2[SimpleHighlightReason2["NonBasicASCII"] = 1] = "NonBasicASCII";
  SimpleHighlightReason2[SimpleHighlightReason2["Invisible"] = 2] = "Invisible";
  SimpleHighlightReason2[SimpleHighlightReason2["Ambiguous"] = 3] = "Ambiguous";
})(SimpleHighlightReason || (SimpleHighlightReason = {}));
export {
  UnicodeHighlighterReasonKind,
  UnicodeTextModelHighlighter
};
//# sourceMappingURL=unicodeTextModelHighlighter.js.map
