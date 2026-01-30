import './media/chatViewTitleControl.css';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IChatModel } from '../../../common/model/chatModel.js';
export interface IChatViewTitleDelegate {
    focusChat(): void;
}
export declare class ChatViewTitleControl extends Disposable {
    private readonly container;
    private readonly delegate;
    private readonly configurationService;
    private readonly instantiationService;
    private static readonly DEFAULT_TITLE;
    private static readonly PICK_AGENT_SESSION_ACTION_ID;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../../../base/common/event.js").Event<void>;
    private title;
    private titleContainer;
    private titleLabel;
    private model;
    private modelDisposables;
    private navigationToolbar?;
    private actionsToolbar?;
    private lastKnownHeight;
    constructor(container: HTMLElement, delegate: IChatViewTitleDelegate, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    private registerListeners;
    private registerActions;
    private render;
    update(model: IChatModel | undefined): void;
    private doUpdate;
    private updateTitle;
    private shouldRender;
    private isEnabled;
    getHeight(): number;
}
