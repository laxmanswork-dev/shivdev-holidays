# /images/about

The Home page's About section (see `src/pages/Home/AboutPromoImage.jsx`)
looks for a photo at:

```
/images/brand/laxman.png
```

(Not in this folder — it lives in `public/images/brand/laxman.png`.)

**Drop the photo in with exactly that filename** and it appears —
no code change needed. Until it's there, the section shows a plain
neutral placeholder instead of a broken image, so the page still
looks finished.

**Spec for the photo:**

- **Aspect ratio:** the frame crops to 4:5 (portrait, `object-fit: cover`)
  — a photo with the subject centered or slightly above center works best
- **Format:** `.png` (to use `.jpg`/`.webp` instead, change the one
  `PHOTO_SRC` constant in `AboutPromoImage.jsx` to match)
- **Content:** used as-is — the component doesn't crop, filter, or
  stylize it beyond the frame's rounded corners
