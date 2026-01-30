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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { LRUCache } from "../../../../../base/common/map.js";
import { Schemas } from "../../../../../base/common/network.js";
import { join } from "../../../../../base/common/path.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { env } from "../../../../../base/common/process.js";
import { isNumber } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { FileOperationError, IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IRemoteAgentService } from "../../../../services/remote/common/remoteAgentService.js";
var Constants;
(function(Constants2) {
  Constants2[Constants2["DefaultHistoryLimit"] = 100] = "DefaultHistoryLimit";
})(Constants || (Constants = {}));
var StorageKeys;
(function(StorageKeys2) {
  StorageKeys2["Entries"] = "terminal.history.entries";
  StorageKeys2["Timestamp"] = "terminal.history.timestamp";
})(StorageKeys || (StorageKeys = {}));
let directoryHistory = void 0;
function getDirectoryHistory(accessor) {
  if (!directoryHistory) {
    directoryHistory = accessor.get(IInstantiationService).createInstance(TerminalPersistedHistory, "dirs");
  }
  return directoryHistory;
}
__name(getDirectoryHistory, "getDirectoryHistory");
let commandHistory = void 0;
function getCommandHistory(accessor) {
  if (!commandHistory) {
    commandHistory = accessor.get(IInstantiationService).createInstance(TerminalPersistedHistory, "commands");
  }
  return commandHistory;
}
__name(getCommandHistory, "getCommandHistory");
let TerminalPersistedHistory = class TerminalPersistedHistory2 extends Disposable {
  static {
    __name(this, "TerminalPersistedHistory");
  }
  get entries() {
    this._ensureUpToDate();
    return this._entries.entries();
  }
  constructor(_storageDataKey, _configurationService, _storageService) {
    super();
    this._storageDataKey = _storageDataKey;
    this._configurationService = _configurationService;
    this._storageService = _storageService;
    this._timestamp = 0;
    this._isReady = false;
    this._isStale = true;
    this._entries = new LRUCache(this._getHistoryLimit());
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(
        "terminal.integrated.shellIntegration.history"
        /* TerminalHistorySettingId.ShellIntegrationCommandHistory */
      )) {
        this._entries.limit = this._getHistoryLimit();
      }
    }));
    this._register(this._storageService.onDidChangeValue(-1, this._getTimestampStorageKey(), this._store)(() => {
      if (!this._isStale) {
        this._isStale = this._storageService.getNumber(this._getTimestampStorageKey(), -1, 0) !== this._timestamp;
      }
    }));
  }
  add(key, value) {
    this._ensureUpToDate();
    this._entries.set(key, value);
    this._saveState();
  }
  remove(key) {
    this._ensureUpToDate();
    this._entries.delete(key);
    this._saveState();
  }
  clear() {
    this._ensureUpToDate();
    this._entries.clear();
    this._saveState();
  }
  _ensureUpToDate() {
    if (!this._isReady) {
      this._loadState();
      this._isReady = true;
    }
    if (this._isStale) {
      this._entries.clear();
      this._loadState();
      this._isStale = false;
    }
  }
  _loadState() {
    this._timestamp = this._storageService.getNumber(this._getTimestampStorageKey(), -1, 0);
    const serialized = this._loadPersistedState();
    if (serialized) {
      for (const entry of serialized.entries) {
        this._entries.set(entry.key, entry.value);
      }
    }
  }
  _loadPersistedState() {
    const raw = this._storageService.get(
      this._getEntriesStorageKey(),
      -1
      /* StorageScope.APPLICATION */
    );
    if (raw === void 0 || raw.length === 0) {
      return void 0;
    }
    let serialized = void 0;
    try {
      serialized = JSON.parse(raw);
    } catch {
      return void 0;
    }
    return serialized;
  }
  _saveState() {
    const serialized = { entries: [] };
    this._entries.forEach((value, key) => serialized.entries.push({ key, value }));
    this._storageService.store(
      this._getEntriesStorageKey(),
      JSON.stringify(serialized),
      -1,
      1
      /* StorageTarget.MACHINE */
    );
    this._timestamp = Date.now();
    this._storageService.store(
      this._getTimestampStorageKey(),
      this._timestamp,
      -1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  _getHistoryLimit() {
    const historyLimit = this._configurationService.getValue(
      "terminal.integrated.shellIntegration.history"
      /* TerminalHistorySettingId.ShellIntegrationCommandHistory */
    );
    return isNumber(historyLimit) ? historyLimit : 100;
  }
  _getTimestampStorageKey() {
    return `${"terminal.history.timestamp"}.${this._storageDataKey}`;
  }
  _getEntriesStorageKey() {
    return `${"terminal.history.entries"}.${this._storageDataKey}`;
  }
};
TerminalPersistedHistory = __decorate([
  __param(1, IConfigurationService),
  __param(2, IStorageService)
], TerminalPersistedHistory);
const shellFileHistory = /* @__PURE__ */ new Map();
async function getShellFileHistory(accessor, shellType) {
  const cached = shellFileHistory.get(shellType);
  if (cached === null) {
    return void 0;
  }
  if (cached !== void 0) {
    return cached;
  }
  let result;
  switch (shellType) {
    case "bash":
      result = await fetchBashHistory(accessor);
      break;
    case "pwsh":
      result = await fetchPwshHistory(accessor);
      break;
    case "zsh":
      result = await fetchZshHistory(accessor);
      break;
    case "fish":
      result = await fetchFishHistory(accessor);
      break;
    case "python":
      result = await fetchPythonHistory(accessor);
      break;
    default:
      return void 0;
  }
  if (result === void 0) {
    shellFileHistory.set(shellType, null);
    return void 0;
  }
  shellFileHistory.set(shellType, result);
  return result;
}
__name(getShellFileHistory, "getShellFileHistory");
function clearShellFileHistory() {
  shellFileHistory.clear();
}
__name(clearShellFileHistory, "clearShellFileHistory");
async function fetchBashHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  if (remoteEnvironment?.os === 1 || !remoteEnvironment && isWindows) {
    return void 0;
  }
  const sourceLabel = "~/.bash_history";
  const home = remoteEnvironment?.userHome?.fsPath ?? env["HOME"];
  const resolvedFile = await fetchFileContents(home, ".bash_history", false, fileService, remoteAgentService);
  if (resolvedFile === void 0) {
    return void 0;
  }
  const fileLines = resolvedFile.content.split("\n");
  const result = /* @__PURE__ */ new Set();
  let currentLine;
  let currentCommand = void 0;
  let wrapChar = void 0;
  for (let i = 0; i < fileLines.length; i++) {
    currentLine = fileLines[i];
    if (currentCommand === void 0) {
      currentCommand = currentLine;
    } else {
      currentCommand += `
${currentLine}`;
    }
    for (let c = 0; c < currentLine.length; c++) {
      if (wrapChar) {
        if (currentLine[c] === wrapChar) {
          wrapChar = void 0;
        }
      } else {
        if (currentLine[c].match(/['"]/)) {
          wrapChar = currentLine[c];
        }
      }
    }
    if (wrapChar === void 0) {
      if (currentCommand.length > 0) {
        result.add(currentCommand.trim());
      }
      currentCommand = void 0;
    }
  }
  return {
    sourceLabel,
    sourceResource: resolvedFile.resource,
    commands: Array.from(result.values())
  };
}
__name(fetchBashHistory, "fetchBashHistory");
async function fetchZshHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  if (remoteEnvironment?.os === 1 || !remoteEnvironment && isWindows) {
    return void 0;
  }
  const sourceLabel = "~/.zsh_history";
  const home = remoteEnvironment?.userHome?.fsPath ?? env["HOME"];
  const resolvedFile = await fetchFileContents(home, ".zsh_history", false, fileService, remoteAgentService);
  if (resolvedFile === void 0) {
    return void 0;
  }
  const isExtendedHistory = /^:\s\d+:\d+;/.test(resolvedFile.content);
  const fileLines = resolvedFile.content.split(isExtendedHistory ? /\:\s\d+\:\d+;/ : /(?<!\\)\n/);
  const result = /* @__PURE__ */ new Set();
  for (let i = 0; i < fileLines.length; i++) {
    const sanitized = fileLines[i].replace(/\\\n/g, "\n").trim();
    if (sanitized.length > 0) {
      result.add(sanitized);
    }
  }
  return {
    sourceLabel,
    sourceResource: resolvedFile.resource,
    commands: Array.from(result.values())
  };
}
__name(fetchZshHistory, "fetchZshHistory");
async function fetchPythonHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  const sourceLabel = "~/.python_history";
  const home = remoteEnvironment?.userHome?.fsPath ?? env["HOME"];
  const resolvedFile = await fetchFileContents(home, ".python_history", false, fileService, remoteAgentService);
  if (resolvedFile === void 0) {
    return void 0;
  }
  const fileLines = resolvedFile.content.split("\n");
  const result = /* @__PURE__ */ new Set();
  fileLines.forEach((line) => {
    if (line.trim().length > 0) {
      result.add(line.trim());
    }
  });
  return {
    sourceLabel,
    sourceResource: resolvedFile.resource,
    commands: Array.from(result.values())
  };
}
__name(fetchPythonHistory, "fetchPythonHistory");
async function fetchPwshHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  let folderPrefix;
  let filePath;
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  const isFileWindows = remoteEnvironment?.os === 1 || !remoteEnvironment && isWindows;
  let sourceLabel;
  if (isFileWindows) {
    folderPrefix = env["APPDATA"];
    filePath = "Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt";
    sourceLabel = `$APPDATA\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt`;
  } else {
    folderPrefix = remoteEnvironment?.userHome?.fsPath ?? env["HOME"];
    filePath = ".local/share/powershell/PSReadline/ConsoleHost_history.txt";
    sourceLabel = `~/${filePath}`;
  }
  const resolvedFile = await fetchFileContents(folderPrefix, filePath, isFileWindows, fileService, remoteAgentService);
  if (resolvedFile === void 0) {
    return void 0;
  }
  const fileLines = resolvedFile.content.split("\n");
  const result = /* @__PURE__ */ new Set();
  let currentLine;
  let currentCommand = void 0;
  let wrapChar = void 0;
  for (let i = 0; i < fileLines.length; i++) {
    currentLine = fileLines[i];
    if (currentCommand === void 0) {
      currentCommand = currentLine;
    } else {
      currentCommand += `
${currentLine}`;
    }
    if (!currentLine.endsWith("`")) {
      const sanitized = currentCommand.trim();
      if (sanitized.length > 0) {
        result.add(sanitized);
      }
      currentCommand = void 0;
      continue;
    }
    for (let c = 0; c < currentLine.length; c++) {
      if (wrapChar) {
        if (currentLine[c] === wrapChar) {
          wrapChar = void 0;
        }
      } else {
        if (currentLine[c].match(/`/)) {
          wrapChar = currentLine[c];
        }
      }
    }
    if (!wrapChar) {
      const sanitized = currentCommand.trim();
      if (sanitized.length > 0) {
        result.add(sanitized);
      }
      currentCommand = void 0;
    } else {
      currentCommand = currentCommand.replace(/`$/, "");
      wrapChar = void 0;
    }
  }
  return {
    sourceLabel,
    sourceResource: resolvedFile.resource,
    commands: Array.from(result.values())
  };
}
__name(fetchPwshHistory, "fetchPwshHistory");
async function fetchFishHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  if (remoteEnvironment?.os === 1 || !remoteEnvironment && isWindows) {
    return void 0;
  }
  const overridenDataHome = env["XDG_DATA_HOME"];
  let folderPrefix;
  let filePath;
  let sourceLabel;
  if (overridenDataHome) {
    sourceLabel = "$XDG_DATA_HOME/fish/fish_history";
    folderPrefix = env["XDG_DATA_HOME"];
    filePath = "fish/fish_history";
  } else {
    sourceLabel = "~/.local/share/fish/fish_history";
    folderPrefix = remoteEnvironment?.userHome?.fsPath ?? env["HOME"];
    filePath = ".local/share/fish/fish_history";
  }
  const resolvedFile = await fetchFileContents(folderPrefix, filePath, false, fileService, remoteAgentService);
  if (resolvedFile === void 0) {
    return void 0;
  }
  const result = /* @__PURE__ */ new Set();
  const cmds = resolvedFile.content.split("\n").filter((x) => x.startsWith("- cmd:")).map((x) => x.substring(6).trimStart());
  for (let i = 0; i < cmds.length; i++) {
    const sanitized = sanitizeFishHistoryCmd(cmds[i]).trim();
    if (sanitized.length > 0) {
      result.add(sanitized);
    }
  }
  return {
    sourceLabel,
    sourceResource: resolvedFile.resource,
    commands: Array.from(result.values())
  };
}
__name(fetchFishHistory, "fetchFishHistory");
function sanitizeFishHistoryCmd(cmd) {
  return repeatedReplace(/(^|[^\\])((?:\\\\)*)(\\n)/g, cmd, "$1$2\n");
}
__name(sanitizeFishHistoryCmd, "sanitizeFishHistoryCmd");
function repeatedReplace(pattern, value, replaceValue) {
  let last;
  let current = value;
  while (true) {
    last = current;
    current = current.replace(pattern, replaceValue);
    if (current === last) {
      return current;
    }
  }
}
__name(repeatedReplace, "repeatedReplace");
async function fetchFileContents(folderPrefix, filePath, isFileWindows, fileService, remoteAgentService) {
  if (!folderPrefix) {
    return void 0;
  }
  const connection = remoteAgentService.getConnection();
  const isRemote = !!connection?.remoteAuthority;
  const resource = URI.from({
    scheme: isRemote ? Schemas.vscodeRemote : Schemas.file,
    authority: isRemote ? connection.remoteAuthority : void 0,
    path: URI.file(join(folderPrefix, filePath)).path
  });
  let content;
  try {
    content = await fileService.readFile(resource);
  } catch (e) {
    if (e instanceof FileOperationError && e.fileOperationResult === 1) {
      return void 0;
    }
    throw e;
  }
  if (content === void 0) {
    return void 0;
  }
  return {
    resource,
    content: content.value.toString()
  };
}
__name(fetchFileContents, "fetchFileContents");
export {
  TerminalPersistedHistory,
  clearShellFileHistory,
  fetchBashHistory,
  fetchFishHistory,
  fetchPwshHistory,
  fetchPythonHistory,
  fetchZshHistory,
  getCommandHistory,
  getDirectoryHistory,
  getShellFileHistory,
  sanitizeFishHistoryCmd
};
//# sourceMappingURL=history.js.map
