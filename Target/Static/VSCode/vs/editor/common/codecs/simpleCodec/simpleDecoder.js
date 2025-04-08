var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Hash } from "./tokens/hash.js";
import { Dash } from "./tokens/dash.js";
import { Colon } from "./tokens/colon.js";
import { FormFeed } from "./tokens/formFeed.js";
import { Tab } from "../simpleCodec/tokens/tab.js";
import { Word } from "../simpleCodec/tokens/word.js";
import { VerticalTab } from "./tokens/verticalTab.js";
import { Space } from "../simpleCodec/tokens/space.js";
import { NewLine } from "../linesCodec/tokens/newLine.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { ExclamationMark } from "./tokens/exclamationMark.js";
import { ReadableStream } from "../../../../base/common/stream.js";
import { CarriageReturn } from "../linesCodec/tokens/carriageReturn.js";
import { LinesDecoder, TLineToken } from "../linesCodec/linesDecoder.js";
import { LeftBracket, RightBracket, TBracket } from "./tokens/brackets.js";
import { BaseDecoder } from "../../../../base/common/codecs/baseDecoder.js";
import { LeftParenthesis, RightParenthesis, TParenthesis } from "./tokens/parentheses.js";
import { LeftAngleBracket, RightAngleBracket, TAngleBracket } from "./tokens/angleBrackets.js";
const WELL_KNOWN_TOKENS = Object.freeze([
  Space,
  Tab,
  VerticalTab,
  FormFeed,
  LeftBracket,
  RightBracket,
  LeftAngleBracket,
  RightAngleBracket,
  LeftParenthesis,
  RightParenthesis,
  Colon,
  Hash,
  Dash,
  ExclamationMark
]);
const WORD_STOP_CHARACTERS = Object.freeze([
  Space.symbol,
  Tab.symbol,
  VerticalTab.symbol,
  FormFeed.symbol,
  LeftBracket.symbol,
  RightBracket.symbol,
  LeftAngleBracket.symbol,
  RightAngleBracket.symbol,
  LeftParenthesis.symbol,
  RightParenthesis.symbol,
  Colon.symbol,
  Hash.symbol,
  Dash.symbol,
  ExclamationMark.symbol
]);
class SimpleDecoder extends BaseDecoder {
  static {
    __name(this, "SimpleDecoder");
  }
  constructor(stream) {
    super(new LinesDecoder(stream));
  }
  onStreamData(token) {
    if (token instanceof CarriageReturn || token instanceof NewLine) {
      this._onData.fire(token);
      return;
    }
    let i = 0;
    while (i < token.text.length) {
      const columnNumber = i + 1;
      const tokenConstructor = WELL_KNOWN_TOKENS.find((wellKnownToken) => {
        return wellKnownToken.symbol === token.text[i];
      });
      if (tokenConstructor) {
        this._onData.fire(tokenConstructor.newOnLine(token, columnNumber));
        i++;
        continue;
      }
      let word = "";
      while (i < token.text.length && !WORD_STOP_CHARACTERS.includes(token.text[i])) {
        word += token.text[i];
        i++;
      }
      this._onData.fire(
        Word.newOnLine(word, token, columnNumber)
      );
    }
  }
}
export {
  SimpleDecoder
};
//# sourceMappingURL=simpleDecoder.js.map
