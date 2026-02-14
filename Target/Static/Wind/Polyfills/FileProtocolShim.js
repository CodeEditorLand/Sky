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
    console.error(`[FileProtocolShim] Tauri invoke failed for ${command}:`, error);
    throw error;
  }
}
__name(invokeTauri, "invokeTauri");
const VSCodeFileHandler = {
  matches(req) {
    return req.protocol === "vscode-file";
  },
  async handle(req) {
    try {
      console.log(`[FileProtocolShim] Handling vscode-file:// request: ${req.path}`);
      const decodedPath = decodeURIComponent(req.path);
      const method = req.headers?.get("X-Http-Method") || "GET";
      if (method === "GET" || !method) {
        const content = await invokeTauri("file:read", {
          path: decodedPath,
          encoding: "utf8"
        });
        return {
          content,
          metadata: {
            mime: inferMimeType(decodedPath),
            lastModified: (/* @__PURE__ */ new Date()).toISOString()
          }
        };
      } else if (method === "PUT" || method === "POST") {
        throw new Error("File write not implemented via GET handler");
      }
      throw new Error(`Unsupported method: ${method}`);
    } catch (error) {
      console.error("[FileProtocolShim] vscode-file handler error:", error);
      return {
        content: null,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
};
const VSCodeUserDataHandler = {
  matches(req) {
    return req.protocol === "vscode-userdata";
  },
  async handle(req) {
    try {
      console.log(`[FileProtocolShim] Handling vscode-userdata:// request: ${req.path}`);
      const userDataPath = await invokeTauri("file:user_data_path", {});
      const fullPath = `${userDataPath}/${req.path.replace(/^\//, "")}`;
      const content = await invokeTauri("file:read", {
        path: fullPath,
        encoding: "utf8"
      });
      return {
        content,
        metadata: {
          mime: inferMimeType(req.path),
          lastModified: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    } catch (error) {
      console.error("[FileProtocolShim] vscode-userdata handler error:", error);
      return {
        content: "",
        error: void 0
      };
    }
  }
};
const VSCodeResourceHandler = {
  matches(req) {
    return req.protocol === "vscode-resource";
  },
  async handle(req) {
    try {
      console.log(`[FileProtocolShim] Handling vscode-resource:// request: ${req.path}`);
      const [extensionId, ...pathParts] = req.path.split("/").filter(Boolean);
      const resourcePath = pathParts.join("/");
      const content = await invokeTauri("cocoon:get_extension_resource", {
        extension_id: extensionId,
        resource_path: resourcePath
      });
      return {
        content,
        metadata: {
          mime: inferMimeType(resourcePath)
        }
      };
    } catch (error) {
      console.error("[FileProtocolShim] vscode-resource handler error:", error);
      return {
        content: null,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
};
const VSCodeRemoteHandler = {
  matches(req) {
    return req.protocol === "vscode-remote";
  },
  async handle(req) {
    try {
      console.log(`[FileProtocolShim] Handling vscode-remote:// request: ${req.path}`);
      const [host, ...pathParts] = req.path.split("/").filter(Boolean);
      const remotePath = pathParts.join("/");
      const content = await invokeTauri("cocoon:read_remote_file", {
        host,
        path: remotePath
      });
      return {
        content,
        metadata: {
          mime: inferMimeType(remotePath)
        }
      };
    } catch (error) {
      console.error("[FileProtocolShim] vscode-remote handler error:", error);
      return {
        content: null,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
};
const FileHandler = {
  matches(req) {
    return req.protocol === "file";
  },
  async handle(req) {
    try {
      console.log(`[FileProtocolShim] Handling file:// request: ${req.path}`);
      const decodedPath = decodeURIComponent(req.path);
      const content = await invokeTauri("file:read", {
        path: decodedPath,
        encoding: "utf8"
      });
      return {
        content,
        metadata: {
          mime: inferMimeType(decodedPath),
          lastModified: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    } catch (error) {
      console.error("[FileProtocolShim] file handler error:", error);
      return {
        content: null,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
};
const PROTOCOL_HANDLERS = [
  VSCodeFileHandler,
  VSCodeUserDataHandler,
  VSCodeResourceHandler,
  VSCodeRemoteHandler,
  FileHandler
];
function findHandler(req) {
  return PROTOCOL_HANDLERS.find((handler) => handler.matches(req)) ?? null;
}
__name(findHandler, "findHandler");
function parseProtocolURL(url) {
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol.replace(/:$/, "");
    const path = parsed.pathname.replace(/^\//, "");
    const query = {};
    parsed.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    return {
      protocol,
      path,
      query
    };
  } catch (error) {
    console.error("[FileProtocolShim] Failed to parse URL:", url, error);
    throw new Error(`Invalid protocol URL: ${url}`);
  }
}
__name(parseProtocolURL, "parseProtocolURL");
function inferMimeType(path) {
  const extension = path.split(".").pop()?.toLowerCase();
  const mimeMap = {
    js: "application/javascript",
    json: "application/json",
    ts: "application/typescript",
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    md: "text/markdown",
    txt: "text/plain",
    xml: "application/xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    wasm: "application/wasm"
  };
  return mimeMap[extension ?? ""] ?? "application/octet-stream";
}
__name(inferMimeType, "inferMimeType");
function installFetchInterception() {
  const originalFetch = window.fetch;
  window.fetch = /* @__PURE__ */ __name(async function interceptFetch(input, init) {
    try {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (needsInterception(url)) {
        const request = parseProtocolURL(url);
        const handler = findHandler(request);
        if (handler) {
          const result = await handler.handle({
            ...request,
            headers: new Headers(init?.headers)
          });
          if (result.error) {
            throw result.error;
          }
          return new Response(result.content, {
            status: 200,
            headers: {
              "Content-Type": result.metadata?.mime ?? "application/octet-stream",
              "Cache-Control": "public, max-age=3600",
              ...result.metadata?.lastModified && {
                "Last-Modified": result.metadata.lastModified
              }
            }
          });
        }
      }
      return originalFetch(input, init);
    } catch (error) {
      console.error("[FileProtocolShim] Fetch interception error:", error);
      return originalFetch(input, init);
    }
  }, "interceptFetch");
  console.log("[FileProtocolShim] \u2713 fetch interception installed");
}
__name(installFetchInterception, "installFetchInterception");
function needsInterception(url) {
  const protocol = url.split(":")[0];
  const interceptedProtocols = [
    "vscode-file",
    "vscode-userdata",
    "vscode-resource",
    "vscode-remote"
    // Note: We don't intercept standard file:// by default
    // as it's handled by Tauri's security model
  ];
  return interceptedProtocols.includes(protocol);
}
__name(needsInterception, "needsInterception");
function installModuleInterception() {
  if (typeof window.__createImport !== "undefined") {
    console.log("[FileProtocolShim] Custom import interception available");
  }
  console.log("[FileProtocolShim] Module import interception registered (passive mode)");
}
__name(installModuleInterception, "installModuleInterception");
function installFileProtocolShim() {
  if (typeof window === "undefined") {
    return;
  }
  if (window.__FILE_PROTOCOL_SHIM_INSTALLED__) {
    console.log("[FileProtocolShim] Already installed, skipping");
    return;
  }
  window.__FILE_PROTOCOL_SHIM_INSTALLED__ = true;
  console.log("[FileProtocolShim] Installing VSCode protocol polyfills...");
  installFetchInterception();
  installModuleInterception();
  console.log("[FileProtocolShim] \u2713 VSCode protocol polyfills installed");
}
__name(installFileProtocolShim, "installFileProtocolShim");
const FileProtocolShim = {
  install: installFileProtocolShim,
  handlers: PROTOCOL_HANDLERS,
  parseProtocolURL,
  inferMimeType
};
if (typeof window !== "undefined") {
  installFileProtocolShim();
}
export {
  FileProtocolShim,
  installFileProtocolShim
};
//# sourceMappingURL=FileProtocolShim.js.map
