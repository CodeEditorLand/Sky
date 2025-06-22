var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { computed, effect, signal } from "@signia/core";
import { Effect, Stream } from "../../../effect";
class FileExplorerComponent {
  constructor(DirectoryUri, FileServiceInstance) {
    this.DirectoryUri = DirectoryUri;
    this.FileServiceInstance = FileServiceInstance;
  }
  static {
    __name(this, "FileExplorerComponent");
  }
  // --- State Signals ---
  // These signals hold the reactive state of our component.
  Entries = signal(
    "FileExplorer.Entries",
    []
  );
  IsLoading = signal("FileExplorer.IsLoading", true);
  Error = signal("FileExplorer.Error", null);
  lastVn = void 0;
  // --- Computed HTML Signal ---
  // This signal automatically re-calculates its value (the HTML string)
  // whenever any of its dependencies (`IsLoading`, `Error`, `Entries`) change.
  RenderedHtml = computed(
    "FileExplorer.RenderedHtml",
    () => {
      if (this.IsLoading.value) {
        return `<div>Loading...</div>`;
      }
      if (this.Error.value) {
        return `<div class="error-panel">Error: ${this.Error.value}</div>`;
      }
      const listItems = this.Entries.value.map(
        (entry) => `<li>
             <span class="icon">${entry.IsDirectory ? "\u{1F4C1}" : "\u{1F4C4}"}</span>
             <span class="name">${entry.Name}</span>
           </li>`
      ).join("");
      return `<div class="file-explorer"><ul>${listItems}</ul></div>`;
    }
  );
  /**
   * Mounts the component to a DOM element and starts its reactive lifecycle.
   * @param DomElement - The HTML element to render the component into.
   * @returns An `Unsubscriber` function to tear down the component.
   */
  Mount(DomElement) {
    this.runStreamEffect();
    const unsubscriber = effect("RenderFileExplorer", () => {
      DomElement.innerHTML = this.RenderedHtml.value;
      this.lastVn = this.RenderedHtml.value;
    });
    return unsubscriber;
  }
  runStreamEffect() {
    const fileStream = this.FileServiceInstance.list(this.DirectoryUri);
    const streamEffect = Stream.forEach(
      fileStream,
      (entry) => Effect.sync(() => {
        this.Entries.set([...this.Entries.value, entry]);
      })
    ).pipe(
      // 4. When the stream is done, set the loading state to false.
      Effect.andThen(() => this.IsLoading.set(false)),
      // 5. If any error occurs in the stream, set the error state.
      Effect.catchAll(
        (e) => Effect.sync(() => this.Error.set(e.message))
      )
    );
    Effect.runFork(streamEffect);
  }
}
export {
  FileExplorerComponent
};
//# sourceMappingURL=FileExplorerComponent.js.map
