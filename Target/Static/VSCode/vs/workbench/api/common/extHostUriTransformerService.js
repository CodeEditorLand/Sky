var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IURITransformer } from "../../../base/common/uriIpc.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
const IURITransformerService = createDecorator("IURITransformerService");
class URITransformerService {
  static {
    __name(this, "URITransformerService");
  }
  transformIncoming;
  transformOutgoing;
  transformOutgoingURI;
  transformOutgoingScheme;
  constructor(delegate) {
    if (!delegate) {
      this.transformIncoming = (arg) => arg;
      this.transformOutgoing = (arg) => arg;
      this.transformOutgoingURI = (arg) => arg;
      this.transformOutgoingScheme = (arg) => arg;
    } else {
      this.transformIncoming = delegate.transformIncoming.bind(delegate);
      this.transformOutgoing = delegate.transformOutgoing.bind(delegate);
      this.transformOutgoingURI = delegate.transformOutgoingURI.bind(delegate);
      this.transformOutgoingScheme = delegate.transformOutgoingScheme.bind(delegate);
    }
  }
}
export {
  IURITransformerService,
  URITransformerService
};
//# sourceMappingURL=extHostUriTransformerService.js.map
