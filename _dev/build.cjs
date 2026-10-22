const esbuild = require('esbuild');
esbuild.build({ entryPoints: ['src/entry.js'], bundle: true, minify: !process.argv.includes('--dev'), format: 'iife', globalName: 'SwiftScene', outfile: '../js/scene.js', target: ['es2019'], logLevel: 'info' }).catch(() => process.exit(1));
