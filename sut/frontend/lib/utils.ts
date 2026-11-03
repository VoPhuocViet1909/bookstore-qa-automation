import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function matchBySlug<T extends string>(slug: string, values: T[]) {
  return values.find((value) => slugify(value) === slug)
}

/**
 * Removes markdown formatting from text (removes **, ***, __, etc.)
 * Useful for cleaning AI responses that contain markdown formatting
 */
export function cleanMarkdown(text: string): string {
  if (!text) return text;
  
  return text
    // Remove bold/italic markdown: **text**, ***text***, __text__
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1') // ***bold italic***
    .replace(/\*\*([^*]+)\*\*/g, '$1') // **bold**
    .replace(/\*([^*]+)\*/g, '$1') // *italic*
    .replace(/__([^_]+)__/g, '$1') // __bold__
    .replace(/_([^_]+)_/g, '$1') // _italic_
    // Remove strikethrough: ~~text~~
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove code blocks: `code` or ```code```
    .replace(/```[\s\S]*?```/g, '') // Multi-line code blocks
    .replace(/`([^`]+)`/g, '$1') // Inline code
    // Remove headers: # Header, ## Header, etc.
    .replace(/^#{1,6}\s+(.+)$/gm, '$1')
    // Remove links: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove images: ![alt](url) -> alt
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}