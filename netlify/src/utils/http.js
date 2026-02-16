// HTTP / CORS helpers

export function addCorsHeaders(response) {
  const headers = response.headers || {};
  headers['Access-Control-Allow-Origin'] = '*';
  headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
  headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS';
  headers['Access-Control-Allow-Credentials'] = 'true';

  return {
    ...response,
    headers,
  };
}

export function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
}

