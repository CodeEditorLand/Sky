import { IListRenderer, IListVirtualDelegate } from '../../../../../base/browser/ui/list/list.js';
import { ITreeNode, ITreeRenderer } from '../../../../../base/browser/ui/tree/tree.js';
import { IChatDebugEvent } from '../../common/chatDebugService.js';
export interface IChatDebugEventTemplate {
    readonly container: HTMLElement;
    readonly created: HTMLElement;
    readonly name: HTMLElement;
    readonly details: HTMLElement;
}
export declare class ChatDebugEventRenderer implements IListRenderer<IChatDebugEvent, IChatDebugEventTemplate> {
    static readonly TEMPLATE_ID = "chatDebugEvent";
    get templateId(): string;
    renderTemplate(container: HTMLElement): IChatDebugEventTemplate;
    renderElement(element: IChatDebugEvent, index: number, templateData: IChatDebugEventTemplate): void;
    disposeTemplate(_templateData: IChatDebugEventTemplate): void;
}
export declare class ChatDebugEventDelegate implements IListVirtualDelegate<IChatDebugEvent> {
    getHeight(_element: IChatDebugEvent): number;
    getTemplateId(_element: IChatDebugEvent): string;
}
export declare class ChatDebugEventTreeRenderer implements ITreeRenderer<IChatDebugEvent, void, IChatDebugEventTemplate> {
    static readonly TEMPLATE_ID = "chatDebugEvent";
    get templateId(): string;
    renderTemplate(container: HTMLElement): IChatDebugEventTemplate;
    renderElement(node: ITreeNode<IChatDebugEvent, void>, index: number, templateData: IChatDebugEventTemplate): void;
    disposeTemplate(_templateData: IChatDebugEventTemplate): void;
}
