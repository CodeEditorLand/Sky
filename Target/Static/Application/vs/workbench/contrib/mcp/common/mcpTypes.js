var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals as arraysEqual } from "../../../../base/common/arrays.js";
import { assertNever } from "../../../../base/common/assert.js";
import { decodeHex, encodeHex, VSBuffer } from "../../../../base/common/buffer.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { equals as objectsEqual } from "../../../../base/common/objects.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { MCP } from "./modelContextProtocol.js";
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
    return a.id === b.id && a.label === b.label && arraysEqual(a.roots, b.roots, (a2, b2) => a2.toString() === b2.toString()) && objectsEqual(a.launch, b.launch) && objectsEqual(a.presentation, b.presentation) && objectsEqual(a.variableReplacement, b.variableReplacement) && objectsEqual(a.devMode, b.devMode);
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
const isMcpResourceTemplate = /* @__PURE__ */ __name((obj) => {
  return obj.template !== void 0;
}, "isMcpResourceTemplate");
const isMcpResource = /* @__PURE__ */ __name((obj) => {
  return obj.mcpUri !== void 0;
}, "isMcpResource");
var McpServerCacheState;
(function(McpServerCacheState2) {
  McpServerCacheState2[McpServerCacheState2["Unknown"] = 0] = "Unknown";
  McpServerCacheState2[McpServerCacheState2["Cached"] = 1] = "Cached";
  McpServerCacheState2[McpServerCacheState2["Outdated"] = 2] = "Outdated";
  McpServerCacheState2[McpServerCacheState2["RefreshingFromUnknown"] = 3] = "RefreshingFromUnknown";
  McpServerCacheState2[McpServerCacheState2["RefreshingFromCached"] = 4] = "RefreshingFromCached";
  McpServerCacheState2[McpServerCacheState2["Live"] = 5] = "Live";
})(McpServerCacheState || (McpServerCacheState = {}));
const mcpPromptReplaceSpecialChars = /* @__PURE__ */ __name((s) => s.replace(/[^a-z0-9_.-]/gi, "_"), "mcpPromptReplaceSpecialChars");
const mcpPromptPrefix = /* @__PURE__ */ __name((definition) => `/mcp.` + mcpPromptReplaceSpecialChars(definition.label), "mcpPromptPrefix");
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
          cwd: launch.cwd,
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
const IMcpWorkbenchService = createDecorator("IMcpWorkbenchService");
let McpServerContainers = class McpServerContainers2 extends Disposable {
  static {
    __name(this, "McpServerContainers");
  }
  constructor(containers, mcpWorkbenchService) {
    super();
    this.containers = containers;
    this._register(mcpWorkbenchService.onChange(this.update, this));
  }
  set mcpServer(extension) {
    this.containers.forEach((c) => c.mcpServer = extension);
  }
  update(server) {
    for (const container of this.containers) {
      if (server && container.mcpServer) {
        if (server.name === container.mcpServer.name) {
          container.mcpServer = server;
        }
      } else {
        container.update();
      }
    }
  }
};
McpServerContainers = __decorate([
  __param(1, IMcpWorkbenchService)
], McpServerContainers);
const McpServersGalleryEnabledContext = new RawContextKey("mcpServersGalleryEnabled", false);
const HasInstalledMcpServersContext = new RawContextKey("hasInstalledMcpServers", false);
const InstalledMcpServersViewId = "workbench.views.mcp.installed";
const mcpServerIcon = registerIcon("mcp-server", Codicon.mcp, localize("mcpServer", "Icon used for the MCP server."));
var McpResourceURI;
(function(McpResourceURI2) {
  McpResourceURI2.scheme = "mcp-resource";
  const emptyAuthorityPlaceholder = "dylo78gyp";
  function fromServer(def, resourceURI) {
    if (typeof resourceURI === "string") {
      resourceURI = URI.parse(resourceURI);
    }
    return resourceURI.with({
      scheme: McpResourceURI2.scheme,
      authority: encodeHex(VSBuffer.fromString(def.id)),
      path: ["", resourceURI.scheme, resourceURI.authority || emptyAuthorityPlaceholder].join("/") + resourceURI.path
    });
  }
  __name(fromServer, "fromServer");
  McpResourceURI2.fromServer = fromServer;
  function toServer(uri) {
    if (typeof uri === "string") {
      uri = URI.parse(uri);
    }
    if (uri.scheme !== McpResourceURI2.scheme) {
      throw new Error(`Invalid MCP resource URI: ${uri.toString()}`);
    }
    const parts = uri.path.split("/");
    if (parts.length < 3) {
      throw new Error(`Invalid MCP resource URI: ${uri.toString()}`);
    }
    const [, serverScheme, authority, ...path] = parts;
    return {
      definitionId: decodeHex(uri.authority).toString(),
      resourceURI: uri.with({
        scheme: serverScheme,
        authority: authority.toLowerCase() === emptyAuthorityPlaceholder ? "" : authority,
        path: path.length ? "/" + path.join("/") : ""
      })
    };
  }
  __name(toServer, "toServer");
  McpResourceURI2.toServer = toServer;
})(McpResourceURI || (McpResourceURI = {}));
var McpCapability;
(function(McpCapability2) {
  McpCapability2[McpCapability2["Logging"] = 1] = "Logging";
  McpCapability2[McpCapability2["Completions"] = 2] = "Completions";
  McpCapability2[McpCapability2["Prompts"] = 4] = "Prompts";
  McpCapability2[McpCapability2["PromptsListChanged"] = 8] = "PromptsListChanged";
  McpCapability2[McpCapability2["Resources"] = 16] = "Resources";
  McpCapability2[McpCapability2["ResourcesSubscribe"] = 32] = "ResourcesSubscribe";
  McpCapability2[McpCapability2["ResourcesListChanged"] = 64] = "ResourcesListChanged";
  McpCapability2[McpCapability2["Tools"] = 128] = "Tools";
  McpCapability2[McpCapability2["ToolsListChanged"] = 256] = "ToolsListChanged";
})(McpCapability || (McpCapability = {}));
const IMcpSamplingService = createDecorator("IMcpServerSampling");
class McpError extends Error {
  static {
    __name(this, "McpError");
  }
  static methodNotFound(method) {
    return new McpError(MCP.METHOD_NOT_FOUND, `Method not found: ${method}`);
  }
  static notAllowed() {
    return new McpError(-32e3, "The user has denied permission to call this method.");
  }
  static unknown(e) {
    const mcpError = new McpError(MCP.INTERNAL_ERROR, `Unknown error: ${e.stack}`);
    mcpError.cause = e;
    return mcpError;
  }
  constructor(code, message, data) {
    super(message);
    this.code = code;
    this.data = data;
  }
}
var McpToolName;
(function(McpToolName2) {
  McpToolName2["Prefix"] = "mcp_";
  McpToolName2[McpToolName2["MaxPrefixLen"] = 18] = "MaxPrefixLen";
  McpToolName2[McpToolName2["MaxLength"] = 64] = "MaxLength";
})(McpToolName || (McpToolName = {}));
const IMcpElicitationService = createDecorator("IMcpElicitationService");
export {
  HasInstalledMcpServersContext,
  IMcpElicitationService,
  IMcpSamplingService,
  IMcpService,
  IMcpWorkbenchService,
  InstalledMcpServersViewId,
  LazyCollectionState,
  McpCapability,
  McpCollectionDefinition,
  McpCollectionSortOrder,
  McpConnectionFailedError,
  McpConnectionState,
  McpError,
  McpResourceURI,
  McpServerCacheState,
  McpServerContainers,
  McpServerDefinition,
  McpServerDefinitionVariableReplacement,
  McpServerLaunch,
  McpServerTransportType,
  McpServersGalleryEnabledContext,
  McpToolName,
  MpcResponseError,
  extensionMcpCollectionPrefix,
  extensionPrefixedIdentifier,
  isMcpResource,
  isMcpResourceTemplate,
  mcpPromptPrefix,
  mcpPromptReplaceSpecialChars,
  mcpServerIcon
};
//# sourceMappingURL=mcpTypes.js.map
