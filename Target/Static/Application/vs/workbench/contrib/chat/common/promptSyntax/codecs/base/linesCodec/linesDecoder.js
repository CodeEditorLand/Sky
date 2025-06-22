var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Line } from "./tokens/line.js";
import { Range } from "../../../../../../../../editor/common/core/range.js";
import { NewLine } from "./tokens/newLine.js";
import { assert } from "../../../../../../../../base/common/assert.js";
import { CarriageReturn } from "./tokens/carriageReturn.js";
import { VSBuffer } from "../../../../../../../../base/common/buffer.js";
import { assertDefined } from "../../../../../../../../base/common/types.js";
import { BaseDecoder } from "../baseDecoder.js";
class LinesDecoder extends BaseDecoder {
  static {
    __name(this, "LinesDecoder");
  }
  constructor() {
    super(...arguments);
    this.buffer = VSBuffer.alloc(0);
  }
  /**
   * Process data received from the input stream.
   */
  onStreamData(chunk) {
    this.buffer = VSBuffer.concat([this.buffer, chunk]);
    this.processData(false);
  }
  /**
   * Process buffered data.
   *
   * @param streamEnded Flag that indicates if the input stream has ended,
   * 					  which means that is the last call of this method.
   * @throws If internal logic implementation error is detected.
   */
  processData(streamEnded) {
    while (this.buffer.byteLength > 0) {
      const lineNumber = this.lastEmittedLine ? this.lastEmittedLine.range.startLineNumber + 1 : 1;
      const endOfLineTokens = this.findEndOfLineTokens(lineNumber, streamEnded);
      const firstToken = endOfLineTokens[0];
      if (firstToken === void 0) {
        if (streamEnded) {
          this.emitLine(lineNumber, this.buffer.slice(0));
        }
        break;
      }
      this.emitLine(lineNumber, this.buffer.slice(0, firstToken.range.startColumn - 1));
      assertDefined(this.lastEmittedLine, "No last emitted line found.");
      if (endOfLineTokens.length === 1 && firstToken instanceof CarriageReturn) {
        endOfLineTokens.splice(0, 1, new NewLine(firstToken.range));
      }
      let startColumn = this.lastEmittedLine.range.endColumn;
      for (const token of endOfLineTokens) {
        const byteLength = token.byte.byteLength;
        const endColumn = startColumn + byteLength;
        this._onData.fire(token.withRange({ startColumn, endColumn }));
        this.buffer = this.buffer.slice(byteLength);
        startColumn = endColumn;
      }
    }
    if (streamEnded) {
      assert(this.buffer.byteLength === 0, "Expected the input data buffer to be empty when the stream ends.");
    }
  }
  /**
   * Find the end of line tokens in the data buffer.
   * Can return:
   *  - [`\r`, `\n`] tokens if the sequence is found
   *  - [`\r`] token if only the carriage return is found
   *  - [`\n`] token if only the newline is found
   *  - an `empty array` if no end of line tokens found
   */
  findEndOfLineTokens(lineNumber, streamEnded) {
    const result = [];
    const carriageReturnIndex = this.buffer.indexOf(CarriageReturn.byte);
    const newLineIndex = this.buffer.indexOf(NewLine.byte);
    if (carriageReturnIndex >= 0 && (carriageReturnIndex < newLineIndex || newLineIndex === -1)) {
      result.push(new CarriageReturn(new Range(lineNumber, carriageReturnIndex + 1, lineNumber, carriageReturnIndex + 1 + CarriageReturn.byte.byteLength)));
      if (newLineIndex === carriageReturnIndex + 1) {
        result.push(new NewLine(new Range(lineNumber, newLineIndex + 1, lineNumber, newLineIndex + 1 + NewLine.byte.byteLength)));
      }
      if (this.buffer.byteLength > carriageReturnIndex + 1 || streamEnded) {
        return result;
      }
      return [];
    }
    if (newLineIndex >= 0) {
      result.push(new NewLine(new Range(lineNumber, newLineIndex + 1, lineNumber, newLineIndex + 1 + NewLine.byte.byteLength)));
    }
    return result;
  }
  /**
   * Emit a provided line as the `Line` token to the output stream.
   */
  emitLine(lineNumber, lineBytes) {
    const line = new Line(lineNumber, lineBytes.toString());
    this._onData.fire(line);
    this.lastEmittedLine = line;
    this.buffer = this.buffer.slice(lineBytes.byteLength);
  }
  /**
   * Handle the end of the input stream - if the buffer still has some data,
   * emit it as the last available line token before firing the `onEnd` event.
   */
  onStreamEnd() {
    if (this.buffer.byteLength > 0) {
      this.processData(true);
    }
    super.onStreamEnd();
  }
}
export {
  LinesDecoder
};
//# sourceMappingURL=linesDecoder.js.map
