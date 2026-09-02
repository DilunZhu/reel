import { useState, useEffect, useCallback, useRef } from 'react'
import { searchShows, getShow } from '../utils/api'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchShows(query)
        setResults(data)
      } catch (err) {
        setError(err.message || '搜索失败')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  return { query, setQuery, results, loading, error }
}

export function useShowDetail(showId) {
  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchShow = useCallback(async () => {
    if (!showId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getShow(showId)
      setShow(data)
    } catch (err) {
      setError(err.message || '获取详情失败')
    } finally {
      setLoading(false)
    }
  }, [showId])

  useEffect(() => {
    fetchShow()
  }, [fetchShow])

  return { show, loading, error, refetch: fetchShow }
}
