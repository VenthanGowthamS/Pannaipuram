# Marketing assets

Scripts and the install QR are tracked. The **generated binaries are not** (they are
git-ignored): the promo videos (`*.mp4`), music (`*.m4a`), `frames/` screenshots and
`../pamphlet.pdf`. Keep those in Google Drive → `Pannaipuram/Marketing`.

| File | What it does |
|---|---|
| `pannaipuram-install-qr.png` | QR for `https://app.pannaipuram.com/?install=1` |
| `capture3.js`, `capture4.js`, `frames.js`, `mask.js` | Capture app screens into `frames/` |
| `music2.py`, `music3.py` | Generate the two music tracks |
| `render2.sh` | Assemble frames + music into the promo videos (needs `ffmpeg`) |

To rebuild the videos: run the capture scripts, then `./render2.sh`.
