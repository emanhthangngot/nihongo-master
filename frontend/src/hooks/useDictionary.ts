import { useQuery } from '@tanstack/react-query'
import { dictionaryService } from '@/services/dictionary.service'
import { useDebounce } from './useDebounce'

export function useDictionarySearch(query: string, level?: string) {
  const debouncedQuery = useDebounce(query, 300)

  return useQuery({
    queryKey: ['dictionary', 'search', debouncedQuery, level],
    queryFn: () => dictionaryService.search(debouncedQuery, level),
    enabled: debouncedQuery.length > 0,
    staleTime: 10 * 60 * 1000, // Dictionary data rarely changes
    retry: 1,
  })
}

export function useDictionaryEntry(word: string) {
  return useQuery({
    queryKey: ['dictionary', 'entry', word],
    queryFn: () => dictionaryService.getWord(word),
    enabled: !!word,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })
}

export function useKanjiEntry(char: string) {
  return useQuery({
    queryKey: ['dictionary', 'kanji', char],
    queryFn: () => dictionaryService.getKanji(char),
    enabled: !!char,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })
}
