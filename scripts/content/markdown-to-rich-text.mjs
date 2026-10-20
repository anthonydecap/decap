/**
 * A small Markdown subset → Prismic rich text, for content files.
 *
 *   paragraphs separated by a blank line
 *   ### Heading          → heading3
 *   - item               → list-item        1. item → o-list-item
 *   **bold**  *italic*  [text](/path or https://…)
 */

function parseInline(src) {
  let text = "";
  const spans = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    text += src.slice(last, m.index);
    const start = text.length;
    if (m[1] !== undefined) {
      text += m[1];
      spans.push({ type: "strong", start, end: text.length });
    } else if (m[2] !== undefined) {
      text += m[2];
      spans.push({ type: "em", start, end: text.length });
    } else {
      text += m[3];
      const url = m[4];
      spans.push({ type: "hyperlink", start, end: text.length, data: { link_type: "Web", url } });
    }
    last = re.lastIndex;
  }
  text += src.slice(last);
  return { text, spans };
}

export function markdownToRichText(md) {
  if (md == null || md === "") return [];
  const blocks = [];
  // Blocks are separated by blank lines; inside a block, heading and list lines stand alone and
  // consecutive plain lines join into one paragraph.
  for (const para of String(md).trim().split(/\n\s*\n/)) {
    let text = [];
    const flush = () => {
      if (text.length) blocks.push({ type: "paragraph", ...parseInline(text.join(" ")) });
      text = [];
    };
    for (const line of para.split("\n").map((l) => l.trim()).filter(Boolean)) {
      if (line.startsWith("### ")) {
        flush();
        blocks.push({ type: "heading3", ...parseInline(line.slice(4)) });
      } else if (/^- /.test(line)) {
        flush();
        blocks.push({ type: "list-item", ...parseInline(line.slice(2)) });
      } else if (/^\d+\. /.test(line)) {
        flush();
        blocks.push({ type: "o-list-item", ...parseInline(line.replace(/^\d+\. /, "")) });
      } else {
        text.push(line);
      }
    }
    flush();
  }
  return blocks;
}
