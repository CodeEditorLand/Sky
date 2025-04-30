var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { findLastIdxMonotonous } from "../../../base/common/arraysFind.js";
import { OffsetEdit, SingleOffsetEdit } from "./offsetEdit.js";
import { OffsetRange } from "./offsetRange.js";
import { Position } from "./position.js";
import { Range } from "./range.js";
import { SingleTextEdit, TextEdit } from "./textEdit.js";
import { TextLength } from "./textLength.js";
class PositionOffsetTransformerBase {
  static {
    __name(this, "PositionOffsetTransformerBase");
  }
  getOffsetRange(range) {
    return new OffsetRange(this.getOffset(range.getStartPosition()), this.getOffset(range.getEndPosition()));
  }
  getRange(offsetRange) {
    return Range.fromPositions(this.getPosition(offsetRange.start), this.getPosition(offsetRange.endExclusive));
  }
  getOffsetEdit(edit) {
    const edits = edit.edits.map((e) => this.getSingleOffsetEdit(e));
    return new OffsetEdit(edits);
  }
  getSingleOffsetEdit(edit) {
    return new SingleOffsetEdit(this.getOffsetRange(edit.range), edit.text);
  }
  getSingleTextEdit(edit) {
    return new SingleTextEdit(this.getRange(edit.replaceRange), edit.newText);
  }
  getTextEdit(edit) {
    const edits = edit.edits.map((e) => this.getSingleTextEdit(e));
    return new TextEdit(edits);
  }
}
class PositionOffsetTransformer extends PositionOffsetTransformerBase {
  static {
    __name(this, "PositionOffsetTransformer");
  }
  constructor(text) {
    super();
    this.text = text;
    this.lineStartOffsetByLineIdx = [];
    this.lineEndOffsetByLineIdx = [];
    this.lineStartOffsetByLineIdx.push(0);
    for (let i = 0; i < text.length; i++) {
      if (text.charAt(i) === "\n") {
        this.lineStartOffsetByLineIdx.push(i + 1);
        if (i > 0 && text.charAt(i - 1) === "\r") {
          this.lineEndOffsetByLineIdx.push(i - 1);
        } else {
          this.lineEndOffsetByLineIdx.push(i);
        }
      }
    }
    this.lineEndOffsetByLineIdx.push(text.length);
  }
  getOffset(position) {
    const valPos = this._validatePosition(position);
    return this.lineStartOffsetByLineIdx[valPos.lineNumber - 1] + valPos.column - 1;
  }
  _validatePosition(position) {
    if (position.lineNumber < 1) {
      return new Position(1, 1);
    }
    const lineCount = this.textLength.lineCount + 1;
    if (position.lineNumber > lineCount) {
      const lineLength2 = this.getLineLength(lineCount);
      return new Position(lineCount, lineLength2 + 1);
    }
    if (position.column < 1) {
      return new Position(position.lineNumber, 1);
    }
    const lineLength = this.getLineLength(position.lineNumber);
    if (position.column - 1 > lineLength) {
      return new Position(position.lineNumber, lineLength + 1);
    }
    return position;
  }
  getPosition(offset) {
    const idx = findLastIdxMonotonous(this.lineStartOffsetByLineIdx, (i) => i <= offset);
    const lineNumber = idx + 1;
    const column = offset - this.lineStartOffsetByLineIdx[idx] + 1;
    return new Position(lineNumber, column);
  }
  getTextLength(offsetRange) {
    return TextLength.ofRange(this.getRange(offsetRange));
  }
  get textLength() {
    const lineIdx = this.lineStartOffsetByLineIdx.length - 1;
    return new TextLength(lineIdx, this.text.length - this.lineStartOffsetByLineIdx[lineIdx]);
  }
  getLineLength(lineNumber) {
    return this.lineEndOffsetByLineIdx[lineNumber - 1] - this.lineStartOffsetByLineIdx[lineNumber - 1];
  }
}
function getPositionOffsetTransformerFromTextModel(textModel) {
  return new PositionOffsetTransformerWithTextModel(textModel);
}
__name(getPositionOffsetTransformerFromTextModel, "getPositionOffsetTransformerFromTextModel");
class PositionOffsetTransformerWithTextModel extends PositionOffsetTransformerBase {
  static {
    __name(this, "PositionOffsetTransformerWithTextModel");
  }
  constructor(_textModel) {
    super();
    this._textModel = _textModel;
  }
  getOffset(position) {
    return this._textModel.getOffsetAt(position);
  }
  getPosition(offset) {
    return this._textModel.getPositionAt(offset);
  }
}
export {
  PositionOffsetTransformer,
  PositionOffsetTransformerBase,
  getPositionOffsetTransformerFromTextModel
};
//# sourceMappingURL=positionToOffset.js.map
