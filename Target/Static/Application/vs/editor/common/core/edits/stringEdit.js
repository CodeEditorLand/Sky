var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { commonPrefixLength, commonSuffixLength } from "../../../../base/common/strings.js";
import { OffsetRange } from "../ranges/offsetRange.js";
import { BaseEdit, BaseReplacement } from "./edit.js";
class StringEdit extends BaseEdit {
  static {
    __name(this, "StringEdit");
  }
  static {
    this.empty = new StringEdit([]);
  }
  static create(replacements) {
    return new StringEdit(replacements);
  }
  static single(replacement) {
    return new StringEdit([replacement]);
  }
  static replace(range, replacement) {
    return new StringEdit([new StringReplacement(range, replacement)]);
  }
  static insert(offset, replacement) {
    return new StringEdit([new StringReplacement(OffsetRange.emptyAt(offset), replacement)]);
  }
  static delete(range) {
    return new StringEdit([new StringReplacement(range, "")]);
  }
  static fromJson(data) {
    return new StringEdit(data.map(StringReplacement.fromJson));
  }
  static compose(edits) {
    if (edits.length === 0) {
      return StringEdit.empty;
    }
    let result = edits[0];
    for (let i = 1; i < edits.length; i++) {
      result = result.compose(edits[i]);
    }
    return result;
  }
  constructor(replacements) {
    super(replacements);
  }
  _createNew(replacements) {
    return new StringEdit(replacements);
  }
  apply(base) {
    const resultText = [];
    let pos = 0;
    for (const edit of this.replacements) {
      resultText.push(base.substring(pos, edit.replaceRange.start));
      resultText.push(edit.newText);
      pos = edit.replaceRange.endExclusive;
    }
    resultText.push(base.substring(pos));
    return resultText.join("");
  }
  /**
   * Creates an edit that reverts this edit.
   */
  inverse(baseStr) {
    const edits = [];
    let offset = 0;
    for (const e of this.replacements) {
      edits.push(new StringReplacement(OffsetRange.ofStartAndLength(e.replaceRange.start + offset, e.newText.length), baseStr.substring(e.replaceRange.start, e.replaceRange.endExclusive)));
      offset += e.newText.length - e.replaceRange.length;
    }
    return new StringEdit(edits);
  }
  tryRebase(base, noOverlap) {
    const newEdits = [];
    let baseIdx = 0;
    let ourIdx = 0;
    let offset = 0;
    while (ourIdx < this.replacements.length || baseIdx < base.replacements.length) {
      const baseEdit = base.replacements[baseIdx];
      const ourEdit = this.replacements[ourIdx];
      if (!ourEdit) {
        break;
      } else if (!baseEdit) {
        newEdits.push(new StringReplacement(ourEdit.replaceRange.delta(offset), ourEdit.newText));
        ourIdx++;
      } else if (ourEdit.replaceRange.intersectsOrTouches(baseEdit.replaceRange)) {
        ourIdx++;
        if (noOverlap) {
          return void 0;
        }
      } else if (ourEdit.replaceRange.start < baseEdit.replaceRange.start) {
        newEdits.push(new StringReplacement(ourEdit.replaceRange.delta(offset), ourEdit.newText));
        ourIdx++;
      } else {
        baseIdx++;
        offset += baseEdit.newText.length - baseEdit.replaceRange.length;
      }
    }
    return new StringEdit(newEdits);
  }
  toJson() {
    return this.replacements.map((e) => ({
      txt: e.newText,
      pos: e.replaceRange.start,
      len: e.replaceRange.length
    }));
  }
  isNeutralOn(text) {
    return this.replacements.every((e) => e.isNeutralOn(text));
  }
  removeCommonSuffixPrefix(originalText) {
    const edits = [];
    for (const e of this.replacements) {
      const edit = e.removeCommonSuffixPrefix(originalText);
      if (!edit.isEmpty) {
        edits.push(edit);
      }
    }
    return new StringEdit(edits);
  }
  normalizeEOL(eol) {
    return new StringEdit(this.replacements.map((edit) => edit.normalizeEOL(eol)));
  }
}
class StringReplacement extends BaseReplacement {
  static {
    __name(this, "StringReplacement");
  }
  static insert(offset, text) {
    return new StringReplacement(OffsetRange.emptyAt(offset), text);
  }
  static replace(range, text) {
    return new StringReplacement(range, text);
  }
  static delete(range) {
    return new StringReplacement(range, "");
  }
  static fromJson(data) {
    return new StringReplacement(OffsetRange.ofStartAndLength(data.pos, data.len), data.txt);
  }
  constructor(range, newText) {
    super(range);
    this.newText = newText;
  }
  equals(other) {
    return this.replaceRange.equals(other.replaceRange) && this.newText === other.newText;
  }
  getNewLength() {
    return this.newText.length;
  }
  tryJoinTouching(other) {
    return new StringReplacement(this.replaceRange.joinRightTouching(other.replaceRange), this.newText + other.newText);
  }
  slice(range, rangeInReplacement) {
    return new StringReplacement(range, rangeInReplacement.substring(this.newText));
  }
  toString() {
    return `${this.replaceRange} -> "${this.newText}"`;
  }
  replace(str) {
    return str.substring(0, this.replaceRange.start) + this.newText + str.substring(this.replaceRange.endExclusive);
  }
  /**
   * Checks if the edit would produce no changes when applied to the given text.
   */
  isNeutralOn(text) {
    return this.newText === text.substring(this.replaceRange.start, this.replaceRange.endExclusive);
  }
  removeCommonSuffixPrefix(originalText) {
    const oldText = originalText.substring(this.replaceRange.start, this.replaceRange.endExclusive);
    const prefixLen = commonPrefixLength(oldText, this.newText);
    const suffixLen = Math.min(oldText.length - prefixLen, this.newText.length - prefixLen, commonSuffixLength(oldText, this.newText));
    const replaceRange = new OffsetRange(this.replaceRange.start + prefixLen, this.replaceRange.endExclusive - suffixLen);
    const newText = this.newText.substring(prefixLen, this.newText.length - suffixLen);
    return new StringReplacement(replaceRange, newText);
  }
  normalizeEOL(eol) {
    const newText = this.newText.replace(/\r\n|\n/g, eol);
    return new StringReplacement(this.replaceRange, newText);
  }
}
function applyEditsToRanges(sortedRanges, edit) {
  sortedRanges = sortedRanges.slice();
  const result = [];
  let offset = 0;
  for (const e of edit.replacements) {
    while (true) {
      const r = sortedRanges[0];
      if (!r || r.endExclusive >= e.replaceRange.start) {
        break;
      }
      sortedRanges.shift();
      result.push(r.delta(offset));
    }
    const intersecting = [];
    while (true) {
      const r = sortedRanges[0];
      if (!r || !r.intersectsOrTouches(e.replaceRange)) {
        break;
      }
      sortedRanges.shift();
      intersecting.push(r);
    }
    for (let i = intersecting.length - 1; i >= 0; i--) {
      let r = intersecting[i];
      const overlap = r.intersect(e.replaceRange).length;
      r = r.deltaEnd(-overlap + (i === 0 ? e.newText.length : 0));
      const rangeAheadOfReplaceRange = r.start - e.replaceRange.start;
      if (rangeAheadOfReplaceRange > 0) {
        r = r.delta(-rangeAheadOfReplaceRange);
      }
      if (i !== 0) {
        r = r.delta(e.newText.length);
      }
      r = r.delta(-(e.newText.length - e.replaceRange.length));
      sortedRanges.unshift(r);
    }
    offset += e.newText.length - e.replaceRange.length;
  }
  while (true) {
    const r = sortedRanges[0];
    if (!r) {
      break;
    }
    sortedRanges.shift();
    result.push(r.delta(offset));
  }
  return result;
}
__name(applyEditsToRanges, "applyEditsToRanges");
export {
  StringEdit,
  StringReplacement,
  applyEditsToRanges
};
//# sourceMappingURL=stringEdit.js.map
