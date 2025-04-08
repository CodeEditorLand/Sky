var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { stringDiff } from "../../../base/common/diff/diff.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IWebWorkerServerRequestHandler } from "../../../base/common/worker/webWorker.js";
import { Position } from "../core/position.js";
import { IRange, Range } from "../core/range.js";
import { EndOfLineSequence, ITextModel } from "../model.js";
import { IMirrorTextModel, IModelChangedEvent } from "../model/mirrorTextModel.js";
import { IColorInformation, IInplaceReplaceSupportResult, ILink, TextEdit } from "../languages.js";
import { computeLinks } from "../languages/linkComputer.js";
import { BasicInplaceReplace } from "../languages/supports/inplaceReplaceSupport.js";
import { DiffAlgorithmName, IDiffComputationResult, ILineChange, IUnicodeHighlightsResult } from "./editorWorker.js";
import { createMonacoBaseAPI } from "./editorBaseApi.js";
import { StopWatch } from "../../../base/common/stopwatch.js";
import { UnicodeTextModelHighlighter, UnicodeHighlighterOptions } from "./unicodeTextModelHighlighter.js";
import { DiffComputer, IChange } from "../diff/legacyLinesDiffComputer.js";
import { ILinesDiffComputer, ILinesDiffComputerOptions } from "../diff/linesDiffComputer.js";
import { DetailedLineRangeMapping } from "../diff/rangeMapping.js";
import { linesDiffComputers } from "../diff/linesDiffComputers.js";
import { IDocumentDiffProviderOptions } from "../diff/documentDiffProvider.js";
import { BugIndicatingError } from "../../../base/common/errors.js";
import { computeDefaultDocumentColors } from "../languages/defaultDocumentColorsComputer.js";
import { FindSectionHeaderOptions, SectionHeader, findSectionHeaders } from "./findSectionHeaders.js";
import { IRawModelData, IWorkerTextModelSyncChannelServer } from "./textModelSync/textModelSync.protocol.js";
import { ICommonModel, WorkerTextModelSyncServer } from "./textModelSync/textModelSync.impl.js";
class EditorWorker {
  constructor(_foreignModule = null) {
    this._foreignModule = _foreignModule;
  }
  static {
    __name(this, "EditorWorker");
  }
  _requestHandlerBrand;
  _workerTextModelSyncServer = new WorkerTextModelSyncServer();
  dispose() {
  }
  async $ping() {
    return "pong";
  }
  _getModel(uri) {
    return this._workerTextModelSyncServer.getModel(uri);
  }
  getModels() {
    return this._workerTextModelSyncServer.getModels();
  }
  $acceptNewModel(data) {
    this._workerTextModelSyncServer.$acceptNewModel(data);
  }
  $acceptModelChanged(uri, e) {
    this._workerTextModelSyncServer.$acceptModelChanged(uri, e);
  }
  $acceptRemovedModel(uri) {
    this._workerTextModelSyncServer.$acceptRemovedModel(uri);
  }
  async $computeUnicodeHighlights(url, options, range) {
    const model = this._getModel(url);
    if (!model) {
      return { ranges: [], hasMore: false, ambiguousCharacterCount: 0, invisibleCharacterCount: 0, nonBasicAsciiCharacterCount: 0 };
    }
    return UnicodeTextModelHighlighter.computeUnicodeHighlights(model, options, range);
  }
  async $findSectionHeaders(url, options) {
    const model = this._getModel(url);
    if (!model) {
      return [];
    }
    return findSectionHeaders(model, options);
  }
  // ---- BEGIN diff --------------------------------------------------------------------------
  async $computeDiff(originalUrl, modifiedUrl, options, algorithm) {
    const original = this._getModel(originalUrl);
    const modified = this._getModel(modifiedUrl);
    if (!original || !modified) {
      return null;
    }
    const result = EditorWorker.computeDiff(original, modified, options, algorithm);
    return result;
  }
  static computeDiff(originalTextModel, modifiedTextModel, options, algorithm) {
    const diffAlgorithm = algorithm === "advanced" ? linesDiffComputers.getDefault() : linesDiffComputers.getLegacy();
    const originalLines = originalTextModel.getLinesContent();
    const modifiedLines = modifiedTextModel.getLinesContent();
    const result = diffAlgorithm.computeDiff(originalLines, modifiedLines, options);
    const identical = result.changes.length > 0 ? false : this._modelsAreIdentical(originalTextModel, modifiedTextModel);
    function getLineChanges(changes) {
      return changes.map((m) => [m.original.startLineNumber, m.original.endLineNumberExclusive, m.modified.startLineNumber, m.modified.endLineNumberExclusive, m.innerChanges?.map((m2) => [
        m2.originalRange.startLineNumber,
        m2.originalRange.startColumn,
        m2.originalRange.endLineNumber,
        m2.originalRange.endColumn,
        m2.modifiedRange.startLineNumber,
        m2.modifiedRange.startColumn,
        m2.modifiedRange.endLineNumber,
        m2.modifiedRange.endColumn
      ])]);
    }
    __name(getLineChanges, "getLineChanges");
    return {
      identical,
      quitEarly: result.hitTimeout,
      changes: getLineChanges(result.changes),
      moves: result.moves.map((m) => [
        m.lineRangeMapping.original.startLineNumber,
        m.lineRangeMapping.original.endLineNumberExclusive,
        m.lineRangeMapping.modified.startLineNumber,
        m.lineRangeMapping.modified.endLineNumberExclusive,
        getLineChanges(m.changes)
      ])
    };
  }
  static _modelsAreIdentical(original, modified) {
    const originalLineCount = original.getLineCount();
    const modifiedLineCount = modified.getLineCount();
    if (originalLineCount !== modifiedLineCount) {
      return false;
    }
    for (let line = 1; line <= originalLineCount; line++) {
      const originalLine = original.getLineContent(line);
      const modifiedLine = modified.getLineContent(line);
      if (originalLine !== modifiedLine) {
        return false;
      }
    }
    return true;
  }
  async $computeDirtyDiff(originalUrl, modifiedUrl, ignoreTrimWhitespace) {
    const original = this._getModel(originalUrl);
    const modified = this._getModel(modifiedUrl);
    if (!original || !modified) {
      return null;
    }
    const originalLines = original.getLinesContent();
    const modifiedLines = modified.getLinesContent();
    const diffComputer = new DiffComputer(originalLines, modifiedLines, {
      shouldComputeCharChanges: false,
      shouldPostProcessCharChanges: false,
      shouldIgnoreTrimWhitespace: ignoreTrimWhitespace,
      shouldMakePrettyDiff: true,
      maxComputationTime: 1e3
    });
    return diffComputer.computeDiff().changes;
  }
  // ---- END diff --------------------------------------------------------------------------
  // ---- BEGIN minimal edits ---------------------------------------------------------------
  static _diffLimit = 1e5;
  async $computeMoreMinimalEdits(modelUrl, edits, pretty) {
    const model = this._getModel(modelUrl);
    if (!model) {
      return edits;
    }
    const result = [];
    let lastEol = void 0;
    edits = edits.slice(0).sort((a, b) => {
      if (a.range && b.range) {
        return Range.compareRangesUsingStarts(a.range, b.range);
      }
      const aRng = a.range ? 0 : 1;
      const bRng = b.range ? 0 : 1;
      return aRng - bRng;
    });
    let writeIndex = 0;
    for (let readIndex = 1; readIndex < edits.length; readIndex++) {
      if (Range.getEndPosition(edits[writeIndex].range).equals(Range.getStartPosition(edits[readIndex].range))) {
        edits[writeIndex].range = Range.fromPositions(Range.getStartPosition(edits[writeIndex].range), Range.getEndPosition(edits[readIndex].range));
        edits[writeIndex].text += edits[readIndex].text;
      } else {
        writeIndex++;
        edits[writeIndex] = edits[readIndex];
      }
    }
    edits.length = writeIndex + 1;
    for (let { range, text, eol } of edits) {
      if (typeof eol === "number") {
        lastEol = eol;
      }
      if (Range.isEmpty(range) && !text) {
        continue;
      }
      const original = model.getValueInRange(range);
      text = text.replace(/\r\n|\n|\r/g, model.eol);
      if (original === text) {
        continue;
      }
      if (Math.max(text.length, original.length) > EditorWorker._diffLimit) {
        result.push({ range, text });
        continue;
      }
      const changes = stringDiff(original, text, pretty);
      const editOffset = model.offsetAt(Range.lift(range).getStartPosition());
      for (const change of changes) {
        const start = model.positionAt(editOffset + change.originalStart);
        const end = model.positionAt(editOffset + change.originalStart + change.originalLength);
        const newEdit = {
          text: text.substr(change.modifiedStart, change.modifiedLength),
          range: { startLineNumber: start.lineNumber, startColumn: start.column, endLineNumber: end.lineNumber, endColumn: end.column }
        };
        if (model.getValueInRange(newEdit.range) !== newEdit.text) {
          result.push(newEdit);
        }
      }
    }
    if (typeof lastEol === "number") {
      result.push({ eol: lastEol, text: "", range: { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 } });
    }
    return result;
  }
  $computeHumanReadableDiff(modelUrl, edits, options) {
    const model = this._getModel(modelUrl);
    if (!model) {
      return edits;
    }
    const result = [];
    let lastEol = void 0;
    edits = edits.slice(0).sort((a, b) => {
      if (a.range && b.range) {
        return Range.compareRangesUsingStarts(a.range, b.range);
      }
      const aRng = a.range ? 0 : 1;
      const bRng = b.range ? 0 : 1;
      return aRng - bRng;
    });
    for (let { range, text, eol } of edits) {
      let addPositions2 = function(pos1, pos2) {
        return new Position(pos1.lineNumber + pos2.lineNumber - 1, pos2.lineNumber === 1 ? pos1.column + pos2.column - 1 : pos2.column);
      }, getText2 = function(lines, range2) {
        const result2 = [];
        for (let i = range2.startLineNumber; i <= range2.endLineNumber; i++) {
          const line = lines[i - 1];
          if (i === range2.startLineNumber && i === range2.endLineNumber) {
            result2.push(line.substring(range2.startColumn - 1, range2.endColumn - 1));
          } else if (i === range2.startLineNumber) {
            result2.push(line.substring(range2.startColumn - 1));
          } else if (i === range2.endLineNumber) {
            result2.push(line.substring(0, range2.endColumn - 1));
          } else {
            result2.push(line);
          }
        }
        return result2;
      };
      var addPositions = addPositions2, getText = getText2;
      __name(addPositions2, "addPositions");
      __name(getText2, "getText");
      if (typeof eol === "number") {
        lastEol = eol;
      }
      if (Range.isEmpty(range) && !text) {
        continue;
      }
      const original = model.getValueInRange(range);
      text = text.replace(/\r\n|\n|\r/g, model.eol);
      if (original === text) {
        continue;
      }
      if (Math.max(text.length, original.length) > EditorWorker._diffLimit) {
        result.push({ range, text });
        continue;
      }
      const originalLines = original.split(/\r\n|\n|\r/);
      const modifiedLines = text.split(/\r\n|\n|\r/);
      const diff = linesDiffComputers.getDefault().computeDiff(originalLines, modifiedLines, options);
      const start = Range.lift(range).getStartPosition();
      for (const c of diff.changes) {
        if (c.innerChanges) {
          for (const x of c.innerChanges) {
            result.push({
              range: Range.fromPositions(
                addPositions2(start, x.originalRange.getStartPosition()),
                addPositions2(start, x.originalRange.getEndPosition())
              ),
              text: getText2(modifiedLines, x.modifiedRange).join(model.eol)
            });
          }
        } else {
          throw new BugIndicatingError("The experimental diff algorithm always produces inner changes");
        }
      }
    }
    if (typeof lastEol === "number") {
      result.push({ eol: lastEol, text: "", range: { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 } });
    }
    return result;
  }
  // ---- END minimal edits ---------------------------------------------------------------
  async $computeLinks(modelUrl) {
    const model = this._getModel(modelUrl);
    if (!model) {
      return null;
    }
    return computeLinks(model);
  }
  // --- BEGIN default document colors -----------------------------------------------------------
  async $computeDefaultDocumentColors(modelUrl) {
    const model = this._getModel(modelUrl);
    if (!model) {
      return null;
    }
    return computeDefaultDocumentColors(model);
  }
  // ---- BEGIN suggest --------------------------------------------------------------------------
  static _suggestionsLimit = 1e4;
  async $textualSuggest(modelUrls, leadingWord, wordDef, wordDefFlags) {
    const sw = new StopWatch();
    const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
    const seen = /* @__PURE__ */ new Set();
    outer: for (const url of modelUrls) {
      const model = this._getModel(url);
      if (!model) {
        continue;
      }
      for (const word of model.words(wordDefRegExp)) {
        if (word === leadingWord || !isNaN(Number(word))) {
          continue;
        }
        seen.add(word);
        if (seen.size > EditorWorker._suggestionsLimit) {
          break outer;
        }
      }
    }
    return { words: Array.from(seen), duration: sw.elapsed() };
  }
  // ---- END suggest --------------------------------------------------------------------------
  //#region -- word ranges --
  async $computeWordRanges(modelUrl, range, wordDef, wordDefFlags) {
    const model = this._getModel(modelUrl);
    if (!model) {
      return /* @__PURE__ */ Object.create(null);
    }
    const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
    const result = /* @__PURE__ */ Object.create(null);
    for (let line = range.startLineNumber; line < range.endLineNumber; line++) {
      const words = model.getLineWords(line, wordDefRegExp);
      for (const word of words) {
        if (!isNaN(Number(word.word))) {
          continue;
        }
        let array = result[word.word];
        if (!array) {
          array = [];
          result[word.word] = array;
        }
        array.push({
          startLineNumber: line,
          startColumn: word.startColumn,
          endLineNumber: line,
          endColumn: word.endColumn
        });
      }
    }
    return result;
  }
  //#endregion
  async $navigateValueSet(modelUrl, range, up, wordDef, wordDefFlags) {
    const model = this._getModel(modelUrl);
    if (!model) {
      return null;
    }
    const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
    if (range.startColumn === range.endColumn) {
      range = {
        startLineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        endLineNumber: range.endLineNumber,
        endColumn: range.endColumn + 1
      };
    }
    const selectionText = model.getValueInRange(range);
    const wordRange = model.getWordAtPosition({ lineNumber: range.startLineNumber, column: range.startColumn }, wordDefRegExp);
    if (!wordRange) {
      return null;
    }
    const word = model.getValueInRange(wordRange);
    const result = BasicInplaceReplace.INSTANCE.navigateValueSet(range, selectionText, wordRange, word, up);
    return result;
  }
  // ---- BEGIN foreign module support --------------------------------------------------------------------------
  // foreign method request
  $fmr(method, args) {
    if (!this._foreignModule || typeof this._foreignModule[method] !== "function") {
      return Promise.reject(new Error("Missing requestHandler or method: " + method));
    }
    try {
      return Promise.resolve(this._foreignModule[method].apply(this._foreignModule, args));
    } catch (e) {
      return Promise.reject(e);
    }
  }
  // ---- END foreign module support --------------------------------------------------------------------------
}
if (typeof importScripts === "function") {
  globalThis.monaco = createMonacoBaseAPI();
}
export {
  EditorWorker
};
//# sourceMappingURL=editorWebWorker.js.map
