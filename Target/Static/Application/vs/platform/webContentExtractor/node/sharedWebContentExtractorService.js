var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../base/common/buffer.js";
class SharedWebContentExtractorService {
  static {
    __name(this, "SharedWebContentExtractorService");
  }
  async readImage(uri, token) {
    if (token.isCancellationRequested) {
      return void 0;
    }
    try {
      const response = await fetch(uri.toString(true), {
        headers: {
          "Accept": "image/*",
          "User-Agent": "Mozilla/5.0"
        }
      });
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType?.startsWith("image/") || !/(webp|jpg|jpeg|gif|png|bmp)$/i.test(contentType)) {
        return void 0;
      }
      const content = VSBuffer.wrap(await response.bytes());
      return content;
    } catch (err) {
      console.log(err);
      return void 0;
    }
  }
}
export {
  SharedWebContentExtractorService
};
//# sourceMappingURL=sharedWebContentExtractorService.js.map
