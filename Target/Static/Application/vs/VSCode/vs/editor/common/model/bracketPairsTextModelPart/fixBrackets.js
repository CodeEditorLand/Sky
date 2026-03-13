var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { LanguageAgnosticBracketTokens } from "./bracketPairsTree/brackets.js";
import { lengthAdd, lengthGetColumnCountIfZeroLineCount, lengthZero } from "./bracketPairsTree/length.js";
import { parseDocument } from "./bracketPairsTree/parser.js";
import { DenseKeyProvider } from "./bracketPairsTree/smallImmutableSet.js";
import { TextBufferTokenizer } from "./bracketPairsTree/tokenizer.js";
function fixBracketsInLine(tokens, languageConfigurationService) {
  const denseKeyProvider = new DenseKeyProvider();
  const bracketTokens = new LanguageAgnosticBracketTokens(denseKeyProvider, (languageId) => languageConfigurationService.getLanguageConfiguration(languageId));
  const tokenizer = new TextBufferTokenizer(new StaticTokenizerSource([tokens]), bracketTokens);
  const node = parseDocument(tokenizer, [], void 0, true);
  let str = "";
  const line = tokens.getLineContent();
  function processNode(node2, offset) {
    if (node2.kind === 2) {
      processNode(node2.openingBracket, offset);
      offset = lengthAdd(offset, node2.openingBracket.length);
      if (node2.child) {
        processNode(node2.child, offset);
        offset = lengthAdd(offset, node2.child.length);
      }
      if (node2.closingBracket) {
        processNode(node2.closingBracket, offset);
        offset = lengthAdd(offset, node2.closingBracket.length);
      } else {
        const singleLangBracketTokens = bracketTokens.getSingleLanguageBracketTokens(node2.openingBracket.languageId);
        const closingTokenText = singleLangBracketTokens.findClosingTokenText(node2.openingBracket.bracketIds);
        str += closingTokenText;
      }
    } else if (node2.kind === 3) {
    } else if (node2.kind === 0 || node2.kind === 1) {
      str += line.substring(lengthGetColumnCountIfZeroLineCount(offset), lengthGetColumnCountIfZeroLineCount(lengthAdd(offset, node2.length)));
    } else if (node2.kind === 4) {
      for (const child of node2.children) {
        processNode(child, offset);
        offset = lengthAdd(offset, child.length);
      }
    }
  }
  __name(processNode, "processNode");
  processNode(node, lengthZero);
  return str;
}
__name(fixBracketsInLine, "fixBracketsInLine");
class StaticTokenizerSource {
  static {
    __name(this, "StaticTokenizerSource");
  }
  constructor(lines) {
    this.lines = lines;
    this.tokenization = {
      getLineTokens: /* @__PURE__ */ __name((lineNumber) => {
        return this.lines[lineNumber - 1];
      }, "getLineTokens")
    };
  }
  getValue() {
    return this.lines.map((l) => l.getLineContent()).join("\n");
  }
  getLineCount() {
    return this.lines.length;
  }
  getLineLength(lineNumber) {
    return this.lines[lineNumber - 1].getLineContent().length;
  }
}
export {
  fixBracketsInLine
};
//# sourceMappingURL=fixBrackets.js.map
