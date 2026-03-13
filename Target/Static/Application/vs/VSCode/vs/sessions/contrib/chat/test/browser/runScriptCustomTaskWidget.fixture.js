var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { defineComponentFixture, defineThemedFixtureGroup } from "../../../../../workbench/test/browser/componentFixtures/fixtureUtils.js";
import { RunScriptCustomTaskWidget, WORKTREE_CREATED_RUN_ON } from "../../browser/runScriptCustomTaskWidget.js";
import "../../../../common/theme.js";
import "../../../../../platform/theme/common/colors/inputColors.js";
const filledLabel = "Start Dev Server";
const filledCommand = "npm run dev";
const workspaceUnavailableReason = "Workspace storage is unavailable for this session";
function renderWidget(ctx, state) {
  ctx.container.style.width = "600px";
  ctx.container.style.padding = "0";
  ctx.container.style.borderRadius = "var(--vscode-cornerRadius-xLarge)";
  ctx.container.style.backgroundColor = "var(--vscode-quickInput-background)";
  ctx.container.style.overflow = "hidden";
  const widget = ctx.disposableStore.add(new RunScriptCustomTaskWidget(state));
  ctx.container.appendChild(widget.domNode);
}
__name(renderWidget, "renderWidget");
function defineFixture(state) {
  return defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderWidget(ctx, state), "render")
  });
}
__name(defineFixture, "defineFixture");
var runScriptCustomTaskWidget_fixture_default = defineThemedFixtureGroup({ path: "sessions/" }, {
  WorkspaceSelectedEmpty: defineFixture({
    target: "workspace"
  }),
  WorkspaceSelectedCheckedEmpty: defineFixture({
    target: "workspace",
    runOn: WORKTREE_CREATED_RUN_ON
  }),
  WorkspaceSelectedFilled: defineFixture({
    label: filledLabel,
    target: "workspace",
    command: filledCommand
  }),
  WorkspaceSelectedCheckedFilled: defineFixture({
    label: filledLabel,
    target: "workspace",
    command: filledCommand,
    runOn: WORKTREE_CREATED_RUN_ON
  }),
  UserSelectedEmpty: defineFixture({
    target: "user"
  }),
  UserSelectedCheckedEmpty: defineFixture({
    target: "user",
    runOn: WORKTREE_CREATED_RUN_ON
  }),
  UserSelectedFilled: defineFixture({
    label: filledLabel,
    target: "user",
    command: filledCommand
  }),
  UserSelectedCheckedFilled: defineFixture({
    label: filledLabel,
    target: "user",
    command: filledCommand,
    runOn: WORKTREE_CREATED_RUN_ON
  }),
  WorkspaceUnavailableEmpty: defineFixture({
    target: "user",
    targetDisabledReason: workspaceUnavailableReason
  }),
  WorkspaceUnavailableCheckedEmpty: defineFixture({
    target: "user",
    targetDisabledReason: workspaceUnavailableReason,
    runOn: WORKTREE_CREATED_RUN_ON
  }),
  WorkspaceUnavailableFilled: defineFixture({
    label: filledLabel,
    target: "user",
    command: filledCommand,
    targetDisabledReason: workspaceUnavailableReason
  }),
  WorkspaceUnavailableCheckedFilled: defineFixture({
    label: filledLabel,
    target: "user",
    command: filledCommand,
    targetDisabledReason: workspaceUnavailableReason,
    runOn: WORKTREE_CREATED_RUN_ON
  }),
  ExistingWorkspaceTaskLocked: defineFixture({
    label: filledLabel,
    labelDisabledReason: "This name comes from an existing task and cannot be changed here.",
    command: filledCommand,
    commandDisabledReason: "This command comes from an existing task and cannot be changed here.",
    target: "workspace",
    targetDisabledReason: "This existing task cannot be moved between workspace and user storage."
  }),
  ExistingUserTaskLockedChecked: defineFixture({
    label: filledLabel,
    labelDisabledReason: "This name comes from an existing task and cannot be changed here.",
    command: filledCommand,
    commandDisabledReason: "This command comes from an existing task and cannot be changed here.",
    target: "user",
    targetDisabledReason: "This existing task cannot be moved between workspace and user storage.",
    runOn: WORKTREE_CREATED_RUN_ON
  })
});
export {
  runScriptCustomTaskWidget_fixture_default as default
};
//# sourceMappingURL=runScriptCustomTaskWidget.fixture.js.map
