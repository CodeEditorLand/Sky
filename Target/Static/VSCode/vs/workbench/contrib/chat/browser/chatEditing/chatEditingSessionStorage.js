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
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { StringSHA1 } from "../../../../../base/common/hash.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { OffsetEdit, ISingleOffsetEdit, IOffsetEdit } from "../../../../../editor/common/core/offsetEdit.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { ISnapshotEntry } from "./chatEditingModifiedFileEntry.js";
import { WorkingSetDisplayMetadata, ModifiedFileEntryState } from "../../common/chatEditingService.js";
const STORAGE_CONTENTS_FOLDER = "contents";
const STORAGE_STATE_FILE = "state.json";
let ChatEditingSessionStorage = class {
  constructor(chatSessionId, _fileService, _environmentService, _logService, _workspaceContextService) {
    this.chatSessionId = chatSessionId;
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this._logService = _logService;
    this._workspaceContextService = _workspaceContextService;
  }
  static {
    __name(this, "ChatEditingSessionStorage");
  }
  _getStorageLocation() {
    const workspaceId = this._workspaceContextService.getWorkspace().id;
    return joinPath(this._environmentService.workspaceStorageHome, workspaceId, "chatEditingSessions", this.chatSessionId);
  }
  async restoreState() {
    const storageLocation = this._getStorageLocation();
    const fileContents = /* @__PURE__ */ new Map();
    const getFileContent = /* @__PURE__ */ __name((hash) => {
      let readPromise = fileContents.get(hash);
      if (!readPromise) {
        readPromise = this._fileService.readFile(joinPath(storageLocation, STORAGE_CONTENTS_FOLDER, hash)).then((content) => content.value.toString());
        fileContents.set(hash, readPromise);
      }
      return readPromise;
    }, "getFileContent");
    const deserializeSnapshotEntriesDTO = /* @__PURE__ */ __name(async (dtoEntries) => {
      const entries = new ResourceMap();
      for (const entryDTO of dtoEntries) {
        const entry = await deserializeSnapshotEntry(entryDTO);
        entries.set(entry.resource, entry);
      }
      return entries;
    }, "deserializeSnapshotEntriesDTO");
    const deserializeChatEditingStopDTO = /* @__PURE__ */ __name(async (stopDTO) => {
      const entries = await deserializeSnapshotEntriesDTO(stopDTO.entries);
      return { stopId: "stopId" in stopDTO ? stopDTO.stopId : void 0, entries };
    }, "deserializeChatEditingStopDTO");
    const normalizeSnapshotDtos = /* @__PURE__ */ __name((snapshot) => {
      if ("stops" in snapshot) {
        return snapshot;
      }
      return { requestId: snapshot.requestId, stops: [{ stopId: void 0, entries: snapshot.entries }], postEdit: void 0 };
    }, "normalizeSnapshotDtos");
    const deserializeChatEditingSessionSnapshot = /* @__PURE__ */ __name(async (startIndex, snapshot) => {
      const stops = await Promise.all(snapshot.stops.map(deserializeChatEditingStopDTO));
      return { startIndex, requestId: snapshot.requestId, stops, postEdit: snapshot.postEdit && await deserializeSnapshotEntriesDTO(snapshot.postEdit) };
    }, "deserializeChatEditingSessionSnapshot");
    const deserializeSnapshotEntry = /* @__PURE__ */ __name(async (entry) => {
      return {
        resource: URI.parse(entry.resource),
        languageId: entry.languageId,
        original: await getFileContent(entry.originalHash),
        current: await getFileContent(entry.currentHash),
        originalToCurrentEdit: OffsetEdit.fromJson(entry.originalToCurrentEdit),
        state: entry.state,
        snapshotUri: URI.parse(entry.snapshotUri),
        telemetryInfo: { requestId: entry.telemetryInfo.requestId, agentId: entry.telemetryInfo.agentId, command: entry.telemetryInfo.command, sessionId: this.chatSessionId, result: void 0 }
      };
    }, "deserializeSnapshotEntry");
    try {
      const stateFilePath = joinPath(storageLocation, STORAGE_STATE_FILE);
      if (!await this._fileService.exists(stateFilePath)) {
        this._logService.debug(`chatEditingSession: No editing session state found at ${stateFilePath.toString()}`);
        return void 0;
      }
      this._logService.debug(`chatEditingSession: Restoring editing session at ${stateFilePath.toString()}`);
      const stateFileContent = await this._fileService.readFile(stateFilePath);
      const data = JSON.parse(stateFileContent.value.toString());
      if (!COMPATIBLE_STORAGE_VERSIONS.includes(data.version)) {
        return void 0;
      }
      let linearHistoryIndex = 0;
      const linearHistory = await Promise.all(data.linearHistory.map((snapshot) => {
        const norm = normalizeSnapshotDtos(snapshot);
        const result = deserializeChatEditingSessionSnapshot(linearHistoryIndex, norm);
        linearHistoryIndex += norm.stops.length;
        return result;
      }));
      const initialFileContents = new ResourceMap();
      for (const fileContentDTO of data.initialFileContents) {
        initialFileContents.set(URI.parse(fileContentDTO[0]), await getFileContent(fileContentDTO[1]));
      }
      const pendingSnapshot = data.pendingSnapshot ? await deserializeChatEditingStopDTO(data.pendingSnapshot) : void 0;
      const recentSnapshot = await deserializeChatEditingStopDTO(data.recentSnapshot);
      return {
        initialFileContents,
        pendingSnapshot,
        recentSnapshot,
        linearHistoryIndex: data.linearHistoryIndex,
        linearHistory
      };
    } catch (e) {
      this._logService.error(`Error restoring chat editing session from ${storageLocation.toString()}`, e);
    }
    return void 0;
  }
  async storeState(state) {
    const storageFolder = this._getStorageLocation();
    const contentsFolder = URI.joinPath(storageFolder, STORAGE_CONTENTS_FOLDER);
    const existingContents = /* @__PURE__ */ new Set();
    try {
      const stat = await this._fileService.resolve(contentsFolder);
      stat.children?.forEach((child) => {
        if (child.isFile) {
          existingContents.add(child.name);
        }
      });
    } catch (e) {
      try {
        await this._fileService.createFolder(contentsFolder);
      } catch (e2) {
        this._logService.error(`Error creating chat editing session content folder ${contentsFolder.toString()}`, e2);
        return;
      }
    }
    const fileContents = /* @__PURE__ */ new Map();
    const addFileContent = /* @__PURE__ */ __name((content) => {
      const shaComputer = new StringSHA1();
      shaComputer.update(content);
      const sha = shaComputer.digest().substring(0, 7);
      fileContents.set(sha, content);
      return sha;
    }, "addFileContent");
    const serializeResourceMap = /* @__PURE__ */ __name((resourceMap, serialize) => {
      return Array.from(resourceMap.entries()).map(([resourceURI, value]) => [resourceURI.toString(), serialize(value)]);
    }, "serializeResourceMap");
    const serializeChatEditingSessionStop = /* @__PURE__ */ __name((stop) => {
      return {
        stopId: stop.stopId,
        entries: Array.from(stop.entries.values()).map(serializeSnapshotEntry)
      };
    }, "serializeChatEditingSessionStop");
    const serializeChatEditingSessionSnapshot = /* @__PURE__ */ __name((snapshot) => {
      return {
        requestId: snapshot.requestId,
        stops: snapshot.stops.map(serializeChatEditingSessionStop),
        postEdit: snapshot.postEdit ? Array.from(snapshot.postEdit.values()).map(serializeSnapshotEntry) : void 0
      };
    }, "serializeChatEditingSessionSnapshot");
    const serializeSnapshotEntry = /* @__PURE__ */ __name((entry) => {
      return {
        resource: entry.resource.toString(),
        languageId: entry.languageId,
        originalHash: addFileContent(entry.original),
        currentHash: addFileContent(entry.current),
        originalToCurrentEdit: entry.originalToCurrentEdit.edits.map((edit) => ({ pos: edit.replaceRange.start, len: edit.replaceRange.length, txt: edit.newText })),
        state: entry.state,
        snapshotUri: entry.snapshotUri.toString(),
        telemetryInfo: { requestId: entry.telemetryInfo.requestId, agentId: entry.telemetryInfo.agentId, command: entry.telemetryInfo.command }
      };
    }, "serializeSnapshotEntry");
    try {
      const data = {
        version: STORAGE_VERSION,
        sessionId: this.chatSessionId,
        linearHistory: state.linearHistory.map(serializeChatEditingSessionSnapshot),
        linearHistoryIndex: state.linearHistoryIndex,
        initialFileContents: serializeResourceMap(state.initialFileContents, (value) => addFileContent(value)),
        pendingSnapshot: state.pendingSnapshot ? serializeChatEditingSessionStop(state.pendingSnapshot) : void 0,
        recentSnapshot: serializeChatEditingSessionStop(state.recentSnapshot)
      };
      this._logService.debug(`chatEditingSession: Storing editing session at ${storageFolder.toString()}: ${fileContents.size} files`);
      for (const [hash, content] of fileContents) {
        if (!existingContents.has(hash)) {
          await this._fileService.writeFile(joinPath(contentsFolder, hash), VSBuffer.fromString(content));
        }
      }
      await this._fileService.writeFile(joinPath(storageFolder, STORAGE_STATE_FILE), VSBuffer.fromString(JSON.stringify(data)));
    } catch (e) {
      this._logService.debug(`Error storing chat editing session to ${storageFolder.toString()}`, e);
    }
  }
  async clearState() {
    const storageFolder = this._getStorageLocation();
    if (await this._fileService.exists(storageFolder)) {
      this._logService.debug(`chatEditingSession: Clearing editing session at ${storageFolder.toString()}`);
      try {
        await this._fileService.del(storageFolder, { recursive: true });
      } catch (e) {
        this._logService.debug(`Error clearing chat editing session from ${storageFolder.toString()}`, e);
      }
    }
  }
};
ChatEditingSessionStorage = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IWorkspaceContextService)
], ChatEditingSessionStorage);
const COMPATIBLE_STORAGE_VERSIONS = [1, 2];
const STORAGE_VERSION = 2;
export {
  ChatEditingSessionStorage
};
//# sourceMappingURL=chatEditingSessionStorage.js.map
