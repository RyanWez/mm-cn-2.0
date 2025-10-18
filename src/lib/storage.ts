// Local storage utilities for translation history and caching

export interface TranslationRecord {
  originalText: string;
  translatedText: string;
  createdAt: Date;
}

const HISTORY_KEY = 'translation_history';
const CACHE_KEY = 'translation_cache';
const MAX_HISTORY_ITEMS = 50;

// Get user ID from localStorage or create a new one
export const getUserId = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_id', userId);
  }
  return userId;
};

// Translation History Functions
export const saveTranslationHistory = (
  originalText: string,
  translatedText: string
): void => {
  if (typeof window === 'undefined') return;
  
  const history = getTranslationHistory();
  const newRecord: TranslationRecord = {
    originalText,
    translatedText,
    createdAt: new Date(),
  };
  
  // Add to beginning and limit size
  history.unshift(newRecord);
  if (history.length > MAX_HISTORY_ITEMS) {
    history.splice(MAX_HISTORY_ITEMS);
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getTranslationHistory = (): TranslationRecord[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    
    const history = JSON.parse(data);
    // Convert date strings back to Date objects
    return history.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    }));
  } catch (error) {
    console.error('Error reading translation history:', error);
    return [];
  }
};

export const findTranslationInHistory = (
  originalText: string
): string | null => {
  const history = getTranslationHistory();
  const found = history.find(item => item.originalText === originalText);
  return found ? found.translatedText : null;
};

// Translation Cache Functions (for server-side caching)
export const saveToCache = (
  originalText: string,
  translatedText: string
): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const cache = getCache();
    cache[originalText] = {
      translatedText,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

export const getFromCache = (originalText: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cache = getCache();
    const cached = cache[originalText];
    
    if (!cached) return null;
    
    // Cache expires after 24 hours
    const isExpired = Date.now() - cached.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      delete cache[originalText];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }
    
    return cached.translatedText;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

const getCache = (): Record<string, { translatedText: string; timestamp: number }> => {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    return {};
  }
};

// Cooldown management
const COOLDOWN_KEY = 'translation_cooldown';
const COOLDOWN_SECONDS = 15;

export const checkCooldown = (): number => {
  if (typeof window === 'undefined') return 0;
  
  try {
    const lastTranslation = localStorage.getItem(COOLDOWN_KEY);
    if (!lastTranslation) return 0;
    
    const elapsed = (Date.now() - parseInt(lastTranslation)) / 1000;
    const remaining = COOLDOWN_SECONDS - elapsed;
    
    return remaining > 0 ? Math.ceil(remaining) : 0;
  } catch (error) {
    return 0;
  }
};

export const updateCooldown = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
};
