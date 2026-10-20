// Bookmark actions hook
import useStore from '../store/useStore'

export default function useBookmarks() {
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useStore()

  function toggleBookmark(paper) {
    if (isBookmarked(paper.id)) {
      removeBookmark(paper.id)
    } else {
      addBookmark(paper)
    }
  }

  return { bookmarks, toggleBookmark, isBookmarked }
}