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
import { raceTimeout } from "../../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { LcsDiff, StringDiffSequence } from "../../../../../base/common/diff/diff.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { CommandsRegistry, ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IBulkEditService } from "../../../../browser/services/bulkEditService.js";
import { TextReplacement } from "../../../../common/core/edits/textEdit.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { EditSources } from "../../../../common/textModelEditSource.js";
import { hasProvider, rawRename } from "../../../rename/browser/rename.js";
import { renameSymbolCommandId } from "../controller/commandIds.js";
import { InlineSuggestionItem } from "./inlineSuggestionItem.js";
import { Codicon } from "../../../../../base/common/codicons.js";
var RenameKind;
(function(RenameKind2) {
  RenameKind2["no"] = "no";
  RenameKind2["yes"] = "yes";
  RenameKind2["maybe"] = "maybe";
})(RenameKind || (RenameKind = {}));
(function(RenameKind2) {
  function fromString(value) {
    switch (value) {
      case "no":
        return RenameKind2.no;
      case "yes":
        return RenameKind2.yes;
      case "maybe":
        return RenameKind2.maybe;
      default:
        return RenameKind2.no;
    }
  }
  __name(fromString, "fromString");
  RenameKind2.fromString = fromString;
})(RenameKind || (RenameKind = {}));
class RenameInferenceEngine {
  static {
    __name(this, "RenameInferenceEngine");
  }
  constructor() {
  }
  inferRename(textModel, editRange, insertText, wordDefinition) {
    const extendedRange = new Range(editRange.startLineNumber, 1, editRange.endLineNumber, textModel.getLineMaxColumn(editRange.endLineNumber));
    const startDiff = editRange.startColumn - extendedRange.startColumn;
    const endDiff = extendedRange.endColumn - editRange.endColumn;
    const originalText = textModel.getValueInRange(extendedRange);
    const modifiedText = textModel.getValueInRange(new Range(extendedRange.startLineNumber, extendedRange.startColumn, extendedRange.startLineNumber, extendedRange.startColumn + startDiff)) + insertText + textModel.getValueInRange(new Range(extendedRange.endLineNumber, extendedRange.endColumn - endDiff, extendedRange.endLineNumber, extendedRange.endColumn));
    const others = [];
    const renames = [];
    let oldName = void 0;
    let newName = void 0;
    let position = void 0;
    const nesOffset = textModel.getOffsetAt(extendedRange.getStartPosition());
    const { changes: originalChanges } = new LcsDiff(new StringDiffSequence(originalText), new StringDiffSequence(modifiedText)).ComputeDiff(true);
    if (originalChanges.length === 0) {
      return void 0;
    }
    const changes = [];
    for (const change of originalChanges) {
      if (changes.length === 0) {
        changes.push(change);
        continue;
      }
      const lastChange = changes[changes.length - 1];
      const gapOriginalLength = change.originalStart - (lastChange.originalStart + lastChange.originalLength);
      if (gapOriginalLength > 0) {
        const gapStartOffset = nesOffset + lastChange.originalStart + lastChange.originalLength;
        const gapStartPos = textModel.getPositionAt(gapStartOffset);
        const wordRange = textModel.getWordAtPosition(gapStartPos);
        if (wordRange) {
          const wordStartOffset = textModel.getOffsetAt(new Position(gapStartPos.lineNumber, wordRange.startColumn));
          const wordEndOffset = textModel.getOffsetAt(new Position(gapStartPos.lineNumber, wordRange.endColumn));
          const gapEndOffset = gapStartOffset + gapOriginalLength;
          if (wordStartOffset <= gapStartOffset && gapEndOffset <= wordEndOffset && wordStartOffset <= gapEndOffset && gapEndOffset <= wordEndOffset) {
            lastChange.originalLength = change.originalStart + change.originalLength - lastChange.originalStart;
            lastChange.modifiedLength = change.modifiedStart + change.modifiedLength - lastChange.modifiedStart;
            continue;
          }
        }
      }
      changes.push(change);
    }
    let tokenDiff = 0;
    for (const change of changes) {
      const originalTextSegment = originalText.substring(change.originalStart, change.originalStart + change.originalLength);
      const insertedTextSegment = modifiedText.substring(change.modifiedStart, change.modifiedStart + change.modifiedLength);
      const startOffset = nesOffset + change.originalStart;
      const startPos = textModel.getPositionAt(startOffset);
      const endOffset = startOffset + change.originalLength;
      const endPos = textModel.getPositionAt(endOffset);
      const range = Range.fromPositions(startPos, endPos);
      const diff = insertedTextSegment.length - change.originalLength;
      if (/\s/.test(originalTextSegment)) {
        others.push(new TextReplacement(range, insertedTextSegment));
        tokenDiff += diff;
        continue;
      }
      if (originalTextSegment.length > 0) {
        wordDefinition.lastIndex = 0;
        const match2 = wordDefinition.exec(originalTextSegment);
        if (match2 === null || match2.index !== 0 || match2[0].length !== originalTextSegment.length) {
          others.push(new TextReplacement(range, insertedTextSegment));
          tokenDiff += diff;
          continue;
        }
      }
      if (/\s/.test(insertedTextSegment)) {
        others.push(new TextReplacement(range, insertedTextSegment));
        tokenDiff += diff;
        continue;
      }
      if (insertedTextSegment.length > 0) {
        wordDefinition.lastIndex = 0;
        const match2 = wordDefinition.exec(insertedTextSegment);
        if (match2 === null || match2.index !== 0 || match2[0].length !== insertedTextSegment.length) {
          others.push(new TextReplacement(range, insertedTextSegment));
          tokenDiff += diff;
          continue;
        }
      }
      const wordRange = textModel.getWordAtPosition(startPos);
      if (wordRange === null) {
        others.push(new TextReplacement(range, insertedTextSegment));
        tokenDiff += diff;
        continue;
      }
      const originalStartColumn = change.originalStart + 1;
      const isInsertion = change.originalLength === 0 && change.modifiedLength > 0;
      let tokenInfo;
      if (isInsertion && originalStartColumn === wordRange.endColumn && wordRange.endColumn > wordRange.startColumn) {
        tokenInfo = this.getTokenAtPosition(textModel, new Position(startPos.lineNumber, wordRange.startColumn));
      } else {
        tokenInfo = this.getTokenAtPosition(textModel, startPos);
      }
      if (wordRange.startColumn !== tokenInfo.range.startColumn || wordRange.endColumn !== tokenInfo.range.endColumn) {
        others.push(new TextReplacement(range, insertedTextSegment));
        tokenDiff += diff;
        continue;
      }
      if (tokenInfo.type === 0) {
        let identifier = textModel.getValueInRange(tokenInfo.range);
        if (identifier.length === 0) {
          others.push(new TextReplacement(range, insertedTextSegment));
          tokenDiff += diff;
          continue;
        }
        if (oldName === void 0) {
          oldName = identifier;
        } else if (oldName !== identifier) {
          others.push(new TextReplacement(range, insertedTextSegment));
          tokenDiff += diff;
          continue;
        }
        const tokenStartPos = textModel.getOffsetAt(tokenInfo.range.getStartPosition()) - nesOffset + tokenDiff;
        const tokenEndPos = textModel.getOffsetAt(tokenInfo.range.getEndPosition()) - nesOffset + tokenDiff;
        identifier = modifiedText.substring(tokenStartPos, tokenEndPos + diff);
        if (identifier.length === 0) {
          others.push(new TextReplacement(range, insertedTextSegment));
          tokenDiff += diff;
          continue;
        }
        if (newName === void 0) {
          newName = identifier;
        } else if (newName !== identifier) {
          others.push(new TextReplacement(range, insertedTextSegment));
          tokenDiff += diff;
          continue;
        }
        if (position === void 0) {
          position = tokenInfo.range.getStartPosition();
        }
        if (oldName !== void 0 && newName !== void 0 && oldName.length > 0 && newName.length > 0 && oldName !== newName) {
          renames.push(new TextReplacement(tokenInfo.range, newName));
        } else {
          renames.push(new TextReplacement(range, insertedTextSegment));
        }
        tokenDiff += diff;
      } else {
        others.push(new TextReplacement(range, insertedTextSegment));
        tokenDiff += insertedTextSegment.length - change.originalLength;
      }
    }
    if (oldName === void 0 || newName === void 0 || position === void 0 || oldName.length === 0 || newName.length === 0 || oldName === newName) {
      return void 0;
    }
    wordDefinition.lastIndex = 0;
    let match = wordDefinition.exec(oldName);
    if (match === null || match.index !== 0 || match[0].length !== oldName.length) {
      return void 0;
    }
    wordDefinition.lastIndex = 0;
    match = wordDefinition.exec(newName);
    if (match === null || match.index !== 0 || match[0].length !== newName.length) {
      return void 0;
    }
    return {
      renames: { edits: renames, position, oldName, newName },
      others: { edits: others }
    };
  }
  getTokenAtPosition(textModel, position) {
    textModel.tokenization.tokenizeIfCheap(position.lineNumber);
    const tokens = textModel.tokenization.getLineTokens(position.lineNumber);
    const idx = tokens.findTokenIndexAtOffset(position.column - 1);
    return {
      type: tokens.getStandardTokenType(idx),
      range: new Range(position.lineNumber, 1 + tokens.getStartOffset(idx), position.lineNumber, 1 + tokens.getEndOffset(idx))
    };
  }
}
class RenameSymbolRunnable {
  static {
    __name(this, "RenameSymbolRunnable");
  }
  constructor(languageFeaturesService, textModel, position, newName, requestUuid) {
    this._result = void 0;
    this._requestUuid = requestUuid;
    this._cancellationTokenSource = new CancellationTokenSource();
    this._promise = rawRename(languageFeaturesService.renameProvider, textModel, position, newName, this._cancellationTokenSource.token);
  }
  get requestUuid() {
    return this._requestUuid;
  }
  cancel() {
    this._cancellationTokenSource.cancel();
  }
  async getCount() {
    if (this._cancellationTokenSource.token.isCancellationRequested) {
      return 0;
    }
    const result = await this.getResult();
    if (result === void 0 || this._cancellationTokenSource.token.isCancellationRequested) {
      return 0;
    }
    return result.edits.length;
  }
  async getWorkspaceEdit() {
    return this.getResult();
  }
  async getResult() {
    if (this._cancellationTokenSource.token.isCancellationRequested) {
      return void 0;
    }
    if (this._result === void 0) {
      this._result = await this._promise;
    }
    if (this._result.rejectReason || this._cancellationTokenSource.token.isCancellationRequested) {
      return void 0;
    }
    return this._result;
  }
}
let RenameSymbolProcessor = class RenameSymbolProcessor2 extends Disposable {
  static {
    __name(this, "RenameSymbolProcessor");
  }
  constructor(_commandService, _languageFeaturesService, _languageConfigurationService, bulkEditService) {
    super();
    this._commandService = _commandService;
    this._languageFeaturesService = _languageFeaturesService;
    this._languageConfigurationService = _languageConfigurationService;
    this._renameInferenceEngine = new RenameInferenceEngine();
    this._renameRunnable = void 0;
    this._register(CommandsRegistry.registerCommand(renameSymbolCommandId, async (_, source, renameRunnable) => {
      if (renameRunnable === void 0) {
        return;
      }
      try {
        const workspaceEdit = await renameRunnable.getWorkspaceEdit();
        if (workspaceEdit === void 0) {
          return;
        }
        bulkEditService.apply(workspaceEdit, { reason: source });
      } finally {
        if (this._renameRunnable === renameRunnable) {
          this._renameRunnable = void 0;
        }
      }
    }));
  }
  async proposeRenameRefactoring(textModel, suggestItem, context) {
    if (!suggestItem.supportsRename || suggestItem.action?.kind !== "edit" || context.selectedSuggestionInfo) {
      return suggestItem;
    }
    if (!hasProvider(this._languageFeaturesService.renameProvider, textModel)) {
      return suggestItem;
    }
    const start = Date.now();
    const edit = suggestItem.action.textReplacement;
    const languageConfiguration = this._languageConfigurationService.getLanguageConfiguration(textModel.getLanguageId());
    const edits = this._renameInferenceEngine.inferRename(textModel, edit.range, edit.text, languageConfiguration.wordDefinition);
    if (edits === void 0 || edits.renames.edits.length === 0) {
      return suggestItem;
    }
    const { oldName, newName, position, edits: renameEdits } = edits.renames;
    let timedOut = false;
    const check = await raceTimeout(this.checkRenamePrecondition(suggestItem, textModel, position, oldName, newName), 100, () => {
      timedOut = true;
    });
    const renamePossible = this.isRenamePossible(suggestItem, check);
    suggestItem.setRenameProcessingInfo({
      createdRename: renamePossible,
      duration: Date.now() - start,
      timedOut,
      droppedOtherEdits: renamePossible ? edits.others.edits.length : void 0,
      droppedRenameEdits: renamePossible ? renameEdits.length - 1 : void 0
    });
    if (!renamePossible) {
      return suggestItem;
    }
    if (this._renameRunnable === void 0) {
      this._renameRunnable = new RenameSymbolRunnable(this._languageFeaturesService, textModel, position, newName, suggestItem.requestUuid);
    }
    const source = EditSources.inlineCompletionAccept({
      nes: suggestItem.isInlineEdit,
      requestUuid: suggestItem.requestUuid,
      providerId: suggestItem.source.provider.providerId,
      languageId: textModel.getLanguageId(),
      correlationId: suggestItem.getSourceCompletion().correlationId
    });
    const command = {
      id: renameSymbolCommandId,
      title: localize("rename", "Rename"),
      arguments: [source, this._renameRunnable]
    };
    const alternativeAction = {
      label: localize("rename", "Rename"),
      icon: Codicon.replaceAll,
      command,
      count: this._renameRunnable.getCount()
    };
    const renameAction = {
      kind: "edit",
      range: renameEdits[0].range,
      insertText: renameEdits[0].text,
      snippetInfo: suggestItem.snippetInfo,
      alternativeAction,
      uri: textModel.uri
    };
    return InlineSuggestionItem.create(suggestItem.withAction(renameAction), textModel, false);
  }
  async checkRenamePrecondition(suggestItem, textModel, position, oldName, newName) {
    try {
      const result = await this._commandService.executeCommand("github.copilot.nes.prepareRename", textModel.uri, position, oldName, newName, suggestItem.requestUuid);
      if (result === void 0) {
        return RenameKind.no;
      } else {
        return RenameKind.fromString(result);
      }
    } catch (error) {
      return RenameKind.no;
    }
  }
  isRenamePossible(suggestItem, check) {
    if (check === void 0 || check === RenameKind.no) {
      return false;
    }
    if (this._renameRunnable === void 0) {
      return true;
    }
    if (this._renameRunnable.requestUuid === suggestItem.requestUuid) {
      return false;
    } else {
      this._renameRunnable.cancel();
      this._renameRunnable = void 0;
      return true;
    }
  }
};
RenameSymbolProcessor = __decorate([
  __param(0, ICommandService),
  __param(1, ILanguageFeaturesService),
  __param(2, ILanguageConfigurationService),
  __param(3, IBulkEditService)
], RenameSymbolProcessor);
export {
  RenameInferenceEngine,
  RenameSymbolProcessor
};
//# sourceMappingURL=renameSymbolProcessor.js.map
