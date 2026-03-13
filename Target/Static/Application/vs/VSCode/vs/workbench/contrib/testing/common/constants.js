var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { stripIcons } from "../../../../base/common/iconLabels.js";
import { localize } from "../../../../nls.js";
var Testing;
(function(Testing2) {
  Testing2["ViewletId"] = "workbench.view.extension.test";
  Testing2["ExplorerViewId"] = "workbench.view.testing";
  Testing2["OutputPeekContributionId"] = "editor.contrib.testingOutputPeek";
  Testing2["DecorationsContributionId"] = "editor.contrib.testingDecorations";
  Testing2["CoverageDecorationsContributionId"] = "editor.contrib.coverageDecorations";
  Testing2["CoverageViewId"] = "workbench.view.testCoverage";
  Testing2["ResultsPanelId"] = "workbench.panel.testResults";
  Testing2["ResultsViewId"] = "workbench.panel.testResults.view";
  Testing2["MessageLanguageId"] = "vscodeInternalTestMessage";
})(Testing || (Testing = {}));
var TestExplorerViewMode;
(function(TestExplorerViewMode2) {
  TestExplorerViewMode2["List"] = "list";
  TestExplorerViewMode2["Tree"] = "true";
})(TestExplorerViewMode || (TestExplorerViewMode = {}));
var TestExplorerViewSorting;
(function(TestExplorerViewSorting2) {
  TestExplorerViewSorting2["ByLocation"] = "location";
  TestExplorerViewSorting2["ByStatus"] = "status";
  TestExplorerViewSorting2["ByDuration"] = "duration";
})(TestExplorerViewSorting || (TestExplorerViewSorting = {}));
const testStateNames = {
  [
    6
    /* TestResultState.Errored */
  ]: localize("testState.errored", "Errored"),
  [
    4
    /* TestResultState.Failed */
  ]: localize("testState.failed", "Failed"),
  [
    3
    /* TestResultState.Passed */
  ]: localize("testState.passed", "Passed"),
  [
    1
    /* TestResultState.Queued */
  ]: localize("testState.queued", "Queued"),
  [
    2
    /* TestResultState.Running */
  ]: localize("testState.running", "Running"),
  [
    5
    /* TestResultState.Skipped */
  ]: localize("testState.skipped", "Skipped"),
  [
    0
    /* TestResultState.Unset */
  ]: localize("testState.unset", "Not yet run")
};
const labelForTestInState = /* @__PURE__ */ __name((label, state) => localize({
  key: "testing.treeElementLabel",
  comment: ['label then the unit tests state, for example "Addition Tests (Running)"']
}, "{0} ({1})", stripIcons(label), testStateNames[state]), "labelForTestInState");
const testConfigurationGroupNames = {
  [
    4
    /* TestRunProfileBitset.Debug */
  ]: localize("testGroup.debug", "Debug"),
  [
    2
    /* TestRunProfileBitset.Run */
  ]: localize("testGroup.run", "Run"),
  [
    8
    /* TestRunProfileBitset.Coverage */
  ]: localize("testGroup.coverage", "Coverage")
};
var TestCommandId;
(function(TestCommandId2) {
  TestCommandId2["CancelTestRefreshAction"] = "testing.cancelTestRefresh";
  TestCommandId2["CancelTestRunAction"] = "testing.cancelRun";
  TestCommandId2["ClearTestResultsAction"] = "testing.clearTestResults";
  TestCommandId2["CollapseAllAction"] = "testing.collapseAll";
  TestCommandId2["ConfigureTestProfilesAction"] = "testing.configureProfile";
  TestCommandId2["ContinousRunUsingForTest"] = "testing.continuousRunUsingForTest";
  TestCommandId2["CoverageAtCursor"] = "testing.coverageAtCursor";
  TestCommandId2["CoverageByUri"] = "testing.coverage.uri";
  TestCommandId2["CoverageClear"] = "testing.coverage.close";
  TestCommandId2["CoverageCurrentFile"] = "testing.coverageCurrentFile";
  TestCommandId2["CoverageFilterToTest"] = "testing.coverageFilterToTest";
  TestCommandId2["CoverageFilterToTestInEditor"] = "testing.coverageFilterToTestInEditor";
  TestCommandId2["CoverageGoToNextMissedLine"] = "testing.coverage.goToNextMissedLine";
  TestCommandId2["CoverageGoToPreviousMissedLine"] = "testing.coverage.goToPreviousMissedLine";
  TestCommandId2["CoverageLastRun"] = "testing.coverageLastRun";
  TestCommandId2["CoverageSelectedAction"] = "testing.coverageSelected";
  TestCommandId2["CoverageToggleInExplorer"] = "testing.toggleCoverageInExplorer";
  TestCommandId2["CoverageToggleToolbar"] = "testing.coverageToggleToolbar";
  TestCommandId2["CoverageViewChangeSorting"] = "testing.coverageViewChangeSorting";
  TestCommandId2["CoverageViewCollapseAll"] = "testing.coverageViewCollapseAll";
  TestCommandId2["DebugAction"] = "testing.debug";
  TestCommandId2["DebugAllAction"] = "testing.debugAll";
  TestCommandId2["DebugAtCursor"] = "testing.debugAtCursor";
  TestCommandId2["DebugByUri"] = "testing.debug.uri";
  TestCommandId2["DebugCurrentFile"] = "testing.debugCurrentFile";
  TestCommandId2["DebugFailedTests"] = "testing.debugFailTests";
  TestCommandId2["DebugFailedFromLastRun"] = "testing.debugFailedFromLastRun";
  TestCommandId2["DebugLastRun"] = "testing.debugLastRun";
  TestCommandId2["DebugSelectedAction"] = "testing.debugSelected";
  TestCommandId2["FilterAction"] = "workbench.actions.treeView.testExplorer.filter";
  TestCommandId2["GetExplorerSelection"] = "_testing.getExplorerSelection";
  TestCommandId2["GetSelectedProfiles"] = "testing.getSelectedProfiles";
  TestCommandId2["GoToTest"] = "testing.editFocusedTest";
  TestCommandId2["GoToRelatedTest"] = "testing.goToRelatedTest";
  TestCommandId2["PeekRelatedTest"] = "testing.peekRelatedTest";
  TestCommandId2["GoToRelatedCode"] = "testing.goToRelatedCode";
  TestCommandId2["PeekRelatedCode"] = "testing.peekRelatedCode";
  TestCommandId2["HideTestAction"] = "testing.hideTest";
  TestCommandId2["OpenCoverage"] = "testing.openCoverage";
  TestCommandId2["OpenOutputPeek"] = "testing.openOutputPeek";
  TestCommandId2["RefreshTestsAction"] = "testing.refreshTests";
  TestCommandId2["ReRunFailedTests"] = "testing.reRunFailTests";
  TestCommandId2["ReRunFailedFromLastRun"] = "testing.reRunFailedFromLastRun";
  TestCommandId2["ReRunLastRun"] = "testing.reRunLastRun";
  TestCommandId2["RunAction"] = "testing.run";
  TestCommandId2["RunAllAction"] = "testing.runAll";
  TestCommandId2["RunAllWithCoverageAction"] = "testing.coverageAll";
  TestCommandId2["RunAtCursor"] = "testing.runAtCursor";
  TestCommandId2["RunByUri"] = "testing.run.uri";
  TestCommandId2["RunCurrentFile"] = "testing.runCurrentFile";
  TestCommandId2["RunSelectedAction"] = "testing.runSelected";
  TestCommandId2["RunUsingProfileAction"] = "testing.runUsing";
  TestCommandId2["RunWithCoverageAction"] = "testing.coverage";
  TestCommandId2["SearchForTestExtension"] = "testing.searchForTestExtension";
  TestCommandId2["SelectDefaultTestProfiles"] = "testing.selectDefaultTestProfiles";
  TestCommandId2["ShowMostRecentOutputAction"] = "testing.showMostRecentOutput";
  TestCommandId2["StartContinousRun"] = "testing.startContinuousRun";
  TestCommandId2["StartContinousRunFromExtension"] = "testing.startContinuousRunFromExtension";
  TestCommandId2["StopContinousRunFromExtension"] = "testing.stopContinuousRunFromExtension";
  TestCommandId2["StopContinousRun"] = "testing.stopContinuousRun";
  TestCommandId2["TestingSortByDurationAction"] = "testing.sortByDuration";
  TestCommandId2["TestingSortByLocationAction"] = "testing.sortByLocation";
  TestCommandId2["TestingSortByStatusAction"] = "testing.sortByStatus";
  TestCommandId2["TestingViewAsListAction"] = "testing.viewAsList";
  TestCommandId2["TestingViewAsTreeAction"] = "testing.viewAsTree";
  TestCommandId2["ToggleContinousRunForTest"] = "testing.toggleContinuousRunForTest";
  TestCommandId2["ToggleResultsViewLayoutAction"] = "testing.toggleResultsViewLayout";
  TestCommandId2["ToggleInlineTestOutput"] = "testing.toggleInlineTestOutput";
  TestCommandId2["UnhideAllTestsAction"] = "testing.unhideAllTests";
  TestCommandId2["UnhideTestAction"] = "testing.unhideTest";
})(TestCommandId || (TestCommandId = {}));
export {
  TestCommandId,
  TestExplorerViewMode,
  TestExplorerViewSorting,
  Testing,
  labelForTestInState,
  testConfigurationGroupNames
};
//# sourceMappingURL=constants.js.map
