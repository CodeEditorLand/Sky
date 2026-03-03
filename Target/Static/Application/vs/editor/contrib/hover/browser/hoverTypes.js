var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var HoverAnchorType;
(function(HoverAnchorType2) {
  HoverAnchorType2[HoverAnchorType2["Range"] = 1] = "Range";
  HoverAnchorType2[HoverAnchorType2["ForeignElement"] = 2] = "ForeignElement";
})(HoverAnchorType || (HoverAnchorType = {}));
class HoverRangeAnchor {
  static {
    __name(this, "HoverRangeAnchor");
  }
  constructor(priority, range, initialMousePosX, initialMousePosY) {
    this.priority = priority;
    this.range = range;
    this.initialMousePosX = initialMousePosX;
    this.initialMousePosY = initialMousePosY;
    this.type = 1;
  }
  equals(other) {
    return other.type === 1 && this.range.equalsRange(other.range);
  }
  canAdoptVisibleHover(lastAnchor, showAtPosition) {
    return lastAnchor.type === 1 && showAtPosition.lineNumber === this.range.startLineNumber;
  }
}
class HoverForeignElementAnchor {
  static {
    __name(this, "HoverForeignElementAnchor");
  }
  constructor(priority, owner, range, initialMousePosX, initialMousePosY, supportsMarkerHover) {
    this.priority = priority;
    this.owner = owner;
    this.range = range;
    this.initialMousePosX = initialMousePosX;
    this.initialMousePosY = initialMousePosY;
    this.supportsMarkerHover = supportsMarkerHover;
    this.type = 2;
  }
  equals(other) {
    return other.type === 2 && this.owner === other.owner;
  }
  canAdoptVisibleHover(lastAnchor, showAtPosition) {
    return lastAnchor.type === 2 && this.owner === lastAnchor.owner;
  }
}
class RenderedHoverParts {
  static {
    __name(this, "RenderedHoverParts");
  }
  constructor(renderedHoverParts, disposables) {
    this.renderedHoverParts = renderedHoverParts;
    this.disposables = disposables;
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
  constructor() {
    this._participants = [];
  }
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
