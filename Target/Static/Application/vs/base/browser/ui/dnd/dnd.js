var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { $ } from "../../dom.js";
import "./dnd.css";
function applyDragImage(event, container, label, extraClasses = []) {
  if (!event.dataTransfer) {
    return;
  }
  const dragImage = $(".monaco-drag-image");
  dragImage.textContent = label;
  dragImage.classList.add(...extraClasses);
  const getDragImageContainer = /* @__PURE__ */ __name((e) => {
    while (e && !e.classList.contains("monaco-workbench")) {
      e = e.parentElement;
    }
    return e || container.ownerDocument.body;
  }, "getDragImageContainer");
  const dragContainer = getDragImageContainer(container);
  dragContainer.appendChild(dragImage);
  event.dataTransfer.setDragImage(dragImage, -10, -10);
  setTimeout(() => dragImage.remove(), 0);
}
__name(applyDragImage, "applyDragImage");
export {
  applyDragImage
};
//# sourceMappingURL=dnd.js.map
