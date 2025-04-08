var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { compareBy, numberComparator } from "../../../../base/common/arrays.js";
class ArrayEdit {
  static {
    __name(this, "ArrayEdit");
  }
  edits;
  constructor(edits) {
    this.edits = edits.slice().sort(compareBy((c) => c.offset, numberComparator));
  }
  applyToArray(array) {
    for (let i = this.edits.length - 1; i >= 0; i--) {
      const c = this.edits[i];
      array.splice(c.offset, c.length, ...new Array(c.newLength));
    }
  }
}
class SingleArrayEdit {
  constructor(offset, length, newLength) {
    this.offset = offset;
    this.length = length;
    this.newLength = newLength;
  }
  static {
    __name(this, "SingleArrayEdit");
  }
  toString() {
    return `[${this.offset}, +${this.length}) -> +${this.newLength}}`;
  }
}
class MonotonousIndexTransformer {
  constructor(transformation) {
    this.transformation = transformation;
  }
  static {
    __name(this, "MonotonousIndexTransformer");
  }
  static fromMany(transformations) {
    const transformers = transformations.map((t) => new MonotonousIndexTransformer(t));
    return new CombinedIndexTransformer(transformers);
  }
  idx = 0;
  offset = 0;
  /**
   * Precondition: index >= previous-value-of(index).
   */
  transform(index) {
    let nextChange = this.transformation.edits[this.idx];
    while (nextChange && nextChange.offset + nextChange.length <= index) {
      this.offset += nextChange.newLength - nextChange.length;
      this.idx++;
      nextChange = this.transformation.edits[this.idx];
    }
    if (nextChange && nextChange.offset <= index) {
      return void 0;
    }
    return index + this.offset;
  }
}
class CombinedIndexTransformer {
  constructor(transformers) {
    this.transformers = transformers;
  }
  static {
    __name(this, "CombinedIndexTransformer");
  }
  transform(index) {
    for (const transformer of this.transformers) {
      const result = transformer.transform(index);
      if (result === void 0) {
        return void 0;
      }
      index = result;
    }
    return index;
  }
}
export {
  ArrayEdit,
  CombinedIndexTransformer,
  MonotonousIndexTransformer,
  SingleArrayEdit
};
//# sourceMappingURL=arrayOperation.js.map
