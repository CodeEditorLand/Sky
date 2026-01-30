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
import { distinct } from "../../../../base/common/arrays.js";
import { matchesBaseContiguousSubString, matchesContiguousSubString, matchesSubString, matchesWords } from "../../../../base/common/filters.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import * as strings from "../../../../base/common/strings.js";
import { TfIdfCalculator } from "../../../../base/common/tfIdf.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IAiSettingsSearchService } from "../../../services/aiSettingsSearch/common/aiSettingsSearch.js";
import { SettingKeyMatchTypes, SettingMatchType } from "../../../services/preferences/common/preferences.js";
import { nullRange } from "../../../services/preferences/common/preferencesModels.js";
import { EMBEDDINGS_SEARCH_PROVIDER_NAME, IPreferencesSearchService, LLM_RANKED_SEARCH_PROVIDER_NAME, STRING_MATCH_SEARCH_PROVIDER_NAME, TF_IDF_SEARCH_PROVIDER_NAME } from "../common/preferences.js";
let PreferencesSearchService = class PreferencesSearchService2 extends Disposable {
  static {
    __name(this, "PreferencesSearchService");
  }
  constructor(instantiationService, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
  }
  getLocalSearchProvider(filter) {
    return this.instantiationService.createInstance(LocalSearchProvider, filter);
  }
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
  getAiSearchProvider(filter) {
    if (!this.remoteSearchAllowed) {
      return void 0;
    }
    this._aiSearchProvider ??= this.instantiationService.createInstance(AiSearchProvider);
    this._aiSearchProvider.setFilter(filter);
    return this._aiSearchProvider;
  }
};
PreferencesSearchService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IConfigurationService)
], PreferencesSearchService);
function cleanFilter(filter) {
  return filter.replace(/[":]/g, " ").replace(/  /g, " ").trim();
}
__name(cleanFilter, "cleanFilter");
let LocalSearchProvider = class LocalSearchProvider2 {
  static {
    __name(this, "LocalSearchProvider");
  }
  constructor(_filter, configurationService) {
    this._filter = _filter;
    this.configurationService = configurationService;
    this._filter = cleanFilter(this._filter);
  }
  searchModel(preferencesModel, token) {
    if (!this._filter) {
      return Promise.resolve(null);
    }
    const settingMatcher = /* @__PURE__ */ __name((setting) => {
      let { matches, matchType, keyMatchScore } = new SettingMatches(this._filter, setting, true, this.configurationService);
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
    const filteredMatches = filterMatches.filter((m) => m.matchType & topKeyMatchType || m.matchType & alwaysAllowedMatchTypes || m.matchType === SettingMatchType.ExactMatch).map((m) => ({ ...m, providerName: STRING_MATCH_SEARCH_PROVIDER_NAME }));
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
LocalSearchProvider = __decorate([
  __param(1, IConfigurationService)
], LocalSearchProvider);
class SettingMatches {
  static {
    __name(this, "SettingMatches");
  }
  constructor(searchString, setting, searchDescription, configurationService) {
    this.searchDescription = searchDescription;
    this.configurationService = configurationService;
    this.matchType = SettingMatchType.None;
    this.keyMatchScore = 0;
    this.matches = distinct(this._findMatchesInSetting(searchString, setting), (match) => `${match.startLineNumber}_${match.startColumn}_${match.endLineNumber}_${match.endColumn}_`);
  }
  _findMatchesInSetting(searchString, setting) {
    const result = this._doFindMatchesInSetting(searchString, setting);
    return result;
  }
  _keyToLabel(settingId) {
    const label = settingId.replace(/[-._]/g, " ").replace(/([a-z]+)([A-Z])/g, "$1 $2").replace(/([A-Za-z]+)(\d+)/g, "$1 $2").replace(/(\d+)([A-Za-z]+)/g, "$1 $2").toLowerCase();
    return label;
  }
  _toAlphaNumeric(s) {
    return s.replace(/[^\p{L}\p{N}]+/gu, "");
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
          const descriptionMatches = matchesBaseContiguousSubString(word, setting.description[lineIndex]);
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
class SettingsRecordProvider {
  static {
    __name(this, "SettingsRecordProvider");
  }
  constructor() {
    this._settingsRecord = {};
  }
  updateModel(preferencesModel) {
    if (preferencesModel === this._currentPreferencesModel) {
      return;
    }
    this._currentPreferencesModel = preferencesModel;
    this.refresh();
  }
  refresh() {
    this._settingsRecord = {};
    if (!this._currentPreferencesModel) {
      return;
    }
    for (const group of this._currentPreferencesModel.settingsGroups) {
      if (group.id === "mostCommonlyUsed") {
        continue;
      }
      for (const section of group.sections) {
        for (const setting of section.settings) {
          this._settingsRecord[setting.key] = setting;
        }
      }
    }
  }
  getSettingsRecord() {
    return this._settingsRecord;
  }
}
class EmbeddingsSearchProvider {
  static {
    __name(this, "EmbeddingsSearchProvider");
  }
  static {
    this.EMBEDDINGS_SETTINGS_SEARCH_MAX_PICKS = 10;
  }
  constructor(_aiSettingsSearchService) {
    this._aiSettingsSearchService = _aiSettingsSearchService;
    this._filter = "";
    this._recordProvider = new SettingsRecordProvider();
  }
  setFilter(filter) {
    this._filter = cleanFilter(filter);
  }
  async searchModel(preferencesModel, token) {
    if (!this._filter || !this._aiSettingsSearchService.isEnabled()) {
      return null;
    }
    this._recordProvider.updateModel(preferencesModel);
    this._aiSettingsSearchService.startSearch(this._filter, token);
    return {
      filterMatches: await this.getEmbeddingsItems(token),
      exactMatch: false
    };
  }
  async getEmbeddingsItems(token) {
    const settingsRecord = this._recordProvider.getSettingsRecord();
    const filterMatches = [];
    const settings = await this._aiSettingsSearchService.getEmbeddingsResults(this._filter, token);
    if (!settings) {
      return [];
    }
    const providerName = EMBEDDINGS_SEARCH_PROVIDER_NAME;
    for (const settingKey of settings) {
      if (filterMatches.length === EmbeddingsSearchProvider.EMBEDDINGS_SETTINGS_SEARCH_MAX_PICKS) {
        break;
      }
      filterMatches.push({
        setting: settingsRecord[settingKey],
        matches: [settingsRecord[settingKey].range],
        matchType: SettingMatchType.RemoteMatch,
        keyMatchScore: 0,
        score: 0,
        // the results are sorted upstream.
        providerName
      });
    }
    return filterMatches;
  }
}
class TfIdfSearchProvider {
  static {
    __name(this, "TfIdfSearchProvider");
  }
  static {
    this.TF_IDF_PRE_NORMALIZE_THRESHOLD = 50;
  }
  static {
    this.TF_IDF_POST_NORMALIZE_THRESHOLD = 0.7;
  }
  static {
    this.TF_IDF_MAX_PICKS = 5;
  }
  constructor() {
    this._filter = "";
    this._documents = [];
    this._settingsRecord = {};
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
        score: info.score,
        providerName: TF_IDF_SEARCH_PROVIDER_NAME
      });
    }
    return filterMatches;
  }
}
class RemoteSearchProvider {
  static {
    __name(this, "RemoteSearchProvider");
  }
  constructor() {
    this._filter = "";
    this._tfIdfSearchProvider = new TfIdfSearchProvider();
  }
  setFilter(filter) {
    this._filter = filter;
    this._tfIdfSearchProvider.setFilter(filter);
  }
  async searchModel(preferencesModel, token) {
    if (!this._filter) {
      return null;
    }
    const results = await this._tfIdfSearchProvider.searchModel(preferencesModel, token);
    return results;
  }
}
let AiSearchProvider = class AiSearchProvider2 {
  static {
    __name(this, "AiSearchProvider");
  }
  constructor(aiSettingsSearchService) {
    this.aiSettingsSearchService = aiSettingsSearchService;
    this._filter = "";
    this._embeddingsSearchProvider = new EmbeddingsSearchProvider(this.aiSettingsSearchService);
    this._recordProvider = new SettingsRecordProvider();
  }
  setFilter(filter) {
    this._filter = filter;
    this._embeddingsSearchProvider.setFilter(filter);
  }
  async searchModel(preferencesModel, token) {
    if (!this._filter || !this.aiSettingsSearchService.isEnabled()) {
      return null;
    }
    this._recordProvider.updateModel(preferencesModel);
    const results = await this._embeddingsSearchProvider.searchModel(preferencesModel, token);
    return results;
  }
  async getLLMRankedResults(token) {
    if (!this._filter || !this.aiSettingsSearchService.isEnabled()) {
      return null;
    }
    const items = await this.getLLMRankedItems(token);
    return {
      filterMatches: items,
      exactMatch: false
    };
  }
  async getLLMRankedItems(token) {
    const settingsRecord = this._recordProvider.getSettingsRecord();
    const filterMatches = [];
    const settings = await this.aiSettingsSearchService.getLLMRankedResults(this._filter, token);
    if (!settings) {
      return [];
    }
    for (const settingKey of settings) {
      if (!settingsRecord[settingKey]) {
        continue;
      }
      filterMatches.push({
        setting: settingsRecord[settingKey],
        matches: [settingsRecord[settingKey].range],
        matchType: SettingMatchType.RemoteMatch,
        keyMatchScore: 0,
        score: 0,
        // the results are sorted upstream.
        providerName: LLM_RANKED_SEARCH_PROVIDER_NAME
      });
    }
    return filterMatches;
  }
};
AiSearchProvider = __decorate([
  __param(0, IAiSettingsSearchService)
], AiSearchProvider);
registerSingleton(
  IPreferencesSearchService,
  PreferencesSearchService,
  1
  /* InstantiationType.Delayed */
);
export {
  LocalSearchProvider,
  PreferencesSearchService,
  SettingMatches
};
//# sourceMappingURL=preferencesSearch.js.map
