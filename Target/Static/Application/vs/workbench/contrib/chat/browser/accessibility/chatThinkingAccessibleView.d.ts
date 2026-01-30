import { AccessibleContentProvider, AccessibleViewType } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplementation } from '../../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class ChatThinkingAccessibleView implements IAccessibleViewImplementation {
    readonly priority = 105;
    readonly name = "chatThinking";
    readonly type = AccessibleViewType.View;
    readonly when: import("../../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
    private _extractThinkingContent;
}
