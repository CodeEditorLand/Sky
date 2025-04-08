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
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, DisposableMap, IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ITimelineService, TimelineChangeEvent, TimelineOptions, TimelineProvidersChangeEvent, TimelineProvider, TimelinePaneId } from "./timeline.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
const TimelineHasProviderContext = new RawContextKey("timelineHasProvider", false);
let TimelineService = class extends Disposable {
  constructor(logService, viewsService, configurationService, contextKeyService) {
    super();
    this.logService = logService;
    this.viewsService = viewsService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this.hasProviderContext = TimelineHasProviderContext.bindTo(this.contextKeyService);
    this.updateHasProviderContext();
  }
  static {
    __name(this, "TimelineService");
  }
  _onDidChangeProviders = this._register(new Emitter());
  onDidChangeProviders = this._onDidChangeProviders.event;
  _onDidChangeTimeline = this._register(new Emitter());
  onDidChangeTimeline = this._onDidChangeTimeline.event;
  _onDidChangeUri = this._register(new Emitter());
  onDidChangeUri = this._onDidChangeUri.event;
  hasProviderContext;
  providers = /* @__PURE__ */ new Map();
  providerSubscriptions = this._register(new DisposableMap());
  getSources() {
    return [...this.providers.values()].map((p) => ({ id: p.id, label: p.label }));
  }
  getTimeline(id, uri, options, tokenSource) {
    this.logService.trace(`TimelineService#getTimeline(${id}): uri=${uri.toString()}`);
    const provider = this.providers.get(id);
    if (provider === void 0) {
      return void 0;
    }
    if (typeof provider.scheme === "string") {
      if (provider.scheme !== "*" && provider.scheme !== uri.scheme) {
        return void 0;
      }
    } else if (!provider.scheme.includes(uri.scheme)) {
      return void 0;
    }
    return {
      result: provider.provideTimeline(uri, options, tokenSource.token).then((result) => {
        if (result === void 0) {
          return void 0;
        }
        result.items = result.items.map((item) => ({ ...item, source: provider.id }));
        result.items.sort((a, b) => b.timestamp - a.timestamp || b.source.localeCompare(a.source, void 0, { numeric: true, sensitivity: "base" }));
        return result;
      }),
      options,
      source: provider.id,
      tokenSource,
      uri
    };
  }
  registerTimelineProvider(provider) {
    this.logService.trace(`TimelineService#registerTimelineProvider: id=${provider.id}`);
    const id = provider.id;
    const existing = this.providers.get(id);
    if (existing) {
      try {
        existing?.dispose();
      } catch {
      }
    }
    this.providers.set(id, provider);
    this.updateHasProviderContext();
    if (provider.onDidChange) {
      this.providerSubscriptions.set(id, provider.onDidChange((e) => this._onDidChangeTimeline.fire(e)));
    }
    this._onDidChangeProviders.fire({ added: [id] });
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this.providers.delete(id);
        this._onDidChangeProviders.fire({ removed: [id] });
      }, "dispose")
    };
  }
  unregisterTimelineProvider(id) {
    this.logService.trace(`TimelineService#unregisterTimelineProvider: id=${id}`);
    if (!this.providers.has(id)) {
      return;
    }
    this.providers.delete(id);
    this.providerSubscriptions.deleteAndDispose(id);
    this.updateHasProviderContext();
    this._onDidChangeProviders.fire({ removed: [id] });
  }
  setUri(uri) {
    this.viewsService.openView(TimelinePaneId, true);
    this._onDidChangeUri.fire(uri);
  }
  updateHasProviderContext() {
    this.hasProviderContext.set(this.providers.size !== 0);
  }
};
TimelineService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IViewsService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IContextKeyService)
], TimelineService);
export {
  TimelineHasProviderContext,
  TimelineService
};
//# sourceMappingURL=timelineService.js.map
