import { IChatWidget } from '../chat.js';
import { IPromptsService } from '../../common/promptSyntax/service/promptsService.js';
import { IChatContextPickerItem, IChatContextPicker } from '../attachments/chatContextPickService.js';
/**
 * Action ID for the `Attach Instruction` action.
 */
export declare const ATTACH_INSTRUCTIONS_ACTION_ID = "workbench.action.chat.attach.instructions";
/**
 * Action ID for the `Configure Instruction` action.
 */
export declare const CONFIGURE_INSTRUCTIONS_ACTION_ID = "workbench.action.chat.configure.instructions";
/**
 * Helper to register the `Attach Prompt` action.
 */
export declare function registerAttachPromptActions(): void;
export declare class ChatInstructionsPickerPick implements IChatContextPickerItem {
    private readonly promptsService;
    readonly type = "pickerPick";
    readonly label: string;
    readonly icon: import("../../../../../base/common/themables.ts").ThemeIcon;
    readonly commandId = "workbench.action.chat.attach.instructions";
    constructor(promptsService: IPromptsService);
    isEnabled(widget: IChatWidget): Promise<boolean> | boolean;
    asPicker(): IChatContextPicker;
}
