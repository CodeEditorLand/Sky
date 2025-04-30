var TerminalSuggestCommandId;
(function(TerminalSuggestCommandId2) {
  TerminalSuggestCommandId2["SelectPrevSuggestion"] = "workbench.action.terminal.selectPrevSuggestion";
  TerminalSuggestCommandId2["SelectPrevPageSuggestion"] = "workbench.action.terminal.selectPrevPageSuggestion";
  TerminalSuggestCommandId2["SelectNextSuggestion"] = "workbench.action.terminal.selectNextSuggestion";
  TerminalSuggestCommandId2["SelectNextPageSuggestion"] = "workbench.action.terminal.selectNextPageSuggestion";
  TerminalSuggestCommandId2["AcceptSelectedSuggestion"] = "workbench.action.terminal.acceptSelectedSuggestion";
  TerminalSuggestCommandId2["AcceptSelectedSuggestionEnter"] = "workbench.action.terminal.acceptSelectedSuggestionEnter";
  TerminalSuggestCommandId2["HideSuggestWidget"] = "workbench.action.terminal.hideSuggestWidget";
  TerminalSuggestCommandId2["HideSuggestWidgetAndNavigateHistory"] = "workbench.action.terminal.hideSuggestWidgetAndNavigateHistory";
  TerminalSuggestCommandId2["RequestCompletions"] = "workbench.action.terminal.requestCompletions";
  TerminalSuggestCommandId2["ResetWidgetSize"] = "workbench.action.terminal.resetSuggestWidgetSize";
  TerminalSuggestCommandId2["ToggleDetails"] = "workbench.action.terminal.suggestToggleDetails";
  TerminalSuggestCommandId2["ToggleDetailsFocus"] = "workbench.action.terminal.suggestToggleDetailsFocus";
  TerminalSuggestCommandId2["ConfigureSettings"] = "workbench.action.terminal.configureSuggestSettings";
})(TerminalSuggestCommandId || (TerminalSuggestCommandId = {}));
const defaultTerminalSuggestCommandsToSkipShell = [
  "workbench.action.terminal.selectPrevSuggestion",
  "workbench.action.terminal.selectPrevPageSuggestion",
  "workbench.action.terminal.selectNextSuggestion",
  "workbench.action.terminal.selectNextPageSuggestion",
  "workbench.action.terminal.acceptSelectedSuggestion",
  "workbench.action.terminal.acceptSelectedSuggestionEnter",
  "workbench.action.terminal.hideSuggestWidget",
  "workbench.action.terminal.requestCompletions",
  "workbench.action.terminal.suggestToggleDetails",
  "workbench.action.terminal.suggestToggleDetailsFocus"
];
export {
  TerminalSuggestCommandId,
  defaultTerminalSuggestCommandsToSkipShell
};
//# sourceMappingURL=terminal.suggest.js.map
