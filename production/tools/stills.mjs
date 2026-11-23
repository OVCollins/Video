// Render review stills: node tools/stills.mjs <Composition> <outDir> <frame,frame,...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const [comp = 'Landscape', outDir = 'out/stills', frames = '0'] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER ?? '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions: {gl: 'swangle'}});
const composition = await selectComposition({serveUrl, id: comp, puppeteerInstance: browser});
for (const fr of frames.split(',').map(Number)) {
  const out = path.join(outDir, `${comp}-${String(fr).padStart(4, '0')}.jpg`);
  const t = Date.now();
  await renderStill({serveUrl, composition, frame: fr, output: out, imageFormat: 'jpeg', jpegQuality: 85, puppeteerInstance: browser, scale: 0.5});
  console.log(out, Date.now() - t, 'ms');
}
await browser.close({silent: true});
