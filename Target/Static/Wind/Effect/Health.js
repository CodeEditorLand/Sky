import { HealthTag } from "./Health/index.js";
import {
  CreateServiceHealth,
  CreateServiceHealthWithNoResponseTime
} from "./Health/index.js";
import { HealthLive as LiveLayer, HealthMock as MockLayer } from "./Health/Implementation/HealthImplementation.js";
const HealthLive = LiveLayer;
const HealthMock = MockLayer;
export {
  CreateServiceHealth,
  CreateServiceHealthWithNoResponseTime,
  HealthLive,
  HealthMock,
  HealthTag,
  LiveLayer,
  MockLayer
};
//# sourceMappingURL=Health.js.map
