var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { TestSessionsBrowserMain } from "./web.test.js";
import { toDisposable } from "../../base/common/lifecycle.js";
import { mark } from "../../base/common/performance.js";
import { DeferredPromise } from "../../base/common/async.js";
const workbenchPromise = new DeferredPromise();
function create(domElement, options) {
  mark("code/didLoadWorkbenchMain");
  let instantiatedWorkbench = void 0;
  new TestSessionsBrowserMain(domElement, options).open().then((workbench) => {
    instantiatedWorkbench = workbench;
    workbenchPromise.complete(workbench);
  });
  return toDisposable(() => {
    if (instantiatedWorkbench) {
      instantiatedWorkbench.shutdown();
    } else {
      workbenchPromise.p.then((w) => w.shutdown());
    }
  });
}
__name(create, "create");
export {
  create
};
//# sourceMappingURL=web.test.factory.js.map
