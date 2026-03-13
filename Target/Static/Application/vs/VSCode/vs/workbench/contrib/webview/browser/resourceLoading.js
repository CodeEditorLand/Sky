var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isUNC } from "../../../../base/common/extpath.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { FileOperationError } from "../../../../platform/files/common/files.js";
import { getWebviewContentMimeType } from "../../../../platform/webview/common/mimeTypes.js";
var WebviewResourceResponse;
(function(WebviewResourceResponse2) {
  let Type;
  (function(Type2) {
    Type2[Type2["Success"] = 0] = "Success";
    Type2[Type2["Failed"] = 1] = "Failed";
    Type2[Type2["AccessDenied"] = 2] = "AccessDenied";
    Type2[Type2["NotModified"] = 3] = "NotModified";
  })(Type = WebviewResourceResponse2.Type || (WebviewResourceResponse2.Type = {}));
  class StreamSuccess {
    static {
      __name(this, "StreamSuccess");
    }
    constructor(stream, etag, mtime, mimeType) {
      this.stream = stream;
      this.etag = etag;
      this.mtime = mtime;
      this.mimeType = mimeType;
      this.type = Type.Success;
    }
  }
  WebviewResourceResponse2.StreamSuccess = StreamSuccess;
  WebviewResourceResponse2.Failed = { type: Type.Failed };
  WebviewResourceResponse2.AccessDenied = { type: Type.AccessDenied };
  class NotModified {
    static {
      __name(this, "NotModified");
    }
    constructor(mimeType, mtime) {
      this.mimeType = mimeType;
      this.mtime = mtime;
      this.type = Type.NotModified;
    }
  }
  WebviewResourceResponse2.NotModified = NotModified;
})(WebviewResourceResponse || (WebviewResourceResponse = {}));
async function loadLocalResource(requestUri, options, uriIdentityService, fileService, logService, token) {
  const resourceToLoad = getResourceToLoad(requestUri, options.roots, uriIdentityService);
  logService.trace(`Webview.loadLocalResource - trying to load resource. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
  if (!resourceToLoad) {
    logService.trace(`Webview.loadLocalResource - access denied. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
    return WebviewResourceResponse.AccessDenied;
  }
  const mime = getWebviewContentMimeType(requestUri);
  try {
    const result = await fileService.readFileStream(resourceToLoad, { etag: options.ifNoneMatch }, token);
    logService.trace(`Webview.loadLocalResource - Loaded. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
    return new WebviewResourceResponse.StreamSuccess(result.value, result.etag, result.mtime, mime);
  } catch (err) {
    if (err instanceof FileOperationError) {
      const result = err.fileOperationResult;
      if (result === 2) {
        logService.trace(`Webview.loadLocalResource - not modified. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
        return new WebviewResourceResponse.NotModified(mime, err.options?.mtime);
      }
    }
    logService.error(`Webview.loadLocalResource - Error using fileReader. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
    return WebviewResourceResponse.Failed;
  }
}
__name(loadLocalResource, "loadLocalResource");
function getResourceToLoad(requestUri, roots, uriIdentityService) {
  const requestUriNoQueryString = requestUri.with({ query: "" });
  for (const root of roots) {
    if (containsResource(root, requestUriNoQueryString, uriIdentityService)) {
      return normalizeResourcePath(requestUri);
    }
  }
  return void 0;
}
__name(getResourceToLoad, "getResourceToLoad");
function containsResource(root, resource, uriIdentityService) {
  if (uriIdentityService.extUri.isEqual(
    root,
    resource,
    /* ignoreFragment */
    true
  )) {
    return false;
  }
  if (root.scheme === Schemas.file && isUNC(root.fsPath)) {
    if (resource.scheme === Schemas.file && isUNC(resource.fsPath)) {
      return uriIdentityService.extUri.isEqualOrParent(
        resource.with({
          path: resource.path.toLowerCase(),
          authority: resource.authority.toLowerCase()
        }),
        root.with({
          path: root.path.toLowerCase(),
          authority: root.authority.toLowerCase()
        }),
        /* ignoreFragment */
        true
      );
    }
    return false;
  }
  return uriIdentityService.extUri.isEqualOrParent(
    resource,
    root,
    /* ignoreFragment */
    true
  );
}
__name(containsResource, "containsResource");
function normalizeResourcePath(resource) {
  if (resource.scheme === Schemas.vscodeRemote) {
    return URI.from({
      scheme: Schemas.vscodeRemote,
      authority: resource.authority,
      path: "/vscode-resource",
      query: JSON.stringify({
        requestResourcePath: resource.path
      })
    });
  }
  return resource;
}
__name(normalizeResourcePath, "normalizeResourcePath");
export {
  WebviewResourceResponse,
  getResourceToLoad,
  loadLocalResource
};
//# sourceMappingURL=resourceLoading.js.map
