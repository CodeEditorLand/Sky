var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class DiffChange {
  static {
    __name(this, "DiffChange");
  }
  /**
   * The position of the first element in the original sequence which
   * this change affects.
   */
  originalStart;
  /**
   * The number of elements from the original sequence which were
   * affected.
   */
  originalLength;
  /**
   * The position of the first element in the modified sequence which
   * this change affects.
   */
  modifiedStart;
  /**
   * The number of elements from the modified sequence which were
   * affected (added).
   */
  modifiedLength;
  /**
   * Constructs a new DiffChange with the given sequence information
   * and content.
   */
  constructor(originalStart, originalLength, modifiedStart, modifiedLength) {
    this.originalStart = originalStart;
    this.originalLength = originalLength;
    this.modifiedStart = modifiedStart;
    this.modifiedLength = modifiedLength;
  }
  /**
   * The end point (exclusive) of the change in the original sequence.
   */
  getOriginalEnd() {
    return this.originalStart + this.originalLength;
  }
  /**
   * The end point (exclusive) of the change in the modified sequence.
   */
  getModifiedEnd() {
    return this.modifiedStart + this.modifiedLength;
  }
}
export {
  DiffChange
};
//# sourceMappingURL=diffChange.js.map
