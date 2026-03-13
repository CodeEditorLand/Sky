import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { IListRenderer } from '../../../../../base/browser/ui/list/list.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
export declare const CUSTOMIZATION_GROUP_HEADER_HEIGHT = 36;
export declare const CUSTOMIZATION_GROUP_HEADER_HEIGHT_WITH_SEPARATOR = 40;
/**
 * Common shape for a collapsible group header entry used in the
 * MCP-server and plugin list widgets.
 */
export interface ICustomizationGroupHeaderEntry {
    readonly type: 'group-header';
    readonly id: string;
    readonly label: string;
    readonly icon: ThemeIcon;
    readonly count: number;
    readonly isFirst: boolean;
    readonly description: string;
    collapsed: boolean;
}
interface ICustomizationGroupHeaderTemplateData {
    readonly container: HTMLElement;
    readonly chevron: HTMLElement;
    readonly icon: HTMLElement;
    readonly label: HTMLElement;
    readonly count: HTMLElement;
    readonly infoIcon: HTMLElement;
    readonly disposables: DisposableStore;
    readonly elementDisposables: DisposableStore;
}
/**
 * Shared renderer for collapsible group headers in the AI Customization
 * list widgets (MCP servers, plugins, etc.).
 */
export declare class CustomizationGroupHeaderRenderer<T extends ICustomizationGroupHeaderEntry> implements IListRenderer<T, ICustomizationGroupHeaderTemplateData> {
    readonly templateId: string;
    private readonly hoverService;
    constructor(templateId: string, hoverService: IHoverService);
    renderTemplate(container: HTMLElement): ICustomizationGroupHeaderTemplateData;
    renderElement(element: T, _index: number, templateData: ICustomizationGroupHeaderTemplateData): void;
    disposeTemplate(templateData: ICustomizationGroupHeaderTemplateData): void;
}
export {};
