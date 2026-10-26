import * as icons from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';

const bySlug = new Map(
  Object.values(icons)
    .filter(
      (icon): icon is SimpleIcon => typeof icon === 'object' && icon !== null && 'slug' in icon,
    )
    .map((icon) => [icon.slug, icon]),
);

/**
 * A brand's logo from simple-icons, e.g. "tiktok", "instagram", "youtube",
 * "facebook", "stripe", "notion", "shopify". As a coloured tile by default.
 */
export function Logo({ name, size = 72, plain }: { name: string; size?: number; plain?: boolean }) {
  const icon = bySlug.get(name);
  if (!icon) return null;

  const svg = (
    <svg
      viewBox="0 0 24 24"
      width={plain ? size : size * 0.58}
      height={plain ? size : size * 0.58}
      fill={plain ? `#${icon.hex}` : '#ffffff'}
    >
      <path d={icon.path} />
    </svg>
  );

  if (plain) return svg;

  return (
    <span
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: size * 0.26,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          icon.slug === 'instagram'
            ? 'linear-gradient(45deg,#f09433,#dc2743 50%,#bc1888)'
            : `#${icon.hex}`,
        boxShadow: `0 10px 24px -8px #${icon.hex}aa`,
      }}
    >
      {svg}
    </span>
  );
}
