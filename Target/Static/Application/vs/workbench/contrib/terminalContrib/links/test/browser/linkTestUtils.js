var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepStrictEqual } from "assert";
async function assertLinkHelper(text, expected, detector, expectedType) {
  detector.xterm.reset();
  await new Promise((r) => detector.xterm.write(text, r));
  const textSplit = text.split("\r\n");
  const lastLineIndex = textSplit.filter((e, i) => i !== textSplit.length - 1).reduce((p, c) => {
    return p + Math.max(Math.ceil(c.length / 80), 1);
  }, 0);
  const lines = [];
  for (let i = 0; i < detector.xterm.buffer.active.cursorY + 1; i++) {
    lines.push(detector.xterm.buffer.active.getLine(i));
  }
  const actualLinks = (await detector.detect(lines, lastLineIndex, detector.xterm.buffer.active.cursorY)).map((e) => {
    return {
      link: e.uri?.toString() ?? e.text,
      type: expectedType,
      bufferRange: e.bufferRange
    };
  });
  const expectedLinks = expected.map((e) => {
    return {
      type: expectedType,
      link: "uri" in e ? e.uri.toString() : e.text,
      bufferRange: {
        start: { x: e.range[0][0], y: e.range[0][1] },
        end: { x: e.range[1][0], y: e.range[1][1] }
      }
    };
  });
  deepStrictEqual(actualLinks, expectedLinks);
}
__name(assertLinkHelper, "assertLinkHelper");
export {
  assertLinkHelper
};
//# sourceMappingURL=linkTestUtils.js.map
