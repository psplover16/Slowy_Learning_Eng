/**
 * Wraps a piece of inline article text in an underlined `<span>` carrying a
 * `data-target` attribute. The resulting markup is consumed by the
 * underlined-word backlink interaction (`useUnderlinkBacklink`) to map clicks
 * to vocabulary explanation anchors.
 *
 * SECURITY: this function does NOT HTML-escape the `text` parameter. It is
 * intended only for controlled chapter content authored in TypeScript data
 * modules — never feed user input into it.
 */
export function hl(text: string, targetId: string = ''): string {
  const targetAttr = targetId ? ` data-target="${targetId}"` : ''
  return `<span${targetAttr} class="underline decoration-terracotta underline-offset-2 cursor-pointer hover:text-terracotta transition-colors">${text}</span>`
}
