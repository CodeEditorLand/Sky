import './media/scm.css';
import { IDisposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { ISCMProvider, ISCMRepository, ISCMViewService } from '../common/scm.js';
import { CountBadge } from '../../../../base/browser/ui/countBadge/countBadge.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ActionRunner, IAction } from '../../../../base/common/actions.js';
import { ITreeNode, ITreeRenderer } from '../../../../base/browser/ui/tree/tree.js';
import { ICompressibleTreeRenderer } from '../../../../base/browser/ui/tree/objectTree.js';
import { FuzzyScore } from '../../../../base/common/filters.js';
import { IListRenderer } from '../../../../base/browser/ui/list/list.js';
import { IActionViewItemProvider } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { WorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IconLabel } from '../../../../base/browser/ui/iconLabel/iconLabel.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
export declare class RepositoryActionRunner extends ActionRunner {
    private readonly getSelectedRepositories;
    constructor(getSelectedRepositories: () => ISCMRepository[]);
    protected runAction(action: IAction, context: ISCMProvider): Promise<void>;
}
interface RepositoryTemplate {
    readonly icon: HTMLElement;
    readonly label: IconLabel;
    readonly countContainer: HTMLElement;
    readonly count: CountBadge;
    readonly toolBar: WorkbenchToolBar;
    readonly elementDisposables: DisposableStore;
    readonly templateDisposable: IDisposable;
}
export declare class RepositoryRenderer implements ICompressibleTreeRenderer<ISCMRepository, FuzzyScore, RepositoryTemplate>, IListRenderer<ISCMRepository, RepositoryTemplate>, ITreeRenderer<ISCMRepository, FuzzyScore, RepositoryTemplate> {
    private readonly toolbarMenuId;
    private readonly actionViewItemProvider;
    private commandService;
    private contextKeyService;
    private contextMenuService;
    private keybindingService;
    private labelService;
    private menuService;
    private scmViewService;
    private telemetryService;
    private uriIdentityService;
    static readonly TEMPLATE_ID = "repository";
    get templateId(): string;
    private readonly onDidChangeVisibleRepositoriesSignal;
    constructor(toolbarMenuId: MenuId, actionViewItemProvider: IActionViewItemProvider, commandService: ICommandService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, labelService: ILabelService, menuService: IMenuService, scmViewService: ISCMViewService, telemetryService: ITelemetryService, uriIdentityService: IUriIdentityService);
    renderTemplate(container: HTMLElement): RepositoryTemplate;
    renderElement(arg: ISCMRepository | ITreeNode<ISCMRepository, FuzzyScore>, index: number, templateData: RepositoryTemplate): void;
    renderCompressedElements(): void;
    disposeElement(group: ISCMRepository | ITreeNode<ISCMRepository, FuzzyScore>, index: number, template: RepositoryTemplate): void;
    disposeTemplate(templateData: RepositoryTemplate): void;
}
export {};
