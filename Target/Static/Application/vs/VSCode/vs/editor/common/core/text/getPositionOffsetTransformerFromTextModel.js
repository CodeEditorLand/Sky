var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PositionOffsetTransformerBase } from "./positionToOffset.js";
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
  getPositionOffsetTransformerFromTextModel
};
//# sourceMappingURL=getPositionOffsetTransformerFromTextModel.js.map
