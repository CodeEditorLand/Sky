var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../dom.js";
import "./aria.css";
const MAX_MESSAGE_LENGTH = 2e4;
let ariaContainer;
let alertContainer;
let alertContainer2;
let statusContainer;
let statusContainer2;
function setARIAContainer(parent) {
  ariaContainer = document.createElement("div");
  ariaContainer.className = "monaco-aria-container";
  const createAlertContainer = /* @__PURE__ */ __name(() => {
    const element = document.createElement("div");
    element.className = "monaco-alert";
    element.setAttribute("role", "alert");
    element.setAttribute("aria-atomic", "true");
    ariaContainer.appendChild(element);
    return element;
  }, "createAlertContainer");
  alertContainer = createAlertContainer();
  alertContainer2 = createAlertContainer();
  const createStatusContainer = /* @__PURE__ */ __name(() => {
    const element = document.createElement("div");
    element.className = "monaco-status";
    element.setAttribute("aria-live", "polite");
    element.setAttribute("aria-atomic", "true");
    ariaContainer.appendChild(element);
    return element;
  }, "createStatusContainer");
  statusContainer = createStatusContainer();
  statusContainer2 = createStatusContainer();
  parent.appendChild(ariaContainer);
}
__name(setARIAContainer, "setARIAContainer");
function alert(msg) {
  if (!ariaContainer) {
    return;
  }
  if (alertContainer.textContent !== msg) {
    dom.clearNode(alertContainer2);
    insertMessage(alertContainer, msg);
  } else {
    dom.clearNode(alertContainer);
    insertMessage(alertContainer2, msg);
  }
}
__name(alert, "alert");
function status(msg) {
  if (!ariaContainer) {
    return;
  }
  if (statusContainer.textContent !== msg) {
    dom.clearNode(statusContainer2);
    insertMessage(statusContainer, msg);
  } else {
    dom.clearNode(statusContainer);
    insertMessage(statusContainer2, msg);
  }
}
__name(status, "status");
function insertMessage(target, msg) {
  dom.clearNode(target);
  if (msg.length > MAX_MESSAGE_LENGTH) {
    msg = msg.substr(0, MAX_MESSAGE_LENGTH);
  }
  target.textContent = msg;
  target.style.visibility = "hidden";
  target.style.visibility = "visible";
}
__name(insertMessage, "insertMessage");
export {
  alert,
  setARIAContainer,
  status
};
//# sourceMappingURL=aria.js.map
