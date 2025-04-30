var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals as arraysEqual } from "../../../../base/common/arrays.js";
import { assertNever } from "../../../../base/common/assert.js";
import { equals as objectsEqual } from "../../../../base/common/objects.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const extensionMcpCollectionPrefix = "ext.";
function extensionPrefixedIdentifier(identifier, id) {
  return ExtensionIdentifier.toKey(identifier) + "/" + id;
}
__name(extensionPrefixedIdentifier, "extensionPrefixedIdentifier");
var McpCollectionSortOrder;
(function(McpCollectionSortOrder2) {
  McpCollectionSortOrder2[McpCollectionSortOrder2["WorkspaceFolder"] = 0] = "WorkspaceFolder";
  McpCollectionSortOrder2[McpCollectionSortOrder2["Workspace"] = 100] = "Workspace";
  McpCollectionSortOrder2[McpCollectionSortOrder2["User"] = 200] = "User";
  McpCollectionSortOrder2[McpCollectionSortOrder2["Extension"] = 300] = "Extension";
  McpCollectionSortOrder2[McpCollectionSortOrder2["Filesystem"] = 400] = "Filesystem";
  McpCollectionSortOrder2[McpCollectionSortOrder2["RemoteBoost"] = -50] = "RemoteBoost";
})(McpCollectionSortOrder || (McpCollectionSortOrder = {}));
var McpCollectionDefinition;
(function(McpCollectionDefinition2) {
  function equals(a, b) {
    return a.id === b.id && a.remoteAuthority === b.remoteAuthority && a.label === b.label && a.isTrustedByDefault === b.isTrustedByDefault;
  }
  __name(equals, "equals");
  McpCollectionDefinition2.equals = equals;
})(McpCollectionDefinition || (McpCollectionDefinition = {}));
var McpServerDefinition;
(function(McpServerDefinition2) {
  function toSerialized(def) {
    return def;
  }
  __name(toSerialized, "toSerialized");
  McpServerDefinition2.toSerialized = toSerialized;
  function fromSerialized(def) {
    return {
      id: def.id,
      label: def.label,
      cacheNonce: def.cacheNonce,
      launch: McpServerLaunch.fromSerialized(def.launch),
      variableReplacement: def.variableReplacement ? McpServerDefinitionVariableReplacement.fromSerialized(def.variableReplacement) : void 0
    };
  }
  __name(fromSerialized, "fromSerialized");
  McpServerDefinition2.fromSerialized = fromSerialized;
  function equals(a, b) {
    return a.id === b.id && a.label === b.label && arraysEqual(a.roots, b.roots, (a2, b2) => a2.toString() === b2.toString()) && objectsEqual(a.launch, b.launch) && objectsEqual(a.presentation, b.presentation) && objectsEqual(a.variableReplacement, b.variableReplacement);
  }
  __name(equals, "equals");
  McpServerDefinition2.equals = equals;
})(McpServerDefinition || (McpServerDefinition = {}));
var McpServerDefinitionVariableReplacement;
(function(McpServerDefinitionVariableReplacement2) {
  function toSerialized(def) {
    return def;
  }
  __name(toSerialized, "toSerialized");
  McpServerDefinitionVariableReplacement2.toSerialized = toSerialized;
  function fromSerialized(def) {
    return {
      section: def.section,
      folder: def.folder ? { ...def.folder, uri: URI.revive(def.folder.uri) } : void 0,
      target: def.target
    };
  }
  __name(fromSerialized, "fromSerialized");
  McpServerDefinitionVariableReplacement2.fromSerialized = fromSerialized;
})(McpServerDefinitionVariableReplacement || (McpServerDefinitionVariableReplacement = {}));
var LazyCollectionState;
(function(LazyCollectionState2) {
  LazyCollectionState2[LazyCollectionState2["HasUnknown"] = 0] = "HasUnknown";
  LazyCollectionState2[LazyCollectionState2["LoadingUnknown"] = 1] = "LoadingUnknown";
  LazyCollectionState2[LazyCollectionState2["AllKnown"] = 2] = "AllKnown";
})(LazyCollectionState || (LazyCollectionState = {}));
const IMcpService = createDecorator("IMcpService");
var McpServerToolsState;
(function(McpServerToolsState2) {
  McpServerToolsState2[McpServerToolsState2["Unknown"] = 0] = "Unknown";
  McpServerToolsState2[McpServerToolsState2["Cached"] = 1] = "Cached";
  McpServerToolsState2[McpServerToolsState2["Outdated"] = 2] = "Outdated";
  McpServerToolsState2[McpServerToolsState2["RefreshingFromUnknown"] = 3] = "RefreshingFromUnknown";
  McpServerToolsState2[McpServerToolsState2["RefreshingFromCached"] = 4] = "RefreshingFromCached";
  McpServerToolsState2[McpServerToolsState2["Live"] = 5] = "Live";
})(McpServerToolsState || (McpServerToolsState = {}));
var McpServerTransportType;
(function(McpServerTransportType2) {
  McpServerTransportType2[McpServerTransportType2["Stdio"] = 1] = "Stdio";
  McpServerTransportType2[McpServerTransportType2["HTTP"] = 2] = "HTTP";
})(McpServerTransportType || (McpServerTransportType = {}));
var McpServerLaunch;
(function(McpServerLaunch2) {
  function toSerialized(launch) {
    return launch;
  }
  __name(toSerialized, "toSerialized");
  McpServerLaunch2.toSerialized = toSerialized;
  function fromSerialized(launch) {
    switch (launch.type) {
      case 2:
        return { type: launch.type, uri: URI.revive(launch.uri), headers: launch.headers };
      case 1:
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
  __name(fromSerialized, "fromSerialized");
  McpServerLaunch2.fromSerialized = fromSerialized;
})(McpServerLaunch || (McpServerLaunch = {}));
var McpConnectionState;
(function(McpConnectionState2) {
  let Kind;
  (function(Kind2) {
    Kind2[Kind2["Stopped"] = 0] = "Stopped";
    Kind2[Kind2["Starting"] = 1] = "Starting";
    Kind2[Kind2["Running"] = 2] = "Running";
    Kind2[Kind2["Error"] = 3] = "Error";
  })(Kind = McpConnectionState2.Kind || (McpConnectionState2.Kind = {}));
  McpConnectionState2.toString = (s) => {
    switch (s.state) {
      case 0:
        return localize("mcpstate.stopped", "Stopped");
      case 1:
        return localize("mcpstate.starting", "Starting");
      case 2:
        return localize("mcpstate.running", "Running");
      case 3:
        return localize("mcpstate.error", "Error {0}", s.message);
      default:
        assertNever(s);
    }
  };
  McpConnectionState2.toKindString = (s) => {
    switch (s) {
      case 0:
        return "stopped";
      case 1:
        return "starting";
      case 2:
        return "running";
      case 3:
        return "error";
      default:
        assertNever(s);
    }
  };
  McpConnectionState2.canBeStarted = (s) => s === 3 || s === 0;
  McpConnectionState2.isRunning = (s) => !McpConnectionState2.canBeStarted(s.state);
})(McpConnectionState || (McpConnectionState = {}));
class MpcResponseError extends Error {
  static {
    __name(this, "MpcResponseError");
  }
  constructor(message, code, data) {
    super(`MPC ${code}: ${message}`);
    this.code = code;
    this.data = data;
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
