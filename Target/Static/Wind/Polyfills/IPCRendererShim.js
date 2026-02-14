var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function invokeTauri(command, args = {}) {
  try {
    const tauri = window.__TAURI__ ?? window.TAURI;
    if (typeof tauri?.invoke === "function") {
      return await tauri.invoke(command, args);
    }
    throw new Error(`Tauri invoke not available for command: ${command}`);
  } catch (error) {
    console.error(`[IPCRendererShim] Tauri invoke failed for ${command}:`, error);
    throw error;
  }
}
__name(invokeTauri, "invokeTauri");
function sendTauri(command, args = {}) {
  try {
    const tauri = window.__TAURI__ ?? window.TAURI;
    if (typeof tauri?.invoke === "function") {
      tauri.invoke(command, args).catch((error) => {
        console.warn(`[IPCRendererShim] Tauri send failed (no response expected): ${command}`, error);
      });
    } else {
      console.warn(`[IPCRendererShim] Tauri not available for: ${command}`);
    }
  } catch (error) {
    console.warn(`[IPCRendererShim] Tauri send error (no response expected): ${command}`, error);
  }
}
__name(sendTauri, "sendTauri");
const IPC_CHANNEL_MAPPINGS = [
  // Logger service
  {
    electronPattern: /^logger:(log|warn|error|info|debug|trace|critical)$/,
    tauriCommand: "logger:log",
    transform: /* @__PURE__ */ __name((_args) => ({
      level: _args[0],
      message: _args[1],
      context: _args[2]
    }), "transform")
  },
  // Policy service
  {
    electronPattern: /^policy:(get|set|validate|enforce|check)$/,
    tauriCommand: "policy:handle",
    transform: /* @__PURE__ */ __name((_args) => ({
      action: _args[0],
      data: _args[1]
    }), "transform")
  },
  // Signing service
  {
    electronPattern: /^sign:(sign|verify|generate|validate)$/,
    tauriCommand: "sign:handle",
    transform: /* @__PURE__ */ __name((_args) => ({
      action: _args[0],
      data: _args[1],
      options: _args[2]
    }), "transform")
  },
  // User data profiles service
  {
    electronPattern: /^userDataProfiles:(create|delete|update|get|list)$/,
    tauriCommand: "user_data:handle_profile",
    transform: /* @__PURE__ */ __name((_args) => ({
      action: _args[0],
      profileId: _args[1],
      data: _args[2]
    }), "transform")
  },
  // Local file system service
  {
    electronPattern: /^localFileSystem:(read|write|delete|exists|stat|readdir)$/,
    tauriCommand: "file:handle",
    transform: /* @__PURE__ */ __name((_args) => ({
      action: _args[0],
      path: _args[1],
      data: _args[2]
    }), "transform")
  }
];
function mapElectronChannelToTauri(channel) {
  for (const mapping of IPC_CHANNEL_MAPPINGS) {
    if (mapping.electronPattern.test(channel)) {
      const args = mapping.transform?.([]) ?? {};
      return { command: mapping.tauriCommand, args };
    }
  }
  return null;
}
__name(mapElectronChannelToTauri, "mapElectronChannelToTauri");
function transformChannelArgs(channel, args) {
  for (const mapping of IPC_CHANNEL_MAPPINGS) {
    if (mapping.electronPattern.test(channel) && mapping.transform) {
      return mapping.transform(args);
    }
  }
  return { args };
}
__name(transformChannelArgs, "transformChannelArgs");
class IPCRendererImpl {
  static {
    __name(this, "IPCRendererImpl");
  }
  // Track event listeners by channel
  listeners = /* @__PURE__ */ new Map();
  // Track reply handlers
  replyHandlers = /* @__PURE__ */ new Map();
  replyCounter = 0;
  // Track once listeners
  onceListeners = /* @__PURE__ */ new Map();
  /**
   * Send message to main process
   */
  send(channel, ...args) {
    console.log(`[IPCRendererShim] send: ${channel}`, args);
    const mapping = mapElectronChannelToTauri(channel);
    if (mapping) {
      const tauriArgs = transformChannelArgs(channel, args);
      sendTauri(mapping.command, tauriArgs);
    } else {
      sendTauri("ipc:send", {
        channel,
        args
      });
    }
  }
  /**
   * Synchronous send - polyfilled as async with warning
   */
  sendSync(_channel, ..._args) {
    console.warn(
      `[IPCRendererShim] \u26A0\uFE0F sendSync is not supported in Tauri. Use invoke() instead. Returning undefined.`
    );
    return void 0;
  }
  /**
   * Invoke main process and get response
   */
  async invoke(channel, ...args) {
    console.log(`[IPCRendererShim] invoke: ${channel}`, args);
    const mapping = mapElectronChannelToTauri(channel);
    if (mapping) {
      const tauriArgs = transformChannelArgs(channel, args);
      return await invokeTauri(mapping.command, tauriArgs);
    }
    return await invokeTauri("ipc:invoke", {
      channel,
      args
    });
  }
  /**
   * Register event listener
   */
  on(channel, listener) {
    console.log(`[IPCRendererShim] on: ${channel}`);
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, /* @__PURE__ */ new Set());
    }
    this.listeners.get(channel).add(listener);
    this.registerTauriListener(channel, listener);
    return this;
  }
  /**
   * Register one-time event listener
   */
  once(channel, listener) {
    console.log(`[IPCRendererShim] once: ${channel}`);
    if (!this.onceListeners.has(channel)) {
      this.onceListeners.set(channel, /* @__PURE__ */ new Set());
    }
    this.onceListeners.get(channel).add(new WeakRef(listener));
    const wrappedListener = /* @__PURE__ */ __name((_event, ...args) => {
      listener(_event, ...args);
      this.removeListener(channel, wrappedListener);
    }, "wrappedListener");
    this.on(channel, wrappedListener);
    return this;
  }
  /**
   * Remove specific listener
   */
  removeListener(channel, listener) {
    console.log(`[IPCRendererShim] removeListener: ${channel}`);
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.delete(listener);
      if (channelListeners.size === 0) {
        this.listeners.delete(channel);
      }
    }
    return this;
  }
  /**
   * Remove all listeners for a channel
   */
  removeAllListeners(channel) {
    console.log(`[IPCRendererShim] removeAllListeners: ${channel ?? "all"}`);
    if (channel) {
      this.listeners.delete(channel);
    } else {
      this.listeners.clear();
    }
    return this;
  }
  /**
   * Client-side request-reply pattern (sendTo + onReply)
   */
  sendTo(channel, args, callback) {
    console.log(`[IPCRendererShim] sendTo: ${channel}`);
    const requestId = ++this.replyCounter;
    const request = {
      channel,
      args,
      callback,
      timestamp: Date.now()
    };
    this.replyHandlers.set(requestId, request);
    this.invoke(channel, ...args).then((response) => {
      const handler = this.replyHandlers.get(requestId);
      if (handler) {
        handler.callback(response);
        this.replyHandlers.delete(requestId);
      }
    }).catch((error) => {
      console.error(`[IPCRendererShim] sendTo error: ${channel}`, error);
      const handler = this.replyHandlers.get(requestId);
      if (handler) {
        handler.callback({ error: error.message });
        this.replyHandlers.delete(requestId);
      }
    });
  }
  /**
   * Register reply handler for sendTo pattern
   */
  onReply(channel, handler) {
    console.log(`[IPCRendererShim] onReply: ${channel}`);
    this.on(channel, (_event, ...args) => {
      handler(args[0]);
    });
  }
  /**
   * Helper method to register listener with Tauri
   */
  registerTauriListener(_channel, _listener) {
    console.log(`[IPCRendererShim] Registering Tauri listener for: ${_channel}`);
  }
  /**
   * Cleanup method to remove all listeners
   */
  cleanup() {
    console.log("[IPCRendererShim] Cleaning up IPC listeners");
    this.listeners.clear();
    this.onceListeners.clear();
    this.replyHandlers.clear();
  }
}
let ipcRendererInstance = null;
function getIPCRenderer() {
  if (!ipcRendererInstance) {
    ipcRendererInstance = new IPCRendererImpl();
    console.log("[IPCRendererShim] IPCRenderer instance created");
  }
  return ipcRendererInstance;
}
__name(getIPCRenderer, "getIPCRenderer");
function installIPCRendererShim() {
  if (typeof window === "undefined") {
    return;
  }
  if (window.__IPC_RENDERER_SHIM_INSTALLED__) {
    console.log("[IPCRendererShim] Already installed, skipping");
    return;
  }
  window.__IPC_RENDERER_SHIM_INSTALLED__ = true;
  console.log("[IPCRendererShim] Installing Electron IPC renderer polyfill...");
  const ipcRenderer = getIPCRenderer();
  if (typeof window.vscode !== "undefined") {
    window.vscode.ipcRenderer = ipcRenderer;
    console.log("[IPCRendererShim] \u2713 IPCRenderer attached to window.vscode");
  }
  window.__IPC_RENDERER__ = ipcRenderer;
  console.log("[IPCRendererShim] \u2713 Electron IPC renderer polyfill installed");
}
__name(installIPCRendererShim, "installIPCRendererShim");
var IPCRendererShim_default = {
  install: installIPCRendererShim,
  get: getIPCRenderer
};
if (typeof window !== "undefined") {
  installIPCRendererShim();
}
export {
  IPCRendererImpl as IPCRendererClass,
  IPCRendererShim_default as default,
  getIPCRenderer,
  installIPCRendererShim
};
//# sourceMappingURL=IPCRendererShim.js.map
