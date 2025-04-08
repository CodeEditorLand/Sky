var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../base/common/uri.js";
function createNodeTree(nodes) {
  if (nodes.length === 0) {
    return null;
  }
  const nodeLookup = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    nodeLookup.set(node.nodeId, node);
  }
  function getNonIgnoredDescendants(nodeId) {
    const node = nodeLookup.get(nodeId);
    if (!node || !node.childIds) {
      return [];
    }
    const result = [];
    for (const childId of node.childIds) {
      const childNode = nodeLookup.get(childId);
      if (!childNode) {
        continue;
      }
      if (childNode.ignored) {
        result.push(...getNonIgnoredDescendants(childId));
      } else {
        result.push(childId);
      }
    }
    return result;
  }
  __name(getNonIgnoredDescendants, "getNonIgnoredDescendants");
  const nodeMap = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    if (!node.ignored) {
      nodeMap.set(node.nodeId, { node, children: [], parent: null });
    }
  }
  for (const node of nodes) {
    if (node.ignored) {
      continue;
    }
    const treeNode = nodeMap.get(node.nodeId);
    if (node.childIds) {
      for (const childId of node.childIds) {
        const childNode = nodeLookup.get(childId);
        if (!childNode) {
          continue;
        }
        if (childNode.ignored) {
          const nonIgnoredDescendants = getNonIgnoredDescendants(childId);
          for (const descendantId of nonIgnoredDescendants) {
            const descendantTreeNode = nodeMap.get(descendantId);
            if (descendantTreeNode) {
              descendantTreeNode.parent = treeNode;
              treeNode.children.push(descendantTreeNode);
            }
          }
        } else {
          const childTreeNode = nodeMap.get(childId);
          if (childTreeNode) {
            childTreeNode.parent = treeNode;
            treeNode.children.push(childTreeNode);
          }
        }
      }
    }
  }
  for (const node of nodeMap.values()) {
    if (!node.parent) {
      return node;
    }
  }
  return null;
}
__name(createNodeTree, "createNodeTree");
function convertAXTreeToMarkdown(uri, axNodes) {
  const tree = createNodeTree(axNodes);
  if (!tree) {
    return "";
  }
  const mainContent = extractMainContent(uri, tree);
  const navLinks = collectNavigationLinks(tree);
  return mainContent + (navLinks.length > 0 ? "\n\n## Additional Links\n" + navLinks.join("\n") : "");
}
__name(convertAXTreeToMarkdown, "convertAXTreeToMarkdown");
function extractMainContent(uri, tree) {
  const contentBuffer = [];
  processNode(uri, tree, contentBuffer, 0, true);
  return contentBuffer.join("");
}
__name(extractMainContent, "extractMainContent");
function processNode(uri, node, buffer, depth, semanticLineBreak) {
  const role = getNodeRole(node.node);
  switch (role) {
    case "navigation":
      return;
    // Skip navigation nodes
    case "heading":
      processHeadingNode(uri, node, buffer, depth);
      return;
    case "paragraph":
      processParagraphNode(uri, node, buffer, depth, semanticLineBreak);
      return;
    case "list":
      processListNode(uri, node, buffer, depth);
      return;
    case "listitem":
      return;
    case "link":
      if (!isNavigationLink(node)) {
        const linkText = getNodeText(node.node, semanticLineBreak);
        const url = getLinkUrl(node.node);
        if (!isSameUriIgnoringQueryAndFragment(uri, node.node)) {
          buffer.push(`[${linkText}](${url})`);
        } else {
          buffer.push(linkText);
        }
      }
      return;
    case "StaticText": {
      const staticText = getNodeText(node.node, semanticLineBreak);
      if (staticText) {
        buffer.push(staticText);
      }
      break;
    }
    case "image": {
      const altText = getNodeText(node.node, semanticLineBreak) || "Image";
      const imageUrl = getImageUrl(node.node);
      if (imageUrl) {
        buffer.push(`![${altText}](${imageUrl})

`);
      } else {
        buffer.push(`[Image: ${altText}]

`);
      }
      break;
    }
    case "DescriptionList":
      processDescriptionListNode(uri, node, buffer, depth);
      return;
    case "blockquote":
      buffer.push("> " + getNodeText(node.node, semanticLineBreak).replace(/\n/g, "\n> ") + "\n\n");
      break;
    // TODO: Is this the correct way to handle the generic role?
    case "generic":
      buffer.push(" ");
      break;
    case "code": {
      processCodeNode(uri, node, buffer, depth);
      return;
    }
    case "pre":
      buffer.push("```\n" + getNodeText(node.node, false) + "\n```\n\n");
      break;
    case "table":
      processTableNode(node, buffer);
      return;
  }
  for (const child of node.children) {
    processNode(uri, child, buffer, depth + 1, semanticLineBreak);
  }
}
__name(processNode, "processNode");
function getNodeRole(node) {
  return node.role?.value || "";
}
__name(getNodeRole, "getNodeRole");
function getNodeText(node, semanticLineBreak) {
  const text = node.name?.value || node.value?.value || "";
  if (!semanticLineBreak) {
    return text;
  }
  return text.replace(/([.!?:;])\s/g, "$1\n");
}
__name(getNodeText, "getNodeText");
function getHeadingLevel(node) {
  const levelProp = node.properties?.find((p) => p.name === "level");
  return levelProp ? Math.min(Number(levelProp.value.value) || 1, 6) : 1;
}
__name(getHeadingLevel, "getHeadingLevel");
function getLinkUrl(node) {
  const urlProp = node.properties?.find((p) => p.name === "url");
  return urlProp?.value.value || "#";
}
__name(getLinkUrl, "getLinkUrl");
function getImageUrl(node) {
  const urlProp = node.properties?.find((p) => p.name === "url");
  return urlProp?.value.value || null;
}
__name(getImageUrl, "getImageUrl");
function isNavigationLink(node) {
  let current = node;
  while (current) {
    const role = getNodeRole(current.node);
    if (["navigation", "menu", "menubar"].includes(role)) {
      return true;
    }
    current = current.parent;
  }
  return false;
}
__name(isNavigationLink, "isNavigationLink");
function isSameUriIgnoringQueryAndFragment(uri, node) {
  const link = getLinkUrl(node);
  try {
    const parsed = URI.parse(link);
    return parsed.scheme === uri.scheme && parsed.authority === uri.authority && parsed.path === uri.path;
  } catch (e) {
    return false;
  }
}
__name(isSameUriIgnoringQueryAndFragment, "isSameUriIgnoringQueryAndFragment");
function processParagraphNode(uri, node, buffer, depth, semanticLineBreak) {
  buffer.push("\n");
  for (const child of node.children) {
    processNode(uri, child, buffer, depth + 1, semanticLineBreak);
  }
  buffer.push("\n\n");
}
__name(processParagraphNode, "processParagraphNode");
function processHeadingNode(uri, node, buffer, depth) {
  buffer.push("\n");
  const level = getHeadingLevel(node.node);
  buffer.push(`${"#".repeat(level)} `);
  for (const child of node.children) {
    if (getNodeRole(child.node) === "StaticText") {
      buffer.push(getNodeText(child.node, false));
    } else {
      processNode(uri, child, buffer, depth + 1, false);
    }
  }
  buffer.push("\n\n");
}
__name(processHeadingNode, "processHeadingNode");
function processDescriptionListNode(uri, node, buffer, depth) {
  buffer.push("\n");
  for (const child of node.children) {
    if (getNodeRole(child.node) === "term") {
      buffer.push("- **");
      for (const termChild of child.children) {
        processNode(uri, termChild, buffer, depth + 1, true);
      }
      buffer.push("** ");
    } else if (getNodeRole(child.node) === "definition") {
      for (const descChild of child.children) {
        processNode(uri, descChild, buffer, depth + 1, true);
      }
      buffer.push("\n");
    }
  }
  buffer.push("\n");
}
__name(processDescriptionListNode, "processDescriptionListNode");
function processListNode(uri, node, buffer, depth) {
  const isOrdered = getNodeRole(node.node).includes("ordered");
  let itemIndex = 1;
  buffer.push("\n");
  for (const child of node.children) {
    if (getNodeRole(child.node) === "listitem") {
      const tempBuffer = [];
      for (const descChild of child.children) {
        processNode(uri, descChild, tempBuffer, depth + 1, true);
      }
      const itemText = tempBuffer.join("").trim();
      if (isOrdered) {
        buffer.push(`${itemIndex++}. ${itemText}
`);
      } else {
        buffer.push(`- ${itemText}
`);
      }
    }
  }
  buffer.push("\n");
}
__name(processListNode, "processListNode");
function processTableNode(node, buffer) {
  buffer.push("\n");
  const rows = node.children.filter((child) => getNodeRole(child.node).includes("row"));
  if (rows.length > 0) {
    const headerCells = rows[0].children.filter((cell) => getNodeRole(cell.node).includes("cell"));
    const headerContent = headerCells.map((cell) => getNodeText(cell.node, false) || " ");
    buffer.push("| " + headerContent.join(" | ") + " |\n");
    buffer.push("| " + headerCells.map(() => "---").join(" | ") + " |\n");
    for (let i = 1; i < rows.length; i++) {
      const dataCells = rows[i].children.filter((cell) => getNodeRole(cell.node).includes("cell"));
      const rowContent = dataCells.map((cell) => getNodeText(cell.node, false) || " ");
      buffer.push("| " + rowContent.join(" | ") + " |\n");
    }
  }
  buffer.push("\n");
}
__name(processTableNode, "processTableNode");
function processCodeNode(uri, node, buffer, depth) {
  const tempBuffer = [];
  for (const child of node.children) {
    processNode(uri, child, tempBuffer, depth + 1, false);
  }
  const isCodeblock = tempBuffer.some((text) => text.includes("\n"));
  if (isCodeblock) {
    buffer.push("\n```\n");
    buffer.push(tempBuffer.join(""));
    buffer.push("\n```\n");
  } else {
    buffer.push("`");
    let characterCount = 0;
    for (const tempItem of tempBuffer) {
      characterCount += tempItem.length;
      if (characterCount > 80) {
        buffer.push("\n");
        characterCount = 0;
      }
      buffer.push(tempItem);
      buffer.push("`");
    }
  }
}
__name(processCodeNode, "processCodeNode");
function collectNavigationLinks(tree) {
  const links = [];
  collectLinks(tree, links);
  return links;
}
__name(collectNavigationLinks, "collectNavigationLinks");
function collectLinks(node, links) {
  const role = getNodeRole(node.node);
  if (role === "link" && isNavigationLink(node)) {
    const linkText = getNodeText(node.node, true);
    const url = getLinkUrl(node.node);
    const description = node.node.description?.value || "";
    links.push(`- [${linkText}](${url})${description ? " - " + description : ""}`);
  }
  for (const child of node.children) {
    collectLinks(child, links);
  }
}
__name(collectLinks, "collectLinks");
export {
  convertAXTreeToMarkdown
};
//# sourceMappingURL=cdpAccessibilityDomain.js.map
