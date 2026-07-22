const HEADER_OFFSET_PX = 112; // ~scroll-mt-28

function getScrollParent(el: HTMLElement): HTMLElement | null {
  let parent: HTMLElement | null = el.parentElement;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    const canScroll =
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      parent.scrollHeight > parent.clientHeight;
    if (canScroll) return parent;
    parent = parent.parentElement;
  }
  return null;
}

/** En mobile, lleva el panel de Mercado Pago (arriba / derecha) a la vista. */
export function scrollMercadoPagoPanelIntoView(el: HTMLElement | null) {
  if (!el || typeof window === 'undefined') return;
  if (window.matchMedia('(min-width: 768px)').matches) return;

  window.requestAnimationFrame(() => {
    const scrollParent = getScrollParent(el);

    if (scrollParent) {
      const parentRect = scrollParent.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const nextTop =
        scrollParent.scrollTop + (elRect.top - parentRect.top) - HEADER_OFFSET_PX;
      scrollParent.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
      return;
    }

    const absoluteTop = window.scrollY + el.getBoundingClientRect().top - HEADER_OFFSET_PX;
    window.scrollTo({ top: Math.max(0, absoluteTop), behavior: 'smooth' });
  });
}
