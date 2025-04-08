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
import { safeInnerHtml } from "../../../../base/browser/dom.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { isLinux, isWindows } from "../../../../base/common/platform.js";
import Severity from "../../../../base/common/severity.js";
import { localize } from "../../../../nls.js";
import { IMenuService, MenuId } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { ExtensionIdentifier, ExtensionIdentifierSet } from "../../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import product from "../../../../platform/product/common/product.js";
import { IRectangle } from "../../../../platform/window/common/window.js";
import { AuxiliaryWindowMode, IAuxiliaryWindowService } from "../../../services/auxiliaryWindow/browser/auxiliaryWindowService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IIssueFormService, IssueReporterData } from "../common/issue.js";
import BaseHtml from "./issueReporterPage.js";
import { IssueWebReporter } from "./issueReporterService.js";
import "./media/issueReporter.css";
let IssueFormService = class {
  constructor(instantiationService, auxiliaryWindowService, menuService, contextKeyService, logService, dialogService, hostService) {
    this.instantiationService = instantiationService;
    this.auxiliaryWindowService = auxiliaryWindowService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.logService = logService;
    this.dialogService = dialogService;
    this.hostService = hostService;
  }
  static {
    __name(this, "IssueFormService");
  }
  _serviceBrand;
  currentData;
  issueReporterWindow = null;
  extensionIdentifierSet = new ExtensionIdentifierSet();
  arch = "";
  release = "";
  type = "";
  async openReporter(data) {
    if (this.hasToReload(data)) {
      return;
    }
    await this.openAuxIssueReporter(data);
    if (this.issueReporterWindow) {
      const issueReporter = this.instantiationService.createInstance(IssueWebReporter, false, data, { type: this.type, arch: this.arch, release: this.release }, product, this.issueReporterWindow);
      issueReporter.render();
    }
  }
  async openAuxIssueReporter(data, bounds) {
    let issueReporterBounds = { width: 700, height: 800 };
    if (bounds && bounds.x && bounds.y) {
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      issueReporterBounds = { ...issueReporterBounds, x: centerX - 350, y: centerY - 400 };
    }
    const disposables = new DisposableStore();
    const auxiliaryWindow = disposables.add(await this.auxiliaryWindowService.open({ mode: AuxiliaryWindowMode.Normal, bounds: issueReporterBounds, nativeTitlebar: true, disableFullscreen: true }));
    const platformClass = isWindows ? "windows" : isLinux ? "linux" : "mac";
    if (auxiliaryWindow) {
      await auxiliaryWindow.whenStylesHaveLoaded;
      auxiliaryWindow.window.document.title = "Issue Reporter";
      auxiliaryWindow.window.document.body.classList.add("issue-reporter-body", "monaco-workbench", platformClass);
      const div = document.createElement("div");
      div.classList.add("monaco-workbench");
      auxiliaryWindow.container.remove();
      auxiliaryWindow.window.document.body.appendChild(div);
      safeInnerHtml(div, BaseHtml());
      this.issueReporterWindow = auxiliaryWindow.window;
    } else {
      console.error("Failed to open auxiliary window");
      disposables.dispose();
    }
    this.issueReporterWindow?.addEventListener("beforeunload", () => {
      auxiliaryWindow.window.close();
      disposables.dispose();
      this.issueReporterWindow = null;
    });
  }
  async sendReporterMenu(extensionId) {
    const menu = this.menuService.createMenu(MenuId.IssueReporter, this.contextKeyService);
    const actions = menu.getActions({ renderShortTitle: true }).flatMap((entry) => entry[1]);
    for (const action of actions) {
      try {
        if (action.item && "source" in action.item && action.item.source?.id.toLowerCase() === extensionId.toLowerCase()) {
          this.extensionIdentifierSet.add(extensionId.toLowerCase());
          await action.run();
        }
      } catch (error) {
        console.error(error);
      }
    }
    if (!this.extensionIdentifierSet.has(extensionId)) {
      return void 0;
    }
    this.extensionIdentifierSet.delete(new ExtensionIdentifier(extensionId));
    menu.dispose();
    const result = this.currentData;
    this.currentData = void 0;
    return result ?? void 0;
  }
  //#region used by issue reporter
  async closeReporter() {
    this.issueReporterWindow?.close();
  }
  async reloadWithExtensionsDisabled() {
    if (this.issueReporterWindow) {
      try {
        await this.hostService.reload({ disableExtensions: true });
      } catch (error) {
        this.logService.error(error);
      }
    }
  }
  async showConfirmCloseDialog() {
    await this.dialogService.prompt({
      type: Severity.Warning,
      message: localize("confirmCloseIssueReporter", "Your input will not be saved. Are you sure you want to close this window?"),
      buttons: [
        {
          label: localize({ key: "yes", comment: ["&& denotes a mnemonic"] }, "&&Yes"),
          run: /* @__PURE__ */ __name(() => {
            this.closeReporter();
            this.issueReporterWindow = null;
          }, "run")
        },
        {
          label: localize("cancel", "Cancel"),
          run: /* @__PURE__ */ __name(() => {
          }, "run")
        }
      ]
    });
  }
  async showClipboardDialog() {
    let result = false;
    await this.dialogService.prompt({
      type: Severity.Warning,
      message: localize("issueReporterWriteToClipboard", "There is too much data to send to GitHub directly. The data will be copied to the clipboard, please paste it into the GitHub issue page that is opened."),
      buttons: [
        {
          label: localize({ key: "ok", comment: ["&& denotes a mnemonic"] }, "&&OK"),
          run: /* @__PURE__ */ __name(() => {
            result = true;
          }, "run")
        },
        {
          label: localize("cancel", "Cancel"),
          run: /* @__PURE__ */ __name(() => {
            result = false;
          }, "run")
        }
      ]
    });
    return result;
  }
  hasToReload(data) {
    if (data.extensionId && this.extensionIdentifierSet.has(data.extensionId)) {
      this.currentData = data;
      this.issueReporterWindow?.focus();
      return true;
    }
    if (this.issueReporterWindow) {
      this.issueReporterWindow.focus();
      return true;
    }
    return false;
  }
};
IssueFormService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IAuxiliaryWindowService),
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IHostService)
], IssueFormService);
export {
  IssueFormService
};
//# sourceMappingURL=issueFormService.js.map
