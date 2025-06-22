var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { codeActionCommandId, fixAllCommandId, organizeImportsCommandId, refactorCommandId, sourceActionCommandId } from "./codeAction.js";
import { CodeActionCommandArgs, CodeActionKind } from "../common/types.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
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
var CodeActionKeybindingResolver_1;
let CodeActionKeybindingResolver = class CodeActionKeybindingResolver2 {
  static {
    __name(this, "CodeActionKeybindingResolver");
  }
  static {
    CodeActionKeybindingResolver_1 = this;
  }
  static {
    this.codeActionCommands = [
      refactorCommandId,
      codeActionCommandId,
      sourceActionCommandId,
      organizeImportsCommandId,
      fixAllCommandId
    ];
  }
  constructor(keybindingService) {
    this.keybindingService = keybindingService;
  }
  getResolver() {
    const allCodeActionBindings = new Lazy(() => this.keybindingService.getKeybindings().filter((item) => CodeActionKeybindingResolver_1.codeActionCommands.indexOf(item.command) >= 0).filter((item) => item.resolvedKeybinding).map((item) => {
      let commandArgs = item.commandArgs;
      if (item.command === organizeImportsCommandId) {
        commandArgs = { kind: CodeActionKind.SourceOrganizeImports.value };
      } else if (item.command === fixAllCommandId) {
        commandArgs = { kind: CodeActionKind.SourceFixAll.value };
      }
      return {
        resolvedKeybinding: item.resolvedKeybinding,
        ...CodeActionCommandArgs.fromUser(commandArgs, {
          kind: HierarchicalKind.None,
          apply: "never"
          /* CodeActionAutoApply.Never */
        })
      };
    }));
    return (action) => {
      if (action.kind) {
        const binding = this.bestKeybindingForCodeAction(action, allCodeActionBindings.value);
        return binding?.resolvedKeybinding;
      }
      return void 0;
    };
  }
  bestKeybindingForCodeAction(action, candidates) {
    if (!action.kind) {
      return void 0;
    }
    const kind = new HierarchicalKind(action.kind);
    return candidates.filter((candidate) => candidate.kind.contains(kind)).filter((candidate) => {
      if (candidate.preferred) {
        return action.isPreferred;
      }
      return true;
    }).reduceRight((currentBest, candidate) => {
      if (!currentBest) {
        return candidate;
      }
      return currentBest.kind.contains(candidate.kind) ? candidate : currentBest;
    }, void 0);
  }
};
CodeActionKeybindingResolver = CodeActionKeybindingResolver_1 = __decorate([
  __param(0, IKeybindingService)
], CodeActionKeybindingResolver);
export {
  CodeActionKeybindingResolver
};
//# sourceMappingURL=codeActionKeybindingResolver.js.map
