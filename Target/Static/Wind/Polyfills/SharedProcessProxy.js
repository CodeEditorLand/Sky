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
    console.error(`[SharedProcessProxy] Tauri invoke failed for ${command}:`, error);
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
  console.warn(`[SharedProcessProxy] Tauri event listener not available for: ${event}`);
  return () => {
  };
}
__name(listenToTauri, "listenToTauri");
function createServiceProxy(service) {
  const listeners = /* @__PURE__ */ new Map();
  const pendingRequests = /* @__PURE__ */ new Map();
  let isReady = false;
  const unlistenResponse = listenToTauri(`shared_process:response:${service}`, (payload) => {
    const response = payload;
    if (response.correlationId && pendingRequests.has(response.correlationId)) {
      const pending = pendingRequests.get(response.correlationId);
      if (response.success) {
        pending.resolve(response.data);
      } else {
        pending.reject(new Error(response.error ?? "Unknown error"));
      }
      pendingRequests.delete(response.correlationId);
    }
  });
  const unlistenEvent = listenToTauri(`shared_process:event:${service}`, (payload) => {
    const event = payload;
    emitEvent(event.event, ...event.args);
  });
  function emitEvent(event, ...args) {
    const eventListeners = listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`[SharedProcessProxy] Error in ${service} event listener (${event}):`, error);
        }
      });
    }
  }
  __name(emitEvent, "emitEvent");
  function generateCorrelationId() {
    return `${service}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
  __name(generateCorrelationId, "generateCorrelationId");
  return {
    service,
    get ready() {
      return isReady;
    },
    set ready(value) {
      isReady = value;
    },
    /**
     * Health check for the service
     */
    async healthCheck() {
      try {
        if (service === "extension-host") {
          return await invokeTauri("cocoon:extension_host_health", {});
        } else if (service === "search") {
          return await invokeTauri("cocoon:search_service_health", {});
        } else if (service === "debug") {
          return await invokeTauri("cocoon:debug_service_health", {});
        } else {
          return await invokeTauri("shared_process:service_health", { service });
        }
      } catch {
        return false;
      }
    },
    /**
     * Invoke a method on the service
     */
    async invoke(method, ...args) {
      const correlationId = generateCorrelationId();
      const request = {
        service,
        method,
        args,
        correlationId
      };
      return new Promise((resolve, reject) => {
        pendingRequests.set(correlationId, { resolve, reject });
        invokeTauri("shared_process:invoke", request).catch((error) => {
          pendingRequests.delete(correlationId);
          reject(error);
        });
      });
    },
    /**
     * Register event listener
     */
    on(event, handler) {
      if (!listeners.has(event)) {
        listeners.set(event, /* @__PURE__ */ new Set());
      }
      listeners.get(event).add(handler);
    },
    /**
     * Register one-time event listener
     */
    once(event, handler) {
      const wrappedHandler = /* @__PURE__ */ __name((...args) => {
        handler(...args);
        this.removeListener(event, wrappedHandler);
      }, "wrappedHandler");
      this.on(event, wrappedHandler);
    },
    /**
     * Remove event listener
     */
    removeListener(event, handler) {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(handler);
        if (eventListeners.size === 0) {
          listeners.delete(event);
        }
      }
    },
    /**
     * Remove all event listeners
     */
    removeAllListeners(event) {
      if (event) {
        listeners.delete(event);
      } else {
        listeners.clear();
      }
    }
  };
}
__name(createServiceProxy, "createServiceProxy");
const ExtensionHostService = Object.assign(
  createServiceProxy("extension-host"),
  {
    /**
     * Start extension host
     */
    async start(extensionId) {
      return await this.invoke("start", extensionId);
    },
    /**
     * Stop extension host
     */
    async stop(extensionId) {
      return await this.invoke("stop", extensionId);
    },
    /**
     * Restart extension host
     */
    async restart(extensionId) {
      return await this.invoke("restart", extensionId);
    },
    /**
     * Call extension API
     */
    async callExtensionAPI(extensionId, method, ...args) {
      return await this.invoke("callAPI", extensionId, method, ...args);
    },
    /**
     * Get extension host status
     */
    async getStatus() {
      return await this.invoke("getStatus");
    }
  }
);
const SearchService = Object.assign(
  createServiceProxy("search"),
  {
    /**
     * Perform search
     */
    async search(query, options) {
      return await this.invoke("search", query, options);
    },
    /**
     * Get search index status
     */
    async getIndexStatus() {
      return await this.invoke("getIndexStatus");
    },
    /**
     * Clear search index
     */
    async clearIndex() {
      return await this.invoke("clearIndex");
    }
  }
);
const DebugService = Object.assign(
  createServiceProxy("debug"),
  {
    /**
     * Start debug session
     */
    async startSession(configuration) {
      return await this.invoke("startSession", configuration);
    },
    /**
     * Stop debug session
     */
    async stopSession(sessionId) {
      return await this.invoke("stopSession", sessionId);
    },
    /**
     * Send debug command
     */
    async sendCommand(sessionId, command, ...args) {
      return await this.invoke("sendCommand", sessionId, command, ...args);
    },
    /**
     * Get active debug sessions
     */
    async getActiveSessions() {
      return await this.invoke("getActiveSessions");
    }
  }
);
const StorageService = Object.assign(
  createServiceProxy("storage"),
  {
    /**
     * Get item from storage
     */
    async getItem(key) {
      return await invokeTauri("storage:get_item", { key });
    },
    /**
     * Set item in storage
     */
    async setItem(key, value) {
      return await invokeTauri("storage:set_item", { key, value });
    },
    /**
     * Remove item from storage
     */
    async removeItem(key) {
      return await invokeTauri("storage:remove_item", { key });
    },
    /**
     * Get all items in storage
     */
    async getAllItems() {
      return await invokeTauri("storage:get_all_items", {});
    },
    /**
     * Clear all storage
     */
    async clear() {
      return await invokeTauri("storage:clear", {});
    }
  }
);
const UpdateService = Object.assign(
  createServiceProxy("update"),
  {
    /**
     * Check for updates
     */
    async checkForUpdates() {
      return await invokeTauri("update:check", {});
    },
    /**
     * Download update
     */
    async downloadUpdate() {
      return await invokeTauri("update:download", {});
    },
    /**
     * Install update
     */
    async installUpdate() {
      return await invokeTauri("update:install", {});
    },
    /**
     * Get update status
     */
    async getStatus() {
      return await invokeTauri("update:get_status", {});
    }
  }
);
class SharedProcessManager {
  static {
    __name(this, "SharedProcessManager");
  }
  // Service proxies
  services = /* @__PURE__ */ new Map();
  // Health check interval
  healthCheckInterval = null;
  constructor() {
    this.registerService(ExtensionHostService);
    this.registerService(SearchService);
    this.registerService(DebugService);
    this.registerService(StorageService);
    this.registerService(UpdateService);
  }
  /**
   * Register a service proxy
   */
  registerService(proxy) {
    this.services.set(proxy.service, proxy);
    console.log(`[SharedProcessProxy] Registered service: ${proxy.service}`);
  }
  /**
   * Get service proxy
   */
  getService(service) {
    return this.services.get(service);
  }
  /**
   * Get all services
   */
  getAllServices() {
    return new Map(this.services);
  }
  /**
   * Start health checks
   */
  startHealthChecks(intervalMs = 3e4) {
    if (this.healthCheckInterval !== null) {
      return;
    }
    this.healthCheckInterval = window.setInterval(async () => {
      console.log("[SharedProcessProxy] Running health checks for all services");
      for (const [serviceName, proxy] of this.services.entries()) {
        try {
          const isHealthy = await proxy.healthCheck();
          proxy.ready = isHealthy;
          if (!isHealthy) {
            console.warn(`[SharedProcessProxy] Service ${serviceName} is unhealthy`);
          }
        } catch (error) {
          console.error(`[SharedProcessProxy] Health check failed for ${serviceName}:`, error);
          proxy.ready = false;
        }
      }
    }, intervalMs);
    console.log("[SharedProcessProxy] Health checks started");
  }
  /**
   * Stop health checks
   */
  stopHealthChecks() {
    if (this.healthCheckInterval !== null) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log("[SharedProcessProxy] Health checks stopped");
    }
  }
  /**
   * Initialize all services
   */
  async initialize() {
    console.log("[SharedProcessProxy] Initializing shared process services...");
    for (const [serviceName, proxy] of this.services.entries()) {
      try {
        const isHealthy = await proxy.healthCheck();
        proxy.ready = isHealthy;
        console.log(`[SharedProcessProxy] Service ${serviceName}: ${isHealthy ? "ready" : "not ready"}`);
      } catch (error) {
        console.warn(`[SharedProcessProxy] Failed to initialize ${serviceName}:`, error);
        proxy.ready = false;
      }
    }
    this.startHealthChecks();
    console.log("[SharedProcessProxy] Shared process services initialized");
  }
  /**
   * Shutdown all services
   */
  async shutdown() {
    console.log("[SharedProcessProxy] Shutting down shared process services...");
    this.stopHealthChecks();
    for (const proxy of this.services.values()) {
      proxy.removeAllListeners();
    }
    console.log("[SharedProcessProxy] Shared process services shut down");
  }
}
let sharedProcessManager = null;
function getSharedProcessManager() {
  if (!sharedProcessManager) {
    sharedProcessManager = new SharedProcessManager();
    console.log("[SharedProcessProxy] SharedProcessManager instance created");
  }
  return sharedProcessManager;
}
__name(getSharedProcessManager, "getSharedProcessManager");
async function installSharedProcessProxy() {
  if (typeof window === "undefined") {
    return;
  }
  if (window.__SHARED_PROCESS_PROXY_INSTALLED__) {
    console.log("[SharedProcessProxy] Already installed, skipping");
    return;
  }
  window.__SHARED_PROCESS_PROXY_INSTALLED__ = true;
  console.log("[SharedProcessProxy] Installing shared process proxy...");
  const manager = getSharedProcessManager();
  await manager.initialize();
  if (typeof window.vscode !== "undefined") {
    window.vscode.sharedProcess = {
      manager,
      ExtensionHostService,
      SearchService,
      DebugService,
      StorageService,
      UpdateService
    };
  }
  window.__SHARED_PROCESS__ = {
    manager,
    ExtensionHostService,
    SearchService,
    DebugService,
    StorageService,
    UpdateService
  };
  console.log("[SharedProcessProxy] \u2713 Shared process proxy installed");
}
__name(installSharedProcessProxy, "installSharedProcessProxy");
var SharedProcessProxy_default = {
  install: installSharedProcessProxy,
  getManager: getSharedProcessManager,
  // Service exports
  ExtensionHostService,
  SearchService,
  DebugService,
  StorageService,
  UpdateService,
  // Types
  SharedProcessManager
};
if (typeof window !== "undefined") {
  installSharedProcessProxy().catch((error) => {
    console.error("[SharedProcessProxy] Failed to auto-install:", error);
  });
}
export {
  DebugService,
  ExtensionHostService,
  SearchService,
  StorageService,
  UpdateService,
  SharedProcessProxy_default as default,
  getSharedProcessManager,
  installSharedProcessProxy
};
//# sourceMappingURL=SharedProcessProxy.js.map
