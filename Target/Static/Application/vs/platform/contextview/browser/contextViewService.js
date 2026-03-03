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
import { ContextView } from "../../../base/browser/ui/contextview/contextview.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { ILayoutService } from "../../layout/browser/layoutService.js";
import { getWindow } from "../../../base/browser/dom.js";
let ContextViewHandler = class ContextViewHandler2 extends Disposable {
  static {
    __name(this, "ContextViewHandler");
  }
  constructor(layoutService) {
    super();
    this.layoutService = layoutService;
    this.contextView = this._register(new ContextView(
      this.layoutService.mainContainer,
      1
      /* ContextViewDOMPosition.ABSOLUTE */
    ));
    this.layout();
    this._register(layoutService.onDidLayoutContainer(() => this.layout()));
  }
  // ContextView
  showContextView(delegate, container, shadowRoot) {
    let domPosition;
    if (container) {
      if (container === this.layoutService.getContainer(getWindow(container))) {
        domPosition = 1;
      } else if (shadowRoot) {
        domPosition = 3;
      } else {
        domPosition = 2;
      }
    } else {
      domPosition = 1;
    }
    this.contextView.setContainer(container ?? this.layoutService.activeContainer, domPosition);
    this.contextView.show(delegate);
    const openContextView = {
      close: /* @__PURE__ */ __name(() => {
        if (this.openContextView === openContextView) {
          this.hideContextView();
        }
      }, "close")
    };
    this.openContextView = openContextView;
    return openContextView;
  }
  layout() {
    this.contextView.layout();
  }
  hideContextView(data) {
    this.contextView.hide(data);
    this.openContextView = void 0;
  }
};
ContextViewHandler = __decorate([
  __param(0, ILayoutService)
], ContextViewHandler);
class ContextViewService extends ContextViewHandler {
  static {
    __name(this, "ContextViewService");
  }
  getContextViewElement() {
    return this.contextView.getViewElement();
  }
}
export {
  ContextViewHandler,
  ContextViewService
};
//# sourceMappingURL=contextViewService.js.map
