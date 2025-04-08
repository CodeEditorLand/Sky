var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import * as pfs from "../../../../base/node/pfs.js";
import { IFileMatch, IProgressMessage, ITextQuery, ITextSearchMatch, ISerializedFileMatch, ISerializedSearchSuccess, resultIsMatch } from "../common/search.js";
import { RipgrepTextSearchEngine } from "./ripgrepTextSearchEngine.js";
import { NativeTextSearchManager } from "./textSearchManager.js";
class TextSearchEngineAdapter {
  constructor(query, numThreads) {
    this.query = query;
    this.numThreads = numThreads;
  }
  static {
    __name(this, "TextSearchEngineAdapter");
  }
  search(token, onResult, onMessage) {
    if ((!this.query.folderQueries || !this.query.folderQueries.length) && (!this.query.extraFileResources || !this.query.extraFileResources.length)) {
      return Promise.resolve({
        type: "success",
        limitHit: false,
        stats: {
          type: "searchProcess"
        },
        messages: []
      });
    }
    const pretendOutputChannel = {
      appendLine(msg) {
        onMessage({ message: msg });
      }
    };
    const textSearchManager = new NativeTextSearchManager(this.query, new RipgrepTextSearchEngine(pretendOutputChannel, this.numThreads), pfs);
    return new Promise((resolve, reject) => {
      return textSearchManager.search(
        (matches) => {
          onResult(matches.map(fileMatchToSerialized));
        },
        token
      ).then(
        (c) => resolve({ limitHit: c.limitHit ?? false, type: "success", stats: c.stats, messages: [] }),
        reject
      );
    });
  }
}
function fileMatchToSerialized(match) {
  return {
    path: match.resource && match.resource.fsPath,
    results: match.results,
    numMatches: (match.results || []).reduce((sum, r) => {
      if (resultIsMatch(r)) {
        const m = r;
        return sum + m.rangeLocations.length;
      } else {
        return sum + 1;
      }
    }, 0)
  };
}
__name(fileMatchToSerialized, "fileMatchToSerialized");
export {
  TextSearchEngineAdapter
};
//# sourceMappingURL=textSearchAdapter.js.map
