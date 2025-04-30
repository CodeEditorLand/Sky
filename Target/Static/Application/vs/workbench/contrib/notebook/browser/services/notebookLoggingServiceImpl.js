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
import * as nls from "../../../../../nls.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ILoggerService } from "../../../../../platform/log/common/log.js";
import { windowLogGroup } from "../../../../services/log/common/logConstants.js";
const logChannelId = "notebook.rendering";
let NotebookLoggingService = class NotebookLoggingService2 extends Disposable {
  static {
    __name(this, "NotebookLoggingService");
  }
  static {
    this.ID = "notebook";
  }
  constructor(loggerService) {
    super();
    this._logger = this._register(loggerService.createLogger(logChannelId, { name: nls.localize("renderChannelName", "Notebook"), group: windowLogGroup }));
  }
  debug(category, output) {
    this._logger.debug(`[${category}] ${output}`);
  }
  info(category, output) {
    this._logger.info(`[${category}] ${output}`);
  }
  warn(category, output) {
    this._logger.warn(`[${category}] ${output}`);
  }
  error(category, output) {
    this._logger.error(`[${category}] ${output}`);
  }
};
NotebookLoggingService = __decorate([
  __param(0, ILoggerService)
], NotebookLoggingService);
export {
  NotebookLoggingService
};
//# sourceMappingURL=notebookLoggingServiceImpl.js.map
