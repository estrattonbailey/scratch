#! /usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const mri = require('mri')
const c = require('ansi-colors')
const { parse } = require('@babel/parser')
const generate = require('@babel/generator').default

const pkg = require('./package.json')

const { _ } = mri(process.argv.slice(2))
const file = _[0] ? path.resolve(__dirname, _[0]) : `./scratch_${Date.now()}.js`
const banner = `scratch v${pkg.version}`

console.clear()
console.log(c.green(banner))

try {
  require.resolve(file)
} catch (e) {
  fs.closeSync(fs.openSync(file, 'w'))
}

function run () {
  try {
    const code = fs.readFileSync(file, 'utf8')
    const ast = parse(code)

    const transpiled = generate(ast, {}, code).code

    console.clear()
    console.log(c.green(banner) + '\n')
    const res = eval(transpiled)
    if (res) console.log('\n> ' + res)
  } catch (e) {
    console.clear()
    console.log(c.red(banner) + '\n')
    console.log(e)
  }
}

run()

require('chokidar').watch(file).on('change', run)
