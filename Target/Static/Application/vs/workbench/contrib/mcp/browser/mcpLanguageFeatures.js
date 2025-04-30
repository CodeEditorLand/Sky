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
import { computeLevenshteinDistance } from "../../../../base/common/diff/diff.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { markdownCommandLink, MarkdownString } from "../../../../base/common/htmlContent.js";
import { findNodeAtLocation, parseTree } from "../../../../base/common/json.js";
import { Disposable, DisposableStore, dispose, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { isEqual } from "../../../../base/common/resources.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { localize } from "../../../../nls.js";
import { IMarkerService, MarkerSeverity } from "../../../../platform/markers/common/markers.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { ConfigurationResolverExpression } from "../../../services/configurationResolver/common/configurationResolverExpression.js";
import { IMcpConfigPathsService } from "../common/mcpConfigPathsService.js";
import { mcpConfigurationSection } from "../common/mcpConfiguration.js";
import { IMcpRegistry } from "../common/mcpRegistryTypes.js";
import { IMcpService } from "../common/mcpTypes.js";
const diagnosticOwner = "vscode.mcp";
let McpLanguageFeatures = class McpLanguageFeatures2 extends Disposable {
  static {
    __name(this, "McpLanguageFeatures");
  }
  constructor(languageFeaturesService, _mcpRegistry, _mcpConfigPathsService, _mcpService, _markerService, _configurationResolverService) {
    super();
    this._mcpRegistry = _mcpRegistry;
    this._mcpConfigPathsService = _mcpConfigPathsService;
    this._mcpService = _mcpService;
    this._markerService = _markerService;
    this._configurationResolverService = _configurationResolverService;
    this._cachedMcpSection = this._register(new MutableDisposable());
    const patterns = [
      { pattern: "**/.vscode/mcp.json" },
      { pattern: "**/settings.json" },
      { pattern: "**/workspace.json" }
    ];
    const onDidChangeCodeLens = this._register(new Emitter());
    const codeLensProvider = {
      onDidChange: onDidChangeCodeLens.event,
      provideCodeLenses: /* @__PURE__ */ __name((model, range) => this._provideCodeLenses(model, () => onDidChangeCodeLens.fire(codeLensProvider)), "provideCodeLenses")
    };
    this._register(languageFeaturesService.codeLensProvider.register(patterns, codeLensProvider));
    this._register(languageFeaturesService.inlayHintsProvider.register(patterns, {
      onDidChangeInlayHints: _mcpRegistry.onDidChangeInputs,
      provideInlayHints: /* @__PURE__ */ __name((model, range) => this._provideInlayHints(model, range), "provideInlayHints")
    }));
  }
  /** Simple mechanism to avoid extra json parsing for hints+lenses */
  _parseModel(model) {
    if (this._cachedMcpSection.value?.model === model) {
      return this._cachedMcpSection.value;
    }
    const uri = model.uri;
    const inConfig = this._mcpConfigPathsService.paths.get().find((u) => isEqual(u.uri, uri));
    if (!inConfig) {
      return void 0;
    }
    const value = model.getValue();
    const tree = parseTree(value);
    const listeners = [
      model.onDidChangeContent(() => this._cachedMcpSection.clear()),
      model.onWillDispose(() => this._cachedMcpSection.clear())
    ];
    this._addDiagnostics(model, value, tree, inConfig);
    return this._cachedMcpSection.value = {
      model,
      tree,
      inConfig,
      dispose: /* @__PURE__ */ __name(() => {
        this._markerService.remove(diagnosticOwner, [uri]);
        dispose(listeners);
      }, "dispose")
    };
  }
  _addDiagnostics(tm, value, tree, inConfig) {
    const serversNode = findNodeAtLocation(tree, inConfig.section ? [...inConfig.section, "servers"] : ["servers"]);
    if (!serversNode) {
      return;
    }
    const getClosestMatchingVariable = /* @__PURE__ */ __name((name) => {
      let bestValue = "";
      let bestDistance = Infinity;
      for (const variable of this._configurationResolverService.resolvableVariables) {
        const distance = computeLevenshteinDistance(name, variable);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestValue = variable;
        }
      }
      return bestValue;
    }, "getClosestMatchingVariable");
    const diagnostics = [];
    forEachPropertyWithReplacement(serversNode, (node) => {
      const expr = ConfigurationResolverExpression.parse(node.value);
      for (const { id, name, arg } of expr.unresolved()) {
        if (!this._configurationResolverService.resolvableVariables.has(name)) {
          const position = value.indexOf(id, node.offset);
          if (position === -1) {
            continue;
          }
          const start = tm.getPositionAt(position);
          const end = tm.getPositionAt(position + id.length);
          diagnostics.push({
            severity: MarkerSeverity.Warning,
            message: localize("mcp.variableNotFound", "Variable `{0}` not found, did you mean ${{1}}?", name, getClosestMatchingVariable(name) + (arg ? `:${arg}` : "")),
            startLineNumber: start.lineNumber,
            startColumn: start.column,
            endLineNumber: end.lineNumber,
            endColumn: end.column,
            modelVersionId: tm.getVersionId()
          });
        }
      }
    });
    if (diagnostics.length) {
      this._markerService.changeOne(diagnosticOwner, tm.uri, diagnostics);
    } else {
      this._markerService.remove(diagnosticOwner, [tm.uri]);
    }
  }
  _provideCodeLenses(model, onDidChangeCodeLens) {
    const parsed = this._parseModel(model);
    if (!parsed) {
      return void 0;
    }
    const { tree, inConfig } = parsed;
    const serversNode = findNodeAtLocation(tree, inConfig.section ? [...inConfig.section, "servers"] : ["servers"]);
    if (!serversNode) {
      return void 0;
    }
    const store = new DisposableStore();
    const lenses = { lenses: [], dispose: /* @__PURE__ */ __name(() => store.dispose(), "dispose") };
    const read = /* @__PURE__ */ __name((observable) => {
      store.add(Event.fromObservableLight(observable)(onDidChangeCodeLens));
      return observable.get();
    }, "read");
    const collection = read(this._mcpRegistry.collections).find((c) => isEqual(c.presentation?.origin, model.uri));
    if (!collection) {
      return lenses;
    }
    const mcpServers = read(this._mcpService.servers).filter((s) => s.collection.id === collection.id);
    for (const node of serversNode.children || []) {
      if (node.type !== "property" || node.children?.[0]?.type !== "string") {
        continue;
      }
      const name = node.children[0].value;
      const server = mcpServers.find((s) => s.definition.label === name);
      if (!server) {
        continue;
      }
      const range = Range.fromPositions(model.getPositionAt(node.children[0].offset));
      switch (read(server.connectionState).state) {
        case 3:
          lenses.lenses.push({
            range,
            command: {
              id: "workbench.mcp.showOutput",
              title: "$(error) " + localize("server.error", "Error"),
              arguments: [server.definition.id]
            }
          }, {
            range,
            command: {
              id: "workbench.mcp.restartServer",
              title: localize("mcp.restart", "Restart"),
              arguments: [server.definition.id]
            }
          });
          break;
        case 1:
          lenses.lenses.push({
            range,
            command: {
              id: "workbench.mcp.showOutput",
              title: "$(loading~spin) " + localize("server.starting", "Starting"),
              arguments: [server.definition.id]
            }
          }, {
            range,
            command: {
              id: "workbench.mcp.stopServer",
              title: localize("cancel", "Cancel"),
              arguments: [server.definition.id]
            }
          });
          break;
        case 2:
          lenses.lenses.push({
            range,
            command: {
              id: "workbench.mcp.showOutput",
              title: "$(check) " + localize("server.running", "Running"),
              arguments: [server.definition.id]
            }
          }, {
            range,
            command: {
              id: "workbench.mcp.stopServer",
              title: localize("mcp.stop", "Stop"),
              arguments: [server.definition.id]
            }
          }, {
            range,
            command: {
              id: "workbench.mcp.restartServer",
              title: localize("mcp.restart", "Restart"),
              arguments: [server.definition.id]
            }
          }, {
            range,
            command: {
              id: "",
              title: localize("server.toolCount", "{0} tools", read(server.tools).length)
            }
          });
          break;
        case 0: {
          lenses.lenses.push({
            range,
            command: {
              id: "workbench.mcp.startServer",
              title: "$(debug-start) " + localize("mcp.start", "Start"),
              arguments: [server.definition.id]
            }
          });
          const toolCount = read(server.tools).length;
          if (toolCount) {
            lenses.lenses.push({
              range,
              command: {
                id: "",
                title: localize("server.toolCountCached", "{0} cached tools", toolCount)
              }
            });
          }
        }
      }
    }
    return lenses;
  }
  async _provideInlayHints(model, range) {
    const parsed = this._parseModel(model);
    if (!parsed) {
      return void 0;
    }
    const { tree, inConfig } = parsed;
    const mcpSection = inConfig.section ? findNodeAtLocation(tree, [...inConfig.section]) : tree;
    if (!mcpSection) {
      return void 0;
    }
    const inputsNode = findNodeAtLocation(mcpSection, ["inputs"]);
    if (!inputsNode) {
      return void 0;
    }
    const inputs = await this._mcpRegistry.getSavedInputs(inConfig.scope);
    const hints = [];
    const serversNode = findNodeAtLocation(mcpSection, ["servers"]);
    if (serversNode) {
      annotateServers(serversNode);
    }
    annotateInputs(inputsNode);
    return { hints, dispose: /* @__PURE__ */ __name(() => {
    }, "dispose") };
    function annotateServers(servers) {
      forEachPropertyWithReplacement(servers, (node) => {
        const expr = ConfigurationResolverExpression.parse(node.value);
        for (const { id } of expr.unresolved()) {
          const saved = inputs[id];
          if (saved) {
            pushAnnotation(id, node.offset + node.value.indexOf(id) + id.length, saved);
          }
        }
      });
    }
    __name(annotateServers, "annotateServers");
    function annotateInputs(node) {
      if (node.type !== "array" || !node.children) {
        return;
      }
      for (const input of node.children) {
        if (input.type !== "object" || !input.children) {
          continue;
        }
        const idProp = input.children.find((c) => c.type === "property" && c.children?.[0].value === "id");
        if (!idProp) {
          continue;
        }
        const id = idProp.children[1];
        if (!id || id.type !== "string" || !id.value) {
          continue;
        }
        const savedId = "${input:" + id.value + "}";
        const saved = inputs[savedId];
        if (saved) {
          pushAnnotation(savedId, id.offset + 1 + id.length, saved);
        }
      }
    }
    __name(annotateInputs, "annotateInputs");
    function pushAnnotation(savedId, offset, saved) {
      const tooltip = new MarkdownString([
        markdownCommandLink({ id: "workbench.mcp.editStoredInput", title: localize("edit", "Edit"), arguments: [savedId, model.uri, mcpConfigurationSection, inConfig.target] }),
        markdownCommandLink({ id: "workbench.mcp.removeStoredInput", title: localize("clear", "Clear"), arguments: [inConfig.scope, savedId] }),
        markdownCommandLink({ id: "workbench.mcp.removeStoredInput", title: localize("clearAll", "Clear All"), arguments: [inConfig.scope] })
      ].join(" | "), { isTrusted: true });
      const hint = {
        label: "= " + (saved.input?.type === "promptString" && saved.input.password ? "*".repeat(10) : saved.value || ""),
        position: model.getPositionAt(offset),
        tooltip,
        paddingLeft: true
      };
      hints.push(hint);
      return hint;
    }
    __name(pushAnnotation, "pushAnnotation");
  }
};
McpLanguageFeatures = __decorate([
  __param(0, ILanguageFeaturesService),
  __param(1, IMcpRegistry),
  __param(2, IMcpConfigPathsService),
  __param(3, IMcpService),
  __param(4, IMarkerService),
  __param(5, IConfigurationResolverService)
], McpLanguageFeatures);
function forEachPropertyWithReplacement(node, callback) {
  if (node.type === "string" && typeof node.value === "string" && node.value.includes(ConfigurationResolverExpression.VARIABLE_LHS)) {
    callback(node);
  } else if (node.type === "property") {
    node.children?.slice(1).forEach((n) => forEachPropertyWithReplacement(n, callback));
  } else {
    node.children?.forEach((n) => forEachPropertyWithReplacement(n, callback));
  }
}
__name(forEachPropertyWithReplacement, "forEachPropertyWithReplacement");
export {
  McpLanguageFeatures
};
//# sourceMappingURL=mcpLanguageFeatures.js.map
