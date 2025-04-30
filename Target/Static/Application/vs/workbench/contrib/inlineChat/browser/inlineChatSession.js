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
var HunkData_1;
import { Emitter, Event } from "../../../../base/common/event.js";
import { CTX_INLINE_CHAT_HAS_STASHED_SESSION } from "../common/inlineChat.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ModelDecorationOptions } from "../../../../editor/common/model/textModel.js";
import { EditOperation } from "../../../../editor/common/core/editOperation.js";
import { DetailedLineRangeMapping } from "../../../../editor/common/diff/rangeMapping.js";
import { IInlineChatSessionService } from "./inlineChatSessionService.js";
import { IEditorWorkerService } from "../../../../editor/common/services/editorWorker.js";
import { coalesceInPlace } from "../../../../base/common/arrays.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
class SessionWholeRange {
  static {
    __name(this, "SessionWholeRange");
  }
  static {
    this._options = ModelDecorationOptions.register({ description: "inlineChat/session/wholeRange" });
  }
  constructor(_textModel, wholeRange) {
    this._textModel = _textModel;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._decorationIds = [];
    this._decorationIds = _textModel.deltaDecorations([], [{ range: wholeRange, options: SessionWholeRange._options }]);
  }
  dispose() {
    this._onDidChange.dispose();
    if (!this._textModel.isDisposed()) {
      this._textModel.deltaDecorations(this._decorationIds, []);
    }
  }
  fixup(changes) {
    const newDeco = [];
    for (const { modified } of changes) {
      const modifiedRange = this._textModel.validateRange(modified.isEmpty ? new Range(modified.startLineNumber, 1, modified.startLineNumber, Number.MAX_SAFE_INTEGER) : new Range(modified.startLineNumber, 1, modified.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER));
      newDeco.push({ range: modifiedRange, options: SessionWholeRange._options });
    }
    const [first, ...rest] = this._decorationIds;
    const newIds = this._textModel.deltaDecorations(rest, newDeco);
    this._decorationIds = [first].concat(newIds);
    this._onDidChange.fire(this);
  }
  get trackedInitialRange() {
    const [first] = this._decorationIds;
    return this._textModel.getDecorationRange(first) ?? new Range(1, 1, 1, 1);
  }
  get value() {
    let result;
    for (const id of this._decorationIds) {
      const range = this._textModel.getDecorationRange(id);
      if (range) {
        if (!result) {
          result = range;
        } else {
          result = Range.plusRange(result, range);
        }
      }
    }
    return result;
  }
}
class Session {
  static {
    __name(this, "Session");
  }
  constructor(headless, targetUri, textModel0, textModelN, agent, wholeRange, hunkData, chatModel, versionsByRequest) {
    this.headless = headless;
    this.targetUri = targetUri;
    this.textModel0 = textModel0;
    this.textModelN = textModelN;
    this.agent = agent;
    this.wholeRange = wholeRange;
    this.hunkData = hunkData;
    this.chatModel = chatModel;
    this._isUnstashed = false;
    this._startTime = /* @__PURE__ */ new Date();
    this._versionByRequest = /* @__PURE__ */ new Map();
    this._teldata = {
      extension: ExtensionIdentifier.toKey(agent.extensionId),
      startTime: this._startTime.toISOString(),
      endTime: this._startTime.toISOString(),
      edits: 0,
      finishedByEdit: false,
      rounds: "",
      undos: "",
      unstashed: 0,
      acceptedHunks: 0,
      discardedHunks: 0,
      responseTypes: ""
    };
    if (versionsByRequest) {
      this._versionByRequest = new Map(versionsByRequest);
    }
  }
  get isUnstashed() {
    return this._isUnstashed;
  }
  markUnstashed() {
    this._teldata.unstashed += 1;
    this._isUnstashed = true;
  }
  markModelVersion(request) {
    this._versionByRequest.set(request.id, this.textModelN.getAlternativeVersionId());
  }
  get versionsByRequest() {
    return Array.from(this._versionByRequest);
  }
  async undoChangesUntil(requestId) {
    const targetAltVersion = this._versionByRequest.get(requestId);
    if (targetAltVersion === void 0) {
      return false;
    }
    this.hunkData.ignoreTextModelNChanges = true;
    try {
      while (targetAltVersion < this.textModelN.getAlternativeVersionId() && this.textModelN.canUndo()) {
        await this.textModelN.undo();
      }
    } finally {
      this.hunkData.ignoreTextModelNChanges = false;
    }
    return true;
  }
  get hasChangedText() {
    return !this.textModel0.equalsTextBuffer(this.textModelN.getTextBuffer());
  }
  asChangedText(changes) {
    if (changes.length === 0) {
      return void 0;
    }
    let startLine = Number.MAX_VALUE;
    let endLine = Number.MIN_VALUE;
    for (const change of changes) {
      startLine = Math.min(startLine, change.modified.startLineNumber);
      endLine = Math.max(endLine, change.modified.endLineNumberExclusive);
    }
    return this.textModelN.getValueInRange(new Range(startLine, 1, endLine, Number.MAX_VALUE));
  }
  recordExternalEditOccurred(didFinish) {
    this._teldata.edits += 1;
    this._teldata.finishedByEdit = didFinish;
  }
  asTelemetryData() {
    for (const item of this.hunkData.getInfo()) {
      switch (item.getState()) {
        case 1:
          this._teldata.acceptedHunks += 1;
          break;
        case 2:
          this._teldata.discardedHunks += 1;
          break;
      }
    }
    this._teldata.endTime = (/* @__PURE__ */ new Date()).toISOString();
    return this._teldata;
  }
}
let StashedSession = class StashedSession2 {
  static {
    __name(this, "StashedSession");
  }
  constructor(editor, session, _undoCancelEdits, contextKeyService, _sessionService, _logService) {
    this._undoCancelEdits = _undoCancelEdits;
    this._sessionService = _sessionService;
    this._logService = _logService;
    this._ctxHasStashedSession = CTX_INLINE_CHAT_HAS_STASHED_SESSION.bindTo(contextKeyService);
    this._session = session;
    this._ctxHasStashedSession.set(true);
    this._listener = Event.once(Event.any(editor.onDidChangeCursorSelection, editor.onDidChangeModelContent, editor.onDidChangeModel, editor.onDidBlurEditorWidget))(() => {
      this._session = void 0;
      this._sessionService.releaseSession(session);
      this._ctxHasStashedSession.reset();
    });
  }
  dispose() {
    this._listener.dispose();
    this._ctxHasStashedSession.reset();
    if (this._session) {
      this._sessionService.releaseSession(this._session);
    }
  }
  unstash() {
    if (!this._session) {
      return void 0;
    }
    this._listener.dispose();
    const result = this._session;
    result.markUnstashed();
    result.hunkData.ignoreTextModelNChanges = true;
    result.textModelN.pushEditOperations(null, this._undoCancelEdits, () => null);
    result.hunkData.ignoreTextModelNChanges = false;
    this._session = void 0;
    this._logService.debug("[IE] Unstashed session");
    return result;
  }
};
StashedSession = __decorate([
  __param(3, IContextKeyService),
  __param(4, IInlineChatSessionService),
  __param(5, ILogService)
], StashedSession);
function lineRangeAsRange(lineRange, model) {
  return lineRange.isEmpty ? new Range(lineRange.startLineNumber, 1, lineRange.startLineNumber, Number.MAX_SAFE_INTEGER) : new Range(lineRange.startLineNumber, 1, lineRange.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER);
}
__name(lineRangeAsRange, "lineRangeAsRange");
let HunkData = class HunkData2 {
  static {
    __name(this, "HunkData");
  }
  static {
    HunkData_1 = this;
  }
  static {
    this._HUNK_TRACKED_RANGE = ModelDecorationOptions.register({
      description: "inline-chat-hunk-tracked-range",
      stickiness: 0
      /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */
    });
  }
  static {
    this._HUNK_THRESHOLD = 8;
  }
  constructor(_editorWorkerService, _textModel0, _textModelN) {
    this._editorWorkerService = _editorWorkerService;
    this._textModel0 = _textModel0;
    this._textModelN = _textModelN;
    this._store = new DisposableStore();
    this._data = /* @__PURE__ */ new Map();
    this._ignoreChanges = false;
    this._store.add(_textModelN.onDidChangeContent((e) => {
      if (!this._ignoreChanges) {
        this._mirrorChanges(e);
      }
    }));
  }
  dispose() {
    if (!this._textModelN.isDisposed()) {
      this._textModelN.changeDecorations((accessor) => {
        for (const { textModelNDecorations } of this._data.values()) {
          textModelNDecorations.forEach(accessor.removeDecoration, accessor);
        }
      });
    }
    if (!this._textModel0.isDisposed()) {
      this._textModel0.changeDecorations((accessor) => {
        for (const { textModel0Decorations } of this._data.values()) {
          textModel0Decorations.forEach(accessor.removeDecoration, accessor);
        }
      });
    }
    this._data.clear();
    this._store.dispose();
  }
  set ignoreTextModelNChanges(value) {
    this._ignoreChanges = value;
  }
  get ignoreTextModelNChanges() {
    return this._ignoreChanges;
  }
  _mirrorChanges(event) {
    const hunkRanges = [];
    const ranges0 = [];
    for (const entry of this._data.values()) {
      if (entry.state === 0) {
        for (let i = 1; i < entry.textModelNDecorations.length; i++) {
          const rangeN = this._textModelN.getDecorationRange(entry.textModelNDecorations[i]);
          const range0 = this._textModel0.getDecorationRange(entry.textModel0Decorations[i]);
          if (rangeN && range0) {
            hunkRanges.push({
              rangeN,
              range0,
              markAccepted: /* @__PURE__ */ __name(() => entry.state = 1, "markAccepted")
              /* HunkState.Accepted */
            });
          }
        }
      } else if (entry.state === 1) {
        for (let i = 1; i < entry.textModel0Decorations.length; i++) {
          const range = this._textModel0.getDecorationRange(entry.textModel0Decorations[i]);
          if (range) {
            ranges0.push(range);
          }
        }
      }
    }
    hunkRanges.sort((a, b) => Range.compareRangesUsingStarts(a.rangeN, b.rangeN));
    ranges0.sort(Range.compareRangesUsingStarts);
    const edits = [];
    for (const change of event.changes) {
      let isOverlapping = false;
      let pendingChangesLen = 0;
      for (const entry of hunkRanges) {
        if (entry.rangeN.getEndPosition().isBefore(Range.getStartPosition(change.range))) {
          pendingChangesLen += this._textModelN.getValueLengthInRange(entry.rangeN);
          pendingChangesLen -= this._textModel0.getValueLengthInRange(entry.range0);
        } else if (Range.areIntersectingOrTouching(entry.rangeN, change.range)) {
          entry.markAccepted();
          isOverlapping = true;
          break;
        } else {
          break;
        }
      }
      if (isOverlapping) {
        continue;
      }
      const offset0 = change.rangeOffset - pendingChangesLen;
      const start0 = this._textModel0.getPositionAt(offset0);
      let acceptedChangesLen = 0;
      for (const range of ranges0) {
        if (range.getEndPosition().isBefore(start0)) {
          acceptedChangesLen += this._textModel0.getValueLengthInRange(range);
        }
      }
      const start = this._textModel0.getPositionAt(offset0 + acceptedChangesLen);
      const end = this._textModel0.getPositionAt(offset0 + acceptedChangesLen + change.rangeLength);
      edits.push(EditOperation.replace(Range.fromPositions(start, end), change.text));
    }
    this._textModel0.pushEditOperations(null, edits, () => null);
  }
  async recompute(editState, diff) {
    diff ??= await this._editorWorkerService.computeDiff(this._textModel0.uri, this._textModelN.uri, { ignoreTrimWhitespace: false, maxComputationTimeMs: Number.MAX_SAFE_INTEGER, computeMoves: false }, "advanced");
    let mergedChanges = [];
    if (diff && diff.changes.length > 0) {
      mergedChanges = [diff.changes[0]];
      for (let i = 1; i < diff.changes.length; i++) {
        const lastChange = mergedChanges[mergedChanges.length - 1];
        const thisChange = diff.changes[i];
        if (thisChange.modified.startLineNumber - lastChange.modified.endLineNumberExclusive <= HunkData_1._HUNK_THRESHOLD) {
          mergedChanges[mergedChanges.length - 1] = new DetailedLineRangeMapping(lastChange.original.join(thisChange.original), lastChange.modified.join(thisChange.modified), (lastChange.innerChanges ?? []).concat(thisChange.innerChanges ?? []));
        } else {
          mergedChanges.push(thisChange);
        }
      }
    }
    const hunks = mergedChanges.map((change) => new RawHunk(change.original, change.modified, change.innerChanges ?? []));
    editState.applied = hunks.length;
    this._textModelN.changeDecorations((accessorN) => {
      this._textModel0.changeDecorations((accessor0) => {
        for (const { textModelNDecorations, textModel0Decorations } of this._data.values()) {
          textModelNDecorations.forEach(accessorN.removeDecoration, accessorN);
          textModel0Decorations.forEach(accessor0.removeDecoration, accessor0);
        }
        this._data.clear();
        for (const hunk of hunks) {
          const textModelNDecorations = [];
          const textModel0Decorations = [];
          textModelNDecorations.push(accessorN.addDecoration(lineRangeAsRange(hunk.modified, this._textModelN), HunkData_1._HUNK_TRACKED_RANGE));
          textModel0Decorations.push(accessor0.addDecoration(lineRangeAsRange(hunk.original, this._textModel0), HunkData_1._HUNK_TRACKED_RANGE));
          for (const change of hunk.changes) {
            textModelNDecorations.push(accessorN.addDecoration(change.modifiedRange, HunkData_1._HUNK_TRACKED_RANGE));
            textModel0Decorations.push(accessor0.addDecoration(change.originalRange, HunkData_1._HUNK_TRACKED_RANGE));
          }
          this._data.set(hunk, {
            editState,
            textModelNDecorations,
            textModel0Decorations,
            state: 0
            /* HunkState.Pending */
          });
        }
      });
    });
  }
  get size() {
    return this._data.size;
  }
  get pending() {
    return Iterable.reduce(this._data.values(), (r, { state }) => r + (state === 0 ? 1 : 0), 0);
  }
  _discardEdits(item) {
    const edits = [];
    const rangesN = item.getRangesN();
    const ranges0 = item.getRanges0();
    for (let i = 1; i < rangesN.length; i++) {
      const modifiedRange = rangesN[i];
      const originalValue = this._textModel0.getValueInRange(ranges0[i]);
      edits.push(EditOperation.replace(modifiedRange, originalValue));
    }
    return edits;
  }
  discardAll() {
    const edits = [];
    for (const item of this.getInfo()) {
      if (item.getState() === 0) {
        edits.push(this._discardEdits(item));
      }
    }
    const undoEdits = [];
    this._textModelN.pushEditOperations(null, edits.flat(), (_undoEdits) => {
      undoEdits.push(_undoEdits);
      return null;
    });
    return undoEdits.flat();
  }
  getInfo() {
    const result = [];
    for (const [hunk, data] of this._data.entries()) {
      const item = {
        getState: /* @__PURE__ */ __name(() => {
          return data.state;
        }, "getState"),
        isInsertion: /* @__PURE__ */ __name(() => {
          return hunk.original.isEmpty;
        }, "isInsertion"),
        getRangesN: /* @__PURE__ */ __name(() => {
          const ranges = data.textModelNDecorations.map((id) => this._textModelN.getDecorationRange(id));
          coalesceInPlace(ranges);
          return ranges;
        }, "getRangesN"),
        getRanges0: /* @__PURE__ */ __name(() => {
          const ranges = data.textModel0Decorations.map((id) => this._textModel0.getDecorationRange(id));
          coalesceInPlace(ranges);
          return ranges;
        }, "getRanges0"),
        discardChanges: /* @__PURE__ */ __name(() => {
          if (data.state === 0) {
            const edits = this._discardEdits(item);
            this._textModelN.pushEditOperations(null, edits, () => null);
            data.state = 2;
            if (data.editState.applied > 0) {
              data.editState.applied -= 1;
            }
          }
        }, "discardChanges"),
        acceptChanges: /* @__PURE__ */ __name(() => {
          if (data.state === 0) {
            const edits = [];
            const rangesN = item.getRangesN();
            const ranges0 = item.getRanges0();
            for (let i = 1; i < ranges0.length; i++) {
              const originalRange = ranges0[i];
              const modifiedValue = this._textModelN.getValueInRange(rangesN[i]);
              edits.push(EditOperation.replace(originalRange, modifiedValue));
            }
            this._textModel0.pushEditOperations(null, edits, () => null);
            data.state = 1;
          }
        }, "acceptChanges")
      };
      result.push(item);
    }
    return result;
  }
};
HunkData = HunkData_1 = __decorate([
  __param(0, IEditorWorkerService)
], HunkData);
class RawHunk {
  static {
    __name(this, "RawHunk");
  }
  constructor(original, modified, changes) {
    this.original = original;
    this.modified = modified;
    this.changes = changes;
  }
}
var HunkState;
(function(HunkState2) {
  HunkState2[HunkState2["Pending"] = 0] = "Pending";
  HunkState2[HunkState2["Accepted"] = 1] = "Accepted";
  HunkState2[HunkState2["Rejected"] = 2] = "Rejected";
})(HunkState || (HunkState = {}));
export {
  HunkData,
  HunkState,
  Session,
  SessionWholeRange,
  StashedSession
};
//# sourceMappingURL=inlineChatSession.js.map
