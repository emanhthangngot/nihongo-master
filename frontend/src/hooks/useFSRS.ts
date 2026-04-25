import { useMutation, useQueryClient } from '@tanstack/react-query'
import { srsService, Rating } from '@/services/srs.service'
import { useLearningStore } from '@/stores/learningStore'

export function useFSRS() {
  const qc = useQueryClient()
  const { incrementReviewed } = useLearningStore()

  const submitReview = useMutation({
    mutationFn: ({ cardId, rating }: { cardId: string; rating: Rating }) =>
      srsService.gradeCard(cardId, rating),
    onSuccess: () => {
      incrementReviewed()
      // Invalidate due-cards so the list refreshes after session
      qc.invalidateQueries({ queryKey: ['srs', 'due-cards'] })
    },
  })

  return { submitReview }
}
