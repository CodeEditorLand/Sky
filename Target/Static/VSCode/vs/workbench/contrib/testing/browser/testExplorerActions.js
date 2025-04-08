var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { distinct } from "../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { isDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { IActiveCodeEditor, ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { EmbeddedCodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { EditorOption, GoToLocationValues } from "../../../../editor/common/config/editorOptions.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { SymbolNavigationAction } from "../../../../editor/contrib/gotoSymbol/browser/goToCommands.js";
import { ReferencesModel } from "../../../../editor/contrib/gotoSymbol/browser/referencesModel.js";
import { MessageController } from "../../../../editor/contrib/message/browser/messageController.js";
import { PeekContext } from "../../../../editor/contrib/peekView/browser/peekView.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Action2, IAction2Options, MenuId } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, ContextKeyExpression, ContextKeyGreaterExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IProgressService, ProgressLocation } from "../../../../platform/progress/common/progress.js";
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from "../../../../platform/quickinput/common/quickInput.js";
import { widgetClose } from "../../../../platform/theme/common/iconRegistry.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { ViewAction } from "../../../browser/parts/views/viewPane.js";
import { FocusedViewContext } from "../../../common/contextkeys.js";
import { IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import { TestExplorerTreeElement, TestItemTreeElement } from "./explorerProjections/index.js";
import * as icons from "./icons.js";
import { TestingExplorerView } from "./testingExplorerView.js";
import { TestResultsView } from "./testingOutputPeek.js";
import { TestingConfigKeys, getTestingConfiguration } from "../common/configuration.js";
import { TestCommandId, TestExplorerViewMode, TestExplorerViewSorting, Testing, testConfigurationGroupNames } from "../common/constants.js";
import { ITestCoverageService } from "../common/testCoverageService.js";
import { TestId } from "../common/testId.js";
import { ITestProfileService, canUseProfileWithTest } from "../common/testProfileService.js";
import { ITestResult } from "../common/testResult.js";
import { ITestResultService } from "../common/testResultService.js";
import { IMainThreadTestCollection, IMainThreadTestController, ITestService, expandAndGetTestById, testsInFile, testsUnderUri } from "../common/testService.js";
import { ExtTestRunProfileKind, ITestRunProfile, InternalTestItem, TestItemExpandState, TestRunProfileBitset } from "../common/testTypes.js";
import { TestingContextKeys } from "../common/testingContextKeys.js";
import { ITestingContinuousRunService } from "../common/testingContinuousRunService.js";
import { ITestingPeekOpener } from "../common/testingPeekOpener.js";
import { isFailedState } from "../common/testingStates.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
const category = Categories.Test;
var ActionOrder = /* @__PURE__ */ ((ActionOrder2) => {
  ActionOrder2[ActionOrder2["Refresh"] = 10] = "Refresh";
  ActionOrder2[ActionOrder2["Run"] = 11] = "Run";
  ActionOrder2[ActionOrder2["Debug"] = 12] = "Debug";
  ActionOrder2[ActionOrder2["Coverage"] = 13] = "Coverage";
  ActionOrder2[ActionOrder2["RunContinuous"] = 14] = "RunContinuous";
  ActionOrder2[ActionOrder2["RunUsing"] = 15] = "RunUsing";
  ActionOrder2[ActionOrder2["Collapse"] = 16] = "Collapse";
  ActionOrder2[ActionOrder2["ClearResults"] = 17] = "ClearResults";
  ActionOrder2[ActionOrder2["DisplayMode"] = 18] = "DisplayMode";
  ActionOrder2[ActionOrder2["Sort"] = 19] = "Sort";
  ActionOrder2[ActionOrder2["GoToTest"] = 20] = "GoToTest";
  ActionOrder2[ActionOrder2["HideTest"] = 21] = "HideTest";
  ActionOrder2[ActionOrder2["ContinuousRunTest"] = 2147483647] = "ContinuousRunTest";
  return ActionOrder2;
})(ActionOrder || {});
const hasAnyTestProvider = ContextKeyGreaterExpr.create(TestingContextKeys.providerCount.key, 0);
const LABEL_RUN_TESTS = localize2("runSelectedTests", "Run Tests");
const LABEL_DEBUG_TESTS = localize2("debugSelectedTests", "Debug Tests");
const LABEL_COVERAGE_TESTS = localize2("coverageSelectedTests", "Run Tests with Coverage");
class HideTestAction extends Action2 {
  static {
    __name(this, "HideTestAction");
  }
  constructor() {
    super({
      id: TestCommandId.HideTestAction,
      title: localize2("hideTest", "Hide Test"),
      menu: {
        id: MenuId.TestItem,
        group: "builtin@2",
        when: TestingContextKeys.testItemIsHidden.isEqualTo(false)
      }
    });
  }
  run(accessor, ...elements) {
    const service = accessor.get(ITestService);
    for (const element of elements) {
      service.excluded.toggle(element.test, true);
    }
    return Promise.resolve();
  }
}
class UnhideTestAction extends Action2 {
  static {
    __name(this, "UnhideTestAction");
  }
  constructor() {
    super({
      id: TestCommandId.UnhideTestAction,
      title: localize2("unhideTest", "Unhide Test"),
      menu: {
        id: MenuId.TestItem,
        order: 21 /* HideTest */,
        when: TestingContextKeys.testItemIsHidden.isEqualTo(true)
      }
    });
  }
  run(accessor, ...elements) {
    const service = accessor.get(ITestService);
    for (const element of elements) {
      if (element instanceof TestItemTreeElement) {
        service.excluded.toggle(element.test, false);
      }
    }
    return Promise.resolve();
  }
}
class UnhideAllTestsAction extends Action2 {
  static {
    __name(this, "UnhideAllTestsAction");
  }
  constructor() {
    super({
      id: TestCommandId.UnhideAllTestsAction,
      title: localize2("unhideAllTests", "Unhide All Tests")
    });
  }
  run(accessor) {
    const service = accessor.get(ITestService);
    service.excluded.clear();
    return Promise.resolve();
  }
}
const testItemInlineAndInContext = /* @__PURE__ */ __name((order, when) => [
  {
    id: MenuId.TestItem,
    group: "inline",
    order,
    when
  },
  {
    id: MenuId.TestItem,
    group: "builtin@1",
    order,
    when
  }
], "testItemInlineAndInContext");
class RunVisibleAction extends ViewAction {
  constructor(bitset, desc) {
    super({
      ...desc,
      viewId: Testing.ExplorerViewId
    });
    this.bitset = bitset;
  }
  static {
    __name(this, "RunVisibleAction");
  }
  /**
   * @override
   */
  runInView(accessor, view, ...elements) {
    const { include, exclude } = view.getTreeIncludeExclude(this.bitset, elements.map((e) => e.test));
    return accessor.get(ITestService).runTests({
      tests: include,
      exclude,
      group: this.bitset
    });
  }
}
class DebugAction extends RunVisibleAction {
  static {
    __name(this, "DebugAction");
  }
  constructor() {
    super(TestRunProfileBitset.Debug, {
      id: TestCommandId.DebugAction,
      title: localize2("debug test", "Debug Test"),
      icon: icons.testingDebugIcon,
      menu: testItemInlineAndInContext(12 /* Debug */, TestingContextKeys.hasDebuggableTests.isEqualTo(true))
    });
  }
}
class CoverageAction extends RunVisibleAction {
  static {
    __name(this, "CoverageAction");
  }
  constructor() {
    super(TestRunProfileBitset.Coverage, {
      id: TestCommandId.RunWithCoverageAction,
      title: localize2("run with cover test", "Run Test with Coverage"),
      icon: icons.testingCoverageIcon,
      menu: testItemInlineAndInContext(13 /* Coverage */, TestingContextKeys.hasCoverableTests.isEqualTo(true))
    });
  }
}
class RunUsingProfileAction extends Action2 {
  static {
    __name(this, "RunUsingProfileAction");
  }
  constructor() {
    super({
      id: TestCommandId.RunUsingProfileAction,
      title: localize2("testing.runUsing", "Execute Using Profile..."),
      icon: icons.testingDebugIcon,
      menu: {
        id: MenuId.TestItem,
        order: 15 /* RunUsing */,
        group: "builtin@2",
        when: TestingContextKeys.hasNonDefaultProfile.isEqualTo(true)
      }
    });
  }
  async run(acessor, ...elements) {
    const commandService = acessor.get(ICommandService);
    const testService = acessor.get(ITestService);
    const profile = await commandService.executeCommand("vscode.pickTestProfile", {
      onlyForTest: elements[0].test
    });
    if (!profile) {
      return;
    }
    testService.runResolvedTests({
      group: profile.group,
      targets: [{
        profileId: profile.profileId,
        controllerId: profile.controllerId,
        testIds: elements.filter((t) => canUseProfileWithTest(profile, t.test)).map((t) => t.test.item.extId)
      }]
    });
  }
}
class RunAction extends RunVisibleAction {
  static {
    __name(this, "RunAction");
  }
  constructor() {
    super(TestRunProfileBitset.Run, {
      id: TestCommandId.RunAction,
      title: localize2("run test", "Run Test"),
      icon: icons.testingRunIcon,
      menu: testItemInlineAndInContext(11 /* Run */, TestingContextKeys.hasRunnableTests.isEqualTo(true))
    });
  }
}
class SelectDefaultTestProfiles extends Action2 {
  static {
    __name(this, "SelectDefaultTestProfiles");
  }
  constructor() {
    super({
      id: TestCommandId.SelectDefaultTestProfiles,
      title: localize2("testing.selectDefaultTestProfiles", "Select Default Profile"),
      icon: icons.testingUpdateProfiles,
      category
    });
  }
  async run(acessor, onlyGroup) {
    const commands = acessor.get(ICommandService);
    const testProfileService = acessor.get(ITestProfileService);
    const profiles = await commands.executeCommand("vscode.pickMultipleTestProfiles", {
      showConfigureButtons: false,
      selected: testProfileService.getGroupDefaultProfiles(onlyGroup),
      onlyGroup
    });
    if (profiles?.length) {
      testProfileService.setGroupDefaultProfiles(onlyGroup, profiles);
    }
  }
}
class ContinuousRunTestAction extends Action2 {
  static {
    __name(this, "ContinuousRunTestAction");
  }
  constructor() {
    super({
      id: TestCommandId.ToggleContinousRunForTest,
      title: localize2("testing.toggleContinuousRunOn", "Turn on Continuous Run"),
      icon: icons.testingTurnContinuousRunOn,
      precondition: ContextKeyExpr.or(
        TestingContextKeys.isContinuousModeOn.isEqualTo(true),
        TestingContextKeys.isParentRunningContinuously.isEqualTo(false)
      ),
      toggled: {
        condition: TestingContextKeys.isContinuousModeOn.isEqualTo(true),
        icon: icons.testingContinuousIsOn,
        title: localize("testing.toggleContinuousRunOff", "Turn off Continuous Run")
      },
      menu: testItemInlineAndInContext(2147483647 /* ContinuousRunTest */, TestingContextKeys.supportsContinuousRun.isEqualTo(true))
    });
  }
  async run(accessor, ...elements) {
    const crService = accessor.get(ITestingContinuousRunService);
    for (const element of elements) {
      const id = element.test.item.extId;
      if (crService.isSpecificallyEnabledFor(id)) {
        crService.stop(id);
        continue;
      }
      crService.start(TestRunProfileBitset.Run, id);
    }
  }
}
class ContinuousRunUsingProfileTestAction extends Action2 {
  static {
    __name(this, "ContinuousRunUsingProfileTestAction");
  }
  constructor() {
    super({
      id: TestCommandId.ContinousRunUsingForTest,
      title: localize2("testing.startContinuousRunUsing", "Start Continous Run Using..."),
      icon: icons.testingDebugIcon,
      menu: [
        {
          id: MenuId.TestItem,
          order: 14 /* RunContinuous */,
          group: "builtin@2",
          when: ContextKeyExpr.and(
            TestingContextKeys.supportsContinuousRun.isEqualTo(true),
            TestingContextKeys.isContinuousModeOn.isEqualTo(false)
          )
        }
      ]
    });
  }
  async run(accessor, ...elements) {
    const crService = accessor.get(ITestingContinuousRunService);
    const profileService = accessor.get(ITestProfileService);
    const notificationService = accessor.get(INotificationService);
    const quickInputService = accessor.get(IQuickInputService);
    for (const element of elements) {
      const selected = await selectContinuousRunProfiles(
        crService,
        notificationService,
        quickInputService,
        [{ profiles: profileService.getControllerProfiles(element.test.controllerId) }]
      );
      if (selected.length) {
        crService.start(selected, element.test.item.extId);
      }
    }
  }
}
class ConfigureTestProfilesAction extends Action2 {
  static {
    __name(this, "ConfigureTestProfilesAction");
  }
  constructor() {
    super({
      id: TestCommandId.ConfigureTestProfilesAction,
      title: localize2("testing.configureProfile", "Configure Test Profiles"),
      icon: icons.testingUpdateProfiles,
      f1: true,
      category,
      menu: {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.hasConfigurableProfile.isEqualTo(true)
      }
    });
  }
  async run(acessor, onlyGroup) {
    const commands = acessor.get(ICommandService);
    const testProfileService = acessor.get(ITestProfileService);
    const profile = await commands.executeCommand("vscode.pickTestProfile", {
      placeholder: localize("configureProfile", "Select a profile to update"),
      showConfigureButtons: false,
      onlyConfigurable: true,
      onlyGroup
    });
    if (profile) {
      testProfileService.configure(profile.controllerId, profile.profileId);
    }
  }
}
const continuousMenus = /* @__PURE__ */ __name((whenIsContinuousOn) => [
  {
    id: MenuId.ViewTitle,
    group: "navigation",
    order: 15 /* RunUsing */,
    when: ContextKeyExpr.and(
      ContextKeyExpr.equals("view", Testing.ExplorerViewId),
      TestingContextKeys.supportsContinuousRun.isEqualTo(true),
      TestingContextKeys.isContinuousModeOn.isEqualTo(whenIsContinuousOn)
    )
  },
  {
    id: MenuId.CommandPalette,
    when: TestingContextKeys.supportsContinuousRun.isEqualTo(true)
  }
], "continuousMenus");
class StopContinuousRunAction extends Action2 {
  static {
    __name(this, "StopContinuousRunAction");
  }
  constructor() {
    super({
      id: TestCommandId.StopContinousRun,
      title: localize2("testing.stopContinuous", "Stop Continuous Run"),
      category,
      icon: icons.testingTurnContinuousRunOff,
      menu: continuousMenus(true)
    });
  }
  run(accessor) {
    accessor.get(ITestingContinuousRunService).stop();
  }
}
function selectContinuousRunProfiles(crs, notificationService, quickInputService, profilesToPickFrom) {
  const items = [];
  for (const { controller, profiles } of profilesToPickFrom) {
    for (const profile of profiles) {
      if (profile.supportsContinuousRun) {
        items.push({
          label: profile.label || controller?.label.get() || "",
          description: controller?.label.get(),
          profile
        });
      }
    }
  }
  if (items.length === 0) {
    notificationService.info(localize("testing.noProfiles", "No test continuous run-enabled profiles were found"));
    return Promise.resolve([]);
  }
  if (items.length === 1) {
    return Promise.resolve([items[0].profile]);
  }
  const qpItems = [];
  const selectedItems = [];
  const lastRun = crs.lastRunProfileIds;
  items.sort((a, b) => a.profile.group - b.profile.group || a.profile.controllerId.localeCompare(b.profile.controllerId) || a.label.localeCompare(b.label));
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i === 0 || items[i - 1].profile.group !== item.profile.group) {
      qpItems.push({ type: "separator", label: testConfigurationGroupNames[item.profile.group] });
    }
    qpItems.push(item);
    if (lastRun.has(item.profile.profileId)) {
      selectedItems.push(item);
    }
  }
  const disposables = new DisposableStore();
  const quickpick = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
  quickpick.title = localize("testing.selectContinuousProfiles", "Select profiles to run when files change:");
  quickpick.canSelectMany = true;
  quickpick.items = qpItems;
  quickpick.selectedItems = selectedItems;
  quickpick.show();
  return new Promise((resolve) => {
    disposables.add(quickpick.onDidAccept(() => {
      resolve(quickpick.selectedItems.map((i) => i.profile));
      disposables.dispose();
    }));
    disposables.add(quickpick.onDidHide(() => {
      resolve([]);
      disposables.dispose();
    }));
  });
}
__name(selectContinuousRunProfiles, "selectContinuousRunProfiles");
class StartContinuousRunAction extends Action2 {
  static {
    __name(this, "StartContinuousRunAction");
  }
  constructor() {
    super({
      id: TestCommandId.StartContinousRun,
      title: localize2("testing.startContinuous", "Start Continuous Run"),
      category,
      icon: icons.testingTurnContinuousRunOn,
      menu: continuousMenus(false)
    });
  }
  async run(accessor) {
    const crs = accessor.get(ITestingContinuousRunService);
    const profileService = accessor.get(ITestProfileService);
    const lastRunProfiles = [...profileService.all()].flatMap((p) => p.profiles.filter((p2) => crs.lastRunProfileIds.has(p2.profileId)));
    if (lastRunProfiles.length) {
      return crs.start(lastRunProfiles);
    }
    const selected = await selectContinuousRunProfiles(crs, accessor.get(INotificationService), accessor.get(IQuickInputService), accessor.get(ITestProfileService).all());
    if (selected.length) {
      crs.start(selected);
    }
  }
}
class ExecuteSelectedAction extends ViewAction {
  constructor(options, group) {
    super({
      ...options,
      menu: [{
        id: MenuId.ViewTitle,
        order: group === TestRunProfileBitset.Run ? 11 /* Run */ : group === TestRunProfileBitset.Debug ? 12 /* Debug */ : 13 /* Coverage */,
        group: "navigation",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("view", Testing.ExplorerViewId),
          TestingContextKeys.isRunning.isEqualTo(false),
          TestingContextKeys.capabilityToContextKey[group].isEqualTo(true)
        )
      }],
      category,
      viewId: Testing.ExplorerViewId
    });
    this.group = group;
  }
  static {
    __name(this, "ExecuteSelectedAction");
  }
  /**
   * @override
   */
  runInView(accessor, view) {
    const { include, exclude } = view.getTreeIncludeExclude(this.group);
    return accessor.get(ITestService).runTests({ tests: include, exclude, group: this.group });
  }
}
class GetSelectedProfiles extends Action2 {
  static {
    __name(this, "GetSelectedProfiles");
  }
  constructor() {
    super({ id: TestCommandId.GetSelectedProfiles, title: localize2("getSelectedProfiles", "Get Selected Profiles") });
  }
  /**
   * @override
   */
  run(accessor) {
    const profiles = accessor.get(ITestProfileService);
    return [
      ...profiles.getGroupDefaultProfiles(TestRunProfileBitset.Run),
      ...profiles.getGroupDefaultProfiles(TestRunProfileBitset.Debug),
      ...profiles.getGroupDefaultProfiles(TestRunProfileBitset.Coverage)
    ].map((p) => ({
      controllerId: p.controllerId,
      label: p.label,
      kind: p.group & TestRunProfileBitset.Coverage ? ExtTestRunProfileKind.Coverage : p.group & TestRunProfileBitset.Debug ? ExtTestRunProfileKind.Debug : ExtTestRunProfileKind.Run
    }));
  }
}
class GetExplorerSelection extends ViewAction {
  static {
    __name(this, "GetExplorerSelection");
  }
  constructor() {
    super({ id: TestCommandId.GetExplorerSelection, title: localize2("getExplorerSelection", "Get Explorer Selection"), viewId: Testing.ExplorerViewId });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    const { include, exclude } = view.getTreeIncludeExclude(TestRunProfileBitset.Run, void 0, "selected");
    const mapper = /* @__PURE__ */ __name((i) => i.item.extId, "mapper");
    return { include: include.map(mapper), exclude: exclude.map(mapper) };
  }
}
class RunSelectedAction extends ExecuteSelectedAction {
  static {
    __name(this, "RunSelectedAction");
  }
  constructor() {
    super({
      id: TestCommandId.RunSelectedAction,
      title: LABEL_RUN_TESTS,
      icon: icons.testingRunAllIcon
    }, TestRunProfileBitset.Run);
  }
}
class DebugSelectedAction extends ExecuteSelectedAction {
  static {
    __name(this, "DebugSelectedAction");
  }
  constructor() {
    super({
      id: TestCommandId.DebugSelectedAction,
      title: LABEL_DEBUG_TESTS,
      icon: icons.testingDebugAllIcon
    }, TestRunProfileBitset.Debug);
  }
}
class CoverageSelectedAction extends ExecuteSelectedAction {
  static {
    __name(this, "CoverageSelectedAction");
  }
  constructor() {
    super({
      id: TestCommandId.CoverageSelectedAction,
      title: LABEL_COVERAGE_TESTS,
      icon: icons.testingCoverageAllIcon
    }, TestRunProfileBitset.Coverage);
  }
}
const showDiscoveringWhile = /* @__PURE__ */ __name((progress, task) => {
  return progress.withProgress(
    {
      location: ProgressLocation.Window,
      title: localize("discoveringTests", "Discovering Tests")
    },
    () => task
  );
}, "showDiscoveringWhile");
class RunOrDebugAllTestsAction extends Action2 {
  constructor(options, group, noTestsFoundError) {
    super({
      ...options,
      category,
      menu: [{
        id: MenuId.CommandPalette,
        when: TestingContextKeys.capabilityToContextKey[group].isEqualTo(true)
      }]
    });
    this.group = group;
    this.noTestsFoundError = noTestsFoundError;
  }
  static {
    __name(this, "RunOrDebugAllTestsAction");
  }
  async run(accessor) {
    const testService = accessor.get(ITestService);
    const notifications = accessor.get(INotificationService);
    const roots = [...testService.collection.rootItems].filter((r) => r.children.size || r.expand === TestItemExpandState.Expandable || r.expand === TestItemExpandState.BusyExpanding);
    if (!roots.length) {
      notifications.info(this.noTestsFoundError);
      return;
    }
    await testService.runTests({ tests: roots, group: this.group });
  }
}
class RunAllAction extends RunOrDebugAllTestsAction {
  static {
    __name(this, "RunAllAction");
  }
  constructor() {
    super(
      {
        id: TestCommandId.RunAllAction,
        title: localize2("runAllTests", "Run All Tests"),
        icon: icons.testingRunAllIcon,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyCode.KeyA)
        }
      },
      TestRunProfileBitset.Run,
      localize("noTestProvider", "No tests found in this workspace. You may need to install a test provider extension")
    );
  }
}
class DebugAllAction extends RunOrDebugAllTestsAction {
  static {
    __name(this, "DebugAllAction");
  }
  constructor() {
    super(
      {
        id: TestCommandId.DebugAllAction,
        title: localize2("debugAllTests", "Debug All Tests"),
        icon: icons.testingDebugIcon,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyCode.KeyA)
        }
      },
      TestRunProfileBitset.Debug,
      localize("noDebugTestProvider", "No debuggable tests found in this workspace. You may need to install a test provider extension")
    );
  }
}
class CoverageAllAction extends RunOrDebugAllTestsAction {
  static {
    __name(this, "CoverageAllAction");
  }
  constructor() {
    super(
      {
        id: TestCommandId.RunAllWithCoverageAction,
        title: localize2("runAllWithCoverage", "Run All Tests with Coverage"),
        icon: icons.testingCoverageIcon,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyA)
        }
      },
      TestRunProfileBitset.Coverage,
      localize("noCoverageTestProvider", "No tests with coverage runners found in this workspace. You may need to install a test provider extension")
    );
  }
}
class CancelTestRunAction extends Action2 {
  static {
    __name(this, "CancelTestRunAction");
  }
  constructor() {
    super({
      id: TestCommandId.CancelTestRunAction,
      title: localize2("testing.cancelRun", "Cancel Test Run"),
      icon: icons.testingCancelIcon,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyCode.KeyX)
      },
      menu: [{
        id: MenuId.ViewTitle,
        order: 11 /* Run */,
        group: "navigation",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("view", Testing.ExplorerViewId),
          ContextKeyExpr.equals(TestingContextKeys.isRunning.serialize(), true)
        )
      }]
    });
  }
  /**
   * @override
   */
  async run(accessor, resultId, taskId) {
    const resultService = accessor.get(ITestResultService);
    const testService = accessor.get(ITestService);
    if (resultId) {
      testService.cancelTestRun(resultId, taskId);
    } else {
      for (const run of resultService.results) {
        if (!run.completedAt) {
          testService.cancelTestRun(run.id);
        }
      }
    }
  }
}
class TestingViewAsListAction extends ViewAction {
  static {
    __name(this, "TestingViewAsListAction");
  }
  constructor() {
    super({
      id: TestCommandId.TestingViewAsListAction,
      viewId: Testing.ExplorerViewId,
      title: localize2("testing.viewAsList", "View as List"),
      toggled: TestingContextKeys.viewMode.isEqualTo(TestExplorerViewMode.List),
      menu: {
        id: MenuId.ViewTitle,
        order: 18 /* DisplayMode */,
        group: "viewAs",
        when: ContextKeyExpr.equals("view", Testing.ExplorerViewId)
      }
    });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    view.viewModel.viewMode = TestExplorerViewMode.List;
  }
}
class TestingViewAsTreeAction extends ViewAction {
  static {
    __name(this, "TestingViewAsTreeAction");
  }
  constructor() {
    super({
      id: TestCommandId.TestingViewAsTreeAction,
      viewId: Testing.ExplorerViewId,
      title: localize2("testing.viewAsTree", "View as Tree"),
      toggled: TestingContextKeys.viewMode.isEqualTo(TestExplorerViewMode.Tree),
      menu: {
        id: MenuId.ViewTitle,
        order: 18 /* DisplayMode */,
        group: "viewAs",
        when: ContextKeyExpr.equals("view", Testing.ExplorerViewId)
      }
    });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    view.viewModel.viewMode = TestExplorerViewMode.Tree;
  }
}
class TestingSortByStatusAction extends ViewAction {
  static {
    __name(this, "TestingSortByStatusAction");
  }
  constructor() {
    super({
      id: TestCommandId.TestingSortByStatusAction,
      viewId: Testing.ExplorerViewId,
      title: localize2("testing.sortByStatus", "Sort by Status"),
      toggled: TestingContextKeys.viewSorting.isEqualTo(TestExplorerViewSorting.ByStatus),
      menu: {
        id: MenuId.ViewTitle,
        order: 19 /* Sort */,
        group: "sortBy",
        when: ContextKeyExpr.equals("view", Testing.ExplorerViewId)
      }
    });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    view.viewModel.viewSorting = TestExplorerViewSorting.ByStatus;
  }
}
class TestingSortByLocationAction extends ViewAction {
  static {
    __name(this, "TestingSortByLocationAction");
  }
  constructor() {
    super({
      id: TestCommandId.TestingSortByLocationAction,
      viewId: Testing.ExplorerViewId,
      title: localize2("testing.sortByLocation", "Sort by Location"),
      toggled: TestingContextKeys.viewSorting.isEqualTo(TestExplorerViewSorting.ByLocation),
      menu: {
        id: MenuId.ViewTitle,
        order: 19 /* Sort */,
        group: "sortBy",
        when: ContextKeyExpr.equals("view", Testing.ExplorerViewId)
      }
    });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    view.viewModel.viewSorting = TestExplorerViewSorting.ByLocation;
  }
}
class TestingSortByDurationAction extends ViewAction {
  static {
    __name(this, "TestingSortByDurationAction");
  }
  constructor() {
    super({
      id: TestCommandId.TestingSortByDurationAction,
      viewId: Testing.ExplorerViewId,
      title: localize2("testing.sortByDuration", "Sort by Duration"),
      toggled: TestingContextKeys.viewSorting.isEqualTo(TestExplorerViewSorting.ByDuration),
      menu: {
        id: MenuId.ViewTitle,
        order: 19 /* Sort */,
        group: "sortBy",
        when: ContextKeyExpr.equals("view", Testing.ExplorerViewId)
      }
    });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    view.viewModel.viewSorting = TestExplorerViewSorting.ByDuration;
  }
}
class ShowMostRecentOutputAction extends Action2 {
  static {
    __name(this, "ShowMostRecentOutputAction");
  }
  constructor() {
    super({
      id: TestCommandId.ShowMostRecentOutputAction,
      title: localize2("testing.showMostRecentOutput", "Show Output"),
      category,
      icon: Codicon.terminal,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyCode.KeyO)
      },
      precondition: TestingContextKeys.hasAnyResults.isEqualTo(true),
      menu: [{
        id: MenuId.ViewTitle,
        order: 16 /* Collapse */,
        group: "navigation",
        when: ContextKeyExpr.equals("view", Testing.ExplorerViewId)
      }, {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.hasAnyResults.isEqualTo(true)
      }]
    });
  }
  async run(accessor) {
    const viewService = accessor.get(IViewsService);
    const testView = await viewService.openView(Testing.ResultsViewId, true);
    testView?.showLatestRun();
  }
}
class CollapseAllAction extends ViewAction {
  static {
    __name(this, "CollapseAllAction");
  }
  constructor() {
    super({
      id: TestCommandId.CollapseAllAction,
      viewId: Testing.ExplorerViewId,
      title: localize2("testing.collapseAll", "Collapse All Tests"),
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.ViewTitle,
        order: 16 /* Collapse */,
        group: "displayAction",
        when: ContextKeyExpr.equals("view", Testing.ExplorerViewId)
      }
    });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    view.viewModel.collapseAll();
  }
}
class ClearTestResultsAction extends Action2 {
  static {
    __name(this, "ClearTestResultsAction");
  }
  constructor() {
    super({
      id: TestCommandId.ClearTestResultsAction,
      title: localize2("testing.clearResults", "Clear All Results"),
      category,
      icon: Codicon.clearAll,
      menu: [{
        id: MenuId.TestPeekTitle
      }, {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.hasAnyResults.isEqualTo(true)
      }, {
        id: MenuId.ViewTitle,
        order: 17 /* ClearResults */,
        group: "displayAction",
        when: ContextKeyExpr.equals("view", Testing.ExplorerViewId)
      }, {
        id: MenuId.ViewTitle,
        order: 17 /* ClearResults */,
        group: "navigation",
        when: ContextKeyExpr.equals("view", Testing.ResultsViewId)
      }]
    });
  }
  /**
   * @override
   */
  run(accessor) {
    accessor.get(ITestResultService).clear();
  }
}
class GoToTest extends Action2 {
  static {
    __name(this, "GoToTest");
  }
  constructor() {
    super({
      id: TestCommandId.GoToTest,
      title: localize2("testing.editFocusedTest", "Go to Test"),
      icon: Codicon.goToFile,
      menu: {
        id: MenuId.TestItem,
        group: "builtin@1",
        order: 20 /* GoToTest */,
        when: TestingContextKeys.testItemHasUri.isEqualTo(true)
      },
      keybinding: {
        weight: KeybindingWeight.EditorContrib - 10,
        when: FocusedViewContext.isEqualTo(Testing.ExplorerViewId),
        primary: KeyCode.Enter | KeyMod.Alt
      }
    });
  }
  async run(accessor, element, preserveFocus) {
    if (!element) {
      const view = accessor.get(IViewsService).getActiveViewWithId(Testing.ExplorerViewId);
      element = view?.focusedTreeElements[0];
    }
    if (element && element instanceof TestItemTreeElement) {
      accessor.get(ICommandService).executeCommand("vscode.revealTest", element.test.item.extId, preserveFocus);
    }
  }
}
async function getTestsAtCursor(testService, uriIdentityService, uri, position, filter) {
  let bestNodes = [];
  let bestRange;
  let bestNodesBefore = [];
  let bestRangeBefore;
  for await (const test of testsInFile(testService, uriIdentityService, uri)) {
    if (!test.item.range || filter?.(test) === false) {
      continue;
    }
    const irange = Range.lift(test.item.range);
    if (irange.containsPosition(position)) {
      if (bestRange && Range.equalsRange(test.item.range, bestRange)) {
        if (!bestNodes.some((b) => TestId.isChild(b.item.extId, test.item.extId))) {
          bestNodes.push(test);
        }
      } else {
        bestRange = irange;
        bestNodes = [test];
      }
    } else if (Position.isBefore(irange.getStartPosition(), position)) {
      if (!bestRangeBefore || bestRangeBefore.getStartPosition().isBefore(irange.getStartPosition())) {
        bestRangeBefore = irange;
        bestNodesBefore = [test];
      } else if (irange.equalsRange(bestRangeBefore) && !bestNodesBefore.some((b) => TestId.isChild(b.item.extId, test.item.extId))) {
        bestNodesBefore.push(test);
      }
    }
  }
  return bestNodes.length ? bestNodes : bestNodesBefore;
}
__name(getTestsAtCursor, "getTestsAtCursor");
var EditorContextOrder = /* @__PURE__ */ ((EditorContextOrder2) => {
  EditorContextOrder2[EditorContextOrder2["RunAtCursor"] = 0] = "RunAtCursor";
  EditorContextOrder2[EditorContextOrder2["DebugAtCursor"] = 1] = "DebugAtCursor";
  EditorContextOrder2[EditorContextOrder2["RunInFile"] = 2] = "RunInFile";
  EditorContextOrder2[EditorContextOrder2["DebugInFile"] = 3] = "DebugInFile";
  EditorContextOrder2[EditorContextOrder2["GoToRelated"] = 4] = "GoToRelated";
  EditorContextOrder2[EditorContextOrder2["PeekRelated"] = 5] = "PeekRelated";
  return EditorContextOrder2;
})(EditorContextOrder || {});
class ExecuteTestAtCursor extends Action2 {
  constructor(options, group) {
    super({
      ...options,
      menu: [{
        id: MenuId.CommandPalette,
        when: hasAnyTestProvider
      }, {
        id: MenuId.EditorContext,
        group: "testing",
        order: group === TestRunProfileBitset.Run ? 0 /* RunAtCursor */ : 1 /* DebugAtCursor */,
        when: ContextKeyExpr.and(TestingContextKeys.activeEditorHasTests, TestingContextKeys.capabilityToContextKey[group])
      }]
    });
    this.group = group;
  }
  static {
    __name(this, "ExecuteTestAtCursor");
  }
  /**
   * @override
   */
  async run(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    let editor = codeEditorService.getActiveCodeEditor();
    if (!activeEditorPane || !editor) {
      return;
    }
    if (editor instanceof EmbeddedCodeEditorWidget) {
      editor = editor.getParentEditor();
    }
    const position = editor?.getPosition();
    const model = editor?.getModel();
    if (!position || !model || !("uri" in model)) {
      return;
    }
    const testService = accessor.get(ITestService);
    const profileService = accessor.get(ITestProfileService);
    const uriIdentityService = accessor.get(IUriIdentityService);
    const progressService = accessor.get(IProgressService);
    const configurationService = accessor.get(IConfigurationService);
    const saveBeforeTest = getTestingConfiguration(configurationService, TestingConfigKeys.SaveBeforeTest);
    if (saveBeforeTest) {
      await editorService.save({ editor: activeEditorPane.input, groupId: activeEditorPane.group.id });
      await testService.syncTests();
    }
    const testsToRun = await showDiscoveringWhile(
      progressService,
      getTestsAtCursor(
        testService,
        uriIdentityService,
        model.uri,
        position,
        (test) => !!(profileService.capabilitiesForTest(test.item) & this.group)
      )
    );
    if (testsToRun.length) {
      await testService.runTests({ group: this.group, tests: testsToRun });
      return;
    }
    const relatedTests = await testService.getTestsRelatedToCode(model.uri, position);
    if (relatedTests.length) {
      await testService.runTests({ group: this.group, tests: relatedTests });
      return;
    }
    if (editor) {
      MessageController.get(editor)?.showMessage(localize("noTestsAtCursor", "No tests found here"), position);
    }
  }
}
class RunAtCursor extends ExecuteTestAtCursor {
  static {
    __name(this, "RunAtCursor");
  }
  constructor() {
    super({
      id: TestCommandId.RunAtCursor,
      title: localize2("testing.runAtCursor", "Run Test at Cursor"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyCode.KeyC)
      }
    }, TestRunProfileBitset.Run);
  }
}
class DebugAtCursor extends ExecuteTestAtCursor {
  static {
    __name(this, "DebugAtCursor");
  }
  constructor() {
    super({
      id: TestCommandId.DebugAtCursor,
      title: localize2("testing.debugAtCursor", "Debug Test at Cursor"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyCode.KeyC)
      }
    }, TestRunProfileBitset.Debug);
  }
}
class CoverageAtCursor extends ExecuteTestAtCursor {
  static {
    __name(this, "CoverageAtCursor");
  }
  constructor() {
    super({
      id: TestCommandId.CoverageAtCursor,
      title: localize2("testing.coverageAtCursor", "Run Test at Cursor with Coverage"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyC)
      }
    }, TestRunProfileBitset.Coverage);
  }
}
class ExecuteTestsUnderUriAction extends Action2 {
  constructor(options, group) {
    super({
      ...options,
      menu: [{
        id: MenuId.ExplorerContext,
        when: TestingContextKeys.capabilityToContextKey[group].isEqualTo(true),
        group: "6.5_testing",
        order: (group === TestRunProfileBitset.Run ? 11 /* Run */ : 12 /* Debug */) + 0.1
      }]
    });
    this.group = group;
  }
  static {
    __name(this, "ExecuteTestsUnderUriAction");
  }
  async run(accessor, uri) {
    const testService = accessor.get(ITestService);
    const notificationService = accessor.get(INotificationService);
    const tests = await Iterable.asyncToArray(testsUnderUri(
      testService,
      accessor.get(IUriIdentityService),
      uri
    ));
    if (!tests.length) {
      notificationService.notify({ message: localize("noTests", "No tests found in the selected file or folder"), severity: Severity.Info });
      return;
    }
    return testService.runTests({ tests, group: this.group });
  }
}
class RunTestsUnderUri extends ExecuteTestsUnderUriAction {
  static {
    __name(this, "RunTestsUnderUri");
  }
  constructor() {
    super({
      id: TestCommandId.RunByUri,
      title: LABEL_RUN_TESTS,
      category
    }, TestRunProfileBitset.Run);
  }
}
class DebugTestsUnderUri extends ExecuteTestsUnderUriAction {
  static {
    __name(this, "DebugTestsUnderUri");
  }
  constructor() {
    super({
      id: TestCommandId.DebugByUri,
      title: LABEL_DEBUG_TESTS,
      category
    }, TestRunProfileBitset.Debug);
  }
}
class CoverageTestsUnderUri extends ExecuteTestsUnderUriAction {
  static {
    __name(this, "CoverageTestsUnderUri");
  }
  constructor() {
    super({
      id: TestCommandId.CoverageByUri,
      title: LABEL_COVERAGE_TESTS,
      category
    }, TestRunProfileBitset.Coverage);
  }
}
class ExecuteTestsInCurrentFile extends Action2 {
  constructor(options, group) {
    super({
      ...options,
      menu: [{
        id: MenuId.CommandPalette,
        when: TestingContextKeys.capabilityToContextKey[group].isEqualTo(true)
      }, {
        id: MenuId.EditorContext,
        group: "testing",
        order: group === TestRunProfileBitset.Run ? 2 /* RunInFile */ : 3 /* DebugInFile */,
        when: ContextKeyExpr.and(TestingContextKeys.activeEditorHasTests, TestingContextKeys.capabilityToContextKey[group])
      }]
    });
    this.group = group;
  }
  static {
    __name(this, "ExecuteTestsInCurrentFile");
  }
  /**
   * @override
   */
  run(accessor) {
    let editor = accessor.get(ICodeEditorService).getActiveCodeEditor();
    if (!editor) {
      return;
    }
    if (editor instanceof EmbeddedCodeEditorWidget) {
      editor = editor.getParentEditor();
    }
    const position = editor?.getPosition();
    const model = editor?.getModel();
    if (!position || !model || !("uri" in model)) {
      return;
    }
    const testService = accessor.get(ITestService);
    const demandedUri = model.uri.toString();
    const queue = [testService.collection.rootIds];
    const discovered = [];
    while (queue.length) {
      for (const id of queue.pop()) {
        const node = testService.collection.getNodeById(id);
        if (node.item.uri?.toString() === demandedUri) {
          discovered.push(node);
        } else {
          queue.push(node.children);
        }
      }
    }
    if (discovered.length) {
      return testService.runTests({
        tests: discovered,
        group: this.group
      });
    }
    if (editor) {
      MessageController.get(editor)?.showMessage(localize("noTestsInFile", "No tests found in this file"), position);
    }
    return void 0;
  }
}
class RunCurrentFile extends ExecuteTestsInCurrentFile {
  static {
    __name(this, "RunCurrentFile");
  }
  constructor() {
    super({
      id: TestCommandId.RunCurrentFile,
      title: localize2("testing.runCurrentFile", "Run Tests in Current File"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyCode.KeyF)
      }
    }, TestRunProfileBitset.Run);
  }
}
class DebugCurrentFile extends ExecuteTestsInCurrentFile {
  static {
    __name(this, "DebugCurrentFile");
  }
  constructor() {
    super({
      id: TestCommandId.DebugCurrentFile,
      title: localize2("testing.debugCurrentFile", "Debug Tests in Current File"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyCode.KeyF)
      }
    }, TestRunProfileBitset.Debug);
  }
}
class CoverageCurrentFile extends ExecuteTestsInCurrentFile {
  static {
    __name(this, "CoverageCurrentFile");
  }
  constructor() {
    super({
      id: TestCommandId.CoverageCurrentFile,
      title: localize2("testing.coverageCurrentFile", "Run Tests with Coverage in Current File"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyF)
      }
    }, TestRunProfileBitset.Coverage);
  }
}
const discoverAndRunTests = /* @__PURE__ */ __name(async (collection, progress, ids, runTests) => {
  const todo = Promise.all(ids.map((p) => expandAndGetTestById(collection, p)));
  const tests = (await showDiscoveringWhile(progress, todo)).filter(isDefined);
  return tests.length ? await runTests(tests) : void 0;
}, "discoverAndRunTests");
class RunOrDebugExtsByPath extends Action2 {
  static {
    __name(this, "RunOrDebugExtsByPath");
  }
  /**
   * @override
   */
  async run(accessor, ...args) {
    const testService = accessor.get(ITestService);
    await discoverAndRunTests(
      accessor.get(ITestService).collection,
      accessor.get(IProgressService),
      [...this.getTestExtIdsToRun(accessor, ...args)],
      (tests) => this.runTest(testService, tests)
    );
  }
}
class RunOrDebugFailedTests extends RunOrDebugExtsByPath {
  static {
    __name(this, "RunOrDebugFailedTests");
  }
  constructor(options) {
    super({
      ...options,
      menu: {
        id: MenuId.CommandPalette,
        when: hasAnyTestProvider
      }
    });
  }
  /**
   * @inheritdoc
   */
  getTestExtIdsToRun(accessor) {
    const { results } = accessor.get(ITestResultService);
    const ids = /* @__PURE__ */ new Set();
    for (let i = results.length - 1; i >= 0; i--) {
      const resultSet = results[i];
      for (const test of resultSet.tests) {
        if (isFailedState(test.ownComputedState)) {
          ids.add(test.item.extId);
        } else {
          ids.delete(test.item.extId);
        }
      }
    }
    return ids;
  }
}
class RunOrDebugLastRun extends Action2 {
  static {
    __name(this, "RunOrDebugLastRun");
  }
  constructor(options) {
    super({
      ...options,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(
          hasAnyTestProvider,
          TestingContextKeys.hasAnyResults.isEqualTo(true)
        )
      }
    });
  }
  getLastTestRunRequest(accessor, runId) {
    const resultService = accessor.get(ITestResultService);
    const lastResult = runId ? resultService.results.find((r) => r.id === runId) : resultService.results[0];
    return lastResult?.request;
  }
  /** @inheritdoc */
  async run(accessor, runId) {
    const resultService = accessor.get(ITestResultService);
    const lastResult = runId ? resultService.results.find((r) => r.id === runId) : resultService.results[0];
    if (!lastResult) {
      return;
    }
    const req = lastResult.request;
    const testService = accessor.get(ITestService);
    const profileService = accessor.get(ITestProfileService);
    const profileExists = /* @__PURE__ */ __name((t) => profileService.getControllerProfiles(t.controllerId).some((p) => p.profileId === t.profileId), "profileExists");
    await discoverAndRunTests(
      testService.collection,
      accessor.get(IProgressService),
      req.targets.flatMap((t) => t.testIds),
      (tests) => {
        if (this.getGroup() & req.group && req.targets.every(profileExists)) {
          return testService.runResolvedTests({
            targets: req.targets,
            group: req.group,
            exclude: req.exclude
          });
        } else {
          return testService.runTests({ tests, group: this.getGroup() });
        }
      }
    );
  }
}
class ReRunFailedTests extends RunOrDebugFailedTests {
  static {
    __name(this, "ReRunFailedTests");
  }
  constructor() {
    super({
      id: TestCommandId.ReRunFailedTests,
      title: localize2("testing.reRunFailTests", "Rerun Failed Tests"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyCode.KeyE)
      }
    });
  }
  runTest(service, internalTests) {
    return service.runTests({
      group: TestRunProfileBitset.Run,
      tests: internalTests
    });
  }
}
class DebugFailedTests extends RunOrDebugFailedTests {
  static {
    __name(this, "DebugFailedTests");
  }
  constructor() {
    super({
      id: TestCommandId.DebugFailedTests,
      title: localize2("testing.debugFailTests", "Debug Failed Tests"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyCode.KeyE)
      }
    });
  }
  runTest(service, internalTests) {
    return service.runTests({
      group: TestRunProfileBitset.Debug,
      tests: internalTests
    });
  }
}
class ReRunLastRun extends RunOrDebugLastRun {
  static {
    __name(this, "ReRunLastRun");
  }
  constructor() {
    super({
      id: TestCommandId.ReRunLastRun,
      title: localize2("testing.reRunLastRun", "Rerun Last Run"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyCode.KeyL)
      }
    });
  }
  getGroup() {
    return TestRunProfileBitset.Run;
  }
}
class DebugLastRun extends RunOrDebugLastRun {
  static {
    __name(this, "DebugLastRun");
  }
  constructor() {
    super({
      id: TestCommandId.DebugLastRun,
      title: localize2("testing.debugLastRun", "Debug Last Run"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyCode.KeyL)
      }
    });
  }
  getGroup() {
    return TestRunProfileBitset.Debug;
  }
}
class CoverageLastRun extends RunOrDebugLastRun {
  static {
    __name(this, "CoverageLastRun");
  }
  constructor() {
    super({
      id: TestCommandId.CoverageLastRun,
      title: localize2("testing.coverageLastRun", "Rerun Last Run with Coverage"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyL)
      }
    });
  }
  getGroup() {
    return TestRunProfileBitset.Coverage;
  }
}
class SearchForTestExtension extends Action2 {
  static {
    __name(this, "SearchForTestExtension");
  }
  constructor() {
    super({
      id: TestCommandId.SearchForTestExtension,
      title: localize2("testing.searchForTestExtension", "Search for Test Extension")
    });
  }
  async run(accessor) {
    accessor.get(IExtensionsWorkbenchService).openSearch('@category:"testing"');
  }
}
class OpenOutputPeek extends Action2 {
  static {
    __name(this, "OpenOutputPeek");
  }
  constructor() {
    super({
      id: TestCommandId.OpenOutputPeek,
      title: localize2("testing.openOutputPeek", "Peek Output"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyCode.KeyM)
      },
      menu: {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.hasAnyResults.isEqualTo(true)
      }
    });
  }
  async run(accessor) {
    accessor.get(ITestingPeekOpener).open();
  }
}
class ToggleInlineTestOutput extends Action2 {
  static {
    __name(this, "ToggleInlineTestOutput");
  }
  constructor() {
    super({
      id: TestCommandId.ToggleInlineTestOutput,
      title: localize2("testing.toggleInlineTestOutput", "Toggle Inline Test Output"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyCode.KeyI)
      },
      menu: {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.hasAnyResults.isEqualTo(true)
      }
    });
  }
  async run(accessor) {
    const testService = accessor.get(ITestService);
    testService.showInlineOutput.value = !testService.showInlineOutput.value;
  }
}
const refreshMenus = /* @__PURE__ */ __name((whenIsRefreshing) => [
  {
    id: MenuId.TestItem,
    group: "inline",
    order: 10 /* Refresh */,
    when: ContextKeyExpr.and(
      TestingContextKeys.canRefreshTests.isEqualTo(true),
      TestingContextKeys.isRefreshingTests.isEqualTo(whenIsRefreshing)
    )
  },
  {
    id: MenuId.ViewTitle,
    group: "navigation",
    order: 10 /* Refresh */,
    when: ContextKeyExpr.and(
      ContextKeyExpr.equals("view", Testing.ExplorerViewId),
      TestingContextKeys.canRefreshTests.isEqualTo(true),
      TestingContextKeys.isRefreshingTests.isEqualTo(whenIsRefreshing)
    )
  },
  {
    id: MenuId.CommandPalette,
    when: TestingContextKeys.canRefreshTests.isEqualTo(true)
  }
], "refreshMenus");
class RefreshTestsAction extends Action2 {
  static {
    __name(this, "RefreshTestsAction");
  }
  constructor() {
    super({
      id: TestCommandId.RefreshTestsAction,
      title: localize2("testing.refreshTests", "Refresh Tests"),
      category,
      icon: icons.testingRefreshTests,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.Semicolon, KeyMod.CtrlCmd | KeyCode.KeyR),
        when: TestingContextKeys.canRefreshTests.isEqualTo(true)
      },
      menu: refreshMenus(false)
    });
  }
  async run(accessor, ...elements) {
    const testService = accessor.get(ITestService);
    const progressService = accessor.get(IProgressService);
    const controllerIds = distinct(elements.filter(isDefined).map((e) => e.test.controllerId));
    return progressService.withProgress({ location: Testing.ViewletId }, async () => {
      if (controllerIds.length) {
        await Promise.all(controllerIds.map((id) => testService.refreshTests(id)));
      } else {
        await testService.refreshTests();
      }
    });
  }
}
class CancelTestRefreshAction extends Action2 {
  static {
    __name(this, "CancelTestRefreshAction");
  }
  constructor() {
    super({
      id: TestCommandId.CancelTestRefreshAction,
      title: localize2("testing.cancelTestRefresh", "Cancel Test Refresh"),
      category,
      icon: icons.testingCancelRefreshTests,
      menu: refreshMenus(true)
    });
  }
  async run(accessor) {
    accessor.get(ITestService).cancelRefreshTests();
  }
}
class CleareCoverage extends Action2 {
  static {
    __name(this, "CleareCoverage");
  }
  constructor() {
    super({
      id: TestCommandId.CoverageClear,
      title: localize2("testing.clearCoverage", "Clear Coverage"),
      icon: widgetClose,
      category,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 10 /* Refresh */,
        when: ContextKeyExpr.equals("view", Testing.CoverageViewId)
      }, {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.isTestCoverageOpen.isEqualTo(true)
      }]
    });
  }
  run(accessor) {
    accessor.get(ITestCoverageService).closeCoverage();
  }
}
class OpenCoverage extends Action2 {
  static {
    __name(this, "OpenCoverage");
  }
  constructor() {
    super({
      id: TestCommandId.OpenCoverage,
      title: localize2("testing.openCoverage", "Open Coverage"),
      category,
      menu: [{
        id: MenuId.CommandPalette,
        when: TestingContextKeys.hasAnyResults.isEqualTo(true)
      }]
    });
  }
  run(accessor) {
    const results = accessor.get(ITestResultService).results;
    const task = results.length && results[0].tasks.find((r) => r.coverage);
    if (!task) {
      const notificationService = accessor.get(INotificationService);
      notificationService.info(localize("testing.noCoverage", "No coverage information available on the last test run."));
      return;
    }
    accessor.get(ITestCoverageService).openCoverage(task, true);
  }
}
class TestNavigationAction extends SymbolNavigationAction {
  static {
    __name(this, "TestNavigationAction");
  }
  testService;
  // little hack...
  uriIdentityService;
  runEditorCommand(accessor, editor, ...args) {
    this.testService = accessor.get(ITestService);
    this.uriIdentityService = accessor.get(IUriIdentityService);
    return super.runEditorCommand(accessor, editor, ...args);
  }
  _getAlternativeCommand(editor) {
    return editor.getOption(EditorOption.gotoLocation).alternativeTestsCommand;
  }
  _getGoToPreference(editor) {
    return editor.getOption(EditorOption.gotoLocation).multipleTests || "peek";
  }
}
class GoToRelatedTestAction extends TestNavigationAction {
  static {
    __name(this, "GoToRelatedTestAction");
  }
  async _getLocationModel(_languageFeaturesService, model, position, token) {
    const tests = await this.testService.getTestsRelatedToCode(model.uri, position, token);
    return new ReferencesModel(
      tests.map((t) => t.item.uri && { uri: t.item.uri, range: t.item.range || new Range(1, 1, 1, 1) }).filter(isDefined),
      localize("relatedTests", "Related Tests")
    );
  }
  _getNoResultFoundMessage() {
    return localize("noTestFound", "No related tests found.");
  }
}
class GoToRelatedTest extends GoToRelatedTestAction {
  static {
    __name(this, "GoToRelatedTest");
  }
  constructor() {
    super({
      openToSide: false,
      openInPeek: false,
      muteMessage: false
    }, {
      id: TestCommandId.GoToRelatedTest,
      title: localize2("testing.goToRelatedTest", "Go to Related Test"),
      category,
      precondition: ContextKeyExpr.and(
        // todo@connor4312: make this more explicit based on cursor position
        ContextKeyExpr.not(TestingContextKeys.activeEditorHasTests.key),
        TestingContextKeys.canGoToRelatedTest
      ),
      menu: [{
        id: MenuId.EditorContext,
        group: "testing",
        order: 4 /* GoToRelated */
      }]
    });
  }
}
class PeekRelatedTest extends GoToRelatedTestAction {
  static {
    __name(this, "PeekRelatedTest");
  }
  constructor() {
    super({
      openToSide: false,
      openInPeek: true,
      muteMessage: false
    }, {
      id: TestCommandId.PeekRelatedTest,
      title: localize2("testing.peekToRelatedTest", "Peek Related Test"),
      category,
      precondition: ContextKeyExpr.and(
        TestingContextKeys.canGoToRelatedTest,
        // todo@connor4312: make this more explicit based on cursor position
        ContextKeyExpr.not(TestingContextKeys.activeEditorHasTests.key),
        PeekContext.notInPeekEditor,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      ),
      menu: [{
        id: MenuId.EditorContext,
        group: "testing",
        order: 5 /* PeekRelated */
      }]
    });
  }
}
class GoToRelatedCodeAction extends TestNavigationAction {
  static {
    __name(this, "GoToRelatedCodeAction");
  }
  async _getLocationModel(_languageFeaturesService, model, position, token) {
    const testsAtCursor = await getTestsAtCursor(this.testService, this.uriIdentityService, model.uri, position);
    const code = await Promise.all(testsAtCursor.map((t) => this.testService.getCodeRelatedToTest(t)));
    return new ReferencesModel(code.flat(), localize("relatedCode", "Related Code"));
  }
  _getNoResultFoundMessage() {
    return localize("noRelatedCode", "No related code found.");
  }
}
class GoToRelatedCode extends GoToRelatedCodeAction {
  static {
    __name(this, "GoToRelatedCode");
  }
  constructor() {
    super({
      openToSide: false,
      openInPeek: false,
      muteMessage: false
    }, {
      id: TestCommandId.GoToRelatedCode,
      title: localize2("testing.goToRelatedCode", "Go to Related Code"),
      category,
      precondition: ContextKeyExpr.and(
        TestingContextKeys.activeEditorHasTests,
        TestingContextKeys.canGoToRelatedCode
      ),
      menu: [{
        id: MenuId.EditorContext,
        group: "testing",
        order: 4 /* GoToRelated */
      }]
    });
  }
}
class PeekRelatedCode extends GoToRelatedCodeAction {
  static {
    __name(this, "PeekRelatedCode");
  }
  constructor() {
    super({
      openToSide: false,
      openInPeek: true,
      muteMessage: false
    }, {
      id: TestCommandId.PeekRelatedCode,
      title: localize2("testing.peekToRelatedCode", "Peek Related Code"),
      category,
      precondition: ContextKeyExpr.and(
        TestingContextKeys.activeEditorHasTests,
        TestingContextKeys.canGoToRelatedCode,
        PeekContext.notInPeekEditor,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      ),
      menu: [{
        id: MenuId.EditorContext,
        group: "testing",
        order: 5 /* PeekRelated */
      }]
    });
  }
}
const allTestActions = [
  CancelTestRefreshAction,
  CancelTestRunAction,
  CleareCoverage,
  ClearTestResultsAction,
  CollapseAllAction,
  ConfigureTestProfilesAction,
  ContinuousRunTestAction,
  ContinuousRunUsingProfileTestAction,
  CoverageAction,
  CoverageAllAction,
  CoverageAtCursor,
  CoverageCurrentFile,
  CoverageLastRun,
  CoverageSelectedAction,
  CoverageTestsUnderUri,
  DebugAction,
  DebugAllAction,
  DebugAtCursor,
  DebugCurrentFile,
  DebugFailedTests,
  DebugLastRun,
  DebugSelectedAction,
  DebugTestsUnderUri,
  GetExplorerSelection,
  GetSelectedProfiles,
  GoToRelatedCode,
  GoToRelatedTest,
  GoToTest,
  HideTestAction,
  OpenCoverage,
  OpenOutputPeek,
  PeekRelatedCode,
  PeekRelatedTest,
  RefreshTestsAction,
  ReRunFailedTests,
  ReRunLastRun,
  RunAction,
  RunAllAction,
  RunAtCursor,
  RunCurrentFile,
  RunSelectedAction,
  RunTestsUnderUri,
  RunUsingProfileAction,
  SearchForTestExtension,
  SelectDefaultTestProfiles,
  ShowMostRecentOutputAction,
  StartContinuousRunAction,
  StopContinuousRunAction,
  TestingSortByDurationAction,
  TestingSortByLocationAction,
  TestingSortByStatusAction,
  TestingViewAsListAction,
  TestingViewAsTreeAction,
  ToggleInlineTestOutput,
  UnhideAllTestsAction,
  UnhideTestAction
];
export {
  CancelTestRefreshAction,
  CancelTestRunAction,
  ClearTestResultsAction,
  CleareCoverage,
  CollapseAllAction,
  ConfigureTestProfilesAction,
  ContinuousRunTestAction,
  ContinuousRunUsingProfileTestAction,
  CoverageAction,
  CoverageAllAction,
  CoverageAtCursor,
  CoverageCurrentFile,
  CoverageLastRun,
  CoverageSelectedAction,
  DebugAction,
  DebugAllAction,
  DebugAtCursor,
  DebugCurrentFile,
  DebugFailedTests,
  DebugLastRun,
  DebugSelectedAction,
  GetExplorerSelection,
  GetSelectedProfiles,
  GoToTest,
  HideTestAction,
  OpenCoverage,
  OpenOutputPeek,
  ReRunFailedTests,
  ReRunLastRun,
  RefreshTestsAction,
  RunAction,
  RunAllAction,
  RunAtCursor,
  RunCurrentFile,
  RunSelectedAction,
  RunUsingProfileAction,
  SearchForTestExtension,
  SelectDefaultTestProfiles,
  ShowMostRecentOutputAction,
  TestingSortByDurationAction,
  TestingSortByLocationAction,
  TestingSortByStatusAction,
  TestingViewAsListAction,
  TestingViewAsTreeAction,
  ToggleInlineTestOutput,
  UnhideAllTestsAction,
  UnhideTestAction,
  allTestActions,
  discoverAndRunTests
};
//# sourceMappingURL=testExplorerActions.js.map
