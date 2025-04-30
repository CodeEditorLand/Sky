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
import * as dom from "../../../../../base/browser/dom.js";
import { Delayer } from "../../../../../base/common/async.js";
import { Event } from "../../../../../base/common/event.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { Lazy } from "../../../../../base/common/lazy.js";
import { Disposable, DisposableStore, MutableDisposable, combinedDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { CodeEditorWidget } from "../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { EmbeddedCodeEditorWidget } from "../../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { DiffEditorWidget } from "../../../../../editor/browser/widget/diffEditor/diffEditorWidget.js";
import { EmbeddedDiffEditorWidget } from "../../../../../editor/browser/widget/diffEditor/embeddedDiffEditorWidget.js";
import { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { peekViewResultsBackground } from "../../../../../editor/contrib/peekView/browser/peekView.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { TerminalCapabilityStore } from "../../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { formatMessageForTerminal } from "../../../../../platform/terminal/common/terminalStrings.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { EditorModel } from "../../../../common/editor/editorModel.js";
import { PANEL_BACKGROUND, SIDE_BAR_BACKGROUND } from "../../../../common/theme.js";
import { IViewDescriptorService } from "../../../../common/views.js";
import { DetachedProcessInfo } from "../../../terminal/browser/detachedTerminal.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
import { getXtermScaledDimensions } from "../../../terminal/browser/xterm/xtermTerminal.js";
import { TERMINAL_BACKGROUND_COLOR } from "../../../terminal/common/terminalColorRegistry.js";
import { colorizeTestMessageInEditor } from "../testMessageColorizer.js";
import { MessageSubject, TaskSubject, TestOutputSubject } from "./testResultsSubject.js";
import { MutableObservableValue } from "../../common/observableValue.js";
import { LiveTestResult } from "../../common/testResult.js";
import { ITestMessage, getMarkId } from "../../common/testTypes.js";
import { CALL_STACK_WIDGET_HEADER_HEIGHT } from "../../../debug/browser/callStackWidget.js";
class SimpleDiffEditorModel extends EditorModel {
  static {
    __name(this, "SimpleDiffEditorModel");
  }
  constructor(_original, _modified) {
    super();
    this._original = _original;
    this._modified = _modified;
    this.original = this._original.object.textEditorModel;
    this.modified = this._modified.object.textEditorModel;
  }
  dispose() {
    super.dispose();
    this._original.dispose();
    this._modified.dispose();
  }
}
const commonEditorOptions = {
  scrollBeyondLastLine: false,
  links: true,
  lineNumbers: "off",
  glyphMargin: false,
  scrollbar: {
    vertical: "hidden",
    horizontal: "auto",
    useShadows: false,
    verticalHasArrows: false,
    horizontalHasArrows: false,
    handleMouseWheel: false
  },
  overviewRulerLanes: 0,
  fixedOverflowWidgets: true,
  readOnly: true,
  stickyScroll: { enabled: false },
  minimap: { enabled: false },
  automaticLayout: false
};
const diffEditorOptions = {
  ...commonEditorOptions,
  enableSplitViewResizing: true,
  isInEmbeddedEditor: true,
  renderOverviewRuler: false,
  ignoreTrimWhitespace: false,
  renderSideBySide: true,
  useInlineViewWhenSpaceIsLimited: false,
  originalAriaLabel: localize("testingOutputExpected", "Expected result"),
  modifiedAriaLabel: localize("testingOutputActual", "Actual result"),
  diffAlgorithm: "advanced"
};
let DiffContentProvider = class DiffContentProvider2 extends Disposable {
  static {
    __name(this, "DiffContentProvider");
  }
  get onDidContentSizeChange() {
    return this.widget.value?.onDidContentSizeChange || Event.None;
  }
  constructor(editor, container, instantiationService, modelService) {
    super();
    this.editor = editor;
    this.container = container;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.widget = this._register(new MutableDisposable());
    this.model = this._register(new MutableDisposable());
  }
  async update(subject) {
    if (!(subject instanceof MessageSubject)) {
      this.clear();
      return false;
    }
    const message = subject.message;
    if (!ITestMessage.isDiffable(message)) {
      this.clear();
      return false;
    }
    const [original, modified] = await Promise.all([
      this.modelService.createModelReference(subject.expectedUri),
      this.modelService.createModelReference(subject.actualUri)
    ]);
    const model = this.model.value = new SimpleDiffEditorModel(original, modified);
    if (!this.widget.value) {
      this.widget.value = this.editor ? this.instantiationService.createInstance(EmbeddedDiffEditorWidget, this.container, diffEditorOptions, {}, this.editor) : this.instantiationService.createInstance(DiffEditorWidget, this.container, diffEditorOptions, {});
      if (this.dimension) {
        this.widget.value.layout(this.dimension);
      }
    }
    this.widget.value.setModel(model);
    this.widget.value.updateOptions(this.getOptions(isMultiline(message.expected) || isMultiline(message.actual)));
    return true;
  }
  clear() {
    this.model.clear();
    this.widget.clear();
  }
  layout(dimensions, hasMultipleFrames) {
    this.dimension = dimensions;
    const editor = this.widget.value;
    if (!editor) {
      return;
    }
    editor.layout(dimensions);
    const height = Math.max(editor.getOriginalEditor().getContentHeight(), editor.getModifiedEditor().getContentHeight());
    this.helper = new ScrollHelper(hasMultipleFrames, height, dimensions.height);
    return height;
  }
  onScrolled(evt) {
    this.helper?.onScrolled(evt, this.widget.value?.getDomNode(), this.widget.value?.getOriginalEditor());
  }
  getOptions(isMultiline2) {
    return isMultiline2 ? { ...diffEditorOptions, lineNumbers: "on" } : { ...diffEditorOptions, lineNumbers: "off" };
  }
};
DiffContentProvider = __decorate([
  __param(2, IInstantiationService),
  __param(3, ITextModelService)
], DiffContentProvider);
let MarkdownTestMessagePeek = class MarkdownTestMessagePeek2 extends Disposable {
  static {
    __name(this, "MarkdownTestMessagePeek");
  }
  constructor(container, instantiationService) {
    super();
    this.container = container;
    this.instantiationService = instantiationService;
    this.markdown = new Lazy(() => this.instantiationService.createInstance(MarkdownRenderer, {}));
    this.rendered = this._register(new DisposableStore());
    this._register(toDisposable(() => this.clear()));
  }
  async update(subject) {
    this.clear();
    if (!(subject instanceof MessageSubject)) {
      return false;
    }
    const message = subject.message;
    if (ITestMessage.isDiffable(message) || typeof message.message === "string") {
      return false;
    }
    const rendered = this.rendered.add(this.markdown.value.render(message.message, {}));
    rendered.element.style.userSelect = "text";
    rendered.element.classList.add("preview-text");
    this.container.appendChild(rendered.element);
    this.element = rendered.element;
    this.rendered.add(toDisposable(() => rendered.element.remove()));
    return true;
  }
  layout(dimension) {
    if (!this.element) {
      return void 0;
    }
    this.element.style.width = `${dimension.width - 32}px`;
    return this.element.clientHeight;
  }
  clear() {
    this.rendered.clear();
    this.element = void 0;
  }
};
MarkdownTestMessagePeek = __decorate([
  __param(1, IInstantiationService)
], MarkdownTestMessagePeek);
class ScrollHelper {
  static {
    __name(this, "ScrollHelper");
  }
  constructor(hasMultipleFrames, contentHeight, viewHeight) {
    this.hasMultipleFrames = hasMultipleFrames;
    this.contentHeight = contentHeight;
    this.viewHeight = viewHeight;
  }
  onScrolled(evt, container, editor) {
    if (!editor || !container) {
      return;
    }
    let delta = Math.max(0, evt.scrollTop - (this.hasMultipleFrames ? CALL_STACK_WIDGET_HEADER_HEIGHT : 0));
    delta = Math.min(Math.max(0, this.contentHeight - this.viewHeight), delta);
    editor.setScrollTop(delta);
    container.style.transform = `translateY(${delta}px)`;
  }
}
let PlainTextMessagePeek = class PlainTextMessagePeek2 extends Disposable {
  static {
    __name(this, "PlainTextMessagePeek");
  }
  get onDidContentSizeChange() {
    return this.widget.value?.onDidContentSizeChange || Event.None;
  }
  constructor(editor, container, instantiationService, modelService) {
    super();
    this.editor = editor;
    this.container = container;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.widgetDecorations = this._register(new MutableDisposable());
    this.widget = this._register(new MutableDisposable());
    this.model = this._register(new MutableDisposable());
  }
  async update(subject) {
    if (!(subject instanceof MessageSubject)) {
      this.clear();
      return false;
    }
    const message = subject.message;
    if (ITestMessage.isDiffable(message) || message.type === 1 || typeof message.message !== "string") {
      this.clear();
      return false;
    }
    const modelRef = this.model.value = await this.modelService.createModelReference(subject.messageUri);
    if (!this.widget.value) {
      this.widget.value = this.editor ? this.instantiationService.createInstance(EmbeddedCodeEditorWidget, this.container, commonEditorOptions, {}, this.editor) : this.instantiationService.createInstance(CodeEditorWidget, this.container, commonEditorOptions, { isSimpleWidget: true });
      if (this.dimension) {
        this.widget.value.layout(this.dimension);
      }
    }
    this.widget.value.setModel(modelRef.object.textEditorModel);
    this.widget.value.updateOptions(commonEditorOptions);
    this.widgetDecorations.value = colorizeTestMessageInEditor(message.message, this.widget.value);
    return true;
  }
  clear() {
    this.widgetDecorations.clear();
    this.widget.clear();
    this.model.clear();
  }
  onScrolled(evt) {
    this.helper?.onScrolled(evt, this.widget.value?.getDomNode(), this.widget.value);
  }
  layout(dimensions, hasMultipleFrames) {
    this.dimension = dimensions;
    const editor = this.widget.value;
    if (!editor) {
      return;
    }
    editor.layout(dimensions);
    const height = editor.getContentHeight();
    this.helper = new ScrollHelper(hasMultipleFrames, height, dimensions.height);
    return height;
  }
};
PlainTextMessagePeek = __decorate([
  __param(2, IInstantiationService),
  __param(3, ITextModelService)
], PlainTextMessagePeek);
let TerminalMessagePeek = class TerminalMessagePeek2 extends Disposable {
  static {
    __name(this, "TerminalMessagePeek");
  }
  constructor(container, isInPeekView, terminalService, viewDescriptorService, workspaceContext) {
    super();
    this.container = container;
    this.isInPeekView = isInPeekView;
    this.terminalService = terminalService;
    this.viewDescriptorService = viewDescriptorService;
    this.workspaceContext = workspaceContext;
    this.terminalCwd = this._register(new MutableObservableValue(""));
    this.xtermLayoutDelayer = this._register(new Delayer(50));
    this.terminal = this._register(new MutableDisposable());
    this.outputDataListener = this._register(new MutableDisposable());
  }
  async makeTerminal() {
    const prev = this.terminal.value;
    if (prev) {
      prev.xterm.clearBuffer();
      prev.xterm.clearSearchDecorations();
      prev.xterm.write(`\x1Bc`);
      return prev;
    }
    const capabilities = new TerminalCapabilityStore();
    const cwd = this.terminalCwd;
    capabilities.add(0, {
      type: 0,
      get cwds() {
        return [cwd.value];
      },
      onDidChangeCwd: cwd.onDidChange,
      getCwd: /* @__PURE__ */ __name(() => cwd.value, "getCwd"),
      updateCwd: /* @__PURE__ */ __name(() => {
      }, "updateCwd")
    });
    return this.terminal.value = await this.terminalService.createDetachedTerminal({
      rows: 10,
      cols: 80,
      readonly: true,
      capabilities,
      processInfo: new DetachedProcessInfo({ initialCwd: cwd.value }),
      colorProvider: {
        getBackgroundColor: /* @__PURE__ */ __name((theme) => {
          const terminalBackground = theme.getColor(TERMINAL_BACKGROUND_COLOR);
          if (terminalBackground) {
            return terminalBackground;
          }
          if (this.isInPeekView) {
            return theme.getColor(peekViewResultsBackground);
          }
          const location = this.viewDescriptorService.getViewLocationById(
            "workbench.panel.testResults.view"
            /* Testing.ResultsViewId */
          );
          return location === 1 ? theme.getColor(PANEL_BACKGROUND) : theme.getColor(SIDE_BAR_BACKGROUND);
        }, "getBackgroundColor")
      }
    });
  }
  async update(subject) {
    this.outputDataListener.clear();
    if (subject instanceof TaskSubject) {
      await this.updateForTaskSubject(subject);
    } else if (subject instanceof TestOutputSubject || subject instanceof MessageSubject && subject.message.type === 1) {
      await this.updateForTestSubject(subject);
    } else {
      this.clear();
      return false;
    }
    return true;
  }
  async updateForTestSubject(subject) {
    const that = this;
    const testItem = subject instanceof TestOutputSubject ? subject.test.item : subject.test;
    const terminal = await this.updateGenerically({
      subject,
      noOutputMessage: localize("caseNoOutput", "The test case did not report any output."),
      getTarget: /* @__PURE__ */ __name((result) => result?.tasks[subject.taskIndex].output, "getTarget"),
      *doInitialWrite(output, results) {
        that.updateCwd(testItem.uri);
        const state = subject instanceof TestOutputSubject ? subject.test : results.getStateById(testItem.extId);
        if (!state) {
          return;
        }
        for (const message of state.tasks[subject.taskIndex].messages) {
          if (message.type === 1) {
            yield* output.getRangeIter(message.offset, message.length);
          }
        }
      },
      doListenForMoreData: /* @__PURE__ */ __name((output, result, write) => result.onChange((e) => {
        if (e.reason === 2 && e.item.item.extId === testItem.extId && e.message.type === 1) {
          for (const chunk of output.getRangeIter(e.message.offset, e.message.length)) {
            write(chunk.buffer);
          }
        }
      }), "doListenForMoreData")
    });
    if (subject instanceof MessageSubject && subject.message.type === 1 && subject.message.marker !== void 0) {
      terminal?.xterm.selectMarkedRange(
        getMarkId(subject.message.marker, true),
        getMarkId(subject.message.marker, false),
        /* scrollIntoView= */
        true
      );
    }
  }
  updateForTaskSubject(subject) {
    return this.updateGenerically({
      subject,
      noOutputMessage: localize("runNoOutput", "The test run did not record any output."),
      getTarget: /* @__PURE__ */ __name((result) => result?.tasks[subject.taskIndex], "getTarget"),
      doInitialWrite: /* @__PURE__ */ __name((task, result) => {
        this.updateCwd(Iterable.find(result.tests, (t) => !!t.item.uri)?.item.uri);
        return task.output.buffers;
      }, "doInitialWrite"),
      doListenForMoreData: /* @__PURE__ */ __name((task, _result, write) => task.output.onDidWriteData((e) => write(e.buffer)), "doListenForMoreData")
    });
  }
  async updateGenerically(opts) {
    const result = opts.subject.result;
    const target = opts.getTarget(result);
    if (!target) {
      return this.clear();
    }
    const terminal = await this.makeTerminal();
    let didWriteData = false;
    const pendingWrites = new MutableObservableValue(0);
    if (result instanceof LiveTestResult) {
      for (const chunk of opts.doInitialWrite(target, result)) {
        didWriteData ||= chunk.byteLength > 0;
        pendingWrites.value++;
        terminal.xterm.write(chunk.buffer, () => pendingWrites.value--);
      }
    } else {
      didWriteData = true;
      this.writeNotice(terminal, localize("runNoOutputForPast", "Test output is only available for new test runs."));
    }
    this.attachTerminalToDom(terminal);
    this.outputDataListener.clear();
    if (result instanceof LiveTestResult && !result.completedAt) {
      const l1 = result.onComplete(() => {
        if (!didWriteData) {
          this.writeNotice(terminal, opts.noOutputMessage);
        }
      });
      const l2 = opts.doListenForMoreData(target, result, (data) => {
        terminal.xterm.write(data);
        didWriteData ||= data.byteLength > 0;
      });
      this.outputDataListener.value = combinedDisposable(l1, l2);
    }
    if (!this.outputDataListener.value && !didWriteData) {
      this.writeNotice(terminal, opts.noOutputMessage);
    }
    if (pendingWrites.value > 0) {
      await new Promise((resolve) => {
        const l = pendingWrites.onDidChange(() => {
          if (pendingWrites.value === 0) {
            l.dispose();
            resolve();
          }
        });
      });
    }
    return terminal;
  }
  updateCwd(testUri) {
    const wf = testUri && this.workspaceContext.getWorkspaceFolder(testUri) || this.workspaceContext.getWorkspace().folders[0];
    if (wf) {
      this.terminalCwd.value = wf.uri.fsPath;
    }
  }
  writeNotice(terminal, str) {
    terminal.xterm.write(formatMessageForTerminal(str));
  }
  attachTerminalToDom(terminal) {
    terminal.xterm.write("\x1B[?25l");
    dom.scheduleAtNextAnimationFrame(dom.getWindow(this.container), () => this.layoutTerminal(terminal));
    terminal.attachToElement(this.container, { enableGpu: false });
  }
  clear() {
    this.outputDataListener.clear();
    this.xtermLayoutDelayer.cancel();
    this.terminal.clear();
  }
  layout(dimensions) {
    this.dimensions = dimensions;
    if (this.terminal.value) {
      this.layoutTerminal(this.terminal.value, dimensions.width, dimensions.height);
      return dimensions.height;
    }
    return void 0;
  }
  layoutTerminal({ xterm }, width = this.dimensions?.width ?? this.container.clientWidth, height = this.dimensions?.height ?? this.container.clientHeight) {
    width -= 10 + 20;
    this.xtermLayoutDelayer.trigger(() => {
      const scaled = getXtermScaledDimensions(dom.getWindow(this.container), xterm.getFont(), width, height);
      if (scaled) {
        xterm.resize(scaled.cols, scaled.rows);
      }
    });
  }
};
TerminalMessagePeek = __decorate([
  __param(2, ITerminalService),
  __param(3, IViewDescriptorService),
  __param(4, IWorkspaceContextService)
], TerminalMessagePeek);
const isMultiline = /* @__PURE__ */ __name((str) => !!str && str.includes("\n"), "isMultiline");
export {
  DiffContentProvider,
  MarkdownTestMessagePeek,
  PlainTextMessagePeek,
  TerminalMessagePeek
};
//# sourceMappingURL=testResultsOutput.js.map
