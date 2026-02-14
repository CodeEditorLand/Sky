var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function invokeTauri(command, args = {}) {
  try {
    if (typeof window.__TAURI__?.invoke !== "undefined") {
      return await window.__TAURI__.invoke(command, args);
    }
    if (typeof window.TAURI?.invoke !== "undefined") {
      return await window.TAURI.invoke(command, args);
    }
    throw new Error(`Tauri invoke not available for command: ${command}`);
  } catch (error) {
    console.error(`[ChildProcessPolyfill] Tauri invoke failed for ${command}:`, error);
    throw error;
  }
}
__name(invokeTauri, "invokeTauri");
function listenToTauri(event, handler) {
  if (typeof window.__TAURI__?.event?.listen === "function") {
    const unlistenPromise = window.__TAURI__.event.listen(event, ({ payload }) => {
      handler(payload);
    });
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }
  if (typeof window.TAURI?.event?.listen === "function") {
    const unlistenPromise = window.TAURI.event.listen(event, ({ payload }) => {
      handler(payload);
    });
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }
  console.warn(`[ChildProcessPolyfill] Tauri event listener not available for: ${event}`);
  return () => {
  };
}
__name(listenToTauri, "listenToTauri");
function createMockStream(direction) {
  const listeners = /* @__PURE__ */ new Map();
  return {
    write(data) {
      console.log(`[ChildProcessPolyfill] Stream write (${direction}):`, data.toString().slice(0, 100));
      return true;
    },
    end(data) {
      console.log(`[ChildProcessPolyfill] Stream end (${direction})`);
      this.emit("end");
    },
    on(event, listener) {
      if (!listeners.has(event)) {
        listeners.set(event, /* @__PURE__ */ new Set());
      }
      listeners.get(event).add(listener);
    },
    removeAllListeners(event) {
      if (event) {
        listeners.delete(event);
      } else {
        listeners.clear();
      }
    },
    emit(event, ...args) {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach((listener) => {
          try {
            listener(...args);
          } catch (error) {
            console.error(`[ChildProcessPolyfill] Stream event error (${event}):`, error);
          }
        });
      }
    }
  };
}
__name(createMockStream, "createMockStream");
class ChildProcess {
  static {
    __name(this, "ChildProcess");
  }
  // Process state
  pid = 0;
  killed = false;
  exitCode = null;
  signalCode = null;
  // Streams
  stdin;
  stdout;
  stderr;
  stdio;
  // Event listeners
  listeners = /* @__PURE__ */ new Map();
  // Process ID tracking
  _sPid;
  constructor(spawnId) {
    this._sPid = spawnId;
    this.stdin = createMockStream("write");
    this.stdout = createMockStream("read");
    this.stderr = createMockStream("read");
    this.stdio = [this.stdin, this.stdout, this.stderr];
    this.setupEventListeners();
  }
  /**
   * Set up Tauri event listeners for this process
   */
  setupEventListeners() {
    const unlistenSpawn = listenToTauri(`child_process:spawn:${this._sPid}`, (payload) => {
      console.log(`[ChildProcessPolyfill] Spawn event for ${this._sPid}:`, payload);
      this.emit("spawn");
    });
    const unlistenExit = listenToTauri(`child_process:exit:${this._sPid}`, (payload) => {
      console.log(`[ChildProcessPolyfill] Exit event for ${this._sPid}:`, payload);
      const data = payload;
      this.exitCode = data.exit_code;
      this.signalCode = data.signal;
      this.killed = true;
      this.emit("exit", this.exitCode, this.signalCode);
      this.emit("close", this.exitCode, this.signalCode);
    });
    const unlistenError = listenToTauri(`child_process:error:${this._sPid}`, (payload) => {
      console.error(`[ChildProcessPolyfill] Error event for ${this._sPid}:`, payload);
      this.emit("error", payload);
    });
    const unlistenStdout = listenToTauri(`child_process:stdout:${this._sPid}`, (payload) => {
      const data = payload;
      this.stdout.emit("data", data.data instanceof Buffer ? data.data : Buffer.from(data.data));
    });
    const unlistenStderr = listenToTauri(`child_process:stderr:${this._sPid}`, (payload) => {
      const data = payload;
      this.stderr.emit("data", data.data instanceof Buffer ? data.data : Buffer.from(data.data));
    });
    this._unlistenFunctions = [
      unlistenSpawn,
      unlistenExit,
      unlistenError,
      unlistenStdout,
      unlistenStderr
    ];
  }
  _unlistenFunctions = [];
  // ============================================================================
  // Event Methods
  // ============================================================================
  /**
   * Add event listener
   */
  on(event, listener) {
    console.log(`[ChildProcessPolyfill] on(${event}) for ${this._sPid}`);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(listener);
    return this;
  }
  /**
   * Add one-time event listener
   */
  once(event, listener) {
    const wrappedListener = /* @__PURE__ */ __name((...args) => {
      this.removeListener(event, wrappedListener);
      listener(...args);
    }, "wrappedListener");
    return this.on(event, wrappedListener);
  }
  /**
   * Remove event listener
   */
  removeListener(event, listener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
    return this;
  }
  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }
  /**
   * Emit event to all listeners
   */
  emit(event, ...args) {
    const listeners = this.listeners.get(event);
    if (!listeners || listeners.size === 0) {
      return false;
    }
    listeners.forEach((listener) => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`[ChildProcessPolyfill] Error in ${event} listener:`, error);
      }
    });
    return true;
  }
  // ============================================================================
  // Process Control
  // ============================================================================
  /**
   * Kill the process
   */
  kill(signal = "SIGTERM") {
    console.log(`[ChildProcessPolyfill] Kill ${this._sPid} with signal: ${signal}`);
    if (this.killed) {
      return true;
    }
    this.signalCode = signal;
    invokeTauri("child_process:kill", {
      spawn_id: this._sPid,
      signal
    }).catch((error) => {
      console.error(`[ChildProcessPolyfill] Kill error for ${this._sPid}:`, error);
    });
    return true;
  }
  /**
   * Send a message to the process (IPC)
   */
  send(message, sendHandle, options) {
    console.log(`[ChildProcessPolyfill] Send message to ${this._sPid}:`, message);
    invokeTauri("child_process:send", {
      spawn_id: this._sPid,
      message
    }).catch((error) => {
      console.error(`[ChildProcessPolyfill] Send error for ${this._sPid}:`, error);
    });
    return true;
  }
  /**
   * Disconnect from the process
   */
  disconnect() {
    console.log(`[ChildProcessPolyfill] Disconnect from ${this._sPid}`);
    this.removeAllListeners();
    this._unlistenFunctions.forEach((unlisten) => unlisten());
    this.stdin.end();
  }
  /**
   * Ref the process (keep it alive)
   */
  ref() {
    return this;
  }
  /**
   * Unref the process (allow it to exit)
   */
  unref() {
    return this;
  }
  /**
   * Cleanup resources
   */
  cleanup() {
    this._unlistenFunctions.forEach((unlisten) => unlisten());
    this._unlistenFunctions = [];
  }
}
function spawn(command, args, options) {
  console.log(`[ChildProcessPolyfill] spawn: ${command} ${args?.join(" ") ?? ""}`);
  const spawnId = `spawn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const proc = new ChildProcess(spawnId);
  invokeTauri("electron:spawn_child_process", {
    command,
    args: args ?? [],
    cwd: options?.cwd,
    env: options?.env,
    shell: options?.shell
    // Note: stdio, detached, etc. are passed but may not be fully supported
  }).then((result) => {
    if (result.success) {
      proc.pid = result.pid;
      console.log(`[ChildProcessPolyfill] Process spawned with PID: ${proc.pid}`);
      proc.emit("spawn");
    } else {
      proc.emit("error", new Error(result.error ?? "Failed to spawn process"));
    }
  }).catch((error) => {
    console.error("[ChildProcessPolyfill] spawn error:", error);
    proc.emit("error", error);
  });
  return proc;
}
__name(spawn, "spawn");
function exec(command, options, callback) {
  console.log(`[ChildProcessPolyfill] exec: ${command}`);
  const execId = `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const proc = new ChildProcess(execId);
  let stdout = "";
  let stderr = "";
  let error = null;
  proc.stdout.on("data", (data) => {
    stdout += data.toString(options?.encoding ?? "utf8");
  });
  proc.stderr.on("data", (data) => {
    stderr += data.toString(options?.encoding ?? "utf8");
  });
  proc.on("exit", (code) => {
    if (code !== 0) {
      error = new Error(`Command failed: ${command}
${stderr}`);
      error.code = code ?? void 0;
      error.killed = proc.killed;
    }
    if (callback) {
      callback(error, stdout, stderr);
    }
  });
  invokeTauri("electron:exec_command", {
    command,
    cwd: options?.cwd,
    env: options?.env,
    shell: options?.shell,
    timeout: options?.timeout
  }).then((result) => {
    if (result.success) {
      proc.pid = result.pid;
    } else {
      error = new Error(result.error ?? "Failed to execute command");
      proc.emit("error", error);
    }
  }).catch((err) => {
    error = err;
    proc.emit("error", err);
  });
  return proc;
}
__name(exec, "exec");
function execPromise(command, options) {
  return new Promise((resolve, reject) => {
    const proc = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}
__name(execPromise, "execPromise");
function fork(modulePath, args, options) {
  console.log(`[ChildProcessPolyfill] fork: ${modulePath}`);
  const forkId = `fork_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const proc = new ChildProcess(forkId);
  const isExtensionHost = modulePath.includes("extensionHost") || modulePath.includes("process");
  if (isExtensionHost) {
    invokeTauri("electron:fork_extension_host", {
      module_path: modulePath,
      args: args ?? [],
      cwd: options?.cwd,
      env: options?.env,
      exec_path: options?.execPath,
      exec_argv: options?.execArgv,
      silent: options?.silent
    }).then((result) => {
      if (result.success) {
        proc.pid = result.pid;
        console.log(`[ChildProcessPolyfill] Extension host forked with PID: ${proc.pid}`);
        proc.emit("spawn");
      } else {
        proc.emit("error", new Error(result.error ?? "Failed to fork extension host"));
      }
    }).catch((error) => {
      console.error("[ChildProcessPolyfill] fork error:", error);
      proc.emit("error", error);
    });
  } else {
    const forkedProc = spawn(
      options?.execPath ?? process.execPath,
      [modulePath, ...args ?? []],
      {
        cwd: options?.cwd,
        env: options?.env,
        silent: options?.silent ? "pipe" : "inherit"
      }
    );
    proc.pid = forkedProc.pid;
  }
  return proc;
}
__name(fork, "fork");
const childProcess = {
  spawn,
  exec,
  execSync: /* @__PURE__ */ __name(() => {
    throw new Error("childProcess.execSync() is not supported in browser/Tauri environment. Use async exec() instead.");
  }, "execSync"),
  fork,
  execFile: exec
  // execFile is similar to exec in this context
};
function installChildProcessPolyfill() {
  if (typeof window === "undefined") {
    return;
  }
  if (window.__CHILD_PROCESS_POLYFILL_INSTALLED__) {
    console.log("[ChildProcessPolyfill] Already installed, skipping");
    return;
  }
  window.__CHILD_PROCESS_POLYFILL_INSTALLED__ = true;
  console.log("[ChildProcessPolyfill] Installing Node.js child_process module polyfill...");
  window.childProcess = childProcess;
  if (typeof window.require === "function") {
    const existingRequire = window.require;
    window.require = (id) => {
      if (id === "child_process") {
        return childProcess;
      }
      return existingRequire(id);
    };
  }
  if (typeof window.vscode !== "undefined") {
    window.vscode.childProcess = childProcess;
  }
  console.log("[ChildProcessPolyfill] \u2713 Node.js child_process module polyfill installed");
}
__name(installChildProcessPolyfill, "installChildProcessPolyfill");
const process = typeof window !== "undefined" && window.process ? window.process : { execPath: "/usr/local/bin/node" };
var ChildProcessPolyfill_default = {
  install: installChildProcessPolyfill,
  module: childProcess,
  // Individual exports for convenience
  spawn,
  exec,
  execPromise,
  fork,
  // Types
  ChildProcess
};
if (typeof window !== "undefined") {
  installChildProcessPolyfill();
}
export {
  ChildProcessPolyfill_default as default,
  installChildProcessPolyfill
};
//# sourceMappingURL=ChildProcessPolyfill.js.map
