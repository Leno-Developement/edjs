import { stdin, stdout } from "process";
import { createInterface } from "readline";
import { readdirSync, statSync } from "fs";

console.clear();

async function prompt(q: string) {
  const itf = createInterface(stdin as any, stdout as any);
  return new Promise<string>((r) => {
    itf.question(q, (input) => {
      itf.close();
      r(input);
    });
  });
}

function readdir(path: string) {
  let files = readdirSync(path);
  let results: string[] = [];

  for (let file of files) {
    let fullPath = path + "/" + file;
    if (statSync(fullPath).isDirectory()) {
      results = results.concat(readdir(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

let files = readdir("./dist/__tests__").filter(
  (x) => x.endsWith(".js") && !x.includes("runner.js"),
);

interface Test {
  path: string;
  name: string;
  run: () => void;
}

let tests = new Map<string, Test>();
for (let file of files) {
  let path = "../." + file;
  let name = file.replace(".js", "").replace("./dist/__tests__/", "");
  let run = () => require(path);
  tests.set(name, {
    path,
    name,
    run,
  });
}

run();

async function run() {
  if (tests.size < 1) return noTests();

  console.log(
    `Available Tests: ${[...tests.values()].map((x) => x.name).join(", ")}`,
  );
  let inputs = await prompt("Input: ");
  let inputTests = inputs
    .toLowerCase()
    .split(" ")
    .filter((x) => tests.has(x));
  if (inputTests.length < 1) return noTests();

  for (let t of inputTests) {
    console.log(`Running ${t}`);
    tests.get(t)?.run();
  }
}

function noTests() {
  console.log("No tests found.");
}
