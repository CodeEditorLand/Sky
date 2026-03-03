import { AccessibleViewType, AccessibleContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplementation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class ProblemsAccessibilityHelp implements IAccessibleViewImplementation {
    readonly type = AccessibleViewType.Help;
    readonly priority = 105;
    readonly name = "problemsFilter";
    readonly when: import("../../../../platform/contextkey/common/contextkey.ts").RawContextKey<boolean>;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider;
}
