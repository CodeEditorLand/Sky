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
import { joinPath } from "../../../../base/common/resources.js";
import { localize } from "../../../../nls.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { AbstractLogger, ILoggerService } from "../../../../platform/log/common/log.js";
import { windowLogGroup } from "../../../services/log/common/logConstants.js";
import { editSessionsLogId } from "./editSessions.js";
let EditSessionsLogService = class EditSessionsLogService2 extends AbstractLogger {
  static {
    __name(this, "EditSessionsLogService");
  }
  constructor(loggerService, environmentService) {
    super();
    this.logger = this._register(loggerService.createLogger(joinPath(environmentService.logsHome, `${editSessionsLogId}.log`), { id: editSessionsLogId, name: localize("cloudChangesLog", "Cloud Changes"), group: windowLogGroup }));
  }
  trace(message, ...args) {
    this.logger.trace(message, ...args);
  }
  debug(message, ...args) {
    this.logger.debug(message, ...args);
  }
  info(message, ...args) {
    this.logger.info(message, ...args);
  }
  warn(message, ...args) {
    this.logger.warn(message, ...args);
  }
  error(message, ...args) {
    this.logger.error(message, ...args);
  }
  flush() {
    this.logger.flush();
  }
};
EditSessionsLogService = __decorate([
  __param(0, ILoggerService),
  __param(1, IEnvironmentService)
], EditSessionsLogService);
export {
  EditSessionsLogService
};
//# sourceMappingURL=editSessionsLogService.js.map
