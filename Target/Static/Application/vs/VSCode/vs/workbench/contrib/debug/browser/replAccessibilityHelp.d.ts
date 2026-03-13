import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { AccessibleViewProviderId, AccessibleViewType, IAccessibleViewContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplementation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Repl } from './repl.js';
import { AccessibilityVerbositySettingId } from '../../accessibility/browser/accessibilityConfiguration.js';
export declare class ReplAccessibilityHelp implements IAccessibleViewImplementation {
    priority: number;
    name: string;
    when: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
    type: AccessibleViewType;
    getProvider(accessor: ServicesAccessor): ReplAccessibilityHelpProvider | undefined;
}
declare class ReplAccessibilityHelpProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _replView;
    readonly id = AccessibleViewProviderId.ReplHelp;
    readonly verbositySettingKey = AccessibilityVerbositySettingId.Find;
    readonly options: {
        type: AccessibleViewType;
    };
    constructor(_replView: Repl);
    onClose(): void;
    provideContent(): string;
}
export {};
