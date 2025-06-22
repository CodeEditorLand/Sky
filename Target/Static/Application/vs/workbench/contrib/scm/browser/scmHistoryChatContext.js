var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { coalesce } from "../../../../base/common/arrays.js";
import { ThrottledDelayer } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { fromNow } from "../../../../base/common/date.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { showChatView } from "../../chat/browser/chat.js";
import { IChatContextPickService, picksWithPromiseFn } from "../../chat/browser/chatContextPickService.js";
import { ChatContextKeys } from "../../chat/common/chatContextKeys.js";
import { ScmHistoryItemResolver } from "../../multiDiffEditor/browser/scmMultiDiffSourceResolver.js";
import { ISCMService, ISCMViewService } from "../common/scm.js";
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
var SCMHistoryItemContext_1;
let SCMHistoryItemContextContribution = class SCMHistoryItemContextContribution2 extends Disposable {
  static {
    __name(this, "SCMHistoryItemContextContribution");
  }
  static {
    this.ID = "workbench.contrib.chat.scmHistoryItemContextContribution";
  }
  constructor(contextPickService, instantiationService, textModelResolverService) {
    super();
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(SCMHistoryItemContext)));
    this._store.add(textModelResolverService.registerTextModelContentProvider(ScmHistoryItemResolver.scheme, instantiationService.createInstance(SCMHistoryItemContextContentProvider)));
  }
};
SCMHistoryItemContextContribution = __decorate([
  __param(0, IChatContextPickService),
  __param(1, IInstantiationService),
  __param(2, ITextModelService)
], SCMHistoryItemContextContribution);
let SCMHistoryItemContext = SCMHistoryItemContext_1 = class SCMHistoryItemContext2 {
  static {
    __name(this, "SCMHistoryItemContext");
  }
  static asAttachment(provider, historyItem) {
    const multiDiffSourceUri = ScmHistoryItemResolver.getMultiDiffSourceUri(provider, historyItem);
    const attachmentName = `$(${Codicon.repo.id})\xA0${provider.name}\xA0$(${Codicon.gitCommit.id})\xA0${historyItem.displayId ?? historyItem.id}`;
    return {
      id: historyItem.id,
      name: attachmentName,
      value: multiDiffSourceUri,
      historyItem: {
        ...historyItem,
        references: []
      },
      kind: "scmHistoryItem"
    };
  }
  constructor(_scmViewService) {
    this._scmViewService = _scmViewService;
    this.type = "pickerPick";
    this.label = localize("chatContext.scmHistoryItems", "Source Control...");
    this.icon = Codicon.gitCommit;
    this._delayer = new ThrottledDelayer(200);
  }
  isEnabled(_widget) {
    const activeRepository = this._scmViewService.activeRepository.get();
    return activeRepository?.provider.historyProvider.get() !== void 0;
  }
  asPicker(_widget) {
    return {
      placeholder: localize("chatContext.scmHistoryItems.placeholder", "Select a change"),
      picks: picksWithPromiseFn((query, token) => {
        const filterText = query.trim() !== "" ? query.trim() : void 0;
        const activeRepository = this._scmViewService.activeRepository.get();
        const historyProvider = activeRepository?.provider.historyProvider.get();
        if (!activeRepository || !historyProvider) {
          return Promise.resolve([]);
        }
        const historyItemRefs = coalesce([
          historyProvider.historyItemRef.get(),
          historyProvider.historyItemRemoteRef.get(),
          historyProvider.historyItemBaseRef.get()
        ]).map((ref) => ref.id);
        return this._delayer.trigger(() => {
          return historyProvider.provideHistoryItems({ historyItemRefs, filterText, limit: 100 }, token).then((historyItems) => {
            if (!historyItems) {
              return [];
            }
            return historyItems.map((historyItem) => {
              const details = [`${historyItem.displayId ?? historyItem.id}`];
              if (historyItem.author) {
                details.push(historyItem.author);
              }
              if (historyItem.statistics) {
                details.push(`${historyItem.statistics.files} ${localize("files", "file(s)")}`);
              }
              if (historyItem.timestamp) {
                details.push(fromNow(historyItem.timestamp, true, true));
              }
              return {
                iconClass: ThemeIcon.asClassName(Codicon.gitCommit),
                label: historyItem.subject,
                detail: details.join(`$(${Codicon.circleSmallFilled.id})`),
                asAttachment: /* @__PURE__ */ __name(() => SCMHistoryItemContext_1.asAttachment(activeRepository.provider, historyItem), "asAttachment")
              };
            });
          });
        });
      })
    };
  }
};
SCMHistoryItemContext = SCMHistoryItemContext_1 = __decorate([
  __param(0, ISCMViewService)
], SCMHistoryItemContext);
let SCMHistoryItemContextContentProvider = class SCMHistoryItemContextContentProvider2 {
  static {
    __name(this, "SCMHistoryItemContextContentProvider");
  }
  constructor(_modelService, _scmService) {
    this._modelService = _modelService;
    this._scmService = _scmService;
  }
  async provideTextContent(resource) {
    const uriFields = ScmHistoryItemResolver.parseUri(resource);
    if (!uriFields) {
      return null;
    }
    const textModel = this._modelService.getModel(resource);
    if (textModel) {
      return textModel;
    }
    const { repositoryId, historyItemId } = uriFields;
    const repository = this._scmService.getRepository(repositoryId);
    const historyProvider = repository?.provider.historyProvider.get();
    if (!repository || !historyProvider) {
      return null;
    }
    const historyItemContext = await historyProvider.resolveHistoryItemChatContext(historyItemId);
    if (!historyItemContext) {
      return null;
    }
    return this._modelService.createModel(historyItemContext, null, resource, false);
  }
};
SCMHistoryItemContextContentProvider = __decorate([
  __param(0, IModelService),
  __param(1, ISCMService)
], SCMHistoryItemContextContentProvider);
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.scm.action.graph.addHistoryItemToChat",
      title: localize("chat.action.scmHistoryItemContext", "Add History Item to Chat"),
      f1: false,
      menu: {
        id: MenuId.SCMHistoryItemChatContext,
        when: ChatContextKeys.Setup.installed
      }
    });
  }
  async run(accessor, provider, historyItem) {
    const viewsService = accessor.get(IViewsService);
    const widget = await showChatView(viewsService);
    if (!provider || !historyItem || !widget) {
      return;
    }
    widget.attachmentModel.addContext(SCMHistoryItemContext.asAttachment(provider, historyItem));
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.scm.action.graph.summarizeHistoryItem",
      title: localize("chat.action.scmHistoryItemSummarize", "Summarize History Item"),
      f1: false,
      menu: {
        id: MenuId.SCMHistoryItemChatContext,
        when: ChatContextKeys.Setup.installed
      }
    });
  }
  async run(accessor, provider, historyItem) {
    const viewsService = accessor.get(IViewsService);
    const widget = await showChatView(viewsService);
    if (!provider || !historyItem || !widget) {
      return;
    }
    widget.attachmentModel.addContext(SCMHistoryItemContext.asAttachment(provider, historyItem));
    await widget.acceptInput("Summarize the attached history item");
  }
});
export {
  SCMHistoryItemContextContribution
};
//# sourceMappingURL=scmHistoryChatContext.js.map
