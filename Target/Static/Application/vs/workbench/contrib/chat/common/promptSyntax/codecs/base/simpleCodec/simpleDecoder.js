var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { NewLine } from "../linesCodec/tokens/newLine.js";
import { CarriageReturn } from "../linesCodec/tokens/carriageReturn.js";
import { LinesDecoder } from "../linesCodec/linesDecoder.js";
import { At, Tab, Word, Hash, Dash, Colon, Slash, Space, Quote, Comma, FormFeed, DollarSign, DoubleQuote, VerticalTab, LeftBracket, RightBracket, LeftCurlyBrace, RightCurlyBrace, ExclamationMark, LeftParenthesis, RightParenthesis, LeftAngleBracket, RightAngleBracket } from "./tokens/tokens.js";
import { SimpleToken } from "./tokens/simpleToken.js";
import { BaseDecoder } from "../baseDecoder.js";
const WELL_KNOWN_TOKENS = Object.freeze([
  LeftParenthesis,
  RightParenthesis,
  LeftBracket,
  RightBracket,
  LeftCurlyBrace,
  RightCurlyBrace,
  LeftAngleBracket,
  RightAngleBracket,
  Space,
  Tab,
  VerticalTab,
  FormFeed,
  Colon,
  Hash,
  Dash,
  ExclamationMark,
  At,
  Slash,
  DollarSign,
  Quote,
  DoubleQuote,
  Comma
]);
const WORD_STOP_CHARACTERS = Object.freeze(WELL_KNOWN_TOKENS.map((token) => token.symbol));
class SimpleDecoder extends BaseDecoder {
  static {
    __name(this, "SimpleDecoder");
  }
  constructor(stream) {
    super(new LinesDecoder(stream));
  }
  onStreamData(line) {
    if (line instanceof CarriageReturn || line instanceof NewLine) {
      this._onData.fire(line);
      return;
    }
    const lineText = line.text.split("");
    let i = 0;
    while (i < lineText.length) {
      const columnNumber = i + 1;
      const character = lineText[i];
      const tokenConstructor = WELL_KNOWN_TOKENS.find((wellKnownToken) => {
        return wellKnownToken.symbol === character;
      });
      if (tokenConstructor) {
        this._onData.fire(SimpleToken.newOnLine(line, columnNumber, tokenConstructor));
        i++;
        continue;
      }
      let word = "";
      while (i < lineText.length && !WORD_STOP_CHARACTERS.includes(lineText[i])) {
        word += lineText[i];
        i++;
      }
      this._onData.fire(Word.newOnLine(word, line, columnNumber));
    }
  }
}
export {
  SimpleDecoder,
  WELL_KNOWN_TOKENS
};
//# sourceMappingURL=simpleDecoder.js.map
