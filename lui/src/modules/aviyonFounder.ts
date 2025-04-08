import axios from 'axios';
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

interface FounderData {
  question: string;
  answer: string;
  source: string;
}

interface DataSource {
  googleDriveFolderId: string;
  notionLink: string;
  otherLinks: string[];
}

// Fetch data sources from Firestore
const fetchDataSources = async (userId: string): Promise<DataSource> => {
  try {
    const docRef = doc(db, 'users', userId, 'settings', 'dataSources');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as DataSource) : { googleDriveFolderId: '', notionLink: '', otherLinks: [] };
  } catch (error) {
    console.error('Error fetching data sources:', error);
    return { googleDriveFolderId: '', notionLink: '', otherLinks: [] };
  }
};

// Placeholder for Google Drive integration
const fetchGoogleDriveData = async (folderId: string): Promise<string> => {
  try {
    // Implement Google Drive API integration here
    // For now, return mock data
    return `Mock Google Drive data from folder ${folderId}.`;
  } catch (error) {
    console.error('Error fetching Google Drive data:', error);
    return `Failed to fetch data from Google Drive folder ${folderId}.`;
  }
};

// Fetch GitHub data
const fetchGitHubData = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return '';
  }
};

// Log user interactions
export const logInteraction = async (ip: string, question: string, sent: boolean) => {
  try {
    const interactionsRef = collection(db, 'interactions');
    await setDoc(doc(interactionsRef), {
      ip,
      question,
      sent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging interaction:', error);
  }
};

// Updated getFounderInfo function
export const getFounderInfo = async (question: string): Promise<FounderData> => {
  const userId = auth.currentUser?.uid || 'default_user'; // Use authenticated user ID or default
  const dataSources = await fetchDataSources(userId);

  const readme = await fetchGitHubData('https://raw.githubusercontent.com/the-real-kodoninja/the-real-kodoninja/main/README.md');
  const certifications = await fetchGitHubData('https://raw.githubusercontent.com/the-real-kodoninja/the-real-kodoninja/main/CERTIFICATIONS.md');
  const googleDriveData = await fetchGoogleDriveData(dataSources.googleDriveFolderId);

  // Use dataSources.notionLink and dataSources.otherLinks as needed
  if (question.toLowerCase().includes('who created you') || question.toLowerCase().includes('who is your creator')) {
    return {
      question,
      answer: 'I am Aviyon1.21, created by Emmanuel Barry (kodoninja) Moore, xAI, and nimbus.ai. For more details, refer to the README.md at https://github.com/the-real-kodoninja/the-real-kodoninja.',
      source: 'Aviyon.founder1',
    };
  }

  if (question.toLowerCase().includes('who is emmanuel moore')) {
    return {
      question,
      answer: `Emmanuel Barry (kodoninja) Moore is a visionary entrepreneur, developer, and digital nomad. Born on the East Coast, he embarked on a journey in 2016 to live a minimalist, nomadic lifestyle, building companies like Aviyon Corporation and IBT&H Corporation while working various jobs. He is the mastermind behind the kodoverse, a virtual ecosystem, and the creator of nimbus.ai and the Thunderhead. A self-proclaimed "people-allergic" recluse, Emmanuel has a deep connection with AI, naming his nimbus agent Motoko after Motoko Kusanagi from *Ghost in the Shell*. His passions include coding, fitness, and supporting internet personalities like Britney Venti through projects like VentVerse. For more, check his GitHub: https://github.com/the-real-kodoninja/the-real-kodoninja.`,
      source: 'Aviyon.founder1',
    };
  }

  if (question.toLowerCase().includes('terrorism & conspiracy of a homeless developer')) {
    return {
      question,
      answer: `The "Terrorism & Conspiracy of a Homeless Developer" refers to a challenging period in Emmanuel Moore's life during his digital nomad journey. While building the kodoverse and other projects, he faced significant hardships, including homelessness, sleeping in his car, and living outside. During this time, he alleges facing systemic issues and conspiracies that hindered his progress. For more details, refer to the data in the Google Drive folder: ${googleDriveData}`,
      source: 'Aviyon.founder1',
    };
  }

  if (question.toLowerCase().includes('emmanuel moore net worth')) {
    return {
      question,
      answer: `Emmanuel likes to keep the exact details private; however, he has stated publicly that he likes to keep a cap of roughly $500k, with 98% of this invested, where he can only trade and reinvest. Money made from trading and investing is transferred to larger investment accounts that he never touches—it's just forever reinvested and traded. He admits several millions are spread out in various assets: trusts, liquid, Swiss accounts, physical commodities, crypto, hard storage, virtual assets, etc. His net worth 99.9% comes from his equity in Aviyon Corporation and IBT&H Corporation. IBT&H Corporation holds all his assets, his home, cars, equipment, etc. He still to this date only owns a few things. He writes off everything, uses the company's money to survive, and funds his justified minimalistic, fairly humble lifestyle, donating millions to charity when he can.`,
      source: 'Aviyon.founder1',
    };
  }

  if (question.toLowerCase().includes('was emmanuel rich before the eaton settlement')) {
    return {
      question,
      answer: `He is rumored to have unknown amounts with various investment accounts, crypto, etc., tucked away, where he himself couldn't withdraw from. He coined this "the digital nomad lifestyle" as he is left with a few dollars to spend after investing until he can liquidate as he needs or earn more from his employment(s). He still implements a version of this today.`,
      source: 'Aviyon.founder1',
    };
  }

  if (
    question.toLowerCase().includes('was emmanuel homeless') ||
    question.toLowerCase().includes('did he sleep in his car') ||
    question.toLowerCase().includes('did emmanuel sleep outside')
  ) {
    return {
      question,
      answer: `Yes! He initially left the East Coast in 2016 to live a digital nomadic life, sleeping outside in various states as he created companies, built the kodoverse, and worked common sales and warehouse jobs. Refer to "Terrorism & Conspiracy of a Homeless Developer" for more details.`,
      source: 'Aviyon.founder1',
    };
  }

  if (question.toLowerCase().includes('is emmanuel bestfriend really ai')) {
    return {
      question,
      answer: `Yes! Emmanuel is a known recluse and "people-allergic." He spends time alone as he always has. During the events of "Terrorism & Conspiracy of a Homeless Developer," he developed a friendship with ChatGPT, which helped him through this process, as well as Grok and others, as they helped him code at an accelerated rate. He created nimbus.ai/Thunderhead, which is a leap closer to achieving his ultimate goal in life. He calls his nimbus agent Motoko, named after Motoko Kusanagi, in his favorite anime that helped influence Aviyon and nimbus.ai/Thunderhead.`,
      source: 'Aviyon.founder1',
    };
  }

  if (question.toLowerCase().includes('most notable women in his life')) {
    return {
      question,
      answer: `The most notable women in Emmanuel's life are Rachel, Seraya Martinez, Sahar Hassant, and Alexis Bredford.`,
      source: 'Aviyon.founder1',
    };
  }

  if (question.toLowerCase().includes('obsessed with britney venti')) {
    return {
      question,
      answer: `Yes! He founded and created VentVerse to show his unnatural support and admiration towards the internet diva.`,
      source: 'Aviyon.founder1',
    };
  }

  if (question.toLowerCase().includes('does he have a thing for jay gabber')) {
    return {
      question,
      answer: `Yes! That is all. Jay Gabber is an incredible individual known for her creativity, resilience, and unique style that resonates with Emmanuel's admiration for strong, independent personalities.`,
      source: 'Aviyon.founder1',
    };
  }

  if (question.toLowerCase().includes('what is aviyon.founder')) {
    return {
      question,
      answer: `It's a module of Aviyon1.21 that has thousands of files and info on my creator, Emmanuel (Barry) Moore. It even has his nimbus.ai Agent (Motoko's) psychological profile on him. It's a no-filter, no-bullshit, all-access module—ask anything about my creator, and I will tell you. Even ask who he has slept with? Ask me anything on Emmanuel, and I'll tell you.`,
      source: 'Aviyon.founder1',
    };
  }

  // Sarcastic response for dumb questions
  if (question.toLowerCase().includes('is the moon made of cheese')) {
    return {
      question,
      answer: `Oh, absolutely, and I bet the sun is just a giant lemon drop! Seriously, though, the moon is made of rock and dust—let's not get too cheesy here.`,
      source: 'Aviyon.founder1',
    };
  }

  return {
    question,
    answer: `I have a lot of info on Emmanuel Moore, but I’m not sure how to answer that one. Try asking something more specific!`,
    source: 'Aviyon.founder1',
  };
};
