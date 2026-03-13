import './media/ciStatusWidget.css';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IChatWidgetService } from '../../../../workbench/contrib/chat/browser/chat.js';
import { GitHubPullRequestCIModel } from '../../github/browser/models/githubPullRequestCIModel.js';
/**
 * A collapsible widget that shows the CI status of a PR.
 * Rendered beneath the changes tree in the changes view.
 */
export declare class CIStatusWidget extends Disposable {
    private readonly _openerService;
    private readonly _chatWidgetService;
    private readonly _instantiationService;
    private readonly _domNode;
    private readonly _headerNode;
    private readonly _titleNode;
    private readonly _titleLabel;
    private readonly _headerActionBarContainer;
    private readonly _headerActionBar;
    private readonly _twistieNode;
    private readonly _bodyNode;
    private readonly _list;
    private readonly _labels;
    private readonly _headerActionDisposables;
    private _collapsed;
    private _model;
    private _sessionResource;
    get element(): HTMLElement;
    constructor(container: HTMLElement, _openerService: IOpenerService, _chatWidgetService: IChatWidgetService, _instantiationService: IInstantiationService);
    /**
     * Bind to a CI model. When `ciModel` is undefined, the widget hides.
     * Returns a disposable that stops observation.
     */
    bind(ciModel: IObservable<GitHubPullRequestCIModel | undefined>, sessionResource: IObservable<URI | undefined>): IDisposable;
    private _toggle;
    private _updateTwistie;
    private _renderHeader;
    private _renderHeaderActions;
    private _renderBody;
    private _sendFixChecksPrompt;
}
