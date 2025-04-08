var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../../base/common/assert.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { equals as objectsEqual } from "../../../../base/common/objects.js";
import { equals as arraysEqual } from "../../../../base/common/arrays.js";
import { IObservable } from "../../../../base/common/observable.js";
import { URI, UriComponents } from "../../../../base/common/uri.js";
import { Location } from "../../../../editor/common/languages.js";
import { localize } from "../../../../nls.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { StorageScope } from "../../../../platform/storage/common/storage.js";
import { IWorkspaceFolderData } from "../../../../platform/workspace/common/workspace.js";
import { McpServerRequestHandler } from "./mcpServerRequestHandler.js";
import { MCP } from "./modelContextProtocol.js";
const extensionMcpCollectionPrefix = "ext.";
function extensionPrefixedIdentifier(identifier, id) {
  return ExtensionIdentifier.toKey(identifier) + "/" + id;
}
__name(extensionPrefixedIdentifier, "extensionPrefixedIdentifier");
var McpCollectionSortOrder = /* @__PURE__ */ ((McpCollectionSortOrder2) => {
  McpCollectionSortOrder2[McpCollectionSortOrder2["WorkspaceFolder"] = 0] = "WorkspaceFolder";
  McpCollectionSortOrder2[McpCollectionSortOrder2["Workspace"] = 100] = "Workspace";
  McpCollectionSortOrder2[McpCollectionSortOrder2["User"] = 200] = "User";
  McpCollectionSortOrder2[McpCollectionSortOrder2["Extension"] = 300] = "Extension";
  McpCollectionSortOrder2[McpCollectionSortOrder2["Filesystem"] = 400] = "Filesystem";
  McpCollectionSortOrder2[McpCollectionSortOrder2["RemoteBoost"] = -50] = "RemoteBoost";
  return McpCollectionSortOrder2;
})(McpCollectionSortOrder || {});
var McpCollectionDefinition;
((McpCollectionDefinition2) => {
  function equals(a, b) {
    return a.id === b.id && a.remoteAuthority === b.remoteAuthority && a.label === b.label && a.isTrustedByDefault === b.isTrustedByDefault;
  }
  McpCollectionDefinition2.equals = equals;
  __name(equals, "equals");
})(McpCollectionDefinition || (McpCollectionDefinition = {}));
var McpServerDefinition;
((McpServerDefinition2) => {
  function toSerialized(def) {
    return def;
  }
  McpServerDefinition2.toSerialized = toSerialized;
  __name(toSerialized, "toSerialized");
  function fromSerialized(def) {
    return {
      id: def.id,
      label: def.label,
      launch: McpServerLaunch.fromSerialized(def.launch),
      variableReplacement: def.variableReplacement ? McpServerDefinitionVariableReplacement.fromSerialized(def.variableReplacement) : void 0
    };
  }
  McpServerDefinition2.fromSerialized = fromSerialized;
  __name(fromSerialized, "fromSerialized");
  function equals(a, b) {
    return a.id === b.id && a.label === b.label && arraysEqual(a.roots, b.roots, (a2, b2) => a2.toString() === b2.toString()) && objectsEqual(a.launch, b.launch) && objectsEqual(a.presentation, b.presentation) && objectsEqual(a.variableReplacement, b.variableReplacement);
  }
  McpServerDefinition2.equals = equals;
  __name(equals, "equals");
})(McpServerDefinition || (McpServerDefinition = {}));
var McpServerDefinitionVariableReplacement;
((McpServerDefinitionVariableReplacement2) => {
  function toSerialized(def) {
    return def;
  }
  McpServerDefinitionVariableReplacement2.toSerialized = toSerialized;
  __name(toSerialized, "toSerialized");
  function fromSerialized(def) {
    return {
      section: def.section,
      folder: def.folder ? { ...def.folder, uri: URI.revive(def.folder.uri) } : void 0,
      target: def.target
    };
  }
  McpServerDefinitionVariableReplacement2.fromSerialized = fromSerialized;
  __name(fromSerialized, "fromSerialized");
})(McpServerDefinitionVariableReplacement || (McpServerDefinitionVariableReplacement = {}));
var LazyCollectionState = /* @__PURE__ */ ((LazyCollectionState2) => {
  LazyCollectionState2[LazyCollectionState2["HasUnknown"] = 0] = "HasUnknown";
  LazyCollectionState2[LazyCollectionState2["LoadingUnknown"] = 1] = "LoadingUnknown";
  LazyCollectionState2[LazyCollectionState2["AllKnown"] = 2] = "AllKnown";
  return LazyCollectionState2;
})(LazyCollectionState || {});
const IMcpService = createDecorator("IMcpService");
var McpServerToolsState = /* @__PURE__ */ ((McpServerToolsState2) => {
  McpServerToolsState2[McpServerToolsState2["Unknown"] = 0] = "Unknown";
  McpServerToolsState2[McpServerToolsState2["Cached"] = 1] = "Cached";
  McpServerToolsState2[McpServerToolsState2["RefreshingFromUnknown"] = 2] = "RefreshingFromUnknown";
  McpServerToolsState2[McpServerToolsState2["RefreshingFromCached"] = 3] = "RefreshingFromCached";
  McpServerToolsState2[McpServerToolsState2["Live"] = 4] = "Live";
  return McpServerToolsState2;
})(McpServerToolsState || {});
var McpServerTransportType = /* @__PURE__ */ ((McpServerTransportType2) => {
  McpServerTransportType2[McpServerTransportType2["Stdio"] = 1] = "Stdio";
  McpServerTransportType2[McpServerTransportType2["SSE"] = 2] = "SSE";
  return McpServerTransportType2;
})(McpServerTransportType || {});
var McpServerLaunch;
((McpServerLaunch2) => {
  function toSerialized(launch) {
    return launch;
  }
  McpServerLaunch2.toSerialized = toSerialized;
  __name(toSerialized, "toSerialized");
  function fromSerialized(launch) {
    switch (launch.type) {
      case 2 /* SSE */:
        return { type: launch.type, uri: URI.revive(launch.uri), headers: launch.headers };
      case 1 /* Stdio */:
        return {
          type: launch.type,
          cwd: launch.cwd ? URI.revive(launch.cwd) : void 0,
          command: launch.command,
          args: launch.args,
          env: launch.env,
          envFile: launch.envFile
        };
    }
  }
  McpServerLaunch2.fromSerialized = fromSerialized;
  __name(fromSerialized, "fromSerialized");
})(McpServerLaunch || (McpServerLaunch = {}));
var McpConnectionState;
((McpConnectionState2) => {
  let Kind;
  ((Kind2) => {
    Kind2[Kind2["Stopped"] = 0] = "Stopped";
    Kind2[Kind2["Starting"] = 1] = "Starting";
    Kind2[Kind2["Running"] = 2] = "Running";
    Kind2[Kind2["Error"] = 3] = "Error";
  })(Kind = McpConnectionState2.Kind || (McpConnectionState2.Kind = {}));
  McpConnectionState2.toString = /* @__PURE__ */ __name((s) => {
    switch (s.state) {
      case 0 /* Stopped */:
        return localize("mcpstate.stopped", "Stopped");
      case 1 /* Starting */:
        return localize("mcpstate.starting", "Starting");
      case 2 /* Running */:
        return localize("mcpstate.running", "Running");
      case 3 /* Error */:
        return localize("mcpstate.error", "Error {0}", s.message);
      default:
        assertNever(s);
    }
  }, "toString");
  McpConnectionState2.toKindString = /* @__PURE__ */ __name((s) => {
    switch (s) {
      case 0 /* Stopped */:
        return "stopped";
      case 1 /* Starting */:
        return "starting";
      case 2 /* Running */:
        return "running";
      case 3 /* Error */:
        return "error";
      default:
        assertNever(s);
    }
  }, "toKindString");
  McpConnectionState2.canBeStarted = /* @__PURE__ */ __name((s) => s === 3 /* Error */ || s === 0 /* Stopped */, "canBeStarted");
  McpConnectionState2.isRunning = /* @__PURE__ */ __name((s) => !(0, McpConnectionState2.canBeStarted)(s.state), "isRunning");
})(McpConnectionState || (McpConnectionState = {}));
class MpcResponseError extends Error {
  constructor(message, code, data) {
    super(`MPC ${code}: ${message}`);
    this.code = code;
    this.data = data;
  }
  static {
    __name(this, "MpcResponseError");
  }
}
class McpConnectionFailedError extends Error {
  static {
    __name(this, "McpConnectionFailedError");
  }
}
export {
  IMcpService,
  LazyCollectionState,
  McpCollectionDefinition,
  McpCollectionSortOrder,
  McpConnectionFailedError,
  McpConnectionState,
  McpServerDefinition,
  McpServerDefinitionVariableReplacement,
  McpServerLaunch,
  McpServerToolsState,
  McpServerTransportType,
  MpcResponseError,
  extensionMcpCollectionPrefix,
  extensionPrefixedIdentifier
};
//# sourceMappingURL=mcpTypes.js.map
