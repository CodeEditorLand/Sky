var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BrowserWindow } from "electron";
import { IWebContentExtractorService } from "../common/webContentExtractor.js";
import { URI } from "../../../base/common/uri.js";
import { AXNode, convertAXTreeToMarkdown } from "./cdpAccessibilityDomain.js";
import { Limiter } from "../../../base/common/async.js";
import { ResourceMap } from "../../../base/common/map.js";
class NativeWebContentExtractorService {
  static {
    __name(this, "NativeWebContentExtractorService");
  }
  _serviceBrand;
  // Only allow 3 windows to be opened at a time
  // to avoid overwhelming the system with too many processes.
  _limiter = new Limiter(3);
  _webContentsCache = new ResourceMap();
  _cacheDuration = 24 * 60 * 60 * 1e3;
  // 1 day in milliseconds
  isExpired(entry) {
    return Date.now() - entry.timestamp > this._cacheDuration;
  }
  extract(uris) {
    if (uris.length === 0) {
      return Promise.resolve([]);
    }
    return Promise.all(uris.map((uri) => this._limiter.queue(() => this.doExtract(uri))));
  }
  async doExtract(uri) {
    const cached = this._webContentsCache.get(uri);
    if (cached) {
      if (this.isExpired(cached)) {
        this._webContentsCache.delete(uri);
      } else {
        return cached.content;
      }
    }
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        javascript: false,
        offscreen: true,
        sandbox: true,
        webgl: false
      }
    });
    try {
      await win.loadURL(uri.toString(true));
      win.webContents.debugger.attach("1.1");
      const result = await win.webContents.debugger.sendCommand("Accessibility.getFullAXTree");
      const str = convertAXTreeToMarkdown(uri, result.nodes);
      this._webContentsCache.set(uri, { content: str, timestamp: Date.now() });
      return str;
    } catch (err) {
      console.log(err);
    } finally {
      win.destroy();
    }
    return "";
  }
}
export {
  NativeWebContentExtractorService
};
//# sourceMappingURL=webContentExtractorService.js.map
