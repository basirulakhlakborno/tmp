// Helpers to build request URL and context from Netlify event

export function buildRequestUrl(event) {
  const host = event.headers && (event.headers.host || event.headers.Host);
  const proto =
    (event.headers &&
      (event.headers['x-forwarded-proto'] || event.headers['X-Forwarded-Proto'])) ||
    'https';
  const rawPath = event.rawPath || event.path || '/';
  const rawQuery =
    typeof event.rawQuery === 'string' ? event.rawQuery : event.rawQueryString || '';

  return new URL(`${proto}://${host || 'localhost'}${rawPath}${rawQuery ? `?${rawQuery}` : ''}`);
}

export function getMethod(event) {
  return event.httpMethod || 'GET';
}

