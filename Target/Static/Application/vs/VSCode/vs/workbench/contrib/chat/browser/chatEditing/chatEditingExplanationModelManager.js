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
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { basename } from "../../../../../base/common/resources.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { ILanguageModelsService } from "../../common/languageModels.js";
import * as nls from "../../../../../nls.js";
const IChatEditingExplanationModelManager = createDecorator("chatEditingExplanationModelManager");
function getChangeTexts(change, diffInfo) {
  const originalLines = [];
  const modifiedLines = [];
  for (let i = change.original.startLineNumber; i < change.original.endLineNumberExclusive; i++) {
    const line = diffInfo.originalModel.getLineContent(i);
    originalLines.push(line);
  }
  for (let i = change.modified.startLineNumber; i < change.modified.endLineNumberExclusive; i++) {
    const line = diffInfo.modifiedModel.getLineContent(i);
    modifiedLines.push(line);
  }
  return {
    originalText: originalLines.join("\n"),
    modifiedText: modifiedLines.join("\n")
  };
}
__name(getChangeTexts, "getChangeTexts");
let ChatEditingExplanationModelManager = class ChatEditingExplanationModelManager2 extends Disposable {
  static {
    __name(this, "ChatEditingExplanationModelManager");
  }
  constructor(_languageModelsService) {
    super();
    this._languageModelsService = _languageModelsService;
    this._state = observableValue(this, new ResourceMap());
    this.state = this._state;
  }
  _updateUriState(uri, uriState) {
    const current = this._state.get();
    const newState = new ResourceMap(current);
    newState.set(uri, uriState);
    this._state.set(newState, void 0);
  }
  _updateUriStatePartial(uri, partial) {
    const current = this._state.get();
    const existing = current.get(uri);
    if (existing) {
      const newState = new ResourceMap(current);
      newState.set(uri, { ...existing, ...partial });
      this._state.set(newState, void 0);
    }
  }
  _removeUris(uris) {
    const current = this._state.get();
    const newState = new ResourceMap(current);
    for (const uri of uris) {
      newState.delete(uri);
    }
    this._state.set(newState, void 0);
  }
  generateExplanations(diffInfos, chatSessionResource, token) {
    const uris = diffInfos.map((d) => d.modifiedModel.uri);
    const cts = new CancellationTokenSource(token);
    for (const diffInfo of diffInfos) {
      this._updateUriState(diffInfo.modifiedModel.uri, {
        progress: "loading",
        explanations: [],
        diffInfo,
        chatSessionResource
      });
    }
    const completed = this._doGenerateExplanations(diffInfos, cts.token);
    return {
      uris,
      completed,
      dispose: /* @__PURE__ */ __name(() => {
        cts.dispose(true);
        this._removeUris(uris);
      }, "dispose")
    };
  }
  async _doGenerateExplanations(diffInfos, cancellationToken) {
    const nonEmptyDiffs = [];
    for (const diffInfo of diffInfos) {
      if (diffInfo.changes.length === 0 || diffInfo.identical) {
        this._updateUriStatePartial(diffInfo.modifiedModel.uri, {
          progress: "complete",
          explanations: []
        });
      } else {
        nonEmptyDiffs.push(diffInfo);
      }
    }
    if (nonEmptyDiffs.length === 0) {
      return;
    }
    const fileChanges = nonEmptyDiffs.map((diffInfo) => {
      const uri = diffInfo.modifiedModel.uri;
      const fileName = basename(uri);
      const changes = diffInfo.changes.map((change) => {
        const { originalText, modifiedText } = getChangeTexts(change, diffInfo);
        return {
          startLineNumber: change.modified.startLineNumber,
          endLineNumber: change.modified.endLineNumberExclusive - 1,
          originalText,
          modifiedText
        };
      });
      return { uri, fileName, changes };
    });
    const totalChanges = fileChanges.reduce((sum, f) => sum + f.changes.length, 0);
    try {
      const models = await this._languageModelsService.selectLanguageModels({ vendor: "copilot", id: "copilot-fast" });
      if (!models.length) {
        for (const fileData of fileChanges) {
          this._updateUriStatePartial(fileData.uri, {
            progress: "error",
            explanations: [],
            errorMessage: nls.localize("noModelAvailable", "No language model available")
          });
        }
        return;
      }
      if (cancellationToken.isCancellationRequested) {
        return;
      }
      let changeIndex = 0;
      const changesDescription = fileChanges.map((fileData) => {
        return fileData.changes.map((data) => {
          const desc = `=== CHANGE ${changeIndex} (File: ${fileData.fileName}, Lines ${data.startLineNumber}-${data.endLineNumber}) ===
BEFORE:
${data.originalText || "(empty)"}

AFTER:
${data.modifiedText || "(empty)"}`;
          changeIndex++;
          return desc;
        }).join("\n\n");
      }).join("\n\n");
      const fileCount = fileChanges.length;
      const prompt = `Analyze these ${totalChanges} code changes across ${fileCount} file${fileCount > 1 ? "s" : ""} and provide a brief explanation for each one.
These changes are part of a single coherent modification, so consider how they relate to each other.

${changesDescription}

Respond with a JSON array containing exactly ${totalChanges} objects, one for each change in order.
Each object should have an "explanation" field with a brief sentence (max 15 words) explaining what changed and why.
Be specific about the actual code changes. Return ONLY valid JSON, no markdown.

Example response format:
[{"explanation": "Added null check to prevent crash"}, {"explanation": "Renamed variable for clarity"}]`;
      const response = await this._languageModelsService.sendChatRequest(models[0], void 0, [{ role: 1, content: [{ type: "text", value: prompt }] }], {}, cancellationToken);
      let responseText = "";
      for await (const part of response.stream) {
        if (cancellationToken.isCancellationRequested) {
          return;
        }
        if (Array.isArray(part)) {
          for (const p of part) {
            if (p.type === "text") {
              responseText += p.value;
            }
          }
        } else if (part.type === "text") {
          responseText += part.value;
        }
      }
      await response.result;
      if (cancellationToken.isCancellationRequested) {
        return;
      }
      let parsed = [];
      try {
        let jsonText = responseText.trim();
        if (jsonText.startsWith("```")) {
          jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        parsed = JSON.parse(jsonText);
      } catch {
      }
      let parsedIndex = 0;
      for (const fileData of fileChanges) {
        const explanations = [];
        for (const data of fileData.changes) {
          const parsedExplanation = parsed[parsedIndex]?.explanation?.trim() || nls.localize("codeWasModified", "Code was modified.");
          explanations.push({
            uri: fileData.uri,
            startLineNumber: data.startLineNumber,
            endLineNumber: data.endLineNumber,
            originalText: data.originalText,
            modifiedText: data.modifiedText,
            explanation: parsedExplanation
          });
          parsedIndex++;
        }
        this._updateUriStatePartial(fileData.uri, {
          progress: "complete",
          explanations
        });
      }
    } catch (e) {
      if (!cancellationToken.isCancellationRequested) {
        const errorMessage = e instanceof Error ? e.message : nls.localize("explanationFailed", "Failed to generate explanations");
        for (const fileData of fileChanges) {
          this._updateUriStatePartial(fileData.uri, {
            progress: "error",
            explanations: [],
            errorMessage
          });
        }
      }
    }
  }
};
ChatEditingExplanationModelManager = __decorate([
  __param(0, ILanguageModelsService)
], ChatEditingExplanationModelManager);
registerSingleton(
  IChatEditingExplanationModelManager,
  ChatEditingExplanationModelManager,
  1
  /* InstantiationType.Delayed */
);
export {
  ChatEditingExplanationModelManager,
  IChatEditingExplanationModelManager
};
//# sourceMappingURL=chatEditingExplanationModelManager.js.map
