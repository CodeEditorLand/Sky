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
import * as http from "http";
import * as https from "https";
import { parse as parseUrl } from "url";
import { Promises } from "../../../base/common/async.js";
import { streamToBufferReadableStream } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { CancellationError, getErrorMessage } from "../../../base/common/errors.js";
import * as streams from "../../../base/common/stream.js";
import { isBoolean, isNumber } from "../../../base/common/types.js";
import { IRequestContext, IRequestOptions } from "../../../base/parts/request/common/request.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { INativeEnvironmentService } from "../../environment/common/environment.js";
import { getResolvedShellEnv } from "../../shell/node/shellEnv.js";
import { ILogService } from "../../log/common/log.js";
import { AbstractRequestService, AuthInfo, Credentials, IRequestService } from "../common/request.js";
import { Agent, getProxyAgent } from "./proxy.js";
import { createGunzip } from "zlib";
let RequestService = class extends AbstractRequestService {
  constructor(machine, configurationService, environmentService, logService) {
    super(logService);
    this.machine = machine;
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.configure();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("http")) {
        this.configure();
      }
    }));
  }
  static {
    __name(this, "RequestService");
  }
  proxyUrl;
  strictSSL;
  authorization;
  shellEnvErrorLogged;
  configure() {
    this.proxyUrl = this.getConfigValue("http.proxy");
    this.strictSSL = !!this.getConfigValue("http.proxyStrictSSL");
    this.authorization = this.getConfigValue("http.proxyAuthorization");
  }
  async request(options, token) {
    const { proxyUrl, strictSSL } = this;
    let shellEnv = void 0;
    try {
      shellEnv = await getResolvedShellEnv(this.configurationService, this.logService, this.environmentService.args, process.env);
    } catch (error) {
      if (!this.shellEnvErrorLogged) {
        this.shellEnvErrorLogged = true;
        this.logService.error(`resolving shell environment failed`, getErrorMessage(error));
      }
    }
    const env = {
      ...process.env,
      ...shellEnv
    };
    const agent = options.agent ? options.agent : await getProxyAgent(options.url || "", env, { proxyUrl, strictSSL });
    options.agent = agent;
    options.strictSSL = strictSSL;
    if (this.authorization) {
      options.headers = {
        ...options.headers || {},
        "Proxy-Authorization": this.authorization
      };
    }
    return this.logAndRequest(options, () => nodeRequest(options, token));
  }
  async resolveProxy(url) {
    return void 0;
  }
  async lookupAuthorization(authInfo) {
    return void 0;
  }
  async lookupKerberosAuthorization(urlStr) {
    try {
      const spnConfig = this.getConfigValue("http.proxyKerberosServicePrincipal");
      const response = await lookupKerberosAuthorization(urlStr, spnConfig, this.logService, "RequestService#lookupKerberosAuthorization");
      return "Negotiate " + response;
    } catch (err) {
      this.logService.debug("RequestService#lookupKerberosAuthorization Kerberos authentication failed", err);
      return void 0;
    }
  }
  async loadCertificates() {
    const proxyAgent = await import("@vscode/proxy-agent");
    return proxyAgent.loadSystemCertificates({ log: this.logService });
  }
  getConfigValue(key) {
    if (this.machine === "remote") {
      return this.configurationService.getValue(key);
    }
    const values = this.configurationService.inspect(key);
    return values.userLocalValue || values.defaultValue;
  }
};
RequestService = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, INativeEnvironmentService),
  __decorateParam(3, ILogService)
], RequestService);
async function lookupKerberosAuthorization(urlStr, spnConfig, logService, logPrefix) {
  const importKerberos = await import("kerberos");
  const kerberos = importKerberos.default || importKerberos;
  const url = new URL(urlStr);
  const spn = spnConfig || (process.platform === "win32" ? `HTTP/${url.hostname}` : `HTTP@${url.hostname}`);
  logService.debug(`${logPrefix} Kerberos authentication lookup`, `proxyURL:${url}`, `spn:${spn}`);
  const client = await kerberos.initializeClient(spn);
  return client.step("");
}
__name(lookupKerberosAuthorization, "lookupKerberosAuthorization");
async function getNodeRequest(options) {
  const endpoint = parseUrl(options.url);
  const module = endpoint.protocol === "https:" ? await import("https") : await import("http");
  return module.request;
}
__name(getNodeRequest, "getNodeRequest");
async function nodeRequest(options, token) {
  return Promises.withAsyncBody(async (resolve, reject) => {
    const endpoint = parseUrl(options.url);
    const rawRequest = options.getRawRequest ? options.getRawRequest(options) : await getNodeRequest(options);
    const opts = {
      hostname: endpoint.hostname,
      port: endpoint.port ? parseInt(endpoint.port) : endpoint.protocol === "https:" ? 443 : 80,
      protocol: endpoint.protocol,
      path: endpoint.path,
      method: options.type || "GET",
      headers: options.headers,
      agent: options.agent,
      rejectUnauthorized: isBoolean(options.strictSSL) ? options.strictSSL : true
    };
    if (options.user && options.password) {
      opts.auth = options.user + ":" + options.password;
    }
    if (options.disableCache) {
      opts.cache = "no-store";
    }
    const req = rawRequest(opts, (res) => {
      const followRedirects = isNumber(options.followRedirects) ? options.followRedirects : 3;
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && followRedirects > 0 && res.headers["location"]) {
        nodeRequest({
          ...options,
          url: res.headers["location"],
          followRedirects: followRedirects - 1
        }, token).then(resolve, reject);
      } else {
        let stream = res;
        if (!options.isChromiumNetwork && res.headers["content-encoding"] === "gzip") {
          stream = res.pipe(createGunzip());
        }
        resolve({ res, stream: streamToBufferReadableStream(stream) });
      }
    });
    req.on("error", reject);
    if (options.timeout) {
      if (options.isChromiumNetwork) {
        const timeout = setTimeout(() => {
          req.abort();
          reject(new Error(`Request timeout after ${options.timeout}ms`));
        }, options.timeout);
        req.on("response", () => clearTimeout(timeout));
        req.on("error", () => clearTimeout(timeout));
        req.on("abort", () => clearTimeout(timeout));
      } else {
        req.setTimeout(options.timeout);
      }
    }
    if (options.isChromiumNetwork) {
      req.removeHeader("Content-Length");
    }
    if (options.data) {
      if (typeof options.data === "string") {
        req.write(options.data);
      }
    }
    req.end();
    token.onCancellationRequested(() => {
      req.abort();
      reject(new CancellationError());
    });
  });
}
__name(nodeRequest, "nodeRequest");
export {
  RequestService,
  lookupKerberosAuthorization,
  nodeRequest
};
//# sourceMappingURL=requestService.js.map
