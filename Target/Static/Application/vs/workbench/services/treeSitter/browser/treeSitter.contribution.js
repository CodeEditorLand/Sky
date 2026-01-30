import { ITreeSitterLibraryService } from "../../../../editor/common/services/treeSitter/treeSitterLibraryService.js";
import { ITreeSitterThemeService } from "../../../../editor/common/services/treeSitter/treeSitterThemeService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { TreeSitterLibraryService } from "./treeSitterLibraryService.js";
import { TreeSitterThemeService } from "./treeSitterThemeService.js";
registerSingleton(
  ITreeSitterLibraryService,
  TreeSitterLibraryService,
  0
  /* InstantiationType.Eager */
);
registerSingleton(
  ITreeSitterThemeService,
  TreeSitterThemeService,
  0
  /* InstantiationType.Eager */
);
//# sourceMappingURL=treeSitter.contribution.js.map
