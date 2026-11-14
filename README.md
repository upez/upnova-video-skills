# Upnova video skills

Agent skills for making Upnova ads and Instagram Reels in HyperFrames:

| Skill | What it does |
| --- | --- |
| `upnova-reels-video` | Son's house style for talking-head reels: captions, claims, logo wall, brand B-roll, testimonials, sound, easing. Every rule comes from Son's feedback. |
| `upnova-illustrations` | The library of drop-in animated sections (stat count-ups, charts, checklists, phone feature shots, 3D report, testimonials, reviews...) plus all shared assets and the script that fetches them. |
| `talking-head-prompt` | Prompts for AI talking-head clips on fal (Wan 3.0 Prime). Starts from an approved fal request ID, keeps its settings and fixed blocks, and rewrites the script-bound lines (spoken line, pacing, gestures, face and sound cues) for a new script. Includes the approved golden take. |
| `report-edit` | Run after an editing session to capture the editor's feedback prompts (text and images), group them into goals, and turn what worked into concrete suggestions for improving the edit skill. Writes the report plus a zip to `report-edit/` inside the project. |

## Install

You need access to the `upez` GitHub org and the GitHub CLI signed in once (`gh auth login`).

```
npx skills add upez/upnova-video-skills
```

Install both skills: the reels skill uses the illustration skill's templates and assets.

## Update

Skills update themselves. Every SKILL.md opens with a "Before anything else, update the skills"
step: the agent runs `scripts/check-update.sh`, which checks the repo's remote HEAD and runs
`npx skills add upez/upnova-video-skills` when it's behind. It's silent when nothing changed,
caches the check for 4 hours, and never blocks work on failure.

To update by hand, run the same command as install:

```
npx skills add upez/upnova-video-skills
```

## Assets

Every font, logo, backdrop, sound, founder video, B-roll clip and phone recording the templates use is
listed in [ASSETS.md](ASSETS.md).

- Small files (fonts, backdrops, Upnova and client logos, sounds) install with the
  `upnova-illustrations` skill.
- Big files (videos, screenshots, original testimonial footage) stay in `media/` here and are downloaded
  only when a project needs them.

The agent copies them into a project with:

```
<skills folder>/upnova-illustrations/scripts/fetch-assets.sh <project-folder> <template-name or assets/path>...
```

It checks the project, then the installed skill, then a local clone of this repo
(`$UPNOVA_VIDEO_SKILLS_REPO` or `~/Projects/upnova/upnova-video-skills`), and finally downloads from
GitHub with your `gh` login (or `GITHUB_TOKEN`).

Apple Garamond (`AppleGaramond*.ttf`) is Apple's font, included for internal Upnova work only. Keep this
repo private and don't ship the font in anything published.

## Changing the skills (Son)

1. Edit `skills/<name>/SKILL.md` or the templates.
2. New asset? Put small files in `skills/upnova-illustrations/assets/<path>` and big ones (videos,
   screenshots) in `media/assets/<path>`, using the same `assets/...` path the template uses. Then run
   `python3 scripts/update-asset-list.py` to refresh `assets.tsv` and `ASSETS.md`.
3. Commit and push. Teammates run `npx skills add upez/upnova-video-skills` again.
