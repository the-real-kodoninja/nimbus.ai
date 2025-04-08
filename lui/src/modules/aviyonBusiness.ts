interface BusinessResource {
  title: string;
  content: string;
  source: string;
}

const BUSINESS_DATA: BusinessResource[] = [
  {
    title: 'The Intelligent Investor',
    content: 'A book by Benjamin Graham on value investing.',
    source: 'Book by Benjamin Graham',
  },
  {
    title: 'A Random Walk Down Wall Street',
    content: 'A book by Burton Malkiel on efficient market hypothesis.',
    source: 'Book by Burton Malkiel',
  },
];

export const searchBusinessResources = (query: string): BusinessResource[] => {
  return BUSINESS_DATA.filter(resource =>
    resource.title.toLowerCase().includes(query.toLowerCase()) ||
    resource.content.toLowerCase().includes(query.toLowerCase())
  );
};
