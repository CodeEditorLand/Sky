var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise } from "../../../../../../base/common/async.js";
class ChatQuestionCarouselData {
  static {
    __name(this, "ChatQuestionCarouselData");
  }
  constructor(questions, allowSkip, resolveId, data, isUsed) {
    this.questions = questions;
    this.allowSkip = allowSkip;
    this.resolveId = resolveId;
    this.data = data;
    this.isUsed = isUsed;
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
      isUsed: this.isUsed
    };
  }
}
export {
  ChatQuestionCarouselData
};
//# sourceMappingURL=chatQuestionCarouselData.js.map
