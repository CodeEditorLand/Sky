var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IExtHostWorkspaceProvider } from "../common/extHostWorkspace.js";
import { ConfigurationInspect, ExtHostConfigProvider } from "../common/extHostConfiguration.js";
import { MainThreadTelemetryShape } from "../common/extHost.protocol.js";
import { IExtensionHostInitData } from "../../services/extensions/common/extensionHostProtocol.js";
import { ExtHostExtensionService } from "./extHostExtensionService.js";
import { URI } from "../../../base/common/uri.js";
import { ILogService, LogLevel as LogServiceLevel } from "../../../platform/log/common/log.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { LogLevel, createHttpPatch, createProxyResolver, createTlsPatch, ProxySupportSetting, ProxyAgentParams, createNetPatch, loadSystemCertificates, ResolveProxyWithRequest } from "@vscode/proxy-agent";
import { AuthInfo } from "../../../platform/request/common/request.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { createRequire } from "node:module";
import { lookupKerberosAuthorization } from "../../../platform/request/node/requestService.js";
import * as proxyAgent from "@vscode/proxy-agent";
const require2 = createRequire(import.meta.url);
const http = require2("http");
const https = require2("https");
const tls = require2("tls");
const net = require2("net");
const systemCertificatesV2Default = false;
const useElectronFetchDefault = false;
function connectProxyResolver(extHostWorkspace, configProvider, extensionService, extHostLogService, mainThreadTelemetry, initData, disposables) {
  const isRemote = initData.remote.isRemote;
  const useHostProxyDefault = initData.environment.useHostProxy ?? !isRemote;
  const fallbackToLocalKerberos = useHostProxyDefault;
  const loadLocalCertificates = useHostProxyDefault;
  const isUseHostProxyEnabled = /* @__PURE__ */ __name(() => !isRemote || configProvider.getConfiguration("http").get("useLocalProxyConfiguration", useHostProxyDefault), "isUseHostProxyEnabled");
  const params = {
    resolveProxy: /* @__PURE__ */ __name((url) => extHostWorkspace.resolveProxy(url), "resolveProxy"),
    lookupProxyAuthorization: lookupProxyAuthorization.bind(void 0, extHostWorkspace, extHostLogService, mainThreadTelemetry, configProvider, {}, {}, initData.remote.isRemote, fallbackToLocalKerberos),
    getProxyURL: /* @__PURE__ */ __name(() => getExtHostConfigValue(configProvider, isRemote, "http.proxy"), "getProxyURL"),
    getProxySupport: /* @__PURE__ */ __name(() => getExtHostConfigValue(configProvider, isRemote, "http.proxySupport") || "off", "getProxySupport"),
    getNoProxyConfig: /* @__PURE__ */ __name(() => getExtHostConfigValue(configProvider, isRemote, "http.noProxy") || [], "getNoProxyConfig"),
    isAdditionalFetchSupportEnabled: /* @__PURE__ */ __name(() => getExtHostConfigValue(configProvider, isRemote, "http.fetchAdditionalSupport", true), "isAdditionalFetchSupportEnabled"),
    addCertificatesV1: /* @__PURE__ */ __name(() => certSettingV1(configProvider, isRemote), "addCertificatesV1"),
    addCertificatesV2: /* @__PURE__ */ __name(() => certSettingV2(configProvider, isRemote), "addCertificatesV2"),
    log: extHostLogService,
    getLogLevel: /* @__PURE__ */ __name(() => {
      const level = extHostLogService.getLevel();
      switch (level) {
        case LogServiceLevel.Trace:
          return LogLevel.Trace;
        case LogServiceLevel.Debug:
          return LogLevel.Debug;
        case LogServiceLevel.Info:
          return LogLevel.Info;
        case LogServiceLevel.Warning:
          return LogLevel.Warning;
        case LogServiceLevel.Error:
          return LogLevel.Error;
        case LogServiceLevel.Off:
          return LogLevel.Off;
        default:
          return never(level);
      }
      function never(level2) {
        extHostLogService.error("Unknown log level", level2);
        return LogLevel.Debug;
      }
      __name(never, "never");
    }, "getLogLevel"),
    proxyResolveTelemetry: /* @__PURE__ */ __name(() => {
    }, "proxyResolveTelemetry"),
    isUseHostProxyEnabled,
    loadAdditionalCertificates: /* @__PURE__ */ __name(async () => {
      const promises = [];
      if (initData.remote.isRemote) {
        promises.push(loadSystemCertificates({ log: extHostLogService }));
      }
      if (loadLocalCertificates) {
        extHostLogService.trace("ProxyResolver#loadAdditionalCertificates: Loading certificates from main process");
        const certs = extHostWorkspace.loadCertificates();
        certs.then((certs2) => extHostLogService.trace("ProxyResolver#loadAdditionalCertificates: Loaded certificates from main process", certs2.length));
        promises.push(certs);
      }
      if (initData.environment.extensionTestsLocationURI && https.globalAgent.testCertificates?.length) {
        extHostLogService.trace("ProxyResolver#loadAdditionalCertificates: Loading test certificates");
        promises.push(Promise.resolve(https.globalAgent.testCertificates));
      }
      return (await Promise.all(promises)).flat();
    }, "loadAdditionalCertificates"),
    env: process.env
  };
  const { resolveProxyWithRequest, resolveProxyURL } = createProxyResolver(params);
  const target = proxyAgent.default || proxyAgent;
  target.resolveProxyURL = resolveProxyURL;
  patchGlobalFetch(params, configProvider, mainThreadTelemetry, initData, resolveProxyURL, disposables);
  const lookup = createPatchedModules(params, resolveProxyWithRequest);
  return configureModuleLoading(extensionService, lookup);
}
__name(connectProxyResolver, "connectProxyResolver");
const unsafeHeaders = [
  "content-length",
  "host",
  "trailer",
  "te",
  "upgrade",
  "cookie2",
  "keep-alive",
  "transfer-encoding",
  "set-cookie"
];
function patchGlobalFetch(params, configProvider, mainThreadTelemetry, initData, resolveProxyURL, disposables) {
  if (!globalThis.__vscodeOriginalFetch) {
    const originalFetch = globalThis.fetch;
    globalThis.__vscodeOriginalFetch = originalFetch;
    const patchedFetch = proxyAgent.createFetchPatch(params, originalFetch, resolveProxyURL);
    globalThis.__vscodePatchedFetch = patchedFetch;
    let useElectronFetch = false;
    if (!initData.remote.isRemote) {
      useElectronFetch = configProvider.getConfiguration("http").get("electronFetch", useElectronFetchDefault);
      disposables.add(configProvider.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("http.electronFetch")) {
          useElectronFetch = configProvider.getConfiguration("http").get("electronFetch", useElectronFetchDefault);
        }
      }));
    }
    globalThis.fetch = /* @__PURE__ */ __name(async function fetch(input, init) {
      function getRequestProperty(name) {
        return init && name in init ? init[name] : typeof input === "object" && "cache" in input ? input[name] : void 0;
      }
      __name(getRequestProperty, "getRequestProperty");
      const urlString = typeof input === "string" ? input : "cache" in input ? input.url : input.toString();
      const isDataUrl = urlString.startsWith("data:");
      if (isDataUrl) {
        recordFetchFeatureUse(mainThreadTelemetry, "data");
      }
      const isBlobUrl = urlString.startsWith("blob:");
      if (isBlobUrl) {
        recordFetchFeatureUse(mainThreadTelemetry, "blob");
      }
      const isManualRedirect = getRequestProperty("redirect") === "manual";
      if (isManualRedirect) {
        recordFetchFeatureUse(mainThreadTelemetry, "manualRedirect");
      }
      const integrity = getRequestProperty("integrity");
      if (integrity) {
        recordFetchFeatureUse(mainThreadTelemetry, "integrity");
      }
      if (!useElectronFetch || isDataUrl || isBlobUrl || isManualRedirect || integrity) {
        const response2 = await patchedFetch(input, init);
        monitorResponseProperties(mainThreadTelemetry, response2, urlString);
        return response2;
      }
      if (init?.headers) {
        const headers = new Headers(init.headers);
        for (const header of unsafeHeaders) {
          headers.delete(header);
        }
        init = { ...init, headers };
      }
      const electronInput = input instanceof URL ? input.toString() : input;
      const electron = require2("electron");
      const response = await electron.net.fetch(electronInput, init);
      monitorResponseProperties(mainThreadTelemetry, response, urlString);
      return response;
    }, "fetch");
  }
}
__name(patchGlobalFetch, "patchGlobalFetch");
function monitorResponseProperties(mainThreadTelemetry, response, urlString) {
  const originalUrl = response.url;
  Object.defineProperty(response, "url", {
    get() {
      recordFetchFeatureUse(mainThreadTelemetry, "url");
      return originalUrl || urlString;
    }
  });
  const originalType = response.type;
  Object.defineProperty(response, "type", {
    get() {
      recordFetchFeatureUse(mainThreadTelemetry, "typeProperty");
      return originalType !== "default" ? originalType : "basic";
    }
  });
}
__name(monitorResponseProperties, "monitorResponseProperties");
const fetchFeatureUse = {
  url: 0,
  typeProperty: 0,
  data: 0,
  blob: 0,
  integrity: 0,
  manualRedirect: 0
};
let timer;
const enableFeatureUseTelemetry = false;
function recordFetchFeatureUse(mainThreadTelemetry, feature) {
  if (enableFeatureUseTelemetry && !fetchFeatureUse[feature]++) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      mainThreadTelemetry.$publicLog2("fetchFeatureUse", fetchFeatureUse);
    }, 1e4);
    timer.unref();
  }
}
__name(recordFetchFeatureUse, "recordFetchFeatureUse");
function createPatchedModules(params, resolveProxy) {
  function mergeModules(module, patch) {
    const target = module.default || module;
    target.__vscodeOriginal = Object.assign({}, target);
    return Object.assign(target, patch);
  }
  __name(mergeModules, "mergeModules");
  return {
    http: mergeModules(http, createHttpPatch(params, http, resolveProxy)),
    https: mergeModules(https, createHttpPatch(params, https, resolveProxy)),
    net: mergeModules(net, createNetPatch(params, net)),
    tls: mergeModules(tls, createTlsPatch(params, tls))
  };
}
__name(createPatchedModules, "createPatchedModules");
function certSettingV1(configProvider, isRemote) {
  return !getExtHostConfigValue(configProvider, isRemote, "http.experimental.systemCertificatesV2", systemCertificatesV2Default) && !!getExtHostConfigValue(configProvider, isRemote, "http.systemCertificates");
}
__name(certSettingV1, "certSettingV1");
function certSettingV2(configProvider, isRemote) {
  return !!getExtHostConfigValue(configProvider, isRemote, "http.experimental.systemCertificatesV2", systemCertificatesV2Default) && !!getExtHostConfigValue(configProvider, isRemote, "http.systemCertificates");
}
__name(certSettingV2, "certSettingV2");
const modulesCache = /* @__PURE__ */ new Map();
function configureModuleLoading(extensionService, lookup) {
  return extensionService.getExtensionPathIndex().then((extensionPaths) => {
    const node_module = require2("module");
    const original = node_module._load;
    node_module._load = /* @__PURE__ */ __name(function load(request, parent, isMain) {
      if (request === "net") {
        return lookup.net;
      }
      if (request === "tls") {
        return lookup.tls;
      }
      if (request !== "http" && request !== "https" && request !== "undici") {
        return original.apply(this, arguments);
      }
      const ext = extensionPaths.findSubstr(URI.file(parent.filename));
      let cache = modulesCache.get(ext);
      if (!cache) {
        modulesCache.set(ext, cache = {});
      }
      if (!cache[request]) {
        if (request === "undici") {
          const undici = original.apply(this, arguments);
          proxyAgent.patchUndici(undici);
          cache[request] = undici;
        } else {
          const mod = lookup[request];
          cache[request] = { ...mod };
        }
      }
      return cache[request];
    }, "load");
  });
}
__name(configureModuleLoading, "configureModuleLoading");
async function lookupProxyAuthorization(extHostWorkspace, extHostLogService, mainThreadTelemetry, configProvider, proxyAuthenticateCache, basicAuthCache, isRemote, fallbackToLocalKerberos, proxyURL, proxyAuthenticate, state) {
  const cached = proxyAuthenticateCache[proxyURL];
  if (proxyAuthenticate) {
    proxyAuthenticateCache[proxyURL] = proxyAuthenticate;
  }
  extHostLogService.trace("ProxyResolver#lookupProxyAuthorization callback", `proxyURL:${proxyURL}`, `proxyAuthenticate:${proxyAuthenticate}`, `proxyAuthenticateCache:${cached}`);
  const header = proxyAuthenticate || cached;
  const authenticate = Array.isArray(header) ? header : typeof header === "string" ? [header] : [];
  sendTelemetry(mainThreadTelemetry, authenticate, isRemote);
  if (authenticate.some((a) => /^(Negotiate|Kerberos)( |$)/i.test(a)) && !state.kerberosRequested) {
    state.kerberosRequested = true;
    try {
      const spnConfig = getExtHostConfigValue(configProvider, isRemote, "http.proxyKerberosServicePrincipal");
      const response = await lookupKerberosAuthorization(proxyURL, spnConfig, extHostLogService, "ProxyResolver#lookupProxyAuthorization");
      return "Negotiate " + response;
    } catch (err) {
      extHostLogService.debug("ProxyResolver#lookupProxyAuthorization Kerberos authentication failed", err);
    }
    if (isRemote && fallbackToLocalKerberos) {
      extHostLogService.debug("ProxyResolver#lookupProxyAuthorization Kerberos authentication lookup on host", `proxyURL:${proxyURL}`);
      const auth = await extHostWorkspace.lookupKerberosAuthorization(proxyURL);
      if (auth) {
        return "Negotiate " + auth;
      }
    }
  }
  const basicAuthHeader = authenticate.find((a) => /^Basic( |$)/i.test(a));
  if (basicAuthHeader) {
    try {
      const cachedAuth = basicAuthCache[proxyURL];
      if (cachedAuth) {
        if (state.basicAuthCacheUsed) {
          extHostLogService.debug("ProxyResolver#lookupProxyAuthorization Basic authentication deleting cached credentials", `proxyURL:${proxyURL}`);
          delete basicAuthCache[proxyURL];
        } else {
          extHostLogService.debug("ProxyResolver#lookupProxyAuthorization Basic authentication using cached credentials", `proxyURL:${proxyURL}`);
          state.basicAuthCacheUsed = true;
          return cachedAuth;
        }
      }
      state.basicAuthAttempt = (state.basicAuthAttempt || 0) + 1;
      const realm = / realm="([^"]+)"/i.exec(basicAuthHeader)?.[1];
      extHostLogService.debug("ProxyResolver#lookupProxyAuthorization Basic authentication lookup", `proxyURL:${proxyURL}`, `realm:${realm}`);
      const url = new URL(proxyURL);
      const authInfo = {
        scheme: "basic",
        host: url.hostname,
        port: Number(url.port),
        realm: realm || "",
        isProxy: true,
        attempt: state.basicAuthAttempt
      };
      const credentials = await extHostWorkspace.lookupAuthorization(authInfo);
      if (credentials) {
        extHostLogService.debug("ProxyResolver#lookupProxyAuthorization Basic authentication received credentials", `proxyURL:${proxyURL}`, `realm:${realm}`);
        const auth = "Basic " + Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64");
        basicAuthCache[proxyURL] = auth;
        return auth;
      } else {
        extHostLogService.debug("ProxyResolver#lookupProxyAuthorization Basic authentication received no credentials", `proxyURL:${proxyURL}`, `realm:${realm}`);
      }
    } catch (err) {
      extHostLogService.error("ProxyResolver#lookupProxyAuthorization Basic authentication failed", err);
    }
  }
  return void 0;
}
__name(lookupProxyAuthorization, "lookupProxyAuthorization");
let telemetrySent = false;
const enableProxyAuthenticationTelemetry = false;
function sendTelemetry(mainThreadTelemetry, authenticate, isRemote) {
  if (!enableProxyAuthenticationTelemetry || telemetrySent || !authenticate.length) {
    return;
  }
  telemetrySent = true;
  mainThreadTelemetry.$publicLog2("proxyAuthenticationRequest", {
    authenticationType: authenticate.map((a) => a.split(" ")[0]).join(","),
    extensionHostType: isRemote ? "remote" : "local"
  });
}
__name(sendTelemetry, "sendTelemetry");
function getExtHostConfigValue(configProvider, isRemote, key, fallback) {
  if (isRemote) {
    return configProvider.getConfiguration().get(key) ?? fallback;
  }
  const values = configProvider.getConfiguration().inspect(key);
  return values?.globalLocalValue ?? values?.defaultValue ?? fallback;
}
__name(getExtHostConfigValue, "getExtHostConfigValue");
export {
  connectProxyResolver
};
//# sourceMappingURL=proxyResolver.js.map
