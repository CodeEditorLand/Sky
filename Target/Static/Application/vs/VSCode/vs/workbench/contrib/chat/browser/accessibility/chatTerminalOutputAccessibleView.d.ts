import { AccessibleContentProvider, AccessibleViewType } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplementation } from '../../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class ChatTerminalOutputAccessibleView implements IAccessibleViewImplementation {
    readonly priority = 115;
    readonly name = "chatTerminalOutput";
    readonly type = AccessibleViewType.View;
    readonly when: import("../../../../../platform/contextkey/common/contextkey.ts").RawContextKey<boolean>;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
