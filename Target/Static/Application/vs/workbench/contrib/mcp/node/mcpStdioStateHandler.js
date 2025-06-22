var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { TimeoutTimer } from "../../../../base/common/async.js";
import { killTree } from "../../../../base/node/processes.js";
import { isWindows } from "../../../../base/common/platform.js";
var McpProcessState;
(function(McpProcessState2) {
  McpProcessState2[McpProcessState2["Running"] = 0] = "Running";
  McpProcessState2[McpProcessState2["StdinEnded"] = 1] = "StdinEnded";
  McpProcessState2[McpProcessState2["KilledPolite"] = 2] = "KilledPolite";
  McpProcessState2[McpProcessState2["KilledForceful"] = 3] = "KilledForceful";
})(McpProcessState || (McpProcessState = {}));
class McpStdioStateHandler {
  static {
    __name(this, "McpStdioStateHandler");
  }
  static {
    this.GRACE_TIME_MS = 1e4;
  }
  get stopped() {
    return this._procState !== 0;
  }
  constructor(_child, _graceTimeMs = McpStdioStateHandler.GRACE_TIME_MS) {
    this._child = _child;
    this._graceTimeMs = _graceTimeMs;
    this._procState = 0;
  }
  /**
   * Initiates graceful shutdown. If called while shutdown is already in progress,
   * forces immediate termination.
   */
  stop() {
    if (this._procState === 0) {
      try {
        this._child.stdin.end();
      } catch (error) {
      }
      this._nextTimeout = new TimeoutTimer(() => this.killPolite(), this._graceTimeMs);
    } else {
      this._nextTimeout?.dispose();
      this.killForceful();
    }
  }
  async killPolite() {
    this._procState = 2;
    this._nextTimeout = new TimeoutTimer(() => this.killForceful(), this._graceTimeMs);
    if (this._child.pid) {
      if (!isWindows) {
        await killTree(this._child.pid, false).catch(() => {
          this._child.kill("SIGTERM");
        });
      }
    } else {
      this._child.kill("SIGTERM");
    }
  }
  async killForceful() {
    this._procState = 3;
    if (this._child.pid) {
      await killTree(this._child.pid, true).catch(() => {
        this._child.kill("SIGKILL");
      });
    } else {
      this._child.kill();
    }
  }
  write(message) {
    if (!this.stopped) {
      this._child.stdin.write(message + "\n");
    }
  }
  dispose() {
    this._nextTimeout?.dispose();
  }
}
export {
  McpStdioStateHandler
};
//# sourceMappingURL=mcpStdioStateHandler.js.map
