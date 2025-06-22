var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { extractCodeblockUrisFromText, extractVulnerabilitiesFromText } from "./annotations.js";
import { isResponseVM } from "./chatViewModel.js";
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
let CodeBlockModelCollection = class CodeBlockModelCollection2 extends Disposable {
  static {
    __name(this, "CodeBlockModelCollection");
  }
  constructor(tag, languageService, textModelService) {
    super();
    this.tag = tag;
    this.languageService = languageService;
    this.textModelService = textModelService;
    this._models = /* @__PURE__ */ new Map();
    this.maxModelCount = 100;
  }
  dispose() {
    super.dispose();
    this.clear();
  }
  get(sessionId, chat, codeBlockIndex) {
    const entry = this._models.get(this.getKey(sessionId, chat, codeBlockIndex));
    if (!entry) {
      return;
    }
    return {
      model: entry.model.then((ref) => ref.object.textEditorModel),
      vulns: entry.vulns,
      codemapperUri: entry.codemapperUri,
      isEdit: entry.isEdit
    };
  }
  getOrCreate(sessionId, chat, codeBlockIndex) {
    const existing = this.get(sessionId, chat, codeBlockIndex);
    if (existing) {
      return existing;
    }
    const uri = this.getCodeBlockUri(sessionId, chat, codeBlockIndex);
    const model = this.textModelService.createModelReference(uri);
    this._models.set(this.getKey(sessionId, chat, codeBlockIndex), {
      model,
      vulns: [],
      codemapperUri: void 0
    });
    while (this._models.size > this.maxModelCount) {
      const first = Iterable.first(this._models.keys());
      if (!first) {
        break;
      }
      this.delete(first);
    }
    return { model: model.then((x) => x.object.textEditorModel), vulns: [], codemapperUri: void 0 };
  }
  delete(key) {
    const entry = this._models.get(key);
    if (!entry) {
      return;
    }
    entry.model.then((ref) => ref.object.dispose());
    this._models.delete(key);
  }
  clear() {
    this._models.forEach(async (entry) => (await entry.model).dispose());
    this._models.clear();
  }
  updateSync(sessionId, chat, codeBlockIndex, content) {
    const entry = this.getOrCreate(sessionId, chat, codeBlockIndex);
    const extractedVulns = extractVulnerabilitiesFromText(content.text);
    const newText = fixCodeText(extractedVulns.newText, content.languageId);
    this.setVulns(sessionId, chat, codeBlockIndex, extractedVulns.vulnerabilities);
    const codeblockUri = extractCodeblockUrisFromText(newText);
    if (codeblockUri) {
      this.setCodemapperUri(sessionId, chat, codeBlockIndex, codeblockUri.uri, codeblockUri.isEdit);
    }
    if (content.isComplete) {
      this.markCodeBlockCompleted(sessionId, chat, codeBlockIndex);
    }
    return this.get(sessionId, chat, codeBlockIndex) ?? entry;
  }
  markCodeBlockCompleted(sessionId, chat, codeBlockIndex) {
    const entry = this._models.get(this.getKey(sessionId, chat, codeBlockIndex));
    if (!entry) {
      return;
    }
  }
  async update(sessionId, chat, codeBlockIndex, content) {
    const entry = this.getOrCreate(sessionId, chat, codeBlockIndex);
    const extractedVulns = extractVulnerabilitiesFromText(content.text);
    let newText = fixCodeText(extractedVulns.newText, content.languageId);
    this.setVulns(sessionId, chat, codeBlockIndex, extractedVulns.vulnerabilities);
    const codeblockUri = extractCodeblockUrisFromText(newText);
    if (codeblockUri) {
      this.setCodemapperUri(sessionId, chat, codeBlockIndex, codeblockUri.uri, codeblockUri.isEdit);
      newText = codeblockUri.textWithoutResult;
    }
    if (content.isComplete) {
      this.markCodeBlockCompleted(sessionId, chat, codeBlockIndex);
    }
    const textModel = await entry.model;
    if (textModel.isDisposed()) {
      return entry;
    }
    if (content.languageId) {
      const vscodeLanguageId = this.languageService.getLanguageIdByLanguageName(content.languageId);
      if (vscodeLanguageId && vscodeLanguageId !== textModel.getLanguageId()) {
        textModel.setLanguage(vscodeLanguageId);
      }
    }
    const currentText = textModel.getValue(
      1
      /* EndOfLinePreference.LF */
    );
    if (newText === currentText) {
      return entry;
    }
    if (newText.startsWith(currentText)) {
      const text = newText.slice(currentText.length);
      const lastLine = textModel.getLineCount();
      const lastCol = textModel.getLineMaxColumn(lastLine);
      textModel.applyEdits([{ range: new Range(lastLine, lastCol, lastLine, lastCol), text }]);
    } else {
      textModel.setValue(newText);
    }
    return entry;
  }
  setCodemapperUri(sessionId, chat, codeBlockIndex, codemapperUri, isEdit) {
    const entry = this._models.get(this.getKey(sessionId, chat, codeBlockIndex));
    if (entry) {
      entry.codemapperUri = codemapperUri;
      entry.isEdit = isEdit;
    }
  }
  setVulns(sessionId, chat, codeBlockIndex, vulnerabilities) {
    const entry = this._models.get(this.getKey(sessionId, chat, codeBlockIndex));
    if (entry) {
      entry.vulns = vulnerabilities;
    }
  }
  getKey(sessionId, chat, index) {
    return `${sessionId}/${chat.id}/${index}`;
  }
  getCodeBlockUri(sessionId, chat, index) {
    const metadata = this.getUriMetaData(chat);
    const indexPart = this.tag ? `${this.tag}-${index}` : `${index}`;
    return URI.from({
      scheme: Schemas.vscodeChatCodeBlock,
      authority: sessionId,
      path: `/${chat.id}/${indexPart}`,
      fragment: metadata ? JSON.stringify(metadata) : void 0
    });
  }
  getUriMetaData(chat) {
    if (!isResponseVM(chat)) {
      return void 0;
    }
    return {
      references: chat.contentReferences.map((ref) => {
        if (typeof ref.reference === "string") {
          return;
        }
        const uriOrLocation = "variableName" in ref.reference ? ref.reference.value : ref.reference;
        if (!uriOrLocation) {
          return;
        }
        if (URI.isUri(uriOrLocation)) {
          return {
            uri: uriOrLocation.toJSON()
          };
        }
        return {
          uri: uriOrLocation.uri.toJSON(),
          range: uriOrLocation.range
        };
      })
    };
  }
};
CodeBlockModelCollection = __decorate([
  __param(1, ILanguageService),
  __param(2, ITextModelService)
], CodeBlockModelCollection);
function fixCodeText(text, languageId) {
  if (languageId === "php") {
    if (!text.trim().startsWith("<?")) {
      return `<?php
${text}`;
    }
  }
  return text;
}
__name(fixCodeText, "fixCodeText");
export {
  CodeBlockModelCollection
};
//# sourceMappingURL=codeBlockModelCollection.js.map
