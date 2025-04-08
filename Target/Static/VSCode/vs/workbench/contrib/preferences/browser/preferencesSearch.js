var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { ISettingsEditorModel, ISetting, ISettingsGroup, ISearchResult, IGroupFilter, SettingMatchType, ISettingMatch, SettingKeyMatchTypes, ISettingMatcher } from "../../../services/preferences/common/preferences.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { distinct } from "../../../../base/common/arrays.js";
import * as strings from "../../../../base/common/strings.js";
import { IMatch, matchesContiguousSubString, matchesSubString, matchesWords } from "../../../../base/common/filters.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IPreferencesSearchService, IRemoteSearchProvider, ISearchProvider, IWorkbenchSettingsConfiguration } from "../common/preferences.js";
import { IExtensionManagementService, ILocalExtension } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { ExtensionType } from "../../../../platform/extensions/common/extensions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IAiRelatedInformationService, RelatedInformationType, SettingInformationResult } from "../../../services/aiRelatedInformation/common/aiRelatedInformation.js";
import { TfIdfCalculator, TfIdfDocument } from "../../../../base/common/tfIdf.js";
import { IStringDictionary } from "../../../../base/common/collections.js";
import { nullRange } from "../../../services/preferences/common/preferencesModels.js";
let PreferencesSearchService = class extends Disposable {
  constructor(instantiationService, configurationService, extensionManagementService, extensionEnablementService) {
    super();
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.extensionManagementService = extensionManagementService;
    this.extensionEnablementService = extensionEnablementService;
    this._installedExtensions = this.extensionManagementService.getInstalled(ExtensionType.User).then((exts) => {
      return exts.filter((ext) => this.extensionEnablementService.isEnabled(ext)).filter((ext) => ext.manifest && ext.manifest.contributes && ext.manifest.contributes.configuration).filter((ext) => !!ext.identifier.uuid);
    });
  }
  static {
    __name(this, "PreferencesSearchService");
  }
  // @ts-expect-error disable remote search for now, ref https://github.com/microsoft/vscode/issues/172411
  _installedExtensions;
  _remoteSearchProvider;
  get remoteSearchAllowed() {
    const workbenchSettings = this.configurationService.getValue().workbench.settings;
    return workbenchSettings.enableNaturalLanguageSearch;
  }
  getRemoteSearchProvider(filter) {
    if (!this.remoteSearchAllowed) {
      return void 0;
    }
    this._remoteSearchProvider ??= this.instantiationService.createInstance(RemoteSearchProvider);
    this._remoteSearchProvider.setFilter(filter);
    return this._remoteSearchProvider;
  }
  getLocalSearchProvider(filter) {
    return this.instantiationService.createInstance(LocalSearchProvider, filter);
  }
};
PreferencesSearchService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IExtensionManagementService),
  __decorateParam(3, IWorkbenchExtensionEnablementService)
], PreferencesSearchService);
function cleanFilter(filter) {
  return filter.replace(/[":]/g, " ").replace(/  /g, " ").trim();
}
__name(cleanFilter, "cleanFilter");
let LocalSearchProvider = class {
  constructor(_filter, configurationService) {
    this._filter = _filter;
    this.configurationService = configurationService;
    this._filter = cleanFilter(this._filter);
  }
  static {
    __name(this, "LocalSearchProvider");
  }
  searchModel(preferencesModel, token) {
    if (!this._filter) {
      return Promise.resolve(null);
    }
    const settingMatcher = /* @__PURE__ */ __name((setting) => {
      let { matches, matchType, keyMatchScore } = new SettingMatches(
        this._filter,
        setting,
        true,
        this.configurationService
      );
      if (matchType === SettingMatchType.None || matches.length === 0) {
        return null;
      }
      if (strings.equalsIgnoreCase(this._filter, setting.key)) {
        matchType = SettingMatchType.ExactMatch;
      }
      return {
        matches,
        matchType,
        keyMatchScore,
        score: 0
        // only used for RemoteSearchProvider matches.
      };
    }, "settingMatcher");
    const filterMatches = preferencesModel.filterSettings(this._filter, this.getGroupFilter(this._filter), settingMatcher);
    const topKeyMatchType = Math.max(...filterMatches.map((m) => m.matchType & SettingKeyMatchTypes));
    const alwaysAllowedMatchTypes = SettingMatchType.DescriptionOrValueMatch | SettingMatchType.LanguageTagSettingMatch;
    const filteredMatches = filterMatches.filter((m) => m.matchType & topKeyMatchType || m.matchType & alwaysAllowedMatchTypes || m.matchType === SettingMatchType.ExactMatch);
    return Promise.resolve({
      filterMatches: filteredMatches,
      exactMatch: filteredMatches.some((m) => m.matchType === SettingMatchType.ExactMatch)
    });
  }
  getGroupFilter(filter) {
    const regex = strings.createRegExp(filter, false, { global: true });
    return (group) => {
      return group.id !== "defaultOverrides" && regex.test(group.title);
    };
  }
};
LocalSearchProvider = __decorateClass([
  __decorateParam(1, IConfigurationService)
], LocalSearchProvider);
class SettingMatches {
  constructor(searchString, setting, searchDescription, configurationService) {
    this.searchDescription = searchDescription;
    this.configurationService = configurationService;
    this.matches = distinct(this._findMatchesInSetting(searchString, setting), (match) => `${match.startLineNumber}_${match.startColumn}_${match.endLineNumber}_${match.endColumn}_`);
  }
  static {
    __name(this, "SettingMatches");
  }
  matches;
  matchType = SettingMatchType.None;
  /**
   * A match score for key matches to allow comparing key matches against each other.
   * Otherwise, all key matches are treated the same, and sorting is done by ToC order.
   */
  keyMatchScore = 0;
  _findMatchesInSetting(searchString, setting) {
    const result = this._doFindMatchesInSetting(searchString, setting);
    return result;
  }
  _keyToLabel(settingId) {
    const label = settingId.replace(/[-._]/g, " ").replace(/([a-z]+)([A-Z])/g, "$1 $2").replace(/([A-Za-z]+)(\d+)/g, "$1 $2").replace(/(\d+)([A-Za-z]+)/g, "$1 $2").toLowerCase();
    return label;
  }
  _toAlphaNumeric(s) {
    return s.replace(/[^A-Za-z0-9]+/g, "");
  }
  _doFindMatchesInSetting(searchString, setting) {
    const descriptionMatchingWords = /* @__PURE__ */ new Map();
    const keyMatchingWords = /* @__PURE__ */ new Map();
    const valueMatchingWords = /* @__PURE__ */ new Map();
    const settingKeyAsWords = this._keyToLabel(setting.key);
    const queryWords = new Set(searchString.split(" "));
    for (const word of queryWords) {
      const keyMatches = matchesWords(word, settingKeyAsWords, true);
      if (keyMatches?.length) {
        keyMatchingWords.set(word, keyMatches.map((match) => this.toKeyRange(setting, match)));
      }
    }
    if (keyMatchingWords.size === queryWords.size) {
      this.matchType |= SettingMatchType.AllWordsInSettingsLabel;
    } else if (keyMatchingWords.size >= 2) {
      this.matchType |= SettingMatchType.ContiguousWordsInSettingsLabel;
      this.keyMatchScore = keyMatchingWords.size;
    }
    const searchStringAlphaNumeric = this._toAlphaNumeric(searchString);
    const keyAlphaNumeric = this._toAlphaNumeric(setting.key);
    const keyIdMatches = matchesContiguousSubString(searchStringAlphaNumeric, keyAlphaNumeric);
    if (keyIdMatches?.length) {
      keyMatchingWords.set(setting.key, keyIdMatches.map((match) => this.toKeyRange(setting, match)));
      this.matchType |= SettingMatchType.ContiguousQueryInSettingId;
    }
    if (this.matchType === SettingMatchType.None) {
      keyMatchingWords.clear();
      for (const word of queryWords) {
        const keyMatches = matchesWords(word, settingKeyAsWords, false);
        if (keyMatches?.length) {
          keyMatchingWords.set(word, keyMatches.map((match) => this.toKeyRange(setting, match)));
        }
      }
      if (keyMatchingWords.size >= 2 || keyMatchingWords.size === 1 && queryWords.size === 1) {
        this.matchType |= SettingMatchType.NonContiguousWordsInSettingsLabel;
        this.keyMatchScore = keyMatchingWords.size;
      } else {
        const keyIdMatches2 = matchesSubString(searchStringAlphaNumeric, keyAlphaNumeric);
        if (keyIdMatches2?.length) {
          keyMatchingWords.set(setting.key, keyIdMatches2.map((match) => this.toKeyRange(setting, match)));
          this.matchType |= SettingMatchType.NonContiguousQueryInSettingId;
        }
      }
    }
    if (setting.overrides?.length && this.matchType !== SettingMatchType.None) {
      this.matchType = SettingMatchType.LanguageTagSettingMatch;
      const keyRanges2 = keyMatchingWords.size ? Array.from(keyMatchingWords.values()).flat() : [];
      return [...keyRanges2];
    }
    const hasContiguousKeyMatchTypes = this.matchType >= SettingMatchType.ContiguousWordsInSettingsLabel;
    if (this.searchDescription && !hasContiguousKeyMatchTypes) {
      for (const word of queryWords) {
        for (let lineIndex = 0; lineIndex < setting.description.length; lineIndex++) {
          const descriptionMatches = matchesContiguousSubString(word, setting.description[lineIndex]);
          if (descriptionMatches?.length) {
            descriptionMatchingWords.set(word, descriptionMatches.map((match) => this.toDescriptionRange(setting, match, lineIndex)));
          }
        }
      }
      if (descriptionMatchingWords.size === queryWords.size) {
        this.matchType |= SettingMatchType.DescriptionOrValueMatch;
      } else {
        descriptionMatchingWords.clear();
      }
    }
    if (!hasContiguousKeyMatchTypes) {
      if (setting.enum?.length) {
        for (const option of setting.enum) {
          if (typeof option !== "string") {
            continue;
          }
          valueMatchingWords.clear();
          for (const word of queryWords) {
            const valueMatches = matchesContiguousSubString(word, option);
            if (valueMatches?.length) {
              valueMatchingWords.set(word, valueMatches.map((match) => this.toValueRange(setting, match)));
            }
          }
          if (valueMatchingWords.size === queryWords.size) {
            this.matchType |= SettingMatchType.DescriptionOrValueMatch;
            break;
          } else {
            valueMatchingWords.clear();
          }
        }
      } else {
        const settingValue = this.configurationService.getValue(setting.key);
        if (typeof settingValue === "string") {
          for (const word of queryWords) {
            const valueMatches = matchesContiguousSubString(word, settingValue);
            if (valueMatches?.length) {
              valueMatchingWords.set(word, valueMatches.map((match) => this.toValueRange(setting, match)));
            }
          }
          if (valueMatchingWords.size === queryWords.size) {
            this.matchType |= SettingMatchType.DescriptionOrValueMatch;
          } else {
            valueMatchingWords.clear();
          }
        }
      }
    }
    const descriptionRanges = descriptionMatchingWords.size ? Array.from(descriptionMatchingWords.values()).flat() : [];
    const keyRanges = keyMatchingWords.size ? Array.from(keyMatchingWords.values()).flat() : [];
    const valueRanges = valueMatchingWords.size ? Array.from(valueMatchingWords.values()).flat() : [];
    return [...descriptionRanges, ...keyRanges, ...valueRanges];
  }
  toKeyRange(setting, match) {
    return {
      startLineNumber: setting.keyRange.startLineNumber,
      startColumn: setting.keyRange.startColumn + match.start,
      endLineNumber: setting.keyRange.startLineNumber,
      endColumn: setting.keyRange.startColumn + match.end
    };
  }
  toDescriptionRange(setting, match, lineIndex) {
    const descriptionRange = setting.descriptionRanges[lineIndex];
    if (!descriptionRange) {
      return nullRange;
    }
    return {
      startLineNumber: descriptionRange.startLineNumber,
      startColumn: descriptionRange.startColumn + match.start,
      endLineNumber: descriptionRange.endLineNumber,
      endColumn: descriptionRange.startColumn + match.end
    };
  }
  toValueRange(setting, match) {
    return {
      startLineNumber: setting.valueRange.startLineNumber,
      startColumn: setting.valueRange.startColumn + match.start + 1,
      endLineNumber: setting.valueRange.startLineNumber,
      endColumn: setting.valueRange.startColumn + match.end + 1
    };
  }
}
class AiRelatedInformationSearchKeysProvider {
  constructor(aiRelatedInformationService) {
    this.aiRelatedInformationService = aiRelatedInformationService;
  }
  static {
    __name(this, "AiRelatedInformationSearchKeysProvider");
  }
  settingKeys = [];
  settingsRecord = {};
  currentPreferencesModel;
  updateModel(preferencesModel) {
    if (preferencesModel === this.currentPreferencesModel) {
      return;
    }
    this.currentPreferencesModel = preferencesModel;
    this.refresh();
  }
  refresh() {
    this.settingKeys = [];
    this.settingsRecord = {};
    if (!this.currentPreferencesModel || !this.aiRelatedInformationService.isEnabled()) {
      return;
    }
    for (const group of this.currentPreferencesModel.settingsGroups) {
      if (group.id === "mostCommonlyUsed") {
        continue;
      }
      for (const section of group.sections) {
        for (const setting of section.settings) {
          this.settingKeys.push(setting.key);
          this.settingsRecord[setting.key] = setting;
        }
      }
    }
  }
  getSettingKeys() {
    return this.settingKeys;
  }
  getSettingsRecord() {
    return this.settingsRecord;
  }
}
let AiRelatedInformationSearchProvider = class {
  constructor(aiRelatedInformationService) {
    this.aiRelatedInformationService = aiRelatedInformationService;
    this._keysProvider = new AiRelatedInformationSearchKeysProvider(aiRelatedInformationService);
  }
  static {
    __name(this, "AiRelatedInformationSearchProvider");
  }
  static AI_RELATED_INFORMATION_MAX_PICKS = 5;
  _keysProvider;
  _filter = "";
  setFilter(filter) {
    this._filter = cleanFilter(filter);
  }
  async searchModel(preferencesModel, token) {
    if (!this._filter || !this.aiRelatedInformationService.isEnabled()) {
      return null;
    }
    this._keysProvider.updateModel(preferencesModel);
    return {
      filterMatches: await this.getAiRelatedInformationItems(token),
      exactMatch: false
    };
  }
  async getAiRelatedInformationItems(token) {
    const settingsRecord = this._keysProvider.getSettingsRecord();
    const filterMatches = [];
    const relatedInformation = await this.aiRelatedInformationService.getRelatedInformation(
      this._filter,
      [RelatedInformationType.SettingInformation],
      token
    );
    relatedInformation.sort((a, b) => b.weight - a.weight);
    for (const info of relatedInformation) {
      if (filterMatches.length === AiRelatedInformationSearchProvider.AI_RELATED_INFORMATION_MAX_PICKS) {
        break;
      }
      const pick = info.setting;
      filterMatches.push({
        setting: settingsRecord[pick],
        matches: [settingsRecord[pick].range],
        matchType: SettingMatchType.RemoteMatch,
        keyMatchScore: 0,
        score: info.weight
      });
    }
    return filterMatches;
  }
};
AiRelatedInformationSearchProvider = __decorateClass([
  __decorateParam(0, IAiRelatedInformationService)
], AiRelatedInformationSearchProvider);
class TfIdfSearchProvider {
  static {
    __name(this, "TfIdfSearchProvider");
  }
  static TF_IDF_PRE_NORMALIZE_THRESHOLD = 50;
  static TF_IDF_POST_NORMALIZE_THRESHOLD = 0.7;
  static TF_IDF_MAX_PICKS = 5;
  _currentPreferencesModel;
  _filter = "";
  _documents = [];
  _settingsRecord = {};
  constructor() {
  }
  setFilter(filter) {
    this._filter = cleanFilter(filter);
  }
  keyToLabel(settingId) {
    const label = settingId.replace(/[-._]/g, " ").replace(/([a-z]+)([A-Z])/g, "$1 $2").replace(/([A-Za-z]+)(\d+)/g, "$1 $2").replace(/(\d+)([A-Za-z]+)/g, "$1 $2").toLowerCase();
    return label;
  }
  settingItemToEmbeddingString(item) {
    let result = `Setting Id: ${item.key}
`;
    result += `Label: ${this.keyToLabel(item.key)}
`;
    result += `Description: ${item.description}
`;
    return result;
  }
  async searchModel(preferencesModel, token) {
    if (!this._filter) {
      return null;
    }
    if (this._currentPreferencesModel !== preferencesModel) {
      this._currentPreferencesModel = preferencesModel;
      this._documents = [];
      this._settingsRecord = {};
      for (const group of preferencesModel.settingsGroups) {
        if (group.id === "mostCommonlyUsed") {
          continue;
        }
        for (const section of group.sections) {
          for (const setting of section.settings) {
            this._documents.push({
              key: setting.key,
              textChunks: [this.settingItemToEmbeddingString(setting)]
            });
            this._settingsRecord[setting.key] = setting;
          }
        }
      }
    }
    return {
      filterMatches: await this.getTfIdfItems(token),
      exactMatch: false
    };
  }
  async getTfIdfItems(token) {
    const filterMatches = [];
    const tfIdfCalculator = new TfIdfCalculator();
    tfIdfCalculator.updateDocuments(this._documents);
    const tfIdfRankings = tfIdfCalculator.calculateScores(this._filter, token);
    tfIdfRankings.sort((a, b) => b.score - a.score);
    const maxScore = tfIdfRankings[0].score;
    if (maxScore < TfIdfSearchProvider.TF_IDF_PRE_NORMALIZE_THRESHOLD) {
      return [];
    }
    for (const info of tfIdfRankings) {
      if (info.score / maxScore < TfIdfSearchProvider.TF_IDF_POST_NORMALIZE_THRESHOLD || filterMatches.length === TfIdfSearchProvider.TF_IDF_MAX_PICKS) {
        break;
      }
      const pick = info.key;
      filterMatches.push({
        setting: this._settingsRecord[pick],
        matches: [this._settingsRecord[pick].range],
        matchType: SettingMatchType.RemoteMatch,
        keyMatchScore: 0,
        score: info.score
      });
    }
    return filterMatches;
  }
}
let RemoteSearchProvider = class {
  constructor(aiRelatedInformationService) {
    this.aiRelatedInformationService = aiRelatedInformationService;
  }
  static {
    __name(this, "RemoteSearchProvider");
  }
  adaSearchProvider;
  tfIdfSearchProvider;
  filter = "";
  initializeSearchProviders() {
    if (this.aiRelatedInformationService.isEnabled()) {
      this.adaSearchProvider ??= new AiRelatedInformationSearchProvider(this.aiRelatedInformationService);
    }
    this.tfIdfSearchProvider ??= new TfIdfSearchProvider();
  }
  setFilter(filter) {
    this.initializeSearchProviders();
    this.filter = filter;
    if (this.adaSearchProvider) {
      this.adaSearchProvider.setFilter(filter);
    }
    this.tfIdfSearchProvider.setFilter(filter);
  }
  async searchModel(preferencesModel, token) {
    if (!this.filter) {
      return null;
    }
    if (!this.adaSearchProvider) {
      return this.tfIdfSearchProvider.searchModel(preferencesModel, token);
    }
    let results = await this.adaSearchProvider.searchModel(preferencesModel, token);
    if (results?.filterMatches.length) {
      return results;
    }
    if (!token.isCancellationRequested) {
      results = await this.tfIdfSearchProvider.searchModel(preferencesModel, token);
      if (results?.filterMatches.length) {
        return results;
      }
    }
    return null;
  }
};
RemoteSearchProvider = __decorateClass([
  __decorateParam(0, IAiRelatedInformationService)
], RemoteSearchProvider);
registerSingleton(IPreferencesSearchService, PreferencesSearchService, InstantiationType.Delayed);
export {
  LocalSearchProvider,
  PreferencesSearchService,
  SettingMatches
};
//# sourceMappingURL=preferencesSearch.js.map
