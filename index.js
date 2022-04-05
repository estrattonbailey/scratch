#! /usr/bin/env node
"use strict";

require('esbuild-register/dist/node').register()

const fs = require("fs");
const path = require("path");
const c = require("kleur");

const pkg = require("./package.json");

const banner = `scratch v${pkg.version}`;
const cwd = process.cwd();
const [entry] = process.argv.slice(2)

console.clear();
console.log(c.green(banner) + "\n");

if (!entry) {
  console.error(`\n${c.yellow(banner)}\n\nUsage: npx ${pkg.name} ${c.green('<file>')}\n`)
  process.exit(1)
}

const file = path.resolve(cwd, entry)

try {
  require.resolve(file);
} catch (e) {
  fs.closeSync(fs.openSync(file, "w"));
}

function run() {
  try {
    require(file)
  } catch (e) {
    console.error(e);
  }
}

const watcher = require('watch-dependency-graph').create()
watcher.on('change', run)
watcher.add(file)

run();
