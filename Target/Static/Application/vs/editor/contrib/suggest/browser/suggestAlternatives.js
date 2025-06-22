var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
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
var SuggestAlternatives_1;
let SuggestAlternatives = class SuggestAlternatives2 {
  static {
    __name(this, "SuggestAlternatives");
  }
  static {
    SuggestAlternatives_1 = this;
  }
  static {
    this.OtherSuggestions = new RawContextKey("hasOtherSuggestions", false);
  }
  constructor(_editor, contextKeyService) {
    this._editor = _editor;
    this._index = 0;
    this._ckOtherSuggestions = SuggestAlternatives_1.OtherSuggestions.bindTo(contextKeyService);
  }
  dispose() {
    this.reset();
  }
  reset() {
    this._ckOtherSuggestions.reset();
    this._listener?.dispose();
    this._model = void 0;
    this._acceptNext = void 0;
    this._ignore = false;
  }
  set({ model, index }, acceptNext) {
    if (model.items.length === 0) {
      this.reset();
      return;
    }
    const nextIndex = SuggestAlternatives_1._moveIndex(true, model, index);
    if (nextIndex === index) {
      this.reset();
      return;
    }
    this._acceptNext = acceptNext;
    this._model = model;
    this._index = index;
    this._listener = this._editor.onDidChangeCursorPosition(() => {
      if (!this._ignore) {
        this.reset();
      }
    });
    this._ckOtherSuggestions.set(true);
  }
  static _moveIndex(fwd, model, index) {
    let newIndex = index;
    for (let rounds = model.items.length; rounds > 0; rounds--) {
      newIndex = (newIndex + model.items.length + (fwd ? 1 : -1)) % model.items.length;
      if (newIndex === index) {
        break;
      }
      if (!model.items[newIndex].completion.additionalTextEdits) {
        break;
      }
    }
    return newIndex;
  }
  next() {
    this._move(true);
  }
  prev() {
    this._move(false);
  }
  _move(fwd) {
    if (!this._model) {
      return;
    }
    try {
      this._ignore = true;
      this._index = SuggestAlternatives_1._moveIndex(fwd, this._model, this._index);
      this._acceptNext({ index: this._index, item: this._model.items[this._index], model: this._model });
    } finally {
      this._ignore = false;
    }
  }
};
SuggestAlternatives = SuggestAlternatives_1 = __decorate([
  __param(1, IContextKeyService)
], SuggestAlternatives);
export {
  SuggestAlternatives
};
//# sourceMappingURL=suggestAlternatives.js.map
