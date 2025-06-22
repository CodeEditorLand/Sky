var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createCancelablePromise, raceTimeout } from "../../../../base/common/async.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IAiRelatedInformationService } from "./aiRelatedInformation.js";
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
var AiRelatedInformationService_1;
let AiRelatedInformationService = class AiRelatedInformationService2 {
  static {
    __name(this, "AiRelatedInformationService");
  }
  static {
    AiRelatedInformationService_1 = this;
  }
  static {
    this.DEFAULT_TIMEOUT = 1e3 * 10;
  }
  // 10 seconds
  constructor(logService) {
    this.logService = logService;
    this._providers = /* @__PURE__ */ new Map();
  }
  isEnabled() {
    return this._providers.size > 0;
  }
  registerAiRelatedInformationProvider(type, provider) {
    const providers = this._providers.get(type) ?? [];
    providers.push(provider);
    this._providers.set(type, providers);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const providers2 = this._providers.get(type) ?? [];
        const index = providers2.indexOf(provider);
        if (index !== -1) {
          providers2.splice(index, 1);
        }
        if (providers2.length === 0) {
          this._providers.delete(type);
        }
      }, "dispose")
    };
  }
  async getRelatedInformation(query, types, token) {
    if (this._providers.size === 0) {
      throw new Error("No related information providers registered");
    }
    const providers = [];
    for (const type of types) {
      const typeProviders = this._providers.get(type);
      if (typeProviders) {
        providers.push(...typeProviders);
      }
    }
    if (providers.length === 0) {
      throw new Error("No related information providers registered for the given types");
    }
    const stopwatch = StopWatch.create();
    const cancellablePromises = providers.map((provider) => {
      return createCancelablePromise(async (t) => {
        try {
          const result = await provider.provideAiRelatedInformation(query, t);
          return result.filter((r) => types.includes(r.type));
        } catch (e) {
        }
        return [];
      });
    });
    try {
      const results = await raceTimeout(Promise.allSettled(cancellablePromises), AiRelatedInformationService_1.DEFAULT_TIMEOUT, () => {
        cancellablePromises.forEach((p) => p.cancel());
        this.logService.warn("[AiRelatedInformationService]: Related information provider timed out");
      });
      if (!results) {
        return [];
      }
      const result = results.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);
      return result;
    } finally {
      stopwatch.stop();
      this.logService.trace(`[AiRelatedInformationService]: getRelatedInformation took ${stopwatch.elapsed()}ms`);
    }
  }
};
AiRelatedInformationService = AiRelatedInformationService_1 = __decorate([
  __param(0, ILogService)
], AiRelatedInformationService);
registerSingleton(
  IAiRelatedInformationService,
  AiRelatedInformationService,
  1
  /* InstantiationType.Delayed */
);
export {
  AiRelatedInformationService
};
//# sourceMappingURL=aiRelatedInformationService.js.map
