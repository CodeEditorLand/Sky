var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/imageCarousel.css";
import { localize, localize2 } from "../../../../nls.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { EditorExtensions } from "../../../common/editor.js";
import { IEditorService, MODAL_GROUP } from "../../../services/editor/common/editorService.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { IChatWidgetService } from "../../chat/browser/chat.js";
import { isResponseVM } from "../../chat/common/model/chatViewModel.js";
import { ImageCarouselEditor } from "./imageCarouselEditor.js";
import { ImageCarouselEditorInput } from "./imageCarouselEditorInput.js";
import { IImageCarouselService, ImageCarouselService } from "./imageCarouselService.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
registerSingleton(
  IImageCarouselService,
  ImageCarouselService,
  1
  /* InstantiationType.Delayed */
);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(ImageCarouselEditor, ImageCarouselEditor.ID, localize("imageCarouselEditor", "Image Carousel")), [
  new SyncDescriptor(ImageCarouselEditorInput)
]);
class ImageCarouselEditorInputSerializer {
  static {
    __name(this, "ImageCarouselEditorInputSerializer");
  }
  canSerialize() {
    return false;
  }
  serialize() {
    return void 0;
  }
  deserialize() {
    return void 0;
  }
}
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(ImageCarouselEditorInput.ID, ImageCarouselEditorInputSerializer);
class OpenImageInCarouselAction extends Action2 {
  static {
    __name(this, "OpenImageInCarouselAction");
  }
  constructor() {
    super({
      id: "workbench.action.chat.openImageInCarousel",
      title: localize2("openImageInCarousel", "Open Image in Carousel"),
      f1: false
    });
  }
  async run(accessor, args) {
    const editorService = accessor.get(IEditorService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const carouselService = accessor.get(IImageCarouselService);
    const clickedData = VSBuffer.wrap(args.data);
    const widget = chatWidgetService.lastFocusedWidget;
    if (widget?.viewModel) {
      const responses = widget.viewModel.getItems().filter((item) => isResponseVM(item));
      for (let i = responses.length - 1; i >= 0; i--) {
        const collection2 = await carouselService.extractImagesFromResponse(responses[i]);
        if (collection2 && collection2.images.length > 0) {
          const startIndex = collection2.images.findIndex((img) => img.data.equals(clickedData));
          if (startIndex !== -1) {
            const input2 = new ImageCarouselEditorInput(collection2, startIndex);
            await editorService.openEditor(input2, { pinned: true }, MODAL_GROUP);
            return;
          }
        }
      }
    }
    const collection = {
      id: generateUuid(),
      title: localize("imageCarousel.title", "Image Carousel"),
      images: [{
        id: generateUuid(),
        name: args.name,
        mimeType: args.mimeType,
        data: VSBuffer.wrap(args.data)
      }]
    };
    const input = new ImageCarouselEditorInput(collection);
    await editorService.openEditor(input, { pinned: true }, MODAL_GROUP);
  }
}
registerAction2(OpenImageInCarouselAction);
//# sourceMappingURL=imageCarousel.contribution.js.map
