var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise } from "../../../../../../base/common/async.js";
class ChatQuestionCarouselData {
  static {
    __name(this, "ChatQuestionCarouselData");
  }
  constructor(questions, allowSkip, resolveId, data, isUsed, message, source) {
    this.questions = questions;
    this.allowSkip = allowSkip;
    this.resolveId = resolveId;
    this.data = data;
    this.isUsed = isUsed;
    this.message = message;
    this.source = source;
    this.kind = "questionCarousel";
    this.completion = new DeferredPromise();
  }
  toJSON() {
    return {
      kind: this.kind,
      questions: this.questions,
      allowSkip: this.allowSkip,
      resolveId: this.resolveId,
      data: this.data,
      isUsed: this.isUsed,
      message: this.message,
      source: this.source
    };
  }
}
export {
  ChatQuestionCarouselData
};
//# sourceMappingURL=chatQuestionCarouselData.js.map
