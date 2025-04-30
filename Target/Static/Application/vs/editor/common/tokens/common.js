var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class RateLimiter {
  static {
    __name(this, "RateLimiter");
  }
  constructor(timesPerSecond = 5) {
    this.timesPerSecond = timesPerSecond;
    this._lastRun = 0;
    this._minimumTimeBetweenRuns = 1e3 / timesPerSecond;
  }
  runIfNotLimited(callback) {
    const now = Date.now();
    if (now - this._lastRun >= this._minimumTimeBetweenRuns) {
      this._lastRun = now;
      callback();
    }
  }
}
export {
  RateLimiter
};
//# sourceMappingURL=common.js.map
