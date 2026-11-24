// Makes the land of the home page's network map, docs/_includes/map-land.svg, from the owner's own map image,
// docs/public/triplebit-map.webp, so no outside map data is involved. The build does not run this: its output is
// committed, and it only needs running again if the image changes.
//
//   node tools/make-map.mjs
//
// It decodes the image in headless Chrome (a canvas), so it needs Puppeteer, which this repository does not install:
// it is imported by absolute path from the Larvatus extension's smoke tests (../ChatGPT/JMAP-Alias-Extension/smoke) and
// uses the installed Google Chrome (CHROME_PATH to choose another). Headless Chrome does not start inside Claude Code's
// sandbox, so run it outside.
//
// The image is sampled on a grid of COLS columns. A cell is land when most of it is the map's pale pink. A pin drawn
// over land hides the pink, so a cell that is covered by something else (a pin, a dashed line) counts as land when at
// least two of its four neighbours are land. The legend and the pins over the sea stay sea. The output is one path in
// grid units (one unit per cell): each run of land cells in a row is a horizontal line, which the stylesheet dashes
// into dots (stroke-dasharray 0 1 with round caps). It also prints the tips of the pins it finds, in the same units,
// as a starting point for docs/_data/locations.json.
import fs from "node:fs";
import puppeteer from "/Users/jonah/ChatGPT/JMAP-Alias-Extension/smoke/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js";

const COLS = 200;
const image = new URL("../docs/public/triplebit-map.webp", import.meta.url);
const output = new URL("../docs/_includes/map-land.svg", import.meta.url);
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage();
const dataUrl = `data:image/webp;base64,${fs.readFileSync(image).toString("base64")}`;
const result = await page.evaluate(async (src, cols) => {
  const img = new Image();
  img.src = src;
  await img.decode();
  const w = img.naturalWidth, h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, w, h).data;
  const at = (x, y) => { const i = (y * w + x) * 4; return [px[i], px[i + 1], px[i + 2], px[i + 3]]; };
  const pink = ([r, g, b, a]) => a > 200 && r > 225 && g > 190 && g < 235 && b > 190 && b < 235 && r - g > 10;
  const opaque = ([, , , a]) => a > 200;

  const step = w / cols, rows = Math.round(h / step);
  const land = [], covered = [];
  for (let row = 0; row < rows; row++) {
    land.push([]); covered.push([]);
    for (let col = 0; col < cols; col++) {
      let n = 0, p = 0, o = 0;
      for (let sy = 0; sy < 5; sy++) for (let sx = 0; sx < 5; sx++) {
        const x = Math.floor((col + (sx + .5) / 5) * step), y = Math.floor((row + (sy + .5) / 5) * step);
        if (y >= h) continue;
        const c = at(x, y); n++; if (pink(c)) p++; if (opaque(c)) o++;
      }
      land[row].push(p / n >= .5);
      covered[row].push(o / n >= .5 && p / n < .5);
    }
  }
  for (let pass = 0; pass < 3; pass++) {
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      if (land[row][col] || !covered[row][col]) continue;
      const near = [[0, 1], [0, -1], [1, 0], [-1, 0]].filter(([dy, dx]) => land[row + dy]?.[col + dx]).length;
      if (near >= 2) land[row][col] = true;
    }
  }
  let d = "", dots = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!land[row][col]) continue;
      let end = col;
      while (end + 1 < cols && land[row][end + 1]) end++;
      d += `M${col} ${row}h${end - col}`; dots += end - col + 1; col = end;
    }
  }

  // Pins: connected areas of the pins' red, cyan and grey; a pin's tip is its lowest pixel. The legend's sample pins
  // (bottom left, over the sea) are left out.
  const kinds = {
    core: ([r, g, b, a]) => a > 200 && r > 170 && g < 80 && b < 80,
    edge: ([r, g, b, a]) => a > 200 && r < 80 && g > 150 && b > 180,
    soon: ([r, g, b, a]) => a > 200 && Math.abs(r - g) < 12 && Math.abs(g - b) < 12 && r > 150 && r < 215,
  };
  const legend = (x, y) => x < w * .2 && y > h * .7;
  const pins = [];
  const s = 3, gw = Math.ceil(w / s), gh = Math.ceil(h / s);
  for (const [kind, test] of Object.entries(kinds)) {
    const seen = new Uint8Array(gw * gh);
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
      if (seen[gy * gw + gx] || !test(at(gx * s, gy * s)) || legend(gx * s, gy * s)) continue;
      const stack = [[gx, gy]]; seen[gy * gw + gx] = 1; let size = 0, maxY = 0, xs = [];
      while (stack.length) {
        const [x, y] = stack.pop(); size++;
        if (y > maxY) { maxY = y; xs = [x]; } else if (y === maxY) xs.push(x);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= gw || ny >= gh || seen[ny * gw + nx]) continue;
          if (!test(at(nx * s, ny * s))) continue;
          seen[ny * gw + nx] = 1; stack.push([nx, ny]);
        }
      }
      if (size < 150) continue;
      const tipX = xs.reduce((a, b) => a + b, 0) / xs.length * s, tipY = maxY * s;
      pins.push({ kind, x: +(tipX / step).toFixed(1), y: +(tipY / step).toFixed(1), size });
    }
  }
  return { w, h, cols, rows, d, dots, pins };
}, dataUrl, COLS);
await browser.close();

const svg = `<path class="land" d="${result.d}"/>\n`;
fs.writeFileSync(output, svg);
console.log(`${result.w}x${result.h} image, ${result.cols}x${result.rows} grid (viewBox 0 0 ${result.cols} ${result.rows}),`,
  `${result.dots} dots, ${Buffer.byteLength(svg)} bytes written to ${output.pathname}`);
for (const p of result.pins) console.log(`  ${p.kind} x ${p.x} y ${p.y} (${p.size} samples)`);
