# /videos

Static video assets served as-is (same as `/images`).

## car.mp4 + car.webm (in place)

Referenced by the homepage hero (`src/pages/Home/index.jsx` via
`<HeroVideo src="/videos/car.mp4" webmSrc="/videos/car.webm" />`).
`HeroVideo` lists `car.mp4` (H.264) as the first `<source>` — the one format
every phone, tablet and desktop browser plays, including Safari/iOS, where a
WebM listed first can be picked and then stall — and `car.webm` as the
backup for a browser that can't decode H.264.

Current files (H.264 CRF 26 / VP9 CRF 34, audio stripped — the video
is always muted in the browser, so an audio track is dead weight):

- `car.mp4` — ~3.6 MB (1920×1080, ~10.6s)
- `car.webm` — ~2.9 MB (real VP9 WebM, same clip)

Both were re-encoded from an original ~28 MB / ~21 Mbit/s H.264 export
using `ffmpeg-static` (no system ffmpeg install needed — it's a normal
npm package with a bundled binary; not a project dependency, just used
as a one-off local tool). Re-run the same commands if the clip is ever
replaced:

```sh
npx ffmpeg-static -y -i input.mp4 -an -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p -preset slow -crf 26 -maxrate 4500k -bufsize 9000k -movflags +faststart car.mp4
npx ffmpeg-static -y -i input.mp4 -an -c:v libvpx-vp9 -pix_fmt yuv420p -b:v 0 -crf 34 -row-mt 1 -cpu-used 2 -deadline good car.webm
```

(`npx ffmpeg-static` isn't a real CLI — resolve the actual binary path
via `node -e "console.log(require('ffmpeg-static'))"` after
`npm install ffmpeg-static` and call that path directly.)

Recommended specs for any future replacement clip:

- **Format:** MP4 (H.264) is required and is tried first; a WebM (VP9)
  alongside it is an optional backup. Both files must be the format their
  extension says, and each must stay under 25 MiB (Cloudflare's per-file
  static-asset limit)
- **Duration:** 8–15s, loop-friendly (first and last frame close in
  composition so the loop isn't jarring)
- **Dimensions:** 1920×1080 (16:9) is plenty — it's displayed with
  `object-fit: cover` behind hero text, so extreme detail is wasted
- **File size:** aim under ~6 MB for the mp4 — it's requested on every
  homepage visit, above the fold. No audio track — always muted.
- **Content:** a car/travel/road clip that stays visually calm through
  the middle (where the eyebrow/heading/CTA row sit) — a bottom- or
  top-weighted composition works best with the existing scrim

If both files are missing or fail to load, the hero falls back to its
normal ice-blue background with no video — nothing breaks.
