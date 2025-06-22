var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise, raceCancellation } from "../../../../base/common/async.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { AiSettingsSearchResultKind, IAiSettingsSearchService } from "./aiSettingsSearch.js";
class AiSettingsSearchService extends Disposable {
  static {
    __name(this, "AiSettingsSearchService");
  }
  constructor() {
    super(...arguments);
    this._providers = [];
    this._llmRankedResultsPromises = /* @__PURE__ */ new Map();
    this._embeddingsResultsPromises = /* @__PURE__ */ new Map();
    this._onProviderRegistered = this._register(new Emitter());
    this.onProviderRegistered = this._onProviderRegistered.event;
  }
  static {
    this.MAX_PICKS = 5;
  }
  isEnabled() {
    return this._providers.length > 0;
  }
  registerSettingsSearchProvider(provider) {
    this._providers.push(provider);
    this._onProviderRegistered.fire();
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const index = this._providers.indexOf(provider);
        if (index !== -1) {
          this._providers.splice(index, 1);
        }
      }, "dispose")
    };
  }
  startSearch(query, embeddingsOnly, token) {
    if (!this.isEnabled()) {
      throw new Error("No settings search providers registered");
    }
    this._embeddingsResultsPromises.delete(query);
    this._llmRankedResultsPromises.delete(query);
    this._providers.forEach((provider) => provider.searchSettings(query, { limit: AiSettingsSearchService.MAX_PICKS, embeddingsOnly }, token));
  }
  async getEmbeddingsResults(query, token) {
    if (!this.isEnabled()) {
      throw new Error("No settings search providers registered");
    }
    const existingPromise = this._embeddingsResultsPromises.get(query);
    if (existingPromise) {
      const result2 = await existingPromise.p;
      return result2 ?? null;
    }
    const promise = new DeferredPromise();
    this._embeddingsResultsPromises.set(query, promise);
    const result = await raceCancellation(promise.p, token);
    return result ?? null;
  }
  async getLLMRankedResults(query, token) {
    if (!this.isEnabled()) {
      throw new Error("No settings search providers registered");
    }
    const existingPromise = this._llmRankedResultsPromises.get(query);
    if (existingPromise) {
      const result2 = await existingPromise.p;
      return result2 ?? null;
    }
    const promise = new DeferredPromise();
    this._llmRankedResultsPromises.set(query, promise);
    const result = await raceCancellation(promise.p, token);
    return result ?? null;
  }
  handleSearchResult(result) {
    if (!this.isEnabled()) {
      return;
    }
    if (result.kind === AiSettingsSearchResultKind.EMBEDDED) {
      const promise = this._embeddingsResultsPromises.get(result.query);
      if (promise) {
        promise.complete(result.settings);
      } else {
        const parkedPromise = new DeferredPromise();
        parkedPromise.complete(result.settings);
        this._embeddingsResultsPromises.set(result.query, parkedPromise);
      }
    } else if (result.kind === AiSettingsSearchResultKind.LLM_RANKED) {
      const promise = this._llmRankedResultsPromises.get(result.query);
      if (promise) {
        promise.complete(result.settings);
      } else {
        const parkedPromise = new DeferredPromise();
        parkedPromise.complete(result.settings);
        this._llmRankedResultsPromises.set(result.query, parkedPromise);
      }
    }
  }
}
registerSingleton(
  IAiSettingsSearchService,
  AiSettingsSearchService,
  1
  /* InstantiationType.Delayed */
);
export {
  AiSettingsSearchService
};
//# sourceMappingURL=aiSettingsSearchService.js.map
