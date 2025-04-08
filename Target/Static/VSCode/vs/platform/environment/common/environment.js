import { URI } from "../../../base/common/uri.js";
import { NativeParsedArgs } from "./argv.js";
import { createDecorator, refineServiceDecorator } from "../../instantiation/common/instantiation.js";
const IEnvironmentService = createDecorator("environmentService");
const INativeEnvironmentService = refineServiceDecorator(IEnvironmentService);
export {
  IEnvironmentService,
  INativeEnvironmentService
};
//# sourceMappingURL=environment.js.map
