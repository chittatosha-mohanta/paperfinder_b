import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchPapers, searchByDOI, normalizePaper } from '../api/openAlex'
import { detectInput } from '../utils/detectInput'
import useStore from '../store/useStore'
import { useAuth } from './useAuth'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp, query as firestoreQuery, where, getDocs, updateDoc } from 'firebase/firestore'

export default function useSearch() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [page, setPage] = useState(1)
  const [yearFilter, setYearFilter] = useState(null)
  const addRecentSearch = useStore(s => s.addRecentSearch)
  const { user } = useAuth()

  const isDOI = detectInput(submittedQuery) === 'doi'

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', submittedQuery, page, yearFilter],
    queryFn: async () => {
      if (!submittedQuery) return null
      const raw = isDOI
        ? await searchByDOI(submittedQuery)
        : await searchPapers(submittedQuery, page, yearFilter)
      return {
        results: (raw.results || []).map(normalizePaper),
        total: raw.meta?.count || 0,
      }
    },
    enabled: !!submittedQuery,
  })

  async function handleSearch(q = query) {
    if (!q.trim()) return
    setSubmittedQuery(q.trim())
    setPage(1)
    addRecentSearch(q.trim())

    if (user) {
      try {
        const historyRef = collection(db, 'users', user.uid, 'searchHistory')
        const existing = await getDocs(
          firestoreQuery(historyRef, where('query', '==', q.trim()))
        )
        if (!existing.empty) {
          // Already exists — just move it to top by updating timestamp
          await updateDoc(existing.docs[0].ref, { createdAt: serverTimestamp() })
        } else {
          // New search — add it
          await addDoc(historyRef, { query: q.trim(), createdAt: serverTimestamp() })
        }
      } catch (e) {
        console.error('Failed to save search history:', e)
      }
    }
  }

  function handlePageChange(newPage) {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    query, setQuery,
    submittedQuery,
    page, yearFilter, setYearFilter,
    results: data?.results || [],
    total: data?.total || 0,
    isLoading,
    error,
    handleSearch,
    handlePageChange,
    hasSearched: !!submittedQuery,
  }
}