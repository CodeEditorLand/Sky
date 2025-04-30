var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise, raceCancellation } from "../../../../base/common/async.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { AiSettingsSearchResultKind, IAiSettingsSearchService } from "./aiSettingsSearch.js";
class AiSettingsSearchService {
  static {
    __name(this, "AiSettingsSearchService");
  }
  constructor() {
    this._providers = [];
    this._llmRankedResultsPromises = /* @__PURE__ */ new Map();
    this._embeddingsResultsPromises = /* @__PURE__ */ new Map();
  }
  static {
    this.MAX_PICKS = 5;
  }
  isEnabled() {
    return this._providers.length > 0;
  }
  registerSettingsSearchProvider(provider) {
    this._providers.push(provider);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const index = this._providers.indexOf(provider);
        if (index !== -1) {
          this._providers.splice(index, 1);
        }
      }, "dispose")
    };
  }
  startSearch(query, token) {
    if (!this.isEnabled()) {
      throw new Error("No settings search providers registered");
    }
    this._providers.forEach((provider) => provider.searchSettings(query, { limit: AiSettingsSearchService.MAX_PICKS }, token));
  }
  async getEmbeddingsResults(query, token) {
    if (!this.isEnabled()) {
      throw new Error("No settings search providers registered");
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
        this._embeddingsResultsPromises.delete(result.query);
      }
    } else if (result.kind === AiSettingsSearchResultKind.LLM_RANKED) {
      const promise = this._llmRankedResultsPromises.get(result.query);
      if (promise) {
        promise.complete(result.settings);
        this._llmRankedResultsPromises.delete(result.query);
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
