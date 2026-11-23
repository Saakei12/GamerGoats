import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Game } from '../types/game';

interface PreferencesContextType {
  userTags: string[];
  setUserTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  bookmarks: Game[];
  toggleBookmark: (game: Game) => void;
  isBookmarked: (gameId: string) => boolean;
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  hardwareTier: string;
}

const DEFAULT_TAGS = ['RPG', 'Action', 'Open World', 'Single Player', 'High-End PC'];

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userTags, setUserTagsState] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gamergoats_user_tags');
      return saved ? JSON.parse(saved) : DEFAULT_TAGS;
    } catch {
      return DEFAULT_TAGS;
    }
  });

  const [bookmarks, setBookmarks] = useState<Game[]>(() => {
    try {
      const saved = localStorage.getItem('gamergoats_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gamergoats_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Check if first-time visitor
  useEffect(() => {
    const hasVisited = localStorage.getItem('gamergoats_has_visited');
    if (!hasVisited) {
      localStorage.setItem('gamergoats_has_visited', 'true');
      setIsOnboardingOpen(true);
    }
  }, []);

  const setUserTags = (tags: string[]) => {
    setUserTagsState(tags);
    try {
      localStorage.setItem('gamergoats_user_tags', JSON.stringify(tags));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTag = (tag: string) => {
    const updated = userTags.includes(tag)
      ? userTags.filter(t => t !== tag)
      : [...userTags, tag];
    setUserTags(updated);
  };

  const clearTags = () => {
    setUserTags([]);
  };

  const toggleBookmark = (game: Game) => {
    setBookmarks(prev => {
      const exists = prev.some(g => g.id === game.id);
      let updated: Game[];
      if (exists) {
        updated = prev.filter(g => g.id !== game.id);
      } else {
        updated = [game, ...prev];
      }
      try {
        localStorage.setItem('gamergoats_bookmarks', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const isBookmarked = (gameId: string) => {
    return bookmarks.some(g => g.id === gameId);
  };

  const addSearchHistory = (query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('gamergoats_search_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('gamergoats_search_history');
    } catch (e) {
      console.error(e);
    }
  };

  // Determine active hardware tier
  const hardwareTier = userTags.find(t => t === 'Low-End PC' || t === 'Mid-Range PC' || t === 'High-End PC') || 'All';

  return (
    <PreferencesContext.Provider
      value={{
        userTags,
        setUserTags,
        toggleTag,
        clearTags,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        searchHistory,
        addSearchHistory,
        clearSearchHistory,
        isOnboardingOpen,
        setIsOnboardingOpen,
        hardwareTier
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
