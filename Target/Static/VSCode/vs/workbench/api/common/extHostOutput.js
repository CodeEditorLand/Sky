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
import { MainContext, MainThreadOutputServiceShape, ExtHostOutputServiceShape } from "./extHost.protocol.js";
import { URI } from "../../../base/common/uri.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { AbstractMessageLogger, ILogger, ILoggerService, ILogService, log, LogLevel, parseLogLevel } from "../../../platform/log/common/log.js";
import { OutputChannelUpdateMode } from "../../services/output/common/output.js";
import { IExtHostConsumerFileSystem } from "./extHostFileSystemConsumer.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
import { IExtHostFileSystemInfo } from "./extHostFileSystemInfo.js";
import { toLocalISOString } from "../../../base/common/date.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { isString } from "../../../base/common/types.js";
import { FileSystemProviderErrorCode, toFileSystemProviderErrorCode } from "../../../platform/files/common/files.js";
import { Emitter } from "../../../base/common/event.js";
import { DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
class ExtHostOutputChannel extends AbstractMessageLogger {
  constructor(id, name, logger, proxy, extension) {
    super();
    this.id = id;
    this.name = name;
    this.logger = logger;
    this.proxy = proxy;
    this.extension = extension;
    this.setLevel(logger.getLevel());
    this._register(logger.onDidChangeLogLevel((level) => this.setLevel(level)));
    this._register(toDisposable(() => this.proxy.$dispose(this.id)));
  }
  static {
    __name(this, "ExtHostOutputChannel");
  }
  offset = 0;
  visible = false;
  get logLevel() {
    return this.getLevel();
  }
  appendLine(value) {
    this.append(value + "\n");
  }
  append(value) {
    this.info(value);
  }
  clear() {
    const till = this.offset;
    this.logger.flush();
    this.proxy.$update(this.id, OutputChannelUpdateMode.Clear, till);
  }
  replace(value) {
    const till = this.offset;
    this.info(value);
    this.proxy.$update(this.id, OutputChannelUpdateMode.Replace, till);
    if (this.visible) {
      this.logger.flush();
    }
  }
  show(columnOrPreserveFocus, preserveFocus) {
    this.logger.flush();
    this.proxy.$reveal(this.id, !!(typeof columnOrPreserveFocus === "boolean" ? columnOrPreserveFocus : preserveFocus));
  }
  hide() {
    this.proxy.$close(this.id);
  }
  log(level, message) {
    this.offset += VSBuffer.fromString(message).byteLength;
    log(this.logger, level, message);
    if (this.visible) {
      this.logger.flush();
      this.proxy.$update(this.id, OutputChannelUpdateMode.Append);
    }
  }
}
class ExtHostLogOutputChannel extends ExtHostOutputChannel {
  static {
    __name(this, "ExtHostLogOutputChannel");
  }
  appendLine(value) {
    this.append(value);
  }
}
let ExtHostOutputService = class {
  constructor(extHostRpc, initData, extHostFileSystem, extHostFileSystemInfo, loggerService, logService) {
    this.initData = initData;
    this.extHostFileSystem = extHostFileSystem;
    this.extHostFileSystemInfo = extHostFileSystemInfo;
    this.loggerService = loggerService;
    this.logService = logService;
    this.proxy = extHostRpc.getProxy(MainContext.MainThreadOutputService);
    this.outputsLocation = this.extHostFileSystemInfo.extUri.joinPath(initData.logsLocation, `output_logging_${toLocalISOString(/* @__PURE__ */ new Date()).replace(/-|:|\.\d+Z$/g, "")}`);
  }
  static {
    __name(this, "ExtHostOutputService");
  }
  _serviceBrand;
  proxy;
  outputsLocation;
  outputDirectoryPromise;
  extensionLogDirectoryPromise = /* @__PURE__ */ new Map();
  namePool = 1;
  channels = /* @__PURE__ */ new Map();
  visibleChannelId = null;
  $setVisibleChannel(visibleChannelId) {
    this.visibleChannelId = visibleChannelId;
    for (const [id, channel] of this.channels) {
      channel.visible = id === this.visibleChannelId;
    }
  }
  createOutputChannel(name, options, extension) {
    name = name.trim();
    if (!name) {
      throw new Error("illegal argument `name`. must not be falsy");
    }
    const log2 = typeof options === "object" && options.log;
    const languageId = isString(options) ? options : void 0;
    if (isString(languageId) && !languageId.trim()) {
      throw new Error("illegal argument `languageId`. must not be empty");
    }
    let logLevel;
    const logLevelValue = this.initData.environment.extensionLogLevel?.find(([identifier]) => ExtensionIdentifier.equals(extension.identifier, identifier))?.[1];
    if (logLevelValue) {
      logLevel = parseLogLevel(logLevelValue);
    }
    const channelDisposables = new DisposableStore();
    const extHostOutputChannel = log2 ? this.doCreateLogOutputChannel(name, logLevel, extension, channelDisposables) : this.doCreateOutputChannel(name, languageId, extension, channelDisposables);
    extHostOutputChannel.then((channel) => {
      this.channels.set(channel.id, channel);
      channel.visible = channel.id === this.visibleChannelId;
      channelDisposables.add(toDisposable(() => this.channels.delete(channel.id)));
    });
    return log2 ? this.createExtHostLogOutputChannel(name, logLevel ?? this.logService.getLevel(), extHostOutputChannel, channelDisposables) : this.createExtHostOutputChannel(name, extHostOutputChannel, channelDisposables);
  }
  async doCreateOutputChannel(name, languageId, extension, channelDisposables) {
    if (!this.outputDirectoryPromise) {
      this.outputDirectoryPromise = this.extHostFileSystem.value.createDirectory(this.outputsLocation).then(() => this.outputsLocation);
    }
    const outputDir = await this.outputDirectoryPromise;
    const file = this.extHostFileSystemInfo.extUri.joinPath(outputDir, `${this.namePool++}-${name.replace(/[\\/:\*\?"<>\|]/g, "")}.log`);
    const logger = channelDisposables.add(this.loggerService.createLogger(file, { logLevel: "always", donotRotate: true, donotUseFormatters: true, hidden: true }));
    const id = await this.proxy.$register(name, file, languageId, extension.identifier.value);
    channelDisposables.add(toDisposable(() => this.loggerService.deregisterLogger(file)));
    return new ExtHostOutputChannel(id, name, logger, this.proxy, extension);
  }
  async doCreateLogOutputChannel(name, logLevel, extension, channelDisposables) {
    const extensionLogDir = await this.createExtensionLogDirectory(extension);
    const fileName = name.replace(/[\\/:\*\?"<>\|]/g, "");
    const file = this.extHostFileSystemInfo.extUri.joinPath(extensionLogDir, `${fileName}.log`);
    const id = `${extension.identifier.value}.${fileName}`;
    const logger = channelDisposables.add(this.loggerService.createLogger(file, { id, name, logLevel, extensionId: extension.identifier.value }));
    channelDisposables.add(toDisposable(() => this.loggerService.deregisterLogger(file)));
    return new ExtHostLogOutputChannel(id, name, logger, this.proxy, extension);
  }
  createExtensionLogDirectory(extension) {
    let extensionLogDirectoryPromise = this.extensionLogDirectoryPromise.get(extension.identifier.value);
    if (!extensionLogDirectoryPromise) {
      const extensionLogDirectory = this.extHostFileSystemInfo.extUri.joinPath(this.initData.logsLocation, extension.identifier.value);
      this.extensionLogDirectoryPromise.set(extension.identifier.value, extensionLogDirectoryPromise = (async () => {
        try {
          await this.extHostFileSystem.value.createDirectory(extensionLogDirectory);
        } catch (err) {
          if (toFileSystemProviderErrorCode(err) !== FileSystemProviderErrorCode.FileExists) {
            throw err;
          }
        }
        return extensionLogDirectory;
      })());
    }
    return extensionLogDirectoryPromise;
  }
  createExtHostOutputChannel(name, channelPromise, channelDisposables) {
    const validate = /* @__PURE__ */ __name(() => {
      if (channelDisposables.isDisposed) {
        throw new Error("Channel has been closed");
      }
    }, "validate");
    channelPromise.then((channel) => channelDisposables.add(channel));
    return {
      get name() {
        return name;
      },
      append(value) {
        validate();
        channelPromise.then((channel) => channel.append(value));
      },
      appendLine(value) {
        validate();
        channelPromise.then((channel) => channel.appendLine(value));
      },
      clear() {
        validate();
        channelPromise.then((channel) => channel.clear());
      },
      replace(value) {
        validate();
        channelPromise.then((channel) => channel.replace(value));
      },
      show(columnOrPreserveFocus, preserveFocus) {
        validate();
        channelPromise.then((channel) => channel.show(columnOrPreserveFocus, preserveFocus));
      },
      hide() {
        validate();
        channelPromise.then((channel) => channel.hide());
      },
      dispose() {
        channelDisposables.dispose();
      }
    };
  }
  createExtHostLogOutputChannel(name, logLevel, channelPromise, channelDisposables) {
    const validate = /* @__PURE__ */ __name(() => {
      if (channelDisposables.isDisposed) {
        throw new Error("Channel has been closed");
      }
    }, "validate");
    const onDidChangeLogLevel = channelDisposables.add(new Emitter());
    function setLogLevel(newLogLevel) {
      logLevel = newLogLevel;
      onDidChangeLogLevel.fire(newLogLevel);
    }
    __name(setLogLevel, "setLogLevel");
    channelPromise.then((channel) => {
      if (channel.logLevel !== logLevel) {
        setLogLevel(channel.logLevel);
      }
      channelDisposables.add(channel.onDidChangeLogLevel((e) => setLogLevel(e)));
    });
    return {
      ...this.createExtHostOutputChannel(name, channelPromise, channelDisposables),
      get logLevel() {
        return logLevel;
      },
      onDidChangeLogLevel: onDidChangeLogLevel.event,
      trace(value, ...args) {
        validate();
        channelPromise.then((channel) => channel.trace(value, ...args));
      },
      debug(value, ...args) {
        validate();
        channelPromise.then((channel) => channel.debug(value, ...args));
      },
      info(value, ...args) {
        validate();
        channelPromise.then((channel) => channel.info(value, ...args));
      },
      warn(value, ...args) {
        validate();
        channelPromise.then((channel) => channel.warn(value, ...args));
      },
      error(value, ...args) {
        validate();
        channelPromise.then((channel) => channel.error(value, ...args));
      }
    };
  }
};
ExtHostOutputService = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService),
  __decorateParam(2, IExtHostConsumerFileSystem),
  __decorateParam(3, IExtHostFileSystemInfo),
  __decorateParam(4, ILoggerService),
  __decorateParam(5, ILogService)
], ExtHostOutputService);
const IExtHostOutputService = createDecorator("IExtHostOutputService");
export {
  ExtHostOutputService,
  IExtHostOutputService
};
//# sourceMappingURL=extHostOutput.js.map
