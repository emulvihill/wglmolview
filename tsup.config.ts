import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  outDir: "www/dist",
  target: ['es2015'],
  format: ["iife"],
  minify: true,
  dts: true
});