var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { RequestChannelClient } from "../../../../platform/request/common/requestIpc.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { AbstractRequestService } from "../../../../platform/request/common/request.js";
import { request } from "../../../../base/parts/request/common/requestImpl.js";
import { ILoggerService } from "../../../../platform/log/common/log.js";
import { localize } from "../../../../nls.js";
import { LogService } from "../../../../platform/log/common/logService.js";
import { windowLogGroup } from "../../log/common/logConstants.js";
let BrowserRequestService = class BrowserRequestService2 extends AbstractRequestService {
  static {
    __name(this, "BrowserRequestService");
  }
  constructor(remoteAgentService, configurationService, loggerService) {
    const logger = loggerService.createLogger(`network`, { name: localize("network", "Network"), group: windowLogGroup });
    const logService = new LogService(logger);
    super(logService);
    this.remoteAgentService = remoteAgentService;
    this.configurationService = configurationService;
    this._register(logger);
    this._register(logService);
  }
  async request(options, token) {
    try {
      if (!options.proxyAuthorization) {
        options.proxyAuthorization = this.configurationService.inspect("http.proxyAuthorization").userLocalValue;
      }
      const context = await this.logAndRequest(options, () => request(options, token, () => navigator.onLine));
      const connection = this.remoteAgentService.getConnection();
      if (connection && context.res.statusCode === 405) {
        return this._makeRemoteRequest(connection, options, token);
      }
      return context;
    } catch (error) {
      const connection = this.remoteAgentService.getConnection();
      if (connection) {
        return this._makeRemoteRequest(connection, options, token);
      }
      throw error;
    }
  }
  async resolveProxy(url) {
    return void 0;
  }
  async lookupAuthorization(authInfo) {
    return void 0;
  }
  async lookupKerberosAuthorization(url) {
    return void 0;
  }
  async loadCertificates() {
    return [];
  }
  _makeRemoteRequest(connection, options, token) {
    return connection.withChannel("request", (channel) => new RequestChannelClient(channel).request(options, token));
  }
};
BrowserRequestService = __decorate([
  __param(0, IRemoteAgentService),
  __param(1, IConfigurationService),
  __param(2, ILoggerService)
], BrowserRequestService);
CommandsRegistry.registerCommand("_workbench.fetchJSON", async function(accessor, url, method) {
  const result = await fetch(url, { method, headers: { Accept: "application/json" } });
  if (result.ok) {
    return result.json();
  } else {
    throw new Error(result.statusText);
  }
});
export {
  BrowserRequestService
};
//# sourceMappingURL=requestService.js.map
