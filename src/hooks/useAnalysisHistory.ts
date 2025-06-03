
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AnalysisHistoryItem } from '@/lib/types';

const HISTORY_STORAGE_KEY = 'linguaFriendAnalysisHistory';

export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error("Error loading history from localStorage:", error);
        // Optionally clear corrupted storage
        // localStorage.removeItem(HISTORY_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    } else {
        setIsLoading(false); // Not in browser environment
    }
  }, []);

  const saveHistory = useCallback((updatedHistory: AnalysisHistoryItem[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Error saving history to localStorage:", error);
      }
    }
  }, []);

  const addHistoryItem = useCallback((item: AnalysisHistoryItem) => {
    setHistory(prevHistory => {
      const updatedHistory = [item, ...prevHistory].slice(0, 50); // Keep last 50 items
      saveHistory(updatedHistory);
      return updatedHistory;
    });
  }, [saveHistory]);

  const deleteHistoryItem = useCallback((itemId: string) => {
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.filter(item => item.id !== itemId);
      saveHistory(updatedHistory);
      return updatedHistory;
    });
  }, [saveHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, []);
  
  const getHistoryItemById = useCallback((itemId: string): AnalysisHistoryItem | undefined => {
    return history.find(item => item.id === itemId);
  }, [history]);


  return { history, isLoading, addHistoryItem, deleteHistoryItem, clearHistory, getHistoryItemById };
}
