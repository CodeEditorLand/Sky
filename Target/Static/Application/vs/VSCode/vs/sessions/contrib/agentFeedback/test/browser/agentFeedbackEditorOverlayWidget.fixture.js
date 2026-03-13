var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { toAction } from "../../../../../base/common/actions.js";
import { Event } from "../../../../../base/common/event.js";
import { IMenuService } from "../../../../../platform/actions/common/actions.js";
import { createEditorServices, defineComponentFixture, defineThemedFixtureGroup, registerWorkbenchServices } from "../../../../../workbench/test/browser/componentFixtures/fixtureUtils.js";
import { AgentFeedbackOverlayWidget } from "../../browser/agentFeedbackEditorOverlay.js";
import { clearAllFeedbackActionId, navigateNextFeedbackActionId, navigatePreviousFeedbackActionId, navigationBearingFakeActionId, submitFeedbackActionId } from "../../browser/agentFeedbackEditorActions.js";
class FixtureMenuService {
  static {
    __name(this, "FixtureMenuService");
  }
  constructor(_hasAgentFeedbackActions) {
    this._hasAgentFeedbackActions = _hasAgentFeedbackActions;
  }
  createMenu(_id) {
    const navigateActions = [
      toAction({ id: navigationBearingFakeActionId, label: "Navigation Status", run: /* @__PURE__ */ __name(() => {
      }, "run") }),
      toAction({ id: navigatePreviousFeedbackActionId, label: "Previous", class: "codicon codicon-arrow-up", run: /* @__PURE__ */ __name(() => {
      }, "run") }),
      toAction({ id: navigateNextFeedbackActionId, label: "Next", class: "codicon codicon-arrow-down", run: /* @__PURE__ */ __name(() => {
      }, "run") })
    ];
    const submitActions = this._hasAgentFeedbackActions ? [
      toAction({ id: submitFeedbackActionId, label: "Submit", class: "codicon codicon-send", run: /* @__PURE__ */ __name(() => {
      }, "run") }),
      toAction({ id: clearAllFeedbackActionId, label: "Clear", class: "codicon codicon-clear-all", run: /* @__PURE__ */ __name(() => {
      }, "run") })
    ] : [];
    return {
      onDidChange: Event.None,
      dispose: /* @__PURE__ */ __name(() => {
      }, "dispose"),
      getActions: /* @__PURE__ */ __name(() => submitActions.length > 0 ? [
        ["navigate", navigateActions],
        ["a_submit", submitActions]
      ] : [
        ["navigate", navigateActions]
      ], "getActions")
    };
  }
  getMenuActions(_id, _contextKeyService, _options) {
    return [];
  }
  getMenuContexts() {
    return /* @__PURE__ */ new Set();
  }
  resetHiddenStates() {
  }
}
function renderWidget(context, options) {
  const scopedDisposables = context.disposableStore.add(new DisposableStore());
  context.container.classList.add("monaco-workbench");
  context.container.style.width = "420px";
  context.container.style.height = "64px";
  context.container.style.padding = "12px";
  context.container.style.background = "var(--vscode-editor-background)";
  const instantiationService = createEditorServices(scopedDisposables, {
    colorTheme: context.theme,
    additionalServices: /* @__PURE__ */ __name((reg) => {
      reg.defineInstance(IMenuService, new FixtureMenuService(options.hasAgentFeedbackActions ?? true));
      registerWorkbenchServices(reg);
    }, "additionalServices")
  });
  const widget = scopedDisposables.add(instantiationService.createInstance(AgentFeedbackOverlayWidget));
  widget.show(options.navigationBearings);
  context.container.appendChild(widget.getDomNode());
}
__name(renderWidget, "renderWidget");
var agentFeedbackEditorOverlayWidget_fixture_default = defineThemedFixtureGroup({ path: "sessions/agentFeedback/" }, {
  ZeroOfZero: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      navigationBearings: { activeIdx: -1, totalCount: 0 },
      hasAgentFeedbackActions: false
    }), "render")
  }),
  SingleFeedback: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      navigationBearings: { activeIdx: 0, totalCount: 1 }
    }), "render")
  }),
  FirstOfThree: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      navigationBearings: { activeIdx: -1, totalCount: 3 }
    }), "render")
  }),
  ReviewOnlyTwoComments: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      navigationBearings: { activeIdx: 0, totalCount: 2 },
      hasAgentFeedbackActions: false
    }), "render")
  }),
  MiddleOfThree: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      navigationBearings: { activeIdx: 1, totalCount: 3 }
    }), "render")
  }),
  MixedFourComments: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      navigationBearings: { activeIdx: 2, totalCount: 4 },
      hasAgentFeedbackActions: true
    }), "render")
  }),
  LastOfThree: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((context) => renderWidget(context, {
      navigationBearings: { activeIdx: 2, totalCount: 3 }
    }), "render")
  })
});
export {
  agentFeedbackEditorOverlayWidget_fixture_default as default
};
//# sourceMappingURL=agentFeedbackEditorOverlayWidget.fixture.js.map
