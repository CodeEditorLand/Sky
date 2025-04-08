var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FolderExists, InvalidPromptName } from "../errors.js";
import { URI } from "../../../../../../../../base/common/uri.js";
import { assert } from "../../../../../../../../base/common/assert.js";
import { VSBuffer } from "../../../../../../../../base/common/buffer.js";
import { dirname } from "../../../../../../../../base/common/resources.js";
import { IFileService } from "../../../../../../../../platform/files/common/files.js";
import { IOpenerService } from "../../../../../../../../platform/opener/common/opener.js";
import { isPromptFile, PROMPT_FILE_EXTENSION } from "../../../../../../../../platform/prompts/common/constants.js";
const createPromptFile = /* @__PURE__ */ __name(async (options) => {
  const { fileName, folder, content, fileService, openerService } = options;
  const promptUri = URI.joinPath(folder, fileName);
  assert(
    isPromptFile(promptUri),
    new InvalidPromptName(fileName)
  );
  if (await fileService.exists(promptUri)) {
    const promptInfo = await fileService.resolve(promptUri);
    assert(
      !promptInfo.isDirectory,
      new FolderExists(promptUri.fsPath)
    );
    await openerService.open(promptUri);
    return promptUri;
  }
  await fileService.createFolder(dirname(promptUri));
  await fileService.createFile(promptUri, VSBuffer.fromString(content));
  return promptUri;
}, "createPromptFile");
export {
  createPromptFile
};
//# sourceMappingURL=createPromptFile.js.map
