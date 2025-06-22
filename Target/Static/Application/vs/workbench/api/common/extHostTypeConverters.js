var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { asArray, coalesce, isNonEmptyArray } from "../../../base/common/arrays.js";
import { VSBuffer, encodeBase64 } from "../../../base/common/buffer.js";
import { UriList } from "../../../base/common/dataTransfer.js";
import { createSingleCallFunction } from "../../../base/common/functional.js";
import * as htmlContent from "../../../base/common/htmlContent.js";
import { ResourceMap, ResourceSet } from "../../../base/common/map.js";
import * as marked from "../../../base/common/marked/marked.js";
import { parse, revive } from "../../../base/common/marshalling.js";
import { Mimes } from "../../../base/common/mime.js";
import { cloneAndChange } from "../../../base/common/objects.js";
import { WellDefinedPrefixTree } from "../../../base/common/prefixTree.js";
import { basename } from "../../../base/common/resources.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { isDefined, isEmptyObject, isNumber, isString, isUndefinedOrNull } from "../../../base/common/types.js";
import { URI, isUriComponents } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import * as editorRange from "../../../editor/common/core/range.js";
import * as languages from "../../../editor/common/languages.js";
import { MarkerSeverity } from "../../../platform/markers/common/markers.js";
import { DEFAULT_EDITOR_ASSOCIATION } from "../../common/editor.js";
import { isImageVariableEntry } from "../../contrib/chat/common/chatVariableEntries.js";
import * as notebooks from "../../contrib/notebook/common/notebookCommon.js";
import { TestId } from "../../contrib/testing/common/testId.js";
import { denamespaceTestTag, namespaceTestTag } from "../../contrib/testing/common/testTypes.js";
import { ACTIVE_GROUP, SIDE_GROUP } from "../../services/editor/common/editorService.js";
import { checkProposedApiEnabled, isProposedApiEnabled } from "../../services/extensions/common/extensions.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
import { getPrivateApiFor } from "./extHostTestingPrivateApi.js";
import * as types from "./extHostTypes.js";
import { LanguageModelTextPart } from "./extHostTypes.js";
import { ChatAgentLocation } from "../../contrib/chat/common/constants.js";
import { AiSettingsSearchResultKind } from "../../services/aiSettingsSearch/common/aiSettingsSearch.js";
import { McpServerLaunch } from "../../contrib/mcp/common/mcpTypes.js";
var Selection;
(function(Selection2) {
  function to(selection) {
    const { selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn } = selection;
    const start = new types.Position(selectionStartLineNumber - 1, selectionStartColumn - 1);
    const end = new types.Position(positionLineNumber - 1, positionColumn - 1);
    return new types.Selection(start, end);
  }
  __name(to, "to");
  Selection2.to = to;
  function from(selection) {
    const { anchor, active } = selection;
    return {
      selectionStartLineNumber: anchor.line + 1,
      selectionStartColumn: anchor.character + 1,
      positionLineNumber: active.line + 1,
      positionColumn: active.character + 1
    };
  }
  __name(from, "from");
  Selection2.from = from;
})(Selection || (Selection = {}));
var Range;
(function(Range2) {
  function from(range) {
    if (!range) {
      return void 0;
    }
    const { start, end } = range;
    return {
      startLineNumber: start.line + 1,
      startColumn: start.character + 1,
      endLineNumber: end.line + 1,
      endColumn: end.character + 1
    };
  }
  __name(from, "from");
  Range2.from = from;
  function to(range) {
    if (!range) {
      return void 0;
    }
    const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
    return new types.Range(startLineNumber - 1, startColumn - 1, endLineNumber - 1, endColumn - 1);
  }
  __name(to, "to");
  Range2.to = to;
})(Range || (Range = {}));
var Location;
(function(Location2) {
  function from(location2) {
    return {
      uri: location2.uri,
      range: Range.from(location2.range)
    };
  }
  __name(from, "from");
  Location2.from = from;
  function to(location2) {
    return new types.Location(URI.revive(location2.uri), Range.to(location2.range));
  }
  __name(to, "to");
  Location2.to = to;
})(Location || (Location = {}));
var TokenType;
(function(TokenType2) {
  function to(type) {
    switch (type) {
      case 1:
        return types.StandardTokenType.Comment;
      case 0:
        return types.StandardTokenType.Other;
      case 3:
        return types.StandardTokenType.RegEx;
      case 2:
        return types.StandardTokenType.String;
    }
  }
  __name(to, "to");
  TokenType2.to = to;
})(TokenType || (TokenType = {}));
var Position;
(function(Position2) {
  function to(position) {
    return new types.Position(position.lineNumber - 1, position.column - 1);
  }
  __name(to, "to");
  Position2.to = to;
  function from(position) {
    return { lineNumber: position.line + 1, column: position.character + 1 };
  }
  __name(from, "from");
  Position2.from = from;
})(Position || (Position = {}));
var DocumentSelector;
(function(DocumentSelector2) {
  function from(value, uriTransformer, extension) {
    return coalesce(asArray(value).map((sel) => _doTransformDocumentSelector(sel, uriTransformer, extension)));
  }
  __name(from, "from");
  DocumentSelector2.from = from;
  function _doTransformDocumentSelector(selector, uriTransformer, extension) {
    if (typeof selector === "string") {
      return {
        $serialized: true,
        language: selector,
        isBuiltin: extension?.isBuiltin
      };
    }
    if (selector) {
      return {
        $serialized: true,
        language: selector.language,
        scheme: _transformScheme(selector.scheme, uriTransformer),
        pattern: GlobPattern.from(selector.pattern) ?? void 0,
        exclusive: selector.exclusive,
        notebookType: selector.notebookType,
        isBuiltin: extension?.isBuiltin
      };
    }
    return void 0;
  }
  __name(_doTransformDocumentSelector, "_doTransformDocumentSelector");
  function _transformScheme(scheme, uriTransformer) {
    if (uriTransformer && typeof scheme === "string") {
      return uriTransformer.transformOutgoingScheme(scheme);
    }
    return scheme;
  }
  __name(_transformScheme, "_transformScheme");
})(DocumentSelector || (DocumentSelector = {}));
var DiagnosticTag;
(function(DiagnosticTag2) {
  function from(value) {
    switch (value) {
      case types.DiagnosticTag.Unnecessary:
        return 1;
      case types.DiagnosticTag.Deprecated:
        return 2;
    }
    return void 0;
  }
  __name(from, "from");
  DiagnosticTag2.from = from;
  function to(value) {
    switch (value) {
      case 1:
        return types.DiagnosticTag.Unnecessary;
      case 2:
        return types.DiagnosticTag.Deprecated;
      default:
        return void 0;
    }
  }
  __name(to, "to");
  DiagnosticTag2.to = to;
})(DiagnosticTag || (DiagnosticTag = {}));
var Diagnostic;
(function(Diagnostic2) {
  function from(value) {
    let code;
    if (value.code) {
      if (isString(value.code) || isNumber(value.code)) {
        code = String(value.code);
      } else {
        code = {
          value: String(value.code.value),
          target: value.code.target
        };
      }
    }
    return {
      ...Range.from(value.range),
      message: value.message,
      source: value.source,
      code,
      severity: DiagnosticSeverity.from(value.severity),
      relatedInformation: value.relatedInformation && value.relatedInformation.map(DiagnosticRelatedInformation.from),
      tags: Array.isArray(value.tags) ? coalesce(value.tags.map(DiagnosticTag.from)) : void 0
    };
  }
  __name(from, "from");
  Diagnostic2.from = from;
  function to(value) {
    const res = new types.Diagnostic(Range.to(value), value.message, DiagnosticSeverity.to(value.severity));
    res.source = value.source;
    res.code = isString(value.code) ? value.code : value.code?.value;
    res.relatedInformation = value.relatedInformation && value.relatedInformation.map(DiagnosticRelatedInformation.to);
    res.tags = value.tags && coalesce(value.tags.map(DiagnosticTag.to));
    return res;
  }
  __name(to, "to");
  Diagnostic2.to = to;
})(Diagnostic || (Diagnostic = {}));
var DiagnosticRelatedInformation;
(function(DiagnosticRelatedInformation2) {
  function from(value) {
    return {
      ...Range.from(value.location.range),
      message: value.message,
      resource: value.location.uri
    };
  }
  __name(from, "from");
  DiagnosticRelatedInformation2.from = from;
  function to(value) {
    return new types.DiagnosticRelatedInformation(new types.Location(value.resource, Range.to(value)), value.message);
  }
  __name(to, "to");
  DiagnosticRelatedInformation2.to = to;
})(DiagnosticRelatedInformation || (DiagnosticRelatedInformation = {}));
var DiagnosticSeverity;
(function(DiagnosticSeverity2) {
  function from(value) {
    switch (value) {
      case types.DiagnosticSeverity.Error:
        return MarkerSeverity.Error;
      case types.DiagnosticSeverity.Warning:
        return MarkerSeverity.Warning;
      case types.DiagnosticSeverity.Information:
        return MarkerSeverity.Info;
      case types.DiagnosticSeverity.Hint:
        return MarkerSeverity.Hint;
    }
    return MarkerSeverity.Error;
  }
  __name(from, "from");
  DiagnosticSeverity2.from = from;
  function to(value) {
    switch (value) {
      case MarkerSeverity.Info:
        return types.DiagnosticSeverity.Information;
      case MarkerSeverity.Warning:
        return types.DiagnosticSeverity.Warning;
      case MarkerSeverity.Error:
        return types.DiagnosticSeverity.Error;
      case MarkerSeverity.Hint:
        return types.DiagnosticSeverity.Hint;
      default:
        return types.DiagnosticSeverity.Error;
    }
  }
  __name(to, "to");
  DiagnosticSeverity2.to = to;
})(DiagnosticSeverity || (DiagnosticSeverity = {}));
var ViewColumn;
(function(ViewColumn2) {
  function from(column) {
    if (typeof column === "number" && column >= types.ViewColumn.One) {
      return column - 1;
    }
    if (column === types.ViewColumn.Beside) {
      return SIDE_GROUP;
    }
    return ACTIVE_GROUP;
  }
  __name(from, "from");
  ViewColumn2.from = from;
  function to(position) {
    if (typeof position === "number" && position >= 0) {
      return position + 1;
    }
    throw new Error(`invalid 'EditorGroupColumn'`);
  }
  __name(to, "to");
  ViewColumn2.to = to;
})(ViewColumn || (ViewColumn = {}));
function isDecorationOptions(something) {
  return typeof something.range !== "undefined";
}
__name(isDecorationOptions, "isDecorationOptions");
function isDecorationOptionsArr(something) {
  if (something.length === 0) {
    return true;
  }
  return isDecorationOptions(something[0]) ? true : false;
}
__name(isDecorationOptionsArr, "isDecorationOptionsArr");
var MarkdownString;
(function(MarkdownString2) {
  function fromMany(markup) {
    return markup.map(MarkdownString2.from);
  }
  __name(fromMany, "fromMany");
  MarkdownString2.fromMany = fromMany;
  function isCodeblock(thing) {
    return thing && typeof thing === "object" && typeof thing.language === "string" && typeof thing.value === "string";
  }
  __name(isCodeblock, "isCodeblock");
  function from(markup) {
    let res;
    if (isCodeblock(markup)) {
      const { language, value } = markup;
      res = { value: "```" + language + "\n" + value + "\n```\n" };
    } else if (types.MarkdownString.isMarkdownString(markup)) {
      res = { value: markup.value, isTrusted: markup.isTrusted, supportThemeIcons: markup.supportThemeIcons, supportHtml: markup.supportHtml, baseUri: markup.baseUri };
    } else if (typeof markup === "string") {
      res = { value: markup };
    } else {
      res = { value: "" };
    }
    const resUris = /* @__PURE__ */ Object.create(null);
    res.uris = resUris;
    const collectUri = /* @__PURE__ */ __name(({ href }) => {
      try {
        let uri = URI.parse(href, true);
        uri = uri.with({ query: _uriMassage(uri.query, resUris) });
        resUris[href] = uri;
      } catch (e) {
      }
      return "";
    }, "collectUri");
    marked.marked.walkTokens(marked.marked.lexer(res.value), (token) => {
      if (token.type === "link") {
        collectUri({ href: token.href });
      } else if (token.type === "image") {
        if (typeof token.href === "string") {
          collectUri(htmlContent.parseHrefAndDimensions(token.href));
        }
      }
    });
    return res;
  }
  __name(from, "from");
  MarkdownString2.from = from;
  function _uriMassage(part, bucket) {
    if (!part) {
      return part;
    }
    let data;
    try {
      data = parse(part);
    } catch (e) {
    }
    if (!data) {
      return part;
    }
    let changed = false;
    data = cloneAndChange(data, (value) => {
      if (URI.isUri(value)) {
        const key = `__uri_${Math.random().toString(16).slice(2, 8)}`;
        bucket[key] = value;
        changed = true;
        return key;
      } else {
        return void 0;
      }
    });
    if (!changed) {
      return part;
    }
    return JSON.stringify(data);
  }
  __name(_uriMassage, "_uriMassage");
  function to(value) {
    const result = new types.MarkdownString(value.value, value.supportThemeIcons);
    result.isTrusted = value.isTrusted;
    result.supportHtml = value.supportHtml;
    result.baseUri = value.baseUri ? URI.from(value.baseUri) : void 0;
    return result;
  }
  __name(to, "to");
  MarkdownString2.to = to;
  function fromStrict(value) {
    if (!value) {
      return void 0;
    }
    return typeof value === "string" ? value : MarkdownString2.from(value);
  }
  __name(fromStrict, "fromStrict");
  MarkdownString2.fromStrict = fromStrict;
})(MarkdownString || (MarkdownString = {}));
function fromRangeOrRangeWithMessage(ranges) {
  if (isDecorationOptionsArr(ranges)) {
    return ranges.map((r) => {
      return {
        range: Range.from(r.range),
        hoverMessage: Array.isArray(r.hoverMessage) ? MarkdownString.fromMany(r.hoverMessage) : r.hoverMessage ? MarkdownString.from(r.hoverMessage) : void 0,
        renderOptions: (
          /* URI vs Uri */
          r.renderOptions
        )
      };
    });
  } else {
    return ranges.map((r) => {
      return {
        range: Range.from(r)
      };
    });
  }
}
__name(fromRangeOrRangeWithMessage, "fromRangeOrRangeWithMessage");
function pathOrURIToURI(value) {
  if (typeof value === "undefined") {
    return value;
  }
  if (typeof value === "string") {
    return URI.file(value);
  } else {
    return value;
  }
}
__name(pathOrURIToURI, "pathOrURIToURI");
var ThemableDecorationAttachmentRenderOptions;
(function(ThemableDecorationAttachmentRenderOptions2) {
  function from(options) {
    if (typeof options === "undefined") {
      return options;
    }
    return {
      contentText: options.contentText,
      contentIconPath: options.contentIconPath ? pathOrURIToURI(options.contentIconPath) : void 0,
      border: options.border,
      borderColor: options.borderColor,
      fontStyle: options.fontStyle,
      fontWeight: options.fontWeight,
      textDecoration: options.textDecoration,
      color: options.color,
      backgroundColor: options.backgroundColor,
      margin: options.margin,
      width: options.width,
      height: options.height
    };
  }
  __name(from, "from");
  ThemableDecorationAttachmentRenderOptions2.from = from;
})(ThemableDecorationAttachmentRenderOptions || (ThemableDecorationAttachmentRenderOptions = {}));
var ThemableDecorationRenderOptions;
(function(ThemableDecorationRenderOptions2) {
  function from(options) {
    if (typeof options === "undefined") {
      return options;
    }
    return {
      backgroundColor: options.backgroundColor,
      outline: options.outline,
      outlineColor: options.outlineColor,
      outlineStyle: options.outlineStyle,
      outlineWidth: options.outlineWidth,
      border: options.border,
      borderColor: options.borderColor,
      borderRadius: options.borderRadius,
      borderSpacing: options.borderSpacing,
      borderStyle: options.borderStyle,
      borderWidth: options.borderWidth,
      fontStyle: options.fontStyle,
      fontWeight: options.fontWeight,
      textDecoration: options.textDecoration,
      cursor: options.cursor,
      color: options.color,
      opacity: options.opacity,
      letterSpacing: options.letterSpacing,
      gutterIconPath: options.gutterIconPath ? pathOrURIToURI(options.gutterIconPath) : void 0,
      gutterIconSize: options.gutterIconSize,
      overviewRulerColor: options.overviewRulerColor,
      before: options.before ? ThemableDecorationAttachmentRenderOptions.from(options.before) : void 0,
      after: options.after ? ThemableDecorationAttachmentRenderOptions.from(options.after) : void 0
    };
  }
  __name(from, "from");
  ThemableDecorationRenderOptions2.from = from;
})(ThemableDecorationRenderOptions || (ThemableDecorationRenderOptions = {}));
var DecorationRangeBehavior;
(function(DecorationRangeBehavior2) {
  function from(value) {
    if (typeof value === "undefined") {
      return value;
    }
    switch (value) {
      case types.DecorationRangeBehavior.OpenOpen:
        return 0;
      case types.DecorationRangeBehavior.ClosedClosed:
        return 1;
      case types.DecorationRangeBehavior.OpenClosed:
        return 2;
      case types.DecorationRangeBehavior.ClosedOpen:
        return 3;
    }
  }
  __name(from, "from");
  DecorationRangeBehavior2.from = from;
})(DecorationRangeBehavior || (DecorationRangeBehavior = {}));
var DecorationRenderOptions;
(function(DecorationRenderOptions2) {
  function from(options) {
    return {
      isWholeLine: options.isWholeLine,
      rangeBehavior: options.rangeBehavior ? DecorationRangeBehavior.from(options.rangeBehavior) : void 0,
      overviewRulerLane: options.overviewRulerLane,
      light: options.light ? ThemableDecorationRenderOptions.from(options.light) : void 0,
      dark: options.dark ? ThemableDecorationRenderOptions.from(options.dark) : void 0,
      backgroundColor: options.backgroundColor,
      outline: options.outline,
      outlineColor: options.outlineColor,
      outlineStyle: options.outlineStyle,
      outlineWidth: options.outlineWidth,
      border: options.border,
      borderColor: options.borderColor,
      borderRadius: options.borderRadius,
      borderSpacing: options.borderSpacing,
      borderStyle: options.borderStyle,
      borderWidth: options.borderWidth,
      fontStyle: options.fontStyle,
      fontWeight: options.fontWeight,
      textDecoration: options.textDecoration,
      cursor: options.cursor,
      color: options.color,
      opacity: options.opacity,
      letterSpacing: options.letterSpacing,
      gutterIconPath: options.gutterIconPath ? pathOrURIToURI(options.gutterIconPath) : void 0,
      gutterIconSize: options.gutterIconSize,
      overviewRulerColor: options.overviewRulerColor,
      before: options.before ? ThemableDecorationAttachmentRenderOptions.from(options.before) : void 0,
      after: options.after ? ThemableDecorationAttachmentRenderOptions.from(options.after) : void 0
    };
  }
  __name(from, "from");
  DecorationRenderOptions2.from = from;
})(DecorationRenderOptions || (DecorationRenderOptions = {}));
var TextEdit;
(function(TextEdit2) {
  function from(edit) {
    return {
      text: edit.newText,
      eol: edit.newEol && EndOfLine.from(edit.newEol),
      range: Range.from(edit.range)
    };
  }
  __name(from, "from");
  TextEdit2.from = from;
  function to(edit) {
    const result = new types.TextEdit(Range.to(edit.range), edit.text);
    result.newEol = typeof edit.eol === "undefined" ? void 0 : EndOfLine.to(edit.eol);
    return result;
  }
  __name(to, "to");
  TextEdit2.to = to;
})(TextEdit || (TextEdit = {}));
var WorkspaceEdit;
(function(WorkspaceEdit2) {
  function from(value, versionInfo) {
    const result = {
      edits: []
    };
    if (value instanceof types.WorkspaceEdit) {
      const toCreate = new ResourceSet();
      for (const entry of value._allEntries()) {
        if (entry._type === 1 && URI.isUri(entry.to) && entry.from === void 0) {
          toCreate.add(entry.to);
        }
      }
      for (const entry of value._allEntries()) {
        if (entry._type === 1) {
          let contents;
          if (entry.options?.contents) {
            if (ArrayBuffer.isView(entry.options.contents)) {
              contents = { type: "base64", value: encodeBase64(VSBuffer.wrap(entry.options.contents)) };
            } else {
              contents = { type: "dataTransferItem", id: entry.options.contents._itemId };
            }
          }
          result.edits.push({
            oldResource: entry.from,
            newResource: entry.to,
            options: { ...entry.options, contents },
            metadata: entry.metadata
          });
        } else if (entry._type === 2) {
          result.edits.push({
            resource: entry.uri,
            textEdit: TextEdit.from(entry.edit),
            versionId: !toCreate.has(entry.uri) ? versionInfo?.getTextDocumentVersion(entry.uri) : void 0,
            metadata: entry.metadata
          });
        } else if (entry._type === 6) {
          result.edits.push({
            resource: entry.uri,
            textEdit: {
              range: Range.from(entry.range),
              text: entry.edit.value,
              insertAsSnippet: true,
              keepWhitespace: entry.keepWhitespace
            },
            versionId: !toCreate.has(entry.uri) ? versionInfo?.getTextDocumentVersion(entry.uri) : void 0,
            metadata: entry.metadata
          });
        } else if (entry._type === 3) {
          result.edits.push({
            metadata: entry.metadata,
            resource: entry.uri,
            cellEdit: entry.edit,
            notebookVersionId: versionInfo?.getNotebookDocumentVersion(entry.uri)
          });
        } else if (entry._type === 5) {
          result.edits.push({
            metadata: entry.metadata,
            resource: entry.uri,
            notebookVersionId: versionInfo?.getNotebookDocumentVersion(entry.uri),
            cellEdit: {
              editType: 1,
              index: entry.index,
              count: entry.count,
              cells: entry.cells.map(NotebookCellData.from)
            }
          });
        }
      }
    }
    return result;
  }
  __name(from, "from");
  WorkspaceEdit2.from = from;
  function to(value) {
    const result = new types.WorkspaceEdit();
    const edits = new ResourceMap();
    for (const edit of value.edits) {
      if (edit.textEdit) {
        const item = edit;
        const uri = URI.revive(item.resource);
        const range = Range.to(item.textEdit.range);
        const text = item.textEdit.text;
        const isSnippet = item.textEdit.insertAsSnippet;
        let editOrSnippetTest;
        if (isSnippet) {
          editOrSnippetTest = types.SnippetTextEdit.replace(range, new types.SnippetString(text));
        } else {
          editOrSnippetTest = types.TextEdit.replace(range, text);
        }
        const array = edits.get(uri);
        if (!array) {
          edits.set(uri, [editOrSnippetTest]);
        } else {
          array.push(editOrSnippetTest);
        }
      } else {
        result.renameFile(URI.revive(edit.oldResource), URI.revive(edit.newResource), edit.options);
      }
    }
    for (const [uri, array] of edits) {
      result.set(uri, array);
    }
    return result;
  }
  __name(to, "to");
  WorkspaceEdit2.to = to;
})(WorkspaceEdit || (WorkspaceEdit = {}));
var SymbolKind;
(function(SymbolKind2) {
  const _fromMapping = /* @__PURE__ */ Object.create(null);
  _fromMapping[types.SymbolKind.File] = 0;
  _fromMapping[types.SymbolKind.Module] = 1;
  _fromMapping[types.SymbolKind.Namespace] = 2;
  _fromMapping[types.SymbolKind.Package] = 3;
  _fromMapping[types.SymbolKind.Class] = 4;
  _fromMapping[types.SymbolKind.Method] = 5;
  _fromMapping[types.SymbolKind.Property] = 6;
  _fromMapping[types.SymbolKind.Field] = 7;
  _fromMapping[types.SymbolKind.Constructor] = 8;
  _fromMapping[types.SymbolKind.Enum] = 9;
  _fromMapping[types.SymbolKind.Interface] = 10;
  _fromMapping[types.SymbolKind.Function] = 11;
  _fromMapping[types.SymbolKind.Variable] = 12;
  _fromMapping[types.SymbolKind.Constant] = 13;
  _fromMapping[types.SymbolKind.String] = 14;
  _fromMapping[types.SymbolKind.Number] = 15;
  _fromMapping[types.SymbolKind.Boolean] = 16;
  _fromMapping[types.SymbolKind.Array] = 17;
  _fromMapping[types.SymbolKind.Object] = 18;
  _fromMapping[types.SymbolKind.Key] = 19;
  _fromMapping[types.SymbolKind.Null] = 20;
  _fromMapping[types.SymbolKind.EnumMember] = 21;
  _fromMapping[types.SymbolKind.Struct] = 22;
  _fromMapping[types.SymbolKind.Event] = 23;
  _fromMapping[types.SymbolKind.Operator] = 24;
  _fromMapping[types.SymbolKind.TypeParameter] = 25;
  function from(kind) {
    return typeof _fromMapping[kind] === "number" ? _fromMapping[kind] : 6;
  }
  __name(from, "from");
  SymbolKind2.from = from;
  function to(kind) {
    for (const k in _fromMapping) {
      if (_fromMapping[k] === kind) {
        return Number(k);
      }
    }
    return types.SymbolKind.Property;
  }
  __name(to, "to");
  SymbolKind2.to = to;
})(SymbolKind || (SymbolKind = {}));
var SymbolTag;
(function(SymbolTag2) {
  function from(kind) {
    switch (kind) {
      case types.SymbolTag.Deprecated:
        return 1;
    }
  }
  __name(from, "from");
  SymbolTag2.from = from;
  function to(kind) {
    switch (kind) {
      case 1:
        return types.SymbolTag.Deprecated;
    }
  }
  __name(to, "to");
  SymbolTag2.to = to;
})(SymbolTag || (SymbolTag = {}));
var WorkspaceSymbol;
(function(WorkspaceSymbol2) {
  function from(info) {
    return {
      name: info.name,
      kind: SymbolKind.from(info.kind),
      tags: info.tags && info.tags.map(SymbolTag.from),
      containerName: info.containerName,
      location: location.from(info.location)
    };
  }
  __name(from, "from");
  WorkspaceSymbol2.from = from;
  function to(info) {
    const result = new types.SymbolInformation(info.name, SymbolKind.to(info.kind), info.containerName, location.to(info.location));
    result.tags = info.tags && info.tags.map(SymbolTag.to);
    return result;
  }
  __name(to, "to");
  WorkspaceSymbol2.to = to;
})(WorkspaceSymbol || (WorkspaceSymbol = {}));
var DocumentSymbol;
(function(DocumentSymbol2) {
  function from(info) {
    const result = {
      name: info.name || "!!MISSING: name!!",
      detail: info.detail,
      range: Range.from(info.range),
      selectionRange: Range.from(info.selectionRange),
      kind: SymbolKind.from(info.kind),
      tags: info.tags?.map(SymbolTag.from) ?? []
    };
    if (info.children) {
      result.children = info.children.map(from);
    }
    return result;
  }
  __name(from, "from");
  DocumentSymbol2.from = from;
  function to(info) {
    const result = new types.DocumentSymbol(info.name, info.detail, SymbolKind.to(info.kind), Range.to(info.range), Range.to(info.selectionRange));
    if (isNonEmptyArray(info.tags)) {
      result.tags = info.tags.map(SymbolTag.to);
    }
    if (info.children) {
      result.children = info.children.map(to);
    }
    return result;
  }
  __name(to, "to");
  DocumentSymbol2.to = to;
})(DocumentSymbol || (DocumentSymbol = {}));
var CallHierarchyItem;
(function(CallHierarchyItem2) {
  function to(item) {
    const result = new types.CallHierarchyItem(SymbolKind.to(item.kind), item.name, item.detail || "", URI.revive(item.uri), Range.to(item.range), Range.to(item.selectionRange));
    result._sessionId = item._sessionId;
    result._itemId = item._itemId;
    return result;
  }
  __name(to, "to");
  CallHierarchyItem2.to = to;
  function from(item, sessionId, itemId) {
    sessionId = sessionId ?? item._sessionId;
    itemId = itemId ?? item._itemId;
    if (sessionId === void 0 || itemId === void 0) {
      throw new Error("invalid item");
    }
    return {
      _sessionId: sessionId,
      _itemId: itemId,
      name: item.name,
      detail: item.detail,
      kind: SymbolKind.from(item.kind),
      uri: item.uri,
      range: Range.from(item.range),
      selectionRange: Range.from(item.selectionRange),
      tags: item.tags?.map(SymbolTag.from)
    };
  }
  __name(from, "from");
  CallHierarchyItem2.from = from;
})(CallHierarchyItem || (CallHierarchyItem = {}));
var CallHierarchyIncomingCall;
(function(CallHierarchyIncomingCall2) {
  function to(item) {
    return new types.CallHierarchyIncomingCall(CallHierarchyItem.to(item.from), item.fromRanges.map((r) => Range.to(r)));
  }
  __name(to, "to");
  CallHierarchyIncomingCall2.to = to;
})(CallHierarchyIncomingCall || (CallHierarchyIncomingCall = {}));
var CallHierarchyOutgoingCall;
(function(CallHierarchyOutgoingCall2) {
  function to(item) {
    return new types.CallHierarchyOutgoingCall(CallHierarchyItem.to(item.to), item.fromRanges.map((r) => Range.to(r)));
  }
  __name(to, "to");
  CallHierarchyOutgoingCall2.to = to;
})(CallHierarchyOutgoingCall || (CallHierarchyOutgoingCall = {}));
var location;
(function(location2) {
  function from(value) {
    return {
      range: value.range && Range.from(value.range),
      uri: value.uri
    };
  }
  __name(from, "from");
  location2.from = from;
  function to(value) {
    return new types.Location(URI.revive(value.uri), Range.to(value.range));
  }
  __name(to, "to");
  location2.to = to;
})(location || (location = {}));
var DefinitionLink;
(function(DefinitionLink2) {
  function from(value) {
    const definitionLink = value;
    const location2 = value;
    return {
      originSelectionRange: definitionLink.originSelectionRange ? Range.from(definitionLink.originSelectionRange) : void 0,
      uri: definitionLink.targetUri ? definitionLink.targetUri : location2.uri,
      range: Range.from(definitionLink.targetRange ? definitionLink.targetRange : location2.range),
      targetSelectionRange: definitionLink.targetSelectionRange ? Range.from(definitionLink.targetSelectionRange) : void 0
    };
  }
  __name(from, "from");
  DefinitionLink2.from = from;
  function to(value) {
    return {
      targetUri: URI.revive(value.uri),
      targetRange: Range.to(value.range),
      targetSelectionRange: value.targetSelectionRange ? Range.to(value.targetSelectionRange) : void 0,
      originSelectionRange: value.originSelectionRange ? Range.to(value.originSelectionRange) : void 0
    };
  }
  __name(to, "to");
  DefinitionLink2.to = to;
})(DefinitionLink || (DefinitionLink = {}));
var Hover;
(function(Hover2) {
  function from(hover) {
    const convertedHover = {
      range: Range.from(hover.range),
      contents: MarkdownString.fromMany(hover.contents),
      canIncreaseVerbosity: hover.canIncreaseVerbosity,
      canDecreaseVerbosity: hover.canDecreaseVerbosity
    };
    return convertedHover;
  }
  __name(from, "from");
  Hover2.from = from;
  function to(info) {
    const contents = info.contents.map(MarkdownString.to);
    const range = Range.to(info.range);
    const canIncreaseVerbosity = info.canIncreaseVerbosity;
    const canDecreaseVerbosity = info.canDecreaseVerbosity;
    return new types.VerboseHover(contents, range, canIncreaseVerbosity, canDecreaseVerbosity);
  }
  __name(to, "to");
  Hover2.to = to;
})(Hover || (Hover = {}));
var EvaluatableExpression;
(function(EvaluatableExpression2) {
  function from(expression) {
    return {
      range: Range.from(expression.range),
      expression: expression.expression
    };
  }
  __name(from, "from");
  EvaluatableExpression2.from = from;
  function to(info) {
    return new types.EvaluatableExpression(Range.to(info.range), info.expression);
  }
  __name(to, "to");
  EvaluatableExpression2.to = to;
})(EvaluatableExpression || (EvaluatableExpression = {}));
var InlineValue;
(function(InlineValue2) {
  function from(inlineValue) {
    if (inlineValue instanceof types.InlineValueText) {
      return {
        type: "text",
        range: Range.from(inlineValue.range),
        text: inlineValue.text
      };
    } else if (inlineValue instanceof types.InlineValueVariableLookup) {
      return {
        type: "variable",
        range: Range.from(inlineValue.range),
        variableName: inlineValue.variableName,
        caseSensitiveLookup: inlineValue.caseSensitiveLookup
      };
    } else if (inlineValue instanceof types.InlineValueEvaluatableExpression) {
      return {
        type: "expression",
        range: Range.from(inlineValue.range),
        expression: inlineValue.expression
      };
    } else {
      throw new Error(`Unknown 'InlineValue' type`);
    }
  }
  __name(from, "from");
  InlineValue2.from = from;
  function to(inlineValue) {
    switch (inlineValue.type) {
      case "text":
        return {
          range: Range.to(inlineValue.range),
          text: inlineValue.text
        };
      case "variable":
        return {
          range: Range.to(inlineValue.range),
          variableName: inlineValue.variableName,
          caseSensitiveLookup: inlineValue.caseSensitiveLookup
        };
      case "expression":
        return {
          range: Range.to(inlineValue.range),
          expression: inlineValue.expression
        };
    }
  }
  __name(to, "to");
  InlineValue2.to = to;
})(InlineValue || (InlineValue = {}));
var InlineValueContext;
(function(InlineValueContext2) {
  function from(inlineValueContext) {
    return {
      frameId: inlineValueContext.frameId,
      stoppedLocation: Range.from(inlineValueContext.stoppedLocation)
    };
  }
  __name(from, "from");
  InlineValueContext2.from = from;
  function to(inlineValueContext) {
    return new types.InlineValueContext(inlineValueContext.frameId, Range.to(inlineValueContext.stoppedLocation));
  }
  __name(to, "to");
  InlineValueContext2.to = to;
})(InlineValueContext || (InlineValueContext = {}));
var DocumentHighlight;
(function(DocumentHighlight2) {
  function from(documentHighlight) {
    return {
      range: Range.from(documentHighlight.range),
      kind: documentHighlight.kind
    };
  }
  __name(from, "from");
  DocumentHighlight2.from = from;
  function to(occurrence) {
    return new types.DocumentHighlight(Range.to(occurrence.range), occurrence.kind);
  }
  __name(to, "to");
  DocumentHighlight2.to = to;
})(DocumentHighlight || (DocumentHighlight = {}));
var MultiDocumentHighlight;
(function(MultiDocumentHighlight2) {
  function from(multiDocumentHighlight) {
    return {
      uri: multiDocumentHighlight.uri,
      highlights: multiDocumentHighlight.highlights.map(DocumentHighlight.from)
    };
  }
  __name(from, "from");
  MultiDocumentHighlight2.from = from;
  function to(multiDocumentHighlight) {
    return new types.MultiDocumentHighlight(URI.revive(multiDocumentHighlight.uri), multiDocumentHighlight.highlights.map(DocumentHighlight.to));
  }
  __name(to, "to");
  MultiDocumentHighlight2.to = to;
})(MultiDocumentHighlight || (MultiDocumentHighlight = {}));
var CompletionTriggerKind;
(function(CompletionTriggerKind2) {
  function to(kind) {
    switch (kind) {
      case 1:
        return types.CompletionTriggerKind.TriggerCharacter;
      case 2:
        return types.CompletionTriggerKind.TriggerForIncompleteCompletions;
      case 0:
      default:
        return types.CompletionTriggerKind.Invoke;
    }
  }
  __name(to, "to");
  CompletionTriggerKind2.to = to;
})(CompletionTriggerKind || (CompletionTriggerKind = {}));
var CompletionContext;
(function(CompletionContext2) {
  function to(context) {
    return {
      triggerKind: CompletionTriggerKind.to(context.triggerKind),
      triggerCharacter: context.triggerCharacter
    };
  }
  __name(to, "to");
  CompletionContext2.to = to;
})(CompletionContext || (CompletionContext = {}));
var CompletionItemTag;
(function(CompletionItemTag2) {
  function from(kind) {
    switch (kind) {
      case types.CompletionItemTag.Deprecated:
        return 1;
    }
  }
  __name(from, "from");
  CompletionItemTag2.from = from;
  function to(kind) {
    switch (kind) {
      case 1:
        return types.CompletionItemTag.Deprecated;
    }
  }
  __name(to, "to");
  CompletionItemTag2.to = to;
})(CompletionItemTag || (CompletionItemTag = {}));
var CompletionCommand;
(function(CompletionCommand2) {
  function from(c, converter, disposables) {
    if ("icon" in c && "command" in c) {
      return {
        command: converter.toInternal(c.command, disposables),
        icon: IconPath.fromThemeIcon(c.icon)
      };
    }
    return { command: converter.toInternal(c, disposables) };
  }
  __name(from, "from");
  CompletionCommand2.from = from;
})(CompletionCommand || (CompletionCommand = {}));
var CompletionItemKind;
(function(CompletionItemKind2) {
  const _from = /* @__PURE__ */ new Map([
    [
      types.CompletionItemKind.Method,
      0
      /* languages.CompletionItemKind.Method */
    ],
    [
      types.CompletionItemKind.Function,
      1
      /* languages.CompletionItemKind.Function */
    ],
    [
      types.CompletionItemKind.Constructor,
      2
      /* languages.CompletionItemKind.Constructor */
    ],
    [
      types.CompletionItemKind.Field,
      3
      /* languages.CompletionItemKind.Field */
    ],
    [
      types.CompletionItemKind.Variable,
      4
      /* languages.CompletionItemKind.Variable */
    ],
    [
      types.CompletionItemKind.Class,
      5
      /* languages.CompletionItemKind.Class */
    ],
    [
      types.CompletionItemKind.Interface,
      7
      /* languages.CompletionItemKind.Interface */
    ],
    [
      types.CompletionItemKind.Struct,
      6
      /* languages.CompletionItemKind.Struct */
    ],
    [
      types.CompletionItemKind.Module,
      8
      /* languages.CompletionItemKind.Module */
    ],
    [
      types.CompletionItemKind.Property,
      9
      /* languages.CompletionItemKind.Property */
    ],
    [
      types.CompletionItemKind.Unit,
      12
      /* languages.CompletionItemKind.Unit */
    ],
    [
      types.CompletionItemKind.Value,
      13
      /* languages.CompletionItemKind.Value */
    ],
    [
      types.CompletionItemKind.Constant,
      14
      /* languages.CompletionItemKind.Constant */
    ],
    [
      types.CompletionItemKind.Enum,
      15
      /* languages.CompletionItemKind.Enum */
    ],
    [
      types.CompletionItemKind.EnumMember,
      16
      /* languages.CompletionItemKind.EnumMember */
    ],
    [
      types.CompletionItemKind.Keyword,
      17
      /* languages.CompletionItemKind.Keyword */
    ],
    [
      types.CompletionItemKind.Snippet,
      28
      /* languages.CompletionItemKind.Snippet */
    ],
    [
      types.CompletionItemKind.Text,
      18
      /* languages.CompletionItemKind.Text */
    ],
    [
      types.CompletionItemKind.Color,
      19
      /* languages.CompletionItemKind.Color */
    ],
    [
      types.CompletionItemKind.File,
      20
      /* languages.CompletionItemKind.File */
    ],
    [
      types.CompletionItemKind.Reference,
      21
      /* languages.CompletionItemKind.Reference */
    ],
    [
      types.CompletionItemKind.Folder,
      23
      /* languages.CompletionItemKind.Folder */
    ],
    [
      types.CompletionItemKind.Event,
      10
      /* languages.CompletionItemKind.Event */
    ],
    [
      types.CompletionItemKind.Operator,
      11
      /* languages.CompletionItemKind.Operator */
    ],
    [
      types.CompletionItemKind.TypeParameter,
      24
      /* languages.CompletionItemKind.TypeParameter */
    ],
    [
      types.CompletionItemKind.Issue,
      26
      /* languages.CompletionItemKind.Issue */
    ],
    [
      types.CompletionItemKind.User,
      25
      /* languages.CompletionItemKind.User */
    ]
  ]);
  function from(kind) {
    return _from.get(kind) ?? 9;
  }
  __name(from, "from");
  CompletionItemKind2.from = from;
  const _to = /* @__PURE__ */ new Map([
    [0, types.CompletionItemKind.Method],
    [1, types.CompletionItemKind.Function],
    [2, types.CompletionItemKind.Constructor],
    [3, types.CompletionItemKind.Field],
    [4, types.CompletionItemKind.Variable],
    [5, types.CompletionItemKind.Class],
    [7, types.CompletionItemKind.Interface],
    [6, types.CompletionItemKind.Struct],
    [8, types.CompletionItemKind.Module],
    [9, types.CompletionItemKind.Property],
    [12, types.CompletionItemKind.Unit],
    [13, types.CompletionItemKind.Value],
    [14, types.CompletionItemKind.Constant],
    [15, types.CompletionItemKind.Enum],
    [16, types.CompletionItemKind.EnumMember],
    [17, types.CompletionItemKind.Keyword],
    [28, types.CompletionItemKind.Snippet],
    [18, types.CompletionItemKind.Text],
    [19, types.CompletionItemKind.Color],
    [20, types.CompletionItemKind.File],
    [21, types.CompletionItemKind.Reference],
    [23, types.CompletionItemKind.Folder],
    [10, types.CompletionItemKind.Event],
    [11, types.CompletionItemKind.Operator],
    [24, types.CompletionItemKind.TypeParameter],
    [25, types.CompletionItemKind.User],
    [26, types.CompletionItemKind.Issue]
  ]);
  function to(kind) {
    return _to.get(kind) ?? types.CompletionItemKind.Property;
  }
  __name(to, "to");
  CompletionItemKind2.to = to;
})(CompletionItemKind || (CompletionItemKind = {}));
var CompletionItem;
(function(CompletionItem2) {
  function to(suggestion, converter) {
    const result = new types.CompletionItem(suggestion.label);
    result.insertText = suggestion.insertText;
    result.kind = CompletionItemKind.to(suggestion.kind);
    result.tags = suggestion.tags?.map(CompletionItemTag.to);
    result.detail = suggestion.detail;
    result.documentation = htmlContent.isMarkdownString(suggestion.documentation) ? MarkdownString.to(suggestion.documentation) : suggestion.documentation;
    result.sortText = suggestion.sortText;
    result.filterText = suggestion.filterText;
    result.preselect = suggestion.preselect;
    result.commitCharacters = suggestion.commitCharacters;
    if (editorRange.Range.isIRange(suggestion.range)) {
      result.range = Range.to(suggestion.range);
    } else if (typeof suggestion.range === "object") {
      result.range = { inserting: Range.to(suggestion.range.insert), replacing: Range.to(suggestion.range.replace) };
    }
    result.keepWhitespace = typeof suggestion.insertTextRules === "undefined" ? false : Boolean(
      suggestion.insertTextRules & 1
      /* languages.CompletionItemInsertTextRule.KeepWhitespace */
    );
    if (typeof suggestion.insertTextRules !== "undefined" && suggestion.insertTextRules & 4) {
      result.insertText = new types.SnippetString(suggestion.insertText);
    } else {
      result.insertText = suggestion.insertText;
      result.textEdit = result.range instanceof types.Range ? new types.TextEdit(result.range, result.insertText) : void 0;
    }
    if (suggestion.additionalTextEdits && suggestion.additionalTextEdits.length > 0) {
      result.additionalTextEdits = suggestion.additionalTextEdits.map((e) => TextEdit.to(e));
    }
    result.command = converter && suggestion.command ? converter.fromInternal(suggestion.command) : void 0;
    return result;
  }
  __name(to, "to");
  CompletionItem2.to = to;
})(CompletionItem || (CompletionItem = {}));
var ParameterInformation;
(function(ParameterInformation2) {
  function from(info) {
    if (typeof info.label !== "string" && !Array.isArray(info.label)) {
      throw new TypeError("Invalid label");
    }
    return {
      label: info.label,
      documentation: MarkdownString.fromStrict(info.documentation)
    };
  }
  __name(from, "from");
  ParameterInformation2.from = from;
  function to(info) {
    return {
      label: info.label,
      documentation: htmlContent.isMarkdownString(info.documentation) ? MarkdownString.to(info.documentation) : info.documentation
    };
  }
  __name(to, "to");
  ParameterInformation2.to = to;
})(ParameterInformation || (ParameterInformation = {}));
var SignatureInformation;
(function(SignatureInformation2) {
  function from(info) {
    return {
      label: info.label,
      documentation: MarkdownString.fromStrict(info.documentation),
      parameters: Array.isArray(info.parameters) ? info.parameters.map(ParameterInformation.from) : [],
      activeParameter: info.activeParameter
    };
  }
  __name(from, "from");
  SignatureInformation2.from = from;
  function to(info) {
    return {
      label: info.label,
      documentation: htmlContent.isMarkdownString(info.documentation) ? MarkdownString.to(info.documentation) : info.documentation,
      parameters: Array.isArray(info.parameters) ? info.parameters.map(ParameterInformation.to) : [],
      activeParameter: info.activeParameter
    };
  }
  __name(to, "to");
  SignatureInformation2.to = to;
})(SignatureInformation || (SignatureInformation = {}));
var SignatureHelp;
(function(SignatureHelp2) {
  function from(help) {
    return {
      activeSignature: help.activeSignature,
      activeParameter: help.activeParameter,
      signatures: Array.isArray(help.signatures) ? help.signatures.map(SignatureInformation.from) : []
    };
  }
  __name(from, "from");
  SignatureHelp2.from = from;
  function to(help) {
    return {
      activeSignature: help.activeSignature,
      activeParameter: help.activeParameter,
      signatures: Array.isArray(help.signatures) ? help.signatures.map(SignatureInformation.to) : []
    };
  }
  __name(to, "to");
  SignatureHelp2.to = to;
})(SignatureHelp || (SignatureHelp = {}));
var InlayHint;
(function(InlayHint2) {
  function to(converter, hint) {
    const res = new types.InlayHint(Position.to(hint.position), typeof hint.label === "string" ? hint.label : hint.label.map(InlayHintLabelPart.to.bind(void 0, converter)), hint.kind && InlayHintKind.to(hint.kind));
    res.textEdits = hint.textEdits && hint.textEdits.map(TextEdit.to);
    res.tooltip = htmlContent.isMarkdownString(hint.tooltip) ? MarkdownString.to(hint.tooltip) : hint.tooltip;
    res.paddingLeft = hint.paddingLeft;
    res.paddingRight = hint.paddingRight;
    return res;
  }
  __name(to, "to");
  InlayHint2.to = to;
})(InlayHint || (InlayHint = {}));
var InlayHintLabelPart;
(function(InlayHintLabelPart2) {
  function to(converter, part) {
    const result = new types.InlayHintLabelPart(part.label);
    result.tooltip = htmlContent.isMarkdownString(part.tooltip) ? MarkdownString.to(part.tooltip) : part.tooltip;
    if (languages.Command.is(part.command)) {
      result.command = converter.fromInternal(part.command);
    }
    if (part.location) {
      result.location = location.to(part.location);
    }
    return result;
  }
  __name(to, "to");
  InlayHintLabelPart2.to = to;
})(InlayHintLabelPart || (InlayHintLabelPart = {}));
var InlayHintKind;
(function(InlayHintKind2) {
  function from(kind) {
    return kind;
  }
  __name(from, "from");
  InlayHintKind2.from = from;
  function to(kind) {
    return kind;
  }
  __name(to, "to");
  InlayHintKind2.to = to;
})(InlayHintKind || (InlayHintKind = {}));
var DocumentLink;
(function(DocumentLink2) {
  function from(link) {
    return {
      range: Range.from(link.range),
      url: link.target,
      tooltip: link.tooltip
    };
  }
  __name(from, "from");
  DocumentLink2.from = from;
  function to(link) {
    let target = void 0;
    if (link.url) {
      try {
        target = typeof link.url === "string" ? URI.parse(link.url, true) : URI.revive(link.url);
      } catch (err) {
      }
    }
    const result = new types.DocumentLink(Range.to(link.range), target);
    result.tooltip = link.tooltip;
    return result;
  }
  __name(to, "to");
  DocumentLink2.to = to;
})(DocumentLink || (DocumentLink = {}));
var ColorPresentation;
(function(ColorPresentation2) {
  function to(colorPresentation) {
    const cp = new types.ColorPresentation(colorPresentation.label);
    if (colorPresentation.textEdit) {
      cp.textEdit = TextEdit.to(colorPresentation.textEdit);
    }
    if (colorPresentation.additionalTextEdits) {
      cp.additionalTextEdits = colorPresentation.additionalTextEdits.map((value) => TextEdit.to(value));
    }
    return cp;
  }
  __name(to, "to");
  ColorPresentation2.to = to;
  function from(colorPresentation) {
    return {
      label: colorPresentation.label,
      textEdit: colorPresentation.textEdit ? TextEdit.from(colorPresentation.textEdit) : void 0,
      additionalTextEdits: colorPresentation.additionalTextEdits ? colorPresentation.additionalTextEdits.map((value) => TextEdit.from(value)) : void 0
    };
  }
  __name(from, "from");
  ColorPresentation2.from = from;
})(ColorPresentation || (ColorPresentation = {}));
var Color;
(function(Color2) {
  function to(c) {
    return new types.Color(c[0], c[1], c[2], c[3]);
  }
  __name(to, "to");
  Color2.to = to;
  function from(color) {
    return [color.red, color.green, color.blue, color.alpha];
  }
  __name(from, "from");
  Color2.from = from;
})(Color || (Color = {}));
var SelectionRange;
(function(SelectionRange2) {
  function from(obj) {
    return { range: Range.from(obj.range) };
  }
  __name(from, "from");
  SelectionRange2.from = from;
  function to(obj) {
    return new types.SelectionRange(Range.to(obj.range));
  }
  __name(to, "to");
  SelectionRange2.to = to;
})(SelectionRange || (SelectionRange = {}));
var TextDocumentSaveReason;
(function(TextDocumentSaveReason2) {
  function to(reason) {
    switch (reason) {
      case 2:
        return types.TextDocumentSaveReason.AfterDelay;
      case 1:
        return types.TextDocumentSaveReason.Manual;
      case 3:
      case 4:
        return types.TextDocumentSaveReason.FocusOut;
    }
  }
  __name(to, "to");
  TextDocumentSaveReason2.to = to;
})(TextDocumentSaveReason || (TextDocumentSaveReason = {}));
var TextEditorLineNumbersStyle;
(function(TextEditorLineNumbersStyle2) {
  function from(style) {
    switch (style) {
      case types.TextEditorLineNumbersStyle.Off:
        return 0;
      case types.TextEditorLineNumbersStyle.Relative:
        return 2;
      case types.TextEditorLineNumbersStyle.Interval:
        return 3;
      case types.TextEditorLineNumbersStyle.On:
      default:
        return 1;
    }
  }
  __name(from, "from");
  TextEditorLineNumbersStyle2.from = from;
  function to(style) {
    switch (style) {
      case 0:
        return types.TextEditorLineNumbersStyle.Off;
      case 2:
        return types.TextEditorLineNumbersStyle.Relative;
      case 3:
        return types.TextEditorLineNumbersStyle.Interval;
      case 1:
      default:
        return types.TextEditorLineNumbersStyle.On;
    }
  }
  __name(to, "to");
  TextEditorLineNumbersStyle2.to = to;
})(TextEditorLineNumbersStyle || (TextEditorLineNumbersStyle = {}));
var EndOfLine;
(function(EndOfLine2) {
  function from(eol) {
    if (eol === types.EndOfLine.CRLF) {
      return 1;
    } else if (eol === types.EndOfLine.LF) {
      return 0;
    }
    return void 0;
  }
  __name(from, "from");
  EndOfLine2.from = from;
  function to(eol) {
    if (eol === 1) {
      return types.EndOfLine.CRLF;
    } else if (eol === 0) {
      return types.EndOfLine.LF;
    }
    return void 0;
  }
  __name(to, "to");
  EndOfLine2.to = to;
})(EndOfLine || (EndOfLine = {}));
var ProgressLocation;
(function(ProgressLocation2) {
  function from(loc) {
    if (typeof loc === "object") {
      return loc.viewId;
    }
    switch (loc) {
      case types.ProgressLocation.SourceControl:
        return 3;
      case types.ProgressLocation.Window:
        return 10;
      case types.ProgressLocation.Notification:
        return 15;
    }
    throw new Error(`Unknown 'ProgressLocation'`);
  }
  __name(from, "from");
  ProgressLocation2.from = from;
})(ProgressLocation || (ProgressLocation = {}));
var FoldingRange;
(function(FoldingRange2) {
  function from(r) {
    const range = { start: r.start + 1, end: r.end + 1 };
    if (r.kind) {
      range.kind = FoldingRangeKind.from(r.kind);
    }
    return range;
  }
  __name(from, "from");
  FoldingRange2.from = from;
  function to(r) {
    const range = { start: r.start - 1, end: r.end - 1 };
    if (r.kind) {
      range.kind = FoldingRangeKind.to(r.kind);
    }
    return range;
  }
  __name(to, "to");
  FoldingRange2.to = to;
})(FoldingRange || (FoldingRange = {}));
var FoldingRangeKind;
(function(FoldingRangeKind2) {
  function from(kind) {
    if (kind) {
      switch (kind) {
        case types.FoldingRangeKind.Comment:
          return languages.FoldingRangeKind.Comment;
        case types.FoldingRangeKind.Imports:
          return languages.FoldingRangeKind.Imports;
        case types.FoldingRangeKind.Region:
          return languages.FoldingRangeKind.Region;
      }
    }
    return void 0;
  }
  __name(from, "from");
  FoldingRangeKind2.from = from;
  function to(kind) {
    if (kind) {
      switch (kind.value) {
        case languages.FoldingRangeKind.Comment.value:
          return types.FoldingRangeKind.Comment;
        case languages.FoldingRangeKind.Imports.value:
          return types.FoldingRangeKind.Imports;
        case languages.FoldingRangeKind.Region.value:
          return types.FoldingRangeKind.Region;
      }
    }
    return void 0;
  }
  __name(to, "to");
  FoldingRangeKind2.to = to;
})(FoldingRangeKind || (FoldingRangeKind = {}));
var TextEditorOpenOptions;
(function(TextEditorOpenOptions2) {
  function from(options) {
    if (options) {
      return {
        pinned: typeof options.preview === "boolean" ? !options.preview : void 0,
        inactive: options.background,
        preserveFocus: options.preserveFocus,
        selection: typeof options.selection === "object" ? Range.from(options.selection) : void 0,
        override: typeof options.override === "boolean" ? DEFAULT_EDITOR_ASSOCIATION.id : void 0
      };
    }
    return void 0;
  }
  __name(from, "from");
  TextEditorOpenOptions2.from = from;
})(TextEditorOpenOptions || (TextEditorOpenOptions = {}));
var GlobPattern;
(function(GlobPattern2) {
  function from(pattern) {
    if (pattern instanceof types.RelativePattern) {
      return pattern.toJSON();
    }
    if (typeof pattern === "string") {
      return pattern;
    }
    if (isRelativePatternShape(pattern) || isLegacyRelativePatternShape(pattern)) {
      return new types.RelativePattern(pattern.baseUri ?? pattern.base, pattern.pattern).toJSON();
    }
    return pattern;
  }
  __name(from, "from");
  GlobPattern2.from = from;
  function isRelativePatternShape(obj) {
    const rp = obj;
    if (!rp) {
      return false;
    }
    return URI.isUri(rp.baseUri) && typeof rp.pattern === "string";
  }
  __name(isRelativePatternShape, "isRelativePatternShape");
  function isLegacyRelativePatternShape(obj) {
    const rp = obj;
    if (!rp) {
      return false;
    }
    return typeof rp.base === "string" && typeof rp.pattern === "string";
  }
  __name(isLegacyRelativePatternShape, "isLegacyRelativePatternShape");
  function to(pattern) {
    if (typeof pattern === "string") {
      return pattern;
    }
    return new types.RelativePattern(URI.revive(pattern.baseUri), pattern.pattern);
  }
  __name(to, "to");
  GlobPattern2.to = to;
})(GlobPattern || (GlobPattern = {}));
var LanguageSelector;
(function(LanguageSelector2) {
  function from(selector) {
    if (!selector) {
      return void 0;
    } else if (Array.isArray(selector)) {
      return selector.map(from);
    } else if (typeof selector === "string") {
      return selector;
    } else {
      const filter = selector;
      return {
        language: filter.language,
        scheme: filter.scheme,
        pattern: GlobPattern.from(filter.pattern) ?? void 0,
        exclusive: filter.exclusive,
        notebookType: filter.notebookType
      };
    }
  }
  __name(from, "from");
  LanguageSelector2.from = from;
})(LanguageSelector || (LanguageSelector = {}));
var NotebookRange;
(function(NotebookRange2) {
  function from(range) {
    return { start: range.start, end: range.end };
  }
  __name(from, "from");
  NotebookRange2.from = from;
  function to(range) {
    return new types.NotebookRange(range.start, range.end);
  }
  __name(to, "to");
  NotebookRange2.to = to;
})(NotebookRange || (NotebookRange = {}));
var NotebookCellExecutionSummary;
(function(NotebookCellExecutionSummary2) {
  function to(data) {
    return {
      timing: typeof data.runStartTime === "number" && typeof data.runEndTime === "number" ? { startTime: data.runStartTime, endTime: data.runEndTime } : void 0,
      executionOrder: data.executionOrder,
      success: data.lastRunSuccess
    };
  }
  __name(to, "to");
  NotebookCellExecutionSummary2.to = to;
  function from(data) {
    return {
      lastRunSuccess: data.success,
      runStartTime: data.timing?.startTime,
      runEndTime: data.timing?.endTime,
      executionOrder: data.executionOrder
    };
  }
  __name(from, "from");
  NotebookCellExecutionSummary2.from = from;
})(NotebookCellExecutionSummary || (NotebookCellExecutionSummary = {}));
var NotebookCellKind;
(function(NotebookCellKind2) {
  function from(data) {
    switch (data) {
      case types.NotebookCellKind.Markup:
        return notebooks.CellKind.Markup;
      case types.NotebookCellKind.Code:
      default:
        return notebooks.CellKind.Code;
    }
  }
  __name(from, "from");
  NotebookCellKind2.from = from;
  function to(data) {
    switch (data) {
      case notebooks.CellKind.Markup:
        return types.NotebookCellKind.Markup;
      case notebooks.CellKind.Code:
      default:
        return types.NotebookCellKind.Code;
    }
  }
  __name(to, "to");
  NotebookCellKind2.to = to;
})(NotebookCellKind || (NotebookCellKind = {}));
var NotebookData;
(function(NotebookData2) {
  function from(data) {
    const res = {
      metadata: data.metadata ?? /* @__PURE__ */ Object.create(null),
      cells: []
    };
    for (const cell of data.cells) {
      types.NotebookCellData.validate(cell);
      res.cells.push(NotebookCellData.from(cell));
    }
    return res;
  }
  __name(from, "from");
  NotebookData2.from = from;
  function to(data) {
    const res = new types.NotebookData(data.cells.map(NotebookCellData.to));
    if (!isEmptyObject(data.metadata)) {
      res.metadata = data.metadata;
    }
    return res;
  }
  __name(to, "to");
  NotebookData2.to = to;
})(NotebookData || (NotebookData = {}));
var NotebookCellData;
(function(NotebookCellData2) {
  function from(data) {
    return {
      cellKind: NotebookCellKind.from(data.kind),
      language: data.languageId,
      mime: data.mime,
      source: data.value,
      metadata: data.metadata,
      internalMetadata: NotebookCellExecutionSummary.from(data.executionSummary ?? {}),
      outputs: data.outputs ? data.outputs.map(NotebookCellOutput.from) : []
    };
  }
  __name(from, "from");
  NotebookCellData2.from = from;
  function to(data) {
    return new types.NotebookCellData(NotebookCellKind.to(data.cellKind), data.source, data.language, data.mime, data.outputs ? data.outputs.map(NotebookCellOutput.to) : void 0, data.metadata, data.internalMetadata ? NotebookCellExecutionSummary.to(data.internalMetadata) : void 0);
  }
  __name(to, "to");
  NotebookCellData2.to = to;
})(NotebookCellData || (NotebookCellData = {}));
var NotebookCellOutputItem;
(function(NotebookCellOutputItem2) {
  function from(item) {
    return {
      mime: item.mime,
      valueBytes: VSBuffer.wrap(item.data)
    };
  }
  __name(from, "from");
  NotebookCellOutputItem2.from = from;
  function to(item) {
    return new types.NotebookCellOutputItem(item.valueBytes.buffer, item.mime);
  }
  __name(to, "to");
  NotebookCellOutputItem2.to = to;
})(NotebookCellOutputItem || (NotebookCellOutputItem = {}));
var NotebookCellOutput;
(function(NotebookCellOutput2) {
  function from(output) {
    return {
      outputId: output.id,
      items: output.items.map(NotebookCellOutputItem.from),
      metadata: output.metadata
    };
  }
  __name(from, "from");
  NotebookCellOutput2.from = from;
  function to(output) {
    const items = output.items.map(NotebookCellOutputItem.to);
    return new types.NotebookCellOutput(items, output.outputId, output.metadata);
  }
  __name(to, "to");
  NotebookCellOutput2.to = to;
})(NotebookCellOutput || (NotebookCellOutput = {}));
var NotebookExclusiveDocumentPattern;
(function(NotebookExclusiveDocumentPattern2) {
  function from(pattern) {
    if (isExclusivePattern(pattern)) {
      return {
        include: GlobPattern.from(pattern.include) ?? void 0,
        exclude: GlobPattern.from(pattern.exclude) ?? void 0
      };
    }
    return GlobPattern.from(pattern) ?? void 0;
  }
  __name(from, "from");
  NotebookExclusiveDocumentPattern2.from = from;
  function to(pattern) {
    if (isExclusivePattern(pattern)) {
      return {
        include: GlobPattern.to(pattern.include),
        exclude: GlobPattern.to(pattern.exclude)
      };
    }
    return GlobPattern.to(pattern);
  }
  __name(to, "to");
  NotebookExclusiveDocumentPattern2.to = to;
  function isExclusivePattern(obj) {
    const ep = obj;
    if (!ep) {
      return false;
    }
    return !isUndefinedOrNull(ep.include) && !isUndefinedOrNull(ep.exclude);
  }
  __name(isExclusivePattern, "isExclusivePattern");
})(NotebookExclusiveDocumentPattern || (NotebookExclusiveDocumentPattern = {}));
var NotebookStatusBarItem;
(function(NotebookStatusBarItem2) {
  function from(item, commandsConverter, disposables) {
    const command = typeof item.command === "string" ? { title: "", command: item.command } : item.command;
    return {
      alignment: item.alignment === types.NotebookCellStatusBarAlignment.Left ? 1 : 2,
      command: commandsConverter.toInternal(command, disposables),
      // TODO@roblou
      text: item.text,
      tooltip: item.tooltip,
      accessibilityInformation: item.accessibilityInformation,
      priority: item.priority
    };
  }
  __name(from, "from");
  NotebookStatusBarItem2.from = from;
})(NotebookStatusBarItem || (NotebookStatusBarItem = {}));
var NotebookKernelSourceAction;
(function(NotebookKernelSourceAction2) {
  function from(item, commandsConverter, disposables) {
    const command = typeof item.command === "string" ? { title: "", command: item.command } : item.command;
    return {
      command: commandsConverter.toInternal(command, disposables),
      label: item.label,
      description: item.description,
      detail: item.detail,
      documentation: item.documentation
    };
  }
  __name(from, "from");
  NotebookKernelSourceAction2.from = from;
})(NotebookKernelSourceAction || (NotebookKernelSourceAction = {}));
var NotebookDocumentContentOptions;
(function(NotebookDocumentContentOptions2) {
  function from(options) {
    return {
      transientOutputs: options?.transientOutputs ?? false,
      transientCellMetadata: options?.transientCellMetadata ?? {},
      transientDocumentMetadata: options?.transientDocumentMetadata ?? {},
      cellContentMetadata: options?.cellContentMetadata ?? {}
    };
  }
  __name(from, "from");
  NotebookDocumentContentOptions2.from = from;
})(NotebookDocumentContentOptions || (NotebookDocumentContentOptions = {}));
var NotebookRendererScript;
(function(NotebookRendererScript2) {
  function from(preload) {
    return {
      uri: preload.uri,
      provides: preload.provides
    };
  }
  __name(from, "from");
  NotebookRendererScript2.from = from;
  function to(preload) {
    return new types.NotebookRendererScript(URI.revive(preload.uri), preload.provides);
  }
  __name(to, "to");
  NotebookRendererScript2.to = to;
})(NotebookRendererScript || (NotebookRendererScript = {}));
var TestMessage;
(function(TestMessage2) {
  function from(message) {
    return {
      message: MarkdownString.fromStrict(message.message) || "",
      type: 0,
      expected: message.expectedOutput,
      actual: message.actualOutput,
      contextValue: message.contextValue,
      location: message.location && { range: Range.from(message.location.range), uri: message.location.uri },
      stackTrace: message.stackTrace?.map((s) => ({
        label: s.label,
        position: s.position && Position.from(s.position),
        uri: s.uri && URI.revive(s.uri).toJSON()
      }))
    };
  }
  __name(from, "from");
  TestMessage2.from = from;
  function to(item) {
    const message = new types.TestMessage(typeof item.message === "string" ? item.message : MarkdownString.to(item.message));
    message.actualOutput = item.actual;
    message.expectedOutput = item.expected;
    message.contextValue = item.contextValue;
    message.location = item.location ? location.to(item.location) : void 0;
    return message;
  }
  __name(to, "to");
  TestMessage2.to = to;
})(TestMessage || (TestMessage = {}));
var TestTag;
(function(TestTag2) {
  TestTag2.namespace = namespaceTestTag;
  TestTag2.denamespace = denamespaceTestTag;
})(TestTag || (TestTag = {}));
var TestRunProfile;
(function(TestRunProfile2) {
  function from(item) {
    return {
      controllerId: item.controllerId,
      profileId: item.profileId,
      group: TestRunProfileKind.from(item.kind)
    };
  }
  __name(from, "from");
  TestRunProfile2.from = from;
})(TestRunProfile || (TestRunProfile = {}));
var TestRunProfileKind;
(function(TestRunProfileKind2) {
  const profileGroupToBitset = {
    [types.TestRunProfileKind.Coverage]: 8,
    [types.TestRunProfileKind.Debug]: 4,
    [types.TestRunProfileKind.Run]: 2
  };
  function from(kind) {
    return profileGroupToBitset.hasOwnProperty(kind) ? profileGroupToBitset[kind] : 2;
  }
  __name(from, "from");
  TestRunProfileKind2.from = from;
})(TestRunProfileKind || (TestRunProfileKind = {}));
var TestItem;
(function(TestItem2) {
  function from(item) {
    const ctrlId = getPrivateApiFor(item).controllerId;
    return {
      extId: TestId.fromExtHostTestItem(item, ctrlId).toString(),
      label: item.label,
      uri: URI.revive(item.uri),
      busy: item.busy,
      tags: item.tags.map((t) => TestTag.namespace(ctrlId, t.id)),
      range: editorRange.Range.lift(Range.from(item.range)),
      description: item.description || null,
      sortText: item.sortText || null,
      error: item.error ? MarkdownString.fromStrict(item.error) || null : null
    };
  }
  __name(from, "from");
  TestItem2.from = from;
  function toPlain(item) {
    return {
      parent: void 0,
      error: void 0,
      id: TestId.fromString(item.extId).localId,
      label: item.label,
      uri: URI.revive(item.uri),
      tags: (item.tags || []).map((t) => {
        const { tagId } = TestTag.denamespace(t);
        return new types.TestTag(tagId);
      }),
      children: {
        add: /* @__PURE__ */ __name(() => {
        }, "add"),
        delete: /* @__PURE__ */ __name(() => {
        }, "delete"),
        forEach: /* @__PURE__ */ __name(() => {
        }, "forEach"),
        *[Symbol.iterator]() {
        },
        get: /* @__PURE__ */ __name(() => void 0, "get"),
        replace: /* @__PURE__ */ __name(() => {
        }, "replace"),
        size: 0
      },
      range: Range.to(item.range || void 0),
      canResolveChildren: false,
      busy: item.busy,
      description: item.description || void 0,
      sortText: item.sortText || void 0
    };
  }
  __name(toPlain, "toPlain");
  TestItem2.toPlain = toPlain;
})(TestItem || (TestItem = {}));
(function(TestTag2) {
  function from(tag) {
    return { id: tag.id };
  }
  __name(from, "from");
  TestTag2.from = from;
  function to(tag) {
    return new types.TestTag(tag.id);
  }
  __name(to, "to");
  TestTag2.to = to;
})(TestTag || (TestTag = {}));
var TestResults;
(function(TestResults2) {
  const convertTestResultItem = /* @__PURE__ */ __name((node, parent) => {
    const item = node.value;
    if (!item) {
      return void 0;
    }
    const snapshot = {
      ...TestItem.toPlain(item.item),
      parent,
      taskStates: item.tasks.map((t) => ({
        state: t.state,
        duration: t.duration,
        messages: t.messages.filter(
          (m) => m.type === 0
          /* TestMessageType.Error */
        ).map(TestMessage.to)
      })),
      children: []
    };
    if (node.children) {
      for (const child of node.children.values()) {
        const c = convertTestResultItem(child, snapshot);
        if (c) {
          snapshot.children.push(c);
        }
      }
    }
    return snapshot;
  }, "convertTestResultItem");
  function to(serialized) {
    const tree = new WellDefinedPrefixTree();
    for (const item of serialized.items) {
      tree.insert(TestId.fromString(item.item.extId).path, item);
    }
    const queue = [tree.nodes];
    const roots = [];
    while (queue.length) {
      for (const node of queue.pop()) {
        if (node.value) {
          roots.push(node);
        } else if (node.children) {
          queue.push(node.children.values());
        }
      }
    }
    return {
      completedAt: serialized.completedAt,
      results: roots.map((r) => convertTestResultItem(r)).filter(isDefined)
    };
  }
  __name(to, "to");
  TestResults2.to = to;
})(TestResults || (TestResults = {}));
var TestCoverage;
(function(TestCoverage2) {
  function fromCoverageCount(count) {
    return { covered: count.covered, total: count.total };
  }
  __name(fromCoverageCount, "fromCoverageCount");
  function fromLocation(location2) {
    return "line" in location2 ? Position.from(location2) : Range.from(location2);
  }
  __name(fromLocation, "fromLocation");
  function toLocation(location2) {
    if (!location2) {
      return void 0;
    }
    return "endLineNumber" in location2 ? Range.to(location2) : Position.to(location2);
  }
  __name(toLocation, "toLocation");
  function to(serialized) {
    if (serialized.type === 1) {
      const branches = [];
      if (serialized.branches) {
        for (const branch of serialized.branches) {
          branches.push({
            executed: branch.count,
            location: toLocation(branch.location),
            label: branch.label
          });
        }
      }
      return new types.StatementCoverage(serialized.count, toLocation(serialized.location), serialized.branches?.map((b) => new types.BranchCoverage(b.count, toLocation(b.location), b.label)));
    } else {
      return new types.DeclarationCoverage(serialized.name, serialized.count, toLocation(serialized.location));
    }
  }
  __name(to, "to");
  TestCoverage2.to = to;
  function fromDetails(coverage) {
    if (typeof coverage.executed === "number" && coverage.executed < 0) {
      throw new Error(`Invalid coverage count ${coverage.executed}`);
    }
    if ("branches" in coverage) {
      return {
        count: coverage.executed,
        location: fromLocation(coverage.location),
        type: 1,
        branches: coverage.branches.length ? coverage.branches.map((b) => ({ count: b.executed, location: b.location && fromLocation(b.location), label: b.label })) : void 0
      };
    } else {
      return {
        type: 0,
        name: coverage.name,
        count: coverage.executed,
        location: fromLocation(coverage.location)
      };
    }
  }
  __name(fromDetails, "fromDetails");
  TestCoverage2.fromDetails = fromDetails;
  function fromFile(controllerId, id, coverage) {
    types.validateTestCoverageCount(coverage.statementCoverage);
    types.validateTestCoverageCount(coverage.branchCoverage);
    types.validateTestCoverageCount(coverage.declarationCoverage);
    return {
      id,
      uri: coverage.uri,
      statement: fromCoverageCount(coverage.statementCoverage),
      branch: coverage.branchCoverage && fromCoverageCount(coverage.branchCoverage),
      declaration: coverage.declarationCoverage && fromCoverageCount(coverage.declarationCoverage),
      testIds: coverage instanceof types.FileCoverage && coverage.includesTests.length ? coverage.includesTests.map((t) => TestId.fromExtHostTestItem(t, controllerId).toString()) : void 0
    };
  }
  __name(fromFile, "fromFile");
  TestCoverage2.fromFile = fromFile;
})(TestCoverage || (TestCoverage = {}));
var CodeActionTriggerKind;
(function(CodeActionTriggerKind2) {
  function to(value) {
    switch (value) {
      case 1:
        return types.CodeActionTriggerKind.Invoke;
      case 2:
        return types.CodeActionTriggerKind.Automatic;
    }
  }
  __name(to, "to");
  CodeActionTriggerKind2.to = to;
})(CodeActionTriggerKind || (CodeActionTriggerKind = {}));
var TypeHierarchyItem;
(function(TypeHierarchyItem2) {
  function to(item) {
    const result = new types.TypeHierarchyItem(SymbolKind.to(item.kind), item.name, item.detail || "", URI.revive(item.uri), Range.to(item.range), Range.to(item.selectionRange));
    result._sessionId = item._sessionId;
    result._itemId = item._itemId;
    return result;
  }
  __name(to, "to");
  TypeHierarchyItem2.to = to;
  function from(item, sessionId, itemId) {
    sessionId = sessionId ?? item._sessionId;
    itemId = itemId ?? item._itemId;
    if (sessionId === void 0 || itemId === void 0) {
      throw new Error("invalid item");
    }
    return {
      _sessionId: sessionId,
      _itemId: itemId,
      kind: SymbolKind.from(item.kind),
      name: item.name,
      detail: item.detail ?? "",
      uri: item.uri,
      range: Range.from(item.range),
      selectionRange: Range.from(item.selectionRange),
      tags: item.tags?.map(SymbolTag.from)
    };
  }
  __name(from, "from");
  TypeHierarchyItem2.from = from;
})(TypeHierarchyItem || (TypeHierarchyItem = {}));
var ViewBadge;
(function(ViewBadge2) {
  function from(badge) {
    if (!badge) {
      return void 0;
    }
    return {
      value: badge.value,
      tooltip: badge.tooltip
    };
  }
  __name(from, "from");
  ViewBadge2.from = from;
})(ViewBadge || (ViewBadge = {}));
var DataTransferItem;
(function(DataTransferItem2) {
  function to(mime, item, resolveFileData) {
    const file = item.fileData;
    if (file) {
      return new types.InternalFileDataTransferItem(new types.DataTransferFile(file.name, URI.revive(file.uri), file.id, createSingleCallFunction(() => resolveFileData(file.id))));
    }
    if (mime === Mimes.uriList && item.uriListData) {
      return new types.InternalDataTransferItem(reviveUriList(item.uriListData));
    }
    return new types.InternalDataTransferItem(item.asString);
  }
  __name(to, "to");
  DataTransferItem2.to = to;
  async function from(mime, item, id = generateUuid()) {
    const stringValue = await item.asString();
    if (mime === Mimes.uriList) {
      return {
        id,
        asString: stringValue,
        fileData: void 0,
        uriListData: serializeUriList(stringValue)
      };
    }
    const fileValue = item.asFile();
    return {
      id,
      asString: stringValue,
      fileData: fileValue ? {
        name: fileValue.name,
        uri: fileValue.uri,
        id: fileValue._itemId ?? fileValue.id
      } : void 0
    };
  }
  __name(from, "from");
  DataTransferItem2.from = from;
  function serializeUriList(stringValue) {
    return UriList.split(stringValue).map((part) => {
      if (part.startsWith("#")) {
        return part;
      }
      try {
        return URI.parse(part);
      } catch {
      }
      return part;
    });
  }
  __name(serializeUriList, "serializeUriList");
  function reviveUriList(parts) {
    return UriList.create(parts.map((part) => {
      return typeof part === "string" ? part : URI.revive(part);
    }));
  }
  __name(reviveUriList, "reviveUriList");
})(DataTransferItem || (DataTransferItem = {}));
var DataTransfer;
(function(DataTransfer2) {
  function toDataTransfer(value, resolveFileData) {
    const init = value.items.map(([type, item]) => {
      return [type, DataTransferItem.to(type, item, resolveFileData)];
    });
    return new types.DataTransfer(init);
  }
  __name(toDataTransfer, "toDataTransfer");
  DataTransfer2.toDataTransfer = toDataTransfer;
  async function from(dataTransfer) {
    const items = await Promise.all(Array.from(dataTransfer, async ([mime, value]) => {
      return [mime, await DataTransferItem.from(mime, value)];
    }));
    return { items };
  }
  __name(from, "from");
  DataTransfer2.from = from;
  async function fromList(dataTransfer) {
    const items = await Promise.all(Array.from(dataTransfer, async ([mime, value]) => {
      return [mime, await DataTransferItem.from(mime, value, value.id)];
    }));
    return { items };
  }
  __name(fromList, "fromList");
  DataTransfer2.fromList = fromList;
})(DataTransfer || (DataTransfer = {}));
var ChatFollowup;
(function(ChatFollowup2) {
  function from(followup, request) {
    return {
      kind: "reply",
      agentId: followup.participant ?? request?.agentId ?? "",
      subCommand: followup.command ?? request?.command,
      message: followup.prompt,
      title: followup.label
    };
  }
  __name(from, "from");
  ChatFollowup2.from = from;
  function to(followup) {
    return {
      prompt: followup.message,
      label: followup.title,
      participant: followup.agentId,
      command: followup.subCommand
    };
  }
  __name(to, "to");
  ChatFollowup2.to = to;
})(ChatFollowup || (ChatFollowup = {}));
var LanguageModelChatMessageRole;
(function(LanguageModelChatMessageRole2) {
  function to(role) {
    switch (role) {
      case 0:
        return types.LanguageModelChatMessageRole.System;
      case 1:
        return types.LanguageModelChatMessageRole.User;
      case 2:
        return types.LanguageModelChatMessageRole.Assistant;
    }
  }
  __name(to, "to");
  LanguageModelChatMessageRole2.to = to;
  function from(role) {
    switch (role) {
      case types.LanguageModelChatMessageRole.System:
        return 0;
      case types.LanguageModelChatMessageRole.User:
        return 1;
      case types.LanguageModelChatMessageRole.Assistant:
        return 2;
    }
    return 1;
  }
  __name(from, "from");
  LanguageModelChatMessageRole2.from = from;
})(LanguageModelChatMessageRole || (LanguageModelChatMessageRole = {}));
var LanguageModelChatMessage;
(function(LanguageModelChatMessage3) {
  function to(message) {
    const content = message.content.map((c) => {
      if (c.type === "text") {
        return new LanguageModelTextPart(c.value);
      } else if (c.type === "tool_result") {
        const content2 = c.value.map((part) => {
          if (part.type === "text") {
            return new types.LanguageModelTextPart(part.value);
          } else {
            return new types.LanguageModelPromptTsxPart(part.value);
          }
        });
        return new types.LanguageModelToolResultPart(c.toolCallId, content2, c.isError);
      } else if (c.type === "image_url") {
        return void 0;
      } else if (c.type === "tool_use") {
        return new types.LanguageModelToolCallPart(c.toolCallId, c.name, c.parameters);
      }
      return void 0;
    }).filter((c) => c !== void 0);
    const role = LanguageModelChatMessageRole.to(message.role);
    const result = new types.LanguageModelChatMessage(role, content, message.name);
    return result;
  }
  __name(to, "to");
  LanguageModelChatMessage3.to = to;
  function from(message) {
    const role = LanguageModelChatMessageRole.from(message.role);
    const name = message.name;
    let messageContent = message.content;
    if (typeof messageContent === "string") {
      messageContent = [new types.LanguageModelTextPart(messageContent)];
    }
    const content = messageContent.map((c) => {
      if (c instanceof types.LanguageModelToolResultPart) {
        return {
          type: "tool_result",
          toolCallId: c.callId,
          value: coalesce(c.content.map((part) => {
            if (part instanceof types.LanguageModelTextPart) {
              return {
                type: "text",
                value: part.value
              };
            } else if (part instanceof types.LanguageModelPromptTsxPart) {
              return {
                type: "prompt_tsx",
                value: part.value
              };
            } else {
              return void 0;
            }
          })),
          isError: c.isError
        };
      } else if (c instanceof types.LanguageModelToolCallPart) {
        return {
          type: "tool_use",
          toolCallId: c.callId,
          name: c.name,
          parameters: c.input
        };
      } else if (c instanceof types.LanguageModelTextPart) {
        return {
          type: "text",
          value: c.value
        };
      } else {
        if (typeof c !== "string") {
          throw new Error("Unexpected chat message content type");
        }
        return {
          type: "text",
          value: c
        };
      }
    });
    return {
      role,
      name,
      content
    };
  }
  __name(from, "from");
  LanguageModelChatMessage3.from = from;
})(LanguageModelChatMessage || (LanguageModelChatMessage = {}));
var LanguageModelChatMessage2;
(function(LanguageModelChatMessage22) {
  function to(message) {
    const content = message.content.map((c) => {
      if (c.type === "text") {
        return new LanguageModelTextPart(c.value);
      } else if (c.type === "tool_result") {
        const content2 = c.value.map((part) => {
          if (part.type === "text") {
            return new types.LanguageModelTextPart(part.value);
          } else if (part.type === "data") {
            return new types.LanguageModelDataPart(part.value.data.buffer, part.value.mimeType);
          } else {
            return new types.LanguageModelPromptTsxPart(part.value);
          }
        });
        return new types.LanguageModelToolResultPart2(c.toolCallId, content2, c.isError);
      } else if (c.type === "image_url") {
        return new types.LanguageModelDataPart(c.value.data.buffer, c.value.mimeType);
      } else if (c.type === "data") {
        return new types.LanguageModelDataPart(c.data.buffer, c.mimeType);
      } else {
        return new types.LanguageModelToolCallPart(c.toolCallId, c.name, c.parameters);
      }
    });
    const role = LanguageModelChatMessageRole.to(message.role);
    const result = new types.LanguageModelChatMessage2(role, content, message.name);
    return result;
  }
  __name(to, "to");
  LanguageModelChatMessage22.to = to;
  function from(message) {
    const role = LanguageModelChatMessageRole.from(message.role);
    const name = message.name;
    let messageContent = message.content;
    if (typeof messageContent === "string") {
      messageContent = [new types.LanguageModelTextPart(messageContent)];
    }
    const content = messageContent.map((c) => {
      if (c instanceof types.LanguageModelToolResultPart2 || c instanceof types.LanguageModelToolResultPart) {
        return {
          type: "tool_result",
          toolCallId: c.callId,
          value: coalesce(c.content.map((part) => {
            if (part instanceof types.LanguageModelTextPart) {
              return {
                type: "text",
                value: part.value
              };
            } else if (part instanceof types.LanguageModelPromptTsxPart) {
              return {
                type: "prompt_tsx",
                value: part.value
              };
            } else if (part instanceof types.LanguageModelDataPart) {
              return {
                type: "data",
                value: {
                  mimeType: part.mimeType,
                  data: VSBuffer.wrap(part.data)
                }
              };
            } else {
              return void 0;
            }
          })),
          isError: c.isError
        };
      } else if (c instanceof types.LanguageModelDataPart) {
        if (isImageDataPart(c)) {
          const value = {
            mimeType: c.mimeType,
            data: VSBuffer.wrap(c.data)
          };
          return {
            type: "image_url",
            value
          };
        } else {
          return {
            type: "data",
            mimeType: c.mimeType,
            data: VSBuffer.wrap(c.data)
          };
        }
      } else if (c instanceof types.LanguageModelToolCallPart) {
        return {
          type: "tool_use",
          toolCallId: c.callId,
          name: c.name,
          parameters: c.input
        };
      } else if (c instanceof types.LanguageModelTextPart) {
        return {
          type: "text",
          value: c.value
        };
      } else {
        if (typeof c !== "string") {
          throw new Error("Unexpected chat message content type llm 2");
        }
        return {
          type: "text",
          value: c
        };
      }
    });
    return {
      role,
      name,
      content
    };
  }
  __name(from, "from");
  LanguageModelChatMessage22.from = from;
})(LanguageModelChatMessage2 || (LanguageModelChatMessage2 = {}));
function isImageDataPart(part) {
  switch (part.mimeType) {
    case types.ChatImageMimeType.PNG:
    case types.ChatImageMimeType.JPEG:
    case types.ChatImageMimeType.GIF:
    case types.ChatImageMimeType.WEBP:
    case types.ChatImageMimeType.BMP:
      return true;
    default:
      return false;
  }
}
__name(isImageDataPart, "isImageDataPart");
var ChatResponseMarkdownPart;
(function(ChatResponseMarkdownPart2) {
  function from(part) {
    return {
      kind: "markdownContent",
      content: MarkdownString.from(part.value)
    };
  }
  __name(from, "from");
  ChatResponseMarkdownPart2.from = from;
  function to(part) {
    return new types.ChatResponseMarkdownPart(MarkdownString.to(part.content));
  }
  __name(to, "to");
  ChatResponseMarkdownPart2.to = to;
})(ChatResponseMarkdownPart || (ChatResponseMarkdownPart = {}));
var ChatResponseCodeblockUriPart;
(function(ChatResponseCodeblockUriPart2) {
  function from(part) {
    return {
      kind: "codeblockUri",
      uri: part.value,
      isEdit: part.isEdit
    };
  }
  __name(from, "from");
  ChatResponseCodeblockUriPart2.from = from;
  function to(part) {
    return new types.ChatResponseCodeblockUriPart(URI.revive(part.uri), part.isEdit);
  }
  __name(to, "to");
  ChatResponseCodeblockUriPart2.to = to;
})(ChatResponseCodeblockUriPart || (ChatResponseCodeblockUriPart = {}));
var ChatResponseMarkdownWithVulnerabilitiesPart;
(function(ChatResponseMarkdownWithVulnerabilitiesPart2) {
  function from(part) {
    return {
      kind: "markdownVuln",
      content: MarkdownString.from(part.value),
      vulnerabilities: part.vulnerabilities
    };
  }
  __name(from, "from");
  ChatResponseMarkdownWithVulnerabilitiesPart2.from = from;
  function to(part) {
    return new types.ChatResponseMarkdownWithVulnerabilitiesPart(MarkdownString.to(part.content), part.vulnerabilities);
  }
  __name(to, "to");
  ChatResponseMarkdownWithVulnerabilitiesPart2.to = to;
})(ChatResponseMarkdownWithVulnerabilitiesPart || (ChatResponseMarkdownWithVulnerabilitiesPart = {}));
var ChatResponseConfirmationPart;
(function(ChatResponseConfirmationPart2) {
  function from(part) {
    return {
      kind: "confirmation",
      title: part.title,
      message: part.message,
      data: part.data,
      buttons: part.buttons
    };
  }
  __name(from, "from");
  ChatResponseConfirmationPart2.from = from;
})(ChatResponseConfirmationPart || (ChatResponseConfirmationPart = {}));
var ChatResponseFilesPart;
(function(ChatResponseFilesPart2) {
  function from(part) {
    const { value, baseUri } = part;
    function convert(items, baseUri2) {
      return items.map((item) => {
        const myUri = URI.joinPath(baseUri2, item.name);
        return {
          label: item.name,
          uri: myUri,
          children: item.children && convert(item.children, myUri)
        };
      });
    }
    __name(convert, "convert");
    return {
      kind: "treeData",
      treeData: {
        label: basename(baseUri),
        uri: baseUri,
        children: convert(value, baseUri)
      }
    };
  }
  __name(from, "from");
  ChatResponseFilesPart2.from = from;
  function to(part) {
    const treeData = revive(part.treeData);
    function convert(items2) {
      return items2.map((item) => {
        return {
          name: item.label,
          children: item.children && convert(item.children)
        };
      });
    }
    __name(convert, "convert");
    const baseUri = treeData.uri;
    const items = treeData.children ? convert(treeData.children) : [];
    return new types.ChatResponseFileTreePart(items, baseUri);
  }
  __name(to, "to");
  ChatResponseFilesPart2.to = to;
})(ChatResponseFilesPart || (ChatResponseFilesPart = {}));
var ChatResponseAnchorPart;
(function(ChatResponseAnchorPart2) {
  function from(part) {
    const isUri = /* @__PURE__ */ __name((thing) => URI.isUri(thing), "isUri");
    const isSymbolInformation = /* @__PURE__ */ __name((thing) => "name" in thing, "isSymbolInformation");
    return {
      kind: "inlineReference",
      name: part.title,
      inlineReference: isUri(part.value) ? part.value : isSymbolInformation(part.value) ? WorkspaceSymbol.from(part.value) : Location.from(part.value)
    };
  }
  __name(from, "from");
  ChatResponseAnchorPart2.from = from;
  function to(part) {
    const value = revive(part);
    return new types.ChatResponseAnchorPart(URI.isUri(value.inlineReference) ? value.inlineReference : "location" in value.inlineReference ? WorkspaceSymbol.to(value.inlineReference) : Location.to(value.inlineReference), part.name);
  }
  __name(to, "to");
  ChatResponseAnchorPart2.to = to;
})(ChatResponseAnchorPart || (ChatResponseAnchorPart = {}));
var ChatResponseProgressPart;
(function(ChatResponseProgressPart2) {
  function from(part) {
    return {
      kind: "progressMessage",
      content: MarkdownString.from(part.value)
    };
  }
  __name(from, "from");
  ChatResponseProgressPart2.from = from;
  function to(part) {
    return new types.ChatResponseProgressPart(part.content.value);
  }
  __name(to, "to");
  ChatResponseProgressPart2.to = to;
})(ChatResponseProgressPart || (ChatResponseProgressPart = {}));
var ChatResponseWarningPart;
(function(ChatResponseWarningPart2) {
  function from(part) {
    return {
      kind: "warning",
      content: MarkdownString.from(part.value)
    };
  }
  __name(from, "from");
  ChatResponseWarningPart2.from = from;
  function to(part) {
    return new types.ChatResponseWarningPart(part.content.value);
  }
  __name(to, "to");
  ChatResponseWarningPart2.to = to;
})(ChatResponseWarningPart || (ChatResponseWarningPart = {}));
var ChatResponseExtensionsPart;
(function(ChatResponseExtensionsPart2) {
  function from(part) {
    return {
      kind: "extensions",
      extensions: part.extensions
    };
  }
  __name(from, "from");
  ChatResponseExtensionsPart2.from = from;
})(ChatResponseExtensionsPart || (ChatResponseExtensionsPart = {}));
var ChatResponseMovePart;
(function(ChatResponseMovePart2) {
  function from(part) {
    return {
      kind: "move",
      uri: part.uri,
      range: Range.from(part.range)
    };
  }
  __name(from, "from");
  ChatResponseMovePart2.from = from;
  function to(part) {
    return new types.ChatResponseMovePart(URI.revive(part.uri), Range.to(part.range));
  }
  __name(to, "to");
  ChatResponseMovePart2.to = to;
})(ChatResponseMovePart || (ChatResponseMovePart = {}));
var ChatPrepareToolInvocationPart;
(function(ChatPrepareToolInvocationPart2) {
  function from(part) {
    return {
      kind: "prepareToolInvocation",
      toolName: part.toolName
    };
  }
  __name(from, "from");
  ChatPrepareToolInvocationPart2.from = from;
  function to(part) {
    return new types.ChatPrepareToolInvocationPart(part.toolName);
  }
  __name(to, "to");
  ChatPrepareToolInvocationPart2.to = to;
})(ChatPrepareToolInvocationPart || (ChatPrepareToolInvocationPart = {}));
var ChatTask;
(function(ChatTask2) {
  function from(part) {
    return {
      kind: "progressTask",
      content: MarkdownString.from(part.value)
    };
  }
  __name(from, "from");
  ChatTask2.from = from;
})(ChatTask || (ChatTask = {}));
var ChatTaskResult;
(function(ChatTaskResult2) {
  function from(part) {
    return {
      kind: "progressTaskResult",
      content: typeof part === "string" ? MarkdownString.from(part) : void 0
    };
  }
  __name(from, "from");
  ChatTaskResult2.from = from;
})(ChatTaskResult || (ChatTaskResult = {}));
var ChatResponseCommandButtonPart;
(function(ChatResponseCommandButtonPart2) {
  function from(part, commandsConverter, commandDisposables) {
    const command = commandsConverter.toInternal(part.value, commandDisposables) ?? { command: part.value.command, title: part.value.title };
    return {
      kind: "command",
      command
    };
  }
  __name(from, "from");
  ChatResponseCommandButtonPart2.from = from;
  function to(part, commandsConverter) {
    return new types.ChatResponseCommandButtonPart(commandsConverter.fromInternal(part.command) ?? { command: part.command.id, title: part.command.title });
  }
  __name(to, "to");
  ChatResponseCommandButtonPart2.to = to;
})(ChatResponseCommandButtonPart || (ChatResponseCommandButtonPart = {}));
var ChatResponseTextEditPart;
(function(ChatResponseTextEditPart2) {
  function from(part) {
    return {
      kind: "textEdit",
      uri: part.uri,
      edits: part.edits.map((e) => TextEdit.from(e)),
      done: part.isDone
    };
  }
  __name(from, "from");
  ChatResponseTextEditPart2.from = from;
  function to(part) {
    const result = new types.ChatResponseTextEditPart(URI.revive(part.uri), part.edits.map((e) => TextEdit.to(e)));
    result.isDone = part.done;
    return result;
  }
  __name(to, "to");
  ChatResponseTextEditPart2.to = to;
})(ChatResponseTextEditPart || (ChatResponseTextEditPart = {}));
var NotebookEdit;
(function(NotebookEdit2) {
  function from(edit) {
    if (edit.newCellMetadata) {
      return {
        editType: 3,
        index: edit.range.start,
        metadata: edit.newCellMetadata
      };
    } else if (edit.newNotebookMetadata) {
      return {
        editType: 5,
        metadata: edit.newNotebookMetadata
      };
    } else {
      return {
        editType: 1,
        index: edit.range.start,
        count: edit.range.end - edit.range.start,
        cells: edit.newCells.map(NotebookCellData.from)
      };
    }
  }
  __name(from, "from");
  NotebookEdit2.from = from;
})(NotebookEdit || (NotebookEdit = {}));
var ChatResponseNotebookEditPart;
(function(ChatResponseNotebookEditPart2) {
  function from(part) {
    return {
      kind: "notebookEdit",
      uri: part.uri,
      edits: part.edits.map(NotebookEdit.from),
      done: part.isDone
    };
  }
  __name(from, "from");
  ChatResponseNotebookEditPart2.from = from;
})(ChatResponseNotebookEditPart || (ChatResponseNotebookEditPart = {}));
var ChatResponseReferencePart;
(function(ChatResponseReferencePart2) {
  function from(part) {
    const iconPath = ThemeIcon.isThemeIcon(part.iconPath) ? part.iconPath : URI.isUri(part.iconPath) ? { light: URI.revive(part.iconPath) } : part.iconPath && "light" in part.iconPath && "dark" in part.iconPath && URI.isUri(part.iconPath.light) && URI.isUri(part.iconPath.dark) ? { light: URI.revive(part.iconPath.light), dark: URI.revive(part.iconPath.dark) } : void 0;
    if (typeof part.value === "object" && "variableName" in part.value) {
      return {
        kind: "reference",
        reference: {
          variableName: part.value.variableName,
          value: URI.isUri(part.value.value) || !part.value.value ? part.value.value : Location.from(part.value.value)
        },
        iconPath,
        options: part.options
      };
    }
    return {
      kind: "reference",
      reference: URI.isUri(part.value) || typeof part.value === "string" ? part.value : Location.from(part.value),
      iconPath,
      options: part.options
    };
  }
  __name(from, "from");
  ChatResponseReferencePart2.from = from;
  function to(part) {
    const value = revive(part);
    const mapValue = /* @__PURE__ */ __name((value2) => URI.isUri(value2) ? value2 : Location.to(value2), "mapValue");
    return new types.ChatResponseReferencePart(typeof value.reference === "string" ? value.reference : "variableName" in value.reference ? {
      variableName: value.reference.variableName,
      value: value.reference.value && mapValue(value.reference.value)
    } : mapValue(value.reference));
  }
  __name(to, "to");
  ChatResponseReferencePart2.to = to;
})(ChatResponseReferencePart || (ChatResponseReferencePart = {}));
var ChatResponseCodeCitationPart;
(function(ChatResponseCodeCitationPart2) {
  function from(part) {
    return {
      kind: "codeCitation",
      value: part.value,
      license: part.license,
      snippet: part.snippet
    };
  }
  __name(from, "from");
  ChatResponseCodeCitationPart2.from = from;
})(ChatResponseCodeCitationPart || (ChatResponseCodeCitationPart = {}));
var ChatResponsePart;
(function(ChatResponsePart2) {
  function from(part, commandsConverter, commandDisposables) {
    if (part instanceof types.ChatResponseMarkdownPart) {
      return ChatResponseMarkdownPart.from(part);
    } else if (part instanceof types.ChatResponseAnchorPart) {
      return ChatResponseAnchorPart.from(part);
    } else if (part instanceof types.ChatResponseReferencePart) {
      return ChatResponseReferencePart.from(part);
    } else if (part instanceof types.ChatResponseProgressPart) {
      return ChatResponseProgressPart.from(part);
    } else if (part instanceof types.ChatResponseFileTreePart) {
      return ChatResponseFilesPart.from(part);
    } else if (part instanceof types.ChatResponseCommandButtonPart) {
      return ChatResponseCommandButtonPart.from(part, commandsConverter, commandDisposables);
    } else if (part instanceof types.ChatResponseTextEditPart) {
      return ChatResponseTextEditPart.from(part);
    } else if (part instanceof types.ChatResponseNotebookEditPart) {
      return ChatResponseNotebookEditPart.from(part);
    } else if (part instanceof types.ChatResponseMarkdownWithVulnerabilitiesPart) {
      return ChatResponseMarkdownWithVulnerabilitiesPart.from(part);
    } else if (part instanceof types.ChatResponseCodeblockUriPart) {
      return ChatResponseCodeblockUriPart.from(part);
    } else if (part instanceof types.ChatResponseWarningPart) {
      return ChatResponseWarningPart.from(part);
    } else if (part instanceof types.ChatResponseConfirmationPart) {
      return ChatResponseConfirmationPart.from(part);
    } else if (part instanceof types.ChatResponseCodeCitationPart) {
      return ChatResponseCodeCitationPart.from(part);
    } else if (part instanceof types.ChatResponseMovePart) {
      return ChatResponseMovePart.from(part);
    } else if (part instanceof types.ChatResponseExtensionsPart) {
      return ChatResponseExtensionsPart.from(part);
    } else if (part instanceof types.ChatPrepareToolInvocationPart) {
      return ChatPrepareToolInvocationPart.from(part);
    }
    return {
      kind: "markdownContent",
      content: MarkdownString.from("")
    };
  }
  __name(from, "from");
  ChatResponsePart2.from = from;
  function to(part, commandsConverter) {
    switch (part.kind) {
      case "reference":
        return ChatResponseReferencePart.to(part);
      case "markdownContent":
      case "inlineReference":
      case "progressMessage":
      case "treeData":
      case "command":
        return toContent(part, commandsConverter);
    }
    return void 0;
  }
  __name(to, "to");
  ChatResponsePart2.to = to;
  function toContent(part, commandsConverter) {
    switch (part.kind) {
      case "markdownContent":
        return ChatResponseMarkdownPart.to(part);
      case "inlineReference":
        return ChatResponseAnchorPart.to(part);
      case "progressMessage":
        return void 0;
      case "treeData":
        return ChatResponseFilesPart.to(part);
      case "command":
        return ChatResponseCommandButtonPart.to(part, commandsConverter);
    }
    return void 0;
  }
  __name(toContent, "toContent");
  ChatResponsePart2.toContent = toContent;
})(ChatResponsePart || (ChatResponsePart = {}));
var ChatAgentRequest;
(function(ChatAgentRequest2) {
  function to(request, location2, model, diagnostics, tools, extension, logService) {
    const toolReferences = [];
    const variableReferences = [];
    for (const v of request.variables.variables) {
      if (v.kind === "tool") {
        toolReferences.push(v);
      } else if (v.kind === "toolset") {
        toolReferences.push(...v.value);
      } else {
        variableReferences.push(v);
      }
    }
    const requestWithAllProps = {
      id: request.requestId,
      prompt: request.message,
      command: request.command,
      attempt: request.attempt ?? 0,
      enableCommandDetection: request.enableCommandDetection ?? true,
      isParticipantDetected: request.isParticipantDetected ?? false,
      references: variableReferences.map((v) => ChatPromptReference.to(v, diagnostics, logService)).filter(isDefined),
      toolReferences: toolReferences.map(ChatLanguageModelToolReference.to),
      location: ChatLocation.to(request.location),
      acceptedConfirmationData: request.acceptedConfirmationData,
      rejectedConfirmationData: request.rejectedConfirmationData,
      location2,
      toolInvocationToken: Object.freeze({ sessionId: request.sessionId }),
      tools,
      model,
      editedFileEvents: request.editedFileEvents,
      modeInstructions: request.modeInstructions
    };
    if (!isProposedApiEnabled(extension, "chatParticipantPrivate")) {
      delete requestWithAllProps.id;
      delete requestWithAllProps.attempt;
      delete requestWithAllProps.enableCommandDetection;
      delete requestWithAllProps.isParticipantDetected;
      delete requestWithAllProps.location;
      delete requestWithAllProps.location2;
      delete requestWithAllProps.editedFileEvents;
    }
    if (!isProposedApiEnabled(extension, "chatParticipantAdditions")) {
      delete requestWithAllProps.acceptedConfirmationData;
      delete requestWithAllProps.rejectedConfirmationData;
      delete requestWithAllProps.tools;
    }
    return requestWithAllProps;
  }
  __name(to, "to");
  ChatAgentRequest2.to = to;
})(ChatAgentRequest || (ChatAgentRequest = {}));
var ChatRequestDraft;
(function(ChatRequestDraft2) {
  function to(request) {
    return {
      prompt: request.prompt,
      files: request.files.map((uri) => URI.revive(uri))
    };
  }
  __name(to, "to");
  ChatRequestDraft2.to = to;
})(ChatRequestDraft || (ChatRequestDraft = {}));
var ChatLocation;
(function(ChatLocation2) {
  function to(loc) {
    switch (loc) {
      case ChatAgentLocation.Notebook:
        return types.ChatLocation.Notebook;
      case ChatAgentLocation.Terminal:
        return types.ChatLocation.Terminal;
      case ChatAgentLocation.Panel:
        return types.ChatLocation.Panel;
      case ChatAgentLocation.Editor:
        return types.ChatLocation.Editor;
    }
  }
  __name(to, "to");
  ChatLocation2.to = to;
  function from(loc) {
    switch (loc) {
      case types.ChatLocation.Notebook:
        return ChatAgentLocation.Notebook;
      case types.ChatLocation.Terminal:
        return ChatAgentLocation.Terminal;
      case types.ChatLocation.Panel:
        return ChatAgentLocation.Panel;
      case types.ChatLocation.Editor:
        return ChatAgentLocation.Editor;
    }
  }
  __name(from, "from");
  ChatLocation2.from = from;
})(ChatLocation || (ChatLocation = {}));
var ChatPromptReference;
(function(ChatPromptReference2) {
  function to(variable, diagnostics, logService) {
    let value = variable.value;
    if (!value) {
      let varStr;
      try {
        varStr = JSON.stringify(variable);
      } catch {
        varStr = `kind=${variable.kind}, id=${variable.id}, name=${variable.name}`;
      }
      logService.error(`[ChatPromptReference] Ignoring invalid reference in variable: ${varStr}`);
      return void 0;
    }
    if (isUriComponents(value)) {
      value = URI.revive(value);
    } else if (value && typeof value === "object" && "uri" in value && "range" in value && isUriComponents(value.uri)) {
      value = Location.to(revive(value));
    } else if (isImageVariableEntry(variable)) {
      const ref = variable.references?.[0]?.reference;
      value = new types.ChatReferenceBinaryData(variable.mimeType ?? "image/png", () => Promise.resolve(new Uint8Array(Object.values(variable.value))), ref && URI.isUri(ref) ? ref : void 0);
    } else if (variable.kind === "diagnostic") {
      const filterSeverity = variable.filterSeverity && DiagnosticSeverity.to(variable.filterSeverity);
      const filterUri = variable.filterUri && URI.revive(variable.filterUri).toString();
      value = new types.ChatReferenceDiagnostic(diagnostics.map(([uri, d]) => {
        if (variable.filterUri && uri.toString() !== filterUri) {
          return [uri, []];
        }
        return [uri, d.filter((d2) => {
          if (filterSeverity && d2.severity > filterSeverity) {
            return false;
          }
          if (variable.filterRange && !editorRange.Range.areIntersectingOrTouching(variable.filterRange, Range.from(d2.range))) {
            return false;
          }
          return true;
        })];
      }).filter(([, d]) => d.length > 0));
    }
    return {
      id: variable.id,
      name: variable.name,
      range: variable.range && [variable.range.start, variable.range.endExclusive],
      value,
      modelDescription: variable.modelDescription
    };
  }
  __name(to, "to");
  ChatPromptReference2.to = to;
})(ChatPromptReference || (ChatPromptReference = {}));
var ChatLanguageModelToolReference;
(function(ChatLanguageModelToolReference2) {
  function to(variable) {
    const value = variable.value;
    if (value) {
      throw new Error("Invalid tool reference");
    }
    return {
      name: variable.id,
      range: variable.range && [variable.range.start, variable.range.endExclusive]
    };
  }
  __name(to, "to");
  ChatLanguageModelToolReference2.to = to;
})(ChatLanguageModelToolReference || (ChatLanguageModelToolReference = {}));
var ChatAgentCompletionItem;
(function(ChatAgentCompletionItem2) {
  function from(item, commandsConverter, disposables) {
    return {
      id: item.id,
      label: item.label,
      fullName: item.fullName,
      icon: item.icon?.id,
      value: item.values[0].value,
      insertText: item.insertText,
      detail: item.detail,
      documentation: item.documentation,
      command: commandsConverter.toInternal(item.command, disposables)
    };
  }
  __name(from, "from");
  ChatAgentCompletionItem2.from = from;
})(ChatAgentCompletionItem || (ChatAgentCompletionItem = {}));
var ChatAgentResult;
(function(ChatAgentResult2) {
  function to(result) {
    return {
      errorDetails: result.errorDetails,
      metadata: reviveMetadata(result.metadata),
      nextQuestion: result.nextQuestion
    };
  }
  __name(to, "to");
  ChatAgentResult2.to = to;
  function from(result) {
    return {
      errorDetails: result.errorDetails,
      metadata: result.metadata,
      nextQuestion: result.nextQuestion
    };
  }
  __name(from, "from");
  ChatAgentResult2.from = from;
  function reviveMetadata(metadata) {
    return cloneAndChange(metadata, (value) => {
      if (value.$mid === 20) {
        return new types.LanguageModelToolResult(cloneAndChange(value.content, reviveMetadata));
      } else if (value.$mid === 21) {
        return new types.LanguageModelTextPart(value.value);
      } else if (value.$mid === 22) {
        return new types.LanguageModelPromptTsxPart(value.value);
      }
      return void 0;
    });
  }
  __name(reviveMetadata, "reviveMetadata");
})(ChatAgentResult || (ChatAgentResult = {}));
var ChatAgentUserActionEvent;
(function(ChatAgentUserActionEvent2) {
  function to(result, event, commandsConverter) {
    if (event.action.kind === "vote") {
      return;
    }
    const ehResult = ChatAgentResult.to(result);
    if (event.action.kind === "command") {
      const command = event.action.commandButton.command;
      const commandButton = {
        command: commandsConverter.fromInternal(command) ?? { command: command.id, title: command.title }
      };
      const commandAction = { kind: "command", commandButton };
      return { action: commandAction, result: ehResult };
    } else if (event.action.kind === "followUp") {
      const followupAction = { kind: "followUp", followup: ChatFollowup.to(event.action.followup) };
      return { action: followupAction, result: ehResult };
    } else if (event.action.kind === "inlineChat") {
      return { action: { kind: "editor", accepted: event.action.action === "accepted" }, result: ehResult };
    } else if (event.action.kind === "chatEditingSessionAction") {
      const outcomes = /* @__PURE__ */ new Map([
        ["accepted", types.ChatEditingSessionActionOutcome.Accepted],
        ["rejected", types.ChatEditingSessionActionOutcome.Rejected],
        ["saved", types.ChatEditingSessionActionOutcome.Saved]
      ]);
      return {
        action: {
          kind: "chatEditingSessionAction",
          outcome: outcomes.get(event.action.outcome) ?? types.ChatEditingSessionActionOutcome.Rejected,
          uri: URI.revive(event.action.uri),
          hasRemainingEdits: event.action.hasRemainingEdits
        },
        result: ehResult
      };
    } else {
      return { action: event.action, result: ehResult };
    }
  }
  __name(to, "to");
  ChatAgentUserActionEvent2.to = to;
})(ChatAgentUserActionEvent || (ChatAgentUserActionEvent = {}));
var TerminalQuickFix;
(function(TerminalQuickFix2) {
  function from(quickFix, converter, disposables) {
    if ("terminalCommand" in quickFix) {
      return { terminalCommand: quickFix.terminalCommand, shouldExecute: quickFix.shouldExecute };
    }
    if ("uri" in quickFix) {
      return { uri: quickFix.uri };
    }
    return converter.toInternal(quickFix, disposables);
  }
  __name(from, "from");
  TerminalQuickFix2.from = from;
})(TerminalQuickFix || (TerminalQuickFix = {}));
var TerminalCompletionItemDto;
(function(TerminalCompletionItemDto2) {
  function from(item) {
    return {
      ...item,
      documentation: MarkdownString.fromStrict(item.documentation)
    };
  }
  __name(from, "from");
  TerminalCompletionItemDto2.from = from;
})(TerminalCompletionItemDto || (TerminalCompletionItemDto = {}));
var TerminalCompletionList;
(function(TerminalCompletionList2) {
  function from(completions, pathSeparator) {
    if (Array.isArray(completions)) {
      return {
        items: completions.map((i) => TerminalCompletionItemDto.from(i))
      };
    }
    return {
      items: completions.items.map((i) => TerminalCompletionItemDto.from(i)),
      resourceRequestConfig: completions.resourceRequestConfig ? TerminalResourceRequestConfig.from(completions.resourceRequestConfig, pathSeparator) : void 0
    };
  }
  __name(from, "from");
  TerminalCompletionList2.from = from;
})(TerminalCompletionList || (TerminalCompletionList = {}));
var TerminalResourceRequestConfig;
(function(TerminalResourceRequestConfig2) {
  function from(resourceRequestConfig, pathSeparator) {
    return {
      ...resourceRequestConfig,
      pathSeparator,
      cwd: resourceRequestConfig.cwd
    };
  }
  __name(from, "from");
  TerminalResourceRequestConfig2.from = from;
})(TerminalResourceRequestConfig || (TerminalResourceRequestConfig = {}));
var PartialAcceptInfo;
(function(PartialAcceptInfo2) {
  function to(info) {
    return {
      kind: PartialAcceptTriggerKind.to(info.kind),
      acceptedLength: info.acceptedLength
    };
  }
  __name(to, "to");
  PartialAcceptInfo2.to = to;
})(PartialAcceptInfo || (PartialAcceptInfo = {}));
var PartialAcceptTriggerKind;
(function(PartialAcceptTriggerKind2) {
  function to(kind) {
    switch (kind) {
      case 0:
        return types.PartialAcceptTriggerKind.Word;
      case 1:
        return types.PartialAcceptTriggerKind.Line;
      case 2:
        return types.PartialAcceptTriggerKind.Suggest;
      default:
        return types.PartialAcceptTriggerKind.Unknown;
    }
  }
  __name(to, "to");
  PartialAcceptTriggerKind2.to = to;
})(PartialAcceptTriggerKind || (PartialAcceptTriggerKind = {}));
var InlineCompletionEndOfLifeReason;
(function(InlineCompletionEndOfLifeReason2) {
  function to(reason, convertFn) {
    if (reason.kind === languages.InlineCompletionEndOfLifeReasonKind.Ignored) {
      const supersededBy = reason.supersededBy ? convertFn(reason.supersededBy) : void 0;
      return {
        kind: types.InlineCompletionEndOfLifeReasonKind.Ignored,
        supersededBy,
        userTypingDisagreed: reason.userTypingDisagreed
      };
    } else if (reason.kind === languages.InlineCompletionEndOfLifeReasonKind.Accepted) {
      return {
        kind: types.InlineCompletionEndOfLifeReasonKind.Accepted
      };
    }
    return {
      kind: types.InlineCompletionEndOfLifeReasonKind.Rejected
    };
  }
  __name(to, "to");
  InlineCompletionEndOfLifeReason2.to = to;
})(InlineCompletionEndOfLifeReason || (InlineCompletionEndOfLifeReason = {}));
var DebugTreeItem;
(function(DebugTreeItem2) {
  function from(item, id) {
    return {
      id,
      label: item.label,
      description: item.description,
      canEdit: item.canEdit,
      collapsibleState: item.collapsibleState || 0,
      contextValue: item.contextValue
    };
  }
  __name(from, "from");
  DebugTreeItem2.from = from;
})(DebugTreeItem || (DebugTreeItem = {}));
var LanguageModelToolDescription;
(function(LanguageModelToolDescription2) {
  function to(item) {
    return {
      // Note- the reason this is a unique 'name' is just to avoid confusion with the toolCallId
      name: item.id,
      description: item.modelDescription,
      inputSchema: item.inputSchema,
      tags: item.tags ?? []
    };
  }
  __name(to, "to");
  LanguageModelToolDescription2.to = to;
})(LanguageModelToolDescription || (LanguageModelToolDescription = {}));
var LanguageModelToolResult;
(function(LanguageModelToolResult3) {
  function to(result) {
    return new types.LanguageModelToolResult(result.content.map((item) => {
      if (item.kind === "text") {
        return new types.LanguageModelTextPart(item.value);
      } else {
        return new types.LanguageModelPromptTsxPart(item.value);
      }
    }));
  }
  __name(to, "to");
  LanguageModelToolResult3.to = to;
  function from(result, extension) {
    if (result.toolResultMessage) {
      checkProposedApiEnabled(extension, "chatParticipantPrivate");
    }
    return {
      content: result.content.map((item) => {
        if (item instanceof types.LanguageModelTextPart) {
          return {
            kind: "text",
            value: item.value
          };
        } else if (item instanceof types.LanguageModelPromptTsxPart) {
          return {
            kind: "promptTsx",
            value: item.value
          };
        } else {
          throw new Error("Unknown LanguageModelToolResult part type");
        }
      }),
      toolResultMessage: MarkdownString.fromStrict(result.toolResultMessage),
      toolResultDetails: result.toolResultDetails?.map((detail) => URI.isUri(detail) ? detail : Location.from(detail))
    };
  }
  __name(from, "from");
  LanguageModelToolResult3.from = from;
})(LanguageModelToolResult || (LanguageModelToolResult = {}));
var LanguageModelToolResult2;
(function(LanguageModelToolResult22) {
  function to(result) {
    return new types.LanguageModelToolResult2(result.content.map((item) => {
      if (item.kind === "text") {
        return new types.LanguageModelTextPart(item.value);
      } else if (item.kind === "data") {
        const mimeType = Object.values(types.ChatImageMimeType).includes(item.value.mimeType) ? item.value.mimeType : void 0;
        if (!mimeType) {
          throw new Error("Invalid MIME type");
        }
        return new types.LanguageModelDataPart(item.value.data.buffer, mimeType);
      } else {
        return new types.LanguageModelPromptTsxPart(item.value);
      }
    }));
  }
  __name(to, "to");
  LanguageModelToolResult22.to = to;
  function from(result, extension) {
    if (result.toolResultMessage) {
      checkProposedApiEnabled(extension, "chatParticipantPrivate");
    }
    let hasBuffers = false;
    const dto = {
      content: result.content.map((item) => {
        if (item instanceof types.LanguageModelTextPart) {
          return {
            kind: "text",
            value: item.value
          };
        } else if (item instanceof types.LanguageModelPromptTsxPart) {
          return {
            kind: "promptTsx",
            value: item.value
          };
        } else if (item instanceof types.LanguageModelDataPart) {
          hasBuffers = true;
          return {
            kind: "data",
            value: {
              mimeType: item.mimeType,
              data: VSBuffer.wrap(item.data)
            }
          };
        } else {
          throw new Error("Unknown LanguageModelToolResult part type");
        }
      }),
      toolResultMessage: MarkdownString.fromStrict(result.toolResultMessage),
      toolResultDetails: result.toolResultDetails?.map((detail) => URI.isUri(detail) ? detail : Location.from(detail))
    };
    return hasBuffers ? new SerializableObjectWithBuffers(dto) : dto;
  }
  __name(from, "from");
  LanguageModelToolResult22.from = from;
})(LanguageModelToolResult2 || (LanguageModelToolResult2 = {}));
var IconPath;
(function(IconPath2) {
  function fromThemeIcon(iconPath) {
    return iconPath;
  }
  __name(fromThemeIcon, "fromThemeIcon");
  IconPath2.fromThemeIcon = fromThemeIcon;
})(IconPath || (IconPath = {}));
var AiSettingsSearch;
(function(AiSettingsSearch2) {
  function fromSettingsSearchResult(result) {
    return {
      query: result.query,
      kind: fromSettingsSearchResultKind(result.kind),
      settings: result.settings
    };
  }
  __name(fromSettingsSearchResult, "fromSettingsSearchResult");
  AiSettingsSearch2.fromSettingsSearchResult = fromSettingsSearchResult;
  function fromSettingsSearchResultKind(kind) {
    switch (kind) {
      case AiSettingsSearchResultKind.EMBEDDED:
        return AiSettingsSearchResultKind.EMBEDDED;
      case AiSettingsSearchResultKind.LLM_RANKED:
        return AiSettingsSearchResultKind.LLM_RANKED;
      case AiSettingsSearchResultKind.CANCELED:
        return AiSettingsSearchResultKind.CANCELED;
      default:
        throw new Error("Unknown AiSettingsSearchResultKind");
    }
  }
  __name(fromSettingsSearchResultKind, "fromSettingsSearchResultKind");
})(AiSettingsSearch || (AiSettingsSearch = {}));
var McpServerDefinition;
(function(McpServerDefinition2) {
  function isHttpConfig(candidate) {
    return !!candidate.uri;
  }
  __name(isHttpConfig, "isHttpConfig");
  function from(item) {
    return McpServerLaunch.toSerialized(isHttpConfig(item) ? {
      type: 2,
      uri: item.uri,
      headers: Object.entries(item.headers)
    } : {
      type: 1,
      cwd: item.cwd?.fsPath,
      args: item.args,
      command: item.command,
      env: item.env,
      envFile: void 0
    });
  }
  __name(from, "from");
  McpServerDefinition2.from = from;
})(McpServerDefinition || (McpServerDefinition = {}));
export {
  AiSettingsSearch,
  CallHierarchyIncomingCall,
  CallHierarchyItem,
  CallHierarchyOutgoingCall,
  ChatAgentCompletionItem,
  ChatAgentRequest,
  ChatAgentResult,
  ChatAgentUserActionEvent,
  ChatFollowup,
  ChatLanguageModelToolReference,
  ChatLocation,
  ChatPrepareToolInvocationPart,
  ChatPromptReference,
  ChatRequestDraft,
  ChatResponseAnchorPart,
  ChatResponseCodeCitationPart,
  ChatResponseCodeblockUriPart,
  ChatResponseCommandButtonPart,
  ChatResponseConfirmationPart,
  ChatResponseExtensionsPart,
  ChatResponseFilesPart,
  ChatResponseMarkdownPart,
  ChatResponseMarkdownWithVulnerabilitiesPart,
  ChatResponseMovePart,
  ChatResponseNotebookEditPart,
  ChatResponsePart,
  ChatResponseProgressPart,
  ChatResponseReferencePart,
  ChatResponseTextEditPart,
  ChatResponseWarningPart,
  ChatTask,
  ChatTaskResult,
  CodeActionTriggerKind,
  Color,
  ColorPresentation,
  CompletionCommand,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionItemTag,
  CompletionTriggerKind,
  DataTransfer,
  DataTransferItem,
  DebugTreeItem,
  DecorationRangeBehavior,
  DecorationRenderOptions,
  DefinitionLink,
  Diagnostic,
  DiagnosticRelatedInformation,
  DiagnosticSeverity,
  DiagnosticTag,
  DocumentHighlight,
  DocumentLink,
  DocumentSelector,
  DocumentSymbol,
  EndOfLine,
  EvaluatableExpression,
  FoldingRange,
  FoldingRangeKind,
  GlobPattern,
  Hover,
  IconPath,
  InlayHint,
  InlayHintKind,
  InlayHintLabelPart,
  InlineCompletionEndOfLifeReason,
  InlineValue,
  InlineValueContext,
  LanguageModelChatMessage,
  LanguageModelChatMessage2,
  LanguageModelChatMessageRole,
  LanguageModelToolDescription,
  LanguageModelToolResult,
  LanguageModelToolResult2,
  LanguageSelector,
  Location,
  MarkdownString,
  McpServerDefinition,
  MultiDocumentHighlight,
  NotebookCellData,
  NotebookCellExecutionSummary,
  NotebookCellKind,
  NotebookCellOutput,
  NotebookCellOutputItem,
  NotebookData,
  NotebookDocumentContentOptions,
  NotebookEdit,
  NotebookExclusiveDocumentPattern,
  NotebookKernelSourceAction,
  NotebookRange,
  NotebookRendererScript,
  NotebookStatusBarItem,
  ParameterInformation,
  PartialAcceptInfo,
  PartialAcceptTriggerKind,
  Position,
  ProgressLocation,
  Range,
  Selection,
  SelectionRange,
  SignatureHelp,
  SignatureInformation,
  SymbolKind,
  SymbolTag,
  TerminalCompletionItemDto,
  TerminalCompletionList,
  TerminalQuickFix,
  TerminalResourceRequestConfig,
  TestCoverage,
  TestItem,
  TestMessage,
  TestResults,
  TestRunProfile,
  TestRunProfileKind,
  TestTag,
  TextDocumentSaveReason,
  TextEdit,
  TextEditorLineNumbersStyle,
  TextEditorOpenOptions,
  ThemableDecorationAttachmentRenderOptions,
  ThemableDecorationRenderOptions,
  TokenType,
  TypeHierarchyItem,
  ViewBadge,
  ViewColumn,
  WorkspaceEdit,
  WorkspaceSymbol,
  fromRangeOrRangeWithMessage,
  isDecorationOptionsArr,
  location,
  pathOrURIToURI
};
//# sourceMappingURL=extHostTypeConverters.js.map
