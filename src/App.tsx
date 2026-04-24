import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider }        from '@/components/global/ToastProvider'
import Hero                     from '@/pages/Hero'
import Onboarding               from '@/pages/Onboarding'
import Dashboard                from '@/pages/Dashboard'
import LearningPath             from '@/pages/LearningPath'
import AiTutor                  from '@/pages/AiTutor'
import Flashcards               from '@/pages/Flashcards'
import FlashcardsDashboard      from '@/pages/FlashcardsDashboard'
import Dictionary               from '@/pages/Dictionary'
import DictionaryEntry          from '@/pages/DictionaryEntry'
import KanjiDetail              from '@/pages/KanjiDetail'
import Reading                  from '@/pages/Reading'
import ReadingDetail            from '@/pages/ReadingDetail'
import Notebook                 from '@/pages/Notebook'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/"                     element={<Hero />} />
          <Route path="/onboarding"           element={<Onboarding />} />
          <Route path="/dashboard"            element={<Dashboard />} />
          <Route path="/learning-path"        element={<LearningPath />} />
          <Route path="/ai-tutor"             element={<AiTutor />} />
          <Route path="/flashcards"           element={<Flashcards />} />
          <Route path="/flashcards/dashboard" element={<FlashcardsDashboard />} />
          <Route path="/dictionary"           element={<Dictionary />} />
          <Route path="/dictionary/:word"     element={<DictionaryEntry />} />
          <Route path="/kanji/:char"          element={<KanjiDetail />} />
          <Route path="/reading"              element={<Reading />} />
          <Route path="/reading/:id"          element={<ReadingDetail />} />
          <Route path="/notebook"             element={<Notebook />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}