import { Effect } from "../../effect";
import { Schemas } from "vs/base/common/network.js";
import { FileService } from "vs/platform/files/common/fileService.js";
import { Log } from "../Log.js";
const Definition = Effect.gen(function* (_) {
  const LogService = yield* _(Log.Tag);
  const FileSystemProviderInstance = yield* _(FileSystemProvider.Tag);
  const ServiceInstance = new FileService(LogService);
  ServiceInstance.registerProvider(Schemas.file, FileSystemProviderInstance);
  return ServiceInstance;
});
var Definition_default = Definition;
export {
  Definition_default as default
};
//# sourceMappingURL=Definition.js.map
