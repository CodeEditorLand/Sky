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
import { computeLevenshteinDistance } from "../../../../base/common/diff/diff.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { markdownCommandLink, MarkdownString } from "../../../../base/common/htmlContent.js";
import { findNodeAtLocation, Node, parseTree } from "../../../../base/common/json.js";
import { Disposable, DisposableStore, dispose, IDisposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../base/common/observable.js";
import { isEqual } from "../../../../base/common/resources.js";
import { Range } from "../../../../editor/common/core/range.js";
import { CodeLensList, CodeLensProvider, InlayHint, InlayHintList } from "../../../../editor/common/languages.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { localize } from "../../../../nls.js";
import { IMarkerData, IMarkerService, MarkerSeverity } from "../../../../platform/markers/common/markers.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { ConfigurationResolverExpression, IResolvedValue } from "../../../services/configurationResolver/common/configurationResolverExpression.js";
import { IMcpConfigPath, IMcpConfigPathsService } from "../common/mcpConfigPathsService.js";
import { mcpConfigurationSection } from "../common/mcpConfiguration.js";
import { IMcpRegistry } from "../common/mcpRegistryTypes.js";
import { IMcpService, McpConnectionState } from "../common/mcpTypes.js";
import { EditStoredInput, RemoveStoredInput, RestartServer, ShowOutput, StartServer, StopServer } from "./mcpCommands.js";
const diagnosticOwner = "vscode.mcp";
let McpLanguageFeatures = class extends Disposable {
  constructor(languageFeaturesService, _mcpRegistry, _mcpConfigPathsService, _mcpService, _markerService, _configurationResolverService) {
    super();
    this._mcpRegistry = _mcpRegistry;
    this._mcpConfigPathsService = _mcpConfigPathsService;
    this._mcpService = _mcpService;
    this._markerService = _markerService;
    this._configurationResolverService = _configurationResolverService;
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
  static {
    __name(this, "McpLanguageFeatures");
  }
  _cachedMcpSection = this._register(new MutableDisposable());
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
        case McpConnectionState.Kind.Error:
          lenses.lenses.push({
            range,
            command: {
              id: ShowOutput.ID,
              title: "$(error) " + localize("server.error", "Error"),
              arguments: [server.definition.id]
            }
          }, {
            range,
            command: {
              id: RestartServer.ID,
              title: localize("mcp.restart", "Restart"),
              arguments: [server.definition.id]
            }
          });
          break;
        case McpConnectionState.Kind.Starting:
          lenses.lenses.push({
            range,
            command: {
              id: ShowOutput.ID,
              title: "$(loading~spin) " + localize("server.starting", "Starting"),
              arguments: [server.definition.id]
            }
          }, {
            range,
            command: {
              id: StopServer.ID,
              title: localize("cancel", "Cancel"),
              arguments: [server.definition.id]
            }
          });
          break;
        case McpConnectionState.Kind.Running:
          lenses.lenses.push({
            range,
            command: {
              id: ShowOutput.ID,
              title: "$(check) " + localize("server.running", "Running"),
              arguments: [server.definition.id]
            }
          }, {
            range,
            command: {
              id: StopServer.ID,
              title: localize("mcp.stop", "Stop"),
              arguments: [server.definition.id]
            }
          }, {
            range,
            command: {
              id: RestartServer.ID,
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
        case McpConnectionState.Kind.Stopped: {
          lenses.lenses.push({
            range,
            command: {
              id: StartServer.ID,
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
        markdownCommandLink({ id: EditStoredInput.ID, title: localize("edit", "Edit"), arguments: [savedId, model.uri, mcpConfigurationSection, inConfig.target] }),
        markdownCommandLink({ id: RemoveStoredInput.ID, title: localize("clear", "Clear"), arguments: [inConfig.scope, savedId] }),
        markdownCommandLink({ id: RemoveStoredInput.ID, title: localize("clearAll", "Clear All"), arguments: [inConfig.scope] })
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
McpLanguageFeatures = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IMcpRegistry),
  __decorateParam(2, IMcpConfigPathsService),
  __decorateParam(3, IMcpService),
  __decorateParam(4, IMarkerService),
  __decorateParam(5, IConfigurationResolverService)
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
