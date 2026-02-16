import { jsonResponse } from '../utils/http.js';

export function handleNotFound({ corsify }) {
  return corsify(
    jsonResponse(404, {
      error: 'Not found',
    }),
  );
}

