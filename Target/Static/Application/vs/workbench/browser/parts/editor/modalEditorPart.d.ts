import './media/modalEditorPart.css';
import { Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IEditorGroupView, IEditorPartsView } from './editor.js';
import { EditorPart } from './editorPart.js';
import { IModalEditorPart } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IModalEditorNavigation, IModalEditorPartOptions } from '../../../../platform/editor/common/editor.js';
export interface ICreateModalEditorPartResult {
    readonly part: ModalEditorPartImpl;
    readonly instantiationService: IInstantiationService;
    readonly disposables: DisposableStore;
}
export declare class ModalEditorPart {
    private readonly editorPartsView;
    private readonly instantiationService;
    private readonly editorService;
    private readonly layoutService;
    private readonly keybindingService;
    private readonly hostService;
    private readonly environmentService;
    constructor(editorPartsView: IEditorPartsView, instantiationService: IInstantiationService, editorService: IEditorService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, hostService: IHostService, environmentService: IWorkbenchEnvironmentService);
    create(options?: IModalEditorPartOptions): Promise<ICreateModalEditorPartResult>;
}
declare class ModalEditorPartImpl extends EditorPart implements IModalEditorPart {
    readonly modalElement: HTMLElement;
    private static COUNTER;
    private readonly _onWillClose;
    readonly onWillClose: Event<void>;
    private readonly _onDidChangeMaximized;
    readonly onDidChangeMaximized: Event<boolean>;
    private readonly _onDidChangeNavigation;
    readonly onDidChangeNavigation: Event<IModalEditorNavigation | undefined>;
    private _maximized;
    get maximized(): boolean;
    private _navigation;
    get navigation(): IModalEditorNavigation | undefined;
    private readonly optionsDisposable;
    private previousMainWindowActiveElement;
    constructor(windowId: number, editorPartsView: IEditorPartsView, modalElement: HTMLElement, options: IModalEditorPartOptions | undefined, instantiationService: IInstantiationService, themeService: IThemeService, configurationService: IConfigurationService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, hostService: IHostService, contextKeyService: IContextKeyService);
    create(parent: HTMLElement, options?: object): void;
    private enforceModalPartOptions;
    notifyActiveEditorChanged(): void;
    updateOptions(options?: IModalEditorPartOptions): void;
    toggleMaximized(): void;
    protected handleContextKeys(): void;
    removeGroup(group: number | IEditorGroupView, preserveFocus?: boolean): void;
    private doRemoveLastGroup;
    protected saveState(): void;
    close(options?: {
        mergeAllEditorsToMainPart?: boolean;
    }): boolean;
    private doClose;
    private mergeGroupsToMainPart;
    dispose(): void;
}
export {};
