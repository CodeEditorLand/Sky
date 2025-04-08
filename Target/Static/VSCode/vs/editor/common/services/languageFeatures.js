import { LanguageFeatureRegistry, NotebookInfoResolver } from "../languageFeatureRegistry.js";
import { CodeActionProvider, CodeLensProvider, CompletionItemProvider, DeclarationProvider, DefinitionProvider, DocumentColorProvider, DocumentFormattingEditProvider, DocumentHighlightProvider, DocumentDropEditProvider, DocumentPasteEditProvider, DocumentRangeFormattingEditProvider, DocumentRangeSemanticTokensProvider, DocumentSemanticTokensProvider, DocumentSymbolProvider, EvaluatableExpressionProvider, FoldingRangeProvider, HoverProvider, ImplementationProvider, InlayHintsProvider, InlineCompletionsProvider, InlineValuesProvider, LinkedEditingRangeProvider, LinkProvider, MultiDocumentHighlightProvider, NewSymbolNamesProvider, OnTypeFormattingEditProvider, ReferenceProvider, RenameProvider, SelectionRangeProvider, SignatureHelpProvider, TypeDefinitionProvider, InlineEditProvider } from "../languages.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
const ILanguageFeaturesService = createDecorator("ILanguageFeaturesService");
export {
  ILanguageFeaturesService
};
//# sourceMappingURL=languageFeatures.js.map
