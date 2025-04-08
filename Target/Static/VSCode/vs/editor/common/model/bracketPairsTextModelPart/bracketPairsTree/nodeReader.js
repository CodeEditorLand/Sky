var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AstNode } from "./ast.js";
import { lengthAdd, lengthZero, Length, lengthLessThan } from "./length.js";
class NodeReader {
  static {
    __name(this, "NodeReader");
  }
  nextNodes;
  offsets;
  idxs;
  lastOffset = lengthZero;
  constructor(node) {
    this.nextNodes = [node];
    this.offsets = [lengthZero];
    this.idxs = [];
  }
  /**
   * Returns the longest node at `offset` that satisfies the predicate.
   * @param offset must be greater than or equal to the last offset this method has been called with!
  */
  readLongestNodeAt(offset, predicate) {
    if (lengthLessThan(offset, this.lastOffset)) {
      throw new Error("Invalid offset");
    }
    this.lastOffset = offset;
    while (true) {
      const curNode = lastOrUndefined(this.nextNodes);
      if (!curNode) {
        return void 0;
      }
      const curNodeOffset = lastOrUndefined(this.offsets);
      if (lengthLessThan(offset, curNodeOffset)) {
        return void 0;
      }
      if (lengthLessThan(curNodeOffset, offset)) {
        if (lengthAdd(curNodeOffset, curNode.length) <= offset) {
          this.nextNodeAfterCurrent();
        } else {
          const nextChildIdx = getNextChildIdx(curNode);
          if (nextChildIdx !== -1) {
            this.nextNodes.push(curNode.getChild(nextChildIdx));
            this.offsets.push(curNodeOffset);
            this.idxs.push(nextChildIdx);
          } else {
            this.nextNodeAfterCurrent();
          }
        }
      } else {
        if (predicate(curNode)) {
          this.nextNodeAfterCurrent();
          return curNode;
        } else {
          const nextChildIdx = getNextChildIdx(curNode);
          if (nextChildIdx === -1) {
            this.nextNodeAfterCurrent();
            return void 0;
          } else {
            this.nextNodes.push(curNode.getChild(nextChildIdx));
            this.offsets.push(curNodeOffset);
            this.idxs.push(nextChildIdx);
          }
        }
      }
    }
  }
  // Navigates to the longest node that continues after the current node.
  nextNodeAfterCurrent() {
    while (true) {
      const currentOffset = lastOrUndefined(this.offsets);
      const currentNode = lastOrUndefined(this.nextNodes);
      this.nextNodes.pop();
      this.offsets.pop();
      if (this.idxs.length === 0) {
        break;
      }
      const parent = lastOrUndefined(this.nextNodes);
      const nextChildIdx = getNextChildIdx(parent, this.idxs[this.idxs.length - 1]);
      if (nextChildIdx !== -1) {
        this.nextNodes.push(parent.getChild(nextChildIdx));
        this.offsets.push(lengthAdd(currentOffset, currentNode.length));
        this.idxs[this.idxs.length - 1] = nextChildIdx;
        break;
      } else {
        this.idxs.pop();
      }
    }
  }
}
function getNextChildIdx(node, curIdx = -1) {
  while (true) {
    curIdx++;
    if (curIdx >= node.childrenLength) {
      return -1;
    }
    if (node.getChild(curIdx)) {
      return curIdx;
    }
  }
}
__name(getNextChildIdx, "getNextChildIdx");
function lastOrUndefined(arr) {
  return arr.length > 0 ? arr[arr.length - 1] : void 0;
}
__name(lastOrUndefined, "lastOrUndefined");
export {
  NodeReader
};
//# sourceMappingURL=nodeReader.js.map
