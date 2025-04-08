var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class NotebookPerfMarks {
  static {
    __name(this, "NotebookPerfMarks");
  }
  _marks = {};
  get value() {
    return { ...this._marks };
  }
  mark(name) {
    if (this._marks[name]) {
      console.error(`Skipping overwrite of notebook perf value: ${name}`);
      return;
    }
    this._marks[name] = Date.now();
  }
}
export {
  NotebookPerfMarks
};
//# sourceMappingURL=notebookPerformance.js.map
