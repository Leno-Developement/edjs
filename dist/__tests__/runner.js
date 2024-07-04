"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = require("process");
const readline_1 = require("readline");
const fs_1 = require("fs");
console.clear();
async function prompt(q) {
    const itf = (0, readline_1.createInterface)(process_1.stdin, process_1.stdout);
    return new Promise((r) => {
        itf.question(q, (input) => {
            itf.close();
            r(input);
        });
    });
}
function readdir(path) {
    let files = (0, fs_1.readdirSync)(path);
    let results = [];
    for (let file of files) {
        let fullPath = path + "/" + file;
        if ((0, fs_1.statSync)(fullPath).isDirectory()) {
            results = results.concat(readdir(fullPath));
        }
        else {
            results.push(fullPath);
        }
    }
    return results;
}
let files = readdir("./dist/__tests__").filter((x) => x.endsWith(".js") && !x.includes("runner.js"));
let tests = new Map();
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
    if (tests.size < 1)
        return noTests();
    console.log(`Available Tests: ${[...tests.values()].map((x) => x.name).join(", ")}`);
    let inputs = await prompt("Input: ");
    let inputTests = inputs
        .toLowerCase()
        .split(" ")
        .filter((x) => tests.has(x));
    if (inputTests.length < 1)
        return noTests();
    for (let t of inputTests) {
        console.log(`Running ${t}`);
        tests.get(t)?.run();
    }
}
function noTests() {
    console.log("No tests found.");
}
//# sourceMappingURL=runner.js.map