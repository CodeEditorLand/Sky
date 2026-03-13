var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EditorInput } from "../../../common/editor/editorInput.js";
import { URI } from "../../../../base/common/uri.js";
import { Schemas } from "../../../../base/common/network.js";
class ImageCarouselEditorInput extends EditorInput {
  static {
    __name(this, "ImageCarouselEditorInput");
  }
  static {
    this.ID = "workbench.input.imageCarousel";
  }
  constructor(collection, startIndex = 0) {
    super();
    this.collection = collection;
    this.startIndex = startIndex;
    this._resource = URI.from({
      scheme: Schemas.vscodeImageCarousel,
      path: `/${encodeURIComponent(collection.id)}`
    });
  }
  get typeId() {
    return ImageCarouselEditorInput.ID;
  }
  get resource() {
    return this._resource;
  }
  getName() {
    return this.collection.title;
  }
  matches(other) {
    if (other instanceof ImageCarouselEditorInput) {
      return other.collection.id === this.collection.id;
    }
    return false;
  }
}
export {
  ImageCarouselEditorInput
};
//# sourceMappingURL=imageCarouselEditorInput.js.map
