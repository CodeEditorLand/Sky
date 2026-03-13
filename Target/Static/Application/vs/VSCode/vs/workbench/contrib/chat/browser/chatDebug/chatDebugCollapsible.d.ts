import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IChatDebugMessageSection } from '../../common/chatDebugService.js';
/**
 * Wire up a collapsible toggle on a chevron+header+content triple.
 * Handles icon switching and display toggling.
 */
export declare function setupCollapsibleToggle(chevron: HTMLElement, header: HTMLElement, contentEl: HTMLElement, disposables: DisposableStore, initiallyCollapsed?: boolean): void;
/**
 * Render a collapsible section with a clickable header and pre-formatted content
 * wrapped in a scrollable element.
 */
export declare function renderCollapsibleSection(parent: HTMLElement, section: IChatDebugMessageSection, disposables: DisposableStore, initiallyCollapsed?: boolean): void;
