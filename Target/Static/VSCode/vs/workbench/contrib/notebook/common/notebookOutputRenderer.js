var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as glob from "../../../../base/common/glob.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { joinPath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { INotebookRendererInfo, ContributedNotebookRendererEntrypoint, NotebookRendererMatch, RendererMessagingSpec, NotebookRendererEntrypoint, INotebookStaticPreloadInfo } from "./notebookCommon.js";
class DependencyList {
  static {
    __name(this, "DependencyList");
  }
  value;
  defined;
  constructor(value) {
    this.value = new Set(value);
    this.defined = this.value.size > 0;
  }
  /** Gets whether any of the 'available' dependencies match the ones in this list */
  matches(available) {
    return available.some((v) => this.value.has(v));
  }
}
class NotebookOutputRendererInfo {
  static {
    __name(this, "NotebookOutputRendererInfo");
  }
  id;
  entrypoint;
  displayName;
  extensionLocation;
  extensionId;
  hardDependencies;
  optionalDependencies;
  messaging;
  mimeTypes;
  mimeTypeGlobs;
  isBuiltin;
  constructor(descriptor) {
    this.id = descriptor.id;
    this.extensionId = descriptor.extension.identifier;
    this.extensionLocation = descriptor.extension.extensionLocation;
    this.isBuiltin = descriptor.extension.isBuiltin;
    if (typeof descriptor.entrypoint === "string") {
      this.entrypoint = {
        extends: void 0,
        path: joinPath(this.extensionLocation, descriptor.entrypoint)
      };
    } else {
      this.entrypoint = {
        extends: descriptor.entrypoint.extends,
        path: joinPath(this.extensionLocation, descriptor.entrypoint.path)
      };
    }
    this.displayName = descriptor.displayName;
    this.mimeTypes = descriptor.mimeTypes;
    this.mimeTypeGlobs = this.mimeTypes.map((pattern) => glob.parse(pattern));
    this.hardDependencies = new DependencyList(descriptor.dependencies ?? Iterable.empty());
    this.optionalDependencies = new DependencyList(descriptor.optionalDependencies ?? Iterable.empty());
    this.messaging = descriptor.requiresMessaging ?? RendererMessagingSpec.Never;
  }
  matchesWithoutKernel(mimeType) {
    if (!this.matchesMimeTypeOnly(mimeType)) {
      return NotebookRendererMatch.Never;
    }
    if (this.hardDependencies.defined) {
      return NotebookRendererMatch.WithHardKernelDependency;
    }
    if (this.optionalDependencies.defined) {
      return NotebookRendererMatch.WithOptionalKernelDependency;
    }
    return NotebookRendererMatch.Pure;
  }
  matches(mimeType, kernelProvides) {
    if (!this.matchesMimeTypeOnly(mimeType)) {
      return NotebookRendererMatch.Never;
    }
    if (this.hardDependencies.defined) {
      return this.hardDependencies.matches(kernelProvides) ? NotebookRendererMatch.WithHardKernelDependency : NotebookRendererMatch.Never;
    }
    return this.optionalDependencies.matches(kernelProvides) ? NotebookRendererMatch.WithOptionalKernelDependency : NotebookRendererMatch.Pure;
  }
  matchesMimeTypeOnly(mimeType) {
    if (this.entrypoint.extends) {
      return false;
    }
    return this.mimeTypeGlobs.some((pattern) => pattern(mimeType)) || this.mimeTypes.some((pattern) => pattern === mimeType);
  }
}
class NotebookStaticPreloadInfo {
  static {
    __name(this, "NotebookStaticPreloadInfo");
  }
  type;
  entrypoint;
  extensionLocation;
  localResourceRoots;
  constructor(descriptor) {
    this.type = descriptor.type;
    this.entrypoint = joinPath(descriptor.extension.extensionLocation, descriptor.entrypoint);
    this.extensionLocation = descriptor.extension.extensionLocation;
    this.localResourceRoots = descriptor.localResourceRoots.map((root) => joinPath(descriptor.extension.extensionLocation, root));
  }
}
export {
  NotebookOutputRendererInfo,
  NotebookStaticPreloadInfo
};
//# sourceMappingURL=notebookOutputRenderer.js.map
