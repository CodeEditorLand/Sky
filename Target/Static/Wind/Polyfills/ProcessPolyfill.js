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
    console.error(`[ProcessPolyfill] Tauri invoke failed for ${command}:`, error);
    throw error;
  }
}
__name(invokeTauri, "invokeTauri");
const DEFAULT_PROCESS_CONFIG = {
  execPath: "/Applications/CodeEditorLand.app/Contents/MacOS/codeeditorland",
  execArgv: [],
  env: {
    PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
    HOME: "/Users/test",
    USER: "test",
    SHELL: "/bin/zsh",
    TMPDIR: "/tmp",
    TMP: "/tmp",
    TEMP: "/tmp",
    NODE_ENV: "production"
  },
  platform: "darwin",
  arch: "arm64",
  pid: 1,
  ppid: 0
};
async function getProcessConfiguration() {
  try {
    if (typeof window.__TAURI__ !== "undefined") {
      const [execPath, platform, arch, pid] = await Promise.allSettled([
        invokeTauri("process:get_exec_path", {}),
        invokeTauri("process:get_platform", {}),
        invokeTauri("process:get_arch", {}),
        invokeTauri("process:get_pid", {})
      ]);
      return {
        ...DEFAULT_PROCESS_CONFIG,
        ...execPath.status === "fulfilled" && { execPath: execPath.value },
        ...platform.status === "fulfilled" && { platform: platform.value },
        ...arch.status === "fulfilled" && { arch: arch.value },
        ...pid.status === "fulfilled" && { pid: pid.value }
      };
    }
  } catch (error) {
    console.warn("[ProcessPolyfill] Failed to get process configuration from Tauri:", error);
  }
  return DEFAULT_PROCESS_CONFIG;
}
__name(getProcessConfiguration, "getProcessConfiguration");
function detectChromeVersion() {
  const match = navigator.userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
  return match ? match[1] : "0.0.0.0";
}
__name(detectChromeVersion, "detectChromeVersion");
function createVersions() {
  const chromeVersion = detectChromeVersion();
  return {
    node: "20.11.0",
    chrome: chromeVersion,
    electron: "31.0.0",
    v8: "12.4.254.20",
    uv: "1.46.1",
    zlib: "1.2.13.1-motley",
    brotli: "1.0.9",
    ares: "1.21.0",
    modules: "127",
    nghttp2: "1.59.0",
    napi: "9",
    openssl: "3.0.13+quic"
  };
}
__name(createVersions, "createVersions");
let hrtimeStart = process.hrtime();
function hrtime(time) {
  const now = performance.now() * 1e6;
  const seconds = Math.floor(now / 1e9);
  const nanoseconds = Math.floor(now % 1e9);
  if (time) {
    const diff = now - (time[0] * 1e9 + time[1]);
    return [
      Math.floor(diff / 1e9),
      Math.floor(diff % 1e9)
    ];
  }
  return [seconds, nanoseconds];
}
__name(hrtime, "hrtime");
let lastCpuUsage = null;
function cpuUsage(previousValue) {
  const user = Math.floor(Math.random() * 1e4);
  const system = Math.floor(Math.random() * 5e3);
  if (previousValue && lastCpuUsage) {
    return {
      user: user - previousValue.user,
      system: system - previousValue.system
    };
  }
  lastCpuUsage = { user, system };
  return { user, system };
}
__name(cpuUsage, "cpuUsage");
class ProcessPolyfill {
  static {
    __name(this, "ProcessPolyfill");
  }
  // Core properties
  platform;
  arch;
  version;
  versions;
  pid;
  ppid;
  execPath;
  execArgv;
  env;
  title;
  // Event listener storage
  listeners = /* @__PURE__ */ new Map();
  // Process state
  _exitCode = null;
  _exited = false;
  constructor(config) {
    this.platform = config.platform ?? DEFAULT_PROCESS_CONFIG.platform ?? "darwin";
    this.arch = config.arch ?? DEFAULT_PROCESS_CONFIG.arch ?? "x64";
    this.version = "v20.11.0";
    this.versions = createVersions();
    this.pid = config.pid ?? DEFAULT_PROCESS_CONFIG.pid ?? 1;
    this.ppid = config.ppid ?? DEFAULT_PROCESS_CONFIG.ppid ?? 0;
    this.execPath = config.execPath ?? DEFAULT_PROCESS_CONFIG.execPath ?? "";
    this.execArgv = config.execArgv ?? DEFAULT_PROCESS_CONFIG.execArgv ?? [];
    this.env = config.env ?? DEFAULT_PROCESS_CONFIG.env ?? {};
    this.title = "codeeditorland";
    this.setUpProcessProperties();
  }
  /**
   * Set up additional process properties
   */
  setUpProcessProperties() {
    Object.defineProperty(this, "argv", {
      value: [],
      writable: false,
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(this, "browser", {
      value: true,
      writable: false,
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(this, "type", {
      value: "renderer",
      writable: false,
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(this, "release", {
      value: {
        name: "node",
        sourceUrl: "https://nodejs.org/download/release/v20.11.0/node-v20.11.0.tar.gz",
        headersUrl: "https://nodejs.org/download/release/v20.11.0/node-v20.11.0-headers.tar.gz",
        libUrl: "https://nodejs.org/download/release/v20.11.0/node-v20.11.0-darwin-arm64.tar.gz"
      },
      writable: false,
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(this, "features", {
      value: {
        debug: false,
        inspector: true,
        uv: true,
        ipv6: true,
        tls_alpn: true,
        tls_sni: true,
        tls_ocsp: true,
        tls: true
      },
      writable: false,
      enumerable: true,
      configurable: false
    });
    this.hrtime = hrtime;
  }
  // ============================================================================
  // Methods
  // ============================================================================
  /**
   * Get current working directory
   */
  cwd() {
    return this.env.HOME ?? this.env.PWD ?? "/";
  }
  /**
   * High-resolution timer
   */
  hrtime = hrtime;
  /**
   * Get process memory info (Electron-specific)
   */
  getProcessMemoryInfo() {
    return invokeTauri("process:get_memory_info", {}).catch((error) => {
      console.warn("[ProcessPolyfill] Failed to get memory info:", error);
      return {
        workingSetSize: 100 * 1024 * 1024,
        // 100MB
        peakWorkingSetSize: 150 * 1024 * 1024,
        // 150MB
        privateBytes: 80 * 1024 * 1024,
        // 80MB
        sharedBytes: 20 * 1024 * 1024,
        // 20MB
        residentSet: 100 * 1024 * 1024
        // 100MB
      };
    });
  }
  /**
   * Get CPU usage
   */
  cpuUsage(previousValue) {
    return cpuUsage(previousValue);
  }
  /**
   * Get shell environment variables
   */
  async shellEnv() {
    try {
      return await invokeTauri("process:get_shell_env", {});
    } catch (error) {
      console.warn("[ProcessPolyfill] Failed to get shell env:", error);
      return this.env;
    }
  }
  /**
   * Umask - not supported in browser
   */
  umask(mask) {
    console.warn("[ProcessPolyfill] umask is not supported in browser environment");
    return 18;
  }
  /**
   * Exit the process - not supported in browser
   */
  exit(code) {
    console.warn(`[ProcessPolyfill] exit(${code}) called - not supported in browser`);
    this._exitCode = code ?? 0;
    this._exited = true;
    this.emit("exit", this._exitCode);
    if (typeof window !== "undefined") {
      window.close();
    }
    throw new Error(`Process cannot exit in browser environment`);
  }
  /**
   * Kill a process
   */
  kill(pid, signal) {
    console.warn(`[ProcessPolyfill] kill(${pid}, ${signal}) - not fully supported in browser`);
    try {
      invokeTauri("process:kill", { pid, signal }).catch(() => {
      });
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Next tick - schedules callback to run in next event loop iteration
   */
  nextTick(callback, ...args) {
    if (typeof queueMicrotask === "function") {
      queueMicrotask(() => callback(...args));
    } else {
      Promise.resolve().then(() => callback(...args));
    }
  }
  /**
   * Set process title
   */
  setTitle(title) {
    this.title = title;
    if (typeof document !== "undefined") {
      document.title = title;
    }
  }
  /**
   * Get process title
   */
  getTitle() {
    return this.title;
  }
  // ============================================================================
  // Event Methods
  // ============================================================================
  /**
   * Add event listener
   */
  on(event, listener) {
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
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
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
        console.error(`[ProcessPolyfill] Error in ${event} listener:`, error);
      }
    });
    return true;
  }
  // ============================================================================
  // Getters
  // ============================================================================
  get exitCode() {
    return this._exitCode;
  }
  get exited() {
    return this._exited;
  }
  get connected() {
    return true;
  }
}
let processInstance = null;
let processConfigPromise = null;
async function getProcess() {
  if (!processInstance) {
    if (!processConfigPromise) {
      processConfigPromise = getProcessConfiguration();
    }
    const config = await processConfigPromise;
    processInstance = new ProcessPolyfill(config);
    console.log("[ProcessPolyfill] Process instance created");
  }
  return processInstance;
}
__name(getProcess, "getProcess");
function getProcessSync() {
  if (!processInstance) {
    processInstance = new ProcessPolyfill(DEFAULT_PROCESS_CONFIG);
    console.log("[ProcessPolyfill] Process instance created (sync mode)");
  }
  return processInstance;
}
__name(getProcessSync, "getProcessSync");
async function installProcessPolyfill() {
  if (typeof window === "undefined") {
    return;
  }
  if (window.__PROCESS_POLYFILL_INSTALLED__) {
    console.log("[ProcessPolyfill] Already installed, skipping");
    return;
  }
  window.__PROCESS_POLYFILL_INSTALLED__ = true;
  console.log("[ProcessPolyfill] Installing Node.js process polyfill...");
  const proc = await getProcess();
  try {
    window.process = proc;
    if (typeof window.vscode !== "undefined") {
      window.vscode.process = proc;
    }
    console.log("[ProcessPolyfill] \u2713 Node.js process polyfill installed");
  } catch (error) {
    console.error("[ProcessPolyfill] Failed to install process polyfill:", error);
  }
}
__name(installProcessPolyfill, "installProcessPolyfill");
function installProcessPolyfillSync() {
  if (typeof window === "undefined") {
    return;
  }
  if (window.__PROCESS_POLYFILL_INSTALLED__) {
    return;
  }
  window.__PROCESS_POLYFILL_INSTALLED__ = true;
  const proc = getProcessSync();
  window.process = proc;
  if (typeof window.vscode !== "undefined") {
    window.vscode.process = proc;
  }
}
__name(installProcessPolyfillSync, "installProcessPolyfillSync");
var ProcessPolyfill_default = {
  install: installProcessPolyfill,
  installSync: installProcessPolyfillSync,
  get: getProcess,
  getSync: getProcessSync
};
if (typeof window !== "undefined") {
  installProcessPolyfill().catch((error) => {
    console.error("[ProcessPolyfill] Failed to auto-install:", error);
    installProcessPolyfillSync();
  });
}
export {
  ProcessPolyfill,
  ProcessPolyfill_default as default,
  getProcess,
  getProcessSync,
  installProcessPolyfill,
  installProcessPolyfillSync
};
//# sourceMappingURL=ProcessPolyfill.js.map
