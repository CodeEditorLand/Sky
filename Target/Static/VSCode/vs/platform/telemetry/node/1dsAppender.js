var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { streamToBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IRequestOptions } from "../../../base/parts/request/common/request.js";
import { IRequestService } from "../../request/common/request.js";
import * as https from "https";
import { AbstractOneDataSystemAppender, IAppInsightsCore } from "../common/1dsAppender.js";
async function makeTelemetryRequest(options, requestService) {
  const response = await requestService.request(options, CancellationToken.None);
  const responseData = (await streamToBuffer(response.stream)).toString();
  const statusCode = response.res.statusCode ?? 200;
  const headers = response.res.headers;
  return {
    headers,
    statusCode,
    responseData
  };
}
__name(makeTelemetryRequest, "makeTelemetryRequest");
async function makeLegacyTelemetryRequest(options) {
  const httpsOptions = {
    method: options.type,
    headers: options.headers
  };
  const responsePromise = new Promise((resolve, reject) => {
    const req = https.request(options.url ?? "", httpsOptions, (res) => {
      res.on("data", function(responseData) {
        resolve({
          headers: res.headers,
          statusCode: res.statusCode ?? 200,
          responseData: responseData.toString()
        });
      });
      res.on("error", function(err) {
        reject(err);
      });
    });
    req.write(options.data, (err) => {
      if (err) {
        reject(err);
      }
    });
    req.end();
  });
  return responsePromise;
}
__name(makeLegacyTelemetryRequest, "makeLegacyTelemetryRequest");
async function sendPostAsync(requestService, payload, oncomplete) {
  const telemetryRequestData = typeof payload.data === "string" ? payload.data : new TextDecoder().decode(payload.data);
  const requestOptions = {
    type: "POST",
    headers: {
      ...payload.headers,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload.data).toString()
    },
    url: payload.urlString,
    data: telemetryRequestData
  };
  try {
    const responseData = requestService ? await makeTelemetryRequest(requestOptions, requestService) : await makeLegacyTelemetryRequest(requestOptions);
    oncomplete(responseData.statusCode, responseData.headers, responseData.responseData);
  } catch {
    oncomplete(0, {});
  }
}
__name(sendPostAsync, "sendPostAsync");
class OneDataSystemAppender extends AbstractOneDataSystemAppender {
  static {
    __name(this, "OneDataSystemAppender");
  }
  constructor(requestService, isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory) {
    const customHttpXHROverride = {
      sendPOST: /* @__PURE__ */ __name((payload, oncomplete) => {
        sendPostAsync(requestService, payload, oncomplete);
      }, "sendPOST")
    };
    super(isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory, customHttpXHROverride);
  }
}
export {
  OneDataSystemAppender
};
//# sourceMappingURL=1dsAppender.js.map
