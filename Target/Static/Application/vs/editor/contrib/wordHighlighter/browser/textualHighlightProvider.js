var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { USUAL_WORD_SEPARATORS } from "../../../common/core/wordHelper.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { DocumentHighlightKind } from "../../../common/languages.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
class TextualDocumentHighlightProvider {
  static {
    __name(this, "TextualDocumentHighlightProvider");
  }
  constructor() {
    this.selector = { language: "*" };
  }
  provideDocumentHighlights(model, position, token) {
    const result = [];
    const word = model.getWordAtPosition({
      lineNumber: position.lineNumber,
      column: position.column
    });
    if (!word) {
      return Promise.resolve(result);
    }
    if (model.isDisposed()) {
      return;
    }
    const matches = model.findMatches(word.word, true, false, true, USUAL_WORD_SEPARATORS, false);
    return matches.map((m) => ({
      range: m.range,
      kind: DocumentHighlightKind.Text
    }));
  }
  provideMultiDocumentHighlights(primaryModel, position, otherModels, token) {
    const result = new ResourceMap();
    const word = primaryModel.getWordAtPosition({
      lineNumber: position.lineNumber,
      column: position.column
    });
    if (!word) {
      return Promise.resolve(result);
    }
    for (const model of [primaryModel, ...otherModels]) {
      if (model.isDisposed()) {
        continue;
      }
      const matches = model.findMatches(word.word, true, false, true, USUAL_WORD_SEPARATORS, false);
      const highlights = matches.map((m) => ({
        range: m.range,
        kind: DocumentHighlightKind.Text
      }));
      if (highlights) {
        result.set(model.uri, highlights);
      }
    }
    return result;
  }
}
let TextualMultiDocumentHighlightFeature = class TextualMultiDocumentHighlightFeature2 extends Disposable {
  static {
    __name(this, "TextualMultiDocumentHighlightFeature");
  }
  constructor(languageFeaturesService) {
    super();
    this._register(languageFeaturesService.documentHighlightProvider.register("*", new TextualDocumentHighlightProvider()));
    this._register(languageFeaturesService.multiDocumentHighlightProvider.register("*", new TextualDocumentHighlightProvider()));
  }
};
TextualMultiDocumentHighlightFeature = __decorate([
  __param(0, ILanguageFeaturesService)
], TextualMultiDocumentHighlightFeature);
export {
  TextualMultiDocumentHighlightFeature
};
//# sourceMappingURL=textualHighlightProvider.js.map
