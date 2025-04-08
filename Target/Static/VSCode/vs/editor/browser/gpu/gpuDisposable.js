var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isFunction } from "../../../base/common/types.js";
var GPULifecycle;
((GPULifecycle2) => {
  async function requestDevice(fallback) {
    try {
      if (!navigator.gpu) {
        throw new Error("This browser does not support WebGPU");
      }
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        throw new Error("This browser supports WebGPU but it appears to be disabled");
      }
      return wrapDestroyableInDisposable(await adapter.requestDevice());
    } catch (e) {
      if (fallback) {
        fallback(e.message);
      }
      throw e;
    }
  }
  GPULifecycle2.requestDevice = requestDevice;
  __name(requestDevice, "requestDevice");
  function createBuffer(device, descriptor, initialValues) {
    const buffer = device.createBuffer(descriptor);
    if (initialValues) {
      device.queue.writeBuffer(buffer, 0, isFunction(initialValues) ? initialValues() : initialValues);
    }
    return wrapDestroyableInDisposable(buffer);
  }
  GPULifecycle2.createBuffer = createBuffer;
  __name(createBuffer, "createBuffer");
  function createTexture(device, descriptor) {
    return wrapDestroyableInDisposable(device.createTexture(descriptor));
  }
  GPULifecycle2.createTexture = createTexture;
  __name(createTexture, "createTexture");
})(GPULifecycle || (GPULifecycle = {}));
function wrapDestroyableInDisposable(value) {
  return {
    object: value,
    dispose: /* @__PURE__ */ __name(() => value.destroy(), "dispose")
  };
}
__name(wrapDestroyableInDisposable, "wrapDestroyableInDisposable");
export {
  GPULifecycle
};
//# sourceMappingURL=gpuDisposable.js.map
