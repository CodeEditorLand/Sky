import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IStatusbarService } from '../../../../services/statusbar/browser/statusbar.js';
import { IAnnotatedDocuments } from '../helpers/annotatedDocuments.js';
import { VSCodeWorkspace } from '../helpers/vscodeObservableWorkspace.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
export declare class EditTrackingFeature extends Disposable {
    private readonly _workspace;
    private readonly _annotatedDocuments;
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _statusbarService;
    private readonly _editorService;
    private readonly _extensionService;
    private readonly _editSourceTrackingShowDecorations;
    private readonly _editSourceTrackingShowStatusBar;
    private readonly _showStateInMarkdownDoc;
    private readonly _toggleDecorations;
    constructor(_workspace: VSCodeWorkspace, _annotatedDocuments: IAnnotatedDocuments, _configurationService: IConfigurationService, _instantiationService: IInstantiationService, _statusbarService: IStatusbarService, _editorService: IEditorService, _extensionService: IExtensionService);
    private _createEditSourceAgenda;
}
