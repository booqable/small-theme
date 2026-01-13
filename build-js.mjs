import * as esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isWatch = process.argv.includes('--watch')

// Find all JS files in src/js (not in subdirectories)
const srcDir = path.join(__dirname, 'src/js')
const files = fs.readdirSync(srcDir)
const entryPoints = files
  .filter(file => file.endsWith('.js'))
  .map(file => path.join(srcDir, file))

const buildOptions = {
  entryPoints,
  bundle: true,
  minify: true,
  format: 'iife',
  outdir: 'assets',
  outExtension: { '.js': '.js' },
  drop: ['console'],
  logLevel: 'info'
}

if (isWatch) {
  const context = await esbuild.context(buildOptions)
  await context.watch()
  console.log('Watching JavaScript files for changes...')
} else {
  await esbuild.build(buildOptions)
  console.log('JavaScript build complete!')
}
