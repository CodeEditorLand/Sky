var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../instantiation/common/instantiation.js";
var RecommendationSource;
(function(RecommendationSource2) {
  RecommendationSource2[RecommendationSource2["FILE"] = 1] = "FILE";
  RecommendationSource2[RecommendationSource2["WORKSPACE"] = 2] = "WORKSPACE";
  RecommendationSource2[RecommendationSource2["EXE"] = 3] = "EXE";
})(RecommendationSource || (RecommendationSource = {}));
function RecommendationSourceToString(source) {
  switch (source) {
    case 1:
      return "file";
    case 2:
      return "workspace";
    case 3:
      return "exe";
  }
}
__name(RecommendationSourceToString, "RecommendationSourceToString");
var RecommendationsNotificationResult;
(function(RecommendationsNotificationResult2) {
  RecommendationsNotificationResult2["Ignored"] = "ignored";
  RecommendationsNotificationResult2["Cancelled"] = "cancelled";
  RecommendationsNotificationResult2["TooMany"] = "toomany";
  RecommendationsNotificationResult2["IncompatibleWindow"] = "incompatibleWindow";
  RecommendationsNotificationResult2["Accepted"] = "reacted";
})(RecommendationsNotificationResult || (RecommendationsNotificationResult = {}));
const IExtensionRecommendationNotificationService = createDecorator("IExtensionRecommendationNotificationService");
export {
  IExtensionRecommendationNotificationService,
  RecommendationSource,
  RecommendationSourceToString,
  RecommendationsNotificationResult
};
//# sourceMappingURL=extensionRecommendations.js.map
