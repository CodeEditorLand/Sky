var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as vscode from "vscode";
import { UriComponents, URI } from "../../../base/common/uri.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { ExtHostTimelineShape, MainThreadTimelineShape, IMainContext, MainContext } from "./extHost.protocol.js";
import { Timeline, TimelineItem, TimelineOptions, TimelineProvider } from "../../contrib/timeline/common/timeline.js";
import { IDisposable, toDisposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { CommandsConverter, ExtHostCommands } from "./extHostCommands.js";
import { ThemeIcon, MarkdownString as MarkdownStringType } from "./extHostTypes.js";
import { MarkdownString } from "./extHostTypeConverters.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { MarshalledId } from "../../../base/common/marshallingIds.js";
import { isString } from "../../../base/common/types.js";
import { isProposedApiEnabled } from "../../services/extensions/common/extensions.js";
const IExtHostTimeline = createDecorator("IExtHostTimeline");
class ExtHostTimeline {
  static {
    __name(this, "ExtHostTimeline");
  }
  _proxy;
  _providers = /* @__PURE__ */ new Map();
  _itemsBySourceAndUriMap = /* @__PURE__ */ new Map();
  constructor(mainContext, commands) {
    this._proxy = mainContext.getProxy(MainContext.MainThreadTimeline);
    commands.registerArgumentProcessor({
      processArgument: /* @__PURE__ */ __name((arg, extension) => {
        if (arg && arg.$mid === MarshalledId.TimelineActionContext) {
          if (this._providers.get(arg.source) && extension && isProposedApiEnabled(extension, "timeline")) {
            const uri = arg.uri === void 0 ? void 0 : URI.revive(arg.uri);
            return this._itemsBySourceAndUriMap.get(arg.source)?.get(getUriKey(uri))?.get(arg.handle);
          } else {
            return void 0;
          }
        }
        return arg;
      }, "processArgument")
    });
  }
  async $getTimeline(id, uri, options, token) {
    const item = this._providers.get(id);
    return item?.provider.provideTimeline(URI.revive(uri), options, token);
  }
  registerTimelineProvider(scheme, provider, extensionId, commandConverter) {
    const timelineDisposables = new DisposableStore();
    const convertTimelineItem = this.convertTimelineItem(provider.id, commandConverter, timelineDisposables).bind(this);
    let disposable;
    if (provider.onDidChange) {
      disposable = provider.onDidChange((e) => this._proxy.$emitTimelineChangeEvent({ uri: void 0, reset: true, ...e, id: provider.id }), this);
    }
    const itemsBySourceAndUriMap = this._itemsBySourceAndUriMap;
    return this.registerTimelineProviderCore({
      ...provider,
      scheme,
      onDidChange: void 0,
      async provideTimeline(uri, options, token) {
        if (options?.resetCache) {
          timelineDisposables.clear();
          itemsBySourceAndUriMap.get(provider.id)?.clear();
        }
        const result = await provider.provideTimeline(uri, options, token);
        if (result === void 0 || result === null) {
          return void 0;
        }
        const convertItem = convertTimelineItem(uri, options);
        return {
          ...result,
          source: provider.id,
          items: result.items.map(convertItem)
        };
      },
      dispose() {
        for (const sourceMap of itemsBySourceAndUriMap.values()) {
          sourceMap.get(provider.id)?.clear();
        }
        disposable?.dispose();
        timelineDisposables.dispose();
      }
    }, extensionId);
  }
  convertTimelineItem(source, commandConverter, disposables) {
    return (uri, options) => {
      let items;
      if (options?.cacheResults) {
        let itemsByUri = this._itemsBySourceAndUriMap.get(source);
        if (itemsByUri === void 0) {
          itemsByUri = /* @__PURE__ */ new Map();
          this._itemsBySourceAndUriMap.set(source, itemsByUri);
        }
        const uriKey = getUriKey(uri);
        items = itemsByUri.get(uriKey);
        if (items === void 0) {
          items = /* @__PURE__ */ new Map();
          itemsByUri.set(uriKey, items);
        }
      }
      return (item) => {
        const { iconPath, ...props } = item;
        const handle = `${source}|${item.id ?? item.timestamp}`;
        items?.set(handle, item);
        let icon;
        let iconDark;
        let themeIcon;
        if (item.iconPath) {
          if (iconPath instanceof ThemeIcon) {
            themeIcon = { id: iconPath.id, color: iconPath.color };
          } else if (URI.isUri(iconPath)) {
            icon = iconPath;
            iconDark = iconPath;
          } else {
            ({ light: icon, dark: iconDark } = iconPath);
          }
        }
        let tooltip;
        if (MarkdownStringType.isMarkdownString(props.tooltip)) {
          tooltip = MarkdownString.from(props.tooltip);
        } else if (isString(props.tooltip)) {
          tooltip = props.tooltip;
        } else if (MarkdownStringType.isMarkdownString(props.detail)) {
          console.warn("Using deprecated TimelineItem.detail, migrate to TimelineItem.tooltip");
          tooltip = MarkdownString.from(props.detail);
        } else if (isString(props.detail)) {
          console.warn("Using deprecated TimelineItem.detail, migrate to TimelineItem.tooltip");
          tooltip = props.detail;
        }
        return {
          ...props,
          id: props.id ?? void 0,
          handle,
          source,
          command: item.command ? commandConverter.toInternal(item.command, disposables) : void 0,
          icon,
          iconDark,
          themeIcon,
          tooltip,
          accessibilityInformation: item.accessibilityInformation
        };
      };
    };
  }
  registerTimelineProviderCore(provider, extension) {
    const existing = this._providers.get(provider.id);
    if (existing) {
      throw new Error(`Timeline Provider ${provider.id} already exists.`);
    }
    this._proxy.$registerTimelineProvider({
      id: provider.id,
      label: provider.label,
      scheme: provider.scheme
    });
    this._providers.set(provider.id, { provider, extension });
    return toDisposable(() => {
      for (const sourceMap of this._itemsBySourceAndUriMap.values()) {
        sourceMap.get(provider.id)?.clear();
      }
      this._providers.delete(provider.id);
      this._proxy.$unregisterTimelineProvider(provider.id);
      provider.dispose();
    });
  }
}
function getUriKey(uri) {
  return uri?.toString();
}
__name(getUriKey, "getUriKey");
export {
  ExtHostTimeline,
  IExtHostTimeline
};
//# sourceMappingURL=extHostTimeline.js.map
