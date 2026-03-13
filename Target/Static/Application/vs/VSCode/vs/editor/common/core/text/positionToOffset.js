var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
function ensureDependenciesAreSet() {
}
__name(ensureDependenciesAreSet, "ensureDependenciesAreSet");
export {
  PositionOffsetTransformer,
  PositionOffsetTransformerBase,
  ensureDependenciesAreSet
};
//# sourceMappingURL=positionToOffset.js.map
