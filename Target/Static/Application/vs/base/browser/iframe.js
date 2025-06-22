var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const sameOriginWindowChainCache = /* @__PURE__ */ new WeakMap();
function getParentWindowIfSameOrigin(w) {
  if (!w.parent || w.parent === w) {
    return null;
  }
  try {
    const location = w.location;
    const parentLocation = w.parent.location;
    if (location.origin !== "null" && parentLocation.origin !== "null" && location.origin !== parentLocation.origin) {
      return null;
    }
  } catch (e) {
    return null;
  }
  return w.parent;
}
__name(getParentWindowIfSameOrigin, "getParentWindowIfSameOrigin");
class IframeUtils {
  static {
    __name(this, "IframeUtils");
  }
  /**
   * Returns a chain of embedded windows with the same origin (which can be accessed programmatically).
   * Having a chain of length 1 might mean that the current execution environment is running outside of an iframe or inside an iframe embedded in a window with a different origin.
   */
  static getSameOriginWindowChain(targetWindow) {
    let windowChainCache = sameOriginWindowChainCache.get(targetWindow);
    if (!windowChainCache) {
      windowChainCache = [];
      sameOriginWindowChainCache.set(targetWindow, windowChainCache);
      let w = targetWindow;
      let parent;
      do {
        parent = getParentWindowIfSameOrigin(w);
        if (parent) {
          windowChainCache.push({
            window: new WeakRef(w),
            iframeElement: w.frameElement || null
          });
        } else {
          windowChainCache.push({
            window: new WeakRef(w),
            iframeElement: null
          });
        }
        w = parent;
      } while (w);
    }
    return windowChainCache.slice(0);
  }
  /**
   * Returns the position of `childWindow` relative to `ancestorWindow`
   */
  static getPositionOfChildWindowRelativeToAncestorWindow(childWindow, ancestorWindow) {
    if (!ancestorWindow || childWindow === ancestorWindow) {
      return {
        top: 0,
        left: 0
      };
    }
    let top = 0, left = 0;
    const windowChain = this.getSameOriginWindowChain(childWindow);
    for (const windowChainEl of windowChain) {
      const windowInChain = windowChainEl.window.deref();
      top += windowInChain?.scrollY ?? 0;
      left += windowInChain?.scrollX ?? 0;
      if (windowInChain === ancestorWindow) {
        break;
      }
      if (!windowChainEl.iframeElement) {
        break;
      }
      const boundingRect = windowChainEl.iframeElement.getBoundingClientRect();
      top += boundingRect.top;
      left += boundingRect.left;
    }
    return {
      top,
      left
    };
  }
}
async function parentOriginHash(parentOrigin, salt) {
  if (!crypto.subtle) {
    throw new Error(`'crypto.subtle' is not available so webviews will not work. This is likely because the editor is not running in a secure context (https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).`);
  }
  const strData = JSON.stringify({ parentOrigin, salt });
  const encoder = new TextEncoder();
  const arrData = encoder.encode(strData);
  const hash = await crypto.subtle.digest("sha-256", arrData);
  return sha256AsBase32(hash);
}
__name(parentOriginHash, "parentOriginHash");
function sha256AsBase32(bytes) {
  const array = Array.from(new Uint8Array(bytes));
  const hexArray = array.map((b) => b.toString(16).padStart(2, "0")).join("");
  return BigInt(`0x${hexArray}`).toString(32).padStart(52, "0");
}
__name(sha256AsBase32, "sha256AsBase32");
export {
  IframeUtils,
  parentOriginHash
};
//# sourceMappingURL=iframe.js.map
