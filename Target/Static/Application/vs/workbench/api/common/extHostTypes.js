var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Disposable_1, Position_1, Range_1, Selection_1, TextEdit_1, NotebookEdit_1, SnippetString_1, Location_1, SymbolInformation_1, DocumentSymbol_1, CodeActionKind_1, MarkdownString_1, TaskGroup_1, Task_1, TreeItem_1, FileSystemError_1, TestMessage_1;
import { asArray, coalesceInPlace, equals } from "../../../base/common/arrays.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { illegalArgument } from "../../../base/common/errors.js";
import { MarkdownString as BaseMarkdownString } from "../../../base/common/htmlContent.js";
import { ResourceMap } from "../../../base/common/map.js";
import { Mimes, normalizeMimeType } from "../../../base/common/mime.js";
import { nextCharLength } from "../../../base/common/strings.js";
import { isNumber, isObject, isString, isStringArray } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { FileSystemProviderErrorCode, markAsFileSystemProviderError } from "../../../platform/files/common/files.js";
import { RemoteAuthorityResolverErrorCode } from "../../../platform/remote/common/remoteAuthorityResolver.js";
import { isTextStreamMime } from "../../contrib/notebook/common/notebookCommon.js";
function es5ClassCompat(target) {
  const interceptFunctions = {
    apply: /* @__PURE__ */ __name(function(...args) {
      if (args.length === 0) {
        return Reflect.construct(target, []);
      } else {
        const argsList = args.length === 1 ? [] : args[1];
        return Reflect.construct(target, argsList, args[0].constructor);
      }
    }, "apply"),
    call: /* @__PURE__ */ __name(function(...args) {
      if (args.length === 0) {
        return Reflect.construct(target, []);
      } else {
        const [thisArg, ...restArgs] = args;
        return Reflect.construct(target, restArgs, thisArg.constructor);
      }
    }, "call")
  };
  return Object.assign(target, interceptFunctions);
}
__name(es5ClassCompat, "es5ClassCompat");
var TerminalOutputAnchor;
(function(TerminalOutputAnchor2) {
  TerminalOutputAnchor2[TerminalOutputAnchor2["Top"] = 0] = "Top";
  TerminalOutputAnchor2[TerminalOutputAnchor2["Bottom"] = 1] = "Bottom";
})(TerminalOutputAnchor || (TerminalOutputAnchor = {}));
var TerminalQuickFixType;
(function(TerminalQuickFixType2) {
  TerminalQuickFixType2[TerminalQuickFixType2["TerminalCommand"] = 0] = "TerminalCommand";
  TerminalQuickFixType2[TerminalQuickFixType2["Opener"] = 1] = "Opener";
  TerminalQuickFixType2[TerminalQuickFixType2["Command"] = 3] = "Command";
})(TerminalQuickFixType || (TerminalQuickFixType = {}));
let Disposable = Disposable_1 = class Disposable2 {
  static {
    __name(this, "Disposable");
  }
  static from(...inDisposables) {
    let disposables = inDisposables;
    return new Disposable_1(function() {
      if (disposables) {
        for (const disposable of disposables) {
          if (disposable && typeof disposable.dispose === "function") {
            disposable.dispose();
          }
        }
        disposables = void 0;
      }
    });
  }
  #callOnDispose;
  constructor(callOnDispose) {
    this.#callOnDispose = callOnDispose;
  }
  dispose() {
    if (typeof this.#callOnDispose === "function") {
      this.#callOnDispose();
      this.#callOnDispose = void 0;
    }
  }
};
Disposable = Disposable_1 = __decorate([
  es5ClassCompat
], Disposable);
let Position = Position_1 = class Position2 {
  static {
    __name(this, "Position");
  }
  static Min(...positions) {
    if (positions.length === 0) {
      throw new TypeError();
    }
    let result = positions[0];
    for (let i = 1; i < positions.length; i++) {
      const p = positions[i];
      if (p.isBefore(result)) {
        result = p;
      }
    }
    return result;
  }
  static Max(...positions) {
    if (positions.length === 0) {
      throw new TypeError();
    }
    let result = positions[0];
    for (let i = 1; i < positions.length; i++) {
      const p = positions[i];
      if (p.isAfter(result)) {
        result = p;
      }
    }
    return result;
  }
  static isPosition(other) {
    if (!other) {
      return false;
    }
    if (other instanceof Position_1) {
      return true;
    }
    const { line, character } = other;
    if (typeof line === "number" && typeof character === "number") {
      return true;
    }
    return false;
  }
  static of(obj) {
    if (obj instanceof Position_1) {
      return obj;
    } else if (this.isPosition(obj)) {
      return new Position_1(obj.line, obj.character);
    }
    throw new Error("Invalid argument, is NOT a position-like object");
  }
  get line() {
    return this._line;
  }
  get character() {
    return this._character;
  }
  constructor(line, character) {
    if (line < 0) {
      throw illegalArgument("line must be non-negative");
    }
    if (character < 0) {
      throw illegalArgument("character must be non-negative");
    }
    this._line = line;
    this._character = character;
  }
  isBefore(other) {
    if (this._line < other._line) {
      return true;
    }
    if (other._line < this._line) {
      return false;
    }
    return this._character < other._character;
  }
  isBeforeOrEqual(other) {
    if (this._line < other._line) {
      return true;
    }
    if (other._line < this._line) {
      return false;
    }
    return this._character <= other._character;
  }
  isAfter(other) {
    return !this.isBeforeOrEqual(other);
  }
  isAfterOrEqual(other) {
    return !this.isBefore(other);
  }
  isEqual(other) {
    return this._line === other._line && this._character === other._character;
  }
  compareTo(other) {
    if (this._line < other._line) {
      return -1;
    } else if (this._line > other.line) {
      return 1;
    } else {
      if (this._character < other._character) {
        return -1;
      } else if (this._character > other._character) {
        return 1;
      } else {
        return 0;
      }
    }
  }
  translate(lineDeltaOrChange, characterDelta = 0) {
    if (lineDeltaOrChange === null || characterDelta === null) {
      throw illegalArgument();
    }
    let lineDelta;
    if (typeof lineDeltaOrChange === "undefined") {
      lineDelta = 0;
    } else if (typeof lineDeltaOrChange === "number") {
      lineDelta = lineDeltaOrChange;
    } else {
      lineDelta = typeof lineDeltaOrChange.lineDelta === "number" ? lineDeltaOrChange.lineDelta : 0;
      characterDelta = typeof lineDeltaOrChange.characterDelta === "number" ? lineDeltaOrChange.characterDelta : 0;
    }
    if (lineDelta === 0 && characterDelta === 0) {
      return this;
    }
    return new Position_1(this.line + lineDelta, this.character + characterDelta);
  }
  with(lineOrChange, character = this.character) {
    if (lineOrChange === null || character === null) {
      throw illegalArgument();
    }
    let line;
    if (typeof lineOrChange === "undefined") {
      line = this.line;
    } else if (typeof lineOrChange === "number") {
      line = lineOrChange;
    } else {
      line = typeof lineOrChange.line === "number" ? lineOrChange.line : this.line;
      character = typeof lineOrChange.character === "number" ? lineOrChange.character : this.character;
    }
    if (line === this.line && character === this.character) {
      return this;
    }
    return new Position_1(line, character);
  }
  toJSON() {
    return { line: this.line, character: this.character };
  }
  [Symbol.for("debug.description")]() {
    return `(${this.line}:${this.character})`;
  }
};
Position = Position_1 = __decorate([
  es5ClassCompat
], Position);
let Range = Range_1 = class Range2 {
  static {
    __name(this, "Range");
  }
  static isRange(thing) {
    if (thing instanceof Range_1) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return Position.isPosition(thing.start) && Position.isPosition(thing.end);
  }
  static of(obj) {
    if (obj instanceof Range_1) {
      return obj;
    }
    if (this.isRange(obj)) {
      return new Range_1(obj.start, obj.end);
    }
    throw new Error("Invalid argument, is NOT a range-like object");
  }
  get start() {
    return this._start;
  }
  get end() {
    return this._end;
  }
  constructor(startLineOrStart, startColumnOrEnd, endLine, endColumn) {
    let start;
    let end;
    if (typeof startLineOrStart === "number" && typeof startColumnOrEnd === "number" && typeof endLine === "number" && typeof endColumn === "number") {
      start = new Position(startLineOrStart, startColumnOrEnd);
      end = new Position(endLine, endColumn);
    } else if (Position.isPosition(startLineOrStart) && Position.isPosition(startColumnOrEnd)) {
      start = Position.of(startLineOrStart);
      end = Position.of(startColumnOrEnd);
    }
    if (!start || !end) {
      throw new Error("Invalid arguments");
    }
    if (start.isBefore(end)) {
      this._start = start;
      this._end = end;
    } else {
      this._start = end;
      this._end = start;
    }
  }
  contains(positionOrRange) {
    if (Range_1.isRange(positionOrRange)) {
      return this.contains(positionOrRange.start) && this.contains(positionOrRange.end);
    } else if (Position.isPosition(positionOrRange)) {
      if (Position.of(positionOrRange).isBefore(this._start)) {
        return false;
      }
      if (this._end.isBefore(positionOrRange)) {
        return false;
      }
      return true;
    }
    return false;
  }
  isEqual(other) {
    return this._start.isEqual(other._start) && this._end.isEqual(other._end);
  }
  intersection(other) {
    const start = Position.Max(other.start, this._start);
    const end = Position.Min(other.end, this._end);
    if (start.isAfter(end)) {
      return void 0;
    }
    return new Range_1(start, end);
  }
  union(other) {
    if (this.contains(other)) {
      return this;
    } else if (other.contains(this)) {
      return other;
    }
    const start = Position.Min(other.start, this._start);
    const end = Position.Max(other.end, this.end);
    return new Range_1(start, end);
  }
  get isEmpty() {
    return this._start.isEqual(this._end);
  }
  get isSingleLine() {
    return this._start.line === this._end.line;
  }
  with(startOrChange, end = this.end) {
    if (startOrChange === null || end === null) {
      throw illegalArgument();
    }
    let start;
    if (!startOrChange) {
      start = this.start;
    } else if (Position.isPosition(startOrChange)) {
      start = startOrChange;
    } else {
      start = startOrChange.start || this.start;
      end = startOrChange.end || this.end;
    }
    if (start.isEqual(this._start) && end.isEqual(this.end)) {
      return this;
    }
    return new Range_1(start, end);
  }
  toJSON() {
    return [this.start, this.end];
  }
  [Symbol.for("debug.description")]() {
    return getDebugDescriptionOfRange(this);
  }
};
Range = Range_1 = __decorate([
  es5ClassCompat
], Range);
let Selection = Selection_1 = class Selection2 extends Range {
  static {
    __name(this, "Selection");
  }
  static isSelection(thing) {
    if (thing instanceof Selection_1) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return Range.isRange(thing) && Position.isPosition(thing.anchor) && Position.isPosition(thing.active) && typeof thing.isReversed === "boolean";
  }
  get anchor() {
    return this._anchor;
  }
  get active() {
    return this._active;
  }
  constructor(anchorLineOrAnchor, anchorColumnOrActive, activeLine, activeColumn) {
    let anchor;
    let active;
    if (typeof anchorLineOrAnchor === "number" && typeof anchorColumnOrActive === "number" && typeof activeLine === "number" && typeof activeColumn === "number") {
      anchor = new Position(anchorLineOrAnchor, anchorColumnOrActive);
      active = new Position(activeLine, activeColumn);
    } else if (Position.isPosition(anchorLineOrAnchor) && Position.isPosition(anchorColumnOrActive)) {
      anchor = Position.of(anchorLineOrAnchor);
      active = Position.of(anchorColumnOrActive);
    }
    if (!anchor || !active) {
      throw new Error("Invalid arguments");
    }
    super(anchor, active);
    this._anchor = anchor;
    this._active = active;
  }
  get isReversed() {
    return this._anchor === this._end;
  }
  toJSON() {
    return {
      start: this.start,
      end: this.end,
      active: this.active,
      anchor: this.anchor
    };
  }
  [Symbol.for("debug.description")]() {
    return getDebugDescriptionOfSelection(this);
  }
};
Selection = Selection_1 = __decorate([
  es5ClassCompat
], Selection);
function getDebugDescriptionOfRange(range) {
  return range.isEmpty ? `[${range.start.line}:${range.start.character})` : `[${range.start.line}:${range.start.character} -> ${range.end.line}:${range.end.character})`;
}
__name(getDebugDescriptionOfRange, "getDebugDescriptionOfRange");
function getDebugDescriptionOfSelection(selection) {
  let rangeStr = getDebugDescriptionOfRange(selection);
  if (!selection.isEmpty) {
    if (selection.active.isEqual(selection.start)) {
      rangeStr = `|${rangeStr}`;
    } else {
      rangeStr = `${rangeStr}|`;
    }
  }
  return rangeStr;
}
__name(getDebugDescriptionOfSelection, "getDebugDescriptionOfSelection");
const validateConnectionToken = /* @__PURE__ */ __name((connectionToken) => {
  if (typeof connectionToken !== "string" || connectionToken.length === 0 || !/^[0-9A-Za-z_\-]+$/.test(connectionToken)) {
    throw illegalArgument("connectionToken");
  }
}, "validateConnectionToken");
class ResolvedAuthority {
  static {
    __name(this, "ResolvedAuthority");
  }
  static isResolvedAuthority(resolvedAuthority) {
    return resolvedAuthority && typeof resolvedAuthority === "object" && typeof resolvedAuthority.host === "string" && typeof resolvedAuthority.port === "number" && (resolvedAuthority.connectionToken === void 0 || typeof resolvedAuthority.connectionToken === "string");
  }
  constructor(host, port, connectionToken) {
    if (typeof host !== "string" || host.length === 0) {
      throw illegalArgument("host");
    }
    if (typeof port !== "number" || port === 0 || Math.round(port) !== port) {
      throw illegalArgument("port");
    }
    if (typeof connectionToken !== "undefined") {
      validateConnectionToken(connectionToken);
    }
    this.host = host;
    this.port = Math.round(port);
    this.connectionToken = connectionToken;
  }
}
class ManagedResolvedAuthority {
  static {
    __name(this, "ManagedResolvedAuthority");
  }
  static isManagedResolvedAuthority(resolvedAuthority) {
    return resolvedAuthority && typeof resolvedAuthority === "object" && typeof resolvedAuthority.makeConnection === "function" && (resolvedAuthority.connectionToken === void 0 || typeof resolvedAuthority.connectionToken === "string");
  }
  constructor(makeConnection, connectionToken) {
    this.makeConnection = makeConnection;
    this.connectionToken = connectionToken;
    if (typeof connectionToken !== "undefined") {
      validateConnectionToken(connectionToken);
    }
  }
}
class RemoteAuthorityResolverError extends Error {
  static {
    __name(this, "RemoteAuthorityResolverError");
  }
  static NotAvailable(message, handled) {
    return new RemoteAuthorityResolverError(message, RemoteAuthorityResolverErrorCode.NotAvailable, handled);
  }
  static TemporarilyNotAvailable(message) {
    return new RemoteAuthorityResolverError(message, RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable);
  }
  constructor(message, code = RemoteAuthorityResolverErrorCode.Unknown, detail) {
    super(message);
    this._message = message;
    this._code = code;
    this._detail = detail;
    Object.setPrototypeOf(this, RemoteAuthorityResolverError.prototype);
  }
}
var EndOfLine;
(function(EndOfLine2) {
  EndOfLine2[EndOfLine2["LF"] = 1] = "LF";
  EndOfLine2[EndOfLine2["CRLF"] = 2] = "CRLF";
})(EndOfLine || (EndOfLine = {}));
var EnvironmentVariableMutatorType;
(function(EnvironmentVariableMutatorType2) {
  EnvironmentVariableMutatorType2[EnvironmentVariableMutatorType2["Replace"] = 1] = "Replace";
  EnvironmentVariableMutatorType2[EnvironmentVariableMutatorType2["Append"] = 2] = "Append";
  EnvironmentVariableMutatorType2[EnvironmentVariableMutatorType2["Prepend"] = 3] = "Prepend";
})(EnvironmentVariableMutatorType || (EnvironmentVariableMutatorType = {}));
let TextEdit = TextEdit_1 = class TextEdit2 {
  static {
    __name(this, "TextEdit");
  }
  static isTextEdit(thing) {
    if (thing instanceof TextEdit_1) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return Range.isRange(thing) && typeof thing.newText === "string";
  }
  static replace(range, newText) {
    return new TextEdit_1(range, newText);
  }
  static insert(position, newText) {
    return TextEdit_1.replace(new Range(position, position), newText);
  }
  static delete(range) {
    return TextEdit_1.replace(range, "");
  }
  static setEndOfLine(eol) {
    const ret = new TextEdit_1(new Range(new Position(0, 0), new Position(0, 0)), "");
    ret.newEol = eol;
    return ret;
  }
  get range() {
    return this._range;
  }
  set range(value) {
    if (value && !Range.isRange(value)) {
      throw illegalArgument("range");
    }
    this._range = value;
  }
  get newText() {
    return this._newText || "";
  }
  set newText(value) {
    if (value && typeof value !== "string") {
      throw illegalArgument("newText");
    }
    this._newText = value;
  }
  get newEol() {
    return this._newEol;
  }
  set newEol(value) {
    if (value && typeof value !== "number") {
      throw illegalArgument("newEol");
    }
    this._newEol = value;
  }
  constructor(range, newText) {
    this._range = range;
    this._newText = newText;
  }
  toJSON() {
    return {
      range: this.range,
      newText: this.newText,
      newEol: this._newEol
    };
  }
};
TextEdit = TextEdit_1 = __decorate([
  es5ClassCompat
], TextEdit);
let NotebookEdit = NotebookEdit_1 = class NotebookEdit2 {
  static {
    __name(this, "NotebookEdit");
  }
  static isNotebookCellEdit(thing) {
    if (thing instanceof NotebookEdit_1) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return NotebookRange.isNotebookRange(thing) && Array.isArray(thing.newCells);
  }
  static replaceCells(range, newCells) {
    return new NotebookEdit_1(range, newCells);
  }
  static insertCells(index, newCells) {
    return new NotebookEdit_1(new NotebookRange(index, index), newCells);
  }
  static deleteCells(range) {
    return new NotebookEdit_1(range, []);
  }
  static updateCellMetadata(index, newMetadata) {
    const edit = new NotebookEdit_1(new NotebookRange(index, index), []);
    edit.newCellMetadata = newMetadata;
    return edit;
  }
  static updateNotebookMetadata(newMetadata) {
    const edit = new NotebookEdit_1(new NotebookRange(0, 0), []);
    edit.newNotebookMetadata = newMetadata;
    return edit;
  }
  constructor(range, newCells) {
    this.range = range;
    this.newCells = newCells;
  }
};
NotebookEdit = NotebookEdit_1 = __decorate([
  es5ClassCompat
], NotebookEdit);
class SnippetTextEdit {
  static {
    __name(this, "SnippetTextEdit");
  }
  static isSnippetTextEdit(thing) {
    if (thing instanceof SnippetTextEdit) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return Range.isRange(thing.range) && SnippetString.isSnippetString(thing.snippet);
  }
  static replace(range, snippet) {
    return new SnippetTextEdit(range, snippet);
  }
  static insert(position, snippet) {
    return SnippetTextEdit.replace(new Range(position, position), snippet);
  }
  constructor(range, snippet) {
    this.range = range;
    this.snippet = snippet;
  }
}
var FileEditType;
(function(FileEditType2) {
  FileEditType2[FileEditType2["File"] = 1] = "File";
  FileEditType2[FileEditType2["Text"] = 2] = "Text";
  FileEditType2[FileEditType2["Cell"] = 3] = "Cell";
  FileEditType2[FileEditType2["CellReplace"] = 5] = "CellReplace";
  FileEditType2[FileEditType2["Snippet"] = 6] = "Snippet";
})(FileEditType || (FileEditType = {}));
let WorkspaceEdit = class WorkspaceEdit2 {
  static {
    __name(this, "WorkspaceEdit");
  }
  constructor() {
    this._edits = [];
  }
  _allEntries() {
    return this._edits;
  }
  // --- file
  renameFile(from, to, options, metadata) {
    this._edits.push({ _type: 1, from, to, options, metadata });
  }
  createFile(uri, options, metadata) {
    this._edits.push({ _type: 1, from: void 0, to: uri, options, metadata });
  }
  deleteFile(uri, options, metadata) {
    this._edits.push({ _type: 1, from: uri, to: void 0, options, metadata });
  }
  // --- notebook
  replaceNotebookMetadata(uri, value, metadata) {
    this._edits.push({ _type: 3, metadata, uri, edit: { editType: 5, metadata: value } });
  }
  replaceNotebookCells(uri, startOrRange, cellData, metadata) {
    const start = startOrRange.start;
    const end = startOrRange.end;
    if (start !== end || cellData.length > 0) {
      this._edits.push({ _type: 5, uri, index: start, count: end - start, cells: cellData, metadata });
    }
  }
  replaceNotebookCellMetadata(uri, index, cellMetadata, metadata) {
    this._edits.push({ _type: 3, metadata, uri, edit: { editType: 3, index, metadata: cellMetadata } });
  }
  // --- text
  replace(uri, range, newText, metadata) {
    this._edits.push({ _type: 2, uri, edit: new TextEdit(range, newText), metadata });
  }
  insert(resource, position, newText, metadata) {
    this.replace(resource, new Range(position, position), newText, metadata);
  }
  delete(resource, range, metadata) {
    this.replace(resource, range, "", metadata);
  }
  // --- text (Maplike)
  has(uri) {
    return this._edits.some((edit) => edit._type === 2 && edit.uri.toString() === uri.toString());
  }
  set(uri, edits) {
    if (!edits) {
      for (let i = 0; i < this._edits.length; i++) {
        const element = this._edits[i];
        switch (element._type) {
          case 2:
          case 6:
          case 3:
          case 5:
            if (element.uri.toString() === uri.toString()) {
              this._edits[i] = void 0;
            }
            break;
        }
      }
      coalesceInPlace(this._edits);
    } else {
      for (const editOrTuple of edits) {
        if (!editOrTuple) {
          continue;
        }
        let edit;
        let metadata;
        if (Array.isArray(editOrTuple)) {
          edit = editOrTuple[0];
          metadata = editOrTuple[1];
        } else {
          edit = editOrTuple;
        }
        if (NotebookEdit.isNotebookCellEdit(edit)) {
          if (edit.newCellMetadata) {
            this.replaceNotebookCellMetadata(uri, edit.range.start, edit.newCellMetadata, metadata);
          } else if (edit.newNotebookMetadata) {
            this.replaceNotebookMetadata(uri, edit.newNotebookMetadata, metadata);
          } else {
            this.replaceNotebookCells(uri, edit.range, edit.newCells, metadata);
          }
        } else if (SnippetTextEdit.isSnippetTextEdit(edit)) {
          this._edits.push({ _type: 6, uri, range: edit.range, edit: edit.snippet, metadata, keepWhitespace: edit.keepWhitespace });
        } else {
          this._edits.push({ _type: 2, uri, edit, metadata });
        }
      }
    }
  }
  get(uri) {
    const res = [];
    for (const candidate of this._edits) {
      if (candidate._type === 2 && candidate.uri.toString() === uri.toString()) {
        res.push(candidate.edit);
      }
    }
    return res;
  }
  entries() {
    const textEdits = new ResourceMap();
    for (const candidate of this._edits) {
      if (candidate._type === 2) {
        let textEdit = textEdits.get(candidate.uri);
        if (!textEdit) {
          textEdit = [candidate.uri, []];
          textEdits.set(candidate.uri, textEdit);
        }
        textEdit[1].push(candidate.edit);
      }
    }
    return [...textEdits.values()];
  }
  get size() {
    return this.entries().length;
  }
  toJSON() {
    return this.entries();
  }
};
WorkspaceEdit = __decorate([
  es5ClassCompat
], WorkspaceEdit);
let SnippetString = SnippetString_1 = class SnippetString2 {
  static {
    __name(this, "SnippetString");
  }
  static isSnippetString(thing) {
    if (thing instanceof SnippetString_1) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return typeof thing.value === "string";
  }
  static _escape(value) {
    return value.replace(/\$|}|\\/g, "\\$&");
  }
  constructor(value) {
    this._tabstop = 1;
    this.value = value || "";
  }
  appendText(string) {
    this.value += SnippetString_1._escape(string);
    return this;
  }
  appendTabstop(number = this._tabstop++) {
    this.value += "$";
    this.value += number;
    return this;
  }
  appendPlaceholder(value, number = this._tabstop++) {
    if (typeof value === "function") {
      const nested = new SnippetString_1();
      nested._tabstop = this._tabstop;
      value(nested);
      this._tabstop = nested._tabstop;
      value = nested.value;
    } else {
      value = SnippetString_1._escape(value);
    }
    this.value += "${";
    this.value += number;
    this.value += ":";
    this.value += value;
    this.value += "}";
    return this;
  }
  appendChoice(values, number = this._tabstop++) {
    const value = values.map((s) => s.replaceAll(/[|\\,]/g, "\\$&")).join(",");
    this.value += "${";
    this.value += number;
    this.value += "|";
    this.value += value;
    this.value += "|}";
    return this;
  }
  appendVariable(name, defaultValue) {
    if (typeof defaultValue === "function") {
      const nested = new SnippetString_1();
      nested._tabstop = this._tabstop;
      defaultValue(nested);
      this._tabstop = nested._tabstop;
      defaultValue = nested.value;
    } else if (typeof defaultValue === "string") {
      defaultValue = defaultValue.replace(/\$|}/g, "\\$&");
    }
    this.value += "${";
    this.value += name;
    if (defaultValue) {
      this.value += ":";
      this.value += defaultValue;
    }
    this.value += "}";
    return this;
  }
};
SnippetString = SnippetString_1 = __decorate([
  es5ClassCompat
], SnippetString);
var DiagnosticTag;
(function(DiagnosticTag2) {
  DiagnosticTag2[DiagnosticTag2["Unnecessary"] = 1] = "Unnecessary";
  DiagnosticTag2[DiagnosticTag2["Deprecated"] = 2] = "Deprecated";
})(DiagnosticTag || (DiagnosticTag = {}));
var DiagnosticSeverity;
(function(DiagnosticSeverity2) {
  DiagnosticSeverity2[DiagnosticSeverity2["Hint"] = 3] = "Hint";
  DiagnosticSeverity2[DiagnosticSeverity2["Information"] = 2] = "Information";
  DiagnosticSeverity2[DiagnosticSeverity2["Warning"] = 1] = "Warning";
  DiagnosticSeverity2[DiagnosticSeverity2["Error"] = 0] = "Error";
})(DiagnosticSeverity || (DiagnosticSeverity = {}));
let Location = Location_1 = class Location2 {
  static {
    __name(this, "Location");
  }
  static isLocation(thing) {
    if (thing instanceof Location_1) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return Range.isRange(thing.range) && URI.isUri(thing.uri);
  }
  constructor(uri, rangeOrPosition) {
    this.uri = uri;
    if (!rangeOrPosition) {
    } else if (Range.isRange(rangeOrPosition)) {
      this.range = Range.of(rangeOrPosition);
    } else if (Position.isPosition(rangeOrPosition)) {
      this.range = new Range(rangeOrPosition, rangeOrPosition);
    } else {
      throw new Error("Illegal argument");
    }
  }
  toJSON() {
    return {
      uri: this.uri,
      range: this.range
    };
  }
};
Location = Location_1 = __decorate([
  es5ClassCompat
], Location);
let DiagnosticRelatedInformation = class DiagnosticRelatedInformation2 {
  static {
    __name(this, "DiagnosticRelatedInformation");
  }
  static is(thing) {
    if (!thing) {
      return false;
    }
    return typeof thing.message === "string" && thing.location && Range.isRange(thing.location.range) && URI.isUri(thing.location.uri);
  }
  constructor(location, message) {
    this.location = location;
    this.message = message;
  }
  static isEqual(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.message === b.message && a.location.range.isEqual(b.location.range) && a.location.uri.toString() === b.location.uri.toString();
  }
};
DiagnosticRelatedInformation = __decorate([
  es5ClassCompat
], DiagnosticRelatedInformation);
let Diagnostic = class Diagnostic2 {
  static {
    __name(this, "Diagnostic");
  }
  constructor(range, message, severity = DiagnosticSeverity.Error) {
    if (!Range.isRange(range)) {
      throw new TypeError("range must be set");
    }
    if (!message) {
      throw new TypeError("message must be set");
    }
    this.range = range;
    this.message = message;
    this.severity = severity;
  }
  toJSON() {
    return {
      severity: DiagnosticSeverity[this.severity],
      message: this.message,
      range: this.range,
      source: this.source,
      code: this.code
    };
  }
  static isEqual(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.message === b.message && a.severity === b.severity && a.code === b.code && a.severity === b.severity && a.source === b.source && a.range.isEqual(b.range) && equals(a.tags, b.tags) && equals(a.relatedInformation, b.relatedInformation, DiagnosticRelatedInformation.isEqual);
  }
};
Diagnostic = __decorate([
  es5ClassCompat
], Diagnostic);
let Hover = class Hover2 {
  static {
    __name(this, "Hover");
  }
  constructor(contents, range) {
    if (!contents) {
      throw new Error("Illegal argument, contents must be defined");
    }
    if (Array.isArray(contents)) {
      this.contents = contents;
    } else {
      this.contents = [contents];
    }
    this.range = range;
  }
};
Hover = __decorate([
  es5ClassCompat
], Hover);
let VerboseHover = class VerboseHover2 extends Hover {
  static {
    __name(this, "VerboseHover");
  }
  constructor(contents, range, canIncreaseVerbosity, canDecreaseVerbosity) {
    super(contents, range);
    this.canIncreaseVerbosity = canIncreaseVerbosity;
    this.canDecreaseVerbosity = canDecreaseVerbosity;
  }
};
VerboseHover = __decorate([
  es5ClassCompat
], VerboseHover);
var HoverVerbosityAction;
(function(HoverVerbosityAction2) {
  HoverVerbosityAction2[HoverVerbosityAction2["Increase"] = 0] = "Increase";
  HoverVerbosityAction2[HoverVerbosityAction2["Decrease"] = 1] = "Decrease";
})(HoverVerbosityAction || (HoverVerbosityAction = {}));
var DocumentHighlightKind;
(function(DocumentHighlightKind2) {
  DocumentHighlightKind2[DocumentHighlightKind2["Text"] = 0] = "Text";
  DocumentHighlightKind2[DocumentHighlightKind2["Read"] = 1] = "Read";
  DocumentHighlightKind2[DocumentHighlightKind2["Write"] = 2] = "Write";
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
let DocumentHighlight = class DocumentHighlight2 {
  static {
    __name(this, "DocumentHighlight");
  }
  constructor(range, kind = DocumentHighlightKind.Text) {
    this.range = range;
    this.kind = kind;
  }
  toJSON() {
    return {
      range: this.range,
      kind: DocumentHighlightKind[this.kind]
    };
  }
};
DocumentHighlight = __decorate([
  es5ClassCompat
], DocumentHighlight);
let MultiDocumentHighlight = class MultiDocumentHighlight2 {
  static {
    __name(this, "MultiDocumentHighlight");
  }
  constructor(uri, highlights) {
    this.uri = uri;
    this.highlights = highlights;
  }
  toJSON() {
    return {
      uri: this.uri,
      highlights: this.highlights.map((h) => h.toJSON())
    };
  }
};
MultiDocumentHighlight = __decorate([
  es5ClassCompat
], MultiDocumentHighlight);
var SymbolKind;
(function(SymbolKind2) {
  SymbolKind2[SymbolKind2["File"] = 0] = "File";
  SymbolKind2[SymbolKind2["Module"] = 1] = "Module";
  SymbolKind2[SymbolKind2["Namespace"] = 2] = "Namespace";
  SymbolKind2[SymbolKind2["Package"] = 3] = "Package";
  SymbolKind2[SymbolKind2["Class"] = 4] = "Class";
  SymbolKind2[SymbolKind2["Method"] = 5] = "Method";
  SymbolKind2[SymbolKind2["Property"] = 6] = "Property";
  SymbolKind2[SymbolKind2["Field"] = 7] = "Field";
  SymbolKind2[SymbolKind2["Constructor"] = 8] = "Constructor";
  SymbolKind2[SymbolKind2["Enum"] = 9] = "Enum";
  SymbolKind2[SymbolKind2["Interface"] = 10] = "Interface";
  SymbolKind2[SymbolKind2["Function"] = 11] = "Function";
  SymbolKind2[SymbolKind2["Variable"] = 12] = "Variable";
  SymbolKind2[SymbolKind2["Constant"] = 13] = "Constant";
  SymbolKind2[SymbolKind2["String"] = 14] = "String";
  SymbolKind2[SymbolKind2["Number"] = 15] = "Number";
  SymbolKind2[SymbolKind2["Boolean"] = 16] = "Boolean";
  SymbolKind2[SymbolKind2["Array"] = 17] = "Array";
  SymbolKind2[SymbolKind2["Object"] = 18] = "Object";
  SymbolKind2[SymbolKind2["Key"] = 19] = "Key";
  SymbolKind2[SymbolKind2["Null"] = 20] = "Null";
  SymbolKind2[SymbolKind2["EnumMember"] = 21] = "EnumMember";
  SymbolKind2[SymbolKind2["Struct"] = 22] = "Struct";
  SymbolKind2[SymbolKind2["Event"] = 23] = "Event";
  SymbolKind2[SymbolKind2["Operator"] = 24] = "Operator";
  SymbolKind2[SymbolKind2["TypeParameter"] = 25] = "TypeParameter";
})(SymbolKind || (SymbolKind = {}));
var SymbolTag;
(function(SymbolTag2) {
  SymbolTag2[SymbolTag2["Deprecated"] = 1] = "Deprecated";
})(SymbolTag || (SymbolTag = {}));
let SymbolInformation = SymbolInformation_1 = class SymbolInformation2 {
  static {
    __name(this, "SymbolInformation");
  }
  static validate(candidate) {
    if (!candidate.name) {
      throw new Error("name must not be falsy");
    }
  }
  constructor(name, kind, rangeOrContainer, locationOrUri, containerName) {
    this.name = name;
    this.kind = kind;
    this.containerName = containerName;
    if (typeof rangeOrContainer === "string") {
      this.containerName = rangeOrContainer;
    }
    if (locationOrUri instanceof Location) {
      this.location = locationOrUri;
    } else if (rangeOrContainer instanceof Range) {
      this.location = new Location(locationOrUri, rangeOrContainer);
    }
    SymbolInformation_1.validate(this);
  }
  toJSON() {
    return {
      name: this.name,
      kind: SymbolKind[this.kind],
      location: this.location,
      containerName: this.containerName
    };
  }
};
SymbolInformation = SymbolInformation_1 = __decorate([
  es5ClassCompat
], SymbolInformation);
let DocumentSymbol = DocumentSymbol_1 = class DocumentSymbol2 {
  static {
    __name(this, "DocumentSymbol");
  }
  static validate(candidate) {
    if (!candidate.name) {
      throw new Error("name must not be falsy");
    }
    if (!candidate.range.contains(candidate.selectionRange)) {
      throw new Error("selectionRange must be contained in fullRange");
    }
    candidate.children?.forEach(DocumentSymbol_1.validate);
  }
  constructor(name, detail, kind, range, selectionRange) {
    this.name = name;
    this.detail = detail;
    this.kind = kind;
    this.range = range;
    this.selectionRange = selectionRange;
    this.children = [];
    DocumentSymbol_1.validate(this);
  }
};
DocumentSymbol = DocumentSymbol_1 = __decorate([
  es5ClassCompat
], DocumentSymbol);
var CodeActionTriggerKind;
(function(CodeActionTriggerKind2) {
  CodeActionTriggerKind2[CodeActionTriggerKind2["Invoke"] = 1] = "Invoke";
  CodeActionTriggerKind2[CodeActionTriggerKind2["Automatic"] = 2] = "Automatic";
})(CodeActionTriggerKind || (CodeActionTriggerKind = {}));
let CodeAction = class CodeAction2 {
  static {
    __name(this, "CodeAction");
  }
  constructor(title, kind) {
    this.title = title;
    this.kind = kind;
  }
};
CodeAction = __decorate([
  es5ClassCompat
], CodeAction);
let CodeActionKind = class CodeActionKind2 {
  static {
    __name(this, "CodeActionKind");
  }
  static {
    CodeActionKind_1 = this;
  }
  static {
    this.sep = ".";
  }
  constructor(value) {
    this.value = value;
  }
  append(parts) {
    return new CodeActionKind_1(this.value ? this.value + CodeActionKind_1.sep + parts : parts);
  }
  intersects(other) {
    return this.contains(other) || other.contains(this);
  }
  contains(other) {
    return this.value === other.value || other.value.startsWith(this.value + CodeActionKind_1.sep);
  }
};
CodeActionKind = CodeActionKind_1 = __decorate([
  es5ClassCompat
], CodeActionKind);
CodeActionKind.Empty = new CodeActionKind("");
CodeActionKind.QuickFix = CodeActionKind.Empty.append("quickfix");
CodeActionKind.Refactor = CodeActionKind.Empty.append("refactor");
CodeActionKind.RefactorExtract = CodeActionKind.Refactor.append("extract");
CodeActionKind.RefactorInline = CodeActionKind.Refactor.append("inline");
CodeActionKind.RefactorMove = CodeActionKind.Refactor.append("move");
CodeActionKind.RefactorRewrite = CodeActionKind.Refactor.append("rewrite");
CodeActionKind.Source = CodeActionKind.Empty.append("source");
CodeActionKind.SourceOrganizeImports = CodeActionKind.Source.append("organizeImports");
CodeActionKind.SourceFixAll = CodeActionKind.Source.append("fixAll");
CodeActionKind.Notebook = CodeActionKind.Empty.append("notebook");
let SelectionRange = class SelectionRange2 {
  static {
    __name(this, "SelectionRange");
  }
  constructor(range, parent) {
    this.range = range;
    this.parent = parent;
    if (parent && !parent.range.contains(this.range)) {
      throw new Error("Invalid argument: parent must contain this range");
    }
  }
};
SelectionRange = __decorate([
  es5ClassCompat
], SelectionRange);
class CallHierarchyItem {
  static {
    __name(this, "CallHierarchyItem");
  }
  constructor(kind, name, detail, uri, range, selectionRange) {
    this.kind = kind;
    this.name = name;
    this.detail = detail;
    this.uri = uri;
    this.range = range;
    this.selectionRange = selectionRange;
  }
}
class CallHierarchyIncomingCall {
  static {
    __name(this, "CallHierarchyIncomingCall");
  }
  constructor(item, fromRanges) {
    this.fromRanges = fromRanges;
    this.from = item;
  }
}
class CallHierarchyOutgoingCall {
  static {
    __name(this, "CallHierarchyOutgoingCall");
  }
  constructor(item, fromRanges) {
    this.fromRanges = fromRanges;
    this.to = item;
  }
}
var LanguageStatusSeverity;
(function(LanguageStatusSeverity2) {
  LanguageStatusSeverity2[LanguageStatusSeverity2["Information"] = 0] = "Information";
  LanguageStatusSeverity2[LanguageStatusSeverity2["Warning"] = 1] = "Warning";
  LanguageStatusSeverity2[LanguageStatusSeverity2["Error"] = 2] = "Error";
})(LanguageStatusSeverity || (LanguageStatusSeverity = {}));
let CodeLens = class CodeLens2 {
  static {
    __name(this, "CodeLens");
  }
  constructor(range, command) {
    this.range = range;
    this.command = command;
  }
  get isResolved() {
    return !!this.command;
  }
};
CodeLens = __decorate([
  es5ClassCompat
], CodeLens);
let MarkdownString = MarkdownString_1 = class MarkdownString2 {
  static {
    __name(this, "MarkdownString");
  }
  #delegate;
  static isMarkdownString(thing) {
    if (thing instanceof MarkdownString_1) {
      return true;
    }
    return thing && thing.appendCodeblock && thing.appendMarkdown && thing.appendText && thing.value !== void 0;
  }
  constructor(value, supportThemeIcons = false) {
    this.#delegate = new BaseMarkdownString(value, { supportThemeIcons });
  }
  get value() {
    return this.#delegate.value;
  }
  set value(value) {
    this.#delegate.value = value;
  }
  get isTrusted() {
    return this.#delegate.isTrusted;
  }
  set isTrusted(value) {
    this.#delegate.isTrusted = value;
  }
  get supportThemeIcons() {
    return this.#delegate.supportThemeIcons;
  }
  set supportThemeIcons(value) {
    this.#delegate.supportThemeIcons = value;
  }
  get supportHtml() {
    return this.#delegate.supportHtml;
  }
  set supportHtml(value) {
    this.#delegate.supportHtml = value;
  }
  get baseUri() {
    return this.#delegate.baseUri;
  }
  set baseUri(value) {
    this.#delegate.baseUri = value;
  }
  appendText(value) {
    this.#delegate.appendText(value);
    return this;
  }
  appendMarkdown(value) {
    this.#delegate.appendMarkdown(value);
    return this;
  }
  appendCodeblock(value, language) {
    this.#delegate.appendCodeblock(language ?? "", value);
    return this;
  }
};
MarkdownString = MarkdownString_1 = __decorate([
  es5ClassCompat
], MarkdownString);
let ParameterInformation = class ParameterInformation2 {
  static {
    __name(this, "ParameterInformation");
  }
  constructor(label, documentation) {
    this.label = label;
    this.documentation = documentation;
  }
};
ParameterInformation = __decorate([
  es5ClassCompat
], ParameterInformation);
let SignatureInformation = class SignatureInformation2 {
  static {
    __name(this, "SignatureInformation");
  }
  constructor(label, documentation) {
    this.label = label;
    this.documentation = documentation;
    this.parameters = [];
  }
};
SignatureInformation = __decorate([
  es5ClassCompat
], SignatureInformation);
let SignatureHelp = class SignatureHelp2 {
  static {
    __name(this, "SignatureHelp");
  }
  constructor() {
    this.activeSignature = 0;
    this.activeParameter = 0;
    this.signatures = [];
  }
};
SignatureHelp = __decorate([
  es5ClassCompat
], SignatureHelp);
var SignatureHelpTriggerKind;
(function(SignatureHelpTriggerKind2) {
  SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["Invoke"] = 1] = "Invoke";
  SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["TriggerCharacter"] = 2] = "TriggerCharacter";
  SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["ContentChange"] = 3] = "ContentChange";
})(SignatureHelpTriggerKind || (SignatureHelpTriggerKind = {}));
var InlayHintKind;
(function(InlayHintKind2) {
  InlayHintKind2[InlayHintKind2["Type"] = 1] = "Type";
  InlayHintKind2[InlayHintKind2["Parameter"] = 2] = "Parameter";
})(InlayHintKind || (InlayHintKind = {}));
let InlayHintLabelPart = class InlayHintLabelPart2 {
  static {
    __name(this, "InlayHintLabelPart");
  }
  constructor(value) {
    this.value = value;
  }
};
InlayHintLabelPart = __decorate([
  es5ClassCompat
], InlayHintLabelPart);
let InlayHint = class InlayHint2 {
  static {
    __name(this, "InlayHint");
  }
  constructor(position, label, kind) {
    this.position = position;
    this.label = label;
    this.kind = kind;
  }
};
InlayHint = __decorate([
  es5ClassCompat
], InlayHint);
var CompletionTriggerKind;
(function(CompletionTriggerKind2) {
  CompletionTriggerKind2[CompletionTriggerKind2["Invoke"] = 0] = "Invoke";
  CompletionTriggerKind2[CompletionTriggerKind2["TriggerCharacter"] = 1] = "TriggerCharacter";
  CompletionTriggerKind2[CompletionTriggerKind2["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
})(CompletionTriggerKind || (CompletionTriggerKind = {}));
var CompletionItemKind;
(function(CompletionItemKind2) {
  CompletionItemKind2[CompletionItemKind2["Text"] = 0] = "Text";
  CompletionItemKind2[CompletionItemKind2["Method"] = 1] = "Method";
  CompletionItemKind2[CompletionItemKind2["Function"] = 2] = "Function";
  CompletionItemKind2[CompletionItemKind2["Constructor"] = 3] = "Constructor";
  CompletionItemKind2[CompletionItemKind2["Field"] = 4] = "Field";
  CompletionItemKind2[CompletionItemKind2["Variable"] = 5] = "Variable";
  CompletionItemKind2[CompletionItemKind2["Class"] = 6] = "Class";
  CompletionItemKind2[CompletionItemKind2["Interface"] = 7] = "Interface";
  CompletionItemKind2[CompletionItemKind2["Module"] = 8] = "Module";
  CompletionItemKind2[CompletionItemKind2["Property"] = 9] = "Property";
  CompletionItemKind2[CompletionItemKind2["Unit"] = 10] = "Unit";
  CompletionItemKind2[CompletionItemKind2["Value"] = 11] = "Value";
  CompletionItemKind2[CompletionItemKind2["Enum"] = 12] = "Enum";
  CompletionItemKind2[CompletionItemKind2["Keyword"] = 13] = "Keyword";
  CompletionItemKind2[CompletionItemKind2["Snippet"] = 14] = "Snippet";
  CompletionItemKind2[CompletionItemKind2["Color"] = 15] = "Color";
  CompletionItemKind2[CompletionItemKind2["File"] = 16] = "File";
  CompletionItemKind2[CompletionItemKind2["Reference"] = 17] = "Reference";
  CompletionItemKind2[CompletionItemKind2["Folder"] = 18] = "Folder";
  CompletionItemKind2[CompletionItemKind2["EnumMember"] = 19] = "EnumMember";
  CompletionItemKind2[CompletionItemKind2["Constant"] = 20] = "Constant";
  CompletionItemKind2[CompletionItemKind2["Struct"] = 21] = "Struct";
  CompletionItemKind2[CompletionItemKind2["Event"] = 22] = "Event";
  CompletionItemKind2[CompletionItemKind2["Operator"] = 23] = "Operator";
  CompletionItemKind2[CompletionItemKind2["TypeParameter"] = 24] = "TypeParameter";
  CompletionItemKind2[CompletionItemKind2["User"] = 25] = "User";
  CompletionItemKind2[CompletionItemKind2["Issue"] = 26] = "Issue";
})(CompletionItemKind || (CompletionItemKind = {}));
var CompletionItemTag;
(function(CompletionItemTag2) {
  CompletionItemTag2[CompletionItemTag2["Deprecated"] = 1] = "Deprecated";
})(CompletionItemTag || (CompletionItemTag = {}));
let CompletionItem = class CompletionItem2 {
  static {
    __name(this, "CompletionItem");
  }
  constructor(label, kind) {
    this.label = label;
    this.kind = kind;
  }
  toJSON() {
    return {
      label: this.label,
      kind: this.kind && CompletionItemKind[this.kind],
      detail: this.detail,
      documentation: this.documentation,
      sortText: this.sortText,
      filterText: this.filterText,
      preselect: this.preselect,
      insertText: this.insertText,
      textEdit: this.textEdit
    };
  }
};
CompletionItem = __decorate([
  es5ClassCompat
], CompletionItem);
let CompletionList = class CompletionList2 {
  static {
    __name(this, "CompletionList");
  }
  constructor(items = [], isIncomplete = false) {
    this.items = items;
    this.isIncomplete = isIncomplete;
  }
};
CompletionList = __decorate([
  es5ClassCompat
], CompletionList);
let InlineSuggestion = class InlineSuggestion2 {
  static {
    __name(this, "InlineSuggestion");
  }
  constructor(insertText, range, command) {
    this.insertText = insertText;
    this.range = range;
    this.command = command;
  }
};
InlineSuggestion = __decorate([
  es5ClassCompat
], InlineSuggestion);
let InlineSuggestionList = class InlineSuggestionList2 {
  static {
    __name(this, "InlineSuggestionList");
  }
  constructor(items) {
    this.commands = void 0;
    this.suppressSuggestions = void 0;
    this.items = items;
  }
};
InlineSuggestionList = __decorate([
  es5ClassCompat
], InlineSuggestionList);
var PartialAcceptTriggerKind;
(function(PartialAcceptTriggerKind2) {
  PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Unknown"] = 0] = "Unknown";
  PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Word"] = 1] = "Word";
  PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Line"] = 2] = "Line";
  PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Suggest"] = 3] = "Suggest";
})(PartialAcceptTriggerKind || (PartialAcceptTriggerKind = {}));
var InlineCompletionEndOfLifeReasonKind;
(function(InlineCompletionEndOfLifeReasonKind2) {
  InlineCompletionEndOfLifeReasonKind2[InlineCompletionEndOfLifeReasonKind2["Accepted"] = 0] = "Accepted";
  InlineCompletionEndOfLifeReasonKind2[InlineCompletionEndOfLifeReasonKind2["Rejected"] = 1] = "Rejected";
  InlineCompletionEndOfLifeReasonKind2[InlineCompletionEndOfLifeReasonKind2["Ignored"] = 2] = "Ignored";
})(InlineCompletionEndOfLifeReasonKind || (InlineCompletionEndOfLifeReasonKind = {}));
var ViewColumn;
(function(ViewColumn2) {
  ViewColumn2[ViewColumn2["Active"] = -1] = "Active";
  ViewColumn2[ViewColumn2["Beside"] = -2] = "Beside";
  ViewColumn2[ViewColumn2["One"] = 1] = "One";
  ViewColumn2[ViewColumn2["Two"] = 2] = "Two";
  ViewColumn2[ViewColumn2["Three"] = 3] = "Three";
  ViewColumn2[ViewColumn2["Four"] = 4] = "Four";
  ViewColumn2[ViewColumn2["Five"] = 5] = "Five";
  ViewColumn2[ViewColumn2["Six"] = 6] = "Six";
  ViewColumn2[ViewColumn2["Seven"] = 7] = "Seven";
  ViewColumn2[ViewColumn2["Eight"] = 8] = "Eight";
  ViewColumn2[ViewColumn2["Nine"] = 9] = "Nine";
})(ViewColumn || (ViewColumn = {}));
var StatusBarAlignment;
(function(StatusBarAlignment2) {
  StatusBarAlignment2[StatusBarAlignment2["Left"] = 1] = "Left";
  StatusBarAlignment2[StatusBarAlignment2["Right"] = 2] = "Right";
})(StatusBarAlignment || (StatusBarAlignment = {}));
function asStatusBarItemIdentifier(extension, id) {
  return `${ExtensionIdentifier.toKey(extension)}.${id}`;
}
__name(asStatusBarItemIdentifier, "asStatusBarItemIdentifier");
var TextEditorLineNumbersStyle;
(function(TextEditorLineNumbersStyle2) {
  TextEditorLineNumbersStyle2[TextEditorLineNumbersStyle2["Off"] = 0] = "Off";
  TextEditorLineNumbersStyle2[TextEditorLineNumbersStyle2["On"] = 1] = "On";
  TextEditorLineNumbersStyle2[TextEditorLineNumbersStyle2["Relative"] = 2] = "Relative";
  TextEditorLineNumbersStyle2[TextEditorLineNumbersStyle2["Interval"] = 3] = "Interval";
})(TextEditorLineNumbersStyle || (TextEditorLineNumbersStyle = {}));
var TextDocumentSaveReason;
(function(TextDocumentSaveReason2) {
  TextDocumentSaveReason2[TextDocumentSaveReason2["Manual"] = 1] = "Manual";
  TextDocumentSaveReason2[TextDocumentSaveReason2["AfterDelay"] = 2] = "AfterDelay";
  TextDocumentSaveReason2[TextDocumentSaveReason2["FocusOut"] = 3] = "FocusOut";
})(TextDocumentSaveReason || (TextDocumentSaveReason = {}));
var TextEditorRevealType;
(function(TextEditorRevealType2) {
  TextEditorRevealType2[TextEditorRevealType2["Default"] = 0] = "Default";
  TextEditorRevealType2[TextEditorRevealType2["InCenter"] = 1] = "InCenter";
  TextEditorRevealType2[TextEditorRevealType2["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
  TextEditorRevealType2[TextEditorRevealType2["AtTop"] = 3] = "AtTop";
})(TextEditorRevealType || (TextEditorRevealType = {}));
var TextEditorSelectionChangeKind;
(function(TextEditorSelectionChangeKind2) {
  TextEditorSelectionChangeKind2[TextEditorSelectionChangeKind2["Keyboard"] = 1] = "Keyboard";
  TextEditorSelectionChangeKind2[TextEditorSelectionChangeKind2["Mouse"] = 2] = "Mouse";
  TextEditorSelectionChangeKind2[TextEditorSelectionChangeKind2["Command"] = 3] = "Command";
})(TextEditorSelectionChangeKind || (TextEditorSelectionChangeKind = {}));
var TextEditorChangeKind;
(function(TextEditorChangeKind2) {
  TextEditorChangeKind2[TextEditorChangeKind2["Addition"] = 1] = "Addition";
  TextEditorChangeKind2[TextEditorChangeKind2["Deletion"] = 2] = "Deletion";
  TextEditorChangeKind2[TextEditorChangeKind2["Modification"] = 3] = "Modification";
})(TextEditorChangeKind || (TextEditorChangeKind = {}));
var TextDocumentChangeReason;
(function(TextDocumentChangeReason2) {
  TextDocumentChangeReason2[TextDocumentChangeReason2["Undo"] = 1] = "Undo";
  TextDocumentChangeReason2[TextDocumentChangeReason2["Redo"] = 2] = "Redo";
})(TextDocumentChangeReason || (TextDocumentChangeReason = {}));
var DecorationRangeBehavior;
(function(DecorationRangeBehavior2) {
  DecorationRangeBehavior2[DecorationRangeBehavior2["OpenOpen"] = 0] = "OpenOpen";
  DecorationRangeBehavior2[DecorationRangeBehavior2["ClosedClosed"] = 1] = "ClosedClosed";
  DecorationRangeBehavior2[DecorationRangeBehavior2["OpenClosed"] = 2] = "OpenClosed";
  DecorationRangeBehavior2[DecorationRangeBehavior2["ClosedOpen"] = 3] = "ClosedOpen";
})(DecorationRangeBehavior || (DecorationRangeBehavior = {}));
(function(TextEditorSelectionChangeKind2) {
  function fromValue(s) {
    switch (s) {
      case "keyboard":
        return TextEditorSelectionChangeKind2.Keyboard;
      case "mouse":
        return TextEditorSelectionChangeKind2.Mouse;
      case "api":
      case "code.jump":
      case "code.navigation":
        return TextEditorSelectionChangeKind2.Command;
    }
    return void 0;
  }
  __name(fromValue, "fromValue");
  TextEditorSelectionChangeKind2.fromValue = fromValue;
})(TextEditorSelectionChangeKind || (TextEditorSelectionChangeKind = {}));
var SyntaxTokenType;
(function(SyntaxTokenType2) {
  SyntaxTokenType2[SyntaxTokenType2["Other"] = 0] = "Other";
  SyntaxTokenType2[SyntaxTokenType2["Comment"] = 1] = "Comment";
  SyntaxTokenType2[SyntaxTokenType2["String"] = 2] = "String";
  SyntaxTokenType2[SyntaxTokenType2["RegEx"] = 3] = "RegEx";
})(SyntaxTokenType || (SyntaxTokenType = {}));
(function(SyntaxTokenType2) {
  function toString(v) {
    switch (v) {
      case SyntaxTokenType2.Other:
        return "other";
      case SyntaxTokenType2.Comment:
        return "comment";
      case SyntaxTokenType2.String:
        return "string";
      case SyntaxTokenType2.RegEx:
        return "regex";
    }
    return "other";
  }
  __name(toString, "toString");
  SyntaxTokenType2.toString = toString;
})(SyntaxTokenType || (SyntaxTokenType = {}));
let DocumentLink = class DocumentLink2 {
  static {
    __name(this, "DocumentLink");
  }
  constructor(range, target) {
    if (target && !URI.isUri(target)) {
      throw illegalArgument("target");
    }
    if (!Range.isRange(range) || range.isEmpty) {
      throw illegalArgument("range");
    }
    this.range = range;
    this.target = target;
  }
};
DocumentLink = __decorate([
  es5ClassCompat
], DocumentLink);
let Color = class Color2 {
  static {
    __name(this, "Color");
  }
  constructor(red, green, blue, alpha) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }
};
Color = __decorate([
  es5ClassCompat
], Color);
let ColorInformation = class ColorInformation2 {
  static {
    __name(this, "ColorInformation");
  }
  constructor(range, color) {
    if (color && !(color instanceof Color)) {
      throw illegalArgument("color");
    }
    if (!Range.isRange(range) || range.isEmpty) {
      throw illegalArgument("range");
    }
    this.range = range;
    this.color = color;
  }
};
ColorInformation = __decorate([
  es5ClassCompat
], ColorInformation);
let ColorPresentation = class ColorPresentation2 {
  static {
    __name(this, "ColorPresentation");
  }
  constructor(label) {
    if (!label || typeof label !== "string") {
      throw illegalArgument("label");
    }
    this.label = label;
  }
};
ColorPresentation = __decorate([
  es5ClassCompat
], ColorPresentation);
var ColorFormat;
(function(ColorFormat2) {
  ColorFormat2[ColorFormat2["RGB"] = 0] = "RGB";
  ColorFormat2[ColorFormat2["HEX"] = 1] = "HEX";
  ColorFormat2[ColorFormat2["HSL"] = 2] = "HSL";
})(ColorFormat || (ColorFormat = {}));
var SourceControlInputBoxValidationType;
(function(SourceControlInputBoxValidationType2) {
  SourceControlInputBoxValidationType2[SourceControlInputBoxValidationType2["Error"] = 0] = "Error";
  SourceControlInputBoxValidationType2[SourceControlInputBoxValidationType2["Warning"] = 1] = "Warning";
  SourceControlInputBoxValidationType2[SourceControlInputBoxValidationType2["Information"] = 2] = "Information";
})(SourceControlInputBoxValidationType || (SourceControlInputBoxValidationType = {}));
var TerminalExitReason;
(function(TerminalExitReason2) {
  TerminalExitReason2[TerminalExitReason2["Unknown"] = 0] = "Unknown";
  TerminalExitReason2[TerminalExitReason2["Shutdown"] = 1] = "Shutdown";
  TerminalExitReason2[TerminalExitReason2["Process"] = 2] = "Process";
  TerminalExitReason2[TerminalExitReason2["User"] = 3] = "User";
  TerminalExitReason2[TerminalExitReason2["Extension"] = 4] = "Extension";
})(TerminalExitReason || (TerminalExitReason = {}));
var TerminalShellExecutionCommandLineConfidence;
(function(TerminalShellExecutionCommandLineConfidence2) {
  TerminalShellExecutionCommandLineConfidence2[TerminalShellExecutionCommandLineConfidence2["Low"] = 0] = "Low";
  TerminalShellExecutionCommandLineConfidence2[TerminalShellExecutionCommandLineConfidence2["Medium"] = 1] = "Medium";
  TerminalShellExecutionCommandLineConfidence2[TerminalShellExecutionCommandLineConfidence2["High"] = 2] = "High";
})(TerminalShellExecutionCommandLineConfidence || (TerminalShellExecutionCommandLineConfidence = {}));
var TerminalShellType;
(function(TerminalShellType2) {
  TerminalShellType2[TerminalShellType2["Sh"] = 1] = "Sh";
  TerminalShellType2[TerminalShellType2["Bash"] = 2] = "Bash";
  TerminalShellType2[TerminalShellType2["Fish"] = 3] = "Fish";
  TerminalShellType2[TerminalShellType2["Csh"] = 4] = "Csh";
  TerminalShellType2[TerminalShellType2["Ksh"] = 5] = "Ksh";
  TerminalShellType2[TerminalShellType2["Zsh"] = 6] = "Zsh";
  TerminalShellType2[TerminalShellType2["CommandPrompt"] = 7] = "CommandPrompt";
  TerminalShellType2[TerminalShellType2["GitBash"] = 8] = "GitBash";
  TerminalShellType2[TerminalShellType2["PowerShell"] = 9] = "PowerShell";
  TerminalShellType2[TerminalShellType2["Python"] = 10] = "Python";
  TerminalShellType2[TerminalShellType2["Julia"] = 11] = "Julia";
  TerminalShellType2[TerminalShellType2["NuShell"] = 12] = "NuShell";
  TerminalShellType2[TerminalShellType2["Node"] = 13] = "Node";
})(TerminalShellType || (TerminalShellType = {}));
class TerminalLink {
  static {
    __name(this, "TerminalLink");
  }
  constructor(startIndex, length, tooltip) {
    this.startIndex = startIndex;
    this.length = length;
    this.tooltip = tooltip;
    if (typeof startIndex !== "number" || startIndex < 0) {
      throw illegalArgument("startIndex");
    }
    if (typeof length !== "number" || length < 1) {
      throw illegalArgument("length");
    }
    if (tooltip !== void 0 && typeof tooltip !== "string") {
      throw illegalArgument("tooltip");
    }
  }
}
class TerminalQuickFixOpener {
  static {
    __name(this, "TerminalQuickFixOpener");
  }
  constructor(uri) {
    this.uri = uri;
  }
}
class TerminalQuickFixCommand {
  static {
    __name(this, "TerminalQuickFixCommand");
  }
  constructor(terminalCommand) {
    this.terminalCommand = terminalCommand;
  }
}
var TerminalLocation;
(function(TerminalLocation2) {
  TerminalLocation2[TerminalLocation2["Panel"] = 1] = "Panel";
  TerminalLocation2[TerminalLocation2["Editor"] = 2] = "Editor";
})(TerminalLocation || (TerminalLocation = {}));
class TerminalProfile {
  static {
    __name(this, "TerminalProfile");
  }
  constructor(options) {
    this.options = options;
    if (typeof options !== "object") {
      throw illegalArgument("options");
    }
  }
}
var TerminalCompletionItemKind;
(function(TerminalCompletionItemKind2) {
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["File"] = 0] = "File";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Folder"] = 1] = "Folder";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Method"] = 2] = "Method";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Alias"] = 3] = "Alias";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Argument"] = 4] = "Argument";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Option"] = 5] = "Option";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["OptionValue"] = 6] = "OptionValue";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Flag"] = 7] = "Flag";
})(TerminalCompletionItemKind || (TerminalCompletionItemKind = {}));
class TerminalCompletionItem {
  static {
    __name(this, "TerminalCompletionItem");
  }
  constructor(label, icon, detail, documentation, isFile, isDirectory, isKeyword, replacementIndex, replacementLength) {
    this.label = label;
    this.icon = icon;
    this.detail = detail;
    this.documentation = documentation;
    this.isFile = isFile;
    this.isDirectory = isDirectory;
    this.isKeyword = isKeyword;
    this.replacementIndex = replacementIndex ?? 0;
    this.replacementLength = replacementLength ?? 0;
  }
}
class TerminalCompletionList {
  static {
    __name(this, "TerminalCompletionList");
  }
  /**
   * Creates a new completion list.
   *
   * @param items The completion items.
   * @param isIncomplete The list is not complete.
   */
  constructor(items, resourceRequestConfig) {
    this.items = items ?? [];
    this.resourceRequestConfig = resourceRequestConfig;
  }
}
var TaskRevealKind;
(function(TaskRevealKind2) {
  TaskRevealKind2[TaskRevealKind2["Always"] = 1] = "Always";
  TaskRevealKind2[TaskRevealKind2["Silent"] = 2] = "Silent";
  TaskRevealKind2[TaskRevealKind2["Never"] = 3] = "Never";
})(TaskRevealKind || (TaskRevealKind = {}));
var TaskEventKind;
(function(TaskEventKind2) {
  TaskEventKind2["Changed"] = "changed";
  TaskEventKind2["ProcessStarted"] = "processStarted";
  TaskEventKind2["ProcessEnded"] = "processEnded";
  TaskEventKind2["Terminated"] = "terminated";
  TaskEventKind2["Start"] = "start";
  TaskEventKind2["AcquiredInput"] = "acquiredInput";
  TaskEventKind2["DependsOnStarted"] = "dependsOnStarted";
  TaskEventKind2["Active"] = "active";
  TaskEventKind2["Inactive"] = "inactive";
  TaskEventKind2["End"] = "end";
  TaskEventKind2["ProblemMatcherStarted"] = "problemMatcherStarted";
  TaskEventKind2["ProblemMatcherEnded"] = "problemMatcherEnded";
  TaskEventKind2["ProblemMatcherFoundErrors"] = "problemMatcherFoundErrors";
})(TaskEventKind || (TaskEventKind = {}));
var TaskPanelKind;
(function(TaskPanelKind2) {
  TaskPanelKind2[TaskPanelKind2["Shared"] = 1] = "Shared";
  TaskPanelKind2[TaskPanelKind2["Dedicated"] = 2] = "Dedicated";
  TaskPanelKind2[TaskPanelKind2["New"] = 3] = "New";
})(TaskPanelKind || (TaskPanelKind = {}));
let TaskGroup = class TaskGroup2 {
  static {
    __name(this, "TaskGroup");
  }
  static {
    TaskGroup_1 = this;
  }
  static {
    this.Clean = new TaskGroup_1("clean", "Clean");
  }
  static {
    this.Build = new TaskGroup_1("build", "Build");
  }
  static {
    this.Rebuild = new TaskGroup_1("rebuild", "Rebuild");
  }
  static {
    this.Test = new TaskGroup_1("test", "Test");
  }
  static from(value) {
    switch (value) {
      case "clean":
        return TaskGroup_1.Clean;
      case "build":
        return TaskGroup_1.Build;
      case "rebuild":
        return TaskGroup_1.Rebuild;
      case "test":
        return TaskGroup_1.Test;
      default:
        return void 0;
    }
  }
  constructor(id, label) {
    this.label = label;
    if (typeof id !== "string") {
      throw illegalArgument("name");
    }
    if (typeof label !== "string") {
      throw illegalArgument("name");
    }
    this._id = id;
  }
  get id() {
    return this._id;
  }
};
TaskGroup = TaskGroup_1 = __decorate([
  es5ClassCompat
], TaskGroup);
function computeTaskExecutionId(values) {
  let id = "";
  for (let i = 0; i < values.length; i++) {
    id += values[i].replace(/,/g, ",,") + ",";
  }
  return id;
}
__name(computeTaskExecutionId, "computeTaskExecutionId");
let ProcessExecution = class ProcessExecution2 {
  static {
    __name(this, "ProcessExecution");
  }
  constructor(process, varg1, varg2) {
    if (typeof process !== "string") {
      throw illegalArgument("process");
    }
    this._args = [];
    this._process = process;
    if (varg1 !== void 0) {
      if (Array.isArray(varg1)) {
        this._args = varg1;
        this._options = varg2;
      } else {
        this._options = varg1;
      }
    }
  }
  get process() {
    return this._process;
  }
  set process(value) {
    if (typeof value !== "string") {
      throw illegalArgument("process");
    }
    this._process = value;
  }
  get args() {
    return this._args;
  }
  set args(value) {
    if (!Array.isArray(value)) {
      value = [];
    }
    this._args = value;
  }
  get options() {
    return this._options;
  }
  set options(value) {
    this._options = value;
  }
  computeId() {
    const props = [];
    props.push("process");
    if (this._process !== void 0) {
      props.push(this._process);
    }
    if (this._args && this._args.length > 0) {
      for (const arg of this._args) {
        props.push(arg);
      }
    }
    return computeTaskExecutionId(props);
  }
};
ProcessExecution = __decorate([
  es5ClassCompat
], ProcessExecution);
let ShellExecution = class ShellExecution2 {
  static {
    __name(this, "ShellExecution");
  }
  constructor(arg0, arg1, arg2) {
    this._args = [];
    if (Array.isArray(arg1)) {
      if (!arg0) {
        throw illegalArgument("command can't be undefined or null");
      }
      if (typeof arg0 !== "string" && typeof arg0.value !== "string") {
        throw illegalArgument("command");
      }
      this._command = arg0;
      if (arg1) {
        this._args = arg1;
      }
      this._options = arg2;
    } else {
      if (typeof arg0 !== "string") {
        throw illegalArgument("commandLine");
      }
      this._commandLine = arg0;
      this._options = arg1;
    }
  }
  get commandLine() {
    return this._commandLine;
  }
  set commandLine(value) {
    if (typeof value !== "string") {
      throw illegalArgument("commandLine");
    }
    this._commandLine = value;
  }
  get command() {
    return this._command ? this._command : "";
  }
  set command(value) {
    if (typeof value !== "string" && typeof value.value !== "string") {
      throw illegalArgument("command");
    }
    this._command = value;
  }
  get args() {
    return this._args;
  }
  set args(value) {
    this._args = value || [];
  }
  get options() {
    return this._options;
  }
  set options(value) {
    this._options = value;
  }
  computeId() {
    const props = [];
    props.push("shell");
    if (this._commandLine !== void 0) {
      props.push(this._commandLine);
    }
    if (this._command !== void 0) {
      props.push(typeof this._command === "string" ? this._command : this._command.value);
    }
    if (this._args && this._args.length > 0) {
      for (const arg of this._args) {
        props.push(typeof arg === "string" ? arg : arg.value);
      }
    }
    return computeTaskExecutionId(props);
  }
};
ShellExecution = __decorate([
  es5ClassCompat
], ShellExecution);
var ShellQuoting;
(function(ShellQuoting2) {
  ShellQuoting2[ShellQuoting2["Escape"] = 1] = "Escape";
  ShellQuoting2[ShellQuoting2["Strong"] = 2] = "Strong";
  ShellQuoting2[ShellQuoting2["Weak"] = 3] = "Weak";
})(ShellQuoting || (ShellQuoting = {}));
var TaskScope;
(function(TaskScope2) {
  TaskScope2[TaskScope2["Global"] = 1] = "Global";
  TaskScope2[TaskScope2["Workspace"] = 2] = "Workspace";
})(TaskScope || (TaskScope = {}));
class CustomExecution {
  static {
    __name(this, "CustomExecution");
  }
  constructor(callback) {
    this._callback = callback;
  }
  computeId() {
    return "customExecution" + generateUuid();
  }
  set callback(value) {
    this._callback = value;
  }
  get callback() {
    return this._callback;
  }
}
let Task = class Task2 {
  static {
    __name(this, "Task");
  }
  static {
    Task_1 = this;
  }
  static {
    this.ExtensionCallbackType = "customExecution";
  }
  static {
    this.ProcessType = "process";
  }
  static {
    this.ShellType = "shell";
  }
  static {
    this.EmptyType = "$empty";
  }
  constructor(definition, arg2, arg3, arg4, arg5, arg6) {
    this.__deprecated = false;
    this._definition = this.definition = definition;
    let problemMatchers;
    if (typeof arg2 === "string") {
      this._name = this.name = arg2;
      this._source = this.source = arg3;
      this.execution = arg4;
      problemMatchers = arg5;
      this.__deprecated = true;
    } else if (arg2 === TaskScope.Global || arg2 === TaskScope.Workspace) {
      this.target = arg2;
      this._name = this.name = arg3;
      this._source = this.source = arg4;
      this.execution = arg5;
      problemMatchers = arg6;
    } else {
      this.target = arg2;
      this._name = this.name = arg3;
      this._source = this.source = arg4;
      this.execution = arg5;
      problemMatchers = arg6;
    }
    if (typeof problemMatchers === "string") {
      this._problemMatchers = [problemMatchers];
      this._hasDefinedMatchers = true;
    } else if (Array.isArray(problemMatchers)) {
      this._problemMatchers = problemMatchers;
      this._hasDefinedMatchers = true;
    } else {
      this._problemMatchers = [];
      this._hasDefinedMatchers = false;
    }
    this._isBackground = false;
    this._presentationOptions = /* @__PURE__ */ Object.create(null);
    this._runOptions = /* @__PURE__ */ Object.create(null);
  }
  get _id() {
    return this.__id;
  }
  set _id(value) {
    this.__id = value;
  }
  get _deprecated() {
    return this.__deprecated;
  }
  clear() {
    if (this.__id === void 0) {
      return;
    }
    this.__id = void 0;
    this._scope = void 0;
    this.computeDefinitionBasedOnExecution();
  }
  computeDefinitionBasedOnExecution() {
    if (this._execution instanceof ProcessExecution) {
      this._definition = {
        type: Task_1.ProcessType,
        id: this._execution.computeId()
      };
    } else if (this._execution instanceof ShellExecution) {
      this._definition = {
        type: Task_1.ShellType,
        id: this._execution.computeId()
      };
    } else if (this._execution instanceof CustomExecution) {
      this._definition = {
        type: Task_1.ExtensionCallbackType,
        id: this._execution.computeId()
      };
    } else {
      this._definition = {
        type: Task_1.EmptyType,
        id: generateUuid()
      };
    }
  }
  get definition() {
    return this._definition;
  }
  set definition(value) {
    if (value === void 0 || value === null) {
      throw illegalArgument("Kind can't be undefined or null");
    }
    this.clear();
    this._definition = value;
  }
  get scope() {
    return this._scope;
  }
  set target(value) {
    this.clear();
    this._scope = value;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    if (typeof value !== "string") {
      throw illegalArgument("name");
    }
    this.clear();
    this._name = value;
  }
  get execution() {
    return this._execution;
  }
  set execution(value) {
    if (value === null) {
      value = void 0;
    }
    this.clear();
    this._execution = value;
    const type = this._definition.type;
    if (Task_1.EmptyType === type || Task_1.ProcessType === type || Task_1.ShellType === type || Task_1.ExtensionCallbackType === type) {
      this.computeDefinitionBasedOnExecution();
    }
  }
  get problemMatchers() {
    return this._problemMatchers;
  }
  set problemMatchers(value) {
    if (!Array.isArray(value)) {
      this.clear();
      this._problemMatchers = [];
      this._hasDefinedMatchers = false;
      return;
    } else {
      this.clear();
      this._problemMatchers = value;
      this._hasDefinedMatchers = true;
    }
  }
  get hasDefinedMatchers() {
    return this._hasDefinedMatchers;
  }
  get isBackground() {
    return this._isBackground;
  }
  set isBackground(value) {
    if (value !== true && value !== false) {
      value = false;
    }
    this.clear();
    this._isBackground = value;
  }
  get source() {
    return this._source;
  }
  set source(value) {
    if (typeof value !== "string" || value.length === 0) {
      throw illegalArgument("source must be a string of length > 0");
    }
    this.clear();
    this._source = value;
  }
  get group() {
    return this._group;
  }
  set group(value) {
    if (value === null) {
      value = void 0;
    }
    this.clear();
    this._group = value;
  }
  get detail() {
    return this._detail;
  }
  set detail(value) {
    if (value === null) {
      value = void 0;
    }
    this._detail = value;
  }
  get presentationOptions() {
    return this._presentationOptions;
  }
  set presentationOptions(value) {
    if (value === null || value === void 0) {
      value = /* @__PURE__ */ Object.create(null);
    }
    this.clear();
    this._presentationOptions = value;
  }
  get runOptions() {
    return this._runOptions;
  }
  set runOptions(value) {
    if (value === null || value === void 0) {
      value = /* @__PURE__ */ Object.create(null);
    }
    this.clear();
    this._runOptions = value;
  }
};
Task = Task_1 = __decorate([
  es5ClassCompat
], Task);
var ProgressLocation;
(function(ProgressLocation2) {
  ProgressLocation2[ProgressLocation2["SourceControl"] = 1] = "SourceControl";
  ProgressLocation2[ProgressLocation2["Window"] = 10] = "Window";
  ProgressLocation2[ProgressLocation2["Notification"] = 15] = "Notification";
})(ProgressLocation || (ProgressLocation = {}));
var ViewBadge;
(function(ViewBadge2) {
  function isViewBadge(thing) {
    const viewBadgeThing = thing;
    if (!isNumber(viewBadgeThing.value)) {
      console.log("INVALID view badge, invalid value", viewBadgeThing.value);
      return false;
    }
    if (viewBadgeThing.tooltip && !isString(viewBadgeThing.tooltip)) {
      console.log("INVALID view badge, invalid tooltip", viewBadgeThing.tooltip);
      return false;
    }
    return true;
  }
  __name(isViewBadge, "isViewBadge");
  ViewBadge2.isViewBadge = isViewBadge;
})(ViewBadge || (ViewBadge = {}));
let TreeItem = TreeItem_1 = class TreeItem2 {
  static {
    __name(this, "TreeItem");
  }
  static isTreeItem(thing, extension) {
    const treeItemThing = thing;
    if (treeItemThing.checkboxState !== void 0) {
      const checkbox = isNumber(treeItemThing.checkboxState) ? treeItemThing.checkboxState : isObject(treeItemThing.checkboxState) && isNumber(treeItemThing.checkboxState.state) ? treeItemThing.checkboxState.state : void 0;
      const tooltip = !isNumber(treeItemThing.checkboxState) && isObject(treeItemThing.checkboxState) ? treeItemThing.checkboxState.tooltip : void 0;
      if (checkbox === void 0 || checkbox !== TreeItemCheckboxState.Checked && checkbox !== TreeItemCheckboxState.Unchecked || tooltip !== void 0 && !isString(tooltip)) {
        console.log("INVALID tree item, invalid checkboxState", treeItemThing.checkboxState);
        return false;
      }
    }
    if (thing instanceof TreeItem_1) {
      return true;
    }
    if (treeItemThing.label !== void 0 && !isString(treeItemThing.label) && !treeItemThing.label?.label) {
      console.log("INVALID tree item, invalid label", treeItemThing.label);
      return false;
    }
    if (treeItemThing.id !== void 0 && !isString(treeItemThing.id)) {
      console.log("INVALID tree item, invalid id", treeItemThing.id);
      return false;
    }
    if (treeItemThing.iconPath !== void 0 && !isString(treeItemThing.iconPath) && !URI.isUri(treeItemThing.iconPath) && (!treeItemThing.iconPath || !isString(treeItemThing.iconPath.id))) {
      const asLightAndDarkThing = treeItemThing.iconPath;
      if (!asLightAndDarkThing || !isString(asLightAndDarkThing.light) && !URI.isUri(asLightAndDarkThing.light) && !isString(asLightAndDarkThing.dark) && !URI.isUri(asLightAndDarkThing.dark)) {
        console.log("INVALID tree item, invalid iconPath", treeItemThing.iconPath);
        return false;
      }
    }
    if (treeItemThing.description !== void 0 && !isString(treeItemThing.description) && typeof treeItemThing.description !== "boolean") {
      console.log("INVALID tree item, invalid description", treeItemThing.description);
      return false;
    }
    if (treeItemThing.resourceUri !== void 0 && !URI.isUri(treeItemThing.resourceUri)) {
      console.log("INVALID tree item, invalid resourceUri", treeItemThing.resourceUri);
      return false;
    }
    if (treeItemThing.tooltip !== void 0 && !isString(treeItemThing.tooltip) && !(treeItemThing.tooltip instanceof MarkdownString)) {
      console.log("INVALID tree item, invalid tooltip", treeItemThing.tooltip);
      return false;
    }
    if (treeItemThing.command !== void 0 && !treeItemThing.command.command) {
      console.log("INVALID tree item, invalid command", treeItemThing.command);
      return false;
    }
    if (treeItemThing.collapsibleState !== void 0 && treeItemThing.collapsibleState < TreeItemCollapsibleState.None && treeItemThing.collapsibleState > TreeItemCollapsibleState.Expanded) {
      console.log("INVALID tree item, invalid collapsibleState", treeItemThing.collapsibleState);
      return false;
    }
    if (treeItemThing.contextValue !== void 0 && !isString(treeItemThing.contextValue)) {
      console.log("INVALID tree item, invalid contextValue", treeItemThing.contextValue);
      return false;
    }
    if (treeItemThing.accessibilityInformation !== void 0 && !treeItemThing.accessibilityInformation?.label) {
      console.log("INVALID tree item, invalid accessibilityInformation", treeItemThing.accessibilityInformation);
      return false;
    }
    return true;
  }
  constructor(arg1, collapsibleState = TreeItemCollapsibleState.None) {
    this.collapsibleState = collapsibleState;
    if (URI.isUri(arg1)) {
      this.resourceUri = arg1;
    } else {
      this.label = arg1;
    }
  }
};
TreeItem = TreeItem_1 = __decorate([
  es5ClassCompat
], TreeItem);
var TreeItemCollapsibleState;
(function(TreeItemCollapsibleState2) {
  TreeItemCollapsibleState2[TreeItemCollapsibleState2["None"] = 0] = "None";
  TreeItemCollapsibleState2[TreeItemCollapsibleState2["Collapsed"] = 1] = "Collapsed";
  TreeItemCollapsibleState2[TreeItemCollapsibleState2["Expanded"] = 2] = "Expanded";
})(TreeItemCollapsibleState || (TreeItemCollapsibleState = {}));
var TreeItemCheckboxState;
(function(TreeItemCheckboxState2) {
  TreeItemCheckboxState2[TreeItemCheckboxState2["Unchecked"] = 0] = "Unchecked";
  TreeItemCheckboxState2[TreeItemCheckboxState2["Checked"] = 1] = "Checked";
})(TreeItemCheckboxState || (TreeItemCheckboxState = {}));
let DataTransferItem = class DataTransferItem2 {
  static {
    __name(this, "DataTransferItem");
  }
  async asString() {
    return typeof this.value === "string" ? this.value : JSON.stringify(this.value);
  }
  asFile() {
    return void 0;
  }
  constructor(value) {
    this.value = value;
  }
};
DataTransferItem = __decorate([
  es5ClassCompat
], DataTransferItem);
class InternalDataTransferItem extends DataTransferItem {
  static {
    __name(this, "InternalDataTransferItem");
  }
}
class InternalFileDataTransferItem extends InternalDataTransferItem {
  static {
    __name(this, "InternalFileDataTransferItem");
  }
  #file;
  constructor(file) {
    super("");
    this.#file = file;
  }
  asFile() {
    return this.#file;
  }
}
class DataTransferFile {
  static {
    __name(this, "DataTransferFile");
  }
  constructor(name, uri, itemId, getData) {
    this.name = name;
    this.uri = uri;
    this._itemId = itemId;
    this._getData = getData;
  }
  data() {
    return this._getData();
  }
}
let DataTransfer = class DataTransfer2 {
  static {
    __name(this, "DataTransfer");
  }
  #items = /* @__PURE__ */ new Map();
  constructor(init) {
    for (const [mime, item] of init ?? []) {
      const existing = this.#items.get(this.#normalizeMime(mime));
      if (existing) {
        existing.push(item);
      } else {
        this.#items.set(this.#normalizeMime(mime), [item]);
      }
    }
  }
  get(mimeType) {
    return this.#items.get(this.#normalizeMime(mimeType))?.[0];
  }
  set(mimeType, value) {
    this.#items.set(this.#normalizeMime(mimeType), [value]);
  }
  forEach(callbackfn, thisArg) {
    for (const [mime, items] of this.#items) {
      for (const item of items) {
        callbackfn.call(thisArg, item, mime, this);
      }
    }
  }
  *[Symbol.iterator]() {
    for (const [mime, items] of this.#items) {
      for (const item of items) {
        yield [mime, item];
      }
    }
  }
  #normalizeMime(mimeType) {
    return mimeType.toLowerCase();
  }
};
DataTransfer = __decorate([
  es5ClassCompat
], DataTransfer);
let DocumentDropEdit = class DocumentDropEdit2 {
  static {
    __name(this, "DocumentDropEdit");
  }
  constructor(insertText, title, kind) {
    this.insertText = insertText;
    this.title = title;
    this.kind = kind;
  }
};
DocumentDropEdit = __decorate([
  es5ClassCompat
], DocumentDropEdit);
var DocumentPasteTriggerKind;
(function(DocumentPasteTriggerKind2) {
  DocumentPasteTriggerKind2[DocumentPasteTriggerKind2["Automatic"] = 0] = "Automatic";
  DocumentPasteTriggerKind2[DocumentPasteTriggerKind2["PasteAs"] = 1] = "PasteAs";
})(DocumentPasteTriggerKind || (DocumentPasteTriggerKind = {}));
class DocumentDropOrPasteEditKind {
  static {
    __name(this, "DocumentDropOrPasteEditKind");
  }
  static {
    this.sep = ".";
  }
  constructor(value) {
    this.value = value;
  }
  append(...parts) {
    return new DocumentDropOrPasteEditKind((this.value ? [this.value, ...parts] : parts).join(DocumentDropOrPasteEditKind.sep));
  }
  intersects(other) {
    return this.contains(other) || other.contains(this);
  }
  contains(other) {
    return this.value === other.value || other.value.startsWith(this.value + DocumentDropOrPasteEditKind.sep);
  }
}
DocumentDropOrPasteEditKind.Empty = new DocumentDropOrPasteEditKind("");
DocumentDropOrPasteEditKind.Text = new DocumentDropOrPasteEditKind("text");
DocumentDropOrPasteEditKind.TextUpdateImports = DocumentDropOrPasteEditKind.Text.append("updateImports");
class DocumentPasteEdit {
  static {
    __name(this, "DocumentPasteEdit");
  }
  constructor(insertText, title, kind) {
    this.title = title;
    this.insertText = insertText;
    this.kind = kind;
  }
}
let ThemeIcon = class ThemeIcon2 {
  static {
    __name(this, "ThemeIcon");
  }
  constructor(id, color) {
    this.id = id;
    this.color = color;
  }
  static isThemeIcon(thing) {
    if (typeof thing.id !== "string") {
      console.log("INVALID ThemeIcon, invalid id", thing.id);
      return false;
    }
    return true;
  }
};
ThemeIcon = __decorate([
  es5ClassCompat
], ThemeIcon);
ThemeIcon.File = new ThemeIcon("file");
ThemeIcon.Folder = new ThemeIcon("folder");
let ThemeColor = class ThemeColor2 {
  static {
    __name(this, "ThemeColor");
  }
  constructor(id) {
    this.id = id;
  }
};
ThemeColor = __decorate([
  es5ClassCompat
], ThemeColor);
var ConfigurationTarget;
(function(ConfigurationTarget2) {
  ConfigurationTarget2[ConfigurationTarget2["Global"] = 1] = "Global";
  ConfigurationTarget2[ConfigurationTarget2["Workspace"] = 2] = "Workspace";
  ConfigurationTarget2[ConfigurationTarget2["WorkspaceFolder"] = 3] = "WorkspaceFolder";
})(ConfigurationTarget || (ConfigurationTarget = {}));
let RelativePattern = class RelativePattern2 {
  static {
    __name(this, "RelativePattern");
  }
  get base() {
    return this._base;
  }
  set base(base) {
    this._base = base;
    this._baseUri = URI.file(base);
  }
  get baseUri() {
    return this._baseUri;
  }
  set baseUri(baseUri) {
    this._baseUri = baseUri;
    this._base = baseUri.fsPath;
  }
  constructor(base, pattern) {
    if (typeof base !== "string") {
      if (!base || !URI.isUri(base) && !URI.isUri(base.uri)) {
        throw illegalArgument("base");
      }
    }
    if (typeof pattern !== "string") {
      throw illegalArgument("pattern");
    }
    if (typeof base === "string") {
      this.baseUri = URI.file(base);
    } else if (URI.isUri(base)) {
      this.baseUri = base;
    } else {
      this.baseUri = base.uri;
    }
    this.pattern = pattern;
  }
  toJSON() {
    return {
      pattern: this.pattern,
      base: this.base,
      baseUri: this.baseUri.toJSON()
    };
  }
};
RelativePattern = __decorate([
  es5ClassCompat
], RelativePattern);
const breakpointIds = /* @__PURE__ */ new WeakMap();
function setBreakpointId(bp, id) {
  breakpointIds.set(bp, id);
}
__name(setBreakpointId, "setBreakpointId");
let Breakpoint = class Breakpoint2 {
  static {
    __name(this, "Breakpoint");
  }
  constructor(enabled, condition, hitCondition, logMessage, mode) {
    this.enabled = typeof enabled === "boolean" ? enabled : true;
    if (typeof condition === "string") {
      this.condition = condition;
    }
    if (typeof hitCondition === "string") {
      this.hitCondition = hitCondition;
    }
    if (typeof logMessage === "string") {
      this.logMessage = logMessage;
    }
    if (typeof mode === "string") {
      this.mode = mode;
    }
  }
  get id() {
    if (!this._id) {
      this._id = breakpointIds.get(this) ?? generateUuid();
    }
    return this._id;
  }
};
Breakpoint = __decorate([
  es5ClassCompat
], Breakpoint);
let SourceBreakpoint = class SourceBreakpoint2 extends Breakpoint {
  static {
    __name(this, "SourceBreakpoint");
  }
  constructor(location, enabled, condition, hitCondition, logMessage, mode) {
    super(enabled, condition, hitCondition, logMessage, mode);
    if (location === null) {
      throw illegalArgument("location");
    }
    this.location = location;
  }
};
SourceBreakpoint = __decorate([
  es5ClassCompat
], SourceBreakpoint);
let FunctionBreakpoint = class FunctionBreakpoint2 extends Breakpoint {
  static {
    __name(this, "FunctionBreakpoint");
  }
  constructor(functionName, enabled, condition, hitCondition, logMessage, mode) {
    super(enabled, condition, hitCondition, logMessage, mode);
    this.functionName = functionName;
  }
};
FunctionBreakpoint = __decorate([
  es5ClassCompat
], FunctionBreakpoint);
let DataBreakpoint = class DataBreakpoint2 extends Breakpoint {
  static {
    __name(this, "DataBreakpoint");
  }
  constructor(label, dataId, canPersist, enabled, condition, hitCondition, logMessage, mode) {
    super(enabled, condition, hitCondition, logMessage, mode);
    if (!dataId) {
      throw illegalArgument("dataId");
    }
    this.label = label;
    this.dataId = dataId;
    this.canPersist = canPersist;
  }
};
DataBreakpoint = __decorate([
  es5ClassCompat
], DataBreakpoint);
let DebugAdapterExecutable = class DebugAdapterExecutable2 {
  static {
    __name(this, "DebugAdapterExecutable");
  }
  constructor(command, args, options) {
    this.command = command;
    this.args = args || [];
    this.options = options;
  }
};
DebugAdapterExecutable = __decorate([
  es5ClassCompat
], DebugAdapterExecutable);
let DebugAdapterServer = class DebugAdapterServer2 {
  static {
    __name(this, "DebugAdapterServer");
  }
  constructor(port, host) {
    this.port = port;
    this.host = host;
  }
};
DebugAdapterServer = __decorate([
  es5ClassCompat
], DebugAdapterServer);
let DebugAdapterNamedPipeServer = class DebugAdapterNamedPipeServer2 {
  static {
    __name(this, "DebugAdapterNamedPipeServer");
  }
  constructor(path) {
    this.path = path;
  }
};
DebugAdapterNamedPipeServer = __decorate([
  es5ClassCompat
], DebugAdapterNamedPipeServer);
let DebugAdapterInlineImplementation = class DebugAdapterInlineImplementation2 {
  static {
    __name(this, "DebugAdapterInlineImplementation");
  }
  constructor(impl) {
    this.implementation = impl;
  }
};
DebugAdapterInlineImplementation = __decorate([
  es5ClassCompat
], DebugAdapterInlineImplementation);
class DebugStackFrame {
  static {
    __name(this, "DebugStackFrame");
  }
  constructor(session, threadId, frameId) {
    this.session = session;
    this.threadId = threadId;
    this.frameId = frameId;
  }
}
class DebugThread {
  static {
    __name(this, "DebugThread");
  }
  constructor(session, threadId) {
    this.session = session;
    this.threadId = threadId;
  }
}
let EvaluatableExpression = class EvaluatableExpression2 {
  static {
    __name(this, "EvaluatableExpression");
  }
  constructor(range, expression) {
    this.range = range;
    this.expression = expression;
  }
};
EvaluatableExpression = __decorate([
  es5ClassCompat
], EvaluatableExpression);
var InlineCompletionTriggerKind;
(function(InlineCompletionTriggerKind2) {
  InlineCompletionTriggerKind2[InlineCompletionTriggerKind2["Invoke"] = 0] = "Invoke";
  InlineCompletionTriggerKind2[InlineCompletionTriggerKind2["Automatic"] = 1] = "Automatic";
})(InlineCompletionTriggerKind || (InlineCompletionTriggerKind = {}));
let InlineValueText = class InlineValueText2 {
  static {
    __name(this, "InlineValueText");
  }
  constructor(range, text) {
    this.range = range;
    this.text = text;
  }
};
InlineValueText = __decorate([
  es5ClassCompat
], InlineValueText);
let InlineValueVariableLookup = class InlineValueVariableLookup2 {
  static {
    __name(this, "InlineValueVariableLookup");
  }
  constructor(range, variableName, caseSensitiveLookup = true) {
    this.range = range;
    this.variableName = variableName;
    this.caseSensitiveLookup = caseSensitiveLookup;
  }
};
InlineValueVariableLookup = __decorate([
  es5ClassCompat
], InlineValueVariableLookup);
let InlineValueEvaluatableExpression = class InlineValueEvaluatableExpression2 {
  static {
    __name(this, "InlineValueEvaluatableExpression");
  }
  constructor(range, expression) {
    this.range = range;
    this.expression = expression;
  }
};
InlineValueEvaluatableExpression = __decorate([
  es5ClassCompat
], InlineValueEvaluatableExpression);
let InlineValueContext = class InlineValueContext2 {
  static {
    __name(this, "InlineValueContext");
  }
  constructor(frameId, range) {
    this.frameId = frameId;
    this.stoppedLocation = range;
  }
};
InlineValueContext = __decorate([
  es5ClassCompat
], InlineValueContext);
var NewSymbolNameTag;
(function(NewSymbolNameTag2) {
  NewSymbolNameTag2[NewSymbolNameTag2["AIGenerated"] = 1] = "AIGenerated";
})(NewSymbolNameTag || (NewSymbolNameTag = {}));
var NewSymbolNameTriggerKind;
(function(NewSymbolNameTriggerKind2) {
  NewSymbolNameTriggerKind2[NewSymbolNameTriggerKind2["Invoke"] = 0] = "Invoke";
  NewSymbolNameTriggerKind2[NewSymbolNameTriggerKind2["Automatic"] = 1] = "Automatic";
})(NewSymbolNameTriggerKind || (NewSymbolNameTriggerKind = {}));
class NewSymbolName {
  static {
    __name(this, "NewSymbolName");
  }
  constructor(newSymbolName, tags) {
    this.newSymbolName = newSymbolName;
    this.tags = tags;
  }
}
var FileChangeType;
(function(FileChangeType2) {
  FileChangeType2[FileChangeType2["Changed"] = 1] = "Changed";
  FileChangeType2[FileChangeType2["Created"] = 2] = "Created";
  FileChangeType2[FileChangeType2["Deleted"] = 3] = "Deleted";
})(FileChangeType || (FileChangeType = {}));
let FileSystemError = FileSystemError_1 = class FileSystemError2 extends Error {
  static {
    __name(this, "FileSystemError");
  }
  static FileExists(messageOrUri) {
    return new FileSystemError_1(messageOrUri, FileSystemProviderErrorCode.FileExists, FileSystemError_1.FileExists);
  }
  static FileNotFound(messageOrUri) {
    return new FileSystemError_1(messageOrUri, FileSystemProviderErrorCode.FileNotFound, FileSystemError_1.FileNotFound);
  }
  static FileNotADirectory(messageOrUri) {
    return new FileSystemError_1(messageOrUri, FileSystemProviderErrorCode.FileNotADirectory, FileSystemError_1.FileNotADirectory);
  }
  static FileIsADirectory(messageOrUri) {
    return new FileSystemError_1(messageOrUri, FileSystemProviderErrorCode.FileIsADirectory, FileSystemError_1.FileIsADirectory);
  }
  static NoPermissions(messageOrUri) {
    return new FileSystemError_1(messageOrUri, FileSystemProviderErrorCode.NoPermissions, FileSystemError_1.NoPermissions);
  }
  static Unavailable(messageOrUri) {
    return new FileSystemError_1(messageOrUri, FileSystemProviderErrorCode.Unavailable, FileSystemError_1.Unavailable);
  }
  constructor(uriOrMessage, code = FileSystemProviderErrorCode.Unknown, terminator) {
    super(URI.isUri(uriOrMessage) ? uriOrMessage.toString(true) : uriOrMessage);
    this.code = terminator?.name ?? "Unknown";
    markAsFileSystemProviderError(this, code);
    Object.setPrototypeOf(this, FileSystemError_1.prototype);
    if (typeof Error.captureStackTrace === "function" && typeof terminator === "function") {
      Error.captureStackTrace(this, terminator);
    }
  }
};
FileSystemError = FileSystemError_1 = __decorate([
  es5ClassCompat
], FileSystemError);
let FoldingRange = class FoldingRange2 {
  static {
    __name(this, "FoldingRange");
  }
  constructor(start, end, kind) {
    this.start = start;
    this.end = end;
    this.kind = kind;
  }
};
FoldingRange = __decorate([
  es5ClassCompat
], FoldingRange);
var FoldingRangeKind;
(function(FoldingRangeKind2) {
  FoldingRangeKind2[FoldingRangeKind2["Comment"] = 1] = "Comment";
  FoldingRangeKind2[FoldingRangeKind2["Imports"] = 2] = "Imports";
  FoldingRangeKind2[FoldingRangeKind2["Region"] = 3] = "Region";
})(FoldingRangeKind || (FoldingRangeKind = {}));
var CommentThreadCollapsibleState;
(function(CommentThreadCollapsibleState2) {
  CommentThreadCollapsibleState2[CommentThreadCollapsibleState2["Collapsed"] = 0] = "Collapsed";
  CommentThreadCollapsibleState2[CommentThreadCollapsibleState2["Expanded"] = 1] = "Expanded";
})(CommentThreadCollapsibleState || (CommentThreadCollapsibleState = {}));
var CommentMode;
(function(CommentMode2) {
  CommentMode2[CommentMode2["Editing"] = 0] = "Editing";
  CommentMode2[CommentMode2["Preview"] = 1] = "Preview";
})(CommentMode || (CommentMode = {}));
var CommentState;
(function(CommentState2) {
  CommentState2[CommentState2["Published"] = 0] = "Published";
  CommentState2[CommentState2["Draft"] = 1] = "Draft";
})(CommentState || (CommentState = {}));
var CommentThreadState;
(function(CommentThreadState2) {
  CommentThreadState2[CommentThreadState2["Unresolved"] = 0] = "Unresolved";
  CommentThreadState2[CommentThreadState2["Resolved"] = 1] = "Resolved";
})(CommentThreadState || (CommentThreadState = {}));
var CommentThreadApplicability;
(function(CommentThreadApplicability2) {
  CommentThreadApplicability2[CommentThreadApplicability2["Current"] = 0] = "Current";
  CommentThreadApplicability2[CommentThreadApplicability2["Outdated"] = 1] = "Outdated";
})(CommentThreadApplicability || (CommentThreadApplicability = {}));
var CommentThreadFocus;
(function(CommentThreadFocus2) {
  CommentThreadFocus2[CommentThreadFocus2["Reply"] = 1] = "Reply";
  CommentThreadFocus2[CommentThreadFocus2["Comment"] = 2] = "Comment";
})(CommentThreadFocus || (CommentThreadFocus = {}));
class SemanticTokensLegend {
  static {
    __name(this, "SemanticTokensLegend");
  }
  constructor(tokenTypes, tokenModifiers = []) {
    this.tokenTypes = tokenTypes;
    this.tokenModifiers = tokenModifiers;
  }
}
function isStrArrayOrUndefined(arg) {
  return typeof arg === "undefined" || isStringArray(arg);
}
__name(isStrArrayOrUndefined, "isStrArrayOrUndefined");
class SemanticTokensBuilder {
  static {
    __name(this, "SemanticTokensBuilder");
  }
  constructor(legend) {
    this._prevLine = 0;
    this._prevChar = 0;
    this._dataIsSortedAndDeltaEncoded = true;
    this._data = [];
    this._dataLen = 0;
    this._tokenTypeStrToInt = /* @__PURE__ */ new Map();
    this._tokenModifierStrToInt = /* @__PURE__ */ new Map();
    this._hasLegend = false;
    if (legend) {
      this._hasLegend = true;
      for (let i = 0, len = legend.tokenTypes.length; i < len; i++) {
        this._tokenTypeStrToInt.set(legend.tokenTypes[i], i);
      }
      for (let i = 0, len = legend.tokenModifiers.length; i < len; i++) {
        this._tokenModifierStrToInt.set(legend.tokenModifiers[i], i);
      }
    }
  }
  push(arg0, arg1, arg2, arg3, arg4) {
    if (typeof arg0 === "number" && typeof arg1 === "number" && typeof arg2 === "number" && typeof arg3 === "number" && (typeof arg4 === "number" || typeof arg4 === "undefined")) {
      if (typeof arg4 === "undefined") {
        arg4 = 0;
      }
      return this._pushEncoded(arg0, arg1, arg2, arg3, arg4);
    }
    if (Range.isRange(arg0) && typeof arg1 === "string" && isStrArrayOrUndefined(arg2)) {
      return this._push(arg0, arg1, arg2);
    }
    throw illegalArgument();
  }
  _push(range, tokenType, tokenModifiers) {
    if (!this._hasLegend) {
      throw new Error("Legend must be provided in constructor");
    }
    if (range.start.line !== range.end.line) {
      throw new Error("`range` cannot span multiple lines");
    }
    if (!this._tokenTypeStrToInt.has(tokenType)) {
      throw new Error("`tokenType` is not in the provided legend");
    }
    const line = range.start.line;
    const char = range.start.character;
    const length = range.end.character - range.start.character;
    const nTokenType = this._tokenTypeStrToInt.get(tokenType);
    let nTokenModifiers = 0;
    if (tokenModifiers) {
      for (const tokenModifier of tokenModifiers) {
        if (!this._tokenModifierStrToInt.has(tokenModifier)) {
          throw new Error("`tokenModifier` is not in the provided legend");
        }
        const nTokenModifier = this._tokenModifierStrToInt.get(tokenModifier);
        nTokenModifiers |= 1 << nTokenModifier >>> 0;
      }
    }
    this._pushEncoded(line, char, length, nTokenType, nTokenModifiers);
  }
  _pushEncoded(line, char, length, tokenType, tokenModifiers) {
    if (this._dataIsSortedAndDeltaEncoded && (line < this._prevLine || line === this._prevLine && char < this._prevChar)) {
      this._dataIsSortedAndDeltaEncoded = false;
      const tokenCount = this._data.length / 5 | 0;
      let prevLine = 0;
      let prevChar = 0;
      for (let i = 0; i < tokenCount; i++) {
        let line2 = this._data[5 * i];
        let char2 = this._data[5 * i + 1];
        if (line2 === 0) {
          line2 = prevLine;
          char2 += prevChar;
        } else {
          line2 += prevLine;
        }
        this._data[5 * i] = line2;
        this._data[5 * i + 1] = char2;
        prevLine = line2;
        prevChar = char2;
      }
    }
    let pushLine = line;
    let pushChar = char;
    if (this._dataIsSortedAndDeltaEncoded && this._dataLen > 0) {
      pushLine -= this._prevLine;
      if (pushLine === 0) {
        pushChar -= this._prevChar;
      }
    }
    this._data[this._dataLen++] = pushLine;
    this._data[this._dataLen++] = pushChar;
    this._data[this._dataLen++] = length;
    this._data[this._dataLen++] = tokenType;
    this._data[this._dataLen++] = tokenModifiers;
    this._prevLine = line;
    this._prevChar = char;
  }
  static _sortAndDeltaEncode(data) {
    const pos = [];
    const tokenCount = data.length / 5 | 0;
    for (let i = 0; i < tokenCount; i++) {
      pos[i] = i;
    }
    pos.sort((a, b) => {
      const aLine = data[5 * a];
      const bLine = data[5 * b];
      if (aLine === bLine) {
        const aChar = data[5 * a + 1];
        const bChar = data[5 * b + 1];
        return aChar - bChar;
      }
      return aLine - bLine;
    });
    const result = new Uint32Array(data.length);
    let prevLine = 0;
    let prevChar = 0;
    for (let i = 0; i < tokenCount; i++) {
      const srcOffset = 5 * pos[i];
      const line = data[srcOffset + 0];
      const char = data[srcOffset + 1];
      const length = data[srcOffset + 2];
      const tokenType = data[srcOffset + 3];
      const tokenModifiers = data[srcOffset + 4];
      const pushLine = line - prevLine;
      const pushChar = pushLine === 0 ? char - prevChar : char;
      const dstOffset = 5 * i;
      result[dstOffset + 0] = pushLine;
      result[dstOffset + 1] = pushChar;
      result[dstOffset + 2] = length;
      result[dstOffset + 3] = tokenType;
      result[dstOffset + 4] = tokenModifiers;
      prevLine = line;
      prevChar = char;
    }
    return result;
  }
  build(resultId) {
    if (!this._dataIsSortedAndDeltaEncoded) {
      return new SemanticTokens(SemanticTokensBuilder._sortAndDeltaEncode(this._data), resultId);
    }
    return new SemanticTokens(new Uint32Array(this._data), resultId);
  }
}
class SemanticTokens {
  static {
    __name(this, "SemanticTokens");
  }
  constructor(data, resultId) {
    this.resultId = resultId;
    this.data = data;
  }
}
class SemanticTokensEdit {
  static {
    __name(this, "SemanticTokensEdit");
  }
  constructor(start, deleteCount, data) {
    this.start = start;
    this.deleteCount = deleteCount;
    this.data = data;
  }
}
class SemanticTokensEdits {
  static {
    __name(this, "SemanticTokensEdits");
  }
  constructor(edits, resultId) {
    this.resultId = resultId;
    this.edits = edits;
  }
}
var DebugConsoleMode;
(function(DebugConsoleMode2) {
  DebugConsoleMode2[DebugConsoleMode2["Separate"] = 0] = "Separate";
  DebugConsoleMode2[DebugConsoleMode2["MergeWithParent"] = 1] = "MergeWithParent";
})(DebugConsoleMode || (DebugConsoleMode = {}));
class DebugVisualization {
  static {
    __name(this, "DebugVisualization");
  }
  constructor(name) {
    this.name = name;
  }
}
var QuickInputButtonLocation;
(function(QuickInputButtonLocation2) {
  QuickInputButtonLocation2[QuickInputButtonLocation2["Title"] = 1] = "Title";
  QuickInputButtonLocation2[QuickInputButtonLocation2["Inline"] = 2] = "Inline";
})(QuickInputButtonLocation || (QuickInputButtonLocation = {}));
let QuickInputButtons = class QuickInputButtons2 {
  static {
    __name(this, "QuickInputButtons");
  }
  static {
    this.Back = { iconPath: new ThemeIcon("arrow-left") };
  }
  constructor() {
  }
};
QuickInputButtons = __decorate([
  es5ClassCompat
], QuickInputButtons);
var QuickPickItemKind;
(function(QuickPickItemKind2) {
  QuickPickItemKind2[QuickPickItemKind2["Separator"] = -1] = "Separator";
  QuickPickItemKind2[QuickPickItemKind2["Default"] = 0] = "Default";
})(QuickPickItemKind || (QuickPickItemKind = {}));
var InputBoxValidationSeverity;
(function(InputBoxValidationSeverity2) {
  InputBoxValidationSeverity2[InputBoxValidationSeverity2["Info"] = 1] = "Info";
  InputBoxValidationSeverity2[InputBoxValidationSeverity2["Warning"] = 2] = "Warning";
  InputBoxValidationSeverity2[InputBoxValidationSeverity2["Error"] = 3] = "Error";
})(InputBoxValidationSeverity || (InputBoxValidationSeverity = {}));
var ExtensionKind;
(function(ExtensionKind2) {
  ExtensionKind2[ExtensionKind2["UI"] = 1] = "UI";
  ExtensionKind2[ExtensionKind2["Workspace"] = 2] = "Workspace";
})(ExtensionKind || (ExtensionKind = {}));
class FileDecoration {
  static {
    __name(this, "FileDecoration");
  }
  static validate(d) {
    if (typeof d.badge === "string") {
      let len = nextCharLength(d.badge, 0);
      if (len < d.badge.length) {
        len += nextCharLength(d.badge, len);
      }
      if (d.badge.length > len) {
        throw new Error(`The 'badge'-property must be undefined or a short character`);
      }
    } else if (d.badge) {
      if (!ThemeIcon.isThemeIcon(d.badge)) {
        throw new Error(`The 'badge'-property is not a valid ThemeIcon`);
      }
    }
    if (!d.color && !d.badge && !d.tooltip) {
      throw new Error(`The decoration is empty`);
    }
    return true;
  }
  constructor(badge, tooltip, color) {
    this.badge = badge;
    this.tooltip = tooltip;
    this.color = color;
  }
}
let ColorTheme = class ColorTheme2 {
  static {
    __name(this, "ColorTheme");
  }
  constructor(kind) {
    this.kind = kind;
  }
};
ColorTheme = __decorate([
  es5ClassCompat
], ColorTheme);
var ColorThemeKind;
(function(ColorThemeKind2) {
  ColorThemeKind2[ColorThemeKind2["Light"] = 1] = "Light";
  ColorThemeKind2[ColorThemeKind2["Dark"] = 2] = "Dark";
  ColorThemeKind2[ColorThemeKind2["HighContrast"] = 3] = "HighContrast";
  ColorThemeKind2[ColorThemeKind2["HighContrastLight"] = 4] = "HighContrastLight";
})(ColorThemeKind || (ColorThemeKind = {}));
class NotebookRange {
  static {
    __name(this, "NotebookRange");
  }
  static isNotebookRange(thing) {
    if (thing instanceof NotebookRange) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return typeof thing.start === "number" && typeof thing.end === "number";
  }
  get start() {
    return this._start;
  }
  get end() {
    return this._end;
  }
  get isEmpty() {
    return this._start === this._end;
  }
  constructor(start, end) {
    if (start < 0) {
      throw illegalArgument("start must be positive");
    }
    if (end < 0) {
      throw illegalArgument("end must be positive");
    }
    if (start <= end) {
      this._start = start;
      this._end = end;
    } else {
      this._start = end;
      this._end = start;
    }
  }
  with(change) {
    let start = this._start;
    let end = this._end;
    if (change.start !== void 0) {
      start = change.start;
    }
    if (change.end !== void 0) {
      end = change.end;
    }
    if (start === this._start && end === this._end) {
      return this;
    }
    return new NotebookRange(start, end);
  }
}
class NotebookCellData {
  static {
    __name(this, "NotebookCellData");
  }
  static validate(data) {
    if (typeof data.kind !== "number") {
      throw new Error("NotebookCellData MUST have 'kind' property");
    }
    if (typeof data.value !== "string") {
      throw new Error("NotebookCellData MUST have 'value' property");
    }
    if (typeof data.languageId !== "string") {
      throw new Error("NotebookCellData MUST have 'languageId' property");
    }
  }
  static isNotebookCellDataArray(value) {
    return Array.isArray(value) && value.every((elem) => NotebookCellData.isNotebookCellData(elem));
  }
  static isNotebookCellData(value) {
    return true;
  }
  constructor(kind, value, languageId, mime, outputs, metadata, executionSummary) {
    this.kind = kind;
    this.value = value;
    this.languageId = languageId;
    this.mime = mime;
    this.outputs = outputs ?? [];
    this.metadata = metadata;
    this.executionSummary = executionSummary;
    NotebookCellData.validate(this);
  }
}
class NotebookData {
  static {
    __name(this, "NotebookData");
  }
  constructor(cells) {
    this.cells = cells;
  }
}
class NotebookCellOutputItem {
  static {
    __name(this, "NotebookCellOutputItem");
  }
  static isNotebookCellOutputItem(obj) {
    if (obj instanceof NotebookCellOutputItem) {
      return true;
    }
    if (!obj) {
      return false;
    }
    return typeof obj.mime === "string" && obj.data instanceof Uint8Array;
  }
  static error(err) {
    const obj = {
      name: err.name,
      message: err.message,
      stack: err.stack
    };
    return NotebookCellOutputItem.json(obj, "application/vnd.code.notebook.error");
  }
  static stdout(value) {
    return NotebookCellOutputItem.text(value, "application/vnd.code.notebook.stdout");
  }
  static stderr(value) {
    return NotebookCellOutputItem.text(value, "application/vnd.code.notebook.stderr");
  }
  static bytes(value, mime = "application/octet-stream") {
    return new NotebookCellOutputItem(value, mime);
  }
  static #encoder = new TextEncoder();
  static text(value, mime = Mimes.text) {
    const bytes = NotebookCellOutputItem.#encoder.encode(String(value));
    return new NotebookCellOutputItem(bytes, mime);
  }
  static json(value, mime = "text/x-json") {
    const rawStr = JSON.stringify(value, void 0, "	");
    return NotebookCellOutputItem.text(rawStr, mime);
  }
  constructor(data, mime) {
    this.data = data;
    this.mime = mime;
    const mimeNormalized = normalizeMimeType(mime, true);
    if (!mimeNormalized) {
      throw new Error(`INVALID mime type: ${mime}. Must be in the format "type/subtype[;optionalparameter]"`);
    }
    this.mime = mimeNormalized;
  }
}
class NotebookCellOutput {
  static {
    __name(this, "NotebookCellOutput");
  }
  static isNotebookCellOutput(candidate) {
    if (candidate instanceof NotebookCellOutput) {
      return true;
    }
    if (!candidate || typeof candidate !== "object") {
      return false;
    }
    return typeof candidate.id === "string" && Array.isArray(candidate.items);
  }
  static ensureUniqueMimeTypes(items, warn = false) {
    const seen = /* @__PURE__ */ new Set();
    const removeIdx = /* @__PURE__ */ new Set();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const normalMime = normalizeMimeType(item.mime);
      if (!seen.has(normalMime) || isTextStreamMime(normalMime)) {
        seen.add(normalMime);
        continue;
      }
      removeIdx.add(i);
      if (warn) {
        console.warn(`DUPLICATED mime type '${item.mime}' will be dropped`);
      }
    }
    if (removeIdx.size === 0) {
      return items;
    }
    return items.filter((_item, index) => !removeIdx.has(index));
  }
  constructor(items, idOrMetadata, metadata) {
    this.items = NotebookCellOutput.ensureUniqueMimeTypes(items, true);
    if (typeof idOrMetadata === "string") {
      this.id = idOrMetadata;
      this.metadata = metadata;
    } else {
      this.id = generateUuid();
      this.metadata = idOrMetadata ?? metadata;
    }
  }
}
class CellErrorStackFrame {
  static {
    __name(this, "CellErrorStackFrame");
  }
  /**
   * @param label The name of the stack frame
   * @param file The file URI of the stack frame
   * @param position The position of the stack frame within the file
   */
  constructor(label, uri, position) {
    this.label = label;
    this.uri = uri;
    this.position = position;
  }
}
var NotebookCellKind;
(function(NotebookCellKind2) {
  NotebookCellKind2[NotebookCellKind2["Markup"] = 1] = "Markup";
  NotebookCellKind2[NotebookCellKind2["Code"] = 2] = "Code";
})(NotebookCellKind || (NotebookCellKind = {}));
var NotebookCellExecutionState;
(function(NotebookCellExecutionState2) {
  NotebookCellExecutionState2[NotebookCellExecutionState2["Idle"] = 1] = "Idle";
  NotebookCellExecutionState2[NotebookCellExecutionState2["Pending"] = 2] = "Pending";
  NotebookCellExecutionState2[NotebookCellExecutionState2["Executing"] = 3] = "Executing";
})(NotebookCellExecutionState || (NotebookCellExecutionState = {}));
var NotebookCellStatusBarAlignment;
(function(NotebookCellStatusBarAlignment2) {
  NotebookCellStatusBarAlignment2[NotebookCellStatusBarAlignment2["Left"] = 1] = "Left";
  NotebookCellStatusBarAlignment2[NotebookCellStatusBarAlignment2["Right"] = 2] = "Right";
})(NotebookCellStatusBarAlignment || (NotebookCellStatusBarAlignment = {}));
var NotebookEditorRevealType;
(function(NotebookEditorRevealType2) {
  NotebookEditorRevealType2[NotebookEditorRevealType2["Default"] = 0] = "Default";
  NotebookEditorRevealType2[NotebookEditorRevealType2["InCenter"] = 1] = "InCenter";
  NotebookEditorRevealType2[NotebookEditorRevealType2["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
  NotebookEditorRevealType2[NotebookEditorRevealType2["AtTop"] = 3] = "AtTop";
})(NotebookEditorRevealType || (NotebookEditorRevealType = {}));
class NotebookCellStatusBarItem {
  static {
    __name(this, "NotebookCellStatusBarItem");
  }
  constructor(text, alignment) {
    this.text = text;
    this.alignment = alignment;
  }
}
var NotebookControllerAffinity;
(function(NotebookControllerAffinity3) {
  NotebookControllerAffinity3[NotebookControllerAffinity3["Default"] = 1] = "Default";
  NotebookControllerAffinity3[NotebookControllerAffinity3["Preferred"] = 2] = "Preferred";
})(NotebookControllerAffinity || (NotebookControllerAffinity = {}));
var NotebookControllerAffinity2;
(function(NotebookControllerAffinity22) {
  NotebookControllerAffinity22[NotebookControllerAffinity22["Default"] = 1] = "Default";
  NotebookControllerAffinity22[NotebookControllerAffinity22["Preferred"] = 2] = "Preferred";
  NotebookControllerAffinity22[NotebookControllerAffinity22["Hidden"] = -1] = "Hidden";
})(NotebookControllerAffinity2 || (NotebookControllerAffinity2 = {}));
class NotebookRendererScript {
  static {
    __name(this, "NotebookRendererScript");
  }
  constructor(uri, provides = []) {
    this.uri = uri;
    this.provides = asArray(provides);
  }
}
class NotebookKernelSourceAction {
  static {
    __name(this, "NotebookKernelSourceAction");
  }
  constructor(label) {
    this.label = label;
  }
}
var NotebookVariablesRequestKind;
(function(NotebookVariablesRequestKind2) {
  NotebookVariablesRequestKind2[NotebookVariablesRequestKind2["Named"] = 1] = "Named";
  NotebookVariablesRequestKind2[NotebookVariablesRequestKind2["Indexed"] = 2] = "Indexed";
})(NotebookVariablesRequestKind || (NotebookVariablesRequestKind = {}));
let TimelineItem = class TimelineItem2 {
  static {
    __name(this, "TimelineItem");
  }
  constructor(label, timestamp) {
    this.label = label;
    this.timestamp = timestamp;
  }
};
TimelineItem = __decorate([
  es5ClassCompat
], TimelineItem);
var ExtensionMode;
(function(ExtensionMode2) {
  ExtensionMode2[ExtensionMode2["Production"] = 1] = "Production";
  ExtensionMode2[ExtensionMode2["Development"] = 2] = "Development";
  ExtensionMode2[ExtensionMode2["Test"] = 3] = "Test";
})(ExtensionMode || (ExtensionMode = {}));
var ExtensionRuntime;
(function(ExtensionRuntime2) {
  ExtensionRuntime2[ExtensionRuntime2["Node"] = 1] = "Node";
  ExtensionRuntime2[ExtensionRuntime2["Webworker"] = 2] = "Webworker";
})(ExtensionRuntime || (ExtensionRuntime = {}));
var StandardTokenType;
(function(StandardTokenType2) {
  StandardTokenType2[StandardTokenType2["Other"] = 0] = "Other";
  StandardTokenType2[StandardTokenType2["Comment"] = 1] = "Comment";
  StandardTokenType2[StandardTokenType2["String"] = 2] = "String";
  StandardTokenType2[StandardTokenType2["RegEx"] = 3] = "RegEx";
})(StandardTokenType || (StandardTokenType = {}));
class LinkedEditingRanges {
  static {
    __name(this, "LinkedEditingRanges");
  }
  constructor(ranges, wordPattern) {
    this.ranges = ranges;
    this.wordPattern = wordPattern;
  }
}
class PortAttributes {
  static {
    __name(this, "PortAttributes");
  }
  constructor(autoForwardAction) {
    this._autoForwardAction = autoForwardAction;
  }
  get autoForwardAction() {
    return this._autoForwardAction;
  }
}
var TestResultState;
(function(TestResultState2) {
  TestResultState2[TestResultState2["Queued"] = 1] = "Queued";
  TestResultState2[TestResultState2["Running"] = 2] = "Running";
  TestResultState2[TestResultState2["Passed"] = 3] = "Passed";
  TestResultState2[TestResultState2["Failed"] = 4] = "Failed";
  TestResultState2[TestResultState2["Skipped"] = 5] = "Skipped";
  TestResultState2[TestResultState2["Errored"] = 6] = "Errored";
})(TestResultState || (TestResultState = {}));
var TestRunProfileKind;
(function(TestRunProfileKind2) {
  TestRunProfileKind2[TestRunProfileKind2["Run"] = 1] = "Run";
  TestRunProfileKind2[TestRunProfileKind2["Debug"] = 2] = "Debug";
  TestRunProfileKind2[TestRunProfileKind2["Coverage"] = 3] = "Coverage";
})(TestRunProfileKind || (TestRunProfileKind = {}));
class TestRunProfileBase {
  static {
    __name(this, "TestRunProfileBase");
  }
  constructor(controllerId, profileId, kind) {
    this.controllerId = controllerId;
    this.profileId = profileId;
    this.kind = kind;
  }
}
let TestRunRequest = class TestRunRequest2 {
  static {
    __name(this, "TestRunRequest");
  }
  constructor(include = void 0, exclude = void 0, profile = void 0, continuous = false, preserveFocus = true) {
    this.include = include;
    this.exclude = exclude;
    this.profile = profile;
    this.continuous = continuous;
    this.preserveFocus = preserveFocus;
  }
};
TestRunRequest = __decorate([
  es5ClassCompat
], TestRunRequest);
let TestMessage = TestMessage_1 = class TestMessage2 {
  static {
    __name(this, "TestMessage");
  }
  static diff(message, expected, actual) {
    const msg = new TestMessage_1(message);
    msg.expectedOutput = expected;
    msg.actualOutput = actual;
    return msg;
  }
  constructor(message) {
    this.message = message;
  }
};
TestMessage = TestMessage_1 = __decorate([
  es5ClassCompat
], TestMessage);
let TestTag = class TestTag2 {
  static {
    __name(this, "TestTag");
  }
  constructor(id) {
    this.id = id;
  }
};
TestTag = __decorate([
  es5ClassCompat
], TestTag);
class TestMessageStackFrame {
  static {
    __name(this, "TestMessageStackFrame");
  }
  /**
   * @param label The name of the stack frame
   * @param file The file URI of the stack frame
   * @param position The position of the stack frame within the file
   */
  constructor(label, uri, position) {
    this.label = label;
    this.uri = uri;
    this.position = position;
  }
}
class TestCoverageCount {
  static {
    __name(this, "TestCoverageCount");
  }
  constructor(covered, total) {
    this.covered = covered;
    this.total = total;
    validateTestCoverageCount(this);
  }
}
function validateTestCoverageCount(cc) {
  if (!cc) {
    return;
  }
  if (cc.covered > cc.total) {
    throw new Error(`The total number of covered items (${cc.covered}) cannot be greater than the total (${cc.total})`);
  }
  if (cc.total < 0) {
    throw new Error(`The number of covered items (${cc.total}) cannot be negative`);
  }
}
__name(validateTestCoverageCount, "validateTestCoverageCount");
class FileCoverage {
  static {
    __name(this, "FileCoverage");
  }
  static fromDetails(uri, details) {
    const statements = new TestCoverageCount(0, 0);
    const branches = new TestCoverageCount(0, 0);
    const decl = new TestCoverageCount(0, 0);
    for (const detail of details) {
      if ("branches" in detail) {
        statements.total += 1;
        statements.covered += detail.executed ? 1 : 0;
        for (const branch of detail.branches) {
          branches.total += 1;
          branches.covered += branch.executed ? 1 : 0;
        }
      } else {
        decl.total += 1;
        decl.covered += detail.executed ? 1 : 0;
      }
    }
    const coverage = new FileCoverage(uri, statements, branches.total > 0 ? branches : void 0, decl.total > 0 ? decl : void 0);
    coverage.detailedCoverage = details;
    return coverage;
  }
  constructor(uri, statementCoverage, branchCoverage, declarationCoverage, includesTests = []) {
    this.uri = uri;
    this.statementCoverage = statementCoverage;
    this.branchCoverage = branchCoverage;
    this.declarationCoverage = declarationCoverage;
    this.includesTests = includesTests;
  }
}
class StatementCoverage {
  static {
    __name(this, "StatementCoverage");
  }
  // back compat until finalization:
  get executionCount() {
    return +this.executed;
  }
  set executionCount(n) {
    this.executed = n;
  }
  constructor(executed, location, branches = []) {
    this.executed = executed;
    this.location = location;
    this.branches = branches;
  }
}
class BranchCoverage {
  static {
    __name(this, "BranchCoverage");
  }
  // back compat until finalization:
  get executionCount() {
    return +this.executed;
  }
  set executionCount(n) {
    this.executed = n;
  }
  constructor(executed, location, label) {
    this.executed = executed;
    this.location = location;
    this.label = label;
  }
}
class DeclarationCoverage {
  static {
    __name(this, "DeclarationCoverage");
  }
  // back compat until finalization:
  get executionCount() {
    return +this.executed;
  }
  set executionCount(n) {
    this.executed = n;
  }
  constructor(name, executed, location) {
    this.name = name;
    this.executed = executed;
    this.location = location;
  }
}
var ExternalUriOpenerPriority;
(function(ExternalUriOpenerPriority2) {
  ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["None"] = 0] = "None";
  ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["Option"] = 1] = "Option";
  ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["Default"] = 2] = "Default";
  ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["Preferred"] = 3] = "Preferred";
})(ExternalUriOpenerPriority || (ExternalUriOpenerPriority = {}));
var WorkspaceTrustState;
(function(WorkspaceTrustState2) {
  WorkspaceTrustState2[WorkspaceTrustState2["Untrusted"] = 0] = "Untrusted";
  WorkspaceTrustState2[WorkspaceTrustState2["Trusted"] = 1] = "Trusted";
  WorkspaceTrustState2[WorkspaceTrustState2["Unspecified"] = 2] = "Unspecified";
})(WorkspaceTrustState || (WorkspaceTrustState = {}));
var PortAutoForwardAction;
(function(PortAutoForwardAction2) {
  PortAutoForwardAction2[PortAutoForwardAction2["Notify"] = 1] = "Notify";
  PortAutoForwardAction2[PortAutoForwardAction2["OpenBrowser"] = 2] = "OpenBrowser";
  PortAutoForwardAction2[PortAutoForwardAction2["OpenPreview"] = 3] = "OpenPreview";
  PortAutoForwardAction2[PortAutoForwardAction2["Silent"] = 4] = "Silent";
  PortAutoForwardAction2[PortAutoForwardAction2["Ignore"] = 5] = "Ignore";
  PortAutoForwardAction2[PortAutoForwardAction2["OpenBrowserOnce"] = 6] = "OpenBrowserOnce";
})(PortAutoForwardAction || (PortAutoForwardAction = {}));
class TypeHierarchyItem {
  static {
    __name(this, "TypeHierarchyItem");
  }
  constructor(kind, name, detail, uri, range, selectionRange) {
    this.kind = kind;
    this.name = name;
    this.detail = detail;
    this.uri = uri;
    this.range = range;
    this.selectionRange = selectionRange;
  }
}
class TextTabInput {
  static {
    __name(this, "TextTabInput");
  }
  constructor(uri) {
    this.uri = uri;
  }
}
class TextDiffTabInput {
  static {
    __name(this, "TextDiffTabInput");
  }
  constructor(original, modified) {
    this.original = original;
    this.modified = modified;
  }
}
class TextMergeTabInput {
  static {
    __name(this, "TextMergeTabInput");
  }
  constructor(base, input1, input2, result) {
    this.base = base;
    this.input1 = input1;
    this.input2 = input2;
    this.result = result;
  }
}
class CustomEditorTabInput {
  static {
    __name(this, "CustomEditorTabInput");
  }
  constructor(uri, viewType) {
    this.uri = uri;
    this.viewType = viewType;
  }
}
class WebviewEditorTabInput {
  static {
    __name(this, "WebviewEditorTabInput");
  }
  constructor(viewType) {
    this.viewType = viewType;
  }
}
class NotebookEditorTabInput {
  static {
    __name(this, "NotebookEditorTabInput");
  }
  constructor(uri, notebookType) {
    this.uri = uri;
    this.notebookType = notebookType;
  }
}
class NotebookDiffEditorTabInput {
  static {
    __name(this, "NotebookDiffEditorTabInput");
  }
  constructor(original, modified, notebookType) {
    this.original = original;
    this.modified = modified;
    this.notebookType = notebookType;
  }
}
class TerminalEditorTabInput {
  static {
    __name(this, "TerminalEditorTabInput");
  }
  constructor() {
  }
}
class InteractiveWindowInput {
  static {
    __name(this, "InteractiveWindowInput");
  }
  constructor(uri, inputBoxUri) {
    this.uri = uri;
    this.inputBoxUri = inputBoxUri;
  }
}
class ChatEditorTabInput {
  static {
    __name(this, "ChatEditorTabInput");
  }
  constructor() {
  }
}
class TextMultiDiffTabInput {
  static {
    __name(this, "TextMultiDiffTabInput");
  }
  constructor(textDiffs) {
    this.textDiffs = textDiffs;
  }
}
var InteractiveSessionVoteDirection;
(function(InteractiveSessionVoteDirection2) {
  InteractiveSessionVoteDirection2[InteractiveSessionVoteDirection2["Down"] = 0] = "Down";
  InteractiveSessionVoteDirection2[InteractiveSessionVoteDirection2["Up"] = 1] = "Up";
})(InteractiveSessionVoteDirection || (InteractiveSessionVoteDirection = {}));
var ChatCopyKind;
(function(ChatCopyKind2) {
  ChatCopyKind2[ChatCopyKind2["Action"] = 1] = "Action";
  ChatCopyKind2[ChatCopyKind2["Toolbar"] = 2] = "Toolbar";
})(ChatCopyKind || (ChatCopyKind = {}));
var ChatVariableLevel;
(function(ChatVariableLevel2) {
  ChatVariableLevel2[ChatVariableLevel2["Short"] = 1] = "Short";
  ChatVariableLevel2[ChatVariableLevel2["Medium"] = 2] = "Medium";
  ChatVariableLevel2[ChatVariableLevel2["Full"] = 3] = "Full";
})(ChatVariableLevel || (ChatVariableLevel = {}));
class ChatCompletionItem {
  static {
    __name(this, "ChatCompletionItem");
  }
  constructor(id, label, values) {
    this.id = id;
    this.label = label;
    this.values = values;
  }
}
var ChatEditingSessionActionOutcome;
(function(ChatEditingSessionActionOutcome2) {
  ChatEditingSessionActionOutcome2[ChatEditingSessionActionOutcome2["Accepted"] = 1] = "Accepted";
  ChatEditingSessionActionOutcome2[ChatEditingSessionActionOutcome2["Rejected"] = 2] = "Rejected";
  ChatEditingSessionActionOutcome2[ChatEditingSessionActionOutcome2["Saved"] = 3] = "Saved";
})(ChatEditingSessionActionOutcome || (ChatEditingSessionActionOutcome = {}));
var ChatRequestEditedFileEventKind;
(function(ChatRequestEditedFileEventKind2) {
  ChatRequestEditedFileEventKind2[ChatRequestEditedFileEventKind2["Keep"] = 1] = "Keep";
  ChatRequestEditedFileEventKind2[ChatRequestEditedFileEventKind2["Undo"] = 2] = "Undo";
  ChatRequestEditedFileEventKind2[ChatRequestEditedFileEventKind2["UserModification"] = 3] = "UserModification";
})(ChatRequestEditedFileEventKind || (ChatRequestEditedFileEventKind = {}));
var InteractiveEditorResponseFeedbackKind;
(function(InteractiveEditorResponseFeedbackKind2) {
  InteractiveEditorResponseFeedbackKind2[InteractiveEditorResponseFeedbackKind2["Unhelpful"] = 0] = "Unhelpful";
  InteractiveEditorResponseFeedbackKind2[InteractiveEditorResponseFeedbackKind2["Helpful"] = 1] = "Helpful";
  InteractiveEditorResponseFeedbackKind2[InteractiveEditorResponseFeedbackKind2["Undone"] = 2] = "Undone";
  InteractiveEditorResponseFeedbackKind2[InteractiveEditorResponseFeedbackKind2["Accepted"] = 3] = "Accepted";
  InteractiveEditorResponseFeedbackKind2[InteractiveEditorResponseFeedbackKind2["Bug"] = 4] = "Bug";
})(InteractiveEditorResponseFeedbackKind || (InteractiveEditorResponseFeedbackKind = {}));
var ChatResultFeedbackKind;
(function(ChatResultFeedbackKind2) {
  ChatResultFeedbackKind2[ChatResultFeedbackKind2["Unhelpful"] = 0] = "Unhelpful";
  ChatResultFeedbackKind2[ChatResultFeedbackKind2["Helpful"] = 1] = "Helpful";
})(ChatResultFeedbackKind || (ChatResultFeedbackKind = {}));
class ChatResponseMarkdownPart {
  static {
    __name(this, "ChatResponseMarkdownPart");
  }
  constructor(value) {
    if (typeof value !== "string" && value.isTrusted === true) {
      throw new Error("The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.");
    }
    this.value = typeof value === "string" ? new MarkdownString(value) : value;
  }
}
class ChatResponseMarkdownWithVulnerabilitiesPart {
  static {
    __name(this, "ChatResponseMarkdownWithVulnerabilitiesPart");
  }
  constructor(value, vulnerabilities) {
    if (typeof value !== "string" && value.isTrusted === true) {
      throw new Error("The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.");
    }
    this.value = typeof value === "string" ? new MarkdownString(value) : value;
    this.vulnerabilities = vulnerabilities;
  }
}
class ChatResponseConfirmationPart {
  static {
    __name(this, "ChatResponseConfirmationPart");
  }
  constructor(title, message, data, buttons) {
    this.title = title;
    this.message = message;
    this.data = data;
    this.buttons = buttons;
  }
}
class ChatResponseFileTreePart {
  static {
    __name(this, "ChatResponseFileTreePart");
  }
  constructor(value, baseUri) {
    this.value = value;
    this.baseUri = baseUri;
  }
}
class ChatResponseAnchorPart {
  static {
    __name(this, "ChatResponseAnchorPart");
  }
  constructor(value, title) {
    this.value = value;
    this.value2 = value;
    this.title = title;
  }
}
class ChatResponseProgressPart {
  static {
    __name(this, "ChatResponseProgressPart");
  }
  constructor(value) {
    this.value = value;
  }
}
class ChatResponseProgressPart2 {
  static {
    __name(this, "ChatResponseProgressPart2");
  }
  constructor(value, task) {
    this.value = value;
    this.task = task;
  }
}
class ChatResponseWarningPart {
  static {
    __name(this, "ChatResponseWarningPart");
  }
  constructor(value) {
    if (typeof value !== "string" && value.isTrusted === true) {
      throw new Error("The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.");
    }
    this.value = typeof value === "string" ? new MarkdownString(value) : value;
  }
}
class ChatResponseCommandButtonPart {
  static {
    __name(this, "ChatResponseCommandButtonPart");
  }
  constructor(value) {
    this.value = value;
  }
}
class ChatResponseReferencePart {
  static {
    __name(this, "ChatResponseReferencePart");
  }
  constructor(value, iconPath, options) {
    this.value = value;
    this.iconPath = iconPath;
    this.options = options;
  }
}
class ChatResponseCodeblockUriPart {
  static {
    __name(this, "ChatResponseCodeblockUriPart");
  }
  constructor(value, isEdit) {
    this.value = value;
    this.isEdit = isEdit;
  }
}
class ChatResponseCodeCitationPart {
  static {
    __name(this, "ChatResponseCodeCitationPart");
  }
  constructor(value, license, snippet) {
    this.value = value;
    this.license = license;
    this.snippet = snippet;
  }
}
class ChatResponseMovePart {
  static {
    __name(this, "ChatResponseMovePart");
  }
  constructor(uri, range) {
    this.uri = uri;
    this.range = range;
  }
}
class ChatResponseExtensionsPart {
  static {
    __name(this, "ChatResponseExtensionsPart");
  }
  constructor(extensions) {
    this.extensions = extensions;
  }
}
class ChatResponseTextEditPart {
  static {
    __name(this, "ChatResponseTextEditPart");
  }
  constructor(uri, editsOrDone) {
    this.uri = uri;
    if (editsOrDone === true) {
      this.isDone = true;
      this.edits = [];
    } else {
      this.edits = Array.isArray(editsOrDone) ? editsOrDone : [editsOrDone];
    }
  }
}
class ChatResponseNotebookEditPart {
  static {
    __name(this, "ChatResponseNotebookEditPart");
  }
  constructor(uri, editsOrDone) {
    this.uri = uri;
    if (editsOrDone === true) {
      this.isDone = true;
      this.edits = [];
    } else {
      this.edits = Array.isArray(editsOrDone) ? editsOrDone : [editsOrDone];
    }
  }
}
class ChatRequestTurn {
  static {
    __name(this, "ChatRequestTurn");
  }
  constructor(prompt, command, references, participant, toolReferences, editedFileEvents) {
    this.prompt = prompt;
    this.command = command;
    this.references = references;
    this.participant = participant;
    this.toolReferences = toolReferences;
    this.editedFileEvents = editedFileEvents;
  }
}
class ChatResponseTurn {
  static {
    __name(this, "ChatResponseTurn");
  }
  constructor(response, result, participant, command) {
    this.response = response;
    this.result = result;
    this.participant = participant;
    this.command = command;
  }
}
var ChatLocation;
(function(ChatLocation2) {
  ChatLocation2[ChatLocation2["Panel"] = 1] = "Panel";
  ChatLocation2[ChatLocation2["Terminal"] = 2] = "Terminal";
  ChatLocation2[ChatLocation2["Notebook"] = 3] = "Notebook";
  ChatLocation2[ChatLocation2["Editor"] = 4] = "Editor";
})(ChatLocation || (ChatLocation = {}));
var ChatResponseReferencePartStatusKind;
(function(ChatResponseReferencePartStatusKind2) {
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Complete"] = 1] = "Complete";
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Partial"] = 2] = "Partial";
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Omitted"] = 3] = "Omitted";
})(ChatResponseReferencePartStatusKind || (ChatResponseReferencePartStatusKind = {}));
class ChatRequestEditorData {
  static {
    __name(this, "ChatRequestEditorData");
  }
  constructor(document, selection, wholeRange) {
    this.document = document;
    this.selection = selection;
    this.wholeRange = wholeRange;
  }
}
class ChatRequestNotebookData {
  static {
    __name(this, "ChatRequestNotebookData");
  }
  constructor(cell) {
    this.cell = cell;
  }
}
class ChatReferenceBinaryData {
  static {
    __name(this, "ChatReferenceBinaryData");
  }
  constructor(mimeType, data, reference) {
    this.mimeType = mimeType;
    this.data = data;
    this.reference = reference;
  }
}
class ChatReferenceDiagnostic {
  static {
    __name(this, "ChatReferenceDiagnostic");
  }
  constructor(diagnostics) {
    this.diagnostics = diagnostics;
  }
}
var LanguageModelChatMessageRole;
(function(LanguageModelChatMessageRole2) {
  LanguageModelChatMessageRole2[LanguageModelChatMessageRole2["User"] = 1] = "User";
  LanguageModelChatMessageRole2[LanguageModelChatMessageRole2["Assistant"] = 2] = "Assistant";
  LanguageModelChatMessageRole2[LanguageModelChatMessageRole2["System"] = 3] = "System";
})(LanguageModelChatMessageRole || (LanguageModelChatMessageRole = {}));
class LanguageModelToolResultPart {
  static {
    __name(this, "LanguageModelToolResultPart");
  }
  constructor(callId, content, isError) {
    this.callId = callId;
    this.content = content;
    this.isError = isError ?? false;
  }
}
class LanguageModelToolResultPart2 {
  static {
    __name(this, "LanguageModelToolResultPart2");
  }
  constructor(callId, content, isError) {
    this.callId = callId;
    this.content = content;
    this.isError = isError ?? false;
  }
}
class PreparedTerminalToolInvocation {
  static {
    __name(this, "PreparedTerminalToolInvocation");
  }
  constructor(command, language, confirmationMessages) {
    this.command = command;
    this.language = language;
    this.confirmationMessages = confirmationMessages;
  }
}
var ChatErrorLevel;
(function(ChatErrorLevel2) {
  ChatErrorLevel2[ChatErrorLevel2["Info"] = 0] = "Info";
  ChatErrorLevel2[ChatErrorLevel2["Warning"] = 1] = "Warning";
  ChatErrorLevel2[ChatErrorLevel2["Error"] = 2] = "Error";
})(ChatErrorLevel || (ChatErrorLevel = {}));
class LanguageModelChatMessage {
  static {
    __name(this, "LanguageModelChatMessage");
  }
  static User(content, name) {
    return new LanguageModelChatMessage(LanguageModelChatMessageRole.User, content, name);
  }
  static Assistant(content, name) {
    return new LanguageModelChatMessage(LanguageModelChatMessageRole.Assistant, content, name);
  }
  set content(value) {
    if (typeof value === "string") {
      this._content = [new LanguageModelTextPart(value)];
    } else {
      this._content = value;
    }
  }
  get content() {
    return this._content;
  }
  constructor(role, content, name) {
    this._content = [];
    this.role = role;
    this.content = content;
    this.name = name;
  }
}
class LanguageModelChatMessage2 {
  static {
    __name(this, "LanguageModelChatMessage2");
  }
  static User(content, name) {
    return new LanguageModelChatMessage2(LanguageModelChatMessageRole.User, content, name);
  }
  static Assistant(content, name) {
    return new LanguageModelChatMessage2(LanguageModelChatMessageRole.Assistant, content, name);
  }
  set content(value) {
    if (typeof value === "string") {
      this._content = [new LanguageModelTextPart(value)];
    } else {
      this._content = value;
    }
  }
  get content() {
    return this._content;
  }
  // Temp to avoid breaking changes
  set content2(value) {
    if (value) {
      this.content = value.map((part) => {
        if (typeof part === "string") {
          return new LanguageModelTextPart(part);
        }
        return part;
      });
    }
  }
  get content2() {
    return this.content.map((part) => {
      if (part instanceof LanguageModelTextPart) {
        return part.value;
      }
      return part;
    });
  }
  constructor(role, content, name) {
    this._content = [];
    this.role = role;
    this.content = content;
    this.name = name;
  }
}
class LanguageModelToolCallPart {
  static {
    __name(this, "LanguageModelToolCallPart");
  }
  constructor(callId, name, input) {
    this.callId = callId;
    this.name = name;
    this.input = input;
  }
}
class LanguageModelTextPart {
  static {
    __name(this, "LanguageModelTextPart");
  }
  constructor(value) {
    this.value = value;
  }
  toJSON() {
    return {
      $mid: 21,
      value: this.value
    };
  }
}
class LanguageModelDataPart {
  static {
    __name(this, "LanguageModelDataPart");
  }
  constructor(data, mimeType) {
    this.mimeType = mimeType;
    this.data = data;
  }
  static image(data, mimeType) {
    return new LanguageModelDataPart(data, mimeType);
  }
  static json(value) {
    const rawStr = JSON.stringify(value, void 0, "	");
    return new LanguageModelDataPart(VSBuffer.fromString(rawStr).buffer, "json");
  }
  static text(value) {
    return new LanguageModelDataPart(VSBuffer.fromString(value).buffer, "text/plain");
  }
  toJSON() {
    return {
      $mid: 23,
      mimeType: this.mimeType,
      data: this.data
    };
  }
}
var ChatImageMimeType;
(function(ChatImageMimeType2) {
  ChatImageMimeType2["PNG"] = "image/png";
  ChatImageMimeType2["JPEG"] = "image/jpeg";
  ChatImageMimeType2["GIF"] = "image/gif";
  ChatImageMimeType2["WEBP"] = "image/webp";
  ChatImageMimeType2["BMP"] = "image/bmp";
})(ChatImageMimeType || (ChatImageMimeType = {}));
class LanguageModelExtraDataPart {
  static {
    __name(this, "LanguageModelExtraDataPart");
  }
  constructor(kind, data) {
    this.kind = kind;
    this.data = data;
  }
  toJSON() {
    return {
      $mid: 24,
      kind: this.kind,
      data: this.data
    };
  }
}
class LanguageModelPromptTsxPart {
  static {
    __name(this, "LanguageModelPromptTsxPart");
  }
  constructor(value) {
    this.value = value;
  }
  toJSON() {
    return {
      $mid: 22,
      value: this.value
    };
  }
}
class LanguageModelChatSystemMessage {
  static {
    __name(this, "LanguageModelChatSystemMessage");
  }
  constructor(content) {
    this.content = content;
  }
}
class LanguageModelChatUserMessage {
  static {
    __name(this, "LanguageModelChatUserMessage");
  }
  constructor(content, name) {
    this.content = content;
    this.name = name;
  }
}
class LanguageModelChatAssistantMessage {
  static {
    __name(this, "LanguageModelChatAssistantMessage");
  }
  constructor(content, name) {
    this.content = content;
    this.name = name;
  }
}
class LanguageModelError extends Error {
  static {
    __name(this, "LanguageModelError");
  }
  static #name = "LanguageModelError";
  static NotFound(message) {
    return new LanguageModelError(message, LanguageModelError.NotFound.name);
  }
  static NoPermissions(message) {
    return new LanguageModelError(message, LanguageModelError.NoPermissions.name);
  }
  static Blocked(message) {
    return new LanguageModelError(message, LanguageModelError.Blocked.name);
  }
  static tryDeserialize(data) {
    if (data.name !== LanguageModelError.#name) {
      return void 0;
    }
    return new LanguageModelError(data.message, data.code, data.cause);
  }
  constructor(message, code, cause) {
    super(message, { cause });
    this.name = LanguageModelError.#name;
    this.code = code ?? "";
  }
}
class LanguageModelToolResult {
  static {
    __name(this, "LanguageModelToolResult");
  }
  constructor(content) {
    this.content = content;
  }
  toJSON() {
    return {
      $mid: 20,
      content: this.content
    };
  }
}
class LanguageModelToolResult2 {
  static {
    __name(this, "LanguageModelToolResult2");
  }
  constructor(content) {
    this.content = content;
  }
  toJSON() {
    return {
      $mid: 20,
      content: this.content
    };
  }
}
class ExtendedLanguageModelToolResult extends LanguageModelToolResult {
  static {
    __name(this, "ExtendedLanguageModelToolResult");
  }
}
var LanguageModelChatToolMode;
(function(LanguageModelChatToolMode2) {
  LanguageModelChatToolMode2[LanguageModelChatToolMode2["Auto"] = 1] = "Auto";
  LanguageModelChatToolMode2[LanguageModelChatToolMode2["Required"] = 2] = "Required";
})(LanguageModelChatToolMode || (LanguageModelChatToolMode = {}));
var RelatedInformationType;
(function(RelatedInformationType2) {
  RelatedInformationType2[RelatedInformationType2["SymbolInformation"] = 1] = "SymbolInformation";
  RelatedInformationType2[RelatedInformationType2["CommandInformation"] = 2] = "CommandInformation";
  RelatedInformationType2[RelatedInformationType2["SearchInformation"] = 3] = "SearchInformation";
  RelatedInformationType2[RelatedInformationType2["SettingInformation"] = 4] = "SettingInformation";
})(RelatedInformationType || (RelatedInformationType = {}));
var SettingsSearchResultKind;
(function(SettingsSearchResultKind2) {
  SettingsSearchResultKind2[SettingsSearchResultKind2["EMBEDDED"] = 1] = "EMBEDDED";
  SettingsSearchResultKind2[SettingsSearchResultKind2["LLM_RANKED"] = 2] = "LLM_RANKED";
  SettingsSearchResultKind2[SettingsSearchResultKind2["CANCELED"] = 3] = "CANCELED";
})(SettingsSearchResultKind || (SettingsSearchResultKind = {}));
var SpeechToTextStatus;
(function(SpeechToTextStatus2) {
  SpeechToTextStatus2[SpeechToTextStatus2["Started"] = 1] = "Started";
  SpeechToTextStatus2[SpeechToTextStatus2["Recognizing"] = 2] = "Recognizing";
  SpeechToTextStatus2[SpeechToTextStatus2["Recognized"] = 3] = "Recognized";
  SpeechToTextStatus2[SpeechToTextStatus2["Stopped"] = 4] = "Stopped";
  SpeechToTextStatus2[SpeechToTextStatus2["Error"] = 5] = "Error";
})(SpeechToTextStatus || (SpeechToTextStatus = {}));
var TextToSpeechStatus;
(function(TextToSpeechStatus2) {
  TextToSpeechStatus2[TextToSpeechStatus2["Started"] = 1] = "Started";
  TextToSpeechStatus2[TextToSpeechStatus2["Stopped"] = 2] = "Stopped";
  TextToSpeechStatus2[TextToSpeechStatus2["Error"] = 3] = "Error";
})(TextToSpeechStatus || (TextToSpeechStatus = {}));
var KeywordRecognitionStatus;
(function(KeywordRecognitionStatus2) {
  KeywordRecognitionStatus2[KeywordRecognitionStatus2["Recognized"] = 1] = "Recognized";
  KeywordRecognitionStatus2[KeywordRecognitionStatus2["Stopped"] = 2] = "Stopped";
})(KeywordRecognitionStatus || (KeywordRecognitionStatus = {}));
class InlineEdit {
  static {
    __name(this, "InlineEdit");
  }
  constructor(text, range) {
    this.text = text;
    this.range = range;
  }
}
var InlineEditTriggerKind;
(function(InlineEditTriggerKind2) {
  InlineEditTriggerKind2[InlineEditTriggerKind2["Invoke"] = 0] = "Invoke";
  InlineEditTriggerKind2[InlineEditTriggerKind2["Automatic"] = 1] = "Automatic";
})(InlineEditTriggerKind || (InlineEditTriggerKind = {}));
class McpStdioServerDefinition {
  static {
    __name(this, "McpStdioServerDefinition");
  }
  constructor(label, command, args, env = {}, version) {
    this.label = label;
    this.command = command;
    this.args = args;
    this.env = env;
    this.version = version;
  }
}
class McpHttpServerDefinition {
  static {
    __name(this, "McpHttpServerDefinition");
  }
  constructor(label, uri, headers = {}, version) {
    this.label = label;
    this.uri = uri;
    this.headers = headers;
    this.version = version;
  }
}
export {
  BranchCoverage,
  Breakpoint,
  CallHierarchyIncomingCall,
  CallHierarchyItem,
  CallHierarchyOutgoingCall,
  CellErrorStackFrame,
  ChatCompletionItem,
  ChatCopyKind,
  ChatEditingSessionActionOutcome,
  ChatEditorTabInput,
  ChatErrorLevel,
  ChatImageMimeType,
  ChatLocation,
  ChatReferenceBinaryData,
  ChatReferenceDiagnostic,
  ChatRequestEditedFileEventKind,
  ChatRequestEditorData,
  ChatRequestNotebookData,
  ChatRequestTurn,
  ChatResponseAnchorPart,
  ChatResponseCodeCitationPart,
  ChatResponseCodeblockUriPart,
  ChatResponseCommandButtonPart,
  ChatResponseConfirmationPart,
  ChatResponseExtensionsPart,
  ChatResponseFileTreePart,
  ChatResponseMarkdownPart,
  ChatResponseMarkdownWithVulnerabilitiesPart,
  ChatResponseMovePart,
  ChatResponseNotebookEditPart,
  ChatResponseProgressPart,
  ChatResponseProgressPart2,
  ChatResponseReferencePart,
  ChatResponseReferencePartStatusKind,
  ChatResponseTextEditPart,
  ChatResponseTurn,
  ChatResponseWarningPart,
  ChatResultFeedbackKind,
  ChatVariableLevel,
  CodeAction,
  CodeActionKind,
  CodeActionTriggerKind,
  CodeLens,
  Color,
  ColorFormat,
  ColorInformation,
  ColorPresentation,
  ColorTheme,
  ColorThemeKind,
  CommentMode,
  CommentState,
  CommentThreadApplicability,
  CommentThreadCollapsibleState,
  CommentThreadFocus,
  CommentThreadState,
  CompletionItem,
  CompletionItemKind,
  CompletionItemTag,
  CompletionList,
  CompletionTriggerKind,
  ConfigurationTarget,
  CustomEditorTabInput,
  CustomExecution,
  DataBreakpoint,
  DataTransfer,
  DataTransferFile,
  DataTransferItem,
  DebugAdapterExecutable,
  DebugAdapterInlineImplementation,
  DebugAdapterNamedPipeServer,
  DebugAdapterServer,
  DebugConsoleMode,
  DebugStackFrame,
  DebugThread,
  DebugVisualization,
  DeclarationCoverage,
  DecorationRangeBehavior,
  Diagnostic,
  DiagnosticRelatedInformation,
  DiagnosticSeverity,
  DiagnosticTag,
  Disposable,
  DocumentDropEdit,
  DocumentDropOrPasteEditKind,
  DocumentHighlight,
  DocumentHighlightKind,
  DocumentLink,
  DocumentPasteEdit,
  DocumentPasteTriggerKind,
  DocumentSymbol,
  EndOfLine,
  EnvironmentVariableMutatorType,
  EvaluatableExpression,
  ExtendedLanguageModelToolResult,
  ExtensionKind,
  ExtensionMode,
  ExtensionRuntime,
  ExternalUriOpenerPriority,
  FileChangeType,
  FileCoverage,
  FileDecoration,
  FileEditType,
  FileSystemError,
  FoldingRange,
  FoldingRangeKind,
  FunctionBreakpoint,
  Hover,
  HoverVerbosityAction,
  InlayHint,
  InlayHintKind,
  InlayHintLabelPart,
  InlineCompletionEndOfLifeReasonKind,
  InlineCompletionTriggerKind,
  InlineEdit,
  InlineEditTriggerKind,
  InlineSuggestion,
  InlineSuggestionList,
  InlineValueContext,
  InlineValueEvaluatableExpression,
  InlineValueText,
  InlineValueVariableLookup,
  InputBoxValidationSeverity,
  InteractiveEditorResponseFeedbackKind,
  InteractiveSessionVoteDirection,
  InteractiveWindowInput,
  InternalDataTransferItem,
  InternalFileDataTransferItem,
  KeywordRecognitionStatus,
  LanguageModelChatAssistantMessage,
  LanguageModelChatMessage,
  LanguageModelChatMessage2,
  LanguageModelChatMessageRole,
  LanguageModelChatSystemMessage,
  LanguageModelChatToolMode,
  LanguageModelChatUserMessage,
  LanguageModelDataPart,
  LanguageModelError,
  LanguageModelExtraDataPart,
  LanguageModelPromptTsxPart,
  LanguageModelTextPart,
  LanguageModelToolCallPart,
  LanguageModelToolResult,
  LanguageModelToolResult2,
  LanguageModelToolResultPart,
  LanguageModelToolResultPart2,
  LanguageStatusSeverity,
  LinkedEditingRanges,
  Location,
  ManagedResolvedAuthority,
  MarkdownString,
  McpHttpServerDefinition,
  McpStdioServerDefinition,
  MultiDocumentHighlight,
  NewSymbolName,
  NewSymbolNameTag,
  NewSymbolNameTriggerKind,
  NotebookCellData,
  NotebookCellExecutionState,
  NotebookCellKind,
  NotebookCellOutput,
  NotebookCellOutputItem,
  NotebookCellStatusBarAlignment,
  NotebookCellStatusBarItem,
  NotebookControllerAffinity,
  NotebookControllerAffinity2,
  NotebookData,
  NotebookDiffEditorTabInput,
  NotebookEdit,
  NotebookEditorRevealType,
  NotebookEditorTabInput,
  NotebookKernelSourceAction,
  NotebookRange,
  NotebookRendererScript,
  NotebookVariablesRequestKind,
  ParameterInformation,
  PartialAcceptTriggerKind,
  PortAttributes,
  PortAutoForwardAction,
  Position,
  PreparedTerminalToolInvocation,
  ProcessExecution,
  ProgressLocation,
  QuickInputButtonLocation,
  QuickInputButtons,
  QuickPickItemKind,
  Range,
  RelatedInformationType,
  RelativePattern,
  RemoteAuthorityResolverError,
  ResolvedAuthority,
  Selection,
  SelectionRange,
  SemanticTokens,
  SemanticTokensBuilder,
  SemanticTokensEdit,
  SemanticTokensEdits,
  SemanticTokensLegend,
  SettingsSearchResultKind,
  ShellExecution,
  ShellQuoting,
  SignatureHelp,
  SignatureHelpTriggerKind,
  SignatureInformation,
  SnippetString,
  SnippetTextEdit,
  SourceBreakpoint,
  SourceControlInputBoxValidationType,
  SpeechToTextStatus,
  StandardTokenType,
  StatementCoverage,
  StatusBarAlignment,
  SymbolInformation,
  SymbolKind,
  SymbolTag,
  SyntaxTokenType,
  Task,
  TaskEventKind,
  TaskGroup,
  TaskPanelKind,
  TaskRevealKind,
  TaskScope,
  TerminalCompletionItem,
  TerminalCompletionItemKind,
  TerminalCompletionList,
  TerminalEditorTabInput,
  TerminalExitReason,
  TerminalLink,
  TerminalLocation,
  TerminalOutputAnchor,
  TerminalProfile,
  TerminalQuickFixCommand,
  TerminalQuickFixOpener,
  TerminalQuickFixType,
  TerminalShellExecutionCommandLineConfidence,
  TerminalShellType,
  TestCoverageCount,
  TestMessage,
  TestMessageStackFrame,
  TestResultState,
  TestRunProfileBase,
  TestRunProfileKind,
  TestRunRequest,
  TestTag,
  TextDiffTabInput,
  TextDocumentChangeReason,
  TextDocumentSaveReason,
  TextEdit,
  TextEditorChangeKind,
  TextEditorLineNumbersStyle,
  TextEditorRevealType,
  TextEditorSelectionChangeKind,
  TextMergeTabInput,
  TextMultiDiffTabInput,
  TextTabInput,
  TextToSpeechStatus,
  ThemeColor,
  ThemeIcon,
  TimelineItem,
  TreeItem,
  TreeItemCheckboxState,
  TreeItemCollapsibleState,
  TypeHierarchyItem,
  VerboseHover,
  ViewBadge,
  ViewColumn,
  WebviewEditorTabInput,
  WorkspaceEdit,
  WorkspaceTrustState,
  asStatusBarItemIdentifier,
  getDebugDescriptionOfRange,
  getDebugDescriptionOfSelection,
  setBreakpointId,
  validateTestCoverageCount
};
//# sourceMappingURL=extHostTypes.js.map
