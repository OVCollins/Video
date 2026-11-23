import {Config} from '@remotion/cli/config';

// Pre-installed headless Chromium in this environment. Remove this line on a
// normal workstation and Remotion will download its own browser.
if (process.env.REMOTION_CHROME !== 'download') {
  Config.setBrowserExecutable(
    process.env.REMOTION_BROWSER ??
      '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
  );
}
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(4);
Config.setChromiumOpenGlRenderer('swangle');
