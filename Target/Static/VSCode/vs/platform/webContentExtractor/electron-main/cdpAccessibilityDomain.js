/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
//#region Types
import { URI } from '../../../base/common/uri.js';
function createNodeTree(nodes) {
    if (nodes.length === 0) {
        return null;
    }
    // Create a map of node IDs to their corresponding nodes for quick lookup
    const nodeLookup = new Map();
    for (const node of nodes) {
        nodeLookup.set(node.nodeId, node);
    }
    // Helper function to get all non-ignored descendants of a node
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
                // If child is ignored, add its non-ignored descendants instead
                result.push(...getNonIgnoredDescendants(childId));
            }
            else {
                // Otherwise, add the child itself
                result.push(childId);
            }
        }
        return result;
    }
    // Create tree nodes only for non-ignored nodes
    const nodeMap = new Map();
    for (const node of nodes) {
        if (!node.ignored) {
            nodeMap.set(node.nodeId, { node, children: [], parent: null });
        }
    }
    // Establish parent-child relationships, bypassing ignored nodes
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
                    // If child is ignored, connect its non-ignored descendants to this node
                    const nonIgnoredDescendants = getNonIgnoredDescendants(childId);
                    for (const descendantId of nonIgnoredDescendants) {
                        const descendantTreeNode = nodeMap.get(descendantId);
                        if (descendantTreeNode) {
                            descendantTreeNode.parent = treeNode;
                            treeNode.children.push(descendantTreeNode);
                        }
                    }
                }
                else {
                    // Normal case: add non-ignored child directly
                    const childTreeNode = nodeMap.get(childId);
                    if (childTreeNode) {
                        childTreeNode.parent = treeNode;
                        treeNode.children.push(childTreeNode);
                    }
                }
            }
        }
    }
    // Find the root node (a node without a parent)
    for (const node of nodeMap.values()) {
        if (!node.parent) {
            return node;
        }
    }
    return null;
}
export function convertAXTreeToMarkdown(uri, axNodes) {
    const tree = createNodeTree(axNodes);
    if (!tree) {
        return ''; // Return empty string for empty tree
    }
    // Process tree to extract main content and navigation links
    const mainContent = extractMainContent(uri, tree);
    const navLinks = collectNavigationLinks(tree);
    // Combine main content and navigation links
    return mainContent + (navLinks.length > 0 ? '\n\n## Additional Links\n' + navLinks.join('\n') : '');
}
function extractMainContent(uri, tree) {
    const contentBuffer = [];
    processNode(uri, tree, contentBuffer, 0, true);
    return contentBuffer.join('');
}
function processNode(uri, node, buffer, depth, semanticLineBreak) {
    const role = getNodeRole(node.node);
    switch (role) {
        case 'navigation':
            return; // Skip navigation nodes
        case 'heading':
            processHeadingNode(uri, node, buffer, depth);
            return;
        case 'paragraph':
            processParagraphNode(uri, node, buffer, depth, semanticLineBreak);
            return;
        case 'list':
            processListNode(uri, node, buffer, depth);
            return;
        case 'listitem':
            // Individual list items are handled in processListNode
            return;
        case 'link':
            if (!isNavigationLink(node)) {
                const linkText = getNodeText(node.node, semanticLineBreak);
                const url = getLinkUrl(node.node);
                if (!isSameUriIgnoringQueryAndFragment(uri, node.node)) {
                    buffer.push(`[${linkText}](${url})`);
                }
                else {
                    buffer.push(linkText);
                }
            }
            return;
        case 'StaticText': {
            const staticText = getNodeText(node.node, semanticLineBreak);
            if (staticText) {
                buffer.push(staticText);
            }
            break;
        }
        case 'image': {
            const altText = getNodeText(node.node, semanticLineBreak) || 'Image';
            const imageUrl = getImageUrl(node.node);
            if (imageUrl) {
                buffer.push(`![${altText}](${imageUrl})\n\n`);
            }
            else {
                buffer.push(`[Image: ${altText}]\n\n`);
            }
            break;
        }
        case 'DescriptionList':
            processDescriptionListNode(uri, node, buffer, depth);
            return;
        case 'blockquote':
            buffer.push('> ' + getNodeText(node.node, semanticLineBreak).replace(/\n/g, '\n> ') + '\n\n');
            break;
        // TODO: Is this the correct way to handle the generic role?
        case 'generic':
            buffer.push(' ');
            break;
        case 'code': {
            processCodeNode(uri, node, buffer, depth);
            return;
        }
        case 'pre':
            buffer.push('```\n' + getNodeText(node.node, false) + '\n```\n\n');
            break;
        case 'table':
            processTableNode(node, buffer);
            return;
    }
    // Process children if not already handled in specific cases
    for (const child of node.children) {
        processNode(uri, child, buffer, depth + 1, semanticLineBreak);
    }
}
function getNodeRole(node) {
    return node.role?.value || '';
}
function getNodeText(node, semanticLineBreak) {
    const text = node.name?.value || node.value?.value || '';
    if (!semanticLineBreak) {
        return text;
    }
    // Insert line breaks after punctuation followed by space
    return text.replace(/([.!?:;])\s/g, '$1\n');
}
function getHeadingLevel(node) {
    const levelProp = node.properties?.find(p => p.name === 'level');
    return levelProp ? Math.min(Number(levelProp.value.value) || 1, 6) : 1;
}
function getLinkUrl(node) {
    // Find URL in properties
    const urlProp = node.properties?.find(p => p.name === 'url');
    return urlProp?.value.value || '#';
}
function getImageUrl(node) {
    // Find URL in properties
    const urlProp = node.properties?.find(p => p.name === 'url');
    return urlProp?.value.value || null;
}
function isNavigationLink(node) {
    // Check if this link is part of navigation
    let current = node;
    while (current) {
        const role = getNodeRole(current.node);
        if (['navigation', 'menu', 'menubar'].includes(role)) {
            return true;
        }
        current = current.parent;
    }
    return false;
}
function isSameUriIgnoringQueryAndFragment(uri, node) {
    // Check if this link is an anchor link
    const link = getLinkUrl(node);
    try {
        const parsed = URI.parse(link);
        return parsed.scheme === uri.scheme && parsed.authority === uri.authority && parsed.path === uri.path;
    }
    catch (e) {
        return false;
    }
}
function processParagraphNode(uri, node, buffer, depth, semanticLineBreak) {
    buffer.push('\n');
    // Process the children of the paragraph
    for (const child of node.children) {
        processNode(uri, child, buffer, depth + 1, semanticLineBreak);
    }
    buffer.push('\n\n');
}
function processHeadingNode(uri, node, buffer, depth) {
    buffer.push('\n');
    const level = getHeadingLevel(node.node);
    buffer.push(`${'#'.repeat(level)} `);
    // Process children nodes of the heading
    for (const child of node.children) {
        if (getNodeRole(child.node) === 'StaticText') {
            buffer.push(getNodeText(child.node, false));
        }
        else {
            processNode(uri, child, buffer, depth + 1, false);
        }
    }
    buffer.push('\n\n');
}
function processDescriptionListNode(uri, node, buffer, depth) {
    buffer.push('\n');
    // Process each child of the description list
    for (const child of node.children) {
        if (getNodeRole(child.node) === 'term') {
            buffer.push('- **');
            // Process term nodes
            for (const termChild of child.children) {
                processNode(uri, termChild, buffer, depth + 1, true);
            }
            buffer.push('** ');
        }
        else if (getNodeRole(child.node) === 'definition') {
            // Process description nodes
            for (const descChild of child.children) {
                processNode(uri, descChild, buffer, depth + 1, true);
            }
            buffer.push('\n');
        }
    }
    buffer.push('\n');
}
function processListNode(uri, node, buffer, depth) {
    // Check if it's an ordered list
    // TODO: Verify that this is the correct way to check for ordered lists
    const isOrdered = getNodeRole(node.node).includes('ordered');
    let itemIndex = 1;
    buffer.push('\n');
    for (const child of node.children) {
        if (getNodeRole(child.node) === 'listitem') {
            const tempBuffer = [];
            // Process the children of the list item
            for (const descChild of child.children) {
                processNode(uri, descChild, tempBuffer, depth + 1, true);
            }
            const itemText = tempBuffer.join('').trim();
            if (isOrdered) {
                buffer.push(`${itemIndex++}. ${itemText}\n`);
            }
            else {
                buffer.push(`- ${itemText}\n`);
            }
        }
    }
    buffer.push('\n');
}
function processTableNode(node, buffer) {
    buffer.push('\n');
    // Find rows
    const rows = node.children.filter(child => getNodeRole(child.node).includes('row'));
    if (rows.length > 0) {
        // First row as header
        const headerCells = rows[0].children.filter(cell => getNodeRole(cell.node).includes('cell'));
        // Generate header row
        const headerContent = headerCells.map(cell => getNodeText(cell.node, false) || ' ');
        buffer.push('| ' + headerContent.join(' | ') + ' |\n');
        // Generate separator row
        buffer.push('| ' + headerCells.map(() => '---').join(' | ') + ' |\n');
        // Generate data rows
        for (let i = 1; i < rows.length; i++) {
            const dataCells = rows[i].children.filter(cell => getNodeRole(cell.node).includes('cell'));
            const rowContent = dataCells.map(cell => getNodeText(cell.node, false) || ' ');
            buffer.push('| ' + rowContent.join(' | ') + ' |\n');
        }
    }
    buffer.push('\n');
}
function processCodeNode(uri, node, buffer, depth) {
    const tempBuffer = [];
    // Process the children of the code node
    for (const child of node.children) {
        processNode(uri, child, tempBuffer, depth + 1, false);
    }
    const isCodeblock = tempBuffer.some(text => text.includes('\n'));
    if (isCodeblock) {
        buffer.push('\n```\n');
        // Append the processed text to the buffer
        buffer.push(tempBuffer.join(''));
        buffer.push('\n```\n');
    }
    else {
        buffer.push('`');
        let characterCount = 0;
        // Append the processed text to the buffer
        for (const tempItem of tempBuffer) {
            characterCount += tempItem.length;
            // Semantic line feed max of 80
            if (characterCount > 80) {
                buffer.push('\n');
                characterCount = 0;
            }
            buffer.push(tempItem);
            buffer.push('`');
        }
    }
}
function collectNavigationLinks(tree) {
    const links = [];
    collectLinks(tree, links);
    return links;
}
function collectLinks(node, links) {
    const role = getNodeRole(node.node);
    if (role === 'link' && isNavigationLink(node)) {
        const linkText = getNodeText(node.node, true);
        const url = getLinkUrl(node.node);
        const description = node.node.description?.value || '';
        links.push(`- [${linkText}](${url})${description ? ' - ' + description : ''}`);
    }
    // Process children
    for (const child of node.children) {
        collectLinks(child, links);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RwQWNjZXNzaWJpbGl0eURvbWFpbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0Q6L0RldmVsb3Blci9BcHBsaWNhdGlvbi9Db2RlRWRpdG9yTGFuZC9MYW5kL0RlcGVuZGVuY3kvTWljcm9zb2Z0L0RlcGVuZGVuY3kvRWRpdG9yL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dlYkNvbnRlbnRFeHRyYWN0b3IvZWxlY3Ryb24tbWFpbi9jZHBBY2Nlc3NpYmlsaXR5RG9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLGVBQWU7QUFFZixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUF3RGxELFNBQVMsY0FBYyxDQUFDLEtBQWU7SUFDdEMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELHlFQUF5RTtJQUN6RSxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztJQUM3QyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQzFCLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsK0RBQStEO0lBQy9ELFNBQVMsd0JBQXdCLENBQUMsTUFBYztRQUMvQyxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDN0IsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzVCLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FB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