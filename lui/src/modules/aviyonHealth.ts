interface HealthResource {
  topic: string;
  content: string;
  source: string;
}

const HEALTH_DATA: HealthResource[] = [
  {
    topic: 'Bryan Johnson Protocol',
    content: 'A regimen focusing on longevity, including diet, sleep, and supplements.',
    source: 'blueprint.bryanjohnson.co',
  },
  {
    topic: '2045 Initiative',
    content: 'A project aiming for human immortality through technology by 2045.',
    source: '2045.com',
  },
  // Add more from fitness books, medical nutrition texts
];

export const searchHealthResources = (query: string): HealthResource[] => {
  return HEALTH_DATA.filter(resource =>
    resource.topic.toLowerCase().includes(query.toLowerCase()) ||
    resource.content.toLowerCase().includes(query.toLowerCase())
  );
};
