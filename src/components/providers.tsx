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

// Функция для валидации и очистки данных симптомов
const validateSymptom = (symptom: any): boolean => {
  return symptom && 
         typeof symptom === 'object' &&
         typeof symptom.id === 'string' &&
         typeof symptom.date === 'string' &&
         typeof symptom.symptom === 'string' &&
         typeof symptom.severity === 'string' &&
         ['low', 'medium', 'high'].includes(symptom.severity);
};

// Функция для очистки массива симптомов
const cleanSymptomsArray = (symptoms: any[]): any[] => {
  if (!Array.isArray(symptoms)) return [];
  
  return symptoms
    .filter(validateSymptom)
    .map(symptom => ({
      ...symptom,
      symptom: typeof symptom.symptom === 'string' ? symptom.symptom.trim() : '',
      comment: typeof symptom.comment === 'string' ? symptom.comment.trim() : '',
      time: typeof symptom.time === 'string' ? symptom.time.trim() : ''
    }));
};

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        
        // Специальная обработка для симптомов
        if (key === 'peribloom-symptoms' && Array.isArray(parsed)) {
          const cleanedSymptoms = cleanSymptomsArray(parsed);
          if (cleanedSymptoms.length !== parsed.length) {
            console.warn(`Очищено ${parsed.length - cleanedSymptoms.length} некорректных записей симптомов`);
            setStoredValue(cleanedSymptoms as T);
            return;
          }
        }
        
        setStoredValue(parsed);
      }
    } catch (error) {
      console.error(`Ошибка при загрузке из localStorage для ${key}:`, error);
      // В случае ошибки, очищаем поврежденные данные
      if (key === 'peribloom-symptoms') {
        console.warn('Очистка поврежденных данных симптомов');
        setStoredValue([] as T);
      }
    }
  }, [key]);
  
  useEffect(() => {
    try {
      // Валидация перед сохранением
      let valueToSave = storedValue;
      
      if (key === 'peribloom-symptoms' && Array.isArray(storedValue)) {
        valueToSave = cleanSymptomsArray(storedValue) as T;
      }
      
      window.localStorage.setItem(key, JSON.stringify(valueToSave));
    } catch (error) {
      console.error(`Ошибка при сохранении в localStorage для ${key}:`, error);
      // Если не удается сохранить, попробуем очистить localStorage
      if (error instanceof DOMException && error.code === 22) {
        console.warn('localStorage переполнен, очистка старых данных');
        try {
          // Очищаем старые данные симптомов, оставляя только последние 100 записей
          if (key === 'peribloom-symptoms' && Array.isArray(storedValue)) {
            const recentSymptoms = storedValue.slice(-100);
            window.localStorage.setItem(key, JSON.stringify(recentSymptoms));
          }
        } catch (retryError) {
          console.error('Не удалось сохранить даже урезанные данные:', retryError);
        }
      }
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
    try {
      // Валидация и очистка данных перед добавлением
      const cleanSymptom = {
        ...symptom,
        id: new Date().toISOString(),
        symptom: typeof symptom.symptom === 'string' ? symptom.symptom.trim() : '',
        comment: typeof symptom.comment === 'string' ? symptom.comment.trim() : '',
        time: typeof symptom.time === 'string' ? symptom.time.trim() : '',
        date: typeof symptom.date === 'string' ? symptom.date.trim() : '',
        severity: ['low', 'medium', 'high'].includes(symptom.severity) ? symptom.severity : 'low'
      };
      
      // Проверяем, что все обязательные поля заполнены
      if (!cleanSymptom.symptom || !cleanSymptom.date || !cleanSymptom.time) {
        console.error('Попытка добавить симптом с неполными данными:', cleanSymptom);
        return;
      }
      
      setSymptoms([...symptoms, cleanSymptom]);
      console.log('Симптом успешно добавлен:', cleanSymptom);
    } catch (error) {
      console.error('Ошибка при добавлении симптома:', error);
    }
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
