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
import { Emitter } from "../../../../../base/common/event.js";
import { IDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { ITerminalCommandSelector } from "../../../../../platform/terminal/common/terminal.js";
import { ITerminalQuickFixService, ITerminalQuickFixProvider, ITerminalQuickFixProviderSelector } from "./quickFix.js";
import { isProposedApiEnabled } from "../../../../services/extensions/common/extensions.js";
import { ExtensionsRegistry } from "../../../../services/extensions/common/extensionsRegistry.js";
let TerminalQuickFixService = class {
  constructor(_logService) {
    this._logService = _logService;
    this.extensionQuickFixes = new Promise((r) => quickFixExtensionPoint.setHandler((fixes) => {
      r(fixes.filter((c) => isProposedApiEnabled(c.description, "terminalQuickFixProvider")).map((c) => {
        if (!c.value) {
          return [];
        }
        return c.value.map((fix) => {
          return { ...fix, extensionIdentifier: c.description.identifier.value };
        });
      }).flat());
    }));
    this.extensionQuickFixes.then((selectors) => {
      for (const selector of selectors) {
        this.registerCommandSelector(selector);
      }
    });
  }
  static {
    __name(this, "TerminalQuickFixService");
  }
  _selectors = /* @__PURE__ */ new Map();
  _providers = /* @__PURE__ */ new Map();
  get providers() {
    return this._providers;
  }
  _onDidRegisterProvider = new Emitter();
  onDidRegisterProvider = this._onDidRegisterProvider.event;
  _onDidRegisterCommandSelector = new Emitter();
  onDidRegisterCommandSelector = this._onDidRegisterCommandSelector.event;
  _onDidUnregisterProvider = new Emitter();
  onDidUnregisterProvider = this._onDidUnregisterProvider.event;
  extensionQuickFixes;
  registerCommandSelector(selector) {
    this._selectors.set(selector.id, selector);
    this._onDidRegisterCommandSelector.fire(selector);
  }
  registerQuickFixProvider(id, provider) {
    let disposed = false;
    this.extensionQuickFixes.then(() => {
      if (disposed) {
        return;
      }
      this._providers.set(id, provider);
      const selector = this._selectors.get(id);
      if (!selector) {
        this._logService.error(`No registered selector for ID: ${id}`);
        return;
      }
      this._onDidRegisterProvider.fire({ selector, provider });
    });
    return toDisposable(() => {
      disposed = true;
      this._providers.delete(id);
      const selector = this._selectors.get(id);
      if (selector) {
        this._selectors.delete(id);
        this._onDidUnregisterProvider.fire(selector.id);
      }
    });
  }
};
TerminalQuickFixService = __decorateClass([
  __decorateParam(0, ILogService)
], TerminalQuickFixService);
const quickFixExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "terminalQuickFixes",
  defaultExtensionKind: ["workspace"],
  activationEventsGenerator: /* @__PURE__ */ __name((terminalQuickFixes, result) => {
    for (const quickFixContrib of terminalQuickFixes ?? []) {
      result.push(`onTerminalQuickFixRequest:${quickFixContrib.id}`);
    }
  }, "activationEventsGenerator"),
  jsonSchema: {
    description: localize("vscode.extension.contributes.terminalQuickFixes", "Contributes terminal quick fixes."),
    type: "array",
    items: {
      type: "object",
      additionalProperties: false,
      required: ["id", "commandLineMatcher", "outputMatcher", "commandExitResult"],
      defaultSnippets: [{
        body: {
          id: "$1",
          commandLineMatcher: "$2",
          outputMatcher: "$3",
          exitStatus: "$4"
        }
      }],
      properties: {
        id: {
          description: localize("vscode.extension.contributes.terminalQuickFixes.id", "The ID of the quick fix provider"),
          type: "string"
        },
        commandLineMatcher: {
          description: localize("vscode.extension.contributes.terminalQuickFixes.commandLineMatcher", "A regular expression or string to test the command line against"),
          type: "string"
        },
        outputMatcher: {
          markdownDescription: localize("vscode.extension.contributes.terminalQuickFixes.outputMatcher", "A regular expression or string to match a single line of the output against, which provides groups to be referenced in terminalCommand and uri.\n\nFor example:\n\n `lineMatcher: /git push --set-upstream origin (?<branchName>[^s]+)/;`\n\n`terminalCommand: 'git push --set-upstream origin ${group:branchName}';`\n"),
          type: "object",
          required: ["lineMatcher", "anchor", "offset", "length"],
          properties: {
            lineMatcher: {
              description: "A regular expression or string to test the command line against",
              type: "string"
            },
            anchor: {
              description: "Where the search should begin in the buffer",
              enum: ["top", "bottom"]
            },
            offset: {
              description: "The number of lines vertically from the anchor in the buffer to start matching against",
              type: "number"
            },
            length: {
              description: "The number of rows to match against, this should be as small as possible for performance reasons",
              type: "number"
            }
          }
        },
        commandExitResult: {
          description: localize("vscode.extension.contributes.terminalQuickFixes.commandExitResult", "The command exit result to match on"),
          enum: ["success", "error"],
          enumDescriptions: [
            "The command exited with an exit code of zero.",
            "The command exited with a non-zero exit code."
          ]
        },
        kind: {
          description: localize("vscode.extension.contributes.terminalQuickFixes.kind", "The kind of the resulting quick fix. This changes how the quick fix is presented. Defaults to {0}.", '`"fix"`'),
          enum: ["default", "explain"],
          enumDescriptions: [
            "A high confidence quick fix.",
            "An explanation of the problem."
          ]
        }
      }
    }
  }
});
export {
  TerminalQuickFixService
};
//# sourceMappingURL=terminalQuickFixService.js.map
