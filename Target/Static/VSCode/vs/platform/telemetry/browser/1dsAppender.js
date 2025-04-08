var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AbstractOneDataSystemAppender, IAppInsightsCore } from "../common/1dsAppender.js";
class OneDataSystemWebAppender extends AbstractOneDataSystemAppender {
  static {
    __name(this, "OneDataSystemWebAppender");
  }
  constructor(isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory) {
    super(isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory);
    fetch(this.endPointHealthUrl, { method: "GET" }).catch((err) => {
      this._aiCoreOrKey = void 0;
    });
  }
}
export {
  OneDataSystemWebAppender
};
//# sourceMappingURL=1dsAppender.js.map
