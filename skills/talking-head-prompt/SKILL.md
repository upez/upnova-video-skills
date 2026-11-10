---
name: talking-head-prompt
description: Build and check prompts for AI talking-head videos of a person speaking, across fal (Wan 3.0 Prime reference-to-video), Higgsfield Seedance, and other engines. Use before any talking-head render call, or when reviewing a prompt that needs camera, pose, emotion, or sound details. Requires the talking script and a reference fal request ID (an approved earlier generation); it inherits that request's settings and references, keeps its fixed blocks, estimates the clip duration from the script, and rewrites every script-bound line (spoken words, pacing, word-tied gestures, face cues, sound hits) for the new script. Enforces eight required items: camera settings, camera movement, camera position and environment, character, pose, position, emotional delivery, and sound effects yes or no.
version: 1.0
author: Son Chu
license: private
metadata:
  hermes:
    tags: [talking-head, ai-video, fal, wan, prompting]
---

# Talking-Head Prompt (engine-agnostic)

**Needs:** the fal MCP connector, signed in to the Upnova fal account (`upnova`), so the agent can read request history and render. `ffmpeg` for the after-render checks.

**Default engine: fal × `fal-ai/wan-3-prime/reference-to-video` × 720p, 9:16.** Only leave this default when the brief names another engine.

**Golden reference:** fal request `01a1c493-1269-7492-9026-db6a023a0fa7` (v5b with Plate A, approved by Son on Nov 10, 2026). The full prompt, split into fixed and script-bound blocks, is in [references/golden-v5b.md](references/golden-v5b.md). Use it when the user gives no other request ID.

## Workflow: reference request ID → new prompt

Every new talking-head prompt is built from a reference generation. Never write one from scratch.

### Step 1: Get the two required inputs

Do not build a prompt until you have both.

1. **The talking script (required).** The exact words the person will say. Ask for it if it's missing, and stop until you have it. Never invent one, unless the user explicitly asks you to write it (then write it, show it, and get a yes before using it). The script is needed in both modes: in lip-sync mode it still drives the beats, gestures and duration.
2. **A reference fal request ID.** Ask for one if the user didn't give one. Offer the golden reference above as the default. If they give only a video URL or describe a take, find the ID with `search_request_history` before going further.

### Step 2: Pull the exact recipe

1. Call `get_job_recipe` with the endpoint (`fal-ai/wan-3-prime/reference-to-video` unless known otherwise) and the request ID.
2. If it returns `not_found`, the request is probably on a different fal account than the one selected (the team renders on `upnova`; some people also have a personal account). Find it in `search_request_history`:
   - Narrow the dates from the ID itself. It's a UUIDv7, so the first 12 hex digits are a millisecond Unix timestamp (`01a177ff-cdd0` → Oct 26, 2026). Pass `start`/`end` around that day plus `endpoint_ids`.
   - Page with `cursor` and keep `limit` the same between pages (the cursor is a page number, so changing `limit` skips or repeats rows).
   - Results are big. Save to file and filter with `jq` for the request ID.
3. Call `get_job_recipe` again with that row's `account_receipt`.
4. Check every reference URL still serves (`curl -sI <url> | head -1` → 200). Re-upload any that expired.

### Step 3: Inherit settings unchanged

Copy these from the reference recipe as-is unless the user asks to change one: endpoint, `resolution`, `aspect_ratio`, `seed`, `audio`, `enable_prompt_expansion`, `reference_image_urls` (same order: Image 1 / Image 2 stay the same), and the reference audio (the voice).

Two of these must hold even if the reference got them wrong:
- `enable_prompt_expansion: false`. With it on, Wan's prompt rewriter adds camera push-ins that override "locked-off" wording (background SSIM first vs last frame ~0.45 on, ~0.97 off).
- `audio: true` (Son's standing rule for every Wan render).

Only `duration` and the prompt change by default (Step 5).

### Step 4: Split the reference prompt into fixed and script-bound blocks

Read the whole reference prompt and tag every sentence:

| Fixed (copy word for word) | Script-bound (must be rewritten) |
|---|---|
| Static camera lines (opening "single continuous static tripod shot" line and the full Camera block) | The quoted spoken line |
| Character identity (who, which Image, outfit) | Pacing beats ("a short beat after X") |
| Room / which Image is the room | Every gesture tied to a word or phrase |
| Pose (seated, not standing) | Every face or head cue tied to a word ("head shake on X") |
| Hands rule (both above the table) | Sound hits tied to a word ("impact on X") |
| Delivery tone and baseline face (confident, serious, no worry, no smile) | Any other quote or paraphrase of the old script |
| Gesture scale and style ("big, expansive, each phrase different") | |
| Sound bed (ambience, no music), camera settings | |

**Every quoted or referenced word from the old script must be gone from the new prompt.** After rewriting, search the new prompt for each content word of the old script and confirm none remain unless the new script also uses it.

### Step 5: Rewrite the script-bound blocks for the new script

1. **Mode.** Keep the reference's mode unless the user says otherwise:
   - *Script mode:* "Audio 1 is a voice reference only… He says exactly this line: "<new script>"".
   - *Lip-sync mode:* "lip-synced exactly to the speech in Audio 1", with the new voiceover uploaded as Audio 1.
2. **Spoken line.** Paste the new script verbatim inside the quotes.
3. **Break it into beats.** One beat per phrase or sentence. Mark:
   - the **key claim** (the single most important phrase): heavier pause after it,
   - the **closing line**: "slower and lower, with weight",
   - any shocking number or reveal: a beat after it.
4. **One gesture per beat, chosen by what the words mean,** at the reference's scale, never the same two-hand shape twice:

   | Phrase does… | Gesture |
   |---|---|
   | Dismisses / "not this" | wide, slow one-arm wave out to the side at shoulder height; other hand stays on the table top |
   | Names the real problem / key claim | weight onto forearms on the table, shoulders rise, one hand raised to shoulder height and brought down onto the table top in a decisive chop |
   | Lists items or counts | counts on fingers at chest height, both hands visible |
   | Contrasts two things | hands apart at chest height, one then the other |
   | Gives a number or size | hands held apart to show the size, or one finger raised |
   | Reveals / closes / asks | both arms spread wide, palms open upward at chest height |
   | The pause after the key claim | holds completely still, both hands on the table top |

   Every one-hand gesture also says where the other hand is (on the table top).
5. **Face cues.** Keep the baseline face block word for word. Add at most one head move per line, tied to meaning: a slow head shake on a negation, a single firm nod on an affirmation. Never add eyebrow raises, brow furrows, or "urgent" wording (they read as worried).
6. **Sound hits.** One light impact on the key claim's main word. Keep the ambience/no-music line.
7. **Emotion polarity.** If the new script's news flips tone (the reference is serious bad-news and the new one is a win, or the reverse), say so to the user and propose the emotional delivery line before rendering.
8. **Duration (required; estimate it before showing the prompt).** Wan fits the speech to whatever duration you give it: too short and it rushes or drops the last words, too long and it adds dead air or stretched pauses.
   - **Calibration (golden take):** 15 words with 2 marked pauses spoke from 0.11s to 4.89s of a 5s clip. About 3.5 words per second while talking (the slower closing line about 3.3), about 0.3s per marked pause, about 0.1s lead-in and 0.15s tail.
   - **Script mode formula:** `seconds = words / 3.5 + 0.3 x marked pauses + 0.25`. Round to the nearest whole second, rounding up when the decimal is .3 or more. Golden check: 15 / 3.5 = 4.29, + 0.6, + 0.25 = 5.14, so 5s.
   - Count words as spoken: numbers and symbols as said (`$1.2M` = "one point two million", 4 words; `30%` = "thirty percent", 2 words), a contraction as one word.
   - Show the estimate with its math in the Step 6 summary.
   - **Lip-sync mode:** the voiceover's measured length (`ffprobe`) rounded up to the next whole second.
   - **Limits:** output 2 to 30s; reference audio 15s total at most. Test renders are 5s: about 14 to 15 words with two pauses. If the script won't fit the length the user wants, say so and offer a trim.
   - **After the render**, measure the speech with `silencedetect`: it should end 0.1 to 0.4s before the clip ends. If it ends earlier (dead air) or runs to the last frame (cut off), change the duration by 1s for the next take and note the actual words-per-second here.

### Step 6: Present, get approval, render

Show the full prompt plus all settings (endpoint, resolution, aspect, duration, seed, references, `enable_prompt_expansion`, audio) and a short diff against the reference ("kept: …, rewrote: …"). Follow the confirmation gate below.

When iterating on feedback, render **two takes per round**: A = the one isolated change, B = all proposed changes. Same seed and references. Isolating one change shows which fix actually worked.

## The eight required items

Every prompt must state all eight. The golden template already covers them; check new prompts against this list.

1. **Camera settings:** lens and aperture, for example `55mm, f/1.4`. Pick the look deliberately; Son approved "RED camera, 55mm, f/1.4" in the golden take. Earlier notes said RED wording can look too sharp. If a take looks over-sharp, try "iPhone-soft".
2. **Camera movement:** static. Open the prompt with `Single continuous static tripod shot. The frame never changes: no camera movement of any kind for the full clip.` and keep a Camera block naming fixed landmarks (`the painting, bookshelf, table edge and soda can stay exactly the same size and position in frame`). Never say the person leans "toward the lens/camera" (Wan turns that into a push-in); describe leans as body-only (`shifts his weight onto his forearms on the table`). Do not mix "locked-off" with "handheld".
3. **Camera position and environment:** distance, framing, height, and which reference image supplies the room. Golden framing: `eye-level medium shot centered on him showing his full upper body, both hands, the table top and the room behind him`. The room plate must have a solid front panel on the desk so legs never show (Plate A).
4. **Person's character:** traits and tone, plus gesture style (big, expansive, each phrase different).
5. **Person's pose:** `seated in the chair… sitting down throughout, not standing, not rising, not walking`. Always state it; models stand up when pose is missing.
6. **Person's position:** where they sit in frame, and WHICH reference defines the person with outfit details: "The man from the character sheet in Image 1 (same face, round glasses, short black hair, cream half-zip sweater over blue gingham shirt)".
7. **Emotional delivery:** stated in words. Son's house delivery for Upnova B2B: `confident and serious. He states this plainly, as fact, with total conviction, like an expert who has already seen the numbers. Engaged and energetic, not calm or neutral, but never worried, anxious, nervous or pleading. No hype. No smiling at any point.` Baseline face: `steady, level gaze straight into the lens, relaxed brow, firm jaw, composed authority. No raised eyebrows, no furrowed or knitted brow, no worried look.`
8. **Sound effects:** yes or no. If yes: `subtle cinematic sound effects: a light impact on "<key word>", light room ambience. No music.` If no: `no sound effects, speech only`.

Plus the **hands rule** (Son: "never, never"): `Both of his hands are visible on screen at all times, above the table surface. Neither hand ever drops below the table edge, goes under the table, rests in his lap, or leaves the frame.`

## Checks before submitting

**CONFIRMATION GATE: before EVERY video generation, present the full prompt + settings (engine, model, resolution, aspect ratio, duration, seed, references, prompt expansion) to the user and get explicit approval first. No rendering without a confirmed "yes" from the user.** This applies to every render, including re-renders and variations.

- Built from the user's talking script and a reference request ID; settings inherited per Step 3.
- No leftover words from the old script (Step 4 search).
- Every beat has its own gesture; one-hand gestures say where the other hand is.
- All eight items present, plus the hands rule.
- Face block has no eyebrow-raise, furrow or "urgent" wording; says no smiling.
- Pose says seated, never `stands`, `walks`, `rises`.
- Camera opening line present; no "toward the lens" lean wording; `enable_prompt_expansion: false`.
- Resolution 720p unless the brief says otherwise; never 1080p (bad output quality).
- `audio: true`.
- Duration estimated per Step 5.8 (formula and math shown), or the measured audio length in lip-sync mode.

## Checks after rendering

Before showing the user a take, check it yourself:
- Contact sheet (`ffmpeg -vf "fps=3,scale=150:-1,tile=8x2"`): hands above the table in every frame, seated, gestures land.
- Camera: SSIM of the top 200px between the first and last frame (`-lavfi ssim`). Above ~0.95 = locked; below ~0.6 = it pushed in.
- Face crop strip: level brow, no worry, no smile.
- You can't hear: ask the user to confirm the voice and that the script was spoken.

## Engine-specific submission

### fal: `fal-ai/wan-3-prime/reference-to-video` (default)
- References: `reference_image_urls` addressed positionally ("Image 1" = character sheet, "Image 2" = room in the golden setup). `reference_audio_urls` = "Audio 1" (max 5 files, 15s total).
- `aspect_ratio: 9:16`, `resolution: 720p`, `audio: true`, `enable_prompt_expansion: false`, `seed` from the reference, `duration` 2–30s.
- Use a `submission_key` per intended render so a lost reply can be recovered with `get_submission` instead of paying twice.
- Plate-first: get the room still approved (Nano Banana 2.1 edit, `fal-ai/nano-banana-2.1/edit`) before rendering, and pass it as the room reference.

### Higgsfield Seedance 2.5 (`higgsfield generate create seedance_2_5`)
- Upload each audio file first with `higgsfield upload create <file>`, then pass the returned ID to `--audio-references`. Local audio paths sent straight into `create` have caused failures.
- Pass the two reference images by ID with `--image-references`.
- Use `--mode omni_reference`, `--aspect-ratio 9:16`, `--resolution 720p`, `--bitrate-mode high` unless the brief says otherwise.
- Save the prompt to a scratchpad file and pass it with `--prompt "$(cat <file>)"`.
- Max duration 15 seconds; round audio length up.
- No fal request ID exists here: use the golden template's blocks as the reference instead.

## Known pitfalls

- Prompt expansion on → camera push-in despite static wording. Keep it off.
- "Leans toward the lens/camera" → camera push-in. Describe body-only leans.
- One-hand gestures without a position for the other hand → the other hand drops under the table.
- Eyebrow raises, brow furrows, "urgently" → worried look. Bigger-gesture wording alone → a salesy smile; add the explicit no-smiling line.
- Missing pose → the person stands up. Missing framing → unwanted close-ups.
- Identity drift: pin the character to the exact reference image and list the outfit.
- A request can error after the job is created. Check job status before resubmitting to avoid duplicate charges.
