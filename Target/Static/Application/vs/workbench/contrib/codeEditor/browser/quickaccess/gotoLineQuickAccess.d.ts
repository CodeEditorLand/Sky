import { Event } from '../../../../../base/common/event.js';
import { IKeyMods } from '../../../../../platform/quickinput/common/quickInput.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IRange } from '../../../../../editor/common/core/range.js';
import { AbstractGotoLineQuickAccessProvider } from '../../../../../editor/contrib/quickAccess/browser/gotoLineQuickAccess.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IQuickAccessTextEditorContext } from '../../../../../editor/contrib/quickAccess/browser/editorNavigationQuickAccess.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
export declare class GotoLineQuickAccessProvider extends AbstractGotoLineQuickAccessProvider {
    private readonly editorService;
    private readonly editorGroupService;
    private readonly configurationService;
    protected readonly storageService: IStorageService;
    protected readonly onDidActiveTextEditorControlChange: Event<void>;
    constructor(editorService: IEditorService, editorGroupService: IEditorGroupsService, configurationService: IConfigurationService, storageService: IStorageService);
    private get configuration();
    protected get activeTextEditorControl(): import("../../../../../editor/common/editorCommon.ts").IEditor | import("../../../../../editor/common/editorCommon.ts").IDiffEditor | undefined;
    protected gotoLocation(context: IQuickAccessTextEditorContext, options: {
        range: IRange;
        keyMods: IKeyMods;
        forceSideBySide?: boolean;
        preserveFocus?: boolean;
    }): void;
}
