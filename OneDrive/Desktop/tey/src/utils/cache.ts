export const loadJsonData = async <T = unknown>(filename: string): Promise<T> => {
  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
};

export const getCachedData = <T = unknown>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(`cache_${key}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache valid for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }
  return null;
};

export const setCachedData = <T = unknown>(key: string, data: T) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `cache_${key}`,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

export const clearCache = (key: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`cache_${key}`);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
