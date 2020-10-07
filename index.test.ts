import { Iter, countFrom0 } from "./index";

test("calculates average lengths", () => {
  const dates = [new Date(1), new Date(2), new Date(3), new Date(4)];

  const iterDates = Iter(dates).map((date) => date.getTime());

  const averageLength = Iter([1, 2, 3, 4])
    .zip(iterDates.drop(1))
    .map(([earlier, later]) => later - earlier)
    .average();

  expect(averageLength).toBe(1);
});

test("collects pairs into object", () => {
  const pairs: [string, number][] = [
    ["1", 1],
    ["2", 2],
    ["3", 3],
  ];
  const obj = Iter(pairs).collect();
  expect(obj).toEqual({ "1": 1, "2": 2, "3": 3 });
});

test("transforms list of key/val objects into object", () => {
  const things = [
    { key: "1234", value: 1234 },
    { key: "4567", value: 4567 },
    { key: "6789", value: 6789 },
  ];

  const keyValue = Iter(things.map(({ key }) => key))
    .zip(things.map(({ value }) => value))
    .collect();

  expect(keyValue).toEqual({ "1234": 1234, "4567": 4567, "6789": 6789 });
});

test("take works", () => {
  const items = Iter([1, 2, 3]).take(2).toArray();
  expect(items).toEqual([1, 2]);
});

test("filter works", () => {
  const isEven = (n: number) => n % 2 === 0;
  const items = Iter([1, 2, 3, 4]).filter(isEven).toArray();
  expect(items).toEqual([2, 4]);
});

test("fold works", () => {
  const items = Iter([1, 2, 3, 4]).fold((agg, item) => agg + item, 0);
  expect(items).toBe(10);
});

test("sum works", () => {
  const items = Iter([1, 2, 3, 4]).sum();
  expect(items).toBe(10);
});

test("join works", () => {
  const items = Iter(["hello", "world!"]).join(" ");
  expect(items).toBe("hello world!");
});

test("join on empty returns empty string", () => {
  const items = Iter([] as string[]).join(" ");
  expect(items).toBe("");
});

test("calculates average correctly", () => {
  const average = Iter([0, 20, 40]).average();
  expect(average).toBe(20);
});

test("average on empty returns 0", () => {
  const average = Iter([] as number[]).average();
  expect(average).toBe(0);
});

test("count works", () => {
  const oneThroughFive = countFrom0().drop(1).take(5).toArray();
  expect(oneThroughFive).toEqual([1, 2, 3, 4, 5]);
});

test("flatMap works", () => {
  const things = Iter([1, 1, 1])
    .flatMap(() => [1, 2])
    .toArray();
  expect(things).toEqual([1, 2, 1, 2, 1, 2]);
});
