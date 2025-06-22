import { StringEdit, StringReplacement } from "../edits/stringEdit.js";
import { TextEdit, TextReplacement } from "../edits/textEdit.js";
import { _setPositionOffsetTransformerDependencies } from "./positionToOffsetImpl.js";
import { TextLength } from "./textLength.js";
import { PositionOffsetTransformerBase, PositionOffsetTransformer } from "./positionToOffsetImpl.js";
_setPositionOffsetTransformerDependencies({
  StringEdit,
  StringReplacement,
  TextReplacement,
  TextEdit,
  TextLength
});
export {
  PositionOffsetTransformer,
  PositionOffsetTransformerBase
};
//# sourceMappingURL=positionToOffset.js.map
