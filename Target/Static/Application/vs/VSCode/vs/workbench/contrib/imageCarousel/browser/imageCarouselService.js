var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { decodeBase64 } from "../../../../base/common/buffer.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IChatToolInvocation } from "../../chat/common/chatService/chatService.js";
import { isToolResultInputOutputDetails, isToolResultOutputDetails } from "../../chat/common/tools/languageModelToolsService.js";
const IImageCarouselService = createDecorator("imageCarouselService");
class ImageCarouselService extends Disposable {
  static {
    __name(this, "ImageCarouselService");
  }
  async extractImagesFromResponse(response) {
    const images = [];
    for (const item of response.response.value) {
      if (item.kind === "toolInvocation" || item.kind === "toolInvocationSerialized") {
        const toolImages = this.extractImagesFromToolInvocation(item);
        images.push(...toolImages);
      }
    }
    if (images.length === 0) {
      return void 0;
    }
    return {
      id: response.sessionResource.toString() + "_" + response.id,
      title: localize("imageCarousel.title", "Image Carousel"),
      images
    };
  }
  extractImagesFromToolInvocation(toolInvocation) {
    const images = [];
    const resultDetails = IChatToolInvocation.resultDetails(toolInvocation);
    const pushImage = /* @__PURE__ */ __name((mimeType, data) => {
      images.push({
        id: `${toolInvocation.toolCallId}_${images.length}`,
        name: localize("imageCarousel.imageName", "Image {0}", images.length + 1),
        mimeType,
        data,
        source: localize("imageCarousel.toolSource", "Tool: {0}", toolInvocation.toolId)
      });
    }, "pushImage");
    if (isToolResultInputOutputDetails(resultDetails)) {
      for (const outputItem of resultDetails.output) {
        if (outputItem.type === "embed" && outputItem.mimeType?.startsWith("image/") && !outputItem.isText) {
          pushImage(outputItem.mimeType, decodeBase64(outputItem.value));
        }
      }
    } else if (isToolResultOutputDetails(resultDetails)) {
      const output = resultDetails.output;
      if (output.mimeType?.startsWith("image/")) {
        const data = this.getImageDataFromOutputDetails(resultDetails, toolInvocation);
        if (data) {
          pushImage(output.mimeType, data);
        }
      }
    }
    return images;
  }
  getImageDataFromOutputDetails(resultDetails, toolInvocation) {
    if (toolInvocation.kind === "toolInvocationSerialized") {
      const serializedDetails = resultDetails;
      if (serializedDetails.output.base64Data) {
        return decodeBase64(serializedDetails.output.base64Data);
      }
      return void 0;
    } else {
      return resultDetails.output.value;
    }
  }
}
export {
  IImageCarouselService,
  ImageCarouselService
};
//# sourceMappingURL=imageCarouselService.js.map
