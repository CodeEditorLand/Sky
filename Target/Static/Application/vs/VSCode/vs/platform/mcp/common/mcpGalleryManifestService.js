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
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { ILogService } from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import { IRequestService, isSuccess } from "../../request/common/request.js";
const SUPPORTED_VERSIONS = [
  "v0.1",
  "v0"
];
let McpGalleryManifestService = class McpGalleryManifestService2 extends Disposable {
  static {
    __name(this, "McpGalleryManifestService");
  }
  get mcpGalleryManifestStatus() {
    return !!this.productService.mcpGallery?.serviceUrl ? "available" : "unavailable";
  }
  constructor(productService, requestService, logService) {
    super();
    this.productService = productService;
    this.requestService = requestService;
    this.logService = logService;
    this.onDidChangeMcpGalleryManifest = Event.None;
    this.onDidChangeMcpGalleryManifestStatus = Event.None;
    this.versionByUrl = /* @__PURE__ */ new Map();
  }
  async getMcpGalleryManifest() {
    if (!this.productService.mcpGallery) {
      return null;
    }
    return this.createMcpGalleryManifest(this.productService.mcpGallery.serviceUrl, SUPPORTED_VERSIONS[0]);
  }
  async createMcpGalleryManifest(url, version) {
    url = url.endsWith("/") ? url.slice(0, -1) : url;
    if (!version) {
      let versionPromise = this.versionByUrl.get(url);
      if (!versionPromise) {
        this.versionByUrl.set(url, versionPromise = this.getVersion(url));
      }
      version = await versionPromise;
    }
    const isProductGalleryUrl = this.productService.mcpGallery?.serviceUrl === url;
    const serversUrl = `${url}/${version}/servers`;
    const resources = [
      {
        id: serversUrl,
        type: "McpServersQueryService"
        /* McpGalleryResourceType.McpServersQueryService */
      },
      {
        id: `${serversUrl}/{name}/versions/{version}`,
        type: "McpServerVersionUriTemplate"
        /* McpGalleryResourceType.McpServerVersionUri */
      },
      {
        id: `${serversUrl}/{name}/versions/latest`,
        type: "McpServerLatestVersionUriTemplate"
        /* McpGalleryResourceType.McpServerLatestVersionUri */
      }
    ];
    if (isProductGalleryUrl) {
      resources.push({
        id: `${serversUrl}/by-name/{name}`,
        type: "McpServerNamedResourceUriTemplate"
        /* McpGalleryResourceType.McpServerNamedResourceUri */
      });
      resources.push({
        id: this.productService.mcpGallery.itemWebUrl,
        type: "McpServerWebUriTemplate"
        /* McpGalleryResourceType.McpServerWebUri */
      });
      resources.push({
        id: this.productService.mcpGallery.publisherUrl,
        type: "PublisherUriTemplate"
        /* McpGalleryResourceType.PublisherUriTemplate */
      });
      resources.push({
        id: this.productService.mcpGallery.supportUrl,
        type: "ContactSupportUri"
        /* McpGalleryResourceType.ContactSupportUri */
      });
      resources.push({
        id: this.productService.mcpGallery.supportUrl,
        type: "ContactSupportUri"
        /* McpGalleryResourceType.ContactSupportUri */
      });
      resources.push({
        id: this.productService.mcpGallery.privacyPolicyUrl,
        type: "PrivacyPolicyUri"
        /* McpGalleryResourceType.PrivacyPolicyUri */
      });
      resources.push({
        id: this.productService.mcpGallery.termsOfServiceUrl,
        type: "TermsOfServiceUri"
        /* McpGalleryResourceType.TermsOfServiceUri */
      });
      resources.push({
        id: this.productService.mcpGallery.reportUrl,
        type: "ReportUri"
        /* McpGalleryResourceType.ReportUri */
      });
    }
    if (version === "v0") {
      resources.push({
        id: `${serversUrl}/{id}`,
        type: "McpServerIdUriTemplate"
        /* McpGalleryResourceType.McpServerIdUri */
      });
    }
    return {
      version,
      url,
      resources
    };
  }
  async getVersion(url) {
    for (const version of SUPPORTED_VERSIONS) {
      if (await this.checkVersion(url, version)) {
        return version;
      }
    }
    return SUPPORTED_VERSIONS[0];
  }
  async checkVersion(url, version) {
    try {
      const context = await this.requestService.request({
        type: "GET",
        url: `${url}/${version}/servers?limit=1`,
        callSite: "mcpGalleryManifestService.checkVersion"
      }, CancellationToken.None);
      if (isSuccess(context)) {
        return true;
      }
      this.logService.info(`The service at ${url} does not support version ${version}. Service returned status ${context.res.statusCode}.`);
    } catch (error) {
      this.logService.error(error);
    }
    return false;
  }
};
McpGalleryManifestService = __decorate([
  __param(0, IProductService),
  __param(1, IRequestService),
  __param(2, ILogService)
], McpGalleryManifestService);
export {
  McpGalleryManifestService
};
//# sourceMappingURL=mcpGalleryManifestService.js.map
