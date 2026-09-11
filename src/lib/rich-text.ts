export function isRichContentEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  if (/<img\b/i.test(html)) return false;
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length === 0;
}
