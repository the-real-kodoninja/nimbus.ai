import axios from 'axios';

interface CodeResource {
  name: string;
  content: string;
  source: string;
}

export const searchCodeResources = async (query: string): Promise<CodeResource[]> => {
  try {
    // Search GitHub
    const githubResponse = await axios.get('https://api.github.com/search/code', {
      params: { q: query },
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    const githubResults = githubResponse.data.items.slice(0, 3).map((item: any) => ({
      name: item.name,
      content: 'Code snippet unavailable in this mock.', // Fetch content in a real implementation
      source: item.html_url,
    }));

    // Mock documentation and books
    const docResults = [
      {
        name: 'MDN Web Docs: JavaScript',
        content: 'JavaScript is a versatile language for web development.',
        source: 'developer.mozilla.org',
      },
    ];

    return [...githubResults, ...docResults];
  } catch (error) {
    console.error('Error searching code resources:', error);
    return [];
  }
};
