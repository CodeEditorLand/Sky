import { AccessibleViewType, AccessibleContentProvider } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplementation } from '../../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class TerminalFindAccessibilityHelp implements IAccessibleViewImplementation {
    readonly priority = 105;
    readonly name = "terminal-find";
    readonly type = AccessibleViewType.Help;
    readonly when: import("../../../../../platform/contextkey/common/contextkey.ts").RawContextKey<boolean>;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
