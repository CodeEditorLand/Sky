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
import { SimpleFindWidget } from "../../codeEditor/browser/find/simpleFindWidget.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { localize } from "../../../../nls.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
const CONTEXT_BROWSER_FIND_WIDGET_VISIBLE = new RawContextKey("browserFindWidgetVisible", false, localize("browser.findWidgetVisible", "Whether the browser find widget is visible"));
const CONTEXT_BROWSER_FIND_WIDGET_FOCUSED = new RawContextKey("browserFindWidgetFocused", false, localize("browser.findWidgetFocused", "Whether the browser find widget is focused"));
let BrowserFindWidget = class BrowserFindWidget2 extends SimpleFindWidget {
  static {
    __name(this, "BrowserFindWidget");
  }
  constructor(container, contextViewService, contextKeyService, hoverService, keybindingService, configurationService, accessibilityService) {
    super({
      showCommonFindToggles: true,
      checkImeCompletionState: true,
      showResultCount: true,
      enableSash: true,
      initialWidth: 350,
      previousMatchActionId: "workbench.action.browser.findPrevious",
      nextMatchActionId: "workbench.action.browser.findNext",
      closeWidgetActionId: "workbench.action.browser.hideFind"
    }, contextViewService, contextKeyService, hoverService, keybindingService, configurationService, accessibilityService);
    this.container = container;
    this._modelDisposables = this._register(new DisposableStore());
    this._hasFoundMatch = false;
    this._findWidgetVisible = CONTEXT_BROWSER_FIND_WIDGET_VISIBLE.bindTo(contextKeyService);
    this._findWidgetFocused = CONTEXT_BROWSER_FIND_WIDGET_FOCUSED.bindTo(contextKeyService);
    container.appendChild(this.getDomNode());
  }
  /**
   * Set the browser view model to use for find operations.
   * This should be called whenever the editor input changes.
   */
  setModel(model) {
    this._modelDisposables.clear();
    this._model = model;
    this._lastFindResult = void 0;
    this._hasFoundMatch = false;
    if (model) {
      this._modelDisposables.add(model.onDidFindInPage((result) => {
        this._lastFindResult = {
          resultIndex: result.activeMatchOrdinal - 1,
          // Convert to 0-based index
          resultCount: result.matches
        };
        this._hasFoundMatch = result.matches > 0;
        this.updateButtons(this._hasFoundMatch);
        this.updateResultCount();
      }));
      this._modelDisposables.add(model.onWillDispose(() => {
        this.setModel(void 0);
      }));
    }
  }
  reveal(initialInput) {
    const wasVisible = this.isVisible();
    super.reveal(initialInput);
    this._findWidgetVisible.set(true);
    this.container.classList.toggle("find-visible", true);
    this.focusFindBox();
    if (this.inputValue && !wasVisible) {
      this._onInputChanged();
    }
  }
  hide() {
    super.hide(false);
    this._findWidgetVisible.reset();
    this.container.classList.toggle("find-visible", false);
    this._model?.stopFindInPage(true);
    this._lastFindResult = void 0;
    this._hasFoundMatch = false;
  }
  find(previous) {
    const value = this.inputValue;
    if (value && this._model) {
      this._model.findInPage(value, {
        forward: !previous,
        recompute: false,
        matchCase: this._getCaseSensitiveValue()
      });
    }
  }
  findFirst() {
    const value = this.inputValue;
    if (value && this._model) {
      this._model.findInPage(value, {
        forward: true,
        recompute: true,
        matchCase: this._getCaseSensitiveValue()
      });
    }
  }
  clear() {
    if (this._model) {
      this._model.stopFindInPage(false);
      this._lastFindResult = void 0;
      this._hasFoundMatch = false;
    }
  }
  _onInputChanged() {
    if (this.inputValue) {
      this.findFirst();
    } else if (this._model) {
      this.clear();
    }
    return false;
  }
  async _getResultCount() {
    return this._lastFindResult;
  }
  _onFocusTrackerFocus() {
    this._findWidgetFocused.set(true);
  }
  _onFocusTrackerBlur() {
    this._findWidgetFocused.reset();
  }
  _onFindInputFocusTrackerFocus() {
  }
  _onFindInputFocusTrackerBlur() {
  }
};
BrowserFindWidget = __decorate([
  __param(1, IContextViewService),
  __param(2, IContextKeyService),
  __param(3, IHoverService),
  __param(4, IKeybindingService),
  __param(5, IConfigurationService),
  __param(6, IAccessibilityService)
], BrowserFindWidget);
export {
  BrowserFindWidget,
  CONTEXT_BROWSER_FIND_WIDGET_FOCUSED,
  CONTEXT_BROWSER_FIND_WIDGET_VISIBLE
};
//# sourceMappingURL=browserFindWidget.js.map
