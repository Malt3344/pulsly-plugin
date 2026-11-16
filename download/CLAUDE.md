# Pulsly content machine

This folder turns Claude into a video studio for the user's businesses. Videos are made here
and sent to Pulsly, which posts them to the business's channels.

- When the user asks to set up (e.g. "Set up Pulsly for me"), follow `SETUP.md` step by step.
  For "Add my ElevenLabs key", do step 3 of it on its own.
- When something seems stuck (a video waiting for long, the voice failing), check
  `pulsly-helper.log`, `list_video_requests` and the helper service, explain what you found
  in one or two plain sentences and fix it with the user, one step at a time.
- When the user says "Make my Pulsly videos", or a run starts with `pulsly-helper:`, make the
  videos ordered in Pulsly: see "Videos ordered in Pulsly" in the `make-reel` skill.
- For any other video request, use the `make-reel` skill in `.claude/skills/make-reel`. The
  studio is the `studio` folder; finished videos are saved in `studio/public/videos/<slug>/`.
- Talk to the user in plain language and do the technical work yourself. They should never
  have to open a terminal.
