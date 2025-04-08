var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Color } from "../../../base/common/color.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { Position } from "../../common/core/position.js";
import { Range } from "../../common/core/range.js";
import { MetadataConsts } from "../../common/encodedTokenAttributes.js";
import * as languages from "../../common/languages.js";
import { ILanguageExtensionPoint, ILanguageService } from "../../common/languages/language.js";
import { LanguageConfiguration } from "../../common/languages/languageConfiguration.js";
import { ILanguageConfigurationService } from "../../common/languages/languageConfigurationRegistry.js";
import { ModesRegistry } from "../../common/languages/modesRegistry.js";
import { LanguageSelector } from "../../common/languageSelector.js";
import * as model from "../../common/model.js";
import { ILanguageFeaturesService } from "../../common/services/languageFeatures.js";
import * as standaloneEnums from "../../common/standalone/standaloneEnums.js";
import { StandaloneServices } from "./standaloneServices.js";
import { compile } from "../common/monarch/monarchCompile.js";
import { MonarchTokenizer } from "../common/monarch/monarchLexer.js";
import { IMonarchLanguage } from "../common/monarch/monarchTypes.js";
import { IStandaloneThemeService } from "../common/standaloneTheme.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { IMarkerData, IMarkerService } from "../../../platform/markers/common/markers.js";
function register(language) {
  ModesRegistry.registerLanguage(language);
}
__name(register, "register");
function getLanguages() {
  let result = [];
  result = result.concat(ModesRegistry.getLanguages());
  return result;
}
__name(getLanguages, "getLanguages");
function getEncodedLanguageId(languageId) {
  const languageService = StandaloneServices.get(ILanguageService);
  return languageService.languageIdCodec.encodeLanguageId(languageId);
}
__name(getEncodedLanguageId, "getEncodedLanguageId");
function onLanguage(languageId, callback) {
  return StandaloneServices.withServices(() => {
    const languageService = StandaloneServices.get(ILanguageService);
    const disposable = languageService.onDidRequestRichLanguageFeatures((encounteredLanguageId) => {
      if (encounteredLanguageId === languageId) {
        disposable.dispose();
        callback();
      }
    });
    return disposable;
  });
}
__name(onLanguage, "onLanguage");
function onLanguageEncountered(languageId, callback) {
  return StandaloneServices.withServices(() => {
    const languageService = StandaloneServices.get(ILanguageService);
    const disposable = languageService.onDidRequestBasicLanguageFeatures((encounteredLanguageId) => {
      if (encounteredLanguageId === languageId) {
        disposable.dispose();
        callback();
      }
    });
    return disposable;
  });
}
__name(onLanguageEncountered, "onLanguageEncountered");
function setLanguageConfiguration(languageId, configuration) {
  const languageService = StandaloneServices.get(ILanguageService);
  if (!languageService.isRegisteredLanguageId(languageId)) {
    throw new Error(`Cannot set configuration for unknown language ${languageId}`);
  }
  const languageConfigurationService = StandaloneServices.get(ILanguageConfigurationService);
  return languageConfigurationService.register(languageId, configuration, 100);
}
__name(setLanguageConfiguration, "setLanguageConfiguration");
class EncodedTokenizationSupportAdapter {
  static {
    __name(this, "EncodedTokenizationSupportAdapter");
  }
  _languageId;
  _actual;
  constructor(languageId, actual) {
    this._languageId = languageId;
    this._actual = actual;
  }
  dispose() {
  }
  getInitialState() {
    return this._actual.getInitialState();
  }
  tokenize(line, hasEOL, state) {
    if (typeof this._actual.tokenize === "function") {
      return TokenizationSupportAdapter.adaptTokenize(this._languageId, this._actual, line, state);
    }
    throw new Error("Not supported!");
  }
  tokenizeEncoded(line, hasEOL, state) {
    const result = this._actual.tokenizeEncoded(line, state);
    return new languages.EncodedTokenizationResult(result.tokens, result.endState);
  }
}
class TokenizationSupportAdapter {
  constructor(_languageId, _actual, _languageService, _standaloneThemeService) {
    this._languageId = _languageId;
    this._actual = _actual;
    this._languageService = _languageService;
    this._standaloneThemeService = _standaloneThemeService;
  }
  static {
    __name(this, "TokenizationSupportAdapter");
  }
  dispose() {
  }
  getInitialState() {
    return this._actual.getInitialState();
  }
  static _toClassicTokens(tokens, language) {
    const result = [];
    let previousStartIndex = 0;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const t = tokens[i];
      let startIndex = t.startIndex;
      if (i === 0) {
        startIndex = 0;
      } else if (startIndex < previousStartIndex) {
        startIndex = previousStartIndex;
      }
      result[i] = new languages.Token(startIndex, t.scopes, language);
      previousStartIndex = startIndex;
    }
    return result;
  }
  static adaptTokenize(language, actual, line, state) {
    const actualResult = actual.tokenize(line, state);
    const tokens = TokenizationSupportAdapter._toClassicTokens(actualResult.tokens, language);
    let endState;
    if (actualResult.endState.equals(state)) {
      endState = state;
    } else {
      endState = actualResult.endState;
    }
    return new languages.TokenizationResult(tokens, endState);
  }
  tokenize(line, hasEOL, state) {
    return TokenizationSupportAdapter.adaptTokenize(this._languageId, this._actual, line, state);
  }
  _toBinaryTokens(languageIdCodec, tokens) {
    const languageId = languageIdCodec.encodeLanguageId(this._languageId);
    const tokenTheme = this._standaloneThemeService.getColorTheme().tokenTheme;
    const result = [];
    let resultLen = 0;
    let previousStartIndex = 0;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const t = tokens[i];
      const metadata = tokenTheme.match(languageId, t.scopes) | MetadataConsts.BALANCED_BRACKETS_MASK;
      if (resultLen > 0 && result[resultLen - 1] === metadata) {
        continue;
      }
      let startIndex = t.startIndex;
      if (i === 0) {
        startIndex = 0;
      } else if (startIndex < previousStartIndex) {
        startIndex = previousStartIndex;
      }
      result[resultLen++] = startIndex;
      result[resultLen++] = metadata;
      previousStartIndex = startIndex;
    }
    const actualResult = new Uint32Array(resultLen);
    for (let i = 0; i < resultLen; i++) {
      actualResult[i] = result[i];
    }
    return actualResult;
  }
  tokenizeEncoded(line, hasEOL, state) {
    const actualResult = this._actual.tokenize(line, state);
    const tokens = this._toBinaryTokens(this._languageService.languageIdCodec, actualResult.tokens);
    let endState;
    if (actualResult.endState.equals(state)) {
      endState = state;
    } else {
      endState = actualResult.endState;
    }
    return new languages.EncodedTokenizationResult(tokens, endState);
  }
}
function isATokensProvider(provider) {
  return typeof provider.getInitialState === "function";
}
__name(isATokensProvider, "isATokensProvider");
function isEncodedTokensProvider(provider) {
  return "tokenizeEncoded" in provider;
}
__name(isEncodedTokensProvider, "isEncodedTokensProvider");
function isThenable(obj) {
  return obj && typeof obj.then === "function";
}
__name(isThenable, "isThenable");
function setColorMap(colorMap) {
  const standaloneThemeService = StandaloneServices.get(IStandaloneThemeService);
  if (colorMap) {
    const result = [null];
    for (let i = 1, len = colorMap.length; i < len; i++) {
      result[i] = Color.fromHex(colorMap[i]);
    }
    standaloneThemeService.setColorMapOverride(result);
  } else {
    standaloneThemeService.setColorMapOverride(null);
  }
}
__name(setColorMap, "setColorMap");
function createTokenizationSupportAdapter(languageId, provider) {
  if (isEncodedTokensProvider(provider)) {
    return new EncodedTokenizationSupportAdapter(languageId, provider);
  } else {
    return new TokenizationSupportAdapter(
      languageId,
      provider,
      StandaloneServices.get(ILanguageService),
      StandaloneServices.get(IStandaloneThemeService)
    );
  }
}
__name(createTokenizationSupportAdapter, "createTokenizationSupportAdapter");
function registerTokensProviderFactory(languageId, factory) {
  const adaptedFactory = new languages.LazyTokenizationSupport(async () => {
    const result = await Promise.resolve(factory.create());
    if (!result) {
      return null;
    }
    if (isATokensProvider(result)) {
      return createTokenizationSupportAdapter(languageId, result);
    }
    return new MonarchTokenizer(StandaloneServices.get(ILanguageService), StandaloneServices.get(IStandaloneThemeService), languageId, compile(languageId, result), StandaloneServices.get(IConfigurationService));
  });
  return languages.TokenizationRegistry.registerFactory(languageId, adaptedFactory);
}
__name(registerTokensProviderFactory, "registerTokensProviderFactory");
function setTokensProvider(languageId, provider) {
  const languageService = StandaloneServices.get(ILanguageService);
  if (!languageService.isRegisteredLanguageId(languageId)) {
    throw new Error(`Cannot set tokens provider for unknown language ${languageId}`);
  }
  if (isThenable(provider)) {
    return registerTokensProviderFactory(languageId, { create: /* @__PURE__ */ __name(() => provider, "create") });
  }
  return languages.TokenizationRegistry.register(languageId, createTokenizationSupportAdapter(languageId, provider));
}
__name(setTokensProvider, "setTokensProvider");
function setMonarchTokensProvider(languageId, languageDef) {
  const create = /* @__PURE__ */ __name((languageDef2) => {
    return new MonarchTokenizer(StandaloneServices.get(ILanguageService), StandaloneServices.get(IStandaloneThemeService), languageId, compile(languageId, languageDef2), StandaloneServices.get(IConfigurationService));
  }, "create");
  if (isThenable(languageDef)) {
    return registerTokensProviderFactory(languageId, { create: /* @__PURE__ */ __name(() => languageDef, "create") });
  }
  return languages.TokenizationRegistry.register(languageId, create(languageDef));
}
__name(setMonarchTokensProvider, "setMonarchTokensProvider");
function registerReferenceProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.referenceProvider.register(languageSelector, provider);
}
__name(registerReferenceProvider, "registerReferenceProvider");
function registerRenameProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.renameProvider.register(languageSelector, provider);
}
__name(registerRenameProvider, "registerRenameProvider");
function registerNewSymbolNameProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.newSymbolNamesProvider.register(languageSelector, provider);
}
__name(registerNewSymbolNameProvider, "registerNewSymbolNameProvider");
function registerSignatureHelpProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.signatureHelpProvider.register(languageSelector, provider);
}
__name(registerSignatureHelpProvider, "registerSignatureHelpProvider");
function registerHoverProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.hoverProvider.register(languageSelector, {
    provideHover: /* @__PURE__ */ __name(async (model2, position, token, context) => {
      const word = model2.getWordAtPosition(position);
      return Promise.resolve(provider.provideHover(model2, position, token, context)).then((value) => {
        if (!value) {
          return void 0;
        }
        if (!value.range && word) {
          value.range = new Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
        }
        if (!value.range) {
          value.range = new Range(position.lineNumber, position.column, position.lineNumber, position.column);
        }
        return value;
      });
    }, "provideHover")
  });
}
__name(registerHoverProvider, "registerHoverProvider");
function registerDocumentSymbolProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.documentSymbolProvider.register(languageSelector, provider);
}
__name(registerDocumentSymbolProvider, "registerDocumentSymbolProvider");
function registerDocumentHighlightProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.documentHighlightProvider.register(languageSelector, provider);
}
__name(registerDocumentHighlightProvider, "registerDocumentHighlightProvider");
function registerLinkedEditingRangeProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.linkedEditingRangeProvider.register(languageSelector, provider);
}
__name(registerLinkedEditingRangeProvider, "registerLinkedEditingRangeProvider");
function registerDefinitionProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.definitionProvider.register(languageSelector, provider);
}
__name(registerDefinitionProvider, "registerDefinitionProvider");
function registerImplementationProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.implementationProvider.register(languageSelector, provider);
}
__name(registerImplementationProvider, "registerImplementationProvider");
function registerTypeDefinitionProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.typeDefinitionProvider.register(languageSelector, provider);
}
__name(registerTypeDefinitionProvider, "registerTypeDefinitionProvider");
function registerCodeLensProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.codeLensProvider.register(languageSelector, provider);
}
__name(registerCodeLensProvider, "registerCodeLensProvider");
function registerCodeActionProvider(languageSelector, provider, metadata) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.codeActionProvider.register(languageSelector, {
    providedCodeActionKinds: metadata?.providedCodeActionKinds,
    documentation: metadata?.documentation,
    provideCodeActions: /* @__PURE__ */ __name((model2, range, context, token) => {
      const markerService = StandaloneServices.get(IMarkerService);
      const markers = markerService.read({ resource: model2.uri }).filter((m) => {
        return Range.areIntersectingOrTouching(m, range);
      });
      return provider.provideCodeActions(model2, range, { markers, only: context.only, trigger: context.trigger }, token);
    }, "provideCodeActions"),
    resolveCodeAction: provider.resolveCodeAction
  });
}
__name(registerCodeActionProvider, "registerCodeActionProvider");
function registerDocumentFormattingEditProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.documentFormattingEditProvider.register(languageSelector, provider);
}
__name(registerDocumentFormattingEditProvider, "registerDocumentFormattingEditProvider");
function registerDocumentRangeFormattingEditProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.documentRangeFormattingEditProvider.register(languageSelector, provider);
}
__name(registerDocumentRangeFormattingEditProvider, "registerDocumentRangeFormattingEditProvider");
function registerOnTypeFormattingEditProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.onTypeFormattingEditProvider.register(languageSelector, provider);
}
__name(registerOnTypeFormattingEditProvider, "registerOnTypeFormattingEditProvider");
function registerLinkProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.linkProvider.register(languageSelector, provider);
}
__name(registerLinkProvider, "registerLinkProvider");
function registerCompletionItemProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.completionProvider.register(languageSelector, provider);
}
__name(registerCompletionItemProvider, "registerCompletionItemProvider");
function registerColorProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.colorProvider.register(languageSelector, provider);
}
__name(registerColorProvider, "registerColorProvider");
function registerFoldingRangeProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.foldingRangeProvider.register(languageSelector, provider);
}
__name(registerFoldingRangeProvider, "registerFoldingRangeProvider");
function registerDeclarationProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.declarationProvider.register(languageSelector, provider);
}
__name(registerDeclarationProvider, "registerDeclarationProvider");
function registerSelectionRangeProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.selectionRangeProvider.register(languageSelector, provider);
}
__name(registerSelectionRangeProvider, "registerSelectionRangeProvider");
function registerDocumentSemanticTokensProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.documentSemanticTokensProvider.register(languageSelector, provider);
}
__name(registerDocumentSemanticTokensProvider, "registerDocumentSemanticTokensProvider");
function registerDocumentRangeSemanticTokensProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.documentRangeSemanticTokensProvider.register(languageSelector, provider);
}
__name(registerDocumentRangeSemanticTokensProvider, "registerDocumentRangeSemanticTokensProvider");
function registerInlineCompletionsProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.inlineCompletionsProvider.register(languageSelector, provider);
}
__name(registerInlineCompletionsProvider, "registerInlineCompletionsProvider");
function registerInlineEditProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.inlineEditProvider.register(languageSelector, provider);
}
__name(registerInlineEditProvider, "registerInlineEditProvider");
function registerInlayHintsProvider(languageSelector, provider) {
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
  return languageFeaturesService.inlayHintsProvider.register(languageSelector, provider);
}
__name(registerInlayHintsProvider, "registerInlayHintsProvider");
function createMonacoLanguagesAPI() {
  return {
    register,
    getLanguages,
    onLanguage,
    onLanguageEncountered,
    getEncodedLanguageId,
    // provider methods
    setLanguageConfiguration,
    setColorMap,
    registerTokensProviderFactory,
    setTokensProvider,
    setMonarchTokensProvider,
    registerReferenceProvider,
    registerRenameProvider,
    registerNewSymbolNameProvider,
    registerCompletionItemProvider,
    registerSignatureHelpProvider,
    registerHoverProvider,
    registerDocumentSymbolProvider,
    registerDocumentHighlightProvider,
    registerLinkedEditingRangeProvider,
    registerDefinitionProvider,
    registerImplementationProvider,
    registerTypeDefinitionProvider,
    registerCodeLensProvider,
    registerCodeActionProvider,
    registerDocumentFormattingEditProvider,
    registerDocumentRangeFormattingEditProvider,
    registerOnTypeFormattingEditProvider,
    registerLinkProvider,
    registerColorProvider,
    registerFoldingRangeProvider,
    registerDeclarationProvider,
    registerSelectionRangeProvider,
    registerDocumentSemanticTokensProvider,
    registerDocumentRangeSemanticTokensProvider,
    registerInlineCompletionsProvider,
    registerInlineEditProvider,
    registerInlayHintsProvider,
    // enums
    DocumentHighlightKind: standaloneEnums.DocumentHighlightKind,
    CompletionItemKind: standaloneEnums.CompletionItemKind,
    CompletionItemTag: standaloneEnums.CompletionItemTag,
    CompletionItemInsertTextRule: standaloneEnums.CompletionItemInsertTextRule,
    SymbolKind: standaloneEnums.SymbolKind,
    SymbolTag: standaloneEnums.SymbolTag,
    IndentAction: standaloneEnums.IndentAction,
    CompletionTriggerKind: standaloneEnums.CompletionTriggerKind,
    SignatureHelpTriggerKind: standaloneEnums.SignatureHelpTriggerKind,
    InlayHintKind: standaloneEnums.InlayHintKind,
    InlineCompletionTriggerKind: standaloneEnums.InlineCompletionTriggerKind,
    InlineEditTriggerKind: standaloneEnums.InlineEditTriggerKind,
    CodeActionTriggerType: standaloneEnums.CodeActionTriggerType,
    NewSymbolNameTag: standaloneEnums.NewSymbolNameTag,
    NewSymbolNameTriggerKind: standaloneEnums.NewSymbolNameTriggerKind,
    PartialAcceptTriggerKind: standaloneEnums.PartialAcceptTriggerKind,
    HoverVerbosityAction: standaloneEnums.HoverVerbosityAction,
    // classes
    FoldingRangeKind: languages.FoldingRangeKind,
    SelectedSuggestionInfo: languages.SelectedSuggestionInfo
  };
}
__name(createMonacoLanguagesAPI, "createMonacoLanguagesAPI");
export {
  EncodedTokenizationSupportAdapter,
  TokenizationSupportAdapter,
  createMonacoLanguagesAPI,
  getEncodedLanguageId,
  getLanguages,
  onLanguage,
  onLanguageEncountered,
  register,
  registerCodeActionProvider,
  registerCodeLensProvider,
  registerColorProvider,
  registerCompletionItemProvider,
  registerDeclarationProvider,
  registerDefinitionProvider,
  registerDocumentFormattingEditProvider,
  registerDocumentHighlightProvider,
  registerDocumentRangeFormattingEditProvider,
  registerDocumentRangeSemanticTokensProvider,
  registerDocumentSemanticTokensProvider,
  registerDocumentSymbolProvider,
  registerFoldingRangeProvider,
  registerHoverProvider,
  registerImplementationProvider,
  registerInlayHintsProvider,
  registerInlineCompletionsProvider,
  registerInlineEditProvider,
  registerLinkProvider,
  registerLinkedEditingRangeProvider,
  registerNewSymbolNameProvider,
  registerOnTypeFormattingEditProvider,
  registerReferenceProvider,
  registerRenameProvider,
  registerSelectionRangeProvider,
  registerSignatureHelpProvider,
  registerTokensProviderFactory,
  registerTypeDefinitionProvider,
  setColorMap,
  setLanguageConfiguration,
  setMonarchTokensProvider,
  setTokensProvider
};
//# sourceMappingURL=standaloneLanguages.js.map
