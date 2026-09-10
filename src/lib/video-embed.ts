export function getVideoEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const shortsMatch = parsed.pathname.match(/^\/shorts\/([\w-]+)/);
      if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
      const embedMatch = parsed.pathname.match(/^\/embed\/([\w-]+)/);
      if (embedMatch) return trimmed;
      return null;
    }

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "drive.google.com") {
      const fileMatch = parsed.pathname.match(/\/file\/d\/([\w-]+)/);
      if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
      const idParam = parsed.searchParams.get("id");
      if (idParam) return `https://drive.google.com/file/d/${idParam}/preview`;
      return null;
    }

    return null;
  } catch {
    return null;
  }
}
