var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../base/common/codicons.js";
import { URI } from "../../base/common/uri.js";
import { EditOperation } from "./core/editOperation.js";
import { Range } from "./core/range.js";
import { TokenizationRegistry as TokenizationRegistryImpl } from "./tokenizationRegistry.js";
import { localize } from "../../nls.js";
class Token {
  static {
    __name(this, "Token");
  }
  constructor(offset, type, language) {
    this.offset = offset;
    this.type = type;
    this.language = language;
    this._tokenBrand = void 0;
  }
  toString() {
    return "(" + this.offset + ", " + this.type + ")";
  }
}
class TokenizationResult {
  static {
    __name(this, "TokenizationResult");
  }
  constructor(tokens, endState) {
    this.tokens = tokens;
    this.endState = endState;
    this._tokenizationResultBrand = void 0;
  }
}
class EncodedTokenizationResult {
  static {
    __name(this, "EncodedTokenizationResult");
  }
  constructor(tokens, fontInfo, endState) {
    this.tokens = tokens;
    this.fontInfo = fontInfo;
    this.endState = endState;
    this._encodedTokenizationResultBrand = void 0;
  }
}
var HoverVerbosityAction;
(function(HoverVerbosityAction2) {
  HoverVerbosityAction2[HoverVerbosityAction2["Increase"] = 0] = "Increase";
  HoverVerbosityAction2[HoverVerbosityAction2["Decrease"] = 1] = "Decrease";
})(HoverVerbosityAction || (HoverVerbosityAction = {}));
var CompletionItemKind;
(function(CompletionItemKind2) {
  CompletionItemKind2[CompletionItemKind2["Method"] = 0] = "Method";
  CompletionItemKind2[CompletionItemKind2["Function"] = 1] = "Function";
  CompletionItemKind2[CompletionItemKind2["Constructor"] = 2] = "Constructor";
  CompletionItemKind2[CompletionItemKind2["Field"] = 3] = "Field";
  CompletionItemKind2[CompletionItemKind2["Variable"] = 4] = "Variable";
  CompletionItemKind2[CompletionItemKind2["Class"] = 5] = "Class";
  CompletionItemKind2[CompletionItemKind2["Struct"] = 6] = "Struct";
  CompletionItemKind2[CompletionItemKind2["Interface"] = 7] = "Interface";
  CompletionItemKind2[CompletionItemKind2["Module"] = 8] = "Module";
  CompletionItemKind2[CompletionItemKind2["Property"] = 9] = "Property";
  CompletionItemKind2[CompletionItemKind2["Event"] = 10] = "Event";
  CompletionItemKind2[CompletionItemKind2["Operator"] = 11] = "Operator";
  CompletionItemKind2[CompletionItemKind2["Unit"] = 12] = "Unit";
  CompletionItemKind2[CompletionItemKind2["Value"] = 13] = "Value";
  CompletionItemKind2[CompletionItemKind2["Constant"] = 14] = "Constant";
  CompletionItemKind2[CompletionItemKind2["Enum"] = 15] = "Enum";
  CompletionItemKind2[CompletionItemKind2["EnumMember"] = 16] = "EnumMember";
  CompletionItemKind2[CompletionItemKind2["Keyword"] = 17] = "Keyword";
  CompletionItemKind2[CompletionItemKind2["Text"] = 18] = "Text";
  CompletionItemKind2[CompletionItemKind2["Color"] = 19] = "Color";
  CompletionItemKind2[CompletionItemKind2["File"] = 20] = "File";
  CompletionItemKind2[CompletionItemKind2["Reference"] = 21] = "Reference";
  CompletionItemKind2[CompletionItemKind2["Customcolor"] = 22] = "Customcolor";
  CompletionItemKind2[CompletionItemKind2["Folder"] = 23] = "Folder";
  CompletionItemKind2[CompletionItemKind2["TypeParameter"] = 24] = "TypeParameter";
  CompletionItemKind2[CompletionItemKind2["User"] = 25] = "User";
  CompletionItemKind2[CompletionItemKind2["Issue"] = 26] = "Issue";
  CompletionItemKind2[CompletionItemKind2["Tool"] = 27] = "Tool";
  CompletionItemKind2[CompletionItemKind2["Snippet"] = 28] = "Snippet";
})(CompletionItemKind || (CompletionItemKind = {}));
var CompletionItemKinds;
(function(CompletionItemKinds2) {
  const byKind = /* @__PURE__ */ new Map();
  byKind.set(0, Codicon.symbolMethod);
  byKind.set(1, Codicon.symbolFunction);
  byKind.set(2, Codicon.symbolConstructor);
  byKind.set(3, Codicon.symbolField);
  byKind.set(4, Codicon.symbolVariable);
  byKind.set(5, Codicon.symbolClass);
  byKind.set(6, Codicon.symbolStruct);
  byKind.set(7, Codicon.symbolInterface);
  byKind.set(8, Codicon.symbolModule);
  byKind.set(9, Codicon.symbolProperty);
  byKind.set(10, Codicon.symbolEvent);
  byKind.set(11, Codicon.symbolOperator);
  byKind.set(12, Codicon.symbolUnit);
  byKind.set(13, Codicon.symbolValue);
  byKind.set(15, Codicon.symbolEnum);
  byKind.set(14, Codicon.symbolConstant);
  byKind.set(15, Codicon.symbolEnum);
  byKind.set(16, Codicon.symbolEnumMember);
  byKind.set(17, Codicon.symbolKeyword);
  byKind.set(28, Codicon.symbolSnippet);
  byKind.set(18, Codicon.symbolText);
  byKind.set(19, Codicon.symbolColor);
  byKind.set(20, Codicon.symbolFile);
  byKind.set(21, Codicon.symbolReference);
  byKind.set(22, Codicon.symbolCustomColor);
  byKind.set(23, Codicon.symbolFolder);
  byKind.set(24, Codicon.symbolTypeParameter);
  byKind.set(25, Codicon.account);
  byKind.set(26, Codicon.issues);
  byKind.set(27, Codicon.tools);
  function toIcon(kind) {
    let codicon = byKind.get(kind);
    if (!codicon) {
      console.info("No codicon found for CompletionItemKind " + kind);
      codicon = Codicon.symbolProperty;
    }
    return codicon;
  }
  __name(toIcon, "toIcon");
  CompletionItemKinds2.toIcon = toIcon;
  function toLabel(kind) {
    switch (kind) {
      case 0:
        return localize("suggestWidget.kind.method", "Method");
      case 1:
        return localize("suggestWidget.kind.function", "Function");
      case 2:
        return localize("suggestWidget.kind.constructor", "Constructor");
      case 3:
        return localize("suggestWidget.kind.field", "Field");
      case 4:
        return localize("suggestWidget.kind.variable", "Variable");
      case 5:
        return localize("suggestWidget.kind.class", "Class");
      case 6:
        return localize("suggestWidget.kind.struct", "Struct");
      case 7:
        return localize("suggestWidget.kind.interface", "Interface");
      case 8:
        return localize("suggestWidget.kind.module", "Module");
      case 9:
        return localize("suggestWidget.kind.property", "Property");
      case 10:
        return localize("suggestWidget.kind.event", "Event");
      case 11:
        return localize("suggestWidget.kind.operator", "Operator");
      case 12:
        return localize("suggestWidget.kind.unit", "Unit");
      case 13:
        return localize("suggestWidget.kind.value", "Value");
      case 14:
        return localize("suggestWidget.kind.constant", "Constant");
      case 15:
        return localize("suggestWidget.kind.enum", "Enum");
      case 16:
        return localize("suggestWidget.kind.enumMember", "Enum Member");
      case 17:
        return localize("suggestWidget.kind.keyword", "Keyword");
      case 18:
        return localize("suggestWidget.kind.text", "Text");
      case 19:
        return localize("suggestWidget.kind.color", "Color");
      case 20:
        return localize("suggestWidget.kind.file", "File");
      case 21:
        return localize("suggestWidget.kind.reference", "Reference");
      case 22:
        return localize("suggestWidget.kind.customcolor", "Custom Color");
      case 23:
        return localize("suggestWidget.kind.folder", "Folder");
      case 24:
        return localize("suggestWidget.kind.typeParameter", "Type Parameter");
      case 25:
        return localize("suggestWidget.kind.user", "User");
      case 26:
        return localize("suggestWidget.kind.issue", "Issue");
      case 27:
        return localize("suggestWidget.kind.tool", "Tool");
      case 28:
        return localize("suggestWidget.kind.snippet", "Snippet");
      default:
        return "";
    }
  }
  __name(toLabel, "toLabel");
  CompletionItemKinds2.toLabel = toLabel;
  const data = /* @__PURE__ */ new Map();
  data.set(
    "method",
    0
    /* CompletionItemKind.Method */
  );
  data.set(
    "function",
    1
    /* CompletionItemKind.Function */
  );
  data.set(
    "constructor",
    2
    /* CompletionItemKind.Constructor */
  );
  data.set(
    "field",
    3
    /* CompletionItemKind.Field */
  );
  data.set(
    "variable",
    4
    /* CompletionItemKind.Variable */
  );
  data.set(
    "class",
    5
    /* CompletionItemKind.Class */
  );
  data.set(
    "struct",
    6
    /* CompletionItemKind.Struct */
  );
  data.set(
    "interface",
    7
    /* CompletionItemKind.Interface */
  );
  data.set(
    "module",
    8
    /* CompletionItemKind.Module */
  );
  data.set(
    "property",
    9
    /* CompletionItemKind.Property */
  );
  data.set(
    "event",
    10
    /* CompletionItemKind.Event */
  );
  data.set(
    "operator",
    11
    /* CompletionItemKind.Operator */
  );
  data.set(
    "unit",
    12
    /* CompletionItemKind.Unit */
  );
  data.set(
    "value",
    13
    /* CompletionItemKind.Value */
  );
  data.set(
    "constant",
    14
    /* CompletionItemKind.Constant */
  );
  data.set(
    "enum",
    15
    /* CompletionItemKind.Enum */
  );
  data.set(
    "enum-member",
    16
    /* CompletionItemKind.EnumMember */
  );
  data.set(
    "enumMember",
    16
    /* CompletionItemKind.EnumMember */
  );
  data.set(
    "keyword",
    17
    /* CompletionItemKind.Keyword */
  );
  data.set(
    "snippet",
    28
    /* CompletionItemKind.Snippet */
  );
  data.set(
    "text",
    18
    /* CompletionItemKind.Text */
  );
  data.set(
    "color",
    19
    /* CompletionItemKind.Color */
  );
  data.set(
    "file",
    20
    /* CompletionItemKind.File */
  );
  data.set(
    "reference",
    21
    /* CompletionItemKind.Reference */
  );
  data.set(
    "customcolor",
    22
    /* CompletionItemKind.Customcolor */
  );
  data.set(
    "folder",
    23
    /* CompletionItemKind.Folder */
  );
  data.set(
    "type-parameter",
    24
    /* CompletionItemKind.TypeParameter */
  );
  data.set(
    "typeParameter",
    24
    /* CompletionItemKind.TypeParameter */
  );
  data.set(
    "account",
    25
    /* CompletionItemKind.User */
  );
  data.set(
    "issue",
    26
    /* CompletionItemKind.Issue */
  );
  data.set(
    "tool",
    27
    /* CompletionItemKind.Tool */
  );
  function fromString(value, strict) {
    let res = data.get(value);
    if (typeof res === "undefined" && !strict) {
      res = 9;
    }
    return res;
  }
  __name(fromString, "fromString");
  CompletionItemKinds2.fromString = fromString;
})(CompletionItemKinds || (CompletionItemKinds = {}));
var CompletionItemTag;
(function(CompletionItemTag2) {
  CompletionItemTag2[CompletionItemTag2["Deprecated"] = 1] = "Deprecated";
})(CompletionItemTag || (CompletionItemTag = {}));
var CompletionItemInsertTextRule;
(function(CompletionItemInsertTextRule2) {
  CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["None"] = 0] = "None";
  CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["KeepWhitespace"] = 1] = "KeepWhitespace";
  CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["InsertAsSnippet"] = 4] = "InsertAsSnippet";
})(CompletionItemInsertTextRule || (CompletionItemInsertTextRule = {}));
var PartialAcceptTriggerKind;
(function(PartialAcceptTriggerKind2) {
  PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Word"] = 0] = "Word";
  PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Line"] = 1] = "Line";
  PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Suggest"] = 2] = "Suggest";
})(PartialAcceptTriggerKind || (PartialAcceptTriggerKind = {}));
var CompletionTriggerKind;
(function(CompletionTriggerKind2) {
  CompletionTriggerKind2[CompletionTriggerKind2["Invoke"] = 0] = "Invoke";
  CompletionTriggerKind2[CompletionTriggerKind2["TriggerCharacter"] = 1] = "TriggerCharacter";
  CompletionTriggerKind2[CompletionTriggerKind2["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
})(CompletionTriggerKind || (CompletionTriggerKind = {}));
var InlineCompletionTriggerKind;
(function(InlineCompletionTriggerKind2) {
  InlineCompletionTriggerKind2[InlineCompletionTriggerKind2["Automatic"] = 0] = "Automatic";
  InlineCompletionTriggerKind2[InlineCompletionTriggerKind2["Explicit"] = 1] = "Explicit";
})(InlineCompletionTriggerKind || (InlineCompletionTriggerKind = {}));
class SelectedSuggestionInfo {
  static {
    __name(this, "SelectedSuggestionInfo");
  }
  constructor(range, text, completionKind, isSnippetText) {
    this.range = range;
    this.text = text;
    this.completionKind = completionKind;
    this.isSnippetText = isSnippetText;
  }
  equals(other) {
    return Range.lift(this.range).equalsRange(other.range) && this.text === other.text && this.completionKind === other.completionKind && this.isSnippetText === other.isSnippetText;
  }
}
var InlineCompletionHintStyle;
(function(InlineCompletionHintStyle2) {
  InlineCompletionHintStyle2[InlineCompletionHintStyle2["Code"] = 1] = "Code";
  InlineCompletionHintStyle2[InlineCompletionHintStyle2["Label"] = 2] = "Label";
})(InlineCompletionHintStyle || (InlineCompletionHintStyle = {}));
class ProviderId {
  static {
    __name(this, "ProviderId");
  }
  static fromExtensionId(extensionId) {
    return new ProviderId(extensionId, void 0, void 0);
  }
  constructor(extensionId, extensionVersion, providerId) {
    this.extensionId = extensionId;
    this.extensionVersion = extensionVersion;
    this.providerId = providerId;
  }
  toString() {
    let result = "";
    if (this.extensionId) {
      result += this.extensionId;
    }
    if (this.extensionVersion) {
      result += `@${this.extensionVersion}`;
    }
    if (this.providerId) {
      result += `:${this.providerId}`;
    }
    if (result.length === 0) {
      result = "unknown";
    }
    return result;
  }
  toStringWithoutVersion() {
    let result = "";
    if (this.extensionId) {
      result += this.extensionId;
    }
    if (this.providerId) {
      result += `:${this.providerId}`;
    }
    return result;
  }
}
class VersionedExtensionId {
  static {
    __name(this, "VersionedExtensionId");
  }
  static tryCreate(extensionId, version) {
    if (!extensionId || !version) {
      return void 0;
    }
    return new VersionedExtensionId(extensionId, version);
  }
  constructor(extensionId, version) {
    this.extensionId = extensionId;
    this.version = version;
  }
  toString() {
    return `${this.extensionId}@${this.version}`;
  }
}
var InlineCompletionEndOfLifeReasonKind;
(function(InlineCompletionEndOfLifeReasonKind2) {
  InlineCompletionEndOfLifeReasonKind2[InlineCompletionEndOfLifeReasonKind2["Accepted"] = 0] = "Accepted";
  InlineCompletionEndOfLifeReasonKind2[InlineCompletionEndOfLifeReasonKind2["Rejected"] = 1] = "Rejected";
  InlineCompletionEndOfLifeReasonKind2[InlineCompletionEndOfLifeReasonKind2["Ignored"] = 2] = "Ignored";
})(InlineCompletionEndOfLifeReasonKind || (InlineCompletionEndOfLifeReasonKind = {}));
var CodeActionTriggerType;
(function(CodeActionTriggerType2) {
  CodeActionTriggerType2[CodeActionTriggerType2["Invoke"] = 1] = "Invoke";
  CodeActionTriggerType2[CodeActionTriggerType2["Auto"] = 2] = "Auto";
})(CodeActionTriggerType || (CodeActionTriggerType = {}));
var DocumentPasteTriggerKind;
(function(DocumentPasteTriggerKind2) {
  DocumentPasteTriggerKind2[DocumentPasteTriggerKind2["Automatic"] = 0] = "Automatic";
  DocumentPasteTriggerKind2[DocumentPasteTriggerKind2["PasteAs"] = 1] = "PasteAs";
})(DocumentPasteTriggerKind || (DocumentPasteTriggerKind = {}));
var SignatureHelpTriggerKind;
(function(SignatureHelpTriggerKind2) {
  SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["Invoke"] = 1] = "Invoke";
  SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["TriggerCharacter"] = 2] = "TriggerCharacter";
  SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["ContentChange"] = 3] = "ContentChange";
})(SignatureHelpTriggerKind || (SignatureHelpTriggerKind = {}));
var DocumentHighlightKind;
(function(DocumentHighlightKind2) {
  DocumentHighlightKind2[DocumentHighlightKind2["Text"] = 0] = "Text";
  DocumentHighlightKind2[DocumentHighlightKind2["Read"] = 1] = "Read";
  DocumentHighlightKind2[DocumentHighlightKind2["Write"] = 2] = "Write";
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
function isLocationLink(thing) {
  return !!thing && URI.isUri(thing.uri) && Range.isIRange(thing.range) && (Range.isIRange(thing.originSelectionRange) || Range.isIRange(thing.targetSelectionRange));
}
__name(isLocationLink, "isLocationLink");
function isLocation(thing) {
  return !!thing && URI.isUri(thing.uri) && Range.isIRange(thing.range);
}
__name(isLocation, "isLocation");
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
const symbolKindNames = {
  [
    17
    /* SymbolKind.Array */
  ]: localize("Array", "array"),
  [
    16
    /* SymbolKind.Boolean */
  ]: localize("Boolean", "boolean"),
  [
    4
    /* SymbolKind.Class */
  ]: localize("Class", "class"),
  [
    13
    /* SymbolKind.Constant */
  ]: localize("Constant", "constant"),
  [
    8
    /* SymbolKind.Constructor */
  ]: localize("Constructor", "constructor"),
  [
    9
    /* SymbolKind.Enum */
  ]: localize("Enum", "enumeration"),
  [
    21
    /* SymbolKind.EnumMember */
  ]: localize("EnumMember", "enumeration member"),
  [
    23
    /* SymbolKind.Event */
  ]: localize("Event", "event"),
  [
    7
    /* SymbolKind.Field */
  ]: localize("Field", "field"),
  [
    0
    /* SymbolKind.File */
  ]: localize("File", "file"),
  [
    11
    /* SymbolKind.Function */
  ]: localize("Function", "function"),
  [
    10
    /* SymbolKind.Interface */
  ]: localize("Interface", "interface"),
  [
    19
    /* SymbolKind.Key */
  ]: localize("Key", "key"),
  [
    5
    /* SymbolKind.Method */
  ]: localize("Method", "method"),
  [
    1
    /* SymbolKind.Module */
  ]: localize("Module", "module"),
  [
    2
    /* SymbolKind.Namespace */
  ]: localize("Namespace", "namespace"),
  [
    20
    /* SymbolKind.Null */
  ]: localize("Null", "null"),
  [
    15
    /* SymbolKind.Number */
  ]: localize("Number", "number"),
  [
    18
    /* SymbolKind.Object */
  ]: localize("Object", "object"),
  [
    24
    /* SymbolKind.Operator */
  ]: localize("Operator", "operator"),
  [
    3
    /* SymbolKind.Package */
  ]: localize("Package", "package"),
  [
    6
    /* SymbolKind.Property */
  ]: localize("Property", "property"),
  [
    14
    /* SymbolKind.String */
  ]: localize("String", "string"),
  [
    22
    /* SymbolKind.Struct */
  ]: localize("Struct", "struct"),
  [
    25
    /* SymbolKind.TypeParameter */
  ]: localize("TypeParameter", "type parameter"),
  [
    12
    /* SymbolKind.Variable */
  ]: localize("Variable", "variable")
};
function getAriaLabelForSymbol(symbolName, kind) {
  return localize("symbolAriaLabel", "{0} ({1})", symbolName, symbolKindNames[kind]);
}
__name(getAriaLabelForSymbol, "getAriaLabelForSymbol");
var SymbolTag;
(function(SymbolTag2) {
  SymbolTag2[SymbolTag2["Deprecated"] = 1] = "Deprecated";
})(SymbolTag || (SymbolTag = {}));
var SymbolKinds;
(function(SymbolKinds2) {
  const byKind = /* @__PURE__ */ new Map();
  byKind.set(0, Codicon.symbolFile);
  byKind.set(1, Codicon.symbolModule);
  byKind.set(2, Codicon.symbolNamespace);
  byKind.set(3, Codicon.symbolPackage);
  byKind.set(4, Codicon.symbolClass);
  byKind.set(5, Codicon.symbolMethod);
  byKind.set(6, Codicon.symbolProperty);
  byKind.set(7, Codicon.symbolField);
  byKind.set(8, Codicon.symbolConstructor);
  byKind.set(9, Codicon.symbolEnum);
  byKind.set(10, Codicon.symbolInterface);
  byKind.set(11, Codicon.symbolFunction);
  byKind.set(12, Codicon.symbolVariable);
  byKind.set(13, Codicon.symbolConstant);
  byKind.set(14, Codicon.symbolString);
  byKind.set(15, Codicon.symbolNumber);
  byKind.set(16, Codicon.symbolBoolean);
  byKind.set(17, Codicon.symbolArray);
  byKind.set(18, Codicon.symbolObject);
  byKind.set(19, Codicon.symbolKey);
  byKind.set(20, Codicon.symbolNull);
  byKind.set(21, Codicon.symbolEnumMember);
  byKind.set(22, Codicon.symbolStruct);
  byKind.set(23, Codicon.symbolEvent);
  byKind.set(24, Codicon.symbolOperator);
  byKind.set(25, Codicon.symbolTypeParameter);
  function toIcon(kind) {
    let icon = byKind.get(kind);
    if (!icon) {
      console.info("No codicon found for SymbolKind " + kind);
      icon = Codicon.symbolProperty;
    }
    return icon;
  }
  __name(toIcon, "toIcon");
  SymbolKinds2.toIcon = toIcon;
  const byCompletionKind = /* @__PURE__ */ new Map();
  byCompletionKind.set(
    0,
    20
    /* CompletionItemKind.File */
  );
  byCompletionKind.set(
    1,
    8
    /* CompletionItemKind.Module */
  );
  byCompletionKind.set(
    2,
    8
    /* CompletionItemKind.Module */
  );
  byCompletionKind.set(
    3,
    8
    /* CompletionItemKind.Module */
  );
  byCompletionKind.set(
    4,
    5
    /* CompletionItemKind.Class */
  );
  byCompletionKind.set(
    5,
    0
    /* CompletionItemKind.Method */
  );
  byCompletionKind.set(
    6,
    9
    /* CompletionItemKind.Property */
  );
  byCompletionKind.set(
    7,
    3
    /* CompletionItemKind.Field */
  );
  byCompletionKind.set(
    8,
    2
    /* CompletionItemKind.Constructor */
  );
  byCompletionKind.set(
    9,
    15
    /* CompletionItemKind.Enum */
  );
  byCompletionKind.set(
    10,
    7
    /* CompletionItemKind.Interface */
  );
  byCompletionKind.set(
    11,
    1
    /* CompletionItemKind.Function */
  );
  byCompletionKind.set(
    12,
    4
    /* CompletionItemKind.Variable */
  );
  byCompletionKind.set(
    13,
    14
    /* CompletionItemKind.Constant */
  );
  byCompletionKind.set(
    14,
    18
    /* CompletionItemKind.Text */
  );
  byCompletionKind.set(
    15,
    13
    /* CompletionItemKind.Value */
  );
  byCompletionKind.set(
    16,
    13
    /* CompletionItemKind.Value */
  );
  byCompletionKind.set(
    17,
    13
    /* CompletionItemKind.Value */
  );
  byCompletionKind.set(
    18,
    13
    /* CompletionItemKind.Value */
  );
  byCompletionKind.set(
    19,
    17
    /* CompletionItemKind.Keyword */
  );
  byCompletionKind.set(
    20,
    13
    /* CompletionItemKind.Value */
  );
  byCompletionKind.set(
    21,
    16
    /* CompletionItemKind.EnumMember */
  );
  byCompletionKind.set(
    22,
    6
    /* CompletionItemKind.Struct */
  );
  byCompletionKind.set(
    23,
    10
    /* CompletionItemKind.Event */
  );
  byCompletionKind.set(
    24,
    11
    /* CompletionItemKind.Operator */
  );
  byCompletionKind.set(
    25,
    24
    /* CompletionItemKind.TypeParameter */
  );
  function toCompletionKind(kind) {
    let completionKind = byCompletionKind.get(kind);
    if (completionKind === void 0) {
      console.info("No completion kind found for SymbolKind " + kind);
      completionKind = 20;
    }
    return completionKind;
  }
  __name(toCompletionKind, "toCompletionKind");
  SymbolKinds2.toCompletionKind = toCompletionKind;
})(SymbolKinds || (SymbolKinds = {}));
class TextEdit {
  static {
    __name(this, "TextEdit");
  }
  static asEditOperation(edit) {
    const range = Range.lift(edit.range);
    return range.isEmpty() ? EditOperation.insert(range.getStartPosition(), edit.text) : EditOperation.replace(range, edit.text);
  }
  static isTextEdit(thing) {
    const possibleTextEdit = thing;
    return typeof possibleTextEdit.text === "string" && Range.isIRange(possibleTextEdit.range);
  }
}
class FoldingRangeKind {
  static {
    __name(this, "FoldingRangeKind");
  }
  static {
    this.Comment = new FoldingRangeKind("comment");
  }
  static {
    this.Imports = new FoldingRangeKind("imports");
  }
  static {
    this.Region = new FoldingRangeKind("region");
  }
  /**
   * Returns a {@link FoldingRangeKind} for the given value.
   *
   * @param value of the kind.
   */
  static fromValue(value) {
    switch (value) {
      case "comment":
        return FoldingRangeKind.Comment;
      case "imports":
        return FoldingRangeKind.Imports;
      case "region":
        return FoldingRangeKind.Region;
    }
    return new FoldingRangeKind(value);
  }
  /**
   * Creates a new {@link FoldingRangeKind}.
   *
   * @param value of the kind.
   */
  constructor(value) {
    this.value = value;
  }
}
var NewSymbolNameTag;
(function(NewSymbolNameTag2) {
  NewSymbolNameTag2[NewSymbolNameTag2["AIGenerated"] = 1] = "AIGenerated";
})(NewSymbolNameTag || (NewSymbolNameTag = {}));
var NewSymbolNameTriggerKind;
(function(NewSymbolNameTriggerKind2) {
  NewSymbolNameTriggerKind2[NewSymbolNameTriggerKind2["Invoke"] = 0] = "Invoke";
  NewSymbolNameTriggerKind2[NewSymbolNameTriggerKind2["Automatic"] = 1] = "Automatic";
})(NewSymbolNameTriggerKind || (NewSymbolNameTriggerKind = {}));
var Command;
(function(Command2) {
  function is(obj) {
    if (!obj || typeof obj !== "object") {
      return false;
    }
    return typeof obj.id === "string" && typeof obj.title === "string";
  }
  __name(is, "is");
  Command2.is = is;
})(Command || (Command = {}));
var CommentThreadCollapsibleState;
(function(CommentThreadCollapsibleState2) {
  CommentThreadCollapsibleState2[CommentThreadCollapsibleState2["Collapsed"] = 0] = "Collapsed";
  CommentThreadCollapsibleState2[CommentThreadCollapsibleState2["Expanded"] = 1] = "Expanded";
})(CommentThreadCollapsibleState || (CommentThreadCollapsibleState = {}));
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
var InlayHintKind;
(function(InlayHintKind2) {
  InlayHintKind2[InlayHintKind2["Type"] = 1] = "Type";
  InlayHintKind2[InlayHintKind2["Parameter"] = 2] = "Parameter";
})(InlayHintKind || (InlayHintKind = {}));
class LazyTokenizationSupport {
  static {
    __name(this, "LazyTokenizationSupport");
  }
  constructor(createSupport) {
    this.createSupport = createSupport;
    this._tokenizationSupport = null;
  }
  dispose() {
    if (this._tokenizationSupport) {
      this._tokenizationSupport.then((support) => {
        if (support) {
          support.dispose();
        }
      });
    }
  }
  get tokenizationSupport() {
    if (!this._tokenizationSupport) {
      this._tokenizationSupport = this.createSupport();
    }
    return this._tokenizationSupport;
  }
}
const TokenizationRegistry = new TokenizationRegistryImpl();
var ExternalUriOpenerPriority;
(function(ExternalUriOpenerPriority2) {
  ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["None"] = 0] = "None";
  ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["Option"] = 1] = "Option";
  ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["Default"] = 2] = "Default";
  ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["Preferred"] = 3] = "Preferred";
})(ExternalUriOpenerPriority || (ExternalUriOpenerPriority = {}));
export {
  CodeActionTriggerType,
  Command,
  CommentMode,
  CommentState,
  CommentThreadApplicability,
  CommentThreadCollapsibleState,
  CommentThreadState,
  CompletionItemInsertTextRule,
  CompletionItemKind,
  CompletionItemKinds,
  CompletionItemTag,
  CompletionTriggerKind,
  DocumentHighlightKind,
  DocumentPasteTriggerKind,
  EncodedTokenizationResult,
  ExternalUriOpenerPriority,
  FoldingRangeKind,
  HoverVerbosityAction,
  InlayHintKind,
  InlineCompletionEndOfLifeReasonKind,
  InlineCompletionHintStyle,
  InlineCompletionTriggerKind,
  LazyTokenizationSupport,
  NewSymbolNameTag,
  NewSymbolNameTriggerKind,
  PartialAcceptTriggerKind,
  ProviderId,
  SelectedSuggestionInfo,
  SignatureHelpTriggerKind,
  SymbolKind,
  SymbolKinds,
  SymbolTag,
  TextEdit,
  Token,
  TokenizationRegistry,
  TokenizationResult,
  VersionedExtensionId,
  getAriaLabelForSymbol,
  isLocation,
  isLocationLink,
  symbolKindNames
};
//# sourceMappingURL=languages.js.map
