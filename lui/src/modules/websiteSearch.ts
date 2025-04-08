import axios from 'axios';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

const REPUTABLE_SOURCES = [
  'wikipedia.org',
  'edu',
  'org',
  'gov',
  'nature.com',
  'sciencedirect.com',
  'ieee.org',
  'mit.edu',
  'harvard.edu',
];

export const searchWebsites = async (query: string): Promise<SearchResult[]> => {
  try {
    // Using a mock search API (replace with a real API like Google Custom Search or SerpAPI)
    const response = await axios.get('https://api.example.com/search', {
      params: { q: query, key: 'YOUR_API_KEY' },
    });

    const results = response.data.items
      .filter((item: any) => REPUTABLE_SOURCES.some(source => item.link.includes(source)))
      .map((item: any) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        source: new URL(item.link).hostname,
      }));

    return results;
  } catch (error) {
    console.error('Error searching websites:', error);
    return [];
  }
};
