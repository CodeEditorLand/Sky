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
import { canASAR } from "../../../../../amdX.js";
import { DisposableStore, IDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { AppResourcePath, FileAccess, nodeModulesAsarPath, nodeModulesPath } from "../../../../../base/common/network.js";
import { IObservable } from "../../../../../base/common/observable.js";
import { isWeb } from "../../../../../base/common/platform.js";
import { URI, UriComponents } from "../../../../../base/common/uri.js";
import { IBackgroundTokenizationStore, IBackgroundTokenizer } from "../../../../../editor/common/languages.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { IExtensionResourceLoaderService } from "../../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { ICreateData, StateDeltas, TextMateTokenizationWorker } from "./worker/textMateTokenizationWorker.worker.js";
import { TextMateWorkerHost } from "./worker/textMateWorkerHost.js";
import { TextMateWorkerTokenizerController } from "./textMateWorkerTokenizerController.js";
import { IValidGrammarDefinition } from "../../common/TMScopeRegistry.js";
import { createWebWorker } from "../../../../../base/browser/webWorkerFactory.js";
import { IWebWorkerClient, Proxied } from "../../../../../base/common/worker/webWorker.js";
let ThreadedBackgroundTokenizerFactory = class {
  constructor(_reportTokenizationTime, _shouldTokenizeAsync, _extensionResourceLoaderService, _configurationService, _languageService, _environmentService, _notificationService, _telemetryService) {
    this._reportTokenizationTime = _reportTokenizationTime;
    this._shouldTokenizeAsync = _shouldTokenizeAsync;
    this._extensionResourceLoaderService = _extensionResourceLoaderService;
    this._configurationService = _configurationService;
    this._languageService = _languageService;
    this._environmentService = _environmentService;
    this._notificationService = _notificationService;
    this._telemetryService = _telemetryService;
  }
  static {
    __name(this, "ThreadedBackgroundTokenizerFactory");
  }
  static _reportedMismatchingTokens = false;
  _workerProxyPromise = null;
  _worker = null;
  _workerProxy = null;
  _workerTokenizerControllers = /* @__PURE__ */ new Map();
  _currentTheme = null;
  _currentTokenColorMap = null;
  _grammarDefinitions = [];
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
        if (ThreadedBackgroundTokenizerFactory._reportedMismatchingTokens) {
          return;
        }
        ThreadedBackgroundTokenizerFactory._reportedMismatchingTokens = true;
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
    const worker = this._worker = createWebWorker(
      FileAccess.asBrowserUri("vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js"),
      "TextMateWorker"
    );
    TextMateWorkerHost.setChannel(worker, {
      $readFile: /* @__PURE__ */ __name(async (_resource) => {
        const resource = URI.revive(_resource);
        return this._extensionResourceLoaderService.readExtensionResource(resource);
      }, "$readFile"),
      $setTokensAndStates: /* @__PURE__ */ __name(async (controllerId, versionId, tokens, lineEndStateDeltas) => {
        const controller = this._workerTokenizerControllers.get(controllerId);
        if (controller) {
          controller.setTokensAndStates(controllerId, versionId, tokens, lineEndStateDeltas);
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
ThreadedBackgroundTokenizerFactory = __decorateClass([
  __decorateParam(2, IExtensionResourceLoaderService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILanguageService),
  __decorateParam(5, IEnvironmentService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, ITelemetryService)
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
