
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SentenceGroup, AnalysisHistoryItem } from '@/lib/types'; // Updated import
import { v4 as uuidv4 } from 'uuid';

const GROUPS_STORAGE_KEY = 'linguaFriendSentenceGroups';

export function useSentenceGroups() {
  const [groups, setGroups] = useState<SentenceGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
        if (storedGroups) {
          setGroups(JSON.parse(storedGroups));
        }
      } catch (error) {
        console.error("Error loading sentence groups from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
        setIsLoading(false);
    }
  }, []);

  const saveGroups = useCallback((updatedGroups: SentenceGroup[]) => {
     if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));
        } catch (error) {
            console.error("Error saving groups to localStorage:", error);
        }
    }
  }, []);

  const createGroup = useCallback((name: string): SentenceGroup => {
    const newGroup: SentenceGroup = {
      id: uuidv4(),
      name,
      historyItems: [], // Changed from words to historyItems
      createdAt: Date.now(),
    };
    setGroups(prevGroups => {
      const updatedGroups = [...prevGroups, newGroup];
      saveGroups(updatedGroups);
      return updatedGroups;
    });
    return newGroup;
  }, [saveGroups]);

  const deleteGroup = useCallback((groupId: string) => {
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.filter(group => group.id !== groupId);
      saveGroups(updatedGroups);
      return updatedGroups;
    });
  }, [saveGroups]);

  const addHistoryItemsToGroup = useCallback((groupId: string, itemsToAdd: AnalysisHistoryItem[]) => {
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group => {
        if (group.id === groupId) {
          // Avoid duplicates based on history item ID
          const newItems = itemsToAdd.filter(newItem => 
            !group.historyItems.some(existingItem => existingItem.id === newItem.id)
          );
          return { ...group, historyItems: [...group.historyItems, ...newItems] };
        }
        return group;
      });
      saveGroups(updatedGroups);
      return updatedGroups;
    });
  }, [saveGroups]);

  const removeHistoryItemFromGroup = useCallback((groupId: string, historyItemId: string) => {
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group => {
        if (group.id === groupId) {
          return { ...group, historyItems: group.historyItems.filter(item => item.id !== historyItemId) };
        }
        return group;
      });
      saveGroups(updatedGroups);
      return updatedGroups;
    });
  }, [saveGroups]);
  
  const getGroupById = useCallback((groupId: string): SentenceGroup | undefined => {
    return groups.find(g => g.id === groupId);
  }, [groups]);

  return { groups, isLoading, createGroup, deleteGroup, addHistoryItemsToGroup, removeHistoryItemFromGroup, getGroupById };
}
