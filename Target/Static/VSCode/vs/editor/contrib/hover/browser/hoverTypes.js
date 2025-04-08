var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Dimension } from "../../../../base/browser/dom.js";
import { AsyncIterableObject } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor, IEditorMouseEvent } from "../../../browser/editorBrowser.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { IModelDecoration } from "../../../common/model.js";
import { BrandedService, IConstructorSignature } from "../../../../platform/instantiation/common/instantiation.js";
import { HoverStartSource } from "./hoverOperation.js";
import { ScrollEvent } from "../../../../base/common/scrollable.js";
var HoverAnchorType = /* @__PURE__ */ ((HoverAnchorType2) => {
  HoverAnchorType2[HoverAnchorType2["Range"] = 1] = "Range";
  HoverAnchorType2[HoverAnchorType2["ForeignElement"] = 2] = "ForeignElement";
  return HoverAnchorType2;
})(HoverAnchorType || {});
class HoverRangeAnchor {
  constructor(priority, range, initialMousePosX, initialMousePosY) {
    this.priority = priority;
    this.range = range;
    this.initialMousePosX = initialMousePosX;
    this.initialMousePosY = initialMousePosY;
  }
  static {
    __name(this, "HoverRangeAnchor");
  }
  type = 1 /* Range */;
  equals(other) {
    return other.type === 1 /* Range */ && this.range.equalsRange(other.range);
  }
  canAdoptVisibleHover(lastAnchor, showAtPosition) {
    return lastAnchor.type === 1 /* Range */ && showAtPosition.lineNumber === this.range.startLineNumber;
  }
}
class HoverForeignElementAnchor {
  constructor(priority, owner, range, initialMousePosX, initialMousePosY, supportsMarkerHover) {
    this.priority = priority;
    this.owner = owner;
    this.range = range;
    this.initialMousePosX = initialMousePosX;
    this.initialMousePosY = initialMousePosY;
    this.supportsMarkerHover = supportsMarkerHover;
  }
  static {
    __name(this, "HoverForeignElementAnchor");
  }
  type = 2 /* ForeignElement */;
  equals(other) {
    return other.type === 2 /* ForeignElement */ && this.owner === other.owner;
  }
  canAdoptVisibleHover(lastAnchor, showAtPosition) {
    return lastAnchor.type === 2 /* ForeignElement */ && this.owner === lastAnchor.owner;
  }
}
class RenderedHoverParts {
  constructor(renderedHoverParts, disposables) {
    this.renderedHoverParts = renderedHoverParts;
    this.disposables = disposables;
  }
  static {
    __name(this, "RenderedHoverParts");
  }
  dispose() {
    for (const part of this.renderedHoverParts) {
      part.dispose();
    }
    this.disposables?.dispose();
  }
}
const HoverParticipantRegistry = new class HoverParticipantRegistry2 {
  static {
    __name(this, "HoverParticipantRegistry");
  }
  _participants = [];
  register(ctor) {
    this._participants.push(ctor);
  }
  getAll() {
    return this._participants;
  }
}();
export {
  HoverAnchorType,
  HoverForeignElementAnchor,
  HoverParticipantRegistry,
  HoverRangeAnchor,
  RenderedHoverParts
};
//# sourceMappingURL=hoverTypes.js.map
