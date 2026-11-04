# Pulsly content machine

This folder turns Claude into a video studio for the user's product. Videos are made here and
sent to Pulsly, where the user approves them before they are posted.

- When the user asks to set up (e.g. "Set up Pulsly for me"), follow `SETUP.md` step by step.
- To make videos, use the `make-reel` skill in `.claude/skills/make-reel`. The studio is the
  `studio` folder; finished videos are saved in `studio/public/videos/<slug>/`.
- Talk to the user in plain language and do the technical work yourself. They should never
  have to open a terminal.
