var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { addStandardDisposableListener, isHTMLElement } from "../../../base/browser/dom.js";
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
const IHoverService = createDecorator("hoverService");
let WorkbenchHoverDelegate = class WorkbenchHoverDelegate2 extends Disposable {
  static {
    __name(this, "WorkbenchHoverDelegate");
  }
  get delay() {
    if (this.isInstantlyHovering()) {
      return 0;
    }
    if (this.hoverOptions?.dynamicDelay) {
      return (content) => this.hoverOptions?.dynamicDelay?.(content) ?? this._delay;
    }
    return this._delay;
  }
  constructor(placement, hoverOptions, overrideOptions = {}, configurationService, hoverService) {
    super();
    this.placement = placement;
    this.hoverOptions = hoverOptions;
    this.overrideOptions = overrideOptions;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.lastHoverHideTime = 0;
    this.timeLimit = 200;
    this.hoverDisposables = this._register(new DisposableStore());
    this._delay = this.configurationService.getValue("workbench.hover.delay");
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.hover.delay")) {
        this._delay = this.configurationService.getValue("workbench.hover.delay");
      }
    }));
  }
  showHover(options, focus) {
    const overrideOptions = typeof this.overrideOptions === "function" ? this.overrideOptions(options, focus) : this.overrideOptions;
    this.hoverDisposables.clear();
    const targets = isHTMLElement(options.target) ? [options.target] : options.target.targetElements;
    for (const target of targets) {
      this.hoverDisposables.add(addStandardDisposableListener(target, "keydown", (e) => {
        if (e.equals(
          9
          /* KeyCode.Escape */
        )) {
          this.hoverService.hideHover();
        }
      }));
    }
    const id = isHTMLElement(options.content) ? void 0 : typeof options.content === "string" ? options.content.toString() : options.content.value;
    return this.hoverService.showInstantHover({
      ...options,
      ...overrideOptions,
      persistence: {
        hideOnKeyDown: true,
        ...overrideOptions.persistence
      },
      id,
      appearance: {
        ...options.appearance,
        compact: true,
        skipFadeInAnimation: this.isInstantlyHovering(),
        ...overrideOptions.appearance
      }
    }, focus);
  }
  isInstantlyHovering() {
    return !!this.hoverOptions?.instantHover && Date.now() - this.lastHoverHideTime < this.timeLimit;
  }
  setInstantHoverTimeLimit(timeLimit) {
    if (!this.hoverOptions?.instantHover) {
      throw new Error("Instant hover is not enabled");
    }
    this.timeLimit = timeLimit;
  }
  onDidHideHover() {
    this.hoverDisposables.clear();
    if (this.hoverOptions?.instantHover) {
      this.lastHoverHideTime = Date.now();
    }
  }
};
WorkbenchHoverDelegate = __decorate([
  __param(3, IConfigurationService),
  __param(4, IHoverService)
], WorkbenchHoverDelegate);
const nativeHoverDelegate = {
  showHover: /* @__PURE__ */ __name(function() {
    throw new Error("Native hover function not implemented.");
  }, "showHover"),
  delay: 0,
  showNativeHover: true
};
export {
  IHoverService,
  WorkbenchHoverDelegate,
  nativeHoverDelegate
};
//# sourceMappingURL=hover.js.map
