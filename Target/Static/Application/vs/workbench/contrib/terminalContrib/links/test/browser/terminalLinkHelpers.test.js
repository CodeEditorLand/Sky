var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { convertLinkRangeToBuffer } from "../../browser/terminalLinkHelpers.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
suite("Workbench - Terminal Link Helpers", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("convertLinkRangeToBuffer", () => {
    test("should convert ranges for ascii characters", () => {
      const lines = createBufferLineArray([
        { text: "AA http://t", width: 11 },
        { text: ".com/f/", width: 8 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 4, startLineNumber: 1, endColumn: 19, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 4, y: 1 },
        end: { x: 7, y: 2 }
      });
    });
    test("should convert ranges for wide characters before the link", () => {
      const lines = createBufferLineArray([
        { text: "A\u6587 http://", width: 11 },
        { text: "t.com/f/", width: 9 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 4, startLineNumber: 1, endColumn: 19, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 4 + 1, y: 1 },
        end: { x: 7 + 1, y: 2 }
      });
    });
    test("should give correct range for links containing multi-character emoji", () => {
      const lines = createBufferLineArray([
        { text: "A\u{1F642} http://", width: 11 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 0 + 1, startLineNumber: 1, endColumn: 2 + 1, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 1, y: 1 },
        end: { x: 2, y: 1 }
      });
    });
    test("should convert ranges for combining characters before the link", () => {
      const lines = createBufferLineArray([
        { text: "A\u{1F642} http://", width: 11 },
        { text: "t.com/f/", width: 9 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 4 + 1, startLineNumber: 1, endColumn: 19 + 1, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 6, y: 1 },
        end: { x: 9, y: 2 }
      });
    });
    test("should convert ranges for wide characters inside the link", () => {
      const lines = createBufferLineArray([
        { text: "AA http://t", width: 11 },
        { text: ".com/\u6587/", width: 8 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 4, startLineNumber: 1, endColumn: 19, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 4, y: 1 },
        end: { x: 7 + 1, y: 2 }
      });
    });
    test("should convert ranges for wide characters before and inside the link", () => {
      const lines = createBufferLineArray([
        { text: "A\u6587 http://", width: 11 },
        { text: "t.com/\u6587/", width: 9 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 4, startLineNumber: 1, endColumn: 19, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 4 + 1, y: 1 },
        end: { x: 7 + 2, y: 2 }
      });
    });
    test("should convert ranges for emoji before and wide inside the link", () => {
      const lines = createBufferLineArray([
        { text: "A\u{1F642} http://", width: 11 },
        { text: "t.com/\u6587/", width: 9 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 4 + 1, startLineNumber: 1, endColumn: 19 + 1, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 6, y: 1 },
        end: { x: 10 + 1, y: 2 }
      });
    });
    test("should convert ranges for ascii characters (link starts on wrapped)", () => {
      const lines = createBufferLineArray([
        { text: "AAAAAAAAAAA", width: 11 },
        { text: "AA http://t", width: 11 },
        { text: ".com/f/", width: 8 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 15, startLineNumber: 1, endColumn: 30, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 4, y: 2 },
        end: { x: 7, y: 3 }
      });
    });
    test("should convert ranges for wide characters before the link (link starts on wrapped)", () => {
      const lines = createBufferLineArray([
        { text: "AAAAAAAAAAA", width: 11 },
        { text: "A\u6587 http://", width: 11 },
        { text: "t.com/f/", width: 9 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 15, startLineNumber: 1, endColumn: 30, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 4 + 1, y: 2 },
        end: { x: 7 + 1, y: 3 }
      });
    });
    test("regression test #147619: \u83B7\u53D6\u6A21\u677F 25235168 \u7684\u9884\u89C8\u56FE\u5931\u8D25", () => {
      const lines = createBufferLineArray([
        { text: "\u83B7\u53D6\u6A21\u677F 25235168 \u7684\u9884\u89C8\u56FE\u5931\u8D25", width: 30 }
      ]);
      assert.deepStrictEqual(convertLinkRangeToBuffer(lines, 30, {
        startColumn: 1,
        startLineNumber: 1,
        endColumn: 5,
        endLineNumber: 1
      }, 0), {
        start: { x: 1, y: 1 },
        end: { x: 8, y: 1 }
      });
      assert.deepStrictEqual(convertLinkRangeToBuffer(lines, 30, {
        startColumn: 6,
        startLineNumber: 1,
        endColumn: 14,
        endLineNumber: 1
      }, 0), {
        start: { x: 10, y: 1 },
        end: { x: 17, y: 1 }
      });
      assert.deepStrictEqual(convertLinkRangeToBuffer(lines, 30, {
        startColumn: 15,
        startLineNumber: 1,
        endColumn: 21,
        endLineNumber: 1
      }, 0), {
        start: { x: 19, y: 1 },
        end: { x: 30, y: 1 }
      });
    });
    test("should convert ranges for wide characters inside the link (link starts on wrapped)", () => {
      const lines = createBufferLineArray([
        { text: "AAAAAAAAAAA", width: 11 },
        { text: "AA http://t", width: 11 },
        { text: ".com/\u6587/", width: 8 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 15, startLineNumber: 1, endColumn: 30, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 4, y: 2 },
        end: { x: 7 + 1, y: 3 }
      });
    });
    test("should convert ranges for wide characters before and inside the link #2", () => {
      const lines = createBufferLineArray([
        { text: "AAAAAAAAAAA", width: 11 },
        { text: "A\u6587 http://", width: 11 },
        { text: "t.com/\u6587/", width: 9 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 15, startLineNumber: 1, endColumn: 30, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 4 + 1, y: 2 },
        end: { x: 7 + 2, y: 3 }
      });
    });
    test("should convert ranges for several wide characters before the link", () => {
      const lines = createBufferLineArray([
        { text: "A\u6587\u6587AAAAAA", width: 11 },
        { text: "AA\u6587\u6587 http", width: 11 },
        { text: "://t.com/f/", width: 11 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 15, startLineNumber: 1, endColumn: 30, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 3 + 4, y: 2 },
        end: { x: 6 + 4, y: 3 }
      });
    });
    test("should convert ranges for several wide characters before and inside the link", () => {
      const lines = createBufferLineArray([
        { text: "A\u6587\u6587AAAAAA", width: 11 },
        { text: "AA\u6587\u6587 http", width: 11 },
        { text: "://t.com/\u6587", width: 11 },
        { text: "\u6587/", width: 3 }
      ]);
      const bufferRange = convertLinkRangeToBuffer(lines, 11, { startColumn: 14, startLineNumber: 1, endColumn: 31, endLineNumber: 1 }, 0);
      assert.deepStrictEqual(bufferRange, {
        start: { x: 5, y: 2 },
        end: { x: 1, y: 4 }
      });
    });
  });
});
const TEST_WIDE_CHAR = "\u6587";
const TEST_NULL_CHAR = "C";
function createBufferLineArray(lines) {
  const result = [];
  lines.forEach((l, i) => {
    result.push(new TestBufferLine(l.text, l.width, i + 1 !== lines.length));
  });
  return result;
}
__name(createBufferLineArray, "createBufferLineArray");
class TestBufferLine {
  static {
    __name(this, "TestBufferLine");
  }
  constructor(_text, length, isWrapped) {
    this._text = _text;
    this.length = length;
    this.isWrapped = isWrapped;
  }
  getCell(x) {
    const cells = [];
    let wideNullCellOffset = 0;
    const emojiOffset = 0;
    for (let i = 0; i <= x - wideNullCellOffset + emojiOffset; i++) {
      let char = this._text.charAt(i);
      if (char === "\uD83D") {
        char += "\uDE42";
      }
      cells.push(char);
      if (this._text.charAt(i) === TEST_WIDE_CHAR || char.charCodeAt(0) > 255) {
        cells.push(TEST_NULL_CHAR);
        wideNullCellOffset++;
      }
    }
    return {
      getChars: /* @__PURE__ */ __name(() => {
        return x >= cells.length ? "" : cells[x];
      }, "getChars"),
      getWidth: /* @__PURE__ */ __name(() => {
        switch (cells[x]) {
          case TEST_WIDE_CHAR:
            return 2;
          case TEST_NULL_CHAR:
            return 0;
          default: {
            if (cells[x].charCodeAt(0) > 255) {
              return 2;
            }
            return 1;
          }
        }
      }, "getWidth")
    };
  }
  translateToString() {
    throw new Error("Method not implemented.");
  }
}
//# sourceMappingURL=terminalLinkHelpers.test.js.map
