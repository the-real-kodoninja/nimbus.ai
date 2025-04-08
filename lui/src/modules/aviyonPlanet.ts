interface PlanetResource {
  topic: string;
  content: string;
  source: string;
}

const PLANET_DATA: PlanetResource[] = [
  {
    topic: 'Digital Nomad Lifestyle',
    content: 'A lifestyle of working remotely while traveling the world.',
    source: 'nomadicmatt.com',
  },
  {
    topic: 'Recycling: Steel vs. Others',
    content: 'Steel is highly recyclable, with a recycling rate of over 90%.',
    source: 'epa.gov',
  },
];

export const searchPlanetResources = (query: string): PlanetResource[] => {
  return PLANET_DATA.filter(resource =>
    resource.topic.toLowerCase().includes(query.toLowerCase()) ||
    resource.content.toLowerCase().includes(query.toLowerCase())
  );
};
