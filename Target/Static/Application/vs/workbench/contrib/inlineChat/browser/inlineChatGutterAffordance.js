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
import { Codicon } from "../../../../base/common/codicons.js";
import { autorun, constObservable, derived, observableValue } from "../../../../base/common/observable.js";
import { LineRange } from "../../../../editor/common/core/ranges/lineRange.js";
import { InlineEditsGutterIndicator, InlineEditsGutterIndicatorData, InlineSuggestionGutterMenuData, SimpleInlineSuggestModel } from "../../../../editor/contrib/inlineCompletions/browser/view/inlineEdits/components/gutterIndicatorView.js";
import { InlineEditTabAction } from "../../../../editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViewInterface.js";
import { localize } from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ACTION_START } from "../common/inlineChat.js";
let InlineChatGutterAffordance = class InlineChatGutterAffordance2 extends InlineEditsGutterIndicator {
  static {
    __name(this, "InlineChatGutterAffordance");
  }
  constructor(_myEditorObs, selection, _hover, _keybindingService, hoverService, instantiationService, accessibilityService, themeService) {
    const data = derived((r) => {
      const value = selection.read(r);
      if (!value) {
        return void 0;
      }
      const cursorPosition = value.getPosition();
      const lineRange = new LineRange(cursorPosition.lineNumber, cursorPosition.lineNumber + 1);
      const gutterMenuData = new InlineSuggestionGutterMenuData(
        void 0,
        // action
        "",
        // displayName
        [],
        // extensionCommands
        void 0,
        // alternativeAction
        void 0,
        // modelInfo
        void 0
      );
      return new InlineEditsGutterIndicatorData(
        gutterMenuData,
        lineRange,
        new SimpleInlineSuggestModel(() => {
        }, () => this._doShowHover()),
        void 0,
        // altAction
        {
          icon: Codicon.sparkle
        }
      );
    });
    const focusIsInMenu = observableValue({}, false);
    super(_myEditorObs, data, constObservable(InlineEditTabAction.Inactive), constObservable(0), constObservable(false), focusIsInMenu, hoverService, instantiationService, accessibilityService, themeService);
    this._myEditorObs = _myEditorObs;
    this._hover = _hover;
    this._keybindingService = _keybindingService;
    this._store.add(autorun((r) => {
      const element = _hover.read(r);
      this._hoverVisible.set(!!element, void 0);
    }));
  }
  _showHover() {
    this._hoverService.showInstantHover({
      target: this._iconRef.element,
      content: this._keybindingService.appendKeybinding(localize("inlineChatGutterHover", "Inline Chat"), ACTION_START)
      // appearance: { showPointer: true }
    });
  }
  _doShowHover() {
    if (this._hoverVisible.get()) {
      return;
    }
    const iconElement = this._iconRef.element;
    if (!iconElement) {
      this._hover.set(void 0, void 0);
      return;
    }
    const selection = this._myEditorObs.cursorSelection.get();
    const direction = selection?.getDirection() ?? 0;
    const lineNumber = selection?.getPosition().lineNumber ?? 1;
    this._hover.set({ rect: iconElement.getBoundingClientRect(), above: direction === 1, lineNumber }, void 0);
  }
};
InlineChatGutterAffordance = __decorate([
  __param(3, IKeybindingService),
  __param(4, IHoverService),
  __param(5, IInstantiationService),
  __param(6, IAccessibilityService),
  __param(7, IThemeService)
], InlineChatGutterAffordance);
export {
  InlineChatGutterAffordance
};
//# sourceMappingURL=inlineChatGutterAffordance.js.map
