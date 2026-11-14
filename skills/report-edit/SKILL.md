---
name: report-edit
description: "Run after an editing session that used `upnova-reels-video` (or any other video-edit skill) to capture the editor's feedback prompts, group them into goals, mark which goals were finished, and turn what worked into concrete suggestions for improving the edit skill. Use when the editor says they're done, stuck, or want to wrap up: 'run report-edit', 'log this session', 'write the report', 'I'm done editing', 'I had to do this part manually'. The report lives in the project at `report-edit/<hyperframes-project-name>-YYYY-MM-DD.md`, is packaged as a zip the editor can send to Son on any channel, and is the raw material for updating the edit skill."
---

# Report Edit

**Before anything else, update the skills.** Run the update check (silent, cached for 4 hours,
never blocks):

```
<this skill's folder>/scripts/check-update.sh
```

If it prints "New upnova-video-skills version available — updating...", re-read this SKILL.md after
it finishes: the rules below may have changed. If the script is missing or fails, continue with
what's installed.

A retrospective on one editing session with an AI agent. The editor runs the edit skill
(`upnova-reels-video` for Upnova reels), gives the AI feedback, and the AI iterates. Every feedback
prompt is evidence: it points at something the skill didn't get right on its own. This skill captures
those prompts and turns them into a report Son can use to make the edit skill better.

**Run this skill in the same AI session that did the editing**, or start a new session and point it
at the project's folder. The editor is the human who gave the feedback.

## What the report needs to show

Son reads these to answer two questions:

1. **Is the skill working?** How many prompts did the editor need? How many goals did they finish
   vs abandon? The fewer prompts and abandoned goals, the better the skill.
2. **How do people actually prompt?** The exact text and images they sent, so Son can see if the
   problem is the skill (didn't know a rule) or the prompt (editor didn't say what they wanted).

So the report is not a summary. It is the **full text of every feedback prompt**, with images
embedded, grouped by goal, with a verdict on each.

## Setup

The skill needs:

- **The project folder** (the HyperFrames project, e.g. `~/projects/reels/paper/`). Ask the editor
  if it's not obvious from context.
- **The HyperFrames project name** (the name in the HyperFrames sidebar, e.g. `Paper`,
  `Talking-head-prompt`). Ask the editor. This becomes the report filename key.
- **Today's date** for the filename: `date +%Y-%m-%d`.

Create the output folder:

```
mkdir -p <project-folder>/report-edit/assets
```

The report will be `<project-folder>/report-edit/<hyperframes-project-name>-<YYYY-MM-DD>.md`.
Images the editor references go into `report-edit/assets/` and are linked from the report.

## Workflow

### Step 1: Capture every feedback prompt

Walk the editing session from the start of the editor's first feedback prompt (everything after the
edit skill produced its first plan or first edit) to the end.

For each feedback prompt, log:

- **The exact text.** Not a paraphrase. If the editor wrote "no, the captions are STILL too small,
  make them bigger", the report says that, not "editor requested larger captions".
- **Any images, screenshots, videos, or files attached.** Save each one into
  `report-edit/assets/` with a numbered name (`prompt-07-attachment-1.png`) and embed it in the
  report at the right spot with `![...](assets/prompt-07-attachment-1.png)`.
- **The AI's response** in one line: what it changed, or "asked a clarifying question", or "could
  not do it".
- **Whether the editor accepted the result.** If they followed up with another prompt on the same
  thing, they didn't.

Two ways to get the prompts, in order of preference:

1. **Same-session capture.** If this skill is running in the same AI session that did the editing,
   the conversation history is right there. Walk it. Don't trust the editor to remember.
2. **Editor pastes.** If the editing happened in a different session, ask the editor to paste the
   chat transcript, or to drop screenshots of each prompt. Walk what they give you.

Don't skip a prompt because it looks small. "Move it up a bit" counts. "Hmm" followed by a
screenshot counts.

### Step 2: Group prompts into goals

A **goal** is one thing the editor wanted fixed. It may take one prompt or many.

Group by what the prompt is about, not by when it arrived. "Captions too small" + "no, still too
small" + "I said BIGGER" is one goal ("caption size too small") in three rounds. A later "captions
need to be at the chest, not the bottom" is a different goal (placement, not size).

For each goal, record:

- **A short title** in plain words: "caption size too small", "hook banner missing", "logo wall
  glitchy around the hands".
- **The goal of the feedback** — what was the editor trying to get the AI to do? In their words,
  cleaned up. One sentence.
- **Round count.** How many prompts it took to finish. Include clarifying questions from the AI
  that the editor answered.
- **Status.** One of:
  - **Finished.** The editor confirmed the fix (or moved on without complaint).
  - **Finished manually.** The editor gave up on the AI and did it themselves in the HyperFrames
    editor, or asked for it to be left out.
  - **Abandoned.** The editor dropped the request entirely.
- **All prompts in order**, each with its attachments.

### Step 3: Ask the editor the stuck / manual questions

This is the part the AI cannot infer. Ask the editor directly, out loud, before writing the
report. Use `clarify` if the conversation has it, or plain questions in chat otherwise.

Ask:

1. **"Where did you get stuck?"** — any moment where they felt they were going in circles with the
   AI, or where the AI kept producing the same wrong thing.
2. **"What did you end up doing manually?"** — anything they had to finish in the HyperFrames
   editor themselves, or ask a different tool to do, or just gave up and left.
3. **"Anything you asked for that the AI said it couldn't do?"** — capability gaps, not quality
   gaps.

Record the answers **verbatim** in the report under each question. These three answers are the
highest-signal part of the whole report — do not paraphrase them.

### Step 4: Suggest skill improvements, from finished goals only

Look at the **finished** goals (including "finished manually" — those are the loudest signal).
For each one, ask: what would have to change in the edit skill for the AI to get this right on
the first try next time?

Write concrete suggestions in the form of edits to the edit skill:

- A new rule to add, with the section it belongs in (e.g. "add to `upnova-reels-video` §0g: 'when
  the editor attaches a screenshot with a red circle, the circled element is the subject of the
  prompt — open by naming what you see in the circle'").
- An existing rule to change or remove, with the line.
- A new template, script, or reference to create.
- A pattern in the editor's prompts that the skill should learn to recognise (e.g. "editors often
  paste a frame and say 'like this' — the skill needs a rule to extract layout from a reference
  image rather than ask for measurements").

**Do not suggest changes from unfinished or abandoned goals alone.** The AI never solved them, so
we don't know what the right fix is. List them in the report under "Unresolved" so Son can see the
patterns, but don't pretend we know the answer.

Each suggestion needs:

- The goal(s) it came from, by number.
- The evidence (a quote from the editor's prompts, or the round count).
- The exact change to make, written so it can be pasted into the edit skill's SKILL.md.

### Step 5: Write the report

Use this structure, in this order. Filename:
`<project-folder>/report-edit/<hyperframes-project-name>-<YYYY-MM-DD>.md`.

```markdown
# Report Edit: <HyperFrames project name>

- **Project:** <name>
- **Date:** <YYYY-MM-DD>
- **Edit skill used:** upnova-reels-video (or whichever)
- **Editor:** <name or "Son">
- **Session length:** <approximate, e.g. "about 2 hours", "3 sessions">

## TL;DR

<3 to 5 lines: total prompts, total goals, finished / manual / abandoned split, the one thing
that would have saved the most time.>

## Numbers

- Feedback prompts: <N>
- Goals: <N>
- Finished by AI: <N> (<X%> of goals)
- Finished manually by editor: <N>
- Abandoned: <N>
- Average rounds per finished goal: <X.X>
- Longest goal: <title>, <N> rounds

## Goals

### Goal 1: <title> — <status, N rounds>

**What the editor wanted:** <one sentence>

**Round 1**
> <the editor's exact prompt>

![attachment if any](assets/prompt-01-attachment-1.png)

AI: <one line on what it did>
Editor: <accepted / pushed back / clarified>

**Round 2**
> <next prompt>

...

**Resolution:** <how it ended — accepted, manually fixed, abandoned>

(repeat for each goal, in the order they started)

## Where the editor got stuck

> <editor's verbatim answer to "where did you get stuck?">

## What the editor did manually

> <editor's verbatim answer to "what did you end up doing manually?">

## Capability gaps

> <editor's verbatim answer to "anything you asked for that the AI said it couldn't do?">

## Unresolved

<list of abandoned goals and goals finished manually, one line each: title, rounds, why it ended
that way if known. These are the patterns to watch, not to act on yet.>

## Suggested skill improvements

<the list from Step 4, most impactful first. Each item:>

### Suggestion 1: <short title>

- **From goals:** <numbers>
- **Evidence:** <quote or round count>
- **Change:** <the exact addition or edit, ready to paste into the skill>
- **Where:** <file and section, e.g. `skills/upnova-reels-video/SKILL.md` §0g>

## How the editor prompts

<one short section: patterns Son should notice in how the editor phrases prompts. Do they use
screenshots? Do they number requests? Do they say "no" a lot before explaining? This section is
descriptive, not prescriptive — it's so Son can write rules that match how people actually talk.>
```

### Step 6: Package the report as a zip

The editor needs to send this to Son on Telegram, email, Slack, or somewhere else — so it has to
be a single file, self-contained, with images included.

Build the zip from inside the project folder so paths inside the zip are clean:

```
cd <project-folder>
zip -r report-edit/<hyperframes-project-name>-<YYYY-MM-DD>.zip \
  report-edit/<hyperframes-project-name>-<YYYY-MM-DD>.md \
  report-edit/assets/
```

The zip contains:

- The markdown report at the top level
- `assets/` with every embedded image

Anyone opening it can read the `.md` file and the images will resolve relative to it.

If there are no attachments (rare), still zip it — keeps the sending flow identical every time.

### Step 7: Tell the editor where the zip is

One line, with the full path to the zip, and a hint: "Send this to Son on <channel>". Don't paste
the whole report into chat unless asked. Don't email or send it yourself — the editor chooses the
channel.

## Rules

- **Never paraphrase a prompt.** The exact words are the data. If a prompt is 200 words of the
  editor venting, the report holds 200 words of venting.
- **Never drop an image.** Every attachment goes into `report-edit/assets/` and is embedded in the
  report. A prompt that says "like this" with a screenshot is meaningless without the screenshot.
- **Never invent a prompt.** If the editor can't produce the chat history and doesn't remember one,
  say so in the report. A partial log is better than a made-up one.
- **Don't suggest changes from unfinished goals.** The AI didn't solve them, so we don't know the
  fix. List them under Unresolved and stop.
- **The stuck / manual / gap questions are required.** Don't skip them because the goals section
  feels complete. They catch the failures the editor didn't bother to type.
- **Always produce the zip.** Even for a tiny report with no attachments. The editor's flow is
  "run the skill, get a zip, send it" — that only works if it's always a zip.
- **The report is for Son.** Write it plainly. No padding, no "in conclusion", no marketing voice.

## When to run

- At the end of every editing session that used an edit skill, before the session closes.
- When the editor says they're stuck and switching to manual work.
- When the editor says the reel is done, even if everything went smoothly — a clean run is data
  too (and produces a very short report, which is the goal).
