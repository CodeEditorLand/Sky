var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ITerminalInstance } from "./terminal.js";
import { DynamicListEventMultiplexer, Event, EventMultiplexer, IDynamicListEventMultiplexer } from "../../../../base/common/event.js";
import { DisposableMap, DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { ITerminalCapabilityImplMap, TerminalCapability } from "../../../../platform/terminal/common/capabilities/capabilities.js";
function createInstanceCapabilityEventMultiplexer(currentInstances, onAddInstance, onRemoveInstance, capabilityId, getEvent) {
  const store = new DisposableStore();
  const multiplexer = store.add(new EventMultiplexer());
  const capabilityListeners = store.add(new DisposableMap());
  function addCapability(instance, capability) {
    const listener = multiplexer.add(Event.map(getEvent(capability), (data) => ({ instance, data })));
    let instanceCapabilityListeners = capabilityListeners.get(instance.instanceId);
    if (!instanceCapabilityListeners) {
      instanceCapabilityListeners = new DisposableMap();
      capabilityListeners.set(instance.instanceId, instanceCapabilityListeners);
    }
    instanceCapabilityListeners.set(capability, listener);
  }
  __name(addCapability, "addCapability");
  for (const instance of currentInstances) {
    const capability = instance.capabilities.get(capabilityId);
    if (capability) {
      addCapability(instance, capability);
    }
  }
  store.add(onRemoveInstance((instance) => {
    capabilityListeners.deleteAndDispose(instance.instanceId);
  }));
  const addCapabilityMultiplexer = store.add(new DynamicListEventMultiplexer(
    currentInstances,
    onAddInstance,
    onRemoveInstance,
    (instance) => Event.map(instance.capabilities.onDidAddCapability, (changeEvent) => ({ instance, changeEvent }))
  ));
  store.add(addCapabilityMultiplexer.event((e) => {
    if (e.changeEvent.id === capabilityId) {
      addCapability(e.instance, e.changeEvent.capability);
    }
  }));
  const removeCapabilityMultiplexer = store.add(new DynamicListEventMultiplexer(
    currentInstances,
    onAddInstance,
    onRemoveInstance,
    (instance) => Event.map(instance.capabilities.onDidRemoveCapability, (changeEvent) => ({ instance, changeEvent }))
  ));
  store.add(removeCapabilityMultiplexer.event((e) => {
    if (e.changeEvent.id === capabilityId) {
      capabilityListeners.get(e.instance.instanceId)?.deleteAndDispose(e.changeEvent.id);
    }
  }));
  return {
    dispose: /* @__PURE__ */ __name(() => store.dispose(), "dispose"),
    event: multiplexer.event
  };
}
__name(createInstanceCapabilityEventMultiplexer, "createInstanceCapabilityEventMultiplexer");
export {
  createInstanceCapabilityEventMultiplexer
};
//# sourceMappingURL=terminalEvents.js.map
