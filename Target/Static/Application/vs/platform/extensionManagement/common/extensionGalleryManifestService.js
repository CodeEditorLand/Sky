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
import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IProductService } from "../../product/common/productService.js";
let ExtensionGalleryManifestService = class ExtensionGalleryManifestService2 extends Disposable {
  static {
    __name(this, "ExtensionGalleryManifestService");
  }
  get extensionGalleryManifestStatus() {
    return !!this.productService.extensionsGallery?.serviceUrl ? "available" : "unavailable";
  }
  constructor(productService) {
    super();
    this.productService = productService;
    this.onDidChangeExtensionGalleryManifest = Event.None;
    this.onDidChangeExtensionGalleryManifestStatus = Event.None;
  }
  async getExtensionGalleryManifest() {
    const extensionsGallery = this.productService.extensionsGallery;
    if (!extensionsGallery?.serviceUrl) {
      return null;
    }
    const resources = [
      {
        id: `${extensionsGallery.serviceUrl}/extensionquery`,
        type: "ExtensionQueryService"
        /* ExtensionGalleryResourceType.ExtensionQueryService */
      },
      {
        id: `${extensionsGallery.serviceUrl}/vscode/{publisher}/{name}/latest`,
        type: "ExtensionLatestVersionUriTemplate"
        /* ExtensionGalleryResourceType.ExtensionLatestVersionUri */
      },
      {
        id: `${extensionsGallery.serviceUrl}/publishers/{publisher}/extensions/{name}/{version}/stats?statType={statTypeName}`,
        type: "ExtensionStatisticsUriTemplate"
        /* ExtensionGalleryResourceType.ExtensionStatisticsUri */
      }
    ];
    if (extensionsGallery.publisherUrl) {
      resources.push({
        id: `${extensionsGallery.publisherUrl}/{publisher}`,
        type: "PublisherViewUriTemplate"
        /* ExtensionGalleryResourceType.PublisherViewUri */
      });
    }
    if (extensionsGallery.itemUrl) {
      resources.push({
        id: `${extensionsGallery.itemUrl}?itemName={publisher}.{name}`,
        type: "ExtensionDetailsViewUriTemplate"
        /* ExtensionGalleryResourceType.ExtensionDetailsViewUri */
      });
      resources.push({
        id: `${extensionsGallery.itemUrl}?itemName={publisher}.{name}&ssr=false#review-details`,
        type: "ExtensionRatingViewUriTemplate"
        /* ExtensionGalleryResourceType.ExtensionRatingViewUri */
      });
    }
    if (extensionsGallery.resourceUrlTemplate) {
      resources.push({
        id: extensionsGallery.resourceUrlTemplate,
        type: "ExtensionResourceUriTemplate"
        /* ExtensionGalleryResourceType.ExtensionResourceUri */
      });
    }
    const filtering = [
      {
        name: "Tag",
        value: 1
      },
      {
        name: "ExtensionId",
        value: 4
      },
      {
        name: "Category",
        value: 5
      },
      {
        name: "ExtensionName",
        value: 7
      },
      {
        name: "Target",
        value: 8
      },
      {
        name: "Featured",
        value: 9
      },
      {
        name: "SearchText",
        value: 10
      },
      {
        name: "ExcludeWithFlags",
        value: 12
      }
    ];
    const sorting = [
      {
        name: "NoneOrRelevance",
        value: 0
      },
      {
        name: "LastUpdatedDate",
        value: 1
      },
      {
        name: "Title",
        value: 2
      },
      {
        name: "PublisherName",
        value: 3
      },
      {
        name: "InstallCount",
        value: 4
      },
      {
        name: "AverageRating",
        value: 6
      },
      {
        name: "PublishedDate",
        value: 10
      },
      {
        name: "WeightedRating",
        value: 12
      }
    ];
    const flags = [
      {
        name: "None",
        value: 0
      },
      {
        name: "IncludeVersions",
        value: 1
      },
      {
        name: "IncludeFiles",
        value: 2
      },
      {
        name: "IncludeCategoryAndTags",
        value: 4
      },
      {
        name: "IncludeSharedAccounts",
        value: 8
      },
      {
        name: "IncludeVersionProperties",
        value: 16
      },
      {
        name: "ExcludeNonValidated",
        value: 32
      },
      {
        name: "IncludeInstallationTargets",
        value: 64
      },
      {
        name: "IncludeAssetUri",
        value: 128
      },
      {
        name: "IncludeStatistics",
        value: 256
      },
      {
        name: "IncludeLatestVersionOnly",
        value: 512
      },
      {
        name: "Unpublished",
        value: 4096
      },
      {
        name: "IncludeNameConflictInfo",
        value: 32768
      },
      {
        name: "IncludeLatestPrereleaseAndStableVersionOnly",
        value: 65536
      }
    ];
    return {
      version: "",
      resources,
      capabilities: {
        extensionQuery: {
          filtering,
          sorting,
          flags
        },
        signing: {
          allPublicRepositorySigned: true
        }
      }
    };
  }
};
ExtensionGalleryManifestService = __decorate([
  __param(0, IProductService)
], ExtensionGalleryManifestService);
export {
  ExtensionGalleryManifestService
};
//# sourceMappingURL=extensionGalleryManifestService.js.map
