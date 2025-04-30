var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { randomPath } from "../../../base/common/extpath.js";
function createWaitMarkerFileSync(verbose) {
  const randomWaitMarkerPath = randomPath(tmpdir());
  try {
    writeFileSync(randomWaitMarkerPath, "");
    if (verbose) {
      console.log(`Marker file for --wait created: ${randomWaitMarkerPath}`);
    }
    return randomWaitMarkerPath;
  } catch (err) {
    if (verbose) {
      console.error(`Failed to create marker file for --wait: ${err}`);
    }
    return void 0;
  }
}
__name(createWaitMarkerFileSync, "createWaitMarkerFileSync");
export {
  createWaitMarkerFileSync
};
//# sourceMappingURL=wait.js.map
