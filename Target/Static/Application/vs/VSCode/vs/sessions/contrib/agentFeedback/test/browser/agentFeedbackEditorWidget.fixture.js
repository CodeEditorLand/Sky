var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../../base/common/event.js";
import { Color } from "../../../../../base/common/color.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { IMarkdownRendererService, MarkdownRendererService } from "../../../../../platform/markdown/browser/markdownRenderer.js";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { CodeEditorWidget } from "../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { TokenizationRegistry } from "../../../../../editor/common/languages.js";
import { IAgentFeedbackService } from "../../browser/agentFeedbackService.js";
import { AgentFeedbackEditorWidget } from "../../browser/agentFeedbackEditorWidgetContribution.js";
import { createEditorServices, createTextModel, defineComponentFixture, defineThemedFixtureGroup } from "../../../../../workbench/test/browser/componentFixtures/fixtureUtils.js";
import { ICodeReviewService } from "../../../codeReview/browser/codeReviewService.js";
const sessionResource = URI.parse("vscode-agent-session://fixture/session-1");
const fileResource = URI.parse("inmemory://model/agent-feedback-widget.ts");
const sampleCode = [
  "function alpha() {",
  "	const first = 1;",
  "	return first;",
  "}",
  "",
  "function beta() {",
  "	const second = 2;",
  "	const third = second + 1;",
  "	return third;",
  "}",
  "",
  "function gamma() {",
  "	const done = true;",
  "	return done;",
  "}"
].join("\n");
function createRange(startLineNumber, endLineNumber = startLineNumber) {
  return {
    startLineNumber,
    startColumn: 1,
    endLineNumber,
    endColumn: 1
  };
}
__name(createRange, "createRange");
function createFeedbackComment(id, text, startLineNumber, endLineNumber = startLineNumber, suggestion) {
  return {
    id: `agentFeedback:${id}`,
    sourceId: id,
    source: "agentFeedback",
    sessionResource,
    resourceUri: fileResource,
    range: createRange(startLineNumber, endLineNumber),
    text,
    suggestion,
    canConvertToAgentFeedback: false
  };
}
__name(createFeedbackComment, "createFeedbackComment");
function createReviewComment(id, text, startLineNumber, endLineNumber = startLineNumber, suggestion) {
  const range = {
    startLineNumber,
    startColumn: 1,
    endLineNumber,
    endColumn: 1
  };
  return {
    id: `codeReview:${id}`,
    sourceId: id,
    source: "codeReview",
    text,
    resourceUri: fileResource,
    range,
    sessionResource,
    suggestion,
    severity: "warning",
    canConvertToAgentFeedback: true
  };
}
__name(createReviewComment, "createReviewComment");
function createPRReviewComment(id, text, startLineNumber, endLineNumber = startLineNumber) {
  return {
    id: `prReview:${id}`,
    sourceId: id,
    source: "prReview",
    text,
    resourceUri: fileResource,
    range: createRange(startLineNumber, endLineNumber),
    sessionResource,
    canConvertToAgentFeedback: true
  };
}
__name(createPRReviewComment, "createPRReviewComment");
function createMockAgentFeedbackService() {
  return new class extends mock() {
    constructor() {
      super(...arguments);
      this.onDidChangeFeedback = Event.None;
      this.onDidChangeNavigation = Event.None;
    }
    addFeedback() {
      throw new Error("Not implemented for fixture");
    }
    removeFeedback() {
    }
    getFeedback() {
      return [];
    }
    getMostRecentSessionForResource() {
      return void 0;
    }
    async revealFeedback() {
    }
    getNextFeedback() {
      return void 0;
    }
    getNavigationBearing() {
      return { activeIdx: -1, totalCount: 0 };
    }
    getNextNavigableItem() {
      return void 0;
    }
    setNavigationAnchor() {
    }
    clearFeedback() {
    }
    async addFeedbackAndSubmit() {
    }
  }();
}
__name(createMockAgentFeedbackService, "createMockAgentFeedbackService");
function createMockCodeReviewService() {
  return new class extends mock() {
    constructor() {
      super(...arguments);
      this._state = observableValue("fixture.reviewState", {
        kind: "idle"
        /* CodeReviewStateKind.Idle */
      });
      this._prState = observableValue("fixture.prReviewState", {
        kind: "none"
        /* PRReviewStateKind.None */
      });
    }
    getReviewState() {
      return this._state;
    }
    hasReview() {
      return false;
    }
    requestReview() {
    }
    removeComment() {
    }
    dismissReview() {
    }
    getPRReviewState() {
      return this._prState;
    }
    async resolvePRReviewThread() {
    }
  }();
}
__name(createMockCodeReviewService, "createMockCodeReviewService");
function ensureTokenColorMap() {
  if (TokenizationRegistry.getColorMap()?.length) {
    return;
  }
  const colorMap = [
    Color.fromHex("#000000"),
    Color.fromHex("#d4d4d4"),
    Color.fromHex("#9cdcfe"),
    Color.fromHex("#ce9178"),
    Color.fromHex("#b5cea8"),
    Color.fromHex("#4fc1ff"),
    Color.fromHex("#c586c0"),
    Color.fromHex("#569cd6"),
    Color.fromHex("#dcdcaa"),
    Color.fromHex("#f44747")
  ];
  TokenizationRegistry.setColorMap(colorMap);
}
__name(ensureTokenColorMap, "ensureTokenColorMap");
function renderWidget(context, options) {
  const scopedDisposables = context.disposableStore.add(new DisposableStore());
  context.container.style.width = "760px";
  context.container.style.height = "420px";
  context.container.style.border = "1px solid var(--vscode-editorWidget-border)";
  context.container.style.background = "var(--vscode-editor-background)";
  ensureTokenColorMap();
  const agentFeedbackService = createMockAgentFeedbackService();
  const codeReviewService = createMockCodeReviewService();
  const instantiationService = createEditorServices(scopedDisposables, {
    colorTheme: context.theme,
    additionalServices: /* @__PURE__ */ __name((reg) => {
      reg.defineInstance(IAgentFeedbackService, agentFeedbackService);
      reg.defineInstance(ICodeReviewService, codeReviewService);
      reg.define(IMarkdownRendererService, MarkdownRendererService);
    }, "additionalServices")
  });
  const model = scopedDisposables.add(createTextModel(instantiationService, sampleCode, fileResource, "typescript"));
  const editorOptions = {
    contributions: []
  };
  const editor = scopedDisposables.add(instantiationService.createInstance(CodeEditorWidget, context.container, {
    automaticLayout: true,
    lineNumbers: "on",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 13,
    lineHeight: 20
  }, editorOptions));
  editor.setModel(model);
  const widget = scopedDisposables.add(instantiationService.createInstance(AgentFeedbackEditorWidget, editor, options.commentItems, sessionResource));
  widget.layout(options.commentItems[0].range.startLineNumber);
  if (options.expanded) {
    widget.expand();
  }
  if (options.focusedCommentId) {
    widget.focusFeedback(options.focusedCommentId);
  }
  if (options.hidden) {
    const domNode = widget.getDomNode();
    domNode.style.transition = "none";
    domNode.style.animation = "none";
    widget.toggle(false);
  }
}
__name(renderWidget, "renderWidget");
const singleFeedback = [
  createFeedbackComment("f-1", "Prefer a clearer variable name on this line.", 2)
];
const groupedFeedback = [
  createFeedbackComment("f-1", "Prefer a clearer variable name on this line.", 2),
  createFeedbackComment("f-2", "This return statement can be simplified.", 3),
  createFeedbackComment("f-3", "Consider documenting why this branch is needed.", 6, 8)
];
const reviewOnly = [
  createReviewComment("r-1", "Handle the null case before returning here.", 7),
  createReviewComment("r-2", "This branch needs a stronger explanation.", 8)
];
const mixedComments = [
  createFeedbackComment("f-1", "Prefer a clearer variable name on this line.", 2),
  createReviewComment("r-1", "This should be extracted into a helper.", 3),
  createFeedbackComment("f-2", "Consider renaming this for readability.", 4)
];
const reviewSuggestion = {
  edits: [
    { range: createRange(8), oldText: "	const third = second + 1;", newText: "	const third = second + computeOffset();" }
  ]
};
const suggestionMix = [
  createReviewComment("r-3", "Prefer using the helper so the intent is explicit.", 8, 8, reviewSuggestion),
  createFeedbackComment("f-3", "Keep the helper name aligned with the domain concept.", 9)
];
const prReviewOnly = [
  createPRReviewComment("pr-1", "This variable should be renamed to match our naming conventions.", 2),
  createPRReviewComment("pr-2", "Please add error handling for the edge case when second is zero.", 7, 8)
];
const allSourcesMixed = [
  createFeedbackComment("f-1", "Prefer a clearer variable name on this line.", 2),
  createPRReviewComment("pr-1", "Our style guide says to use descriptive names here.", 3),
  createReviewComment("r-1", "This should be extracted into a helper.", 6),
  createPRReviewComment("pr-2", "This logic duplicates what we have in utils.ts \u2014 consider reusing.", 8, 9)
];
var agentFeedbackEditorWidget_fixture_default = defineThemedFixtureGroup({ path: "sessions/agentFeedback/" }, {
  CollapsedSingleComment: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: singleFeedback
    }), "render")
  }),
  ExpandedSingleComment: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: singleFeedback,
      expanded: true
    }), "render")
  }),
  CollapsedMultiComment: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: groupedFeedback
    }), "render")
  }),
  ExpandedMultiComment: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: groupedFeedback,
      expanded: true
    }), "render")
  }),
  ExpandedFocusedFeedback: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: groupedFeedback,
      expanded: true,
      focusedCommentId: "agentFeedback:f-2"
    }), "render")
  }),
  ExpandedReviewOnly: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: reviewOnly,
      expanded: true
    }), "render")
  }),
  ExpandedMixedComments: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: mixedComments,
      expanded: true
    }), "render")
  }),
  ExpandedFocusedReviewComment: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: mixedComments,
      expanded: true,
      focusedCommentId: "codeReview:r-1"
    }), "render")
  }),
  ExpandedReviewSuggestion: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: suggestionMix,
      expanded: true
    }), "render")
  }),
  ExpandedPRReviewOnly: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: prReviewOnly,
      expanded: true
    }), "render")
  }),
  ExpandedAllSourcesMixed: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: allSourcesMixed,
      expanded: true
    }), "render")
  }),
  ExpandedFocusedPRReview: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: allSourcesMixed,
      expanded: true,
      focusedCommentId: "prReview:pr-2"
    }), "render")
  }),
  HiddenWidget: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      commentItems: mixedComments,
      hidden: true
    }), "render")
  })
});
export {
  agentFeedbackEditorWidget_fixture_default as default
};
//# sourceMappingURL=agentFeedbackEditorWidget.fixture.js.map
