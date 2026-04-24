import { Router } from 'express'
import { search, getWord, getKanji } from '../controllers/dictionaryController'

export const dictionaryRouter = Router()
dictionaryRouter.get('/search', search)
dictionaryRouter.get('/word/:word', getWord)
dictionaryRouter.get('/kanji/:char', getKanji)