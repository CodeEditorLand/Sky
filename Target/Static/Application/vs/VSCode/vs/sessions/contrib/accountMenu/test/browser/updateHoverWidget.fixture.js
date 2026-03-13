var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../base/common/event.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { State } from "../../../../../platform/update/common/update.js";
import { createEditorServices, defineComponentFixture, defineThemedFixtureGroup } from "../../../../../workbench/test/browser/componentFixtures/fixtureUtils.js";
import { UpdateHoverWidget } from "../../browser/updateHoverWidget.js";
const mockUpdate = { version: "a1b2c3d4e5f6", productVersion: "1.100.0", timestamp: Date.now() - 2 * 60 * 60 * 1e3 };
const mockUpdateSameVersion = { version: "a1b2c3d4e5f6", productVersion: "1.99.0", timestamp: Date.now() - 3 * 24 * 60 * 60 * 1e3 };
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
function renderHoverWidget(ctx, state) {
  ctx.container.style.backgroundColor = "var(--vscode-editorHoverWidget-background)";
  const instantiationService = createEditorServices(ctx.disposableStore, {
    colorTheme: ctx.theme
  });
  const updateService = createMockUpdateService(state);
  const productService = new class extends mock() {
    constructor() {
      super(...arguments);
      this.version = "1.99.0";
      this.nameShort = "VS Code Insiders";
      this.commit = "f0e1d2c3b4a5";
      this.date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString();
    }
  }();
  const hoverService = instantiationService.get(IHoverService);
  const widget = new UpdateHoverWidget(updateService, productService, hoverService);
  ctx.container.appendChild(widget.createHoverContent(state));
}
__name(renderHoverWidget, "renderHoverWidget");
var updateHoverWidget_fixture_default = defineThemedFixtureGroup({ path: "sessions/" }, {
  UpdateHoverReady: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderHoverWidget(ctx, State.Ready(mockUpdate, true, false)), "render")
  }),
  UpdateHoverAvailableForDownload: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderHoverWidget(ctx, State.AvailableForDownload(mockUpdate)), "render")
  }),
  UpdateHoverDownloading30Percent: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderHoverWidget(ctx, State.Downloading(mockUpdate, true, false, 3e7, 1e8)), "render")
  }),
  UpdateHoverInstalling: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderHoverWidget(ctx, State.Downloaded(mockUpdate, true, false)), "render")
  }),
  UpdateHoverUpdating: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderHoverWidget(ctx, State.Updating(mockUpdate, 40, 100)), "render")
  }),
  UpdateHoverSameVersion: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderHoverWidget(ctx, State.Ready(mockUpdateSameVersion, true, false)), "render")
  })
});
export {
  updateHoverWidget_fixture_default as default
};
//# sourceMappingURL=updateHoverWidget.fixture.js.map
