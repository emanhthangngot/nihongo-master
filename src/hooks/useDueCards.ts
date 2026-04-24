import { useQuery } from '@tanstack/react-query'
import { srsService } from '@/services/srs.service'

export function useDueCards(limit = 50) {
  return useQuery({
    queryKey: ['srs', 'due-cards', limit],
    queryFn: () => srsService.getDueQueue(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes — matches Redis TTL
    retry: 1,
  })
}
