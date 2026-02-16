// DuckDuckGo search provider (used for /test-search)

export async function searchDuckDuckGo(query) {
  const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(
    query,
  )}&format=json&no_redirect=1&no_html=1`;

  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`DuckDuckGo API error: ${res.status}`);
  }

  const data = await res.json();

  const related =
    Array.isArray(data.RelatedTopics) && data.RelatedTopics.length
      ? data.RelatedTopics.slice(0, 5)
          .map((item) => {
            if (item.Text) {
              return { text: item.Text, url: item.FirstURL || null };
            }
            if (Array.isArray(item.Topics) && item.Topics.length) {
              const t = item.Topics[0];
              return { text: t.Text || null, url: t.FirstURL || null };
            }
            return null;
          })
          .filter(Boolean)
      : [];

  return {
    heading: data.Heading || null,
    abstract: data.Abstract || null,
    results: related,
  };
}

