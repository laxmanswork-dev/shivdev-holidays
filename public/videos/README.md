# /videos

Static video assets served as-is (same as `/images`).

## car.mp4 + car.webm (in place)

Referenced by the homepage hero (`src/pages/Home/index.jsx` via
`<HeroVideo src="/videos/car.mp4" webmSrc="/videos/car.webm" />`).
`HeroVideo` renders `car.webm` as the preferred `<source>` and
`car.mp4` as the fallback — any browser that can't decode WebM (or is
given only the mp4 prop) just falls through to the mp4, same as any
standard `<video>` source chain.

Current files (H.264 CRF 23 / VP9 CRF 32, audio stripped — the video
is always muted in the browser, so an audio track is dead weight):

- `car.mp4` — ~5.9 MB
- `car.webm` — ~4.0 MB

Both were re-encoded from an original ~33 MB / ~21 Mbit/s H.264 export
using `ffmpeg-static` (no system ffmpeg install needed — it's a normal
npm package with a bundled binary; not a project dependency, just used
as a one-off local tool). Re-run the same commands if the clip is ever
replaced:

```sh
npx ffmpeg-static -y -i input.mp4 -an -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart car.mp4
npx ffmpeg-static -y -i input.mp4 -an -c:v libvpx-vp9 -crf 32 -b:v 0 -pix_fmt yuv420p -row-mt 1 -deadline good -cpu-used 2 car.webm
```

(`npx ffmpeg-static` isn't a real CLI — resolve the actual binary path
via `node -e "console.log(require('ffmpeg-static'))"` after
`npm install ffmpeg-static` and call that path directly.)

Recommended specs for any future replacement clip:

- **Format:** MP4 (H.264) as the required fallback; a WebM (VP9)
  alongside it is a meaningful size win at the same visual quality,
  not required but worth doing
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
