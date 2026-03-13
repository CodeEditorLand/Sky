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
import { Emitter } from "../../../../../base/common/event.js";
import { toDisposable } from "../../../../../base/common/lifecycle.js";
import { LineTokens } from "../../../tokens/lineTokens.js";
import { AbstractSyntaxTokenBackend } from "../abstractSyntaxTokenBackend.js";
import { autorun, derived, ObservablePromise } from "../../../../../base/common/observable.js";
import { TreeSitterTree } from "./treeSitterTree.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { TreeSitterTokenizationImpl } from "./treeSitterTokenizationImpl.js";
import { ITreeSitterLibraryService } from "../../../services/treeSitter/treeSitterLibraryService.js";
let TreeSitterSyntaxTokenBackend = class TreeSitterSyntaxTokenBackend2 extends AbstractSyntaxTokenBackend {
  static {
    __name(this, "TreeSitterSyntaxTokenBackend");
  }
  constructor(_languageIdObs, languageIdCodec, textModel, visibleLineRanges, _treeSitterLibraryService, _instantiationService) {
    super(languageIdCodec, textModel);
    this._languageIdObs = _languageIdObs;
    this._treeSitterLibraryService = _treeSitterLibraryService;
    this._instantiationService = _instantiationService;
    this._backgroundTokenizationState = 1;
    this._onDidChangeBackgroundTokenizationState = this._register(new Emitter());
    this.onDidChangeBackgroundTokenizationState = this._onDidChangeBackgroundTokenizationState.event;
    const parserClassPromise = new ObservablePromise(this._treeSitterLibraryService.getParserClass());
    const parserClassObs = derived(this, (reader) => {
      const parser = parserClassPromise.promiseResult?.read(reader)?.getDataOrThrow();
      return parser;
    });
    this._tree = derived(this, (reader) => {
      const parserClass = parserClassObs.read(reader);
      if (!parserClass) {
        return void 0;
      }
      const currentLanguage = this._languageIdObs.read(reader);
      const treeSitterLang = this._treeSitterLibraryService.getLanguage(currentLanguage, false, reader);
      if (!treeSitterLang) {
        return void 0;
      }
      const parser = new parserClass();
      reader.store.add(toDisposable(() => {
        parser.delete();
      }));
      parser.setLanguage(treeSitterLang);
      const queries = this._treeSitterLibraryService.getInjectionQueries(currentLanguage, reader);
      if (queries === void 0) {
        return void 0;
      }
      return reader.store.add(this._instantiationService.createInstance(
        TreeSitterTree,
        currentLanguage,
        void 0,
        parser,
        parserClass,
        /*queries, */
        this._textModel
      ));
    });
    this._tokenizationImpl = derived(this, (reader) => {
      const treeModel = this._tree.read(reader);
      if (!treeModel) {
        return void 0;
      }
      const queries = this._treeSitterLibraryService.getHighlightingQueries(treeModel.languageId, reader);
      if (!queries) {
        return void 0;
      }
      return reader.store.add(this._instantiationService.createInstance(TreeSitterTokenizationImpl, treeModel, queries, this._languageIdCodec, visibleLineRanges));
    });
    this._register(autorun((reader) => {
      const tokModel = this._tokenizationImpl.read(reader);
      if (!tokModel) {
        return;
      }
      reader.store.add(tokModel.onDidChangeTokens((e) => {
        this._onDidChangeTokens.fire(e.changes);
      }));
      reader.store.add(tokModel.onDidChangeBackgroundTokenization((e) => {
        this._backgroundTokenizationState = 2;
        this._onDidChangeBackgroundTokenizationState.fire();
      }));
    }));
  }
  get tree() {
    return this._tree;
  }
  get tokenizationImpl() {
    return this._tokenizationImpl;
  }
  getLineTokens(lineNumber) {
    const model = this._tokenizationImpl.get();
    if (!model) {
      const content = this._textModel.getLineContent(lineNumber);
      return LineTokens.createEmpty(content, this._languageIdCodec);
    }
    return model.getLineTokens(lineNumber);
  }
  todo_resetTokenization(fireTokenChangeEvent = true) {
    if (fireTokenChangeEvent) {
      this._onDidChangeTokens.fire({
        semanticTokensApplied: false,
        ranges: [
          {
            fromLineNumber: 1,
            toLineNumber: this._textModel.getLineCount()
          }
        ]
      });
    }
  }
  handleDidChangeAttached() {
  }
  handleDidChangeContent(e) {
    if (e.isFlush) {
      this.todo_resetTokenization(false);
    } else {
      const model = this._tokenizationImpl.get();
      model?.handleContentChanged(e);
    }
    const treeModel = this._tree.get();
    treeModel?.handleContentChange(e);
  }
  forceTokenization(lineNumber) {
    const model = this._tokenizationImpl.get();
    if (!model) {
      return;
    }
    if (!model.hasAccurateTokensForLine(lineNumber)) {
      model.tokenizeEncoded(lineNumber);
    }
  }
  hasAccurateTokensForLine(lineNumber) {
    const model = this._tokenizationImpl.get();
    if (!model) {
      return false;
    }
    return model.hasAccurateTokensForLine(lineNumber);
  }
  isCheapToTokenize(lineNumber) {
    return true;
  }
  getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
    return 0;
  }
  tokenizeLinesAt(lineNumber, lines) {
    const model = this._tokenizationImpl.get();
    if (!model) {
      return null;
    }
    return model.tokenizeLinesAt(lineNumber, lines);
  }
  get hasTokens() {
    const model = this._tokenizationImpl.get();
    if (!model) {
      return false;
    }
    return model.hasTokens();
  }
};
TreeSitterSyntaxTokenBackend = __decorate([
  __param(4, ITreeSitterLibraryService),
  __param(5, IInstantiationService)
], TreeSitterSyntaxTokenBackend);
export {
  TreeSitterSyntaxTokenBackend
};
//# sourceMappingURL=treeSitterSyntaxTokenBackend.js.map
