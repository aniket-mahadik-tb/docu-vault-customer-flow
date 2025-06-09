export function useLocalStorage() {
    const getValueFromLocalStorage = (key: string) => {
      if (typeof window === 'undefined') return null;
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return null;
      }
    };
  
    const setValueToLocalStorage = (key: string, newValue: any) => {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }
      }
    };
  
    return { getValueFromLocalStorage, setValueToLocalStorage };
  }
  