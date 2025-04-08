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
import { IActionViewItemOptions } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { AnchorAlignment } from "../../../../base/browser/ui/contextview/contextview.js";
import { DropdownMenuActionViewItem } from "../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import { IAction, IActionRunner } from "../../../../base/common/actions.js";
import { SuggestController } from "../../../../editor/contrib/suggest/browser/suggestController.js";
import { localize } from "../../../../nls.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { SuggestEnabledInput } from "../../codeEditor/browser/suggestEnabledInput/suggestEnabledInput.js";
import { EXTENSION_SETTING_TAG, FEATURE_SETTING_TAG, GENERAL_TAG_SETTING_TAG, LANGUAGE_SETTING_TAG, MODIFIED_SETTING_TAG, POLICY_SETTING_TAG } from "../common/preferences.js";
let SettingsSearchFilterDropdownMenuActionViewItem = class extends DropdownMenuActionViewItem {
  constructor(action, options, actionRunner, searchWidget, contextMenuService) {
    super(
      action,
      { getActions: /* @__PURE__ */ __name(() => this.getActions(), "getActions") },
      contextMenuService,
      {
        ...options,
        actionRunner,
        classNames: action.class,
        anchorAlignmentProvider: /* @__PURE__ */ __name(() => AnchorAlignment.RIGHT, "anchorAlignmentProvider"),
        menuAsChild: true
      }
    );
    this.searchWidget = searchWidget;
    this.suggestController = SuggestController.get(this.searchWidget.inputWidget);
  }
  static {
    __name(this, "SettingsSearchFilterDropdownMenuActionViewItem");
  }
  suggestController;
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
  getActions() {
    return [
      this.createToggleAction(
        "modifiedSettingsSearch",
        localize("modifiedSettingsSearch", "Modified"),
        localize("modifiedSettingsSearchTooltip", "Add or remove modified settings filter"),
        `@${MODIFIED_SETTING_TAG}`
      ),
      this.createAction(
        "extSettingsSearch",
        localize("extSettingsSearch", "Extension ID..."),
        localize("extSettingsSearchTooltip", "Add extension ID filter"),
        `@${EXTENSION_SETTING_TAG}`,
        true
      ),
      this.createAction(
        "featuresSettingsSearch",
        localize("featureSettingsSearch", "Feature..."),
        localize("featureSettingsSearchTooltip", "Add feature filter"),
        `@${FEATURE_SETTING_TAG}`,
        true
      ),
      this.createAction(
        "tagSettingsSearch",
        localize("tagSettingsSearch", "Tag..."),
        localize("tagSettingsSearchTooltip", "Add tag filter"),
        `@${GENERAL_TAG_SETTING_TAG}`,
        true
      ),
      this.createAction(
        "langSettingsSearch",
        localize("langSettingsSearch", "Language..."),
        localize("langSettingsSearchTooltip", "Add language ID filter"),
        `@${LANGUAGE_SETTING_TAG}`,
        true
      ),
      this.createToggleAction(
        "onlineSettingsSearch",
        localize("onlineSettingsSearch", "Online services"),
        localize("onlineSettingsSearchTooltip", "Show settings for online services"),
        "@tag:usesOnlineServices"
      ),
      this.createToggleAction(
        "policySettingsSearch",
        localize("policySettingsSearch", "Policy services"),
        localize("policySettingsSearchTooltip", "Show settings for policy services"),
        `@${POLICY_SETTING_TAG}`
      )
    ];
  }
};
SettingsSearchFilterDropdownMenuActionViewItem = __decorateClass([
  __decorateParam(4, IContextMenuService)
], SettingsSearchFilterDropdownMenuActionViewItem);
export {
  SettingsSearchFilterDropdownMenuActionViewItem
};
//# sourceMappingURL=settingsSearchMenu.js.map
