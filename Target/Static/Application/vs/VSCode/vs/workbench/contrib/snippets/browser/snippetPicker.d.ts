import { Snippet } from './snippetsFile.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { URI } from '../../../../base/common/uri.js';
export declare function pickSnippet(accessor: ServicesAccessor, languageIdOrSnippets: string | Snippet[], resourceUri?: URI): Promise<Snippet | undefined>;
