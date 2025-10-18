"use client";

import { AppContext } from '@/components/providers';
import { useContext } from 'react';

export const useAppData = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppProvider');
  }
  return context;
};
