#! /usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const mri = require("mri");
const c = require("ansi-colors");
const { parse } = require("@babel/parser");
const generate = require("@babel/generator").default;

const pkg = require("./package.json");

const cwd = process.cwd();
const { _ } = mri(process.argv.slice(2));
const file = _[0]
  ? path.resolve(cwd, _[0])
  : path.resolve(cwd, `./scratch_${Date.now()}.js`);
const banner = `scratch v${pkg.version}`;

console.clear();
console.log(c.green(banner));

try {
  require.resolve(file);
} catch (e) {
  fs.closeSync(fs.openSync(file, "w"));
}

const reqRegEx = /require\('(.+)'\)/;

function run() {
  try {
    const code = fs.readFileSync(file, "utf8");

    const files = code
      .match(new RegExp(reqRegEx, 'gm'))
      .map(c => c.match(reqRegEx)[1])
      .filter(p => Boolean(p));

    files.forEach(file => {
      delete require.cache[require.resolve(cwd, file)]
    });

    const ast = parse(code.replace(/\.\//g, cwd + "/"));

    const transpiled = generate(ast, {}, code).code;

    console.clear();
    console.log(c.green(banner) + "\n");
    const res = eval(transpiled);
    if (res) console.log("\n> " + res);
  } catch (e) {
    console.clear();
    console.log(c.red(banner) + "\n");
    console.log(e);
  }
}

run();

require("chokidar")
  .watch(file)
  .on("change", run);
