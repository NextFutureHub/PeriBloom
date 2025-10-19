"use client";

import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import type { UserData, Symptom, AIMessage, EducationalModule, Contact, ChatMessage } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type AppContextType = {
  isInitialized: boolean;
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  symptoms: Symptom[];
  addSymptom: (symptom: Omit<Symptom, 'id'>) => void;
  aiMessages: AIMessage[];
  addAIMessage: (message: AIMessage) => void;
  clearAIChat: () => void;
  educationProgress: Record<string, boolean>;
  toggleLessonComplete: (lessonId: string) => void;
  getEducationalModules: () => EducationalModule[];
  contacts: Contact[];
  getChatMessages: (contactId: string) => ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  resetAllData: () => void;
};

export const AppContext = createContext<AppContextType | null>(null);

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Ошибка при загрузке из localStorage для ${key}:`, error);
    }
  }, [key]);
  
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Ошибка при сохранении в localStorage для ${key}:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [userData, setUserData] = useLocalStorage<UserData | null>('peribloom-user-data', null);
  const [symptoms, setSymptoms] = useLocalStorage<Symptom[]>('peribloom-symptoms', []);
  const [aiMessages, setAiMessages] = useLocalStorage<AIMessage[]>('peribloom-ai-messages', []);
  const [educationProgress, setEducationProgress] = useLocalStorage<Record<string, boolean>>('peribloom-education-progress', {});
  const [chatMessages, setChatMessages] = useLocalStorage<ChatMessage[]>('peribloom-chat-messages', []);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const addSymptom = (symptom: Omit<Symptom, 'id'>) => {
    const newSymptom = { ...symptom, id: new Date().toISOString() };
    setSymptoms([...symptoms, newSymptom]);
  };

  const addAIMessage = (message: AIMessage) => {
    // Создаем новый массив с добавленным сообщением
    const newMessages = [...aiMessages, message];
    setAiMessages(newMessages);
  }
  
  const clearAIChat = () => {
    setAiMessages([]);
  }

  const toggleLessonComplete = (lessonId: string) => {
    setEducationProgress({ ...educationProgress, [lessonId]: !educationProgress[lessonId] });
  };
  
  const getEducationalModules = (): EducationalModule[] => [
      { id: 'nutrition', title: 'Питание', description: 'Здоровое питание во время беременности и после.', image: PlaceHolderImages.find(img => img.id === 'edu-nutrition')?.imageUrl ?? '', lessons: [{id: 'n1', title: 'Основы диеты'}, {id: 'n2', title: 'Витамины и минералы'}] },
      { id: 'breathing', title: 'Дыхание', description: 'Техники дыхания для родов и релаксации.', image: PlaceHolderImages.find(img => img.id === 'edu-breathing')?.imageUrl ?? '', lessons: [{id: 'b1', title: 'Дыхание животом'}, {id: 'b2', title: 'Техника 4-7-8'}] },
      { id: 'baby-care', title: 'Уход за младенцем', description: 'Все, что нужно знать о уходе за новорожденным.', image: PlaceHolderImages.find(img => img.id === 'edu-baby-care')?.imageUrl ?? '', lessons: [{id: 'c1', title: 'Купание'}, {id: 'c2', title: 'Сон'}] },
      { id: 'postpartum', title: 'Послеродовое восстановление', description: 'Советы по физическому и эмоциональному восстановлению.', image: PlaceHolderImages.find(img => img.id === 'edu-postpartum')?.imageUrl ?? '', lessons: [{id: 'p1', title: 'Физические упражнения'}, {id: 'p2', title: 'Психологическая поддержка'}] },
    ];
  
  const contacts: Contact[] = [
      { id: 'doc1', name: 'Dr. Anna Petrova', role: 'Obstetrician', avatar: 'https://i.pravatar.cc/150?u=doc1' },
      { id: 'psy1', name: 'Elena Smirnova', role: 'Psychologist', avatar: 'https://i.pravatar.cc/150?u=psy1' },
      { id: 'car1', name: 'Maria Ivanova', role: 'Caregiver', avatar: 'https://ipravatar.cc/150?u=car1' },
  ];
  
  const getChatMessages = (contactId: string) => {
    return chatMessages.filter(msg => msg.contactId === contactId);
  }

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };
    setChatMessages([...chatMessages, newMessage]);
  }

  const resetAllData = () => {
    setUserData(null);
    setSymptoms([]);
    setAiMessages([]);
    setEducationProgress({});
    setChatMessages([]);
  }

  const value = {
    isInitialized,
    userData,
    setUserData,
    symptoms,
    addSymptom,
    aiMessages,
    addAIMessage,
    clearAIChat,
    educationProgress,
    toggleLessonComplete,
    getEducationalModules,
    contacts,
    getChatMessages,
    addChatMessage,
    resetAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
