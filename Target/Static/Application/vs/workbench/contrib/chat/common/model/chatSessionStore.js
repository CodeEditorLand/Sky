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
var ChatSessionStore_1;
import { Sequencer } from "../../../../../base/common/async.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { revive } from "../../../../../base/common/marshalling.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { IFileService, toFileOperationResult } from "../../../../../platform/files/common/files.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IUserDataProfilesService } from "../../../../../platform/userDataProfile/common/userDataProfile.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import { awaitStatsForSession } from "../chat.js";
import { ChatModel, normalizeSerializableChatData } from "./chatModel.js";
import { ChatSessionOperationLog } from "./chatSessionOperationLog.js";
import { LocalChatSessionUri } from "./chatUri.js";
const maxPersistedSessions = 50;
const ChatIndexStorageKey = "chat.ChatSessionStore.index";
const ChatTransferIndexStorageKey = "ChatSessionStore.transferIndex";
let ChatSessionStore = class ChatSessionStore2 extends Disposable {
  static {
    __name(this, "ChatSessionStore");
  }
  static {
    ChatSessionStore_1 = this;
  }
  constructor(fileService, environmentService, logService, workspaceContextService, telemetryService, storageService, lifecycleService, userDataProfilesService, configurationService) {
    super();
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.logService = logService;
    this.workspaceContextService = workspaceContextService;
    this.telemetryService = telemetryService;
    this.storageService = storageService;
    this.lifecycleService = lifecycleService;
    this.userDataProfilesService = userDataProfilesService;
    this.configurationService = configurationService;
    this.storeQueue = new Sequencer();
    this.shuttingDown = false;
    const workspace = this.workspaceContextService.getWorkspace();
    const isEmptyWindow = !workspace.configuration && workspace.folders.length === 0;
    const workspaceId = this.workspaceContextService.getWorkspace().id;
    this.storageRoot = isEmptyWindow ? joinPath(this.userDataProfilesService.defaultProfile.globalStorageHome, "emptyWindowChatSessions") : joinPath(this.environmentService.workspaceStorageHome, workspaceId, "chatSessions");
    this.previousEmptyWindowStorageRoot = isEmptyWindow ? joinPath(this.environmentService.workspaceStorageHome, "no-workspace", "chatSessions") : void 0;
    this.transferredSessionStorageRoot = joinPath(this.userDataProfilesService.defaultProfile.globalStorageHome, "transferredChatSessions");
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
  async storeSessionsMetadataOnly(sessions) {
    if (this.shuttingDown) {
      return;
    }
    try {
      this.storeTask = this.storeQueue.queue(async () => {
        try {
          await Promise.all(sessions.map((session) => this.writeSessionMetadataOnly(session)));
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
  async storeTransferSession(transferData, session) {
    const index = this.getTransferredSessionIndex();
    const workspaceKey = transferData.toWorkspace.toString();
    const existingTransfer = index[workspaceKey];
    if (existingTransfer) {
      try {
        const existingSessionResource = URI.revive(existingTransfer.sessionResource);
        if (existingSessionResource && LocalChatSessionUri.parseLocalSessionId(existingSessionResource)) {
          const existingStorageLocation = this.getTransferredSessionStorageLocation(existingSessionResource);
          await this.fileService.del(existingStorageLocation);
        }
      } catch (e) {
        if (toFileOperationResult(e) !== 1) {
          this.reportError("storeTransferSession", "Error deleting old transferred session file", e);
        }
      }
    }
    try {
      const content = JSON.stringify(session, void 0, 2);
      const storageLocation = this.getTransferredSessionStorageLocation(session.sessionResource);
      await this.fileService.writeFile(storageLocation, VSBuffer.fromString(content));
    } catch (e) {
      this.reportError("sessionWrite", "Error writing chat session", e);
      return;
    }
    index[workspaceKey] = transferData;
    try {
      this.storageService.store(
        ChatTransferIndexStorageKey,
        index,
        0,
        1
        /* StorageTarget.MACHINE */
      );
    } catch (e) {
      this.reportError("storeTransferSession", "Error storing chat transfer session", e);
    }
  }
  getTransferredSessionIndex() {
    try {
      const data = this.storageService.getObject(ChatTransferIndexStorageKey, 0, {});
      return data;
    } catch (e) {
      this.reportError("getTransferredSessionIndex", "Error reading chat transfer index", e);
      return {};
    }
  }
  static {
    this.TRANSFER_EXPIRATION_MS = 60 * 1e3 * 5;
  }
  getTransferredSessionData() {
    try {
      const index = this.getTransferredSessionIndex();
      const workspaceFolders = this.workspaceContextService.getWorkspace().folders;
      if (workspaceFolders.length !== 1) {
        return void 0;
      }
      const workspaceKey = workspaceFolders[0].uri.toString();
      const transferredSessionForWorkspace = index[workspaceKey];
      if (!transferredSessionForWorkspace) {
        return void 0;
      }
      const revivedTransferData = revive(transferredSessionForWorkspace);
      if (Date.now() - transferredSessionForWorkspace.timestampInMilliseconds > ChatSessionStore_1.TRANSFER_EXPIRATION_MS) {
        this.logService.info("ChatSessionStore: Transferred session has expired");
        this.cleanupTransferredSession(revivedTransferData.sessionResource);
        return void 0;
      }
      return !!LocalChatSessionUri.parseLocalSessionId(revivedTransferData.sessionResource) && revivedTransferData.sessionResource;
    } catch (e) {
      this.reportError("getTransferredSession", "Error getting transferred chat session URI", e);
      return void 0;
    }
  }
  async readTransferredSession(sessionResource) {
    try {
      const storageLocation = this.getTransferredSessionStorageLocation(sessionResource);
      const sessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
      if (!sessionId) {
        return void 0;
      }
      const sessionData = await this.readSessionFromLocation(storageLocation, void 0, sessionId);
      await this.cleanupTransferredSession(sessionResource);
      return sessionData;
    } catch (e) {
      this.reportError("getTransferredSession", "Error getting transferred chat session", e);
      return void 0;
    }
  }
  async cleanupTransferredSession(sessionResource) {
    try {
      const index = this.getTransferredSessionIndex();
      const workspaceFolders = this.workspaceContextService.getWorkspace().folders;
      if (workspaceFolders.length === 1) {
        const workspaceKey = workspaceFolders[0].uri.toString();
        delete index[workspaceKey];
        this.storageService.store(
          ChatTransferIndexStorageKey,
          index,
          0,
          1
          /* StorageTarget.MACHINE */
        );
      }
      const storageLocation = this.getTransferredSessionStorageLocation(sessionResource);
      await this.fileService.del(storageLocation);
    } catch (e) {
      if (toFileOperationResult(e) !== 1) {
        this.reportError("cleanupTransferredSession", "Error cleaning up transferred session", e);
      }
    }
  }
  async writeSession(session) {
    try {
      const index = this.internalGetIndex();
      const storageLocation = this.getStorageLocation(session.sessionId);
      if (storageLocation.log) {
        if (session instanceof ChatModel) {
          if (!session.dataSerializer) {
            session.dataSerializer = new ChatSessionOperationLog();
          }
          const { op, data } = session.dataSerializer.write(session);
          if (data.byteLength > 0) {
            await this.fileService.writeFile(storageLocation.log, data, { append: op === "append" });
          }
        } else {
          const content = new ChatSessionOperationLog().createInitialFromSerialized(session);
          await this.fileService.writeFile(storageLocation.log, content);
        }
      } else {
        await this.fileService.writeFile(storageLocation.flat, VSBuffer.fromString(JSON.stringify(session)));
      }
      index.entries[session.sessionId] = await getSessionMetadata(session);
    } catch (e) {
      this.reportError("sessionWrite", "Error writing chat session", e);
    }
  }
  async writeSessionMetadataOnly(session) {
    if (LocalChatSessionUri.parseLocalSessionId(session.sessionResource)) {
      return;
    }
    try {
      const index = this.internalGetIndex();
      const externalSessionId = session.sessionResource.toString();
      index.entries[externalSessionId] = await getSessionMetadata(session);
    } catch (e) {
      this.reportError("sessionMetadataWrite", "Error writing chat session metadata", e);
    }
  }
  async flushIndex() {
    const index = this.internalGetIndex();
    try {
      this.storageService.store(
        ChatIndexStorageKey,
        index,
        this.getIndexStorageScope(),
        1
        /* StorageTarget.MACHINE */
      );
    } catch (e) {
      this.reportError("indexWrite", "Error writing index", e);
    }
  }
  getIndexStorageScope() {
    const workspace = this.workspaceContextService.getWorkspace();
    const isEmptyWindow = !workspace.configuration && workspace.folders.length === 0;
    return isEmptyWindow ? -1 : 1;
  }
  async trimEntries() {
    const index = this.internalGetIndex();
    const entries = Object.entries(index.entries).filter(([_id, entry]) => !entry.isExternal).sort((a, b) => b[1].lastMessageDate - a[1].lastMessageDate).map(([id]) => id);
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
    for (const uri of [storageLocation.flat, storageLocation.log]) {
      try {
        if (uri) {
          await this.fileService.del(uri);
        }
      } catch (e) {
        if (toFileOperationResult(e) !== 1) {
          this.reportError("sessionDelete", "Error deleting chat session", e);
        }
      }
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
  getMetadataForSessionSync(sessionResource) {
    const index = this.internalGetIndex();
    return index.entries[this.getIndexKey(sessionResource)];
  }
  getIndexKey(sessionResource) {
    const sessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
    return sessionId ?? sessionResource.toString();
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
      const storageLocation = this.getStorageLocation(sessionId);
      return this.readSessionFromLocation(storageLocation.flat, storageLocation.log, sessionId);
    });
  }
  async readSessionFromLocation(flatStorageLocation, logStorageLocation, sessionId) {
    let fromLocation = flatStorageLocation;
    let rawData;
    if (logStorageLocation) {
      try {
        rawData = (await this.fileService.readFile(logStorageLocation)).value;
        fromLocation = logStorageLocation;
      } catch (e) {
        this.reportError("sessionReadFile", `Error reading log chat session file ${sessionId}`, e);
      }
    }
    if (!rawData) {
      try {
        rawData = (await this.fileService.readFile(flatStorageLocation)).value;
        fromLocation = flatStorageLocation;
      } catch (e) {
        this.reportError("sessionReadFile", `Error reading flat chat session file ${sessionId}`, e);
        if (toFileOperationResult(e) === 1 && this.previousEmptyWindowStorageRoot) {
          rawData = await this.readSessionFromPreviousLocation(sessionId);
        }
      }
    }
    if (!rawData) {
      return void 0;
    }
    try {
      let session;
      const log = new ChatSessionOperationLog();
      if (fromLocation === logStorageLocation) {
        session = revive(log.read(rawData));
      } else {
        session = revive(JSON.parse(rawData.toString()));
      }
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
      return { value: normalizeSerializableChatData(session), serializer: log };
    } catch (err) {
      this.reportError("malformedSession", `Malformed session data in ${fromLocation.fsPath}: [${rawData.slice(0, 20).toString()}${rawData.byteLength > 20 ? "..." : ""}]`, err);
      return void 0;
    }
  }
  async readSessionFromPreviousLocation(sessionId) {
    let rawData;
    if (this.previousEmptyWindowStorageRoot) {
      const storageLocation2 = joinPath(this.previousEmptyWindowStorageRoot, `${sessionId}.json`);
      try {
        rawData = (await this.fileService.readFile(storageLocation2)).value;
        this.logService.info(`ChatSessionStore: Read chat session ${sessionId} from previous location`);
      } catch (e) {
        this.reportError("sessionReadFile", `Error reading chat session file ${sessionId} from previous location`, e);
        return void 0;
      }
    }
    return rawData;
  }
  getStorageLocation(chatSessionId) {
    return {
      flat: joinPath(this.storageRoot, `${chatSessionId}.json`),
      // todo@connor4312: remove after stabilizing
      log: this.configurationService.getValue("chat.useLogSessionStorage") !== false ? joinPath(this.storageRoot, `${chatSessionId}.jsonl`) : void 0
    };
  }
  getTransferredSessionStorageLocation(sessionResource) {
    const sessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
    return joinPath(this.transferredSessionStorageRoot, `${sessionId}.json`);
  }
  getChatStorageFolder() {
    return this.storageRoot;
  }
};
ChatSessionStore = ChatSessionStore_1 = __decorate([
  __param(0, IFileService),
  __param(1, IEnvironmentService),
  __param(2, ILogService),
  __param(3, IWorkspaceContextService),
  __param(4, ITelemetryService),
  __param(5, IStorageService),
  __param(6, ILifecycleService),
  __param(7, IUserDataProfilesService),
  __param(8, IConfigurationService)
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
async function getSessionMetadata(session) {
  const title = session.customTitle || (session instanceof ChatModel ? session.title : void 0);
  let stats;
  if (session instanceof ChatModel) {
    stats = await awaitStatsForSession(session);
  }
  const lastMessageDate = session instanceof ChatModel ? session.lastMessageDate : session.requests.at(-1)?.timestamp ?? session.creationDate;
  const timing = session instanceof ChatModel ? session.timing : (
    // session is only ISerializableChatData in the old pre-fs storage data migration scenario
    {
      created: session.creationDate,
      lastRequestStarted: session.requests.at(-1)?.timestamp,
      lastRequestEnded: lastMessageDate
    }
  );
  let lastResponseState = session instanceof ChatModel ? session.lastRequest?.response?.state ?? 1 : 1;
  if (lastResponseState === 0 || lastResponseState === 4) {
    lastResponseState = 2;
  }
  return {
    sessionId: session.sessionId,
    title: title || localize("newChat", "New Chat"),
    lastMessageDate,
    timing,
    initialLocation: session.initialLocation,
    hasPendingEdits: session instanceof ChatModel ? session.editingSession?.entries.get().some(
      (e) => e.state.get() === 0
      /* ModifiedFileEntryState.Modified */
    ) : false,
    isEmpty: session instanceof ChatModel ? session.getRequests().length === 0 : session.requests.length === 0,
    stats,
    isExternal: session instanceof ChatModel && !LocalChatSessionUri.parseLocalSessionId(session.sessionResource),
    lastResponseState
  };
}
__name(getSessionMetadata, "getSessionMetadata");
export {
  ChatSessionStore
};
//# sourceMappingURL=chatSessionStore.js.map
