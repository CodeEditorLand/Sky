var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../nls.js";
import { addDisposableListener, getActiveWindow } from "../../../base/browser/dom.js";
import { createFastDomNode } from "../../../base/browser/fastDomNode.js";
import { BugIndicatingError } from "../../../base/common/errors.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { observableValue, runOnChange } from "../../../base/common/observable.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { TextureAtlas } from "./atlas/textureAtlas.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { INotificationService, Severity } from "../../../platform/notification/common/notification.js";
import { GPULifecycle } from "./gpuDisposable.js";
import { ensureNonNullable, observeDevicePixelDimensions } from "./gpuUtils.js";
import { RectangleRenderer } from "./rectangleRenderer.js";
import { DecorationCssRuleExtractor } from "./css/decorationCssRuleExtractor.js";
import { Event } from "../../../base/common/event.js";
import { DecorationStyleCache } from "./css/decorationStyleCache.js";
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
var ViewGpuContext_1;
let ViewGpuContext = class ViewGpuContext2 extends Disposable {
  static {
    __name(this, "ViewGpuContext");
  }
  static {
    ViewGpuContext_1 = this;
  }
  static {
    this._decorationCssRuleExtractor = new DecorationCssRuleExtractor();
  }
  static get decorationCssRuleExtractor() {
    return ViewGpuContext_1._decorationCssRuleExtractor;
  }
  static {
    this._decorationStyleCache = new DecorationStyleCache();
  }
  static get decorationStyleCache() {
    return ViewGpuContext_1._decorationStyleCache;
  }
  /**
   * The shared texture atlas to use across all views.
   *
   * @throws if called before the GPU device is resolved
   */
  static get atlas() {
    if (!ViewGpuContext_1._atlas) {
      throw new BugIndicatingError("Cannot call ViewGpuContext.textureAtlas before device is resolved");
    }
    return ViewGpuContext_1._atlas;
  }
  /**
   * The shared texture atlas to use across all views. This is a convenience alias for
   * {@link ViewGpuContext.atlas}.
   *
   * @throws if called before the GPU device is resolved
   */
  get atlas() {
    return ViewGpuContext_1.atlas;
  }
  constructor(context, _instantiationService, _notificationService, configurationService) {
    super();
    this._instantiationService = _instantiationService;
    this._notificationService = _notificationService;
    this.configurationService = configurationService;
    this.maxGpuCols = 2e3;
    this.canvas = createFastDomNode(document.createElement("canvas"));
    this.canvas.setClassName("editorCanvas");
    this._register(Event.runAndSubscribe(configurationService.onDidChangeConfiguration, (e) => {
      if (!e || e.affectsConfiguration("editor.scrollbar.verticalScrollbarSize")) {
        const verticalScrollbarSize = configurationService.getValue("editor").scrollbar?.verticalScrollbarSize ?? 14;
        this.canvas.domNode.style.boxSizing = "border-box";
        this.canvas.domNode.style.paddingRight = `${verticalScrollbarSize}px`;
      }
    }));
    this.ctx = ensureNonNullable(this.canvas.domNode.getContext("webgpu"));
    if (!ViewGpuContext_1.device) {
      ViewGpuContext_1.device = GPULifecycle.requestDevice((message) => {
        const choices = [{
          label: nls.localize("editor.dom.render", "Use DOM-based rendering"),
          run: /* @__PURE__ */ __name(() => this.configurationService.updateValue("editor.experimentalGpuAcceleration", "off"), "run")
        }];
        this._notificationService.prompt(Severity.Warning, message, choices);
      }).then((ref) => {
        ViewGpuContext_1.deviceSync = ref.object;
        if (!ViewGpuContext_1._atlas) {
          ViewGpuContext_1._atlas = this._instantiationService.createInstance(TextureAtlas, ref.object.limits.maxTextureDimension2D, void 0, ViewGpuContext_1.decorationStyleCache);
        }
        return ref.object;
      });
    }
    const dprObs = observableValue(this, getActiveWindow().devicePixelRatio);
    this._register(addDisposableListener(getActiveWindow(), "resize", () => {
      dprObs.set(getActiveWindow().devicePixelRatio, void 0);
    }));
    this.devicePixelRatio = dprObs;
    this._register(runOnChange(this.devicePixelRatio, () => ViewGpuContext_1.atlas?.clear()));
    const canvasDevicePixelDimensions = observableValue(this, { width: this.canvas.domNode.width, height: this.canvas.domNode.height });
    this._register(observeDevicePixelDimensions(this.canvas.domNode, getActiveWindow(), (width, height) => {
      this.canvas.domNode.width = width;
      this.canvas.domNode.height = height;
      canvasDevicePixelDimensions.set({ width, height }, void 0);
    }));
    this.canvasDevicePixelDimensions = canvasDevicePixelDimensions;
    const contentLeft = observableValue(this, 0);
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      contentLeft.set(context.configuration.options.get(
        154
        /* EditorOption.layoutInfo */
      ).contentLeft, void 0);
    }));
    this.contentLeft = contentLeft;
    this.rectangleRenderer = this._instantiationService.createInstance(RectangleRenderer, context, this.contentLeft, this.devicePixelRatio, this.canvas.domNode, this.ctx, ViewGpuContext_1.device);
  }
  /**
   * This method determines which lines can be and are allowed to be rendered using the GPU
   * renderer. Eventually this should trend all lines, except maybe exceptional cases like
   * decorations that use class names.
   */
  canRender(options, viewportData, lineNumber) {
    const data = viewportData.getViewLineRenderingData(lineNumber);
    if (data.containsRTL || data.maxColumn > this.maxGpuCols) {
      return false;
    }
    if (data.inlineDecorations.length > 0) {
      let supported = true;
      for (const decoration of data.inlineDecorations) {
        if (decoration.type !== 0) {
          supported = false;
          break;
        }
        const styleRules = ViewGpuContext_1._decorationCssRuleExtractor.getStyleRules(this.canvas.domNode, decoration.inlineClassName);
        supported &&= styleRules.every((rule) => {
          if (rule.selectorText.includes(":")) {
            return false;
          }
          for (const r of rule.style) {
            if (!supportsCssRule(r, rule.style)) {
              return false;
            }
          }
          return true;
        });
        if (!supported) {
          break;
        }
      }
      return supported;
    }
    return true;
  }
  /**
   * Like {@link canRender} but returns detailed information about why the line cannot be rendered.
   */
  canRenderDetailed(options, viewportData, lineNumber) {
    const data = viewportData.getViewLineRenderingData(lineNumber);
    const reasons = [];
    if (data.containsRTL) {
      reasons.push("containsRTL");
    }
    if (data.maxColumn > this.maxGpuCols) {
      reasons.push("maxColumn > maxGpuCols");
    }
    if (data.inlineDecorations.length > 0) {
      let supported = true;
      const problemTypes = [];
      const problemSelectors = [];
      const problemRules = [];
      for (const decoration of data.inlineDecorations) {
        if (decoration.type !== 0) {
          problemTypes.push(decoration.type);
          supported = false;
          continue;
        }
        const styleRules = ViewGpuContext_1._decorationCssRuleExtractor.getStyleRules(this.canvas.domNode, decoration.inlineClassName);
        supported &&= styleRules.every((rule) => {
          if (rule.selectorText.includes(":")) {
            problemSelectors.push(rule.selectorText);
            return false;
          }
          for (const r of rule.style) {
            if (!supportsCssRule(r, rule.style)) {
              problemRules.push(`${r}: ${rule.style[r]}`);
              return false;
            }
          }
          return true;
        });
        if (!supported) {
          continue;
        }
      }
      if (problemTypes.length > 0) {
        reasons.push(`inlineDecorations with unsupported types (${problemTypes.map((e) => `\`${e}\``).join(", ")})`);
      }
      if (problemRules.length > 0) {
        reasons.push(`inlineDecorations with unsupported CSS rules (${problemRules.map((e) => `\`${e}\``).join(", ")})`);
      }
      if (problemSelectors.length > 0) {
        reasons.push(`inlineDecorations with unsupported CSS selectors (${problemSelectors.map((e) => `\`${e}\``).join(", ")})`);
      }
    }
    return reasons;
  }
};
ViewGpuContext = ViewGpuContext_1 = __decorate([
  __param(1, IInstantiationService),
  __param(2, INotificationService),
  __param(3, IConfigurationService)
], ViewGpuContext);
const gpuSupportedDecorationCssRules = [
  "color",
  "font-weight",
  "opacity"
];
function supportsCssRule(rule, style) {
  if (!gpuSupportedDecorationCssRules.includes(rule)) {
    return false;
  }
  switch (rule) {
    default:
      return true;
  }
}
__name(supportsCssRule, "supportsCssRule");
export {
  ViewGpuContext
};
//# sourceMappingURL=viewGpuContext.js.map
