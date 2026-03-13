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
var ThreadedBackgroundTokenizerFactory_1;
import { canASAR } from "../../../../../amdX.js";
import { DisposableStore, toDisposable } from "../../../../../base/common/lifecycle.js";
import { FileAccess, nodeModulesAsarPath, nodeModulesPath } from "../../../../../base/common/network.js";
import { isWeb } from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { IExtensionResourceLoaderService } from "../../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { TextMateWorkerHost } from "./worker/textMateWorkerHost.js";
import { TextMateWorkerTokenizerController } from "./textMateWorkerTokenizerController.js";
import { WebWorkerDescriptor } from "../../../../../platform/webWorker/browser/webWorkerDescriptor.js";
import { IWebWorkerService } from "../../../../../platform/webWorker/browser/webWorkerService.js";
let ThreadedBackgroundTokenizerFactory = class ThreadedBackgroundTokenizerFactory2 {
  static {
    __name(this, "ThreadedBackgroundTokenizerFactory");
  }
  static {
    ThreadedBackgroundTokenizerFactory_1 = this;
  }
  static {
    this._reportedMismatchingTokens = false;
  }
  constructor(_reportTokenizationTime, _shouldTokenizeAsync, _extensionResourceLoaderService, _configurationService, _languageService, _environmentService, _notificationService, _telemetryService, _webWorkerService) {
    this._reportTokenizationTime = _reportTokenizationTime;
    this._shouldTokenizeAsync = _shouldTokenizeAsync;
    this._extensionResourceLoaderService = _extensionResourceLoaderService;
    this._configurationService = _configurationService;
    this._languageService = _languageService;
    this._environmentService = _environmentService;
    this._notificationService = _notificationService;
    this._telemetryService = _telemetryService;
    this._webWorkerService = _webWorkerService;
    this._workerProxyPromise = null;
    this._worker = null;
    this._workerProxy = null;
    this._workerTokenizerControllers = /* @__PURE__ */ new Map();
    this._currentTheme = null;
    this._currentTokenColorMap = null;
    this._grammarDefinitions = [];
  }
  dispose() {
    this._disposeWorker();
  }
  // Will be recreated after worker is disposed (because tokenizer is re-registered when languages change)
  createBackgroundTokenizer(textModel, tokenStore, maxTokenizationLineLength) {
    if (!this._shouldTokenizeAsync() || textModel.isTooLargeForSyncing()) {
      return void 0;
    }
    const store = new DisposableStore();
    const controllerContainer = this._getWorkerProxy().then((workerProxy) => {
      if (store.isDisposed || !workerProxy) {
        return void 0;
      }
      const controllerContainer2 = { controller: void 0, worker: this._worker };
      store.add(keepAliveWhenAttached(textModel, () => {
        const controller = new TextMateWorkerTokenizerController(textModel, workerProxy, this._languageService.languageIdCodec, tokenStore, this._configurationService, maxTokenizationLineLength);
        controllerContainer2.controller = controller;
        this._workerTokenizerControllers.set(controller.controllerId, controller);
        return toDisposable(() => {
          controllerContainer2.controller = void 0;
          this._workerTokenizerControllers.delete(controller.controllerId);
          controller.dispose();
        });
      }));
      return controllerContainer2;
    });
    return {
      dispose() {
        store.dispose();
      },
      requestTokens: /* @__PURE__ */ __name(async (startLineNumber, endLineNumberExclusive) => {
        const container = await controllerContainer;
        if (container?.controller && container.worker === this._worker) {
          container.controller.requestTokens(startLineNumber, endLineNumberExclusive);
        }
      }, "requestTokens"),
      reportMismatchingTokens: /* @__PURE__ */ __name((lineNumber) => {
        if (ThreadedBackgroundTokenizerFactory_1._reportedMismatchingTokens) {
          return;
        }
        ThreadedBackgroundTokenizerFactory_1._reportedMismatchingTokens = true;
        this._notificationService.error({
          message: "Async Tokenization Token Mismatch in line " + lineNumber,
          name: "Async Tokenization Token Mismatch"
        });
        this._telemetryService.publicLog2("asyncTokenizationMismatchingTokens", {});
      }, "reportMismatchingTokens")
    };
  }
  setGrammarDefinitions(grammarDefinitions) {
    this._grammarDefinitions = grammarDefinitions;
    this._disposeWorker();
  }
  acceptTheme(theme, colorMap) {
    this._currentTheme = theme;
    this._currentTokenColorMap = colorMap;
    if (this._currentTheme && this._currentTokenColorMap && this._workerProxy) {
      this._workerProxy.$acceptTheme(this._currentTheme, this._currentTokenColorMap);
    }
  }
  _getWorkerProxy() {
    if (!this._workerProxyPromise) {
      this._workerProxyPromise = this._createWorkerProxy();
    }
    return this._workerProxyPromise;
  }
  async _createWorkerProxy() {
    const onigurumaModuleLocation = `${nodeModulesPath}/vscode-oniguruma`;
    const onigurumaModuleLocationAsar = `${nodeModulesAsarPath}/vscode-oniguruma`;
    const useAsar = canASAR && this._environmentService.isBuilt && !isWeb;
    const onigurumaLocation = useAsar ? onigurumaModuleLocationAsar : onigurumaModuleLocation;
    const onigurumaWASM = `${onigurumaLocation}/release/onig.wasm`;
    const createData = {
      grammarDefinitions: this._grammarDefinitions,
      onigurumaWASMUri: FileAccess.asBrowserUri(onigurumaWASM).toString(true)
    };
    const worker = this._worker = this._webWorkerService.createWorkerClient(new WebWorkerDescriptor({
      esmModuleLocation: FileAccess.asBrowserUri("vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js"),
      label: "TextMateWorker"
    }));
    TextMateWorkerHost.setChannel(worker, {
      $readFile: /* @__PURE__ */ __name(async (_resource) => {
        const resource = URI.revive(_resource);
        return this._extensionResourceLoaderService.readExtensionResource(resource);
      }, "$readFile"),
      $setTokensAndStates: /* @__PURE__ */ __name(async (controllerId, versionId, tokens, fontTokens, lineEndStateDeltas) => {
        const controller = this._workerTokenizerControllers.get(controllerId);
        if (controller) {
          controller.setTokensAndStates(controllerId, versionId, tokens, fontTokens, lineEndStateDeltas);
        }
      }, "$setTokensAndStates"),
      $reportTokenizationTime: /* @__PURE__ */ __name((timeMs, languageId, sourceExtensionId, lineLength, isRandomSample) => {
        this._reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, isRandomSample);
      }, "$reportTokenizationTime")
    });
    await worker.proxy.$init(createData);
    if (this._worker !== worker) {
      return null;
    }
    this._workerProxy = worker.proxy;
    if (this._currentTheme && this._currentTokenColorMap) {
      this._workerProxy.$acceptTheme(this._currentTheme, this._currentTokenColorMap);
    }
    return worker.proxy;
  }
  _disposeWorker() {
    for (const controller of this._workerTokenizerControllers.values()) {
      controller.dispose();
    }
    this._workerTokenizerControllers.clear();
    if (this._worker) {
      this._worker.dispose();
      this._worker = null;
    }
    this._workerProxy = null;
    this._workerProxyPromise = null;
  }
};
ThreadedBackgroundTokenizerFactory = ThreadedBackgroundTokenizerFactory_1 = __decorate([
  __param(2, IExtensionResourceLoaderService),
  __param(3, IConfigurationService),
  __param(4, ILanguageService),
  __param(5, IEnvironmentService),
  __param(6, INotificationService),
  __param(7, ITelemetryService),
  __param(8, IWebWorkerService)
], ThreadedBackgroundTokenizerFactory);
function keepAliveWhenAttached(textModel, factory) {
  const disposableStore = new DisposableStore();
  const subStore = disposableStore.add(new DisposableStore());
  function checkAttached() {
    if (textModel.isAttachedToEditor()) {
      subStore.add(factory());
    } else {
      subStore.clear();
    }
  }
  __name(checkAttached, "checkAttached");
  checkAttached();
  disposableStore.add(textModel.onDidChangeAttached(() => {
    checkAttached();
  }));
  return disposableStore;
}
__name(keepAliveWhenAttached, "keepAliveWhenAttached");
export {
  ThreadedBackgroundTokenizerFactory
};
//# sourceMappingURL=threadedBackgroundTokenizerFactory.js.map
