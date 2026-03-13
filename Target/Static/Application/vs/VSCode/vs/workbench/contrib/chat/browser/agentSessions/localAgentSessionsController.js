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
import { coalesce } from "../../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../../base/common/map.js";
import { Schemas } from "../../../../../base/common/network.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { convertLegacyChatSessionTiming, IChatService } from "../../common/chatService/chatService.js";
import { IChatSessionsService, localChatSessionType } from "../../common/chatSessionsService.js";
import { getChatSessionType } from "../../common/model/chatUri.js";
let LocalAgentsSessionsController = class LocalAgentsSessionsController2 extends Disposable {
  static {
    __name(this, "LocalAgentsSessionsController");
  }
  static {
    this.ID = "workbench.contrib.localAgentsSessionsController";
  }
  constructor(chatService, chatSessionsService, logService) {
    super();
    this.chatService = chatService;
    this.chatSessionsService = chatSessionsService;
    this.logService = logService;
    this.chatSessionType = localChatSessionType;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onDidChangeChatSessionItems = this._register(new Emitter());
    this.onDidChangeChatSessionItems = this._onDidChangeChatSessionItems.event;
    this._items = [];
    this._register(this.chatSessionsService.registerChatSessionItemController(this.chatSessionType, this));
    this.registerListeners();
  }
  get items() {
    return this._items;
  }
  async refresh(token) {
    this._items = await this.provideChatSessionItems(token);
  }
  registerListeners() {
    this._register(this.chatService.registerChatModelChangeListeners(Schemas.vscodeLocalChatSession, async (sessionResource) => {
      if (getChatSessionType(sessionResource) !== this.chatSessionType) {
        return;
      }
      await this.refresh(CancellationToken.None);
      const item = this.getItem(sessionResource);
      if (item) {
        this._onDidChangeChatSessionItems.fire({ addedOrUpdated: [item] });
      }
    }));
    this._register(this.chatService.onDidDisposeSession((e) => {
      const removedSessionResources = e.sessionResource.filter((resource) => getChatSessionType(resource) === this.chatSessionType);
      if (removedSessionResources.length) {
        this._onDidChangeChatSessionItems.fire({ removed: removedSessionResources });
      }
    }));
  }
  getItem(sessionResource) {
    return this._items.find((item) => isEqual(item.resource, sessionResource));
  }
  async provideChatSessionItems(token) {
    const sessions = [];
    const sessionsByResource = new ResourceSet();
    for (const sessionDetail of await this.chatService.getLiveSessionItems()) {
      const editorSession = this.toChatSessionItem(sessionDetail);
      if (!editorSession) {
        continue;
      }
      sessionsByResource.add(sessionDetail.sessionResource);
      sessions.push(editorSession);
    }
    if (!token.isCancellationRequested) {
      const history = await this.getHistoryItems();
      sessions.push(...history.filter((historyItem) => !sessionsByResource.has(historyItem.resource)));
    }
    return sessions;
  }
  async getHistoryItems() {
    try {
      const historyItems = await this.chatService.getHistorySessionItems();
      return coalesce(historyItems.map((history) => this.toChatSessionItem(history)));
    } catch (error) {
      return [];
    }
  }
  toChatSessionItem(chat) {
    const model = this.chatService.getSession(chat.sessionResource);
    let description;
    if (model) {
      if (!model.hasRequests) {
        return void 0;
      }
      description = this.chatSessionsService.getInProgressSessionDescription(model);
    }
    return {
      resource: chat.sessionResource,
      label: chat.title,
      description,
      status: model ? this.modelToStatus(model) : this.chatResponseStateToStatus(chat.lastResponseState),
      iconPath: Codicon.chatSparkle,
      timing: convertLegacyChatSessionTiming(chat.timing),
      changes: chat.stats ? {
        insertions: chat.stats.added,
        deletions: chat.stats.removed,
        files: chat.stats.fileCount
      } : void 0
    };
  }
  modelToStatus(model) {
    if (model.requestInProgress.get()) {
      this.logService.trace(`[agent sessions] Session ${model.sessionResource.toString()} request is in progress.`);
      return 2;
    }
    const lastRequest = model.getRequests().at(-1);
    this.logService.trace(`[agent sessions] Session ${model.sessionResource.toString()} last request response: state ${lastRequest?.response?.state}, isComplete ${lastRequest?.response?.isComplete}, isCanceled ${lastRequest?.response?.isCanceled}, error: ${lastRequest?.response?.result?.errorDetails?.message}.`);
    if (lastRequest?.response) {
      if (lastRequest.response.state === 4) {
        return 3;
      } else if (lastRequest.response.isCanceled || lastRequest.response.result?.errorDetails?.code === "canceled") {
        return 1;
      } else if (lastRequest.response.result?.errorDetails) {
        return 0;
      } else if (lastRequest.response.isComplete) {
        return 1;
      } else {
        return 2;
      }
    }
    return void 0;
  }
  chatResponseStateToStatus(state) {
    switch (state) {
      case 2:
      case 1:
        return 1;
      case 3:
        return 0;
      case 0:
        return 2;
      case 4:
        return 3;
    }
  }
};
LocalAgentsSessionsController = __decorate([
  __param(0, IChatService),
  __param(1, IChatSessionsService),
  __param(2, ILogService)
], LocalAgentsSessionsController);
export {
  LocalAgentsSessionsController
};
//# sourceMappingURL=localAgentSessionsController.js.map
