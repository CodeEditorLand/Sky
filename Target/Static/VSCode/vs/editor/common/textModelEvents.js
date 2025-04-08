var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IRange } from "./core/range.js";
import { Selection } from "./core/selection.js";
import { IModelDecoration, InjectedTextOptions } from "./model.js";
var RawContentChangedType = /* @__PURE__ */ ((RawContentChangedType2) => {
  RawContentChangedType2[RawContentChangedType2["Flush"] = 1] = "Flush";
  RawContentChangedType2[RawContentChangedType2["LineChanged"] = 2] = "LineChanged";
  RawContentChangedType2[RawContentChangedType2["LinesDeleted"] = 3] = "LinesDeleted";
  RawContentChangedType2[RawContentChangedType2["LinesInserted"] = 4] = "LinesInserted";
  RawContentChangedType2[RawContentChangedType2["EOLChanged"] = 5] = "EOLChanged";
  return RawContentChangedType2;
})(RawContentChangedType || {});
class ModelRawFlush {
  static {
    __name(this, "ModelRawFlush");
  }
  changeType = 1 /* Flush */;
}
class LineInjectedText {
  constructor(ownerId, lineNumber, column, options, order) {
    this.ownerId = ownerId;
    this.lineNumber = lineNumber;
    this.column = column;
    this.options = options;
    this.order = order;
  }
  static {
    __name(this, "LineInjectedText");
  }
  static applyInjectedText(lineText, injectedTexts) {
    if (!injectedTexts || injectedTexts.length === 0) {
      return lineText;
    }
    let result = "";
    let lastOriginalOffset = 0;
    for (const injectedText of injectedTexts) {
      result += lineText.substring(lastOriginalOffset, injectedText.column - 1);
      lastOriginalOffset = injectedText.column - 1;
      result += injectedText.options.content;
    }
    result += lineText.substring(lastOriginalOffset);
    return result;
  }
  static fromDecorations(decorations) {
    const result = [];
    for (const decoration of decorations) {
      if (decoration.options.before && decoration.options.before.content.length > 0) {
        result.push(new LineInjectedText(
          decoration.ownerId,
          decoration.range.startLineNumber,
          decoration.range.startColumn,
          decoration.options.before,
          0
        ));
      }
      if (decoration.options.after && decoration.options.after.content.length > 0) {
        result.push(new LineInjectedText(
          decoration.ownerId,
          decoration.range.endLineNumber,
          decoration.range.endColumn,
          decoration.options.after,
          1
        ));
      }
    }
    result.sort((a, b) => {
      if (a.lineNumber === b.lineNumber) {
        if (a.column === b.column) {
          return a.order - b.order;
        }
        return a.column - b.column;
      }
      return a.lineNumber - b.lineNumber;
    });
    return result;
  }
  withText(text) {
    return new LineInjectedText(this.ownerId, this.lineNumber, this.column, { ...this.options, content: text }, this.order);
  }
}
class ModelRawLineChanged {
  static {
    __name(this, "ModelRawLineChanged");
  }
  changeType = 2 /* LineChanged */;
  /**
   * The line that has changed.
   */
  lineNumber;
  /**
   * The new value of the line.
   */
  detail;
  /**
   * The injected text on the line.
   */
  injectedText;
  constructor(lineNumber, detail, injectedText) {
    this.lineNumber = lineNumber;
    this.detail = detail;
    this.injectedText = injectedText;
  }
}
class ModelRawLinesDeleted {
  static {
    __name(this, "ModelRawLinesDeleted");
  }
  changeType = 3 /* LinesDeleted */;
  /**
   * At what line the deletion began (inclusive).
   */
  fromLineNumber;
  /**
   * At what line the deletion stopped (inclusive).
   */
  toLineNumber;
  constructor(fromLineNumber, toLineNumber) {
    this.fromLineNumber = fromLineNumber;
    this.toLineNumber = toLineNumber;
  }
}
class ModelRawLinesInserted {
  static {
    __name(this, "ModelRawLinesInserted");
  }
  changeType = 4 /* LinesInserted */;
  /**
   * Before what line did the insertion begin
   */
  fromLineNumber;
  /**
   * `toLineNumber` - `fromLineNumber` + 1 denotes the number of lines that were inserted
   */
  toLineNumber;
  /**
   * The text that was inserted
   */
  detail;
  /**
   * The injected texts for every inserted line.
   */
  injectedTexts;
  constructor(fromLineNumber, toLineNumber, detail, injectedTexts) {
    this.injectedTexts = injectedTexts;
    this.fromLineNumber = fromLineNumber;
    this.toLineNumber = toLineNumber;
    this.detail = detail;
  }
}
class ModelRawEOLChanged {
  static {
    __name(this, "ModelRawEOLChanged");
  }
  changeType = 5 /* EOLChanged */;
}
class ModelRawContentChangedEvent {
  static {
    __name(this, "ModelRawContentChangedEvent");
  }
  changes;
  /**
   * The new version id the model has transitioned to.
   */
  versionId;
  /**
   * Flag that indicates that this event was generated while undoing.
   */
  isUndoing;
  /**
   * Flag that indicates that this event was generated while redoing.
   */
  isRedoing;
  resultingSelection;
  constructor(changes, versionId, isUndoing, isRedoing) {
    this.changes = changes;
    this.versionId = versionId;
    this.isUndoing = isUndoing;
    this.isRedoing = isRedoing;
    this.resultingSelection = null;
  }
  containsEvent(type) {
    for (let i = 0, len = this.changes.length; i < len; i++) {
      const change = this.changes[i];
      if (change.changeType === type) {
        return true;
      }
    }
    return false;
  }
  static merge(a, b) {
    const changes = [].concat(a.changes).concat(b.changes);
    const versionId = b.versionId;
    const isUndoing = a.isUndoing || b.isUndoing;
    const isRedoing = a.isRedoing || b.isRedoing;
    return new ModelRawContentChangedEvent(changes, versionId, isUndoing, isRedoing);
  }
}
class ModelInjectedTextChangedEvent {
  static {
    __name(this, "ModelInjectedTextChangedEvent");
  }
  changes;
  constructor(changes) {
    this.changes = changes;
  }
}
class InternalModelContentChangeEvent {
  constructor(rawContentChangedEvent, contentChangedEvent) {
    this.rawContentChangedEvent = rawContentChangedEvent;
    this.contentChangedEvent = contentChangedEvent;
  }
  static {
    __name(this, "InternalModelContentChangeEvent");
  }
  merge(other) {
    const rawContentChangedEvent = ModelRawContentChangedEvent.merge(this.rawContentChangedEvent, other.rawContentChangedEvent);
    const contentChangedEvent = InternalModelContentChangeEvent._mergeChangeEvents(this.contentChangedEvent, other.contentChangedEvent);
    return new InternalModelContentChangeEvent(rawContentChangedEvent, contentChangedEvent);
  }
  static _mergeChangeEvents(a, b) {
    const changes = [].concat(a.changes).concat(b.changes);
    const eol = b.eol;
    const versionId = b.versionId;
    const isUndoing = a.isUndoing || b.isUndoing;
    const isRedoing = a.isRedoing || b.isRedoing;
    const isFlush = a.isFlush || b.isFlush;
    const isEolChange = a.isEolChange && b.isEolChange;
    return {
      changes,
      eol,
      isEolChange,
      versionId,
      isUndoing,
      isRedoing,
      isFlush
    };
  }
}
export {
  InternalModelContentChangeEvent,
  LineInjectedText,
  ModelInjectedTextChangedEvent,
  ModelRawContentChangedEvent,
  ModelRawEOLChanged,
  ModelRawFlush,
  ModelRawLineChanged,
  ModelRawLinesDeleted,
  ModelRawLinesInserted,
  RawContentChangedType
};
//# sourceMappingURL=textModelEvents.js.map
