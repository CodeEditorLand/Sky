var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { addDisposableListener } from "../../../../base/browser/dom.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
async function showBrowserToast(controller, options, token) {
  const toast = await triggerBrowserToast(options.title, {
    detail: options.body,
    sticky: !options.silent
  });
  if (!toast) {
    return { supported: false, clicked: false };
  }
  const disposables = new DisposableStore();
  controller.onDidCreateToast(toast);
  const cts = new CancellationTokenSource(token);
  disposables.add(toDisposable(() => {
    controller.onDidDisposeToast(toast);
    toast.dispose();
    cts.dispose(true);
  }));
  return new Promise((r) => {
    const resolve = /* @__PURE__ */ __name((result) => {
      r(result);
      disposables.dispose();
    }, "resolve");
    cts.token.onCancellationRequested(() => resolve({ supported: true, clicked: false }));
    Event.once(toast.onClick)(() => resolve({ supported: true, clicked: true }));
    Event.once(toast.onClose)(() => resolve({ supported: true, clicked: false }));
    Event.once(toast.onError)(() => resolve({ supported: false, clicked: false }));
  });
}
__name(showBrowserToast, "showBrowserToast");
async function triggerBrowserToast(message, options) {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return;
  }
  const disposables = new DisposableStore();
  const notification = new Notification(message, {
    body: options?.detail,
    requireInteraction: options?.sticky
  });
  const onClick = disposables.add(new Emitter());
  const onClose = disposables.add(new Emitter());
  const onError = disposables.add(new Emitter());
  disposables.add(addDisposableListener(notification, "click", () => onClick.fire()));
  disposables.add(addDisposableListener(notification, "close", () => onClose.fire()));
  disposables.add(addDisposableListener(notification, "error", () => onError.fire()));
  disposables.add(toDisposable(() => notification.close()));
  return {
    onClick: onClick.event,
    onClose: onClose.event,
    onError: onError.event,
    dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose")
  };
}
__name(triggerBrowserToast, "triggerBrowserToast");
export {
  showBrowserToast
};
//# sourceMappingURL=toasts.js.map
