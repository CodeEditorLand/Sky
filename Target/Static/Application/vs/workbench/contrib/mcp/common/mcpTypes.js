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
import { equals as arraysEqual } from "../../../../base/common/arrays.js";
import { assertNever } from "../../../../base/common/assert.js";
import { decodeHex, encodeHex, VSBuffer } from "../../../../base/common/buffer.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { equals as objectsEqual } from "../../../../base/common/objects.js";
import { ObservableMap } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { MCP } from "./modelContextProtocol.js";
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
  McpCollectionSortOrder2[McpCollectionSortOrder2["Plugin"] = 350] = "Plugin";
  McpCollectionSortOrder2[McpCollectionSortOrder2["Filesystem"] = 400] = "Filesystem";
  McpCollectionSortOrder2[McpCollectionSortOrder2["RemoteBoost"] = -50] = "RemoteBoost";
})(McpCollectionSortOrder || (McpCollectionSortOrder = {}));
var McpCollectionDefinition;
(function(McpCollectionDefinition2) {
  function equals(a, b) {
    return a.id === b.id && a.remoteAuthority === b.remoteAuthority && a.label === b.label && a.trustBehavior === b.trustBehavior;
  }
  __name(equals, "equals");
  McpCollectionDefinition2.equals = equals;
})(McpCollectionDefinition || (McpCollectionDefinition = {}));
var McpServerStaticToolAvailability;
(function(McpServerStaticToolAvailability2) {
  McpServerStaticToolAvailability2[McpServerStaticToolAvailability2["Initial"] = 0] = "Initial";
  McpServerStaticToolAvailability2[McpServerStaticToolAvailability2["Dynamic"] = 1] = "Dynamic";
})(McpServerStaticToolAvailability || (McpServerStaticToolAvailability = {}));
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
      staticMetadata: def.staticMetadata,
      launch: McpServerLaunch.fromSerialized(def.launch),
      sandboxEnabled: def.sandboxEnabled,
      sandbox: def.sandboxEnabled ? def.sandbox : void 0,
      variableReplacement: def.variableReplacement ? McpServerDefinitionVariableReplacement.fromSerialized(def.variableReplacement) : void 0
    };
  }
  __name(fromSerialized, "fromSerialized");
  McpServerDefinition2.fromSerialized = fromSerialized;
  function equals(a, b) {
    return a.id === b.id && a.label === b.label && a.cacheNonce === b.cacheNonce && arraysEqual(a.roots, b.roots, (a2, b2) => a2.toString() === b2.toString()) && objectsEqual(a.launch, b.launch) && objectsEqual(a.presentation, b.presentation) && objectsEqual(a.variableReplacement, b.variableReplacement) && objectsEqual(a.devMode, b.devMode) && a.sandboxEnabled === b.sandboxEnabled && objectsEqual(a.sandbox, b.sandbox);
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
var IAutostartResult;
(function(IAutostartResult2) {
  IAutostartResult2.Empty = { working: false, starting: [], serversRequiringInteraction: [] };
})(IAutostartResult || (IAutostartResult = {}));
var LazyCollectionState;
(function(LazyCollectionState2) {
  LazyCollectionState2[LazyCollectionState2["HasUnknown"] = 0] = "HasUnknown";
  LazyCollectionState2[LazyCollectionState2["LoadingUnknown"] = 1] = "LoadingUnknown";
  LazyCollectionState2[LazyCollectionState2["AllKnown"] = 2] = "AllKnown";
})(LazyCollectionState || (LazyCollectionState = {}));
const IMcpService = createDecorator("IMcpService");
class McpStartServerInteraction {
  static {
    __name(this, "McpStartServerInteraction");
  }
  constructor() {
    this.participants = new ObservableMap();
  }
}
var McpServerTrust;
(function(McpServerTrust2) {
  let Kind;
  (function(Kind2) {
    Kind2[Kind2["Trusted"] = 0] = "Trusted";
    Kind2[Kind2["TrustedOnNonce"] = 1] = "TrustedOnNonce";
    Kind2[Kind2["Untrusted"] = 2] = "Untrusted";
    Kind2[Kind2["Unknown"] = 3] = "Unknown";
  })(Kind = McpServerTrust2.Kind || (McpServerTrust2.Kind = {}));
})(McpServerTrust || (McpServerTrust = {}));
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
var McpToolVisibility;
(function(McpToolVisibility2) {
  McpToolVisibility2[McpToolVisibility2["Model"] = 1] = "Model";
  McpToolVisibility2[McpToolVisibility2["App"] = 2] = "App";
})(McpToolVisibility || (McpToolVisibility = {}));
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
        return { type: launch.type, uri: URI.revive(launch.uri), headers: launch.headers, authentication: launch.authentication };
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
  async function hash(launch) {
    const nonce = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(launch)));
    return encodeHex(VSBuffer.wrap(new Uint8Array(nonce)));
  }
  __name(hash, "hash");
  McpServerLaunch2.hash = hash;
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
class UserInteractionRequiredError extends Error {
  static {
    __name(this, "UserInteractionRequiredError");
  }
  static {
    this.prefix = "User interaction required: ";
  }
  static is(error) {
    return error.message.startsWith(this.prefix);
  }
  constructor(reason) {
    super(`${UserInteractionRequiredError.prefix}${reason}`);
    this.reason = reason;
  }
}
var McpServerEnablementState;
(function(McpServerEnablementState2) {
  McpServerEnablementState2[McpServerEnablementState2["Disabled"] = 0] = "Disabled";
  McpServerEnablementState2[McpServerEnablementState2["DisabledByAccess"] = 1] = "DisabledByAccess";
  McpServerEnablementState2[McpServerEnablementState2["Enabled"] = 2] = "Enabled";
})(McpServerEnablementState || (McpServerEnablementState = {}));
var McpServerInstallState;
(function(McpServerInstallState2) {
  McpServerInstallState2[McpServerInstallState2["Installing"] = 0] = "Installing";
  McpServerInstallState2[McpServerInstallState2["Installed"] = 1] = "Installed";
  McpServerInstallState2[McpServerInstallState2["Uninstalling"] = 2] = "Uninstalling";
  McpServerInstallState2[McpServerInstallState2["Uninstalled"] = 3] = "Uninstalled";
})(McpServerInstallState || (McpServerInstallState = {}));
var McpServerEditorTab;
(function(McpServerEditorTab2) {
  McpServerEditorTab2["Readme"] = "readme";
  McpServerEditorTab2["Manifest"] = "manifest";
  McpServerEditorTab2["Configuration"] = "configuration";
})(McpServerEditorTab || (McpServerEditorTab = {}));
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
        if (server.id === container.mcpServer.id) {
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
const McpServersGalleryStatusContext = new RawContextKey(
  "mcpServersGalleryStatus",
  "unavailable"
  /* McpGalleryManifestStatus.Unavailable */
);
const HasInstalledMcpServersContext = new RawContextKey("hasInstalledMcpServers", true);
const InstalledMcpServersViewId = "workbench.views.mcp.installed";
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
    const url = new URL(`${serverScheme}://${authority.toLowerCase() === emptyAuthorityPlaceholder ? "" : authority}`);
    url.pathname = path.length ? "/" + path.join("/") : "";
    url.search = uri.query;
    url.hash = uri.fragment;
    return {
      definitionId: decodeHex(uri.authority).toString(),
      resourceURL: url
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
var ElicitationKind;
(function(ElicitationKind2) {
  ElicitationKind2[ElicitationKind2["Form"] = 0] = "Form";
  ElicitationKind2[ElicitationKind2["URL"] = 1] = "URL";
})(ElicitationKind || (ElicitationKind = {}));
const IMcpElicitationService = createDecorator("IMcpElicitationService");
const McpToolResourceLinkMimeType = "application/vnd.code.resource-link";
export {
  ElicitationKind,
  HasInstalledMcpServersContext,
  IAutostartResult,
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
  McpServerEditorTab,
  McpServerEnablementState,
  McpServerInstallState,
  McpServerLaunch,
  McpServerStaticToolAvailability,
  McpServerTransportType,
  McpServerTrust,
  McpServersGalleryStatusContext,
  McpStartServerInteraction,
  McpToolName,
  McpToolResourceLinkMimeType,
  McpToolVisibility,
  MpcResponseError,
  UserInteractionRequiredError,
  extensionMcpCollectionPrefix,
  extensionPrefixedIdentifier,
  isMcpResource,
  isMcpResourceTemplate,
  mcpPromptPrefix,
  mcpPromptReplaceSpecialChars
};
//# sourceMappingURL=mcpTypes.js.map
