import { Person, Publication } from "@/lib/types";
import { composeFullName, pubAnchorId } from "@/lib/utils";
import { marked } from "marked";

/**
 * Process content with markdown, @mentions, and %pub-id references
 * @param text - The text containing markdown, potential @mentions, and %pub-id references
 * @param members - Array of members to check IDs against
 * @param publications - Array of publications to check IDs against
 * @returns HTML string with markdown rendered, @mentions converted to team links, and %pub-id converted to publication anchor links
 */
export function processContent(
  text: string,
  members: Person[],
  publications: Publication[],
): string {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const pubMap = new Map(publications.map((p) => [p.id, p]));

  // First, process markdown
  let html = marked.parse(text, {
    async: false,
    breaks: true,
    gfm: true,
  }) as string;

  // Add classes to regular markdown links (before processing @mentions)
  let non_mention_link_classes = "link ";
  html = html.replace(/<a\s+([^>]*)>/g, (match, attrs) => {
    // If the tag already has a class attribute, add to it; otherwise create one
    if (/class\s*=\s*["']/.test(attrs)) {
      return match.replace(
        /class\s*=\s*["']([^"']*)["']/,
        `class="${non_mention_link_classes} $1"`,
      );
    } else {
      return `<a class="${non_mention_link_classes}" ${attrs}>`;
    }
  });

  // Then process @mentions in the resulting HTML
  const mentionRegex = /@(\w+)/g;
  html = html.replace(mentionRegex, (match, personId) => {
    const member = memberMap.get(personId);
    if (member) {
      const fullName = composeFullName(member);
      return `<a href="/team/${personId}" class="link link-hover font-semibold text-secondary">${fullName}</a>`;
    }
    return match;
  });

  // Then process %pub-id references
  const pubRegex = /%([A-Za-z0-9._+-]*)/g;
  html = html.replace(pubRegex, (match, pubId) => {
    const pub = pubMap.get(pubId);
    if (pub) {
      return `<a href="/pubs#${pubAnchorId(pubId)}" class="link link-hover italic text-secondary">${pub.title}</a>`;
    }
    return match;
  });

  // Remove wrapping <p> tags if present (since we're using this inline)
  html = html.trim();
  if (html.startsWith("<p>") && html.endsWith("</p>")) {
    html = html.slice(3, -4);
  }

  return html;
}
