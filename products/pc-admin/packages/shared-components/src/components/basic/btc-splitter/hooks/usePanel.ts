import type { PanelItemState } from '../types';

export function getCollapsible(
  collapsible: boolean | { start?: boolean; end?: boolean } | undefined
): { start?: boolean; end?: boolean } {
  if (collapsible && typeof collapsible === 'object') {
    return collapsible;
  }
  return {
    start: !!collapsible,
    end: !!collapsible,
  };
}

export function isCollapsible(
  panel: PanelItemState | null | undefined,
  size: number,
  nextPanel: PanelItemState | null | undefined,
  nextSize: number
): boolean {
  // If the current panel is collapsible and has size, then it can be collapsed
  if (panel?.collapsible?.end && size > 0) {
    return true;
  }

  // If the next panel is collapsible and has no size, but the current panel has size, then it can be collapsed
  if (nextPanel?.collapsible?.start && nextSize === 0 && size > 0) {
    return true;
  }

  return false;
}
