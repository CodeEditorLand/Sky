var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IPromptsService } from "../../service/promptsService.js";
import { ProviderInstanceBase } from "../providerInstanceBase.js";
import { FrontMatterDecoration } from "./decorations/frontMatterDecoration.js";
import { toDisposable } from "../../../../../../../base/common/lifecycle.js";
import { ProviderInstanceManagerBase } from "../providerInstanceManagerBase.js";
import { registerThemingParticipant } from "../../../../../../../platform/theme/common/themeService.js";
import { ReactiveDecorationBase } from "./decorations/utils/reactiveDecorationBase.js";
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
const SUPPORTED_DECORATIONS = Object.freeze([
  FrontMatterDecoration
]);
let PromptDecorator = class PromptDecorator2 extends ProviderInstanceBase {
  static {
    __name(this, "PromptDecorator");
  }
  constructor(model, promptsService) {
    super(model, promptsService);
    this.decorations = [];
    this.watchCursorPosition();
  }
  onPromptSettled(_error) {
    if (this.isDisposed || this.model.isDisposed()) {
      return this;
    }
    this.addDecorations();
    return this;
  }
  /**
   * Get the current cursor position inside an active editor.
   * Note! Currently not implemented because the provider is disabled, and
   *       we need to do some refactoring to get accurate cursor position.
   */
  get cursorPosition() {
    if (this.model.isDisposed()) {
      return null;
    }
    return null;
  }
  /**
   * Watch editor cursor position and update reactive decorations accordingly.
   */
  watchCursorPosition() {
    const interval = setInterval(() => {
      const { cursorPosition } = this;
      const changedDecorations = [];
      for (const decoration of this.decorations) {
        if (decoration instanceof ReactiveDecorationBase === false) {
          continue;
        }
        if (decoration.setCursorPosition(cursorPosition) === true) {
          changedDecorations.push(decoration);
        }
      }
      if (changedDecorations.length === 0) {
        return;
      }
      this.changeModelDecorations(changedDecorations);
    }, 25);
    this._register(toDisposable(() => {
      clearInterval(interval);
    }));
    return this;
  }
  /**
   * Update existing decorations.
   */
  changeModelDecorations(decorations) {
    this.model.changeDecorations((accessor) => {
      for (const decoration of decorations) {
        decoration.change(accessor);
      }
    });
    return this;
  }
  /**
   * Add decorations for all prompt tokens.
   */
  addDecorations() {
    this.model.changeDecorations((accessor) => {
      const { tokens } = this.parser;
      for (const decoration of this.decorations.splice(0)) {
        decoration.remove(accessor);
      }
      for (const token of tokens) {
        for (const Decoration of SUPPORTED_DECORATIONS) {
          if (Decoration.handles(token) === false) {
            continue;
          }
          this.decorations.push(new Decoration(accessor, token));
          break;
        }
      }
    });
    return this;
  }
  /**
   * Remove all existing decorations.
   */
  removeAllDecorations() {
    if (this.decorations.length === 0) {
      return this;
    }
    this.model.changeDecorations((accessor) => {
      for (const decoration of this.decorations.splice(0)) {
        decoration.remove(accessor);
      }
    });
    return this;
  }
  dispose() {
    if (this.isDisposed) {
      return;
    }
    this.removeAllDecorations();
    super.dispose();
  }
  /**
   * Returns a string representation of this object.
   */
  toString() {
    return `text-model-prompt-decorator:${this.model.uri.path}`;
  }
};
PromptDecorator = __decorate([
  __param(1, IPromptsService)
], PromptDecorator);
registerThemingParticipant((_theme, collector) => {
  for (const Decoration of SUPPORTED_DECORATIONS) {
    for (const [className, styles] of Object.entries(Decoration.cssStyles)) {
      collector.addRule(`.monaco-editor ${className} { ${styles.join(" ")} }`);
    }
  }
});
class PromptDecorationsProviderInstanceManager extends ProviderInstanceManagerBase {
  static {
    __name(this, "PromptDecorationsProviderInstanceManager");
  }
  get InstanceClass() {
    return PromptDecorator;
  }
}
export {
  PromptDecorationsProviderInstanceManager,
  PromptDecorator
};
//# sourceMappingURL=promptDecorationsProvider.js.map
