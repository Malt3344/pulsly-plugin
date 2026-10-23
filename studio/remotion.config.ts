import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
// Quality close to what Instagram, TikTok and YouTube re-encode to anyway.
Config.setCrf(18);
