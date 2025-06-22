var AccessibilitySupport;
(function(AccessibilitySupport2) {
  AccessibilitySupport2[AccessibilitySupport2["Unknown"] = 0] = "Unknown";
  AccessibilitySupport2[AccessibilitySupport2["Disabled"] = 1] = "Disabled";
  AccessibilitySupport2[AccessibilitySupport2["Enabled"] = 2] = "Enabled";
})(AccessibilitySupport || (AccessibilitySupport = {}));
var CodeActionTriggerType;
(function(CodeActionTriggerType2) {
  CodeActionTriggerType2[CodeActionTriggerType2["Invoke"] = 1] = "Invoke";
  CodeActionTriggerType2[CodeActionTriggerType2["Auto"] = 2] = "Auto";
})(CodeActionTriggerType || (CodeActionTriggerType = {}));
var CompletionItemInsertTextRule;
(function(CompletionItemInsertTextRule2) {
  CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["None"] = 0] = "None";
  CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["KeepWhitespace"] = 1] = "KeepWhitespace";
  CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["InsertAsSnippet"] = 4] = "InsertAsSnippet";
})(CompletionItemInsertTextRule || (CompletionItemInsertTextRule = {}));
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
var CompletionItemTag;
(function(CompletionItemTag2) {
  CompletionItemTag2[CompletionItemTag2["Deprecated"] = 1] = "Deprecated";
})(CompletionItemTag || (CompletionItemTag = {}));
var CompletionTriggerKind;
(function(CompletionTriggerKind2) {
  CompletionTriggerKind2[CompletionTriggerKind2["Invoke"] = 0] = "Invoke";
  CompletionTriggerKind2[CompletionTriggerKind2["TriggerCharacter"] = 1] = "TriggerCharacter";
  CompletionTriggerKind2[CompletionTriggerKind2["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
})(CompletionTriggerKind || (CompletionTriggerKind = {}));
var ContentWidgetPositionPreference;
(function(ContentWidgetPositionPreference2) {
  ContentWidgetPositionPreference2[ContentWidgetPositionPreference2["EXACT"] = 0] = "EXACT";
  ContentWidgetPositionPreference2[ContentWidgetPositionPreference2["ABOVE"] = 1] = "ABOVE";
  ContentWidgetPositionPreference2[ContentWidgetPositionPreference2["BELOW"] = 2] = "BELOW";
})(ContentWidgetPositionPreference || (ContentWidgetPositionPreference = {}));
var CursorChangeReason;
(function(CursorChangeReason2) {
  CursorChangeReason2[CursorChangeReason2["NotSet"] = 0] = "NotSet";
  CursorChangeReason2[CursorChangeReason2["ContentFlush"] = 1] = "ContentFlush";
  CursorChangeReason2[CursorChangeReason2["RecoverFromMarkers"] = 2] = "RecoverFromMarkers";
  CursorChangeReason2[CursorChangeReason2["Explicit"] = 3] = "Explicit";
  CursorChangeReason2[CursorChangeReason2["Paste"] = 4] = "Paste";
  CursorChangeReason2[CursorChangeReason2["Undo"] = 5] = "Undo";
  CursorChangeReason2[CursorChangeReason2["Redo"] = 6] = "Redo";
})(CursorChangeReason || (CursorChangeReason = {}));
var DefaultEndOfLine;
(function(DefaultEndOfLine2) {
  DefaultEndOfLine2[DefaultEndOfLine2["LF"] = 1] = "LF";
  DefaultEndOfLine2[DefaultEndOfLine2["CRLF"] = 2] = "CRLF";
})(DefaultEndOfLine || (DefaultEndOfLine = {}));
var DocumentHighlightKind;
(function(DocumentHighlightKind2) {
  DocumentHighlightKind2[DocumentHighlightKind2["Text"] = 0] = "Text";
  DocumentHighlightKind2[DocumentHighlightKind2["Read"] = 1] = "Read";
  DocumentHighlightKind2[DocumentHighlightKind2["Write"] = 2] = "Write";
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
var EditorAutoIndentStrategy;
(function(EditorAutoIndentStrategy2) {
  EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["None"] = 0] = "None";
  EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Keep"] = 1] = "Keep";
  EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Brackets"] = 2] = "Brackets";
  EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Advanced"] = 3] = "Advanced";
  EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Full"] = 4] = "Full";
})(EditorAutoIndentStrategy || (EditorAutoIndentStrategy = {}));
var EditorOption;
(function(EditorOption2) {
  EditorOption2[EditorOption2["acceptSuggestionOnCommitCharacter"] = 0] = "acceptSuggestionOnCommitCharacter";
  EditorOption2[EditorOption2["acceptSuggestionOnEnter"] = 1] = "acceptSuggestionOnEnter";
  EditorOption2[EditorOption2["accessibilitySupport"] = 2] = "accessibilitySupport";
  EditorOption2[EditorOption2["accessibilityPageSize"] = 3] = "accessibilityPageSize";
  EditorOption2[EditorOption2["allowVariableLineHeights"] = 4] = "allowVariableLineHeights";
  EditorOption2[EditorOption2["ariaLabel"] = 5] = "ariaLabel";
  EditorOption2[EditorOption2["ariaRequired"] = 6] = "ariaRequired";
  EditorOption2[EditorOption2["autoClosingBrackets"] = 7] = "autoClosingBrackets";
  EditorOption2[EditorOption2["autoClosingComments"] = 8] = "autoClosingComments";
  EditorOption2[EditorOption2["screenReaderAnnounceInlineSuggestion"] = 9] = "screenReaderAnnounceInlineSuggestion";
  EditorOption2[EditorOption2["autoClosingDelete"] = 10] = "autoClosingDelete";
  EditorOption2[EditorOption2["autoClosingOvertype"] = 11] = "autoClosingOvertype";
  EditorOption2[EditorOption2["autoClosingQuotes"] = 12] = "autoClosingQuotes";
  EditorOption2[EditorOption2["autoIndent"] = 13] = "autoIndent";
  EditorOption2[EditorOption2["autoIndentOnPaste"] = 14] = "autoIndentOnPaste";
  EditorOption2[EditorOption2["autoIndentOnPasteWithinString"] = 15] = "autoIndentOnPasteWithinString";
  EditorOption2[EditorOption2["automaticLayout"] = 16] = "automaticLayout";
  EditorOption2[EditorOption2["autoSurround"] = 17] = "autoSurround";
  EditorOption2[EditorOption2["bracketPairColorization"] = 18] = "bracketPairColorization";
  EditorOption2[EditorOption2["guides"] = 19] = "guides";
  EditorOption2[EditorOption2["codeLens"] = 20] = "codeLens";
  EditorOption2[EditorOption2["codeLensFontFamily"] = 21] = "codeLensFontFamily";
  EditorOption2[EditorOption2["codeLensFontSize"] = 22] = "codeLensFontSize";
  EditorOption2[EditorOption2["colorDecorators"] = 23] = "colorDecorators";
  EditorOption2[EditorOption2["colorDecoratorsLimit"] = 24] = "colorDecoratorsLimit";
  EditorOption2[EditorOption2["columnSelection"] = 25] = "columnSelection";
  EditorOption2[EditorOption2["comments"] = 26] = "comments";
  EditorOption2[EditorOption2["contextmenu"] = 27] = "contextmenu";
  EditorOption2[EditorOption2["copyWithSyntaxHighlighting"] = 28] = "copyWithSyntaxHighlighting";
  EditorOption2[EditorOption2["cursorBlinking"] = 29] = "cursorBlinking";
  EditorOption2[EditorOption2["cursorSmoothCaretAnimation"] = 30] = "cursorSmoothCaretAnimation";
  EditorOption2[EditorOption2["cursorStyle"] = 31] = "cursorStyle";
  EditorOption2[EditorOption2["cursorSurroundingLines"] = 32] = "cursorSurroundingLines";
  EditorOption2[EditorOption2["cursorSurroundingLinesStyle"] = 33] = "cursorSurroundingLinesStyle";
  EditorOption2[EditorOption2["cursorWidth"] = 34] = "cursorWidth";
  EditorOption2[EditorOption2["disableLayerHinting"] = 35] = "disableLayerHinting";
  EditorOption2[EditorOption2["disableMonospaceOptimizations"] = 36] = "disableMonospaceOptimizations";
  EditorOption2[EditorOption2["domReadOnly"] = 37] = "domReadOnly";
  EditorOption2[EditorOption2["dragAndDrop"] = 38] = "dragAndDrop";
  EditorOption2[EditorOption2["dropIntoEditor"] = 39] = "dropIntoEditor";
  EditorOption2[EditorOption2["editContext"] = 40] = "editContext";
  EditorOption2[EditorOption2["emptySelectionClipboard"] = 41] = "emptySelectionClipboard";
  EditorOption2[EditorOption2["experimentalGpuAcceleration"] = 42] = "experimentalGpuAcceleration";
  EditorOption2[EditorOption2["experimentalWhitespaceRendering"] = 43] = "experimentalWhitespaceRendering";
  EditorOption2[EditorOption2["extraEditorClassName"] = 44] = "extraEditorClassName";
  EditorOption2[EditorOption2["fastScrollSensitivity"] = 45] = "fastScrollSensitivity";
  EditorOption2[EditorOption2["find"] = 46] = "find";
  EditorOption2[EditorOption2["fixedOverflowWidgets"] = 47] = "fixedOverflowWidgets";
  EditorOption2[EditorOption2["folding"] = 48] = "folding";
  EditorOption2[EditorOption2["foldingStrategy"] = 49] = "foldingStrategy";
  EditorOption2[EditorOption2["foldingHighlight"] = 50] = "foldingHighlight";
  EditorOption2[EditorOption2["foldingImportsByDefault"] = 51] = "foldingImportsByDefault";
  EditorOption2[EditorOption2["foldingMaximumRegions"] = 52] = "foldingMaximumRegions";
  EditorOption2[EditorOption2["unfoldOnClickAfterEndOfLine"] = 53] = "unfoldOnClickAfterEndOfLine";
  EditorOption2[EditorOption2["fontFamily"] = 54] = "fontFamily";
  EditorOption2[EditorOption2["fontInfo"] = 55] = "fontInfo";
  EditorOption2[EditorOption2["fontLigatures"] = 56] = "fontLigatures";
  EditorOption2[EditorOption2["fontSize"] = 57] = "fontSize";
  EditorOption2[EditorOption2["fontWeight"] = 58] = "fontWeight";
  EditorOption2[EditorOption2["fontVariations"] = 59] = "fontVariations";
  EditorOption2[EditorOption2["formatOnPaste"] = 60] = "formatOnPaste";
  EditorOption2[EditorOption2["formatOnType"] = 61] = "formatOnType";
  EditorOption2[EditorOption2["glyphMargin"] = 62] = "glyphMargin";
  EditorOption2[EditorOption2["gotoLocation"] = 63] = "gotoLocation";
  EditorOption2[EditorOption2["hideCursorInOverviewRuler"] = 64] = "hideCursorInOverviewRuler";
  EditorOption2[EditorOption2["hover"] = 65] = "hover";
  EditorOption2[EditorOption2["inDiffEditor"] = 66] = "inDiffEditor";
  EditorOption2[EditorOption2["inlineSuggest"] = 67] = "inlineSuggest";
  EditorOption2[EditorOption2["letterSpacing"] = 68] = "letterSpacing";
  EditorOption2[EditorOption2["lightbulb"] = 69] = "lightbulb";
  EditorOption2[EditorOption2["lineDecorationsWidth"] = 70] = "lineDecorationsWidth";
  EditorOption2[EditorOption2["lineHeight"] = 71] = "lineHeight";
  EditorOption2[EditorOption2["lineNumbers"] = 72] = "lineNumbers";
  EditorOption2[EditorOption2["lineNumbersMinChars"] = 73] = "lineNumbersMinChars";
  EditorOption2[EditorOption2["linkedEditing"] = 74] = "linkedEditing";
  EditorOption2[EditorOption2["links"] = 75] = "links";
  EditorOption2[EditorOption2["matchBrackets"] = 76] = "matchBrackets";
  EditorOption2[EditorOption2["minimap"] = 77] = "minimap";
  EditorOption2[EditorOption2["mouseStyle"] = 78] = "mouseStyle";
  EditorOption2[EditorOption2["mouseWheelScrollSensitivity"] = 79] = "mouseWheelScrollSensitivity";
  EditorOption2[EditorOption2["mouseWheelZoom"] = 80] = "mouseWheelZoom";
  EditorOption2[EditorOption2["multiCursorMergeOverlapping"] = 81] = "multiCursorMergeOverlapping";
  EditorOption2[EditorOption2["multiCursorModifier"] = 82] = "multiCursorModifier";
  EditorOption2[EditorOption2["multiCursorPaste"] = 83] = "multiCursorPaste";
  EditorOption2[EditorOption2["multiCursorLimit"] = 84] = "multiCursorLimit";
  EditorOption2[EditorOption2["occurrencesHighlight"] = 85] = "occurrencesHighlight";
  EditorOption2[EditorOption2["occurrencesHighlightDelay"] = 86] = "occurrencesHighlightDelay";
  EditorOption2[EditorOption2["overtypeCursorStyle"] = 87] = "overtypeCursorStyle";
  EditorOption2[EditorOption2["overtypeOnPaste"] = 88] = "overtypeOnPaste";
  EditorOption2[EditorOption2["overviewRulerBorder"] = 89] = "overviewRulerBorder";
  EditorOption2[EditorOption2["overviewRulerLanes"] = 90] = "overviewRulerLanes";
  EditorOption2[EditorOption2["padding"] = 91] = "padding";
  EditorOption2[EditorOption2["pasteAs"] = 92] = "pasteAs";
  EditorOption2[EditorOption2["parameterHints"] = 93] = "parameterHints";
  EditorOption2[EditorOption2["peekWidgetDefaultFocus"] = 94] = "peekWidgetDefaultFocus";
  EditorOption2[EditorOption2["placeholder"] = 95] = "placeholder";
  EditorOption2[EditorOption2["definitionLinkOpensInPeek"] = 96] = "definitionLinkOpensInPeek";
  EditorOption2[EditorOption2["quickSuggestions"] = 97] = "quickSuggestions";
  EditorOption2[EditorOption2["quickSuggestionsDelay"] = 98] = "quickSuggestionsDelay";
  EditorOption2[EditorOption2["readOnly"] = 99] = "readOnly";
  EditorOption2[EditorOption2["readOnlyMessage"] = 100] = "readOnlyMessage";
  EditorOption2[EditorOption2["renameOnType"] = 101] = "renameOnType";
  EditorOption2[EditorOption2["renderControlCharacters"] = 102] = "renderControlCharacters";
  EditorOption2[EditorOption2["renderFinalNewline"] = 103] = "renderFinalNewline";
  EditorOption2[EditorOption2["renderLineHighlight"] = 104] = "renderLineHighlight";
  EditorOption2[EditorOption2["renderLineHighlightOnlyWhenFocus"] = 105] = "renderLineHighlightOnlyWhenFocus";
  EditorOption2[EditorOption2["renderValidationDecorations"] = 106] = "renderValidationDecorations";
  EditorOption2[EditorOption2["renderWhitespace"] = 107] = "renderWhitespace";
  EditorOption2[EditorOption2["revealHorizontalRightPadding"] = 108] = "revealHorizontalRightPadding";
  EditorOption2[EditorOption2["roundedSelection"] = 109] = "roundedSelection";
  EditorOption2[EditorOption2["rulers"] = 110] = "rulers";
  EditorOption2[EditorOption2["scrollbar"] = 111] = "scrollbar";
  EditorOption2[EditorOption2["scrollBeyondLastColumn"] = 112] = "scrollBeyondLastColumn";
  EditorOption2[EditorOption2["scrollBeyondLastLine"] = 113] = "scrollBeyondLastLine";
  EditorOption2[EditorOption2["scrollPredominantAxis"] = 114] = "scrollPredominantAxis";
  EditorOption2[EditorOption2["selectionClipboard"] = 115] = "selectionClipboard";
  EditorOption2[EditorOption2["selectionHighlight"] = 116] = "selectionHighlight";
  EditorOption2[EditorOption2["selectOnLineNumbers"] = 117] = "selectOnLineNumbers";
  EditorOption2[EditorOption2["showFoldingControls"] = 118] = "showFoldingControls";
  EditorOption2[EditorOption2["showUnused"] = 119] = "showUnused";
  EditorOption2[EditorOption2["snippetSuggestions"] = 120] = "snippetSuggestions";
  EditorOption2[EditorOption2["smartSelect"] = 121] = "smartSelect";
  EditorOption2[EditorOption2["smoothScrolling"] = 122] = "smoothScrolling";
  EditorOption2[EditorOption2["stickyScroll"] = 123] = "stickyScroll";
  EditorOption2[EditorOption2["stickyTabStops"] = 124] = "stickyTabStops";
  EditorOption2[EditorOption2["stopRenderingLineAfter"] = 125] = "stopRenderingLineAfter";
  EditorOption2[EditorOption2["suggest"] = 126] = "suggest";
  EditorOption2[EditorOption2["suggestFontSize"] = 127] = "suggestFontSize";
  EditorOption2[EditorOption2["suggestLineHeight"] = 128] = "suggestLineHeight";
  EditorOption2[EditorOption2["suggestOnTriggerCharacters"] = 129] = "suggestOnTriggerCharacters";
  EditorOption2[EditorOption2["suggestSelection"] = 130] = "suggestSelection";
  EditorOption2[EditorOption2["tabCompletion"] = 131] = "tabCompletion";
  EditorOption2[EditorOption2["tabIndex"] = 132] = "tabIndex";
  EditorOption2[EditorOption2["unicodeHighlighting"] = 133] = "unicodeHighlighting";
  EditorOption2[EditorOption2["unusualLineTerminators"] = 134] = "unusualLineTerminators";
  EditorOption2[EditorOption2["useShadowDOM"] = 135] = "useShadowDOM";
  EditorOption2[EditorOption2["useTabStops"] = 136] = "useTabStops";
  EditorOption2[EditorOption2["wordBreak"] = 137] = "wordBreak";
  EditorOption2[EditorOption2["wordSegmenterLocales"] = 138] = "wordSegmenterLocales";
  EditorOption2[EditorOption2["wordSeparators"] = 139] = "wordSeparators";
  EditorOption2[EditorOption2["wordWrap"] = 140] = "wordWrap";
  EditorOption2[EditorOption2["wordWrapBreakAfterCharacters"] = 141] = "wordWrapBreakAfterCharacters";
  EditorOption2[EditorOption2["wordWrapBreakBeforeCharacters"] = 142] = "wordWrapBreakBeforeCharacters";
  EditorOption2[EditorOption2["wordWrapColumn"] = 143] = "wordWrapColumn";
  EditorOption2[EditorOption2["wordWrapOverride1"] = 144] = "wordWrapOverride1";
  EditorOption2[EditorOption2["wordWrapOverride2"] = 145] = "wordWrapOverride2";
  EditorOption2[EditorOption2["wrappingIndent"] = 146] = "wrappingIndent";
  EditorOption2[EditorOption2["wrappingStrategy"] = 147] = "wrappingStrategy";
  EditorOption2[EditorOption2["showDeprecated"] = 148] = "showDeprecated";
  EditorOption2[EditorOption2["inlayHints"] = 149] = "inlayHints";
  EditorOption2[EditorOption2["effectiveCursorStyle"] = 150] = "effectiveCursorStyle";
  EditorOption2[EditorOption2["editorClassName"] = 151] = "editorClassName";
  EditorOption2[EditorOption2["pixelRatio"] = 152] = "pixelRatio";
  EditorOption2[EditorOption2["tabFocusMode"] = 153] = "tabFocusMode";
  EditorOption2[EditorOption2["layoutInfo"] = 154] = "layoutInfo";
  EditorOption2[EditorOption2["wrappingInfo"] = 155] = "wrappingInfo";
  EditorOption2[EditorOption2["defaultColorDecorators"] = 156] = "defaultColorDecorators";
  EditorOption2[EditorOption2["colorDecoratorsActivatedOn"] = 157] = "colorDecoratorsActivatedOn";
  EditorOption2[EditorOption2["inlineCompletionsAccessibilityVerbose"] = 158] = "inlineCompletionsAccessibilityVerbose";
  EditorOption2[EditorOption2["effectiveEditContext"] = 159] = "effectiveEditContext";
  EditorOption2[EditorOption2["scrollOnMiddleClick"] = 160] = "scrollOnMiddleClick";
})(EditorOption || (EditorOption = {}));
var EndOfLinePreference;
(function(EndOfLinePreference2) {
  EndOfLinePreference2[EndOfLinePreference2["TextDefined"] = 0] = "TextDefined";
  EndOfLinePreference2[EndOfLinePreference2["LF"] = 1] = "LF";
  EndOfLinePreference2[EndOfLinePreference2["CRLF"] = 2] = "CRLF";
})(EndOfLinePreference || (EndOfLinePreference = {}));
var EndOfLineSequence;
(function(EndOfLineSequence2) {
  EndOfLineSequence2[EndOfLineSequence2["LF"] = 0] = "LF";
  EndOfLineSequence2[EndOfLineSequence2["CRLF"] = 1] = "CRLF";
})(EndOfLineSequence || (EndOfLineSequence = {}));
var GlyphMarginLane;
(function(GlyphMarginLane2) {
  GlyphMarginLane2[GlyphMarginLane2["Left"] = 1] = "Left";
  GlyphMarginLane2[GlyphMarginLane2["Center"] = 2] = "Center";
  GlyphMarginLane2[GlyphMarginLane2["Right"] = 3] = "Right";
})(GlyphMarginLane || (GlyphMarginLane = {}));
var HoverVerbosityAction;
(function(HoverVerbosityAction2) {
  HoverVerbosityAction2[HoverVerbosityAction2["Increase"] = 0] = "Increase";
  HoverVerbosityAction2[HoverVerbosityAction2["Decrease"] = 1] = "Decrease";
})(HoverVerbosityAction || (HoverVerbosityAction = {}));
var IndentAction;
(function(IndentAction2) {
  IndentAction2[IndentAction2["None"] = 0] = "None";
  IndentAction2[IndentAction2["Indent"] = 1] = "Indent";
  IndentAction2[IndentAction2["IndentOutdent"] = 2] = "IndentOutdent";
  IndentAction2[IndentAction2["Outdent"] = 3] = "Outdent";
})(IndentAction || (IndentAction = {}));
var InjectedTextCursorStops;
(function(InjectedTextCursorStops2) {
  InjectedTextCursorStops2[InjectedTextCursorStops2["Both"] = 0] = "Both";
  InjectedTextCursorStops2[InjectedTextCursorStops2["Right"] = 1] = "Right";
  InjectedTextCursorStops2[InjectedTextCursorStops2["Left"] = 2] = "Left";
  InjectedTextCursorStops2[InjectedTextCursorStops2["None"] = 3] = "None";
})(InjectedTextCursorStops || (InjectedTextCursorStops = {}));
var InlayHintKind;
(function(InlayHintKind2) {
  InlayHintKind2[InlayHintKind2["Type"] = 1] = "Type";
  InlayHintKind2[InlayHintKind2["Parameter"] = 2] = "Parameter";
})(InlayHintKind || (InlayHintKind = {}));
var InlineCompletionEndOfLifeReasonKind;
(function(InlineCompletionEndOfLifeReasonKind2) {
  InlineCompletionEndOfLifeReasonKind2[InlineCompletionEndOfLifeReasonKind2["Accepted"] = 0] = "Accepted";
  InlineCompletionEndOfLifeReasonKind2[InlineCompletionEndOfLifeReasonKind2["Rejected"] = 1] = "Rejected";
  InlineCompletionEndOfLifeReasonKind2[InlineCompletionEndOfLifeReasonKind2["Ignored"] = 2] = "Ignored";
})(InlineCompletionEndOfLifeReasonKind || (InlineCompletionEndOfLifeReasonKind = {}));
var InlineCompletionTriggerKind;
(function(InlineCompletionTriggerKind2) {
  InlineCompletionTriggerKind2[InlineCompletionTriggerKind2["Automatic"] = 0] = "Automatic";
  InlineCompletionTriggerKind2[InlineCompletionTriggerKind2["Explicit"] = 1] = "Explicit";
})(InlineCompletionTriggerKind || (InlineCompletionTriggerKind = {}));
var KeyCode;
(function(KeyCode2) {
  KeyCode2[KeyCode2["DependsOnKbLayout"] = -1] = "DependsOnKbLayout";
  KeyCode2[KeyCode2["Unknown"] = 0] = "Unknown";
  KeyCode2[KeyCode2["Backspace"] = 1] = "Backspace";
  KeyCode2[KeyCode2["Tab"] = 2] = "Tab";
  KeyCode2[KeyCode2["Enter"] = 3] = "Enter";
  KeyCode2[KeyCode2["Shift"] = 4] = "Shift";
  KeyCode2[KeyCode2["Ctrl"] = 5] = "Ctrl";
  KeyCode2[KeyCode2["Alt"] = 6] = "Alt";
  KeyCode2[KeyCode2["PauseBreak"] = 7] = "PauseBreak";
  KeyCode2[KeyCode2["CapsLock"] = 8] = "CapsLock";
  KeyCode2[KeyCode2["Escape"] = 9] = "Escape";
  KeyCode2[KeyCode2["Space"] = 10] = "Space";
  KeyCode2[KeyCode2["PageUp"] = 11] = "PageUp";
  KeyCode2[KeyCode2["PageDown"] = 12] = "PageDown";
  KeyCode2[KeyCode2["End"] = 13] = "End";
  KeyCode2[KeyCode2["Home"] = 14] = "Home";
  KeyCode2[KeyCode2["LeftArrow"] = 15] = "LeftArrow";
  KeyCode2[KeyCode2["UpArrow"] = 16] = "UpArrow";
  KeyCode2[KeyCode2["RightArrow"] = 17] = "RightArrow";
  KeyCode2[KeyCode2["DownArrow"] = 18] = "DownArrow";
  KeyCode2[KeyCode2["Insert"] = 19] = "Insert";
  KeyCode2[KeyCode2["Delete"] = 20] = "Delete";
  KeyCode2[KeyCode2["Digit0"] = 21] = "Digit0";
  KeyCode2[KeyCode2["Digit1"] = 22] = "Digit1";
  KeyCode2[KeyCode2["Digit2"] = 23] = "Digit2";
  KeyCode2[KeyCode2["Digit3"] = 24] = "Digit3";
  KeyCode2[KeyCode2["Digit4"] = 25] = "Digit4";
  KeyCode2[KeyCode2["Digit5"] = 26] = "Digit5";
  KeyCode2[KeyCode2["Digit6"] = 27] = "Digit6";
  KeyCode2[KeyCode2["Digit7"] = 28] = "Digit7";
  KeyCode2[KeyCode2["Digit8"] = 29] = "Digit8";
  KeyCode2[KeyCode2["Digit9"] = 30] = "Digit9";
  KeyCode2[KeyCode2["KeyA"] = 31] = "KeyA";
  KeyCode2[KeyCode2["KeyB"] = 32] = "KeyB";
  KeyCode2[KeyCode2["KeyC"] = 33] = "KeyC";
  KeyCode2[KeyCode2["KeyD"] = 34] = "KeyD";
  KeyCode2[KeyCode2["KeyE"] = 35] = "KeyE";
  KeyCode2[KeyCode2["KeyF"] = 36] = "KeyF";
  KeyCode2[KeyCode2["KeyG"] = 37] = "KeyG";
  KeyCode2[KeyCode2["KeyH"] = 38] = "KeyH";
  KeyCode2[KeyCode2["KeyI"] = 39] = "KeyI";
  KeyCode2[KeyCode2["KeyJ"] = 40] = "KeyJ";
  KeyCode2[KeyCode2["KeyK"] = 41] = "KeyK";
  KeyCode2[KeyCode2["KeyL"] = 42] = "KeyL";
  KeyCode2[KeyCode2["KeyM"] = 43] = "KeyM";
  KeyCode2[KeyCode2["KeyN"] = 44] = "KeyN";
  KeyCode2[KeyCode2["KeyO"] = 45] = "KeyO";
  KeyCode2[KeyCode2["KeyP"] = 46] = "KeyP";
  KeyCode2[KeyCode2["KeyQ"] = 47] = "KeyQ";
  KeyCode2[KeyCode2["KeyR"] = 48] = "KeyR";
  KeyCode2[KeyCode2["KeyS"] = 49] = "KeyS";
  KeyCode2[KeyCode2["KeyT"] = 50] = "KeyT";
  KeyCode2[KeyCode2["KeyU"] = 51] = "KeyU";
  KeyCode2[KeyCode2["KeyV"] = 52] = "KeyV";
  KeyCode2[KeyCode2["KeyW"] = 53] = "KeyW";
  KeyCode2[KeyCode2["KeyX"] = 54] = "KeyX";
  KeyCode2[KeyCode2["KeyY"] = 55] = "KeyY";
  KeyCode2[KeyCode2["KeyZ"] = 56] = "KeyZ";
  KeyCode2[KeyCode2["Meta"] = 57] = "Meta";
  KeyCode2[KeyCode2["ContextMenu"] = 58] = "ContextMenu";
  KeyCode2[KeyCode2["F1"] = 59] = "F1";
  KeyCode2[KeyCode2["F2"] = 60] = "F2";
  KeyCode2[KeyCode2["F3"] = 61] = "F3";
  KeyCode2[KeyCode2["F4"] = 62] = "F4";
  KeyCode2[KeyCode2["F5"] = 63] = "F5";
  KeyCode2[KeyCode2["F6"] = 64] = "F6";
  KeyCode2[KeyCode2["F7"] = 65] = "F7";
  KeyCode2[KeyCode2["F8"] = 66] = "F8";
  KeyCode2[KeyCode2["F9"] = 67] = "F9";
  KeyCode2[KeyCode2["F10"] = 68] = "F10";
  KeyCode2[KeyCode2["F11"] = 69] = "F11";
  KeyCode2[KeyCode2["F12"] = 70] = "F12";
  KeyCode2[KeyCode2["F13"] = 71] = "F13";
  KeyCode2[KeyCode2["F14"] = 72] = "F14";
  KeyCode2[KeyCode2["F15"] = 73] = "F15";
  KeyCode2[KeyCode2["F16"] = 74] = "F16";
  KeyCode2[KeyCode2["F17"] = 75] = "F17";
  KeyCode2[KeyCode2["F18"] = 76] = "F18";
  KeyCode2[KeyCode2["F19"] = 77] = "F19";
  KeyCode2[KeyCode2["F20"] = 78] = "F20";
  KeyCode2[KeyCode2["F21"] = 79] = "F21";
  KeyCode2[KeyCode2["F22"] = 80] = "F22";
  KeyCode2[KeyCode2["F23"] = 81] = "F23";
  KeyCode2[KeyCode2["F24"] = 82] = "F24";
  KeyCode2[KeyCode2["NumLock"] = 83] = "NumLock";
  KeyCode2[KeyCode2["ScrollLock"] = 84] = "ScrollLock";
  KeyCode2[KeyCode2["Semicolon"] = 85] = "Semicolon";
  KeyCode2[KeyCode2["Equal"] = 86] = "Equal";
  KeyCode2[KeyCode2["Comma"] = 87] = "Comma";
  KeyCode2[KeyCode2["Minus"] = 88] = "Minus";
  KeyCode2[KeyCode2["Period"] = 89] = "Period";
  KeyCode2[KeyCode2["Slash"] = 90] = "Slash";
  KeyCode2[KeyCode2["Backquote"] = 91] = "Backquote";
  KeyCode2[KeyCode2["BracketLeft"] = 92] = "BracketLeft";
  KeyCode2[KeyCode2["Backslash"] = 93] = "Backslash";
  KeyCode2[KeyCode2["BracketRight"] = 94] = "BracketRight";
  KeyCode2[KeyCode2["Quote"] = 95] = "Quote";
  KeyCode2[KeyCode2["OEM_8"] = 96] = "OEM_8";
  KeyCode2[KeyCode2["IntlBackslash"] = 97] = "IntlBackslash";
  KeyCode2[KeyCode2["Numpad0"] = 98] = "Numpad0";
  KeyCode2[KeyCode2["Numpad1"] = 99] = "Numpad1";
  KeyCode2[KeyCode2["Numpad2"] = 100] = "Numpad2";
  KeyCode2[KeyCode2["Numpad3"] = 101] = "Numpad3";
  KeyCode2[KeyCode2["Numpad4"] = 102] = "Numpad4";
  KeyCode2[KeyCode2["Numpad5"] = 103] = "Numpad5";
  KeyCode2[KeyCode2["Numpad6"] = 104] = "Numpad6";
  KeyCode2[KeyCode2["Numpad7"] = 105] = "Numpad7";
  KeyCode2[KeyCode2["Numpad8"] = 106] = "Numpad8";
  KeyCode2[KeyCode2["Numpad9"] = 107] = "Numpad9";
  KeyCode2[KeyCode2["NumpadMultiply"] = 108] = "NumpadMultiply";
  KeyCode2[KeyCode2["NumpadAdd"] = 109] = "NumpadAdd";
  KeyCode2[KeyCode2["NUMPAD_SEPARATOR"] = 110] = "NUMPAD_SEPARATOR";
  KeyCode2[KeyCode2["NumpadSubtract"] = 111] = "NumpadSubtract";
  KeyCode2[KeyCode2["NumpadDecimal"] = 112] = "NumpadDecimal";
  KeyCode2[KeyCode2["NumpadDivide"] = 113] = "NumpadDivide";
  KeyCode2[KeyCode2["KEY_IN_COMPOSITION"] = 114] = "KEY_IN_COMPOSITION";
  KeyCode2[KeyCode2["ABNT_C1"] = 115] = "ABNT_C1";
  KeyCode2[KeyCode2["ABNT_C2"] = 116] = "ABNT_C2";
  KeyCode2[KeyCode2["AudioVolumeMute"] = 117] = "AudioVolumeMute";
  KeyCode2[KeyCode2["AudioVolumeUp"] = 118] = "AudioVolumeUp";
  KeyCode2[KeyCode2["AudioVolumeDown"] = 119] = "AudioVolumeDown";
  KeyCode2[KeyCode2["BrowserSearch"] = 120] = "BrowserSearch";
  KeyCode2[KeyCode2["BrowserHome"] = 121] = "BrowserHome";
  KeyCode2[KeyCode2["BrowserBack"] = 122] = "BrowserBack";
  KeyCode2[KeyCode2["BrowserForward"] = 123] = "BrowserForward";
  KeyCode2[KeyCode2["MediaTrackNext"] = 124] = "MediaTrackNext";
  KeyCode2[KeyCode2["MediaTrackPrevious"] = 125] = "MediaTrackPrevious";
  KeyCode2[KeyCode2["MediaStop"] = 126] = "MediaStop";
  KeyCode2[KeyCode2["MediaPlayPause"] = 127] = "MediaPlayPause";
  KeyCode2[KeyCode2["LaunchMediaPlayer"] = 128] = "LaunchMediaPlayer";
  KeyCode2[KeyCode2["LaunchMail"] = 129] = "LaunchMail";
  KeyCode2[KeyCode2["LaunchApp2"] = 130] = "LaunchApp2";
  KeyCode2[KeyCode2["Clear"] = 131] = "Clear";
  KeyCode2[KeyCode2["MAX_VALUE"] = 132] = "MAX_VALUE";
})(KeyCode || (KeyCode = {}));
var MarkerSeverity;
(function(MarkerSeverity2) {
  MarkerSeverity2[MarkerSeverity2["Hint"] = 1] = "Hint";
  MarkerSeverity2[MarkerSeverity2["Info"] = 2] = "Info";
  MarkerSeverity2[MarkerSeverity2["Warning"] = 4] = "Warning";
  MarkerSeverity2[MarkerSeverity2["Error"] = 8] = "Error";
})(MarkerSeverity || (MarkerSeverity = {}));
var MarkerTag;
(function(MarkerTag2) {
  MarkerTag2[MarkerTag2["Unnecessary"] = 1] = "Unnecessary";
  MarkerTag2[MarkerTag2["Deprecated"] = 2] = "Deprecated";
})(MarkerTag || (MarkerTag = {}));
var MinimapPosition;
(function(MinimapPosition2) {
  MinimapPosition2[MinimapPosition2["Inline"] = 1] = "Inline";
  MinimapPosition2[MinimapPosition2["Gutter"] = 2] = "Gutter";
})(MinimapPosition || (MinimapPosition = {}));
var MinimapSectionHeaderStyle;
(function(MinimapSectionHeaderStyle2) {
  MinimapSectionHeaderStyle2[MinimapSectionHeaderStyle2["Normal"] = 1] = "Normal";
  MinimapSectionHeaderStyle2[MinimapSectionHeaderStyle2["Underlined"] = 2] = "Underlined";
})(MinimapSectionHeaderStyle || (MinimapSectionHeaderStyle = {}));
var MouseTargetType;
(function(MouseTargetType2) {
  MouseTargetType2[MouseTargetType2["UNKNOWN"] = 0] = "UNKNOWN";
  MouseTargetType2[MouseTargetType2["TEXTAREA"] = 1] = "TEXTAREA";
  MouseTargetType2[MouseTargetType2["GUTTER_GLYPH_MARGIN"] = 2] = "GUTTER_GLYPH_MARGIN";
  MouseTargetType2[MouseTargetType2["GUTTER_LINE_NUMBERS"] = 3] = "GUTTER_LINE_NUMBERS";
  MouseTargetType2[MouseTargetType2["GUTTER_LINE_DECORATIONS"] = 4] = "GUTTER_LINE_DECORATIONS";
  MouseTargetType2[MouseTargetType2["GUTTER_VIEW_ZONE"] = 5] = "GUTTER_VIEW_ZONE";
  MouseTargetType2[MouseTargetType2["CONTENT_TEXT"] = 6] = "CONTENT_TEXT";
  MouseTargetType2[MouseTargetType2["CONTENT_EMPTY"] = 7] = "CONTENT_EMPTY";
  MouseTargetType2[MouseTargetType2["CONTENT_VIEW_ZONE"] = 8] = "CONTENT_VIEW_ZONE";
  MouseTargetType2[MouseTargetType2["CONTENT_WIDGET"] = 9] = "CONTENT_WIDGET";
  MouseTargetType2[MouseTargetType2["OVERVIEW_RULER"] = 10] = "OVERVIEW_RULER";
  MouseTargetType2[MouseTargetType2["SCROLLBAR"] = 11] = "SCROLLBAR";
  MouseTargetType2[MouseTargetType2["OVERLAY_WIDGET"] = 12] = "OVERLAY_WIDGET";
  MouseTargetType2[MouseTargetType2["OUTSIDE_EDITOR"] = 13] = "OUTSIDE_EDITOR";
})(MouseTargetType || (MouseTargetType = {}));
var NewSymbolNameTag;
(function(NewSymbolNameTag2) {
  NewSymbolNameTag2[NewSymbolNameTag2["AIGenerated"] = 1] = "AIGenerated";
})(NewSymbolNameTag || (NewSymbolNameTag = {}));
var NewSymbolNameTriggerKind;
(function(NewSymbolNameTriggerKind2) {
  NewSymbolNameTriggerKind2[NewSymbolNameTriggerKind2["Invoke"] = 0] = "Invoke";
  NewSymbolNameTriggerKind2[NewSymbolNameTriggerKind2["Automatic"] = 1] = "Automatic";
})(NewSymbolNameTriggerKind || (NewSymbolNameTriggerKind = {}));
var OverlayWidgetPositionPreference;
(function(OverlayWidgetPositionPreference2) {
  OverlayWidgetPositionPreference2[OverlayWidgetPositionPreference2["TOP_RIGHT_CORNER"] = 0] = "TOP_RIGHT_CORNER";
  OverlayWidgetPositionPreference2[OverlayWidgetPositionPreference2["BOTTOM_RIGHT_CORNER"] = 1] = "BOTTOM_RIGHT_CORNER";
  OverlayWidgetPositionPreference2[OverlayWidgetPositionPreference2["TOP_CENTER"] = 2] = "TOP_CENTER";
})(OverlayWidgetPositionPreference || (OverlayWidgetPositionPreference = {}));
var OverviewRulerLane;
(function(OverviewRulerLane2) {
  OverviewRulerLane2[OverviewRulerLane2["Left"] = 1] = "Left";
  OverviewRulerLane2[OverviewRulerLane2["Center"] = 2] = "Center";
  OverviewRulerLane2[OverviewRulerLane2["Right"] = 4] = "Right";
  OverviewRulerLane2[OverviewRulerLane2["Full"] = 7] = "Full";
})(OverviewRulerLane || (OverviewRulerLane = {}));
var PartialAcceptTriggerKind;
(function(PartialAcceptTriggerKind2) {
  PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Word"] = 0] = "Word";
  PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Line"] = 1] = "Line";
  PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Suggest"] = 2] = "Suggest";
})(PartialAcceptTriggerKind || (PartialAcceptTriggerKind = {}));
var PositionAffinity;
(function(PositionAffinity2) {
  PositionAffinity2[PositionAffinity2["Left"] = 0] = "Left";
  PositionAffinity2[PositionAffinity2["Right"] = 1] = "Right";
  PositionAffinity2[PositionAffinity2["None"] = 2] = "None";
  PositionAffinity2[PositionAffinity2["LeftOfInjectedText"] = 3] = "LeftOfInjectedText";
  PositionAffinity2[PositionAffinity2["RightOfInjectedText"] = 4] = "RightOfInjectedText";
})(PositionAffinity || (PositionAffinity = {}));
var RenderLineNumbersType;
(function(RenderLineNumbersType2) {
  RenderLineNumbersType2[RenderLineNumbersType2["Off"] = 0] = "Off";
  RenderLineNumbersType2[RenderLineNumbersType2["On"] = 1] = "On";
  RenderLineNumbersType2[RenderLineNumbersType2["Relative"] = 2] = "Relative";
  RenderLineNumbersType2[RenderLineNumbersType2["Interval"] = 3] = "Interval";
  RenderLineNumbersType2[RenderLineNumbersType2["Custom"] = 4] = "Custom";
})(RenderLineNumbersType || (RenderLineNumbersType = {}));
var RenderMinimap;
(function(RenderMinimap2) {
  RenderMinimap2[RenderMinimap2["None"] = 0] = "None";
  RenderMinimap2[RenderMinimap2["Text"] = 1] = "Text";
  RenderMinimap2[RenderMinimap2["Blocks"] = 2] = "Blocks";
})(RenderMinimap || (RenderMinimap = {}));
var ScrollType;
(function(ScrollType2) {
  ScrollType2[ScrollType2["Smooth"] = 0] = "Smooth";
  ScrollType2[ScrollType2["Immediate"] = 1] = "Immediate";
})(ScrollType || (ScrollType = {}));
var ScrollbarVisibility;
(function(ScrollbarVisibility2) {
  ScrollbarVisibility2[ScrollbarVisibility2["Auto"] = 1] = "Auto";
  ScrollbarVisibility2[ScrollbarVisibility2["Hidden"] = 2] = "Hidden";
  ScrollbarVisibility2[ScrollbarVisibility2["Visible"] = 3] = "Visible";
})(ScrollbarVisibility || (ScrollbarVisibility = {}));
var SelectionDirection;
(function(SelectionDirection2) {
  SelectionDirection2[SelectionDirection2["LTR"] = 0] = "LTR";
  SelectionDirection2[SelectionDirection2["RTL"] = 1] = "RTL";
})(SelectionDirection || (SelectionDirection = {}));
var ShowLightbulbIconMode;
(function(ShowLightbulbIconMode2) {
  ShowLightbulbIconMode2["Off"] = "off";
  ShowLightbulbIconMode2["OnCode"] = "onCode";
  ShowLightbulbIconMode2["On"] = "on";
})(ShowLightbulbIconMode || (ShowLightbulbIconMode = {}));
var SignatureHelpTriggerKind;
(function(SignatureHelpTriggerKind2) {
  SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["Invoke"] = 1] = "Invoke";
  SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["TriggerCharacter"] = 2] = "TriggerCharacter";
  SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["ContentChange"] = 3] = "ContentChange";
})(SignatureHelpTriggerKind || (SignatureHelpTriggerKind = {}));
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
var TextEditorCursorBlinkingStyle;
(function(TextEditorCursorBlinkingStyle2) {
  TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Hidden"] = 0] = "Hidden";
  TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Blink"] = 1] = "Blink";
  TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Smooth"] = 2] = "Smooth";
  TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Phase"] = 3] = "Phase";
  TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Expand"] = 4] = "Expand";
  TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Solid"] = 5] = "Solid";
})(TextEditorCursorBlinkingStyle || (TextEditorCursorBlinkingStyle = {}));
var TextEditorCursorStyle;
(function(TextEditorCursorStyle2) {
  TextEditorCursorStyle2[TextEditorCursorStyle2["Line"] = 1] = "Line";
  TextEditorCursorStyle2[TextEditorCursorStyle2["Block"] = 2] = "Block";
  TextEditorCursorStyle2[TextEditorCursorStyle2["Underline"] = 3] = "Underline";
  TextEditorCursorStyle2[TextEditorCursorStyle2["LineThin"] = 4] = "LineThin";
  TextEditorCursorStyle2[TextEditorCursorStyle2["BlockOutline"] = 5] = "BlockOutline";
  TextEditorCursorStyle2[TextEditorCursorStyle2["UnderlineThin"] = 6] = "UnderlineThin";
})(TextEditorCursorStyle || (TextEditorCursorStyle = {}));
var TrackedRangeStickiness;
(function(TrackedRangeStickiness2) {
  TrackedRangeStickiness2[TrackedRangeStickiness2["AlwaysGrowsWhenTypingAtEdges"] = 0] = "AlwaysGrowsWhenTypingAtEdges";
  TrackedRangeStickiness2[TrackedRangeStickiness2["NeverGrowsWhenTypingAtEdges"] = 1] = "NeverGrowsWhenTypingAtEdges";
  TrackedRangeStickiness2[TrackedRangeStickiness2["GrowsOnlyWhenTypingBefore"] = 2] = "GrowsOnlyWhenTypingBefore";
  TrackedRangeStickiness2[TrackedRangeStickiness2["GrowsOnlyWhenTypingAfter"] = 3] = "GrowsOnlyWhenTypingAfter";
})(TrackedRangeStickiness || (TrackedRangeStickiness = {}));
var WrappingIndent;
(function(WrappingIndent2) {
  WrappingIndent2[WrappingIndent2["None"] = 0] = "None";
  WrappingIndent2[WrappingIndent2["Same"] = 1] = "Same";
  WrappingIndent2[WrappingIndent2["Indent"] = 2] = "Indent";
  WrappingIndent2[WrappingIndent2["DeepIndent"] = 3] = "DeepIndent";
})(WrappingIndent || (WrappingIndent = {}));
export {
  AccessibilitySupport,
  CodeActionTriggerType,
  CompletionItemInsertTextRule,
  CompletionItemKind,
  CompletionItemTag,
  CompletionTriggerKind,
  ContentWidgetPositionPreference,
  CursorChangeReason,
  DefaultEndOfLine,
  DocumentHighlightKind,
  EditorAutoIndentStrategy,
  EditorOption,
  EndOfLinePreference,
  EndOfLineSequence,
  GlyphMarginLane,
  HoverVerbosityAction,
  IndentAction,
  InjectedTextCursorStops,
  InlayHintKind,
  InlineCompletionEndOfLifeReasonKind,
  InlineCompletionTriggerKind,
  KeyCode,
  MarkerSeverity,
  MarkerTag,
  MinimapPosition,
  MinimapSectionHeaderStyle,
  MouseTargetType,
  NewSymbolNameTag,
  NewSymbolNameTriggerKind,
  OverlayWidgetPositionPreference,
  OverviewRulerLane,
  PartialAcceptTriggerKind,
  PositionAffinity,
  RenderLineNumbersType,
  RenderMinimap,
  ScrollType,
  ScrollbarVisibility,
  SelectionDirection,
  ShowLightbulbIconMode,
  SignatureHelpTriggerKind,
  SymbolKind,
  SymbolTag,
  TextEditorCursorBlinkingStyle,
  TextEditorCursorStyle,
  TrackedRangeStickiness,
  WrappingIndent
};
//# sourceMappingURL=standaloneEnums.js.map
