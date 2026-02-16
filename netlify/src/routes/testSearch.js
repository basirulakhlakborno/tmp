import { jsonResponse } from '../utils/http.js';
import { searchDuckDuckGo } from '../providers/search.js';

export async function handleTestSearch({ url, corsify }) {
  try {
    const query = url.searchParams.get('q') || 'test query';
    const results = await searchDuckDuckGo(query);
    return corsify(
      jsonResponse(200, {
        query,
        results,
      }),
    );
  } catch (e) {
    return corsify(
      jsonResponse(500, {
        error: String(e),
      }),
    );
  }
}

