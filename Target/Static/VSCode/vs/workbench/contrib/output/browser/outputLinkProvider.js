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
import { URI } from "../../../../base/common/uri.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ILink } from "../../../../editor/common/languages.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { OUTPUT_MODE_ID, LOG_MODE_ID } from "../../../services/output/common/output.js";
import { OutputLinkComputer } from "../common/outputLinkComputer.js";
import { IDisposable, dispose, Disposable } from "../../../../base/common/lifecycle.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { createWebWorker } from "../../../../base/browser/webWorkerFactory.js";
import { IWebWorkerClient } from "../../../../base/common/worker/webWorker.js";
import { WorkerTextModelSyncClient } from "../../../../editor/common/services/textModelSync/textModelSync.impl.js";
import { FileAccess } from "../../../../base/common/network.js";
let OutputLinkProvider = class extends Disposable {
  constructor(contextService, modelService, languageFeaturesService) {
    super();
    this.contextService = contextService;
    this.modelService = modelService;
    this.languageFeaturesService = languageFeaturesService;
    this.disposeWorkerScheduler = new RunOnceScheduler(() => this.disposeWorker(), OutputLinkProvider.DISPOSE_WORKER_TIME);
    this.registerListeners();
    this.updateLinkProviderWorker();
  }
  static {
    __name(this, "OutputLinkProvider");
  }
  static DISPOSE_WORKER_TIME = 3 * 60 * 1e3;
  // dispose worker after 3 minutes of inactivity
  worker;
  disposeWorkerScheduler;
  linkProviderRegistration;
  registerListeners() {
    this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.updateLinkProviderWorker()));
  }
  updateLinkProviderWorker() {
    const folders = this.contextService.getWorkspace().folders;
    if (folders.length > 0) {
      if (!this.linkProviderRegistration) {
        this.linkProviderRegistration = this.languageFeaturesService.linkProvider.register([{ language: OUTPUT_MODE_ID, scheme: "*" }, { language: LOG_MODE_ID, scheme: "*" }], {
          provideLinks: /* @__PURE__ */ __name(async (model) => {
            const links = await this.provideLinks(model.uri);
            return links && { links };
          }, "provideLinks")
        });
      }
    } else {
      dispose(this.linkProviderRegistration);
      this.linkProviderRegistration = void 0;
    }
    this.disposeWorker();
    this.disposeWorkerScheduler.cancel();
  }
  getOrCreateWorker() {
    this.disposeWorkerScheduler.schedule();
    if (!this.worker) {
      this.worker = new OutputLinkWorkerClient(this.contextService, this.modelService);
    }
    return this.worker;
  }
  async provideLinks(modelUri) {
    return this.getOrCreateWorker().provideLinks(modelUri);
  }
  disposeWorker() {
    if (this.worker) {
      this.worker.dispose();
      this.worker = void 0;
    }
  }
};
OutputLinkProvider = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageFeaturesService)
], OutputLinkProvider);
let OutputLinkWorkerClient = class extends Disposable {
  constructor(contextService, modelService) {
    super();
    this.contextService = contextService;
    this._workerClient = this._register(createWebWorker(
      FileAccess.asBrowserUri("vs/workbench/contrib/output/common/outputLinkComputerMain.js"),
      "OutputLinkDetectionWorker"
    ));
    this._workerTextModelSyncClient = WorkerTextModelSyncClient.create(this._workerClient, modelService);
    this._initializeBarrier = this._ensureWorkspaceFolders();
  }
  static {
    __name(this, "OutputLinkWorkerClient");
  }
  _workerClient;
  _workerTextModelSyncClient;
  _initializeBarrier;
  async _ensureWorkspaceFolders() {
    await this._workerClient.proxy.$setWorkspaceFolders(this.contextService.getWorkspace().folders.map((folder) => folder.uri.toString()));
  }
  async provideLinks(modelUri) {
    await this._initializeBarrier;
    await this._workerTextModelSyncClient.ensureSyncedResources([modelUri]);
    return this._workerClient.proxy.$computeLinks(modelUri.toString());
  }
};
OutputLinkWorkerClient = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IModelService)
], OutputLinkWorkerClient);
export {
  OutputLinkProvider
};
//# sourceMappingURL=outputLinkProvider.js.map
