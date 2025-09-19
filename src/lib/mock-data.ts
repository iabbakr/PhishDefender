export type EducationResource = {
  id: string;
  type: 'Article' | 'Video';
  title: string;
  description: string;
  image: string;
  duration?: string;
  link: string;
  imageHint: string;
  content?: string; // Add content field
  createdAt?: any;
};

export const learningResources: EducationResource[] = [
  {
    id: '1',
    type: 'Article',
    title: 'Anatomy of a Phishing Email',
    description: 'Learn to dissect suspicious emails and identify the tell-tale signs of a phishing attack.',
    image: 'https://picsum.photos/600/400',
    link: '#',
    imageHint: 'email security',
    content: 'This is a placeholder for the full article content. In a real application, this would be fetched from a database or CMS. It would contain detailed information about how to spot phishing emails, including examples and tips.'
  },
  {
    id: '2',
    type: 'Video',
    title: 'Video: Spotting a Fake Website',
    description: 'This short video demonstrates how to check a website\'s URL and security certificate.',
    image: 'https://picsum.photos/600/400',
    duration: '5:30',
    link: '#',
    imageHint: 'website security',
  },
  {
    id: '3',
    type: 'Article',
    title: 'Social Engineering: The Human Element',
    description: 'Understand the psychological tricks attackers use to manipulate you into giving up information.',
    image: 'https://picsum.photos/600/400',
    link: '#',
    imageHint: 'psychology manipulation',
    content: 'This placeholder content would delve into the various techniques used in social engineering, such as pretexting, baiting, and quid pro quo. It would provide real-world examples and strategies for defense.'
  },
  {
    id: '4',
    type: 'Article',
    title: 'How to Secure Your Accounts',
    description: 'Best practices for creating strong passwords and using multi-factor authentication (MFA).',
    image: 'https://picsum.photos/600/400',
    link: '#',
    imageHint: 'password security',
    content: 'This article would provide actionable advice on creating complex, unique passwords for different accounts, recommend password managers, and explain how to set up and use various forms of multi-factor authentication to add a critical layer of security.'
  },
];

export type CommunitySubmission = {
  id: string;
  type: 'URL' | 'Email' | 'SMS';
  content: string;
  comments?: string;
  reportedBy: string;
  date: string;
  riskLevel: 'High' | 'Medium';
  status: 'Verified' | 'Pending';
};
