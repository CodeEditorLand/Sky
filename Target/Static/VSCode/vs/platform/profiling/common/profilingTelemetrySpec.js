var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ILogService } from "../../log/common/log.js";
import { BottomUpSample } from "./profilingModel.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { errorHandler } from "../../../base/common/errors.js";
function reportSample(data, telemetryService, logService, sendAsErrorTelemtry) {
  const { sample, perfBaseline, source } = data;
  telemetryService.publicLog2(`unresponsive.sample`, {
    perfBaseline,
    selfTime: sample.selfTime,
    totalTime: sample.totalTime,
    percentage: sample.percentage,
    functionName: sample.location,
    callers: sample.caller.map((c) => c.location).join("<"),
    callersAnnotated: sample.caller.map((c) => `${c.percentage}|${c.location}`).join("<"),
    source
  });
  const fakeError = new PerformanceError(data);
  if (sendAsErrorTelemtry) {
    errorHandler.onUnexpectedError(fakeError);
  } else {
    logService.error(fakeError);
  }
}
__name(reportSample, "reportSample");
class PerformanceError extends Error {
  static {
    __name(this, "PerformanceError");
  }
  selfTime;
  constructor(data) {
    if (Error.hasOwnProperty("stackTraceLimit")) {
      const Err = Error;
      const stackTraceLimit = Err.stackTraceLimit;
      Err.stackTraceLimit = 0;
      super(`PerfSampleError: by ${data.source} in ${data.sample.location}`);
      Err.stackTraceLimit = stackTraceLimit;
    } else {
      super(`PerfSampleError: by ${data.source} in ${data.sample.location}`);
    }
    this.name = "PerfSampleError";
    this.selfTime = data.sample.selfTime;
    const trace = [data.sample.absLocation, ...data.sample.caller.map((c) => c.absLocation)];
    this.stack = `
	 at ${trace.join("\n	 at ")}`;
  }
}
export {
  reportSample
};
//# sourceMappingURL=profilingTelemetrySpec.js.map
