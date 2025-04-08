var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { safeIntl } from "../../../base/common/date.js";
function createContentSegmenter(lineData, options) {
  if (lineData.isBasicASCII && options.useMonospaceOptimizations) {
    return new AsciiContentSegmenter(lineData);
  }
  return new GraphemeContentSegmenter(lineData);
}
__name(createContentSegmenter, "createContentSegmenter");
class AsciiContentSegmenter {
  static {
    __name(this, "AsciiContentSegmenter");
  }
  _content;
  constructor(lineData) {
    this._content = lineData.content;
  }
  getSegmentAtIndex(index) {
    return this._content[index];
  }
  getSegmentData(index) {
    return void 0;
  }
}
class GraphemeContentSegmenter {
  static {
    __name(this, "GraphemeContentSegmenter");
  }
  _segments = [];
  constructor(lineData) {
    const content = lineData.content;
    const segmenter = safeIntl.Segmenter(void 0, { granularity: "grapheme" });
    const segmentedContent = Array.from(segmenter.segment(content));
    let segmenterIndex = 0;
    for (let x = 0; x < content.length; x++) {
      const segment = segmentedContent[segmenterIndex];
      if (!segment) {
        break;
      }
      if (segment.index !== x) {
        this._segments.push(void 0);
        continue;
      }
      segmenterIndex++;
      this._segments.push(segment);
    }
  }
  getSegmentAtIndex(index) {
    return this._segments[index]?.segment;
  }
  getSegmentData(index) {
    return this._segments[index];
  }
}
export {
  createContentSegmenter
};
//# sourceMappingURL=contentSegmenter.js.map
