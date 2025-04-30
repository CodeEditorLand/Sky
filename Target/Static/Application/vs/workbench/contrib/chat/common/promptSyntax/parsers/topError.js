var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../nls.js";
import { assert } from "../../../../../../base/common/assert.js";
import { assertDefined } from "../../../../../../base/common/types.js";
import { OpenFailed, RecursiveReference, FailedToResolveContentsStream } from "../../promptFileReferenceErrors.js";
class TopError {
  static {
    __name(this, "TopError");
  }
  constructor(options) {
    this.options = options;
    this.originalError = options.originalError;
    this.errorSubject = options.errorSubject;
    this.errorsCount = options.errorsCount;
    this.parentUri = options.parentUri;
  }
  get localizedMessage() {
    const { originalError, parentUri, errorSubject: subject, errorsCount } = this;
    assert(errorsCount >= 1, `Error count must be at least 1, got '${errorsCount}'.`);
    const moreIssuesLabel = errorsCount > 1 ? localize("workbench.reusable-prompts.top-error.more-issues-label", "\n(+{0} more issues)", errorsCount - 1) : "";
    if (subject === "root") {
      if (originalError instanceof OpenFailed) {
        return localize("workbench.reusable-prompts.top-error.open-failed", "Cannot open '{0}'.{1}", originalError.uri.path, moreIssuesLabel);
      }
      if (originalError instanceof FailedToResolveContentsStream) {
        return localize("workbench.reusable-prompts.top-error.cannot-read", "Cannot read '{0}'.{1}", originalError.uri.path, moreIssuesLabel);
      }
      if (originalError instanceof RecursiveReference) {
        return localize("workbench.reusable-prompts.top-error.recursive-reference", "Recursion to itself.");
      }
      return originalError.message + moreIssuesLabel;
    }
    assertDefined(parentUri, "Parent URI must be defined for error of non-root link.");
    const errorMessageStart = subject === "child" ? localize("workbench.reusable-prompts.top-error.child.direct", "Contains") : localize("workbench.reusable-prompts.top-error.child.indirect", "Indirectly referenced prompt '{0}' contains", parentUri.path);
    const linkIssueName = originalError instanceof RecursiveReference ? localize("recursive", "recursive") : localize("broken", "broken");
    return localize("workbench.reusable-prompts.top-error.child.final-message", "{0} a {1} link to '{2}' that will be ignored.{3}", errorMessageStart, linkIssueName, originalError.uri.path, moreIssuesLabel);
  }
}
export {
  TopError
};
//# sourceMappingURL=topError.js.map
