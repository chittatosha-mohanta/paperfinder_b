// Global state — bookmarks and recent searches
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // Bookmarks
      bookmarks: [],
      addBookmark: (paper) => {
        const exists = get().bookmarks.find(b => b.id === paper.id)
        if (!exists) set(s => ({ bookmarks: [...s.bookmarks, paper] }))
      },
      removeBookmark: (id) =>
        set(s => ({ bookmarks: s.bookmarks.filter(b => b.id !== id) })),
      isBookmarked: (id) => get().bookmarks.some(b => b.id === id),

      // Recent searches
      recentSearches: [],
      addRecentSearch: (query) => {
        const current = get().recentSearches.filter(s => s !== query)
        set({ recentSearches: [query, ...current].slice(0, 8) })
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    { name: 'paperfinder-storage' }
  )
)

export default useStore