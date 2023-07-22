import * as esbuild from 'esbuild'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  outfile: 'dist/main.js',
  define: {
    global: 'window',
  },
  plugins: [
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true
    })
  ]
})