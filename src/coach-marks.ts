export type CoachMarkRect = { x: number; y: number; width: number; height: number };
export type DashboardTip = 'quick-notes' | 'instant-pic';

export const DASHBOARD_TIPS = [
  { id: 'quick-notes', title: 'A little note goes a long way.', label: 'Quick Notes', body: 'Write a few words in the box above, then tap Stick Note. A tiny reminder, an inside joke, or a little “thinking of you” belongs here.' },
  { id: 'instant-pic', title: 'Let them see your little world.', label: 'Instant Pic', body: 'Tap Instant Snap to choose a photo from your device. A caption is optional, so an ordinary moment can speak for itself.' },
] as const;

export function dashboardTipsKey(owner: string) { return `closer.dashboardTips.v1.${owner}`; }

// Keep the spotlight and its explanation inside the actual modal viewport.
export function coachMarkLayout(target: CoachMarkRect, viewport: { width: number; height: number }, cardHeight = 270) {
  const margin = 16; const gap = 15; const padding = 6;
  const x = Math.min(viewport.width - 4, Math.max(4, target.x - padding));
  const y = Math.min(viewport.height - 4, Math.max(4, target.y - padding));
  const right = Math.min(viewport.width - 4, target.x + target.width + padding);
  const bottom = Math.min(viewport.height - 4, target.y + target.height + padding);
  const highlight = { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) };
  const below = Math.max(0, viewport.height - bottom - gap - margin);
  const above = Math.max(0, y - gap - margin);
  const side = below >= cardHeight || below >= above ? 'below' : 'above';
  const maxHeight = Math.max(1, side === 'below' ? below : above);
  const width = Math.max(1, Math.min(356, viewport.width - margin * 2));
  const left = Math.max(margin, Math.min(target.x + target.width / 2 - width / 2, viewport.width - width - margin));
  const top = side === 'below' ? bottom + gap : Math.max(margin, y - gap - Math.min(cardHeight, maxHeight));
  return { highlight, side, card: { left, top, width, maxHeight } };
}
