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
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { parseEnvFile } from "../../../base/common/envfile.js";
import { URI } from "../../../base/common/uri.js";
import { StreamSplitter } from "../../../base/node/nodeStreams.js";
import { LogLevel } from "../../../platform/log/common/log.js";
import { McpConnectionState, McpServerLaunch, McpServerTransportStdio, McpServerTransportType } from "../../contrib/mcp/common/mcpTypes.js";
import { ExtHostMcpService } from "../common/extHostMcp.js";
import { IExtHostRpcService } from "../common/extHostRpcService.js";
import { findExecutable } from "../../../base/node/processes.js";
let NodeExtHostMpcService = class extends ExtHostMcpService {
  static {
    __name(this, "NodeExtHostMpcService");
  }
  constructor(extHostRpc) {
    super(extHostRpc);
  }
  nodeServers = /* @__PURE__ */ new Map();
  _startMcp(id, launch) {
    if (launch.type === McpServerTransportType.Stdio) {
      this.startNodeMpc(id, launch);
    } else {
      super._startMcp(id, launch);
    }
  }
  $stopMcp(id) {
    const nodeServer = this.nodeServers.get(id);
    if (nodeServer) {
      nodeServer.abortCtrl.abort();
      this.nodeServers.delete(id);
    } else {
      super.$stopMcp(id);
    }
  }
  $sendMessage(id, message) {
    const nodeServer = this.nodeServers.get(id);
    if (nodeServer) {
      nodeServer.child.stdin.write(message + "\n");
    } else {
      super.$sendMessage(id, message);
    }
  }
  async startNodeMpc(id, launch) {
    const onError = /* @__PURE__ */ __name((err) => this._proxy.$onDidChangeState(id, {
      state: McpConnectionState.Kind.Error,
      message: typeof err === "string" ? err : err.message
    }), "onError");
    const env = { ...process.env };
    if (launch.envFile) {
      try {
        for (const [key, value] of parseEnvFile(await readFile(launch.envFile, "utf-8"))) {
          env[key] = value;
        }
      } catch (e) {
        onError(`Failed to read envFile '${launch.envFile}': ${e.message}`);
        return;
      }
    }
    for (const [key, value] of Object.entries(launch.env)) {
      env[key] = value === null ? void 0 : String(value);
    }
    const abortCtrl = new AbortController();
    let child;
    try {
      const cwd = launch.cwd ? URI.revive(launch.cwd).fsPath : homedir();
      const { executable, args, shell } = await formatSubprocessArguments(launch.command, launch.args, cwd, env);
      this._proxy.$onDidPublishLog(id, LogLevel.Debug, `Server command line: ${executable} ${args.join(" ")}`);
      child = spawn(executable, args, {
        stdio: "pipe",
        cwd: launch.cwd ? URI.revive(launch.cwd).fsPath : homedir(),
        signal: abortCtrl.signal,
        env,
        shell
      });
    } catch (e) {
      onError(e);
      abortCtrl.abort();
      return;
    }
    this._proxy.$onDidChangeState(id, { state: McpConnectionState.Kind.Starting });
    child.stdout.pipe(new StreamSplitter("\n")).on("data", (line) => this._proxy.$onDidReceiveMessage(id, line.toString()));
    child.stdin.on("error", onError);
    child.stdout.on("error", onError);
    child.stderr.pipe(new StreamSplitter("\n")).on("data", (line) => this._proxy.$onDidPublishLog(id, LogLevel.Warning, `[server stderr] ${line.toString().trimEnd()}`));
    child.on("spawn", () => this._proxy.$onDidChangeState(id, { state: McpConnectionState.Kind.Running }));
    child.on("error", (e) => {
      if (abortCtrl.signal.aborted) {
        this._proxy.$onDidChangeState(id, { state: McpConnectionState.Kind.Stopped });
      } else {
        onError(e);
      }
    });
    child.on(
      "exit",
      (code) => code === 0 || abortCtrl.signal.aborted ? this._proxy.$onDidChangeState(id, { state: McpConnectionState.Kind.Stopped }) : this._proxy.$onDidChangeState(id, {
        state: McpConnectionState.Kind.Error,
        message: `Process exited with code ${code}`
      })
    );
    this.nodeServers.set(id, { abortCtrl, child });
  }
};
NodeExtHostMpcService = __decorateClass([
  __decorateParam(0, IExtHostRpcService)
], NodeExtHostMpcService);
const windowsShellScriptRe = /\.(bat|cmd)$/i;
const formatSubprocessArguments = /* @__PURE__ */ __name(async (executable, args, cwd, env) => {
  if (process.platform !== "win32") {
    return { executable, args, shell: false };
  }
  const found = await findExecutable(executable, cwd, void 0, env);
  if (found && windowsShellScriptRe.test(found)) {
    const quote = /* @__PURE__ */ __name((s) => s.includes(" ") ? `"${s}"` : s, "quote");
    return {
      executable: quote(found),
      args: args.map(quote),
      shell: true
    };
  }
  return { executable, args, shell: false };
}, "formatSubprocessArguments");
export {
  NodeExtHostMpcService,
  formatSubprocessArguments
};
//# sourceMappingURL=extHostMpcNode.js.map
