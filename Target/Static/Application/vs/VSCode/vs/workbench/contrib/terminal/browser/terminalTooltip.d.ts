import type { IHoverAction } from '../../../../base/browser/ui/hover/hover.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { type IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITerminalInstance } from './terminal.js';
export declare function getInstanceHoverInfo(instance: ITerminalInstance, storageService: IStorageService): {
    content: MarkdownString;
    actions: IHoverAction[];
};
export declare function getShellProcessTooltip(instance: ITerminalInstance, showDetailed: boolean): string;
