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
import { ITreeSitterImporter } from "../treeSitterParserService.js";
import { Disposable, DisposableMap, DisposableStore, dispose } from "../../../../base/common/lifecycle.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { setTimeout0 } from "../../../../base/common/platform.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { cancelOnDispose } from "../../../../base/common/cancellation.js";
import { Range } from "../../core/range.js";
import { LimitedQueue } from "../../../../base/common/async.js";
import { TextLength } from "../../core/textLength.js";
import { FileAccess } from "../../../../base/common/network.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { CancellationError, isCancellationError } from "../../../../base/common/errors.js";
import { getClosestPreviousNodes, gotoNthChild, gotoParent, nextSiblingOrParentSibling } from "./cursorUtils.js";
var TelemetryParseType;
(function(TelemetryParseType2) {
  TelemetryParseType2["Full"] = "fullParse";
  TelemetryParseType2["Incremental"] = "incrementalParse";
})(TelemetryParseType || (TelemetryParseType = {}));
let TextModelTreeSitter = class TextModelTreeSitter2 extends Disposable {
  static {
    __name(this, "TextModelTreeSitter");
  }
  get parseResult() {
    return this._rootTreeSitterTree;
  }
  constructor(textModel, _treeSitterLanguages, parseImmediately = true, _treeSitterImporter, _logService, _telemetryService, _fileService) {
    super();
    this.textModel = textModel;
    this._treeSitterLanguages = _treeSitterLanguages;
    this._treeSitterImporter = _treeSitterImporter;
    this._logService = _logService;
    this._telemetryService = _telemetryService;
    this._fileService = _fileService;
    this._onDidChangeParseResult = this._register(new Emitter());
    this.onDidChangeParseResult = this._onDidChangeParseResult.event;
    this._injectionTreeSitterTrees = this._register(new DisposableMap());
    this._versionId = 0;
    this._parseSessionDisposables = this._register(new DisposableStore());
    if (parseImmediately) {
      this._register(Event.runAndSubscribe(this.textModel.onDidChangeLanguage, (e) => this._onDidChangeLanguage(e ? e.newLanguage : this.textModel.getLanguageId())));
    } else {
      this._register(this.textModel.onDidChangeLanguage((e) => this._onDidChangeLanguage(e ? e.newLanguage : this.textModel.getLanguageId())));
    }
  }
  async _onDidChangeLanguage(languageId) {
    this.parse(languageId);
  }
  /**
   * Be very careful when making changes to this method as it is easy to introduce race conditions.
   */
  async parse(languageId = this.textModel.getLanguageId()) {
    this._parseSessionDisposables.clear();
    this._rootTreeSitterTree = void 0;
    const token = cancelOnDispose(this._parseSessionDisposables);
    let language;
    try {
      language = await this._getLanguage(languageId, token);
    } catch (e) {
      if (isCancellationError(e)) {
        return;
      }
      throw e;
    }
    const Parser = await this._treeSitterImporter.getParserClass();
    if (token.isCancellationRequested) {
      return;
    }
    const treeSitterTree = this._parseSessionDisposables.add(new TreeSitterParseResult(new Parser(), languageId, language, this._logService, this._telemetryService));
    this._rootTreeSitterTree = treeSitterTree;
    this._parseSessionDisposables.add(treeSitterTree.onDidUpdate((e) => this._handleTreeUpdate(e)));
    this._parseSessionDisposables.add(this.textModel.onDidChangeContent((e) => this._onDidChangeContent(treeSitterTree, [e])));
    this._onDidChangeContent(treeSitterTree, void 0);
    if (token.isCancellationRequested) {
      return;
    }
    return this._rootTreeSitterTree;
  }
  _getLanguage(languageId, token) {
    const language = this._treeSitterLanguages.getOrInitLanguage(languageId);
    if (language) {
      return Promise.resolve(language);
    }
    const disposables = [];
    return new Promise((resolve, reject) => {
      disposables.push(this._treeSitterLanguages.onDidAddLanguage((e) => {
        if (e.id === languageId) {
          dispose(disposables);
          resolve(e.language);
        }
      }));
      token.onCancellationRequested(() => {
        dispose(disposables);
        reject(new CancellationError());
      }, void 0, disposables);
    });
  }
  async _handleTreeUpdate(e, parentTreeResult, parentLanguage) {
    if (e.ranges && e.versionId >= this._versionId) {
      this._versionId = e.versionId;
      const tree = parentTreeResult ?? this._rootTreeSitterTree;
      let injections;
      if (tree.tree) {
        injections = await this._collectInjections(tree.tree);
        if (injections) {
          this._processInjections(injections, tree, parentLanguage ?? this.textModel.getLanguageId(), e.includedModelChanges);
        }
      }
      this._onDidChangeParseResult.fire({ ranges: e.ranges, versionId: e.versionId, tree: this, languageId: this.textModel.getLanguageId(), hasInjections: !!injections && injections.size > 0 });
    }
  }
  async _ensureInjectionQueries() {
    if (!this._queries) {
      const injectionsQueriesLocation = `vs/editor/common/languages/injections/${this.textModel.getLanguageId()}.scm`;
      const uri = FileAccess.asFileUri(injectionsQueriesLocation);
      if (!await this._fileService.exists(uri)) {
        this._queries = "";
      } else if (this._fileService.hasProvider(uri)) {
        const query = await this._fileService.readFile(uri);
        this._queries = query.value.toString();
      } else {
        this._queries = "";
      }
    }
    return this._queries;
  }
  async _getQuery() {
    if (!this._query) {
      const language = await this._treeSitterLanguages.getLanguage(this.textModel.getLanguageId());
      if (!language) {
        return;
      }
      const queries = await this._ensureInjectionQueries();
      if (queries === "") {
        return;
      }
      const Query = await this._treeSitterImporter.getQueryClass();
      this._query = new Query(language, queries);
    }
    return this._query;
  }
  async _collectInjections(tree) {
    const query = await this._getQuery();
    if (!query) {
      return;
    }
    if (!tree?.rootNode) {
      return;
    }
    const cursor = tree.walk();
    const injections = /* @__PURE__ */ new Map();
    let hasNext = true;
    while (hasNext) {
      hasNext = await this._processNode(cursor, query, injections);
      await new Promise((resolve) => setTimeout0(resolve));
    }
    return this._mergeAdjacentRanges(injections);
  }
  _processNode(cursor, query, injections) {
    const node = cursor.currentNode;
    const nodeLineCount = node.endPosition.row - node.startPosition.row;
    if (nodeLineCount <= 1e3) {
      this._processCaptures(query, node, injections);
      return cursor.gotoNextSibling() || this.gotoNextSiblingOfAncestor(cursor);
    } else {
      return cursor.gotoFirstChild() || cursor.gotoNextSibling() || this.gotoNextSiblingOfAncestor(cursor);
    }
  }
  _processCaptures(query, node, injections) {
    const captures = query.captures(node);
    for (const capture of captures) {
      const injectionLanguage = capture.setProperties?.["injection.language"];
      if (injectionLanguage) {
        const range = this._createRangeFromNode(capture.node);
        if (!injections.has(injectionLanguage)) {
          injections.set(injectionLanguage, []);
        }
        injections.get(injectionLanguage)?.push(range);
      }
    }
  }
  _createRangeFromNode(node) {
    return {
      startIndex: node.startIndex,
      endIndex: node.endIndex,
      startPosition: { row: node.startPosition.row, column: node.startPosition.column },
      endPosition: { row: node.endPosition.row, column: node.endPosition.column }
    };
  }
  _mergeAdjacentRanges(injections) {
    for (const [languageId, ranges] of injections) {
      if (ranges.length <= 1) {
        continue;
      }
      const mergedRanges = [];
      let current = ranges[0];
      for (let i = 1; i < ranges.length; i++) {
        const next = ranges[i];
        if (next.startIndex <= current.endIndex) {
          current = this._mergeRanges(current, next);
        } else {
          mergedRanges.push(current);
          current = next;
        }
      }
      mergedRanges.push(current);
      injections.set(languageId, mergedRanges);
    }
    return injections;
  }
  _mergeRanges(current, next) {
    return {
      startIndex: current.startIndex,
      endIndex: Math.max(current.endIndex, next.endIndex),
      startPosition: current.startPosition,
      endPosition: next.endPosition.row > current.endPosition.row ? next.endPosition : current.endPosition
    };
  }
  async _processInjections(injections, parentTree, parentLanguage, modelChanges) {
    if (injections.size === 0) {
      this._injectionTreeSitterTrees.clearAndDisposeAll();
      return;
    }
    const unseenInjections = new Set(this._injectionTreeSitterTrees.keys());
    for (const [languageId, ranges] of injections) {
      const language = await this._treeSitterLanguages.getLanguage(languageId);
      if (!language) {
        continue;
      }
      const treeSitterTree = await this._getOrCreateInjectedTree(languageId, language, parentTree, parentLanguage);
      if (treeSitterTree) {
        unseenInjections.delete(languageId);
        this._onDidChangeContent(treeSitterTree, modelChanges, ranges);
      }
    }
    for (const unseenInjection of unseenInjections) {
      this._injectionTreeSitterTrees.deleteAndDispose(unseenInjection);
    }
  }
  async _getOrCreateInjectedTree(languageId, language, parentTree, parentLanguage) {
    let treeSitterTree = this._injectionTreeSitterTrees.get(languageId);
    if (!treeSitterTree) {
      const Parser = await this._treeSitterImporter.getParserClass();
      treeSitterTree = new TreeSitterParseResult(new Parser(), languageId, language, this._logService, this._telemetryService);
      this._parseSessionDisposables.add(treeSitterTree.onDidUpdate((e) => this._handleTreeUpdate(e, parentTree, parentLanguage)));
      this._injectionTreeSitterTrees.set(languageId, treeSitterTree);
    }
    return treeSitterTree;
  }
  gotoNextSiblingOfAncestor(cursor) {
    while (cursor.gotoParent()) {
      if (cursor.gotoNextSibling()) {
        return true;
      }
    }
    return false;
  }
  getInjection(offset, parentLanguage) {
    if (this._injectionTreeSitterTrees.size === 0) {
      return void 0;
    }
    let hasFoundParentLanguage = parentLanguage === this.textModel.getLanguageId();
    for (const [_, treeSitterTree] of this._injectionTreeSitterTrees) {
      if (treeSitterTree.tree) {
        if (hasFoundParentLanguage && treeSitterTree.ranges?.find((r) => r.startIndex <= offset && r.endIndex >= offset)) {
          return treeSitterTree;
        }
        if (!hasFoundParentLanguage && treeSitterTree.languageId === parentLanguage) {
          hasFoundParentLanguage = true;
        }
      }
    }
    return void 0;
  }
  _onDidChangeContent(treeSitterTree, change, ranges) {
    treeSitterTree.onDidChangeContent(this.textModel, change, ranges);
  }
};
TextModelTreeSitter = __decorate([
  __param(3, ITreeSitterImporter),
  __param(4, ILogService),
  __param(5, ITelemetryService),
  __param(6, IFileService)
], TextModelTreeSitter);
class TreeSitterParseResult {
  static {
    __name(this, "TreeSitterParseResult");
  }
  get versionId() {
    return this._versionId;
  }
  constructor(parser, languageId, language, _logService, _telemetryService) {
    this.parser = parser;
    this.languageId = languageId;
    this.language = language;
    this._logService = _logService;
    this._telemetryService = _telemetryService;
    this._onDidUpdate = new Emitter();
    this.onDidUpdate = this._onDidUpdate.event;
    this._versionId = 0;
    this._editVersion = 0;
    this._isDisposed = false;
    this._onDidChangeContentQueue = new LimitedQueue();
    this._lastYieldTime = 0;
    this.parser.setLanguage(language);
  }
  dispose() {
    this._isDisposed = true;
    this._onDidUpdate.dispose();
    this._tree?.delete();
    this._lastFullyParsed?.delete();
    this._lastFullyParsedWithEdits?.delete();
    this.parser?.delete();
  }
  get tree() {
    return this._lastFullyParsed;
  }
  get isDisposed() {
    return this._isDisposed;
  }
  findChangedNodes(newTree, oldTree) {
    const newCursor = newTree.walk();
    const oldCursor = oldTree.walk();
    const nodes = [];
    let next = true;
    do {
      if (newCursor.currentNode.hasChanges) {
        const newChildren = newCursor.currentNode.children;
        const indexChangedChildren = [];
        const changedChildren = newChildren.filter((c, index) => {
          if (c?.hasChanges || oldCursor.currentNode.children.length <= index) {
            indexChangedChildren.push(index);
            return true;
          }
          return false;
        });
        if (changedChildren.length === 0 || newCursor.currentNode.hasError !== oldCursor.currentNode.hasError) {
          while (newCursor.currentNode.parent && next && !newCursor.currentNode.isNamed) {
            next = gotoParent(newCursor, oldCursor);
          }
          const newNode = newCursor.currentNode;
          const closestPreviousNode = getClosestPreviousNodes(newCursor, newTree) ?? newNode;
          nodes.push({
            startIndex: closestPreviousNode.startIndex,
            endIndex: newNode.endIndex,
            startPosition: closestPreviousNode.startPosition,
            endPosition: newNode.endPosition
          });
          next = nextSiblingOrParentSibling(newCursor, oldCursor);
        } else if (changedChildren.length >= 1) {
          next = gotoNthChild(newCursor, oldCursor, indexChangedChildren[0]);
        }
      } else {
        next = nextSiblingOrParentSibling(newCursor, oldCursor);
      }
    } while (next);
    return nodes;
  }
  findTreeChanges(newTree, changedNodes, newRanges) {
    let newRangeIndex = 0;
    const mergedChanges = [];
    for (let nodeIndex = 0; nodeIndex < changedNodes.length; nodeIndex++) {
      const node = changedNodes[nodeIndex];
      if (mergedChanges.length > 0) {
        if (node.startIndex >= mergedChanges[mergedChanges.length - 1].newRangeStartOffset && node.endIndex <= mergedChanges[mergedChanges.length - 1].newRangeEndOffset) {
          continue;
        }
      }
      const cursor = newTree.walk();
      const cursorContainersNode = /* @__PURE__ */ __name(() => cursor.startIndex < node.startIndex && cursor.endIndex > node.endIndex, "cursorContainersNode");
      while (cursorContainersNode()) {
        let child = cursor.gotoFirstChild();
        let foundChild = false;
        while (child) {
          if (cursorContainersNode() && cursor.currentNode.isNamed) {
            foundChild = true;
            break;
          } else {
            child = cursor.gotoNextSibling();
          }
        }
        if (!foundChild) {
          cursor.gotoParent();
          break;
        }
        if (cursor.currentNode.childCount === 0) {
          break;
        }
      }
      let nodesInRange;
      const foundNodeSize = cursor.endIndex - cursor.startIndex;
      if (foundNodeSize > 5e3) {
        let child = cursor.gotoFirstChild();
        nodesInRange = [];
        while (child) {
          if (cursor.endIndex > node.startIndex) {
            nodesInRange.push(cursor.currentNode);
            do {
              child = cursor.gotoNextSibling();
            } while (child && cursor.endIndex < node.endIndex);
            nodesInRange.push(cursor.currentNode);
            break;
          }
          child = cursor.gotoNextSibling();
        }
      } else {
        nodesInRange = [cursor.currentNode];
      }
      while (cursor.currentNode.id !== nodesInRange[0].id) {
        cursor.gotoPreviousSibling();
      }
      const previousNode = getClosestPreviousNodes(cursor, newTree);
      const startPosition = previousNode ? previousNode.endPosition : nodesInRange[0].startPosition;
      const startIndex = previousNode ? previousNode.endIndex : nodesInRange[0].startIndex;
      const endPosition = nodesInRange[nodesInRange.length - 1].endPosition;
      const endIndex = nodesInRange[nodesInRange.length - 1].endIndex;
      const newChange = { newRange: new Range(startPosition.row + 1, startPosition.column + 1, endPosition.row + 1, endPosition.column + 1), newRangeStartOffset: startIndex, newRangeEndOffset: endIndex };
      if (newRangeIndex < newRanges.length && rangesIntersect(newRanges[newRangeIndex], { startIndex, endIndex, startPosition, endPosition })) {
        if (newRanges[newRangeIndex].startIndex < newChange.newRangeStartOffset) {
          newChange.newRange = newChange.newRange.setStartPosition(newRanges[newRangeIndex].startPosition.row + 1, newRanges[newRangeIndex].startPosition.column + 1);
          newChange.newRangeStartOffset = newRanges[newRangeIndex].startIndex;
        }
        if (newRanges[newRangeIndex].endIndex > newChange.newRangeEndOffset) {
          newChange.newRange = newChange.newRange.setEndPosition(newRanges[newRangeIndex].endPosition.row + 1, newRanges[newRangeIndex].endPosition.column + 1);
          newChange.newRangeEndOffset = newRanges[newRangeIndex].endIndex;
        }
        newRangeIndex++;
      } else if (newRangeIndex < newRanges.length && newRanges[newRangeIndex].endIndex < newChange.newRangeStartOffset) {
        mergedChanges.push({
          newRange: new Range(newRanges[newRangeIndex].startPosition.row + 1, newRanges[newRangeIndex].startPosition.column + 1, newRanges[newRangeIndex].endPosition.row + 1, newRanges[newRangeIndex].endPosition.column + 1),
          newRangeStartOffset: newRanges[newRangeIndex].startIndex,
          newRangeEndOffset: newRanges[newRangeIndex].endIndex
        });
      }
      if (mergedChanges.length > 0 && mergedChanges[mergedChanges.length - 1].newRangeEndOffset >= newChange.newRangeStartOffset) {
        mergedChanges[mergedChanges.length - 1].newRange = Range.fromPositions(mergedChanges[mergedChanges.length - 1].newRange.getStartPosition(), newChange.newRange.getEndPosition());
        mergedChanges[mergedChanges.length - 1].newRangeEndOffset = newChange.newRangeEndOffset;
      } else {
        mergedChanges.push(newChange);
      }
    }
    return this._constrainRanges(mergedChanges);
  }
  _constrainRanges(changes) {
    if (!this.ranges) {
      return changes;
    }
    const constrainedChanges = [];
    let changesIndex = 0;
    let rangesIndex = 0;
    while (changesIndex < changes.length && rangesIndex < this.ranges.length) {
      const change = changes[changesIndex];
      const range = this.ranges[rangesIndex];
      if (change.newRangeEndOffset < range.startIndex) {
        changesIndex++;
      } else if (change.newRangeStartOffset > range.endIndex) {
        rangesIndex++;
      } else {
        const newRangeStartOffset = Math.max(change.newRangeStartOffset, range.startIndex);
        const newRangeEndOffset = Math.min(change.newRangeEndOffset, range.endIndex);
        const newRange = change.newRange.intersectRanges(new Range(range.startPosition.row + 1, range.startPosition.column + 1, range.endPosition.row + 1, range.endPosition.column + 1));
        constrainedChanges.push({
          newRange,
          newRangeEndOffset,
          newRangeStartOffset
        });
        if (newRangeEndOffset < change.newRangeEndOffset) {
          change.newRange = Range.fromPositions(newRange.getEndPosition(), change.newRange.getEndPosition());
          change.newRangeStartOffset = newRangeEndOffset + 1;
        } else {
          changesIndex++;
        }
      }
    }
    return constrainedChanges;
  }
  onDidChangeContent(model, changes, ranges) {
    const version = model.getVersionId();
    if (version === this._editVersion) {
      return;
    }
    let newRanges = [];
    if (ranges) {
      newRanges = this._setRanges(ranges);
    }
    if (changes && changes.length > 0) {
      if (this._unfiredChanges) {
        this._unfiredChanges.push(...changes);
      } else {
        this._unfiredChanges = changes;
      }
      for (const change of changes) {
        this._applyEdits(change.changes, version);
      }
    } else {
      this._applyEdits([], version);
    }
    this._onDidChangeContentQueue.queue(async () => {
      if (this.isDisposed) {
        return;
      }
      const oldTree = this._lastFullyParsed;
      let changedNodes;
      if (this._lastFullyParsedWithEdits && this._lastFullyParsed) {
        changedNodes = this.findChangedNodes(this._lastFullyParsedWithEdits, this._lastFullyParsed);
      }
      const completed = await this._parseAndUpdateTree(model, version);
      if (completed) {
        let ranges2;
        if (!changedNodes) {
          if (this._ranges) {
            ranges2 = this._ranges.map((r) => ({ newRange: new Range(r.startPosition.row + 1, r.startPosition.column + 1, r.endPosition.row + 1, r.endPosition.column + 1), oldRangeLength: r.endIndex - r.startIndex, newRangeStartOffset: r.startIndex, newRangeEndOffset: r.endIndex }));
          } else {
            ranges2 = [{ newRange: model.getFullModelRange(), newRangeStartOffset: 0, newRangeEndOffset: model.getValueLength() }];
          }
        } else if (oldTree && changedNodes) {
          ranges2 = this.findTreeChanges(completed, changedNodes, newRanges);
        }
        const changes2 = this._unfiredChanges ?? [];
        this._unfiredChanges = void 0;
        this._onDidUpdate.fire({ language: this.languageId, ranges: ranges2, versionId: version, tree: completed, includedModelChanges: changes2 });
      }
    });
  }
  _applyEdits(changes, version) {
    for (const change of changes) {
      const originalTextLength = TextLength.ofRange(Range.lift(change.range));
      const newTextLength = TextLength.ofText(change.text);
      const summedTextLengths = change.text.length === 0 ? newTextLength : originalTextLength.add(newTextLength);
      const edit = {
        startIndex: change.rangeOffset,
        oldEndIndex: change.rangeOffset + change.rangeLength,
        newEndIndex: change.rangeOffset + change.text.length,
        startPosition: { row: change.range.startLineNumber - 1, column: change.range.startColumn - 1 },
        oldEndPosition: { row: change.range.endLineNumber - 1, column: change.range.endColumn - 1 },
        newEndPosition: { row: change.range.startLineNumber + summedTextLengths.lineCount - 1, column: summedTextLengths.lineCount ? summedTextLengths.columnCount : change.range.endColumn + summedTextLengths.columnCount }
      };
      this._tree?.edit(edit);
      this._lastFullyParsedWithEdits?.edit(edit);
    }
    this._editVersion = version;
  }
  async _parseAndUpdateTree(model, version) {
    const tree = await this._parse(model);
    if (tree) {
      this._tree?.delete();
      this._tree = tree;
      this._lastFullyParsed?.delete();
      this._lastFullyParsed = tree.copy();
      this._lastFullyParsedWithEdits?.delete();
      this._lastFullyParsedWithEdits = tree.copy();
      this._versionId = version;
      return tree;
    } else if (!this._tree) {
      this.parser.reset();
    }
    return void 0;
  }
  _parse(model) {
    let parseType = "fullParse";
    if (this.tree) {
      parseType = "incrementalParse";
    }
    return this._parseAndYield(model, parseType);
  }
  async _parseAndYield(model, parseType) {
    let time = 0;
    let passes = 0;
    const inProgressVersion = this._editVersion;
    let newTree;
    this._lastYieldTime = performance.now();
    do {
      const timer = performance.now();
      try {
        newTree = this.parser.parse((index, position) => this._parseCallback(model, index), this._tree, { progressCallback: this._parseProgressCallback.bind(this), includedRanges: this._ranges });
      } catch (e) {
      } finally {
        time += performance.now() - timer;
        passes++;
      }
      await new Promise((resolve) => setTimeout0(resolve));
    } while (!model.isDisposed() && !this.isDisposed && !newTree && inProgressVersion === model.getVersionId());
    this.sendParseTimeTelemetry(parseType, time, passes);
    return newTree && inProgressVersion === model.getVersionId() ? newTree : void 0;
  }
  _parseProgressCallback(state) {
    const now = performance.now();
    if (now - this._lastYieldTime > 50) {
      this._lastYieldTime = now;
      return true;
    }
    return false;
  }
  _parseCallback(textModel, index) {
    try {
      return textModel.getTextBuffer().getNearestChunk(index);
    } catch (e) {
      this._logService.debug("Error getting chunk for tree-sitter parsing", e);
    }
    return void 0;
  }
  _setRanges(newRanges) {
    const unKnownRanges = [];
    if (this._ranges) {
      for (const newRange of newRanges) {
        let isFullyIncluded = false;
        for (let i = 0; i < this._ranges.length; i++) {
          const existingRange = this._ranges[i];
          if (rangesEqual(existingRange, newRange) || rangesIntersect(existingRange, newRange)) {
            isFullyIncluded = true;
            break;
          }
        }
        if (!isFullyIncluded) {
          unKnownRanges.push(newRange);
        }
      }
    } else {
      unKnownRanges.push(...newRanges);
    }
    this._ranges = newRanges;
    return unKnownRanges;
  }
  get ranges() {
    return this._ranges;
  }
  sendParseTimeTelemetry(parseType, time, passes) {
    this._logService.debug(`Tree parsing (${parseType}) took ${time} ms and ${passes} passes.`);
    if (parseType === "fullParse") {
      this._telemetryService.publicLog2(`treeSitter.fullParse`, { languageId: this.languageId, time, passes });
    } else {
      this._telemetryService.publicLog2(`treeSitter.incrementalParse`, { languageId: this.languageId, time, passes });
    }
  }
}
function rangesEqual(a, b) {
  return a.startPosition.row === b.startPosition.row && a.startPosition.column === b.startPosition.column && a.endPosition.row === b.endPosition.row && a.endPosition.column === b.endPosition.column && a.startIndex === b.startIndex && a.endIndex === b.endIndex;
}
__name(rangesEqual, "rangesEqual");
function rangesIntersect(a, b) {
  return a.startIndex <= b.startIndex && a.endIndex >= b.startIndex || b.startIndex <= a.startIndex && b.endIndex >= a.startIndex;
}
__name(rangesIntersect, "rangesIntersect");
export {
  TextModelTreeSitter,
  TreeSitterParseResult
};
//# sourceMappingURL=textModelTreeSitter.js.map
