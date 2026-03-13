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
import { DropdownMenuActionViewItem } from "../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import { Separator } from "../../../../base/common/actions.js";
import { SuggestController } from "../../../../editor/contrib/suggest/browser/suggestController.js";
import { localize } from "../../../../nls.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { ADVANCED_SETTING_TAG, EXTENSION_SETTING_TAG, FEATURE_SETTING_TAG, GENERAL_TAG_SETTING_TAG, ID_SETTING_TAG, LANGUAGE_SETTING_TAG, MODIFIED_SETTING_TAG, POLICY_SETTING_TAG } from "../common/preferences.js";
let SettingsSearchFilterDropdownMenuActionViewItem = class SettingsSearchFilterDropdownMenuActionViewItem2 extends DropdownMenuActionViewItem {
  static {
    __name(this, "SettingsSearchFilterDropdownMenuActionViewItem");
  }
  constructor(action, options, actionRunner, searchWidget, contextMenuService) {
    super(action, { getActions: /* @__PURE__ */ __name(() => this.getActions(), "getActions") }, contextMenuService, {
      ...options,
      actionRunner,
      classNames: action.class,
      anchorAlignmentProvider: /* @__PURE__ */ __name(() => 1, "anchorAlignmentProvider"),
      menuAsChild: true
    });
    this.searchWidget = searchWidget;
    this.suggestController = SuggestController.get(this.searchWidget.inputWidget);
  }
  render(container) {
    super.render(container);
  }
  doSearchWidgetAction(queryToAppend, triggerSuggest) {
    this.searchWidget.setValue(this.searchWidget.getValue().trimEnd() + " " + queryToAppend);
    this.searchWidget.focus();
    if (triggerSuggest && this.suggestController) {
      this.suggestController.triggerSuggest();
    }
  }
  /**
   * The created action appends a query to the search widget search string. It optionally triggers suggestions.
   */
  createAction(id, label, tooltip, queryToAppend, triggerSuggest) {
    return {
      id,
      label,
      tooltip,
      class: void 0,
      enabled: true,
      run: /* @__PURE__ */ __name(() => {
        this.doSearchWidgetAction(queryToAppend, triggerSuggest);
      }, "run")
    };
  }
  /**
   * The created action appends a query to the search widget search string, if the query does not exist.
   * Otherwise, it removes the query from the search widget search string.
   * The action does not trigger suggestions after adding or removing the query.
   */
  createToggleAction(id, label, tooltip, queryToAppend) {
    const splitCurrentQuery = this.searchWidget.getValue().split(" ");
    const queryContainsQueryToAppend = splitCurrentQuery.includes(queryToAppend);
    return {
      id,
      label,
      tooltip,
      class: void 0,
      enabled: true,
      checked: queryContainsQueryToAppend,
      run: /* @__PURE__ */ __name(() => {
        if (!queryContainsQueryToAppend) {
          const trimmedCurrentQuery = this.searchWidget.getValue().trimEnd();
          const newQuery = trimmedCurrentQuery ? trimmedCurrentQuery + " " + queryToAppend : queryToAppend;
          this.searchWidget.setValue(newQuery);
        } else {
          const queryWithRemovedTags = this.searchWidget.getValue().split(" ").filter((word) => word !== queryToAppend).join(" ");
          this.searchWidget.setValue(queryWithRemovedTags);
        }
        this.searchWidget.focus();
      }, "run")
    };
  }
  createMutuallyExclusiveToggleAction(id, label, tooltip, filter, excludeFilters) {
    const isFilterEnabled = this.searchWidget.getValue().split(" ").includes(filter);
    return {
      id,
      label,
      tooltip,
      class: void 0,
      enabled: true,
      checked: isFilterEnabled,
      run: /* @__PURE__ */ __name(() => {
        if (isFilterEnabled) {
          const queryWithRemovedTags = this.searchWidget.getValue().split(" ").filter((word) => word !== filter).join(" ");
          this.searchWidget.setValue(queryWithRemovedTags);
        } else {
          let newQuery = this.searchWidget.getValue().split(" ").filter((word) => !excludeFilters.includes(word) && word !== filter).join(" ").trimEnd();
          newQuery = newQuery ? newQuery + " " + filter : filter;
          this.searchWidget.setValue(newQuery);
        }
        this.searchWidget.focus();
      }, "run")
    };
  }
  getActions() {
    return [
      this.createToggleAction("modifiedSettingsSearch", localize("modifiedSettingsSearch", "Modified"), localize("modifiedSettingsSearchTooltip", "Add or remove modified settings filter"), `@${MODIFIED_SETTING_TAG}`),
      new Separator(),
      this.createAction("extSettingsSearch", localize("extSettingsSearch", "Extension ID..."), localize("extSettingsSearchTooltip", "Add extension ID filter"), `@${EXTENSION_SETTING_TAG}`, true),
      this.createAction("featuresSettingsSearch", localize("featureSettingsSearch", "Feature..."), localize("featureSettingsSearchTooltip", "Add feature filter"), `@${FEATURE_SETTING_TAG}`, true),
      this.createAction("tagSettingsSearch", localize("tagSettingsSearch", "Tag..."), localize("tagSettingsSearchTooltip", "Add tag filter"), `@${GENERAL_TAG_SETTING_TAG}`, true),
      this.createAction("langSettingsSearch", localize("langSettingsSearch", "Language..."), localize("langSettingsSearchTooltip", "Add language ID filter"), `@${LANGUAGE_SETTING_TAG}`, true),
      this.createAction("idSettingsSearch", localize("idSettingsSearch", "Setting ID..."), localize("idSettingsSearchTooltip", "Add Setting ID filter"), `@${ID_SETTING_TAG}`, false),
      new Separator(),
      this.createToggleAction("onlineSettingsSearch", localize("onlineSettingsSearch", "Online services"), localize("onlineSettingsSearchTooltip", "Show settings for online services"), "@tag:usesOnlineServices"),
      this.createToggleAction("policySettingsSearch", localize("policySettingsSearch", "Organization policies"), localize("policySettingsSearchTooltip", "Show organization policy settings"), `@${POLICY_SETTING_TAG}`),
      new Separator(),
      this.createMutuallyExclusiveToggleAction("stableSettingsSearch", localize("stableSettings", "Stable"), localize("stableSettingsSearchTooltip", "Show stable settings"), `@stable`, ["@tag:preview", "@tag:experimental"]),
      this.createMutuallyExclusiveToggleAction("previewSettingsSearch", localize("previewSettings", "Preview"), localize("previewSettingsSearchTooltip", "Show preview settings"), `@tag:preview`, ["@stable", "@tag:experimental"]),
      this.createMutuallyExclusiveToggleAction("experimentalSettingsSearch", localize("experimental", "Experimental"), localize("experimentalSettingsSearchTooltip", "Show experimental settings"), `@tag:experimental`, ["@stable", "@tag:preview"]),
      new Separator(),
      this.createToggleAction("advancedSettingsSearch", localize("advancedSettingsSearch", "Advanced"), localize("advancedSettingsSearchTooltip", "Show advanced settings"), `@tag:${ADVANCED_SETTING_TAG}`)
    ];
  }
};
SettingsSearchFilterDropdownMenuActionViewItem = __decorate([
  __param(4, IContextMenuService)
], SettingsSearchFilterDropdownMenuActionViewItem);
export {
  SettingsSearchFilterDropdownMenuActionViewItem
};
//# sourceMappingURL=settingsSearchMenu.js.map
