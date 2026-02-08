import { IObservable, ISettableObservable } from '../../../../base/common/observable.js';
import { ObservableCodeEditor } from '../../../../editor/browser/observableCodeEditor.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import { InlineEditsGutterIndicator } from '../../../../editor/contrib/inlineCompletions/browser/view/inlineEdits/components/gutterIndicatorView.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { HoverService } from '../../../../platform/hover/browser/hoverService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
export declare class InlineChatGutterAffordance extends InlineEditsGutterIndicator {
    private readonly _myEditorObs;
    private readonly _hover;
    private readonly _keybindingService;
    constructor(_myEditorObs: ObservableCodeEditor, selection: IObservable<Selection | undefined>, _hover: ISettableObservable<{
        rect: DOMRect;
        above: boolean;
        lineNumber: number;
    } | undefined>, _keybindingService: IKeybindingService, hoverService: HoverService, instantiationService: IInstantiationService, accessibilityService: IAccessibilityService, themeService: IThemeService);
    protected _showHover(): void;
    private _doShowHover;
}
