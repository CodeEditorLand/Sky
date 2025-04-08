var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { Platform } from "../../../../../base/common/platform.js";
import { Mutable } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { INativeMcpDiscoveryData } from "../../../../../platform/mcp/common/nativeMcpDiscoveryHelper.js";
import { DiscoverySource } from "../mcpConfiguration.js";
import { McpCollectionSortOrder, McpServerDefinition, McpServerTransportType } from "../mcpTypes.js";
function claudeConfigToServerDefinition(idPrefix, contents, cwd) {
  let parsed;
  try {
    parsed = JSON.parse(contents.toString());
  } catch {
    return;
  }
  return Object.entries(parsed.mcpServers).map(([name, server]) => {
    return {
      id: `${idPrefix}.${name}`,
      label: name,
      launch: server.url ? {
        type: McpServerTransportType.SSE,
        uri: URI.parse(server.url),
        headers: []
      } : {
        type: McpServerTransportType.Stdio,
        args: server.args || [],
        command: server.command,
        env: server.env || {},
        envFile: void 0,
        cwd
      }
    };
  });
}
__name(claudeConfigToServerDefinition, "claudeConfigToServerDefinition");
class ClaudeDesktopMpcDiscoveryAdapter {
  constructor(remoteAuthority) {
    this.remoteAuthority = remoteAuthority;
    this.id = `claude-desktop.${this.remoteAuthority}`;
  }
  static {
    __name(this, "ClaudeDesktopMpcDiscoveryAdapter");
  }
  id;
  order = McpCollectionSortOrder.Filesystem;
  discoverySource = DiscoverySource.ClaudeDesktop;
  getFilePath({ platform, winAppData, xdgHome, homedir }) {
    if (platform === Platform.Windows) {
      const appData = winAppData || URI.joinPath(homedir, "AppData", "Roaming");
      return URI.joinPath(appData, "Claude", "claude_desktop_config.json");
    } else if (platform === Platform.Mac) {
      return URI.joinPath(homedir, "Library", "Application Support", "Claude", "claude_desktop_config.json");
    } else {
      const configDir = xdgHome || URI.joinPath(homedir, ".config");
      return URI.joinPath(configDir, "Claude", "claude_desktop_config.json");
    }
  }
  adaptFile(contents, { homedir }) {
    return claudeConfigToServerDefinition(this.id, contents, homedir);
  }
}
class WindsurfDesktopMpcDiscoveryAdapter extends ClaudeDesktopMpcDiscoveryAdapter {
  static {
    __name(this, "WindsurfDesktopMpcDiscoveryAdapter");
  }
  discoverySource = DiscoverySource.Windsurf;
  constructor(remoteAuthority) {
    super(remoteAuthority);
    this.id = `windsurf.${this.remoteAuthority}`;
  }
  getFilePath({ homedir }) {
    return URI.joinPath(homedir, ".codeium", "windsurf", "mcp_config.json");
  }
}
class CursorDesktopMpcDiscoveryAdapter extends ClaudeDesktopMpcDiscoveryAdapter {
  static {
    __name(this, "CursorDesktopMpcDiscoveryAdapter");
  }
  discoverySource = DiscoverySource.CursorGlobal;
  constructor(remoteAuthority) {
    super(remoteAuthority);
    this.id = `cursor.${this.remoteAuthority}`;
  }
  getFilePath({ homedir }) {
    return URI.joinPath(homedir, ".cursor", "mcp.json");
  }
}
export {
  ClaudeDesktopMpcDiscoveryAdapter,
  CursorDesktopMpcDiscoveryAdapter,
  WindsurfDesktopMpcDiscoveryAdapter,
  claudeConfigToServerDefinition
};
//# sourceMappingURL=nativeMcpDiscoveryAdapters.js.map
