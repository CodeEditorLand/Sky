import { Event } from "../../../../base/common/event.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const INTERNAL_AUTH_PROVIDER_PREFIX = "__";
const IAuthenticationService = createDecorator("IAuthenticationService");
const IAuthenticationExtensionsService = createDecorator("IAuthenticationExtensionsService");
export {
  IAuthenticationExtensionsService,
  IAuthenticationService,
  INTERNAL_AUTH_PROVIDER_PREFIX
};
//# sourceMappingURL=authentication.js.map
