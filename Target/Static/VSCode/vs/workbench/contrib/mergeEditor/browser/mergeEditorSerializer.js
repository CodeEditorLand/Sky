var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { parse } from "../../../../base/common/marshalling.js";
import { URI } from "../../../../base/common/uri.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IEditorSerializer } from "../../../common/editor.js";
import { MergeEditorInput, MergeEditorInputData } from "./mergeEditorInput.js";
class MergeEditorSerializer {
  static {
    __name(this, "MergeEditorSerializer");
  }
  canSerialize() {
    return true;
  }
  serialize(editor) {
    return JSON.stringify(this.toJSON(editor));
  }
  toJSON(editor) {
    return {
      base: editor.base,
      input1: editor.input1,
      input2: editor.input2,
      result: editor.result
    };
  }
  deserialize(instantiationService, raw) {
    try {
      const data = parse(raw);
      return instantiationService.createInstance(
        MergeEditorInput,
        data.base,
        new MergeEditorInputData(data.input1.uri, data.input1.title, data.input1.detail, data.input1.description),
        new MergeEditorInputData(data.input2.uri, data.input2.title, data.input2.detail, data.input2.description),
        data.result
      );
    } catch (err) {
      onUnexpectedError(err);
      return void 0;
    }
  }
}
export {
  MergeEditorSerializer
};
//# sourceMappingURL=mergeEditorSerializer.js.map
