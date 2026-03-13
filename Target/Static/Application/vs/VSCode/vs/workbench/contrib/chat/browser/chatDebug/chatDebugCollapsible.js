var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as DOM from "../../../../../base/browser/dom.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
const $ = DOM.$;
function setupCollapsibleToggle(chevron, header, contentEl, disposables, initiallyCollapsed = false) {
  let collapsed = initiallyCollapsed;
  header.tabIndex = 0;
  header.role = "button";
  chevron.setAttribute("aria-hidden", "true");
  const updateState = /* @__PURE__ */ __name(() => {
    DOM.clearNode(chevron);
    const icon = collapsed ? Codicon.chevronRight : Codicon.chevronDown;
    chevron.classList.add(...ThemeIcon.asClassName(icon).split(" "));
    contentEl.style.display = collapsed ? "none" : "block";
    header.style.borderRadius = collapsed ? "" : "3px 3px 0 0";
    header.setAttribute("aria-expanded", String(!collapsed));
  }, "updateState");
  updateState();
  disposables.add(DOM.addDisposableListener(header, DOM.EventType.CLICK, () => {
    collapsed = !collapsed;
    chevron.className = "chat-debug-message-section-chevron";
    updateState();
  }));
  disposables.add(DOM.addDisposableListener(header, DOM.EventType.KEY_DOWN, (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      header.click();
    }
  }));
}
__name(setupCollapsibleToggle, "setupCollapsibleToggle");
function renderCollapsibleSection(parent, section, disposables, initiallyCollapsed = false) {
  const sectionEl = DOM.append(parent, $("div.chat-debug-message-section"));
  const header = DOM.append(sectionEl, $("div.chat-debug-message-section-header"));
  const chevron = DOM.append(header, $(`span.chat-debug-message-section-chevron`));
  DOM.append(header, $("span.chat-debug-message-section-title", void 0, section.name));
  const contentEl = $("pre.chat-debug-message-section-content");
  contentEl.textContent = section.content;
  contentEl.tabIndex = 0;
  const wrapper = DOM.append(sectionEl, $("div.chat-debug-message-section-content-wrapper"));
  wrapper.appendChild(contentEl);
  setupCollapsibleToggle(chevron, header, wrapper, disposables, initiallyCollapsed);
}
__name(renderCollapsibleSection, "renderCollapsibleSection");
export {
  renderCollapsibleSection,
  setupCollapsibleToggle
};
//# sourceMappingURL=chatDebugCollapsible.js.map
