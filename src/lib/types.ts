export type LifeCycleStage = 'pregnancy' | 'postpartum' | 'childcare';

export interface UserData {
  name: string;
  lifecycleStage: LifeCycleStage;
  dueDate?: string;
  birthDate?: string;
  language: 'ru' | 'kk' | 'en';
  avatar?: string;
}

export interface Symptom {
  id: string;
  date: string;
  time: string;
  symptom: string;
  severity: 'low' | 'medium' | 'high';
  comment: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface EducationalModule {
  id: string;
  title: string;
  description: string;
  image: string;
  lessons: { id: string; title: string; }[];
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  contactId: string;
  sender: 'me' | 'them';
  content: string;
  timestamp: string;
}
