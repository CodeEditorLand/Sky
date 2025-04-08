var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { ITextModel } from "../../common/model.js";
import { ITextModelTreeSitter, ITreeSitterParserService, TreeUpdateEvent } from "../../common/services/treeSitterParserService.js";
class StandaloneTreeSitterParserService {
  static {
    __name(this, "StandaloneTreeSitterParserService");
  }
  async getLanguage(languageId) {
    return void 0;
  }
  getTreeSync(content, languageId) {
    return void 0;
  }
  async getTextModelTreeSitter(model, parseImmediately) {
    return void 0;
  }
  async getTree(content, languageId) {
    return void 0;
  }
  onDidUpdateTree = Event.None;
  _serviceBrand;
  onDidAddLanguage = Event.None;
  getOrInitLanguage(_languageId) {
    return void 0;
  }
  getParseResult(textModel) {
    return void 0;
  }
}
export {
  StandaloneTreeSitterParserService
};
//# sourceMappingURL=standaloneTreeSitterService.js.map
