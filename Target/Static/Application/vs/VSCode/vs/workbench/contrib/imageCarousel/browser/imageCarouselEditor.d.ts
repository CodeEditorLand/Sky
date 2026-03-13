import { Dimension } from '../../../../base/browser/dom.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { IEditorOpenContext } from '../../../common/editor.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { ImageCarouselEditorInput } from './imageCarouselEditorInput.js';
export declare class ImageCarouselEditor extends EditorPane {
    static readonly ID = "workbench.editor.imageCarousel";
    private _container;
    private _currentIndex;
    private _images;
    private readonly _contentDisposables;
    private readonly _imageDisposables;
    private _elements;
    private _thumbnailElements;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService);
    protected createEditor(parent: HTMLElement): void;
    setInput(input: ImageCarouselEditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    clearInput(): void;
    /**
     * Build the full DOM skeleton. Called once per setInput.
     */
    private buildSlideshow;
    /**
     * Update only the changing parts: main image src, counter, button states, thumbnail selection.
     * No DOM teardown/rebuild — eliminates the blank flash.
     */
    private updateCurrentImage;
    previous(): void;
    next(): void;
    focus(): void;
    layout(dimension: Dimension): void;
}
