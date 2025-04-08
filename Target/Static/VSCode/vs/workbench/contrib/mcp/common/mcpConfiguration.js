var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IJSONSchema } from "../../../../base/common/jsonSchema.js";
import { localize } from "../../../../nls.js";
import { IMcpCollectionContribution } from "../../../../platform/extensions/common/extensions.js";
import { mcpSchemaId } from "../../../services/configuration/common/configuration.js";
import { inputsSchema } from "../../../services/configurationResolver/common/configurationResolverSchema.js";
import { IExtensionPointDescriptor } from "../../../services/extensions/common/extensionsRegistry.js";
const mcpActivationEventPrefix = "onMcpCollection:";
const mcpActivationEvent = /* @__PURE__ */ __name((collectionId) => mcpActivationEventPrefix + collectionId, "mcpActivationEvent");
const mcpSchemaExampleServer = {
  command: "node",
  args: ["my-mcp-server.js"],
  env: {}
};
var DiscoverySource = /* @__PURE__ */ ((DiscoverySource2) => {
  DiscoverySource2["ClaudeDesktop"] = "claude-desktop";
  DiscoverySource2["Windsurf"] = "windsurf";
  DiscoverySource2["CursorGlobal"] = "cursor-global";
  DiscoverySource2["CursorWorkspace"] = "cursor-workspace";
  return DiscoverySource2;
})(DiscoverySource || {});
const allDiscoverySources = Object.keys({
  ["claude-desktop" /* ClaudeDesktop */]: true,
  ["windsurf" /* Windsurf */]: true,
  ["cursor-global" /* CursorGlobal */]: true,
  ["cursor-workspace" /* CursorWorkspace */]: true
});
const discoverySourceLabel = {
  ["claude-desktop" /* ClaudeDesktop */]: localize("mcp.discovery.source.claude-desktop", "Claude Desktop"),
  ["windsurf" /* Windsurf */]: localize("mcp.discovery.source.windsurf", "Windsurf"),
  ["cursor-global" /* CursorGlobal */]: localize("mcp.discovery.source.cursor-global", "Cursor (Global)"),
  ["cursor-workspace" /* CursorWorkspace */]: localize("mcp.discovery.source.cursor-workspace", "Cursor (Workspace)")
};
const mcpConfigurationSection = "mcp";
const mcpDiscoverySection = "chat.mcp.discovery.enabled";
const mcpEnabledSection = "chat.mcp.enabled";
const mcpSchemaExampleServers = {
  "mcp-server-time": {
    command: "python",
    args: ["-m", "mcp_server_time", "--local-timezone=America/Los_Angeles"],
    env: {}
  }
};
const mcpStdioServerSchema = {
  type: "object",
  additionalProperties: false,
  examples: [mcpSchemaExampleServer],
  properties: {
    type: {
      type: "string",
      enum: ["stdio"],
      description: localize("app.mcp.json.type", "The type of the server.")
    },
    command: {
      type: "string",
      description: localize("app.mcp.json.command", "The command to run the server.")
    },
    args: {
      type: "array",
      description: localize("app.mcp.args.command", "Arguments passed to the server."),
      items: {
        type: "string"
      }
    },
    envFile: {
      type: "string",
      description: localize("app.mcp.envFile.command", "Path to a file containing environment variables for the server."),
      examples: ["${workspaceFolder}/.env"]
    },
    env: {
      description: localize("app.mcp.env.command", "Environment variables passed to the server."),
      additionalProperties: {
        anyOf: [
          { type: "null" },
          { type: "string" },
          { type: "number" }
        ]
      }
    }
  }
};
const mcpServerSchema = {
  id: mcpSchemaId,
  type: "object",
  title: localize("app.mcp.json.title", "Model Context Protocol Servers"),
  allowTrailingCommas: true,
  allowComments: true,
  additionalProperties: false,
  properties: {
    servers: {
      examples: [mcpSchemaExampleServers],
      additionalProperties: {
        oneOf: [mcpStdioServerSchema, {
          type: "object",
          additionalProperties: false,
          required: ["url", "type"],
          examples: [{
            type: "sse",
            url: "http://localhost:3001",
            headers: {}
          }],
          properties: {
            type: {
              type: "string",
              enum: ["sse"],
              description: localize("app.mcp.json.type", "The type of the server.")
            },
            url: {
              type: "string",
              format: "uri",
              description: localize("app.mcp.json.url", "The URL of the server-sent-event (SSE) server.")
            },
            env: {
              description: localize("app.mcp.json.headers", "Additional headers sent to the server."),
              additionalProperties: { type: "string" }
            }
          }
        }]
      }
    },
    inputs: inputsSchema.definitions.inputs
  }
};
const mcpContributionPoint = {
  extensionPoint: "modelContextServerCollections",
  activationEventsGenerator(contribs, result) {
    for (const contrib of contribs) {
      if (contrib.id) {
        result.push(mcpActivationEvent(contrib.id));
      }
    }
  },
  jsonSchema: {
    description: localize("vscode.extension.contributes.mcp", "Contributes Model Context Protocol servers. Users of this should also use `vscode.lm.registerMcpConfigurationProvider`."),
    type: "array",
    defaultSnippets: [{ body: [{ id: "", label: "" }] }],
    items: {
      additionalProperties: false,
      type: "object",
      defaultSnippets: [{ body: { id: "", label: "" } }],
      properties: {
        id: {
          description: localize("vscode.extension.contributes.mcp.id", "Unique ID for the collection."),
          type: "string"
        },
        label: {
          description: localize("vscode.extension.contributes.mcp.label", "Display name for the collection."),
          type: "string"
        }
      }
    }
  }
};
export {
  DiscoverySource,
  allDiscoverySources,
  discoverySourceLabel,
  mcpActivationEvent,
  mcpConfigurationSection,
  mcpContributionPoint,
  mcpDiscoverySection,
  mcpEnabledSection,
  mcpSchemaExampleServers,
  mcpServerSchema,
  mcpStdioServerSchema
};
//# sourceMappingURL=mcpConfiguration.js.map
