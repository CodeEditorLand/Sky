var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ThrottledDelayer } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { basename, dirname, joinPath } from "../../../base/common/resources.js";
import { ByteSize, IFileService, whenProviderRegistered } from "../../files/common/files.js";
import { BufferLogger } from "./bufferLog.js";
import { AbstractLoggerService, AbstractMessageLogger, LogLevel } from "./log.js";
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
const MAX_FILE_SIZE = 5 * ByteSize.MB;
let FileLogger = class FileLogger2 extends AbstractMessageLogger {
  static {
    __name(this, "FileLogger");
  }
  constructor(resource, level, donotUseFormatters, fileService) {
    super();
    this.resource = resource;
    this.donotUseFormatters = donotUseFormatters;
    this.fileService = fileService;
    this.backupIndex = 1;
    this.buffer = "";
    this.setLevel(level);
    this.flushDelayer = new ThrottledDelayer(
      100
      /* buffer saves over a short time */
    );
    this.initializePromise = this.initialize();
  }
  async flush() {
    if (!this.buffer) {
      return;
    }
    await this.initializePromise;
    let content = await this.loadContent();
    if (content.length > MAX_FILE_SIZE) {
      await this.fileService.writeFile(this.getBackupResource(), VSBuffer.fromString(content));
      content = "";
    }
    if (this.buffer) {
      content += this.buffer;
      this.buffer = "";
      await this.fileService.writeFile(this.resource, VSBuffer.fromString(content));
    }
  }
  async initialize() {
    try {
      await this.fileService.createFile(this.resource);
    } catch (error) {
      if (error.fileOperationResult !== 3) {
        throw error;
      }
    }
  }
  log(level, message) {
    if (this.donotUseFormatters) {
      this.buffer += message;
    } else {
      this.buffer += `${this.getCurrentTimestamp()} [${this.stringifyLogLevel(level)}] ${message}
`;
    }
    this.flushDelayer.trigger(() => this.flush());
  }
  getCurrentTimestamp() {
    const toTwoDigits = /* @__PURE__ */ __name((v) => v < 10 ? `0${v}` : v, "toTwoDigits");
    const toThreeDigits = /* @__PURE__ */ __name((v) => v < 10 ? `00${v}` : v < 100 ? `0${v}` : v, "toThreeDigits");
    const currentTime = /* @__PURE__ */ new Date();
    return `${currentTime.getFullYear()}-${toTwoDigits(currentTime.getMonth() + 1)}-${toTwoDigits(currentTime.getDate())} ${toTwoDigits(currentTime.getHours())}:${toTwoDigits(currentTime.getMinutes())}:${toTwoDigits(currentTime.getSeconds())}.${toThreeDigits(currentTime.getMilliseconds())}`;
  }
  getBackupResource() {
    this.backupIndex = this.backupIndex > 5 ? 1 : this.backupIndex;
    return joinPath(dirname(this.resource), `${basename(this.resource)}_${this.backupIndex++}`);
  }
  async loadContent() {
    try {
      const content = await this.fileService.readFile(this.resource);
      return content.value.toString();
    } catch (e) {
      return "";
    }
  }
  stringifyLogLevel(level) {
    switch (level) {
      case LogLevel.Debug:
        return "debug";
      case LogLevel.Error:
        return "error";
      case LogLevel.Info:
        return "info";
      case LogLevel.Trace:
        return "trace";
      case LogLevel.Warning:
        return "warning";
    }
    return "";
  }
};
FileLogger = __decorate([
  __param(3, IFileService)
], FileLogger);
class FileLoggerService extends AbstractLoggerService {
  static {
    __name(this, "FileLoggerService");
  }
  constructor(logLevel, logsHome, fileService) {
    super(logLevel, logsHome);
    this.fileService = fileService;
  }
  doCreateLogger(resource, logLevel, options) {
    const logger = new BufferLogger(logLevel);
    whenProviderRegistered(resource, this.fileService).then(() => logger.logger = new FileLogger(resource, logger.getLevel(), !!options?.donotUseFormatters, this.fileService));
    return logger;
  }
}
export {
  FileLoggerService
};
//# sourceMappingURL=fileLog.js.map
