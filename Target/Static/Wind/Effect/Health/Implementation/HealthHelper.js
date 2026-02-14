var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const CreateServiceHealth = /* @__PURE__ */ __name((Name, Status, Message, ResponseTime, Details) => ({
  serviceName: Name,
  status: Status,
  message: Message,
  lastChecked: Date.now(),
  responseTime: ResponseTime,
  ...Details !== void 0 ? { details: Details } : {}
}), "CreateServiceHealth");
const CreateServiceHealthWithNoResponseTime = /* @__PURE__ */ __name((Name, Status, Message) => ({
  serviceName: Name,
  status: Status,
  message: Message,
  lastChecked: Date.now(),
  responseTime: 0
}), "CreateServiceHealthWithNoResponseTime");
var HealthHelper_default = { CreateServiceHealth, CreateServiceHealthWithNoResponseTime };
export {
  CreateServiceHealth,
  CreateServiceHealthWithNoResponseTime,
  HealthHelper_default as default
};
//# sourceMappingURL=HealthHelper.js.map
