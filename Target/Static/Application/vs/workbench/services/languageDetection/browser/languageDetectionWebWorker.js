var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { importAMDNodeModule } from "../../../../amdX.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { LanguageDetectionWorkerHost } from "./languageDetectionWorker.protocol.js";
import { WorkerTextModelSyncServer } from "../../../../editor/common/services/textModelSync/textModelSync.impl.js";
function create(workerServer) {
  return new LanguageDetectionWorker(workerServer);
}
__name(create, "create");
class LanguageDetectionWorker {
  static {
    __name(this, "LanguageDetectionWorker");
  }
  static {
    this.expectedRelativeConfidence = 0.2;
  }
  static {
    this.positiveConfidenceCorrectionBucket1 = 0.05;
  }
  static {
    this.positiveConfidenceCorrectionBucket2 = 0.025;
  }
  static {
    this.negativeConfidenceCorrection = 0.5;
  }
  constructor(workerServer) {
    this._requestHandlerBrand = void 0;
    this._workerTextModelSyncServer = new WorkerTextModelSyncServer();
    this._regexpLoadFailed = false;
    this._loadFailed = false;
    this.modelIdToCoreId = /* @__PURE__ */ new Map();
    this._host = LanguageDetectionWorkerHost.getChannel(workerServer);
    this._workerTextModelSyncServer.bindToServer(workerServer);
  }
  async $detectLanguage(uri, langBiases, preferHistory, supportedLangs) {
    const languages = [];
    const confidences = [];
    const stopWatch = new StopWatch();
    const documentTextSample = this.getTextForDetection(uri);
    if (!documentTextSample) {
      return;
    }
    const neuralResolver = /* @__PURE__ */ __name(async () => {
      for await (const language of this.detectLanguagesImpl(documentTextSample)) {
        if (!this.modelIdToCoreId.has(language.languageId)) {
          this.modelIdToCoreId.set(language.languageId, await this._host.$getLanguageId(language.languageId));
        }
        const coreId = this.modelIdToCoreId.get(language.languageId);
        if (coreId && (!supportedLangs?.length || supportedLangs.includes(coreId))) {
          languages.push(coreId);
          confidences.push(language.confidence);
        }
      }
      stopWatch.stop();
      if (languages.length) {
        this._host.$sendTelemetryEvent(languages, confidences, stopWatch.elapsed());
        return languages[0];
      }
      return void 0;
    }, "neuralResolver");
    const historicalResolver = /* @__PURE__ */ __name(async () => this.runRegexpModel(documentTextSample, langBiases ?? {}, supportedLangs), "historicalResolver");
    if (preferHistory) {
      const history = await historicalResolver();
      if (history) {
        return history;
      }
      const neural = await neuralResolver();
      if (neural) {
        return neural;
      }
    } else {
      const neural = await neuralResolver();
      if (neural) {
        return neural;
      }
      const history = await historicalResolver();
      if (history) {
        return history;
      }
    }
    return void 0;
  }
  getTextForDetection(uri) {
    const editorModel = this._workerTextModelSyncServer.getModel(uri);
    if (!editorModel) {
      return;
    }
    const end = editorModel.positionAt(1e4);
    const content = editorModel.getValueInRange({
      startColumn: 1,
      startLineNumber: 1,
      endColumn: end.column,
      endLineNumber: end.lineNumber
    });
    return content;
  }
  async getRegexpModel() {
    if (this._regexpLoadFailed) {
      return;
    }
    if (this._regexpModel) {
      return this._regexpModel;
    }
    const uri = await this._host.$getRegexpModelUri();
    try {
      this._regexpModel = await importAMDNodeModule(uri, "");
      return this._regexpModel;
    } catch (e) {
      this._regexpLoadFailed = true;
      return;
    }
  }
  async runRegexpModel(content, langBiases, supportedLangs) {
    const regexpModel = await this.getRegexpModel();
    if (!regexpModel) {
      return;
    }
    if (supportedLangs?.length) {
      for (const lang of Object.keys(langBiases)) {
        if (supportedLangs.includes(lang)) {
          langBiases[lang] = 1;
        } else {
          langBiases[lang] = 0;
        }
      }
    }
    const detected = regexpModel.detect(content, langBiases, supportedLangs);
    return detected;
  }
  async getModelOperations() {
    if (this._modelOperations) {
      return this._modelOperations;
    }
    const uri = await this._host.$getIndexJsUri();
    const { ModelOperations } = await importAMDNodeModule(uri, "");
    this._modelOperations = new ModelOperations({
      modelJsonLoaderFunc: /* @__PURE__ */ __name(async () => {
        const response = await fetch(await this._host.$getModelJsonUri());
        try {
          const modelJSON = await response.json();
          return modelJSON;
        } catch (e) {
          const message = `Failed to parse model JSON.`;
          throw new Error(message);
        }
      }, "modelJsonLoaderFunc"),
      weightsLoaderFunc: /* @__PURE__ */ __name(async () => {
        const response = await fetch(await this._host.$getWeightsUri());
        const buffer = await response.arrayBuffer();
        return buffer;
      }, "weightsLoaderFunc")
    });
    return this._modelOperations;
  }
  // This adjusts the language confidence scores to be more accurate based on:
  // * VS Code's language usage
  // * Languages with 'problematic' syntaxes that have caused incorrect language detection
  adjustLanguageConfidence(modelResult) {
    switch (modelResult.languageId) {
      // For the following languages, we increase the confidence because
      // these are commonly used languages in VS Code and supported
      // by the model.
      case "js":
      case "html":
      case "json":
      case "ts":
      case "css":
      case "py":
      case "xml":
      case "php":
        modelResult.confidence += LanguageDetectionWorker.positiveConfidenceCorrectionBucket1;
        break;
      // case 'yaml': // YAML has been know to cause incorrect language detection because the language is pretty simple. We don't want to increase the confidence for this.
      case "cpp":
      case "sh":
      case "java":
      case "cs":
      case "c":
        modelResult.confidence += LanguageDetectionWorker.positiveConfidenceCorrectionBucket2;
        break;
      // For the following languages, we need to be extra confident that the language is correct because
      // we've had issues like #131912 that caused incorrect guesses. To enforce this, we subtract the
      // negativeConfidenceCorrection from the confidence.
      // languages that are provided by default in VS Code
      case "bat":
      case "ini":
      case "makefile":
      case "sql":
      // languages that aren't provided by default in VS Code
      case "csv":
      case "toml":
        modelResult.confidence -= LanguageDetectionWorker.negativeConfidenceCorrection;
        break;
      default:
        break;
    }
    return modelResult;
  }
  async *detectLanguagesImpl(content) {
    if (this._loadFailed) {
      return;
    }
    let modelOperations;
    try {
      modelOperations = await this.getModelOperations();
    } catch (e) {
      console.log(e);
      this._loadFailed = true;
      return;
    }
    let modelResults;
    try {
      modelResults = await modelOperations.runModel(content);
    } catch (e) {
      console.warn(e);
    }
    if (!modelResults || modelResults.length === 0 || modelResults[0].confidence < LanguageDetectionWorker.expectedRelativeConfidence) {
      return;
    }
    const firstModelResult = this.adjustLanguageConfidence(modelResults[0]);
    if (firstModelResult.confidence < LanguageDetectionWorker.expectedRelativeConfidence) {
      return;
    }
    const possibleLanguages = [firstModelResult];
    for (let current of modelResults) {
      if (current === firstModelResult) {
        continue;
      }
      current = this.adjustLanguageConfidence(current);
      const currentHighest = possibleLanguages[possibleLanguages.length - 1];
      if (currentHighest.confidence - current.confidence >= LanguageDetectionWorker.expectedRelativeConfidence) {
        while (possibleLanguages.length) {
          yield possibleLanguages.shift();
        }
        if (current.confidence > LanguageDetectionWorker.expectedRelativeConfidence) {
          possibleLanguages.push(current);
          continue;
        }
        return;
      } else {
        if (current.confidence > LanguageDetectionWorker.expectedRelativeConfidence) {
          possibleLanguages.push(current);
          continue;
        }
        return;
      }
    }
  }
}
export {
  LanguageDetectionWorker,
  create
};
//# sourceMappingURL=languageDetectionWebWorker.js.map
