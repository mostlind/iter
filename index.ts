export function* map<T, U>(iter: Iterable<T>, fn: (mapInput: T) => U) {
  for (let value of iter) {
    yield fn(value);
  }
}

function* flatMap<T, U>(
  iter: Iterable<T>,
  fn: (flatMapInput: T) => Iterable<U>
) {
  for (let value of iter) {
    yield* fn(value);
  }
}

function* take<T>(iter: Iterable<T>, amount: number) {
  const iterator = iter[Symbol.iterator]();
  let result = iterator.next();

  for (let i = 0; i < amount && !result.done; i++) {
    yield result.value;
    result = iterator.next();
  }
}

function* filter<T>(
  iter: Iterable<T>,
  predicate: (filterInput: T, index: number) => boolean
) {
  let count = 0;
  for (let value of iter) {
    if (predicate(value, count)) {
      yield value;
    }
    count += 1;
  }
}

function* zip<T, U>(iter: Iterable<T>, iter2: Iterable<U>): Generator<[T, U]> {
  const iterator1 = iter[Symbol.iterator]();
  const iterator2 = iter2[Symbol.iterator]();
  let result = iterator1.next();
  let result2 = iterator2.next();
  while (!result.done && !result2.done) {
    yield [result.value, result2.value];
    result = iterator1.next();
    result2 = iterator2.next();
  }
}

function* drop<T>(iter: Iterable<T>, count: number) {
  let loopCount = 0;
  for (let value of iter) {
    if (loopCount < count) {
      loopCount++;
      continue;
    }
    yield value;
  }
}

function fold<T, U>(
  iter: Iterable<T>,
  reducer: (agg: U, val: T) => U,
  base: U
) {
  let agg = base;
  for (let value of iter) {
    agg = reducer(agg, value);
  }
  return agg;
}

export function toArray<T>(iter: Iterable<T>): T[] {
  return fold(
    iter,
    (arr, item) => {
      arr.push(item);
      return arr;
    },
    []
  );
}

function sum<T extends number>(iter: Iterable<T>) {
  return fold(iter, (agg, item) => agg + item, 0);
}

function average<T extends number>(iter: Iterable<T>) {
  const [count, sum] = fold(
    iter,
    ([count, agg], item) => [count + 1, agg + item],
    [0, 0]
  );
  if (count === 0) {
    return 0;
  }
  return sum / count;
}

function join<T extends string>(iter: Iterable<T>, joiner: string) {
  const first = Iter(iter).take(1);
  const rest = Iter(iter).drop(1);
  return fold(
    rest,
    (agg, item) => agg + joiner + item,
    first[Symbol.iterator]().next().value || ""
  );
}

function collect<U, T extends [string, U]>(iter: Iterable<T>) {
  return fold(
    iter,
    (agg, [key, val]) => {
      agg[key] = val;
      return agg;
    },
    {}
  );
}

// function split<T>(
//   iter: Iterator<T>,
//   splitter: (t: T) => boolean
// ): [Iterator<T>, Iterator<T>] {
//   return [
//     filter<T>(iter[Symbol.iterator], (t) => !splitter(t)),
//     filter(iter[Symbol.iterator], splitter),
//   ];
// }

interface IterBase<T> {
  map<U>(fn: (t: T) => U): Iter<U>;
  flatMap<U>(fn: (t: T) => Iterable<U>): Iter<U>;
  filter(predicate: (t: T, index: number) => boolean): Iter<T>;
  fold<U>(reducer: (agg: U, val: T) => U, base: U): U;
  take(count: number): Iter<T>;
  drop(count: number): Iter<T>;
  zip<U>(iter: Iterable<U>): Iter<[T, U]>;
  toArray: () => T[];
  [Symbol.iterator]: () => Iterator<T>;
}

interface IterNumber extends IterBase<number> {
  sum(): number;
  average(): number;
}

interface IterString extends IterBase<string> {
  join(joiner: string): string;
}

interface IterKeyVal<U> extends IterBase<[string, U]> {
  collect(): { [key: string]: U };
}

type Iter<T> = T extends number
  ? IterNumber
  : T extends string
  ? IterString
  : T extends [string, infer U]
  ? IterKeyVal<U>
  : IterBase<T>;

export function Iter<T>(iter: Iterable<T>): Iter<T>;
export function Iter(iter: any) {
  return {
    map: (fn) => Iter(map(iter, fn)),
    flatMap: (fn) => Iter(flatMap(iter, fn)),
    filter: (fn) => Iter(filter(iter, fn)),
    fold: (reducer, base) => fold(iter, reducer, base),
    take: (count) => Iter(take(iter, count)),
    drop: (count) => Iter(drop(iter, count)),
    zip: (iter2) => Iter(zip(iter, iter2)),
    toArray: () => toArray(iter),
    // these use some trickery to make typescript stop complaining
    ...(true ? { sum: () => sum(iter) } : {}),
    ...(true ? { average: () => average(iter) } : {}),
    ...(true ? { join: (joiner: string) => join(iter, joiner) } : {}),
    ...(true ? { collect: () => collect(iter) } : {}),
    [Symbol.iterator]: () => iter[Symbol.iterator](),
  };
}

function* countIter() {
  let count = 0;
  while (true) {
    yield count;
    count += 1;
  }
}

export function countFrom0() {
  return Iter(countIter());
}
