var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../core/range.js";
import { GlyphMarginLane, IGlyphMarginLanesModel } from "../model.js";
const MAX_LANE = GlyphMarginLane.Right;
class GlyphMarginLanesModel {
  static {
    __name(this, "GlyphMarginLanesModel");
  }
  lanes;
  persist = 0;
  _requiredLanes = 1;
  // always render at least one lane
  constructor(maxLine) {
    this.lanes = new Uint8Array(Math.ceil((maxLine + 1) * MAX_LANE / 8));
  }
  reset(maxLine) {
    const bytes = Math.ceil((maxLine + 1) * MAX_LANE / 8);
    if (this.lanes.length < bytes) {
      this.lanes = new Uint8Array(bytes);
    } else {
      this.lanes.fill(0);
    }
    this._requiredLanes = 1;
  }
  get requiredLanes() {
    return this._requiredLanes;
  }
  push(lane, range, persist) {
    if (persist) {
      this.persist |= 1 << lane - 1;
    }
    for (let i = range.startLineNumber; i <= range.endLineNumber; i++) {
      const bit = MAX_LANE * i + (lane - 1);
      this.lanes[bit >>> 3] |= 1 << bit % 8;
      this._requiredLanes = Math.max(this._requiredLanes, this.countAtLine(i));
    }
  }
  getLanesAtLine(lineNumber) {
    const lanes = [];
    let bit = MAX_LANE * lineNumber;
    for (let i = 0; i < MAX_LANE; i++) {
      if (this.persist & 1 << i || this.lanes[bit >>> 3] & 1 << bit % 8) {
        lanes.push(i + 1);
      }
      bit++;
    }
    return lanes.length ? lanes : [GlyphMarginLane.Center];
  }
  countAtLine(lineNumber) {
    let bit = MAX_LANE * lineNumber;
    let count = 0;
    for (let i = 0; i < MAX_LANE; i++) {
      if (this.persist & 1 << i || this.lanes[bit >>> 3] & 1 << bit % 8) {
        count++;
      }
      bit++;
    }
    return count;
  }
}
export {
  GlyphMarginLanesModel
};
//# sourceMappingURL=glyphLanesModel.js.map
