import { Iter, map, toArray, countFrom0 } from "./index";
import { performance } from "perf_hooks";

function chainedMaps() {
  return Array(1e7)
    .fill("some string")
    .filter((l, i) => i < 5000000)
    .map((s, i) => [s, i])
    .map((s) => JSON.stringify(s))
    .map((s) => s.toUpperCase())
    .map((s: string) => s.toLowerCase())
    .map((s) => s.length)
    .map((s) => s * s);
}

function baseline() {
  return Array(1e7)
    .fill("some string")
    .filter((l, i) => i < 5000000)
    .map((s: string, i) => {
      return JSON.stringify([s, i]).toUpperCase().toLowerCase().length ** 2;
    });
}

function withIter() {
  return Iter(Array<string>(1e7).fill("some string"))
    .filter((l, i) => i < 5000000)
    .zip(countFrom0())
    .map((s) => JSON.stringify(s).toUpperCase())
    .map((s) => s.toLowerCase())
    .map((s) => s.length)
    .map((s) => s * s)
    .toArray();
}

function iterSingleMap() {
  const arr = Iter(Array<string>(1e7).fill("some string"))
    .filter((val, i) => i < 5000000)
    .zip(countFrom0())
    .map((s) => {
      const count = JSON.stringify(s).toUpperCase().toLowerCase().length;

      return count * count;
    })
    .toArray();

  return arr;
}

// function forLoop() {
//   const arr = [];
//   const string = "some string";
//   for (let i = 0; i < 1e7; i++) {
//     const count = string.toUpperCase().toLowerCase().length;
//     arr.push(count * count);
//   }
//   return arr;
// }

// function justIterMap() {
//   return toArray(
//     map(Array<string>(1e7).fill("some string"), (s: string) => {
//       const count = s.toUpperCase().toLowerCase().length;
//       return count * count;
//     })
//   );
// }

function forOfLoop() {
  let arr = [];
  let index = 0;
  for (let item of Array<string>(1e7).fill("some string")) {
    if (index < 500000) {
      const count =
        JSON.stringify([item, index]).toUpperCase().toLowerCase().length ** 2;
      arr.push(count * count);
    }
  }
  return arr;
}

function checkUsage(fn: CallableFunction) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const used = process.memoryUsage().heapUsed / 1024 / 1024;

  console.log(fn.name);
  console.log(end - start);
  console.log(result.length);
  console.log(`The script uses approximately ${used} MB`);
}

checkUsage(withIter);
