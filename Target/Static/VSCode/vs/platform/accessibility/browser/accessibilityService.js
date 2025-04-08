var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { addDisposableListener } from "../../../base/browser/dom.js";
import { alert, status } from "../../../base/browser/ui/aria/aria.js";
import { mainWindow } from "../../../base/browser/window.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { AccessibilitySupport, CONTEXT_ACCESSIBILITY_MODE_ENABLED, IAccessibilityService } from "../common/accessibility.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IContextKey, IContextKeyService } from "../../contextkey/common/contextkey.js";
import { ILayoutService } from "../../layout/browser/layoutService.js";
let AccessibilityService = class extends Disposable {
  constructor(_contextKeyService, _layoutService, _configurationService) {
    super();
    this._contextKeyService = _contextKeyService;
    this._layoutService = _layoutService;
    this._configurationService = _configurationService;
    this._accessibilityModeEnabledContext = CONTEXT_ACCESSIBILITY_MODE_ENABLED.bindTo(this._contextKeyService);
    const updateContextKey = /* @__PURE__ */ __name(() => this._accessibilityModeEnabledContext.set(this.isScreenReaderOptimized()), "updateContextKey");
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("editor.accessibilitySupport")) {
        updateContextKey();
        this._onDidChangeScreenReaderOptimized.fire();
      }
      if (e.affectsConfiguration("workbench.reduceMotion")) {
        this._configMotionReduced = this._configurationService.getValue("workbench.reduceMotion");
        this._onDidChangeReducedMotion.fire();
      }
    }));
    updateContextKey();
    this._register(this.onDidChangeScreenReaderOptimized(() => updateContextKey()));
    const reduceMotionMatcher = mainWindow.matchMedia(`(prefers-reduced-motion: reduce)`);
    this._systemMotionReduced = reduceMotionMatcher.matches;
    this._configMotionReduced = this._configurationService.getValue("workbench.reduceMotion");
    this._linkUnderlinesEnabled = this._configurationService.getValue("accessibility.underlineLinks");
    this.initReducedMotionListeners(reduceMotionMatcher);
    this.initLinkUnderlineListeners();
  }
  static {
    __name(this, "AccessibilityService");
  }
  _accessibilityModeEnabledContext;
  _accessibilitySupport = AccessibilitySupport.Unknown;
  _onDidChangeScreenReaderOptimized = new Emitter();
  _configMotionReduced;
  _systemMotionReduced;
  _onDidChangeReducedMotion = new Emitter();
  _linkUnderlinesEnabled;
  _onDidChangeLinkUnderline = new Emitter();
  initReducedMotionListeners(reduceMotionMatcher) {
    this._register(addDisposableListener(reduceMotionMatcher, "change", () => {
      this._systemMotionReduced = reduceMotionMatcher.matches;
      if (this._configMotionReduced === "auto") {
        this._onDidChangeReducedMotion.fire();
      }
    }));
    const updateRootClasses = /* @__PURE__ */ __name(() => {
      const reduce = this.isMotionReduced();
      this._layoutService.mainContainer.classList.toggle("reduce-motion", reduce);
      this._layoutService.mainContainer.classList.toggle("enable-motion", !reduce);
    }, "updateRootClasses");
    updateRootClasses();
    this._register(this.onDidChangeReducedMotion(() => updateRootClasses()));
  }
  initLinkUnderlineListeners() {
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("accessibility.underlineLinks")) {
        const linkUnderlinesEnabled = this._configurationService.getValue("accessibility.underlineLinks");
        this._linkUnderlinesEnabled = linkUnderlinesEnabled;
        this._onDidChangeLinkUnderline.fire();
      }
    }));
    const updateLinkUnderlineClasses = /* @__PURE__ */ __name(() => {
      const underlineLinks = this._linkUnderlinesEnabled;
      this._layoutService.mainContainer.classList.toggle("underline-links", underlineLinks);
    }, "updateLinkUnderlineClasses");
    updateLinkUnderlineClasses();
    this._register(this.onDidChangeLinkUnderlines(() => updateLinkUnderlineClasses()));
  }
  onDidChangeLinkUnderlines(listener) {
    return this._onDidChangeLinkUnderline.event(listener);
  }
  get onDidChangeScreenReaderOptimized() {
    return this._onDidChangeScreenReaderOptimized.event;
  }
  isScreenReaderOptimized() {
    const config = this._configurationService.getValue("editor.accessibilitySupport");
    return config === "on" || config === "auto" && this._accessibilitySupport === AccessibilitySupport.Enabled;
  }
  get onDidChangeReducedMotion() {
    return this._onDidChangeReducedMotion.event;
  }
  isMotionReduced() {
    const config = this._configMotionReduced;
    return config === "on" || config === "auto" && this._systemMotionReduced;
  }
  alwaysUnderlineAccessKeys() {
    return Promise.resolve(false);
  }
  getAccessibilitySupport() {
    return this._accessibilitySupport;
  }
  setAccessibilitySupport(accessibilitySupport) {
    if (this._accessibilitySupport === accessibilitySupport) {
      return;
    }
    this._accessibilitySupport = accessibilitySupport;
    this._onDidChangeScreenReaderOptimized.fire();
  }
  alert(message) {
    alert(message);
  }
  status(message) {
    status(message);
  }
};
AccessibilityService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ILayoutService),
  __decorateParam(2, IConfigurationService)
], AccessibilityService);
export {
  AccessibilityService
};
//# sourceMappingURL=accessibilityService.js.map
