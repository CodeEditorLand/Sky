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
import "./media/chatContextUsageWidget.css";
import * as dom from "../../../../../../base/browser/dom.js";
import { EventType, addDisposableListener } from "../../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../../base/common/observable.js";
import { localize } from "../../../../../../nls.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ILanguageModelsService } from "../../../common/languageModels.js";
import { ChatContextUsageDetails } from "./chatContextUsageDetails.js";
import { StandardKeyboardEvent } from "../../../../../../base/browser/keyboardEvent.js";
const $ = dom.$;
class CircularProgressIndicator {
  static {
    __name(this, "CircularProgressIndicator");
  }
  static {
    this.CENTER_X = 18;
  }
  static {
    this.CENTER_Y = 18;
  }
  static {
    this.RADIUS = 16;
  }
  constructor() {
    this.domNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.domNode.setAttribute("viewBox", "0 0 36 36");
    this.domNode.classList.add("circular-progress");
    const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bgCircle.setAttribute("cx", String(CircularProgressIndicator.CENTER_X));
    bgCircle.setAttribute("cy", String(CircularProgressIndicator.CENTER_Y));
    bgCircle.setAttribute("r", String(CircularProgressIndicator.RADIUS));
    bgCircle.classList.add("progress-bg");
    this.domNode.appendChild(bgCircle);
    this.progressPie = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.progressPie.classList.add("progress-pie");
    this.domNode.appendChild(this.progressPie);
  }
  /**
   * Updates the pie chart to display the given percentage (0-100).
   * @param percentage The percentage of the pie to fill (clamped to 0-100)
   */
  setProgress(percentage) {
    const cx = CircularProgressIndicator.CENTER_X;
    const cy = CircularProgressIndicator.CENTER_Y;
    const r = CircularProgressIndicator.RADIUS;
    if (percentage >= 100) {
      this.progressPie.setAttribute("d", `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 1e-3} ${cy - r} Z`);
    } else if (percentage <= 0) {
      this.progressPie.setAttribute("d", "");
    } else {
      const angle = percentage / 100 * 360;
      const radians = (angle - 90) * (Math.PI / 180);
      const x = cx + r * Math.cos(radians);
      const y = cy + r * Math.sin(radians);
      const largeArcFlag = angle > 180 ? 1 : 0;
      const d = [
        `M ${cx} ${cy}`,
        // Move to center
        `L ${cx} ${cy - r}`,
        // Line to top
        `A ${r} ${r} 0 ${largeArcFlag} 1 ${x} ${y}`,
        // Arc to endpoint
        "Z"
        // Close path back to center
      ].join(" ");
      this.progressPie.setAttribute("d", d);
    }
  }
}
let ChatContextUsageWidget = class ChatContextUsageWidget2 extends Disposable {
  static {
    __name(this, "ChatContextUsageWidget");
  }
  get isVisible() {
    return this._isVisible;
  }
  constructor(hoverService, instantiationService, languageModelsService) {
    super();
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    this.languageModelsService = languageModelsService;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._isVisible = observableValue(this, false);
    this._lastRequestDisposable = this._register(new MutableDisposable());
    this._hoverDisposable = this._register(new MutableDisposable());
    this._contextUsageDetails = this._register(new MutableDisposable());
    this.domNode = $(".chat-context-usage-widget");
    this.domNode.style.display = "none";
    this.domNode.setAttribute("tabindex", "0");
    this.domNode.setAttribute("role", "button");
    this.domNode.setAttribute("aria-label", localize("contextUsageLabel", "Context window usage"));
    const iconContainer = this.domNode.appendChild($(".icon-container"));
    this.progressIndicator = new CircularProgressIndicator();
    iconContainer.appendChild(this.progressIndicator.domNode);
    this.setupHover();
  }
  setupHover() {
    this._hoverDisposable.clear();
    const store = new DisposableStore();
    this._hoverDisposable.value = store;
    const createDetails = /* @__PURE__ */ __name(() => {
      if (!this._isVisible.get() || !this.currentData) {
        return void 0;
      }
      this._contextUsageDetails.value = this.instantiationService.createInstance(ChatContextUsageDetails);
      this._contextUsageDetails.value.update(this.currentData);
      return this._contextUsageDetails.value;
    }, "createDetails");
    const hoverOptions = {
      appearance: { showPointer: true, compact: true },
      persistence: { hideOnHover: false },
      trapFocus: true
    };
    store.add(this.hoverService.setupDelayedHover(this.domNode, () => ({
      ...hoverOptions,
      content: createDetails()?.domNode ?? ""
    })));
    const showStickyHover = /* @__PURE__ */ __name(() => {
      const details = createDetails();
      if (details) {
        this.hoverService.showInstantHover({ ...hoverOptions, content: details.domNode, target: this.domNode, persistence: { hideOnHover: false, sticky: true } }, true);
      }
    }, "showStickyHover");
    store.add(addDisposableListener(this.domNode, EventType.CLICK, (e) => {
      e.stopPropagation();
      showStickyHover();
    }));
    store.add(addDisposableListener(this.domNode, EventType.KEY_DOWN, (e) => {
      const evt = new StandardKeyboardEvent(e);
      if (evt.equals(
        10
        /* KeyCode.Space */
      ) || evt.equals(
        3
        /* KeyCode.Enter */
      )) {
        e.preventDefault();
        showStickyHover();
      }
    }));
  }
  /**
   * Updates the widget with the latest request/response data.
   * The model is retrieved from the request's modelId.
   * @param lastRequest The last request in the session
   */
  update(lastRequest) {
    this._lastRequestDisposable.clear();
    if (!lastRequest?.response || !lastRequest.modelId) {
      this.hide();
      return;
    }
    const response = lastRequest.response;
    const modelId = lastRequest.modelId;
    this.updateFromResponse(response, modelId);
    this._lastRequestDisposable.value = response.onDidChange(() => {
      this.updateFromResponse(response, modelId);
    });
  }
  updateFromResponse(response, modelId) {
    const usage = response.usage;
    const modelMetadata = this.languageModelsService.lookupLanguageModel(modelId);
    const maxInputTokens = modelMetadata?.maxInputTokens;
    if (!usage || !maxInputTokens || maxInputTokens <= 0) {
      this.hide();
      return;
    }
    const promptTokens = usage.promptTokens;
    const promptTokenDetails = usage.promptTokenDetails;
    const percentage = Math.min(100, promptTokens / maxInputTokens * 100);
    this.render(percentage, promptTokens, maxInputTokens, promptTokenDetails);
    this.show();
  }
  render(percentage, promptTokens, maxTokens, promptTokenDetails) {
    this.currentData = { promptTokens, maxInputTokens: maxTokens, percentage, promptTokenDetails };
    this.progressIndicator.setProgress(percentage);
    this.domNode.classList.remove("warning", "error");
    if (percentage >= 90) {
      this.domNode.classList.add("error");
    } else if (percentage >= 75) {
      this.domNode.classList.add("warning");
    }
  }
  show() {
    if (this.domNode.style.display === "none") {
      this.domNode.style.display = "";
      this._isVisible.set(true, void 0);
      this._onDidChangeVisibility.fire();
    }
  }
  hide() {
    if (this.domNode.style.display !== "none") {
      this.domNode.style.display = "none";
      this._isVisible.set(false, void 0);
      this._onDidChangeVisibility.fire();
    }
  }
};
ChatContextUsageWidget = __decorate([
  __param(0, IHoverService),
  __param(1, IInstantiationService),
  __param(2, ILanguageModelsService)
], ChatContextUsageWidget);
export {
  ChatContextUsageWidget,
  CircularProgressIndicator
};
//# sourceMappingURL=chatContextUsageWidget.js.map
