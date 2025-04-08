interface Course {
  institution: string;
  courseName: string;
  description: string;
  source: string;
}

const KNOWLEDGE_BASE: Course[] = [
  // Mock data (replace with real data from MIT OpenCourseWare, Harvard Online, etc.)
  {
    institution: 'MIT',
    courseName: 'Introduction to Computer Science and Programming',
    description: 'A foundational course on programming using Python, offered by MIT OpenCourseWare.',
    source: 'ocw.mit.edu',
  },
  {
    institution: 'Harvard',
    courseName: 'CS50: Introduction to Computer Science',
    description: 'An introductory course on computer science, covering C, Python, and more.',
    source: 'online-learning.harvard.edu',
  },
  // Add more courses from public Ivy League schools (e.g., University of Michigan, UC Berkeley)
];

export const searchKnowledgeBase = (query: string): Course[] => {
  return KNOWLEDGE_BASE.filter(course =>
    course.courseName.toLowerCase().includes(query.toLowerCase()) ||
    course.description.toLowerCase().includes(query.toLowerCase())
  );
};
