# THE MESSIAH HAS COME! 2026 Festival of Nine Lessons & Carol trailer

This is the promotional trailer for **Christ's Chosen Church of God International, Lagos Area**. The project is built with Remotion (React and TypeScript) and can be edited for future changes.

| Deliverable | File |
|---|---|
| Main video, 16:9, 1920×1080, 30 fps, H.264 + AAC | `out/Messiah-Has-Come_16x9_1080p.mp4` |
| Social video, 9:16, 1080×1920, 30 fps (recomposed, not cropped) | `out/Messiah-Has-Come_9x16_1080x1920.mp4` |
| Final soundtrack (mixed, −14 LUFS) | `public/audio/soundtrack.wav` |
| Narration on its own | `public/audio/voiceover.wav` |
| Stems: music MIDI, music render, SFX, processed voice | `public/audio/stems/` |

The running time is **82.5 seconds**. That is the narration at a natural pace, plus a 3.2-second musical opening and a held final frame.

---

## Items to confirm before public release ⚠️

1. **Apostle Samuel Oguibe's title.** The flyer says *"Head Okokomaiko Division"*. The brief says **"Featured Minister"**. The video uses the brief's title.
2. **Senior Apostle's title.** The flyer says *"Spiritual Leader / Chairman Church Council"*. The brief says **"Spiritual Leader and General Overseer, Christ's Chosen Church of God Int'l"**. The video uses the brief's title.
3. **Spelling "OGUiBE".** The brief has a lowercase *i*. This looked like a typing error, so the video shows **OGUIBE**, which matches the flyer and the photo file name.
4. **"The Elect of God".** This appears under the Senior Apostle's name as an epithet. It comes from the approved narration and the flyer, so nothing was invented.
5. **Ketu choir photo.** The supplied picture is a screenshot of a video, with a ▶ play button over it. The button was digitally removed (`assets/choirs/ketu-cleaned.jpg`; the original is kept unchanged). A clean photo would be better. Swap it in `src/scenes/PeopleScenes.tsx` → `CHOIRS`.
6. **Pronunciation of names.** The narration is AI-generated. Nigerian names and places use hand-tuned phonetics in `tools/voiceover.py` → `PRON`. Please listen to Unuefe Ikhuiwu, Ehigiamusoe, Ogbeide, Oguibe, Ehiliz, Fadunsi and Oke-Ira. Corrections are a one-line change, followed by a rebuild.
7. **Narration voice.** The narration uses a synthetic neural voice (Kokoro TTS, voice `af_heart`), not a human voice actor. For a broadcast-grade result, a human recording can be dropped in as `public/audio/voiceover.wav`. Cue timings in `src/data/timing.json` would then need updating.

The narration follows the approved script **verbatim**. `tools/voiceover.py` contains an assertion that the cue text, joined together, equals the approved script exactly. Abbreviations are only *spoken* in full: "(Dr)" is read as "Doctor", "Coun." as "Councillor", "10 AM" as "ten A.M.". On-screen titles are never narrated.

---

## Scene structure (timings come from the narration)

| # | Time | Scene |
|---|---|---|
| 1 | 0:00 | Darkness opens to warm light. Pine garland, swinging gold bells, ornaments and parallax foreground branches. The opening line appears word by word. |
| 2 | 0:07 | The church emblem medallion, "CHRIST'S CHOSEN CHURCH OF GOD INTERNATIONAL / LAGOS AREA / proudly presents". |
| 3 | 0:12 | The camera pushes into a wreath with bells and bows. "2026 / FESTIVAL / OF NINE LESSONS / & CAROL". |
| 3b | 0:17.7 | **Theme impact.** The camera flies through the wreath, then a flash, shockwave, Star of Bethlehem, god rays and particle burst. **THE MESSIAH HAS COME!** |
| 4 | 0:20 | JOIN US. A calendar card (rolling date), a gold clock (hands sweep to 10:00) and a venue card (location pin drops onto a map). |
| 5 | 0:32 | Senior Apostle (Dr) D.E.O. Unuefe Ikhuiwu: gilded arch portrait, spotlight, star. |
| 6 | 0:40 | Featuring: Apostle Samuel Oguibe, then Ehiliz (Guest Artiste). Each has their own reveal. |
| 7 | 0:46 | Divisional Mass Choirs: concert beams, a 3-D wall of choir photos, then eight photo cards, each revealed as its name is spoken. |
| 8 | 0:57 | Elder Frank Overo, Lagos Area Choir Master, with a musical-staff motif. |
| 9 | 1:00 | Deacon Coun. Godwin Ehigiamusoe, Chairman, Planning Committee, on a golden backdrop. |
| 10 | 1:05 | Elder Kennedy Ogbeide, Secretary, Planning Committee. |
| 11 | 1:09 | Finale. A rising Star of Bethlehem and lit Christmas trees. The spoken lines appear, then everything settles into the final composition: logo, church name, festival title, theme, date and time, venue, DON'T MISS IT! |

## Music and sound (all original or public domain)

- **Score**: an original orchestration of public-domain carols. *O Come, All Ye Faithful* plays under the announcement, *Hark! The Herald Angels Sing* under the choirs, and *Joy to the World* in the finale. Original underscore fills the other sections. The score is written as MIDI in `tools/music.py`, with a tempo map solved so that every downbeat lands on a scene cut. It is rendered with FluidSynth and the GPL-licensed FluidR3 General MIDI soundfont.
- **SFX**: all synthesised in `tools/mix.py`. They are whooshes, risers, cinematic impacts, light-sweep shimmers, clock ticks and sleigh-bell jingles.
- **Mix**: music is side-chain ducked by about 9.5 dB under the voice, lifted for the opening and the finale, and loudness-normalised to −14 LUFS / −1.5 dBTP.

## Toolchain

Remotion 4, React 18 and TypeScript; GSAP (easing curves); SVG and CSS for all procedural graphics (pine branches, bells, baubles, bows, wreath, trees, star, light rays, particles); Kokoro-82M TTS (offline); FluidSynth; Python (numpy, mido, soundfile, OpenCV for the Ketu clean-up); FFmpeg.

No AI video-generation service was available in the production environment. All motion is therefore real-time procedural animation and compositing of the supplied photographs. No footage was generated and no faces were synthesised. Every photograph is shown undistorted, with `object-fit: cover` and only a gentle push-in.

## Rebuilding

```bash
npm install
# 1. audio (needs: pip install kokoro-onnx soundfile mido numpy; apt install fluidsynth fluid-soundfont-gm)
#    Kokoro model files: github.com/thewh1teagle/kokoro-onnx/releases (kokoro-v1.0.onnx, voices-v1.0.bin)
tools/build_audio.sh /path/kokoro-v1.0.onnx /path/voices-v1.0.bin af_heart 0.9
# 2. video
npm run render:landscape
npm run render:vertical
# live editing preview
npm run studio
```

`remotion.config.ts` points to a pre-installed Chromium. On a normal machine, set `REMOTION_CHROME=download` and Remotion will fetch its own browser.

### Where to edit things
- Names and titles: `src/components/People.tsx` → `PEOPLE`
- Choir names and photos: `src/scenes/PeopleScenes.tsx` → `CHOIRS`
- Date, time and venue text: `src/scenes/Info.tsx`, `src/scenes/Finale.tsx`
- Colours and fonts: `src/theme.ts`
- Narration script and pronunciation: `tools/voiceover.py`. Rebuilding the audio updates `src/data/timing.json`, and every scene re-times automatically.

The original supplied files remain untouched in the repository root. Working copies with clean names are in `public/assets/`.
