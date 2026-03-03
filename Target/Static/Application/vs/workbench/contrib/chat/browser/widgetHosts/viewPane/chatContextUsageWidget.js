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
var ChatContextUsageWidget_1;
import "./media/chatContextUsageWidget.css";
import * as dom from "../../../../../../base/browser/dom.js";
import { EventType, addDisposableListener } from "../../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../../base/common/observable.js";
import { localize } from "../../../../../../nls.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { ChatContextKeys } from "../../../common/actions/chatContextKeys.js";
import { ChatConfiguration } from "../../../common/constants.js";
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
    this.RADIUS = 14;
  }
  constructor() {
    const r = CircularProgressIndicator.RADIUS;
    this.circumference = 2 * Math.PI * r;
    this.domNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.domNode.setAttribute("viewBox", "0 0 36 36");
    this.domNode.classList.add("circular-progress");
    const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bgCircle.setAttribute("cx", String(CircularProgressIndicator.CENTER_X));
    bgCircle.setAttribute("cy", String(CircularProgressIndicator.CENTER_Y));
    bgCircle.setAttribute("r", String(r));
    bgCircle.classList.add("progress-bg");
    this.domNode.appendChild(bgCircle);
    this.progressCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    this.progressCircle.setAttribute("cx", String(CircularProgressIndicator.CENTER_X));
    this.progressCircle.setAttribute("cy", String(CircularProgressIndicator.CENTER_Y));
    this.progressCircle.setAttribute("r", String(r));
    this.progressCircle.classList.add("progress-arc");
    this.progressCircle.setAttribute("stroke-dasharray", String(this.circumference));
    this.progressCircle.setAttribute("stroke-dashoffset", String(this.circumference));
    this.domNode.appendChild(this.progressCircle);
  }
  /**
   * Updates the ring to display the given percentage (0-100).
   * @param percentage The percentage of the ring to fill (clamped to 0-100)
   */
  setProgress(percentage) {
    const clamped = Math.max(0, Math.min(100, percentage));
    const offset = this.circumference - clamped / 100 * this.circumference;
    this.progressCircle.setAttribute("stroke-dashoffset", String(offset));
  }
}
let ChatContextUsageWidget = class ChatContextUsageWidget2 extends Disposable {
  static {
    __name(this, "ChatContextUsageWidget");
  }
  static {
    ChatContextUsageWidget_1 = this;
  }
  get isVisible() {
    return this._isVisible;
  }
  static {
    this._OPENED_STORAGE_KEY = "chat.contextUsage.hasBeenOpened";
  }
  static {
    this._HOVER_ID = "chat.contextUsage";
  }
  constructor(hoverService, instantiationService, languageModelsService, contextKeyService, storageService, configurationService) {
    super();
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    this.languageModelsService = languageModelsService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    this.configurationService = configurationService;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._isVisible = observableValue(this, false);
    this._lastRequestDisposable = this._register(new MutableDisposable());
    this._hoverDisposable = this._register(new MutableDisposable());
    this._contextUsageDetails = this._register(new MutableDisposable());
    this._hoverOptions = {
      id: ChatContextUsageWidget_1._HOVER_ID,
      appearance: { showPointer: true, compact: true },
      persistence: { hideOnHover: false },
      trapFocus: true
    };
    this.domNode = $(".chat-context-usage-widget");
    this.domNode.style.display = "none";
    this.domNode.setAttribute("tabindex", "0");
    this.domNode.setAttribute("role", "button");
    this.domNode.setAttribute("aria-label", localize("contextUsageLabel", "Context window usage"));
    const iconContainer = this.domNode.appendChild($(".icon-container"));
    this.progressIndicator = new CircularProgressIndicator();
    iconContainer.appendChild(this.progressIndicator.domNode);
    this._contextUsageOpenedKey = ChatContextKeys.contextUsageHasBeenOpened.bindTo(this.contextKeyService);
    if (this.storageService.getBoolean(ChatContextUsageWidget_1._OPENED_STORAGE_KEY, 1, false)) {
      this._contextUsageOpenedKey.set(true);
    }
    this._enabled = this.configurationService.getValue(ChatConfiguration.ChatContextUsageEnabled) !== false;
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ChatConfiguration.ChatContextUsageEnabled)) {
        this._enabled = this.configurationService.getValue(ChatConfiguration.ChatContextUsageEnabled) !== false;
        if (!this._enabled) {
          this.hide();
        } else if (this.currentData) {
          this.show();
        }
      }
    }));
    this.setupHover();
  }
  /**
   * Shows the sticky context usage details hover and records that the user
   * has opened it. Returns `true` if the details were shown.
   */
  showDetails() {
    const details = this._createDetails();
    if (!details) {
      return false;
    }
    this.hoverService.showInstantHover({ ...this._hoverOptions, content: details.domNode, target: this.domNode, persistence: { hideOnHover: false, sticky: true } }, true);
    this._markOpened();
    return true;
  }
  _createDetails() {
    if (!this._isVisible.get() || !this.currentData) {
      return void 0;
    }
    if (!this._contextUsageDetails.value) {
      this._contextUsageDetails.value = this.instantiationService.createInstance(ChatContextUsageDetails);
    }
    this._contextUsageDetails.value.update(this.currentData);
    return this._contextUsageDetails.value;
  }
  _markOpened() {
    this._contextUsageOpenedKey.set(true);
    this.storageService.store(
      ChatContextUsageWidget_1._OPENED_STORAGE_KEY,
      true,
      1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  setupHover() {
    this._hoverDisposable.clear();
    const store = new DisposableStore();
    this._hoverDisposable.value = store;
    store.add(this.hoverService.setupDelayedHover(this.domNode, () => ({
      ...this._hoverOptions,
      content: this._createDetails()?.domNode ?? ""
    })));
    store.add(addDisposableListener(this.domNode, EventType.CLICK, (e) => {
      e.stopPropagation();
      this.showDetails();
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
        this.showDetails();
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
    if (!lastRequest) {
      this.currentData = void 0;
      this.hide();
      return;
    }
    if (!lastRequest.response || !lastRequest.modelId) {
      if (!this.currentData) {
        this.hide();
      }
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
    const maxOutputTokens = modelMetadata?.maxOutputTokens;
    if (!usage || !maxInputTokens || maxInputTokens <= 0 || !maxOutputTokens || maxOutputTokens <= 0) {
      if (!this.currentData) {
        this.hide();
      }
      return;
    }
    const promptTokens = usage.promptTokens;
    const promptTokenDetails = usage.promptTokenDetails;
    const totalContextWindow = maxInputTokens + maxOutputTokens;
    const usedTokens = promptTokens + maxOutputTokens;
    const percentage = Math.min(100, usedTokens / totalContextWindow * 100);
    this.render(percentage, usedTokens, totalContextWindow, promptTokenDetails);
    this.show();
  }
  render(percentage, usedTokens, totalContextWindow, promptTokenDetails) {
    this.currentData = { usedTokens, totalContextWindow, percentage, promptTokenDetails };
    this.progressIndicator.setProgress(percentage);
    this.domNode.classList.remove("warning", "error");
    if (percentage >= 90) {
      this.domNode.classList.add("error");
    } else if (percentage >= 75) {
      this.domNode.classList.add("warning");
    }
  }
  show() {
    if (!this._enabled) {
      return;
    }
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
ChatContextUsageWidget = ChatContextUsageWidget_1 = __decorate([
  __param(0, IHoverService),
  __param(1, IInstantiationService),
  __param(2, ILanguageModelsService),
  __param(3, IContextKeyService),
  __param(4, IStorageService),
  __param(5, IConfigurationService)
], ChatContextUsageWidget);
export {
  ChatContextUsageWidget,
  CircularProgressIndicator
};
//# sourceMappingURL=chatContextUsageWidget.js.map
