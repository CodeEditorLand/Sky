var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "../widget/chatContentParts/media/chatInlineAnchorWidget.css";
import * as DOM from "../../../../../base/browser/dom.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { getDefaultHoverDelegate } from "../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { dirname } from "../../../../../base/common/resources.js";
import { getIconClasses } from "../../../../../editor/common/services/getIconClasses.js";
import { localize } from "../../../../../nls.js";
import { FileKind } from "../../../../../platform/files/common/files.js";
import { InlineAnchorWidget } from "../widget/chatContentParts/chatInlineAnchorWidget.js";
import { setupCollapsibleToggle } from "./chatDebugCollapsible.js";
const $ = DOM.$;
function getSettingsKeyForDiscoveryType(discoveryType) {
  switch (discoveryType) {
    case "prompt":
      return "chat.promptFilesLocations";
    case "instructions":
      return "chat.instructionsFilesLocations";
    case "agent":
      return "chat.agentFilesLocations";
    case "skill":
      return "chat.agentSkillsLocations";
    case "hook":
      return "chat.hookFilesLocations";
    default:
      return void 0;
  }
}
__name(getSettingsKeyForDiscoveryType, "getSettingsKeyForDiscoveryType");
function getFileLocationLabel(file, labelService, discoveryType) {
  if (file.extensionId) {
    return file.extensionId;
  }
  const parentDir = discoveryType === "skill" ? dirname(dirname(file.uri)) : dirname(file.uri);
  return labelService.getUriLabel(parentDir, { relative: true });
}
__name(getFileLocationLabel, "getFileLocationLabel");
function createInlineFileLink(uri, displayText, fileKind, openerService, modelService, languageService, hoverService, labelService, disposables, hoverSuffix) {
  const link = $(`a.${InlineAnchorWidget.className}.show-file-icons`);
  link.tabIndex = -1;
  const iconEl = DOM.append(link, $("span.icon"));
  const iconClasses = getIconClasses(modelService, languageService, uri, fileKind);
  iconEl.classList.add(...iconClasses);
  DOM.append(link, $("span.icon-label", void 0, displayText));
  const relativeLabel = labelService.getUriLabel(uri, { relative: true });
  const hoverText = hoverSuffix ? `${relativeLabel} ${hoverSuffix}` : relativeLabel;
  disposables.add(hoverService.setupManagedHover(getDefaultHoverDelegate("element"), link, hoverText));
  disposables.add(DOM.addDisposableListener(link, DOM.EventType.CLICK, (e) => {
    e.preventDefault();
    e.stopPropagation();
    openerService.open(uri);
  }));
  return link;
}
__name(createInlineFileLink, "createInlineFileLink");
function setupFileListNavigation(listEl, rows, disposables) {
  if (rows.length === 0) {
    return;
  }
  for (let i = 0; i < rows.length; i++) {
    rows[i].element.tabIndex = i === 0 ? 0 : -1;
    rows[i].element.setAttribute("role", "listitem");
  }
  disposables.add(DOM.addDisposableListener(listEl, DOM.EventType.KEY_DOWN, (e) => {
    const target = e.target;
    const index = rows.findIndex((r) => r.element === target);
    if (index === -1) {
      return;
    }
    let nextIndex;
    switch (e.key) {
      case "ArrowDown":
        nextIndex = Math.min(index + 1, rows.length - 1);
        break;
      case "ArrowUp":
        nextIndex = Math.max(index - 1, 0);
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = rows.length - 1;
        break;
      case "Enter": {
        rows[index].activate();
        e.preventDefault();
        return;
      }
    }
    if (nextIndex !== void 0 && nextIndex !== index) {
      e.preventDefault();
      rows[index].element.tabIndex = -1;
      rows[nextIndex].element.tabIndex = 0;
      rows[nextIndex].element.focus();
    }
  }));
}
__name(setupFileListNavigation, "setupFileListNavigation");
function renderCustomizationDiscoveryContent(content, openerService, modelService, languageService, hoverService, labelService) {
  const disposables = new DisposableStore();
  const container = $("div.chat-debug-file-list");
  container.tabIndex = 0;
  const capitalizedType = content.discoveryType.charAt(0).toUpperCase() + content.discoveryType.slice(1);
  DOM.append(container, $("div.chat-debug-file-list-title", void 0, localize("chatDebug.discoveryResults", "{0} Discovery Results", capitalizedType)));
  DOM.append(container, $("div.chat-debug-file-list-summary", void 0, localize("chatDebug.totalFiles", "Total files: {0}", content.files.length)));
  const loaded = content.files.filter((f) => f.status === "loaded");
  if (loaded.length > 0) {
    const section = DOM.append(container, $("div.chat-debug-file-list-section"));
    DOM.append(section, $("div.chat-debug-file-list-section-title", void 0, localize("chatDebug.loadedFiles", "Loaded ({0})", loaded.length)));
    const groups = /* @__PURE__ */ new Map();
    for (const file of loaded) {
      const key = getFileLocationLabel(file, labelService, content.discoveryType);
      let group = groups.get(key);
      if (!group) {
        group = [];
        groups.set(key, group);
      }
      group.push(file);
    }
    const listEl = DOM.append(section, $("div.chat-debug-file-list-rows"));
    listEl.setAttribute("role", "list");
    listEl.setAttribute("aria-label", localize("chatDebug.loadedFilesList", "Loaded files"));
    const rows = [];
    for (const [locationLabel, files] of groups) {
      const groupHeader = DOM.append(listEl, $("div.chat-debug-file-list-group-header"));
      const firstFile = files[0];
      if (firstFile.extensionId) {
        const link = DOM.append(groupHeader, $("a.chat-debug-file-list-group-label.chat-debug-file-list-badge-link"));
        link.textContent = locationLabel;
        link.tabIndex = -1;
        disposables.add(hoverService.setupManagedHover(getDefaultHoverDelegate("element"), link, localize("chatDebug.openExtension", "Open {0} in Extensions", firstFile.extensionId)));
        disposables.add(DOM.addDisposableListener(link, DOM.EventType.CLICK, (e) => {
          e.preventDefault();
          e.stopPropagation();
          openerService.open(URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([firstFile.extensionId]))}`), { allowCommands: true });
        }));
      } else {
        DOM.append(groupHeader, $("span.chat-debug-file-list-group-label", void 0, locationLabel));
      }
      for (const file of files) {
        const row = DOM.append(listEl, $("div.chat-debug-file-list-row"));
        DOM.append(row, $(`span.chat-debug-file-list-icon${ThemeIcon.asCSSSelector(Codicon.check)}`));
        row.appendChild(createInlineFileLink(file.uri, file.name ?? file.uri.path, FileKind.FILE, openerService, modelService, languageService, hoverService, labelService, disposables));
        const relativeLabel = labelService.getUriLabel(file.uri, { relative: true });
        row.setAttribute("aria-label", relativeLabel);
        const uri = file.uri;
        rows.push({ element: row, activate: /* @__PURE__ */ __name(() => openerService.open(uri), "activate") });
      }
    }
    setupFileListNavigation(listEl, rows, disposables);
  }
  const skipped = content.files.filter((f) => f.status === "skipped");
  if (skipped.length > 0) {
    const section = DOM.append(container, $("div.chat-debug-file-list-section"));
    DOM.append(section, $("div.chat-debug-file-list-section-title", void 0, localize("chatDebug.skippedFiles", "Skipped ({0})", skipped.length)));
    const groups = /* @__PURE__ */ new Map();
    for (const file of skipped) {
      const key = file.skipReason ?? localize("chatDebug.unknown", "unknown");
      let group = groups.get(key);
      if (!group) {
        group = [];
        groups.set(key, group);
      }
      group.push(file);
    }
    const listEl = DOM.append(section, $("div.chat-debug-file-list-rows"));
    listEl.setAttribute("role", "list");
    listEl.setAttribute("aria-label", localize("chatDebug.skippedFilesList", "Skipped files"));
    const rows = [];
    for (const [reasonLabel, files] of groups) {
      const groupHeader = DOM.append(listEl, $("div.chat-debug-file-list-group-header"));
      DOM.append(groupHeader, $("span.chat-debug-file-list-group-label", void 0, reasonLabel));
      for (const file of files) {
        const row = DOM.append(listEl, $("div.chat-debug-file-list-row"));
        DOM.append(row, $(`span.chat-debug-file-list-icon${ThemeIcon.asCSSSelector(Codicon.close)}`));
        let detail = "";
        if (file.errorMessage) {
          detail += file.errorMessage;
        }
        if (file.duplicateOf) {
          if (detail) {
            detail += ", ";
          }
          detail += localize("chatDebug.duplicateOf", "duplicate of {0}", file.duplicateOf.path);
        }
        row.appendChild(createInlineFileLink(file.uri, file.name ?? file.uri.path, FileKind.FILE, openerService, modelService, languageService, hoverService, labelService, disposables));
        if (detail) {
          DOM.append(row, $("span.chat-debug-file-list-detail", void 0, ` (${detail})`));
        }
        const relativeLabel = labelService.getUriLabel(file.uri, { relative: true });
        row.setAttribute("aria-label", relativeLabel);
        const uri = file.uri;
        rows.push({ element: row, activate: /* @__PURE__ */ __name(() => openerService.open(uri), "activate") });
      }
    }
    setupFileListNavigation(listEl, rows, disposables);
  }
  if (content.sourceFolders && content.sourceFolders.length > 0) {
    const sectionEl = DOM.append(container, $("div.chat-debug-message-section"));
    const header = DOM.append(sectionEl, $("div.chat-debug-message-section-header"));
    const chevron = DOM.append(header, $("span.chat-debug-message-section-chevron"));
    DOM.append(header, $("span.chat-debug-message-section-title", void 0, localize("chatDebug.sourceFolders", "Sources ({0})", content.sourceFolders.length)));
    const settingsKey = getSettingsKeyForDiscoveryType(content.discoveryType);
    if (settingsKey) {
      const gearBtn = disposables.add(new Button(header, {
        title: localize("chatDebug.openSettingsTooltip", "Configure locations"),
        ariaLabel: localize("chatDebug.configureLocations", "Configure locations"),
        hoverDelegate: getDefaultHoverDelegate("mouse")
      }));
      gearBtn.icon = Codicon.settingsGear;
      gearBtn.element.classList.add("chat-debug-settings-gear");
      disposables.add(DOM.addDisposableListener(gearBtn.element, DOM.EventType.MOUSE_ENTER, () => {
        header.classList.add("chat-debug-settings-gear-header-passthrough");
      }));
      disposables.add(DOM.addDisposableListener(gearBtn.element, DOM.EventType.MOUSE_LEAVE, () => {
        header.classList.remove("chat-debug-settings-gear-header-passthrough");
      }));
      disposables.add(gearBtn.onDidClick((e) => {
        if (e) {
          DOM.EventHelper.stop(e, true);
        }
        openerService.open(URI.parse(`command:workbench.action.openSettings?${encodeURIComponent(JSON.stringify([`@id:${settingsKey}`]))}`), { allowCommands: true });
      }));
    }
    const contentEl = DOM.append(sectionEl, $("div.chat-debug-source-folder-content"));
    contentEl.tabIndex = 0;
    contentEl.setAttribute("role", "region");
    contentEl.setAttribute("aria-label", localize("chatDebug.sourceFoldersContent", "Source folders"));
    const capitalizedType2 = content.discoveryType.charAt(0).toUpperCase() + content.discoveryType.slice(1);
    const sourcesCaption = capitalizedType2.endsWith("s") ? capitalizedType2 : capitalizedType2 + "s";
    DOM.append(contentEl, $("div.chat-debug-source-folder-note", void 0, localize("chatDebug.sourcesNote", "{0} were discovered by checking the following sources in order:", sourcesCaption)));
    for (let i = 0; i < content.sourceFolders.length; i++) {
      const folder = content.sourceFolders[i];
      const row = DOM.append(contentEl, $("div.chat-debug-source-folder-row"));
      DOM.append(row, $("span.chat-debug-source-folder-index", void 0, `${i + 1}.`));
      DOM.append(row, $("span.chat-debug-source-folder-label", void 0, folder.uri.path));
    }
    setupCollapsibleToggle(
      chevron,
      header,
      contentEl,
      disposables,
      /* initiallyCollapsed */
      true
    );
  }
  return { element: container, disposables };
}
__name(renderCustomizationDiscoveryContent, "renderCustomizationDiscoveryContent");
function fileListToPlainText(content) {
  const lines = [];
  const capitalizedType = content.discoveryType.charAt(0).toUpperCase() + content.discoveryType.slice(1);
  lines.push(localize("chatDebug.plainText.discoveryResults", "{0} Discovery Results", capitalizedType));
  lines.push(localize("chatDebug.plainText.totalFiles", "Total files: {0}", content.files.length));
  lines.push("");
  const loaded = content.files.filter((f) => f.status === "loaded");
  const skipped = content.files.filter((f) => f.status === "skipped");
  if (loaded.length > 0) {
    lines.push(localize("chatDebug.plainText.loaded", "Loaded ({0})", loaded.length));
    const groups = /* @__PURE__ */ new Map();
    for (const f of loaded) {
      const parentDir = content.discoveryType === "skill" ? dirname(dirname(f.uri)) : dirname(f.uri);
      const key = f.extensionId ?? parentDir.path;
      let group = groups.get(key);
      if (!group) {
        group = [];
        groups.set(key, group);
      }
      group.push(f);
    }
    for (const [locationLabel, files] of groups) {
      lines.push(`  ${locationLabel}`);
      for (const f of files) {
        const label = f.name ?? f.uri.path;
        lines.push(`    \u2713 ${label}`);
      }
    }
    lines.push("");
  }
  if (skipped.length > 0) {
    lines.push(localize("chatDebug.plainText.skipped", "Skipped ({0})", skipped.length));
    const skippedGroups = /* @__PURE__ */ new Map();
    for (const f of skipped) {
      const key = f.skipReason ?? localize("chatDebug.plainText.unknown", "unknown");
      let group = skippedGroups.get(key);
      if (!group) {
        group = [];
        skippedGroups.set(key, group);
      }
      group.push(f);
    }
    for (const [reasonLabel, files] of skippedGroups) {
      lines.push(`  ${reasonLabel}`);
      for (const f of files) {
        const label = f.name ?? f.uri.path;
        let detail = `    \u2717 ${label}`;
        if (f.errorMessage || f.duplicateOf) {
          const parts = [];
          if (f.errorMessage) {
            parts.push(f.errorMessage);
          }
          if (f.duplicateOf) {
            parts.push(localize("chatDebug.plainText.duplicateOf", "duplicate of {0}", f.duplicateOf.path));
          }
          detail += ` (${parts.join(", ")})`;
        }
        lines.push(detail);
      }
    }
  }
  if (content.sourceFolders && content.sourceFolders.length > 0) {
    lines.push("");
    lines.push(localize("chatDebug.plainText.sourceFolders", "Sources ({0})", content.sourceFolders.length));
    for (const folder of content.sourceFolders) {
      lines.push(`  ${folder.uri.path}`);
    }
  }
  return lines.join("\n");
}
__name(fileListToPlainText, "fileListToPlainText");
export {
  fileListToPlainText,
  renderCustomizationDiscoveryContent
};
//# sourceMappingURL=chatCustomizationDiscoveryRenderer.js.map
