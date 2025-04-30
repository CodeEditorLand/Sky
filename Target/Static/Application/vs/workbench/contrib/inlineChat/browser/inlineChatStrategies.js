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
import { WindowIntervalTimer } from "../../../../base/browser/dom.js";
import { Emitter } from "../../../../base/common/event.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { themeColorFromId, ThemeIcon } from "../../../../base/common/themables.js";
import { StableEditorScrollState } from "../../../../editor/browser/stableEditorScroll.js";
import { LineSource, RenderOptions, renderLines } from "../../../../editor/browser/widget/diffEditor/components/diffEditorViewZones/renderLines.js";
import { LineRange } from "../../../../editor/common/core/lineRange.js";
import { Range } from "../../../../editor/common/core/range.js";
import { OverviewRulerLane } from "../../../../editor/common/model.js";
import { ModelDecorationOptions } from "../../../../editor/common/model/textModel.js";
import { IEditorWorkerService } from "../../../../editor/common/services/editorWorker.js";
import { InlineDecoration } from "../../../../editor/common/viewModel.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { Progress } from "../../../../platform/progress/common/progress.js";
import { countWords } from "../../chat/common/chatWordCounter.js";
import { ACTION_TOGGLE_DIFF, CTX_INLINE_CHAT_CHANGE_HAS_DIFF, CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF, MENU_INLINE_CHAT_ZONE, minimapInlineChatDiffInserted, overviewRulerInlineChatDiffInserted } from "../common/inlineChat.js";
import { assertType } from "../../../../base/common/types.js";
import { performAsyncTextEdit, asProgressiveEdit } from "./utils.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { Schemas } from "../../../../base/common/network.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { DefaultChatTextEditor } from "../../chat/browser/codeBlockPart.js";
import { isEqual } from "../../../../base/common/resources.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { ConflictActionsFactory } from "../../mergeEditor/browser/view/conflictActions.js";
import { observableValue } from "../../../../base/common/observable.js";
import { IMenuService, MenuItemAction } from "../../../../platform/actions/common/actions.js";
var HunkAction;
(function(HunkAction2) {
  HunkAction2[HunkAction2["Accept"] = 0] = "Accept";
  HunkAction2[HunkAction2["Discard"] = 1] = "Discard";
  HunkAction2[HunkAction2["MoveNext"] = 2] = "MoveNext";
  HunkAction2[HunkAction2["MovePrev"] = 3] = "MovePrev";
  HunkAction2[HunkAction2["ToggleDiff"] = 4] = "ToggleDiff";
})(HunkAction || (HunkAction = {}));
let LiveStrategy = class LiveStrategy2 {
  static {
    __name(this, "LiveStrategy");
  }
  constructor(_session, _editor, _zone, _showOverlayToolbar, contextKeyService, _editorWorkerService, _accessibilityService, _configService, _menuService, _contextService, _textFileService, _instaService) {
    this._session = _session;
    this._editor = _editor;
    this._zone = _zone;
    this._showOverlayToolbar = _showOverlayToolbar;
    this._editorWorkerService = _editorWorkerService;
    this._accessibilityService = _accessibilityService;
    this._configService = _configService;
    this._menuService = _menuService;
    this._contextService = _contextService;
    this._textFileService = _textFileService;
    this._instaService = _instaService;
    this._decoInsertedText = ModelDecorationOptions.register({
      description: "inline-modified-line",
      className: "inline-chat-inserted-range-linehighlight",
      isWholeLine: true,
      overviewRuler: {
        position: OverviewRulerLane.Full,
        color: themeColorFromId(overviewRulerInlineChatDiffInserted)
      },
      minimap: {
        position: 1,
        color: themeColorFromId(minimapInlineChatDiffInserted)
      }
    });
    this._decoInsertedTextRange = ModelDecorationOptions.register({
      description: "inline-chat-inserted-range-linehighlight",
      className: "inline-chat-inserted-range",
      stickiness: 1
    });
    this._store = new DisposableStore();
    this._onDidAccept = this._store.add(new Emitter());
    this._onDidDiscard = this._store.add(new Emitter());
    this._editCount = 0;
    this._hunkData = /* @__PURE__ */ new Map();
    this.onDidAccept = this._onDidAccept.event;
    this.onDidDiscard = this._onDidDiscard.event;
    this._ctxCurrentChangeHasDiff = CTX_INLINE_CHAT_CHANGE_HAS_DIFF.bindTo(contextKeyService);
    this._ctxCurrentChangeShowsDiff = CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF.bindTo(contextKeyService);
    this._progressiveEditingDecorations = this._editor.createDecorationsCollection();
    this._lensActionsFactory = this._store.add(new ConflictActionsFactory(this._editor));
  }
  dispose() {
    this._resetDiff();
    this._store.dispose();
  }
  _resetDiff() {
    this._ctxCurrentChangeHasDiff.reset();
    this._ctxCurrentChangeShowsDiff.reset();
    this._zone.widget.updateStatus("");
    this._progressiveEditingDecorations.clear();
    for (const data of this._hunkData.values()) {
      data.remove();
    }
  }
  async apply() {
    this._resetDiff();
    if (this._editCount > 0) {
      this._editor.pushUndoStop();
    }
    await this._doApplyChanges(true);
  }
  cancel() {
    this._resetDiff();
    return this._session.hunkData.discardAll();
  }
  async makeChanges(edits, obs, undoStopBefore) {
    return this._makeChanges(edits, obs, void 0, void 0, undoStopBefore);
  }
  async makeProgressiveChanges(edits, obs, opts, undoStopBefore) {
    const progress = new Progress((edits2) => {
      const newLines = /* @__PURE__ */ new Set();
      for (const edit of edits2) {
        LineRange.fromRange(edit.range).forEach((line) => newLines.add(line));
      }
      const existingRanges = this._progressiveEditingDecorations.getRanges().map(LineRange.fromRange);
      for (const existingRange of existingRanges) {
        existingRange.forEach((line) => newLines.delete(line));
      }
      const newDecorations = [];
      for (const line of newLines) {
        newDecorations.push({ range: new Range(line, 1, line, Number.MAX_VALUE), options: this._decoInsertedText });
      }
      this._progressiveEditingDecorations.append(newDecorations);
    });
    return this._makeChanges(edits, obs, opts, progress, undoStopBefore);
  }
  async _makeChanges(edits, obs, opts, progress, undoStopBefore) {
    if (undoStopBefore) {
      this._editor.pushUndoStop();
    }
    this._editCount++;
    if (opts) {
      const durationInSec = opts.duration / 1e3;
      for (const edit of edits) {
        const wordCount = countWords(edit.text ?? "");
        const speed = wordCount / durationInSec;
        const asyncEdit = asProgressiveEdit(new WindowIntervalTimer(this._zone.domNode), edit, speed, opts.token);
        await performAsyncTextEdit(this._session.textModelN, asyncEdit, progress, obs);
      }
    } else {
      obs.start();
      this._session.textModelN.pushEditOperations(null, edits, (undoEdits) => {
        progress?.report(undoEdits);
        return null;
      });
      obs.stop();
    }
  }
  performHunkAction(hunk, action) {
    const displayData = this._findDisplayData(hunk);
    if (!displayData) {
      if (action === 0) {
        this._onDidAccept.fire();
      } else if (action === 1) {
        this._onDidDiscard.fire();
      }
      return;
    }
    if (action === 0) {
      displayData.acceptHunk();
    } else if (action === 1) {
      displayData.discardHunk();
    } else if (action === 2) {
      displayData.move(true);
    } else if (action === 3) {
      displayData.move(false);
    } else if (action === 4) {
      displayData.toggleDiff?.();
    }
  }
  _findDisplayData(hunkInfo) {
    let result;
    if (hunkInfo) {
      result = this._hunkData.get(hunkInfo);
    }
    if (!result && this._zone.position) {
      const zoneLine = this._zone.position.lineNumber;
      let distance = Number.MAX_SAFE_INTEGER;
      for (const candidate of this._hunkData.values()) {
        if (candidate.hunk.getState() !== 0) {
          continue;
        }
        const hunkRanges = candidate.hunk.getRangesN();
        if (hunkRanges.length === 0) {
          continue;
        }
        const myDistance = zoneLine <= hunkRanges[0].startLineNumber ? hunkRanges[0].startLineNumber - zoneLine : zoneLine - hunkRanges[0].endLineNumber;
        if (myDistance < distance) {
          distance = myDistance;
          result = candidate;
        }
      }
    }
    if (!result) {
      result = Iterable.first(Iterable.filter(
        this._hunkData.values(),
        (candidate) => candidate.hunk.getState() === 0
        /* HunkState.Pending */
      ));
    }
    return result;
  }
  async renderChanges() {
    this._progressiveEditingDecorations.clear();
    const renderHunks = /* @__PURE__ */ __name(() => {
      let widgetData;
      changeDecorationsAndViewZones(this._editor, (decorationsAccessor, viewZoneAccessor) => {
        const keysNow = new Set(this._hunkData.keys());
        widgetData = void 0;
        for (const hunkData of this._session.hunkData.getInfo()) {
          keysNow.delete(hunkData);
          const hunkRanges = hunkData.getRangesN();
          let data = this._hunkData.get(hunkData);
          if (!data) {
            const decorationIds = [];
            for (let i = 0; i < hunkRanges.length; i++) {
              decorationIds.push(decorationsAccessor.addDecoration(hunkRanges[i], i === 0 ? this._decoInsertedText : this._decoInsertedTextRange));
            }
            const acceptHunk = /* @__PURE__ */ __name(() => {
              hunkData.acceptChanges();
              renderHunks();
            }, "acceptHunk");
            const discardHunk = /* @__PURE__ */ __name(() => {
              hunkData.discardChanges();
              renderHunks();
            }, "discardHunk");
            const mightContainNonBasicASCII = this._session.textModel0.mightContainNonBasicASCII();
            const mightContainRTL = this._session.textModel0.mightContainRTL();
            const renderOptions = RenderOptions.fromEditor(this._editor);
            const originalRange = hunkData.getRanges0()[0];
            const source = new LineSource(LineRange.fromRangeInclusive(originalRange).mapToLineArray((l) => this._session.textModel0.tokenization.getLineTokens(l)), [], mightContainNonBasicASCII, mightContainRTL);
            const domNode = document.createElement("div");
            domNode.className = "inline-chat-original-zone2";
            const result = renderLines(source, renderOptions, [new InlineDecoration(
              new Range(originalRange.startLineNumber, 1, originalRange.startLineNumber, 1),
              "",
              0
              /* InlineDecorationType.Regular */
            )], domNode);
            const viewZoneData = {
              afterLineNumber: -1,
              heightInLines: result.heightInLines,
              domNode,
              ordinal: 5e4 + 2
              // more than https://github.com/microsoft/vscode/blob/bf52a5cfb2c75a7327c9adeaefbddc06d529dcad/src/vs/workbench/contrib/inlineChat/browser/inlineChatZoneWidget.ts#L42
            };
            const toggleDiff = /* @__PURE__ */ __name(() => {
              const scrollState = StableEditorScrollState.capture(this._editor);
              changeDecorationsAndViewZones(this._editor, (_decorationsAccessor, viewZoneAccessor2) => {
                assertType(data);
                if (!data.diffViewZoneId) {
                  const [hunkRange] = hunkData.getRangesN();
                  viewZoneData.afterLineNumber = hunkRange.startLineNumber - 1;
                  data.diffViewZoneId = viewZoneAccessor2.addZone(viewZoneData);
                } else {
                  viewZoneAccessor2.removeZone(data.diffViewZoneId);
                  data.diffViewZoneId = void 0;
                }
              });
              this._ctxCurrentChangeShowsDiff.set(typeof data?.diffViewZoneId === "string");
              scrollState.restore(this._editor);
            }, "toggleDiff");
            let lensActions;
            const lensActionsViewZoneIds = [];
            if (this._showOverlayToolbar && hunkData.getState() === 0) {
              lensActions = new DisposableStore();
              const menu = this._menuService.createMenu(MENU_INLINE_CHAT_ZONE, this._contextService);
              const makeActions = /* @__PURE__ */ __name(() => {
                const actions = [];
                const tuples = menu.getActions({ arg: hunkData });
                for (const [, group] of tuples) {
                  for (const item of group) {
                    if (item instanceof MenuItemAction) {
                      let text = item.label;
                      if (item.id === ACTION_TOGGLE_DIFF) {
                        text = item.checked ? "Hide Changes" : "Show Changes";
                      } else if (ThemeIcon.isThemeIcon(item.item.icon)) {
                        text = `$(${item.item.icon.id}) ${text}`;
                      }
                      actions.push({
                        text,
                        tooltip: item.tooltip,
                        action: /* @__PURE__ */ __name(async () => item.run(), "action")
                      });
                    }
                  }
                }
                return actions;
              }, "makeActions");
              const obs = observableValue(this, makeActions());
              lensActions.add(menu.onDidChange(() => obs.set(makeActions(), void 0)));
              lensActions.add(menu);
              lensActions.add(this._lensActionsFactory.createWidget(viewZoneAccessor, hunkRanges[0].startLineNumber - 1, obs, lensActionsViewZoneIds));
            }
            const remove = /* @__PURE__ */ __name(() => {
              changeDecorationsAndViewZones(this._editor, (decorationsAccessor2, viewZoneAccessor2) => {
                assertType(data);
                for (const decorationId of data.decorationIds) {
                  decorationsAccessor2.removeDecoration(decorationId);
                }
                if (data.diffViewZoneId) {
                  viewZoneAccessor2.removeZone(data.diffViewZoneId);
                }
                data.decorationIds = [];
                data.diffViewZoneId = void 0;
                data.lensActionsViewZoneIds?.forEach(viewZoneAccessor2.removeZone);
                data.lensActionsViewZoneIds = void 0;
              });
              lensActions?.dispose();
            }, "remove");
            const move = /* @__PURE__ */ __name((next) => {
              const keys = Array.from(this._hunkData.keys());
              const idx = keys.indexOf(hunkData);
              const nextIdx = (idx + (next ? 1 : -1) + keys.length) % keys.length;
              if (nextIdx !== idx) {
                const nextData = this._hunkData.get(keys[nextIdx]);
                this._zone.updatePositionAndHeight(nextData?.position);
                renderHunks();
              }
            }, "move");
            const zoneLineNumber = this._zone.position?.lineNumber ?? this._editor.getPosition().lineNumber;
            const myDistance = zoneLineNumber <= hunkRanges[0].startLineNumber ? hunkRanges[0].startLineNumber - zoneLineNumber : zoneLineNumber - hunkRanges[0].endLineNumber;
            data = {
              hunk: hunkData,
              decorationIds,
              diffViewZoneId: "",
              diffViewZone: viewZoneData,
              lensActionsViewZoneIds,
              distance: myDistance,
              position: hunkRanges[0].getStartPosition().delta(-1),
              acceptHunk,
              discardHunk,
              toggleDiff: !hunkData.isInsertion() ? toggleDiff : void 0,
              remove,
              move
            };
            this._hunkData.set(hunkData, data);
          } else if (hunkData.getState() !== 0) {
            data.remove();
          } else {
            const zoneLineNumber = this._zone.position?.lineNumber ?? this._editor.getPosition().lineNumber;
            const modifiedRangeNow = hunkRanges[0];
            data.position = modifiedRangeNow.getStartPosition().delta(-1);
            data.distance = zoneLineNumber <= modifiedRangeNow.startLineNumber ? modifiedRangeNow.startLineNumber - zoneLineNumber : zoneLineNumber - modifiedRangeNow.endLineNumber;
          }
          if (hunkData.getState() === 0 && (!widgetData || data.distance < widgetData.distance)) {
            widgetData = data;
          }
        }
        for (const key of keysNow) {
          const data = this._hunkData.get(key);
          if (data) {
            this._hunkData.delete(key);
            data.remove();
          }
        }
      });
      if (widgetData) {
        this._zone.reveal(widgetData.position);
        const mode = this._configService.getValue(
          "inlineChat.accessibleDiffView"
          /* InlineChatConfigKeys.AccessibleDiffView */
        );
        if (mode === "on" || mode === "auto" && this._accessibilityService.isScreenReaderOptimized()) {
          this._zone.widget.showAccessibleHunk(this._session, widgetData.hunk);
        }
        this._ctxCurrentChangeHasDiff.set(Boolean(widgetData.toggleDiff));
      } else if (this._hunkData.size > 0) {
        let oneAccepted = false;
        for (const hunkData of this._session.hunkData.getInfo()) {
          if (hunkData.getState() === 1) {
            oneAccepted = true;
            break;
          }
        }
        if (oneAccepted) {
          this._onDidAccept.fire();
        } else {
          this._onDidDiscard.fire();
        }
      }
      return widgetData;
    }, "renderHunks");
    return renderHunks()?.position;
  }
  getWholeRangeDecoration() {
    return [];
  }
  async _doApplyChanges(ignoreLocal) {
    const untitledModels = [];
    const editor = this._instaService.createInstance(DefaultChatTextEditor);
    for (const request of this._session.chatModel.getRequests()) {
      if (!request.response?.response) {
        continue;
      }
      for (const item of request.response.response.value) {
        if (item.kind !== "textEditGroup") {
          continue;
        }
        if (ignoreLocal && isEqual(item.uri, this._session.textModelN.uri)) {
          continue;
        }
        await editor.apply(request.response, item, void 0);
        if (item.uri.scheme === Schemas.untitled) {
          const untitled = this._textFileService.untitled.get(item.uri);
          if (untitled) {
            untitledModels.push(untitled);
          }
        }
      }
    }
    for (const untitledModel of untitledModels) {
      if (!untitledModel.isDisposed()) {
        await untitledModel.resolve();
        await untitledModel.save({
          reason: 1
          /* SaveReason.EXPLICIT */
        });
      }
    }
  }
};
LiveStrategy = __decorate([
  __param(4, IContextKeyService),
  __param(5, IEditorWorkerService),
  __param(6, IAccessibilityService),
  __param(7, IConfigurationService),
  __param(8, IMenuService),
  __param(9, IContextKeyService),
  __param(10, ITextFileService),
  __param(11, IInstantiationService)
], LiveStrategy);
function changeDecorationsAndViewZones(editor, callback) {
  editor.changeDecorations((decorationsAccessor) => {
    editor.changeViewZones((viewZoneAccessor) => {
      callback(decorationsAccessor, viewZoneAccessor);
    });
  });
}
__name(changeDecorationsAndViewZones, "changeDecorationsAndViewZones");
export {
  HunkAction,
  LiveStrategy
};
//# sourceMappingURL=inlineChatStrategies.js.map
