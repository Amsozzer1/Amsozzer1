// A redirect target is only ever a path on this site. A reference that starts with a single
// slash is always path-absolute per RFC 3986 — an authority needs two — so the shape check is
// the whole guard, and a scheme or a host cannot get through it.
export const safePath = (value: unknown) =>
  typeof value === 'string' && /^\/[^/\\\s]/.test(value) ? value : '/';
