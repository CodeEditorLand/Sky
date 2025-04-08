var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BugIndicatingError } from "../../../../base/common/errors.js";
import { IValueWithChangeEvent } from "../../../../base/common/event.js";
import { IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ContextKeyValue } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IMultiDiffSourceResolverService = createDecorator("multiDiffSourceResolverService");
class MultiDiffEditorItem {
  constructor(originalUri, modifiedUri, goToFileUri, contextKeys) {
    this.originalUri = originalUri;
    this.modifiedUri = modifiedUri;
    this.goToFileUri = goToFileUri;
    this.contextKeys = contextKeys;
    if (!originalUri && !modifiedUri) {
      throw new BugIndicatingError("Invalid arguments");
    }
  }
  static {
    __name(this, "MultiDiffEditorItem");
  }
  getKey() {
    return JSON.stringify([this.modifiedUri?.toString(), this.originalUri?.toString()]);
  }
}
class MultiDiffSourceResolverService {
  static {
    __name(this, "MultiDiffSourceResolverService");
  }
  _serviceBrand;
  _resolvers = /* @__PURE__ */ new Set();
  registerResolver(resolver) {
    if (this._resolvers.has(resolver)) {
      throw new BugIndicatingError("Duplicate resolver");
    }
    this._resolvers.add(resolver);
    return toDisposable(() => this._resolvers.delete(resolver));
  }
  resolve(uri) {
    for (const resolver of this._resolvers) {
      if (resolver.canHandleUri(uri)) {
        return resolver.resolveDiffSource(uri);
      }
    }
    return Promise.resolve(void 0);
  }
}
export {
  IMultiDiffSourceResolverService,
  MultiDiffEditorItem,
  MultiDiffSourceResolverService
};
//# sourceMappingURL=multiDiffSourceResolverService.js.map
