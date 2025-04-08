var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBufferReadableStream } from "../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { isUNC } from "../../../../base/common/extpath.js";
import { Schemas } from "../../../../base/common/network.js";
import { normalize, sep } from "../../../../base/common/path.js";
import { URI } from "../../../../base/common/uri.js";
import { FileOperationError, FileOperationResult, IFileService, IWriteFileOptions } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { getWebviewContentMimeType } from "../../../../platform/webview/common/mimeTypes.js";
var WebviewResourceResponse;
((WebviewResourceResponse2) => {
  let Type;
  ((Type2) => {
    Type2[Type2["Success"] = 0] = "Success";
    Type2[Type2["Failed"] = 1] = "Failed";
    Type2[Type2["AccessDenied"] = 2] = "AccessDenied";
    Type2[Type2["NotModified"] = 3] = "NotModified";
  })(Type = WebviewResourceResponse2.Type || (WebviewResourceResponse2.Type = {}));
  class StreamSuccess {
    constructor(stream, etag, mtime, mimeType) {
      this.stream = stream;
      this.etag = etag;
      this.mtime = mtime;
      this.mimeType = mimeType;
    }
    static {
      __name(this, "StreamSuccess");
    }
    type = 0 /* Success */;
  }
  WebviewResourceResponse2.StreamSuccess = StreamSuccess;
  WebviewResourceResponse2.Failed = { type: 1 /* Failed */ };
  WebviewResourceResponse2.AccessDenied = { type: 2 /* AccessDenied */ };
  class NotModified {
    constructor(mimeType, mtime) {
      this.mimeType = mimeType;
      this.mtime = mtime;
    }
    static {
      __name(this, "NotModified");
    }
    type = 3 /* NotModified */;
  }
  WebviewResourceResponse2.NotModified = NotModified;
})(WebviewResourceResponse || (WebviewResourceResponse = {}));
async function loadLocalResource(requestUri, options, fileService, logService, token) {
  logService.debug(`loadLocalResource - begin. requestUri=${requestUri}`);
  const resourceToLoad = getResourceToLoad(requestUri, options.roots);
  logService.debug(`loadLocalResource - found resource to load. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
  if (!resourceToLoad) {
    return WebviewResourceResponse.AccessDenied;
  }
  const mime = getWebviewContentMimeType(requestUri);
  try {
    const result = await fileService.readFileStream(resourceToLoad, { etag: options.ifNoneMatch }, token);
    return new WebviewResourceResponse.StreamSuccess(result.value, result.etag, result.mtime, mime);
  } catch (err) {
    if (err instanceof FileOperationError) {
      const result = err.fileOperationResult;
      if (result === FileOperationResult.FILE_NOT_MODIFIED_SINCE) {
        return new WebviewResourceResponse.NotModified(mime, err.options?.mtime);
      }
    }
    logService.debug(`loadLocalResource - Error using fileReader. requestUri=${requestUri}`);
    console.log(err);
    return WebviewResourceResponse.Failed;
  }
}
__name(loadLocalResource, "loadLocalResource");
function getResourceToLoad(requestUri, roots) {
  for (const root of roots) {
    if (containsResource(root, requestUri)) {
      return normalizeResourcePath(requestUri);
    }
  }
  return void 0;
}
__name(getResourceToLoad, "getResourceToLoad");
function containsResource(root, resource) {
  if (root.scheme !== resource.scheme) {
    return false;
  }
  let resourceFsPath = normalize(resource.fsPath);
  let rootPath = normalize(root.fsPath + (root.fsPath.endsWith(sep) ? "" : sep));
  if (isUNC(root.fsPath) && isUNC(resource.fsPath)) {
    rootPath = rootPath.toLowerCase();
    resourceFsPath = resourceFsPath.toLowerCase();
  }
  return resourceFsPath.startsWith(rootPath);
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
  loadLocalResource
};
//# sourceMappingURL=resourceLoading.js.map
