var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../base/browser/dom.js";
import { ActionBar } from "../../../../../base/browser/ui/actionbar/actionbar.js";
import { renderLabelWithIcons } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Action, Separator } from "../../../../../base/common/actions.js";
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../base/common/observable.js";
import { count } from "../../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { isDefined } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { MenuEntryActionViewItem, fillInActionBarActions } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId, MenuItemAction } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { WorkbenchCompressibleObjectTree } from "../../../../../platform/list/browser/listService.js";
import { IProgressService } from "../../../../../platform/progress/common/progress.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { widgetClose } from "../../../../../platform/theme/common/iconRegistry.js";
import { getTestItemContextOverlay } from "../explorerProjections/testItemContextOverlay.js";
import * as icons from "../icons.js";
import { renderTestMessageAsText } from "../testMessageColorizer.js";
import { MessageSubject, TaskSubject, TestOutputSubject, getMessageArgs, mapFindTestMessage } from "./testResultsSubject.js";
import { ITestCoverageService } from "../../common/testCoverageService.js";
import { ITestExplorerFilterState } from "../../common/testExplorerFilterState.js";
import { ITestProfileService } from "../../common/testProfileService.js";
import { LiveTestResult, maxCountPriority } from "../../common/testResult.js";
import { ITestResultService } from "../../common/testResultService.js";
import { InternalTestItem, testResultStateToContextValues } from "../../common/testTypes.js";
import { TestingContextKeys } from "../../common/testingContextKeys.js";
import { cmpPriority } from "../../common/testingStates.js";
import { buildTestUri } from "../../common/testingUri.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { TestId } from "../../common/testId.js";
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
var TestRunElementRenderer_1;
class TestResultElement {
  static {
    __name(this, "TestResultElement");
  }
  get icon() {
    return icons.testingStatesToIcons.get(this.value.completedAt === void 0 ? 2 : maxCountPriority(this.value.counts));
  }
  constructor(value) {
    this.value = value;
    this.changeEmitter = new Emitter();
    this.onDidChange = this.changeEmitter.event;
    this.type = "result";
    this.id = value.id;
    this.context = value.id;
    this.label = value.name;
  }
}
const openCoverageLabel = localize("openTestCoverage", "View Test Coverage");
const closeCoverageLabel = localize("closeTestCoverage", "Close Test Coverage");
class CoverageElement {
  static {
    __name(this, "CoverageElement");
  }
  get label() {
    return this.isOpen ? closeCoverageLabel : openCoverageLabel;
  }
  get icon() {
    return this.isOpen ? widgetClose : icons.testingCoverageReport;
  }
  get isOpen() {
    return this.coverageService.selected.get()?.fromTaskId === this.task.id;
  }
  constructor(results, task, coverageService) {
    this.task = task;
    this.coverageService = coverageService;
    this.type = "coverage";
    this.id = `coverage-${results.id}/${task.id}`;
    this.onDidChange = Event.fromObservableLight(coverageService.selected);
  }
}
class OlderResultsElement {
  static {
    __name(this, "OlderResultsElement");
  }
  constructor(n) {
    this.n = n;
    this.type = "older";
    this.onDidChange = Event.None;
    this.label = n === 1 ? localize("oneOlderResult", "1 older result") : localize("nOlderResults", "{0} older results", n);
    this.id = `older-${this.n}`;
  }
}
class TestCaseElement {
  static {
    __name(this, "TestCaseElement");
  }
  get onDidChange() {
    if (!(this.results instanceof LiveTestResult)) {
      return Event.None;
    }
    return Event.filter(this.results.onChange, (e) => e.item.item.extId === this.test.item.extId);
  }
  get state() {
    return this.test.tasks[this.taskIndex].state;
  }
  get label() {
    return this.test.item.label;
  }
  get labelWithIcons() {
    return renderLabelWithIcons(this.label);
  }
  get icon() {
    return icons.testingStatesToIcons.get(this.state);
  }
  get outputSubject() {
    return new TestOutputSubject(this.results, this.taskIndex, this.test);
  }
  constructor(results, test, taskIndex) {
    this.results = results;
    this.test = test;
    this.taskIndex = taskIndex;
    this.type = "test";
    this.id = `${results.id}/${test.item.extId}`;
    const parentId = TestId.fromString(test.item.extId).parentId;
    if (parentId) {
      this.description = "";
      for (const part of parentId.idsToRoot()) {
        if (part.isRoot) {
          break;
        }
        const test2 = results.getStateById(part.toString());
        if (!test2) {
          break;
        }
        if (this.description.length) {
          this.description += " \u2039 ";
        }
        this.description += test2.item.label;
      }
    }
    this.context = {
      $mid: 16,
      tests: [InternalTestItem.serialize(test)]
    };
  }
}
class TaskElement {
  static {
    __name(this, "TaskElement");
  }
  get icon() {
    return this.results.tasks[this.index].running ? icons.testingStatesToIcons.get(
      2
      /* TestResultState.Running */
    ) : void 0;
  }
  constructor(results, task, index) {
    this.results = results;
    this.task = task;
    this.index = index;
    this.changeEmitter = new Emitter();
    this.onDidChange = this.changeEmitter.event;
    this.type = "task";
    this.itemsCache = new CreationCache();
    this.id = `${results.id}/${index}`;
    this.task = results.tasks[index];
    this.context = { resultId: results.id, taskId: this.task.id };
    this.label = this.task.name;
  }
}
class TestMessageElement {
  static {
    __name(this, "TestMessageElement");
  }
  get onDidChange() {
    if (!(this.result instanceof LiveTestResult)) {
      return Event.None;
    }
    return Event.filter(this.result.onChange, (e) => e.item.item.extId === this.test.item.extId);
  }
  get context() {
    return getMessageArgs(this.test, this.message);
  }
  get outputSubject() {
    return new TestOutputSubject(this.result, this.taskIndex, this.test);
  }
  constructor(result, test, taskIndex, messageIndex) {
    this.result = result;
    this.test = test;
    this.taskIndex = taskIndex;
    this.messageIndex = messageIndex;
    this.type = "message";
    const m = this.message = test.tasks[taskIndex].messages[messageIndex];
    this.location = m.location;
    this.contextValue = m.type === 0 ? m.contextValue : void 0;
    this.uri = buildTestUri({
      type: 2,
      messageIndex,
      resultId: result.id,
      taskIndex,
      testExtId: test.item.extId
    });
    this.id = this.uri.toString();
    const asPlaintext = renderTestMessageAsText(m.message);
    const lines = count(asPlaintext.trimEnd(), "\n");
    this.label = firstLine(asPlaintext);
    if (lines > 0) {
      this.description = lines > 1 ? localize("messageMoreLinesN", "+ {0} more lines", lines) : localize("messageMoreLines1", "+ 1 more line");
    }
  }
}
let OutputPeekTree = class OutputPeekTree2 extends Disposable {
  static {
    __name(this, "OutputPeekTree");
  }
  constructor(container, onDidReveal, options, contextMenuService, results, instantiationService, explorerFilter, coverageService, progressService, telemetryService) {
    super();
    this.contextMenuService = contextMenuService;
    this.disposed = false;
    this.requestReveal = this._register(new Emitter());
    this.onDidRequestReview = this.requestReveal.event;
    this.treeActions = instantiationService.createInstance(TreeActionsProvider, options.showRevealLocationOnMessages, this.requestReveal);
    const diffIdentityProvider = {
      getId(e) {
        return e.id;
      }
    };
    this.tree = this._register(instantiationService.createInstance(WorkbenchCompressibleObjectTree, "Test Output Peek", container, {
      getHeight: /* @__PURE__ */ __name(() => 22, "getHeight"),
      getTemplateId: /* @__PURE__ */ __name(() => TestRunElementRenderer.ID, "getTemplateId")
    }, [instantiationService.createInstance(TestRunElementRenderer, this.treeActions)], {
      compressionEnabled: true,
      hideTwistiesOfChildlessElements: true,
      identityProvider: diffIdentityProvider,
      alwaysConsumeMouseWheel: false,
      sorter: {
        compare(a, b) {
          if (a instanceof TestCaseElement && b instanceof TestCaseElement) {
            return cmpPriority(a.state, b.state);
          }
          return 0;
        }
      },
      accessibilityProvider: {
        getAriaLabel(element) {
          return element.ariaLabel || element.label;
        },
        getWidgetAriaLabel() {
          return localize("testingPeekLabel", "Test Result Messages");
        }
      }
    }));
    const cc = new CreationCache();
    const getTaskChildren = /* @__PURE__ */ __name((taskElem) => {
      const { results: results2, index, itemsCache, task } = taskElem;
      const tests = Iterable.filter(results2.tests, (test) => test.tasks[index].state >= 2 || test.tasks[index].messages.length > 0);
      let result = Iterable.map(tests, (test) => ({
        element: itemsCache.getOrCreate(test, () => new TestCaseElement(results2, test, index)),
        incompressible: true,
        children: getTestChildren(results2, test, index)
      }));
      if (task.coverage.get()) {
        result = Iterable.concat(Iterable.single({
          element: new CoverageElement(results2, task, coverageService),
          collapsible: true,
          incompressible: true
        }), result);
      }
      return result;
    }, "getTaskChildren");
    const getTestChildren = /* @__PURE__ */ __name((result, test, taskIndex) => {
      return test.tasks[taskIndex].messages.map((m, messageIndex) => m.type === 0 ? { element: cc.getOrCreate(m, () => new TestMessageElement(result, test, taskIndex, messageIndex)), incompressible: false } : void 0).filter(isDefined);
    }, "getTestChildren");
    const getResultChildren = /* @__PURE__ */ __name((result) => {
      return result.tasks.map((task, taskIndex) => {
        const taskElem = cc.getOrCreate(task, () => new TaskElement(result, task, taskIndex));
        return {
          element: taskElem,
          incompressible: false,
          collapsible: true,
          children: getTaskChildren(taskElem)
        };
      });
    }, "getResultChildren");
    const getRootChildren = /* @__PURE__ */ __name(() => {
      let children = [];
      const older = [];
      for (const result of results.results) {
        if (!children.length && result.tasks.length) {
          children = getResultChildren(result);
        } else if (children) {
          const element = cc.getOrCreate(result, () => new TestResultElement(result));
          older.push({
            element,
            incompressible: true,
            collapsible: true,
            collapsed: this.tree.hasElement(element) ? this.tree.isCollapsed(element) : true,
            children: getResultChildren(result)
          });
        }
      }
      if (!children.length) {
        return older;
      }
      if (older.length) {
        children.push({
          element: new OlderResultsElement(older.length),
          incompressible: true,
          collapsible: true,
          collapsed: true,
          children: older
        });
      }
      return children;
    }, "getRootChildren");
    const taskChildrenToUpdate = /* @__PURE__ */ new Set();
    const taskChildrenUpdate = this._register(new RunOnceScheduler(() => {
      for (const taskNode of taskChildrenToUpdate) {
        if (this.tree.hasElement(taskNode)) {
          this.tree.setChildren(taskNode, getTaskChildren(taskNode), { diffIdentityProvider });
        }
      }
      taskChildrenToUpdate.clear();
    }, 300));
    const queueTaskChildrenUpdate = /* @__PURE__ */ __name((taskNode) => {
      taskChildrenToUpdate.add(taskNode);
      if (!taskChildrenUpdate.isScheduled()) {
        taskChildrenUpdate.schedule();
      }
    }, "queueTaskChildrenUpdate");
    const attachToResults = /* @__PURE__ */ __name((result) => {
      const disposable = new DisposableStore();
      disposable.add(result.onNewTask((i) => {
        this.tree.setChildren(null, getRootChildren(), { diffIdentityProvider });
        if (result.tasks.length === 1) {
          this.requestReveal.fire(new TaskSubject(result, 0));
        }
        const task = result.tasks[i];
        disposable.add(autorun((reader) => {
          task.coverage.read(reader);
          queueTaskChildrenUpdate(cc.get(task));
        }));
      }));
      disposable.add(result.onEndTask((index) => {
        cc.get(result.tasks[index])?.changeEmitter.fire();
      }));
      disposable.add(result.onChange((e) => {
        for (const [index, task] of result.tasks.entries()) {
          const taskNode = cc.get(task);
          if (!this.tree.hasElement(taskNode)) {
            continue;
          }
          const itemNode = taskNode.itemsCache.get(e.item);
          if (itemNode && this.tree.hasElement(itemNode)) {
            if (e.reason === 2 && e.message.type === 0) {
              this.tree.setChildren(itemNode, getTestChildren(result, e.item, index), { diffIdentityProvider });
            }
            return;
          }
          queueTaskChildrenUpdate(taskNode);
        }
      }));
      disposable.add(result.onComplete(() => {
        cc.get(result)?.changeEmitter.fire();
        disposable.dispose();
      }));
    }, "attachToResults");
    this._register(results.onResultsChanged((e) => {
      if (this.disposed) {
        return;
      }
      if ("completed" in e) {
        cc.get(e.completed)?.changeEmitter.fire();
      } else if ("started" in e) {
        attachToResults(e.started);
      } else {
        this.tree.setChildren(null, getRootChildren(), { diffIdentityProvider });
      }
    }));
    const revealItem = /* @__PURE__ */ __name((element, preserveFocus) => {
      this.tree.setFocus([element]);
      this.tree.setSelection([element]);
      if (!preserveFocus) {
        this.tree.domFocus();
      }
    }, "revealItem");
    this._register(onDidReveal(async ({ subject, preserveFocus = false }) => {
      if (subject instanceof TaskSubject) {
        const resultItem = this.tree.getNode(null).children.find((c) => {
          if (c.element instanceof TaskElement) {
            return c.element.results.id === subject.result.id && c.element.index === subject.taskIndex;
          }
          if (c.element instanceof TestResultElement) {
            return c.element.id === subject.result.id;
          }
          return false;
        });
        if (resultItem) {
          revealItem(resultItem.element, preserveFocus);
        }
        return;
      }
      const revealElement = subject instanceof TestOutputSubject ? cc.get(subject.task)?.itemsCache.get(subject.test) : cc.get(subject.message);
      if (!revealElement || !this.tree.hasElement(revealElement)) {
        return;
      }
      const parents = [];
      for (let parent = this.tree.getParentElement(revealElement); parent; parent = this.tree.getParentElement(parent)) {
        parents.unshift(parent);
      }
      for (const parent of parents) {
        this.tree.expand(parent);
      }
      if (this.tree.getRelativeTop(revealElement) === null) {
        this.tree.reveal(revealElement, 0.5);
      }
      revealItem(revealElement, preserveFocus);
    }));
    this._register(this.tree.onDidOpen(async (e) => {
      if (e.element instanceof TestMessageElement) {
        this.requestReveal.fire(new MessageSubject(e.element.result, e.element.test, e.element.taskIndex, e.element.messageIndex));
      } else if (e.element instanceof TestCaseElement) {
        const t = e.element;
        const message = mapFindTestMessage(e.element.test, (_t, _m, mesasgeIndex, taskIndex) => new MessageSubject(t.results, t.test, taskIndex, mesasgeIndex));
        this.requestReveal.fire(message || new TestOutputSubject(t.results, 0, t.test));
      } else if (e.element instanceof CoverageElement) {
        const task = e.element.task;
        if (e.element.isOpen) {
          return coverageService.closeCoverage();
        }
        progressService.withProgress({ location: options.locationForProgress }, () => coverageService.openCoverage(task, true));
      }
    }));
    this._register(this.tree.onDidChangeSelection((evt) => {
      for (const element of evt.elements) {
        if (element && "test" in element) {
          explorerFilter.reveal.set(element.test.item.extId, void 0);
          break;
        }
      }
    }));
    this._register(explorerFilter.onDidSelectTestInExplorer((testId) => {
      if (this.tree.getSelection().some((e) => e && "test" in e && e.test.item.extId === testId)) {
        return;
      }
      for (const node of this.tree.getNode(null).children) {
        if (node.element instanceof TaskElement) {
          for (const testNode of node.children) {
            if (testNode.element instanceof TestCaseElement && testNode.element.test.item.extId === testId) {
              this.tree.setSelection([testNode.element]);
              if (this.tree.getRelativeTop(testNode.element) === null) {
                this.tree.reveal(testNode.element, 0.5);
              }
              break;
            }
          }
        }
      }
    }));
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(e)));
    this._register(this.tree.onDidChangeCollapseState((e) => {
      if (e.node.element instanceof OlderResultsElement && !e.node.collapsed) {
        telemetryService.publicLog2("testing.expandOlderResults");
      }
    }));
    this.tree.setChildren(null, getRootChildren());
    for (const result of results.results) {
      if (!result.completedAt && result instanceof LiveTestResult) {
        attachToResults(result);
      }
    }
  }
  layout(height, width) {
    this.tree.layout(height, width);
  }
  onContextMenu(evt) {
    if (!evt.element) {
      return;
    }
    const actions = this.treeActions.provideActionBar(evt.element);
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => evt.anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions.secondary.length ? [...actions.primary, new Separator(), ...actions.secondary] : actions.primary, "getActions"),
      getActionsContext: /* @__PURE__ */ __name(() => evt.element?.context, "getActionsContext")
    });
  }
  dispose() {
    super.dispose();
    this.disposed = true;
  }
};
OutputPeekTree = __decorate([
  __param(3, IContextMenuService),
  __param(4, ITestResultService),
  __param(5, IInstantiationService),
  __param(6, ITestExplorerFilterState),
  __param(7, ITestCoverageService),
  __param(8, IProgressService),
  __param(9, ITelemetryService)
], OutputPeekTree);
let TestRunElementRenderer = class TestRunElementRenderer2 {
  static {
    __name(this, "TestRunElementRenderer");
  }
  static {
    TestRunElementRenderer_1 = this;
  }
  static {
    this.ID = "testRunElementRenderer";
  }
  constructor(treeActions, instantiationService) {
    this.treeActions = treeActions;
    this.instantiationService = instantiationService;
    this.templateId = TestRunElementRenderer_1.ID;
  }
  /** @inheritdoc */
  renderCompressedElements(node, _index, templateData) {
    const chain = node.element.elements;
    const lastElement = chain[chain.length - 1];
    if ((lastElement instanceof TaskElement || lastElement instanceof TestMessageElement) && chain.length >= 2) {
      this.doRender(chain[chain.length - 2], templateData, lastElement);
    } else {
      this.doRender(lastElement, templateData);
    }
  }
  /** @inheritdoc */
  renderTemplate(container) {
    const templateDisposable = new DisposableStore();
    container.classList.add("testing-stdtree-container");
    const icon = dom.append(container, dom.$(".state"));
    const label = dom.append(container, dom.$(".label"));
    const actionBar = new ActionBar(container, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => action instanceof MenuItemAction ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, { hoverDelegate: options.hoverDelegate }) : void 0, "actionViewItemProvider")
    });
    const elementDisposable = new DisposableStore();
    templateDisposable.add(elementDisposable);
    templateDisposable.add(actionBar);
    return {
      icon,
      label,
      actionBar,
      elementDisposable,
      templateDisposable
    };
  }
  /** @inheritdoc */
  renderElement(element, _index, templateData) {
    this.doRender(element.element, templateData);
  }
  /** @inheritdoc */
  disposeTemplate(templateData) {
    templateData.templateDisposable.dispose();
  }
  /** Called to render a new element */
  doRender(element, templateData, subjectElement) {
    templateData.elementDisposable.clear();
    templateData.elementDisposable.add(element.onDidChange(() => this.doRender(element, templateData, subjectElement)));
    this.doRenderInner(element, templateData, subjectElement);
  }
  /** Called, and may be re-called, to render or re-render an element */
  doRenderInner(element, templateData, subjectElement) {
    let { label, labelWithIcons, description } = element;
    if (subjectElement instanceof TestMessageElement) {
      description = subjectElement.label;
      if (element.description) {
        description = `${description} @ ${element.description}`;
      }
    }
    const descriptionElement = description ? dom.$("span.test-label-description", {}, description) : "";
    if (labelWithIcons) {
      dom.reset(templateData.label, ...labelWithIcons, descriptionElement);
    } else {
      dom.reset(templateData.label, label, descriptionElement);
    }
    const icon = element.icon;
    templateData.icon.className = `computed-state ${icon ? ThemeIcon.asClassName(icon) : ""}`;
    const actions = this.treeActions.provideActionBar(element);
    templateData.actionBar.clear();
    templateData.actionBar.context = element.context;
    templateData.actionBar.push(actions.primary, { icon: true, label: false });
  }
};
TestRunElementRenderer = TestRunElementRenderer_1 = __decorate([
  __param(1, IInstantiationService)
], TestRunElementRenderer);
let TreeActionsProvider = class TreeActionsProvider2 {
  static {
    __name(this, "TreeActionsProvider");
  }
  constructor(showRevealLocationOnMessages, requestReveal, contextKeyService, menuService, commandService, testProfileService, editorService) {
    this.showRevealLocationOnMessages = showRevealLocationOnMessages;
    this.requestReveal = requestReveal;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this.commandService = commandService;
    this.testProfileService = testProfileService;
    this.editorService = editorService;
  }
  provideActionBar(element) {
    const test = element instanceof TestCaseElement ? element.test : void 0;
    const capabilities = test ? this.testProfileService.capabilitiesForTest(test.item) : 0;
    const contextKeys = [
      [
        "peek",
        "editor.contrib.testingOutputPeek"
        /* Testing.OutputPeekContributionId */
      ],
      [TestingContextKeys.peekItemType.key, element.type]
    ];
    let id = MenuId.TestPeekElement;
    const primary = [];
    const secondary = [];
    if (element instanceof TaskElement) {
      primary.push(new Action("testing.outputPeek.showResultOutput", localize("testing.showResultOutput", "Show Result Output"), ThemeIcon.asClassName(Codicon.terminal), void 0, () => this.requestReveal.fire(new TaskSubject(element.results, element.index))));
      if (element.task.running) {
        primary.push(new Action("testing.outputPeek.cancel", localize("testing.cancelRun", "Cancel Test Run"), ThemeIcon.asClassName(icons.testingCancelIcon), void 0, () => this.commandService.executeCommand("testing.cancelRun", element.results.id, element.task.id)));
      } else {
        primary.push(new Action("testing.outputPeek.rerun", localize("testing.reRunLastRun", "Rerun Last Run"), ThemeIcon.asClassName(icons.testingRerunIcon), void 0, () => this.commandService.executeCommand("testing.reRunLastRun", element.results.id)));
        primary.push(new Action("testing.outputPeek.debug", localize("testing.debugLastRun", "Debug Last Run"), ThemeIcon.asClassName(icons.testingDebugIcon), void 0, () => this.commandService.executeCommand("testing.debugLastRun", element.results.id)));
      }
    }
    if (element instanceof TestResultElement) {
      if (element.value.tasks.length === 1) {
        primary.push(new Action("testing.outputPeek.showResultOutput", localize("testing.showResultOutput", "Show Result Output"), ThemeIcon.asClassName(Codicon.terminal), void 0, () => this.requestReveal.fire(new TaskSubject(element.value, 0))));
      }
      primary.push(new Action("testing.outputPeek.reRunLastRun", localize("testing.reRunTest", "Rerun Test"), ThemeIcon.asClassName(icons.testingRunIcon), void 0, () => this.commandService.executeCommand("testing.reRunLastRun", element.value.id)));
      if (capabilities & 4) {
        primary.push(new Action("testing.outputPeek.debugLastRun", localize("testing.debugTest", "Debug Test"), ThemeIcon.asClassName(icons.testingDebugIcon), void 0, () => this.commandService.executeCommand("testing.debugLastRun", element.value.id)));
      }
    }
    if (element instanceof TestCaseElement || element instanceof TestMessageElement) {
      contextKeys.push([TestingContextKeys.testResultOutdated.key, element.test.retired], [TestingContextKeys.testResultState.key, testResultStateToContextValues[element.test.ownComputedState]], ...getTestItemContextOverlay(element.test, capabilities));
      primary.push(new Action("testing.outputPeek.goToTest", localize("testing.goToTest", "Go to Test"), ThemeIcon.asClassName(Codicon.goToFile), void 0, () => this.commandService.executeCommand("vscode.revealTest", element.test.item.extId)));
      const extId = element.test.item.extId;
      if (element.test.tasks[element.taskIndex].messages.some(
        (m) => m.type === 1
        /* TestMessageType.Output */
      )) {
        primary.push(new Action("testing.outputPeek.showResultOutput", localize("testing.showResultOutput", "Show Result Output"), ThemeIcon.asClassName(Codicon.terminal), void 0, () => this.requestReveal.fire(element.outputSubject)));
      }
      secondary.push(new Action("testing.outputPeek.revealInExplorer", localize("testing.revealInExplorer", "Reveal in Test Explorer"), ThemeIcon.asClassName(Codicon.listTree), void 0, () => this.commandService.executeCommand("_revealTestInExplorer", extId)));
      if (capabilities & 2) {
        primary.push(new Action("testing.outputPeek.runTest", localize("run test", "Run Test"), ThemeIcon.asClassName(icons.testingRunIcon), void 0, () => this.commandService.executeCommand("vscode.runTestsById", 2, extId)));
      }
      if (capabilities & 4) {
        primary.push(new Action("testing.outputPeek.debugTest", localize("debug test", "Debug Test"), ThemeIcon.asClassName(icons.testingDebugIcon), void 0, () => this.commandService.executeCommand("vscode.runTestsById", 4, extId)));
      }
    }
    if (element instanceof TestMessageElement) {
      id = MenuId.TestMessageContext;
      contextKeys.push([TestingContextKeys.testMessageContext.key, element.contextValue]);
      if (this.showRevealLocationOnMessages && element.location) {
        primary.push(new Action("testing.outputPeek.goToError", localize("testing.goToError", "Go to Error"), ThemeIcon.asClassName(Codicon.debugStackframe), void 0, () => this.editorService.openEditor({
          resource: element.location.uri,
          options: {
            selection: element.location.range,
            preserveFocus: true
          }
        })));
      }
    }
    const contextOverlay = this.contextKeyService.createOverlay(contextKeys);
    const result = { primary, secondary };
    const menu = this.menuService.getMenuActions(id, contextOverlay, { arg: element.context });
    fillInActionBarActions(menu, result, "inline");
    return result;
  }
};
TreeActionsProvider = __decorate([
  __param(2, IContextKeyService),
  __param(3, IMenuService),
  __param(4, ICommandService),
  __param(5, ITestProfileService),
  __param(6, IEditorService)
], TreeActionsProvider);
class CreationCache {
  static {
    __name(this, "CreationCache");
  }
  constructor() {
    this.v = /* @__PURE__ */ new WeakMap();
  }
  get(key) {
    return this.v.get(key);
  }
  getOrCreate(ref, factory) {
    const existing = this.v.get(ref);
    if (existing) {
      return existing;
    }
    const fresh = factory();
    this.v.set(ref, fresh);
    return fresh;
  }
}
const firstLine = /* @__PURE__ */ __name((str) => {
  const index = str.indexOf("\n");
  return index === -1 ? str : str.slice(0, index);
}, "firstLine");
export {
  OutputPeekTree
};
//# sourceMappingURL=testResultsTree.js.map
