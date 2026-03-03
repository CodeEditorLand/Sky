var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Action } from "../../../../../base/common/actions.js";
import { Emitter } from "../../../../../base/common/event.js";
import { IUpdateService, State } from "../../../../../platform/update/common/update.js";
import { createEditorServices, defineComponentFixture, defineThemedFixtureGroup } from "../../../../../workbench/test/browser/componentFixtures/fixtureUtils.js";
import { UpdateWidget } from "../../browser/account.contribution.js";
import "../../../../common/theme.js";
import "../../../../../platform/theme/common/colors/inputColors.js";
import "../../../../browser/media/sidebarActionButton.css";
import "../../browser/media/accountWidget.css";
const mockUpdate = { version: "1.0.0" };
function createMockUpdateService(state) {
  const onStateChange = new Emitter();
  const service = {
    _serviceBrand: void 0,
    state,
    onStateChange: onStateChange.event,
    checkForUpdates: /* @__PURE__ */ __name(async () => {
    }, "checkForUpdates"),
    downloadUpdate: /* @__PURE__ */ __name(async () => {
    }, "downloadUpdate"),
    applyUpdate: /* @__PURE__ */ __name(async () => {
    }, "applyUpdate"),
    quitAndInstall: /* @__PURE__ */ __name(async () => {
    }, "quitAndInstall"),
    isLatestVersion: /* @__PURE__ */ __name(async () => true, "isLatestVersion"),
    _applySpecificUpdate: /* @__PURE__ */ __name(async () => {
    }, "_applySpecificUpdate"),
    setInternalOrg: /* @__PURE__ */ __name(async () => {
    }, "setInternalOrg")
  };
  return service;
}
__name(createMockUpdateService, "createMockUpdateService");
function renderUpdateWidget(ctx, state) {
  ctx.container.style.padding = "16px";
  ctx.container.style.width = "300px";
  ctx.container.style.backgroundColor = "var(--vscode-sideBar-background)";
  const mockService = createMockUpdateService(state);
  const instantiationService = createEditorServices(ctx.disposableStore, {
    colorTheme: ctx.theme,
    additionalServices: /* @__PURE__ */ __name((reg) => {
      reg.defineInstance(IUpdateService, mockService);
    }, "additionalServices")
  });
  const action = ctx.disposableStore.add(new Action("sessions.action.updateWidget", "Sessions Update"));
  const widget = instantiationService.createInstance(UpdateWidget, action, {});
  ctx.disposableStore.add(widget);
  widget.render(ctx.container);
}
__name(renderUpdateWidget, "renderUpdateWidget");
var updateWidget_fixture_default = defineThemedFixtureGroup({
  Ready: defineComponentFixture({
    render: /* @__PURE__ */ __name((ctx) => renderUpdateWidget(ctx, State.Ready(mockUpdate, true, false)), "render")
  }),
  CheckingForUpdates: defineComponentFixture({
    render: /* @__PURE__ */ __name((ctx) => renderUpdateWidget(ctx, State.CheckingForUpdates(true)), "render")
  }),
  AvailableForDownload: defineComponentFixture({
    render: /* @__PURE__ */ __name((ctx) => renderUpdateWidget(ctx, State.AvailableForDownload(mockUpdate)), "render")
  }),
  Downloading0Percent: defineComponentFixture({
    render: /* @__PURE__ */ __name((ctx) => renderUpdateWidget(ctx, State.Downloading(mockUpdate, true, false, 0, 1e8)), "render")
  }),
  Downloading30Percent: defineComponentFixture({
    render: /* @__PURE__ */ __name((ctx) => renderUpdateWidget(ctx, State.Downloading(mockUpdate, true, false, 3e7, 1e8)), "render")
  }),
  Downloading65Percent: defineComponentFixture({
    render: /* @__PURE__ */ __name((ctx) => renderUpdateWidget(ctx, State.Downloading(mockUpdate, true, false, 65e6, 1e8)), "render")
  }),
  Downloading100Percent: defineComponentFixture({
    render: /* @__PURE__ */ __name((ctx) => renderUpdateWidget(ctx, State.Downloading(mockUpdate, true, false, 1e8, 1e8)), "render")
  }),
  DownloadingIndeterminate: defineComponentFixture({
    render: /* @__PURE__ */ __name((ctx) => renderUpdateWidget(ctx, State.Downloading(mockUpdate, true, false)), "render")
  }),
  Downloaded: defineComponentFixture({
    render: /* @__PURE__ */ __name((ctx) => renderUpdateWidget(ctx, State.Downloaded(mockUpdate, true, false)), "render")
  }),
  Updating: defineComponentFixture({
    render: /* @__PURE__ */ __name((ctx) => renderUpdateWidget(ctx, State.Updating(mockUpdate)), "render")
  }),
  Overwriting: defineComponentFixture({
    render: /* @__PURE__ */ __name((ctx) => renderUpdateWidget(ctx, State.Overwriting(mockUpdate, true)), "render")
  })
});
export {
  updateWidget_fixture_default as default
};
//# sourceMappingURL=updateWidget.fixture.js.map
