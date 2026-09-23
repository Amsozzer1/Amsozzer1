export type IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

// Enough to tell one reader from another, not enough to identify anyone. The salt
// lives as a Worker secret, so the digest cannot be walked back to an address by
// anyone holding the database. Without a salt we store nothing rather than fall
// back to something guessable: this repository is public.
export const fingerprint = async (request: IncomingRequest, salt: string | undefined) => {
  if (!salt) return null;

  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return null;

  const material = `${salt}:${ip}:${request.headers.get('User-Agent') ?? ''}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(material));

  return [...new Uint8Array(digest)]
    .slice(0, 8)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const referrerHost = (request: IncomingRequest) => {
  const referrer = request.headers.get('Referer');
  return referrer ? (URL.parse(referrer)?.host ?? null) : null;
};
