var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals as arraysEqual } from "../../../../base/common/arrays.js";
import { assertNever } from "../../../../base/common/assert.js";
import { Throttler } from "../../../../base/common/async.js";
import * as glob from "../../../../base/common/glob.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { equals as objectsEqual } from "../../../../base/common/objects.js";
import { autorun, autorunDelta, derivedOpts } from "../../../../base/common/observable.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IDebugService } from "../../debug/common/debug.js";
import { IMcpRegistry } from "./mcpRegistryTypes.js";
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
let McpDevModeServerAttache = class McpDevModeServerAttache2 extends Disposable {
  static {
    __name(this, "McpDevModeServerAttache");
  }
  constructor(server, fwdRef, registry, fileService, workspaceContextService) {
    super();
    this.active = false;
    const workspaceFolder = server.readDefinitions().map(({ collection }) => collection?.presentation?.origin && workspaceContextService.getWorkspaceFolder(collection.presentation?.origin)?.uri);
    const restart = /* @__PURE__ */ __name(async () => {
      const lastDebugged = fwdRef.lastModeDebugged;
      await server.stop();
      await server.start({ isFromInteraction: false, debug: lastDebugged });
    }, "restart");
    let didAutoStart = false;
    this._register(autorun((reader) => {
      const defs = server.readDefinitions().read(reader);
      if (!defs.collection || !defs.server || !defs.server.devMode) {
        didAutoStart = false;
        return;
      }
      if (didAutoStart) {
        return;
      }
      const delegates = registry.delegates.read(reader);
      if (!delegates.some((d) => d.canStart(defs.collection, defs.server))) {
        return;
      }
      server.start();
      didAutoStart = true;
    }));
    const debugMode = server.readDefinitions().map((d) => !!d.server?.devMode?.debug);
    this._register(autorunDelta(debugMode, ({ lastValue, newValue }) => {
      if (!!newValue && !objectsEqual(lastValue, newValue)) {
        restart();
      }
    }));
    const watchObs = derivedOpts({ equalsFn: arraysEqual }, (reader) => {
      const def = server.readDefinitions().read(reader);
      const watch = def.server?.devMode?.watch;
      return typeof watch === "string" ? [watch] : watch;
    });
    const restartScheduler = this._register(new Throttler());
    this._register(autorun((reader) => {
      const pattern = watchObs.read(reader);
      const wf = workspaceFolder.read(reader);
      if (!pattern || !wf) {
        return;
      }
      const includes = pattern.filter((p) => !p.startsWith("!"));
      const excludes = pattern.filter((p) => p.startsWith("!")).map((p) => p.slice(1));
      reader.store.add(fileService.watch(wf, { includes, excludes, recursive: true }));
      const includeParse = includes.map((p) => glob.parse({ base: wf.fsPath, pattern: p }));
      const excludeParse = excludes.map((p) => glob.parse({ base: wf.fsPath, pattern: p }));
      reader.store.add(fileService.onDidFilesChange((e) => {
        for (const change of [e.rawAdded, e.rawDeleted, e.rawUpdated]) {
          for (const uri of change) {
            if (includeParse.some((i) => i(uri.fsPath)) && !excludeParse.some((e2) => e2(uri.fsPath))) {
              restartScheduler.queue(restart);
              break;
            }
          }
        }
      }));
    }));
  }
};
McpDevModeServerAttache = __decorate([
  __param(2, IMcpRegistry),
  __param(3, IFileService),
  __param(4, IWorkspaceContextService)
], McpDevModeServerAttache);
const IMcpDevModeDebugging = createDecorator("mcpDevModeDebugging");
const DEBUG_HOST = "127.0.0.1";
let McpDevModeDebugging = class McpDevModeDebugging2 {
  static {
    __name(this, "McpDevModeDebugging");
  }
  constructor(_debugService, _commandService) {
    this._debugService = _debugService;
    this._commandService = _commandService;
  }
  async transform(definition, launch) {
    if (!definition.devMode?.debug || launch.type !== 1) {
      return launch;
    }
    const port = await this.getDebugPort();
    const name = `MCP: ${definition.label}`;
    const options = { startedByUser: false, suppressDebugView: true };
    const commonConfig = {
      internalConsoleOptions: "neverOpen",
      suppressMultipleSessionWarning: true
    };
    switch (definition.devMode.debug.type) {
      case "node": {
        if (!/node[0-9]*$/.test(launch.command)) {
          throw new Error(localize("mcp.debug.nodeBinReq", 'MCP server must be launched with the "node" executable to enable debugging, but was launched with "{0}"', launch.command));
        }
        this._debugService.startDebugging(void 0, {
          type: "pwa-node",
          request: "attach",
          name,
          port,
          host: DEBUG_HOST,
          timeout: 3e4,
          continueOnAttach: true,
          ...commonConfig
        }, options);
        return { ...launch, args: [`--inspect-brk=${DEBUG_HOST}:${port}`, ...launch.args] };
      }
      case "debugpy": {
        if (!/python[0-9.]*$/.test(launch.command)) {
          throw new Error(localize("mcp.debug.pythonBinReq", 'MCP server must be launched with the "python" executable to enable debugging, but was launched with "{0}"', launch.command));
        }
        let command;
        let args = ["--wait-for-client", "--connect", `${DEBUG_HOST}:${port}`, ...launch.args];
        if (definition.devMode.debug.debugpyPath) {
          command = definition.devMode.debug.debugpyPath;
        } else {
          try {
            const debugPyPath = await this._commandService.executeCommand("python.getDebugpyPackagePath");
            if (debugPyPath) {
              command = launch.command;
              args = [debugPyPath, ...args];
            }
          } catch {
          }
        }
        if (!command) {
          command = "debugpy";
        }
        await Promise.race([
          // eslint-disable-next-line local/code-no-dangerous-type-assertions
          this._debugService.startDebugging(void 0, {
            type: "debugpy",
            name,
            request: "attach",
            listen: {
              host: DEBUG_HOST,
              port
            },
            ...commonConfig
          }, options),
          this.ensureListeningOnPort(port)
        ]);
        return { ...launch, command, args };
      }
      default:
        assertNever(definition.devMode.debug, `Unknown debug type ${JSON.stringify(definition.devMode.debug)}`);
    }
  }
  ensureListeningOnPort(port) {
    return Promise.resolve();
  }
  getDebugPort() {
    return Promise.resolve(9230);
  }
};
McpDevModeDebugging = __decorate([
  __param(0, IDebugService),
  __param(1, ICommandService)
], McpDevModeDebugging);
export {
  IMcpDevModeDebugging,
  McpDevModeDebugging,
  McpDevModeServerAttache
};
//# sourceMappingURL=mcpDevMode.js.map
