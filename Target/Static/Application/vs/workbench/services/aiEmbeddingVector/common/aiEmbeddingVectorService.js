var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { createCancelablePromise, raceCancellablePromises, timeout } from "../../../../base/common/async.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { ILogService } from "../../../../platform/log/common/log.js";
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
var AiEmbeddingVectorService_1;
const IAiEmbeddingVectorService = createDecorator("IAiEmbeddingVectorService");
let AiEmbeddingVectorService = class AiEmbeddingVectorService2 {
  static {
    __name(this, "AiEmbeddingVectorService");
  }
  static {
    AiEmbeddingVectorService_1 = this;
  }
  static {
    this.DEFAULT_TIMEOUT = 1e3 * 10;
  }
  // 10 seconds
  constructor(logService) {
    this.logService = logService;
    this._providers = [];
  }
  isEnabled() {
    return this._providers.length > 0;
  }
  registerAiEmbeddingVectorProvider(model, provider) {
    this._providers.push(provider);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const index = this._providers.indexOf(provider);
        if (index >= 0) {
          this._providers.splice(index, 1);
        }
      }, "dispose")
    };
  }
  async getEmbeddingVector(strings, token) {
    if (this._providers.length === 0) {
      throw new Error("No embedding vector providers registered");
    }
    const stopwatch = StopWatch.create();
    const cancellablePromises = [];
    const timer = timeout(AiEmbeddingVectorService_1.DEFAULT_TIMEOUT);
    const disposable = token.onCancellationRequested(() => {
      disposable.dispose();
      timer.cancel();
    });
    for (const provider of this._providers) {
      cancellablePromises.push(createCancelablePromise(async (t) => {
        try {
          return await provider.provideAiEmbeddingVector(Array.isArray(strings) ? strings : [strings], t);
        } catch (e) {
        }
        await timer;
        throw new Error("Embedding vector provider timed out");
      }));
    }
    cancellablePromises.push(createCancelablePromise(async (t) => {
      const disposable2 = t.onCancellationRequested(() => {
        timer.cancel();
        disposable2.dispose();
      });
      await timer;
      throw new Error("Embedding vector provider timed out");
    }));
    try {
      const result = await raceCancellablePromises(cancellablePromises);
      if (result.length === 1) {
        return result[0];
      }
      return result;
    } finally {
      stopwatch.stop();
      this.logService.trace(`[AiEmbeddingVectorService]: getEmbeddingVector took ${stopwatch.elapsed()}ms`);
    }
  }
};
AiEmbeddingVectorService = AiEmbeddingVectorService_1 = __decorate([
  __param(0, ILogService)
], AiEmbeddingVectorService);
registerSingleton(
  IAiEmbeddingVectorService,
  AiEmbeddingVectorService,
  1
  /* InstantiationType.Delayed */
);
export {
  AiEmbeddingVectorService,
  IAiEmbeddingVectorService
};
//# sourceMappingURL=aiEmbeddingVectorService.js.map
