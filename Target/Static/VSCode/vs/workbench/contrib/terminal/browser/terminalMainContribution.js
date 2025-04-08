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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { TerminalLocation } from "../../../../platform/terminal/common/terminal.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService, terminalEditorId } from "./terminal.js";
import { parseTerminalUri } from "./terminalUri.js";
import { terminalStrings } from "../common/terminalStrings.js";
import { IEditorResolverService, RegisteredEditorPriority } from "../../../services/editor/common/editorResolverService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { ILifecycleService, LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { IEmbedderTerminalService } from "../../../services/terminal/common/embedderTerminalService.js";
let TerminalMainContribution = class extends Disposable {
  static {
    __name(this, "TerminalMainContribution");
  }
  static ID = "terminalMain";
  constructor(editorResolverService, embedderTerminalService, workbenchEnvironmentService, labelService, lifecycleService, terminalService, terminalEditorService, terminalGroupService, terminalInstanceService) {
    super();
    this._init(
      editorResolverService,
      embedderTerminalService,
      workbenchEnvironmentService,
      labelService,
      lifecycleService,
      terminalService,
      terminalEditorService,
      terminalGroupService,
      terminalInstanceService
    );
  }
  async _init(editorResolverService, embedderTerminalService, workbenchEnvironmentService, labelService, lifecycleService, terminalService, terminalEditorService, terminalGroupService, terminalInstanceService) {
    this._register(embedderTerminalService.onDidCreateTerminal(async (embedderTerminal) => {
      const terminal = await terminalService.createTerminal({
        config: embedderTerminal,
        location: TerminalLocation.Panel,
        skipContributedProfileCheck: true
      });
      terminalService.setActiveInstance(terminal);
      await terminalService.revealActiveTerminal();
    }));
    await lifecycleService.when(LifecyclePhase.Restored);
    this._register(editorResolverService.registerEditor(
      `${Schemas.vscodeTerminal}:/**`,
      {
        id: terminalEditorId,
        label: terminalStrings.terminal,
        priority: RegisteredEditorPriority.exclusive
      },
      {
        canSupportResource: /* @__PURE__ */ __name((uri) => uri.scheme === Schemas.vscodeTerminal, "canSupportResource"),
        singlePerResource: true
      },
      {
        createEditorInput: /* @__PURE__ */ __name(async ({ resource, options }) => {
          let instance = terminalService.getInstanceFromResource(resource);
          if (instance) {
            const sourceGroup = terminalGroupService.getGroupForInstance(instance);
            sourceGroup?.removeInstance(instance);
          } else {
            const terminalIdentifier = parseTerminalUri(resource);
            if (!terminalIdentifier.instanceId) {
              throw new Error("Terminal identifier without instanceId");
            }
            const primaryBackend = terminalService.getPrimaryBackend();
            if (!primaryBackend) {
              throw new Error("No terminal primary backend");
            }
            const attachPersistentProcess = await primaryBackend.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId);
            if (!attachPersistentProcess) {
              throw new Error("No terminal persistent process to attach");
            }
            instance = terminalInstanceService.createInstance({ attachPersistentProcess }, TerminalLocation.Editor);
          }
          const resolvedResource = terminalEditorService.resolveResource(instance);
          const editor = terminalEditorService.getInputFromResource(resolvedResource);
          return {
            editor,
            options: {
              ...options,
              pinned: true,
              forceReload: true,
              override: terminalEditorId
            }
          };
        }, "createEditorInput")
      }
    ));
    this._register(labelService.registerFormatter({
      scheme: Schemas.vscodeTerminal,
      formatting: {
        label: "${path}",
        separator: ""
      }
    }));
  }
};
TerminalMainContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IEmbedderTerminalService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, ILifecycleService),
  __decorateParam(5, ITerminalService),
  __decorateParam(6, ITerminalEditorService),
  __decorateParam(7, ITerminalGroupService),
  __decorateParam(8, ITerminalInstanceService)
], TerminalMainContribution);
export {
  TerminalMainContribution
};
//# sourceMappingURL=terminalMainContribution.js.map
