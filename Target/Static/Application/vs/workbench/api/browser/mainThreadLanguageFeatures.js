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
var MainThreadLanguageFeatures_1;
import { createStringDataTransferItem, VSDataTransfer } from "../../../base/common/dataTransfer.js";
import { CancellationError } from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { HierarchicalKind } from "../../../base/common/hierarchicalKind.js";
import { combinedDisposable, Disposable, DisposableMap, toDisposable } from "../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../base/common/map.js";
import { revive } from "../../../base/common/marshalling.js";
import { mixin } from "../../../base/common/objects.js";
import { URI } from "../../../base/common/uri.js";
import * as languages from "../../../editor/common/languages.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { ILanguageConfigurationService } from "../../../editor/common/languages/languageConfigurationRegistry.js";
import { ILanguageFeaturesService } from "../../../editor/common/services/languageFeatures.js";
import { decodeSemanticTokensDto } from "../../../editor/common/services/semanticTokensDto.js";
import { IUriIdentityService } from "../../../platform/uriIdentity/common/uriIdentity.js";
import { reviveWorkspaceEditDto } from "./mainThreadBulkEdits.js";
import * as typeConvert from "../common/extHostTypeConverters.js";
import { DataTransferFileCache } from "../common/shared/dataTransferCache.js";
import * as callh from "../../contrib/callHierarchy/common/callHierarchy.js";
import * as search from "../../contrib/search/common/search.js";
import * as typeh from "../../contrib/typeHierarchy/common/typeHierarchy.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
let MainThreadLanguageFeatures = MainThreadLanguageFeatures_1 = class MainThreadLanguageFeatures2 extends Disposable {
  static {
    __name(this, "MainThreadLanguageFeatures");
  }
  constructor(extHostContext, _languageService, _languageConfigurationService, _languageFeaturesService, _uriIdentService) {
    super();
    this._languageService = _languageService;
    this._languageConfigurationService = _languageConfigurationService;
    this._languageFeaturesService = _languageFeaturesService;
    this._uriIdentService = _uriIdentService;
    this._registrations = this._register(new DisposableMap());
    this._pasteEditProviders = /* @__PURE__ */ new Map();
    this._documentOnDropEditProviders = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostLanguageFeatures);
    if (this._languageService) {
      const updateAllWordDefinitions = /* @__PURE__ */ __name(() => {
        const wordDefinitionDtos = [];
        for (const languageId of _languageService.getRegisteredLanguageIds()) {
          const wordDefinition = this._languageConfigurationService.getLanguageConfiguration(languageId).getWordDefinition();
          wordDefinitionDtos.push({
            languageId,
            regexSource: wordDefinition.source,
            regexFlags: wordDefinition.flags
          });
        }
        this._proxy.$setWordDefinitions(wordDefinitionDtos);
      }, "updateAllWordDefinitions");
      this._register(this._languageConfigurationService.onDidChange((e) => {
        if (!e.languageId) {
          updateAllWordDefinitions();
        } else {
          const wordDefinition = this._languageConfigurationService.getLanguageConfiguration(e.languageId).getWordDefinition();
          this._proxy.$setWordDefinitions([{
            languageId: e.languageId,
            regexSource: wordDefinition.source,
            regexFlags: wordDefinition.flags
          }]);
        }
      }));
      updateAllWordDefinitions();
    }
  }
  $unregister(handle) {
    this._registrations.deleteAndDispose(handle);
  }
  static _reviveLocationDto(data) {
    if (!data) {
      return data;
    } else if (Array.isArray(data)) {
      data.forEach((l) => MainThreadLanguageFeatures_1._reviveLocationDto(l));
      return data;
    } else {
      data.uri = URI.revive(data.uri);
      return data;
    }
  }
  static _reviveLocationLinkDto(data) {
    if (!data) {
      return data;
    } else if (Array.isArray(data)) {
      data.forEach((l) => MainThreadLanguageFeatures_1._reviveLocationLinkDto(l));
      return data;
    } else {
      data.uri = URI.revive(data.uri);
      return data;
    }
  }
  static _reviveWorkspaceSymbolDto(data) {
    if (!data) {
      return data;
    } else if (Array.isArray(data)) {
      data.forEach(MainThreadLanguageFeatures_1._reviveWorkspaceSymbolDto);
      return data;
    } else {
      data.location = MainThreadLanguageFeatures_1._reviveLocationDto(data.location);
      return data;
    }
  }
  static _reviveCodeActionDto(data, uriIdentService) {
    data?.forEach((code) => reviveWorkspaceEditDto(code.edit, uriIdentService));
    return data;
  }
  static _reviveLinkDTO(data) {
    if (data.url && typeof data.url !== "string") {
      data.url = URI.revive(data.url);
    }
    return data;
  }
  static _reviveCallHierarchyItemDto(data) {
    if (data) {
      data.uri = URI.revive(data.uri);
    }
    return data;
  }
  static _reviveTypeHierarchyItemDto(data) {
    if (data) {
      data.uri = URI.revive(data.uri);
    }
    return data;
  }
  //#endregion
  // --- outline
  $registerDocumentSymbolProvider(handle, selector, displayName) {
    this._registrations.set(handle, this._languageFeaturesService.documentSymbolProvider.register(selector, {
      displayName,
      provideDocumentSymbols: /* @__PURE__ */ __name((model, token) => {
        return this._proxy.$provideDocumentSymbols(handle, model.uri, token);
      }, "provideDocumentSymbols")
    }));
  }
  // --- code lens
  $registerCodeLensSupport(handle, selector, eventHandle) {
    const provider = {
      provideCodeLenses: /* @__PURE__ */ __name(async (model, token) => {
        const listDto = await this._proxy.$provideCodeLenses(handle, model.uri, token);
        if (!listDto) {
          return void 0;
        }
        return {
          lenses: listDto.lenses,
          dispose: /* @__PURE__ */ __name(() => listDto.cacheId && this._proxy.$releaseCodeLenses(handle, listDto.cacheId), "dispose")
        };
      }, "provideCodeLenses"),
      resolveCodeLens: /* @__PURE__ */ __name(async (model, codeLens, token) => {
        const result = await this._proxy.$resolveCodeLens(handle, codeLens, token);
        if (!result) {
          return void 0;
        }
        return {
          ...result,
          range: model.validateRange(result.range)
        };
      }, "resolveCodeLens")
    };
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._registrations.set(eventHandle, emitter);
      provider.onDidChange = emitter.event;
    }
    this._registrations.set(handle, this._languageFeaturesService.codeLensProvider.register(selector, provider));
  }
  $emitCodeLensEvent(eventHandle, event) {
    const obj = this._registrations.get(eventHandle);
    if (obj instanceof Emitter) {
      obj.fire(event);
    }
  }
  // --- declaration
  $registerDefinitionSupport(handle, selector) {
    this._registrations.set(handle, this._languageFeaturesService.definitionProvider.register(selector, {
      provideDefinition: /* @__PURE__ */ __name((model, position, token) => {
        return this._proxy.$provideDefinition(handle, model.uri, position, token).then(MainThreadLanguageFeatures_1._reviveLocationLinkDto);
      }, "provideDefinition")
    }));
  }
  $registerDeclarationSupport(handle, selector) {
    this._registrations.set(handle, this._languageFeaturesService.declarationProvider.register(selector, {
      provideDeclaration: /* @__PURE__ */ __name((model, position, token) => {
        return this._proxy.$provideDeclaration(handle, model.uri, position, token).then(MainThreadLanguageFeatures_1._reviveLocationLinkDto);
      }, "provideDeclaration")
    }));
  }
  $registerImplementationSupport(handle, selector) {
    this._registrations.set(handle, this._languageFeaturesService.implementationProvider.register(selector, {
      provideImplementation: /* @__PURE__ */ __name((model, position, token) => {
        return this._proxy.$provideImplementation(handle, model.uri, position, token).then(MainThreadLanguageFeatures_1._reviveLocationLinkDto);
      }, "provideImplementation")
    }));
  }
  $registerTypeDefinitionSupport(handle, selector) {
    this._registrations.set(handle, this._languageFeaturesService.typeDefinitionProvider.register(selector, {
      provideTypeDefinition: /* @__PURE__ */ __name((model, position, token) => {
        return this._proxy.$provideTypeDefinition(handle, model.uri, position, token).then(MainThreadLanguageFeatures_1._reviveLocationLinkDto);
      }, "provideTypeDefinition")
    }));
  }
  // --- extra info
  $registerHoverProvider(handle, selector) {
    this._registrations.set(handle, this._languageFeaturesService.hoverProvider.register(selector, {
      provideHover: /* @__PURE__ */ __name(async (model, position, token, context) => {
        const serializedContext = {
          verbosityRequest: context?.verbosityRequest ? {
            verbosityDelta: context.verbosityRequest.verbosityDelta,
            previousHover: { id: context.verbosityRequest.previousHover.id }
          } : void 0
        };
        const hover = await this._proxy.$provideHover(handle, model.uri, position, serializedContext, token);
        return hover;
      }, "provideHover")
    }));
  }
  // --- debug hover
  $registerEvaluatableExpressionProvider(handle, selector) {
    this._registrations.set(handle, this._languageFeaturesService.evaluatableExpressionProvider.register(selector, {
      provideEvaluatableExpression: /* @__PURE__ */ __name((model, position, token) => {
        return this._proxy.$provideEvaluatableExpression(handle, model.uri, position, token);
      }, "provideEvaluatableExpression")
    }));
  }
  // --- inline values
  $registerInlineValuesProvider(handle, selector, eventHandle) {
    const provider = {
      provideInlineValues: /* @__PURE__ */ __name((model, viewPort, context, token) => {
        return this._proxy.$provideInlineValues(handle, model.uri, viewPort, context, token);
      }, "provideInlineValues")
    };
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._registrations.set(eventHandle, emitter);
      provider.onDidChangeInlineValues = emitter.event;
    }
    this._registrations.set(handle, this._languageFeaturesService.inlineValuesProvider.register(selector, provider));
  }
  $emitInlineValuesEvent(eventHandle, event) {
    const obj = this._registrations.get(eventHandle);
    if (obj instanceof Emitter) {
      obj.fire(event);
    }
  }
  // --- occurrences
  $registerDocumentHighlightProvider(handle, selector) {
    this._registrations.set(handle, this._languageFeaturesService.documentHighlightProvider.register(selector, {
      provideDocumentHighlights: /* @__PURE__ */ __name((model, position, token) => {
        return this._proxy.$provideDocumentHighlights(handle, model.uri, position, token);
      }, "provideDocumentHighlights")
    }));
  }
  $registerMultiDocumentHighlightProvider(handle, selector) {
    this._registrations.set(handle, this._languageFeaturesService.multiDocumentHighlightProvider.register(selector, {
      selector,
      provideMultiDocumentHighlights: /* @__PURE__ */ __name((model, position, otherModels, token) => {
        return this._proxy.$provideMultiDocumentHighlights(handle, model.uri, position, otherModels.map((model2) => model2.uri), token).then((dto) => {
          if (dto === void 0 || dto === null) {
            return void 0;
          }
          const result = new ResourceMap();
          dto?.forEach((value) => {
            const uri = URI.revive(value.uri);
            if (result.has(uri)) {
              result.get(uri).push(...value.highlights);
            } else {
              result.set(uri, value.highlights);
            }
          });
          return result;
        });
      }, "provideMultiDocumentHighlights")
    }));
  }
  // --- linked editing
  $registerLinkedEditingRangeProvider(handle, selector) {
    this._registrations.set(handle, this._languageFeaturesService.linkedEditingRangeProvider.register(selector, {
      provideLinkedEditingRanges: /* @__PURE__ */ __name(async (model, position, token) => {
        const res = await this._proxy.$provideLinkedEditingRanges(handle, model.uri, position, token);
        if (res) {
          return {
            ranges: res.ranges,
            wordPattern: res.wordPattern ? MainThreadLanguageFeatures_1._reviveRegExp(res.wordPattern) : void 0
          };
        }
        return void 0;
      }, "provideLinkedEditingRanges")
    }));
  }
  // --- references
  $registerReferenceSupport(handle, selector) {
    this._registrations.set(handle, this._languageFeaturesService.referenceProvider.register(selector, {
      provideReferences: /* @__PURE__ */ __name((model, position, context, token) => {
        return this._proxy.$provideReferences(handle, model.uri, position, context, token).then(MainThreadLanguageFeatures_1._reviveLocationDto);
      }, "provideReferences")
    }));
  }
  // --- code actions
  $registerCodeActionSupport(handle, selector, metadata, displayName, extensionId, supportsResolve) {
    const provider = {
      provideCodeActions: /* @__PURE__ */ __name(async (model, rangeOrSelection, context, token) => {
        const listDto = await this._proxy.$provideCodeActions(handle, model.uri, rangeOrSelection, context, token);
        if (!listDto) {
          return void 0;
        }
        return {
          actions: MainThreadLanguageFeatures_1._reviveCodeActionDto(listDto.actions, this._uriIdentService),
          dispose: /* @__PURE__ */ __name(() => {
            if (typeof listDto.cacheId === "number") {
              this._proxy.$releaseCodeActions(handle, listDto.cacheId);
            }
          }, "dispose")
        };
      }, "provideCodeActions"),
      providedCodeActionKinds: metadata.providedKinds,
      documentation: metadata.documentation,
      displayName,
      extensionId
    };
    if (supportsResolve) {
      provider.resolveCodeAction = async (codeAction, token) => {
        const resolved = await this._proxy.$resolveCodeAction(handle, codeAction.cacheId, token);
        if (resolved.edit) {
          codeAction.edit = reviveWorkspaceEditDto(resolved.edit, this._uriIdentService);
        }
        if (resolved.command) {
          codeAction.command = resolved.command;
        }
        return codeAction;
      };
    }
    this._registrations.set(handle, this._languageFeaturesService.codeActionProvider.register(selector, provider));
  }
  $registerPasteEditProvider(handle, selector, metadata) {
    const provider = new MainThreadPasteEditProvider(handle, this._proxy, metadata, this._uriIdentService);
    this._pasteEditProviders.set(handle, provider);
    this._registrations.set(handle, combinedDisposable(this._languageFeaturesService.documentPasteEditProvider.register(selector, provider), toDisposable(() => this._pasteEditProviders.delete(handle))));
  }
  $resolvePasteFileData(handle, requestId, dataId) {
    const provider = this._pasteEditProviders.get(handle);
    if (!provider) {
      throw new Error("Could not find provider");
    }
    return provider.resolveFileData(requestId, dataId);
  }
  // --- formatting
  $registerDocumentFormattingSupport(handle, selector, extensionId, displayName) {
    this._registrations.set(handle, this._languageFeaturesService.documentFormattingEditProvider.register(selector, {
      extensionId,
      displayName,
      provideDocumentFormattingEdits: /* @__PURE__ */ __name((model, options, token) => {
        return this._proxy.$provideDocumentFormattingEdits(handle, model.uri, options, token);
      }, "provideDocumentFormattingEdits")
    }));
  }
  $registerRangeFormattingSupport(handle, selector, extensionId, displayName, supportsRanges) {
    this._registrations.set(handle, this._languageFeaturesService.documentRangeFormattingEditProvider.register(selector, {
      extensionId,
      displayName,
      provideDocumentRangeFormattingEdits: /* @__PURE__ */ __name((model, range, options, token) => {
        return this._proxy.$provideDocumentRangeFormattingEdits(handle, model.uri, range, options, token);
      }, "provideDocumentRangeFormattingEdits"),
      provideDocumentRangesFormattingEdits: !supportsRanges ? void 0 : (model, ranges, options, token) => {
        return this._proxy.$provideDocumentRangesFormattingEdits(handle, model.uri, ranges, options, token);
      }
    }));
  }
  $registerOnTypeFormattingSupport(handle, selector, autoFormatTriggerCharacters, extensionId) {
    this._registrations.set(handle, this._languageFeaturesService.onTypeFormattingEditProvider.register(selector, {
      extensionId,
      autoFormatTriggerCharacters,
      provideOnTypeFormattingEdits: /* @__PURE__ */ __name((model, position, ch, options, token) => {
        return this._proxy.$provideOnTypeFormattingEdits(handle, model.uri, position, ch, options, token);
      }, "provideOnTypeFormattingEdits")
    }));
  }
  // --- navigate type
  $registerNavigateTypeSupport(handle, supportsResolve) {
    let lastResultId;
    const provider = {
      provideWorkspaceSymbols: /* @__PURE__ */ __name(async (search2, token) => {
        const result = await this._proxy.$provideWorkspaceSymbols(handle, search2, token);
        if (lastResultId !== void 0) {
          this._proxy.$releaseWorkspaceSymbols(handle, lastResultId);
        }
        lastResultId = result.cacheId;
        return MainThreadLanguageFeatures_1._reviveWorkspaceSymbolDto(result.symbols);
      }, "provideWorkspaceSymbols")
    };
    if (supportsResolve) {
      provider.resolveWorkspaceSymbol = async (item, token) => {
        const resolvedItem = await this._proxy.$resolveWorkspaceSymbol(handle, item, token);
        return resolvedItem && MainThreadLanguageFeatures_1._reviveWorkspaceSymbolDto(resolvedItem);
      };
    }
    this._registrations.set(handle, search.WorkspaceSymbolProviderRegistry.register(provider));
  }
  // --- rename
  $registerRenameSupport(handle, selector, supportResolveLocation) {
    this._registrations.set(handle, this._languageFeaturesService.renameProvider.register(selector, {
      provideRenameEdits: /* @__PURE__ */ __name((model, position, newName, token) => {
        return this._proxy.$provideRenameEdits(handle, model.uri, position, newName, token).then((data) => reviveWorkspaceEditDto(data, this._uriIdentService));
      }, "provideRenameEdits"),
      resolveRenameLocation: supportResolveLocation ? (model, position, token) => this._proxy.$resolveRenameLocation(handle, model.uri, position, token) : void 0
    }));
  }
  $registerNewSymbolNamesProvider(handle, selector) {
    this._registrations.set(handle, this._languageFeaturesService.newSymbolNamesProvider.register(selector, {
      supportsAutomaticNewSymbolNamesTriggerKind: this._proxy.$supportsAutomaticNewSymbolNamesTriggerKind(handle),
      provideNewSymbolNames: /* @__PURE__ */ __name((model, range, triggerKind, token) => {
        return this._proxy.$provideNewSymbolNames(handle, model.uri, range, triggerKind, token);
      }, "provideNewSymbolNames")
    }));
  }
  // --- semantic tokens
  $registerDocumentSemanticTokensProvider(handle, selector, legend, eventHandle) {
    let event = void 0;
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._registrations.set(eventHandle, emitter);
      event = emitter.event;
    }
    this._registrations.set(handle, this._languageFeaturesService.documentSemanticTokensProvider.register(selector, new MainThreadDocumentSemanticTokensProvider(this._proxy, handle, legend, event)));
  }
  $emitDocumentSemanticTokensEvent(eventHandle) {
    const obj = this._registrations.get(eventHandle);
    if (obj instanceof Emitter) {
      obj.fire(void 0);
    }
  }
  $registerDocumentRangeSemanticTokensProvider(handle, selector, legend) {
    this._registrations.set(handle, this._languageFeaturesService.documentRangeSemanticTokensProvider.register(selector, new MainThreadDocumentRangeSemanticTokensProvider(this._proxy, handle, legend)));
  }
  // --- suggest
  static _inflateSuggestDto(defaultRange, data, extensionId) {
    const label = data[
      "a"
      /* ISuggestDataDtoField.label */
    ];
    const commandId = data[
      "o"
      /* ISuggestDataDtoField.commandId */
    ];
    const commandIdent = data[
      "n"
      /* ISuggestDataDtoField.commandIdent */
    ];
    const commitChars = data[
      "k"
      /* ISuggestDataDtoField.commitCharacters */
    ];
    let command;
    if (commandId) {
      command = {
        $ident: commandIdent,
        id: commandId,
        title: "",
        arguments: commandIdent ? [commandIdent] : data[
          "p"
          /* ISuggestDataDtoField.commandArguments */
        ]
        // Automatically fill in ident as first argument
      };
    }
    return {
      label,
      extensionId,
      kind: data[
        "b"
        /* ISuggestDataDtoField.kind */
      ] ?? 9,
      tags: data[
        "m"
        /* ISuggestDataDtoField.kindModifier */
      ],
      detail: data[
        "c"
        /* ISuggestDataDtoField.detail */
      ],
      documentation: data[
        "d"
        /* ISuggestDataDtoField.documentation */
      ],
      sortText: data[
        "e"
        /* ISuggestDataDtoField.sortText */
      ],
      filterText: data[
        "f"
        /* ISuggestDataDtoField.filterText */
      ],
      preselect: data[
        "g"
        /* ISuggestDataDtoField.preselect */
      ],
      insertText: data[
        "h"
        /* ISuggestDataDtoField.insertText */
      ] ?? (typeof label === "string" ? label : label.label),
      range: data[
        "j"
        /* ISuggestDataDtoField.range */
      ] ?? defaultRange,
      insertTextRules: data[
        "i"
        /* ISuggestDataDtoField.insertTextRules */
      ],
      commitCharacters: commitChars ? Array.from(commitChars) : void 0,
      additionalTextEdits: data[
        "l"
        /* ISuggestDataDtoField.additionalTextEdits */
      ],
      command,
      // not-standard
      _id: data.x
    };
  }
  $registerCompletionsProvider(handle, selector, triggerCharacters, supportsResolveDetails, extensionId) {
    const provider = {
      triggerCharacters,
      _debugDisplayName: `${extensionId.value}(${triggerCharacters.join("")})`,
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, context, token) => {
        const result = await this._proxy.$provideCompletionItems(handle, model.uri, position, context, token);
        if (!result) {
          return result;
        }
        return {
          suggestions: result[
            "b"
            /* ISuggestResultDtoField.completions */
          ].map((d) => MainThreadLanguageFeatures_1._inflateSuggestDto(result[
            "a"
            /* ISuggestResultDtoField.defaultRanges */
          ], d, extensionId)),
          incomplete: result[
            "c"
            /* ISuggestResultDtoField.isIncomplete */
          ] || false,
          duration: result[
            "d"
            /* ISuggestResultDtoField.duration */
          ],
          dispose: /* @__PURE__ */ __name(() => {
            if (typeof result.x === "number") {
              this._proxy.$releaseCompletionItems(handle, result.x);
            }
          }, "dispose")
        };
      }, "provideCompletionItems")
    };
    if (supportsResolveDetails) {
      provider.resolveCompletionItem = (suggestion, token) => {
        return this._proxy.$resolveCompletionItem(handle, suggestion._id, token).then((result) => {
          if (!result) {
            return suggestion;
          }
          const newSuggestion = MainThreadLanguageFeatures_1._inflateSuggestDto(suggestion.range, result, extensionId);
          return mixin(suggestion, newSuggestion, true);
        });
      };
    }
    this._registrations.set(handle, this._languageFeaturesService.completionProvider.register(selector, provider));
  }
  $registerInlineCompletionsSupport(handle, selector, supportsHandleEvents, extensionId, yieldsToExtensionIds, displayName, debounceDelayMs, eventHandle) {
    const provider = {
      provideInlineCompletions: /* @__PURE__ */ __name(async (model, position, context, token) => {
        return this._proxy.$provideInlineCompletions(handle, model.uri, position, context, token);
      }, "provideInlineCompletions"),
      provideInlineEditsForRange: /* @__PURE__ */ __name(async (model, range, context, token) => {
        return this._proxy.$provideInlineEditsForRange(handle, model.uri, range, context, token);
      }, "provideInlineEditsForRange"),
      handleItemDidShow: /* @__PURE__ */ __name(async (completions, item, updatedInsertText) => {
        if (supportsHandleEvents) {
          await this._proxy.$handleInlineCompletionDidShow(handle, completions.pid, item.idx, updatedInsertText);
        }
      }, "handleItemDidShow"),
      handlePartialAccept: /* @__PURE__ */ __name(async (completions, item, acceptedCharacters, info) => {
        if (supportsHandleEvents) {
          await this._proxy.$handleInlineCompletionPartialAccept(handle, completions.pid, item.idx, acceptedCharacters, info);
        }
      }, "handlePartialAccept"),
      handleEndOfLifetime: /* @__PURE__ */ __name(async (completions, item, reason) => {
        function mapReason(reason2, f) {
          if (reason2.kind === languages.InlineCompletionEndOfLifeReasonKind.Ignored) {
            return {
              ...reason2,
              supersededBy: reason2.supersededBy ? f(reason2.supersededBy) : void 0
            };
          }
          return reason2;
        }
        __name(mapReason, "mapReason");
        if (supportsHandleEvents) {
          await this._proxy.$handleInlineCompletionEndOfLifetime(handle, completions.pid, item.idx, mapReason(reason, (i) => ({ pid: completions.pid, idx: i.idx })));
        }
      }, "handleEndOfLifetime"),
      freeInlineCompletions: /* @__PURE__ */ __name((completions) => {
        this._proxy.$freeInlineCompletionsList(handle, completions.pid);
      }, "freeInlineCompletions"),
      handleRejection: /* @__PURE__ */ __name(async (completions, item) => {
        if (supportsHandleEvents) {
          await this._proxy.$handleInlineCompletionRejection(handle, completions.pid, item.idx);
        }
      }, "handleRejection"),
      groupId: extensionId,
      yieldsToGroupIds: yieldsToExtensionIds,
      debounceDelayMs,
      displayName,
      toString() {
        return `InlineCompletionsProvider(${extensionId})`;
      }
    };
    this._registrations.set(handle, this._languageFeaturesService.inlineCompletionsProvider.register(selector, provider));
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._registrations.set(eventHandle, emitter);
      provider.onDidChangeInlineCompletions = emitter.event;
    }
  }
  $emitInlineCompletionsChange(handle) {
    const obj = this._registrations.get(handle);
    if (obj instanceof Emitter) {
      obj.fire(void 0);
    }
  }
  $registerInlineEditProvider(handle, selector, extensionId, displayName) {
    const provider = {
      displayName,
      provideInlineEdit: /* @__PURE__ */ __name(async (model, context, token) => {
        return this._proxy.$provideInlineEdit(handle, model.uri, context, token);
      }, "provideInlineEdit"),
      freeInlineEdit: /* @__PURE__ */ __name((edit) => {
        this._proxy.$freeInlineEdit(handle, edit.pid);
      }, "freeInlineEdit")
    };
    this._registrations.set(handle, this._languageFeaturesService.inlineEditProvider.register(selector, provider));
  }
  // --- parameter hints
  $registerSignatureHelpProvider(handle, selector, metadata) {
    this._registrations.set(handle, this._languageFeaturesService.signatureHelpProvider.register(selector, {
      signatureHelpTriggerCharacters: metadata.triggerCharacters,
      signatureHelpRetriggerCharacters: metadata.retriggerCharacters,
      provideSignatureHelp: /* @__PURE__ */ __name(async (model, position, token, context) => {
        const result = await this._proxy.$provideSignatureHelp(handle, model.uri, position, context, token);
        if (!result) {
          return void 0;
        }
        return {
          value: result,
          dispose: /* @__PURE__ */ __name(() => {
            this._proxy.$releaseSignatureHelp(handle, result.id);
          }, "dispose")
        };
      }, "provideSignatureHelp")
    }));
  }
  // --- inline hints
  $registerInlayHintsProvider(handle, selector, supportsResolve, eventHandle, displayName) {
    const provider = {
      displayName,
      provideInlayHints: /* @__PURE__ */ __name(async (model, range, token) => {
        const result = await this._proxy.$provideInlayHints(handle, model.uri, range, token);
        if (!result) {
          return;
        }
        return {
          hints: revive(result.hints),
          dispose: /* @__PURE__ */ __name(() => {
            if (result.cacheId) {
              this._proxy.$releaseInlayHints(handle, result.cacheId);
            }
          }, "dispose")
        };
      }, "provideInlayHints")
    };
    if (supportsResolve) {
      provider.resolveInlayHint = async (hint, token) => {
        const dto = hint;
        if (!dto.cacheId) {
          return hint;
        }
        const result = await this._proxy.$resolveInlayHint(handle, dto.cacheId, token);
        if (token.isCancellationRequested) {
          throw new CancellationError();
        }
        if (!result) {
          return hint;
        }
        return {
          ...hint,
          tooltip: result.tooltip,
          label: revive(result.label),
          textEdits: result.textEdits
        };
      };
    }
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._registrations.set(eventHandle, emitter);
      provider.onDidChangeInlayHints = emitter.event;
    }
    this._registrations.set(handle, this._languageFeaturesService.inlayHintsProvider.register(selector, provider));
  }
  $emitInlayHintsEvent(eventHandle) {
    const obj = this._registrations.get(eventHandle);
    if (obj instanceof Emitter) {
      obj.fire(void 0);
    }
  }
  // --- links
  $registerDocumentLinkProvider(handle, selector, supportsResolve) {
    const provider = {
      provideLinks: /* @__PURE__ */ __name((model, token) => {
        return this._proxy.$provideDocumentLinks(handle, model.uri, token).then((dto) => {
          if (!dto) {
            return void 0;
          }
          return {
            links: dto.links.map(MainThreadLanguageFeatures_1._reviveLinkDTO),
            dispose: /* @__PURE__ */ __name(() => {
              if (typeof dto.cacheId === "number") {
                this._proxy.$releaseDocumentLinks(handle, dto.cacheId);
              }
            }, "dispose")
          };
        });
      }, "provideLinks")
    };
    if (supportsResolve) {
      provider.resolveLink = (link, token) => {
        const dto = link;
        if (!dto.cacheId) {
          return link;
        }
        return this._proxy.$resolveDocumentLink(handle, dto.cacheId, token).then((obj) => {
          return obj && MainThreadLanguageFeatures_1._reviveLinkDTO(obj);
        });
      };
    }
    this._registrations.set(handle, this._languageFeaturesService.linkProvider.register(selector, provider));
  }
  // --- colors
  $registerDocumentColorProvider(handle, selector) {
    const proxy = this._proxy;
    this._registrations.set(handle, this._languageFeaturesService.colorProvider.register(selector, {
      provideDocumentColors: /* @__PURE__ */ __name((model, token) => {
        return proxy.$provideDocumentColors(handle, model.uri, token).then((documentColors) => {
          return documentColors.map((documentColor) => {
            const [red, green, blue, alpha] = documentColor.color;
            const color = {
              red,
              green,
              blue,
              alpha
            };
            return {
              color,
              range: documentColor.range
            };
          });
        });
      }, "provideDocumentColors"),
      provideColorPresentations: /* @__PURE__ */ __name((model, colorInfo, token) => {
        return proxy.$provideColorPresentations(handle, model.uri, {
          color: [colorInfo.color.red, colorInfo.color.green, colorInfo.color.blue, colorInfo.color.alpha],
          range: colorInfo.range
        }, token);
      }, "provideColorPresentations")
    }));
  }
  // --- folding
  $registerFoldingRangeProvider(handle, selector, extensionId, eventHandle) {
    const provider = {
      id: extensionId.value,
      provideFoldingRanges: /* @__PURE__ */ __name((model, context, token) => {
        return this._proxy.$provideFoldingRanges(handle, model.uri, context, token);
      }, "provideFoldingRanges")
    };
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._registrations.set(eventHandle, emitter);
      provider.onDidChange = emitter.event;
    }
    this._registrations.set(handle, this._languageFeaturesService.foldingRangeProvider.register(selector, provider));
  }
  $emitFoldingRangeEvent(eventHandle, event) {
    const obj = this._registrations.get(eventHandle);
    if (obj instanceof Emitter) {
      obj.fire(event);
    }
  }
  // -- smart select
  $registerSelectionRangeProvider(handle, selector) {
    this._registrations.set(handle, this._languageFeaturesService.selectionRangeProvider.register(selector, {
      provideSelectionRanges: /* @__PURE__ */ __name((model, positions, token) => {
        return this._proxy.$provideSelectionRanges(handle, model.uri, positions, token);
      }, "provideSelectionRanges")
    }));
  }
  // --- call hierarchy
  $registerCallHierarchyProvider(handle, selector) {
    this._registrations.set(handle, callh.CallHierarchyProviderRegistry.register(selector, {
      prepareCallHierarchy: /* @__PURE__ */ __name(async (document, position, token) => {
        const items = await this._proxy.$prepareCallHierarchy(handle, document.uri, position, token);
        if (!items || items.length === 0) {
          return void 0;
        }
        return {
          dispose: /* @__PURE__ */ __name(() => {
            for (const item of items) {
              this._proxy.$releaseCallHierarchy(handle, item._sessionId);
            }
          }, "dispose"),
          roots: items.map(MainThreadLanguageFeatures_1._reviveCallHierarchyItemDto)
        };
      }, "prepareCallHierarchy"),
      provideOutgoingCalls: /* @__PURE__ */ __name(async (item, token) => {
        const outgoing = await this._proxy.$provideCallHierarchyOutgoingCalls(handle, item._sessionId, item._itemId, token);
        if (!outgoing) {
          return outgoing;
        }
        outgoing.forEach((value) => {
          value.to = MainThreadLanguageFeatures_1._reviveCallHierarchyItemDto(value.to);
        });
        return outgoing;
      }, "provideOutgoingCalls"),
      provideIncomingCalls: /* @__PURE__ */ __name(async (item, token) => {
        const incoming = await this._proxy.$provideCallHierarchyIncomingCalls(handle, item._sessionId, item._itemId, token);
        if (!incoming) {
          return incoming;
        }
        incoming.forEach((value) => {
          value.from = MainThreadLanguageFeatures_1._reviveCallHierarchyItemDto(value.from);
        });
        return incoming;
      }, "provideIncomingCalls")
    }));
  }
  // --- configuration
  static _reviveRegExp(regExp) {
    return new RegExp(regExp.pattern, regExp.flags);
  }
  static _reviveIndentationRule(indentationRule) {
    return {
      decreaseIndentPattern: MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.decreaseIndentPattern),
      increaseIndentPattern: MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.increaseIndentPattern),
      indentNextLinePattern: indentationRule.indentNextLinePattern ? MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.indentNextLinePattern) : void 0,
      unIndentedLinePattern: indentationRule.unIndentedLinePattern ? MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.unIndentedLinePattern) : void 0
    };
  }
  static _reviveOnEnterRule(onEnterRule) {
    return {
      beforeText: MainThreadLanguageFeatures_1._reviveRegExp(onEnterRule.beforeText),
      afterText: onEnterRule.afterText ? MainThreadLanguageFeatures_1._reviveRegExp(onEnterRule.afterText) : void 0,
      previousLineText: onEnterRule.previousLineText ? MainThreadLanguageFeatures_1._reviveRegExp(onEnterRule.previousLineText) : void 0,
      action: onEnterRule.action
    };
  }
  static _reviveOnEnterRules(onEnterRules) {
    return onEnterRules.map(MainThreadLanguageFeatures_1._reviveOnEnterRule);
  }
  $setLanguageConfiguration(handle, languageId, _configuration) {
    const configuration = {
      comments: _configuration.comments,
      brackets: _configuration.brackets,
      wordPattern: _configuration.wordPattern ? MainThreadLanguageFeatures_1._reviveRegExp(_configuration.wordPattern) : void 0,
      indentationRules: _configuration.indentationRules ? MainThreadLanguageFeatures_1._reviveIndentationRule(_configuration.indentationRules) : void 0,
      onEnterRules: _configuration.onEnterRules ? MainThreadLanguageFeatures_1._reviveOnEnterRules(_configuration.onEnterRules) : void 0,
      autoClosingPairs: void 0,
      surroundingPairs: void 0,
      __electricCharacterSupport: void 0
    };
    if (_configuration.autoClosingPairs) {
      configuration.autoClosingPairs = _configuration.autoClosingPairs;
    } else if (_configuration.__characterPairSupport) {
      configuration.autoClosingPairs = _configuration.__characterPairSupport.autoClosingPairs;
    }
    if (_configuration.__electricCharacterSupport && _configuration.__electricCharacterSupport.docComment) {
      configuration.__electricCharacterSupport = {
        docComment: {
          open: _configuration.__electricCharacterSupport.docComment.open,
          close: _configuration.__electricCharacterSupport.docComment.close
        }
      };
    }
    if (this._languageService.isRegisteredLanguageId(languageId)) {
      this._registrations.set(handle, this._languageConfigurationService.register(languageId, configuration, 100));
    }
  }
  // --- type hierarchy
  $registerTypeHierarchyProvider(handle, selector) {
    this._registrations.set(handle, typeh.TypeHierarchyProviderRegistry.register(selector, {
      prepareTypeHierarchy: /* @__PURE__ */ __name(async (document, position, token) => {
        const items = await this._proxy.$prepareTypeHierarchy(handle, document.uri, position, token);
        if (!items) {
          return void 0;
        }
        return {
          dispose: /* @__PURE__ */ __name(() => {
            for (const item of items) {
              this._proxy.$releaseTypeHierarchy(handle, item._sessionId);
            }
          }, "dispose"),
          roots: items.map(MainThreadLanguageFeatures_1._reviveTypeHierarchyItemDto)
        };
      }, "prepareTypeHierarchy"),
      provideSupertypes: /* @__PURE__ */ __name(async (item, token) => {
        const supertypes = await this._proxy.$provideTypeHierarchySupertypes(handle, item._sessionId, item._itemId, token);
        if (!supertypes) {
          return supertypes;
        }
        return supertypes.map(MainThreadLanguageFeatures_1._reviveTypeHierarchyItemDto);
      }, "provideSupertypes"),
      provideSubtypes: /* @__PURE__ */ __name(async (item, token) => {
        const subtypes = await this._proxy.$provideTypeHierarchySubtypes(handle, item._sessionId, item._itemId, token);
        if (!subtypes) {
          return subtypes;
        }
        return subtypes.map(MainThreadLanguageFeatures_1._reviveTypeHierarchyItemDto);
      }, "provideSubtypes")
    }));
  }
  $registerDocumentOnDropEditProvider(handle, selector, metadata) {
    const provider = new MainThreadDocumentOnDropEditProvider(handle, this._proxy, metadata, this._uriIdentService);
    this._documentOnDropEditProviders.set(handle, provider);
    this._registrations.set(handle, combinedDisposable(this._languageFeaturesService.documentDropEditProvider.register(selector, provider), toDisposable(() => this._documentOnDropEditProviders.delete(handle))));
  }
  async $resolveDocumentOnDropFileData(handle, requestId, dataId) {
    const provider = this._documentOnDropEditProviders.get(handle);
    if (!provider) {
      throw new Error("Could not find provider");
    }
    return provider.resolveDocumentOnDropFileData(requestId, dataId);
  }
};
MainThreadLanguageFeatures = MainThreadLanguageFeatures_1 = __decorate([
  extHostNamedCustomer(MainContext.MainThreadLanguageFeatures),
  __param(1, ILanguageService),
  __param(2, ILanguageConfigurationService),
  __param(3, ILanguageFeaturesService),
  __param(4, IUriIdentityService)
], MainThreadLanguageFeatures);
let MainThreadPasteEditProvider = class MainThreadPasteEditProvider2 {
  static {
    __name(this, "MainThreadPasteEditProvider");
  }
  constructor(_handle, _proxy, metadata, _uriIdentService) {
    this._handle = _handle;
    this._proxy = _proxy;
    this._uriIdentService = _uriIdentService;
    this.dataTransfers = new DataTransferFileCache();
    this.copyMimeTypes = metadata.copyMimeTypes ?? [];
    this.pasteMimeTypes = metadata.pasteMimeTypes ?? [];
    this.providedPasteEditKinds = metadata.providedPasteEditKinds?.map((kind) => new HierarchicalKind(kind)) ?? [];
    if (metadata.supportsCopy) {
      this.prepareDocumentPaste = async (model, selections, dataTransfer, token) => {
        const dataTransferDto = await typeConvert.DataTransfer.fromList(dataTransfer);
        if (token.isCancellationRequested) {
          return void 0;
        }
        const newDataTransfer = await this._proxy.$prepareDocumentPaste(_handle, model.uri, selections, dataTransferDto, token);
        if (!newDataTransfer) {
          return void 0;
        }
        const dataTransferOut = new VSDataTransfer();
        for (const [type, item] of newDataTransfer.items) {
          dataTransferOut.replace(type, createStringDataTransferItem(item.asString, item.id));
        }
        return dataTransferOut;
      };
    }
    if (metadata.supportsPaste) {
      this.provideDocumentPasteEdits = async (model, selections, dataTransfer, context, token) => {
        const request = this.dataTransfers.add(dataTransfer);
        try {
          const dataTransferDto = await typeConvert.DataTransfer.fromList(dataTransfer);
          if (token.isCancellationRequested) {
            return;
          }
          const edits = await this._proxy.$providePasteEdits(this._handle, request.id, model.uri, selections, dataTransferDto, {
            only: context.only?.value,
            triggerKind: context.triggerKind
          }, token);
          if (!edits) {
            return;
          }
          return {
            edits: edits.map((edit) => {
              return {
                ...edit,
                kind: edit.kind ? new HierarchicalKind(edit.kind.value) : new HierarchicalKind(""),
                yieldTo: edit.yieldTo?.map((x) => ({ kind: new HierarchicalKind(x) })),
                additionalEdit: edit.additionalEdit ? reviveWorkspaceEditDto(edit.additionalEdit, this._uriIdentService, (dataId) => this.resolveFileData(request.id, dataId)) : void 0
              };
            }),
            dispose: /* @__PURE__ */ __name(() => {
              this._proxy.$releasePasteEdits(this._handle, request.id);
            }, "dispose")
          };
        } finally {
          request.dispose();
        }
      };
    }
    if (metadata.supportsResolve) {
      this.resolveDocumentPasteEdit = async (edit, token) => {
        const resolved = await this._proxy.$resolvePasteEdit(this._handle, edit._cacheId, token);
        if (typeof resolved.insertText !== "undefined") {
          edit.insertText = resolved.insertText;
        }
        if (resolved.additionalEdit) {
          edit.additionalEdit = reviveWorkspaceEditDto(resolved.additionalEdit, this._uriIdentService);
        }
        return edit;
      };
    }
  }
  resolveFileData(requestId, dataId) {
    return this.dataTransfers.resolveFileData(requestId, dataId);
  }
};
MainThreadPasteEditProvider = __decorate([
  __param(3, IUriIdentityService)
], MainThreadPasteEditProvider);
let MainThreadDocumentOnDropEditProvider = class MainThreadDocumentOnDropEditProvider2 {
  static {
    __name(this, "MainThreadDocumentOnDropEditProvider");
  }
  constructor(_handle, _proxy, metadata, _uriIdentService) {
    this._handle = _handle;
    this._proxy = _proxy;
    this._uriIdentService = _uriIdentService;
    this.dataTransfers = new DataTransferFileCache();
    this.dropMimeTypes = metadata?.dropMimeTypes ?? ["*/*"];
    this.providedDropEditKinds = metadata?.providedDropKinds?.map((kind) => new HierarchicalKind(kind));
    if (metadata?.supportsResolve) {
      this.resolveDocumentDropEdit = async (edit, token) => {
        const resolved = await this._proxy.$resolvePasteEdit(this._handle, edit._cacheId, token);
        if (resolved.additionalEdit) {
          edit.additionalEdit = reviveWorkspaceEditDto(resolved.additionalEdit, this._uriIdentService);
        }
        return edit;
      };
    }
  }
  async provideDocumentDropEdits(model, position, dataTransfer, token) {
    const request = this.dataTransfers.add(dataTransfer);
    try {
      const dataTransferDto = await typeConvert.DataTransfer.fromList(dataTransfer);
      if (token.isCancellationRequested) {
        return;
      }
      const edits = await this._proxy.$provideDocumentOnDropEdits(this._handle, request.id, model.uri, position, dataTransferDto, token);
      if (!edits) {
        return;
      }
      return {
        edits: edits.map((edit) => {
          return {
            ...edit,
            yieldTo: edit.yieldTo?.map((x) => ({ kind: new HierarchicalKind(x) })),
            kind: edit.kind ? new HierarchicalKind(edit.kind) : void 0,
            additionalEdit: reviveWorkspaceEditDto(edit.additionalEdit, this._uriIdentService, (dataId) => this.resolveDocumentOnDropFileData(request.id, dataId))
          };
        }),
        dispose: /* @__PURE__ */ __name(() => {
          this._proxy.$releaseDocumentOnDropEdits(this._handle, request.id);
        }, "dispose")
      };
    } finally {
      request.dispose();
    }
  }
  resolveDocumentOnDropFileData(requestId, dataId) {
    return this.dataTransfers.resolveFileData(requestId, dataId);
  }
};
MainThreadDocumentOnDropEditProvider = __decorate([
  __param(3, IUriIdentityService)
], MainThreadDocumentOnDropEditProvider);
class MainThreadDocumentSemanticTokensProvider {
  static {
    __name(this, "MainThreadDocumentSemanticTokensProvider");
  }
  constructor(_proxy, _handle, _legend, onDidChange) {
    this._proxy = _proxy;
    this._handle = _handle;
    this._legend = _legend;
    this.onDidChange = onDidChange;
  }
  releaseDocumentSemanticTokens(resultId) {
    if (resultId) {
      this._proxy.$releaseDocumentSemanticTokens(this._handle, parseInt(resultId, 10));
    }
  }
  getLegend() {
    return this._legend;
  }
  async provideDocumentSemanticTokens(model, lastResultId, token) {
    const nLastResultId = lastResultId ? parseInt(lastResultId, 10) : 0;
    const encodedDto = await this._proxy.$provideDocumentSemanticTokens(this._handle, model.uri, nLastResultId, token);
    if (!encodedDto) {
      return null;
    }
    if (token.isCancellationRequested) {
      return null;
    }
    const dto = decodeSemanticTokensDto(encodedDto);
    if (dto.type === "full") {
      return {
        resultId: String(dto.id),
        data: dto.data
      };
    }
    return {
      resultId: String(dto.id),
      edits: dto.deltas
    };
  }
}
class MainThreadDocumentRangeSemanticTokensProvider {
  static {
    __name(this, "MainThreadDocumentRangeSemanticTokensProvider");
  }
  constructor(_proxy, _handle, _legend) {
    this._proxy = _proxy;
    this._handle = _handle;
    this._legend = _legend;
  }
  getLegend() {
    return this._legend;
  }
  async provideDocumentRangeSemanticTokens(model, range, token) {
    const encodedDto = await this._proxy.$provideDocumentRangeSemanticTokens(this._handle, model.uri, range, token);
    if (!encodedDto) {
      return null;
    }
    if (token.isCancellationRequested) {
      return null;
    }
    const dto = decodeSemanticTokensDto(encodedDto);
    if (dto.type === "full") {
      return {
        resultId: String(dto.id),
        data: dto.data
      };
    }
    throw new Error(`Unexpected`);
  }
}
export {
  MainThreadDocumentRangeSemanticTokensProvider,
  MainThreadDocumentSemanticTokensProvider,
  MainThreadLanguageFeatures
};
//# sourceMappingURL=mainThreadLanguageFeatures.js.map
