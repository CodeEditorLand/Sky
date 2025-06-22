var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise, disposableTimeout, RunOnceScheduler } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Event } from "../../../../base/common/event.js";
import { DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, derived } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { localize } from "../../../../nls.js";
import { ByteSize, IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { DefaultQuickAccessFilterValue } from "../../../../platform/quickinput/common/quickAccess.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IChatWidgetService } from "../../chat/browser/chat.js";
import { IChatAttachmentResolveService } from "../../chat/browser/chatAttachmentResolveService.js";
import { IMcpService, isMcpResourceTemplate, McpResourceURI } from "../common/mcpTypes.js";
import { openPanelChatAndGetWidget } from "./openPanelChatAndGetWidget.js";
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
let McpResourcePickHelper = class McpResourcePickHelper2 {
  static {
    __name(this, "McpResourcePickHelper");
  }
  static sep(server) {
    return {
      id: server.definition.id,
      type: "separator",
      label: server.definition.label
    };
  }
  static item(resource) {
    if (isMcpResourceTemplate(resource)) {
      return {
        id: resource.template.template,
        label: resource.name,
        description: resource.description,
        detail: localize("mcp.resource.template", "Resource template: {0}", resource.template.template)
      };
    }
    return {
      id: resource.uri.toString(),
      label: resource.name,
      description: resource.description,
      detail: resource.mcpUri + (resource.sizeInBytes !== void 0 ? " (" + ByteSize.formatSize(resource.sizeInBytes) + ")" : "")
    };
  }
  constructor(_mcpService, _fileService, _quickInputService, _notificationService, _chatAttachmentResolveService) {
    this._mcpService = _mcpService;
    this._fileService = _fileService;
    this._quickInputService = _quickInputService;
    this._notificationService = _notificationService;
    this._chatAttachmentResolveService = _chatAttachmentResolveService;
    this.hasServersWithResources = derived((reader) => {
      let enabled = false;
      for (const server of this._mcpService.servers.read(reader)) {
        const cap = server.capabilities.get();
        if (cap === void 0) {
          enabled = true;
        } else if (cap & 16) {
          enabled = true;
          break;
        }
      }
      return enabled;
    });
  }
  async toAttachment(resource) {
    if (isMcpResourceTemplate(resource)) {
      return this._resourceTemplateToAttachment(resource);
    } else {
      return this._resourceToAttachment(resource);
    }
  }
  async toURI(resource) {
    if (isMcpResourceTemplate(resource)) {
      const maybeUri = await this._resourceTemplateToURI(resource);
      return maybeUri && await this._verifyUriIfNeeded(maybeUri);
    } else {
      return resource.uri;
    }
  }
  async _resourceToAttachment(resource) {
    const asImage = await this._chatAttachmentResolveService.resolveImageEditorAttachContext(resource.uri, void 0, resource.mimeType);
    if (asImage) {
      return asImage;
    }
    return {
      id: resource.uri.toString(),
      kind: "file",
      name: resource.name,
      value: resource.uri
    };
  }
  async _resourceTemplateToAttachment(rt) {
    const maybeUri = await this._resourceTemplateToURI(rt);
    const uri = maybeUri && await this._verifyUriIfNeeded(maybeUri);
    return uri && this._resourceToAttachment({
      uri,
      name: rt.name,
      mimeType: rt.mimeType
    });
  }
  async _verifyUriIfNeeded({ uri, needsVerification }) {
    if (!needsVerification) {
      return uri;
    }
    const exists = await this._fileService.exists(uri);
    if (exists) {
      return uri;
    }
    this._notificationService.warn(localize("mcp.resource.template.notFound", "The resource {0} was not found.", McpResourceURI.toServer(uri).resourceURI.toString()));
    return void 0;
  }
  async _resourceTemplateToURI(rt) {
    const todo = rt.template.components.flatMap((c) => typeof c === "object" ? c.variables : []);
    const quickInput = this._quickInputService.createQuickPick();
    const cts = new CancellationTokenSource();
    const vars = {};
    quickInput.totalSteps = todo.length;
    quickInput.ignoreFocusOut = true;
    let needsVerification = false;
    try {
      for (let i = 0; i < todo.length; i++) {
        const variable = todo[i];
        const resolved = await this._promptForTemplateValue(quickInput, variable, vars, rt);
        if (resolved === void 0) {
          return void 0;
        }
        needsVerification ||= !resolved.completed;
        vars[todo[i].name] = variable.repeatable ? resolved.value.split("/") : resolved.value;
      }
      return { uri: rt.resolveURI(vars), needsVerification };
    } finally {
      cts.dispose(true);
      quickInput.dispose();
    }
  }
  _promptForTemplateValue(input, variable, variablesSoFar, rt) {
    const store = new DisposableStore();
    const completions = /* @__PURE__ */ new Map([]);
    const variablesWithPlaceholders = { ...variablesSoFar };
    for (const variable2 of rt.template.components.flatMap((c) => typeof c === "object" ? c.variables : [])) {
      if (!variablesWithPlaceholders.hasOwnProperty(variable2.name)) {
        variablesWithPlaceholders[variable2.name] = `$${variable2.name.toUpperCase()}`;
      }
    }
    let placeholder = localize("mcp.resource.template.placeholder", "Value for ${0} in {1}", variable.name.toUpperCase(), rt.template.resolve(variablesWithPlaceholders).replaceAll("%24", "$"));
    if (variable.optional) {
      placeholder += " (" + localize("mcp.resource.template.optional", "Optional") + ")";
    }
    input.placeholder = placeholder;
    input.value = "";
    input.items = [];
    input.show();
    const currentID = generateUuid();
    const setItems = /* @__PURE__ */ __name((value, completed = []) => {
      const items = completed.filter((c) => c !== value).map((c) => ({ id: c, label: c }));
      if (value) {
        items.unshift({ id: currentID, label: value });
      } else if (variable.optional) {
        items.unshift({ id: currentID, label: localize("mcp.resource.template.empty", "<Empty>") });
      }
      input.items = items;
    }, "setItems");
    let changeCancellation = store.add(new CancellationTokenSource());
    const getCompletionItems = /* @__PURE__ */ __name(() => {
      const inputValue = input.value;
      let promise = completions.get(inputValue);
      if (!promise) {
        promise = rt.complete(variable.name, inputValue, variablesSoFar, changeCancellation.token);
        completions.set(inputValue, promise);
      }
      promise.then((values) => {
        if (!changeCancellation.token.isCancellationRequested) {
          setItems(inputValue, values);
        }
      }).catch(() => {
        completions.delete(inputValue);
      }).finally(() => {
        if (!changeCancellation.token.isCancellationRequested) {
          input.busy = false;
        }
      });
    }, "getCompletionItems");
    const getCompletionItemsScheduler = store.add(new RunOnceScheduler(getCompletionItems, 300));
    return new Promise((resolve) => {
      store.add(input.onDidHide(() => resolve(void 0)));
      store.add(input.onDidAccept(() => {
        const item = input.selectedItems[0];
        if (item.id === currentID) {
          resolve({ value: input.value, completed: false });
        } else if (variable.explodable && item.label.endsWith("/") && item.label !== input.value) {
          input.value = item.label;
        } else {
          resolve({ value: item.label, completed: true });
        }
      }));
      store.add(input.onDidChangeValue((value) => {
        input.busy = true;
        changeCancellation.dispose(true);
        store.delete(changeCancellation);
        changeCancellation = store.add(new CancellationTokenSource());
        getCompletionItemsScheduler.cancel();
        setItems(value);
        if (completions.has(input.value)) {
          getCompletionItems();
        } else {
          getCompletionItemsScheduler.schedule();
        }
      }));
      getCompletionItems();
    }).finally(() => store.dispose());
  }
  getPicks(onChange, token) {
    const cts = new CancellationTokenSource(token);
    const store = new DisposableStore();
    store.add(toDisposable(() => cts.dispose(true)));
    let showInSequence = true;
    store.add(disposableTimeout(() => {
      showInSequence = false;
      publish();
    }, 5e3));
    const publish = /* @__PURE__ */ __name(() => {
      const output = /* @__PURE__ */ new Map();
      for (const [server, rec] of servers) {
        const r = [];
        output.set(server, r);
        if (rec.templates.isResolved) {
          r.push(...rec.templates.value);
        } else if (showInSequence) {
          break;
        }
        r.push(...rec.resourcesSoFar);
        if (!rec.resources.isSettled && showInSequence) {
          break;
        }
      }
      onChange(output);
    }, "publish");
    const servers = /* @__PURE__ */ new Map();
    return Promise.all((this.explicitServers || this._mcpService.servers.get()).map(async (server) => {
      let cap = server.capabilities.get();
      const rec = {
        templates: new DeferredPromise(),
        resourcesSoFar: [],
        resources: new DeferredPromise()
      };
      servers.set(server, rec);
      if (cap === void 0) {
        cap = await new Promise((resolve) => {
          server.start().then((state) => {
            if (state.state === 3 || state.state === 0) {
              resolve(void 0);
            }
          });
          store.add(cts.token.onCancellationRequested(() => resolve(void 0)));
          store.add(autorun((reader) => {
            const cap2 = server.capabilities.read(reader);
            if (cap2 !== void 0) {
              resolve(cap2);
            }
          }));
        });
      }
      if (cap && cap & 16) {
        await Promise.all([
          rec.templates.settleWith(server.resourceTemplates(cts.token).catch(() => [])).finally(publish),
          rec.resources.settleWith((async () => {
            for await (const page of server.resources(cts.token)) {
              rec.resourcesSoFar = rec.resourcesSoFar.concat(page);
              publish();
            }
          })())
        ]);
      } else {
        rec.templates.complete([]);
        rec.resources.complete([]);
      }
      publish();
    })).finally(() => {
      store.dispose();
    });
  }
};
McpResourcePickHelper = __decorate([
  __param(0, IMcpService),
  __param(1, IFileService),
  __param(2, IQuickInputService),
  __param(3, INotificationService),
  __param(4, IChatAttachmentResolveService)
], McpResourcePickHelper);
let AbstractMcpResourceAccessPick = class AbstractMcpResourceAccessPick2 {
  static {
    __name(this, "AbstractMcpResourceAccessPick");
  }
  constructor(_scopeTo, _instantiationService, _editorService, _chatWidgetService, _viewsService) {
    this._scopeTo = _scopeTo;
    this._instantiationService = _instantiationService;
    this._editorService = _editorService;
    this._chatWidgetService = _chatWidgetService;
    this._viewsService = _viewsService;
  }
  applyToPick(picker, token, runOptions) {
    picker.canAcceptInBackground = true;
    picker.busy = true;
    picker.keepScrollPosition = true;
    const attachButton = localize("mcp.quickaccess.attach", "Attach to chat");
    const helper = this._instantiationService.createInstance(McpResourcePickHelper);
    if (this._scopeTo) {
      helper.explicitServers = [this._scopeTo];
    }
    helper.getPicks((servers) => {
      const items = [];
      for (const [server, resources] of servers) {
        items.push(McpResourcePickHelper.sep(server));
        for (const resource of resources) {
          const pickItem = McpResourcePickHelper.item(resource);
          pickItem.buttons = [{ iconClass: ThemeIcon.asClassName(Codicon.attach), tooltip: attachButton }];
          items.push({ ...pickItem, resource });
        }
      }
      picker.items = items;
    }, token).finally(() => {
      picker.busy = false;
    });
    const store = new DisposableStore();
    store.add(picker.onDidTriggerItemButton((event) => {
      if (event.button.tooltip === attachButton) {
        picker.busy = true;
        helper.toAttachment(event.item.resource).then(async (a) => {
          if (a) {
            const widget = await openPanelChatAndGetWidget(this._viewsService, this._chatWidgetService);
            widget?.attachmentModel.addContext(a);
          }
          picker.hide();
        });
      }
    }));
    store.add(picker.onDidAccept(async (event) => {
      if (!event.inBackground) {
        picker.hide();
      }
      if (runOptions?.handleAccept) {
        runOptions.handleAccept?.(picker.activeItems[0], event.inBackground);
      } else {
        const [item] = picker.selectedItems;
        const uri = await helper.toURI(item.resource);
        if (uri) {
          this._editorService.openEditor({ resource: uri, options: { preserveFocus: event.inBackground } });
        }
      }
    }));
    return store;
  }
};
AbstractMcpResourceAccessPick = __decorate([
  __param(1, IInstantiationService),
  __param(2, IEditorService),
  __param(3, IChatWidgetService),
  __param(4, IViewsService)
], AbstractMcpResourceAccessPick);
let McpResourceQuickPick = class McpResourceQuickPick2 extends AbstractMcpResourceAccessPick {
  static {
    __name(this, "McpResourceQuickPick");
  }
  constructor(scopeTo, instantiationService, editorService, chatWidgetService, viewsService, _quickInputService) {
    super(scopeTo, instantiationService, editorService, chatWidgetService, viewsService);
    this._quickInputService = _quickInputService;
  }
  async pick(token = CancellationToken.None) {
    const store = new DisposableStore();
    const qp = store.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    qp.placeholder = localize("mcp.quickaccess.placeholder", "Search for resources");
    store.add(this.applyToPick(qp, token));
    store.add(qp.onDidHide(() => store.dispose()));
    qp.show();
    await Event.toPromise(qp.onDidHide);
  }
};
McpResourceQuickPick = __decorate([
  __param(1, IInstantiationService),
  __param(2, IEditorService),
  __param(3, IChatWidgetService),
  __param(4, IViewsService),
  __param(5, IQuickInputService)
], McpResourceQuickPick);
let McpResourceQuickAccess = class McpResourceQuickAccess2 extends AbstractMcpResourceAccessPick {
  static {
    __name(this, "McpResourceQuickAccess");
  }
  static {
    this.PREFIX = "mcpr ";
  }
  constructor(instantiationService, editorService, chatWidgetService, viewsService) {
    super(void 0, instantiationService, editorService, chatWidgetService, viewsService);
    this.defaultFilterValue = DefaultQuickAccessFilterValue.LAST;
  }
  provide(picker, token, runOptions) {
    return this.applyToPick(picker, token, runOptions);
  }
};
McpResourceQuickAccess = __decorate([
  __param(0, IInstantiationService),
  __param(1, IEditorService),
  __param(2, IChatWidgetService),
  __param(3, IViewsService)
], McpResourceQuickAccess);
export {
  AbstractMcpResourceAccessPick,
  McpResourcePickHelper,
  McpResourceQuickAccess,
  McpResourceQuickPick
};
//# sourceMappingURL=mcpResourceQuickAccess.js.map
