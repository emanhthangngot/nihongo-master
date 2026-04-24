import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  getCollections, createCollection, deleteCollection,
  getItems, addItem, deleteItem,
} from '../controllers/notebookController'

export const notebookRouter = Router()
notebookRouter.use(requireAuth)

notebookRouter.get('/collections',                   getCollections)
notebookRouter.post('/collections',                  createCollection)
notebookRouter.delete('/collections/:id',            deleteCollection)
notebookRouter.get('/collections/:collectionId/items', getItems)
notebookRouter.post('/collections/:collectionId/items', addItem)
notebookRouter.delete('/items/:id',                  deleteItem)
