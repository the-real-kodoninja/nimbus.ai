interface GrammarCheck {
  original: string;
  corrected: string;
  explanation: string;
}

export const checkGrammar = async (text: string): Promise<GrammarCheck[]> => {
  // Mock implementation (replace with real grammar checking logic)
  const corrections: GrammarCheck[] = [];

  // Example rule: Check for "there" vs "their"
  if (text.includes('there') && text.toLowerCase().includes('possession')) {
    corrections.push({
      original: 'there',
      corrected: 'their',
      explanation: 'Use "their" to indicate possession.',
    });
  }

  // Example: Check for passive voice
  if (text.toLowerCase().includes('was') && text.toLowerCase().includes('by')) {
    corrections.push({
      original: text,
      corrected: text.replace('was', 'actively'),
      explanation: 'Avoid passive voice for clearer writing.',
    });
  }

  // In a real implementation, integrate Grammarly API or use a library like 'compromise' for NLP
  return corrections;
};

export const getWritingReferences = async (topic: string): Promise<string[]> => {
  // Mock references (replace with web scraping or book data)
  return [
    `Reference from "The Elements of Style" by Strunk and White: Use active voice.`,
    `Reference from "On Writing Well" by William Zinsser: Be clear and concise.`,
  ];
};
