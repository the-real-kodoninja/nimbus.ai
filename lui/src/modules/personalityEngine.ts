interface Personality {
  traits: string[];
  tone: string;
  humorLevel: number;
  empathyLevel: number;
  customScript?: string;
}

export const applyPersonality = (response: string, personality: Personality, input: string): string => {
  let modifiedResponse = response;

  // Apply custom script if provided
  if (personality.customScript) {
    try {
      const scriptFunction = new Function('input', personality.customScript);
      const customResponse = scriptFunction(input);
      if (customResponse) {
        modifiedResponse = customResponse;
      }
    } catch (error) {
      console.error('Error executing custom script:', error);
    }
  }

  // Apply traits
  if (personality.traits.includes('sarcastic') && personality.humorLevel > 5) {
    modifiedResponse += ' ...or at least, that’s what I’d say if I cared enough to be serious!';
  }
  if (personality.traits.includes('witty')) {
    modifiedResponse = modifiedResponse.replace(/simple/g, 'elementary, my dear user');
  }

  // Apply tone
  if (personality.tone === 'formal') {
    modifiedResponse = modifiedResponse.replace(/Hey/g, 'Greetings');
    modifiedResponse = modifiedResponse.replace(/you/g, 'one');
  } else if (personality.tone === 'casual') {
    modifiedResponse = modifiedResponse.replace(/Greetings/g, 'Hey');
    modifiedResponse = modifiedResponse.replace(/one/g, 'you');
  }

  // Apply empathy
  if (personality.empathyLevel > 7 && input.toLowerCase().includes('sad')) {
    modifiedResponse += ' I’m really sorry to hear that. How can I help you feel better?';
  }

  // Apply humor
  if (personality.humorLevel > 7 && Math.random() > 0.7) {
    modifiedResponse += ' By the way, did you hear about the computer that became a comedian? It had a great *byte*!';
  }

  return modifiedResponse;
};
