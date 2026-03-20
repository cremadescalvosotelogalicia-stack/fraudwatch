/**
 * Sanitizes a string to prevent XSS attacks.
 * Strips all HTML tags and trims whitespace.
 * Lightweight alternative to DOMPurify for serverless environments.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/on\w+\s*=/gi, "") // Strip event handlers like onclick=
    .replace(/javascript\s*:/gi, "") // Strip javascript: protocol
    .trim();
}

/**
 * Sanitizes an object's string fields recursively.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeText(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
