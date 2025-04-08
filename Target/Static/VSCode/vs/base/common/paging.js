var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { range } from "./arrays.js";
import { CancellationToken, CancellationTokenSource } from "./cancellation.js";
import { CancellationError } from "./errors.js";
function createPage(elements) {
  return {
    isResolved: !!elements,
    promise: null,
    cts: null,
    promiseIndexes: /* @__PURE__ */ new Set(),
    elements: elements || []
  };
}
__name(createPage, "createPage");
function singlePagePager(elements) {
  return {
    firstPage: elements,
    total: elements.length,
    pageSize: elements.length,
    getPage: /* @__PURE__ */ __name((pageIndex, cancellationToken) => {
      return Promise.resolve(elements);
    }, "getPage")
  };
}
__name(singlePagePager, "singlePagePager");
class PagedModel {
  static {
    __name(this, "PagedModel");
  }
  pager;
  pages = [];
  get length() {
    return this.pager.total;
  }
  constructor(arg) {
    this.pager = Array.isArray(arg) ? singlePagePager(arg) : arg;
    const totalPages = Math.ceil(this.pager.total / this.pager.pageSize);
    this.pages = [
      createPage(this.pager.firstPage.slice()),
      ...range(totalPages - 1).map(() => createPage())
    ];
  }
  isResolved(index) {
    const pageIndex = Math.floor(index / this.pager.pageSize);
    const page = this.pages[pageIndex];
    return !!page.isResolved;
  }
  get(index) {
    const pageIndex = Math.floor(index / this.pager.pageSize);
    const indexInPage = index % this.pager.pageSize;
    const page = this.pages[pageIndex];
    return page.elements[indexInPage];
  }
  resolve(index, cancellationToken) {
    if (cancellationToken.isCancellationRequested) {
      return Promise.reject(new CancellationError());
    }
    const pageIndex = Math.floor(index / this.pager.pageSize);
    const indexInPage = index % this.pager.pageSize;
    const page = this.pages[pageIndex];
    if (page.isResolved) {
      return Promise.resolve(page.elements[indexInPage]);
    }
    if (!page.promise) {
      page.cts = new CancellationTokenSource();
      page.promise = this.pager.getPage(pageIndex, page.cts.token).then((elements) => {
        page.elements = elements;
        page.isResolved = true;
        page.promise = null;
        page.cts = null;
      }, (err) => {
        page.isResolved = false;
        page.promise = null;
        page.cts = null;
        return Promise.reject(err);
      });
    }
    const listener = cancellationToken.onCancellationRequested(() => {
      if (!page.cts) {
        return;
      }
      page.promiseIndexes.delete(index);
      if (page.promiseIndexes.size === 0) {
        page.cts.cancel();
      }
    });
    page.promiseIndexes.add(index);
    return page.promise.then(() => page.elements[indexInPage]).finally(() => listener.dispose());
  }
}
class DelayedPagedModel {
  constructor(model, timeout = 500) {
    this.model = model;
    this.timeout = timeout;
  }
  static {
    __name(this, "DelayedPagedModel");
  }
  get length() {
    return this.model.length;
  }
  isResolved(index) {
    return this.model.isResolved(index);
  }
  get(index) {
    return this.model.get(index);
  }
  resolve(index, cancellationToken) {
    return new Promise((c, e) => {
      if (cancellationToken.isCancellationRequested) {
        return e(new CancellationError());
      }
      const timer = setTimeout(() => {
        if (cancellationToken.isCancellationRequested) {
          return e(new CancellationError());
        }
        timeoutCancellation.dispose();
        this.model.resolve(index, cancellationToken).then(c, e);
      }, this.timeout);
      const timeoutCancellation = cancellationToken.onCancellationRequested(() => {
        clearTimeout(timer);
        timeoutCancellation.dispose();
        e(new CancellationError());
      });
    });
  }
}
function mapPager(pager, fn) {
  return {
    firstPage: pager.firstPage.map(fn),
    total: pager.total,
    pageSize: pager.pageSize,
    getPage: /* @__PURE__ */ __name((pageIndex, token) => pager.getPage(pageIndex, token).then((r) => r.map(fn)), "getPage")
  };
}
__name(mapPager, "mapPager");
export {
  DelayedPagedModel,
  PagedModel,
  mapPager,
  singlePagePager
};
//# sourceMappingURL=paging.js.map
