// Motion check: samples the video four times a second as small greyscale frames (without
// the progress bar) and finds stretches where nothing new happens on screen. A slow camera
// push or a gentle float changes few pixels, so it does not count as a beat.
import { spawnSync } from 'node:child_process';

const SAMPLES_PER_SECOND = 4;
const WIDTH = 108;
const HEIGHT = 192;
/** The frame is split into cells; a beat is a big change in at least one cell. */
const CELLS_X = 12;
const CELLS_Y = 16;
/** Mean pixel change (0–1) in the busiest cell that counts as something new happening. */
const BEAT_THRESHOLD = 0.08;

/** Change between two frames: the mean change of the cell that changed most. */
const busiestCellChange = (pixels, a, b) => {
  const cellWidth = WIDTH / CELLS_X;
  const cellHeight = HEIGHT / CELLS_Y;
  let busiest = 0;
  for (let cy = 0; cy < CELLS_Y; cy += 1) {
    for (let cx = 0; cx < CELLS_X; cx += 1) {
      let sum = 0;
      for (let y = cy * cellHeight; y < (cy + 1) * cellHeight; y += 1) {
        for (let x = cx * cellWidth; x < (cx + 1) * cellWidth; x += 1) {
          const index = y * WIDTH + x;
          sum += Math.abs(pixels[a + index] - pixels[b + index]);
        }
      }
      busiest = Math.max(busiest, sum / (cellWidth * cellHeight) / 255);
    }
  }
  return busiest;
};

/** Returns stretches (in seconds) longer than `maxStill` without a visual beat. */
export const findStillStretches = (video, maxStill = 1.2) => {
  const result = spawnSync(
    'npx',
    [
      'remotion',
      'ffmpeg',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      video,
      '-vf',
      `crop=iw:ih-60:0:60,scale=${WIDTH}:${HEIGHT}`,
      '-r',
      String(SAMPLES_PER_SECOND),
      '-an',
      '-pix_fmt',
      'gray',
      '-c:v',
      'rawvideo',
      '-f',
      'image2pipe',
      '-',
    ],
    { maxBuffer: 1024 * 1024 * 256 },
  );
  const frameSize = WIDTH * HEIGHT;
  const frames = Math.floor(result.stdout.length / frameSize);
  if (frames < 2)
    throw new Error(
      `Motion check could not read ${video}: ${result.stderr.toString().slice(-300)}`,
    );

  const changes = [];
  for (let frame = 1; frame < frames; frame += 1) {
    changes.push(busiestCellChange(result.stdout, frame * frameSize, (frame - 1) * frameSize));
  }

  const stretches = [];
  let stillSince = 0;
  changes.forEach((change, index) => {
    const time = (index + 1) / SAMPLES_PER_SECOND;
    if (change >= BEAT_THRESHOLD) {
      if (time - stillSince > maxStill) stretches.push([stillSince, time]);
      stillSince = time;
    }
  });
  const end = frames / SAMPLES_PER_SECOND;
  if (end - stillSince > maxStill) stretches.push([stillSince, end]);

  return { stretches, changes };
};
