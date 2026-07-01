'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesState {
  favoriteIds: string[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      addFavorite: (productId) => {
        const { favoriteIds } = get();
        if (!favoriteIds.includes(productId)) {
          set({ favoriteIds: [...favoriteIds, productId] });
        }
      },

      removeFavorite: (productId) => {
        set({
          favoriteIds: get().favoriteIds.filter((id) => id !== productId),
        });
      },

      toggleFavorite: (productId) => {
        const { favoriteIds, addFavorite, removeFavorite } = get();
        if (favoriteIds.includes(productId)) {
          removeFavorite(productId);
        } else {
          addFavorite(productId);
        }
      },

      isFavorite: (productId) => {
        return get().favoriteIds.includes(productId);
      },

      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    {
      name: 'favoritos-tienda',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
