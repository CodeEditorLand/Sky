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
import { Sequencer } from "../../../../base/common/async.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { revive } from "../../../../base/common/marshalling.js";
import { joinPath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { FileOperationResult, IFileService, toFileOperationResult } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { ChatModel, ISerializableChatData, ISerializableChatDataIn, ISerializableChatsData, normalizeSerializableChatData } from "./chatModel.js";
import { ChatAgentLocation, ChatMode } from "./constants.js";
const maxPersistedSessions = 25;
const ChatIndexStorageKey = "chat.ChatSessionStore.index";
let ChatSessionStore = class extends Disposable {
  constructor(fileService, environmentService, logService, workspaceContextService, telemetryService, storageService, lifecycleService) {
    super();
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.logService = logService;
    this.workspaceContextService = workspaceContextService;
    this.telemetryService = telemetryService;
    this.storageService = storageService;
    this.lifecycleService = lifecycleService;
    const workspace = this.workspaceContextService.getWorkspace();
    const isEmptyWindow = !workspace.configuration && workspace.folders.length === 0;
    const workspaceId = isEmptyWindow ? "no-workspace" : this.workspaceContextService.getWorkspace().id;
    this.storageRoot = joinPath(this.environmentService.workspaceStorageHome, workspaceId, "chatSessions");
    this._register(this.lifecycleService.onWillShutdown((e) => {
      this.shuttingDown = true;
      if (!this.storeTask) {
        return;
      }
      e.join(this.storeTask, {
        id: "join.chatSessionStore",
        label: localize("join.chatSessionStore", "Saving chat history")
      });
    }));
  }
  static {
    __name(this, "ChatSessionStore");
  }
  storageRoot;
  // private readonly transferredSessionStorageRoot: URI;
  storeQueue = new Sequencer();
  storeTask;
  shuttingDown = false;
  async storeSessions(sessions) {
    if (this.shuttingDown) {
      return;
    }
    try {
      this.storeTask = this.storeQueue.queue(async () => {
        try {
          await Promise.all(sessions.map((session) => this.writeSession(session)));
          await this.trimEntries();
          await this.flushIndex();
        } catch (e) {
          this.reportError("storeSessions", "Error storing chat sessions", e);
        }
      });
      await this.storeTask;
    } finally {
      this.storeTask = void 0;
    }
  }
  // async storeTransferSession(transferData: IChatTransfer, session: ISerializableChatData): Promise<void> {
  // 	try {
  // 		const content = JSON.stringify(session, undefined, 2);
  // 		await this.fileService.writeFile(this.transferredSessionStorageRoot, VSBuffer.fromString(content));
  // 	} catch (e) {
  // 		this.reportError('sessionWrite', 'Error writing chat session', e);
  // 		return;
  // 	}
  // 	const index = this.getTransferredSessionIndex();
  // 	index[transferData.toWorkspace.toString()] = transferData;
  // 	try {
  // 		this.storageService.store(ChatTransferIndexStorageKey, index, StorageScope.PROFILE, StorageTarget.MACHINE);
  // 	} catch (e) {
  // 		this.reportError('storeTransferSession', 'Error storing chat transfer session', e);
  // 	}
  // }
  // private getTransferredSessionIndex(): IChatTransferIndex {
  // 	try {
  // 		const data: IChatTransferIndex = this.storageService.getObject(ChatTransferIndexStorageKey, StorageScope.PROFILE, {});
  // 		return data;
  // 	} catch (e) {
  // 		this.reportError('getTransferredSessionIndex', 'Error reading chat transfer index', e);
  // 		return {};
  // 	}
  // }
  async writeSession(session) {
    try {
      const index = this.internalGetIndex();
      const storageLocation = this.getStorageLocation(session.sessionId);
      const content = JSON.stringify(session, void 0, 2);
      await this.fileService.writeFile(storageLocation, VSBuffer.fromString(content));
      index.entries[session.sessionId] = getSessionMetadata(session);
    } catch (e) {
      this.reportError("sessionWrite", "Error writing chat session", e);
    }
  }
  async flushIndex() {
    const index = this.internalGetIndex();
    try {
      this.storageService.store(ChatIndexStorageKey, index, this.getIndexStorageScope(), StorageTarget.MACHINE);
    } catch (e) {
      this.reportError("indexWrite", "Error writing index", e);
    }
  }
  getIndexStorageScope() {
    const workspace = this.workspaceContextService.getWorkspace();
    const isEmptyWindow = !workspace.configuration && workspace.folders.length === 0;
    return isEmptyWindow ? StorageScope.APPLICATION : StorageScope.WORKSPACE;
  }
  async trimEntries() {
    const index = this.internalGetIndex();
    const entries = Object.entries(index.entries).sort((a, b) => b[1].lastMessageDate - a[1].lastMessageDate).map(([id]) => id);
    if (entries.length > maxPersistedSessions) {
      const entriesToDelete = entries.slice(maxPersistedSessions);
      for (const entry of entriesToDelete) {
        delete index.entries[entry];
      }
      this.logService.trace(`ChatSessionStore: Trimmed ${entriesToDelete.length} old chat sessions from index`);
    }
  }
  async internalDeleteSession(sessionId) {
    const index = this.internalGetIndex();
    if (!index.entries[sessionId]) {
      return;
    }
    const storageLocation = this.getStorageLocation(sessionId);
    try {
      await this.fileService.del(storageLocation);
    } catch (e) {
      if (toFileOperationResult(e) !== FileOperationResult.FILE_NOT_FOUND) {
        this.reportError("sessionDelete", "Error deleting chat session", e);
      }
    } finally {
      delete index.entries[sessionId];
    }
  }
  hasSessions() {
    return Object.keys(this.internalGetIndex().entries).length > 0;
  }
  isSessionEmpty(sessionId) {
    const index = this.internalGetIndex();
    return index.entries[sessionId]?.isEmpty ?? true;
  }
  async deleteSession(sessionId) {
    await this.storeQueue.queue(async () => {
      await this.internalDeleteSession(sessionId);
      await this.flushIndex();
    });
  }
  async clearAllSessions() {
    await this.storeQueue.queue(async () => {
      const index = this.internalGetIndex();
      const entries = Object.keys(index.entries);
      this.logService.info(`ChatSessionStore: Clearing ${entries.length} chat sessions`);
      await Promise.all(entries.map((entry) => this.internalDeleteSession(entry)));
      await this.flushIndex();
    });
  }
  async setSessionTitle(sessionId, title) {
    await this.storeQueue.queue(async () => {
      const index = this.internalGetIndex();
      if (index.entries[sessionId]) {
        index.entries[sessionId].title = title;
      }
    });
  }
  reportError(reasonForTelemetry, message, error) {
    this.logService.error(`ChatSessionStore: ` + message, toErrorMessage(error));
    const fileOperationReason = error && toFileOperationResult(error);
    this.telemetryService.publicLog2("chatSessionStoreError", {
      reason: reasonForTelemetry,
      fileOperationReason: fileOperationReason ?? -1
    });
  }
  indexCache;
  internalGetIndex() {
    if (this.indexCache) {
      return this.indexCache;
    }
    const data = this.storageService.get(ChatIndexStorageKey, this.getIndexStorageScope(), void 0);
    if (!data) {
      this.indexCache = { version: 1, entries: {} };
      return this.indexCache;
    }
    try {
      const index = JSON.parse(data);
      if (isChatSessionIndex(index)) {
        this.indexCache = index;
      } else {
        this.reportError("invalidIndexFormat", `Invalid index format: ${data}`);
        this.indexCache = { version: 1, entries: {} };
      }
      return this.indexCache;
    } catch (e) {
      this.reportError("invalidIndexJSON", `Index corrupt: ${data}`, e);
      this.indexCache = { version: 1, entries: {} };
      return this.indexCache;
    }
  }
  async getIndex() {
    return this.storeQueue.queue(async () => {
      return this.internalGetIndex().entries;
    });
  }
  logIndex() {
    const data = this.storageService.get(ChatIndexStorageKey, this.getIndexStorageScope(), void 0);
    this.logService.info("ChatSessionStore index: ", data);
  }
  async migrateDataIfNeeded(getInitialData) {
    await this.storeQueue.queue(async () => {
      const data = this.storageService.get(ChatIndexStorageKey, this.getIndexStorageScope(), void 0);
      const needsMigrationFromStorageService = !data;
      if (needsMigrationFromStorageService) {
        const initialData = getInitialData();
        if (initialData) {
          await this.migrate(initialData);
        }
      }
    });
  }
  async migrate(initialData) {
    const numSessions = Object.keys(initialData).length;
    this.logService.info(`ChatSessionStore: Migrating ${numSessions} chat sessions from storage service to file system`);
    await Promise.all(Object.values(initialData).map(async (session) => {
      await this.writeSession(session);
    }));
    await this.flushIndex();
  }
  async readSession(sessionId) {
    return await this.storeQueue.queue(async () => {
      let rawData;
      const storageLocation = this.getStorageLocation(sessionId);
      try {
        rawData = (await this.fileService.readFile(storageLocation)).value.toString();
      } catch (e) {
        this.reportError("sessionReadFile", `Error reading chat session file ${sessionId}`, e);
        return void 0;
      }
      try {
        const session = revive(JSON.parse(rawData));
        for (const request of session.requests) {
          if (Array.isArray(request.response)) {
            request.response = request.response.map((response) => {
              if (typeof response === "string") {
                return new MarkdownString(response);
              }
              return response;
            });
          } else if (typeof request.response === "string") {
            request.response = [new MarkdownString(request.response)];
          }
        }
        return normalizeSerializableChatData(session);
      } catch (err) {
        this.reportError("malformedSession", `Malformed session data in ${storageLocation.fsPath}: [${rawData.substring(0, 20)}${rawData.length > 20 ? "..." : ""}]`, err);
        return void 0;
      }
    });
  }
  getStorageLocation(chatSessionId) {
    return joinPath(this.storageRoot, `${chatSessionId}.json`);
  }
  getChatStorageFolder() {
    return this.storageRoot;
  }
};
ChatSessionStore = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, ILifecycleService)
], ChatSessionStore);
function isChatSessionEntryMetadata(obj) {
  return !!obj && typeof obj === "object" && typeof obj.sessionId === "string" && typeof obj.title === "string" && typeof obj.lastMessageDate === "number";
}
__name(isChatSessionEntryMetadata, "isChatSessionEntryMetadata");
function isChatSessionIndex(data) {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const index = data;
  if (index.version !== 1) {
    return false;
  }
  if (typeof index.entries !== "object" || index.entries === null) {
    return false;
  }
  for (const key in index.entries) {
    if (!isChatSessionEntryMetadata(index.entries[key])) {
      return false;
    }
  }
  return true;
}
__name(isChatSessionIndex, "isChatSessionIndex");
function getSessionMetadata(session) {
  const title = session instanceof ChatModel ? session.title || localize("newChat", "New Chat") : session.customTitle ?? ChatModel.getDefaultTitle(session.requests);
  return {
    sessionId: session.sessionId,
    title,
    lastMessageDate: session.lastMessageDate,
    isImported: session.isImported,
    initialLocation: session.initialLocation,
    isEmpty: session instanceof ChatModel ? session.getRequests().length === 0 : session.requests.length === 0
  };
}
__name(getSessionMetadata, "getSessionMetadata");
export {
  ChatSessionStore
};
//# sourceMappingURL=chatSessionStore.js.map
