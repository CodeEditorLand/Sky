var TerminalSuggestCommandId;
(function(TerminalSuggestCommandId2) {
  TerminalSuggestCommandId2["SelectPrevSuggestion"] = "workbench.action.terminal.selectPrevSuggestion";
  TerminalSuggestCommandId2["SelectPrevPageSuggestion"] = "workbench.action.terminal.selectPrevPageSuggestion";
  TerminalSuggestCommandId2["SelectNextSuggestion"] = "workbench.action.terminal.selectNextSuggestion";
  TerminalSuggestCommandId2["SelectNextPageSuggestion"] = "workbench.action.terminal.selectNextPageSuggestion";
  TerminalSuggestCommandId2["AcceptSelectedSuggestion"] = "workbench.action.terminal.acceptSelectedSuggestion";
  TerminalSuggestCommandId2["AcceptSelectedSuggestionEnter"] = "workbench.action.terminal.acceptSelectedSuggestionEnter";
  TerminalSuggestCommandId2["ChangeSelectionModeNever"] = "workbench.action.terminal.changeSelectionModeNever";
  TerminalSuggestCommandId2["ChangeSelectionModePartial"] = "workbench.action.terminal.changeSelectionModePartial";
  TerminalSuggestCommandId2["ChangeSelectionModeAlways"] = "workbench.action.terminal.changeSelectionModeAlways";
  TerminalSuggestCommandId2["HideSuggestWidget"] = "workbench.action.terminal.hideSuggestWidget";
  TerminalSuggestCommandId2["HideSuggestWidgetAndNavigateHistory"] = "workbench.action.terminal.hideSuggestWidgetAndNavigateHistory";
  TerminalSuggestCommandId2["TriggerSuggest"] = "workbench.action.terminal.triggerSuggest";
  TerminalSuggestCommandId2["ResetWidgetSize"] = "workbench.action.terminal.resetSuggestWidgetSize";
  TerminalSuggestCommandId2["ToggleDetails"] = "workbench.action.terminal.suggestToggleDetails";
  TerminalSuggestCommandId2["ToggleDetailsFocus"] = "workbench.action.terminal.suggestToggleDetailsFocus";
  TerminalSuggestCommandId2["ConfigureSettings"] = "workbench.action.terminal.configureSuggestSettings";
  TerminalSuggestCommandId2["LearnMore"] = "workbench.action.terminal.suggestLearnMore";
  TerminalSuggestCommandId2["ResetDiscoverability"] = "workbench.action.terminal.resetDiscoverability";
  TerminalSuggestCommandId2["ShowOnType"] = "workbench.action.terminal.showSuggestOnType";
  TerminalSuggestCommandId2["DoNotShowOnType"] = "workbench.action.terminal.doNotShowSuggestOnType";
})(TerminalSuggestCommandId || (TerminalSuggestCommandId = {}));
const defaultTerminalSuggestCommandsToSkipShell = [
  "workbench.action.terminal.selectPrevSuggestion",
  "workbench.action.terminal.selectPrevPageSuggestion",
  "workbench.action.terminal.selectNextSuggestion",
  "workbench.action.terminal.selectNextPageSuggestion",
  "workbench.action.terminal.acceptSelectedSuggestion",
  "workbench.action.terminal.acceptSelectedSuggestionEnter",
  "workbench.action.terminal.hideSuggestWidget",
  "workbench.action.terminal.triggerSuggest",
  "workbench.action.terminal.suggestToggleDetails",
  "workbench.action.terminal.suggestToggleDetailsFocus"
];
export {
  TerminalSuggestCommandId,
  defaultTerminalSuggestCommandsToSkipShell
};
//# sourceMappingURL=terminal.suggest.js.map
