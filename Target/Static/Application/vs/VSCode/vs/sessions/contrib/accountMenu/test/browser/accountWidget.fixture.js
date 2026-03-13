var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Action } from "../../../../../base/common/actions.js";
import { Emitter } from "../../../../../base/common/event.js";
import { IMenuService } from "../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { State } from "../../../../../platform/update/common/update.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IHostService } from "../../../../../workbench/services/host/browser/host.js";
import { createEditorServices, defineComponentFixture, defineThemedFixtureGroup, registerWorkbenchServices } from "../../../../../workbench/test/browser/componentFixtures/fixtureUtils.js";
import { AccountWidget } from "../../browser/account.contribution.js";
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
function createMockDefaultAccountService(accountPromise) {
  const onDidChangeDefaultAccount = new Emitter();
  const onDidChangePolicyData = new Emitter();
  const onDidChangeCopilotTokenInfo = new Emitter();
  const service = {
    _serviceBrand: void 0,
    onDidChangeDefaultAccount: onDidChangeDefaultAccount.event,
    onDidChangePolicyData: onDidChangePolicyData.event,
    onDidChangeCopilotTokenInfo: onDidChangeCopilotTokenInfo.event,
    policyData: null,
    copilotTokenInfo: null,
    getDefaultAccount: /* @__PURE__ */ __name(() => accountPromise, "getDefaultAccount"),
    getDefaultAccountAuthenticationProvider: /* @__PURE__ */ __name(() => ({ id: "github", name: "GitHub", enterprise: false }), "getDefaultAccountAuthenticationProvider"),
    setDefaultAccountProvider: /* @__PURE__ */ __name(() => {
    }, "setDefaultAccountProvider"),
    refresh: /* @__PURE__ */ __name(() => accountPromise, "refresh"),
    signIn: /* @__PURE__ */ __name(async () => null, "signIn"),
    signOut: /* @__PURE__ */ __name(async () => {
    }, "signOut")
  };
  return service;
}
__name(createMockDefaultAccountService, "createMockDefaultAccountService");
function renderAccountWidget(ctx, state, accountPromise) {
  ctx.container.style.padding = "16px";
  ctx.container.style.width = "340px";
  ctx.container.style.backgroundColor = "var(--vscode-sideBar-background)";
  const mockUpdateService = createMockUpdateService(state);
  const mockAccountService = createMockDefaultAccountService(accountPromise);
  const instantiationService = createEditorServices(ctx.disposableStore, {
    colorTheme: ctx.theme,
    additionalServices: registerWorkbenchServices
  });
  const action = ctx.disposableStore.add(new Action("sessions.action.accountWidget", "Sessions Account"));
  const contextMenuService = instantiationService.get(IContextMenuService);
  const menuService = instantiationService.get(IMenuService);
  const contextKeyService = instantiationService.get(IContextKeyService);
  const hoverService = instantiationService.get(IHoverService);
  const productService = instantiationService.get(IProductService);
  const openerService = instantiationService.get(IOpenerService);
  const dialogService = instantiationService.get(IDialogService);
  const hostService = instantiationService.get(IHostService);
  const widget = new AccountWidget(action, {}, mockAccountService, mockUpdateService, contextMenuService, menuService, contextKeyService, hoverService, productService, openerService, dialogService, hostService);
  ctx.disposableStore.add(widget);
  widget.render(ctx.container);
}
__name(renderAccountWidget, "renderAccountWidget");
const signedInAccount = {
  authenticationProvider: {
    id: "github",
    name: "GitHub",
    enterprise: false
  },
  accountName: "avery.long.account.name@example.com",
  sessionId: "session-id",
  enterprise: false
};
var accountWidget_fixture_default = defineThemedFixtureGroup({ path: "sessions/" }, {
  LoadingSignedOutNoUpdate: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderAccountWidget(ctx, State.Idle(
      0
      /* UpdateType.Setup */
    ), new Promise(() => {
    })), "render")
  }),
  SignedOutNoUpdate: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderAccountWidget(ctx, State.Idle(
      0
      /* UpdateType.Setup */
    ), Promise.resolve(null)), "render")
  }),
  SignedInNoUpdate: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderAccountWidget(ctx, State.Idle(
      0
      /* UpdateType.Setup */
    ), Promise.resolve(signedInAccount)), "render")
  }),
  CheckingForUpdatesHidden: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderAccountWidget(ctx, State.CheckingForUpdates(true), Promise.resolve(signedInAccount)), "render")
  }),
  Ready: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderAccountWidget(ctx, State.Ready(mockUpdate, true, false), Promise.resolve(signedInAccount)), "render")
  }),
  AvailableForDownload: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderAccountWidget(ctx, State.AvailableForDownload(mockUpdate), Promise.resolve(signedInAccount)), "render")
  }),
  Downloading30Percent: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderAccountWidget(ctx, State.Downloading(mockUpdate, true, false, 3e7, 1e8), Promise.resolve(signedInAccount)), "render")
  }),
  DownloadedInstalling: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderAccountWidget(ctx, State.Downloaded(mockUpdate, true, false), Promise.resolve(signedInAccount)), "render")
  }),
  Updating: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderAccountWidget(ctx, State.Updating(mockUpdate), Promise.resolve(signedInAccount)), "render")
  }),
  Overwriting: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderAccountWidget(ctx, State.Overwriting(mockUpdate, true), Promise.resolve(signedInAccount)), "render")
  })
});
export {
  accountWidget_fixture_default as default
};
//# sourceMappingURL=accountWidget.fixture.js.map
