
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SentenceGroup, AnalysisHistoryItem } from '@/lib/types';
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
          const parsedGroups = JSON.parse(storedGroups);
          const validatedGroups = parsedGroups.map((group: Partial<SentenceGroup>) => ({
            id: group.id || uuidv4(),
            name: group.name || 'Unnamed Group',
            historyItems: Array.isArray(group.historyItems) ? group.historyItems : [],
            createdAt: group.createdAt || Date.now(),
            colorIdentifier: group.colorIdentifier || 'default',
          }));
          setGroups(validatedGroups);
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

  const createGroup = useCallback((name: string, colorIdentifier: string = 'default'): SentenceGroup => {
    const newGroup: SentenceGroup = {
      id: uuidv4(),
      name,
      historyItems: [],
      createdAt: Date.now(),
      colorIdentifier: colorIdentifier,
    };
    setGroups(prevGroups => {
      const updatedGroups = [...prevGroups, newGroup];
      saveGroups(updatedGroups);
      return updatedGroups;
    });
    return newGroup;
  }, [saveGroups]);

  const updateGroup = useCallback((groupId: string, updates: { name?: string; colorIdentifier?: string }) => {
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group =>
        group.id === groupId ? { ...group, ...updates, name: updates.name || group.name } : group
      );
      saveGroups(updatedGroups);
      return updatedGroups;
    });
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
          const currentHistoryItems = Array.isArray(group.historyItems) ? group.historyItems : [];
          const newItems = itemsToAdd.filter(newItem =>
            !currentHistoryItems.some(existingItem => existingItem.id === newItem.id)
          );
          return { ...group, historyItems: [...currentHistoryItems, ...newItems] };
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
          const currentHistoryItems = Array.isArray(group.historyItems) ? group.historyItems : [];
          return { ...group, historyItems: currentHistoryItems.filter(item => item.id !== historyItemId) };
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

  return { groups, isLoading, createGroup, updateGroup, deleteGroup, addHistoryItemsToGroup, removeHistoryItemFromGroup, getGroupById };
}
