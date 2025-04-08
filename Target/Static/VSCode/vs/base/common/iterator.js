var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isIterable } from "./types.js";
var Iterable;
((Iterable2) => {
  function is(thing) {
    return thing && typeof thing === "object" && typeof thing[Symbol.iterator] === "function";
  }
  Iterable2.is = is;
  __name(is, "is");
  const _empty = Object.freeze([]);
  function empty() {
    return _empty;
  }
  Iterable2.empty = empty;
  __name(empty, "empty");
  function* single(element) {
    yield element;
  }
  Iterable2.single = single;
  __name(single, "single");
  function wrap(iterableOrElement) {
    if (is(iterableOrElement)) {
      return iterableOrElement;
    } else {
      return single(iterableOrElement);
    }
  }
  Iterable2.wrap = wrap;
  __name(wrap, "wrap");
  function from(iterable) {
    return iterable || _empty;
  }
  Iterable2.from = from;
  __name(from, "from");
  function* reverse(array) {
    for (let i = array.length - 1; i >= 0; i--) {
      yield array[i];
    }
  }
  Iterable2.reverse = reverse;
  __name(reverse, "reverse");
  function isEmpty(iterable) {
    return !iterable || iterable[Symbol.iterator]().next().done === true;
  }
  Iterable2.isEmpty = isEmpty;
  __name(isEmpty, "isEmpty");
  function first(iterable) {
    return iterable[Symbol.iterator]().next().value;
  }
  Iterable2.first = first;
  __name(first, "first");
  function some(iterable, predicate) {
    let i = 0;
    for (const element of iterable) {
      if (predicate(element, i++)) {
        return true;
      }
    }
    return false;
  }
  Iterable2.some = some;
  __name(some, "some");
  function find(iterable, predicate) {
    for (const element of iterable) {
      if (predicate(element)) {
        return element;
      }
    }
    return void 0;
  }
  Iterable2.find = find;
  __name(find, "find");
  function* filter(iterable, predicate) {
    for (const element of iterable) {
      if (predicate(element)) {
        yield element;
      }
    }
  }
  Iterable2.filter = filter;
  __name(filter, "filter");
  function* map(iterable, fn) {
    let index = 0;
    for (const element of iterable) {
      yield fn(element, index++);
    }
  }
  Iterable2.map = map;
  __name(map, "map");
  function* flatMap(iterable, fn) {
    let index = 0;
    for (const element of iterable) {
      yield* fn(element, index++);
    }
  }
  Iterable2.flatMap = flatMap;
  __name(flatMap, "flatMap");
  function* concat(...iterables) {
    for (const item of iterables) {
      if (isIterable(item)) {
        yield* item;
      } else {
        yield item;
      }
    }
  }
  Iterable2.concat = concat;
  __name(concat, "concat");
  function reduce(iterable, reducer, initialValue) {
    let value = initialValue;
    for (const element of iterable) {
      value = reducer(value, element);
    }
    return value;
  }
  Iterable2.reduce = reduce;
  __name(reduce, "reduce");
  function length(iterable) {
    let count = 0;
    for (const _ of iterable) {
      count++;
    }
    return count;
  }
  Iterable2.length = length;
  __name(length, "length");
  function* slice(arr, from2, to = arr.length) {
    if (from2 < -arr.length) {
      from2 = 0;
    }
    if (from2 < 0) {
      from2 += arr.length;
    }
    if (to < 0) {
      to += arr.length;
    } else if (to > arr.length) {
      to = arr.length;
    }
    for (; from2 < to; from2++) {
      yield arr[from2];
    }
  }
  Iterable2.slice = slice;
  __name(slice, "slice");
  function consume(iterable, atMost = Number.POSITIVE_INFINITY) {
    const consumed = [];
    if (atMost === 0) {
      return [consumed, iterable];
    }
    const iterator = iterable[Symbol.iterator]();
    for (let i = 0; i < atMost; i++) {
      const next = iterator.next();
      if (next.done) {
        return [consumed, Iterable2.empty()];
      }
      consumed.push(next.value);
    }
    return [consumed, { [Symbol.iterator]() {
      return iterator;
    } }];
  }
  Iterable2.consume = consume;
  __name(consume, "consume");
  async function asyncToArray(iterable) {
    const result = [];
    for await (const item of iterable) {
      result.push(item);
    }
    return Promise.resolve(result);
  }
  Iterable2.asyncToArray = asyncToArray;
  __name(asyncToArray, "asyncToArray");
})(Iterable || (Iterable = {}));
export {
  Iterable
};
//# sourceMappingURL=iterator.js.map
