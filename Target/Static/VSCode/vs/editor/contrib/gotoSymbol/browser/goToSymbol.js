var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { coalesce } from "../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { matchesSomeScheme, Schemas } from "../../../../base/common/network.js";
import { registerModelAndPositionCommand } from "../../../browser/editorExtensions.js";
import { Position } from "../../../common/core/position.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { DeclarationProvider, DefinitionProvider, ImplementationProvider, LocationLink, ProviderResult, ReferenceProvider, TypeDefinitionProvider } from "../../../common/languages.js";
import { ITextModel } from "../../../common/model.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { ReferencesModel } from "./referencesModel.js";
function shouldIncludeLocationLink(sourceModel, loc) {
  if (loc.uri.scheme === sourceModel.uri.scheme) {
    return true;
  }
  if (matchesSomeScheme(loc.uri, Schemas.walkThroughSnippet, Schemas.vscodeChatCodeBlock, Schemas.vscodeChatCodeCompareBlock)) {
    return false;
  }
  return true;
}
__name(shouldIncludeLocationLink, "shouldIncludeLocationLink");
async function getLocationLinks(model, position, registry, recursive, provide) {
  const provider = registry.ordered(model, recursive);
  const promises = provider.map((provider2) => {
    return Promise.resolve(provide(provider2, model, position)).then(void 0, (err) => {
      onUnexpectedExternalError(err);
      return void 0;
    });
  });
  const values = await Promise.all(promises);
  return coalesce(values.flat()).filter((loc) => shouldIncludeLocationLink(model, loc));
}
__name(getLocationLinks, "getLocationLinks");
function getDefinitionsAtPosition(registry, model, position, recursive, token) {
  return getLocationLinks(model, position, registry, recursive, (provider, model2, position2) => {
    return provider.provideDefinition(model2, position2, token);
  });
}
__name(getDefinitionsAtPosition, "getDefinitionsAtPosition");
function getDeclarationsAtPosition(registry, model, position, recursive, token) {
  return getLocationLinks(model, position, registry, recursive, (provider, model2, position2) => {
    return provider.provideDeclaration(model2, position2, token);
  });
}
__name(getDeclarationsAtPosition, "getDeclarationsAtPosition");
function getImplementationsAtPosition(registry, model, position, recursive, token) {
  return getLocationLinks(model, position, registry, recursive, (provider, model2, position2) => {
    return provider.provideImplementation(model2, position2, token);
  });
}
__name(getImplementationsAtPosition, "getImplementationsAtPosition");
function getTypeDefinitionsAtPosition(registry, model, position, recursive, token) {
  return getLocationLinks(model, position, registry, recursive, (provider, model2, position2) => {
    return provider.provideTypeDefinition(model2, position2, token);
  });
}
__name(getTypeDefinitionsAtPosition, "getTypeDefinitionsAtPosition");
function getReferencesAtPosition(registry, model, position, compact, recursive, token) {
  return getLocationLinks(model, position, registry, recursive, async (provider, model2, position2) => {
    const result = (await provider.provideReferences(model2, position2, { includeDeclaration: true }, token))?.filter((ref) => shouldIncludeLocationLink(model2, ref));
    if (!compact || !result || result.length !== 2) {
      return result;
    }
    const resultWithoutDeclaration = (await provider.provideReferences(model2, position2, { includeDeclaration: false }, token))?.filter((ref) => shouldIncludeLocationLink(model2, ref));
    if (resultWithoutDeclaration && resultWithoutDeclaration.length === 1) {
      return resultWithoutDeclaration;
    }
    return result;
  });
}
__name(getReferencesAtPosition, "getReferencesAtPosition");
async function _sortedAndDeduped(callback) {
  const rawLinks = await callback();
  const model = new ReferencesModel(rawLinks, "");
  const modelLinks = model.references.map((ref) => ref.link);
  model.dispose();
  return modelLinks;
}
__name(_sortedAndDeduped, "_sortedAndDeduped");
registerModelAndPositionCommand("_executeDefinitionProvider", (accessor, model, position) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getDefinitionsAtPosition(languageFeaturesService.definitionProvider, model, position, false, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});
registerModelAndPositionCommand("_executeDefinitionProvider_recursive", (accessor, model, position) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getDefinitionsAtPosition(languageFeaturesService.definitionProvider, model, position, true, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});
registerModelAndPositionCommand("_executeTypeDefinitionProvider", (accessor, model, position) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getTypeDefinitionsAtPosition(languageFeaturesService.typeDefinitionProvider, model, position, false, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});
registerModelAndPositionCommand("_executeTypeDefinitionProvider_recursive", (accessor, model, position) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getTypeDefinitionsAtPosition(languageFeaturesService.typeDefinitionProvider, model, position, true, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});
registerModelAndPositionCommand("_executeDeclarationProvider", (accessor, model, position) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getDeclarationsAtPosition(languageFeaturesService.declarationProvider, model, position, false, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});
registerModelAndPositionCommand("_executeDeclarationProvider_recursive", (accessor, model, position) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getDeclarationsAtPosition(languageFeaturesService.declarationProvider, model, position, true, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});
registerModelAndPositionCommand("_executeReferenceProvider", (accessor, model, position) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getReferencesAtPosition(languageFeaturesService.referenceProvider, model, position, false, false, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});
registerModelAndPositionCommand("_executeReferenceProvider_recursive", (accessor, model, position) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getReferencesAtPosition(languageFeaturesService.referenceProvider, model, position, false, true, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});
registerModelAndPositionCommand("_executeImplementationProvider", (accessor, model, position) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getImplementationsAtPosition(languageFeaturesService.implementationProvider, model, position, false, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});
registerModelAndPositionCommand("_executeImplementationProvider_recursive", (accessor, model, position) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getImplementationsAtPosition(languageFeaturesService.implementationProvider, model, position, true, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});
export {
  getDeclarationsAtPosition,
  getDefinitionsAtPosition,
  getImplementationsAtPosition,
  getReferencesAtPosition,
  getTypeDefinitionsAtPosition
};
//# sourceMappingURL=goToSymbol.js.map
