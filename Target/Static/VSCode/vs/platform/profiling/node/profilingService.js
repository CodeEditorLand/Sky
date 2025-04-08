var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { generateUuid } from "../../../base/common/uuid.js";
import { IV8InspectProfilingService, IV8Profile } from "../common/profiling.js";
class InspectProfilingService {
  static {
    __name(this, "InspectProfilingService");
  }
  _serviceBrand;
  _sessions = /* @__PURE__ */ new Map();
  async startProfiling(options) {
    const prof = await import("v8-inspect-profiler");
    const session = await prof.startProfiling({ host: options.host, port: options.port, checkForPaused: true });
    const id = generateUuid();
    this._sessions.set(id, session);
    return id;
  }
  async stopProfiling(sessionId) {
    const session = this._sessions.get(sessionId);
    if (!session) {
      throw new Error(`UNKNOWN session '${sessionId}'`);
    }
    const result = await session.stop();
    this._sessions.delete(sessionId);
    return result.profile;
  }
}
export {
  InspectProfilingService
};
//# sourceMappingURL=profilingService.js.map
