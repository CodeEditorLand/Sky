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
import { localize } from "../../../../nls.js";
import { Disposable, DisposableStore, isDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { Event, Emitter } from "../../../../base/common/event.js";
import { isCancellationError, getErrorMessage, CancellationError } from "../../../../base/common/errors.js";
import { createErrorWithActions } from "../../../../base/common/errorMessage.js";
import { PagedModel, IPagedModel, DelayedPagedModel, IPager } from "../../../../base/common/paging.js";
import { SortOrder, IQueryOptions as IGalleryQueryOptions, SortBy as GallerySortBy, InstallExtensionInfo, ExtensionGalleryErrorCode, ExtensionGalleryError } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IExtensionManagementServer, IExtensionManagementServerService, EnablementState, IWorkbenchExtensionManagementService, IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionRecommendationsService } from "../../../services/extensionRecommendations/common/extensionRecommendations.js";
import { areSameExtensions, getExtensionDependencies } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { append, $ } from "../../../../base/browser/dom.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Delegate, Renderer } from "./extensionsList.js";
import { ExtensionResultsListFocused, ExtensionState, IExtension, IExtensionsViewState, IExtensionsWorkbenchService, IWorkspaceRecommendedExtensionsView } from "../common/extensions.js";
import { Query } from "../common/extensionQuery.js";
import { IExtensionService, toExtension } from "../../../services/extensions/common/extensions.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IViewletViewOptions } from "../../../browser/parts/views/viewsViewlet.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { CountBadge } from "../../../../base/browser/ui/countBadge/countBadge.js";
import { ManageExtensionAction, getContextMenuActions, ExtensionAction } from "./extensionsActions.js";
import { WorkbenchPagedList } from "../../../../platform/list/browser/listService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { ViewPane, IViewPaneOptions, ViewPaneShowActions } from "../../../browser/parts/views/viewPane.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { coalesce, distinct, range } from "../../../../base/common/arrays.js";
import { alert } from "../../../../base/browser/ui/aria/aria.js";
import { IListContextMenuEvent } from "../../../../base/browser/ui/list/list.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { IAction, Action, Separator, ActionRunner } from "../../../../base/common/actions.js";
import { ExtensionIdentifier, ExtensionIdentifierMap, ExtensionUntrustedWorkspaceSupportType, ExtensionVirtualWorkspaceSupportType, IExtensionDescription, IExtensionIdentifier, isLanguagePackExtension } from "../../../../platform/extensions/common/extensions.js";
import { CancelablePromise, createCancelablePromise, ThrottledDelayer } from "../../../../base/common/async.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { SeverityIcon } from "../../../../base/browser/ui/severityIcon/severityIcon.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IViewDescriptorService, ViewContainerLocation } from "../../../common/views.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { IExtensionManifestPropertiesService } from "../../../services/extensions/common/extensionManifestPropertiesService.js";
import { isVirtualWorkspace } from "../../../../platform/workspace/common/virtualWorkspace.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { IWorkbenchLayoutService, Position } from "../../../services/layout/browser/layoutService.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { isOfflineError } from "../../../../base/parts/request/common/request.js";
import { defaultCountBadgeStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions, IExtensionFeatureRenderer, IExtensionFeaturesManagementService, IExtensionFeaturesRegistry } from "../../../services/extensionManagement/common/extensionFeatures.js";
import { URI } from "../../../../base/common/uri.js";
import { isString } from "../../../../base/common/types.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
const NONE_CATEGORY = "none";
class ExtensionsViewState extends Disposable {
  static {
    __name(this, "ExtensionsViewState");
  }
  _onFocus = this._register(new Emitter());
  onFocus = this._onFocus.event;
  _onBlur = this._register(new Emitter());
  onBlur = this._onBlur.event;
  currentlyFocusedItems = [];
  filters = {};
  onFocusChange(extensions) {
    this.currentlyFocusedItems.forEach((extension) => this._onBlur.fire(extension));
    this.currentlyFocusedItems = extensions;
    this.currentlyFocusedItems.forEach((extension) => this._onFocus.fire(extension));
  }
}
var LocalSortBy = /* @__PURE__ */ ((LocalSortBy2) => {
  LocalSortBy2["UpdateDate"] = "UpdateDate";
  return LocalSortBy2;
})(LocalSortBy || {});
function isLocalSortBy(value) {
  switch (value) {
    case "UpdateDate" /* UpdateDate */:
      return true;
  }
}
__name(isLocalSortBy, "isLocalSortBy");
let ExtensionsListView = class extends ViewPane {
  constructor(options, viewletViewOptions, notificationService, keybindingService, contextMenuService, instantiationService, themeService, extensionService, extensionsWorkbenchService, extensionRecommendationsService, telemetryService, hoverService, configurationService, contextService, extensionManagementServerService, extensionManifestPropertiesService, extensionManagementService, workspaceService, productService, contextKeyService, viewDescriptorService, openerService, preferencesService, storageService, workspaceTrustManagementService, extensionEnablementService, layoutService, extensionFeaturesManagementService, uriIdentityService, logService) {
    super({
      ...viewletViewOptions,
      showActions: ViewPaneShowActions.Always,
      maximumBodySize: options.flexibleHeight ? storageService.getNumber(`${viewletViewOptions.id}.size`, StorageScope.PROFILE, 0) ? void 0 : 0 : void 0
    }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.options = options;
    this.notificationService = notificationService;
    this.extensionService = extensionService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionRecommendationsService = extensionRecommendationsService;
    this.telemetryService = telemetryService;
    this.contextService = contextService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
    this.extensionManagementService = extensionManagementService;
    this.workspaceService = workspaceService;
    this.productService = productService;
    this.preferencesService = preferencesService;
    this.storageService = storageService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.extensionEnablementService = extensionEnablementService;
    this.layoutService = layoutService;
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    if (this.options.onDidChangeTitle) {
      this._register(this.options.onDidChangeTitle((title) => this.updateTitle(title)));
    }
    this._register(this.contextMenuActionRunner.onDidRun(({ error }) => error && this.notificationService.error(error)));
    this.registerActions();
  }
  static {
    __name(this, "ExtensionsListView");
  }
  static RECENT_UPDATE_DURATION = 7 * 24 * 60 * 60 * 1e3;
  // 7 days
  bodyTemplate;
  badge;
  list = null;
  queryRequest = null;
  queryResult;
  extensionsViewState;
  contextMenuActionRunner = this._register(new ActionRunner());
  registerActions() {
  }
  renderHeader(container) {
    container.classList.add("extension-view-header");
    super.renderHeader(container);
    if (!this.options.hideBadge) {
      this.badge = this._register(new CountBadge(append(container, $(".count-badge-wrapper")), {}, defaultCountBadgeStyles));
    }
  }
  renderBody(container) {
    super.renderBody(container);
    const messageContainer = append(container, $(".message-container"));
    const messageSeverityIcon = append(messageContainer, $(""));
    const messageBox = append(messageContainer, $(".message"));
    const extensionsList = append(container, $(".extensions-list"));
    const delegate = new Delegate();
    this.extensionsViewState = new ExtensionsViewState();
    const renderer = this.instantiationService.createInstance(Renderer, this.extensionsViewState, {
      hoverOptions: {
        position: /* @__PURE__ */ __name(() => {
          const viewLocation = this.viewDescriptorService.getViewLocationById(this.id);
          if (viewLocation === ViewContainerLocation.Sidebar) {
            return this.layoutService.getSideBarPosition() === Position.LEFT ? HoverPosition.RIGHT : HoverPosition.LEFT;
          }
          if (viewLocation === ViewContainerLocation.AuxiliaryBar) {
            return this.layoutService.getSideBarPosition() === Position.LEFT ? HoverPosition.LEFT : HoverPosition.RIGHT;
          }
          return HoverPosition.RIGHT;
        }, "position")
      }
    });
    this.list = this.instantiationService.createInstance(WorkbenchPagedList, "Extensions", extensionsList, delegate, [renderer], {
      multipleSelectionSupport: false,
      setRowLineHeight: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel(extension) {
          return getAriaLabelForExtension(extension);
        },
        getWidgetAriaLabel() {
          return localize("extensions", "Extensions");
        }
      },
      overrideStyles: this.getLocationBasedColors().listOverrideStyles,
      openOnSingleClick: true
    });
    ExtensionResultsListFocused.bindTo(this.list.contextKeyService);
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e), this));
    this._register(this.list.onDidChangeFocus((e) => this.extensionsViewState?.onFocusChange(coalesce(e.elements)), this));
    this._register(this.list);
    this._register(this.extensionsViewState);
    this._register(Event.debounce(Event.filter(this.list.onDidOpen, (e) => e.element !== null), (_, event) => event, 75, true)((options) => {
      this.openExtension(options.element, { sideByside: options.sideBySide, ...options.editorOptions });
    }));
    this.bodyTemplate = {
      extensionsList,
      messageBox,
      messageContainer,
      messageSeverityIcon
    };
    if (this.queryResult) {
      this.setModel(this.queryResult.model);
    }
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    if (this.bodyTemplate) {
      this.bodyTemplate.extensionsList.style.height = height + "px";
    }
    this.list?.layout(height, width);
  }
  async show(query, refresh) {
    if (this.queryRequest) {
      if (!refresh && this.queryRequest.query === query) {
        return this.queryRequest.request;
      }
      this.queryRequest.request.cancel();
      this.queryRequest = null;
    }
    if (this.queryResult) {
      this.queryResult.disposables.dispose();
      this.queryResult = void 0;
      if (this.extensionsViewState) {
        this.extensionsViewState.filters = {};
      }
    }
    const parsedQuery = Query.parse(query);
    const options = {
      sortOrder: SortOrder.Default
    };
    switch (parsedQuery.sortBy) {
      case "installs":
        options.sortBy = GallerySortBy.InstallCount;
        break;
      case "rating":
        options.sortBy = GallerySortBy.WeightedRating;
        break;
      case "name":
        options.sortBy = GallerySortBy.Title;
        break;
      case "publishedDate":
        options.sortBy = GallerySortBy.PublishedDate;
        break;
      case "updateDate":
        options.sortBy = "UpdateDate" /* UpdateDate */;
        break;
    }
    const request = createCancelablePromise(async (token) => {
      try {
        this.queryResult = await this.query(parsedQuery, options, token);
        const model = this.queryResult.model;
        this.setModel(model, this.queryResult.description ? { text: this.queryResult.description, severity: Severity.Info } : void 0);
        if (this.queryResult.onDidChangeModel) {
          this.queryResult.disposables.add(this.queryResult.onDidChangeModel((model2) => {
            if (this.queryResult) {
              this.queryResult.model = model2;
              this.updateModel(model2);
            }
          }));
        }
        return model;
      } catch (e) {
        const model = new PagedModel([]);
        if (!isCancellationError(e)) {
          this.logService.error(e);
          this.setModel(model, this.getMessage(e));
        }
        return this.list ? this.list.model : model;
      }
    });
    request.finally(() => this.queryRequest = null);
    this.queryRequest = { query, request };
    return request;
  }
  count() {
    return this.queryResult?.model.length ?? 0;
  }
  showEmptyModel() {
    const emptyModel = new PagedModel([]);
    this.setModel(emptyModel);
    return Promise.resolve(emptyModel);
  }
  async onContextMenu(e) {
    if (e.element) {
      const disposables = new DisposableStore();
      const manageExtensionAction = disposables.add(this.instantiationService.createInstance(ManageExtensionAction));
      const extension = e.element ? this.extensionsWorkbenchService.local.find((local) => areSameExtensions(local.identifier, e.element.identifier) && (!e.element.server || e.element.server === local.server)) || e.element : e.element;
      manageExtensionAction.extension = extension;
      let groups = [];
      if (manageExtensionAction.enabled) {
        groups = await manageExtensionAction.getActionGroups();
      } else if (extension) {
        groups = await getContextMenuActions(extension, this.contextKeyService, this.instantiationService);
        groups.forEach((group) => group.forEach((extensionAction) => {
          if (extensionAction instanceof ExtensionAction) {
            extensionAction.extension = extension;
          }
        }));
      }
      const actions = [];
      for (const menuActions of groups) {
        for (const menuAction of menuActions) {
          actions.push(menuAction);
          if (isDisposable(menuAction)) {
            disposables.add(menuAction);
          }
        }
        actions.push(new Separator());
      }
      actions.pop();
      this.contextMenuService.showContextMenu({
        getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
        actionRunner: this.contextMenuActionRunner,
        onHide: /* @__PURE__ */ __name(() => disposables.dispose(), "onHide")
      });
    }
  }
  async query(query, options, token) {
    const idRegex = /@id:(([a-z0-9A-Z][a-z0-9\-A-Z]*)\.([a-z0-9A-Z][a-z0-9\-A-Z]*))/g;
    const ids = [];
    let idMatch;
    while ((idMatch = idRegex.exec(query.value)) !== null) {
      const name = idMatch[1];
      ids.push(name);
    }
    if (ids.length) {
      const model2 = await this.queryByIds(ids, options, token);
      return { model: model2, disposables: new DisposableStore() };
    }
    if (ExtensionsListView.isLocalExtensionsQuery(query.value, query.sortBy)) {
      return this.queryLocal(query, options);
    }
    if (ExtensionsListView.isSearchPopularQuery(query.value)) {
      query.value = query.value.replace("@popular", "");
      options.sortBy = !options.sortBy ? GallerySortBy.InstallCount : options.sortBy;
    } else if (ExtensionsListView.isSearchRecentlyPublishedQuery(query.value)) {
      query.value = query.value.replace("@recentlyPublished", "");
      options.sortBy = !options.sortBy ? GallerySortBy.PublishedDate : options.sortBy;
    }
    const galleryQueryOptions = { ...options, sortBy: isLocalSortBy(options.sortBy) ? void 0 : options.sortBy };
    const model = await this.queryGallery(query, galleryQueryOptions, token);
    return { model, disposables: new DisposableStore() };
  }
  async queryByIds(ids, options, token) {
    const idsSet = ids.reduce((result2, id) => {
      result2.add(id.toLowerCase());
      return result2;
    }, /* @__PURE__ */ new Set());
    const result = (await this.extensionsWorkbenchService.queryLocal(this.options.server)).filter((e) => idsSet.has(e.identifier.id.toLowerCase()));
    const galleryIds = result.length ? ids.filter((id) => result.every((r) => !areSameExtensions(r.identifier, { id }))) : ids;
    if (galleryIds.length) {
      const galleryResult = await this.extensionsWorkbenchService.getExtensions(galleryIds.map((id) => ({ id })), { source: "queryById" }, token);
      result.push(...galleryResult);
    }
    return new PagedModel(result);
  }
  async queryLocal(query, options) {
    const local = await this.extensionsWorkbenchService.queryLocal(this.options.server);
    let { extensions, canIncludeInstalledExtensions, description } = await this.filterLocal(local, this.extensionService.extensions, query, options);
    const disposables = new DisposableStore();
    const onDidChangeModel = disposables.add(new Emitter());
    if (canIncludeInstalledExtensions) {
      let isDisposed = false;
      disposables.add(toDisposable(() => isDisposed = true));
      disposables.add(Event.debounce(Event.any(
        Event.filter(this.extensionsWorkbenchService.onChange, (e) => e?.state === ExtensionState.Installed),
        this.extensionService.onDidChangeExtensions
      ), () => void 0)(async () => {
        const local2 = this.options.server ? this.extensionsWorkbenchService.installed.filter((e) => e.server === this.options.server) : this.extensionsWorkbenchService.local;
        const { extensions: newExtensions } = await this.filterLocal(local2, this.extensionService.extensions, query, options);
        if (!isDisposed) {
          const mergedExtensions = this.mergeAddedExtensions(extensions, newExtensions);
          if (mergedExtensions) {
            extensions = mergedExtensions;
            onDidChangeModel.fire(new PagedModel(extensions));
          }
        }
      }));
    }
    return {
      model: new PagedModel(extensions),
      description,
      onDidChangeModel: onDidChangeModel.event,
      disposables
    };
  }
  async filterLocal(local, runningExtensions, query, options) {
    const value = query.value;
    let extensions = [];
    let canIncludeInstalledExtensions = true;
    let description;
    if (/@builtin/i.test(value)) {
      extensions = this.filterBuiltinExtensions(local, query, options);
      canIncludeInstalledExtensions = false;
    } else if (/@installed/i.test(value)) {
      extensions = this.filterInstalledExtensions(local, runningExtensions, query, options);
    } else if (/@outdated/i.test(value)) {
      extensions = this.filterOutdatedExtensions(local, query, options);
    } else if (/@disabled/i.test(value)) {
      extensions = this.filterDisabledExtensions(local, runningExtensions, query, options);
    } else if (/@enabled/i.test(value)) {
      extensions = this.filterEnabledExtensions(local, runningExtensions, query, options);
    } else if (/@workspaceUnsupported/i.test(value)) {
      extensions = this.filterWorkspaceUnsupportedExtensions(local, query, options);
    } else if (/@deprecated/i.test(query.value)) {
      extensions = await this.filterDeprecatedExtensions(local, query, options);
    } else if (/@recentlyUpdated/i.test(query.value)) {
      extensions = this.filterRecentlyUpdatedExtensions(local, query, options);
    } else if (/@feature:/i.test(query.value)) {
      const result = this.filterExtensionsByFeature(local, query);
      if (result) {
        extensions = result.extensions;
        description = result.description;
      }
    }
    return { extensions, canIncludeInstalledExtensions, description };
  }
  filterBuiltinExtensions(local, query, options) {
    let { value, includedCategories, excludedCategories } = this.parseCategories(query.value);
    value = value.replace(/@builtin/g, "").replace(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    const result = local.filter((e) => e.isBuiltin && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1) && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
    return this.sortExtensions(result, options);
  }
  filterExtensionByCategory(e, includedCategories, excludedCategories) {
    if (!includedCategories.length && !excludedCategories.length) {
      return true;
    }
    if (e.categories.length) {
      if (excludedCategories.length && e.categories.some((category) => excludedCategories.includes(category.toLowerCase()))) {
        return false;
      }
      return e.categories.some((category) => includedCategories.includes(category.toLowerCase()));
    } else {
      return includedCategories.includes(NONE_CATEGORY);
    }
  }
  parseCategories(value) {
    const includedCategories = [];
    const excludedCategories = [];
    value = value.replace(/\bcategory:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedCategory, category) => {
      const entry = (category || quotedCategory || "").toLowerCase();
      if (entry.startsWith("-")) {
        if (excludedCategories.indexOf(entry) === -1) {
          excludedCategories.push(entry);
        }
      } else {
        if (includedCategories.indexOf(entry) === -1) {
          includedCategories.push(entry);
        }
      }
      return "";
    });
    return { value, includedCategories, excludedCategories };
  }
  filterInstalledExtensions(local, runningExtensions, query, options) {
    let { value, includedCategories, excludedCategories } = this.parseCategories(query.value);
    value = value.replace(/@installed/g, "").replace(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    const matchingText = /* @__PURE__ */ __name((e) => (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1 || e.description.toLowerCase().indexOf(value) > -1) && this.filterExtensionByCategory(e, includedCategories, excludedCategories), "matchingText");
    let result;
    if (options.sortBy !== void 0) {
      result = local.filter((e) => !e.isBuiltin && matchingText(e));
      result = this.sortExtensions(result, options);
    } else {
      result = local.filter((e) => (!e.isBuiltin || e.outdated || e.runtimeState !== void 0) && matchingText(e));
      const runningExtensionsById = runningExtensions.reduce((result2, e) => {
        result2.set(e.identifier.value, e);
        return result2;
      }, new ExtensionIdentifierMap());
      const defaultSort = /* @__PURE__ */ __name((e1, e2) => {
        const running1 = runningExtensionsById.get(e1.identifier.id);
        const isE1Running = !!running1 && this.extensionManagementServerService.getExtensionManagementServer(toExtension(running1)) === e1.server;
        const running2 = runningExtensionsById.get(e2.identifier.id);
        const isE2Running = running2 && this.extensionManagementServerService.getExtensionManagementServer(toExtension(running2)) === e2.server;
        if (isE1Running && isE2Running) {
          return e1.displayName.localeCompare(e2.displayName);
        }
        const isE1LanguagePackExtension = e1.local && isLanguagePackExtension(e1.local.manifest);
        const isE2LanguagePackExtension = e2.local && isLanguagePackExtension(e2.local.manifest);
        if (!isE1Running && !isE2Running) {
          if (isE1LanguagePackExtension) {
            return -1;
          }
          if (isE2LanguagePackExtension) {
            return 1;
          }
          return e1.displayName.localeCompare(e2.displayName);
        }
        if (isE1Running && isE2LanguagePackExtension || isE2Running && isE1LanguagePackExtension) {
          return e1.displayName.localeCompare(e2.displayName);
        }
        return isE1Running ? -1 : 1;
      }, "defaultSort");
      const incompatible = [];
      const deprecated = [];
      const outdated = [];
      const actionRequired = [];
      const noActionRequired = [];
      for (const e of result) {
        if (e.enablementState === EnablementState.DisabledByInvalidExtension) {
          incompatible.push(e);
        } else if (e.deprecationInfo) {
          deprecated.push(e);
        } else if (e.outdated && this.extensionEnablementService.isEnabledEnablementState(e.enablementState)) {
          outdated.push(e);
        } else if (e.runtimeState) {
          actionRequired.push(e);
        } else {
          noActionRequired.push(e);
        }
      }
      result = [
        ...incompatible.sort(defaultSort),
        ...deprecated.sort(defaultSort),
        ...outdated.sort(defaultSort),
        ...actionRequired.sort(defaultSort),
        ...noActionRequired.sort(defaultSort)
      ];
    }
    return result;
  }
  filterOutdatedExtensions(local, query, options) {
    let { value, includedCategories, excludedCategories } = this.parseCategories(query.value);
    value = value.replace(/@outdated/g, "").replace(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    const result = local.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName)).filter((extension) => extension.outdated && (extension.name.toLowerCase().indexOf(value) > -1 || extension.displayName.toLowerCase().indexOf(value) > -1) && this.filterExtensionByCategory(extension, includedCategories, excludedCategories));
    return this.sortExtensions(result, options);
  }
  filterDisabledExtensions(local, runningExtensions, query, options) {
    let { value, includedCategories, excludedCategories } = this.parseCategories(query.value);
    value = value.replace(/@disabled/g, "").replace(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    const result = local.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName)).filter((e) => runningExtensions.every((r) => !areSameExtensions({ id: r.identifier.value, uuid: r.uuid }, e.identifier)) && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1) && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
    return this.sortExtensions(result, options);
  }
  filterEnabledExtensions(local, runningExtensions, query, options) {
    let { value, includedCategories, excludedCategories } = this.parseCategories(query.value);
    value = value ? value.replace(/@enabled/g, "").replace(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase() : "";
    local = local.filter((e) => !e.isBuiltin);
    const result = local.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName)).filter((e) => runningExtensions.some((r) => areSameExtensions({ id: r.identifier.value, uuid: r.uuid }, e.identifier)) && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1) && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
    return this.sortExtensions(result, options);
  }
  filterWorkspaceUnsupportedExtensions(local, query, options) {
    const queryString = query.value;
    const match = queryString.match(/^\s*@workspaceUnsupported(?::(untrusted|virtual)(Partial)?)?(?:\s+([^\s]*))?/i);
    if (!match) {
      return [];
    }
    const type = match[1]?.toLowerCase();
    const partial = !!match[2];
    const nameFilter = match[3]?.toLowerCase();
    if (nameFilter) {
      local = local.filter((extension) => extension.name.toLowerCase().indexOf(nameFilter) > -1 || extension.displayName.toLowerCase().indexOf(nameFilter) > -1);
    }
    const hasVirtualSupportType = /* @__PURE__ */ __name((extension, supportType) => {
      return extension.local && this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.local.manifest) === supportType;
    }, "hasVirtualSupportType");
    const hasRestrictedSupportType = /* @__PURE__ */ __name((extension, supportType) => {
      if (!extension.local) {
        return false;
      }
      const enablementState = this.extensionEnablementService.getEnablementState(extension.local);
      if (enablementState !== EnablementState.EnabledGlobally && enablementState !== EnablementState.EnabledWorkspace && enablementState !== EnablementState.DisabledByTrustRequirement && enablementState !== EnablementState.DisabledByExtensionDependency) {
        return false;
      }
      if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.local.manifest) === supportType) {
        return true;
      }
      if (supportType === false) {
        const dependencies = getExtensionDependencies(local.map((ext) => ext.local), extension.local);
        return dependencies.some((ext) => this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(ext.manifest) === supportType);
      }
      return false;
    }, "hasRestrictedSupportType");
    const inVirtualWorkspace = isVirtualWorkspace(this.workspaceService.getWorkspace());
    const inRestrictedWorkspace = !this.workspaceTrustManagementService.isWorkspaceTrusted();
    if (type === "virtual") {
      local = local.filter((extension) => inVirtualWorkspace && hasVirtualSupportType(extension, partial ? "limited" : false) && !(inRestrictedWorkspace && hasRestrictedSupportType(extension, false)));
    } else if (type === "untrusted") {
      local = local.filter((extension) => hasRestrictedSupportType(extension, partial ? "limited" : false) && !(inVirtualWorkspace && hasVirtualSupportType(extension, false)));
    } else {
      local = local.filter((extension) => inVirtualWorkspace && !hasVirtualSupportType(extension, true) || inRestrictedWorkspace && !hasRestrictedSupportType(extension, true));
    }
    return this.sortExtensions(local, options);
  }
  async filterDeprecatedExtensions(local, query, options) {
    const value = query.value.replace(/@deprecated/g, "").replace(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
    const deprecatedExtensionIds = Object.keys(extensionsControlManifest.deprecated);
    local = local.filter((e) => deprecatedExtensionIds.includes(e.identifier.id) && (!value || e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1));
    return this.sortExtensions(local, options);
  }
  filterRecentlyUpdatedExtensions(local, query, options) {
    let { value, includedCategories, excludedCategories } = this.parseCategories(query.value);
    const currentTime = Date.now();
    local = local.filter((e) => !e.isBuiltin && !e.outdated && e.local?.updated && e.local?.installedTimestamp !== void 0 && currentTime - e.local.installedTimestamp < ExtensionsListView.RECENT_UPDATE_DURATION);
    value = value.replace(/@recentlyUpdated/g, "").replace(/@sort:(\w+)(-\w*)?/g, "").trim().toLowerCase();
    const result = local.filter((e) => (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1) && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
    options.sortBy = options.sortBy ?? "UpdateDate" /* UpdateDate */;
    return this.sortExtensions(result, options);
  }
  filterExtensionsByFeature(local, query) {
    const value = query.value.replace(/@feature:/g, "").trim();
    const featureId = value.split(" ")[0];
    const feature = Registry.as(Extensions.ExtensionFeaturesRegistry).getExtensionFeature(featureId);
    if (!feature) {
      return void 0;
    }
    if (this.extensionsViewState) {
      this.extensionsViewState.filters.featureId = featureId;
    }
    const renderer = feature.renderer ? this.instantiationService.createInstance(feature.renderer) : void 0;
    try {
      const result = [];
      for (const e of local) {
        if (!e.local) {
          continue;
        }
        const accessData = this.extensionFeaturesManagementService.getAccessData(new ExtensionIdentifier(e.identifier.id), featureId);
        const shouldRender = renderer?.shouldRender(e.local.manifest);
        if (accessData || shouldRender) {
          result.push([e, accessData?.accessTimes.length ?? 0]);
        }
      }
      return {
        extensions: result.sort(([, a], [, b]) => b - a).map(([e]) => e),
        description: localize("showingExtensionsForFeature", "Extensions using {0} in the last 30 days", feature.label)
      };
    } finally {
      renderer?.dispose();
    }
  }
  mergeAddedExtensions(extensions, newExtensions) {
    const oldExtensions = [...extensions];
    const findPreviousExtensionIndex = /* @__PURE__ */ __name((from) => {
      let index = -1;
      const previousExtensionInNew = newExtensions[from];
      if (previousExtensionInNew) {
        index = oldExtensions.findIndex((e) => areSameExtensions(e.identifier, previousExtensionInNew.identifier));
        if (index === -1) {
          return findPreviousExtensionIndex(from - 1);
        }
      }
      return index;
    }, "findPreviousExtensionIndex");
    let hasChanged = false;
    for (let index = 0; index < newExtensions.length; index++) {
      const extension = newExtensions[index];
      if (extensions.every((r) => !areSameExtensions(r.identifier, extension.identifier))) {
        hasChanged = true;
        extensions.splice(findPreviousExtensionIndex(index - 1) + 1, 0, extension);
      }
    }
    return hasChanged ? extensions : void 0;
  }
  async queryGallery(query, options, token) {
    const hasUserDefinedSortOrder = options.sortBy !== void 0;
    if (!hasUserDefinedSortOrder && !query.value.trim()) {
      options.sortBy = GallerySortBy.InstallCount;
    }
    if (this.isRecommendationsQuery(query)) {
      return this.queryRecommendations(query, options, token);
    }
    const text = query.value;
    if (!text) {
      options.source = "viewlet";
      const pager2 = await this.extensionsWorkbenchService.queryGallery(options, token);
      return new PagedModel(pager2);
    }
    if (/\bext:([^\s]+)\b/g.test(text)) {
      options.text = text;
      options.source = "file-extension-tags";
      const pager2 = await this.extensionsWorkbenchService.queryGallery(options, token);
      return new PagedModel(pager2);
    }
    options.text = text.substring(0, 350);
    options.source = "searchText";
    if (hasUserDefinedSortOrder || /\b(category|tag):([^\s]+)\b/gi.test(text) || /\bfeatured(\s+|\b|$)/gi.test(text)) {
      const pager2 = await this.extensionsWorkbenchService.queryGallery(options, token);
      return new PagedModel(pager2);
    }
    const [pager, preferredExtensions] = await Promise.all([
      this.extensionsWorkbenchService.queryGallery(options, token),
      this.getPreferredExtensions(options.text.toLowerCase(), token).catch(() => [])
    ]);
    return preferredExtensions.length ? new PreferredExtensionsPagedModel(preferredExtensions, pager) : new PagedModel(pager);
  }
  async getPreferredExtensions(searchText, token) {
    const preferredExtensions = this.extensionsWorkbenchService.local.filter((e) => !e.isBuiltin && (e.name.toLowerCase().indexOf(searchText) > -1 || e.displayName.toLowerCase().indexOf(searchText) > -1 || e.description.toLowerCase().indexOf(searchText) > -1));
    const preferredExtensionUUIDs = /* @__PURE__ */ new Set();
    if (preferredExtensions.length) {
      const extesionsToFetch = [];
      for (const extension of preferredExtensions) {
        if (extension.identifier.uuid) {
          preferredExtensionUUIDs.add(extension.identifier.uuid);
        }
        if (!extension.gallery && extension.identifier.uuid) {
          extesionsToFetch.push(extension.identifier);
        }
      }
      if (extesionsToFetch.length) {
        this.extensionsWorkbenchService.getExtensions(extesionsToFetch, CancellationToken.None).catch(
          (e) => null
          /*ignore error*/
        );
      }
    }
    const preferredResults = [];
    try {
      const manifest = await this.extensionManagementService.getExtensionsControlManifest();
      if (Array.isArray(manifest.search)) {
        for (const s of manifest.search) {
          if (s.query && s.query.toLowerCase() === searchText && Array.isArray(s.preferredResults)) {
            preferredResults.push(...s.preferredResults);
            break;
          }
        }
      }
      if (preferredResults.length) {
        const result = await this.extensionsWorkbenchService.getExtensions(preferredResults.map((id) => ({ id })), token);
        for (const extension of result) {
          if (extension.identifier.uuid && !preferredExtensionUUIDs.has(extension.identifier.uuid)) {
            preferredExtensions.push(extension);
          }
        }
      }
    } catch (e) {
      this.logService.warn("Failed to get preferred results from the extensions control manifest.", e);
    }
    return preferredExtensions;
  }
  sortExtensions(extensions, options) {
    switch (options.sortBy) {
      case GallerySortBy.InstallCount:
        extensions = extensions.sort((e1, e2) => typeof e2.installCount === "number" && typeof e1.installCount === "number" ? e2.installCount - e1.installCount : NaN);
        break;
      case "UpdateDate" /* UpdateDate */:
        extensions = extensions.sort((e1, e2) => typeof e2.local?.installedTimestamp === "number" && typeof e1.local?.installedTimestamp === "number" ? e2.local.installedTimestamp - e1.local.installedTimestamp : typeof e2.local?.installedTimestamp === "number" ? 1 : typeof e1.local?.installedTimestamp === "number" ? -1 : NaN);
        break;
      case GallerySortBy.AverageRating:
      case GallerySortBy.WeightedRating:
        extensions = extensions.sort((e1, e2) => typeof e2.rating === "number" && typeof e1.rating === "number" ? e2.rating - e1.rating : NaN);
        break;
      default:
        extensions = extensions.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName));
        break;
    }
    if (options.sortOrder === SortOrder.Descending) {
      extensions = extensions.reverse();
    }
    return extensions;
  }
  isRecommendationsQuery(query) {
    return ExtensionsListView.isWorkspaceRecommendedExtensionsQuery(query.value) || ExtensionsListView.isKeymapsRecommendedExtensionsQuery(query.value) || ExtensionsListView.isLanguageRecommendedExtensionsQuery(query.value) || ExtensionsListView.isExeRecommendedExtensionsQuery(query.value) || ExtensionsListView.isRemoteRecommendedExtensionsQuery(query.value) || /@recommended:all/i.test(query.value) || ExtensionsListView.isSearchRecommendedExtensionsQuery(query.value) || ExtensionsListView.isRecommendedExtensionsQuery(query.value);
  }
  async queryRecommendations(query, options, token) {
    if (ExtensionsListView.isWorkspaceRecommendedExtensionsQuery(query.value)) {
      return this.getWorkspaceRecommendationsModel(query, options, token);
    }
    if (ExtensionsListView.isKeymapsRecommendedExtensionsQuery(query.value)) {
      return this.getKeymapRecommendationsModel(query, options, token);
    }
    if (ExtensionsListView.isLanguageRecommendedExtensionsQuery(query.value)) {
      return this.getLanguageRecommendationsModel(query, options, token);
    }
    if (ExtensionsListView.isExeRecommendedExtensionsQuery(query.value)) {
      return this.getExeRecommendationsModel(query, options, token);
    }
    if (ExtensionsListView.isRemoteRecommendedExtensionsQuery(query.value)) {
      return this.getRemoteRecommendationsModel(query, options, token);
    }
    if (/@recommended:all/i.test(query.value)) {
      return this.getAllRecommendationsModel(options, token);
    }
    if (ExtensionsListView.isSearchRecommendedExtensionsQuery(query.value) || ExtensionsListView.isRecommendedExtensionsQuery(query.value) && options.sortBy !== void 0) {
      return this.searchRecommendations(query, options, token);
    }
    if (ExtensionsListView.isRecommendedExtensionsQuery(query.value)) {
      return this.getOtherRecommendationsModel(query, options, token);
    }
    return new PagedModel([]);
  }
  async getInstallableRecommendations(recommendations, options, token) {
    const result = [];
    if (recommendations.length) {
      const galleryExtensions = [];
      const resourceExtensions = [];
      for (const recommendation of recommendations) {
        if (typeof recommendation === "string") {
          galleryExtensions.push(recommendation);
        } else {
          resourceExtensions.push(recommendation);
        }
      }
      if (galleryExtensions.length) {
        try {
          const extensions = await this.extensionsWorkbenchService.getExtensions(galleryExtensions.map((id) => ({ id })), { source: options.source }, token);
          for (const extension of extensions) {
            if (extension.gallery && !extension.deprecationInfo && await this.extensionManagementService.canInstall(extension.gallery) === true) {
              result.push(extension);
            }
          }
        } catch (error) {
          if (!resourceExtensions.length || !this.isOfflineError(error)) {
            throw error;
          }
        }
      }
      if (resourceExtensions.length) {
        const extensions = await this.extensionsWorkbenchService.getResourceExtensions(resourceExtensions, true);
        for (const extension of extensions) {
          if (await this.extensionsWorkbenchService.canInstall(extension) === true) {
            result.push(extension);
          }
        }
      }
    }
    return result;
  }
  async getWorkspaceRecommendations() {
    const recommendations = await this.extensionRecommendationsService.getWorkspaceRecommendations();
    const { important } = await this.extensionRecommendationsService.getConfigBasedRecommendations();
    for (const configBasedRecommendation of important) {
      if (!recommendations.find((extensionId) => extensionId === configBasedRecommendation)) {
        recommendations.push(configBasedRecommendation);
      }
    }
    return recommendations;
  }
  async getWorkspaceRecommendationsModel(query, options, token) {
    const recommendations = await this.getWorkspaceRecommendations();
    const installableRecommendations = await this.getInstallableRecommendations(recommendations, { ...options, source: "recommendations-workspace" }, token);
    return new PagedModel(installableRecommendations);
  }
  async getKeymapRecommendationsModel(query, options, token) {
    const value = query.value.replace(/@recommended:keymaps/g, "").trim().toLowerCase();
    const recommendations = this.extensionRecommendationsService.getKeymapRecommendations();
    const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: "recommendations-keymaps" }, token)).filter((extension) => extension.identifier.id.toLowerCase().indexOf(value) > -1);
    return new PagedModel(installableRecommendations);
  }
  async getLanguageRecommendationsModel(query, options, token) {
    const value = query.value.replace(/@recommended:languages/g, "").trim().toLowerCase();
    const recommendations = this.extensionRecommendationsService.getLanguageRecommendations();
    const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: "recommendations-languages" }, token)).filter((extension) => extension.identifier.id.toLowerCase().indexOf(value) > -1);
    return new PagedModel(installableRecommendations);
  }
  async getRemoteRecommendationsModel(query, options, token) {
    const value = query.value.replace(/@recommended:remotes/g, "").trim().toLowerCase();
    const recommendations = this.extensionRecommendationsService.getRemoteRecommendations();
    const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: "recommendations-remotes" }, token)).filter((extension) => extension.identifier.id.toLowerCase().indexOf(value) > -1);
    return new PagedModel(installableRecommendations);
  }
  async getExeRecommendationsModel(query, options, token) {
    const exe = query.value.replace(/@exe:/g, "").trim().toLowerCase();
    const { important, others } = await this.extensionRecommendationsService.getExeBasedRecommendations(exe.startsWith('"') ? exe.substring(1, exe.length - 1) : exe);
    const installableRecommendations = await this.getInstallableRecommendations([...important, ...others], { ...options, source: "recommendations-exe" }, token);
    return new PagedModel(installableRecommendations);
  }
  async getOtherRecommendationsModel(query, options, token) {
    const otherRecommendations = await this.getOtherRecommendations();
    const installableRecommendations = await this.getInstallableRecommendations(otherRecommendations, { ...options, source: "recommendations-other", sortBy: void 0 }, token);
    const result = coalesce(otherRecommendations.map((id) => installableRecommendations.find((i) => areSameExtensions(i.identifier, { id }))));
    return new PagedModel(result);
  }
  async getOtherRecommendations() {
    const local = (await this.extensionsWorkbenchService.queryLocal(this.options.server)).map((e) => e.identifier.id.toLowerCase());
    const workspaceRecommendations = (await this.getWorkspaceRecommendations()).map((extensionId) => isString(extensionId) ? extensionId.toLowerCase() : extensionId);
    return distinct(
      (await Promise.all([
        // Order is important
        this.extensionRecommendationsService.getImportantRecommendations(),
        this.extensionRecommendationsService.getFileBasedRecommendations(),
        this.extensionRecommendationsService.getOtherRecommendations()
      ])).flat().filter(
        (extensionId) => !local.includes(extensionId.toLowerCase()) && !workspaceRecommendations.includes(extensionId.toLowerCase())
      ),
      (extensionId) => extensionId.toLowerCase()
    );
  }
  // Get All types of recommendations, trimmed to show a max of 8 at any given time
  async getAllRecommendationsModel(options, token) {
    const localExtensions = await this.extensionsWorkbenchService.queryLocal(this.options.server);
    const localExtensionIds = localExtensions.map((e) => e.identifier.id.toLowerCase());
    const allRecommendations = distinct(
      (await Promise.all([
        // Order is important
        this.getWorkspaceRecommendations(),
        this.extensionRecommendationsService.getImportantRecommendations(),
        this.extensionRecommendationsService.getFileBasedRecommendations(),
        this.extensionRecommendationsService.getOtherRecommendations()
      ])).flat().filter((extensionId) => {
        if (isString(extensionId)) {
          return !localExtensionIds.includes(extensionId.toLowerCase());
        }
        return !localExtensions.some((localExtension) => localExtension.local && this.uriIdentityService.extUri.isEqual(localExtension.local.location, extensionId));
      })
    );
    const installableRecommendations = await this.getInstallableRecommendations(allRecommendations, { ...options, source: "recommendations-all", sortBy: void 0 }, token);
    const result = [];
    for (let i = 0; i < installableRecommendations.length && result.length < 8; i++) {
      const recommendation = allRecommendations[i];
      if (isString(recommendation)) {
        const extension = installableRecommendations.find((extension2) => areSameExtensions(extension2.identifier, { id: recommendation }));
        if (extension) {
          result.push(extension);
        }
      } else {
        const extension = installableRecommendations.find((extension2) => extension2.resourceExtension && this.uriIdentityService.extUri.isEqual(extension2.resourceExtension.location, recommendation));
        if (extension) {
          result.push(extension);
        }
      }
    }
    return new PagedModel(result);
  }
  async searchRecommendations(query, options, token) {
    const value = query.value.replace(/@recommended/g, "").trim().toLowerCase();
    const recommendations = distinct([...await this.getWorkspaceRecommendations(), ...await this.getOtherRecommendations()]);
    const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: "recommendations", sortBy: void 0 }, token)).filter((extension) => extension.identifier.id.toLowerCase().indexOf(value) > -1);
    return new PagedModel(this.sortExtensions(installableRecommendations, options));
  }
  setModel(model, message, donotResetScrollTop) {
    if (this.list) {
      this.list.model = new DelayedPagedModel(model);
      this.updateBody(message);
      if (!donotResetScrollTop) {
        this.list.scrollTop = 0;
      }
    }
    if (this.badge) {
      this.badge.setCount(this.count());
    }
  }
  updateModel(model) {
    if (this.list) {
      this.list.model = new DelayedPagedModel(model);
      this.updateBody();
    }
    if (this.badge) {
      this.badge.setCount(this.count());
    }
  }
  updateBody(message) {
    if (this.bodyTemplate) {
      const count = this.count();
      this.bodyTemplate.extensionsList.classList.toggle("hidden", count === 0);
      this.bodyTemplate.messageContainer.classList.toggle("hidden", !message && count > 0);
      if (this.isBodyVisible()) {
        if (message) {
          this.bodyTemplate.messageSeverityIcon.className = SeverityIcon.className(message.severity);
          this.bodyTemplate.messageBox.textContent = message.text;
        } else if (this.count() === 0) {
          this.bodyTemplate.messageSeverityIcon.className = "";
          this.bodyTemplate.messageBox.textContent = localize("no extensions found", "No extensions found.");
        }
        if (this.bodyTemplate.messageBox.textContent) {
          alert(this.bodyTemplate.messageBox.textContent);
        }
      }
    }
    this.updateSize();
  }
  getMessage(error) {
    if (this.isOfflineError(error)) {
      return { text: localize("offline error", "Unable to search the Marketplace when offline, please check your network connection."), severity: Severity.Warning };
    } else {
      return { text: localize("error", "Error while fetching extensions. {0}", getErrorMessage(error)), severity: Severity.Error };
    }
  }
  isOfflineError(error) {
    if (error instanceof ExtensionGalleryError) {
      return error.code === ExtensionGalleryErrorCode.Offline;
    }
    return isOfflineError(error);
  }
  updateSize() {
    if (this.options.flexibleHeight) {
      this.maximumBodySize = this.list?.model.length ? Number.POSITIVE_INFINITY : 0;
      this.storageService.store(`${this.id}.size`, this.list?.model.length || 0, StorageScope.PROFILE, StorageTarget.MACHINE);
    }
  }
  openExtension(extension, options) {
    extension = this.extensionsWorkbenchService.local.filter((e) => areSameExtensions(e.identifier, extension.identifier))[0] || extension;
    this.extensionsWorkbenchService.open(extension, options).then(void 0, (err) => this.onError(err));
  }
  onError(err) {
    if (isCancellationError(err)) {
      return;
    }
    const message = err && err.message || "";
    if (/ECONNREFUSED/.test(message)) {
      const error = createErrorWithActions(localize("suggestProxyError", "Marketplace returned 'ECONNREFUSED'. Please check the 'http.proxy' setting."), [
        new Action("open user settings", localize("open user settings", "Open User Settings"), void 0, true, () => this.preferencesService.openUserSettings())
      ]);
      this.notificationService.error(error);
      return;
    }
    this.notificationService.error(err);
  }
  dispose() {
    super.dispose();
    if (this.queryRequest) {
      this.queryRequest.request.cancel();
      this.queryRequest = null;
    }
    if (this.queryResult) {
      this.queryResult.disposables.dispose();
      this.queryResult = void 0;
    }
    this.list = null;
  }
  static isLocalExtensionsQuery(query, sortBy) {
    return this.isInstalledExtensionsQuery(query) || this.isSearchInstalledExtensionsQuery(query) || this.isOutdatedExtensionsQuery(query) || this.isEnabledExtensionsQuery(query) || this.isDisabledExtensionsQuery(query) || this.isBuiltInExtensionsQuery(query) || this.isSearchBuiltInExtensionsQuery(query) || this.isBuiltInGroupExtensionsQuery(query) || this.isSearchDeprecatedExtensionsQuery(query) || this.isSearchWorkspaceUnsupportedExtensionsQuery(query) || this.isSearchRecentlyUpdatedQuery(query) || this.isSearchExtensionUpdatesQuery(query) || this.isSortInstalledExtensionsQuery(query, sortBy) || this.isFeatureExtensionsQuery(query);
  }
  static isSearchBuiltInExtensionsQuery(query) {
    return /@builtin\s.+/i.test(query);
  }
  static isBuiltInExtensionsQuery(query) {
    return /^\s*@builtin$/i.test(query.trim());
  }
  static isBuiltInGroupExtensionsQuery(query) {
    return /^\s*@builtin:.+$/i.test(query.trim());
  }
  static isSearchWorkspaceUnsupportedExtensionsQuery(query) {
    return /^\s*@workspaceUnsupported(:(untrusted|virtual)(Partial)?)?(\s|$)/i.test(query);
  }
  static isInstalledExtensionsQuery(query) {
    return /@installed$/i.test(query);
  }
  static isSearchInstalledExtensionsQuery(query) {
    return /@installed\s./i.test(query) || this.isFeatureExtensionsQuery(query);
  }
  static isOutdatedExtensionsQuery(query) {
    return /@outdated/i.test(query);
  }
  static isEnabledExtensionsQuery(query) {
    return /@enabled/i.test(query);
  }
  static isDisabledExtensionsQuery(query) {
    return /@disabled/i.test(query);
  }
  static isSearchDeprecatedExtensionsQuery(query) {
    return /@deprecated\s?.*/i.test(query);
  }
  static isRecommendedExtensionsQuery(query) {
    return /^@recommended$/i.test(query.trim());
  }
  static isSearchRecommendedExtensionsQuery(query) {
    return /@recommended\s.+/i.test(query);
  }
  static isWorkspaceRecommendedExtensionsQuery(query) {
    return /@recommended:workspace/i.test(query);
  }
  static isExeRecommendedExtensionsQuery(query) {
    return /@exe:.+/i.test(query);
  }
  static isRemoteRecommendedExtensionsQuery(query) {
    return /@recommended:remotes/i.test(query);
  }
  static isKeymapsRecommendedExtensionsQuery(query) {
    return /@recommended:keymaps/i.test(query);
  }
  static isLanguageRecommendedExtensionsQuery(query) {
    return /@recommended:languages/i.test(query);
  }
  static isSortInstalledExtensionsQuery(query, sortBy) {
    return sortBy !== void 0 && sortBy !== "" && query === "" || !sortBy && /^@sort:\S*$/i.test(query);
  }
  static isSearchPopularQuery(query) {
    return /@popular/i.test(query);
  }
  static isSearchRecentlyPublishedQuery(query) {
    return /@recentlyPublished/i.test(query);
  }
  static isSearchRecentlyUpdatedQuery(query) {
    return /@recentlyUpdated/i.test(query);
  }
  static isSearchExtensionUpdatesQuery(query) {
    return /@updates/i.test(query);
  }
  static isSortUpdateDateQuery(query) {
    return /@sort:updateDate/i.test(query);
  }
  static isFeatureExtensionsQuery(query) {
    return /@feature:/i.test(query);
  }
  focus() {
    super.focus();
    if (!this.list) {
      return;
    }
    if (!(this.list.getFocus().length || this.list.getSelection().length)) {
      this.list.focusNext();
    }
    this.list.domFocus();
  }
};
ExtensionsListView = __decorateClass([
  __decorateParam(2, INotificationService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IExtensionsWorkbenchService),
  __decorateParam(9, IExtensionRecommendationsService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, IWorkspaceContextService),
  __decorateParam(14, IExtensionManagementServerService),
  __decorateParam(15, IExtensionManifestPropertiesService),
  __decorateParam(16, IWorkbenchExtensionManagementService),
  __decorateParam(17, IWorkspaceContextService),
  __decorateParam(18, IProductService),
  __decorateParam(19, IContextKeyService),
  __decorateParam(20, IViewDescriptorService),
  __decorateParam(21, IOpenerService),
  __decorateParam(22, IPreferencesService),
  __decorateParam(23, IStorageService),
  __decorateParam(24, IWorkspaceTrustManagementService),
  __decorateParam(25, IWorkbenchExtensionEnablementService),
  __decorateParam(26, IWorkbenchLayoutService),
  __decorateParam(27, IExtensionFeaturesManagementService),
  __decorateParam(28, IUriIdentityService),
  __decorateParam(29, ILogService)
], ExtensionsListView);
class DefaultPopularExtensionsView extends ExtensionsListView {
  static {
    __name(this, "DefaultPopularExtensionsView");
  }
  async show() {
    const query = this.extensionManagementServerService.webExtensionManagementServer && !this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer ? "@web" : "";
    return super.show(query);
  }
}
class ServerInstalledExtensionsView extends ExtensionsListView {
  static {
    __name(this, "ServerInstalledExtensionsView");
  }
  async show(query) {
    query = query ? query : "@installed";
    if (!ExtensionsListView.isLocalExtensionsQuery(query) || ExtensionsListView.isSortInstalledExtensionsQuery(query)) {
      query = query += " @installed";
    }
    return super.show(query.trim());
  }
}
class EnabledExtensionsView extends ExtensionsListView {
  static {
    __name(this, "EnabledExtensionsView");
  }
  async show(query) {
    query = query || "@enabled";
    return ExtensionsListView.isEnabledExtensionsQuery(query) ? super.show(query) : ExtensionsListView.isSortInstalledExtensionsQuery(query) ? super.show("@enabled " + query) : this.showEmptyModel();
  }
}
class DisabledExtensionsView extends ExtensionsListView {
  static {
    __name(this, "DisabledExtensionsView");
  }
  async show(query) {
    query = query || "@disabled";
    return ExtensionsListView.isDisabledExtensionsQuery(query) ? super.show(query) : ExtensionsListView.isSortInstalledExtensionsQuery(query) ? super.show("@disabled " + query) : this.showEmptyModel();
  }
}
class OutdatedExtensionsView extends ExtensionsListView {
  static {
    __name(this, "OutdatedExtensionsView");
  }
  async show(query) {
    query = query ? query : "@outdated";
    if (ExtensionsListView.isSearchExtensionUpdatesQuery(query)) {
      query = query.replace("@updates", "@outdated");
    }
    return super.show(query.trim());
  }
  updateSize() {
    super.updateSize();
    this.setExpanded(this.count() > 0);
  }
}
class RecentlyUpdatedExtensionsView extends ExtensionsListView {
  static {
    __name(this, "RecentlyUpdatedExtensionsView");
  }
  async show(query) {
    query = query ? query : "@recentlyUpdated";
    if (ExtensionsListView.isSearchExtensionUpdatesQuery(query)) {
      query = query.replace("@updates", "@recentlyUpdated");
    }
    return super.show(query.trim());
  }
}
let StaticQueryExtensionsView = class extends ExtensionsListView {
  constructor(options, viewletViewOptions, notificationService, keybindingService, contextMenuService, instantiationService, themeService, extensionService, extensionsWorkbenchService, extensionRecommendationsService, telemetryService, hoverService, configurationService, contextService, extensionManagementServerService, extensionManifestPropertiesService, extensionManagementService, workspaceService, productService, contextKeyService, viewDescriptorService, openerService, preferencesService, storageService, workspaceTrustManagementService, extensionEnablementService, layoutService, extensionFeaturesManagementService, uriIdentityService, logService) {
    super(
      options,
      viewletViewOptions,
      notificationService,
      keybindingService,
      contextMenuService,
      instantiationService,
      themeService,
      extensionService,
      extensionsWorkbenchService,
      extensionRecommendationsService,
      telemetryService,
      hoverService,
      configurationService,
      contextService,
      extensionManagementServerService,
      extensionManifestPropertiesService,
      extensionManagementService,
      workspaceService,
      productService,
      contextKeyService,
      viewDescriptorService,
      openerService,
      preferencesService,
      storageService,
      workspaceTrustManagementService,
      extensionEnablementService,
      layoutService,
      extensionFeaturesManagementService,
      uriIdentityService,
      logService
    );
    this.options = options;
  }
  static {
    __name(this, "StaticQueryExtensionsView");
  }
  show() {
    return super.show(this.options.query);
  }
};
StaticQueryExtensionsView = __decorateClass([
  __decorateParam(2, INotificationService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IExtensionsWorkbenchService),
  __decorateParam(9, IExtensionRecommendationsService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, IWorkspaceContextService),
  __decorateParam(14, IExtensionManagementServerService),
  __decorateParam(15, IExtensionManifestPropertiesService),
  __decorateParam(16, IWorkbenchExtensionManagementService),
  __decorateParam(17, IWorkspaceContextService),
  __decorateParam(18, IProductService),
  __decorateParam(19, IContextKeyService),
  __decorateParam(20, IViewDescriptorService),
  __decorateParam(21, IOpenerService),
  __decorateParam(22, IPreferencesService),
  __decorateParam(23, IStorageService),
  __decorateParam(24, IWorkspaceTrustManagementService),
  __decorateParam(25, IWorkbenchExtensionEnablementService),
  __decorateParam(26, IWorkbenchLayoutService),
  __decorateParam(27, IExtensionFeaturesManagementService),
  __decorateParam(28, IUriIdentityService),
  __decorateParam(29, ILogService)
], StaticQueryExtensionsView);
function toSpecificWorkspaceUnsupportedQuery(query, qualifier) {
  if (!query) {
    return "@workspaceUnsupported:" + qualifier;
  }
  const match = query.match(new RegExp(`@workspaceUnsupported(:${qualifier})?(\\s|$)`, "i"));
  if (match) {
    if (!match[1]) {
      return query.replace(/@workspaceUnsupported/gi, "@workspaceUnsupported:" + qualifier);
    }
    return query;
  }
  return void 0;
}
__name(toSpecificWorkspaceUnsupportedQuery, "toSpecificWorkspaceUnsupportedQuery");
class UntrustedWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
  static {
    __name(this, "UntrustedWorkspaceUnsupportedExtensionsView");
  }
  async show(query) {
    const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, "untrusted");
    return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
  }
}
class UntrustedWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
  static {
    __name(this, "UntrustedWorkspacePartiallySupportedExtensionsView");
  }
  async show(query) {
    const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, "untrustedPartial");
    return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
  }
}
class VirtualWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
  static {
    __name(this, "VirtualWorkspaceUnsupportedExtensionsView");
  }
  async show(query) {
    const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, "virtual");
    return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
  }
}
class VirtualWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
  static {
    __name(this, "VirtualWorkspacePartiallySupportedExtensionsView");
  }
  async show(query) {
    const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, "virtualPartial");
    return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
  }
}
class DeprecatedExtensionsView extends ExtensionsListView {
  static {
    __name(this, "DeprecatedExtensionsView");
  }
  async show(query) {
    return ExtensionsListView.isSearchDeprecatedExtensionsQuery(query) ? super.show(query) : this.showEmptyModel();
  }
}
class SearchMarketplaceExtensionsView extends ExtensionsListView {
  static {
    __name(this, "SearchMarketplaceExtensionsView");
  }
  reportSearchFinishedDelayer = this._register(new ThrottledDelayer(2e3));
  searchWaitPromise = Promise.resolve();
  async show(query) {
    const queryPromise = super.show(query);
    this.reportSearchFinishedDelayer.trigger(() => this.reportSearchFinished());
    this.searchWaitPromise = queryPromise.then(null, null);
    return queryPromise;
  }
  async reportSearchFinished() {
    await this.searchWaitPromise;
    this.telemetryService.publicLog2("extensionsView:MarketplaceSearchFinished");
  }
}
class DefaultRecommendedExtensionsView extends ExtensionsListView {
  static {
    __name(this, "DefaultRecommendedExtensionsView");
  }
  recommendedExtensionsQuery = "@recommended:all";
  renderBody(container) {
    super.renderBody(container);
    this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => {
      this.show("");
    }));
  }
  async show(query) {
    if (query && query.trim() !== this.recommendedExtensionsQuery) {
      return this.showEmptyModel();
    }
    const model = await super.show(this.recommendedExtensionsQuery);
    if (!this.extensionsWorkbenchService.local.some((e) => !e.isBuiltin)) {
      this.setExpanded(model.length > 0);
    }
    return model;
  }
}
class RecommendedExtensionsView extends ExtensionsListView {
  static {
    __name(this, "RecommendedExtensionsView");
  }
  recommendedExtensionsQuery = "@recommended";
  renderBody(container) {
    super.renderBody(container);
    this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => {
      this.show("");
    }));
  }
  async show(query) {
    return query && query.trim() !== this.recommendedExtensionsQuery ? this.showEmptyModel() : super.show(this.recommendedExtensionsQuery);
  }
}
class WorkspaceRecommendedExtensionsView extends ExtensionsListView {
  static {
    __name(this, "WorkspaceRecommendedExtensionsView");
  }
  recommendedExtensionsQuery = "@recommended:workspace";
  renderBody(container) {
    super.renderBody(container);
    this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.show(this.recommendedExtensionsQuery)));
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.show(this.recommendedExtensionsQuery)));
  }
  async show(query) {
    const shouldShowEmptyView = query && query.trim() !== "@recommended" && query.trim() !== "@recommended:workspace";
    const model = await (shouldShowEmptyView ? this.showEmptyModel() : super.show(this.recommendedExtensionsQuery));
    this.setExpanded(model.length > 0);
    return model;
  }
  async getInstallableWorkspaceRecommendations() {
    const installed = (await this.extensionsWorkbenchService.queryLocal()).filter((l) => l.enablementState !== EnablementState.DisabledByExtensionKind);
    const recommendations = (await this.getWorkspaceRecommendations()).filter((recommendation) => installed.every((local) => isString(recommendation) ? !areSameExtensions({ id: recommendation }, local.identifier) : !this.uriIdentityService.extUri.isEqual(recommendation, local.local?.location)));
    return this.getInstallableRecommendations(recommendations, { source: "install-all-workspace-recommendations" }, CancellationToken.None);
  }
  async installWorkspaceRecommendations() {
    const installableRecommendations = await this.getInstallableWorkspaceRecommendations();
    if (installableRecommendations.length) {
      const galleryExtensions = [];
      const resourceExtensions = [];
      for (const recommendation of installableRecommendations) {
        if (recommendation.gallery) {
          galleryExtensions.push({ extension: recommendation.gallery, options: {} });
        } else {
          resourceExtensions.push(recommendation);
        }
      }
      await Promise.all([
        this.extensionManagementService.installGalleryExtensions(galleryExtensions),
        ...resourceExtensions.map((extension) => this.extensionsWorkbenchService.install(extension))
      ]);
    } else {
      this.notificationService.notify({
        severity: Severity.Info,
        message: localize("no local extensions", "There are no extensions to install.")
      });
    }
  }
}
function getAriaLabelForExtension(extension) {
  if (!extension) {
    return "";
  }
  const publisher = extension.publisherDomain?.verified ? localize("extension.arialabel.verifiedPublisher", "Verified Publisher {0}", extension.publisherDisplayName) : localize("extension.arialabel.publisher", "Publisher {0}", extension.publisherDisplayName);
  const deprecated = extension?.deprecationInfo ? localize("extension.arialabel.deprecated", "Deprecated") : "";
  const rating = extension?.rating ? localize("extension.arialabel.rating", "Rated {0} out of 5 stars by {1} users", extension.rating.toFixed(2), extension.ratingCount) : "";
  return `${extension.displayName}, ${deprecated ? `${deprecated}, ` : ""}${extension.version}, ${publisher}, ${extension.description} ${rating ? `, ${rating}` : ""}`;
}
__name(getAriaLabelForExtension, "getAriaLabelForExtension");
class PreferredExtensionsPagedModel {
  constructor(preferredExtensions, pager) {
    this.preferredExtensions = preferredExtensions;
    this.pager = pager;
    for (let i = 0; i < this.preferredExtensions.length; i++) {
      this.resolved.set(i, this.preferredExtensions[i]);
    }
    for (const e of preferredExtensions) {
      if (e.identifier.uuid) {
        this.preferredGalleryExtensions.add(e.identifier.uuid);
      }
    }
    this.length = preferredExtensions.length - this.preferredGalleryExtensions.size + this.pager.total;
    const totalPages = Math.ceil(this.pager.total / this.pager.pageSize);
    this.populateResolvedExtensions(0, this.pager.firstPage);
    this.pages = range(totalPages - 1).map(() => ({
      promise: null,
      cts: null,
      promiseIndexes: /* @__PURE__ */ new Set()
    }));
  }
  static {
    __name(this, "PreferredExtensionsPagedModel");
  }
  resolved = /* @__PURE__ */ new Map();
  preferredGalleryExtensions = /* @__PURE__ */ new Set();
  resolvedGalleryExtensionsFromQuery = [];
  pages;
  length;
  isResolved(index) {
    return this.resolved.has(index);
  }
  get(index) {
    return this.resolved.get(index);
  }
  async resolve(index, cancellationToken) {
    if (cancellationToken.isCancellationRequested) {
      throw new CancellationError();
    }
    if (this.isResolved(index)) {
      return this.get(index);
    }
    const indexInPagedModel = index - this.preferredExtensions.length + this.resolvedGalleryExtensionsFromQuery.length;
    const pageIndex = Math.floor(indexInPagedModel / this.pager.pageSize);
    const page = this.pages[pageIndex];
    if (!page.promise) {
      page.cts = new CancellationTokenSource();
      page.promise = this.pager.getPage(pageIndex, page.cts.token).then((extensions) => this.populateResolvedExtensions(pageIndex, extensions)).catch((e) => {
        page.promise = null;
        throw e;
      }).finally(() => page.cts = null);
    }
    const listener = cancellationToken.onCancellationRequested(() => {
      if (!page.cts) {
        return;
      }
      page.promiseIndexes.delete(index);
      if (page.promiseIndexes.size === 0) {
        page.cts.cancel();
      }
    });
    page.promiseIndexes.add(index);
    try {
      await page.promise;
    } finally {
      listener.dispose();
    }
    return this.get(index);
  }
  populateResolvedExtensions(pageIndex, extensions) {
    let adjustIndexOfNextPagesBy = 0;
    const pageStartIndex = pageIndex * this.pager.pageSize;
    for (let i = 0; i < extensions.length; i++) {
      const e = extensions[i];
      if (e.gallery?.identifier.uuid && this.preferredGalleryExtensions.has(e.gallery.identifier.uuid)) {
        this.resolvedGalleryExtensionsFromQuery.push(e);
        adjustIndexOfNextPagesBy++;
      } else {
        this.resolved.set(this.preferredExtensions.length - this.resolvedGalleryExtensionsFromQuery.length + pageStartIndex + i, e);
      }
    }
    if (pageIndex !== 0 && adjustIndexOfNextPagesBy) {
      const nextPageStartIndex = (pageIndex + 1) * this.pager.pageSize;
      const indices = [...this.resolved.keys()].sort();
      for (const index of indices) {
        if (index >= nextPageStartIndex) {
          const e = this.resolved.get(index);
          if (e) {
            this.resolved.delete(index);
            this.resolved.set(index - adjustIndexOfNextPagesBy, e);
          }
        }
      }
    }
  }
}
export {
  DefaultPopularExtensionsView,
  DefaultRecommendedExtensionsView,
  DeprecatedExtensionsView,
  DisabledExtensionsView,
  EnabledExtensionsView,
  ExtensionsListView,
  NONE_CATEGORY,
  OutdatedExtensionsView,
  PreferredExtensionsPagedModel,
  RecentlyUpdatedExtensionsView,
  RecommendedExtensionsView,
  SearchMarketplaceExtensionsView,
  ServerInstalledExtensionsView,
  StaticQueryExtensionsView,
  UntrustedWorkspacePartiallySupportedExtensionsView,
  UntrustedWorkspaceUnsupportedExtensionsView,
  VirtualWorkspacePartiallySupportedExtensionsView,
  VirtualWorkspaceUnsupportedExtensionsView,
  WorkspaceRecommendedExtensionsView,
  getAriaLabelForExtension
};
//# sourceMappingURL=extensionsViews.js.map
