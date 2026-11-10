# Golden reference: v5b with Plate A

- **fal request ID:** `01a1c493-1269-7492-9026-db6a023a0fa7`
- **Endpoint:** `fal-ai/wan-3-prime/reference-to-video`
- **fal account:** `upnova` (if `get_job_recipe` says not_found, look it up in `search_request_history` around 2026-11-10 to get the `account_receipt`)
- **Approved:** by Son, Nov 10, 2026, after 10 test renders (v1 → v5b)
- **Output:** https://v3b.fal.media/files/b/0ab1e234/Tvy8VH1gc8HVh_jlV4FL3_55uDsmYJ.mp4
## Settings

```json
{
  "resolution": "720p",
  "aspect_ratio": "9:16",
  "duration": 5,
  "audio": true,
  "enable_prompt_expansion": false,
  "seed": 2026,
  "reference_image_urls": [
    "https://v3b.fal.media/files/b/0aafe9c0/as67HEtKEg-lhh5WnWG5i_person.png",
    "https://v3b.fal.media/files/b/0ab1e223/_SZ-3OuMhVT-N8bvhQtzd_ro1qV0vR.png"
  ],
  "reference_audio_urls": [
    "https://v3b.fal.media/files/b/0ab1e187/1O5jMALBXRYnQkMRJSjMC_test5s.wav"
  ]
}
```

- Image 1 = character sheet (Son, round glasses, cream half-zip over blue gingham).
- Image 2 = Plate A: home-office room with gold-framed painting, bookshelf, plant, laptop, mic and La Croix can; dark walnut desk with a solid front panel so legs never show.
- Audio 1 = 5s of Son's voiceover (3.72s to 8.72s of the Oct 26 `part1.wav`), used as a **voice reference only** in this take.

## Measured speech timing (duration calibration)

Measured with `silencedetect` on the output (5.04s clip, 15 words, 2 marked pauses):

| Segment | Time | Words | Rate |
|---|---|---|---|
| Lead-in silence | 0.00 to 0.11s | | |
| "Most stores aren't losing sales on ads." | 0.11 to 2.20s | 7 | 3.4 words/s |
| Pause | 2.20 to 2.49s (0.29s) | | |
| "They're losing them at checkout." | 2.49 to 3.71s | 5 | 4.1 words/s |
| Pause | 3.71 to 3.99s (0.28s) | | |
| "And nobody's looking." (slower, lower) | 3.99 to 4.89s | 3 | 3.3 words/s |
| Tail silence | 4.89 to 5.04s | | |

Overall: about 3.5 words/s while talking, about 3.1 words/s including the pauses. SKILL.md Step 5.8 turns this into the duration formula.

## Prompt, block by block

`[FIXED]` blocks are copied word for word. `[SCRIPT]` blocks are rewritten for each new script (SKILL.md, Step 5). `{…}` marks the slots.

**[FIXED] Camera opening**
> Single continuous static tripod shot. The frame never changes: no camera movement of any kind for the full clip.

**[FIXED] Character, room, pose**
> The man from the character sheet in Image 1 (same face, round glasses, short black hair, cream half-zip sweater over blue gingham shirt) is seated in the chair behind the table in the room from Image 2, centered in the frame, seated facing the camera, speaking directly to the viewer. He is sitting down throughout, not standing, not rising, not walking.

**[SCRIPT] Voice and spoken line** (script mode; the first two sentences are fixed)
> Voice: Audio 1 is a voice reference only. Use the same voice, accent and timbre as Audio 1, but do not repeat or lip-sync the words in Audio 1. He says exactly this line, in English, lip-synced: "{SCRIPT}"

Golden value: `Most stores aren't losing sales on ads. They're losing them at checkout. And nobody's looking.`

**[SCRIPT] Pacing**
> Pacing: {a short beat after "<phrase 1 end>"}, {a heavier pause after "<key claim end>"}, then "{closing line}" slower and lower, with weight.

Golden value: `a short beat after "ads", a heavier pause after "checkout", then "And nobody's looking" slower and lower, with weight.`

**[FIXED] Camera block**
> Camera: tripod-mounted, completely locked-off for the entire clip. No pan, no tilt, no zoom, no push-in, no dolly, no drift, no reframing. The painting, bookshelf, table edge and soda can stay exactly the same size and position in frame from the first frame to the last. Eye-level medium shot centered on him showing his full upper body, both hands, the table top and the room behind him.

**[FIXED] Hands rule**
> Hands: both of his hands are visible on screen at all times, above the table surface. Neither hand ever drops below the table edge, goes under the table, rests in his lap, or leaves the frame.

**[FIXED] Delivery**
> Delivery: confident and serious. He states this plainly, as fact, with total conviction, like an expert who has already seen the numbers. Engaged and energetic, not calm or neutral, but never worried, anxious, nervous or pleading. No hype. No smiling at any point: mouth neutral and closed between words, no grin, no friendly or salesy expression.

**[FIXED] Face baseline** + **[SCRIPT] one head cue**
> Face: confident and serious. Steady, level gaze straight into the lens, relaxed brow, firm jaw, the composed authority of someone who already knows the answer. No raised eyebrows, no furrowed or knitted brow, no worried look. {A slow, deliberate head shake on "<negation phrase>" | A single firm nod on "<affirmation phrase>" | omit}.

Golden value: `A slow, deliberate head shake on "nobody's looking".`

**[FIXED] Gesture style** + **[SCRIPT] one gesture per beat**
> Body language: big, expansive, physical gestures, each phrase different, never the same two-hand shape twice. {On "<beat 1>" <gesture>.} {On "<beat 2>" <gesture>.} {He holds completely still for a beat in the pause, both hands on the table top.} {On "<closing beat>" <gesture>.} Shoulders and torso move with every gesture.

Golden value:
> On "Most stores aren't losing sales on ads" a wide, slow, dismissive wave with one arm sweeping out to the side at shoulder height while the other hand stays visible on the table top. On "They're losing them at checkout" he shifts his weight onto his forearms on the table, shoulders rising, raises one hand to shoulder height and brings it down onto the table top in a strong, decisive chop. He holds completely still for a beat in the pause, both hands on the table top. On "And nobody's looking" both arms spread wide, palms open upward at chest height, both hands clearly visible inside the frame.

**[SCRIPT] Sound hit** + **[FIXED] bed**
> Subtle cinematic sound effects: a light impact on "{key word}", light room ambience. No music.

Golden value: `a light impact on "checkout"`

**[FIXED] Camera settings**
> RED camera, 55mm, f/1.4.

## What each fixed block solved (don't drop them)

| Block | Problem it fixed |
|---|---|
| Camera opening + `enable_prompt_expansion: false` | Push-in on the key word in v1b to v4b |
| Body-only lean ("weight onto his forearms") | "Lean toward the lens" turned into a camera push |
| Hands rule + "other hand stays on the table top" | A hand dropped under the table in v2a/v2b |
| Face baseline, no brow cues | Worried look from eyebrow and furrow cues in v1 to v3 |
| "No smiling at any point…" | Salesy smile once gestures got bigger (v4b) |
| "Each phrase different, never the same two-hand shape twice" | Same two-hand presenting shape repeated (v1) |
| Plate A desk front panel | Legs visible under the desk |
