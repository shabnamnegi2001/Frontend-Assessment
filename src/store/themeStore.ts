import { create } from 'zustand';
import { storageUtils } from '../utils/storage';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: storageUtils.getPreference('darkMode', false),
  toggleTheme: () =>
    set((state) => {
      const newValue = !state.isDark;
      storageUtils.setPreference('darkMode', newValue);
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDark: newValue };
    }),
  setTheme: (isDark: boolean) => {
    storageUtils.setPreference('darkMode', isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDark });
  },
}));

// Initialize theme on load
const isDark = storageUtils.getPreference('darkMode', false);
if (isDark) {
  document.documentElement.classList.add('dark');
}
