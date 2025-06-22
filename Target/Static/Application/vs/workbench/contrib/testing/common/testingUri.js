var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../../base/common/assert.js";
import { URI } from "../../../../base/common/uri.js";
const TEST_DATA_SCHEME = "vscode-test-data";
var TestUriType;
(function(TestUriType2) {
  TestUriType2[TestUriType2["TaskOutput"] = 0] = "TaskOutput";
  TestUriType2[TestUriType2["TestOutput"] = 1] = "TestOutput";
  TestUriType2[TestUriType2["ResultMessage"] = 2] = "ResultMessage";
  TestUriType2[TestUriType2["ResultActualOutput"] = 3] = "ResultActualOutput";
  TestUriType2[TestUriType2["ResultExpectedOutput"] = 4] = "ResultExpectedOutput";
})(TestUriType || (TestUriType = {}));
var TestUriParts;
(function(TestUriParts2) {
  TestUriParts2["Results"] = "results";
  TestUriParts2["AllOutput"] = "output";
  TestUriParts2["Messages"] = "message";
  TestUriParts2["Text"] = "TestFailureMessage";
  TestUriParts2["ActualOutput"] = "ActualOutput";
  TestUriParts2["ExpectedOutput"] = "ExpectedOutput";
})(TestUriParts || (TestUriParts = {}));
const parseTestUri = /* @__PURE__ */ __name((uri) => {
  const type = uri.authority;
  const [resultId, ...request] = uri.path.slice(1).split("/");
  if (request[0] === "message") {
    const taskIndex = Number(request[1]);
    const testExtId = uri.query;
    const index = Number(request[2]);
    const part = request[3];
    if (type === "results") {
      switch (part) {
        case "TestFailureMessage":
          return {
            resultId,
            taskIndex,
            testExtId,
            messageIndex: index,
            type: 2
            /* TestUriType.ResultMessage */
          };
        case "ActualOutput":
          return {
            resultId,
            taskIndex,
            testExtId,
            messageIndex: index,
            type: 3
            /* TestUriType.ResultActualOutput */
          };
        case "ExpectedOutput":
          return {
            resultId,
            taskIndex,
            testExtId,
            messageIndex: index,
            type: 4
            /* TestUriType.ResultExpectedOutput */
          };
        case "message":
      }
    }
  }
  if (request[0] === "output") {
    const testExtId = uri.query;
    const taskIndex = Number(request[1]);
    return testExtId ? {
      resultId,
      taskIndex,
      testExtId,
      type: 1
      /* TestUriType.TestOutput */
    } : {
      resultId,
      taskIndex,
      type: 0
      /* TestUriType.TaskOutput */
    };
  }
  return void 0;
}, "parseTestUri");
const buildTestUri = /* @__PURE__ */ __name((parsed) => {
  const uriParts = {
    scheme: TEST_DATA_SCHEME,
    authority: "results"
    /* TestUriParts.Results */
  };
  if (parsed.type === 0) {
    return URI.from({
      ...uriParts,
      path: ["", parsed.resultId, "output", parsed.taskIndex].join("/")
    });
  }
  const msgRef = /* @__PURE__ */ __name((resultId, ...remaining) => URI.from({
    ...uriParts,
    query: parsed.testExtId,
    path: ["", resultId, "message", ...remaining].join("/")
  }), "msgRef");
  switch (parsed.type) {
    case 3:
      return msgRef(
        parsed.resultId,
        parsed.taskIndex,
        parsed.messageIndex,
        "ActualOutput"
        /* TestUriParts.ActualOutput */
      );
    case 4:
      return msgRef(
        parsed.resultId,
        parsed.taskIndex,
        parsed.messageIndex,
        "ExpectedOutput"
        /* TestUriParts.ExpectedOutput */
      );
    case 2:
      return msgRef(
        parsed.resultId,
        parsed.taskIndex,
        parsed.messageIndex,
        "TestFailureMessage"
        /* TestUriParts.Text */
      );
    case 1:
      return URI.from({
        ...uriParts,
        query: parsed.testExtId,
        path: ["", parsed.resultId, "output", parsed.taskIndex].join("/")
      });
    default:
      assertNever(parsed, "Invalid test uri");
  }
}, "buildTestUri");
export {
  TEST_DATA_SCHEME,
  TestUriType,
  buildTestUri,
  parseTestUri
};
//# sourceMappingURL=testingUri.js.map
