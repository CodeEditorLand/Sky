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
import { localize, localize2 } from "../../../../nls.js";
import { GettingStartedInputSerializer, GettingStartedPage, inWelcomeContext } from "./gettingStarted.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorExtensions } from "../../../common/editor.js";
import { MenuId, registerAction2, Action2 } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { IWalkthroughsService } from "./gettingStartedService.js";
import { GettingStartedInput } from "./gettingStartedInput.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { workbenchConfigurationNodeBase } from "../../../common/configuration.js";
import { CommandsRegistry, ICommandService } from "../../../../platform/commands/common/commands.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { isLinux, isMacintosh, isWindows } from "../../../../base/common/platform.js";
import { IExtensionManagementServerService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { StartupPageEditorResolverContribution, StartupPageRunnerContribution } from "./startupPage.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { AccessibleViewRegistry } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { GettingStartedAccessibleView } from "./gettingStartedAccessibleView.js";
import * as icons from "./gettingStartedIcons.js";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.openWalkthrough",
      title: localize2("miWelcome", "Welcome"),
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "1_welcome",
        order: 1
      },
      metadata: {
        description: localize2("minWelcomeDescription", "Opens a Walkthrough to help you get started in VS Code.")
      }
    });
  }
  run(accessor, walkthroughID, optionsOrToSide) {
    const editorService = accessor.get(IEditorService);
    const commandService = accessor.get(ICommandService);
    const toSide = typeof optionsOrToSide === "object" ? optionsOrToSide.toSide : optionsOrToSide;
    const inactive = typeof optionsOrToSide === "object" ? optionsOrToSide.inactive : false;
    const activeEditor = editorService.activeEditor;
    if (walkthroughID) {
      const selectedCategory = typeof walkthroughID === "string" ? walkthroughID : walkthroughID.category;
      let selectedStep;
      if (typeof walkthroughID === "object" && "category" in walkthroughID && "step" in walkthroughID) {
        selectedStep = `${walkthroughID.category}#${walkthroughID.step}`;
      } else {
        selectedStep = void 0;
      }
      if (selectedStep && activeEditor instanceof GettingStartedInput && activeEditor.selectedCategory === selectedCategory) {
        activeEditor.showWelcome = false;
        commandService.executeCommand("walkthroughs.selectStep", selectedStep);
        return;
      }
      let options;
      if (selectedCategory) {
        options = { selectedCategory, selectedStep, showWelcome: false, preserveFocus: toSide ?? false, inactive };
      } else {
        options = { selectedCategory, selectedStep, showWelcome: true, preserveFocus: toSide ?? false, inactive };
      }
      editorService.openEditor({
        resource: GettingStartedInput.RESOURCE,
        options
      }, toSide ? SIDE_GROUP : void 0);
    } else {
      editorService.openEditor({
        resource: GettingStartedInput.RESOURCE,
        options: { preserveFocus: toSide ?? false, inactive }
      }, toSide ? SIDE_GROUP : void 0);
    }
  }
});
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(GettingStartedInput.ID, GettingStartedInputSerializer);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(GettingStartedPage, GettingStartedPage.ID, localize("welcome", "Welcome")), [
  new SyncDescriptor(GettingStartedInput)
]);
const category = localize2("welcome", "Welcome");
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "welcome.goBack",
      title: localize2("welcome.goBack", "Go Back"),
      category,
      keybinding: {
        weight: 100,
        primary: 9,
        when: inWelcomeContext
      },
      precondition: ContextKeyExpr.equals("activeEditor", "gettingStartedPage"),
      f1: true
    });
  }
  run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editorPane = editorService.activeEditorPane;
    if (editorPane instanceof GettingStartedPage) {
      editorPane.escape();
    }
  }
});
CommandsRegistry.registerCommand({
  id: "walkthroughs.selectStep",
  handler: /* @__PURE__ */ __name((accessor, stepID) => {
    const editorService = accessor.get(IEditorService);
    const editorPane = editorService.activeEditorPane;
    if (editorPane instanceof GettingStartedPage) {
      editorPane.selectStepLoose(stepID);
    } else {
      console.error("Cannot run walkthroughs.selectStep outside of walkthrough context");
    }
  }, "handler")
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "welcome.markStepComplete",
      title: localize("welcome.markStepComplete", "Mark Step Complete"),
      category
    });
  }
  run(accessor, arg) {
    if (!arg) {
      return;
    }
    const gettingStartedService = accessor.get(IWalkthroughsService);
    gettingStartedService.progressStep(arg);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "welcome.markStepIncomplete",
      title: localize("welcome.markStepInomplete", "Mark Step Incomplete"),
      category
    });
  }
  run(accessor, arg) {
    if (!arg) {
      return;
    }
    const gettingStartedService = accessor.get(IWalkthroughsService);
    gettingStartedService.deprogressStep(arg);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "welcome.showAllWalkthroughs",
      title: localize2("welcome.showAllWalkthroughs", "Open Walkthrough..."),
      category,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "1_welcome",
        order: 3
      }
    });
  }
  async getQuickPickItems(contextService, gettingStartedService) {
    const categories = await gettingStartedService.getWalkthroughs();
    return categories.filter((c) => contextService.contextMatchesRules(c.when)).map((x) => ({
      id: x.id,
      label: x.title,
      detail: x.description,
      description: x.source
    }));
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    const contextService = accessor.get(IContextKeyService);
    const quickInputService = accessor.get(IQuickInputService);
    const gettingStartedService = accessor.get(IWalkthroughsService);
    const extensionService = accessor.get(IExtensionService);
    const disposables = new DisposableStore();
    const quickPick = disposables.add(quickInputService.createQuickPick());
    quickPick.canSelectMany = false;
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = true;
    quickPick.placeholder = localize("pickWalkthroughs", "Select a walkthrough to open");
    quickPick.items = await this.getQuickPickItems(contextService, gettingStartedService);
    quickPick.busy = true;
    disposables.add(quickPick.onDidAccept(() => {
      const selection = quickPick.selectedItems[0];
      if (selection) {
        commandService.executeCommand("workbench.action.openWalkthrough", selection.id);
      }
      quickPick.hide();
    }));
    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
    await extensionService.whenInstalledExtensionsRegistered();
    disposables.add(gettingStartedService.onDidAddWalkthrough(async () => {
      quickPick.items = await this.getQuickPickItems(contextService, gettingStartedService);
    }));
    quickPick.show();
    quickPick.busy = false;
  }
});
CommandsRegistry.registerCommand({
  id: "welcome.newWorkspaceChat",
  handler: /* @__PURE__ */ __name((accessor, stepID) => {
    const commandService = accessor.get(ICommandService);
    commandService.executeCommand("workbench.action.chat.open", { mode: "agent", query: "#new ", isPartialQuery: true });
  }, "handler")
});
const WorkspacePlatform = new RawContextKey("workspacePlatform", void 0, localize("workspacePlatform", "The platform of the current workspace, which in remote or serverless contexts may be different from the platform of the UI"));
let WorkspacePlatformContribution = class WorkspacePlatformContribution2 {
  static {
    __name(this, "WorkspacePlatformContribution");
  }
  static {
    this.ID = "workbench.contrib.workspacePlatform";
  }
  constructor(extensionManagementServerService, remoteAgentService, contextService) {
    this.extensionManagementServerService = extensionManagementServerService;
    this.remoteAgentService = remoteAgentService;
    this.contextService = contextService;
    this.remoteAgentService.getEnvironment().then((env) => {
      const remoteOS = env?.os;
      const remotePlatform = remoteOS === 2 ? "mac" : remoteOS === 1 ? "windows" : remoteOS === 3 ? "linux" : void 0;
      if (remotePlatform) {
        WorkspacePlatform.bindTo(this.contextService).set(remotePlatform);
      } else if (this.extensionManagementServerService.localExtensionManagementServer) {
        if (isMacintosh) {
          WorkspacePlatform.bindTo(this.contextService).set("mac");
        } else if (isLinux) {
          WorkspacePlatform.bindTo(this.contextService).set("linux");
        } else if (isWindows) {
          WorkspacePlatform.bindTo(this.contextService).set("windows");
        }
      } else if (this.extensionManagementServerService.webExtensionManagementServer) {
        WorkspacePlatform.bindTo(this.contextService).set("webworker");
      } else {
        console.error("Error: Unable to detect workspace platform");
      }
    });
  }
};
WorkspacePlatformContribution = __decorate([
  __param(0, IExtensionManagementServerService),
  __param(1, IRemoteAgentService),
  __param(2, IContextKeyService)
], WorkspacePlatformContribution);
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.welcomePage.walkthroughs.openOnInstall": {
      scope: 2,
      type: "boolean",
      default: true,
      description: localize("workbench.welcomePage.walkthroughs.openOnInstall", "When enabled, an extension's walkthrough will open upon install of the extension.")
    },
    "workbench.startupEditor": {
      "scope": 5,
      "type": "string",
      "enum": ["none", "welcomePage", "readme", "newUntitledFile", "welcomePageInEmptyWorkbench", "terminal", "agentSessionsWelcomePage"],
      "enumDescriptions": [
        localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "workbench.startupEditor.none" }, "Start without an editor."),
        localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "workbench.startupEditor.welcomePage" }, "Open the Welcome page, with content to aid in getting started with VS Code and extensions."),
        localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "workbench.startupEditor.readme" }, "Open the README when opening a folder that contains one, fallback to 'welcomePage' otherwise. Note: This is only observed as a global configuration, it will be ignored if set in a workspace or folder configuration."),
        localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "workbench.startupEditor.newUntitledFile" }, "Open a new untitled text file (only applies when opening an empty window)."),
        localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "workbench.startupEditor.welcomePageInEmptyWorkbench" }, "Open the Welcome page when opening an empty workbench."),
        localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "workbench.startupEditor.terminal" }, "Open a new terminal in the editor area."),
        localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "workbench.startupEditor.agentSessionsWelcomePage" }, "Open the Agent Sessions Welcome page.")
      ],
      "default": "welcomePage",
      "description": localize("workbench.startupEditor", "Controls which editor is shown at startup, if none are restored from the previous session.")
    },
    "workbench.welcomePage.preferReducedMotion": {
      scope: 1,
      type: "boolean",
      default: false,
      deprecationMessage: localize("deprecationMessage", "Deprecated, use the global `workbench.reduceMotion`."),
      description: localize("workbench.welcomePage.preferReducedMotion", "When enabled, reduce motion in welcome page.")
    }
  }
});
registerWorkbenchContribution2(
  WorkspacePlatformContribution.ID,
  WorkspacePlatformContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerWorkbenchContribution2(
  StartupPageEditorResolverContribution.ID,
  StartupPageEditorResolverContribution,
  2
  /* WorkbenchPhase.BlockRestore */
);
registerWorkbenchContribution2(
  StartupPageRunnerContribution.ID,
  StartupPageRunnerContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
AccessibleViewRegistry.register(new GettingStartedAccessibleView());
export {
  WorkspacePlatform,
  icons
};
//# sourceMappingURL=gettingStarted.contribution.js.map
