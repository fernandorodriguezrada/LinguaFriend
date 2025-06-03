
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SentenceGroup, WordAnalysisDetail } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is installed or install it: npm install uuid @types/uuid

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
      words: [],
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

  const addWordsToGroup = useCallback((groupId: string, wordsToAdd: WordAnalysisDetail[]) => {
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group => {
        if (group.id === groupId) {
          // Avoid duplicates based on word text and role (simple check)
          const newWords = wordsToAdd.filter(newWord => 
            !group.words.some(existingWord => existingWord.word === newWord.word && existingWord.role === newWord.role)
          );
          return { ...group, words: [...group.words, ...newWords] };
        }
        return group;
      });
      saveGroups(updatedGroups);
      return updatedGroups;
    });
  }, [saveGroups]);

  const removeWordFromGroup = useCallback((groupId: string, wordIdentifier: string) => { // wordIdentifier could be word.word + word.role
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group => {
        if (group.id === groupId) {
          return { ...group, words: group.words.filter(w => (w.word + w.role) !== wordIdentifier) };
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

  return { groups, isLoading, createGroup, deleteGroup, addWordsToGroup, removeWordFromGroup, getGroupById };
}
