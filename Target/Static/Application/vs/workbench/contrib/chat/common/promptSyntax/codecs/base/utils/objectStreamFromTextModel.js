var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ObjectStream } from "./objectStream.js";
import { VSBuffer } from "../../../../../../../../base/common/buffer.js";
function objectStreamFromTextModel(model, cancellationToken) {
  return new ObjectStream(modelToGenerator(model), cancellationToken);
}
__name(objectStreamFromTextModel, "objectStreamFromTextModel");
function modelToGenerator(model) {
  return function* () {
    const totalLines = model.getLineCount();
    let currentLine = 1;
    while (currentLine <= totalLines) {
      if (model.isDisposed()) {
        return void 0;
      }
      yield VSBuffer.fromString(model.getLineContent(currentLine));
      if (currentLine !== totalLines) {
        yield VSBuffer.fromString(model.getEOL());
      }
      currentLine++;
    }
  }();
}
__name(modelToGenerator, "modelToGenerator");
export {
  objectStreamFromTextModel
};
//# sourceMappingURL=objectStreamFromTextModel.js.map
