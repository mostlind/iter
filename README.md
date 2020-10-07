# Iter

A wrapper around iterators exposing a set of high-level utility functions. Fully typed.

## Conditional Methods

Uses typescript's conditional types to expose type-specific functions
only on `Iter`'s containing the corresponding types.

For example, `Iter([1, 2, 3])` would offer `.sum()` and `.average()` as autocomplete suggestions, but `Iter(['a', 'b', 'c'])` would not.

`Iter(['a', 'b', 'c'])` would, however, expose `.join()`

## Usage

### Create `Iter`

`Iter`'s argument can be any iterator

```typescript
Iter([1, 2, 3]);
```

## `Iter<any>`

### `#map`

```typescript
Iter([1, 2, 3])
  .map((x) => x + 1)
  .toArray(); // [2, 3, 4]
```

### `#filter`

```typescript
Iter([1, 2, 3])
  .map((x) => x % 2 === 0)
  .toArray(); // [2]
```

### `#zip`

Creates pairs of values. Zip's argument can be any iterable. Will take until either iterater ends.

```typescript
Iter([1, 2, 3]).zip([1, 2, 3]).toArray(); // [[1, 1], [2, 2], [3, 3]]
```

### `#fold`

```typescript
Iter([1, 2, 3]).fold((a, b) => a + b, 0); // 6
```

### `#take`

```typescript
Iter([1, 2, 3]).take(2).toArray(); // [1, 2]
```

### `#drop`

```typescript
Iter([1, 2, 3]).drop(1).toArray(); // [2, 3]
```

### `#toArray`

```typescript
Iter([1, 2, 3]).toArray(); // [1, 2, 3]
```

## `Iter<number>`

### `#sum`

```typescript
Iter([1, 2, 3]).sum(); // 6
```

### `#average`

```typescript
Iter([1, 2, 3]).average(); // 2
```

## `Iter<string>`

### `#join`

```typescript
Iter(["a", "b", "c"]).join(" "); // 'a b c'
```

## `Iter<[string, T]>`

### `#collect`

Create an object where the key is the first element of the tuple, and the value is the second

```typescript
Iter([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]).collect(); // {a: 1, b: 2, c: 3}
```

## Utils

### `countFrom0`

```typescript
countFrom0().take(3).toArray(); // [1, 2, 3]
```

## Performance

In testing I found the performance to be very similar to a `for..of` loop.

Mapping over an array once is faster and uses less memory due to the overhead of iterators. But when chaining multiple operations on an array, e.g. `[].map(...).map(...).map(...)`, this library has much better speed and memory characteristics, due to `map` on array allocating a new array each call.

I found that mapping over ten million 11-character strings, `Array.prototype.map` used ~250 MB on the heap **_per `map`_**.

This library can have arbitrarily many calls to `#map` (or similar functions) without using more memory.

This means that code like:

```typescript
collection.map(add1).map(double).map(formatToString);
```

is irresponsible for large arrays, but not a problem for this library.

See `memory-test.ts` for the methodology used for testing
