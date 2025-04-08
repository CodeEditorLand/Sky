var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const performanceNow = globalThis.performance.now.bind(globalThis.performance);
class StopWatch {
  static {
    __name(this, "StopWatch");
  }
  _startTime;
  _stopTime;
  _now;
  static create(highResolution) {
    return new StopWatch(highResolution);
  }
  constructor(highResolution) {
    this._now = highResolution === false ? Date.now : performanceNow;
    this._startTime = this._now();
    this._stopTime = -1;
  }
  stop() {
    this._stopTime = this._now();
  }
  reset() {
    this._startTime = this._now();
    this._stopTime = -1;
  }
  elapsed() {
    if (this._stopTime !== -1) {
      return this._stopTime - this._startTime;
    }
    return this._now() - this._startTime;
  }
}
export {
  StopWatch
};
//# sourceMappingURL=stopwatch.js.map
