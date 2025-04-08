var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ILogger, ILoggerOptions, ILoggerResource, LogLevel } from "../../../platform/log/common/log.js";
import { URI } from "../../../base/common/uri.js";
import { ExtHostLoggerService as BaseExtHostLoggerService } from "../common/extHostLoggerService.js";
import { Schemas } from "../../../base/common/network.js";
import { SpdLogLogger } from "../../../platform/log/node/spdlogLog.js";
import { generateUuid } from "../../../base/common/uuid.js";
class ExtHostLoggerService extends BaseExtHostLoggerService {
  static {
    __name(this, "ExtHostLoggerService");
  }
  doCreateLogger(resource, logLevel, options) {
    if (resource.scheme === Schemas.file) {
      return new SpdLogLogger(options?.name || generateUuid(), resource.fsPath, !options?.donotRotate, !!options?.donotUseFormatters, logLevel);
    }
    return super.doCreateLogger(resource, logLevel, options);
  }
  registerLogger(resource) {
    super.registerLogger(resource);
    this._proxy.$registerLogger(resource);
  }
  deregisterLogger(resource) {
    super.deregisterLogger(resource);
    this._proxy.$deregisterLogger(resource);
  }
}
export {
  ExtHostLoggerService
};
//# sourceMappingURL=extHostLoggerService.js.map
