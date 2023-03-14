#! /usr/bin/env node
"use strict";

require('esbuild-register/dist/node').register()

const fs = require("fs");
const path = require("path");
const c = require("kleur");
require('consola').create({
  level: 5,
}).wrapConsole()

const pkg = require("./package.json");

const banner = `scratch v${pkg.version}`;
const cwd = process.cwd();
const [entry] = process.argv.slice(2)

if (!entry) {
  console.error(`\n${c.yellow(banner)}\n\nUsage: npx ${pkg.name} ${c.green('<file>')}\n`)
  process.exit(1)
}

fs.mkdirSync(path.join(cwd, ".scratch"), { recursive: true });

const file = path.resolve(cwd, entry)

try {
  require.resolve(file);
} catch (e) {
  fs.closeSync(fs.openSync(file, "w"));
}

function run() {
  console.clear();
  console.log(c.green(banner) + "\n");

  try {
    const outfile = path.join(cwd, ".scratch", path.basename(file).split(".").reverse().slice(1).reverse() + ".js");
    try {
      delete require.cache[require.resolve(outfile)]
    } catch (e) {}
    require('esbuild').buildSync({
      entryPoints: [file],
      bundle: false,
      outfile,
      sourcemap: true,
      format: "esm",
    })
    require(outfile)
  } catch (e) {
    console.error(e);
  }
}

const watcher = require('watch-dependency-graph').create()
watcher.on('change', run)
watcher.add(file)

run();
