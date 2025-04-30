var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../../../base/common/uri.js";
import { TMGrammarFactory } from "../../../common/TMGrammarFactory.js";
import { TextMateWorkerTokenizer } from "./textMateWorkerTokenizer.js";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { TextMateWorkerHost } from "./textMateWorkerHost.js";
function create(workerServer) {
  return new TextMateTokenizationWorker(workerServer);
}
__name(create, "create");
class TextMateTokenizationWorker {
  static {
    __name(this, "TextMateTokenizationWorker");
  }
  constructor(workerServer) {
    this._models = /* @__PURE__ */ new Map();
    this._grammarCache = [];
    this._grammarFactory = Promise.resolve(null);
    this._host = TextMateWorkerHost.getChannel(workerServer);
  }
  async $init(_createData) {
    const grammarDefinitions = _createData.grammarDefinitions.map((def) => {
      return {
        location: URI.revive(def.location),
        language: def.language,
        scopeName: def.scopeName,
        embeddedLanguages: def.embeddedLanguages,
        tokenTypes: def.tokenTypes,
        injectTo: def.injectTo,
        balancedBracketSelectors: def.balancedBracketSelectors,
        unbalancedBracketSelectors: def.unbalancedBracketSelectors,
        sourceExtensionId: def.sourceExtensionId
      };
    });
    this._grammarFactory = this._loadTMGrammarFactory(grammarDefinitions, _createData.onigurumaWASMUri);
  }
  async _loadTMGrammarFactory(grammarDefinitions, onigurumaWASMUri) {
    const vscodeTextmate = await importAMDNodeModule("vscode-textmate", "release/main.js");
    const vscodeOniguruma = await importAMDNodeModule("vscode-oniguruma", "release/main.js");
    const response = await fetch(onigurumaWASMUri);
    const bytes = await response.arrayBuffer();
    await vscodeOniguruma.loadWASM(bytes);
    const onigLib = Promise.resolve({
      createOnigScanner: /* @__PURE__ */ __name((sources) => vscodeOniguruma.createOnigScanner(sources), "createOnigScanner"),
      createOnigString: /* @__PURE__ */ __name((str) => vscodeOniguruma.createOnigString(str), "createOnigString")
    });
    return new TMGrammarFactory({
      logTrace: /* @__PURE__ */ __name((msg) => {
      }, "logTrace"),
      logError: /* @__PURE__ */ __name((msg, err) => console.error(msg, err), "logError"),
      readFile: /* @__PURE__ */ __name((resource) => this._host.$readFile(resource), "readFile")
    }, grammarDefinitions, vscodeTextmate, onigLib);
  }
  // These methods are called by the renderer
  $acceptNewModel(data) {
    const uri = URI.revive(data.uri);
    const that = this;
    this._models.set(data.controllerId, new TextMateWorkerTokenizer(uri, data.lines, data.EOL, data.versionId, {
      async getOrCreateGrammar(languageId, encodedLanguageId) {
        const grammarFactory = await that._grammarFactory;
        if (!grammarFactory) {
          return Promise.resolve(null);
        }
        if (!that._grammarCache[encodedLanguageId]) {
          that._grammarCache[encodedLanguageId] = grammarFactory.createGrammar(languageId, encodedLanguageId);
        }
        return that._grammarCache[encodedLanguageId];
      },
      setTokensAndStates(versionId, tokens, stateDeltas) {
        that._host.$setTokensAndStates(data.controllerId, versionId, tokens, stateDeltas);
      },
      reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, isRandomSample) {
        that._host.$reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, isRandomSample);
      }
    }, data.languageId, data.encodedLanguageId, data.maxTokenizationLineLength));
  }
  $acceptModelChanged(controllerId, e) {
    this._models.get(controllerId).onEvents(e);
  }
  $retokenize(controllerId, startLineNumber, endLineNumberExclusive) {
    this._models.get(controllerId).retokenize(startLineNumber, endLineNumberExclusive);
  }
  $acceptModelLanguageChanged(controllerId, newLanguageId, newEncodedLanguageId) {
    this._models.get(controllerId).onLanguageId(newLanguageId, newEncodedLanguageId);
  }
  $acceptRemovedModel(controllerId) {
    const model = this._models.get(controllerId);
    if (model) {
      model.dispose();
      this._models.delete(controllerId);
    }
  }
  async $acceptTheme(theme, colorMap) {
    const grammarFactory = await this._grammarFactory;
    grammarFactory?.setTheme(theme, colorMap);
  }
  $acceptMaxTokenizationLineLength(controllerId, value) {
    this._models.get(controllerId).acceptMaxTokenizationLineLength(value);
  }
}
export {
  TextMateTokenizationWorker,
  create
};
//# sourceMappingURL=textMateTokenizationWorker.worker.js.map
