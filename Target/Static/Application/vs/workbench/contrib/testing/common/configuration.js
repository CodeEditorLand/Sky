var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { observableFromEvent } from "../../../../base/common/observable.js";
import { localize } from "../../../../nls.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions } from "../../../common/configuration.js";
var TestingConfigKeys;
(function(TestingConfigKeys2) {
  TestingConfigKeys2["AutoOpenPeekView"] = "testing.automaticallyOpenPeekView";
  TestingConfigKeys2["AutoOpenPeekViewDuringContinuousRun"] = "testing.automaticallyOpenPeekViewDuringAutoRun";
  TestingConfigKeys2["OpenResults"] = "testing.automaticallyOpenTestResults";
  TestingConfigKeys2["FollowRunningTest"] = "testing.followRunningTest";
  TestingConfigKeys2["DefaultGutterClickAction"] = "testing.defaultGutterClickAction";
  TestingConfigKeys2["GutterEnabled"] = "testing.gutterEnabled";
  TestingConfigKeys2["SaveBeforeTest"] = "testing.saveBeforeTest";
  TestingConfigKeys2["AlwaysRevealTestOnStateChange"] = "testing.alwaysRevealTestOnStateChange";
  TestingConfigKeys2["CountBadge"] = "testing.countBadge";
  TestingConfigKeys2["ShowAllMessages"] = "testing.showAllMessages";
  TestingConfigKeys2["CoveragePercent"] = "testing.displayedCoveragePercent";
  TestingConfigKeys2["ShowCoverageInExplorer"] = "testing.showCoverageInExplorer";
  TestingConfigKeys2["CoverageBarThresholds"] = "testing.coverageBarThresholds";
  TestingConfigKeys2["CoverageToolbarEnabled"] = "testing.coverageToolbarEnabled";
})(TestingConfigKeys || (TestingConfigKeys = {}));
var AutoOpenTesting;
(function(AutoOpenTesting2) {
  AutoOpenTesting2["NeverOpen"] = "neverOpen";
  AutoOpenTesting2["OpenOnTestStart"] = "openOnTestStart";
  AutoOpenTesting2["OpenOnTestFailure"] = "openOnTestFailure";
  AutoOpenTesting2["OpenExplorerOnTestStart"] = "openExplorerOnTestStart";
})(AutoOpenTesting || (AutoOpenTesting = {}));
var AutoOpenPeekViewWhen;
(function(AutoOpenPeekViewWhen2) {
  AutoOpenPeekViewWhen2["FailureVisible"] = "failureInVisibleDocument";
  AutoOpenPeekViewWhen2["FailureAnywhere"] = "failureAnywhere";
  AutoOpenPeekViewWhen2["Never"] = "never";
})(AutoOpenPeekViewWhen || (AutoOpenPeekViewWhen = {}));
var DefaultGutterClickAction;
(function(DefaultGutterClickAction2) {
  DefaultGutterClickAction2["Run"] = "run";
  DefaultGutterClickAction2["Debug"] = "debug";
  DefaultGutterClickAction2["Coverage"] = "runWithCoverage";
  DefaultGutterClickAction2["ContextMenu"] = "contextMenu";
})(DefaultGutterClickAction || (DefaultGutterClickAction = {}));
var TestingCountBadge;
(function(TestingCountBadge2) {
  TestingCountBadge2["Failed"] = "failed";
  TestingCountBadge2["Off"] = "off";
  TestingCountBadge2["Passed"] = "passed";
  TestingCountBadge2["Skipped"] = "skipped";
})(TestingCountBadge || (TestingCountBadge = {}));
var TestingDisplayedCoveragePercent;
(function(TestingDisplayedCoveragePercent2) {
  TestingDisplayedCoveragePercent2["TotalCoverage"] = "totalCoverage";
  TestingDisplayedCoveragePercent2["Statement"] = "statement";
  TestingDisplayedCoveragePercent2["Minimum"] = "minimum";
})(TestingDisplayedCoveragePercent || (TestingDisplayedCoveragePercent = {}));
const testingConfiguration = {
  id: "testing",
  order: 21,
  title: localize("testConfigurationTitle", "Testing"),
  type: "object",
  properties: {
    [
      "testing.automaticallyOpenPeekView"
      /* TestingConfigKeys.AutoOpenPeekView */
    ]: {
      description: localize("testing.automaticallyOpenPeekView", "Configures when the error Peek view is automatically opened."),
      enum: [
        "failureAnywhere",
        "failureInVisibleDocument",
        "never"
      ],
      default: "never",
      enumDescriptions: [
        localize("testing.automaticallyOpenPeekView.failureAnywhere", "Open automatically no matter where the failure is."),
        localize("testing.automaticallyOpenPeekView.failureInVisibleDocument", "Open automatically when a test fails in a visible document."),
        localize("testing.automaticallyOpenPeekView.never", "Never automatically open.")
      ]
    },
    [
      "testing.showAllMessages"
      /* TestingConfigKeys.ShowAllMessages */
    ]: {
      description: localize("testing.showAllMessages", "Controls whether to show messages from all test runs."),
      type: "boolean",
      default: false
    },
    [
      "testing.automaticallyOpenPeekViewDuringAutoRun"
      /* TestingConfigKeys.AutoOpenPeekViewDuringContinuousRun */
    ]: {
      description: localize("testing.automaticallyOpenPeekViewDuringContinuousRun", "Controls whether to automatically open the Peek view during continuous run mode."),
      type: "boolean",
      default: false
    },
    [
      "testing.countBadge"
      /* TestingConfigKeys.CountBadge */
    ]: {
      description: localize("testing.countBadge", "Controls the count badge on the Testing icon on the Activity Bar."),
      enum: [
        "failed",
        "off",
        "passed",
        "skipped"
      ],
      enumDescriptions: [
        localize("testing.countBadge.failed", "Show the number of failed tests"),
        localize("testing.countBadge.off", "Disable the testing count badge"),
        localize("testing.countBadge.passed", "Show the number of passed tests"),
        localize("testing.countBadge.skipped", "Show the number of skipped tests")
      ],
      default: "failed"
    },
    [
      "testing.followRunningTest"
      /* TestingConfigKeys.FollowRunningTest */
    ]: {
      description: localize("testing.followRunningTest", "Controls whether the running test should be followed in the Test Explorer view."),
      type: "boolean",
      default: false
    },
    [
      "testing.defaultGutterClickAction"
      /* TestingConfigKeys.DefaultGutterClickAction */
    ]: {
      description: localize("testing.defaultGutterClickAction", "Controls the action to take when left-clicking on a test decoration in the gutter."),
      enum: [
        "run",
        "debug",
        "runWithCoverage",
        "contextMenu"
      ],
      enumDescriptions: [
        localize("testing.defaultGutterClickAction.run", "Run the test."),
        localize("testing.defaultGutterClickAction.debug", "Debug the test."),
        localize("testing.defaultGutterClickAction.coverage", "Run the test with coverage."),
        localize("testing.defaultGutterClickAction.contextMenu", "Open the context menu for more options.")
      ],
      default: "run"
    },
    [
      "testing.gutterEnabled"
      /* TestingConfigKeys.GutterEnabled */
    ]: {
      description: localize("testing.gutterEnabled", "Controls whether test decorations are shown in the editor gutter."),
      type: "boolean",
      default: true
    },
    [
      "testing.saveBeforeTest"
      /* TestingConfigKeys.SaveBeforeTest */
    ]: {
      description: localize("testing.saveBeforeTest", "Control whether save all dirty editors before running a test."),
      type: "boolean",
      default: true
    },
    [
      "testing.automaticallyOpenTestResults"
      /* TestingConfigKeys.OpenResults */
    ]: {
      enum: [
        "neverOpen",
        "openOnTestStart",
        "openOnTestFailure",
        "openExplorerOnTestStart"
      ],
      enumDescriptions: [
        localize("testing.openTesting.neverOpen", "Never automatically open the testing views"),
        localize("testing.openTesting.openOnTestStart", "Open the test results view when tests start"),
        localize("testing.openTesting.openOnTestFailure", "Open the test result view on any test failure"),
        localize("testing.openTesting.openExplorerOnTestStart", "Open the test explorer when tests start")
      ],
      default: "openOnTestStart",
      description: localize("testing.openTesting", "Controls when the testing view should open.")
    },
    [
      "testing.alwaysRevealTestOnStateChange"
      /* TestingConfigKeys.AlwaysRevealTestOnStateChange */
    ]: {
      markdownDescription: localize("testing.alwaysRevealTestOnStateChange", "Always reveal the executed test when {0} is on. If this setting is turned off, only failed tests will be revealed.", "`#testing.followRunningTest#`"),
      type: "boolean",
      default: false
    },
    [
      "testing.showCoverageInExplorer"
      /* TestingConfigKeys.ShowCoverageInExplorer */
    ]: {
      description: localize("testing.ShowCoverageInExplorer", "Whether test coverage should be down in the File Explorer view."),
      type: "boolean",
      default: true
    },
    [
      "testing.displayedCoveragePercent"
      /* TestingConfigKeys.CoveragePercent */
    ]: {
      markdownDescription: localize("testing.displayedCoveragePercent", "Configures what percentage is displayed by default for test coverage."),
      default: "totalCoverage",
      enum: [
        "totalCoverage",
        "statement",
        "minimum"
      ],
      enumDescriptions: [
        localize("testing.displayedCoveragePercent.totalCoverage", "A calculation of the combined statement, function, and branch coverage."),
        localize("testing.displayedCoveragePercent.statement", "The statement coverage."),
        localize("testing.displayedCoveragePercent.minimum", "The minimum of statement, function, and branch coverage.")
      ]
    },
    [
      "testing.coverageBarThresholds"
      /* TestingConfigKeys.CoverageBarThresholds */
    ]: {
      markdownDescription: localize("testing.coverageBarThresholds", "Configures the colors used for percentages in test coverage bars."),
      default: { red: 0, yellow: 60, green: 90 },
      properties: {
        red: { type: "number", minimum: 0, maximum: 100, default: 0 },
        yellow: { type: "number", minimum: 0, maximum: 100, default: 60 },
        green: { type: "number", minimum: 0, maximum: 100, default: 90 }
      }
    },
    [
      "testing.coverageToolbarEnabled"
      /* TestingConfigKeys.CoverageToolbarEnabled */
    ]: {
      description: localize("testing.coverageToolbarEnabled", "Controls whether the coverage toolbar is shown in the editor."),
      type: "boolean",
      default: false
      // todo@connor4312: disabled by default until UI sync
    }
  }
};
Registry.as(Extensions.ConfigurationMigration).registerConfigurationMigrations([{
  key: "testing.openTesting",
  migrateFn: /* @__PURE__ */ __name((value) => {
    return [["testing.automaticallyOpenTestResults", { value }]];
  }, "migrateFn")
}, {
  key: "testing.automaticallyOpenResults",
  // insiders only during 1.96, remove after 1.97
  migrateFn: /* @__PURE__ */ __name((value) => {
    return [["testing.automaticallyOpenTestResults", { value }]];
  }, "migrateFn")
}]);
const getTestingConfiguration = /* @__PURE__ */ __name((config, key) => config.getValue(key), "getTestingConfiguration");
const observeTestingConfiguration = /* @__PURE__ */ __name((config, key) => observableFromEvent(config.onDidChangeConfiguration, () => getTestingConfiguration(config, key)), "observeTestingConfiguration");
export {
  AutoOpenPeekViewWhen,
  AutoOpenTesting,
  DefaultGutterClickAction,
  TestingConfigKeys,
  TestingCountBadge,
  TestingDisplayedCoveragePercent,
  getTestingConfiguration,
  observeTestingConfiguration,
  testingConfiguration
};
//# sourceMappingURL=configuration.js.map
