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
import * as dom from "../../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../../base/browser/keyboardEvent.js";
import { renderLabelWithIcons } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Orientation, Sizing, SplitView } from "../../../../../base/browser/ui/splitview/splitview.js";
import { findAsync } from "../../../../../base/common/arrays.js";
import { Limiter } from "../../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Emitter, Event, Relay } from "../../../../../base/common/event.js";
import { KeyCode } from "../../../../../base/common/keyCodes.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../../nls.js";
import { FloatingClickMenu } from "../../../../../platform/actions/browser/floatingMenu.js";
import { createActionViewItem } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuWorkbenchToolBar } from "../../../../../platform/actions/browser/toolbar.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IContextKey, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService, ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { AnyStackFrame, CallStackFrame, CallStackWidget, CustomStackFrame } from "../../../debug/browser/callStackWidget.js";
import { TestCommandId } from "../../common/constants.js";
import { IObservableValue } from "../../common/observableValue.js";
import { capabilityContextKeys, ITestProfileService } from "../../common/testProfileService.js";
import { LiveTestResult } from "../../common/testResult.js";
import { ITestFollowup, ITestService } from "../../common/testService.js";
import { ITestMessageStackFrame, TestRunProfileBitset } from "../../common/testTypes.js";
import { TestingContextKeys } from "../../common/testingContextKeys.js";
import * as icons from "../icons.js";
import { DiffContentProvider, IPeekOutputRenderer, MarkdownTestMessagePeek, PlainTextMessagePeek, TerminalMessagePeek } from "./testResultsOutput.js";
import { equalsSubject, getSubjectTestItem, InspectSubject, MessageSubject, TaskSubject, TestOutputSubject } from "./testResultsSubject.js";
import { OutputPeekTree } from "./testResultsTree.js";
import "./testResultsViewContent.css";
var SubView = /* @__PURE__ */ ((SubView2) => {
  SubView2[SubView2["Diff"] = 0] = "Diff";
  SubView2[SubView2["History"] = 1] = "History";
  return SubView2;
})(SubView || {});
let MessageStackFrame = class extends CustomStackFrame {
  constructor(message, followup, subject, instantiationService, contextKeyService, profileService) {
    super();
    this.message = message;
    this.followup = followup;
    this.subject = subject;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.profileService = profileService;
    this.label = subject instanceof MessageSubject ? subject.test.label : subject instanceof TestOutputSubject ? subject.test.item.label : subject.result.name;
  }
  static {
    __name(this, "MessageStackFrame");
  }
  height = observableValue("MessageStackFrame.height", 100);
  label;
  icon = icons.testingViewIcon;
  render(container) {
    this.message.style.visibility = "visible";
    container.appendChild(this.message);
    return toDisposable(() => this.message.remove());
  }
  renderActions(container) {
    const store = new DisposableStore();
    container.appendChild(this.followup.domNode);
    store.add(toDisposable(() => this.followup.domNode.remove()));
    const test = getSubjectTestItem(this.subject);
    const capabilities = test && this.profileService.capabilitiesForTest(test);
    let contextKeyService;
    if (capabilities) {
      contextKeyService = this.contextKeyService.createOverlay(capabilityContextKeys(capabilities));
    } else {
      const profiles = this.profileService.getControllerProfiles(this.subject.controllerId);
      contextKeyService = this.contextKeyService.createOverlay([
        [TestingContextKeys.hasRunnableTests.key, profiles.some((p) => p.group & TestRunProfileBitset.Run)],
        [TestingContextKeys.hasDebuggableTests.key, profiles.some((p) => p.group & TestRunProfileBitset.Debug)]
      ]);
    }
    const instaService = store.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
    const toolbar = store.add(instaService.createInstance(MenuWorkbenchToolBar, container, MenuId.TestCallStack, {
      menuOptions: { shouldForwardArgs: true },
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => createActionViewItem(this.instantiationService, action, options), "actionViewItemProvider")
    }));
    toolbar.context = this.subject;
    store.add(toolbar);
    return store;
  }
};
MessageStackFrame = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, ITestProfileService)
], MessageStackFrame);
function runInLast(accessor, bitset, subject) {
  if (subject instanceof TaskSubject) {
    return accessor.get(ICommandService).executeCommand(
      bitset === TestRunProfileBitset.Debug ? TestCommandId.DebugLastRun : TestCommandId.ReRunLastRun,
      subject.result.id
    );
  }
  const testService = accessor.get(ITestService);
  const plainTest = subject instanceof MessageSubject ? subject.test : subject.test.item;
  const currentTest = testService.collection.getNodeById(plainTest.extId);
  if (!currentTest) {
    return;
  }
  return testService.runTests({
    group: bitset,
    tests: [currentTest]
  });
}
__name(runInLast, "runInLast");
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "testing.callStack.run",
      title: localize("testing.callStack.run", "Rerun Test"),
      icon: icons.testingRunIcon,
      menu: {
        id: MenuId.TestCallStack,
        when: TestingContextKeys.hasRunnableTests,
        group: "navigation"
      }
    });
  }
  run(accessor, subject) {
    runInLast(accessor, TestRunProfileBitset.Run, subject);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "testing.callStack.debug",
      title: localize("testing.callStack.debug", "Debug Test"),
      icon: icons.testingDebugIcon,
      menu: {
        id: MenuId.TestCallStack,
        when: TestingContextKeys.hasDebuggableTests,
        group: "navigation"
      }
    });
  }
  run(accessor, subject) {
    runInLast(accessor, TestRunProfileBitset.Debug, subject);
  }
});
let TestResultsViewContent = class extends Disposable {
  constructor(editor, options, instantiationService, modelService, contextKeyService, uriIdentityService) {
    super();
    this.editor = editor;
    this.options = options;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.contextKeyService = contextKeyService;
    this.uriIdentityService = uriIdentityService;
  }
  static {
    __name(this, "TestResultsViewContent");
  }
  static lastSplitWidth;
  didReveal = this._register(new Emitter());
  currentSubjectStore = this._register(new DisposableStore());
  onCloseEmitter = this._register(new Relay());
  followupWidget;
  messageContextKeyService;
  contextKeyTestMessage;
  contextKeyResultOutdated;
  stackContainer;
  callStackWidget;
  currentTopFrame;
  isDoingLayoutUpdate;
  dimension;
  splitView;
  messageContainer;
  contentProviders;
  contentProvidersUpdateLimiter = this._register(new Limiter(1));
  current;
  /** Fired when a tree item is selected. Populated only on .fillBody() */
  onDidRequestReveal;
  onClose = this.onCloseEmitter.event;
  get uiState() {
    return {
      splitViewWidths: Array.from(
        { length: this.splitView.length },
        (_, i) => this.splitView.getViewSize(i)
      )
    };
  }
  get onDidChangeContentHeight() {
    return this.callStackWidget.onDidChangeContentHeight;
  }
  get contentHeight() {
    return this.callStackWidget?.contentHeight || 0;
  }
  fillBody(containerElement) {
    const initialSpitWidth = TestResultsViewContent.lastSplitWidth;
    this.splitView = new SplitView(containerElement, { orientation: Orientation.HORIZONTAL });
    const { historyVisible, showRevealLocationOnMessages } = this.options;
    const isInPeekView = this.editor !== void 0;
    const messageContainer = this.messageContainer = dom.$(".test-output-peek-message-container");
    this.stackContainer = dom.append(containerElement, dom.$(".test-output-call-stack-container"));
    this.callStackWidget = this._register(this.instantiationService.createInstance(CallStackWidget, this.stackContainer, this.editor));
    this.followupWidget = this._register(this.instantiationService.createInstance(FollowupActionWidget, this.editor));
    this.onCloseEmitter.input = this.followupWidget.onClose;
    this.contentProviders = [
      this._register(this.instantiationService.createInstance(DiffContentProvider, this.editor, messageContainer)),
      this._register(this.instantiationService.createInstance(MarkdownTestMessagePeek, messageContainer)),
      this._register(this.instantiationService.createInstance(TerminalMessagePeek, messageContainer, isInPeekView)),
      this._register(this.instantiationService.createInstance(PlainTextMessagePeek, this.editor, messageContainer))
    ];
    this.messageContextKeyService = this._register(this.contextKeyService.createScoped(containerElement));
    this.contextKeyTestMessage = TestingContextKeys.testMessageContext.bindTo(this.messageContextKeyService);
    this.contextKeyResultOutdated = TestingContextKeys.testResultOutdated.bindTo(this.messageContextKeyService);
    const treeContainer = dom.append(containerElement, dom.$(".test-output-peek-tree.testing-stdtree"));
    const tree = this._register(this.instantiationService.createInstance(
      OutputPeekTree,
      treeContainer,
      this.didReveal.event,
      { showRevealLocationOnMessages, locationForProgress: this.options.locationForProgress }
    ));
    this.onDidRequestReveal = tree.onDidRequestReview;
    this.splitView.addView({
      onDidChange: Event.None,
      element: this.stackContainer,
      minimumSize: 200,
      maximumSize: Number.MAX_VALUE,
      layout: /* @__PURE__ */ __name((width) => {
        TestResultsViewContent.lastSplitWidth = width;
        if (this.dimension) {
          this.callStackWidget?.layout(this.dimension.height, width);
          this.layoutContentWidgets(this.dimension, width);
        }
      }, "layout")
    }, Sizing.Distribute);
    this.splitView.addView({
      onDidChange: Event.None,
      element: treeContainer,
      minimumSize: 100,
      maximumSize: Number.MAX_VALUE,
      layout: /* @__PURE__ */ __name((width) => {
        if (this.dimension) {
          tree.layout(this.dimension.height, width);
        }
      }, "layout")
    }, Sizing.Distribute);
    this.splitView.setViewVisible(1 /* History */, historyVisible.value);
    this._register(historyVisible.onDidChange((visible) => {
      this.splitView.setViewVisible(1 /* History */, visible);
    }));
    if (initialSpitWidth) {
      queueMicrotask(() => this.splitView.resizeView(0, initialSpitWidth));
    }
  }
  /**
   * Shows a message in-place without showing or changing the peek location.
   * This is mostly used if peeking a message without a location.
   */
  reveal(opts) {
    this.didReveal.fire(opts);
    if (this.current && equalsSubject(this.current, opts.subject)) {
      return Promise.resolve();
    }
    this.current = opts.subject;
    return this.contentProvidersUpdateLimiter.queue(async () => {
      this.currentSubjectStore.clear();
      const callFrames = this.getCallFrames(opts.subject) || [];
      const topFrame = await this.prepareTopFrame(opts.subject, callFrames);
      this.setCallStackFrames(topFrame, callFrames);
      this.followupWidget.show(opts.subject);
      this.populateFloatingClick(opts.subject);
    });
  }
  setCallStackFrames(messageFrame, stack) {
    this.callStackWidget.setFrames([messageFrame, ...stack.map((frame) => new CallStackFrame(
      frame.label,
      frame.uri,
      frame.position?.lineNumber,
      frame.position?.column
    ))]);
  }
  /**
   * Collapses all displayed stack frames.
   */
  collapseStack() {
    this.callStackWidget.collapseAll();
  }
  getCallFrames(subject) {
    if (!(subject instanceof MessageSubject)) {
      return void 0;
    }
    const frames = subject.stack;
    if (!frames?.length || !this.editor) {
      return frames;
    }
    const topFrame = frames[0];
    const peekLocation = subject.revealLocation;
    const isTopFrameSame = peekLocation && topFrame.position && topFrame.uri && topFrame.position.lineNumber === peekLocation.range.startLineNumber && topFrame.position.column === peekLocation.range.startColumn && this.uriIdentityService.extUri.isEqual(topFrame.uri, peekLocation.uri);
    return isTopFrameSame ? frames.slice(1) : frames;
  }
  async prepareTopFrame(subject, callFrames) {
    this.messageContainer.style.visibility = "hidden";
    this.stackContainer.appendChild(this.messageContainer);
    const topFrame = this.currentTopFrame = this.instantiationService.createInstance(MessageStackFrame, this.messageContainer, this.followupWidget, subject);
    const hasMultipleFrames = callFrames.length > 0;
    topFrame.showHeader.set(hasMultipleFrames, void 0);
    const provider = await findAsync(this.contentProviders, (p) => p.update(subject));
    if (provider) {
      const width = this.splitView.getViewSize(0 /* Diff */);
      if (width !== -1 && this.dimension) {
        topFrame.height.set(provider.layout({ width, height: this.dimension?.height }, hasMultipleFrames), void 0);
      }
      if (provider.onScrolled) {
        this.currentSubjectStore.add(this.callStackWidget.onDidScroll((evt) => {
          provider.onScrolled(evt);
        }));
      }
      if (provider.onDidContentSizeChange) {
        this.currentSubjectStore.add(provider.onDidContentSizeChange(() => {
          if (this.dimension && !this.isDoingLayoutUpdate) {
            this.isDoingLayoutUpdate = true;
            topFrame.height.set(provider.layout(this.dimension, hasMultipleFrames), void 0);
            this.isDoingLayoutUpdate = false;
          }
        }));
      }
    }
    return topFrame;
  }
  layoutContentWidgets(dimension, width = this.splitView.getViewSize(0 /* Diff */)) {
    this.isDoingLayoutUpdate = true;
    for (const provider of this.contentProviders) {
      const frameHeight = provider.layout({ height: dimension.height, width }, !!this.currentTopFrame?.showHeader.get());
      if (frameHeight) {
        this.currentTopFrame?.height.set(frameHeight, void 0);
      }
    }
    this.isDoingLayoutUpdate = false;
  }
  populateFloatingClick(subject) {
    if (!(subject instanceof MessageSubject)) {
      return;
    }
    this.currentSubjectStore.add(toDisposable(() => {
      this.contextKeyResultOutdated.reset();
      this.contextKeyTestMessage.reset();
    }));
    this.contextKeyTestMessage.set(subject.contextValue || "");
    if (subject.result instanceof LiveTestResult) {
      this.contextKeyResultOutdated.set(subject.result.getStateById(subject.test.extId)?.retired ?? false);
      this.currentSubjectStore.add(subject.result.onChange((ev) => {
        if (ev.item.item.extId === subject.test.extId) {
          this.contextKeyResultOutdated.set(ev.item.retired ?? false);
        }
      }));
    } else {
      this.contextKeyResultOutdated.set(true);
    }
    const instaService = this.currentSubjectStore.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.messageContextKeyService])));
    this.currentSubjectStore.add(instaService.createInstance(FloatingClickMenu, {
      container: this.messageContainer,
      menuId: MenuId.TestMessageContent,
      getActionArg: /* @__PURE__ */ __name(() => subject.context, "getActionArg")
    }));
  }
  onLayoutBody(height, width) {
    this.dimension = new dom.Dimension(width, height);
    this.splitView.layout(width);
  }
  onWidth(width) {
    this.splitView.layout(width);
  }
};
TestResultsViewContent = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITextModelService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IUriIdentityService)
], TestResultsViewContent);
const FOLLOWUP_ANIMATION_MIN_TIME = 500;
let FollowupActionWidget = class extends Disposable {
  constructor(editor, testService, quickInput) {
    super();
    this.editor = editor;
    this.testService = testService;
    this.quickInput = quickInput;
  }
  static {
    __name(this, "FollowupActionWidget");
  }
  el = dom.h("div.testing-followup-action", []);
  visibleStore = this._register(new DisposableStore());
  onCloseEmitter = this._register(new Emitter());
  onClose = this.onCloseEmitter.event;
  get domNode() {
    return this.el.root;
  }
  show(subject) {
    this.visibleStore.clear();
    if (subject instanceof MessageSubject) {
      this.showMessage(subject);
    }
  }
  async showMessage(subject) {
    const cts = this.visibleStore.add(new CancellationTokenSource());
    const start = Date.now();
    if (subject.result instanceof LiveTestResult && !subject.result.completedAt) {
      await new Promise((r) => Event.once(subject.result.onComplete)(r));
    }
    const followups = await this.testService.provideTestFollowups({
      extId: subject.test.extId,
      messageIndex: subject.messageIndex,
      resultId: subject.result.id,
      taskIndex: subject.taskIndex
    }, cts.token);
    if (!followups.followups.length || cts.token.isCancellationRequested) {
      followups.dispose();
      return;
    }
    this.visibleStore.add(followups);
    dom.clearNode(this.el.root);
    this.el.root.classList.toggle("animated", Date.now() - start > FOLLOWUP_ANIMATION_MIN_TIME);
    this.el.root.appendChild(this.makeFollowupLink(followups.followups[0]));
    if (followups.followups.length > 1) {
      this.el.root.appendChild(this.makeMoreLink(followups.followups));
    }
    this.visibleStore.add(toDisposable(() => {
      this.el.root.remove();
    }));
  }
  makeFollowupLink(first) {
    const link = this.makeLink(() => this.actionFollowup(link, first));
    dom.reset(link, ...renderLabelWithIcons(first.message));
    return link;
  }
  makeMoreLink(followups) {
    const link = this.makeLink(
      () => this.quickInput.pick(followups.map((f, i) => ({
        label: f.message,
        index: i
      }))).then((picked) => {
        if (picked?.length) {
          followups[picked[0].index].execute();
        }
      })
    );
    link.innerText = localize("testFollowup.more", "+{0} More...", followups.length - 1);
    return link;
  }
  makeLink(onClick) {
    const link = document.createElement("a");
    link.tabIndex = 0;
    this.visibleStore.add(dom.addDisposableListener(link, "click", onClick));
    this.visibleStore.add(dom.addDisposableListener(link, "keydown", (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(KeyCode.Space) || event.equals(KeyCode.Enter)) {
        onClick();
      }
    }));
    return link;
  }
  actionFollowup(link, fu) {
    if (link.ariaDisabled !== "true") {
      link.ariaDisabled = "true";
      fu.execute();
      if (this.editor) {
        this.onCloseEmitter.fire();
      }
    }
  }
};
FollowupActionWidget = __decorateClass([
  __decorateParam(1, ITestService),
  __decorateParam(2, IQuickInputService)
], FollowupActionWidget);
export {
  TestResultsViewContent
};
//# sourceMappingURL=testResultsViewContent.js.map
