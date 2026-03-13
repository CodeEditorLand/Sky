import { IAction } from '../../../../base/common/actions.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import './media/scm.css';
import { IMenu, IMenuService } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ISCMMenus, ISCMProvider, ISCMRepository, ISCMRepositoryMenus, ISCMResource, ISCMResourceGroup, ISCMService } from '../common/scm.js';
import { ISCMArtifact, ISCMArtifactGroup } from '../common/artifact.js';
export declare class SCMTitleMenu implements IDisposable {
    private _actions;
    get actions(): IAction[];
    private _secondaryActions;
    get secondaryActions(): IAction[];
    readonly menu: IMenu;
    private readonly disposables;
    private readonly _onDidChangeTitle;
    readonly onDidChangeTitle: import("../../../../base/common/event.js").Event<void>;
    constructor(menuService: IMenuService, contextKeyService: IContextKeyService);
    private updateTitleActions;
    dispose(): void;
}
export declare class SCMRepositoryMenus implements ISCMRepositoryMenus, IDisposable {
    private readonly provider;
    private readonly menuService;
    private contextKeyService;
    readonly titleMenu: SCMTitleMenu;
    private genericRepositoryMenu;
    private contextualRepositoryMenus;
    private genericRepositoryContextMenu;
    private contextualRepositoryContextMenus;
    private artifactGroupMenus;
    private artifactMenus;
    private readonly resourceGroupMenusItems;
    private readonly disposables;
    constructor(provider: ISCMProvider, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, menuService: IMenuService);
    getArtifactGroupMenu(artifactGroup: ISCMArtifactGroup): IMenu;
    getArtifactMenu(artifactGroup: ISCMArtifactGroup, artifact: ISCMArtifact): IMenu;
    getRepositoryMenu(repository: ISCMRepository): IMenu;
    getRepositoryContextMenu(repository: ISCMRepository): IMenu;
    getResourceGroupMenu(group: ISCMResourceGroup): IMenu;
    getResourceMenu(resource: ISCMResource): IMenu;
    getResourceFolderMenu(group: ISCMResourceGroup): IMenu;
    private getOrCreateResourceGroupMenusItem;
    private onDidChangeResourceGroups;
    dispose(): void;
}
export declare class SCMMenus implements ISCMMenus, IDisposable {
    private instantiationService;
    readonly titleMenu: SCMTitleMenu;
    private readonly disposables;
    private readonly menus;
    constructor(scmService: ISCMService, instantiationService: IInstantiationService);
    private onDidRemoveRepository;
    getRepositoryMenus(provider: ISCMProvider): SCMRepositoryMenus;
    dispose(): void;
}
