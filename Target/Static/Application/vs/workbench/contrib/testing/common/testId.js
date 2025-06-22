var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var TestIdPathParts;
(function(TestIdPathParts2) {
  TestIdPathParts2["Delimiter"] = "\0";
})(TestIdPathParts || (TestIdPathParts = {}));
var TestPosition;
(function(TestPosition2) {
  TestPosition2[TestPosition2["IsSame"] = 0] = "IsSame";
  TestPosition2[TestPosition2["Disconnected"] = 1] = "Disconnected";
  TestPosition2[TestPosition2["IsChild"] = 2] = "IsChild";
  TestPosition2[TestPosition2["IsParent"] = 3] = "IsParent";
})(TestPosition || (TestPosition = {}));
class TestId {
  static {
    __name(this, "TestId");
  }
  /**
   * Creates a test ID from an ext host test item.
   */
  static fromExtHostTestItem(item, rootId, parent = item.parent) {
    if (item._isRoot) {
      return new TestId([rootId]);
    }
    const path = [item.id];
    for (let i = parent; i && i.id !== rootId; i = i.parent) {
      path.push(i.id);
    }
    path.push(rootId);
    return new TestId(path.reverse());
  }
  /**
   * Cheaply ets whether the ID refers to the root .
   */
  static isRoot(idString) {
    return !idString.includes(
      "\0"
      /* TestIdPathParts.Delimiter */
    );
  }
  /**
   * Cheaply gets whether the ID refers to the root .
   */
  static root(idString) {
    const idx = idString.indexOf(
      "\0"
      /* TestIdPathParts.Delimiter */
    );
    return idx === -1 ? idString : idString.slice(0, idx);
  }
  /**
   * Creates a test ID from a serialized TestId instance.
   */
  static fromString(idString) {
    return new TestId(idString.split(
      "\0"
      /* TestIdPathParts.Delimiter */
    ));
  }
  /**
   * Gets the ID resulting from adding b to the base ID.
   */
  static join(base, b) {
    return new TestId([...base.path, b]);
  }
  /**
   * Splits a test ID into its parts.
   */
  static split(idString) {
    return idString.split(
      "\0"
      /* TestIdPathParts.Delimiter */
    );
  }
  /**
   * Gets the string ID resulting from adding b to the base ID.
   */
  static joinToString(base, b) {
    return base.toString() + "\0" + b;
  }
  /**
   * Cheaply gets the parent ID of a test identified with the string.
   */
  static parentId(idString) {
    const idx = idString.lastIndexOf(
      "\0"
      /* TestIdPathParts.Delimiter */
    );
    return idx === -1 ? void 0 : idString.slice(0, idx);
  }
  /**
   * Cheaply gets the local ID of a test identified with the string.
   */
  static localId(idString) {
    const idx = idString.lastIndexOf(
      "\0"
      /* TestIdPathParts.Delimiter */
    );
    return idx === -1 ? idString : idString.slice(idx + "\0".length);
  }
  /**
   * Gets whether maybeChild is a child of maybeParent.
   * todo@connor4312: review usages of this to see if using the WellDefinedPrefixTree is better
   */
  static isChild(maybeParent, maybeChild) {
    return maybeChild[maybeParent.length] === "\0" && maybeChild.startsWith(maybeParent);
  }
  /**
   * Compares the position of the two ID strings.
   * todo@connor4312: review usages of this to see if using the WellDefinedPrefixTree is better
   */
  static compare(a, b) {
    if (a === b) {
      return 0;
    }
    if (TestId.isChild(a, b)) {
      return 2;
    }
    if (TestId.isChild(b, a)) {
      return 3;
    }
    return 1;
  }
  static getLengthOfCommonPrefix(length, getId) {
    if (length === 0) {
      return 0;
    }
    let commonPrefix = 0;
    while (commonPrefix < length - 1) {
      for (let i = 1; i < length; i++) {
        const a = getId(i - 1);
        const b = getId(i);
        if (a.path[commonPrefix] !== b.path[commonPrefix]) {
          return commonPrefix;
        }
      }
      commonPrefix++;
    }
    return commonPrefix;
  }
  constructor(path, viewEnd = path.length) {
    this.path = path;
    this.viewEnd = viewEnd;
    if (path.length === 0 || viewEnd < 1) {
      throw new Error("cannot create test with empty path");
    }
  }
  /**
   * Gets the ID of the parent test.
   */
  get rootId() {
    return new TestId(this.path, 1);
  }
  /**
   * Gets the ID of the parent test.
   */
  get parentId() {
    return this.viewEnd > 1 ? new TestId(this.path, this.viewEnd - 1) : void 0;
  }
  /**
   * Gets the local ID of the current full test ID.
   */
  get localId() {
    return this.path[this.viewEnd - 1];
  }
  /**
   * Gets whether this ID refers to the root.
   */
  get controllerId() {
    return this.path[0];
  }
  /**
   * Gets whether this ID refers to the root.
   */
  get isRoot() {
    return this.viewEnd === 1;
  }
  /**
   * Returns an iterable that yields IDs of all parent items down to and
   * including the current item.
   */
  *idsFromRoot() {
    for (let i = 1; i <= this.viewEnd; i++) {
      yield new TestId(this.path, i);
    }
  }
  /**
   * Returns an iterable that yields IDs of the current item up to the root
   * item.
   */
  *idsToRoot() {
    for (let i = this.viewEnd; i > 0; i--) {
      yield new TestId(this.path, i);
    }
  }
  /**
   * Compares the other test ID with this one.
   */
  compare(other) {
    if (typeof other === "string") {
      return TestId.compare(this.toString(), other);
    }
    for (let i = 0; i < other.viewEnd && i < this.viewEnd; i++) {
      if (other.path[i] !== this.path[i]) {
        return 1;
      }
    }
    if (other.viewEnd > this.viewEnd) {
      return 2;
    }
    if (other.viewEnd < this.viewEnd) {
      return 3;
    }
    return 0;
  }
  /**
   * Serializes the ID.
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Serializes the ID to a string.
   */
  toString() {
    if (!this.stringifed) {
      this.stringifed = this.path[0];
      for (let i = 1; i < this.viewEnd; i++) {
        this.stringifed += "\0";
        this.stringifed += this.path[i];
      }
    }
    return this.stringifed;
  }
}
export {
  TestId,
  TestIdPathParts,
  TestPosition
};
//# sourceMappingURL=testId.js.map
