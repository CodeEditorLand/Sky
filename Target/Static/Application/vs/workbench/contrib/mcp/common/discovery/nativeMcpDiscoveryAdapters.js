var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../../base/common/uri.js";
import { McpServerLaunch } from "../mcpTypes.js";
async function claudeConfigToServerDefinition(idPrefix, contents, cwd) {
  let parsed;
  try {
    parsed = JSON.parse(contents.toString());
  } catch {
    return;
  }
  return Promise.all(Object.entries(parsed.mcpServers).map(async ([name, server]) => {
    const launch = server.url ? {
      type: 2,
      uri: URI.parse(server.url),
      headers: []
    } : {
      type: 1,
      args: server.args || [],
      command: server.command,
      env: server.env || {},
      envFile: void 0,
      cwd: cwd?.fsPath
    };
    return {
      id: `${idPrefix}.${name}`,
      label: name,
      launch,
      cacheNonce: await McpServerLaunch.hash(launch)
    };
  }));
}
__name(claudeConfigToServerDefinition, "claudeConfigToServerDefinition");
class ClaudeDesktopMpcDiscoveryAdapter {
  static {
    __name(this, "ClaudeDesktopMpcDiscoveryAdapter");
  }
  constructor(remoteAuthority) {
    this.remoteAuthority = remoteAuthority;
    this.order = 400;
    this.discoverySource = "claude-desktop";
    this.id = `claude-desktop.${this.remoteAuthority}`;
  }
  getFilePath({ platform, winAppData, xdgHome, homedir }) {
    if (platform === 3) {
      const appData = winAppData || URI.joinPath(homedir, "AppData", "Roaming");
      return URI.joinPath(appData, "Claude", "claude_desktop_config.json");
    } else if (platform === 1) {
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
  constructor(remoteAuthority) {
    super(remoteAuthority);
    this.discoverySource = "windsurf";
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
  constructor(remoteAuthority) {
    super(remoteAuthority);
    this.discoverySource = "cursor-global";
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
