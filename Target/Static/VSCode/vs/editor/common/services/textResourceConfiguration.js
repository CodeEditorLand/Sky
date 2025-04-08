import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { IPosition } from "../core/position.js";
import { ConfigurationTarget, IConfigurationValue } from "../../../platform/configuration/common/configuration.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
const ITextResourceConfigurationService = createDecorator("textResourceConfigurationService");
const ITextResourcePropertiesService = createDecorator("textResourcePropertiesService");
export {
  ITextResourceConfigurationService,
  ITextResourcePropertiesService
};
//# sourceMappingURL=textResourceConfiguration.js.map
