import { Event } from '../../../../base/common/event.js';
import { IObservable } from '../../../../base/common/observable.js';
import { ObservableCodeEditor } from '../../../../editor/browser/observableCodeEditor.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import { InlineEditsGutterIndicator } from '../../../../editor/contrib/inlineCompletions/browser/view/inlineEdits/components/gutterIndicatorView.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { HoverService } from '../../../../platform/hover/browser/hoverService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IUserInteractionService } from '../../../../platform/userInteraction/browser/userInteractionService.js';
export declare class InlineChatGutterAffordance extends InlineEditsGutterIndicator {
    private readonly _onDidRunAction;
    readonly onDidRunAction: Event<string>;
    constructor(myEditorObs: ObservableCodeEditor, selection: IObservable<Selection | undefined>, _keybindingService: IKeybindingService, hoverService: HoverService, instantiationService: IInstantiationService, accessibilityService: IAccessibilityService, themeService: IThemeService, userInteractionService: IUserInteractionService, menuService: IMenuService, contextKeyService: IContextKeyService);
}
