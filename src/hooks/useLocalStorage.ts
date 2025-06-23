export function useLocalStorage() {
  const setValueToLocalStorage = (key: string, value: string) => {
    localStorage.setItem(key, value);
  };

  const getValueFromLocalStorage = (key: string): string | null => {
    return localStorage.getItem(key);
  };

  return { setValueToLocalStorage, getValueFromLocalStorage };
}
